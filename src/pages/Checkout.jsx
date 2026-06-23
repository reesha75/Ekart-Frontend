import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { setCart } from '@/redux/productSlice';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  ShoppingBag, CreditCard, Truck, MapPin, Phone,
  Loader2, ArrowLeft, Package, Smartphone, Copy, CheckCircle2, UploadCloud, X, Calendar, AlertCircle
} from 'lucide-react';

// ── Your Easypaisa account details (update these) ──────────────
const EASYPAISA_ACCOUNT = {
  number: '0331-4405665',       // ← apna Easypaisa number yahan dalo
  name: 'Areesha Aftab',      // ← apna naam
};
// ────────────────────────────────────────────────────────────────

const Checkout = () => {
  const { cart } = useSelector(store => store.product);
  const { user } = useSelector(store => store.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = localStorage.getItem('accessToken');

  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [transactionId, setTransactionId] = useState('');
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    address: user?.address || '',
    city: user?.city || '',
    zipcode: user?.zipcode || '',
    phoneNo: user?.phoneNo || '',
  });

  const cartItems = cart?.items || [];
  const totalPrice = cart?.totalPrice || 0;

  if (!user || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 bg-background text-white">
        <div className="max-w-md w-full bg-card p-8 rounded-3xl shadow-2xl text-center border border-white/5 space-y-6">
          <div className="flex justify-center text-accent">
            <ShoppingBag size={48} className="filter drop-shadow-[0_0_8px_rgba(0,229,255,0.4)]" strokeWidth={1.5} />
          </div>
          <h1 className="text-xl font-bold font-heading text-white">Authentication Required</h1>
          <p className="text-sm text-gray-400 leading-relaxed">
            Please log in first to proceed to checkout and configure your shipping suite.
          </p>
          <Link to="/login">
            <Button className="w-full bg-accent hover:bg-accent-hover text-background font-bold rounded-xl h-11 transition-all duration-300 glow-accent cursor-pointer">
              Login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 bg-background text-white">
        <div className="max-w-md w-full bg-card p-8 rounded-3xl shadow-2xl text-center border border-white/5 space-y-6">
          <div className="flex justify-center text-accent">
            <Package size={48} className="filter drop-shadow-[0_0_8px_rgba(0,229,255,0.4)] animate-pulse" strokeWidth={1.5} />
          </div>
          <h1 className="text-xl font-bold font-heading text-white">Cart Suite Empty</h1>
          <p className="text-sm text-gray-400 leading-relaxed">
            You don't have any items in your checkout session.
          </p>
          <Link to="/products">
            <Button className="w-full bg-accent hover:bg-accent-hover text-background font-bold rounded-xl h-11 transition-all duration-300 glow-accent cursor-pointer">
              Shop Now
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const copyNumber = () => {
    navigator.clipboard.writeText(EASYPAISA_ACCOUNT.number.replace(/-/g, ''));
    setCopied(true);
    toast.success('Account number copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleScreenshotChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setScreenshotFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setScreenshotPreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handlePlaceOrder = async () => {
    if (!form.address || !form.city || !form.zipcode || !form.phoneNo) {
      toast.error('Please fill in all delivery details');
      return;
    }
    if (paymentMethod === 'Easypaisa') {
      if (!transactionId.trim()) {
        toast.error('Please enter your Easypaisa Transaction ID');
        return;
      }
      if (!screenshotFile) {
        toast.error('Please upload your payment receipt screenshot');
        return;
      }
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('address', form.address);
      formData.append('city', form.city);
      formData.append('zipcode', form.zipcode);
      formData.append('phoneNo', form.phoneNo);
      formData.append('paymentMethod', paymentMethod);
      if (paymentMethod === 'Easypaisa') {
        formData.append('transactionId', transactionId.trim());
        formData.append('file', screenshotFile);
      }

      const res = await api.post('/api/v1/order/create', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data.success) {
        dispatch(setCart({ items: [], totalPrice: 0 }));
        toast.success('Order placed successfully! 🎉');
        navigate(`/payment-success?orderId=${res.data.order._id}&method=${paymentMethod}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Checkout failed. Please try again.');
    } finally {
      loading && console.log("Done checkout loading state");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-white pt-28 pb-16 select-none">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Glow Circles */}
        <div className="absolute top-10 left-10 w-[300px] h-[300px] bg-accent/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

        {/* Back Button */}
        <button onClick={() => navigate('/cart')} className="inline-flex items-center gap-2 text-gray-400 hover:text-accent mb-6 font-semibold text-sm transition-colors cursor-pointer">
          <ArrowLeft size={16} /> Back to Cart
        </button>
        <h1 className="text-3xl font-extrabold font-heading text-white mb-8 tracking-wide">
          Configure <span className="gradient-text">Checkout</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* ── LEFT: Delivery + Payment ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Delivery Details */}
            <div className="bg-card rounded-2xl border border-white/5 p-6 space-y-5 shadow-xl">
              <div className="flex items-center gap-3 mb-2 border-b border-white/5 pb-3">
                <div className="w-8 h-8 bg-accent/10 border border-accent/20 rounded-lg flex items-center justify-center">
                  <MapPin size={16} className="text-accent" />
                </div>
                <h2 className="text-lg font-bold font-heading text-white">Delivery Suite</h2>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Street Address *</label>
                <input
                  value={form.address}
                  onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  placeholder="House/Flat no., Street, Area"
                  className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent text-white placeholder-gray-600 transition-colors"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">City *</label>
                  <input
                    value={form.city}
                    onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                    placeholder="City"
                    className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent text-white placeholder-gray-600 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">ZIP / Postal Code *</label>
                  <input
                    value={form.zipcode}
                    onChange={e => setForm(f => ({ ...f, zipcode: e.target.value }))}
                    placeholder="e.g. 54000"
                    className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent text-white placeholder-gray-600 transition-colors"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Phone Number *</label>
                <div className="relative">
                  <Phone size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    value={form.phoneNo}
                    onChange={e => setForm(f => ({ ...f, phoneNo: e.target.value }))}
                    placeholder="03XX-XXXXXXX"
                    className="w-full pl-11 bg-background border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent text-white placeholder-gray-600 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-card rounded-2xl border border-white/5 p-6 shadow-xl space-y-5">
              <div className="flex items-center gap-3 mb-2 border-b border-white/5 pb-3">
                <div className="w-8 h-8 bg-secondary/10 border border-secondary/20 rounded-lg flex items-center justify-center">
                  <CreditCard size={16} className="text-secondary" />
                </div>
                <h2 className="text-lg font-bold font-heading text-white">Payment Method</h2>
              </div>

              <div className="space-y-4">
                {/* COD */}
                <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                  paymentMethod === 'COD' 
                    ? 'border-accent bg-accent/5 shadow-md shadow-accent/5' 
                    : 'border-white/10 hover:border-white/20 bg-background/40'
                }`}>
                  <input 
                    type="radio" 
                    name="payment" 
                    value="COD" 
                    checked={paymentMethod === 'COD'} 
                    onChange={e => setPaymentMethod(e.target.value)} 
                    className="accent-accent size-4 cursor-pointer" 
                  />
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
                      <Truck size={20} className="text-accent" />
                    </div>
                    <div>
                      <p className="font-semibold text-white/95 text-sm">Cash on Delivery (COD)</p>
                      <p className="text-[11px] text-gray-500">Pay in cash when you receive your order delivery.</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-accent font-extrabold bg-accent/10 border border-accent/25 px-2.5 py-0.5 rounded-full uppercase tracking-wider">Free</span>
                </label>

                {/* Easypaisa */}
                <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                  paymentMethod === 'Easypaisa' 
                    ? 'border-secondary bg-secondary/5 shadow-md shadow-secondary/5' 
                    : 'border-white/10 hover:border-white/20 bg-background/40'
                }`}>
                  <input 
                    type="radio" 
                    name="payment" 
                    value="Easypaisa" 
                    checked={paymentMethod === 'Easypaisa'} 
                    onChange={e => setPaymentMethod(e.target.value)} 
                    className="accent-secondary size-4 cursor-pointer" 
                  />
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center">
                      <Smartphone size={20} className="text-secondary" />
                    </div>
                    <div>
                      <p className="font-semibold text-white/95 text-sm">Easypaisa Mobile Wallet</p>
                      <p className="text-[11px] text-gray-500">Pay securely using your Easypaisa mobile wallet app.</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-secondary font-extrabold bg-secondary/10 border border-secondary/25 px-2.5 py-0.5 rounded-full uppercase tracking-wider">Online</span>
                </label>
              </div>

              {/* Easypaisa Instructions */}
              {paymentMethod === 'Easypaisa' && (
                <div className="mt-6 space-y-5 border-t border-white/5 pt-6 animate-fade-in">
                  
                  {/* Account Info Box */}
                  <div className="bg-gradient-to-br from-secondary/15 via-[#111827] to-card border border-secondary/20 rounded-2xl p-5 space-y-4 shadow-inner">
                    <div className="flex items-center gap-2">
                      <Smartphone size={16} className="text-secondary" />
                      <p className="text-sm font-bold text-white/90 font-heading">Easypaisa Wallet Details</p>
                    </div>

                    <div className="bg-background border border-white/5 rounded-xl p-4 flex items-center justify-between">
                      <div>
                        <p className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">Account Number</p>
                        <p className="text-lg font-bold text-accent tracking-wider font-mono">{EASYPAISA_ACCOUNT.number}</p>
                        <p className="text-xs text-gray-400 mt-1">Beneficiary Name: <span className="font-bold text-white">{EASYPAISA_ACCOUNT.name}</span></p>
                      </div>
                      <button
                        type="button"
                        onClick={copyNumber}
                        className="flex items-center gap-1.5 bg-secondary hover:bg-secondary/80 text-white text-xs font-bold px-3.5 py-2.5 rounded-lg transition-colors cursor-pointer shadow-md shadow-secondary/10"
                      >
                        {copied ? <CheckCircle2 size={14} className="text-accent" /> : <Copy size={14} />}
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>

                    <div className="bg-background/80 border border-white/5 rounded-xl p-4">
                      <p className="text-xs font-bold text-white mb-2 flex items-center gap-1"><AlertCircle className="size-3.5 text-accent" /> Payment Guidelines:</p>
                      <ol className="text-xs text-gray-400 space-y-2 list-decimal list-inside leading-relaxed font-light">
                        <li>Launch the Easypaisa app or dial <span className="font-mono font-semibold text-white">*786#</span></li>
                        <li>Select <strong>Send Money</strong> and configure recipient details</li>
                        <li>Send exact sum of <span className="text-accent font-bold font-mono">Rs. {totalPrice.toLocaleString()}</span></li>
                        <li>Retain details of the Transaction ID (TID) from receipt SMS</li>
                        <li>Upload receipt screenshot and paste TID below to complete checkout</li>
                      </ol>
                    </div>
                  </div>

                  {/* Payment Receipt Upload */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                      Payment Receipt Screenshot *
                    </label>
                    
                    <div className="flex flex-col gap-3">
                      {screenshotPreview ? (
                        <div className="relative w-full max-w-xs aspect-[4/3] rounded-xl overflow-hidden border border-secondary/30 bg-background/50 flex items-center justify-center p-2">
                          <img src={screenshotPreview} alt="Receipt Preview" className="w-full h-full object-contain rounded-lg" />
                          <button
                            type="button"
                            onClick={() => {
                              setScreenshotFile(null);
                              setScreenshotPreview('');
                            }}
                            className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-colors cursor-pointer"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 hover:border-accent/40 rounded-2xl p-8 cursor-pointer bg-background/50 hover:bg-accent/[0.02] transition-all duration-300 group">
                          <UploadCloud size={32} className="text-secondary group-hover:text-accent group-hover:scale-110 transition-all duration-300" />
                          <span className="text-sm font-semibold text-white mt-3">Upload Payment screenshot</span>
                          <span className="text-xs text-gray-500 mt-1">Formats: PNG, JPG (Max 5MB)</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleScreenshotChange}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Transaction ID Input */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                      Easypaisa Transaction ID (TID) *
                    </label>
                    <input
                      value={transactionId}
                      onChange={e => setTransactionId(e.target.value)}
                      placeholder="e.g. EP-1234567890"
                      className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-secondary text-white font-mono placeholder-gray-600 transition-colors"
                    />
                    <p className="text-[10px] text-gray-500 flex items-center gap-1 mt-1">
                      💡 Transaction ID is sent by Easypaisa confirmation SMS
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT: Order Summary ── */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-2xl border border-white/5 p-6 space-y-6 shadow-xl sticky top-28">
              <h2 className="text-xl font-bold font-heading text-white border-b border-white/5 pb-4">Order Summary</h2>

              {/* Items */}
              <div className="space-y-4 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
                {cartItems.map(item => {
                  const p = item.productId;
                  return (
                    <div key={item._id} className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-background/50 border border-white/5 flex items-center justify-center p-1 flex-shrink-0">
                        <img src={p?.productImg?.[0]?.url || '/placeholder-product.png'} alt={p?.productName} className="w-full h-full object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white/90 truncate">{p?.productName}</p>
                        <p className="text-[10px] text-gray-500 font-mono">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-xs font-bold text-accent font-mono flex-shrink-0">Rs. {(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  );
                })}
              </div>

              {/* Totals */}
              <div className="border-t border-white/5 pt-4 space-y-3 font-medium">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span className="font-bold text-white font-mono">Rs. {totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Shipping Fee</span>
                  <span className="text-emerald-400 font-bold uppercase tracking-wider text-[10px]">Free</span>
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Method</span>
                  <span className="text-white font-bold">{paymentMethod}</span>
                </div>
              </div>
              
              <div className="border-t border-white/5 pt-4 flex justify-between items-center">
                <span className="font-bold text-white font-heading text-sm">Grand Total</span>
                <span className="text-xl font-extrabold text-accent font-mono">Rs. {totalPrice.toLocaleString()}</span>
              </div>

              {/* Place Order Button */}
              <Button
                onClick={handlePlaceOrder}
                disabled={loading || (paymentMethod === 'Easypaisa' && (!transactionId.trim() || !screenshotFile))}
                className="w-full bg-accent hover:bg-accent-hover text-background disabled:opacity-60 rounded-xl h-12 font-bold text-sm tracking-wider uppercase shadow-lg glow-accent transition-all duration-300 cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    Placing Order Suite...
                  </span>
                ) : (
                  paymentMethod === 'Easypaisa'
                    ? 'Place Order (Easypaisa)'
                    : 'Confirm Order (COD)'
                )}
              </Button>

              {paymentMethod === 'Easypaisa' && (!transactionId.trim() || !screenshotFile) && (
                <p className="text-[10px] text-center text-amber-500 font-semibold bg-amber-500/10 border border-amber-500/20 px-2 py-1.5 rounded-lg">
                  Please enter Transaction ID and upload the payment receipt.
                </p>
              )}

              <p className="text-[10px] text-center text-gray-500 leading-relaxed font-light">
                By processing order checkouts, you agree to our digital services licensing terms.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
