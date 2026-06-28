"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Trash2, 
  Edit, 
  Plus, 
  Search, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Save, 
  X,
  Globe,
  Loader2,
  Activity,
  Zap,
  ChevronRight,
  BarChart3,
  PieChart,
  LineChart,
  Filter,
  ChevronLeft,
  Eye,
  Copy,
  AlertCircle,
  CheckCircle2,
  RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "../../css/Admin/Rates.css";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface RateInstrument {
  rate_id?: number;
  pair: string;
  name: string;
  price: string;
  change: string;
  trend: "up" | "down";
  volatility: "Low" | "Med" | "High";
  volume: string;
  category: "Forex" | "Crypto" | "Commodities";
}

// Loading Skeleton Components
const HeaderSkeleton = () => (
  <div className="relative group">
    <div className="relative bg-gradient-to-br from-[#11111a] to-[#0c0c12] rounded-[2.5rem] p-8 md:p-10 border border-white/10 shadow-2xl overflow-hidden">
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div className="flex flex-col gap-3 w-full md:w-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full w-fit">
            <div className="w-3 h-3 rounded-full bg-indigo-400/50 animate-pulse" />
            <div className="h-3 w-40 bg-indigo-400/20 rounded animate-pulse" />
          </div>
          <div className="h-12 sm:h-14 lg:h-16 w-64 bg-white/5 rounded-lg animate-pulse" />
          <div className="h-3 w-96 bg-white/5 rounded animate-pulse" />
        </div>
        <div className="h-12 w-44 bg-indigo-500/20 rounded-xl animate-pulse" />
      </div>
    </div>
  </div>
);

const SearchBarSkeleton = () => (
  <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
    <div className="relative w-full sm:w-80">
      <div className="w-full h-12 bg-black/40 border border-white/10 rounded-xl animate-pulse" />
    </div>
    <div className="flex gap-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-8 w-16 bg-white/5 rounded-lg animate-pulse" />
      ))}
    </div>
  </div>
);

const TableRowSkeleton = () => (
  <tr className="border-b border-white/5">
    <td className="px-6 py-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 animate-pulse" />
        <div className="flex flex-col gap-1.5">
          <div className="h-4 w-20 bg-white/5 rounded animate-pulse" />
          <div className="h-3 w-24 bg-white/5 rounded animate-pulse" />
        </div>
      </div>
    </td>
    <td className="px-6 py-4">
      <div className="h-4 w-16 bg-indigo-300/20 rounded animate-pulse" />
    </td>
    <td className="px-6 py-4">
      <div className="h-4 w-16 bg-emerald-400/20 rounded animate-pulse" />
    </td>
    <td className="px-6 py-4">
      <div className="h-6 w-14 bg-amber-500/20 rounded-lg animate-pulse" />
    </td>
    <td className="px-6 py-4">
      <div className="h-4 w-16 bg-indigo-400/20 rounded animate-pulse" />
    </td>
    <td className="px-6 py-4 text-right">
      <div className="flex justify-end gap-2">
        {[1, 2].map((i) => (
          <div key={i} className="w-8 h-8 bg-white/5 rounded-lg animate-pulse" />
        ))}
      </div>
    </td>
  </tr>
);

