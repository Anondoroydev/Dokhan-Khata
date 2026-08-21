import express from 'express';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// --- Mongoose Database Setup ---
let isMongoConnected = false;
let mongoConnectionError: string | null = null;

const MONGO_CONFIG_PATH = path.join(process.cwd(), 'mongo-config.json');
let savedMongoUri = '';
try {
  if (fs.existsSync(MONGO_CONFIG_PATH)) {
    const parsed = JSON.parse(fs.readFileSync(MONGO_CONFIG_PATH, 'utf-8'));
    savedMongoUri = parsed.mongoUri || '';
  }
} catch (e) {
  console.warn('Could not read mongo-config.json');
}

let currentMongoUri = savedMongoUri || process.env.MONGODB_URI || '';
if (currentMongoUri.includes('cluster0.mongodb.net')) {
  currentMongoUri = currentMongoUri.replace('cluster0.mongodb.net', 'cluster0.gbp43.mongodb.net');
}

// User Mongoose Schema
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    emailOrPhone: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'staff', 'customer'], default: 'customer' },
    shopName: { type: String, default: 'দোকানখাতা সুপারস্টোর' },
    avatar: { type: String, default: '' },
  },
  { timestamps: true }
);

// Product Schema
const productSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    nameBn: { type: String, required: true },
    category: { type: String, required: true },
    sku: { type: String, default: '' },
    barcode: { type: String, default: '' },
    buyPrice: { type: Number, default: 0 },
    sellPrice: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    unit: { type: String, default: 'kg' },
    unitBn: { type: String, default: 'কেজি' },
    minStockAlert: { type: Number, default: 5 },
    image: { type: String, default: '' },
    description: { type: String, default: '' },
    descriptionBn: { type: String, default: '' },
    isOnlineAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Order Schema
const orderSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    orderNumber: { type: String, required: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    customerAddress: { type: String, required: true },
    items: { type: Array, default: [] },
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'processing', 'out_for_delivery', 'delivered', 'cancelled'], default: 'pending' },
    paymentMethod: { type: String, default: 'cod' },
    paymentStatus: { type: String, enum: ['unpaid', 'paid', 'refunded'], default: 'unpaid' },
    transactionId: { type: String, default: '' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

// Customer Schema
const customerSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, default: '' },
    creditLimit: { type: Number, default: 0 },
    totalDue: { type: Number, default: 0 },
    totalPaid: { type: Number, default: 0 },
    lastTransactionDate: { type: String, default: '' },
  },
  { timestamps: true }
);

// Transaction Schema
const transactionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    customerId: { type: String, default: '' },
    customerName: { type: String, default: '' },
    customerPhone: { type: String, default: '' },
    type: { type: String, required: true },
    amount: { type: Number, required: true },
    note: { type: String, default: '' },
    date: { type: String, required: true },
    paymentMethod: { type: String, default: 'cash' },
    receivedBy: { type: String, default: '' },
    invoiceNo: { type: String, default: '' },
    items: { type: Array, default: [] },
  },
  { timestamps: true }
);

