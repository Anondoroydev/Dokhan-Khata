import React, { useState, useEffect } from 'react';
import { 
  User, X, Camera, Save, Lock, Phone, MapPin, 
  Briefcase, Globe, Settings, Shield, Mail, Link as LinkIcon,
  Bell, Building2, AtSign, Calendar, Info, Upload, Check
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'general' | 'contact' | 'business' | 'social' | 'preferences' | 'security';

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateUserProfile, language, t } = useStore();
  const isBn = language === 'bn';

  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    emailOrPhone: '',
    avatar: '',
    password: '',
    bio: '',
    gender: 'prefer_not_to_say',
    dateOfBirth: '',
    altPhone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    shopName: '',
    shopAddress: '',
    taxId: '',
    tradeLicense: '',
    businessType: 'retail',
    website: '',
    facebookUrl: '',
    linkedinUrl: '',
    twitterUrl: '',
    instagramUrl: '',
    currencyPref: 'BDT',
    timezone: 'Asia/Dhaka',
    emailAlerts: true,
    smsAlerts: true,
    marketingEmails: false,
  });

  useEffect(() => {
    if (currentUser && isOpen) {
      setFormData({
        name: currentUser.name || '',
        emailOrPhone: currentUser.emailOrPhone || '',
        avatar: currentUser.avatar || '',
        password: '',
        bio: currentUser.bio || '',
        gender: currentUser.gender || 'prefer_not_to_say',
        dateOfBirth: currentUser.dateOfBirth || '',
        altPhone: currentUser.altPhone || '',
        address: currentUser.address || '',
        city: currentUser.city || '',
        state: currentUser.state || '',
        zipCode: currentUser.zipCode || '',
        country: currentUser.country || '',
        shopName: currentUser.shopName || '',
        shopAddress: currentUser.shopAddress || '',
        taxId: currentUser.taxId || '',
        tradeLicense: currentUser.tradeLicense || '',
        businessType: currentUser.businessType || 'retail',
        website: currentUser.website || '',
        facebookUrl: currentUser.facebookUrl || '',
        linkedinUrl: currentUser.linkedinUrl || '',
        twitterUrl: currentUser.twitterUrl || '',
        instagramUrl: currentUser.instagramUrl || '',
        currencyPref: currentUser.currencyPref || 'BDT',
        timezone: currentUser.timezone || 'Asia/Dhaka',
        emailAlerts: currentUser.emailAlerts ?? true,
        smsAlerts: currentUser.smsAlerts ?? true,
        marketingEmails: currentUser.marketingEmails ?? false,
      });
      setActiveTab('general');
      setSuccessMsg('');
    }
  }, [currentUser, isOpen]);

  if (!isOpen || !currentUser) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert(isBn ? 'অনুগ্রহ করে একটি ছবি ফাইল নির্বাচন করুন' : 'Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setFormData((prev) => ({ ...prev, avatar: dataUrl }));
      };
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMsg('');

    setTimeout(() => {
      const updates: any = { ...formData };
      
      // Remove empty password so it doesn't overwrite
      if (!updates.password.trim()) {
        delete updates.password;
      }
      
      updateUserProfile(updates);
      setIsSubmitting(false);
      setSuccessMsg(isBn ? 'প্রোফাইল সফলভাবে আপডেট হয়েছে!' : 'Profile updated successfully!');
      
      setTimeout(() => {
        setSuccessMsg('');
      }, 3000);
    }, 800);
  };

  const tabs: { id: TabType; icon: React.ElementType; label: string; labelBn: string }[] = [
    { id: 'general', icon: User, label: 'General Info', labelBn: 'সাধারণ তথ্য' },
    { id: 'contact', icon: Phone, label: 'Contact', labelBn: 'যোগাযোগ' },
    { id: 'business', icon: Briefcase, label: 'Business', labelBn: 'ব্যবসা' },
    { id: 'social', icon: Globe, label: 'Social Links', labelBn: 'সোশ্যাল লিংক' },
    { id: 'preferences', icon: Settings, label: 'Preferences', labelBn: 'প্রেফারেন্স' },
    { id: 'security', icon: Shield, label: 'Security', labelBn: 'সিকিউরিটি' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/50 shadow-2xl rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row relative animate-in zoom-in-95 duration-300">
        
        {/* Mobile Header (Only visible on small screens) */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800/50">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-400" />
            {isBn ? 'প্রোফাইল সেটিংস' : 'Profile Settings'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 bg-slate-800/40 border-b md:border-b-0 md:border-r border-slate-700/50 flex flex-row md:flex-col overflow-x-auto md:overflow-y-auto no-scrollbar shrink-0">
          <div className="hidden md:flex items-center justify-between p-6 border-b border-slate-700/50">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-emerald-400" />
              {isBn ? 'সেটিংস' : 'Settings'}
            </h2>
          </div>
          
          <div className="flex md:flex-col p-2 md:p-4 gap-1 md:gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap md:whitespace-normal text-sm font-medium ${
                    isActive 
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                  {isBn ? tab.labelBn : tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Content Area */}
        <div className="flex-1 flex flex-col min-h-0 relative bg-slate-900/50">
          <button onClick={onClose} className="hidden md:flex absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-rose-500/20 z-10 transition-colors">
            <X className="w-5 h-5" />
          </button>

          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <form id="profile-form" onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
              
              {/* Tab 1: General Info */}
              {activeTab === 'general' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-700/50">
                    <User className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-lg font-bold text-white">{isBn ? 'সাধারণ তথ্য' : 'General Information'}</h3>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 bg-slate-950/40 p-4 rounded-2xl border border-slate-800">
                    <div className="flex flex-col items-center gap-2 shrink-0">
                      <div className="relative group w-24 h-24">
                        <img 
                          src={formData.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'} 
                          alt="Avatar"
                          referrerPolicy="no-referrer"
                          className="w-24 h-24 rounded-2xl object-cover border-2 border-emerald-500/50 shadow-xl bg-slate-900"
                        />
                        <label
                          htmlFor="avatar-file-upload"
                          className="absolute inset-0 bg-black/60 rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm cursor-pointer"
                        >
                          <Camera className="w-6 h-6 text-white mb-1" />
                          <span className="text-[10px] text-emerald-300 font-bold">{isBn ? 'আপলোড' : 'Upload'}</span>
                        </label>
                      </div>
                    </div>
                    
                    <div className="flex-1 w-full space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                          {isBn ? 'প্রোফাইল ছবি (Profile Photo)' : 'Profile Photo'}
                        </label>
                        <div className="flex flex-wrap items-center gap-2">
                          <label
                            htmlFor="avatar-file-upload"
                            className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold rounded-xl border border-emerald-500/30 cursor-pointer transition-colors inline-flex items-center gap-2 shadow-sm"
                          >
                            <Upload className="w-4 h-4" />
                            {isBn ? 'ডিভাইস থেকে ছবি বেছে নিন' : 'Upload Photo from Device'}
                          </label>
                          <input 
                            type="file" 
                            id="avatar-file-upload" 
                            accept="image/*" 
                            onChange={handleAvatarFileUpload} 
                            className="hidden" 
                          />
                          {formData.avatar && (
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, avatar: '' }))}
                              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 transition-colors"
                            >
                              {isBn ? 'রিমুভ' : 'Remove'}
                            </button>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                          {isBn ? 'অথবা ছবির ওয়েব লিংক (URL)' : 'Or Image Web URL'}
                        </label>
                        <input 
                          type="url" name="avatar" value={formData.avatar} onChange={handleChange}
                          placeholder="https://..."
                          className="w-full px-3 py-2 bg-slate-900/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                        {isBn ? 'সম্পূর্ণ নাম' : 'Full Name'} *
                      </label>
                      <input 
                        type="text" required name="name" value={formData.name} onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                        {isBn ? 'লিঙ্গ' : 'Gender'}
                      </label>
                      <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm">
                        <option value="male">{isBn ? 'পুরুষ' : 'Male'}</option>
                        <option value="female">{isBn ? 'মহিলা' : 'Female'}</option>
                        <option value="other">{isBn ? 'অন্যান্য' : 'Other'}</option>
                        <option value="prefer_not_to_say">{isBn ? 'বলতে চাই না' : 'Prefer not to say'}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                        {isBn ? 'জন্ম তারিখ' : 'Date of Birth'}
                      </label>
                      <input 
                        type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      {isBn ? 'আপনার সম্পর্কে (Bio)' : 'Bio'}
                    </label>
                    <textarea 
                      name="bio" value={formData.bio} onChange={handleChange} rows={3}
                      placeholder={isBn ? 'আপনার সম্পর্কে কিছু লিখুন...' : 'Write something about yourself...'}
                      className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Tab 2: Contact Info */}
              {activeTab === 'contact' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-700/50">
                    <Phone className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-lg font-bold text-white">{isBn ? 'যোগাযোগের তথ্য' : 'Contact Information'}</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                        {isBn ? 'ইমেইল / ফোন' : 'Email / Phone'} *
                      </label>
                      <input 
                        type="text" required name="emailOrPhone" value={formData.emailOrPhone} onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                        {isBn ? 'বিকল্প ফোন নম্বর' : 'Alternative Phone'}
                      </label>
                      <input 
                        type="text" name="altPhone" value={formData.altPhone} onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                        {isBn ? 'ঠিকানা' : 'Street Address'}
                      </label>
                      <input 
                        type="text" name="address" value={formData.address} onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                        {isBn ? 'শহর' : 'City'}
                      </label>
                      <input 
                        type="text" name="city" value={formData.city} onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                        {isBn ? 'স্টেট / বিভাগ' : 'State / Region'}
                      </label>
                      <input 
                        type="text" name="state" value={formData.state} onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                        {isBn ? 'জিপ কোড' : 'Zip Code'}
                      </label>
                      <input 
                        type="text" name="zipCode" value={formData.zipCode} onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                        {isBn ? 'দেশ' : 'Country'}
                      </label>
                      <input 
                        type="text" name="country" value={formData.country} onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Business / Shop */}
              {activeTab === 'business' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-700/50">
                    <Building2 className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-lg font-bold text-white">{isBn ? 'ব্যবসা / দোকান' : 'Business / Shop Details'}</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                        {isBn ? 'দোকানের নাম' : 'Shop Name'}
                      </label>
                      <input 
                        type="text" name="shopName" value={formData.shopName} onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                        {isBn ? 'দোকানের ঠিকানা' : 'Shop Address'}
                      </label>
                      <input 
                        type="text" name="shopAddress" value={formData.shopAddress} onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                        {isBn ? 'ট্যাক্স আইডি (BIN/TIN)' : 'Tax ID (BIN/TIN)'}
                      </label>
                      <input 
                        type="text" name="taxId" value={formData.taxId} onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                        {isBn ? 'ট্রেড লাইসেন্স' : 'Trade License No.'}
                      </label>
                      <input 
                        type="text" name="tradeLicense" value={formData.tradeLicense} onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                        {isBn ? 'ব্যবসার ধরন' : 'Business Type'}
                      </label>
                      <select name="businessType" value={formData.businessType} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm">
                        <option value="retail">Retail</option>
                        <option value="wholesale">Wholesale</option>
                        <option value="distributor">Distributor</option>
                        <option value="agency">Agency</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                        {isBn ? 'ওয়েবসাইট' : 'Website'}
                      </label>
                      <input 
                        type="url" name="website" value={formData.website} onChange={handleChange} placeholder="https://"
                        className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Social Links */}
              {activeTab === 'social' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-700/50">
                    <LinkIcon className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-lg font-bold text-white">{isBn ? 'সোশ্যাল মিডিয়া' : 'Social Profiles'}</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Facebook</label>
                      <input 
                        type="url" name="facebookUrl" value={formData.facebookUrl} onChange={handleChange} placeholder="https://facebook.com/..."
                        className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">LinkedIn</label>
                      <input 
                        type="url" name="linkedinUrl" value={formData.linkedinUrl} onChange={handleChange} placeholder="https://linkedin.com/in/..."
                        className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Twitter / X</label>
                      <input 
                        type="url" name="twitterUrl" value={formData.twitterUrl} onChange={handleChange} placeholder="https://twitter.com/..."
                        className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Instagram</label>
                      <input 
                        type="url" name="instagramUrl" value={formData.instagramUrl} onChange={handleChange} placeholder="https://instagram.com/..."
                        className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 5: Preferences */}
              {activeTab === 'preferences' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-700/50">
                    <Bell className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-lg font-bold text-white">{isBn ? 'সেটিংস ও নোটিফিকেশন' : 'App Preferences'}</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-slate-700/50 pb-6">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                        {isBn ? 'মুদ্রা (Currency)' : 'Preferred Currency'}
                      </label>
                      <select name="currencyPref" value={formData.currencyPref} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm">
                        <option value="BDT">BDT (৳)</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="INR">INR (₹)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                        {isBn ? 'টাইমজোন' : 'Timezone'}
                      </label>
                      <select name="timezone" value={formData.timezone} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm">
                        <option value="Asia/Dhaka">Asia/Dhaka (BST)</option>
                        <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                        <option value="America/New_York">America/New_York (EST)</option>
                        <option value="Europe/London">Europe/London (GMT)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-white">{isBn ? 'নোটিফিকেশন সেটিংস' : 'Notification Settings'}</h4>
                    
                    <label className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-slate-700/50 transition-colors cursor-pointer">
                      <input type="checkbox" name="emailAlerts" checked={formData.emailAlerts} onChange={handleChange} className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900" />
                      <div>
                        <p className="text-sm font-medium text-white">{isBn ? 'ইমেইল অ্যালার্ট' : 'Email Alerts'}</p>
                        <p className="text-xs text-slate-400">{isBn ? 'গুরুত্বপূর্ণ আপডেটের জন্য ইমেইল পান' : 'Receive emails for important updates'}</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-slate-700/50 transition-colors cursor-pointer">
                      <input type="checkbox" name="smsAlerts" checked={formData.smsAlerts} onChange={handleChange} className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900" />
                      <div>
                        <p className="text-sm font-medium text-white">{isBn ? 'SMS অ্যালার্ট' : 'SMS Alerts'}</p>
                        <p className="text-xs text-slate-400">{isBn ? 'অর্ডার ও পেমেন্ট আপডেট SMS এ পান' : 'Get SMS for orders and payments'}</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-slate-700/50 transition-colors cursor-pointer">
                      <input type="checkbox" name="marketingEmails" checked={formData.marketingEmails} onChange={handleChange} className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900" />
                      <div>
                        <p className="text-sm font-medium text-white">{isBn ? 'প্রমোশনাল অফার' : 'Marketing Offers'}</p>
                        <p className="text-xs text-slate-400">{isBn ? 'নতুন অফার ও ডিসকাউন্ট সম্পর্কে জানুন' : 'Receive promotional offers and discounts'}</p>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Tab 6: Security */}
              {activeTab === 'security' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-700/50">
                    <Shield className="w-5 h-5 text-rose-400" />
                    <h3 className="text-lg font-bold text-white">{isBn ? 'পাসওয়ার্ড ও সিকিউরিটি' : 'Password & Security'}</h3>
                  </div>

                  <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex gap-3 items-start">
                    <Info className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-rose-200">
                      {isBn 
                        ? 'পাসওয়ার্ড পরিবর্তন না করতে চাইলে এই ঘরগুলো ফাঁকা রাখুন।' 
                        : 'Leave these fields blank if you do not wish to change your password.'}
                    </p>
                  </div>

                  <div className="max-w-md space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <Lock className="w-3 h-3" />
                        {isBn ? 'নতুন পাসওয়ার্ড' : 'New Password'}
                      </label>
                      <input 
                        type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••"
                        className="w-full px-4 py-2.5 bg-slate-950/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Footer Action Bar */}
          <div className="p-4 md:p-6 border-t border-slate-700/50 bg-slate-800/80 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4 shrink-0">
            {successMsg ? (
              <div className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 text-sm font-medium border border-emerald-500/30 flex items-center gap-2 animate-in fade-in w-full md:w-auto justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {successMsg}
              </div>
            ) : (
              <div className="text-sm text-slate-400 hidden md:block">
                {isBn ? 'পরিবর্তনগুলো সংরক্ষণ করতে ভুলবেন না' : 'Unsaved changes will be lost if you close'}
              </div>
            )}
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button 
                type="button" onClick={onClose}
                className="flex-1 md:flex-none px-6 py-2.5 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-700 font-medium text-sm transition-colors"
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </button>
              <button 
                type="submit" form="profile-form" disabled={isSubmitting}
                className="flex-1 md:flex-none px-8 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-sm shadow-lg shadow-emerald-900/30 transition-all disabled:opacity-70 flex justify-center items-center gap-2"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {isBn ? 'সেভ করুন' : 'Save Changes'}
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
