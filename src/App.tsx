import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { AdminSidebar } from './components/common/AdminSidebar';
import { AdminHeader } from './components/common/AdminHeader';
import { DashboardView } from './components/dashboard/DashboardView';
import { POSView } from './components/pos/POSView';
import { KhataView } from './components/khata/KhataView';
import { InventoryView } from './components/inventory/InventoryView';
import { OrdersView } from './components/orders/OrdersView';
import { ReportsView } from './components/reports/ReportsView';
import { CustomerStorefront } from './components/storefront/CustomerStorefront';
import { ReceiptModal } from './components/common/ReceiptModal';
import { LiveChatModal } from './components/chat/LiveChatModal';
import { SettingsModal } from './components/settings/SettingsModal';
import { AddCustomerModal } from './components/khata/AddCustomerModal';
import { AuthModal } from './components/auth/AuthModal';
import { LoginPage } from './components/auth/LoginPage';
import { ProfileModal } from './components/auth/ProfileModal';
import { UserManagement } from './components/users/UserManagement';
import { Footer } from './components/common/Footer';
import { Transaction, Order } from './types';
import { MessageSquare, ArrowLeft, Store } from 'lucide-react';

function AppContent() {
  const { 
    currentRole, 
    settings, 
    language, 
    t, 
    isAuthModalOpen, 
    setIsAuthModalOpen,
    isProfileModalOpen,
    setIsProfileModalOpen
  } = useStore();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Receipt Modal State
  const [activeReceiptTxn, setActiveReceiptTxn] = useState<Transaction | null>(null);
  const [activeReceiptOrder, setActiveReceiptOrder] = useState<Order | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Other Modals
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);

  const handleOpenReceiptTxn = (txn: Transaction) => {
    setActiveReceiptTxn(txn);
    setActiveReceiptOrder(null);
    setIsReceiptOpen(true);
  };

  const handleOpenReceiptOrder = (order: Order) => {
    setActiveReceiptOrder(order);
    setActiveReceiptTxn(null);
    setIsReceiptOpen(true);
  };

  const handleOpenAddBaki = () => {
    setActiveTab('khata');
  };

  const isBn = language === 'bn';

  // Strict Role Guard: If user is customer, force activeTab to storefront or login
  React.useEffect(() => {
    if (currentRole === 'customer' && activeTab !== 'storefront' && activeTab !== 'login') {
      setActiveTab('storefront');
    }
  }, [currentRole, activeTab]);

  if (currentRole === 'customer' && activeTab !== 'login') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col antialiased relative">
        <CustomerStorefront
          onOpenChat={() => setIsChatOpen(true)}
          onOpenReceipt={handleOpenReceiptOrder}
        />

        {/* Floating Fast Chat Button */}
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-emerald-500/90 to-teal-600/90 text-white p-3.5 sm:px-4 sm:py-3 rounded-full shadow-2xl shadow-black/40 backdrop-blur-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 border border-white/25 cursor-pointer"
          title={t.chat.title}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-xs font-bold hidden sm:inline">{t.chat.title}</span>
        </button>

        {/* Global Modals */}
        <ReceiptModal
          isOpen={isReceiptOpen}
          onClose={() => setIsReceiptOpen(false)}
          transaction={activeReceiptTxn}
          order={activeReceiptOrder}
          settings={settings}
          language={language}
        />

        <LiveChatModal
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
        />

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/80 text-slate-100 font-sans flex antialiased selection:bg-emerald-500/30 selection:text-emerald-200 relative overflow-x-hidden">
      {/* Ambient background light orbs for Frosted Glass refraction */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
      </div>

      {/* Left Sidebar for Admin & Staff */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* Main Content Area (offset by sidebar width on desktop) */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64 sm:lg:pl-72'
        }`}
      >
        {/* Top Header Navbar */}
        <AdminHeader
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenChat={() => setIsChatOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          setMobileSidebarOpen={setMobileSidebarOpen}
          isSidebarCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
        />

        {/* Storefront Floating Notice Bar when viewing Storefront in Admin view */}
        {activeTab === 'storefront' && currentRole !== 'customer' && (
          <div className="bg-emerald-950/80 border-b border-emerald-500/20 px-4 sm:px-6 py-2.5 flex items-center justify-between backdrop-blur-md z-20">
            <div className="flex items-center gap-2 text-xs text-emerald-300">
              <Store className="w-4 h-4 text-emerald-400" />
              <span className="font-bold">
                {isBn ? 'অনলাইন স্টোর প্রিভিউ মোড চালু রয়েছে' : 'Customer Storefront Live Preview'}
              </span>
            </div>
            <button
              onClick={() => setActiveTab('dashboard')}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 text-xs font-bold rounded-lg border border-emerald-500/30 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isBn ? 'অ্যাডমিন ড্যাশবোর্ডে ফিরুন' : 'Back to Admin'}</span>
            </button>
          </div>
        )}

        {/* Main Content Render */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-4 sm:py-6 relative z-10 min-w-0">
          {activeTab === 'dashboard' && (
            <DashboardView
              setActiveTab={setActiveTab}
              onOpenReceipt={handleOpenReceiptTxn}
              onOpenAddProduct={() => {
                setActiveTab('inventory');
                setIsAddProductOpen(true);
              }}
              onOpenAddBaki={handleOpenAddBaki}
            />
          )}

          {activeTab === 'pos' && (
            <POSView
              onOpenReceipt={handleOpenReceiptTxn}
              onOpenAddCustomer={() => setIsAddCustomerOpen(true)}
            />
          )}

          {activeTab === 'khata' && (
            <KhataView
              onOpenReceipt={handleOpenReceiptTxn}
              onOpenAddCustomer={() => setIsAddCustomerOpen(true)}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryView
              isAddModalOpen={isAddProductOpen}
              setIsAddModalOpen={setIsAddProductOpen}
            />
          )}

          {activeTab === 'orders' && (
            <OrdersView
              onOpenReceipt={handleOpenReceiptOrder}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView />
          )}

          {activeTab === 'users' && (
            <UserManagement />
          )}

          {activeTab === 'storefront' && (
            <CustomerStorefront
              onOpenChat={() => setIsChatOpen(true)}
              onOpenReceipt={handleOpenReceiptOrder}
            />
          )}

          {activeTab === 'login' && (
            <div className="py-2">
              <LoginPage
                onSuccess={() => setActiveTab(currentRole === 'customer' ? 'storefront' : 'dashboard')}
                onContinueAsGuest={() => setActiveTab('storefront')}
              />
            </div>
          )}
        </main>

        {/* Global Footer (For Admin / Staff views) */}
        {activeTab !== 'storefront' && (
          <Footer setActiveTab={setActiveTab} onOpenChat={() => setIsChatOpen(true)} />
        )}
      </div>

      {/* Floating Fast Chat Button (Available globally on bottom right) */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-full shadow-2xl shadow-emerald-950/80 backdrop-blur-xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center border border-white/30 cursor-pointer"
        title={t.chat.title}
      >
        <MessageSquare className="w-5 h-5 text-white" />
        <span className="absolute top-0 right-0 w-3 h-3 bg-emerald-400 rounded-full ring-2 ring-slate-900 animate-pulse" />
      </button>

      {/* Global Modals */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        transaction={activeReceiptTxn}
        order={activeReceiptOrder}
        settings={settings}
        language={language}
      />

      <LiveChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <AddCustomerModal
        isOpen={isAddCustomerOpen}
        onClose={() => setIsAddCustomerOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
}

import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <StoreProvider>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }
        }} 
      />
      <AppContent />
    </StoreProvider>
  );
}