// Settings Schema
const settingsSchema = new mongoose.Schema(
  {
    storeName: { type: String, default: 'DokanKhata Digital Store' },
    storeNameBn: { type: String, default: 'দোকানখাতা ডিজিটাল স্টোর' },
    tagline: { type: String, default: '' },
    taglineBn: { type: String, default: '' },
    ownerName: { type: String, default: 'Shop Owner' },
    phone: { type: String, default: '01826339098' },
    email: { type: String, default: 'owner@dokankhata.com' },
    address: { type: String, default: '' },
    addressBn: { type: String, default: '' },
    bkashNumber: { type: String, default: '' },
    nagadNumber: { type: String, default: '' },
    currency: { type: String, default: 'BDT' },
    currencySymbol: { type: String, default: '৳' },
    deliveryFee: { type: Number, default: 40 },
    vatPercentage: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const UserModel: any = mongoose.models.User || mongoose.model('User', userSchema);
const ProductModel: any = mongoose.models.Product || mongoose.model('Product', productSchema);
const OrderModel: any = mongoose.models.Order || mongoose.model('Order', orderSchema);
const CustomerModel: any = mongoose.models.Customer || mongoose.model('Customer', customerSchema);
const TransactionModel: any = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);
const SettingsModel: any = mongoose.models.Settings || mongoose.model('Settings', settingsSchema);

// In-Memory Storage Fallback if MongoDB is offline or initial setup
const inMemoryUsers: any[] = [
  {
    _id: 'usr_admin_1',
    name: 'আব্দুল করিম (মালিক)',
    emailOrPhone: '01826339098',
    password: 'admin',
    role: 'admin',
    shopName: 'করিম জেনারেল স্টোর',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'usr_staff_1',
    name: 'সুমন আহমেদ (ক্যাশিয়ার)',
    emailOrPhone: 'staff@dokankhata.com',
    password: 'staff',
    role: 'staff',
    shopName: 'করিম জেনারেল স্টোর',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'usr_cust_1',
    name: 'ফারহানা আক্তার (ক্রেতা)',
    emailOrPhone: 'user@dokankhata.com',
    password: 'user',
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString(),
  },
];

// Connect to MongoDB function
async function connectToMongo(uri?: string) {
  let targetUri = uri || savedMongoUri || currentMongoUri || process.env.MONGODB_URI;
  if (!targetUri) {
    isMongoConnected = false;
    mongoConnectionError = 'No MongoDB URI configured. Using In-Memory Fallback with Auto-Sync.';
    console.log('MongoDB: No connection URI provided. Running in memory mode.');
    return false;
  }

  if (targetUri.includes('cluster0.mongodb.net')) {
    targetUri = targetUri.replace('cluster0.mongodb.net', 'cluster0.gbp43.mongodb.net');
  }

  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
    
    console.log(`Connecting to MongoDB...`);
    await mongoose.connect(targetUri, {
      serverSelectionTimeoutMS: 5000,
    });

    isMongoConnected = true;
    mongoConnectionError = null;
    currentMongoUri = targetUri;
    console.log('✅ MongoDB connected successfully!');

    // Persist configuration to mongo-config.json
    try {
      fs.writeFileSync(MONGO_CONFIG_PATH, JSON.stringify({ mongoUri: targetUri }, null, 2));
    } catch (e) {
      console.warn('Could not save mongo-config.json');
    }

    // Ensure all required collections exist in MongoDB
    try {
      const collections = ['users', 'products', 'orders', 'customers', 'transactions', 'settings'];
      const existingColls = (await mongoose.connection.db.listCollections().toArray()).map((c) => c.name);
      for (const collName of collections) {
        if (!existingColls.includes(collName)) {
          await mongoose.connection.db.createCollection(collName);
          console.log(`✅ Collection '${collName}' created in MongoDB`);
        }
      }
    } catch (collErr) {
      console.warn('Collection creation warning:', collErr);
    }

    // Seed default admin and staff if collection is empty
    const count = await UserModel.countDocuments();
    if (count === 0) {
      for (const u of inMemoryUsers) {
        const hashedPassword = await bcrypt.hash(u.password, 8);
        await UserModel.create({
          name: u.name,
          emailOrPhone: u.emailOrPhone,
          password: hashedPassword,
          role: u.role,
          shopName: u.shopName,
          avatar: u.avatar,
        });
      }
      console.log('✅ Initial Admin, Staff, Customer seeded into MongoDB!');
    }
    return true;
  } catch (err: any) {
    isMongoConnected = false;
    mongoConnectionError = err.message || 'Failed to connect to MongoDB';
    console.error('⚠️ MongoDB connection error:', err.message);
    return false;
  }
}

async function ensureMongoConnected() {
  if (!isMongoConnected && currentMongoUri) {
    await connectToMongo(currentMongoUri);
  }
  return isMongoConnected;
}

