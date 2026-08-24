export type Language = 'bn' | 'en';

export type UserRole = 'admin' | 'staff' | 'customer';

export interface User {
  id: string;
  name: string;
  emailOrPhone: string;
  role: UserRole;
  password?: string;
  avatar?: string;
  shopName?: string;
  createdAt: string;
  
  // Professional Profile Fields (Personal)
  bio?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  dateOfBirth?: string;
  
  // Professional Profile Fields (Contact)
  altPhone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  
  // Professional Profile Fields (Business - Optional for customers, useful for B2B)
  shopAddress?: string;
  taxId?: string; // e.g., BIN / TIN
  tradeLicense?: string;
  businessType?: 'retail' | 'wholesale' | 'distributor' | 'agency' | 'other';
  website?: string;
  
  // Professional Profile Fields (Social)
  facebookUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  instagramUrl?: string;
  
  // Professional Profile Fields (Preferences)
  currencyPref?: string;
  timezone?: string;
  languagePref?: Language;
  
  // Notification Preferences
  emailAlerts?: boolean;
  smsAlerts?: boolean;
  marketingEmails?: boolean;
}

export type ProductCategory = 
  | 'grocery' 
  | 'beverage' 
  | 'snacks' 
  | 'personal_care' 
  | 'dairy' 
  | 'spices' 
  | 'household';

export interface Product {
  id: string;
  name: string;
  nameBn: string;
  category: ProductCategory;
  sku: string;
  barcode: string;
  buyPrice: number;
  sellPrice: number;
  stock: number;
  unit: string;
  unitBn: string;
  minStockAlert: number;
  image: string;
  description?: string;
  descriptionBn?: string;
  isOnlineAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  creditLimit: number;
  totalDue: number; // Positive = Customer owes shop (বাকী)
  totalPaid: number;
  avatar?: string;
  createdAt: string;
  lastTransactionDate?: string;
}

export type TransactionType = 'due_sale' | 'payment_received' | 'cash_sale' | 'expense' | 'return';

export interface Transaction {
  id: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  type: TransactionType;
  amount: number;
  discount?: number;
  note: string;
  date: string; // ISO string
  items?: {
    productId: string;
    productName: string;
    productNameBn: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  paymentMethod: 'cash' | 'bkash' | 'nagad' | 'rocket' | 'upay' | 'card' | 'due';
  receivedBy: string; // Staff/Admin name
  invoiceNo?: string;
  transactionId?: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'packing' | 'out_for_delivery' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: string;
  productName: string;
  productNameBn: string;
  quantity: number;
  unitPrice: number;
  total: number;
  image: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  totalAmount: number;
  paymentMethod: 'cod' | 'bkash' | 'nagad' | 'card';
  paymentStatus: 'paid' | 'partial' | 'unpaid';
  paidAmount?: number;
  transactionId?: string;
  status: OrderStatus;
  orderDate: string;
  deliveryNotes?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  text: string;
  timestamp: string;
  isRead: boolean;
  orderReferenceId?: string;
}

export interface StoreSettings {
  storeName: string;
  storeNameBn: string;
  tagline: string;
  taglineBn: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  addressBn: string;
  bkashNumber: string;
  nagadNumber: string;
  currency: string;
  currencySymbol: string;
  deliveryFee: number;
  lowStockThresholdDefault: number;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  actionBn: string;
  details: string;
  timestamp: string;
}

export interface AppNotification {
  id: string;
  title: string;
  titleBn: string;
  message: string;
  messageBn: string;
  type: 'order' | 'stock' | 'due' | 'system';
  timestamp: string;
  read: boolean;
  link?: string;
}

export interface MongoStatus {
  status: 'connected' | 'memory_fallback' | 'checking';
  isConnected: boolean;
  databaseType: string;
  databaseName?: string;
  configuredUri?: string;
  userCount?: number;
  error?: string | null;
}

