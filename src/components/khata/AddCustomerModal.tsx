import React, { useState } from 'react';
import { UserPlus, X, Phone, MapPin, DollarSign } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddCustomerModal: React.FC<AddCustomerModalProps> = ({ isOpen, onClose }) => {
  const { addCustomer, language, t } = useStore();
  const isBn = language === 'bn';

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [creditLimit, setCreditLimit] = useState('5000');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    addCustomer({
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim() || (isBn ? 'স্থানীয় এলাকা' : 'Local area'),
      creditLimit: parseFloat(creditLimit) || 5000,
    });

    setName('');
    setPhone('');
    setAddress('');
    setCreditLimit('5000');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
      <div className="relative w-full max-w-sm bg-slate-900/90 backdrop-blur-2xl rounded-3xl border border-white/15 shadow-2xl shadow-black/50 p-6 overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
              <UserPlus className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-white">{t.khata.addCustomer}</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-slate-300 mb-1">গ্রাহকের নাম (Customer Name) *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isBn ? 'যেমন: মোহাম্মদ শফিকুল ইসলাম' : 'e.g. Shafiqul Islam'}
              className="w-full px-3 py-2 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white/[0.04] text-white placeholder-slate-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">মোবাইল নাম্বার (Mobile) *</label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="017XXXXXXXX"
              className="w-full px-3 py-2 font-mono border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white/[0.04] text-white placeholder-slate-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">ঠিকানা (Address)</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={isBn ? 'বাসা/রোড নং, এলাকা' : 'House/Road, Area'}
              className="w-full px-3 py-2 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white/[0.04] text-white placeholder-slate-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">সর্বোচ্চ বাকী লিমিট (Credit Limit ৳)</label>
            <input
              type="number"
              min="0"
              value={creditLimit}
              onChange={(e) => setCreditLimit(e.target.value)}
              className="w-full px-3 py-2 font-mono border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white/[0.04] text-white"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-950/40 border border-emerald-400/30 transition-all"
            >
              {t.khata.addCustomer}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
