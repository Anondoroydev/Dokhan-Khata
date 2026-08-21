import React, { useState, useMemo } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  Layers, 
  ArrowUpDown,
  Image as ImageIcon,
  DollarSign,
  ScanBarcode,
  Upload,
  Camera,
  X,
  Link as LinkIcon
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Product, ProductCategory } from '../../types';
import Swal from 'sweetalert2';

interface InventoryViewProps {
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  isAddModalOpen,
  setIsAddModalOpen,
}) => {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    restockProduct,
    language,
    t,
  } = useStore();

  const isBn = language === 'bn';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterLowStockOnly, setFilterLowStockOnly] = useState(false);

  // Edit Product Modal State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Restock modal state
  const [restockItem, setRestockItem] = useState<Product | null>(null);
  const [restockQty, setRestockQty] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      Swal.fire({
        icon: 'error',
        title: isBn ? 'ভুল ফাইল' : 'Invalid File',
        text: isBn ? 'অনুগ্রহ করে একটি ছবি ফাইল নির্বাচন করুন' : 'Please select an image file',
        background: '#0f172a',
        color: '#ffffff',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setFormData((prev) => ({ ...prev, image: dataUrl }));
      };
    };
    reader.readAsDataURL(file);
  };

  // Form State for Add/Edit
  const [formData, setFormData] = useState<{
    name: string;
    nameBn: string;
    category: ProductCategory;
    sku: string;
    barcode: string;
    buyPrice: number;
    sellPrice: number;
    stock: number;
    unit: string;
    unitBn: string;
    minStockAlert: number;
    image: string;
    description: string;
    descriptionBn: string;
    isOnlineAvailable: boolean;
  }>({
    name: '',
    nameBn: '',
    category: 'grocery',
    sku: '',
    barcode: '',
    buyPrice: 0,
    sellPrice: 0,
    stock: 10,
    unit: 'Kg',
    unitBn: 'কেজি',
    minStockAlert: 10,
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60',
    description: '',
    descriptionBn: '',
    isOnlineAvailable: true,
  });

  // Financial Inventory Valuation
  const totalStockItems = products.reduce((sum, p) => sum + p.stock, 0);
  const totalStockBuyValue = products.reduce((sum, p) => sum + p.buyPrice * p.stock, 0);
  const totalStockSellValue = products.reduce((sum, p) => sum + p.sellPrice * p.stock, 0);
  const lowStockCount = products.filter((p) => p.stock <= p.minStockAlert).length;

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      const matchesLowStock = filterLowStockOnly ? p.stock <= p.minStockAlert : true;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        p.name.toLowerCase().includes(q) ||
        p.nameBn.includes(q) ||
        p.barcode.includes(q) ||
        p.sku.toLowerCase().includes(q);
      return matchesCategory && matchesLowStock && matchesSearch;
    });
  }, [products, selectedCategory, filterLowStockOnly, searchQuery]);

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      nameBn: '',
      category: 'grocery',
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      barcode: `8941${Math.floor(1000 + Math.random() * 9000)}`,
      buyPrice: 50,
      sellPrice: 65,
      stock: 20,
      unit: 'Pcs',
      unitBn: 'পিস',
      minStockAlert: 5,
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60',
      description: '',
      descriptionBn: '',
      isOnlineAvailable: true,
    });
    setEditingProduct(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      nameBn: product.nameBn,
      category: product.category,
      sku: product.sku,
      barcode: product.barcode,
      buyPrice: product.buyPrice,
      sellPrice: product.sellPrice,
      stock: product.stock,
      unit: product.unit,
      unitBn: product.unitBn,
      minStockAlert: product.minStockAlert,
      image: product.image,
      description: product.description || '',
      descriptionBn: product.descriptionBn || '',
      isOnlineAvailable: product.isOnlineAvailable,
    });
    setIsAddModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingProduct) {
      updateProduct(editingProduct.id, formData);
    } else {
      addProduct(formData);
    }
    setIsAddModalOpen(false);
    setEditingProduct(null);
  };

  const handleConfirmRestock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockItem || !restockQty) return;
    const qty = parseInt(restockQty, 10);
    if (isNaN(qty) || qty <= 0) return;

    restockProduct(restockItem.id, qty);
    setRestockItem(null);
    setRestockQty('');
  };

  return (
    <div className="space-y-6">
      {/* Top Inventory Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 backdrop-blur-xl p-5 rounded-3xl border border-white/10 shadow-xl shadow-black/20">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {t.dashboard.totalProducts}
          </span>
          <p className="text-2xl font-black text-white font-mono mt-2">{products.length}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {isBn ? `${totalStockItems} টি আইটেম মোটে রয়েছে` : `${totalStockItems} total units in stock`}
          </span>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl p-5 rounded-3xl border border-white/10 shadow-xl shadow-black/20">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {isBn ? 'ইনভেন্টরি ক্রয়মূল্য (Asset Value)' : 'Total Stock Cost Value'}
          </span>
          <p className="text-2xl font-black text-white font-mono mt-2">
            ৳{totalStockBuyValue.toLocaleString()}
          </p>
          <span className="text-[11px] text-emerald-400 font-medium mt-1 block">
            {isBn ? 'দোকানে মজুদ মোট মালামাল' : 'Wholesale value'}
          </span>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl p-5 rounded-3xl border border-white/10 shadow-xl shadow-black/20">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {isBn ? 'সম্ভাব্য বিক্রয়মূল্য' : 'Expected Retail Value'}
          </span>
          <p className="text-2xl font-black text-emerald-400 font-mono mt-2">
            ৳{totalStockSellValue.toLocaleString()}
          </p>
          <span className="text-[11px] text-emerald-400 font-medium mt-1 block">
            {isBn ? `প্রত্যাশিত লাভ: ৳${(totalStockSellValue - totalStockBuyValue).toLocaleString()}` : `Profit: BDT ${(totalStockSellValue - totalStockBuyValue).toLocaleString()}`}
          </span>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl p-5 rounded-3xl border border-white/10 shadow-xl shadow-black/20 flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {t.dashboard.lowStockAlert}
            </span>
            <p className="text-2xl font-black text-amber-400 font-mono mt-2">{lowStockCount}</p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-950/40 border border-white/10 w-full mt-2"
          >
            <Plus className="w-4 h-4" />
            <span>{t.inventory.addProduct}</span>
          </button>
        </div>
      </div>

      {/* Product Catalog Table */}
      <div className="bg-slate-900/70 backdrop-blur-2xl rounded-3xl border border-white/15 shadow-2xl shadow-black/40 p-6 space-y-4">
        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.inventory.searchPlaceholder}
              className="w-full pl-10 pr-4 py-2 text-xs border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 bg-white/[0.04] text-white placeholder-slate-500 backdrop-blur-md"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 text-xs font-semibold border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-900/80 text-white backdrop-blur-md"
            >
              <option value="all" className="bg-slate-900 text-white">{t.inventory.allCategories}</option>
              <option value="grocery" className="bg-slate-900 text-white">{t.categories.grocery}</option>
              <option value="beverage" className="bg-slate-900 text-white">{t.categories.beverage}</option>
              <option value="snacks" className="bg-slate-900 text-white">{t.categories.snacks}</option>
              <option value="dairy" className="bg-slate-900 text-white">{t.categories.dairy}</option>
              <option value="personal_care" className="bg-slate-900 text-white">{t.categories.personal_care}</option>
              <option value="spices" className="bg-slate-900 text-white">{t.categories.spices}</option>
              <option value="household" className="bg-slate-900 text-white">{t.categories.household}</option>
            </select>

            <button
              onClick={() => setFilterLowStockOnly(!filterLowStockOnly)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 border ${
                filterLowStockOnly
                  ? 'bg-amber-600/80 text-amber-100 border-amber-400/40 shadow-md shadow-amber-950/40'
                  : 'bg-white/[0.04] text-slate-300 border-white/10 hover:bg-white/10'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{t.inventory.filterLowStock} ({lowStockCount})</span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-white/[0.02]">
                <th className="py-3 px-3">{t.inventory.productName}</th>
                <th className="py-3 px-3">{t.inventory.category}</th>
                <th className="py-3 px-3 text-right">{t.inventory.buyPrice}</th>
                <th className="py-3 px-3 text-right">{t.inventory.sellPrice}</th>
                <th className="py-3 px-3 text-center">{t.inventory.currentStock}</th>
                <th className="py-3 px-3 text-center">{t.inventory.status}</th>
                <th className="py-3 px-3 text-right">{t.inventory.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredProducts.map((prod) => {
                const isOutOfStock = prod.stock <= 0;
                const isLowStock = prod.stock <= prod.minStockAlert && !isOutOfStock;
                const profitMargin = Math.round(((prod.sellPrice - prod.buyPrice) / prod.buyPrice) * 100);

                return (
                  <tr key={prod.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-xl object-cover border border-white/10 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-white">
                            {isBn ? prod.nameBn || prod.name : prod.name}
                          </p>
                          <span className="text-[10px] text-slate-400 font-mono">
                            SKU: {prod.sku} • বারকোড: {prod.barcode}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-300">
                      {t.categories[prod.category] || prod.category}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-medium text-slate-400">
                      ৳{prod.buyPrice}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-white">
                      ৳{prod.sellPrice}
                      <span className="text-[10px] text-emerald-400 block font-normal">
                        +{profitMargin}% লাভ
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-xl text-xs border ${
                          isOutOfStock
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                            : isLowStock
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        }`}
                      >
                        {prod.stock} {isBn ? prod.unitBn || prod.unit : prod.unit}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                          isOutOfStock
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            : isLowStock
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}
                      >
                        {isOutOfStock ? t.inventory.outOfStock : isLowStock ? t.inventory.lowStock : t.inventory.inStock}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setRestockItem(prod)}
                          className="px-2 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-bold rounded-lg transition-colors border border-emerald-500/30"
                          title="Restock Inventory"
                        >
                          + {t.inventory.restock}
                        </button>
                        <button
                          onClick={() => handleOpenEdit(prod)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            Swal.fire({
                              title: isBn ? 'আপনি কি নিশ্চিত?' : 'Are you sure?',
                              text: isBn 
                                ? `"${isBn ? prod.nameBn || prod.name : prod.name}" পণ্যটি মুছে ফেলা হবে!` 
                                : `Product "${prod.name}" will be deleted!`,
                              icon: 'warning',
                              showCancelButton: true,
                              confirmButtonColor: '#f43f5e',
                              cancelButtonColor: '#334155',
                              confirmButtonText: isBn ? 'হ্যাঁ, মুছে ফেলুন!' : 'Yes, Delete!',
                              cancelButtonText: isBn ? 'বাতিল' : 'Cancel',
                              background: '#0f172a',
                              color: '#ffffff',
                              customClass: {
                                popup: 'border border-white/10 rounded-3xl shadow-2xl',
                                confirmButton: 'rounded-xl font-bold px-4 py-2.5',
                                cancelButton: 'rounded-xl font-bold px-4 py-2.5',
                              }
                            }).then((result) => {
                              if (result.isConfirmed) {
                                deleteProduct(prod.id);
                                Swal.fire({
                                  toast: true,
                                  position: 'top-end',
                                  icon: 'success',
                                  title: isBn ? 'পণ্য মুছে ফেলা হয়েছে!' : 'Product deleted successfully!',
                                  showConfirmButton: false,
                                  timer: 3000,
                                  timerProgressBar: true,
                                  background: '#0f172a',
                                  color: '#ffffff',
                                  customClass: {
                                    popup: 'border border-white/10 rounded-2xl shadow-xl'
                                  }
                                });
                              }
                            });
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-slate-900/95 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl p-6 overflow-hidden max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
              <h3 className="font-bold text-base text-white">
                {editingProduct ? t.inventory.updateProduct : t.inventory.addProduct}
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white p-1">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="mt-4 space-y-3.5 overflow-y-auto flex-1 pr-1 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Product Name (English) *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Miniket Rice"
                    className="w-full px-3 py-2 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-slate-950/70 text-white placeholder-slate-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">পণ্যের নাম (বাংলা) *</label>
                  <input
                    type="text"
                    required
                    value={formData.nameBn}
                    onChange={(e) => setFormData({ ...formData, nameBn: e.target.value })}
                    placeholder="যেমন: মিনিকেট চাল"
                    className="w-full px-3 py-2 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-slate-950/70 text-white placeholder-slate-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">{t.inventory.category}</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ProductCategory })}
                    className="w-full px-3 py-2 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-slate-950/70 text-white"
                  >
                    <option value="grocery">Grocery (মুদি)</option>
                    <option value="beverage">Beverage (পানীয়)</option>
                    <option value="snacks">Snacks (বিস্কুট)</option>
                    <option value="dairy">Dairy (দুগ্ধজাত)</option>
                    <option value="personal_care">Personal Care (প্রসাধন)</option>
                    <option value="spices">Spices (মশলা)</option>
                    <option value="household">Household (গৃহস্থালি)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Stock Unit (একক)</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <input
                      type="text"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      placeholder="Kg/Pcs"
                      className="w-full px-2 py-2 border border-white/10 rounded-xl bg-slate-950/70 text-white"
                    />
                    <input
                      type="text"
                      value={formData.unitBn}
                      onChange={(e) => setFormData({ ...formData, unitBn: e.target.value })}
                      placeholder="কেজি/পিস"
                      className="w-full px-2 py-2 border border-white/10 rounded-xl bg-slate-950/70 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">{t.inventory.buyPrice} (৳)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.buyPrice}
                    onChange={(e) => setFormData({ ...formData, buyPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 font-mono border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-slate-950/70 text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">{t.inventory.sellPrice} (৳)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.sellPrice}
                    onChange={(e) => setFormData({ ...formData, sellPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 font-mono border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 font-bold text-emerald-400 bg-slate-950/70"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">{t.inventory.currentStock}</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 font-mono border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-slate-950/70 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">SKU Code</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-2 font-mono border border-white/10 rounded-xl bg-slate-950/70 text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Barcode</label>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full px-3 py-2 font-mono border border-white/10 rounded-xl bg-slate-950/70 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-2">
                  {isBn ? 'পণ্যের ছবি (Product Image)' : 'Product Image'}
                </label>
                
                <div className="space-y-3">
                  {formData.image ? (
                    <div className="relative group rounded-2xl overflow-hidden border border-emerald-500/30 bg-slate-900/80 p-2.5 flex items-center gap-4">
                      <img
                        src={formData.image}
                        alt="Product Preview"
                        className="w-20 h-20 object-cover rounded-xl border border-white/10 shadow-md shrink-0 bg-slate-950"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 mb-1">
                          <CheckCircle className="w-4 h-4" />
                          {isBn ? 'ছবি যোগ করা হয়েছে' : 'Image Attached'}
                        </div>
                        <p className="text-xs text-slate-400 truncate font-mono mb-2">
                          {formData.image.startsWith('data:') ? (isBn ? 'ডিভাইস থেকে আপলোডকৃত' : 'Uploaded from Device') : formData.image}
                        </p>
                        <div className="flex items-center gap-2">
                          <label
                            htmlFor="product-image-file"
                            className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold rounded-xl border border-emerald-500/30 cursor-pointer transition-colors inline-flex items-center gap-1.5"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            {isBn ? 'ছবি পরিবর্তন' : 'Change Image'}
                          </label>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, image: '' })}
                            className="px-2.5 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold rounded-xl border border-rose-500/30 transition-colors inline-flex items-center gap-1.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            {isBn ? 'মুছে ফেলুন' : 'Remove'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <label
                      htmlFor="product-image-file"
                      className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-700 hover:border-emerald-500/60 bg-slate-950/70 hover:bg-slate-900/80 rounded-2xl cursor-pointer transition-all text-center group"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                        <Upload className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-bold text-white mb-0.5">
                        {isBn ? 'ডিভাইস বা গ্যালারি থেকে ছবি আপলোড করুন' : 'Click to Upload Image from Device'}
                      </p>
                      <p className="text-xs text-slate-400">
                        {isBn ? 'গ্যালারি বা ক্যামেরা থেকে বেছে নিন (PNG, JPG, WEBP)' : 'Select PNG, JPG, or WEBP file'}
                      </p>
                    </label>
                  )}

                  <input
                    type="file"
                    id="product-image-file"
                    accept="image/*"
                    onChange={handleImageFileUpload}
                    className="hidden"
                  />

                  <div className="pt-1">
                    {showUrlInput ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="url"
                          value={formData.image}
                          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                          placeholder="https://example.com/image.jpg"
                          className="flex-1 px-3 py-2 text-xs border border-white/10 rounded-xl bg-slate-950/70 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowUrlInput(false)}
                          className="text-xs text-slate-400 hover:text-white px-2 py-1"
                        >
                          {isBn ? 'বন্ধ' : 'Close'}
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowUrlInput(true)}
                        className="text-xs text-slate-400 hover:text-emerald-400 inline-flex items-center gap-1 transition-colors"
                      >
                        <LinkIcon className="w-3 h-3" />
                        {isBn ? 'ওয়েব ইউআরএল (Web Link) ব্যবহার করতে চান?' : 'Or use Web Image URL'}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="onlineAvailable"
                  checked={formData.isOnlineAvailable}
                  onChange={(e) => setFormData({ ...formData, isOnlineAvailable: e.target.checked })}
                  className="w-4 h-4 text-emerald-500 rounded-sm bg-slate-900 border-white/20"
                />
                <label htmlFor="onlineAvailable" className="font-semibold text-slate-300 cursor-pointer">
                  {t.inventory.onlineStoreStatus}
                </label>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:bg-white/10 rounded-xl"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg border border-white/10"
                >
                  {editingProduct ? t.inventory.updateProduct : t.inventory.saveProduct}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Restock Inline Modal */}
      {restockItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-xs bg-slate-900/90 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl p-5">
            <h4 className="font-bold text-sm text-white">
              {t.inventory.restock}: {isBn ? restockItem.nameBn || restockItem.name : restockItem.name}
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              {isBn ? `বর্তমান স্টক: ${restockItem.stock} ${restockItem.unitBn || restockItem.unit}` : `Current: ${restockItem.stock} ${restockItem.unit}`}
            </p>

            <form onSubmit={handleConfirmRestock} className="mt-4 space-y-3">
              <input
                type="number"
                min="1"
                required
                autoFocus
                value={restockQty}
                onChange={(e) => setRestockQty(e.target.value)}
                placeholder={isBn ? 'কত যোগ করবেন? (যেমন: ২০)' : 'Quantity to add'}
                className="w-full px-3 py-2.5 font-bold font-mono text-center text-lg border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-slate-950/70 text-white"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRestockItem(null)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-400 bg-white/10 hover:bg-white/15 rounded-xl"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl shadow-lg border border-white/10"
                >
                  {t.common.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