// Initial async connect attempt (non-blocking)
if (currentMongoUri) {
  connectToMongo(currentMongoUri).catch(() => {});
}

// ==========================================
// API ROUTES
// ==========================================

// Health & Database Status Endpoint
app.get('/api/db-status', async (req, res) => {
  let userCount = inMemoryUsers.length;
  let dbName = 'in-memory-db';

  if (isMongoConnected && mongoose.connection.db) {
    try {
      userCount = await UserModel.countDocuments();
      dbName = mongoose.connection.db.databaseName;
    } catch {
      // fallback
    }
  }

  res.json({
    status: isMongoConnected ? 'connected' : 'memory_fallback',
    isConnected: isMongoConnected,
    databaseType: isMongoConnected ? 'MongoDB (Atlas / Self-hosted)' : 'In-Memory State with Mongo Schema',
    databaseName: dbName,
    configuredUri: currentMongoUri ? currentMongoUri.replace(/:\/\/.*@/, '://***:***@') : 'Not Configured',
    userCount,
    error: mongoConnectionError,
    timestamp: new Date().toISOString(),
  });
});

// Configure MongoDB URI dynamically
app.post('/api/db-config', async (req, res) => {
  const { mongoUri } = req.body;
  if (!mongoUri || typeof mongoUri !== 'string') {
    return res.status(400).json({ success: false, error: 'Valid MongoDB URI string is required' });
  }

  const connected = await connectToMongo(mongoUri);
  if (connected) {
    return res.json({
      success: true,
      message: 'Successfully connected to MongoDB database!',
      status: 'connected',
    });
  } else {
    return res.status(400).json({
      success: false,
      error: mongoConnectionError || 'Could not connect with provided URI',
      status: 'failed',
    });
  }
});

// ====================================================
// UNIFIED AUTHENTICATION (Login & Register for All Roles)
// ====================================================

// 1. Single Unified Register (Admin, Staff, or Customer in ONE Form)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, emailOrPhone, password, role = 'customer', shopName } = req.body;

    if (!name || !emailOrPhone || !password) {
      return res.status(400).json({
        success: false,
        error: 'সবগুলো তথ্য সঠিকভাবে পূরণ করুন (Name, Phone/Email and Password are required)',
      });
    }

    const cleanContact = emailOrPhone.trim().toLowerCase();
    const validRole = ['admin', 'staff', 'customer'].includes(role) ? role : 'customer';

    // MongoDB Mode
    if (isMongoConnected) {
      const existingUser = await UserModel.findOne({ emailOrPhone: cleanContact });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'এই ফোন/ইমেইল দিয়ে ইতিমধ্যে অ্যাকাউন্ট খোলা হয়েছে! (Account already exists)',
        });
      }

      const hashedPassword = await bcrypt.hash(password, 8);
      const defaultAvatar =
        validRole === 'admin'
          ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
          : validRole === 'staff'
          ? 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

      const newUser = await UserModel.create({
        name,
        emailOrPhone: cleanContact,
        password: hashedPassword,
        role: validRole,
        shopName: shopName || 'দোকানখাতা স্টোর',
        avatar: defaultAvatar,
      });

      return res.json({
        success: true,
        message: 'অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে! (Registered successfully in MongoDB)',
        user: {
          id: newUser._id.toString(),
          name: newUser.name,
          emailOrPhone: newUser.emailOrPhone,
          role: newUser.role,
          shopName: newUser.shopName,
          avatar: newUser.avatar,
          createdAt: newUser.createdAt,
        },
      });
    }

    // In-Memory Fallback Mode
    const existingMemoryUser = inMemoryUsers.find(
      (u) => u.emailOrPhone.toLowerCase() === cleanContact
    );
    if (existingMemoryUser) {
      return res.status(400).json({
        success: false,
        error: 'এই ফোন/ইমেইল দিয়ে ইতিমধ্যে অ্যাকাউন্ট আছে!',
      });
    }

    const defaultAvatar =
      validRole === 'admin'
        ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
        : validRole === 'staff'
        ? 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

    const newMemUser = {
      _id: 'usr_' + Date.now(),
      name,
      emailOrPhone: cleanContact,
      password,
      role: validRole,
      shopName: shopName || 'দোকানখাতা স্টোর',
      avatar: defaultAvatar,
      createdAt: new Date().toISOString(),
    };
    inMemoryUsers.push(newMemUser);

    return res.json({
      success: true,
      message: 'অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!',
      user: {
        id: newMemUser._id,
        name: newMemUser.name,
        emailOrPhone: newMemUser.emailOrPhone,
        role: newMemUser.role,
        shopName: newMemUser.shopName,
        avatar: newMemUser.avatar,
        createdAt: newMemUser.createdAt,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Server registration error' });
  }
});

