import React, { useState, useMemo } from 'react';
import { 
  Users, 
  BookOpen, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search, 
  Plus, 
  Phone, 
  MapPin, 
  Send, 
  Check, 
  Copy, 
  Clock, 
  X, 
  Receipt,
  FileText,
  AlertCircle,
  MessageCircle,
  Trash2
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Customer, Transaction } from '../../types';
import Swal from 'sweetalert2';

interface KhataViewProps {
  onOpenReceipt: (txn: Transaction) => void;
  onOpenAddCustomer: () => void;
}

export const KhataView: React.FC<KhataViewProps> = ({ onOpenReceipt, onOpenAddCustomer }) => {
  const {
    customers,
    transactions,
    addKhataTransaction,
    deleteCustomer,
    clearAllCustomers,
    settings,
    language,
    t,
  } = useStore();

  const isBn = language === 'bn';

  const [searchQuery, setSearchQuery] = useState('');
  const [filterDueOnly, setFilterDueOnly] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

  // Quick transaction modal state
  const [txnModalOpen, setTxnModalOpen] = useState(false);
  const [txnType, setTxnType] = useState<'due_sale' | 'payment_received'>('due_sale');
  const [txnTargetCustomer, setTxnTargetCustomer] = useState<Customer | null>(null);
  const [txnAmount, setTxnAmount] = useState('');
  const [txnNote, setTxnNote] = useState('');
  const [txnPaymentMethod, setTxnPaymentMethod] = useState<'cash' | 'bkash' | 'nagad'>('cash');

  // Reminder copied notification toast
  const [copiedReminderId, setCopiedReminderId] = useState<string | null>(null);

  // Calculated Metrics
  const totalMarketDue = customers.reduce((sum, c) => sum + c.totalDue, 0);
  const totalPaidAllTime = customers.reduce((sum, c) => sum + c.totalPaid, 0);
  const customersWithDueCount = customers.filter((c) => c.totalDue > 0).length;

  // Filtered customer list
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery);
      const matchesDue = filterDueOnly ? c.totalDue > 0 : true;
      return matchesSearch && matchesDue;
    });
  }, [customers, searchQuery, filterDueOnly]);

  // Customer specific transactions for timeline
  const activeCustomerTxns = useMemo(() => {
    if (!selectedCustomer) return [];
    return transactions.filter((t) => t.customerId === selectedCustomer.id);
  }, [transactions, selectedCustomer]);

  const handleOpenTxnModal = (customer: Customer, type: 'due_sale' | 'payment_received') => {
    setTxnTargetCustomer(customer);
    setTxnType(type);
    setTxnAmount('');
    setTxnNote('');
    setTxnModalOpen(true);
  };

  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txnTargetCustomer || !txnAmount) return;

    const amountNum = parseFloat(txnAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    const newTxn = addKhataTransaction(
      txnTargetCustomer.id,
      txnType,
      amountNum,
      txnNote,
      txnType === 'due_sale' ? 'due' : txnPaymentMethod
    );

    setTxnModalOpen(false);
    onOpenReceipt(newTxn);

    // Refresh selected customer state
    const updated = customers.find((c) => c.id === txnTargetCustomer.id);
    if (updated) setSelectedCustomer(updated);
  };

  const handleCopyReminder = (customer: Customer) => {
    const template = t.khata.reminderTemplate
      .replace('{name}', customer.name)
      .replace('{storeName}', isBn ? settings.storeNameBn || settings.storeName : settings.storeName)
      .replace('{amount}', customer.totalDue.toString());

    navigator.clipboard.writeText(template);
    setCopiedReminderId(customer.id);
    setTimeout(() => setCopiedReminderId(null), 2500);
  };

  const handleWhatsAppReminder = (customer: Customer) => {
    const template = t.khata.reminderTemplate
      .replace('{name}', customer.name)
      .replace('{storeName}', isBn ? settings.storeNameBn || settings.storeName : settings.storeName)
      .replace('{amount}', customer.totalDue.toString());

    let phone = customer.phone.replace(/[^0-9]/g, '');
    if (!phone.startsWith('88')) {
      phone = '88' + (phone.startsWith('0') ? phone : '0' + phone);
    }

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(template)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Total Market Due */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-rose-950/80 via-rose-900/60 to-slate-900/90 rounded-3xl p-6 text-white shadow-xl shadow-rose-950/40 border border-white/15 backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-300 uppercase tracking-wider">
                {t.khata.totalMarketDue}
              </span>
              <BookOpen className="w-5 h-5 text-rose-300" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-black font-mono mt-3 text-white">
              ৳{totalMarketDue.toLocaleString()}
            </h3>
          </div>
          <p className="text-[11px] text-rose-300 mt-2">
            {isBn ? `${customersWithDueCount} জন গ্রাহকের কাছে মোট বকেয়া আছে` : `Outstanding from ${customersWithDueCount} customers`}
          </p>
        </div>

        <div className="bg-slate-900/60 rounded-3xl p-6 border border-white/10 shadow-xl shadow-black/20 backdrop-blur-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {t.khata.totalCustomers}
            </span>
            <Users className="w-5 h-5 text-emerald-400" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-black font-mono mt-3 text-white">
            {customers.length}
          </h3>
          <p className="text-[11px] text-slate-400 mt-2">
            {isBn ? 'ডিজিটাল খাতায় নিবন্ধিত গ্রাহক' : 'Registered Khata accounts'}
          </p>
        </div>

        <div className="bg-slate-900/60 rounded-3xl p-6 border border-white/10 shadow-xl shadow-black/20 backdrop-blur-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {isBn ? 'মোট আদায়কৃত টাকা' : 'Total Collection'}
            </span>
            <ArrowDownLeft className="w-5 h-5 text-sky-400" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-black font-mono mt-3 text-emerald-400">
            ৳{totalPaidAllTime.toLocaleString()}
          </h3>
          <button
            onClick={onOpenAddCustomer}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-950/40 border border-white/10 w-fit mt-2"
          >
            <Plus className="w-4 h-4" />
            <span>{t.khata.addCustomer}</span>
          </button>
        </div>
      </div>

      {/* Main Customers List & Ledger Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Customer List Column (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Search & Filter */}
          <div className="bg-slate-900/60 backdrop-blur-xl p-4 rounded-3xl border border-white/10 shadow-xl shadow-black/20 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.khata.searchCustomer}
                className="w-full pl-10 pr-4 py-2 text-xs border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 bg-white/[0.04] text-white placeholder-slate-500 backdrop-blur-md"
              />
            </div>

            <div className="flex items-center justify-between gap-2 text-xs">
              <button
                onClick={() => setFilterDueOnly(false)}
                className={`flex-1 py-1.5 rounded-xl font-bold transition-all border ${
                  !filterDueOnly ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400/30 shadow-md shadow-emerald-950/40' : 'bg-white/[0.04] text-slate-300 border-white/10 hover:bg-white/10'
                }`}
              >
                {t.khata.allCustomers} ({customers.length})
              </button>
              <button
                onClick={() => setFilterDueOnly(true)}
                className={`flex-1 py-1.5 rounded-xl font-bold transition-all border ${
                  filterDueOnly ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white border-rose-400/30 shadow-md shadow-rose-950/40' : 'bg-white/[0.04] text-slate-300 border-white/10 hover:bg-white/10'
                }`}
              >
                {t.khata.onlyDues} ({customersWithDueCount})
              </button>
            </div>
          </div>

          {/* Customer Cards List */}
          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {filteredCustomers.map((cust) => {
              const isSelected = selectedCustomer?.id === cust.id;
              const hasDue = cust.totalDue > 0;

              return (
                <div
                  key={cust.id}
                  onClick={() => {
                    setSelectedCustomer(cust);
                    if (window.innerWidth < 1024) {
                      setTimeout(() => {
                        document.getElementById('khata-ledger-section')?.scrollIntoView({ behavior: 'smooth' });
                      }, 50);
                    }
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer backdrop-blur-xl ${
                    isSelected
                      ? 'bg-slate-900/90 border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-950/40'
                      : 'bg-slate-900/60 border-white/10 hover:border-white/20 hover:bg-white/[0.06] shadow-md shadow-black/10'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-white/10 text-white font-bold flex items-center justify-center text-sm border border-white/15">
                        {cust.name.slice(0, 1)}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-white">{cust.name}</h4>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-500" />
                          <span>{cust.phone}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-medium block">
                        {t.khata.currentDue}
                      </span>
                      <span
                        className={`text-sm font-extrabold font-mono ${
                          hasDue ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        ৳{cust.totalDue.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Action row */}
                  <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenTxnModal(cust, 'due_sale');
                        }}
                        className="px-2.5 py-1 text-[10px] font-bold text-rose-300 bg-rose-500/20 hover:bg-rose-500/30 rounded-lg transition-colors border border-rose-500/30"
                      >
                        + {t.khata.gaveCredit}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenTxnModal(cust, 'payment_received');
                        }}
                        className="px-2.5 py-1 text-[10px] font-bold text-emerald-300 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-lg transition-colors border border-emerald-500/30"
                      >
                        - {t.khata.receivedMoney}
                      </button>
                    </div>

                    {hasDue && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyReminder(cust);
                          }}
                          className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-white/10 rounded-lg transition-colors"
                          title="Copy SMS reminder"
                        >
                          {copiedReminderId === cust.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleWhatsAppReminder(cust);
                          }}
                          className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-white/10 rounded-lg transition-colors"
                          title="Send WhatsApp Reminder"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                        </button>
                      </div>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCustomerToDelete(cust);
                      }}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      title={isBn ? 'গ্রাহক অ্যাকাউন্ট মুছুন' : 'Delete Customer'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Customer Ledger Statement Detail (7 cols on lg) */}
        <div 
          id="khata-ledger-section"
          className="lg:col-span-7 bg-slate-900/70 backdrop-blur-2xl rounded-3xl border border-white/15 shadow-2xl shadow-black/40 p-5 min-h-[500px] sm:min-h-[600px] flex flex-col justify-between"
        >
          {selectedCustomer ? (
            <div className="space-y-4">
              {/* Customer Header Details */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-300 font-black text-lg flex items-center justify-center border border-emerald-500/30">
                    {selectedCustomer.name.slice(0, 1)}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">{selectedCustomer.name}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>📞 {selectedCustomer.phone}</span>
                      <span>📍 {selectedCustomer.address}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenTxnModal(selectedCustomer, 'due_sale')}
                    className="px-3 py-2 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-950/40 border border-white/10"
                  >
                    + {t.khata.gaveCredit}
                  </button>
                  <button
                    onClick={() => handleOpenTxnModal(selectedCustomer, 'payment_received')}
                    className="px-3 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-950/40 border border-white/10"
                  >
                    - {t.khata.receivedMoney}
                  </button>
                  <button
                    onClick={() => setCustomerToDelete(selectedCustomer)}
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl border border-white/10 transition-colors"
                    title={isBn ? 'গ্রাহক খাতা মুছে ফেলুন' : 'Delete Account'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Customer Financial Stats Row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-rose-500/10 p-3 rounded-2xl border border-rose-500/20 backdrop-blur-md">
                  <span className="text-[10px] font-bold text-rose-300 uppercase tracking-wider block">
                    {t.khata.currentDue}
                  </span>
                  <span className="text-base font-black font-mono text-rose-400">
                    ৳{selectedCustomer.totalDue.toLocaleString()}
                  </span>
                </div>
                <div className="bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20 backdrop-blur-md">
                  <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block">
                    {t.khata.totalPaid}
                  </span>
                  <span className="text-base font-black font-mono text-emerald-400">
                    ৳{selectedCustomer.totalPaid.toLocaleString()}
                  </span>
                </div>
                <div className="bg-white/[0.04] p-3 rounded-2xl border border-white/10 backdrop-blur-md">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {t.khata.creditLimit}
                  </span>
                  <span className="text-base font-black font-mono text-slate-200">
                    ৳{selectedCustomer.creditLimit.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Reminder SMS Action Bar if due */}
              {selectedCustomer.totalDue > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-3 flex items-center justify-between gap-3 backdrop-blur-xl">
                  <div className="text-xs text-amber-200">
                    <p className="font-bold text-amber-300">{t.khata.sendReminder}</p>
                    <p className="text-[11px] text-amber-200/70">
                      {isBn ? 'গ্রাহককে বকেয়া পরিশোধের তাগিদ মেসেজ পাঠান' : 'Send friendly payment notification'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyReminder(selectedCustomer)}
                      className="px-3 py-1.5 bg-white/10 border border-white/20 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-md"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedReminderId === selectedCustomer.id ? 'কপি হয়েছে!' : 'SMS কপি'}</span>
                    </button>
                    <button
                      onClick={() => handleWhatsAppReminder(selectedCustomer)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-md shadow-emerald-950/40"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Ledger Statement Transactions Timeline */}
              <div>
                <h4 className="font-bold text-xs text-white mb-2">
                  {t.khata.customerDetails}
                </h4>

                <div className="max-h-72 overflow-y-auto divide-y divide-white/5 border border-white/10 rounded-2xl p-2 bg-white/[0.02]">
                  {activeCustomerTxns.length > 0 ? (
                    activeCustomerTxns.map((txn) => {
                      const isDue = txn.type === 'due_sale';
                      return (
                        <div key={txn.id} className="py-2.5 px-2 flex items-center justify-between gap-3 hover:bg-white/[0.03] rounded-xl transition-colors">
                          <div className="flex items-start gap-2.5">
                            <div
                              className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border ${
                                isDue ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              }`}
                            >
                              {isDue ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-white">
                                {isDue ? (isBn ? 'বাকী পণ্য নিয়েছেন' : 'Due Purchase') : (isBn ? 'টাকা জমা দিয়েছেন' : 'Payment Cleared')}
                              </p>
                              <p className="text-[11px] text-slate-400">
                                {txn.note || (isBn ? 'খাতা এন্ট্রি' : 'Ledger entry')}
                              </p>
                              <span className="text-[10px] text-slate-500 font-mono">
                                {new Date(txn.date).toLocaleString()}
                              </span>
                            </div>
                          </div>

                          <div className="text-right flex items-center gap-2">
                            <span
                              className={`text-xs sm:text-sm font-black font-mono ${
                                isDue ? 'text-rose-400' : 'text-emerald-400'
                              }`}
                            >
                              {isDue ? '+' : '-'}৳{txn.amount.toLocaleString()}
                            </span>
                            <button
                              onClick={() => onOpenReceipt(txn)}
                              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                              title="Print Slip"
                            >
                              <Receipt className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-12 text-center text-slate-500 text-xs">
                      {t.khata.noTransactions}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-24 text-center text-slate-500 space-y-3">
              <BookOpen className="w-12 h-12 mx-auto text-slate-600 stroke-1" />
              <h4 className="font-bold text-sm text-slate-300">
                {isBn ? 'কোনো গ্রাহক নির্বাচন করা হয়নি' : 'No Customer Selected'}
              </h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                {isBn ? 'বাম পাশের তালিকা থেকে যেকোনো গ্রাহকে ক্লিক করে হিসাব বিবরণী দেখুন' : 'Select a customer from the left list to view ledger statement'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Add Baki / Payment Modal */}
      {txnModalOpen && txnTargetCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-sm bg-slate-900/90 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold border ${
                    txnType === 'due_sale' ? 'bg-rose-600 border-rose-400' : 'bg-emerald-600 border-emerald-400'
                  }`}
                >
                  {txnType === 'due_sale' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">
                    {txnType === 'due_sale' ? t.khata.gaveCredit : t.khata.receivedMoney}
                  </h3>
                  <p className="text-[11px] text-slate-400">{txnTargetCustomer.name}</p>
                </div>
              </div>
              <button onClick={() => setTxnModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {t.khata.enterAmount} *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-sm font-bold text-slate-400">৳</span>
                  <input
                    type="number"
                    min="1"
                    required
                    value={txnAmount}
                    onChange={(e) => setTxnAmount(e.target.value)}
                    placeholder="0"
                    className="w-full pl-8 pr-4 py-2.5 text-base font-bold font-mono border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-950/70 text-white"
                  />
                </div>
              </div>

              {txnType === 'payment_received' && (
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {t.pos.paymentMethod}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['cash', 'bkash', 'nagad'].map((m) => (
                      <button
                        type="button"
                        key={m}
                        onClick={() => setTxnPaymentMethod(m as any)}
                        className={`py-2 text-xs font-bold rounded-xl border uppercase transition-all ${
                          txnPaymentMethod === m
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 ring-2 ring-emerald-500/30'
                            : 'bg-white/[0.04] border-white/10 text-slate-400 hover:bg-white/10'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {t.khata.noteOptional}
                </label>
                <textarea
                  rows={2}
                  value={txnNote}
                  onChange={(e) => setTxnNote(e.target.value)}
                  placeholder={isBn ? 'যেমন: চাল ৫ কেজি, ডাল ২ কেজি...' : 'e.g., Rice 5kg, Oil 1 bottle...'}
                  className="w-full px-3 py-2 text-xs border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-950/70 text-white placeholder-slate-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTxnModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-white/10 rounded-xl"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-lg border border-white/10 ${
                    txnType === 'due_sale' ? 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500' : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500'
                  }`}
                >
                  {t.khata.confirmTransaction}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Customer Confirmation Modal */}
      {customerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-sm bg-slate-900/95 backdrop-blur-2xl rounded-3xl border border-rose-500/30 shadow-2xl p-6 overflow-hidden text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-3 border border-rose-500/30">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">
              {isBn ? 'গ্রাহক অ্যাকাউন্ট মুছে ফেলতে চান?' : 'Delete Customer Account?'}
            </h3>
            <p className="text-xs text-slate-300 mb-2">
              <strong className="text-white">{customerToDelete.name}</strong> ({customerToDelete.phone})
            </p>
            {customerToDelete.totalDue > 0 && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-300 mb-4">
                ⚠️ {isBn ? `এই গ্রাহকের ৳${customerToDelete.totalDue.toLocaleString()} বকেয়া বাকি আছে!` : `Customer has an outstanding due of BDT ${customerToDelete.totalDue}!`}
              </div>
            )}
            <p className="text-[11px] text-slate-400 mb-5">
              {isBn ? 'এটি স্থায়ীভাবে গ্রাহকের খাতা তালিকা থেকে মুছে যাবে।' : 'This will remove the customer profile from your Khata records.'}
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setCustomerToDelete(null)}
                className="flex-1 py-2.5 text-xs font-semibold text-slate-300 bg-white/10 hover:bg-white/15 rounded-xl border border-white/10 transition-colors"
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteCustomer(customerToDelete.id);
                  if (selectedCustomer?.id === customerToDelete.id) {
                    setSelectedCustomer(null);
                  }
                  setCustomerToDelete(null);
                  Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: isBn ? 'কাস্টমার খাতা মুছে ফেলা হয়েছে!' : 'Customer deleted successfully!',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                    background: '#0f172a',
                    color: '#ffffff',
                    customClass: {
                      popup: 'border border-white/10 rounded-2xl shadow-xl'
                    }
                  });
                }}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 rounded-xl shadow-lg shadow-rose-950/50 border border-rose-400/30 transition-all"
              >
                {isBn ? 'হ্যাঁ, মুছুন' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
