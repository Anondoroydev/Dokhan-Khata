import { Product, Customer, Transaction, Order, StoreSettings, User } from './types';

export const initialStoreSettings: StoreSettings = {
  storeName: 'DokanKhata Digital Store',
  storeNameBn: 'দোকানখাতা ডিজিটাল স্টোর',
  tagline: 'Fresh Groceries & Wholesale POS',
  taglineBn: 'নিত্য প্রয়োজনীয় পণ্য ও ডিজিটাল হিসাব খাতা',
  ownerName: 'Shop Owner',
  phone: '01826339098',
  email: 'owner@dokankhata.com',
  address: 'Dhaka, Bangladesh',
  addressBn: 'ঢাকা, বাংলাদেশ',
  bkashNumber: '01826339098 (Merchant)',
  nagadNumber: '01826339098 (Personal)',
  currency: 'BDT',
  currencySymbol: '৳',
  deliveryFee: 40,
  lowStockThresholdDefault: 10,
};

export const initialProducts: Product[] = [];

export const initialCustomers: Customer[] = [];

export const initialTransactions: Transaction[] = [];

export const initialOrders: Order[] = [];

export const initialUsers: User[] = [
  {
    id: 'user-admin',
    name: 'Shop Owner (দোকান মালিক)',
    emailOrPhone: '01826339098',
    role: 'admin',
    password: 'admin',
    shopName: 'DokanKhata Digital Store',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-08-01T00:00:00Z',
  },
  {
    id: 'user-staff',
    name: 'Staff / Cashier (ক্যাশিয়ার)',
    emailOrPhone: 'staff@dokankhata.com',
    role: 'staff',
    password: 'staff',
    shopName: 'DokanKhata Digital Store',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-08-05T00:00:00Z',
  },
  {
    id: 'user-customer',
    name: 'Valued Customer (গ্রাহক)',
    emailOrPhone: 'user@dokankhata.com',
    role: 'customer',
    password: 'user',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-08-10T00:00:00Z',
  },
];