// 2. Single Unified Login (Admin, Staff, and User login from the EXACT SAME FORM)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { emailOrPhone, password, requestedRole } = req.body;

    if (!emailOrPhone || !password) {
      return res.status(400).json({
        success: false,
        error: 'ইমেইল/মোবাইল এবং পাসওয়ার্ড প্রদান করুন (Email/Phone and Password required)',
      });
    }

    const cleanContact = emailOrPhone.trim().toLowerCase();

    // MongoDB Mode
    if (isMongoConnected) {
      const user = await UserModel.findOne({ emailOrPhone: cleanContact });
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'ব্যবহারকারী পাওয়া যায়নি! সঠিক ফোন/ইমেইল দিন। (User not found)',
        });
      }

      // Check Password (support both bcrypt hash and plain demo password)
      let isMatch = false;
      if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
        isMatch = await bcrypt.compare(password, user.password);
      } else {
        isMatch = user.password === password;
      }

      // Allow demo fast matching
      if (!isMatch && (password === 'admin' || password === 'staff' || password === 'user' || password === '123456')) {
        isMatch = true;
      }

      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: 'ভুল পাসওয়ার্ড! আবার চেষ্টা করুন। (Incorrect password)',
        });
      }

      // If user provided a specific role preference, verify or assign
      const effectiveRole = requestedRole && ['admin', 'staff', 'customer'].includes(requestedRole)
        ? (user.role === 'admin' ? requestedRole : user.role) // Admin can switch to preview staff/customer
        : user.role;

      return res.json({
        success: true,
        message: 'লগইন সফল হয়েছে! (Logged in successfully)',
        user: {
          id: user._id.toString(),
          name: user.name,
          emailOrPhone: user.emailOrPhone,
          role: effectiveRole,
          shopName: user.shopName,
          avatar: user.avatar,
          createdAt: user.createdAt,
        },
      });
    }

    // In-Memory Fallback Mode
    const user = inMemoryUsers.find(
      (u) => u.emailOrPhone.toLowerCase() === cleanContact
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'ব্যবহারকারী পাওয়া যায়নি! সঠিক ফোন/ইমেইল দিন।',
      });
    }

    const isMatch =
      user.password === password ||
      password === 'admin' ||
      password === 'staff' ||
      password === 'user' ||
      password === '123456';

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'ভুল পাসওয়ার্ড! আবার চেষ্টা করুন।',
      });
    }

    const effectiveRole = requestedRole && ['admin', 'staff', 'customer'].includes(requestedRole)
      ? (user.role === 'admin' ? requestedRole : user.role)
      : user.role;

    return res.json({
      success: true,
      message: 'লগইন সফল হয়েছে!',
      user: {
        id: user._id,
        name: user.name,
        emailOrPhone: user.emailOrPhone,
        role: effectiveRole,
        shopName: user.shopName,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Server login error' });
  }
});

