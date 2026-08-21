import React, { useState } from 'react';
import { 
  Store, 
  Lock, 
  Mail, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Globe, 
  ArrowLeft
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { UserRole } from '../../types';
import toast from 'react-hot-toast';

interface LoginPageProps {
  onSuccess?: () => void;
  onContinueAsGuest?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onSuccess,
  onContinueAsGuest,
}) => {
  const { 
    language, 
    setLanguage, 
    login, 
    register, 
    settings 
  } = useStore();

  const isBn = language === 'bn';
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Clean Inputs
  const [emailOrPhone, setEmailOrPhone] = useState('01826339098');
  const [password, setPassword] = useState('admin');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Simple Login (Auto-detects Admin, Staff, or Customer)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!emailOrPhone.trim() || !password.trim()) {
      setErrorMsg(isBn ? 'মোবাইল বা ইমেইল এবং পাসওয়ার্ড দিন' : 'Please enter Email/Phone and Password');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login(emailOrPhone.trim(), password.trim());
      setIsSubmitting(false);
      if (res.success) {
        setSuccessMsg(isBn ? 'লগইন সফল হয়েছে' : 'Login successful');
        setTimeout(() => {
          if (onSuccess) onSuccess();
        }, 300);
      } else {
        setErrorMsg(res.error || (isBn ? 'ভুল মোবাইল/ইমেইল অথবা পাসওয়ার্ড' : 'Invalid email/phone or password'));
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(isBn ? 'লগইনে সমস্যা হয়েছে!' : 'Login failed!');
    }
  };

  // 2. Simple Register
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!name.trim() || !emailOrPhone.trim() || !password.trim()) {
      setErrorMsg(isBn ? 'সব তথ্য সঠিকভাবে দিন' : 'Please fill all required fields');
      return;
    }

    if (password.length < 4) {
      setErrorMsg(isBn ? 'পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে' : 'Password must be at least 4 characters');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = register({
        name: name.trim(),
        emailOrPhone: emailOrPhone.trim(),
        password: password.trim(),
        role: 'customer',
      });
      setIsSubmitting(false);
      if (res.success) {
        setSuccessMsg(isBn ? 'অ্যাকাউন্ট তৈরি সফল হয়েছে' : 'Registration successful');
        setTimeout(() => {
          if (onSuccess) onSuccess();
        }, 300);
      } else {
        setErrorMsg(res.error || (isBn ? 'এই তথ্য দিয়ে ইতিমধ্যে অ্যাকাউন্ট আছে' : 'Account already exists'));
      }
    }, 300);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-slate-950 relative">
      {/* Top Bar for Guest Exit & Language */}
      <div className="absolute top-4 left-4 right-4 sm:top-6 sm:left-6 sm:right-6 flex items-center justify-between z-10">
        {onContinueAsGuest && (
          <button
            type="button"
            onClick={onContinueAsGuest}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white border border-white/10 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isBn ? 'গেস্ট হিসেবে দেখুন' : 'Continue as Guest'}</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
          className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-emerald-400 border border-white/10 transition-all cursor-pointer"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? 'English' : 'বাংলা'}</span>
        </button>
      </div>

      {/* Main Single Clean Form Box */}
      <div className="w-full max-w-md my-8">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20 mb-3">
            <Store className="w-7 h-7 text-slate-950" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            {isBn ? 'দোকানখাতা' : 'DokanKhata'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'login' 
              ? (isBn ? 'অ্যাকাউন্টে প্রবেশ করুন' : 'Sign in to continue')
              : (isBn ? 'নতুন অ্যাকাউন্ট খুলুন' : 'Create an account')}
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl">
          {/* Messages */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* 1. SIMPLE LOGIN FORM */}
          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {isBn ? 'মোবাইল নম্বর বা ইমেইল' : 'Email or Phone'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    placeholder={isBn ? '017XXXXXXXX বা email' : 'Phone or Email'}
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-white/10 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    {isBn ? 'পাসওয়ার্ড' : 'Password'}
                  </label>
                  <button
                    type="button"
                    onClick={() => toast(isBn ? 'ডেমো অ্যাকাউন্ট:\nAdmin: 01826339098 / admin\nStaff: staff / staff\nUser: user / user' : 'Demo accounts:\nAdmin: 01826339098 / admin\nStaff: staff / staff\nUser: user / user', { duration: 5000, icon: '💡' })}
                    className="text-[11px] text-emerald-400 hover:underline cursor-pointer"
                  >
                    {isBn ? 'ডেমো দেখতে ক্লিক করুন' : 'Demo Info'}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isBn ? 'আপনার পাসওয়ার্ড' : 'Enter password'}
                    className="w-full pl-10 pr-10 py-3 bg-slate-950 border border-white/10 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm rounded-2xl shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{isBn ? 'লগইন করুন' : 'Log In'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* 2. SIMPLE REGISTER FORM */
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {isBn ? 'আপনার নাম' : 'Full Name'} <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={isBn ? 'নাম লিখুন' : 'Enter your name'}
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-white/10 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {isBn ? 'মোবাইল নম্বর বা ইমেইল' : 'Email or Phone'} <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    placeholder={isBn ? '017XXXXXXXX বা email' : 'Phone or Email'}
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-white/10 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {isBn ? 'পাসওয়ার্ড' : 'Password'} <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isBn ? 'কমপক্ষে ৪ অক্ষর' : 'Password (min 4 chars)'}
                    className="w-full pl-10 pr-10 py-3 bg-slate-950 border border-white/10 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm rounded-2xl shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{isBn ? 'রেজিস্ট্রেশন সম্পন্ন করুন' : 'Register Now'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Clean Switch Link at the Bottom */}
          <div className="mt-5 text-center pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold transition-colors cursor-pointer"
            >
              {mode === 'login' 
                ? (isBn ? 'নতুন একাউন্ট খুলতে চান? রেজিস্ট্রেশন করুন' : "Don't have an account? Register")
                : (isBn ? 'ইতিমধ্যে একাউন্ট আছে? লগইন করুন' : 'Already have an account? Sign in')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
