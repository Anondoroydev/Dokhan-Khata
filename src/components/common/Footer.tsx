import React from 'react';
import { 
  Store, 
  Phone, 
  MapPin, 
  Mail, 
  ShieldCheck, 
  Clock, 
  Database, 
  Wifi, 
  Heart, 
  ArrowUpRight,
  Sparkles,
  ShoppingBag,
  BookOpen,
  Package,
  Layers,
  HelpCircle,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface FooterProps {
  setActiveTab?: (tab: string) => void;
  onOpenChat?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab, onOpenChat }) => {
  const { settings, language, mongoStatus, currentRole, isOnline } = useStore();
  const isBn = language === 'bn';

  return (
    <footer className="bg-slate-950/90 text-slate-400 border-t border-white/10 mt-12 relative z-10 backdrop-blur-xl">
      {/* Upper Footer Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Column 1: Shop Brand & About */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20 font-black">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white tracking-tight">
                  {settings.shopName || (isBn ? 'দোকান খাতা' : 'DokanKhata')}
                </h3>
                <p className="text-[11px] text-emerald-400 font-bold">
                  {isBn ? 'ডিজিটাল ক্যাশমেমো ও ইনভেন্টরি' : 'Smart POS & Business Ledger'}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {isBn 
                ? 'বাংলাদেশের সেরা ডিজিটাল দোকান খাতা ও পয়েন্ট অফ সেল (POS) সিস্টেম। খুব সহজেই আপনার বাকীর খাতা, স্টক হিসাব এবং অনলাইন অর্ডার পরিচালনা করুন।'
                : 'Bangladesh\'s leading digital store ledger and POS management suite. Easily manage credit ledger, inventory stock, and customer online orders.'}
            </p>

            {/* Live System Status Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {isOnline ? (isBn ? 'ক্লাউড সিঙ্ক রানিং' : 'Cloud Sync Live') : (isBn ? 'অফলাইন মোড' : 'Offline Mode')}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-[10px] font-bold">
                <Database className="w-3 h-3 text-teal-400" />
                {mongoStatus.isConnected ? 'MongoDB Connected' : (isBn ? 'লোকাল স্টোরেজ' : 'Local Data')}
              </span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isBn ? 'দ্রুত নেভিগেশন' : 'Quick Navigation'}</span>
            </h4>
            <ul className="space-y-2 text-xs">
              {currentRole !== 'customer' && setActiveTab && (
                <>
                  <li>
                    <button 
                      onClick={() => setActiveTab('dashboard')} 
                      className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                    >
                      <span>•</span> {isBn ? 'ড্যাশবোর্ড (Dashboard)' : 'Dashboard'}
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => setActiveTab('pos')} 
                      className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                    >
                      <span>•</span> {isBn ? 'কাউন্টার বিক্রি (POS)' : 'POS Counter Sale'}
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => setActiveTab('khata')} 
                      className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                    >
                      <span>•</span> {isBn ? 'বাকীর খাতা (Baki Khata)' : 'Credit Ledger'}
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => setActiveTab('inventory')} 
                      className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                    >
                      <span>•</span> {isBn ? 'পণ্য ইনভেন্টরি (Stock)' : 'Inventory Management'}
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => setActiveTab('orders')} 
                      className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                    >
                      <span>•</span> {isBn ? 'অনলাইন অর্ডারসমূহ' : 'Online Orders'}
                    </button>
                  </li>
                </>
              )}
              {setActiveTab && (
                <li>
                  <button 
                    onClick={() => setActiveTab('storefront')} 
                    className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 text-emerald-300 font-semibold"
                  >
                    <span>•</span> {isBn ? 'অনলাইন কাস্টমার শপ' : 'Customer Storefront'}
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Column 3: Contact & Store Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-teal-400" />
              <span>{isBn ? 'দোকানের ঠিকানা ও সাপোর্ট' : 'Store Contact & Support'}</span>
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-slate-300">{settings.shopAddress || (isBn ? 'ঢাকা, বাংলাদেশ' : 'Dhaka, Bangladesh')}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href={`tel:${settings.shopPhone}`} className="text-slate-300 hover:text-white transition-colors font-mono">
                  {settings.shopPhone || '01826339098'}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-slate-300">{isBn ? 'প্রতিদিন সকাল ৮:০০ - রাত ১০:০০' : 'Everyday 8:00 AM - 10:00 PM'}</span>
              </div>
              {onOpenChat && (
                <div className="pt-1">
                  <button
                    onClick={onOpenChat}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-bold text-xs transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{isBn ? 'লাইভ হেল্প ও সাপোর্ট' : 'Live Help Chat'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Column 4: Payment Methods & Trust */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isBn ? 'নিরাপদ পেমেন্ট গেটওয়ে' : 'Accepted Payment Gateways'}</span>
            </h4>
            <p className="text-xs text-slate-400">
              {isBn 
                ? 'অনলাইন অর্ডার ও খাতা পরিশোধের জন্য বিকাশ, নগদ, রকেট ও ক্যাশ অন ডেলিভারি গ্রহণযোগ্য।' 
                : 'Instant digital transactions via bKash, Nagad, Cards & Cash on Delivery.'}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="px-2.5 py-1 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-300 text-[11px] font-bold">
                bKash (বিকাশ)
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-300 text-[11px] font-bold">
                Nagad (নগদ)
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] font-bold">
                Cash on Delivery
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-300 text-[11px] font-bold">
                Visa / Master
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Bar Section */}
      <div className="border-t border-white/5 bg-slate-950 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <span>© {new Date().getFullYear()} {settings.shopName || 'দোকান খাতা'}</span>
            <span>•</span>
            <span className="text-slate-500">{isBn ? 'সর্বস্বত্ব সংরক্ষিত' : 'All rights reserved.'}</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span className="inline-flex items-center gap-1 text-[11px]">
              {isBn ? 'ডিজিটাল বাংলাদেশ ভিশন' : 'Powered by'} <span className="font-bold text-emerald-400">DokanKhata Smart Cloud v2.5</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