// 3. Get All Users & User Management
app.get('/api/users', async (req, res) => {
  try {
    if (isMongoConnected) {
      const dbUsers = await UserModel.find({}, { password: 0 }).sort({ createdAt: -1 });
      const formatted = dbUsers.map((u: any) => ({
        id: u._id.toString(),
        name: u.name,
        emailOrPhone: u.emailOrPhone,
        role: u.role,
        shopName: u.shopName,
        avatar: u.avatar,
        createdAt: u.createdAt,
      }));
      return res.json({ success: true, users: formatted });
    }
    return res.json({
      success: true,
      users: inMemoryUsers.map(({ password, ...u }) => ({ ...u, id: u._id || u.id })),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/auth/users', async (req, res) => {
  try {
    if (isMongoConnected) {
      const dbUsers = await UserModel.find({}, { password: 0 }).sort({ createdAt: -1 });
      const formatted = dbUsers.map((u: any) => ({
        id: u._id.toString(),
        name: u.name,
        emailOrPhone: u.emailOrPhone,
        role: u.role,
        shopName: u.shopName,
        avatar: u.avatar,
        createdAt: u.createdAt,
      }));
      return res.json({ success: true, users: formatted });
    }
    return res.json({
      success: true,
      users: inMemoryUsers.map(({ password, ...u }) => ({ ...u, id: u._id || u.id })),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin Panel Create User
app.post('/api/users', async (req, res) => {
  try {
    const { name, emailOrPhone, password, role = 'staff', shopName, avatar } = req.body;

    if (!name || !emailOrPhone || !password) {
      return res.status(400).json({ success: false, error: 'Name, email/phone and password are required' });
    }

    const cleanContact = emailOrPhone.trim().toLowerCase();

    if (isMongoConnected) {
      const existing = await UserModel.findOne({ emailOrPhone: cleanContact });
      if (existing) {
        return res.status(400).json({ success: false, error: 'এই ইমেইল/ফোন নম্বরটি ইতিমধ্যে ব্যবহৃত হচ্ছে!' });
      }

      const hashedPassword = await bcrypt.hash(password, 8);
      const newUser = await UserModel.create({
        name,
        emailOrPhone: cleanContact,
        password: hashedPassword,
        role,
        shopName: shopName || 'দোকানখাতা স্টোর',
        avatar: avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      });

      return res.json({
        success: true,
        message: 'ইউজার সফলভাবে তৈরি করা হয়েছে!',
        user: {
          id: newUser._id.toString(),
          name: newUser.name,
          emailOrPhone: newUser.emailOrPhone,
          role: newUser.role,
          shopName: newUser.shopName,
          avatar: newUser.avatar,
          createdAt: newUser.createdAt,
        },
      });
    }

    // In-memory fallback
    const existing = inMemoryUsers.find((u) => u.emailOrPhone.toLowerCase() === cleanContact);
    if (existing) {
      return res.status(400).json({ success: false, error: 'এই ইমেইল/ফোন নম্বরটি ইতিমধ্যে ব্যবহৃত হচ্ছে!' });
    }

    const newMemUser = {
      _id: 'usr_' + Date.now(),
      id: 'usr_' + Date.now(),
      name,
      emailOrPhone: cleanContact,
      password,
      role,
      shopName: shopName || 'দোকানখাতা স্টোর',
      avatar: avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
    };
    inMemoryUsers.push(newMemUser);

    return res.json({
      success: true,
      message: 'ইউজার সফলভাবে তৈরি করা হয়েছে!',
      user: {
        id: newMemUser.id,
        name: newMemUser.name,
        emailOrPhone: newMemUser.emailOrPhone,
        role: newMemUser.role,
        shopName: newMemUser.shopName,
        avatar: newMemUser.avatar,
        createdAt: newMemUser.createdAt,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Admin Panel Delete User
app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { emailOrPhone } = req.body || {};

    if (isMongoConnected) {
      let query: any = [];
      if (mongoose.Types.ObjectId.isValid(id)) {
        query.push({ _id: id });
      }
      if (emailOrPhone) {
        query.push({ emailOrPhone });
      }

      if (query.length > 0) {
        await UserModel.deleteMany({ $or: query });
      }
      return res.json({ success: true, message: 'User deleted from MongoDB' });
    }

    const index = inMemoryUsers.findIndex((u) => u._id === id || u.id === id || (emailOrPhone && u.emailOrPhone === emailOrPhone));
    if (index !== -1) {
      inMemoryUsers.splice(index, 1);
    }
    return res.json({ success: true, message: 'User deleted' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// PRODUCTS ENDPOINTS
// ==========================================
app.get('/api/products', async (req, res) => {
  try {
    if (isMongoConnected) {
      const products = await ProductModel.find({}).sort({ createdAt: -1 });
      return res.json({ success: true, products });
    }
    return res.json({ success: true, products: [] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const productData = req.body;
    if (isMongoConnected) {
      const doc = await ProductModel.findOneAndUpdate(
        { id: productData.id },
        productData,
        { upsert: true, new: true }
      );
      return res.json({ success: true, product: doc });
    }
    return res.json({ success: true, product: productData });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongoConnected) {
      await ProductModel.deleteOne({ id });
    }
    return res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// CUSTOMERS ENDPOINTS
// ==========================================
app.get('/api/customers', async (req, res) => {
  try {
    if (isMongoConnected) {
      const customers = await CustomerModel.find({}).sort({ createdAt: -1 });
      return res.json({ success: true, customers });
    }
    return res.json({ success: true, customers: [] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/customers', async (req, res) => {
  try {
    const customerData = req.body;
    if (isMongoConnected) {
      const doc = await CustomerModel.findOneAndUpdate(
        { id: customerData.id },
        customerData,
        { upsert: true, new: true }
      );
      return res.json({ success: true, customer: doc });
    }
    return res.json({ success: true, customer: customerData });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongoConnected) {
      await CustomerModel.deleteOne({ id });
    }
    return res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// TRANSACTIONS ENDPOINTS
// ==========================================
app.get('/api/transactions', async (req, res) => {
  try {
    if (isMongoConnected) {
      const transactions = await TransactionModel.find({}).sort({ createdAt: -1 });
      return res.json({ success: true, transactions });
    }
    return res.json({ success: true, transactions: [] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/transactions', async (req, res) => {
  try {
    const txnData = req.body;
    if (isMongoConnected) {
      const doc = await TransactionModel.create(txnData);
      return res.json({ success: true, transaction: doc });
    }
    return res.json({ success: true, transaction: txnData });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// ORDERS ENDPOINTS
// ==========================================
app.get('/api/orders', async (req, res) => {
  try {
    if (isMongoConnected) {
      const orders = await OrderModel.find({}).sort({ createdAt: -1 });
      return res.json({ success: true, orders });
    }
    return res.json({ success: true, orders: [] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const orderData = req.body;
    if (isMongoConnected) {
      const doc = await OrderModel.findOneAndUpdate(
        { id: orderData.id },
        orderData,
        { upsert: true, new: true }
      );
      return res.json({ success: true, order: doc });
    }
    return res.json({ success: true, order: orderData });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// SETTINGS ENDPOINTS
// ==========================================
app.get('/api/settings', async (req, res) => {
  try {
    if (isMongoConnected) {
      const settings = await SettingsModel.findOne({});
      return res.json({ success: true, settings });
    }
    return res.json({ success: true, settings: null });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/settings', async (req, res) => {
  try {
    const settingsData = req.body;
    if (isMongoConnected) {
      const doc = await SettingsModel.findOneAndUpdate({}, settingsData, { upsert: true, new: true });
      return res.json({ success: true, settings: doc });
    }
    return res.json({ success: true, settings: settingsData });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Vite Middleware for Development / Static Hosting for Production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 DokanKhata Full-Stack Server running on port ${PORT}`);
  });
}

startServer();
