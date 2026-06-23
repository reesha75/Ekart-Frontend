import { ShoppingCart, Star } from 'lucide-react';
import React from 'react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setCart } from '@/redux/productSlice';
import { api } from '@/lib/api';
import { toast } from 'sonner';

const ProductCard = ({ product, loading }) => {
  const { productImg, productPrice, productName } = product;
  const { user } = useSelector(store => store.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const addToCart = async (e, productId) => {
    e.stopPropagation(); // prevent navigating to detail page
    const token = localStorage.getItem('accessToken');
    if (!user || !token) {
      toast.error('Please login first to add items to your cart.');
      navigate('/login');
      return;
    }
    try {
      const res = await api.post(`/api/v1/cart/add`, { productId }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.data.success) {
        toast.success('Product added to Cart');
        dispatch(setCart(res.data.cart));
      }
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.message || 'Failed to add product to cart';
      toast.error(errorMsg);
    }
  };

  return (
    <div
      onClick={() => navigate(`/product/${product._id}`)}
      className='group relative rounded-2xl bg-card border border-white/5 flex flex-col justify-between cursor-pointer card-hover h-full select-none'
    >
      {/* Product Image Container */}
      <div className='relative w-full aspect-square overflow-hidden bg-background/50 flex items-center justify-center p-3'>
        <img
          src={productImg && productImg[0] ? productImg[0].url : '/placeholder-product.png'}
          alt={productName}
          className='w-[85%] h-[85%] object-contain transition-transform duration-500 group-hover:scale-108'
          loading="lazy"
        />

        {/* Glow behind product image */}
        <div className="absolute inset-0 bg-accent/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {/* Cyber Badge - Futuristic look */}
        <div className="absolute top-3 left-3 bg-[#050816]/70 backdrop-blur-md text-[10px] tracking-wider text-accent border border-accent/20 px-2 py-0.5 rounded-full font-bold uppercase">
          New
        </div>
      </div>

      {/* Product Info */}
      <div className='px-4 py-4 flex-1 flex flex-col justify-between gap-3'>
        <div className='space-y-1.5'>
          {/* Star rating placeholder for futuristic feel */}
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`size-3 ${i < 4 ? 'fill-yellow-500 text-yellow-500' : 'text-white/20'}`} />
            ))}
            <span className="text-[10px] text-gray-500 font-bold ml-1">4.0</span>
          </div>

          <h1 className='font-semibold text-white/95 text-sm line-clamp-2 leading-snug h-10 group-hover:text-accent transition-colors duration-200'>
            {productName}
          </h1>

          <div className="flex items-baseline gap-2 pt-1">
            <span className='font-extrabold text-lg text-accent font-heading'>
              Rs {productPrice.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Add to Cart Button */}
        <Button 
          onClick={(e) => addToCart(e, product._id)} 
          className='w-full bg-accent hover:bg-accent-hover text-background font-bold rounded-xl gap-2 h-9 text-xs transition-all duration-300 glow-accent hover:scale-[1.02] cursor-pointer'
        >
          <ShoppingCart className="size-4" /> Add to Cart
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;