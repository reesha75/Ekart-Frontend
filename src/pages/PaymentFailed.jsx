import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { XCircle, RefreshCw, Home, ShoppingBag, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PaymentFailed = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div className="min-h-screen bg-background text-white pt-28 pb-16 flex items-center justify-center px-4 select-none">
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />

      <div className="max-w-md w-full relative z-10 space-y-4">
        
        {/* Failed Card */}
        <div className="bg-card rounded-3xl border border-white/5 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-red-500/20 to-rose-500/15 border-b border-white/5 p-8 text-center relative">
            <div className="w-20 h-20 bg-background border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-500/10">
              <XCircle size={40} className="text-red-400 filter drop-shadow-[0_0_6px_rgba(239,68,68,0.4)]" />
            </div>
            <h1 className="text-2xl font-extrabold font-heading text-white tracking-wide">Payment Failed</h1>
            <p className="text-red-400 mt-1.5 text-xs font-mono tracking-wider uppercase font-semibold">Your payment session expired or was declined</p>
          </div>

          {/* Details */}
          <div className="p-6 space-y-5">
            {orderId && (
              <div className="bg-background/80 border border-white/5 rounded-2xl p-4 font-mono text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-bold">ORDER REFERENCE</span>
                  <span className="font-bold text-white">#{orderId.toUpperCase()}</span>
                </div>
              </div>
            )}

            <div className="bg-[#111827] border border-red-500/20 rounded-2xl p-4 space-y-2">
              <p className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5"><AlertTriangle className="size-4 text-red-400" /> Possible causes:</p>
              <ul className="text-xs text-gray-400 space-y-1.5 list-disc list-inside leading-relaxed font-light">
                <li>Payment transaction declined by wallet carrier</li>
                <li>The online transaction request timed out</li>
                <li>Incorrect billing or receipt reference ID</li>
              </ul>
            </div>

            <div className="bg-[#111827] border border-accent/15 rounded-2xl p-4">
              <p className="text-xs text-gray-400 leading-relaxed font-light">
                💡 <strong className="text-accent">Don't worry!</strong> Your shopping cart items remain completely safe in your suite. Try completing checkout again or select Cash on Delivery.
              </p>
            </div>

            <div className="space-y-4 pt-1">
              <Link to="/checkout">
                <Button className="w-full h-11 rounded-xl bg-accent hover:bg-accent-hover text-background font-extrabold gap-2 transition-all duration-300 glow-accent cursor-pointer">
                  <RefreshCw size={15} /> Try Checkout Again
                </Button>
              </Link>
              <div className="grid grid-cols-2 gap-4">
                <Link to="/">
                  <Button variant="outline" className="w-full h-10 rounded-xl border-white/10 hover:border-accent hover:text-accent hover:bg-accent/5 text-white gap-2 cursor-pointer transition-colors duration-200">
                    <Home size={14} /> Home
                  </Button>
                </Link>
                <Link to="/products">
                  <Button variant="outline" className="w-full h-10 rounded-xl border-white/10 hover:border-accent hover:text-accent hover:bg-accent/5 text-white gap-2 cursor-pointer transition-colors duration-200">
                    <ShoppingBag size={14} /> Products
                  </Button>
                </Link>
              </div>
            </div>

            <p className="text-[10px] text-center text-gray-500 pt-2 border-t border-white/5">
              Need assistance? Please contact customer support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;
