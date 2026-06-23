import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import { setCart } from '@/redux/productSlice';
import { ShoppingCart, Heart, ArrowLeft, ZoomIn, Tag, Package, Star, ChevronLeft, ChevronRight, RefreshCw, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(store => store.user);

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [wishlist, setWishlist] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const imgRef = useRef(null);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/v1/product/${productId}`);
      if (res.data.success) {
        setProduct(res.data.product);
        setActiveImg(0);
        fetchRelated(res.data.product.category, res.data.product._id);
      }
    } catch (error) {
      toast.error('Product not found');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelated = async (category, currentId) => {
    try {
      const res = await api.get('/api/v1/product/getAllProducts');
      if (res.data.success) {
        const filtered = res.data.products
          .filter(p => p.category === category && p._id !== currentId)
          .slice(0, 4);
        setRelatedProducts(filtered);
      }
    } catch { }
  };

  const addToCart = async () => {
    const token = localStorage.getItem('accessToken');
    if (!user || !token) {
      toast.error('Please login first');
      navigate('/login');
      return;
    }
    try {
      setAddingToCart(true);
      const res = await api.post(`/api/v1/cart/add`, { productId: product._id }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success('Added to cart!');
        dispatch(setCart(res.data.cart));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const buyNow = async () => {
    await addToCart();
    navigate('/cart');
  };

  const handleMouseMove = (e) => {
    const rect = imgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  const prevImg = () => setActiveImg(i => (i === 0 ? (product.productImg.length - 1) : i - 1));
  const nextImg = () => setActiveImg(i => (i === product.productImg.length - 1 ? 0 : i + 1));

  if (loading) {
    return (
      <div className="pt-28 min-h-screen bg-background text-white">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <div className="aspect-square bg-card rounded-2xl animate-pulse border border-white/5" />
              <div className="flex gap-3">
                {[1, 2, 3].map(i => <div key={i} className="w-20 h-20 bg-card rounded-xl animate-pulse border border-white/5" />)}
              </div>
            </div>
            <div className="space-y-6">
              <div className="skeleton h-8 w-1/3 rounded" />
              <div className="skeleton h-12 w-3/4 rounded" />
              <div className="skeleton h-6 w-1/2 rounded" />
              <div className="skeleton h-24 w-full rounded" />
              <div className="skeleton h-12 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const images = product.productImg && product.productImg.length > 0
    ? product.productImg
    : [{ url: '/placeholder-product.png', public_id: 'placeholder' }];

  return (
    <div className="pt-28 min-h-screen bg-background text-white select-none">
      <div className="max-w-6xl mx-auto px-6 py-8 relative z-10">
        
        {/* Glow Highlights */}
        <div className="absolute top-10 left-1/3 w-[300px] h-[300px] bg-accent/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-accent mb-8 transition-colors font-semibold text-sm cursor-pointer"
        >
          <ArrowLeft size={16} /> Back to Products
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">

          {/* ===== IMAGE GALLERY ===== */}
          <div className="space-y-5">
            {/* Main Image with zoom */}
            <div
              className="relative aspect-square rounded-2xl overflow-hidden bg-card border border-white/5 cursor-zoom-in group flex items-center justify-center p-6 shadow-xl"
              onMouseEnter={() => setZoom(true)}
              onMouseLeave={() => setZoom(false)}
              onMouseMove={handleMouseMove}
              ref={imgRef}
            >
              <img
                src={images[activeImg]?.url}
                alt={product.productName}
                className="w-[90%] h-[90%] object-contain transition-transform duration-300"
                style={zoom ? {
                  transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                  transform: 'scale(2.2)'
                } : {}}
                loading="lazy"
              />
              
              {/* Nav arrows */}
              {images.length > 1 && (
                <>
                  <button onClick={prevImg} className="absolute left-4 top-1/2 -translate-y-1/2 bg-[#050816]/70 hover:bg-accent hover:text-background border border-white/10 hover:border-accent text-white rounded-full p-2.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer">
                    <ChevronLeft size={20} />
                  </button>
                  <button onClick={nextImg} className="absolute right-4 top-1/2 -translate-y-1/2 bg-[#050816]/70 hover:bg-accent hover:text-background border border-white/10 hover:border-accent text-white rounded-full p-2.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer">
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
              {/* Zoom hint */}
              <div className="absolute bottom-4 right-4 bg-[#050816]/60 border border-white/10 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn size={16} />
              </div>
              {/* Image counter */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-4 bg-[#050816]/60 border border-white/10 text-white text-xs px-3 py-1.5 rounded-full font-mono">
                  {activeImg + 1} / {images.length}
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-1.5 scrollbar-thin">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border bg-card p-1.5 transition-all duration-200 cursor-pointer ${
                      activeImg === i ? 'border-accent shadow-lg shadow-accent/10 scale-105' : 'border-white/5 opacity-55 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt={`thumb-${i}`} className="w-full h-full object-contain" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ===== PRODUCT INFO ===== */}
          <div className="space-y-6">
            {/* Category & Brand badges */}
            <div className="flex gap-2 flex-wrap">
              <span className="bg-[#111827] text-accent border border-accent/20 text-xs font-semibold px-3.5 py-1.5 rounded-full flex items-center gap-1.5">
                <Tag size={13} /> {product.category}
              </span>
              <span className="bg-[#111827] text-white/80 border border-white/10 text-xs font-semibold px-3.5 py-1.5 rounded-full flex items-center gap-1.5">
                <Package size={13} /> {product.brand}
              </span>
            </div>

            {/* Name */}
            <h1 className="text-2xl md:text-3xl font-extrabold font-heading text-white leading-tight">{product.productName}</h1>

            {/* Rating stars */}
            <div className="flex items-center gap-2.5">
              <div className="flex text-yellow-500">
                {[1,2,3,4,5].map(i => <Star key={i} size={16} className={i <= 4 ? "fill-yellow-500" : ""} />)}
              </div>
              <span className="text-sm text-gray-400 font-medium">4.0 (24 reviews)</span>
            </div>

            {/* Price section */}
            <div className="flex items-center gap-4 bg-card border border-white/5 p-4 rounded-2xl w-fit">
              <span className="text-3xl font-extrabold text-accent font-heading">
                Rs {product.productPrice.toLocaleString()}
              </span>
              <span className="text-lg line-through text-gray-500">
                Rs {Math.round(product.productPrice * 1.2).toLocaleString()}
              </span>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold px-2.5 py-1 rounded-lg">
                17% OFF
              </span>
            </div>

            {/* SKU */}
            <p className="text-xs text-gray-500 font-mono uppercase">SKU ID: {product._id.toString().toUpperCase()}</p>

            {/* Description */}
            <div className="border-t border-white/5 pt-5">
              <h3 className="font-heading font-semibold text-white text-base mb-2">Product Description</h3>
              <p className="text-sm text-gray-400 leading-relaxed font-light">{product.productDesc}</p>
            </div>

            {/* Specifications */}
            <div className="bg-card rounded-2xl p-5 border border-white/5 space-y-3">
              <h3 className="font-heading font-semibold text-white text-base">Key Specifications</h3>
              <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm border-t border-white/5 pt-3">
                <div className="text-gray-500 font-medium">Brand</div>
                <div className="font-semibold text-white/95">{product.brand}</div>
                <div className="text-gray-500 font-medium">Category</div>
                <div className="font-semibold text-white/95">{product.category}</div>
                <div className="text-gray-500 font-medium">SKU</div>
                <div className="font-semibold text-white/95 font-mono">{product._id.toString().slice(-8).toUpperCase()}</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-3">
              <Button
                onClick={addToCart}
                disabled={addingToCart}
                className="flex-1 bg-accent hover:bg-accent-hover text-background font-extrabold rounded-xl h-12 text-base gap-2 shadow-lg glow-accent transition-all duration-300 cursor-pointer"
              >
                {addingToCart ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" /> 
                    Adding to suite...
                  </span>
                ) : (
                  <>
                    <ShoppingCart size={18} /> 
                    Add to Cart
                  </>
                )}
              </Button>
              
              <Button
                onClick={buyNow}
                className="flex-1 bg-secondary hover:bg-secondary/80 text-white font-extrabold rounded-xl h-12 text-base shadow-lg glow-secondary transition-all duration-300 cursor-pointer"
              >
                Buy Now
              </Button>
              
              <button
                onClick={() => setWishlist(w => !w)}
                className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                  wishlist 
                    ? 'border-red-500/50 bg-red-500/10 text-red-400 shadow-md shadow-red-500/5' 
                    : 'border-white/10 bg-card text-white hover:border-red-500/30 hover:text-red-400'
                }`}
              >
                <Heart size={22} className={wishlist ? "fill-red-400 text-red-400 animate-pulse" : ""} />
              </button>
            </div>

            {/* Delivery trust badges */}
            <div className="flex flex-col sm:flex-row gap-4 text-xs text-gray-500 pt-2 border-t border-white/5">
              <span className="flex items-center gap-1.5">
                <Truck className="size-4 text-accent" /> 
                Free delivery on orders above ₹499
              </span>
              <span className="flex items-center gap-1.5">
                <RefreshCw className="size-4 text-secondary" /> 
                Hassle-free 7-day returns policy
              </span>
            </div>
          </div>
        </div>

        {/* ===== RELATED PRODUCTS ===== */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 border-t border-white/5 pt-12">
            <h2 className="text-2xl font-extrabold font-heading text-white mb-8">Related Tech Gear</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map(p => (
                <div
                  key={p._id}
                  onClick={() => navigate(`/product/${p._id}`)}
                  className="bg-card rounded-2xl border border-white/5 overflow-hidden shadow-lg hover:shadow-accent/5 cursor-pointer card-hover p-3 flex flex-col justify-between"
                >
                  <div className="aspect-square overflow-hidden bg-background/50 rounded-xl flex items-center justify-center p-3">
                    <img
                      src={p.productImg?.[0]?.url || '/placeholder-product.png'}
                      alt={p.productName}
                      className="w-[85%] h-[85%] object-contain hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-3 space-y-2 mt-2">
                    <p className="text-sm font-semibold text-white/95 line-clamp-2 leading-snug hover:text-accent transition-colors duration-200">{p.productName}</p>
                    <p className="text-base font-extrabold text-accent font-heading">Rs {p.productPrice.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