const TableSkeleton = () => (
  <div className="bg-gradient-to-br from-[#11111a] to-[#0c0c12] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full text-left font-mono">
        <thead>
          <tr className="border-b border-white/10 bg-white/5">
            <th className="px-6 py-4">
              <div className="h-3 w-20 bg-slate-400/20 rounded animate-pulse" />
            </th>
            <th className="px-6 py-4">
              <div className="h-3 w-24 bg-slate-400/20 rounded animate-pulse" />
            </th>
            <th className="px-6 py-4">
              <div className="h-3 w-20 bg-slate-400/20 rounded animate-pulse" />
            </th>
            <th className="px-6 py-4">
              <div className="h-3 w-20 bg-slate-400/20 rounded animate-pulse" />
            </th>
            <th className="px-6 py-4">
              <div className="h-3 w-16 bg-slate-400/20 rounded animate-pulse" />
            </th>
            <th className="px-6 py-4 text-right">
              <div className="h-3 w-16 bg-slate-400/20 rounded animate-pulse ml-auto" />
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {[1, 2, 3, 4, 5].map((i) => (
            <TableRowSkeleton key={i} />
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const PaginationSkeleton = () => (
  <div className="bg-gradient-to-br from-[#11111a] to-[#0c0c12] border border-white/10 rounded-xl p-4 flex items-center justify-between flex-wrap gap-4">
    <div className="h-3 w-48 bg-white/5 rounded animate-pulse" />
    <div className="flex items-center gap-1.5">
      <div className="h-8 w-16 bg-white/5 rounded-lg animate-pulse" />
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-8 w-8 bg-white/5 rounded-lg animate-pulse" />
      ))}
      <div className="h-8 w-16 bg-white/5 rounded-lg animate-pulse" />
    </div>
  </div>
);

// Empty State Component - Giữ chiều cao cố định
const EmptyState = () => (
  <tr>
    <td colSpan={6} className="px-6 py-8">
      <div className="flex flex-col items-center gap-3 py-8">
        <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
          <AlertCircle size={32} className="text-indigo-400" />
        </div>
        <p className="text-slate-400 font-mono text-[10px] uppercase tracking-widest">No assets matching signal criteria</p>
      </div>
    </td>
  </tr>
);

// Row Component
const RateRow = ({ rate, idx, onEdit, onDelete, hoveredRow, setHoveredRow }: any) => (
  <motion.tr 
    key={rate.rate_id || rate.pair || idx} 
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: idx * 0.05 }}
    onMouseEnter={() => setHoveredRow(rate.pair)}
    onMouseLeave={() => setHoveredRow(null)}
    className="hover:bg-white/5 transition-all group"
  >
    <td className="px-6 py-4">
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center">
            <DollarSign size={12} className="text-indigo-400" />
          </div>
          <div>
            <span className="text-white font-black text-sm font-sans tracking-tight">{rate.pair}</span>
            <span className="text-[7px] text-slate-500 font-mono block uppercase">{rate.name}</span>
          </div>
        </div>
      </div>
    </td>
    <td className="px-6 py-4">
      <span className="text-indigo-300 font-black text-sm">{rate.price}</span>
    </td>
    <td className="px-6 py-4">
      <div className={`flex items-center gap-1.5 font-black text-[9px] ${rate.trend === "up" ? "text-emerald-400" : "text-rose-400"}`}>
        {rate.trend === "up" ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
        {rate.change}
      </div>
    </td>
    <td className="px-6 py-4">
      <span className={`px-2 py-1 rounded-lg text-[7px] font-black border uppercase ${getVolatilityColor(rate.volatility)}`}>
        {rate.volatility}
      </span>
    </td>
    <td className="px-6 py-4">
      <div className="flex items-center gap-1.5">
        {getCategoryIcon(rate.category)}
        <span className="text-indigo-400 text-[8px] font-black uppercase tracking-widest">{rate.category}</span>
      </div>
    </td>
    <td className="px-6 py-4 text-right">
      <div className="flex justify-end gap-2">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onEdit(rate)} 
          className="p-2 bg-white/5 rounded-lg text-slate-400 hover:text-indigo-400 transition-all border border-transparent hover:border-indigo-500/30"
        >
          <Edit size={12} />
        </motion.button>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onDelete(rate.pair)} 
          className="p-2 bg-white/5 rounded-lg text-slate-400 hover:text-rose-400 transition-all border border-transparent hover:border-rose-500/30"
        >
          <Trash2 size={12} />
        </motion.button>
      </div>
    </td>
  </motion.tr>
);

// Helper functions
const getVolatilityColor = (vol: string) => {
  switch(vol) {
    case "High": return "bg-rose-500/15 border-rose-500/30 text-rose-400";
    case "Med": return "bg-amber-500/15 border-amber-500/30 text-amber-400";
    default: return "bg-emerald-500/15 border-emerald-500/30 text-emerald-400";
  }
};

const getCategoryIcon = (category: string) => {
  switch(category) {
    case "Forex": return <Globe size={10} />;
    case "Crypto": return <Zap size={10} />;
    default: return <BarChart3 size={10} />;
  }
};

