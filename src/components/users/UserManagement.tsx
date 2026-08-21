import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { UserRole } from '../../types';
import { Trash2, UserPlus, Shield, User, Briefcase, Mail, Phone, Lock } from 'lucide-react';
import Swal from 'sweetalert2';

export const UserManagement: React.FC = () => {
  const { language, t, users, addUser, deleteUser, currentUser } = useStore();
  const isBn = language === 'bn';

  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    emailOrPhone: '',
    password: '',
    role: 'staff' as UserRole,
  });

  const [error, setError] = useState('');

  const handleDeleteUser = (userId: string, userName: string) => {
    Swal.fire({
      title: isBn ? 'আপনি কি নিশ্চিত?' : 'Are you sure?',
      text: isBn 
        ? `"${userName}" ব্যবহারকারীকে স্থায়ীভাবে মুছে ফেলা হবে!` 
        : `User "${userName}" will be permanently deleted!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f43f5e',
      cancelButtonColor: '#334155',
      confirmButtonText: isBn ? 'হ্যাঁ, মুছে ফেলুন!' : 'Yes, Delete!',
      cancelButtonText: isBn ? 'বাতিল' : 'Cancel',
      background: '#0f172a',
      color: '#ffffff',
      customClass: {
        popup: 'border border-white/10 rounded-3xl shadow-2xl',
        confirmButton: 'rounded-xl font-bold px-4 py-2.5',
        cancelButton: 'rounded-xl font-bold px-4 py-2.5',
      }
    }).then((result) => {
      if (result.isConfirmed) {
        deleteUser(userId);
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: isBn ? 'ব্যবহারকারী মুছে ফেলা হয়েছে!' : 'User deleted successfully!',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          background: '#0f172a',
          color: '#ffffff',
          customClass: {
            popup: 'border border-white/10 rounded-2xl shadow-xl'
          }
        });
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.emailOrPhone || !formData.password) {
      setError(isBn ? 'সব তথ্য দিন!' : 'Please fill all fields!');
      return;
    }
    const result = addUser({
      name: formData.name,
      emailOrPhone: formData.emailOrPhone,
      password: formData.password,
      role: formData.role,
      avatar: formData.role === 'admin' 
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    });

    if (result.success) {
      setIsAdding(false);
      setFormData({ name: '', emailOrPhone: '', password: '', role: 'staff' });
      setError('');
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: isBn ? 'ব্যবহারকারী তৈরি সফল হয়েছে!' : 'User created successfully!',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        background: '#0f172a',
        color: '#ffffff',
        customClass: {
          popup: 'border border-white/10 rounded-2xl shadow-xl'
        }
      });
    } else {
      setError(result.error || 'Error adding user');
    }
  };

  const roleIcons = {
    admin: <Shield className="w-4 h-4 text-rose-400" />,
    staff: <Briefcase className="w-4 h-4 text-sky-400" />,
    customer: <User className="w-4 h-4 text-emerald-400" />
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">{isBn ? 'অ্যাডমিন এবং স্টাফ' : 'Users & Staff'}</h1>
          <p className="text-sm text-slate-400 mt-1">{isBn ? 'সিস্টেম ব্যবহারকারী ম্যানেজমেন্ট' : 'Manage system users and roles'}</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>{isAdding ? (isBn ? 'বাতিল করুন' : 'Cancel') : (isBn ? 'নতুন ব্যবহারকারী' : 'Add New User')}</span>
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-slate-900/50 border border-white/10 rounded-3xl p-6 space-y-4 animate-in fade-in slide-in-from-top-4">
          <h2 className="text-lg font-bold text-white mb-4">{isBn ? 'নতুন অ্যাকাউন্ট তৈরি করুন' : 'Create New Account'}</h2>
          
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-semibold">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 ml-1">{isBn ? 'নাম' : 'Name'}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                  placeholder={isBn ? 'পুরো নাম' : 'Full Name'}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 ml-1">{isBn ? 'ইমেইল বা ফোন' : 'Email or Phone'}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  value={formData.emailOrPhone}
                  onChange={(e) => setFormData(p => ({ ...p, emailOrPhone: e.target.value }))}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                  placeholder="admin@example.com / 017..."
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 ml-1">{isBn ? 'পাসওয়ার্ড' : 'Password'}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                  placeholder="********"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 ml-1">{isBn ? 'রোল' : 'Role'}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Shield className="w-4 h-4 text-slate-400" />
                </div>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData(p => ({ ...p, role: e.target.value as UserRole }))}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white appearance-none focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                >
                  <option value="admin">{t.roles.admin}</option>
                  <option value="staff">{t.roles.staff}</option>
                  <option value="customer">{t.roles.customer}</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl transition-colors"
            >
              {isBn ? 'অ্যাকাউন্ট তৈরি করুন' : 'Create Account'}
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map(user => (
          <div key={user.id} className="bg-white/5 border border-white/10 rounded-3xl p-5 flex flex-col hover:bg-white/10 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  className={`w-12 h-12 rounded-2xl object-cover border-2 ${
                    user.role === 'admin' ? 'border-rose-500/50' : 
                    user.role === 'staff' ? 'border-sky-500/50' : 'border-emerald-500/50'
                  }`}
                />
                <div>
                  <h3 className="text-white font-bold text-sm">{user.name}</h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    {roleIcons[user.role]}
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${
                      user.role === 'admin' ? 'text-rose-400' : 
                      user.role === 'staff' ? 'text-sky-400' : 'text-emerald-400'
                    }`}>
                      {t.roles[user.role]}
                    </span>
                  </div>
                </div>
              </div>
              {currentUser?.id !== user.id && (
                <button
                  onClick={() => handleDeleteUser(user.id, user.name)}
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                  title={isBn ? 'মুছে ফেলুন' : 'Delete User'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Mail className="w-3.5 h-3.5" />
                <span className="truncate">{user.emailOrPhone}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Lock className="w-3.5 h-3.5" />
                <span className="truncate">{isBn ? 'পাসওয়ার্ড: ' : 'Password: '}{user.password}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
