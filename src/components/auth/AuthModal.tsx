import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  Mail, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  Store, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { UserRole } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  initialRole?: UserRole;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const { 
    language, 
    login, 
    register, 
    authModalMode, 
    setAuthModalMode,
    settings 
  } = useStore();

  const isBn = language === 'bn';
  const mode = authModalMode || initialMode;

  // Inputs
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

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
          onClose();
        }, 300);
      } else {
        setErrorMsg(res.error || (isBn ? 'ভুল মোবাইল/ইমেইল অথবা পাসওয়ার্ড' : 'Invalid credentials'));
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(isBn ? 'লগইনে সমস্যা হয়েছে!' : 'Login failed!');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!name.trim() || !emailOrPhone.trim() || !password.trim()) {
      setErrorMsg(isBn ? 'সব তথ্য সঠিকভাবে পূরণ করুন' : 'Please fill all required fields');
      return;
    }

    if (password.length < 4) {
      setErrorMsg(isBn ? 'পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে' : 'Password must be at least 4 chars');
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
        setSuccessMsg(isBn ? 'অ্যাকাউন্ট তৈরি সফল হয়েছে' : 'Account registered successfully');
        setTimeout(() => {
          onClose();
        }, 300);
      } else {
        setErrorMsg(res.error || (isBn ? 'এই তথ্য দিয়ে ইতিমধ্যে অ্যাকাউন্ট আছে' : 'Account already exists'));
      }
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-md p-5 sm:p-6 shadow-2xl relative text-left">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20 mb-2">
            <Store className="w-6 h-6 text-slate-950" />
          </div>
          <h2 className="text-xl font-black text-white">
            {mode === 'login' 
              ? (isBn ? 'দোকানখাতায় লগইন' : 'Sign In')
              : (isBn ? 'নতুন অ্যাকাউন্ট' : 'Register')}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'login'
              ? (isBn ? 'আপনার অ্যাকাউন্টে প্রবেশ করুন' : 'Enter your credentials')
              : (isBn ? 'নতুন অ্যাকাউন্ট তৈরি করুন' : 'Fill details to create account')}
          </p>
        </div>

        {/* Feedback messages */}
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

        {/* Simple Form */}
        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {isBn ? 'মোবাইল বা ইমেইল' : 'Phone or Email'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  placeholder={isBn ? '017XXXXXXXX বা email' : 'Phone or Email'}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {isBn ? 'পাসওয়ার্ড' : 'Password'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isBn ? 'পাসওয়ার্ড লিখুন' : 'Enter password'}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm rounded-xl shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
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
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {isBn ? 'আপনার নাম' : 'Full Name'} <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isBn ? 'নাম লিখুন' : 'Enter full name'}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {isBn ? 'মোবাইল নম্বর বা ইমেইল' : 'Phone or Email'} <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  placeholder={isBn ? '017XXXXXXXX বা email' : 'Phone or Email'}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
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
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm rounded-xl shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isBn ? 'অ্যাকাউন্ট তৈরি করুন' : 'Create Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Switch Link */}
        <div className="mt-4 text-center pt-3 border-t border-white/5">
          <button
            type="button"
            onClick={() => {
              setAuthModalMode(mode === 'login' ? 'register' : 'login');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
          >
            {mode === 'login' 
              ? (isBn ? 'নতুন অ্যাকাউন্ট খুলতে চান? রেজিস্ট্রেশন করুন' : "Don't have an account? Register")
              : (isBn ? 'ইতিমধ্যে অ্যাকাউন্ট আছে? লগইন করুন' : 'Already have an account? Log In')}
          </button>
        </div>
      </div>
    </div>
  );
};
