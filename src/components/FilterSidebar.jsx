import React from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Search, Filter, RotateCcw } from 'lucide-react';

const FilterSidebar = ({ search, setSearch, category, setCategory, brand, setBrand, setPriceRange, allProducts, priceRange, className }) => {
  const Categories = ["All", ...new Set(allProducts.map((p) => p.category).filter(Boolean))];
  const Brands = ["All", ...new Set(allProducts.map((p) => p.brand).filter(Boolean))];

  const handleCategoryClick = (val) => setCategory(val);
  const handleBrandChange = (e) => setBrand(e.target.value);
  
  const handleMinChange = (e) => {
    const value = Number(e.target.value);
    if (value <= priceRange[1]) setPriceRange([value, priceRange[1]]);
  };

  const handleMaxChange = (e) => {
    const value = Number(e.target.value);
    if (value >= priceRange[0]) setPriceRange([priceRange[0], value]);
  };

  const resetFilters = () => {
    setSearch("");
    setCategory("All");
    setBrand("All");
    setPriceRange([0, 999999]);
  };

  const defaultClasses = 'bg-[#111827] border border-white/5 p-6 rounded-2xl h-max hidden md:block w-64 shadow-xl select-none sticky top-28';

  return (
    <div className={className ? className : defaultClasses}>
      
      {/* Header */}
      <div className="flex items-center gap-2 mb-6 text-white border-b border-white/5 pb-3">
        <Filter className="size-4 text-accent" />
        <h2 className="font-heading font-bold text-lg tracking-wide">Filters</h2>
      </div>

      {/* Search Input */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500" />
        <Input 
          type="text" 
          placeholder="Search items..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          className='bg-background border-white/10 text-white pl-9 pr-3 py-2 rounded-xl focus-visible:border-accent focus-visible:ring-accent/20 w-full text-sm outline-none' 
        />
      </div>

      {/* Category Section */}
      <div className="mb-6">
        <h3 className='font-heading font-bold text-xs text-gray-400 uppercase tracking-widest border-b border-white/5 pb-2 mb-3.5'>
          Category
        </h3>
        <div className='flex flex-col gap-2.5 max-h-48 overflow-y-auto pr-1'>
          {Categories.map((item, index) => (
            <div key={index} className='flex items-center gap-3 cursor-pointer group'>
              <input 
                type="radio" 
                name="category" 
                id={`cat-${item}`} 
                checked={category === item} 
                onChange={() => handleCategoryClick(item)}
                className="accent-accent size-4 bg-background border-white/10 cursor-pointer"
              />
              <label 
                htmlFor={`cat-${item}`}
                className={`text-sm cursor-pointer select-none transition-colors duration-200 ${
                  category === item ? 'text-accent font-semibold' : 'text-gray-400 group-hover:text-white'
                }`}
              >
                {item}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Brand Section */}
      <div className="mb-6">
        <h3 className='font-heading font-bold text-xs text-gray-400 uppercase tracking-widest border-b border-white/5 pb-2 mb-3.5'>
          Brand
        </h3>
        <select 
          className='bg-background text-white w-full px-3 py-2 border border-white/10 rounded-xl focus:border-accent focus:ring-1 focus:ring-accent outline-none text-sm cursor-pointer transition-colors duration-200' 
          value={brand} 
          onChange={handleBrandChange}
        >
          {Brands.map((item, index) => (
            <option key={index} value={item} className="bg-card text-white">
              {item.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      {/* Price Range Section */}
      <div className="mb-6">
        <h3 className='font-heading font-bold text-xs text-gray-400 uppercase tracking-widest border-b border-white/5 pb-2 mb-3.5'>
          Price Range
        </h3>
        <div className='flex flex-col gap-3.5'>
          <div className='text-xs text-accent font-mono font-semibold bg-accent/5 border border-accent/15 px-2.5 py-1.5 rounded-lg'>
            Rs {priceRange[0].toLocaleString()} - Rs {priceRange[1].toLocaleString()}
          </div>
          <div className='flex gap-2 items-center'>
            <input 
              type="number" 
              value={priceRange[0]} 
              onChange={handleMinChange} 
              className='w-full px-2 py-1.5 bg-background border border-white/10 rounded-lg text-white text-xs outline-none focus:border-accent font-mono' 
              placeholder="Min"
            />
            <span className="text-gray-500 text-xs">—</span>
            <input 
              type="number" 
              value={priceRange[1]} 
              onChange={handleMaxChange} 
              className='w-full px-2 py-1.5 bg-background border border-white/10 rounded-lg text-white text-xs outline-none focus:border-accent font-mono' 
              placeholder="Max"
            />
          </div>
          
          <div className="space-y-2 mt-1">
            <input 
              type="range" 
              min="0" 
              max="250000" 
              step="1000" 
              className='w-full accent-accent cursor-pointer h-1 bg-white/10 rounded-lg' 
              value={priceRange[0]} 
              onChange={handleMinChange} 
            />
            <input 
              type="range" 
              min="0" 
              max="250000" 
              step="1000" 
              className='w-full accent-accent cursor-pointer h-1 bg-white/10 rounded-lg' 
              value={priceRange[1]} 
              onChange={handleMaxChange} 
            />
          </div>
        </div>
      </div>

      {/* Reset Button */}
      <Button 
        onClick={resetFilters} 
        variant="outline"
        className='border-white/10 hover:border-accent hover:text-accent hover:bg-accent/5 text-white/80 mt-2 cursor-pointer w-full flex items-center justify-center gap-2 h-10 rounded-xl transition-all duration-300'
      >
        <RotateCcw className="size-4" /> Reset Filters
      </Button>
    </div>
  );
};

export default FilterSidebar;