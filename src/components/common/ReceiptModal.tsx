import React from 'react';
import { Printer, X, Download, CheckCircle2 } from 'lucide-react';
import { Transaction, Order, StoreSettings, Language } from '../../types';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction?: Transaction | null;
  order?: Order | null;
  settings: StoreSettings;
  language: Language;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  transaction,
  order,
  settings,
  language,
}) => {
  if (!isOpen || (!transaction && !order)) return null;

  const isBn = language === 'bn';
  const receiptTitle = order ? (isBn ? 'অনলাইন অর্ডার মেমো' : 'Online Order Invoice') : (isBn ? 'ক্যাশ মেমো / রসিদ' : 'Sales Cash Memo');
  const invoiceNumber = order ? order.orderNumber : (transaction?.invoiceNo || `REC-${Date.now().toString().slice(-6)}`);
  const dateStr = new Date(order ? order.orderDate : (transaction?.date || Date.now())).toLocaleString(isBn ? 'bn-BD' : 'en-US');

  const customerName = order ? order.customerName : (transaction?.customerName || (isBn ? 'কাউন্টার কাস্টমার' : 'Walk-in Customer'));
  const customerPhone = order ? order.customerPhone : (transaction?.customerPhone || '');
  const customerAddress = order ? order.customerAddress : '';

  const items = order ? order.items : (transaction?.items || []);
  const subtotal = order ? order.subtotal : (items.reduce((s, i) => s + i.total, 0) || (transaction?.amount || 0));
  const discount = order ? order.discount : (transaction?.discount || 0);
  const deliveryFee = order ? order.deliveryFee : 0;
  const netTotal = order ? order.totalAmount : (transaction?.amount || 0);

  const paymentMethod = order ? order.paymentMethod.toUpperCase() : (transaction?.paymentMethod.toUpperCase() || 'CASH');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-slate-900/95 backdrop-blur-2xl rounded-3xl border border-white/15 shadow-2xl shadow-black/60 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.04]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-sm">
              {isBn ? 'রসিদ সফলভাবে প্রস্তুত' : 'Receipt Generated'}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-white/10 border border-white/10 rounded-xl hover:bg-white/20 transition-all shadow-xs"
              title="Print Receipt"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-400" />
              {isBn ? 'প্রিন্ট' : 'Print'}
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Thermal Receipt Area */}
        <div id="printable-receipt" className="p-6 overflow-y-auto font-mono text-xs text-slate-800 bg-white leading-relaxed">
          {/* Store Header */}
          <div className="text-center border-b border-dashed border-slate-300 pb-4">
            <h2 className="text-base font-bold text-slate-900 font-sans">
              {isBn ? settings.storeNameBn || settings.storeName : settings.storeName}
            </h2>
            <p className="text-[11px] text-slate-500 font-sans mt-0.5">
              {isBn ? settings.taglineBn || settings.tagline : settings.tagline}
            </p>
            <p className="text-[11px] text-slate-600 font-sans mt-1">
              {isBn ? settings.addressBn || settings.address : settings.address}
            </p>
            <p className="text-[11px] text-slate-600 font-sans">
              মোবাইল: {settings.phone}
            </p>
            <div className="inline-block mt-2 px-2.5 py-0.5 border border-slate-400 font-bold uppercase tracking-wider text-[10px]">
              {receiptTitle}
            </div>
          </div>

          {/* Invoice Info */}
          <div className="py-3 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-500">{isBn ? 'রসিদ নং:' : 'Invoice No:'}</span>
              <span className="font-semibold text-slate-900">{invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{isBn ? 'তারিখ ও সময়:' : 'Date & Time:'}</span>
              <span>{dateStr}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">{isBn ? 'গ্রাহক:' : 'Customer:'}</span>
              <span className="font-medium text-slate-900">{customerName}</span>
            </div>
            {customerPhone && (
              <div className="flex justify-between">
                <span className="text-slate-500">{isBn ? 'ফোন:' : 'Phone:'}</span>
                <span>{customerPhone}</span>
              </div>
            )}
            {customerAddress && (
              <div className="flex justify-between">
                <span className="text-slate-500">{isBn ? 'ঠিকানা:' : 'Address:'}</span>
                <span className="text-right max-w-[200px]">{customerAddress}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">{isBn ? 'পেমেন্ট মাধ্যম:' : 'Payment:'}</span>
              <span className="font-bold text-emerald-700">{paymentMethod}</span>
            </div>
          </div>

          {/* Items Table */}
          <div className="py-3 border-b border-dashed border-slate-300">
            <div className="grid grid-cols-12 text-[11px] font-bold text-slate-700 pb-1.5 border-b border-slate-200">
              <span className="col-span-6">{isBn ? 'পণ্যের নাম' : 'Item Description'}</span>
              <span className="col-span-2 text-center">{isBn ? 'পরিমাণ' : 'Qty'}</span>
              <span className="col-span-2 text-right">{isBn ? 'দর' : 'Rate'}</span>
              <span className="col-span-2 text-right">{isBn ? 'মোট' : 'Total'}</span>
            </div>

            <div className="divide-y divide-slate-100 py-1">
              {items.length > 0 ? (
                items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 py-1.5 text-[11px]">
                    <span className="col-span-6 font-sans truncate pr-1">
                      {isBn ? item.productNameBn || item.productName : item.productName}
                    </span>
                    <span className="col-span-2 text-center font-mono">{item.quantity}</span>
                    <span className="col-span-2 text-right font-mono">৳{item.unitPrice}</span>
                    <span className="col-span-2 text-right font-mono font-semibold">৳{item.total}</span>
                  </div>
                ))
              ) : (
                <div className="py-2 text-slate-500 font-sans italic">
                  {transaction?.note || (isBn ? 'সাধারণ লেনদেন' : 'Direct Transaction')}
                </div>
              )}
            </div>
          </div>

          {/* Calculations */}
          <div className="py-3 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
            <div className="flex justify-between text-slate-600">
              <span>{isBn ? 'সাবটোটাল:' : 'Subtotal:'}</span>
              <span className="font-semibold">৳{subtotal}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-rose-600">
                <span>{isBn ? 'ছাড় / ডিসকাউন্ট (-):' : 'Discount (-):'}</span>
                <span>-৳{discount}</span>
              </div>
            )}
            {deliveryFee > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>{isBn ? 'ডেলিভারি চার্জ (+):' : 'Delivery Fee (+):'}</span>
                <span>+৳{deliveryFee}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-200">
              <span>{isBn ? 'সর্বমোট প্রদেয়:' : 'Net Total:'}</span>
              <span className="text-emerald-700">৳{netTotal}</span>
            </div>
          </div>

          {/* Footer Note & Barcode Simulation */}
          <div className="pt-4 text-center space-y-2">
            <p className="text-[11px] font-sans text-slate-600">
              {isBn ? 'ধন্যবাদ! আবার আসবেন।' : 'Thank you for shopping with us!'}
            </p>
            <div className="flex justify-center items-center gap-1 font-mono tracking-widest text-[9px] text-slate-400">
              ||||| | |||| ||||| | || ||||| ||| |||||||
            </div>
            <p className="text-[9px] text-slate-400 font-sans">
              Powered by DokanKhata Digital System
            </p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-white/10 bg-white/[0.04] flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-300 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
          >
            {isBn ? 'বন্ধ করুন' : 'Close'}
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl hover:from-emerald-500 hover:to-teal-500 transition-all shadow-md shadow-emerald-950/40"
          >
            <Printer className="w-4 h-4" />
            {isBn ? 'প্রিন্ট রসিদ' : 'Print Receipt'}
          </button>
        </div>
      </div>
    </div>
  );
};
