import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShoppingCart, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowRight, 
  Truck, 
  ShieldCheck, 
  Clock, 
  MessageSquare, 
  CheckCircle2, 
  Sparkles,
  Store,
  CreditCard,
  Smartphone,
  Banknote,
  Package,
  BookOpen,
  LogIn,
  LogOut,
  User as UserIcon,
  Phone,
  LayoutDashboard
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Product, Order } from '../../types';
import toast from 'react-hot-toast';
import { PaymentGatewayModal } from './PaymentGatewayModal';
import { Footer } from '../common/Footer';

interface CustomerStorefrontProps {
  onOpenChat: () => void;
  onOpenReceipt: (order: Order) => void;
}

export const CustomerStorefront: React.FC<CustomerStorefrontProps> = ({
  onOpenChat,
  onOpenReceipt,
}) => {
  const {
    products,
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    placeOnlineOrder,
    orders,
    customers,
    settings,
    language,
    t,
    currentUser,
    setCurrentRole,
    openLoginModal,
    setIsProfileModalOpen,
    logout,
  } = useStore();

  const isBn = language === 'bn';

  const [activeTab, setActiveTab] = useState<'shop' | 'orders' | 'my_khata'>('shop');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Checkout Form State
  const [customerName, setCustomerName] = useState(currentUser ? currentUser.name : 'Farhana Akter');
  const [customerPhone, setCustomerPhone] = useState(currentUser ? currentUser.emailOrPhone : '01712334455');
  const [customerAddress, setCustomerAddress] = useState('House 14, Road 2, Dhanmondi, Dhaka');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash' | 'nagad' | 'card'>('bkash');

  useEffect(() => {
    if (currentUser) {
      setCustomerName(currentUser.name);
      setCustomerPhone(currentUser.emailOrPhone);
    }
  }, [currentUser]);

  // Digital Gateway Modal
  const [isGatewayOpen, setIsGatewayOpen] = useState(false);

  // Cart Calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.sellPrice * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const discount = cartSubtotal >= 1000 ? 50 : 0;
  const deliveryFee = settings.deliveryFee;
  const netTotal = cartSubtotal + deliveryFee - discount;

  const onlineProducts = useMemo(() => {
    return products.filter((p) => {
      const isAvailable = p.isOnlineAvailable !== false;
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        p.name.toLowerCase().includes(q) ||
        p.nameBn.includes(q) ||
        p.category.includes(q);
      return isAvailable && matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const categories = [
    { id: 'all', label: isBn ? 'সব পণ্য' : 'All Products' },
    { id: 'grocery', label: isBn ? 'চাল, ডাল ও তেল' : 'Grocery & Rice' },
    { id: 'beverage', label: isBn ? 'চা ও পানীয়' : 'Beverages' },
    { id: 'snacks', label: isBn ? 'বিস্কুট ও স্ন্যাকস' : 'Snacks' },
    { id: 'dairy', label: isBn ? 'দুগ্ধজাত ও ঘি' : 'Dairy' },
    { id: 'personal_care', label: isBn ? 'প্রসাধন ও সাবান' : 'Personal Care' },
    { id: 'spices', label: isBn ? 'মশলা' : 'Spices' },
    { id: 'household', label: isBn ? 'গৃহস্থালি' : 'Household' },
  ];

  const handleInitiateOrder = () => {
    if (cart.length === 0) return;
    if (!customerName || !customerPhone || !customerAddress) {
      toast.error(isBn ? 'অনুগ্রহ করে নাম, ফোন এবং সম্পূর্ণ ঠিকানা প্রদান করুন!' : 'Please provide name, phone and address!');
      return;
    }

    if (paymentMethod === 'cod') {
      const newOrder = placeOnlineOrder({
        customerName,
        customerPhone,
        customerAddress,
        deliveryNotes,
        paymentMethod: 'cod',
        isPaid: false,
      });
      setIsCheckoutOpen(false);
      setIsCartOpen(false);
      onOpenReceipt(newOrder);
      setActiveTab('orders');
    } else {
      // Open digital payment gateway
      setIsGatewayOpen(true);
    }
  };

  const handleGatewaySuccess = (trxId: string) => {
    setIsGatewayOpen(false);
    const newOrder = placeOnlineOrder({
      customerName,
      customerPhone,
      customerAddress,
      deliveryNotes,
      paymentMethod,
      transactionId: trxId,
      isPaid: true,
    });
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    onOpenReceipt(newOrder);
    setActiveTab('orders');
  };

  // Find customer for My Baki tab
  const activeCustomerRecord = customers.find((c) => c.phone === customerPhone);

  return (
    <div className="space-y-6">
      {/* Top Professional Header Bar */}
      <div className="bg-slate-900/90 text-slate-200 px-5 py-3.5 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4 border border-white/10 shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-emerald-500/30">
            {settings.storeName ? settings.storeName.charAt(0) : 'D'}
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
              <span>{isBn ? settings.storeNameBn || settings.storeName : settings.storeName}</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">Online Store</span>
            </h1>
            <p className="text-xs text-slate-400 flex items-center gap-2">
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <Phone className="w-3 h-3" /> 01826339098
              </span>
              <span>•</span>
              <span>{isBn ? '২৪/৭ হোম ডেলিভারি ও সাপোর্ট' : '24/7 Delivery & Support'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {currentUser ? (
            <div className="flex items-center gap-2 bg-slate-950/60 p-1.5 rounded-2xl border border-white/10">
              <button
                onClick={() => setIsProfileModalOpen(true)}
                title={isBn ? 'প্রোফাইল এডিট করুন' : 'Edit Profile'}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors"
              >
                <img
                  src={currentUser.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="w-5 h-5 rounded-full object-cover border border-emerald-400"
                />
                <span className="max-w-[100px] truncate">{currentUser.name}</span>
              </button>
              <button
                onClick={logout}
                className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 transition-all flex items-center gap-1 cursor-pointer"
                title={t.auth.logout}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => openLoginModal('customer')}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all border border-white/15 backdrop-blur-md flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <LogIn className="w-4 h-4 text-emerald-400" />
              <span>{t.auth.loginTab}</span>
            </button>
          )}

          <button
            onClick={() => setIsCartOpen(true)}
            className="relative px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-xs sm:text-sm hover:from-emerald-400 hover:to-teal-400 transition-all flex items-center gap-2 shadow-lg shadow-emerald-950/40 border border-emerald-400/30 cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4 text-white" />
            <span>{t.storefront.cart}</span>
            {cartItemCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-white text-emerald-900 text-xs font-bold font-mono">
                {cartItemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Customer View Tabs */}
      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('shop')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'shop'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md border border-emerald-400/30'
                : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>{isBn ? 'পণ্য ব্রাউজ করুন' : 'Shop Products'}</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'orders'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md border border-emerald-400/30'
                : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>{t.storefront.myOrders} ({orders.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('my_khata')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'my_khata'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md border border-emerald-400/30'
                : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>{isBn ? 'আমার বাকী হিসাব' : 'My Baki Khata'}</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Shop Catalog */}
      {activeTab === 'shop' && (
        <div className="space-y-6">
          {/* Search & Category Filter */}
          <div className="bg-slate-900/60 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-xl shadow-black/20 space-y-3">
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.storefront.search}
                className="w-full pl-11 pr-4 py-2.5 text-xs sm:text-sm border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white/[0.04] text-white placeholder-slate-500"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs border border-emerald-400/30'
                      : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-4">
            {onlineProducts.map((prod) => {
              const inCart = cart.find((i) => i.product.id === prod.id);
              const isOutOfStock = prod.stock <= 0;

              return (
                <div
                  key={prod.id}
                  className="bg-slate-900/60 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-white/10 shadow-xl shadow-black/20 p-2.5 sm:p-3.5 flex flex-col justify-between hover:border-emerald-500/40 transition-all group"
                >
                  <div>
                    <div className="relative aspect-square w-full rounded-xl sm:rounded-2xl overflow-hidden bg-slate-950/60 mb-2 sm:mb-3 border border-white/10">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {prod.stock <= prod.minStockAlert && !isOutOfStock && (
                        <span className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 px-1.5 sm:px-2 py-0.5 bg-amber-500/90 border border-amber-400/40 backdrop-blur-md text-white text-[8px] sm:text-[9px] font-bold rounded-md shadow-xs">
                          {isBn ? 'সীমিত স্টক' : 'Few left'}
                        </span>
                      )}
                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center text-rose-300 text-[10px] sm:text-xs font-bold">
                          {t.pos.outOfStock}
                        </div>
                      )}
                    </div>

                    <h4 className="font-bold text-xs sm:text-sm text-white line-clamp-2 leading-tight">
                      {isBn ? prod.nameBn || prod.name : prod.name}
                    </h4>
                    <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 sm:mt-1">
                      {isBn ? `প্রতি ${prod.unitBn || prod.unit}` : `per ${prod.unit}`}
                    </p>
                  </div>

                  <div className="mt-2.5 sm:mt-3 pt-2.5 sm:pt-3 border-t border-white/10 flex flex-wrap sm:flex-nowrap items-center justify-between gap-1.5">
                    <span className="text-sm sm:text-base font-black font-mono text-emerald-400 truncate">
                      ৳{prod.sellPrice}
                    </span>

                    {inCart ? (
                      <div className="flex items-center gap-0.5 sm:gap-1 bg-emerald-500/20 border border-emerald-500/30 rounded-xl p-0.5 shrink-0">
                        <button
                          onClick={() => updateCartQuantity(prod.id, inCart.quantity - 1)}
                          className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white shadow-2xs"
                        >
                          <Minus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        </button>
                        <span className="w-4 sm:w-5 text-center font-bold font-mono text-[11px] sm:text-xs text-emerald-300">
                          {inCart.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(prod.id, inCart.quantity + 1)}
                          className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white shadow-2xs"
                        >
                          <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(prod)}
                        disabled={isOutOfStock}
                        className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1 shrink-0 ${
                          isOutOfStock
                            ? 'bg-white/5 border border-white/10 text-slate-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-950/40 border border-emerald-400/30'
                        }`}
                      >
                        <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span>{t.storefront.addToCart}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: Customer Orders Tracker */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-xl shadow-black/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-white">{t.storefront.myOrders}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isBn ? 'আপনার অনলাইন অর্ডারের ডেলিভারি অগ্রগতি ও সফল অর্ডারের ইতিহাস' : 'Track your live grocery delivery status'}
                </p>
              </div>
            </div>

            {/* Active / Running Orders Section */}
            <div className="mt-6 space-y-4">
              <h4 className="font-bold text-xs uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>{isBn ? 'চলতি ডেলিভারি অর্ডারসমূহ' : 'Active Delivery Orders'}</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px]">
                  {orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled').length}
                </span>
              </h4>

              {orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled').length > 0 ? (
                orders
                  .filter((o) => o.status !== 'delivered' && o.status !== 'cancelled')
                  .map((ord) => (
                    <div key={ord.id} className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/[0.03] space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold font-mono text-sm text-white">{ord.orderNumber}</span>
                          <span className="text-xs text-slate-400 block">{new Date(ord.orderDate).toLocaleString()}</span>
                        </div>
                        <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-xs rounded-full uppercase">
                          {ord.status}
                        </span>
                      </div>

                      <div className="divide-y divide-white/10 text-xs">
                        {ord.items.map((item, idx) => (
                          <div key={idx} className="py-1 flex justify-between text-slate-300">
                            <span>{isBn ? item.productNameBn || item.productName : item.productName} ({item.quantity}x)</span>
                            <span className="font-mono font-semibold text-white">৳{item.total}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs font-bold text-slate-200">
                        <span>{isBn ? 'মোট প্রদেয়' : 'Total Payable'}: <strong className="text-emerald-400 font-mono">৳{ord.totalAmount}</strong> ({ord.paymentMethod.toUpperCase()})</span>
                        <button
                          onClick={() => onOpenReceipt(ord)}
                          className="text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                          {isBn ? 'রসিদ দেখুন →' : 'View Invoice →'}
                        </button>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="p-4 rounded-2xl border border-dashed border-white/10 text-center text-xs text-slate-400">
                  {isBn ? 'বর্তমানে কোনো রানিং অর্ডার নেই।' : 'No active running orders right now.'}
                </div>
              )}

              {/* Delivered / Completed Orders Section */}
              <div className="pt-6 border-t border-white/10 space-y-4">
                <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>{isBn ? 'সফল ও সম্পন্ন অর্ডারসমূহ (Delivered)' : 'Completed & Delivered Orders'}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px]">
                    {orders.filter((o) => o.status === 'delivered').length}
                  </span>
                </h4>

                {orders.filter((o) => o.status === 'delivered').length > 0 ? (
                  orders
                    .filter((o) => o.status === 'delivered')
                    .map((ord) => (
                      <div key={ord.id} className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.03] space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-bold font-mono text-sm text-white">{ord.orderNumber}</span>
                            <span className="text-xs text-slate-400 block">{new Date(ord.orderDate).toLocaleString()}</span>
                          </div>
                          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-xs rounded-full uppercase flex items-center gap-1">
                            <span>✓ {isBn ? 'সফল (Delivered)' : 'Delivered'}</span>
                          </span>
                        </div>

                        <div className="divide-y divide-white/10 text-xs">
                          {ord.items.map((item, idx) => (
                            <div key={idx} className="py-1 flex justify-between text-slate-300">
                              <span>{isBn ? item.productNameBn || item.productName : item.productName} ({item.quantity}x)</span>
                              <span className="font-mono font-semibold text-white">৳{item.total}</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs font-bold text-slate-200">
                          <span>{isBn ? 'পরিশোধিত' : 'Paid Total'}: <strong className="text-emerald-400 font-mono">৳{ord.totalAmount}</strong> ({ord.paymentMethod.toUpperCase()})</span>
                          <button
                            onClick={() => onOpenReceipt(ord)}
                            className="text-emerald-400 hover:text-emerald-300 transition-colors"
                          >
                            {isBn ? 'ইনভয়েস দেখুন →' : 'View Invoice →'}
                          </button>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="p-4 rounded-2xl border border-dashed border-white/10 text-center text-xs text-slate-500">
                    {isBn ? 'এখনো কোনো সম্পন্ন/সফল অর্ডার নেই।' : 'No completed orders yet.'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: My Baki Khata Check */}
      {activeTab === 'my_khata' && (
        <div className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-xl shadow-black/20 space-y-4">
          <div>
            <h3 className="font-bold text-base text-white">{isBn ? 'আপনার বাকীর হিসাব খাতা' : 'Your Baki Khata Account'}</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {isBn ? 'দোকানে আপনার বর্তমান বকেয়া ও জমার খতিয়ান' : 'Check your store credit balance and payment history'}
            </p>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="01XXXXXXXXX"
              className="px-3 py-2 text-xs font-mono border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white/[0.04] text-white w-64"
            />
          </div>

          {activeCustomerRecord ? (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
                  <span className="text-xs font-bold text-rose-400 block">{t.khata.currentDue}</span>
                  <span className="text-2xl font-black font-mono text-rose-400">৳{activeCustomerRecord.totalDue}</span>
                </div>
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                  <span className="text-xs font-bold text-emerald-400 block">{t.khata.totalPaid}</span>
                  <span className="text-2xl font-black font-mono text-emerald-400">৳{activeCustomerRecord.totalPaid}</span>
                </div>
              </div>
              <p className="text-xs text-slate-400">
                {isBn
                  ? 'বকেয়া পরিশোধ করতে চাইলে বিকাশে পেমেন্ট করে দোকানদারকে সরাসরি চ্যাটে মেসেজ দিন।'
                  : 'To clear your dues, you can pay via bKash/Nagad and notify the owner in Live Chat.'}
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-500">{isBn ? 'এই নাম্বারে কোনো বাকী খাতা পাওয়া যায়নি।' : 'No khata record found for this number.'}</p>
          )}
        </div>
      )}

      {/* Cart Drawer / Sidebar Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900/95 backdrop-blur-2xl h-full shadow-2xl border-l border-white/15 flex flex-col justify-between p-6 animate-in slide-in-from-right duration-200">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-base text-white">{t.storefront.cart}</h3>
                  <span className="text-xs font-mono font-bold text-slate-400">({cartItemCount})</span>
                </div>
                <button onClick={() => setIsCartOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors">
                  ✕
                </button>
              </div>

              {/* Free delivery bar */}
              <div className="my-3 bg-emerald-500/20 p-2.5 rounded-xl border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{t.storefront.freeDeliveryMsg}</span>
              </div>

              {/* Items List */}
              <div className="max-h-[50vh] overflow-y-auto divide-y divide-white/10 pr-1">
                {cart.length > 0 ? (
                  cart.map((item) => (
                    <div key={item.product.id} className="py-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-white truncate">
                            {isBn ? item.product.nameBn || item.product.name : item.product.name}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono">
                            ৳{item.product.sellPrice} × {item.quantity}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                          className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center font-bold font-mono text-xs text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                          className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-16 text-center text-slate-500 text-xs">
                    {t.pos.emptyCart}
                  </div>
                )}
              </div>
            </div>

            {/* Cart Footer Summary */}
            <div className="pt-4 border-t border-white/10 space-y-3">
              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span>{t.pos.subtotal}</span>
                  <span className="font-mono font-bold text-white">৳{cartSubtotal}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-rose-400 font-semibold">
                    <span>ছাড় (Special Discount)</span>
                    <span>-৳{discount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>ডেলিভারি চার্জ</span>
                  <span className="font-mono text-white">৳{deliveryFee}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-white pt-1 border-t border-white/10">
                  <span>{t.pos.netPayable}</span>
                  <span className="text-emerald-400 font-mono text-base">৳{netTotal}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsCartOpen(false);
                  setIsCheckoutOpen(true);
                }}
                disabled={cart.length === 0}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white font-bold text-xs sm:text-sm rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 border border-emerald-400/30"
              >
                <span>{t.storefront.checkout} (৳{netTotal})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-slate-900/95 backdrop-blur-2xl rounded-3xl border border-white/15 shadow-2xl shadow-black/50 p-6 overflow-hidden max-h-[90vh] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="font-bold text-base text-white">{t.storefront.checkout}</h3>
                <button onClick={() => setIsCheckoutOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors">✕</button>
              </div>

              <div className="mt-4 space-y-3.5 text-xs overflow-y-auto max-h-[60vh] pr-1">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">{t.storefront.yourName} *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white/[0.04] text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">{t.storefront.contactNumber} *</label>
                  <input
                    type="text"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 font-mono border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white/[0.04] text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">{t.storefront.deliveryAddress} *</label>
                  <textarea
                    rows={2}
                    required
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white/[0.04] text-white"
                  />
                </div>

                {/* Payment Selection */}
                <div>
                  <label className="block font-bold text-slate-300 mb-1.5">{t.storefront.paymentOption}</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cod')}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        paymentMethod === 'cod'
                          ? 'border-emerald-500/50 bg-emerald-500/20 ring-2 ring-emerald-500/30'
                          : 'border-white/10 bg-white/[0.03] hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold text-white">
                        <Banknote className="w-4 h-4 text-emerald-400" />
                        <span>ক্যাশ অন ডেলিভারি</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">পণ্য হাতে পেয়ে টাকা দিন</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('bkash')}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        paymentMethod === 'bkash'
                          ? 'border-pink-500/50 bg-pink-500/20 ring-2 ring-pink-500/30'
                          : 'border-white/10 bg-white/[0.03] hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold text-pink-300">
                        <Smartphone className="w-4 h-4 text-pink-400" />
                        <span>বিকাশ / ডিজিটাল</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">ইনস্ট্যান্ট অনলাইন গেটওয়ে</p>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
              <div className="text-xs">
                <span className="text-slate-400 block">মোট প্রদেয়:</span>
                <span className="text-base font-black font-mono text-emerald-400">৳{netTotal}</span>
              </div>
              <button
                onClick={handleInitiateOrder}
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm rounded-2xl transition-all shadow-lg shadow-emerald-950/40 border border-emerald-400/30 flex items-center gap-1.5"
              >
                <span>{t.storefront.placeOrder}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Gateway Modal Component */}
      <PaymentGatewayModal
        isOpen={isGatewayOpen}
        onClose={() => setIsGatewayOpen(false)}
        amount={netTotal}
        paymentMethod={paymentMethod === 'bkash' || paymentMethod === 'nagad' || paymentMethod === 'card' ? paymentMethod : 'bkash'}
        language={language}
        settings={settings}
        onSuccess={handleGatewaySuccess}
      />

      {/* Footer */}
      <Footer onOpenChat={onOpenChat} />
    </div>
  );
};
