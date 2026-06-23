import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import {
  LayoutDashboard, Package, ShoppingBag, Users, TrendingUp,
  Plus, Pencil, Trash2, X, UploadCloud, Loader2, CheckCircle,
  Clock, Truck, XCircle, ChevronDown, Search, Eye, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
const STATUS_COLORS = {
  Pending:    'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  Processing: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Shipped:    'bg-purple-500/10 text-purple-400 border-purple-500/20',
  Delivered:  'bg-green-500/10 text-green-400 border-green-500/20',
  Cancelled:  'bg-red-500/10 text-red-400 border-red-500/20',
};
const statusOptions = ['Pending','Processing','Shipped','Delivered','Cancelled'];

// ─────────────────────────────────────────────
// STAT CARD
// ─────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, colorClass, sub }) => (
  <div className="bg-card rounded-2xl p-5 border border-white/5 flex items-center gap-4 hover:border-accent/35 hover:shadow-accent/5 card-hover select-none">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-background border border-white/5`}>
      <Icon size={20} className={colorClass} />
    </div>
    <div>
      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{label}</p>
      <p className="text-xl font-extrabold text-white mt-0.5">{value}</p>
      {sub && <p className="text-[10px] text-gray-500 mt-0.5 font-light">{sub}</p>}
    </div>
  </div>
);

// ─────────────────────────────────────────────
// IMAGE UPLOAD PREVIEW
// ─────────────────────────────────────────────
const ImageUploadBox = ({ previews, onAdd, onRemove, maxImages = 5 }) => {
  const inputRef = useRef();
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {previews.map((src, i) => (
          <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/10 bg-background/50 group flex items-center justify-center p-1">
            <img src={src} alt={`img-${i}`} className="w-full h-full object-contain rounded-lg" />
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="absolute top-1 right-1 bg-red-500/90 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer shadow-md hover:bg-red-650"
            >
              <X size={10} />
            </button>
          </div>
        ))}
        {previews.length < maxImages && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-20 h-20 rounded-xl border border-dashed border-white/20 flex flex-col items-center justify-center text-accent hover:text-accent-hover hover:border-accent/40 bg-[#050816]/60 hover:bg-accent/[0.02] transition-all duration-300 cursor-pointer"
          >
            <UploadCloud size={20} />
            <span className="text-[9px] font-bold uppercase tracking-wide mt-1">Add</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={onAdd}
      />
      <p className="text-[10px] text-gray-500 font-mono">{previews.length}/{maxImages} images registered — Slide 1 serves as primary thumbnail</p>
    </div>
  );
};

// ─────────────────────────────────────────────
// PRODUCT MODAL
// ─────────────────────────────────────────────
const ProductModal = ({ product, products, onClose, onSave }) => {
  const [form, setForm] = useState({
    productName: product?.productName || '',
    productDesc: product?.productDesc || '',
    productPrice: product?.productPrice || '',
    category: product?.category || '',
    brand: product?.brand || '',
  });
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [existingImgs, setExistingImgs] = useState(product?.productImg || []);
  const [newFiles, setNewFiles] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);
  const [saving, setSaving] = useState(false);

  // Extract unique categories from products list
  const existingCategories = products
    ? [...new Set(products.map(p => p.category).filter(Boolean))]
    : [];
  const defaultCategories = ['Laptop', 'Mobile', 'Headphones'];
  const allCategories = Array.from(new Set([...defaultCategories, ...existingCategories]));

  const allPreviews = [
    ...existingImgs.map(img => img.url),
    ...newPreviews,
  ];

  const handleAddImages = (e) => {
    const files = Array.from(e.target.files);
    const remaining = 5 - existingImgs.length - newFiles.length;
    const toAdd = files.slice(0, remaining);
    setNewFiles(prev => [...prev, ...toAdd]);
    toAdd.forEach(f => {
      const reader = new FileReader();
      reader.onload = (ev) => setNewPreviews(prev => [...prev, ev.target.result]);
      reader.readAsDataURL(f);
    });
  };

  const handleRemoveImg = (index) => {
    const existCount = existingImgs.length;
    if (index < existCount) {
      setExistingImgs(prev => prev.filter((_, i) => i !== index));
    } else {
      const newIdx = index - existCount;
      setNewFiles(prev => prev.filter((_, i) => i !== newIdx));
      setNewPreviews(prev => prev.filter((_, i) => i !== newIdx));
    }
  };

  const handleCustomCategoryChange = (val) => {
    setCustomCategory(val);
    setForm(f => ({ ...f, category: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('accessToken');
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      newFiles.forEach(f => formData.append('images', f));
      if (product) {
        // Update: send which existing images to keep
        formData.append('existingImages', JSON.stringify(existingImgs.map(img => img.public_id)));
        await api.put(`/api/v1/product/update/${product._id}`, formData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Product updated!');
      } else {
        // Create
        await api.post('/api/v1/product/add', formData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Product added!');
      }
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-white/5 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl text-white animate-fade-in relative z-10 scrollbar-thin">
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="text-xl font-bold font-heading text-white">
            {product ? 'Edit Product Setup' : 'Add New Product Suite'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white rounded-full p-1.5 hover:bg-[#111827]/80 transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Images */}
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Product Images Suite *</label>
            <ImageUploadBox
              previews={allPreviews}
              onAdd={handleAddImages}
              onRemove={handleRemoveImg}
              maxImages={5}
            />
          </div>
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Product Title *</label>
            <input
              value={form.productName}
              onChange={e => setForm(f => ({ ...f, productName: e.target.value }))}
              className="w-full bg-background border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent text-white transition-colors"
              placeholder="e.g. GeForce Gaming Station"
              required
            />
          </div>
          {/* Price */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Unit Price (Rs.) *</label>
            <input
              type="number"
              value={form.productPrice}
              onChange={e => setForm(f => ({ ...f, productPrice: e.target.value }))}
              className="w-full bg-background border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent text-white font-mono transition-colors"
              placeholder="0.00"
              required
            />
          </div>
          {/* Category + Brand */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Category *</label>
              {showCustomCategory ? (
                <div className="space-y-1.5">
                  <input
                    value={customCategory}
                    onChange={e => handleCustomCategoryChange(e.target.value)}
                    className="w-full bg-background border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-accent text-white"
                    placeholder="Enter custom category"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setShowCustomCategory(false);
                      setForm(f => ({ ...f, category: '' }));
                    }}
                    className="text-[10px] text-accent hover:underline block font-bold"
                  >
                    Select Existing
                  </button>
                </div>
              ) : (
                <select
                  value={form.category}
                  onChange={e => {
                    if (e.target.value === 'Add Custom...') {
                      setShowCustomCategory(true);
                      setForm(f => ({ ...f, category: '' }));
                    } else {
                      setForm(f => ({ ...f, category: e.target.value }));
                    }
                  }}
                  className="w-full bg-background border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent text-white cursor-pointer"
                  required
                >
                  <option value="" className="bg-card">Select...</option>
                  {allCategories.map(c => <option key={c} value={c} className="bg-card">{c}</option>)}
                  <option value="Add Custom..." className="bg-card text-accent font-bold">➕ Add Custom Category...</option>
                </select>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Brand *</label>
              <input
                value={form.brand}
                onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}
                className="w-full bg-background border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent text-white"
                placeholder="Brand name"
                required
              />
            </div>
          </div>
          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Detailed Specifications *</label>
            <textarea
              value={form.productDesc}
              onChange={e => setForm(f => ({ ...f, productDesc: e.target.value }))}
              rows={3}
              className="w-full bg-background border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent text-white resize-none scrollbar-thin"
              placeholder="Product description and core technical details..."
              required
            />
          </div>
          {/* Buttons */}
          <div className="flex gap-4 pt-2">
            <Button type="button" onClick={onClose} variant="outline" className="flex-1 rounded-xl border-white/10 text-white hover:bg-white/5 cursor-pointer">
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="flex-1 rounded-xl bg-accent hover:bg-accent-hover text-background font-bold glow-accent cursor-pointer">
              {saving ? <><Loader2 size={16} className="animate-spin mr-2" /> Saving Suite...</> : (product ? 'Update Product' : 'Add Product')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// ORDER DETAIL MODAL
// ─────────────────────────────────────────────
const OrderDetailModal = ({ order, onClose, onOrderUpdate, updatingStatus }) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-white/5 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl text-white animate-fade-in relative z-10 scrollbar-thin">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div>
            <h2 className="text-xl font-bold font-heading text-white">Order Details Log</h2>
            <p className="text-[10px] font-mono text-gray-500 mt-1">Order UUID: #{order._id.toUpperCase()}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white rounded-full p-2 hover:bg-[#111827]/80 transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Status and Action banner */}
          <div className="bg-background border border-white/5 rounded-2xl p-5 flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
            <div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Verification Status</p>
              <div className="flex flex-wrap items-center gap-3 mt-1.5">
                <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold border uppercase tracking-wider ${STATUS_COLORS[order.status]}`}>
                  {order.status}
                </span>
                <span className="text-xs text-gray-400 font-light font-mono">
                  Created at {new Date(order.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Set Progress:</label>
              <div className="relative">
                <select
                  value={order.status}
                  onChange={e => onOrderUpdate(order._id, { status: e.target.value })}
                  disabled={updatingStatus === order._id}
                  className={`text-xs font-bold border border-white/10 rounded-xl px-3 py-2 bg-background focus:outline-none focus:border-accent cursor-pointer text-white ${updatingStatus === order._id ? 'opacity-60' : ''}`}
                >
                  {statusOptions.map(s => <option key={s} value={s} className="bg-card text-white">{s}</option>)}
                </select>
                {updatingStatus === order._id && (
                  <Loader2 size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 animate-spin text-accent" />
                )}
              </div>
            </div>
          </div>

          {/* Customer & Shipping Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-b border-white/5 py-6">
            
            {/* Customer Details */}
            <div className="space-y-3">
              <h3 className="font-heading font-bold text-sm text-white uppercase tracking-wider">Buyer Account</h3>
              <div className="space-y-1.5 text-xs text-gray-400">
                <p><span className="text-gray-500 font-bold">Name:</span> {order.userId?.firstName} {order.userId?.lastName}</p>
                <p><span className="text-gray-500 font-bold">Email:</span> {order.userId?.email}</p>
                <p><span className="text-gray-500 font-bold">Contact:</span> {order.phoneNo}</p>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="space-y-3">
              <h3 className="font-heading font-bold text-sm text-white uppercase tracking-wider">Destination</h3>
              <div className="space-y-1.5 text-xs text-gray-400">
                <p className="font-medium text-white">{order.address}</p>
                <p>{order.city} — {order.zipcode}</p>
              </div>
            </div>

          </div>

          {/* Items Ordered */}
          <div className="space-y-3">
            <h3 className="font-heading font-bold text-sm text-white uppercase tracking-wider">Ordered Catalogue</h3>
            <div className="divide-y divide-white/5 border border-white/5 rounded-2xl overflow-hidden bg-[#111827]/40">
              {order.items?.map(item => {
                const p = item.productId;
                return (
                  <div key={item._id} className="flex items-center gap-4 p-3 hover:bg-[#111827]/80 transition-colors">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-background border border-white/5 flex items-center justify-center p-1 flex-shrink-0">
                      <img src={p?.productImg?.[0]?.url || '/placeholder-product.png'} alt="" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white/95 line-clamp-1">{p?.productName || 'Product Deleted'}</p>
                      <p className="text-[10px] text-gray-500 font-mono mt-0.5">Price: Rs. {item.price.toLocaleString()} • Qty: {item.quantity}</p>
                    </div>
                    <p className="text-xs font-bold text-accent font-mono">Rs. {(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                );
              })}
              <div className="bg-background p-3 flex justify-between items-center text-xs font-bold text-white border-t border-white/5 font-mono">
                <span className="uppercase tracking-wider">Total Value Paid / Payable</span>
                <span className="text-sm text-accent">Rs. {order.totalAmount?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Payment Status & Details */}
          <div className="space-y-3 border-t border-white/5 pt-5">
            <h3 className="font-heading font-bold text-sm text-white uppercase tracking-wider">Payment Verification</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="bg-background border border-white/5 rounded-xl p-4 space-y-2.5 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-bold">METHOD:</span>
                    <span className="font-bold text-white">{order.paymentMethod || 'COD'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-bold">STATUS:</span>
                    <span className={`font-semibold px-2.5 py-0.5 rounded-full text-[10px] uppercase border tracking-wider ${
                      order.paymentStatus === 'Paid'
                        ? 'bg-green-500/10 text-green-400 border-green-500/20'
                        : order.paymentStatus === 'Failed'
                        ? 'bg-red-500/10 text-red-400 border-red-500/20'
                        : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                    }`}>
                      {order.paymentStatus || 'Pending'}
                    </span>
                  </div>
                  {order.paymentMethod === 'Easypaisa' && order.transactionId && (
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-bold">TRANSACTION ID:</span>
                      <span className="font-bold text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 px-2 py-0.5 rounded">{order.transactionId}</span>
                    </div>
                  )}
                </div>

                {/* Verification Actions */}
                {order.paymentMethod === 'Easypaisa' && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => onOrderUpdate(order._id, { paymentStatus: 'Paid', status: 'Processing' })}
                      disabled={updatingStatus === order._id || order.paymentStatus === 'Paid'}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs py-2 h-9 font-bold cursor-pointer"
                    >
                      Verify (Paid)
                    </Button>
                    <Button
                      onClick={() => onOrderUpdate(order._id, { paymentStatus: 'Failed', status: 'Cancelled' })}
                      disabled={updatingStatus === order._id || order.paymentStatus === 'Failed'}
                      className="flex-1 bg-red-500 hover:bg-red-650 text-white rounded-xl text-xs py-2 h-9 font-bold cursor-pointer"
                    >
                      Reject (Failed)
                    </Button>
                  </div>
                )}
              </div>

              {/* Payment Screenshot */}
              {order.paymentMethod === 'Easypaisa' && (
                <div className="flex flex-col items-center justify-center border border-white/5 rounded-xl p-3 bg-background">
                  <p className="text-[10px] font-bold text-gray-500 mb-2 uppercase self-start">Receipt Invoice Image:</p>
                  {order.paymentScreenshot?.url ? (
                    <a
                      href={order.paymentScreenshot.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative block w-full aspect-[4/3] rounded-lg overflow-hidden group cursor-zoom-in border border-white/5 bg-[#111827]/40 p-1"
                    >
                      <img src={order.paymentScreenshot.url} alt="Receipt Screenshot" className="w-full h-full object-contain rounded" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold uppercase tracking-wider transition-opacity duration-200">
                        View Full Size 🔍
                      </div>
                    </a>
                  ) : (
                    <div className="text-center text-gray-500 py-6 text-xs">
                      ❌ No screenshot uploaded
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// DELETE CONFIRM DIALOG
// ─────────────────────────────────────────────
const ConfirmDialog = ({ message, onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="bg-card border border-white/5 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-white relative z-10">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
          <Trash2 size={20} className="text-red-400" />
        </div>
        <div>
          <h3 className="font-heading font-bold text-base text-white">Confirm Removal</h3>
          <p className="text-xs text-gray-400 mt-1 leading-relaxed">{message}</p>
        </div>
      </div>
      <div className="flex gap-3">
        <Button onClick={onCancel} variant="outline" className="flex-1 rounded-xl border-white/10 text-white hover:bg-white/5 cursor-pointer text-xs h-9">Cancel</Button>
        <Button onClick={onConfirm} disabled={loading} className="flex-1 rounded-xl bg-red-500 hover:bg-red-650 text-white font-bold cursor-pointer text-xs h-9">
          {loading ? <Loader2 size={14} className="animate-spin" /> : 'Confirm'}
        </Button>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────
// MAIN DASHBOARD
// ─────────────────────────────────────────────
const Dashboard = () => {
  const { user } = useSelector(store => store.user);
  const navigate = useNavigate();
  const token = localStorage.getItem('accessToken');

  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState({ products: 0, orders: 0, users: 0, revenue: 0, pending: 0, delivered: 0 });
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const [productModal, setProductModal] = useState(null); // null | 'add' | product obj
  const [orderDetailModal, setOrderDetailModal] = useState(null); // null | order obj
  const [deleteTarget, setDeleteTarget] = useState(null); // { type, id, name }
  const [deleting, setDeleting] = useState(false);
  const [searchProducts, setSearchProducts] = useState('');
  const [searchOrders, setSearchOrders] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(null);

  // Admin guard
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      toast.error('Access denied. Admins only.');
      navigate('/');
    }
  }, [user]);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    await Promise.all([fetchProducts(), fetchOrders()]);
  };

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await api.get('/api/v1/product/getAllProducts');
      if (res.data.success) setProducts(res.data.products);
    } catch { toast.error('Failed to fetch products'); }
    finally { setLoadingProducts(false); }
  };

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await api.get('/api/v1/order/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setOrders(res.data.orders);
        // Compute stats
        const o = res.data.orders;
        setStats(prev => ({
          ...prev,
          orders: o.length,
          revenue: res.data.totalRevenue || 0,
          pending: o.filter(x => x.status === 'Pending').length,
          delivered: o.filter(x => x.status === 'Delivered').length,
        }));
      }
    } catch { toast.error('Failed to fetch orders'); }
    finally { setLoadingOrders(false); }
  };

  // Update stats when products change
  useEffect(() => {
    setStats(prev => ({ ...prev, products: products.length }));
  }, [products]);

  // Delete product
  const handleDeleteProduct = async () => {
    setDeleting(true);
    try {
      await api.delete(`/api/v1/product/delete/${deleteTarget.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Product deleted');
      setDeleteTarget(null);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally { setDeleting(false); }
  };

  // Update order fields (status, paymentStatus, etc.)
  const handleOrderUpdate = async (orderId, fields) => {
    setUpdatingStatus(orderId);
    try {
      const res = await api.put(`/api/v1/order/update-status/${orderId}`, fields, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success('Order updated successfully');
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, ...fields } : o));
        setOrderDetailModal(prev => (prev && prev._id === orderId ? { ...prev, ...fields } : prev));
      }
    } catch (err) {
      toast.error('Failed to update order');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const filteredProducts = products.filter(p =>
    p.productName?.toLowerCase().includes(searchProducts.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchProducts.toLowerCase()) ||
    p.brand?.toLowerCase().includes(searchProducts.toLowerCase())
  );

  const filteredOrders = orders.filter(o =>
    o._id?.toLowerCase().includes(searchOrders.toLowerCase()) ||
    o.userId?.firstName?.toLowerCase().includes(searchOrders.toLowerCase()) ||
    o.userId?.lastName?.toLowerCase().includes(searchOrders.toLowerCase()) ||
    o.status?.toLowerCase().includes(searchOrders.toLowerCase()) ||
    o.paymentMethod?.toLowerCase().includes(searchOrders.toLowerCase())
  );

  const tabs = [
    { key: 'overview', label: 'Overview', icon: LayoutDashboard },
    { key: 'products', label: 'Products', icon: Package },
    { key: 'orders', label: 'Orders', icon: ShoppingBag },
  ];

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-background text-white pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Glow Circles */}
        <div className="absolute top-10 left-10 w-[300px] h-[300px] bg-accent/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="mb-8 border-b border-white/5 pb-6">
          <span className="inline-flex items-center gap-1 bg-secondary/10 text-secondary border border-secondary/20 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="size-3" />
            Administration Center
          </span>
          <h1 className="text-3xl font-extrabold font-heading text-white tracking-wide">System Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1">
            Welcome back to the suite, <span className="font-semibold text-accent">{user?.firstName}</span>
          </p>
        </div>

        {/* Tabs Controls */}
        <div className="flex gap-2 mb-8 bg-[#111827] border border-white/5 rounded-2xl p-1 shadow-md w-fit">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                tab === t.key
                  ? 'bg-accent text-background shadow-lg glow-accent font-bold'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>

        {/* ═══════════════════ OVERVIEW ═══════════════════ */}
        {tab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <StatCard icon={Package} label="Total Products" value={stats.products} colorClass="text-accent" />
              <StatCard icon={ShoppingBag} label="Total Orders" value={stats.orders} colorClass="text-blue-400" />
              <StatCard icon={TrendingUp} label="Revenue Suite" value={`Rs. ${stats.revenue.toLocaleString()}`} colorClass="text-emerald-400" />
              <StatCard icon={Clock} label="Pending Review" value={stats.pending} colorClass="text-yellow-400" />
              <StatCard icon={CheckCircle} label="Delivered" value={stats.delivered} colorClass="text-green-400" />
              <StatCard icon={XCircle} label="Cancelled Log" value={orders.filter(o=>o.status==='Cancelled').length} colorClass="text-red-400" />
            </div>

            {/* Recent Orders */}
            <div className="bg-card rounded-2xl border border-white/5 shadow-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                <h2 className="font-bold text-white font-heading text-lg">Recent Order Transactions</h2>
                <button onClick={() => setTab('orders')} className="text-sm text-accent hover:underline font-bold cursor-pointer">View All →</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#050816]/60 text-gray-400 text-xs font-bold uppercase tracking-wider border-b border-white/5">
                    <tr>
                      <th className="px-6 py-3.5 text-left">Order Reference</th>
                      <th className="px-6 py-3.5 text-left">Customer</th>
                      <th className="px-6 py-3.5 text-left">Amount</th>
                      <th className="px-6 py-3.5 text-left">Status</th>
                      <th className="px-6 py-3.5 text-left">Log Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {orders.slice(0, 5).map(order => (
                      <tr key={order._id} className="hover:bg-white/[0.02] transition-colors duration-150">
                        <td className="px-6 py-3 font-mono text-xs text-gray-500">#{order._id.slice(-6).toUpperCase()}</td>
                        <td className="px-6 py-3 font-semibold text-white/90">
                          {order.userId?.firstName} {order.userId?.lastName}
                        </td>
                        <td className="px-6 py-3 font-extrabold text-accent font-mono">Rs. {order.totalAmount.toLocaleString()}</td>
                        <td className="px-6 py-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border tracking-wider ${STATUS_COLORS[order.status]}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-gray-500 text-xs font-mono">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                        </td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No recent orders logged</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Products */}
            <div className="bg-card rounded-2xl border border-white/5 shadow-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                <h2 className="font-bold text-white font-heading text-lg">Recently Created Products</h2>
                <button onClick={() => setTab('products')} className="text-sm text-accent hover:underline font-bold cursor-pointer">Manage Products →</button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-5 p-5">
                {products.slice(0, 5).map(p => (
                  <div key={p._id} className="rounded-xl border border-white/5 overflow-hidden bg-background/50 p-2.5 hover:border-accent/20 transition-all duration-300">
                    <div className="aspect-square bg-card rounded-lg overflow-hidden flex items-center justify-center p-2 border border-white/5">
                      <img src={p.productImg?.[0]?.url || '/placeholder-product.png'} alt={p.productName} className="w-full h-full object-contain hover:scale-105 transition-transform duration-300" />
                    </div>
                    <div className="p-2 space-y-1 mt-1">
                      <p className="text-xs font-semibold text-white/95 line-clamp-1">{p.productName}</p>
                      <p className="text-xs text-accent font-bold font-mono">Rs. {p.productPrice.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════ PRODUCTS ═══════════════════ */}
        {tab === 'products' && (
          <div className="space-y-5 animate-fade-in">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="relative flex-1 max-w-sm w-full">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  value={searchProducts}
                  onChange={e => setSearchProducts(e.target.value)}
                  placeholder="Search products, category, brand..."
                  className="w-full bg-card border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-accent text-white"
                />
              </div>
              <Button onClick={() => setProductModal('add')} className="bg-accent hover:bg-accent-hover text-background font-bold rounded-xl gap-2 h-10 glow-accent hover:scale-[1.02] cursor-pointer">
                <Plus size={16} /> Add Tech Product
              </Button>
            </div>

            {/* Products Table */}
            <div className="bg-card rounded-2xl border border-white/5 shadow-xl overflow-hidden">
              {loadingProducts ? (
                <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-accent" /></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-[#050816]/60 text-gray-400 text-xs font-bold uppercase tracking-wider border-b border-white/5">
                      <tr>
                        <th className="px-6 py-3.5 text-left">Product Details</th>
                        <th className="px-6 py-3.5 text-left">Category</th>
                        <th className="px-6 py-3.5 text-left">Brand</th>
                        <th className="px-6 py-3.5 text-left">Price</th>
                        <th className="px-6 py-3.5 text-left">Stock Images</th>
                        <th className="px-6 py-3.5 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredProducts.map(p => (
                        <tr key={p._id} className="hover:bg-white/[0.02] transition-colors duration-150">
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg overflow-hidden bg-background border border-white/5 flex items-center justify-center p-1 flex-shrink-0">
                                <img src={p.productImg?.[0]?.url || '/placeholder-product.png'} alt={p.productName} className="w-full h-full object-contain" />
                              </div>
                              <div>
                                <p className="font-semibold text-white/95 line-clamp-1 max-w-[200px]">{p.productName}</p>
                                <p className="text-[9px] text-gray-500 font-mono mt-0.5">#{p._id.toUpperCase()}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-3">
                            <span className="bg-accent/5 text-accent border border-accent/25 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full tracking-wider">{p.category}</span>
                          </td>
                          <td className="px-6 py-3 text-gray-400 font-medium">{p.brand}</td>
                          <td className="px-6 py-3 font-bold text-accent font-mono">Rs. {p.productPrice.toLocaleString()}</td>
                          <td className="px-6 py-3 text-gray-500 font-mono text-xs">{p.productImg?.length || 0} pics</td>
                          <td className="px-6 py-3">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => navigate(`/product/${p._id}`)}
                                className="p-2 text-accent hover:bg-accent/10 rounded-lg transition-colors border border-transparent hover:border-accent/15 cursor-pointer"
                                title="View Product Page"
                              ><Eye size={15} /></button>
                              <button
                                onClick={() => setProductModal(p)}
                                className="p-2 text-secondary hover:bg-secondary/10 rounded-lg transition-colors border border-transparent hover:border-secondary/15 cursor-pointer"
                                title="Edit Setup"
                              ><Pencil size={15} /></button>
                              <button
                                onClick={() => setDeleteTarget({ type: 'product', id: p._id, name: p.productName })}
                                className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/15 cursor-pointer"
                                title="Delete Product"
                              ><Trash2 size={15} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredProducts.length === 0 && (
                        <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No products found in catalogue</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 font-mono text-right">{filteredProducts.length} items listed</p>
          </div>
        )}

        {/* ═══════════════════ ORDERS ═══════════════════ */}
        {tab === 'orders' && (
          <div className="space-y-5 animate-fade-in">
            {/* Search */}
            <div className="relative max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={searchOrders}
                onChange={e => setSearchOrders(e.target.value)}
                placeholder="Search orders, buyers, payments, status..."
                className="w-full bg-card border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-accent text-white"
              />
            </div>

            {/* Orders Table */}
            <div className="bg-card rounded-2xl border border-white/5 shadow-xl overflow-hidden">
              {loadingOrders ? (
                <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-accent" /></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-[#050816]/60 text-gray-400 text-xs font-bold uppercase tracking-wider border-b border-white/5">
                      <tr>
                        <th className="px-6 py-3.5 text-left">Order UID</th>
                        <th className="px-6 py-3.5 text-left">Customer details</th>
                        <th className="px-6 py-3.5 text-left">Items count</th>
                        <th className="px-6 py-3.5 text-left">Paid Amount</th>
                        <th className="px-6 py-3.5 text-left">Payment details</th>
                        <th className="px-6 py-3.5 text-left">Log Date</th>
                        <th className="px-6 py-3.5 text-left">Process status</th>
                        <th className="px-6 py-3.5 text-center">Logs</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredOrders.map(order => (
                        <tr key={order._id} className="hover:bg-white/[0.02] transition-colors duration-150">
                          <td className="px-6 py-3 font-mono text-xs text-gray-500">#{order._id.slice(-8).toUpperCase()}</td>
                          <td className="px-6 py-3">
                            <p className="font-semibold text-white/95">{order.userId?.firstName} {order.userId?.lastName}</p>
                            <p className="text-xs text-gray-500 font-mono mt-0.5">{order.userId?.email}</p>
                          </td>
                          <td className="px-6 py-3 text-gray-400 font-mono">{order.items?.length || 0} items</td>
                          <td className="px-6 py-3 font-extrabold text-accent font-mono">Rs. {order.totalAmount.toLocaleString()}</td>
                          <td className="px-6 py-3">
                            <div className="space-y-0.5">
                              <span className={`text-[10px] font-extrabold uppercase tracking-wider ${order.paymentStatus === 'Paid' ? 'text-emerald-400' : order.paymentStatus === 'Failed' ? 'text-red-400' : 'text-yellow-400'}`}>
                                {order.paymentStatus || 'Pending'}
                              </span>
                              <p className="text-[10px] text-gray-500 uppercase tracking-widest">{order.paymentMethod || 'COD'}</p>
                            </div>
                          </td>
                          <td className="px-6 py-3 text-xs text-gray-500 font-mono">
                            {new Date(order.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}
                          </td>
                          <td className="px-6 py-3">
                            <div className="relative">
                              <select
                                value={order.status}
                                onChange={e => handleOrderUpdate(order._id, { status: e.target.value })}
                                disabled={updatingStatus === order._id}
                                className={`text-[10px] font-extrabold tracking-wider uppercase border border-white/5 rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer ${STATUS_COLORS[order.status]} ${updatingStatus === order._id ? 'opacity-60' : ''}`}
                              >
                                {statusOptions.map(s => <option key={s} value={s} className="bg-card text-white">{s}</option>)}
                              </select>
                              {updatingStatus === order._id && (
                                <Loader2 size={12} className="absolute right-1 top-1/2 -translate-y-1/2 animate-spin text-accent" />
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-3 text-center">
                            <button
                              onClick={() => setOrderDetailModal(order)}
                              className="p-2 text-accent hover:bg-accent/10 border border-transparent hover:border-accent/15 rounded-lg transition-colors cursor-pointer"
                              title="Invoice details"
                            >
                              <Eye size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredOrders.length === 0 && (
                        <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-500">No orders logged in system</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 font-mono text-right">{filteredOrders.length} orders total</p>
          </div>
        )}
      </div>

      {/* ═══ MODALS ═══ */}
      {productModal && (
        <ProductModal
          product={productModal === 'add' ? null : productModal}
          products={products}
          onClose={() => setProductModal(null)}
          onSave={() => { setProductModal(null); fetchProducts(); }}
        />
      )}
      {orderDetailModal && (
        <OrderDetailModal
          order={orderDetailModal}
          onClose={() => setOrderDetailModal(null)}
          onOrderUpdate={handleOrderUpdate}
          updatingStatus={updatingStatus}
        />
      )}
      {deleteTarget && (
        <ConfirmDialog
          message={`Are you sure you want to delete "${deleteTarget.name}"? This transaction is permanent and cannot be undone.`}
          onConfirm={handleDeleteProduct}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
};

export default Dashboard;
