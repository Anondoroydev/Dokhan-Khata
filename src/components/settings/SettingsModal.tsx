import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Store, 
  Download, 
  Upload, 
  RotateCcw, 
  ShieldCheck, 
  X, 
  Save, 
  Check, 
  AlertCircle,
  Database,
  Server,
  RefreshCw,
  Link as LinkIcon,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { StoreSettings } from '../../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { 
    settings, 
    updateSettings, 
    exportDatabaseJSON, 
    importDatabaseJSON, 
    resetToDefaultData, 
    language, 
    t,
    mongoStatus,
    configureMongoUri,
    refreshMongoStatus
  } = useStore();

  const isBn = language === 'bn';
  const [formData, setFormData] = useState<StoreSettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const [mongoUriInput, setMongoUriInput] = useState('');
  const [isConnectingMongo, setIsConnectingMongo] = useState(false);
  const [mongoResult, setMongoResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (mongoStatus.configuredUri && mongoStatus.configuredUri !== 'Not Configured') {
      setMongoUriInput(mongoStatus.configuredUri);
    }
  }, [mongoStatus.configuredUri]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleConnectMongo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mongoUriInput.trim()) return;

    setIsConnectingMongo(true);
    setMongoResult(null);

    const res = await configureMongoUri(mongoUriInput.trim());
    setIsConnectingMongo(false);

    if (res.success) {
      setMongoResult({
        success: true,
        message: isBn ? 'সফলভাবে MongoDB ক্লাউড ডাটাবেসে কানেক্ট করা হয়েছে!' : 'Connected to MongoDB successfully!',
      });
    } else {
      setMongoResult({
        success: false,
        message: res.error || (isBn ? 'MongoDB কানেক্ট হতে পারেনি। URI, ইউজারনেম, পাসওয়ার্ড বা IP হোয়াইটলিস্ট চেক করুন।' : 'Connection failed. Please check URI, username, password and Atlas Network IP access.'),
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importDatabaseJSON(content);
        if (success) {
          setImportStatus('ডাটা সফলভাবে রিস্টোর হয়েছে!');
          setTimeout(() => setImportStatus(null), 3000);
        } else {
          setImportStatus('ফাইলটি সঠিক JSON ফরম্যাটে নেই।');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
      <div className="relative w-full max-w-xl bg-slate-900/90 backdrop-blur-2xl rounded-3xl border border-white/15 shadow-2xl shadow-black/50 p-6 overflow-y-auto max-h-[90vh] flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">{t.nav.settings}</h3>
                <p className="text-xs text-slate-400">{isBn ? 'দোকানের প্রোফাইল, পেমেন্ট নম্বর ও ডাটা ব্যাকআপ' : 'Store profile, payment numbers & backup'}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
            {/* Store Names */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Store Name (English) *</label>
                <input
                  type="text"
                  required
                  value={formData.storeName}
                  onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                  className="w-full px-3 py-2 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white/[0.04] text-white"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">দোকানের নাম (বাংলা) *</label>
                <input
                  type="text"
                  required
                  value={formData.storeNameBn}
                  onChange={(e) => setFormData({ ...formData, storeNameBn: e.target.value })}
                  className="w-full px-3 py-2 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white/[0.04] text-white"
                />
              </div>
            </div>

            {/* Contact details */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-300 mb-1">দোকানের ফোন / হেল্পলাইন *</label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white/[0.04] text-white"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">মালিকের নাম</label>
                <input
                  type="text"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  className="w-full px-3 py-2 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white/[0.04] text-white"
                />
              </div>
            </div>

            {/* Merchant Payment Numbers */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-300 mb-1">বিকাশ মার্চেন্ট / পার্সোনাল নম্বর</label>
                <input
                  type="text"
                  value={formData.bkashNumber}
                  onChange={(e) => setFormData({ ...formData, bkashNumber: e.target.value })}
                  className="w-full px-3 py-2 font-mono border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white/[0.04] text-white"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">নগদ একাউন্ট নম্বর</label>
                <input
                  type="text"
                  value={formData.nagadNumber}
                  onChange={(e) => setFormData({ ...formData, nagadNumber: e.target.value })}
                  className="w-full px-3 py-2 font-mono border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white/[0.04] text-white"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block font-bold text-slate-300 mb-1">দোকানের ঠিকানা (বাংলা)</label>
              <textarea
                rows={2}
                value={formData.addressBn}
                onChange={(e) => setFormData({ ...formData, addressBn: e.target.value })}
                className="w-full px-3 py-2 border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white/[0.04] text-white"
              />
            </div>

            {/* Delivery fee & Low stock threshold */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-300 mb-1">ডেলিভারি চার্জ (টাকা)</label>
                <input
                  type="number"
                  value={formData.deliveryFee}
                  onChange={(e) => setFormData({ ...formData, deliveryFee: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 font-mono border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white/[0.04] text-white"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">স্বল্প স্টক সতর্কতার সীমা</label>
                <input
                  type="number"
                  value={formData.lowStockThresholdDefault}
                  onChange={(e) => setFormData({ ...formData, lowStockThresholdDefault: parseInt(e.target.value, 10) || 5 })}
                  className="w-full px-3 py-2 font-mono border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white/[0.04] text-white"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-950/40 border border-emerald-400/30 flex items-center gap-1.5"
              >
                {savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                <span>{savedSuccess ? 'সংরক্ষিত হয়েছে!' : 'সেটিংস সংরক্ষণ করুন'}</span>
              </button>
            </div>
          </form>

          {/* MongoDB Database Connection Manager */}
          <div className="mt-6 pt-5 border-t border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-white flex items-center gap-1.5">
                <Database className="w-4 h-4 text-teal-400" />
                <span>{isBn ? 'MongoDB ক্লাউড ডাটাবেস কানেকশন' : 'MongoDB Database Connection'}</span>
              </h4>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                mongoStatus.isConnected 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              }`}>
                {mongoStatus.isConnected ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>{isBn ? 'MongoDB অনলাইন কানেক্টেড' : 'MongoDB Connected'}</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3 h-3 text-amber-400" />
                    <span>{isBn ? 'মেমোরি মোড (MongoDB কানেক্ট করুন)' : 'Disconnected (Memory Mode)'}</span>
                  </>
                )}
              </span>
            </div>

            {mongoStatus.error && !mongoStatus.isConnected && (
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-300">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{isBn ? 'ডাটাবেস কানেকশন অবস্থা:' : 'Connection Status:'}</span>
                </div>
                <p className="text-[11px] font-mono break-all opacity-90">{mongoStatus.error}</p>
              </div>
            )}

            {mongoResult && (
              <div className={`p-3 rounded-2xl text-xs font-semibold flex items-center gap-2 border ${
                mongoResult.success 
                  ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-200' 
                  : 'bg-rose-500/20 border-rose-500/30 text-rose-200'
              }`}>
                {mongoResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                <span>{mongoResult.message}</span>
              </div>
            )}

            <form onSubmit={handleConnectMongo} className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                <label>
                  {isBn ? 'MongoDB connection URI:' : 'MongoDB Connection URI:'}
                </label>
                <button
                  type="button"
                  onClick={() => setMongoUriInput('mongodb+srv://DhokhanKhata:UCVJzuYCRvfT2Cxd@cluster0.gbp43.mongodb.net/dokankhata?retryWrites=true&w=majority')}
                  className="text-[10px] text-teal-400 hover:text-teal-300 underline font-mono"
                >
                  {isBn ? 'স্বয়ংক্রিয় ক্রেডেনশিয়াল পেস্ট করুন' : 'Paste DhokhanKhata Credentials'}
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="mongodb+srv://DhokhanKhata:UCVJzuYCRvfT2Cxd@cluster0.gbp43.mongodb.net/dokankhata?retryWrites=true&w=majority"
                  value={mongoUriInput}
                  onChange={(e) => setMongoUriInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 font-mono text-[11px] border border-white/10 rounded-xl focus:ring-2 focus:ring-teal-500 bg-slate-950/80 text-teal-300"
                />
                <LinkIcon className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              </div>

              <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-[11px] text-teal-200 flex flex-col gap-1">
                <div className="flex items-center gap-2 font-mono">
                  <span className="font-bold text-teal-400">Username:</span> DhokhanKhata | <span className="font-bold text-teal-400">Password:</span> UCVJzuYCRvfT2Cxd
                </div>
                <p className="text-[10px] text-slate-400">
                  {isBn 
                    ? 'টিপস: MongoDB Atlas এ আপনার ক্লাস্টারের পূর্ণাঙ্গ URL (যেমন cluster0.xyz.mongodb.net) বসিয়ে Connect চাপুন। Network Access এ IP 0.0.0.0/0 এলাউ আছে কিনা নিশ্চিত করুন।' 
                    : 'Tip: Replace cluster0 with your exact Atlas cluster domain if different, and ensure Network Access (0.0.0.0/0) is allowed.'}
                </p>
              </div>

              <div className="flex items-center justify-between pt-1 gap-2">
                <button
                  type="button"
                  onClick={refreshMongoStatus}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold border border-white/10 flex items-center gap-1 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                  <span>{isBn ? 'স্ট্যাটাস রিফ্রেশ' : 'Check Status'}</span>
                </button>

                <button
                  type="submit"
                  disabled={isConnectingMongo}
                  className="px-4 py-1.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all border border-teal-400/30 flex items-center gap-1.5 shadow-md shadow-teal-950/40"
                >
                  {isConnectingMongo ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Database className="w-3.5 h-3.5" />
                  )}
                  <span>{isConnectingMongo ? (isBn ? 'কানেক্ট হচ্ছে...' : 'Connecting...') : (isBn ? 'MongoDB কানেক্ট করুন' : 'Connect MongoDB')}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Database Backup & Restore Section */}
          <div className="mt-6 pt-5 border-t border-white/10 space-y-3">
            <h4 className="font-bold text-xs text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{isBn ? 'অফলাইন ব্যাকআপ ও ডাটা রিস্টোর' : 'Data Backup & Restore'}</span>
            </h4>

            {importStatus && (
              <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-xs text-emerald-300 font-semibold">
                {importStatus}
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                onClick={exportDatabaseJSON}
                className="p-3 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/10 text-slate-200 text-xs font-bold flex flex-col items-center gap-1.5 transition-colors text-center"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>{isBn ? 'ব্যাকআপ ডাউনলোড (JSON)' : 'Export Backup (JSON)'}</span>
              </button>

              <label className="p-3 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/10 text-slate-200 text-xs font-bold flex flex-col items-center gap-1.5 transition-colors text-center cursor-pointer">
                <Upload className="w-4 h-4 text-sky-400" />
                <span>{isBn ? 'ডাটা রিস্টোর করুন' : 'Import Data'}</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <button
                onClick={() => {
                  if (confirm(isBn ? 'আপনি কি সব ডাটা রিসেট করে প্রাথমিক ডেমো ডাটায় ফিরে যেতে চান?' : 'Reset to default sample data?')) {
                    resetToDefaultData();
                    onClose();
                  }
                }}
                className="p-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-bold flex flex-col items-center gap-1.5 transition-colors text-center col-span-2 sm:col-span-1"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{isBn ? 'ডেমো ডাটা রিসেট' : 'Reset Sample Data'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
