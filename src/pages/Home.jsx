import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Truck, Shield, RefreshCw, Headphones, Star, ArrowRight, Sparkles } from 'lucide-react';
import Hero from '@/components/ui/hero';
import ProductCard from '@/components/ProductCard';
import { api } from '@/lib/api';
import { toast } from 'sonner';

// ─── Why Choose Us data ───────────────────────────────────
const FEATURES = [
  { icon: Truck,        title: 'Free Delivery',    desc: 'On all orders above ₹499' },
  { icon: Shield,       title: 'Secure Payment',   desc: 'PayFast & COD supported'  },
  { icon: RefreshCw,    title: '7-Day Returns',    desc: 'Hassle-free return policy' },
  { icon: Headphones,   title: '24/7 Support',     desc: 'We are always here'        },
];

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        const res = await api.get('/api/v1/product/getAllProducts');
        if (res.data.success) {
          // Display first 5 products as "Featured"
          setFeaturedProducts(res.data.products.slice(0, 5));
        }
      } catch (error) {
        console.error("Home - Failed to fetch products:", error);
        toast.error("Failed to load featured products");
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedProducts();
  }, []);

  return (
    <div className="bg-background text-white min-h-screen">

      {/* ── HERO ───────────────────────────────── */}
      <Hero />

      {/* ── WHY CHOOSE US ──────────────────────── */}
      <section className="py-16 bg-card/40 border-y border-white/5 relative">
        <div className="absolute inset-0 bg-accent/[0.01] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div 
                key={title} 
                className="flex items-start gap-4 p-5 rounded-2xl bg-[#111827]/60 border border-white/5 hover:border-accent/20 transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0 group-hover:bg-accent group-hover:text-background transition-all duration-300">
                  <Icon size={22} className="text-accent group-hover:text-background transition-colors duration-300" />
                </div>
                <div>
                  <p className="font-bold text-white text-base tracking-wide">{title}</p>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ───────────────────── */}
      <section className="py-20 relative">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="inline-flex items-center gap-1 bg-accent/10 text-accent border border-accent/20 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
                <Sparkles className="size-3" />
                Curated Collection
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-white">
                Featured <span className="gradient-text">New Arrivals</span>
              </h2>
              <p className="text-sm text-gray-400 mt-2 max-w-lg">
                Explore our selection of top-tier futuristic devices hand-picked for high-performance and premium design.
              </p>
            </div>
            <Link 
              to="/products" 
              className="inline-flex items-center gap-1.5 text-accent hover:text-accent-hover font-bold text-sm tracking-wide group"
            >
              View All Products
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-7">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="rounded-2xl border border-white/5 bg-[#111827]/40 p-4 space-y-4 h-[350px]">
                  <div className="skeleton w-full aspect-square rounded-xl" />
                  <div className="space-y-2">
                    <div className="skeleton h-4 w-3/4 rounded" />
                    <div className="skeleton h-4 w-1/2 rounded" />
                  </div>
                  <div className="skeleton h-9 w-full rounded-xl" />
                </div>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-7">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-[#111827]/30 border border-white/5 rounded-2xl">
              <p className="text-gray-400">No featured products available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── BANNER CTA ─────────────────────────── */}
      <section className="pb-24 px-6 relative">
        <div className="max-w-5xl mx-auto">
          <div className="relative bg-gradient-to-r from-secondary/40 to-accent/20 border border-white/10 rounded-3xl p-8 sm:p-12 overflow-hidden shadow-2xl">
            {/* Decorative background glow elements */}
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-accent/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-20 -top-20 w-80 h-80 bg-secondary/20 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto">
              <span className="text-accent text-xs font-extrabold uppercase tracking-widest bg-accent/10 border border-accent/25 px-3 py-1 rounded-full mb-4">
                Limited Time Offer
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-white tracking-wide">
                Get 20% Off Your First Order!
              </h2>
              <p className="mt-4 text-sm sm:text-base text-gray-300 leading-relaxed max-w-lg">
                Sign up today and use coupon code <strong className="text-accent font-bold">EKART20</strong> at checkout. Elevate your technical setup with premium electronics.
              </p>
              
              <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full justify-center">
                <Link to="/signup">
                  <button className="bg-accent hover:bg-accent-hover text-background font-extrabold px-8 py-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105 glow-accent cursor-pointer w-full sm:w-auto">
                    Create Account
                  </button>
                </Link>
                <Link to="/products">
                  <button className="border border-white/20 hover:border-accent hover:text-accent text-white px-8 py-3 rounded-full font-bold transition-all duration-300 cursor-pointer w-full sm:w-auto">
                    Browse Gear
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
