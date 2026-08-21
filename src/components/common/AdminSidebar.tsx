import React from 'react';
import { 
  BarChart3, 
  ShoppingCart, 
  BookOpen, 
  Package, 
  ShoppingBag, 
  Layers, 
  Store, 
  Settings, 
  Globe, 
  UserCheck, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Wifi, 
  WifiOff, 
  ExternalLink,
  ShieldCheck,
  HelpCircle,
  X,
  LogIn,
  LogOut,
  UserPlus,
  User as UserIcon
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { UserRole } from '../../types';

interface SidebarNavItem {
  id: string;
  label: string;
  icon: any;
  roles: string[];
  description: string;
  badge?: number | null;
  badgeColor?: string;
}

interface AdminSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSettings: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenSettings,
  isCollapsed,
  setIsCollapsed,
  mobileOpen,
  setMobileOpen,
}) => {
  const {
    t,
    language,
    setLanguage,
    currentRole,
    setCurrentRole,
    currentUser,
    openLoginModal,
    openRegisterModal,
    setIsProfileModalOpen,
    logout,
    products,
    orders,
    cart,
    settings,
    isOnline,
    isSyncing,
  } = useStore();

  const isBn = language === 'bn';
  const pendingOrdersCount = orders.filter((o) => o.status === 'pending').length;
  const lowStockCount = products.filter((p) => p.stock <= p.minStockAlert).length;
  const cartItemCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  const mainNavItems: SidebarNavItem[] = [
    { 
      id: 'dashboard', 
      label: t.nav.dashboard, 
      icon: BarChart3, 
      roles: ['admin', 'staff'],
      description: isBn ? 'সার্বিক বিক্রয় ও ব্যবসায় চিত্র' : 'Overview & analytics'
    },
    { 
      id: 'pos', 
      label: t.nav.pos, 
      icon: ShoppingCart, 
      roles: ['admin', 'staff'],
      description: isBn ? 'কাউন্টার দ্রুত বিলিং ও ক্যাশ' : 'Fast billing checkout'
    },
    { 
      id: 'khata', 
      label: t.nav.khata, 
      icon: BookOpen, 
      roles: ['admin', 'staff'],
      description: isBn ? 'বাকি ও আদায়ের ডিজিটাল খাতা' : 'Customer ledger'
    },
  ];

  const managementNavItems: SidebarNavItem[] = [
    { 
      id: 'inventory', 
      label: t.nav.inventory, 
      icon: Package, 
      roles: ['admin', 'staff'],
      badge: lowStockCount > 0 ? lowStockCount : null,
      badgeColor: 'bg-amber-500 text-slate-950',
      description: isBn ? 'পণ্য তালিকা ও স্টক ব্যবস্থাপনা' : 'Stock & restock'
    },
    { 
      id: 'orders', 
      label: t.nav.orders, 
      icon: ShoppingBag, 
      roles: ['admin', 'staff'],
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : null,
      badgeColor: 'bg-rose-500 text-white animate-pulse',
      description: isBn ? 'অনলাইন ডেলিভারি অর্ডার' : 'Delivery queue'
    },
    { 
      id: 'reports', 
      label: t.nav.reports, 
      icon: Layers, 
      roles: ['admin'],
      description: isBn ? 'লাভ-ক্ষতি ও আর্থিক হিসাব' : 'P&L statements'
    },
    { 
      id: 'users', 
      label: 'Users & Staff', 
      icon: UserPlus, 
      roles: ['admin'],
      description: isBn ? 'অ্যাডমিন এবং স্টাফ ম্যানেজমেন্ট' : 'Manage users & roles'
    },
  ];

  const storefrontNavItems: SidebarNavItem[] = [
    { 
      id: 'storefront', 
      label: t.nav.onlineStore, 
      icon: Store, 
      roles: ['admin', 'staff', 'customer'],
      badge: cartItemCount > 0 ? cartItemCount : null,
      badgeColor: 'bg-emerald-500 text-slate-950',
      description: isBn ? 'ক্রেতাদের জন্য অনলাইন শপ' : 'Public e-store'
    }
  ];

  const filterByRole = (items: SidebarNavItem[]) => 
    items.filter((item) => item.roles.includes(currentRole));

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    if (mobileOpen) {
      setMobileOpen(false);
    }
  };

  const renderNavGroup = (title: string, items: SidebarNavItem[]) => {
    const visible = filterByRole(items);
    if (visible.length === 0) return null;

    return (
      <div className="space-y-1">
        {!isCollapsed && (
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {title}
          </div>
        )}
        {visible.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full group relative flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-950/50 border border-emerald-400/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.06] border border-transparent'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
              title={isCollapsed ? item.label : undefined}
            >
              <div className={`shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'}`}>
                <Icon className="w-5 h-5" />
              </div>

              {!isCollapsed && (
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="truncate">{item.label}</span>
                    {item.badge !== null && item.badge !== undefined && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className={`text-[10px] truncate ${isActive ? 'text-emerald-100/80' : 'text-slate-400'}`}>
                    {item.description}
                  </p>
                </div>
              )}

              {isCollapsed && item.badge !== null && item.badge !== undefined && (
                <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Left Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-slate-900/90 backdrop-blur-2xl border-r border-white/10 shadow-2xl transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64 sm:w-72'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-white/10 shrink-0">
          <div 
            onClick={() => handleNavClick('dashboard')}
            className="flex items-center gap-3 cursor-pointer overflow-hidden"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-emerald-500/20 border border-emerald-300/40 shrink-0">
              <Store className="w-5 h-5 text-slate-950" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-sm text-white tracking-tight truncate">
                    {isBn ? t.appName : 'DokanKhata'}
                  </span>
                  <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 text-[9px] font-black rounded border border-emerald-500/30">
                    PRO
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">
                  {isBn ? settings.storeNameBn || settings.storeName : settings.storeName}
                </p>
              </div>
            )}
          </div>

          {/* Desktop Collapse / Mobile Close Button */}
          <div className="flex items-center">
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Scrollable Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 custom-scrollbar">
          {renderNavGroup(isBn ? 'প্রধান মেনু' : 'Core Hub', mainNavItems)}
          {renderNavGroup(isBn ? 'ব্যবস্থাপনা' : 'Management', managementNavItems)}
          {renderNavGroup(isBn ? 'অনলাইন শপ' : 'Storefront', storefrontNavItems)}
        </div>

        {/* Bottom Status & Quick Controls */}
        <div className="p-3 border-t border-white/10 bg-slate-950/40 space-y-2 shrink-0">
          {/* User Account & Session Card */}
          {!isCollapsed ? (
            <div className="p-2.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
              {currentUser ? (
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt={currentUser.name}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-xl object-cover border border-emerald-500/40 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate leading-tight">
                        {currentUser.name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold border border-emerald-500/30">
                          {t.roles[currentRole]}
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={logout}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                      title={t.auth.logout}
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={() => openLoginModal()}
                    className="flex-1 py-1.5 px-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 border border-emerald-500/30 transition-all"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>{t.auth.loginTab}</span>
                  </button>
                  <button
                    onClick={() => openRegisterModal()}
                    className="py-1.5 px-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold border border-white/10 transition-all"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Status and Lang */}
              <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                  {isOnline ? t.status.online : t.status.offline}
                </span>

                <button
                  onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
                  className="px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-[10px] font-bold text-sky-300 transition-colors"
                >
                  {language === 'bn' ? 'English' : 'বাংলা'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={() => {
                  if (!currentUser) openLoginModal();
                  else setIsProfileModalOpen(true);
                }}
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold transition-colors border ${
                  currentUser 
                    ? 'border-emerald-500/40 hover:bg-white/5 cursor-pointer' 
                    : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/30'
                }`}
                title={currentUser ? (language === 'bn' ? 'প্রোফাইল এডিট' : 'Edit Profile') : t.auth.loginTab}
              >
                {currentUser ? (
                  <img
                    src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={currentUser.name}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-xl object-cover"
                  />
                ) : (
                  <UserIcon className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-sky-300 flex items-center justify-center text-xs font-bold transition-colors"
                title="Switch Language"
              >
                <Globe className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Quick Settings Button */}
          {currentRole === 'admin' && (
            <button
              onClick={onOpenSettings}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-colors ${
                isCollapsed ? 'justify-center px-0' : ''
              }`}
            >
              <Settings className="w-4 h-4 text-slate-400" />
              {!isCollapsed && <span>{t.nav.settings}</span>}
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
