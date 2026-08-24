import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  UserPlus, 
  Receipt, 
  CreditCard, 
  Smartphone, 
  Banknote, 
  CheckCircle, 
  AlertCircle,
  Tag,
  ScanBarcode,
  ShoppingBag
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Product, Customer, ProductCategory, Transaction } from '../../types';
import toast from 'react-hot-toast';

interface POSViewProps {
  onOpenReceipt: (txn: Transaction) => void;
  onOpenAddCustomer: () => void;
}

export const POSView: React.FC<POSViewProps> = ({ onOpenReceipt, onOpenAddCustomer }) => {
  const {
    products,
    customers,
    processPOSSale,
    language,
    t,
  } = useStore();

  const isBn = language === 'bn';

  // POS Cart State
  const [posCart, setPosCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bkash' | 'nagad' | 'rocket' | 'upay' | 'card' | 'due'>('cash');
  const [discount, setDiscount] = useState<number>(0);
  const [receivedAmount, setReceivedAmount] = useState<string>('');
  const [saleNote, setSaleNote] = useState('');

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        p.name.toLowerCase().includes(q) ||
        p.nameBn.includes(q) ||
        p.barcode.includes(q) ||
        p.sku.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Cart Calculations
  const subtotal = useMemo(() => {
    return posCart.reduce((sum, item) => sum + item.product.sellPrice * item.quantity, 0);
  }, [posCart]);

  const netPayable = Math.max(0, subtotal - discount);
  const receivedNum = parseFloat(receivedAmount) || 0;
  const changeAmount = paymentMethod === 'cash' ? Math.max(0, receivedNum - netPayable) : 0;

  const handleAddToCart = (product: Product) => {
    console.debug('POS: add to cart clicked', product.id, product.name, 'stock=', product.stock);
    if (product.stock <= 0) {
      toast.error(language === 'bn' ? 'পণ্য স্টকে নেই' : 'Product out of stock');
      return;
    }

    setPosCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          toast.error(language === 'bn' ? 'স্টকের চেয়ে বেশি যোগ করা সম্ভব নয়' : 'Cannot add more than available stock');
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      toast.success(language === 'bn' ? 'কার্টে যোগ করা হয়েছে' : 'Added to cart');
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateQty = (productId: string, delta: number) => {
    setPosCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            if (newQty > item.product.stock) return item;
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(Boolean) as { product: Product; quantity: number }[];
    });
  };

  const handleRemoveItem = (productId: string) => {
    setPosCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setPosCart([]);
    setDiscount(0);
    setReceivedAmount('');
    setSaleNote('');
    setPaymentMethod('cash');
    setSelectedCustomerId('');
  };

  const handleCompleteSale = () => {
    if (posCart.length === 0) return;
    const remaining = Math.max(0, netPayable - receivedNum);
    // If there is any remaining amount (due) or explicit due method, a customer must be selected
    if ((paymentMethod === 'due' || remaining > 0) && !selectedCustomerId) {
      toast.error(isBn ? 'বাকী বা আংশিক পেমেন্টের জন্য অনুগ্রহ করে একটি গ্রাহক নির্বাচন করুন!' : 'Please select a customer to record the due amount!');
      return;
    }

    const { transaction } = processPOSSale({
      items: posCart,
      subtotal,
      discount,
      totalAmount: netPayable,
      paymentMethod,
      customerId: selectedCustomerId || undefined,
      receivedAmount: receivedNum,
      note: saleNote,
    });

    handleClearCart();
    toast.success(isBn ? 'বিক্রি সফল হয়েছে!' : 'Sale completed successfully!');
    onOpenReceipt(transaction);
  };

  const categories: { id: string; label: string }[] = [
    { id: 'all', label: isBn ? 'সব পণ্য' : 'All Items' },
    { id: 'grocery', label: isBn ? 'মুদি' : 'Grocery' },
    { id: 'beverage', label: isBn ? 'পানীয় ও চা' : 'Beverage' },
    { id: 'snacks', label: isBn ? 'বিস্কুট ও স্ন্যাকস' : 'Snacks' },
    { id: 'dairy', label: isBn ? 'দুগ্ধজাত' : 'Dairy' },
    { id: 'personal_care', label: isBn ? 'প্রসাধন' : 'Personal Care' },
    { id: 'spices', label: isBn ? 'মশলা' : 'Spices' },
    { id: 'household', label: isBn ? 'গৃহস্থালি' : 'Household' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Column: Product Catalog & Fast Search (7 cols on lg) */}
      <div className="lg:col-span-7 space-y-4">
        {/* Search Bar & Barcode Scanner */}
        <div className="bg-slate-900/60 backdrop-blur-xl p-4 rounded-3xl border border-white/10 shadow-xl shadow-black/20 space-y-3">
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.pos.searchProduct}
              className="w-full pl-11 pr-12 py-2.5 text-xs sm:text-sm border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 bg-white/[0.04] text-white placeholder-slate-500 backdrop-blur-md"
            />
            <span title="Scan Barcode" className="absolute right-3.5 top-3 cursor-pointer hover:scale-110 transition-transform">
              <ScanBarcode className="w-5 h-5 text-emerald-400" />
            </span>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950/40 border-emerald-400/30'
                    : 'bg-white/[0.04] text-slate-300 border-white/10 hover:bg-white/10'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3 max-h-[620px] overflow-y-auto p-1">
          {filteredProducts.map((prod) => {
            const isOutOfStock = prod.stock <= 0;
            const isLowStock = prod.stock <= prod.minStockAlert && !isOutOfStock;
            const inCartItem = posCart.find((i) => i.product.id === prod.id);

            return (
              <div
                key={prod.id}
                onClick={() => handleAddToCart(prod)}
                className={`group relative bg-slate-900/60 backdrop-blur-xl p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border transition-all cursor-pointer select-none flex flex-col justify-between shadow-lg shadow-black/10 ${
                  isOutOfStock
                    ? 'opacity-40 border-white/5 cursor-not-allowed bg-slate-950/60'
                    : inCartItem
                    ? 'border-emerald-500 ring-2 ring-emerald-500/30 shadow-md shadow-emerald-950/30'
                    : 'border-white/10 hover:border-emerald-400/40 hover:bg-white/[0.06] hover:shadow-xl'
                }`}
              >
                <div>
                  <div className="relative aspect-4/3 w-full rounded-lg sm:rounded-xl overflow-hidden bg-slate-950/60 mb-2 sm:mb-2.5 border border-white/10">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {isLowStock && (
                      <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 px-1.5 sm:px-2 py-0.5 bg-amber-500 text-slate-950 text-[8px] sm:text-[9px] font-bold rounded-md shadow-xs">
                        {isBn ? 'স্বল্প স্টক' : 'Low'}
                      </span>
                    )}
                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center text-white text-[10px] sm:text-[11px] font-bold">
                        {t.pos.outOfStock}
                      </div>
                    )}
                  </div>

                  <h4 className="font-bold text-[11px] sm:text-xs text-white line-clamp-1">
                    {isBn ? prod.nameBn || prod.name : prod.name}
                  </h4>
                  <p className="text-[9px] sm:text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                    {prod.sku} • {isBn ? `${prod.stock} ${prod.unitBn || prod.unit}` : `${prod.stock} ${prod.unit}`}
                  </p>
                </div>

                <div className="mt-2 pt-1.5 sm:pt-2 border-t border-white/10 flex items-center justify-between gap-1">
                  <span className="text-xs sm:text-sm font-extrabold font-mono text-emerald-400 truncate">
                    ৳{prod.sellPrice}
                  </span>
                  {inCartItem ? (
                    <span className="px-1.5 sm:px-2 py-0.5 bg-emerald-500 text-slate-950 text-[10px] sm:text-[11px] font-black rounded-lg font-mono shrink-0">
                      {inCartItem.quantity}
                    </span>
                  ) : (
                    <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-white/10 group-hover:bg-emerald-500 group-hover:text-slate-950 text-slate-300 flex items-center justify-center transition-colors border border-white/10 shrink-0">
                      <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: POS Active Bill / Cart / Checkout (5 cols on lg) */}
      <div 
        id="pos-checkout-section"
        className="lg:col-span-5 bg-slate-900/70 backdrop-blur-2xl rounded-3xl border border-white/15 shadow-2xl shadow-black/40 p-5 flex flex-col justify-between min-h-[500px] sm:min-h-[640px]"
      >
        <div>
          {/* Cart Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <Receipt className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">{t.pos.cartTitle}</h3>
                <p className="text-[11px] text-slate-400">{posCart.length} {isBn ? 'টি পণ্য নির্বাচিত' : 'items added'}</p>
              </div>
            </div>

            {posCart.length > 0 && (
              <button
                onClick={handleClearCart}
                className="text-xs text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t.pos.clearCart}</span>
              </button>
            )}
          </div>

          {/* Customer Selection for Baki or Walk-in */}
          <div className="py-3 border-b border-white/10">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-semibold text-slate-300">
                {isBn ? 'গ্রাহক নির্বাচন (বাকী বা স্পেশাল ডিসকাউন্ট)' : 'Select Customer (Khata Ledger)'}
              </label>
              <button
                onClick={onOpenAddCustomer}
                className="text-[10px] text-emerald-400 font-bold hover:underline flex items-center gap-0.5"
              >
                <UserPlus className="w-3 h-3" />
                {t.pos.addNewCustomer}
              </button>
            </div>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 bg-slate-950/70 text-white"
            >
              <option value="">{isBn ? 'কাউন্টার সরাসরি ক্রেতা (নগদ)' : 'Walk-in Cash Customer'}</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.phone}) - {isBn ? `বাকী: ৳${c.totalDue}` : `Due: BDT ${c.totalDue}`}
                </option>
              ))}
            </select>
          </div>

          {/* Cart Items List */}
          <div className="max-h-56 overflow-y-auto divide-y divide-white/5 py-1">
            {posCart.length > 0 ? (
              posCart.map((item) => (
                <div key={item.product.id} className="py-2.5 flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate">
                      {isBn ? item.product.nameBn || item.product.name : item.product.name}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      ৳{item.product.sellPrice} × {item.quantity} = ৳{item.product.sellPrice * item.quantity}
                    </p>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-1.5 bg-white/[0.04] p-1 rounded-xl border border-white/10">
                    <button
                      onClick={() => handleUpdateQty(item.product.id, -1)}
                      className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-200 shadow-2xs"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-xs font-bold font-mono text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleUpdateQty(item.product.id, 1)}
                      className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-200 shadow-2xs"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleRemoveItem(item.product.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-slate-500 space-y-2">
                <ShoppingBag className="w-10 h-10 mx-auto text-slate-600 stroke-1" />
                <p className="text-xs">{t.pos.emptyCart}</p>
                <p className="text-[11px] text-slate-500">{isBn ? 'বামপাশ থেকে পণ্যে ক্লিক করুন' : 'Click items on the left to add'}</p>
              </div>
            )}
          </div>
        </div>

        {/* Bill Calculations & Payment Options */}
        <div className="pt-3 border-t border-white/10 space-y-3">
          {/* Subtotal & Discount Row */}
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>{t.pos.subtotal}</span>
              <span className="font-mono font-semibold text-white">৳{subtotal}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-300">{t.pos.discount}</span>
              <div className="relative w-28">
                <input
                  type="number"
                  min="0"
                  value={discount || ''}
                  onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                  placeholder="0"
                  className="w-full px-2 py-1 text-right text-xs font-mono border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-950/70 text-white"
                />
              </div>
            </div>
            <div className="flex justify-between text-sm font-black text-white pt-1 border-t border-white/10">
              <span>{t.pos.netPayable}</span>
              <span className="text-emerald-400 font-mono text-base">৳{netPayable}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1.5">
              {t.pos.paymentMethod}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'cash', label: 'Cash', icon: Banknote },
                { id: 'due', label: 'Due', icon: Tag, isDue: true },
                { id: 'bkash', label: 'বিকাশ', icon: Smartphone },
                { id: 'nagad', label: 'নগদ', icon: Smartphone },
                { id: 'rocket', label: 'রকেট', icon: Smartphone },
                { id: 'upay', label: 'উপায়', icon: Smartphone },
                { id: 'card', label: 'কার্ড', icon: CreditCard },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`py-2 px-2 rounded-xl text-[10px] font-bold flex flex-col items-center gap-1 transition-all border w-16 ${
                      isSelected
                        ? m.isDue
                          ? 'bg-rose-500/20 border-rose-500 text-rose-300 ring-2 ring-rose-500/30'
                          : 'bg-emerald-500/20 border-emerald-400 text-emerald-300 ring-2 ring-emerald-500/30'
                        : 'bg-white/[0.04] border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="truncate w-full text-center">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cash Received & Change Calculations if Cash */}
          {paymentMethod !== 'due' && (
            <div className="grid grid-cols-2 gap-2 bg-white/[0.03] p-2.5 rounded-xl border border-white/10">
              <div>
                <label className="block text-[10px] font-medium text-slate-400 mb-0.5">
                  {isBn ? 'বর্তমানে জমা' : (t.pos.receivedAmount || 'Received Amount')}
                </label>
                <input
                  type="number"
                  value={receivedAmount}
                  onChange={(e) => setReceivedAmount(e.target.value)}
                  className="w-full px-2 py-1 text-xs font-mono font-bold border border-white/10 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-950/70 text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-slate-400 mb-0.5">
                  {t.pos.changeAmount}
                </label>
                <div className="px-2 py-1 text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                  ৳{changeAmount}
                </div>
              </div>
            </div>
          )}

          {/* Checkout Action Button */}
          <button
            onClick={handleCompleteSale}
            disabled={posCart.length === 0}
            className={`w-full py-3.5 rounded-2xl font-black text-xs sm:text-sm text-white flex items-center justify-center gap-2 transition-all shadow-xl active:scale-[0.99] border ${
              posCart.length === 0
                ? 'bg-slate-800 text-slate-500 border-white/5 cursor-not-allowed'
                : paymentMethod === 'due'
                ? 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 border-rose-400/30 shadow-rose-950/50'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border-emerald-400/30 shadow-emerald-950/50'
            }`}
          >
            <Receipt className="w-5 h-5" />
            <span>{t.pos.checkout} (৳{netPayable})</span>
          </button>
        </div>
      </div>

      {/* Floating Sticky Mobile Cart Quick-View Bar for small phone screens */}
      {posCart.length > 0 && (
        <div className="lg:hidden fixed bottom-4 left-3 right-3 z-40 animate-in slide-in-from-bottom-5">
          <button
            onClick={() => {
              document.getElementById('pos-checkout-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-3.5 rounded-2xl shadow-2xl shadow-emerald-950/80 border border-emerald-400/40 flex items-center justify-between font-bold text-xs active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-slate-950/40 flex items-center justify-center font-mono text-[11px] font-black">
                {posCart.length}
              </span>
              <span>{isBn ? 'কার্ট চেকআউট করুন' : 'View Cart & Checkout'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black font-mono">৳{netPayable}</span>
              <Receipt className="w-4 h-4 text-emerald-300" />
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
