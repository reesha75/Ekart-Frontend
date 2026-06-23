import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import FilterSidebar from '@/components/FilterSidebar';
import CustomDropdown from '@/components/CustomDropdown';
import ProductCard from '@/components/ProductCard';
import { useDispatch, useSelector } from 'react-redux';
import { setProducts } from '@/redux/productSlice';
import { Sparkles, ShoppingBag } from 'lucide-react';

const Products = () => {
  const { products } = useSelector(store => store.product);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [brand, setBrand] = useState("All");
  const [priceRange, setPriceRange] = useState([0, 999999]);
  const [sortOrder, setSortOrder] = useState('');

  const dispatch = useDispatch();

  const getAllProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/v1/product/getAllProducts');
      if (res.data.success) {
        setAllProducts(res.data.products);
        dispatch(setProducts(res.data.products));
      }
    } catch (error) {
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (allProducts.length === 0) return;

    let filtered = [...allProducts];

    if (search.trim() !== "") {
      filtered = filtered.filter((p) => p.productName?.toLowerCase().includes(search.toLowerCase()));
    }

    if (category !== "All") {
      filtered = filtered.filter((p) => p.category?.toLowerCase() === category.toLowerCase());
    }

    if (brand !== "All") {
      filtered = filtered.filter((p) => p.brand?.toLowerCase() === brand.toLowerCase());
    }

    filtered = filtered.filter((p) => p.productPrice >= priceRange[0] && p.productPrice <= priceRange[1]);

    if (sortOrder === "lowtoHigh") {
      filtered.sort((a, b) => a.productPrice - b.productPrice);
    } else if (sortOrder === "hightoLow") {
      filtered.sort((a, b) => b.productPrice - a.productPrice);
    }

    dispatch(setProducts(filtered));
  }, [search, category, brand, sortOrder, priceRange, allProducts, dispatch]);

  useEffect(() => { getAllProducts(); }, []);

  const handleSort = (value) => setSortOrder(value);

  return (
    <div className='pt-28 pb-20 bg-background min-h-screen text-white'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 flex gap-8 items-start relative z-10'>
        
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-3xl pointer-events-none" />
        
        {/* Sidebar Filters */}
        <FilterSidebar 
          search={search} 
          setSearch={setSearch} 
          category={category} 
          setCategory={setCategory} 
          brand={brand} 
          setBrand={setBrand} 
          allProducts={allProducts} 
          priceRange={priceRange} 
          setPriceRange={setPriceRange} 
        />

        {/* Products Grid Section */}
        <div className='flex flex-col flex-1 w-full'>
          
          {/* Header Panel */}
          <div className='flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-white/5 pb-6'>
            <div>
              <span className="inline-flex items-center gap-1 bg-accent/10 text-accent border border-accent/20 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
                <Sparkles className="size-3" />
                Premium Catalogue
              </span>
              <h1 className="text-3xl font-extrabold font-heading text-white tracking-wide">
                Discover Our <span className="gradient-text">Gear Suite</span>
              </h1>
              <p className="text-sm text-gray-400 mt-1 max-w-md">
                Browse, filter, and sort the ultimate collection of next-gen electronics.
              </p>
            </div>
            
            <div className='flex items-center gap-4 self-end'>
              <span className="text-xs text-gray-500 font-mono">
                {products.length} {products.length === 1 ? 'item' : 'items'} found
              </span>
              <CustomDropdown 
                placeholder="Sort by Price" 
                options={[
                  { label: "Price: Low to High", value: "lowtoHigh" }, 
                  { label: "Price: High to Low", value: "hightoLow" }
                ]} 
                onSelect={handleSort} 
              />
            </div>
          </div>

          {/* Grid Area */}
          {loading ? (
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-7'>
              {[...Array(8)].map((_, idx) => (
                <div key={idx} className="rounded-2xl border border-white/5 bg-[#111827]/40 p-4 space-y-4 h-[350px]">
                  <div className="skeleton w-full aspect-square rounded-xl" />
                  <div className="space-y-2">
                    <div className="skeleton h-4 w-3/4 rounded" />
                    <div className="skeleton h-4 w-1/2 rounded" />
                  </div>
                  <div className="skeleton h-9 w-full rounded-xl" />
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-7'>
              {products.map((product) => (
                <ProductCard key={product._id} product={product} loading={loading} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-24 bg-[#111827]/30 border border-white/5 rounded-3xl p-6">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <ShoppingBag className="size-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">No products found</h3>
              <p className="text-sm text-gray-500 max-w-xs">
                Try modifying your filter categories, clearing search terms, or resetting the price slider.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Products;