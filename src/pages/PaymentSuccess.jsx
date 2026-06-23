import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, ShoppingBag, Home, Package, Smartphone, AlertCircle, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const method = searchParams.get('method') || 'COD';
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (orderId) {
      const token = localStorage.getItem('accessToken');
      api.get(`/api/v1/payment/order/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        if (res.data.success) setOrder(res.data.order);
      }).catch(() => {});
    }
  }, [orderId]);

  return (
    <div className="min-h-screen bg-background text-white pt-28 pb-16 flex items-center justify-center px-4 select-none">
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />

      <div className="max-w-md w-full relative z-10 space-y-4">

        {/* Success Card */}
        <div className="bg-card rounded-3xl border border-white/5 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-emerald-500/20 to-accent/15 border-b border-white/5 p-8 text-center relative">
            <div className="w-20 h-20 bg-background border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/10">
              <CheckCircle size={40} className="text-emerald-400 filter drop-shadow-[0_0_6px_rgba(16,185,129,0.4)]" />
            </div>
            <h1 className="text-2xl font-extrabold font-heading text-white tracking-wide">Order Placed Successfully! 🎉</h1>
            <p className="text-emerald-400 mt-1.5 text-xs font-mono tracking-wider uppercase font-semibold">
              {method === 'COD'
                ? 'COD confirmation complete'
                : 'Easypaisa transaction log verified'}
            </p>
          </div>

          {/* Details */}
          <div className="p-6 space-y-5">
            {orderId && (
              <div className="bg-background/80 border border-white/5 rounded-2xl p-4 space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-bold">ORDER REFERENCE</span>
                  <span className="font-bold text-white">#{orderId.toUpperCase()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-bold">METHOD</span>
                  <span className={`font-semibold px-3 py-0.5 rounded-full border text-[10px] ${
                    method === 'COD'
                      ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}>
                    {method === 'COD' ? '💵 Cash on Delivery' : '📱 Easypaisa Wallet'}
                  </span>
                </div>
                {order && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-bold">GRAND TOTAL</span>
                    <span className="font-bold text-accent">Rs. {order.totalAmount?.toLocaleString()}</span>
                  </div>
                )}
                {order?.transactionId && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-bold">TRANSACTION ID</span>
                    <span className="font-semibold text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 px-2 py-0.5 rounded">
                      {order.transactionId}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Easypaisa Pending Notice */}
            {method === 'Easypaisa' && (
              <div className="bg-[#111827] border border-orange-500/20 rounded-2xl p-4 flex gap-3">
                <AlertCircle size={18} className="text-orange-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-white uppercase tracking-wider">Payment Verification Pending</p>
                  <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                    Our billing team will review your uploaded invoice details and confirm the order shortly.
                  </p>
                </div>
              </div>
            )}

            {/* COD Notice */}
            {method === 'COD' && (
              <div className="bg-[#111827] border border-accent/20 rounded-2xl p-4 flex gap-3">
                <Package size={18} className="text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-white uppercase tracking-wider">COD Confirmed</p>
                  <p className="text-[11px] text-gray-400 mt-1 leading-relaxed font-light">
                    Pay in cash upon physical product delivery. Delivery estimates: 3–5 business days.
                  </p>
                </div>
              </div>
            )}

            {/* Order items preview */}
            {order?.items && order.items.length > 0 && (
              <div className="space-y-3 pt-1">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Ordered Gear Suite</p>
                <div className="space-y-2 border-t border-white/5 pt-3">
                  {order.items.slice(0, 3).map(item => (
                    <div key={item._id} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-background border border-white/5 p-1 flex-shrink-0">
                        <img src={item.productId?.productImg?.[0]?.url || '/placeholder-product.png'} alt="" className="w-full h-full object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white/95 line-clamp-1">{item.productId?.productName}</p>
                        <p className="text-[10px] text-gray-500 font-mono">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-xs font-bold text-accent font-mono">Rs. {(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-[10px] text-center text-gray-500 leading-relaxed pt-2 border-t border-white/5">
              📧 An automated email confirmation has been logged to your inbox.
            </p>

            <div className="flex gap-4 pt-1">
              <Link to="/" className="flex-1">
                <Button variant="outline" className="w-full h-10 rounded-xl border-white/10 hover:border-accent hover:text-accent hover:bg-accent/5 text-white gap-2 cursor-pointer transition-all duration-200">
                  <Home size={15} /> Dashboard
                </Button>
              </Link>
              <Link to="/products" className="flex-1">
                <Button className="w-full h-10 rounded-xl bg-accent hover:bg-accent-hover text-background font-bold gap-2 cursor-pointer transition-all duration-200 glow-accent">
                  <ShoppingBag size={15} /> Shop More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
