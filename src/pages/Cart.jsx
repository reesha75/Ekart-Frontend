import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { api, getApiErrorMessage } from '@/lib/api';
import { setCart } from '@/redux/productSlice';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Minus, Trash2, ShoppingBag, Loader2, Calendar, CreditCard, Clock, FileText } from "lucide-react";
import { toast } from 'sonner';

const Cart = () => {
  const { cart } = useSelector((store) => store.product);
  const { user } = useSelector((store) => store.user);
  const accessToken = localStorage.getItem('accessToken');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null); // stores productId when quantity/remove is in progress
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const cartItems = cart?.items || [];
  const totalPrice = cart?.totalPrice || 0;

  const fetchCart = async () => {
    if (!user || !accessToken) return;
    setLoading(true);
    try {
      const res = await api.get('/api/v1/cart', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (res.data.success) {
        dispatch(setCart(res.data.cart));
      }
    } catch (error) {
      console.error("Cart fetch error:", error);
      toast.error(getApiErrorMessage(error, "Failed to load cart."));
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    if (!user || !accessToken) return;
    setOrdersLoading(true);
    try {
      const res = await api.get('/api/v1/order/my-orders', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (error) {
      console.error("Cart page - failed to fetch orders:", error);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user, accessToken]);

  // Fetch orders only if cart is empty and user is logged in
  useEffect(() => {
    if (user && accessToken && cartItems.length === 0) {
      fetchOrders();
    }
  }, [user, accessToken, cartItems.length]);

  const handleQuantityChange = async (productId, currentQuantity, type) => {
    if (type === 'decrease' && currentQuantity <= 1) {
      handleRemoveItem(productId);
      return;
    }

    setActionLoading(productId);
    try {
      const res = await api.put('/api/v1/cart/update', 
        { productId, type },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (res.data.success) {
        dispatch(setCart(res.data.cart));
        toast.success(type === 'increase' ? "Quantity increased" : "Quantity decreased");
      }
    } catch (error) {
      console.error("Update quantity error:", error);
      toast.error(getApiErrorMessage(error, "Failed to update quantity."));
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveItem = async (productId) => {
    setActionLoading(productId);
    try {
      const res = await api.delete('/api/v1/cart/remove', {
        data: { productId },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (res.data.success) {
        dispatch(setCart(res.data.cart));
        toast.success("Product removed from cart");
      }
    } catch (error) {
      console.error("Remove item error:", error);
      toast.error(getApiErrorMessage(error, "Failed to remove product."));
    } finally {
      setActionLoading(null);
    }
  };

  const handleCheckout = () => {
    if (!user || !accessToken) {
      toast.error("Please login first to check out.");
      navigate('/login');
      return;
    }
    // Navigate to full Checkout page (COD + PayFast options)
    navigate('/checkout');
  };

  if (!user || !accessToken) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background pt-24 px-4 text-white">
        <div className="max-w-md w-full bg-card p-8 rounded-3xl shadow-2xl text-center border border-white/5 space-y-6">
          <div className="flex justify-center text-accent">
            <ShoppingBag size={48} strokeWidth={1.5} className="filter drop-shadow-[0_0_8px_rgba(0,229,255,0.4)] animate-bounce" />
          </div>
          <h1 className="text-2xl font-bold font-heading text-white">Session Authentication Required</h1>
          <p className="text-sm text-gray-400 leading-relaxed">
            You need to be logged in to view, edit, and checkout items from your shopping cart suite.
          </p>
          <Link to="/login">
            <Button className="w-full bg-accent hover:bg-accent-hover text-background font-bold rounded-xl h-11 transition-all duration-300 glow-accent cursor-pointer">
              Log In Now
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-white pt-28 pb-16 px-4 md:px-8 select-none">
      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Glow Circles */}
        <div className="absolute top-10 left-10 w-[300px] h-[300px] bg-accent/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

        <h1 className="text-3xl font-extrabold font-heading text-white mb-8 tracking-wide">
          Your Shopping <span className="gradient-text">Suite</span>
        </h1>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4 bg-card/25 border border-white/5 rounded-3xl">
            <Loader2 className="animate-spin text-accent" size={40} />
            <p className="text-sm text-gray-400">Loading your cart items...</p>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="space-y-8 max-w-4xl mx-auto">
            {/* Empty Cart Banner */}
            <Card className="rounded-2xl border-white/5 shadow-2xl bg-card/60 overflow-hidden py-12 px-4 text-center">
              <CardContent className="space-y-5 flex flex-col items-center">
                <div className="p-3.5 bg-accent/10 text-accent rounded-full border border-accent/20">
                  <ShoppingBag size={40} strokeWidth={1.5} />
                </div>
                <div className="space-y-2 max-w-sm">
                  <h2 className="text-xl font-bold font-heading text-white">Your Cart is Empty</h2>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Looks like you haven't added any premium tech items to your cart yet.
                  </p>
                </div>
                <Link to="/products">
                  <Button className="bg-accent hover:bg-accent-hover text-background font-bold rounded-xl px-8 h-10 text-xs tracking-wider uppercase transition-all duration-300 glow-accent cursor-pointer">
                    Start Shopping
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Active & Recent Orders summary shown directly here */}
            {ordersLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin text-accent" size={28} />
              </div>
            ) : orders.length > 0 && (
              <div className="space-y-6">
                <div className="border-b border-white/5 pb-3">
                  <h2 className="text-xl font-extrabold font-heading text-white">Active & Recent Orders</h2>
                  <p className="text-xs text-gray-400 mt-1">Track the processing status and pricing details of your placed orders.</p>
                </div>

                <div className="space-y-4">
                  {orders.map((order) => (
                    <div 
                      key={order._id} 
                      className="border border-white/5 rounded-2xl overflow-hidden bg-card/40 shadow-xl"
                    >
                      {/* Order Info Header */}
                      <div className="bg-[#111827]/80 px-5 py-3 border-b border-white/5 flex flex-wrap justify-between items-center gap-4 text-xs font-mono">
                        <div className="flex flex-wrap items-center gap-6">
                          <div>
                            <span className="text-gray-500 text-[10px] uppercase font-bold flex items-center gap-1"><Calendar className="size-3 text-accent" /> Date</span>
                            <span className="font-semibold text-white/90">
                              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 text-[10px] uppercase font-bold flex items-center gap-1"><CreditCard className="size-3 text-secondary" /> Amount</span>
                            <span className="font-bold text-accent">₹{order.totalAmount.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-gray-500 text-[10px] uppercase font-bold flex items-center gap-1"><FileText className="size-3 text-accent" /> Order ID</span>
                            <span className="font-semibold text-gray-400 uppercase">#{order._id.substring(18)}</span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <span className={`px-3 py-1 border text-[10px] font-extrabold rounded-full tracking-wider uppercase ${
                          order.status === 'Delivered' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                          order.status === 'Shipped' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                          order.status === 'Processing' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                          order.status === 'Cancelled' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                          'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                        }`}>
                          {order.status}
                        </span>
                      </div>

                      {/* Items List */}
                      <div className="p-4 divide-y divide-white/5 bg-[#111827]/20">
                        {order.items.map((item) => {
                          const product = item.productId;
                          if (!product) return null;

                          const imgUrl = product.productImg && product.productImg[0] 
                            ? product.productImg[0].url 
                            : '/placeholder-product.png';

                          return (
                            <div key={item._id} className="py-3 first:pt-0 last:pb-0 flex items-center gap-4 text-xs">
                              <img 
                                src={imgUrl} 
                                alt={product.productName} 
                                className="w-12 h-12 object-contain bg-background rounded-lg border border-white/5 p-1 flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-xs text-white/90 truncate">{product.productName}</h4>
                                <p className="text-[10px] text-gray-500 mt-1 font-mono">Qty: {item.quantity}</p>
                              </div>
                              <div className="text-right font-mono">
                                <p className="font-bold text-xs text-white">₹{(item.price * item.quantity).toLocaleString()}</p>
                                <p className="text-[10px] text-gray-500">₹{item.price.toLocaleString()} ea</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => {
                const product = item.productId;
                if (!product) return null;

                const imgUrl = product.productImg && product.productImg[0] 
                  ? product.productImg[0].url 
                  : '/placeholder-product.png';

                return (
                  <Card key={item._id} className="rounded-2xl border-white/5 shadow-lg overflow-hidden bg-card">
                    <CardContent className="p-5 flex flex-col sm:flex-row items-center gap-5 sm:gap-6">
                      {/* Product Image */}
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-background/60 flex items-center justify-center p-1.5 border border-white/5 flex-shrink-0">
                        <img 
                          src={imgUrl} 
                          alt={product.productName} 
                          className="w-full h-full object-contain"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 text-center sm:text-left space-y-1.5">
                        <h2 className="font-semibold text-base text-white/95 line-clamp-1">{product.productName}</h2>
                        <span className="inline-block text-[10px] font-bold text-accent bg-accent/5 border border-accent/15 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          {product.category}
                        </span>
                        <p className="font-extrabold text-sm text-gray-400 font-mono">Rs {item.price.toLocaleString()}</p>
                      </div>

                      {/* Quantity Selector & Controls */}
                      <div className="flex items-center gap-5 flex-shrink-0 w-full sm:w-auto justify-between sm:justify-start border-t sm:border-t-0 border-white/5 pt-4 sm:pt-0">
                        <div className="flex items-center border border-white/10 rounded-xl overflow-hidden bg-background h-9">
                          <button
                            onClick={() => handleQuantityChange(product._id, item.quantity, 'decrease')}
                            disabled={actionLoading === product._id}
                            className="px-3 hover:bg-accent/10 hover:text-accent text-gray-400 transition-colors disabled:opacity-50 h-full cursor-pointer"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-7 text-center text-sm font-semibold font-mono text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(product._id, item.quantity, 'increase')}
                            disabled={actionLoading === product._id}
                            className="px-3 hover:bg-accent/10 hover:text-accent text-gray-400 transition-colors disabled:opacity-50 h-full cursor-pointer"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        {/* Subtotal */}
                        <div className="text-right min-w-[90px] hidden sm:block">
                          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Subtotal</p>
                          <p className="font-extrabold text-sm text-accent font-mono">Rs {(item.price * item.quantity).toLocaleString()}</p>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemoveItem(product._id)}
                          disabled={actionLoading === product._id}
                          className="p-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition duration-150 disabled:opacity-50 cursor-pointer border border-transparent hover:border-red-500/20"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Cart Summary Card */}
            <div className="lg:col-span-1">
              <Card className="rounded-2xl border-white/5 shadow-2xl bg-card overflow-hidden sticky top-28">
                <CardContent className="p-6 space-y-6">
                  <h2 className="text-xl font-bold font-heading text-white border-b border-white/5 pb-4">Order Summary</h2>

                  <div className="space-y-3.5">
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>Subtotal</span>
                      <span className="font-bold text-white font-mono">Rs {totalPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>Shipping Fee</span>
                      <span className="text-emerald-400 font-bold uppercase tracking-wider text-xs">Free</span>
                    </div>
                  </div>

                  <div className="border-t border-white/5 pt-4 flex justify-between items-center">
                    <span className="text-base font-bold text-white font-heading">Total Price</span>
                    <span className="text-2xl font-extrabold text-accent font-mono">Rs {totalPrice.toLocaleString()}</span>
                  </div>

                  <Button 
                    onClick={handleCheckout}
                    disabled={cartItems.length === 0}
                    className="w-full bg-accent hover:bg-accent-hover text-background font-extrabold rounded-xl h-11 text-sm shadow-lg glow-accent transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                  >
                    Proceed to Checkout
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
