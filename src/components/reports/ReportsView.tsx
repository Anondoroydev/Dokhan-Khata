import React, { useState } from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownLeft, 
  DollarSign, 
  Calendar, 
  PieChart as PieIcon,
  CheckCircle2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { useStore } from '../../context/StoreContext';

export const ReportsView: React.FC = () => {
  const { transactions, products, customers, settings, language, t } = useStore();
  const isBn = language === 'bn';

  const [selectedPeriod, setSelectedPeriod] = useState<'thisMonth' | 'lastMonth' | 'thisYear'>('thisMonth');
  const [showPDFPreview, setShowPDFPreview] = useState(false);

  // Financial aggregates
  const totalSalesRevenue = transactions
    .filter((t) => t.type === 'cash_sale' || t.type === 'due_sale')
    .reduce((sum, t) => sum + t.amount, 0);

  // Estimated COGS based on approx 20% average wholesale profit margin
  const totalCOGS = Math.round(totalSalesRevenue * 0.8);
  const grossProfit = totalSalesRevenue - totalCOGS;
  const profitMarginPercent = totalSalesRevenue > 0 ? Math.round((grossProfit / totalSalesRevenue) * 100) : 20;

  const totalBakiGiven = transactions
    .filter((t) => t.type === 'due_sale')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalBakiCollected = transactions
    .filter((t) => t.type === 'payment_received')
    .reduce((sum, t) => sum + t.amount, 0);

  const netCashInflow = transactions
    .filter((t) => t.paymentMethod !== 'due' && (t.type === 'cash_sale' || t.type === 'payment_received'))
    .reduce((sum, t) => sum + t.amount, 0);

  // Category breakdown chart data
  const categoryData = [
    { name: isBn ? 'মুদি ও চাল' : 'Grocery', value: 45, color: '#059669' },
    { name: isBn ? 'তেল ও ঘি' : 'Edible Oil', value: 25, color: '#0284c7' },
    { name: isBn ? 'পানীয় ও চা' : 'Beverages', value: 15, color: '#d97706' },
    { name: isBn ? 'স্ন্যাকস' : 'Snacks', value: 10, color: '#7c3aed' },
    { name: isBn ? 'অন্যান্য' : 'Others', value: 5, color: '#64748b' },
  ];

  // Daily revenue bar data
  const dailyData = [
    { day: isBn ? '১-৫ তারিখ' : 'Day 1-5', revenue: 24500, profit: 4900 },
    { day: isBn ? '৬-১০ তারিখ' : 'Day 6-10', revenue: 31200, profit: 6240 },
    { day: isBn ? '১১-১৫ তারিখ' : 'Day 11-15', revenue: 28400, profit: 5680 },
    { day: isBn ? '১৬-২০ তারিখ' : 'Day 16-20', revenue: 38900, profit: 7780 },
    { day: isBn ? '২১-২৫ তারিখ' : 'Day 21-25', revenue: 34100, profit: 6820 },
    { day: isBn ? '২৬-৩১ তারিখ' : 'Day 26-31', revenue: 42300, profit: 8460 },
  ];

  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Invoice No,Date,Customer,Type,Amount,Payment Method,Received By\n';

    transactions.forEach((t) => {
      const row = [
        t.invoiceNo || t.id,
        t.date,
        `"${t.customerName || 'Counter'}"`,
        t.type,
        t.amount,
        t.paymentMethod,
        `"${t.receivedBy}"`
      ].join(',');
      csvContent += row + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `dokankhata_financial_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 shadow-xl shadow-black/20 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-black text-lg text-white">{t.reports.title}</h2>
          <p className="text-xs text-slate-400 mt-0.5">{t.reports.subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Period Selector */}
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-3 py-2 text-xs font-bold border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-slate-900 text-white"
          >
            <option value="thisMonth" className="bg-slate-900 text-white">{t.reports.thisMonth}</option>
            <option value="lastMonth" className="bg-slate-900 text-white">{t.reports.lastMonth}</option>
            <option value="thisYear" className="bg-slate-900 text-white">{t.reports.thisYear}</option>
          </select>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 text-xs font-bold text-slate-200 bg-white/10 border border-white/10 hover:bg-white/20 rounded-xl transition-all flex items-center gap-1.5 shadow-2xs"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>{t.reports.exportCSV}</span>
          </button>

          <button
            onClick={() => setShowPDFPreview(true)}
            className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-950/40 border border-emerald-400/30"
          >
            <Printer className="w-4 h-4" />
            <span>{t.reports.generatePDF}</span>
          </button>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-slate-900/60 backdrop-blur-xl p-5 rounded-3xl border border-white/10 shadow-xl shadow-black/20">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {t.reports.totalRevenue}
          </span>
          <p className="text-2xl font-black text-white font-mono mt-2">
            ৳{totalSalesRevenue.toLocaleString()}
          </p>
          <span className="text-[11px] text-emerald-400 font-semibold mt-1 block">
            +18% {isBn ? 'আগের মাসের তুলনায়' : 'vs last period'}
          </span>
        </div>

        {/* Cost of Goods Sold */}
        <div className="bg-slate-900/60 backdrop-blur-xl p-5 rounded-3xl border border-white/10 shadow-xl shadow-black/20">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {t.reports.totalCost}
          </span>
          <p className="text-2xl font-black text-slate-300 font-mono mt-2">
            ৳{totalCOGS.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {isBn ? 'পণ্য সরবরাহ বাবদ ব্যয়' : 'Wholesale procurement cost'}
          </span>
        </div>

        {/* Gross Profit */}
        <div className="bg-slate-900/60 backdrop-blur-xl p-5 rounded-3xl border border-white/10 shadow-xl shadow-black/20">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {t.reports.grossProfit}
          </span>
          <p className="text-2xl font-black text-emerald-400 font-mono mt-2">
            ৳{grossProfit.toLocaleString()}
          </p>
          <span className="text-[11px] text-emerald-400 font-bold mt-1 block">
            {profitMarginPercent}% {isBn ? 'গড় মুনাফার হার' : 'Profit Margin'}
          </span>
        </div>

        {/* Net Cash Flow */}
        <div className="bg-slate-900/60 backdrop-blur-xl p-5 rounded-3xl border border-white/10 shadow-xl shadow-black/20">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {t.reports.netCashFlow}
          </span>
          <p className="text-2xl font-black text-sky-400 font-mono mt-2">
            ৳{netCashInflow.toLocaleString()}
          </p>
          <span className="text-[11px] text-sky-400 font-medium mt-1 block">
            {isBn ? 'নগদ ক্যাশ ও ডিজিটাল পেমেন্ট' : 'Direct cash collection'}
          </span>
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Chart */}
        <div className="lg:col-span-2 bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 shadow-xl shadow-black/20 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-white">{t.reports.dailySalesTrend}</h3>
              <p className="text-xs text-slate-400">{isBn ? 'মাসিক ধাপভিত্তিক বিক্রয় ও নীট লাভ' : 'Monthly breakdown trend'}</p>
            </div>
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold rounded-full">
              ৳{totalSalesRevenue.toLocaleString()} Total
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(value: any) => [`৳${value}`, '']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)', fontSize: '12px', color: '#fff' }}
                />
                <Bar dataKey="revenue" name={isBn ? 'মোট বিক্রি' : 'Revenue'} fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="profit" name={isBn ? 'নীট লাভ' : 'Profit'} fill="#38bdf8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Pie Chart */}
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 shadow-xl shadow-black/20 p-6 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-white">{t.reports.salesByCategory}</h3>
            <p className="text-xs text-slate-400">{isBn ? 'ক্যাটাগরি শেয়ার শতাংশ' : 'Revenue percentage share'}</p>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)', fontSize: '12px', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-white/10">
            {categoryData.map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-slate-300">{cat.name}</span>
                </div>
                <span className="font-mono font-bold text-white">{cat.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Printable Monthly Financial Statement Modal */}
      {showPDFPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-slate-900/95 backdrop-blur-2xl rounded-3xl border border-white/15 shadow-2xl shadow-black/50 p-6 sm:p-8 overflow-y-auto max-h-[90vh] flex flex-col justify-between">
            <div>
              {/* Header Actions */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-sm sm:text-base text-white">
                    {t.reports.financialStatement}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrintReport}
                    className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-emerald-950/40 border border-emerald-400/30"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>{isBn ? 'প্রিন্ট / PDF সংরক্ষণ' : 'Print / Save PDF'}</span>
                  </button>
                  <button
                    onClick={() => setShowPDFPreview(false)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Printable Statement Document */}
              <div id="financial-statement-print" className="py-6 space-y-6 text-slate-800 bg-white p-6 rounded-2xl">
                {/* Statement Header */}
                <div className="text-center pb-4 border-b border-slate-200">
                  <h2 className="text-lg sm:text-xl font-black text-slate-900">
                    {isBn ? settings.storeNameBn || settings.storeName : settings.storeName}
                  </h2>
                  <p className="text-xs text-slate-600 mt-1">
                    {isBn ? settings.addressBn || settings.address : settings.address} • ফোন: {settings.phone}
                  </p>
                  <div className="inline-block mt-3 px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-700">
                    {isBn ? 'মাসিক লাভ-লোকসান ও আর্থিক বিবরণী (P&L Report)' : 'Monthly Profit & Loss Financial Statement'}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {t.reports.reportGeneratedOn}: {new Date().toLocaleString()}
                  </p>
                </div>

                {/* Financial Table */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs">
                  <div className="bg-slate-100 px-4 py-2.5 font-bold text-slate-700 border-b border-slate-200">
                    {isBn ? 'আর্থিক বিবরণী উপাদান' : 'Financial Statement Breakdown'}
                  </div>
                  <div className="divide-y divide-slate-100">
                    <div className="px-4 py-3 flex justify-between">
                      <span className="font-semibold text-slate-900">{t.reports.totalRevenue} (Sales)</span>
                      <span className="font-mono font-bold text-slate-900">৳{totalSalesRevenue.toLocaleString()}</span>
                    </div>
                    <div className="px-4 py-3 flex justify-between text-slate-600">
                      <span>(-) {t.reports.totalCost} (Wholesale Purchase)</span>
                      <span className="font-mono">৳{totalCOGS.toLocaleString()}</span>
                    </div>
                    <div className="px-4 py-3 flex justify-between bg-emerald-50/50 font-bold text-emerald-800">
                      <span>(=) {t.reports.grossProfit} (Gross Profit)</span>
                      <span className="font-mono text-sm">৳{grossProfit.toLocaleString()} ({profitMarginPercent}%)</span>
                    </div>
                    <div className="px-4 py-3 flex justify-between text-slate-600">
                      <span>(+) {t.reports.totalBakiCollected} (Payment Collections)</span>
                      <span className="font-mono text-emerald-600">+৳{totalBakiCollected.toLocaleString()}</span>
                    </div>
                    <div className="px-4 py-3 flex justify-between text-slate-600">
                      <span>(-) {t.reports.totalBakiGiven} (Due Purchases by Customers)</span>
                      <span className="font-mono text-rose-600">-৳{totalBakiGiven.toLocaleString()}</span>
                    </div>
                    <div className="px-4 py-3.5 flex justify-between bg-slate-900 text-white font-black text-sm">
                      <span>{t.reports.netCashFlow} (Total Cash Inflow)</span>
                      <span className="font-mono text-emerald-400">৳{netCashInflow.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Audit Signature Block */}
                <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs text-slate-600">
                  <div>
                    <div className="border-t border-slate-300 pt-1 font-bold">
                      {isBn ? 'দোকান ব্যবস্থাপক / ক্যাশিয়ার' : 'Prepared By (Cashier)'}
                    </div>
                  </div>
                  <div>
                    <div className="border-t border-slate-300 pt-1 font-bold">
                      {isBn ? 'দোকান মালিকের স্বাক্ষর' : 'Authorized Signature (Owner)'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setShowPDFPreview(false)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-slate-200 rounded-xl text-xs font-bold transition-colors"
              >
                {t.common.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
