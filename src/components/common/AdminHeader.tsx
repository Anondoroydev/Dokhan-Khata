import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, 
  Bell, 
  Settings, 
  MessageSquare, 
  ShoppingCart, 
  Globe, 
  UserCheck, 
  Wifi, 
  ChevronDown,
  Sparkles,
  Search,
  ExternalLink,
  Store,
  Layers,
  BookOpen,
  Package,
  ShoppingBag,
  BarChart3,
  LogIn,
  LogOut,
  UserPlus,
  User as UserIcon,
  ShieldCheck,
  Database,
  X,
  ArrowRight
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { UserRole } from '../../types';

interface AdminHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenChat: () => void;
  onOpenSettings: () => void;
  setMobileSidebarOpen: (open: boolean) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenChat,
  onOpenSettings,
  setMobileSidebarOpen,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
}) => {
  const {
    language,
    setLanguage,
    t,
    currentRole,
    setCurrentRole,
    currentUser,
    openLoginModal,
    openRegisterModal,
    setIsProfileModalOpen,
    logout,
    isOnline,
    notifications,
    markNotificationAsRead,
    clearAllNotifications,
    products,
    customers,
    settings,
    mongoStatus,
  } = useStore();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  // Quick Global Search in Header
  const [headerSearchQuery, setHeaderSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (roleRef.current && !roleRef.current.contains(event.target as Node)) {
        setShowRoleMenu(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const isBn = language === 'bn';
  const unreadNotifs = notifications.filter((n) => !n.read);

  // Search Results
  const searchResultsProducts = headerSearchQuery.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(headerSearchQuery.toLowerCase()) ||
          p.nameBn.includes(headerSearchQuery) ||
          (p.barcode && p.barcode.includes(headerSearchQuery))
      ).slice(0, 4)
    : [];

  const searchResultsCustomers = headerSearchQuery.trim()
    ? customers.filter(
        (c) =>
          c.name.toLowerCase().includes(headerSearchQuery.toLowerCase()) ||
          c.phone.includes(headerSearchQuery)
      ).slice(0, 3)
    : [];

  // Tab Details map
  const tabInfo: Record<string, { title: string; subtitle: string; icon: any }> = {
    dashboard: {
      title: t.nav.dashboard,
      subtitle: isBn ? 'দোকানের সার্বিক লেনদেন ও অ্যানালিটিক্স' : 'Daily sales, profits & operational pulse',
      icon: BarChart3,
    },
    pos: {
      title: t.nav.pos,
      subtitle: isBn ? 'কাউন্টার দ্রুত বিলিং ও ক্যাশ মেমো' : 'Fast point-of-sale checkout register',
      icon: ShoppingCart,
    },
    khata: {
      title: t.nav.khata,
      subtitle: isBn ? 'গ্রাহকদের বাকী ও জমার ডিজিটাল খাতা' : 'Digital credit ledger & payment records',
      icon: BookOpen,
    },
    inventory: {
      title: t.nav.inventory,
      subtitle: isBn ? 'পণ্যের স্টক ব্যবস্থাপনা ও অ্যালার্ট' : 'Stock catalog, restocking & low-stock alerts',
      icon: Package,
    },
    orders: {
      title: t.nav.orders,
      subtitle: isBn ? 'অনলাইন ক্রেতাদের অর্ডার ও ডেলিভারি' : 'E-commerce incoming orders & parcel dispatch',
      icon: ShoppingBag,
    },
    reports: {
      title: t.nav.reports,
      subtitle: isBn ? 'আর্থিক হিসাব, লাভ-ক্ষতি ও রিপোর্ট' : 'Profit & loss, sales analysis & tax reports',
      icon: Layers,
    },
    storefront: {
      title: t.nav.onlineStore,
      subtitle: isBn ? 'অনলাইন ডিজিটাল দোকানের লাইভ ভিউ' : 'Live customer catalog & shopping storefront',
      icon: Store,
    },
    users: {
      title: isBn ? 'ব্যবহারকারী ব্যবস্থাপনা' : 'User Management',
      subtitle: isBn ? 'স্টাফ ও পারমিশন কন্ট্রোল' : 'Manage system accounts and access roles',
      icon: UserIcon,
    }
  };

  const currentTab = tabInfo[activeTab] || tabInfo.dashboard;
  const TabIcon = currentTab.icon;

  return (
    <header className="sticky top-0 z-30 bg-slate-900/85 backdrop-blur-2xl border-b border-white/10 shadow-xl shadow-slate-950/40 transition-all">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-1.5 sm:gap-3">
          
          {/* Left: Mobile Menu Trigger + Shop Brand & Current View */}
          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-1.5 sm:p-2 text-slate-300 hover:text-white rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors shrink-0"
              title="Open Navigation Menu"
            >
              <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 text-emerald-400 hidden sm:flex items-center justify-center border border-emerald-500/30 shrink-0 shadow-inner">
                <TabIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-xs sm:text-base font-black text-white tracking-tight truncate max-w-[110px] xs:max-w-[160px] sm:max-w-none">
                    {currentTab.title}
                  </h1>
                  <span className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[10px] font-bold border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{isOnline ? (isBn ? 'লাইভ ক্লাউড' : 'Live Sync') : (isBn ? 'অফলাইন' : 'Offline')}</span>
                  </span>
                  <button 
                    onClick={onOpenSettings}
                    className="hidden xl:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 text-[10px] font-bold border border-teal-500/20 transition-colors cursor-pointer"
                    title={isBn ? 'MongoDB ডাটাবেস সেটআপ' : 'Configure MongoDB Database'}
                  >
                    <Database className="w-2.5 h-2.5 text-teal-400" />
                    <span>{mongoStatus.isConnected ? 'MongoDB Active' : 'MongoDB Config'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 truncate hidden xl:block">
                  {currentTab.subtitle}
                </p>
              </div>
            </div>
          </div>

          {/* Center: Global Header Search Bar (visible on lg and xl) */}
          <div className="hidden lg:block flex-1 max-w-[200px] xl:max-w-xs relative shrink-0" ref={searchRef}>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={headerSearchQuery}
                onChange={(e) => setHeaderSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                placeholder={isBn ? 'পণ্য বা গ্রাহক খুঁজুন...' : 'Search product or customer...'}
                className="w-full pl-9 pr-8 py-1.5 bg-slate-950/60 border border-white/10 focus:border-emerald-500/60 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-sans"
              />
              {headerSearchQuery && (
                <button
                  onClick={() => setHeaderSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Live Search Results Popup */}
            {isSearchFocused && headerSearchQuery.trim().length > 0 && (
              <div className="absolute left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/15 p-2 z-50 animate-in fade-in zoom-in-95">
                {searchResultsProducts.length === 0 && searchResultsCustomers.length === 0 ? (
                  <p className="p-3 text-xs text-slate-400 text-center">
                    {isBn ? 'কোনো ফলাফল পাওয়া যায়নি' : 'No matching items found'}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {searchResultsProducts.length > 0 && (
                      <div>
                        <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {isBn ? 'পণ্যসমূহ (Products)' : 'Products'}
                        </div>
                        <div className="space-y-1">
                          {searchResultsProducts.map((p) => (
                            <button
                              key={p.id}
                              onClick={() => {
                                setActiveTab('inventory');
                                setIsSearchFocused(false);
                                setHeaderSearchQuery('');
                              }}
                              className="w-full p-2 hover:bg-white/10 rounded-xl text-left flex items-center justify-between gap-2 transition-colors"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <img
                                  src={p.image}
                                  alt={p.name}
                                  className="w-7 h-7 rounded-lg object-cover bg-slate-950"
                                />
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-white truncate">
                                    {isBn ? p.nameBn || p.name : p.name}
                                  </p>
                                  <span className="text-[10px] text-slate-400">
                                    স্টক: {p.stock} {p.unit}
                                  </span>
                                </div>
                              </div>
                              <span className="text-xs font-bold text-emerald-400 font-mono">
                                ৳{p.sellPrice}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {searchResultsCustomers.length > 0 && (
                      <div>
                        <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {isBn ? 'গ্রাহকসমূহ (Customers)' : 'Customers'}
                        </div>
                        <div className="space-y-1">
                          {searchResultsCustomers.map((c) => (
                            <button
                              key={c.id}
                              onClick={() => {
                                setActiveTab('khata');
                                setIsSearchFocused(false);
                                setHeaderSearchQuery('');
                              }}
                              className="w-full p-2 hover:bg-white/10 rounded-xl text-left flex items-center justify-between gap-2 transition-colors"
                            >
                              <div>
                                <p className="text-xs font-bold text-white">{c.name}</p>
                                <span className="text-[10px] text-slate-400 font-mono">{c.phone}</span>
                              </div>
                              <span
                                className={`text-xs font-bold font-mono ${
                                  c.due > 0 ? 'text-rose-400' : 'text-emerald-400'
                                }`}
                              >
                                {c.due > 0 ? `বাকী: ৳${c.due}` : 'পরিশোধিত'}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Action Icons & Utility Controls */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            
            {/* Mobile Search Toggle Button (lg:hidden - shown on mobile & tablets < 1024px) */}
            <button
              onClick={() => setShowMobileSearch(true)}
              className="lg:hidden p-1.5 sm:p-2 text-slate-300 hover:text-white rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
              title="Search Products & Customers"
            >
              <Search className="w-4 h-4 text-emerald-400" />
            </button>

            {/* POS New Sale Button */}
            {activeTab !== 'pos' && currentRole !== 'customer' && (
              <button
                onClick={() => setActiveTab('pos')}
                className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black rounded-xl shadow-lg shadow-emerald-950/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">{t.dashboard.newSale}</span>
              </button>
            )}

            {/* Language Switcher Pill */}
            <button
              onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
              className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-bold border border-white/10 transition-colors cursor-pointer"
              title="Toggle Language"
            >
              <Globe className="w-3.5 h-3.5 text-sky-400" />
              <span className="text-[10px] font-bold">{language === 'bn' ? 'EN' : 'বাং'}</span>
            </button>

            {/* Role Switcher Pill (Admin / Staff only) */}
            {currentUser?.role !== 'customer' && (
              <div className="relative" ref={roleRef}>
                <button
                  onClick={() => {
                    setShowRoleMenu(!showRoleMenu);
                    setShowNotifications(false);
                    setShowUserMenu(false);
                  }}
                  className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-xs font-bold border border-emerald-500/30 transition-colors backdrop-blur-md cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="capitalize hidden xl:inline">{t.roles[currentRole]}</span>
                  <ChevronDown className="w-3 h-3 text-emerald-400" />
                </button>

                {showRoleMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-slate-900/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/15 py-1.5 z-50 text-slate-200 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {t.roles.switchRole}
                    </div>
                    {currentUser?.role === 'admin' && (
                      <button
                        onClick={() => {
                          setCurrentRole('admin');
                          setShowRoleMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs hover:bg-white/10 flex items-center justify-between rounded-lg transition-colors ${
                          currentRole === 'admin' ? 'font-bold text-emerald-400 bg-emerald-500/15' : ''
                        }`}
                      >
                        <span>{t.roles.admin}</span>
                        {currentRole === 'admin' && <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />}
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setCurrentRole('staff');
                        setShowRoleMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-white/10 flex items-center justify-between rounded-lg transition-colors ${
                        currentRole === 'staff' ? 'font-bold text-emerald-400 bg-emerald-500/15' : ''
                      }`}
                    >
                      <span>{t.roles.staff}</span>
                      {currentRole === 'staff' && <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Notification Bell Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowRoleMenu(false);
                  setShowUserMenu(false);
                }}
                className="relative p-1.5 sm:p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors border border-transparent hover:border-white/10 cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                {unreadNotifs.length > 0 && (
                  <span className="absolute top-1 right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-rose-500 text-white text-[8px] sm:text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-slate-900 animate-pulse">
                    {unreadNotifs.length}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/15 py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-4 py-2 border-b border-white/10 flex items-center justify-between">
                    <h4 className="font-bold text-xs text-white">
                      {isBn ? 'নোটিফিকেশন ও সতর্কতা' : 'Notifications & Alerts'}
                    </h4>
                    {unreadNotifs.length > 0 && (
                      <button
                        onClick={clearAllNotifications}
                        className="text-[11px] font-medium text-emerald-400 hover:underline"
                      >
                        {isBn ? 'সব পঠিত করুন' : 'Mark all read'}
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-white/5">
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markNotificationAsRead(n.id)}
                          className={`p-3 hover:bg-white/5 cursor-pointer transition-colors ${
                            !n.read ? 'bg-emerald-500/10' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-semibold text-white">
                              {isBn ? n.titleBn || n.title : n.title}
                            </p>
                            {!n.read && (
                              <span className="w-2 h-2 bg-emerald-400 rounded-full shrink-0 mt-1 shadow-xs shadow-emerald-400" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-300 mt-0.5">
                            {isBn ? n.messageBn || n.message : n.message}
                          </p>
                          <span className="text-[9px] text-slate-500 mt-1 block font-mono">
                            {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-xs text-slate-500">
                        {isBn ? 'কোনো নতুন নোটিফিকেশন নেই' : 'No notifications'}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Account Profile / Login Button */}
            <div className="relative" ref={userRef}>
              {currentUser ? (
                <button
                  onClick={() => {
                    setShowUserMenu(!showUserMenu);
                    setShowNotifications(false);
                    setShowRoleMenu(false);
                  }}
                  className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
                >
                  <img
                    src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={currentUser.name}
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 rounded-xl object-cover border border-emerald-400/40 bg-slate-950"
                  />
                  <div className="hidden xl:block text-left">
                    <p className="text-xs font-bold text-white leading-tight truncate max-w-[100px]">
                      {currentUser.name}
                    </p>
                    <span className="text-[10px] text-emerald-400 capitalize">
                      {t.roles[currentRole]}
                    </span>
                  </div>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>
              ) : (
                <button
                  onClick={() => openLoginModal()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-bold rounded-xl shadow-md shadow-emerald-950/40 transition-all cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{t.auth.loginTab}</span>
                </button>
              )}

              {/* User Dropdown Menu */}
              {showUserMenu && currentUser && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/15 py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-4 py-2.5 border-b border-white/10 flex items-center gap-3">
                    <img
                      src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt={currentUser.name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-2xl object-cover border border-emerald-400/40 bg-slate-950"
                    />
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-white truncate">
                        {currentUser.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-mono truncate">
                        {currentUser.emailOrPhone}
                      </p>
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold border border-emerald-500/30">
                        {t.roles[currentRole]}
                      </span>
                    </div>
                  </div>

                  <div className="p-1 space-y-0.5">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        setIsProfileModalOpen(true);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/10 flex items-center gap-2 rounded-xl transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-emerald-400" />
                      <span>{isBn ? 'প্রোফাইল ফাইল ও ছবি এড' : 'Edit Profile & Avatar'}</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        openLoginModal();
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/10 flex items-center gap-2 rounded-xl transition-colors"
                    >
                      <LogIn className="w-4 h-4 text-teal-400" />
                      <span>{isBn ? 'অন্য অ্যাকাউন্টে সুইচ' : 'Switch / Login Account'}</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        openRegisterModal();
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/10 flex items-center gap-2 rounded-xl transition-colors"
                    >
                      <UserPlus className="w-4 h-4 text-teal-400" />
                      <span>{isBn ? 'নতুন অ্যাকাউন্ট খুলুন' : 'Create New Account'}</span>
                    </button>
                    {currentRole === 'admin' && (
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          onOpenSettings();
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/10 flex items-center gap-2 rounded-xl transition-colors"
                      >
                        <Settings className="w-4 h-4 text-sky-400" />
                        <span>{t.nav.settings}</span>
                      </button>
                    )}
                  </div>

                  <div className="pt-1 mt-1 border-t border-white/10 px-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/15 flex items-center gap-2 rounded-xl transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-rose-400" />
                      <span>{t.auth.logout}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Mobile Search Overlay Modal */}
      {showMobileSearch && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xl flex flex-col p-4 animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Search className="w-4 h-4 text-emerald-400" />
              <span>{isBn ? 'পণ্য ও গ্রাহক খুঁজুন' : 'Search Store Catalog'}</span>
            </h3>
            <button
              onClick={() => setShowMobileSearch(false)}
              className="p-1.5 rounded-xl bg-white/10 text-slate-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="relative mb-4">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              autoFocus
              value={headerSearchQuery}
              onChange={(e) => setHeaderSearchQuery(e.target.value)}
              placeholder={isBn ? 'পণ্যের নাম, বারকোড বা গ্রাহকের নাম...' : 'Search by product, barcode, customer...'}
              className="w-full pl-10 pr-9 py-2.5 bg-slate-900 border border-emerald-500/50 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
            {headerSearchQuery && (
              <button
                onClick={() => setHeaderSearchQuery('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto space-y-3">
            {headerSearchQuery.trim().length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                {isBn ? 'টাইপ করে যেকোনো পণ্য বা গ্রাহক খুঁজুন' : 'Type to search products or customers'}
              </div>
            ) : searchResultsProducts.length === 0 && searchResultsCustomers.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                {isBn ? 'কোনো ফলাফল পাওয়া যায়নি' : 'No matching results found'}
              </div>
            ) : (
              <>
                {searchResultsProducts.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      {isBn ? 'পণ্যসমূহ' : 'Products'}
                    </h4>
                    <div className="space-y-2">
                      {searchResultsProducts.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => {
                            setActiveTab('inventory');
                            setShowMobileSearch(false);
                            setHeaderSearchQuery('');
                          }}
                          className="w-full p-3 bg-slate-900/90 border border-white/10 rounded-2xl text-left flex items-center justify-between gap-3 active:bg-slate-800 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-10 h-10 rounded-xl object-cover bg-slate-950 shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-white truncate">
                                {isBn ? p.nameBn || p.name : p.name}
                              </p>
                              <span className="text-[11px] text-slate-400 font-mono">
                                স্টক: {p.stock} {p.unit}
                              </span>
                            </div>
                          </div>
                          <span className="text-sm font-black text-emerald-400 font-mono shrink-0">
                            ৳{p.sellPrice}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {searchResultsCustomers.length > 0 && (
                  <div className="pt-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      {isBn ? 'গ্রাহকসমূহ' : 'Customers'}
                    </h4>
                    <div className="space-y-2">
                      {searchResultsCustomers.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => {
                            setActiveTab('khata');
                            setShowMobileSearch(false);
                            setHeaderSearchQuery('');
                          }}
                          className="w-full p-3 bg-slate-900/90 border border-white/10 rounded-2xl text-left flex items-center justify-between gap-3 active:bg-slate-800 transition-colors"
                        >
                          <div>
                            <p className="text-xs font-bold text-white">{c.name}</p>
                            <span className="text-[11px] text-slate-400 font-mono">{c.phone}</span>
                          </div>
                          <span
                            className={`text-xs font-bold font-mono ${
                              c.due > 0 ? 'text-rose-400' : 'text-emerald-400'
                            }`}
                          >
                            {c.due > 0 ? `বাকী: ৳${c.due}` : 'পরিশোধিত'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
