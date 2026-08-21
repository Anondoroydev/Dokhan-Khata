import React, { useState, useEffect, useRef } from 'react';
import { 
  Store, 
  ShoppingCart, 
  BookOpen, 
  Package, 
  ShoppingBag, 
  BarChart3, 
  Settings, 
  Bell, 
  Globe, 
  UserCheck, 
  Wifi, 
  WifiOff, 
  MessageSquare, 
  Layers, 
  CheckCheck,
  Menu,
  X
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { UserRole } from '../../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenChat: () => void;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenChat,
  onOpenSettings,
}) => {
  const {
    language,
    setLanguage,
    t,
    currentRole,
    setCurrentRole,
    isOnline,
    isSyncing,
    notifications,
    markNotificationAsRead,
    clearAllNotifications,
    cart,
    orders,
    products,
    settings,
  } = useStore();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (roleRef.current && !roleRef.current.contains(event.target as Node)) {
        setShowRoleMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const isBn = language === 'bn';
  const unreadNotifs = notifications.filter((n) => !n.read);
  const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length;
  const lowStockCount = products.filter((p) => p.stock <= p.minStockAlert).length;
  const cartItemCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  const navItems = [
    { id: 'dashboard', label: t.nav.dashboard, icon: BarChart3, roles: ['admin', 'staff'] },
    { id: 'pos', label: t.nav.pos, icon: ShoppingCart, roles: ['admin', 'staff'] },
    { id: 'khata', label: t.nav.khata, icon: BookOpen, roles: ['admin', 'staff'] },
    { id: 'inventory', label: t.nav.inventory, icon: Package, roles: ['admin', 'staff'], badge: lowStockCount > 0 ? lowStockCount : null, badgeColor: 'bg-amber-500' },
    { id: 'orders', label: t.nav.orders, icon: ShoppingBag, roles: ['admin', 'staff'], badge: pendingOrdersCount > 0 ? pendingOrdersCount : null, badgeColor: 'bg-rose-500' },
    { id: 'reports', label: t.nav.reports, icon: Layers, roles: ['admin'] },
    { id: 'storefront', label: t.nav.onlineStore, icon: Store, roles: ['admin', 'staff', 'customer'], badge: cartItemCount > 0 ? cartItemCount : null, badgeColor: 'bg-emerald-500' },
  ];

  const visibleNavItems = navItems.filter((item) => item.roles.includes(currentRole));

  return (
    <header className="sticky top-0 z-40 bg-slate-900/70 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/20">
      {/* Top Notice Bar */}
      <div className="bg-slate-950/80 backdrop-blur-md text-slate-300 text-[11px] px-4 py-1.5 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-medium text-emerald-400">
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t.status.online}</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-amber-400">{t.status.offline}</span>
              </>
            )}
          </span>
          <span className="text-slate-700 hidden sm:inline">|</span>
          <span className="text-slate-400 hidden sm:inline">
            {isSyncing ? '🔄 ' + t.status.pendingSync : '✓ ' + t.status.synced}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Active Role Indicator / Switcher Pill */}
          <div className="relative" ref={roleRef}>
            <button
              onClick={() => {
                setShowRoleMenu(!showRoleMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 hover:bg-white/15 text-white font-medium transition-colors border border-white/15 text-[10px] backdrop-blur-md"
            >
              <UserCheck className="w-3 h-3 text-emerald-400" />
              <span>{t.roles[currentRole]}</span>
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-1.5 w-48 bg-slate-900/90 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/15 py-1.5 z-50 text-slate-200 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  {t.roles.switchRole}
                </div>
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
                <button
                  onClick={() => {
                    setCurrentRole('customer');
                    setActiveTab('storefront');
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-white/10 flex items-center justify-between rounded-lg transition-colors ${
                    currentRole === 'customer' ? 'font-bold text-emerald-400 bg-emerald-500/15' : ''
                  }`}
                >
                  <span>{t.roles.customer}</span>
                  {currentRole === 'customer' && <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />}
                </button>
              </div>
            )}
          </div>

          {/* Language Switcher */}
          <button
            onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
            className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full hover:bg-white/10 text-slate-300 transition-colors text-[10px] font-semibold border border-transparent hover:border-white/10"
            title="Switch Language"
          >
            <Globe className="w-3 h-3 text-sky-400" />
            <span>{language === 'bn' ? 'English' : 'বাংলা'}</span>
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Store Name */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab(currentRole === 'customer' ? 'storefront' : 'dashboard')}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 border border-white/20 group-hover:scale-105 transition-transform">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-base sm:text-lg text-white tracking-tight">
                  {isBn ? t.appName : 'DokanKhata'}
                </h1>
                <span className="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-500/20 text-emerald-300 rounded-md border border-emerald-500/30">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-[160px] sm:max-w-[260px]">
                {isBn ? settings.storeNameBn || settings.storeName : settings.storeName}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-white/[0.04] p-1 rounded-2xl border border-white/10 backdrop-blur-md">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-600/90 to-teal-600/90 text-white shadow-lg shadow-emerald-950/40 border border-emerald-400/30'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold text-white shadow-xs ${item.badgeColor || 'bg-rose-500'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Action Icons (Notifications, Live Chat, Settings, Mobile Menu) */}
          <div className="flex items-center gap-2">
            {/* Live Chat Button */}
            <button
              onClick={onOpenChat}
              className="relative p-2.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors border border-transparent hover:border-white/10"
            >
              <MessageSquare className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-400 rounded-full ring-2 ring-slate-900" />
            </button>

            {/* Notification Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowRoleMenu(false);
                }}
                className="relative p-2.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors border border-transparent hover:border-white/10"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifs.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-slate-900">
                    {unreadNotifs.length}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900/90 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/15 py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-4 py-2 border-b border-white/10 flex items-center justify-between">
                    <h4 className="font-bold text-xs text-white">
                      {isBn ? 'নোটিফিকেশন ও সতর্কতা' : 'Notifications & Alerts'}
                    </h4>
                    {unreadNotifs.length > 0 && (
                      <button
                        onClick={clearAllNotifications}
                        className="text-[11px] font-medium text-emerald-400 hover:underline"
                      >
                        {isBn ? 'সব পঠিত হিসেবে চিহ্নিত করুন' : 'Mark all as read'}
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
                          <span className="text-[9px] text-slate-500 mt-1 block">
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

            {/* Settings Modal Toggle */}
            {currentRole === 'admin' && (
              <button
                onClick={onOpenSettings}
                className="p-2.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors border border-transparent hover:border-white/10"
                title={t.nav.settings}
              >
                <Settings className="w-5 h-5" />
              </button>
            )}

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-300 hover:text-white rounded-xl hover:bg-white/10"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/10 bg-slate-900/95 backdrop-blur-xl px-4 pt-2 pb-4 space-y-1 animate-in slide-in-from-top-4">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white' : 'text-slate-300 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-white ${item.badgeColor || 'bg-rose-500'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
