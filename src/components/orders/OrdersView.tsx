import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle, 
  Truck, 
  PackageCheck, 
  XCircle, 
  Phone, 
  MapPin, 
  Receipt,
  Search,
  Filter
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Order, OrderStatus } from '../../types';

interface OrdersViewProps {
  onOpenReceipt: (order: Order) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({ onOpenReceipt }) => {
  const { orders, updateOrderStatus, language, t } = useStore();
  const isBn = language === 'bn';

  const [statusFilter, setStatusFilter] = useState<string>('active');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = orders.filter((order) => {
    let matchesStatus = true;
    if (statusFilter === 'active') {
      matchesStatus = order.status !== 'delivered' && order.status !== 'cancelled';
    } else if (statusFilter !== 'all') {
      matchesStatus = order.status === statusFilter;
    }
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(q) ||
      order.customerName.toLowerCase().includes(q) ||
      order.customerPhone.includes(q);
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return { label: t.orders.pending, bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30', icon: Clock };
      case 'confirmed':
        return { label: t.orders.confirmed, bg: 'bg-sky-500/20 text-sky-300 border-sky-500/30', icon: CheckCircle };
      case 'packing':
        return { label: t.orders.packing, bg: 'bg-purple-500/20 text-purple-300 border-purple-500/30', icon: PackageCheck };
      case 'out_for_delivery':
        return { label: t.orders.out_for_delivery, bg: 'bg-blue-500/20 text-blue-300 border-blue-500/30', icon: Truck };
      case 'delivered':
        return { label: t.orders.delivered, bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', icon: CheckCircle };
      case 'cancelled':
        return { label: t.orders.cancelled, bg: 'bg-rose-500/20 text-rose-300 border-rose-500/30', icon: XCircle };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 shadow-xl shadow-black/20 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-black text-lg text-white">{t.orders.title}</h2>
          <p className="text-xs text-slate-400 mt-0.5">{t.orders.subtitle}</p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isBn ? 'অর্ডার নং বা নাম দিয়ে খুঁজুন...' : 'Search order number or name...'}
            className="w-full pl-10 pr-4 py-2 text-xs border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 bg-white/[0.04] text-white placeholder-slate-500 backdrop-blur-md"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {[
          { id: 'active', label: isBn ? 'চলতি অর্ডার' : 'Active Orders', count: orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled').length },
          { id: 'delivered', label: isBn ? 'সফল / ডেলিভার্ড' : 'Delivered / Completed', count: orders.filter((o) => o.status === 'delivered').length },
          { id: 'pending', label: t.orders.pending, count: orders.filter((o) => o.status === 'pending').length },
          { id: 'confirmed', label: t.orders.confirmed, count: orders.filter((o) => o.status === 'confirmed').length },
          { id: 'packing', label: t.orders.packing, count: orders.filter((o) => o.status === 'packing').length },
          { id: 'out_for_delivery', label: t.orders.out_for_delivery, count: orders.filter((o) => o.status === 'out_for_delivery').length },
          { id: 'cancelled', label: isBn ? 'বাতিলকৃত' : 'Cancelled', count: orders.filter((o) => o.status === 'cancelled').length },
          { id: 'all', label: isBn ? 'সব ইতিহাস' : 'All Orders', count: orders.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`whitespace-nowrap px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border backdrop-blur-md ${
              statusFilter === tab.id
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400/40 shadow-lg shadow-emerald-950/40'
                : 'bg-slate-900/60 text-slate-300 border-white/10 hover:bg-white/10'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 text-[10px] rounded-full ${
                statusFilter === tab.id ? 'bg-white/20 text-white' : 'bg-white/10 text-slate-300'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Orders Cards Grid */}
      {filteredOrders.length === 0 ? (
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 p-12 text-center text-slate-400">
          <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="font-bold text-sm text-slate-300">
            {isBn ? 'এই ক্যাটাগরিতে কোনো অর্ডার পাওয়া যায়নি' : 'No orders found in this category'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {statusFilter === 'active' 
              ? (isBn ? 'সব চলতি অর্ডারের ডেলিভারি সম্পন্ন হয়েছে! "সফল / ডেলিভার্ড" ট্যাবে গিয়ে ডেলিভারিকৃত অর্ডার দেখতে পারেন।' : 'All active orders are delivered! Check "Delivered / Completed" tab.')
              : (isBn ? 'অন্য কোন ক্যাটাগরি বা ট্যাব নির্বাচন করুন' : 'Try selecting another tab')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredOrders.map((order) => {
          const badge = getStatusBadge(order.status);
          const Icon = badge.icon;

          return (
            <div
              key={order.id}
              className="bg-slate-900/70 backdrop-blur-2xl rounded-3xl border border-white/15 shadow-xl shadow-black/20 p-5 flex flex-col justify-between space-y-4 hover:border-white/25 transition-all"
            >
              {/* Order Top Bar */}
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div>
                    <span className="text-sm font-black font-mono text-white">
                      {order.orderNumber}
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      {new Date(order.orderDate).toLocaleString()}
                    </span>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold border ${badge.bg}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{badge.label}</span>
                  </span>
                </div>

                {/* Customer Contact & Address */}
                <div className="py-3 text-xs space-y-1">
                  <p className="font-bold text-white">{order.customerName}</p>
                  <p className="text-slate-300 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{order.customerPhone}</span>
                  </p>
                  <p className="text-slate-400 flex items-start gap-1">
                    <MapPin className="w-3 h-3 text-slate-500 shrink-0 mt-0.5" />
                    <span>{order.customerAddress}</span>
                  </p>
                </div>

                {/* Items Summary */}
                <div className="bg-white/[0.04] border border-white/5 rounded-2xl p-3 divide-y divide-white/5 text-xs">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="py-1.5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={item.image}
                          alt={item.productName}
                          referrerPolicy="no-referrer"
                          className="w-7 h-7 rounded-lg object-cover border border-white/10 shrink-0"
                        />
                        <span className="truncate text-slate-200 font-medium">
                          {isBn ? item.productNameBn || item.productName : item.productName}
                        </span>
                      </div>
                      <span className="font-mono text-slate-300 shrink-0">
                        {item.quantity} × ৳{item.unitPrice} = ৳{item.total}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Pricing and Payment */}
                <div className="mt-3 flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">{t.orders.payment}:</span>
                    <span className="uppercase px-2 py-0.5 rounded-md bg-white/10 text-slate-200 text-[10px] font-bold border border-white/10">
                      {order.paymentMethod}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${
                        order.paymentStatus === 'paid'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {order.paymentStatus === 'paid' ? 'PAID' : 'COD'}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-black font-mono text-emerald-400">
                      ৳{order.totalAmount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Update Dropdown & Invoice Button */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1">
                  <label className="text-[11px] font-bold text-slate-400 shrink-0">
                    {t.orders.statusLabel}:
                  </label>
                  <select
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                    className="w-full px-2 py-1.5 text-xs font-bold border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-slate-900 text-white"
                  >
                    <option value="pending" className="bg-slate-900 text-white">{t.orders.pending}</option>
                    <option value="confirmed" className="bg-slate-900 text-white">{t.orders.confirmed}</option>
                    <option value="packing" className="bg-slate-900 text-white">{t.orders.packing}</option>
                    <option value="out_for_delivery" className="bg-slate-900 text-white">{t.orders.out_for_delivery}</option>
                    <option value="delivered" className="bg-slate-900 text-white">{t.orders.delivered}</option>
                    <option value="cancelled" className="bg-slate-900 text-white">{t.orders.cancelled}</option>
                  </select>
                </div>

                <button
                  onClick={() => onOpenReceipt(order)}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 shrink-0 border border-white/10"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>{isBn ? 'ইনভয়েস' : 'Invoice'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
};