export default function RatesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [rates, setRates] = useState<RateInstrument[]>([]);
  const [successToast, setSuccessToast] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [rateModal, setRateModal] = useState<{ show: boolean; mode: "create" | "edit"; data: RateInstrument | null }>({
    show: false, mode: "create", data: null
  });

  const [rateForm, setRateForm] = useState<RateInstrument>({
    pair: "", name: "", price: "", change: "+0.00%", trend: "up", volatility: "Med", volume: "$1.50B", category: "Forex"
  });

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/login");
      return;
    }
    const user = JSON.parse(userStr);
    if (user.role !== "admin") {
      router.push("/");
      return;
    }

    fetchRates();
  }, [router]);

  const fetchRates = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/rates/current`);
      const data = await response.json();
      if (data.success) {
        const transformedRates = data.rates.map((rate: any) => ({
          rate_id: rate.rate_id,
          pair: rate.pair,
          name: rate.name,
          price: rate.price,
          change: rate.change,
          trend: rate.trend,
          volatility: rate.volatility,
          volume: rate.volume,
          category: getCategoryFromPair(rate.pair.split('/')[0], rate.pair.split('/')[1])
        }));
        setRates(transformedRates);
      }
    } catch (error) {
      console.error('Error fetching rates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryFromPair = (base: string, target: string): "Forex" | "Crypto" | "Commodities" => {
    const cryptoCurrencies = ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'DOT', 'MATIC', 'LINK', 'LTC', 'SHIB', 'AVAX', 'TRX', 'UNI', 'ATOM', 'XLM', 'ETC', 'FIL', 'LUNC'];
    const commodities = ['XAU', 'XAG', 'XPT', 'XPD'];
    
    if (cryptoCurrencies.includes(base) || cryptoCurrencies.includes(target)) return 'Crypto';
    if (commodities.includes(base) || commodities.includes(target)) return 'Commodities';
    return 'Forex';
  };

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(""), 3500);
  };

  const openRateModal = (mode: "create" | "edit", item?: RateInstrument) => {
    if (mode === "edit" && item) {
      setRateForm({ ...item });
      setRateModal({ show: true, mode: "edit", data: item });
    } else {
      setRateForm({
        pair: "", name: "", price: "1.0000", change: "+0.00%", trend: "up", volatility: "Med", volume: "$2.00B", category: "Forex"
      });
      setRateModal({ show: true, mode: "create", data: null });
    }
  };

  const handleRateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isUp = !rateForm.change.startsWith("-");
    const newRateItem: RateInstrument = { ...rateForm, trend: isUp ? "up" : "down" };

    try {
      const token = localStorage.getItem('token');
      const [base, target] = rateForm.pair.split('/');
      const priceChangePercent = parseFloat(rateForm.change.replace('%', ''));
      
      const payload = {
        base_currency: base,
        target_currency: target,
        exchange_rate: parseFloat(rateForm.price),
        price_change_percent: priceChangePercent,
        trend: isUp ? 'up' : 'down',
        volatility: rateForm.volatility,
        volume_24h: rateForm.volume,
        source: 'manual'
      };

      const response = await fetch(`${API_BASE_URL}/admin/rates`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchRates();
        triggerToast(rateModal.mode === "edit" ? `Ledger key rebuilt: ${newRateItem.pair}` : `Registered new corridor: ${newRateItem.pair}`);
        setRateModal({ show: false, mode: "create", data: null });
      } else {
        triggerToast('Failed to save rate');
      }
    } catch (error) {
      console.error('Error saving rate:', error);
      triggerToast('Error saving rate');
    }
  };

  const handleDeleteRate = async (pair: string) => {
    if (confirm(`Deprecate asset corridor '${pair}'?`)) {
      try {
        const rateToDelete = rates.find(r => r.pair === pair);
        if (!rateToDelete?.rate_id) {
          triggerToast('Rate ID not found');
          return;
        }

        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/admin/rates/${rateToDelete.rate_id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        if (data.success) {
          await fetchRates();
          triggerToast(`Depleted channel: ${pair}`);
        } else {
          triggerToast('Failed to delete rate');
        }
      } catch (error) {
        console.error('Error deleting rate:', error);
        triggerToast('Error deleting rate');
      }
    }
  };

  const filteredRates = rates.filter(r => {
    const matchesSearch = r.pair.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         r.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "All" || r.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredRates.length / itemsPerPage);
  const paginatedRates = filteredRates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter]);

  // Tạo mảng 10 phần tử, fill với dữ liệu có sẵn và phần còn lại là empty rows
  const renderRows = () => {
    const rows = [];
    const totalRows = itemsPerPage; // Luôn giữ 10 dòng
    
    // Thêm các dòng dữ liệu thực tế
    for (let i = 0; i < paginatedRates.length && i < totalRows; i++) {
      rows.push(
        <RateRow 
          key={`data-${i}`}
          rate={paginatedRates[i]} 
          idx={i}
          onEdit={openRateModal}
          onDelete={handleDeleteRate}
          hoveredRow={hoveredRow}
          setHoveredRow={setHoveredRow}
        />
      );
    }

    // Nếu số dòng dữ liệu ít hơn totalRows, fill vào các dòng trống (ghost rows) để giữ chiều cao
    if (paginatedRates.length === 0) {
      // Trường hợp không có dữ liệu -> hiển thị empty state
      rows.push(<EmptyState key="empty" />);
      // Thêm các dòng trống phía dưới để giữ chiều cao
      for (let i = 1; i < totalRows; i++) {
        rows.push(
          <tr key={`empty-row-${i}`} className="border-b border-white/5">
            <td colSpan={6} className="px-6 py-4">
              <div className="h-8" /> {/* Giữ khoảng trống */}
            </td>
          </tr>
        );
      }
    } else if (paginatedRates.length < totalRows) {
      // Trường hợp có dữ liệu nhưng ít hơn 10 dòng
      // Thêm các dòng trống phía dưới
      for (let i = paginatedRates.length; i < totalRows; i++) {
        rows.push(
          <tr key={`empty-row-${i}`} className="border-b border-white/5">
            <td colSpan={6} className="px-6 py-4">
              <div className="h-8" /> {/* Giữ khoảng trống */}
            </td>
          </tr>
        );
      }
    }

    return rows;
  };

  // Loading State với Skeleton cho từng section
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#02020a] via-[#050510] to-[#02020a] text-slate-100 selection:bg-indigo-500/30 font-sans overflow-x-hidden pt-36 pb-20">
        {/* Ambient Background */}
        <div className="fixed inset-0 pointer-events-none -z-10">
          <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-indigo-600/8 rounded-full blur-[150px]" />
          <div className="absolute bottom-[5%] left-[-15%] w-[600px] h-[600px] bg-purple-600/6 rounded-full blur-[120px]" />
          <div className="absolute top-[40%] left-[30%] w-[500px] h-[500px] bg-cyan-600/4 rounded-full blur-[100px]" />
          <div 
            className="absolute inset-0 opacity-[0.02]" 
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 1px)`,
              backgroundSize: '40px 40px'
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative w-full flex flex-col gap-10">
          {/* Header Skeleton */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <HeaderSkeleton />
          </motion.div>

          {/* Search & Filters Skeleton */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col gap-6"
          >
            <SearchBarSkeleton />
          </motion.div>

          {/* Table Skeleton */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <TableSkeleton />
          </motion.div>

          {/* Pagination Skeleton */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <PaginationSkeleton />
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#02020a] via-[#050510] to-[#02020a] text-slate-100 selection:bg-indigo-500/30 font-sans overflow-x-hidden pt-36 pb-20">
      
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-indigo-600/8 rounded-full blur-[150px]" />
        <div className="absolute bottom-[5%] left-[-15%] w-[600px] h-[600px] bg-purple-600/6 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] left-[30%] w-[500px] h-[500px] bg-cyan-600/4 rounded-full blur-[100px]" />
        <div 
          className="absolute inset-0 opacity-[0.02]" 
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative w-full flex flex-col gap-10">
        
        {/* 1. JUMBOTRON HEADER */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/30 via-purple-500/30 to-indigo-500/30 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition duration-700" />
          <div className="relative bg-gradient-to-br from-[#11111a] to-[#0c0c12] rounded-[2.5rem] p-8 md:p-10 border border-white/10 shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
              <div className="flex flex-col gap-3">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full w-fit">
                  <Globe size={12} className="text-indigo-400" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 font-mono">Global Rates Matrix</span>
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter uppercase text-white leading-none">
                  Instrument <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-400">Ledger</span>
                </h1>
                <p className="text-xs text-slate-500 max-w-xl font-medium leading-relaxed">
                  Management of real-time currency pairs, crypto tokens, and commodity indices. Ensure nominal parity across all active gateway nodes.
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => openRateModal("create")}
                className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-mono text-[9px] font-black uppercase tracking-widest px-6 py-3 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/30"
              >
                <Plus size={14} />
                <span>Deploy Asset</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* 2. SEARCH & FILTERS */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="relative w-full sm:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={14} />
              <input 
                placeholder="Search pairs or sectors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/40 border border-white/10 focus:border-indigo-500/50 rounded-xl py-3 pl-10 pr-4 text-[11px] font-mono text-white outline-none transition-all focus:bg-black/60"
              />
            </div>
            <div className="flex gap-2">
              {["All", "Forex", "Crypto", "Commodities"].map((cat) => (
                <motion.button
                  key={cat}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-[8px] font-black font-mono uppercase tracking-wider transition-all ${
                    categoryFilter === cat 
                      ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md" 
                      : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {cat}
                </motion.button>
              ))}
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-[#11111a] to-[#0c0c12] rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-[8px] text-slate-400 uppercase tracking-[0.2em] font-black">
                    <th className="px-6 py-4">Instrument</th>
                    <th className="px-6 py-4">Nominal Price</th>
                    <th className="px-6 py-4">24h Change</th>
                    <th className="px-6 py-4">Volatility</th>
                    <th className="px-6 py-4">Sector</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {renderRows()}
                </tbody>
              </table>
            </div>

          </motion.div>
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-between bg-gradient-to-br from-[#11111a] to-[#0c0c12] border border-white/10 rounded-xl p-4 flex-wrap gap-4"
          >
            <div className="text-[8px] font-mono text-slate-500">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredRates.length)} of {filteredRates.length} entries
            </div>
            <div className="flex items-center gap-1.5">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-[8px] font-black uppercase tracking-wider transition-all flex items-center gap-1"
              >
                <ChevronLeft size={10} /> Prev
              </motion.button>
              {(() => {
                let pages = [];
                if (totalPages <= 5) {
                  for (let i = 1; i <= totalPages; i++) pages.push(i);
                } else {
                  const startPage = Math.floor((currentPage - 1) / 5) * 5 + 1;
                  for (let i = 0; i < 5; i++) {
                    const pageNum = startPage + i;
                    if (pageNum <= totalPages) pages.push(pageNum);
                  }
                }
                return pages.map((pageNum) => (
                  <motion.button
                    key={pageNum}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all ${
                      currentPage === pageNum
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md'
                        : 'bg-white/5 hover:bg-white/10 text-slate-400'
                    }`}
                  >
                    {pageNum}
                  </motion.button>
                ));
              })()}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-[8px] font-black uppercase tracking-wider transition-all flex items-center gap-1"
              >
                Next <ChevronRight size={10} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>

      {/* 3. MODAL UI */}
      <AnimatePresence>
        {rateModal.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setRateModal({ show: false, mode: "create", data: null })}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-[#11111a] to-[#0c0c12] border border-white/10 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-white/5 to-transparent">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-500/10 rounded-lg">
                    {rateModal.mode === "edit" ? <Edit size={14} className="text-indigo-400" /> : <Plus size={14} className="text-indigo-400" />}
                  </div>
                  <div>
                    <h3 className="text-base font-black uppercase text-white">
                      {rateModal.mode === "edit" ? "Modify Instrument" : "Deploy Asset"}
                    </h3>
                    <p className="text-[7px] text-slate-500 font-mono">Asset Parameters Configuration</p>
                  </div>
                </div>
                <button 
                  onClick={() => setRateModal({ show: false, mode: "create", data: null })} 
                  className="text-slate-500 hover:text-white p-1.5 rounded-lg bg-white/5 transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleRateSubmit} className="p-6 flex flex-col gap-5">
                <div className="space-y-3">
                  <label className="text-[7px] font-mono font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                    <Globe size={8} /> Pair Code (e.g. USD/VND)
                  </label>
                  <input 
                    required 
                    value={rateForm.pair}
                    onChange={(e) => setRateForm({ ...rateForm, pair: e.target.value.toUpperCase() })}
                    className="w-full bg-black/40 border border-white/10 focus:border-indigo-500/50 rounded-xl p-3 text-sm font-mono font-black text-white outline-none transition-all"
                    placeholder="EUR/USD"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[7px] font-mono font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                    <Activity size={8} /> Full Name
                  </label>
                  <input 
                    required 
                    value={rateForm.name}
                    onChange={(e) => setRateForm({ ...rateForm, name: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 focus:border-indigo-500/50 rounded-xl p-3 text-sm font-mono text-white outline-none transition-all"
                    placeholder="Euro / US Dollar"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="text-[7px] font-mono font-black text-slate-500 uppercase tracking-widest">Price</label>
                    <input 
                      required 
                      value={rateForm.price}
                      onChange={(e) => setRateForm({ ...rateForm, price: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 focus:border-indigo-500/50 rounded-xl p-3 text-sm font-mono font-black text-white outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[7px] font-mono font-black text-slate-500 uppercase tracking-widest">24h Change</label>
                    <input 
                      required 
                      value={rateForm.change}
                      onChange={(e) => setRateForm({ ...rateForm, change: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 focus:border-indigo-500/50 rounded-xl p-3 text-sm font-mono text-white outline-none transition-all"
                      placeholder="+0.00%"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <label className="text-[7px] font-mono font-black text-slate-500 uppercase tracking-widest">Category</label>
                    <select
                      value={rateForm.category}
                      onChange={(e) => setRateForm({ ...rateForm, category: e.target.value as any })}
                      className="w-full bg-black/40 border border-white/10 focus:border-indigo-500/50 rounded-xl p-2.5 text-[11px] font-mono text-white outline-none transition-all cursor-pointer"
                    >
                      <option value="Forex">Forex</option>
                      <option value="Crypto">Crypto</option>
                      <option value="Commodities">Commodities</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[7px] font-mono font-black text-slate-500 uppercase tracking-widest">Volatility</label>
                    <select
                      value={rateForm.volatility}
                      onChange={(e) => setRateForm({ ...rateForm, volatility: e.target.value as any })}
                      className="w-full bg-black/40 border border-white/10 focus:border-indigo-500/50 rounded-xl p-2.5 text-[11px] font-mono text-white outline-none transition-all cursor-pointer"
                    >
                      <option value="Low">Low</option>
                      <option value="Med">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[7px] font-mono font-black text-slate-500 uppercase tracking-widest">Volume</label>
                    <input 
                      value={rateForm.volume}
                      onChange={(e) => setRateForm({ ...rateForm, volume: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 focus:border-indigo-500/50 rounded-xl p-2.5 text-[11px] font-mono text-white outline-none transition-all"
                      placeholder="$1.00B"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setRateModal({ show: false, mode: "create", data: null })}
                    className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-[8px] font-black uppercase tracking-wider transition-all"
                  >
                    Cancel
                  </button>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit" 
                    className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl text-[8px] font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/30"
                  >
                    <Save size={12} /> {rateModal.mode === "edit" ? "Commit Changes" : "Deploy Asset"}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOAST */}
      <AnimatePresence>
        {successToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400 }}
            className="fixed top-28 left-1/2 -translate-x-1/2 z-[70] px-5 py-3 bg-gradient-to-r from-indigo-950/90 to-purple-950/90 border border-indigo-500/40 font-mono text-[9px] uppercase font-black text-indigo-400 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-md"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            <CheckCircle2 size={12} />
            {successToast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}