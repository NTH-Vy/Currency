"use client";

import { useState, useEffect, useCallback, useRef, memo } from "react";
import Echo from "laravel-echo";
import Pusher from "pusher-js";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import "../css/User/converter.css";
import { echoClient } from "@/lib/echo";
import {
  ArrowLeftRight,
  History,
  Info,
  ArrowRight,
  Loader2,
  TrendingUp,
  Globe,
  Zap,
  ChevronDown,
  Download,
  Activity,
  BarChart3,
  Scale,
  Droplets,
  Calendar,
  AlertTriangle,
  Clock,
  Grid3x3,
  TrendingUp as TrendUp,
  TrendingDown as TrendDown,
  Copy,
  Trash2,
  RotateCcw,
  Check,
  Eye,
  Sparkles,
  ShieldCheck,
  Cpu,
  Lock,
  Star,
  Wallet,
  RefreshCw,
  Database,
  Cloud,
  Gauge,
  Award,
  MessageSquare,
  Send,
  HelpCircle,
  Quote
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AreaChart, 
  Area, 
  Tooltip, 
  ResponsiveContainer, 
  XAxis, 
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  Legend
} from "recharts";

// --- MOCK DATA FOR CHART (CHỈ DÙNG KHI API THẤT BẠI) ---
const initialChartData = [
  { timestamp: new Date().toISOString(), value: 25410 },
  { timestamp: new Date(Date.now() - 3600000).toISOString(), value: 25450 },
  { timestamp: new Date(Date.now() - 7200000).toISOString(), value: 25400 },
  { timestamp: new Date(Date.now() - 10800000).toISOString(), value: 25480 },
  { timestamp: new Date(Date.now() - 14400000).toISOString(), value: 25420 },
  { timestamp: new Date(Date.now() - 18000000).toISOString(), value: 25490 },
  { timestamp: new Date(Date.now() - 21600000).toISOString(), value: 25430 },
];

interface HistoryItem {
  history_id: number;
  from_currency: string;
  to_currency: string;
  amount_input: number;
  amount_output: number;
  created_at?: string;
}

interface ChartData {
  timestamp: string;
  value: number;
}

interface MarketPulseData {
  volatility: string;
  priceChangePercent: number;
  dayLow: number;
  dayHigh: number;
  sentimentBuy: number;
  sentimentSell: number;
  liquidity: string;
  volume24h: number;
}

interface TopMover {
  currency: string;
  change24h: number;
  volume: number;
  trend: 'up' | 'down';
}

interface CurrencyStrengthData {
  base: string;
  targets: {
    currency: string;
    change24h: number;
    strength: number;
  }[];
}

// API Response Types
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface ConvertQuoteResponse {
  from_currency: string;
  to_currency: string;
  amount_input: number;
  amount_output: number;
  exchange_rate: number;
  timestamp: string;
}

interface HistoricalDataResponse {
  timestamp: string;
  rate: number;
}

interface MarketPulseResponse {
  volatility: string;
  priceChangePercent: number;
  dayLow: number;
  dayHigh: number;
  sentimentBuy: number;
  sentimentSell: number;
  liquidity: string;
  volume24h: number;
}

interface TopMoversResponse {
  currency: string;
  change24h: number;
  volume: number;
  trend: 'up' | 'down';
}

interface CurrencyStrengthResponse {
  base: string;
  targets: {
    currency: string;
    change24h: number;
    strength: number;
  }[];
}

// Constants
const TOAST_DURATION = 3000;
const POLLING_INTERVAL = 5000;
const CHART_DATA_INTERVAL_HOURS = [1, 2, 3, 4, 5, 6];
const DEFAULT_VOLUME_24H = 1500000000;
const DEFAULT_SENTIMENT_BUY = 65;
const DEFAULT_SENTIMENT_SELL = 35;
const DEFAULT_LIQUIDITY = 'Deep';
const CONVERT_DEBOUNCE_MS = 500;
const CHART_UPDATE_DEBOUNCE_MS = 1000;

// Helper: Format số có dấu phẩy
const formatNumberWithCommas = (value: string): string => {
  const numStr = value.replace(/,/g, '');
  if (!numStr || isNaN(parseFloat(numStr))) return '';
  const [int, dec] = numStr.split('.');
  return dec !== undefined ? `${int.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}.${dec}` : int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Helper: Bỏ dấu phẩy để gửi API
const parseFormattedNumber = (formatted: string): string => formatted.replace(/,/g, '');

// Helper: Normalize data to 0-24 hour time axis for overlay comparison
const normalizeDataToTimeAxis = (data: ChartData[], isPastDay: boolean = false): any[] => {
  // Create fixed time axis (0-24 hours)
  const timeAxis = Array.from({ length: 25 }, (_, i) => i); // 0, 1, 2, ..., 24
  
  // Map data points to nearest hour
  const normalizedMap = new Map<number, number>();
  
  data.forEach(item => {
    const date = new Date(item.timestamp);
    if (isNaN(date.getTime())) return;
    
    const hour = date.getHours();
    normalizedMap.set(hour, item.value);
  });
  
  // Create normalized array with all 25 hour points
  const normalized = timeAxis.map(hour => {
    const value = normalizedMap.get(hour);
    return {
      hour,
      time: `${hour}:00`,
      currentValue: isPastDay ? undefined : value,
      pastValue: isPastDay ? value : undefined
    };
  });
  
  return normalized;
};

// ── SKELETON COMPONENTS ──

// Skeleton cho Top Movers Table
const SkeletonTopMoversTable = () => (
  <div className="bg-[#11111a] border border-white/10 rounded-xl overflow-hidden animate-pulse">
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 w-24 bg-white/10 rounded" />
        <div className="h-3 w-32 bg-white/10 rounded" />
      </div>
      <div className="space-y-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center justify-between py-3 px-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="h-5 w-16 bg-white/10 rounded" />
            </div>
            <div className="h-5 w-20 bg-white/10 rounded" />
            <div className="h-5 w-16 bg-white/10 rounded" />
            <div className="h-5 w-8 bg-white/10 rounded" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Skeleton cho Recent Ledger
const SkeletonRecentLedger = () => (
  <div className="relative bg-gradient-to-br from-[#11111a] to-[#0c0c12] border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col gap-5 h-full animate-pulse">
    <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
      <div className="flex items-center gap-2">
        <div className="h-4 w-32 bg-white/10 rounded" />
      </div>
      <div className="flex items-center gap-2">
        <div className="h-4 w-12 bg-white/10 rounded" />
        <div className="h-4 w-12 bg-white/10 rounded" />
        <div className="h-4 w-12 bg-white/10 rounded" />
      </div>
    </div>
    <div className="flex flex-col gap-2 flex-1">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-gradient-to-r from-black/40 to-transparent border border-white/5 rounded-xl p-3">
          <div className="flex justify-between items-center mb-1.5">
            <div className="flex items-center gap-2">
              <div className="h-3 w-20 bg-white/10 rounded" />
              <div className="h-3 w-8 bg-white/10 rounded" />
            </div>
            <div className="h-3 w-16 bg-white/10 rounded" />
          </div>
          <div className="flex justify-between items-baseline gap-2">
            <div className="h-4 w-16 bg-white/10 rounded" />
            <div className="h-4 w-20 bg-white/10 rounded" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Skeleton cho Converter Panel (Amount to Dispatch, Target Ledger Asset, Live Exchange Vector)
const SkeletonConverterPanel = () => (
  <div className="relative bg-gradient-to-br from-[#11111a] to-[#0c0c12] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden animate-pulse">
    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none rounded-3xl" />
    
    <div className="relative z-10 flex flex-col gap-8">
      <div className="grid md:grid-cols-12 gap-5 items-center">
        {/* From Currency Skeleton */}
        <div className="md:col-span-5 flex flex-col gap-2">
          <div className="h-3 w-32 bg-white/10 rounded" />
          <div className="bg-black/40 border border-white/10 rounded-xl p-4 flex items-center justify-between gap-3">
            <div className="h-8 w-32 bg-white/10 rounded" />
            <div className="h-10 w-20 bg-white/10 rounded" />
          </div>
        </div>

        {/* Swap Button Skeleton */}
        <div className="md:col-span-2 flex justify-center items-center">
          <div className="w-12 h-12 bg-gradient-to-br from-[#1a1a2e] to-[#0d0d1a] rounded-full border border-indigo-500/40" />
        </div>

        {/* To Currency Skeleton */}
        <div className="md:col-span-5 flex flex-col gap-2">
          <div className="h-3 w-32 bg-white/10 rounded" />
          <div className="bg-black/40 border border-white/10 rounded-xl p-4 flex items-center justify-between gap-3">
            <div className="h-8 w-32 bg-white/10 rounded" />
            <div className="h-10 w-20 bg-white/10 rounded" />
          </div>
        </div>
      </div>

      {/* Live Exchange Vector Skeleton */}
      <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/5 border border-indigo-500/20 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-2 w-full">
          <div className="flex items-center gap-2">
            <div className="h-4 w-32 bg-white/10 rounded" />
            <div className="h-3 w-16 bg-white/10 rounded" />
          </div>
          <div className="h-6 w-48 bg-white/10 rounded" />
          <div className="h-4 w-40 bg-white/10 rounded" />
        </div>
        <div className="text-left md:text-right w-full md:w-auto">
          <div className="h-3 w-32 bg-white/10 rounded mb-1" />
          <div className="h-4 w-40 bg-white/10 rounded" />
        </div>
      </div>

      {/* Convert Button Skeleton */}
      <div className="w-full h-14 bg-gradient-to-r from-indigo-600/50 via-indigo-500/50 to-purple-600/50 rounded-xl" />
    </div>
  </div>
);

// Skeleton cho History Modal Table
const SkeletonHistoryModal = () => (
  <div className="flex-1 overflow-auto p-6">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-indigo-500/20">
            <th className="text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-wider text-left py-3 px-2">ID</th>
            <th className="text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-wider text-left py-3 px-2">Date</th>
            <th className="text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-wider text-left py-3 px-2">From</th>
            <th className="text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-wider text-left py-3 px-2">To</th>
            <th className="text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-wider text-right py-3 px-2">Input</th>
            <th className="text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-wider text-right py-3 px-2">Output</th>
            <th className="text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-wider text-center py-3 px-2">Rate</th>
          </tr>
        </thead>
        <tbody>
          {[...Array(5)].map((_, i) => (
            <tr key={i} className="border-b border-white/[0.03]">
              <td className="py-3 px-2"><div className="h-3 w-8 bg-white/10 rounded" /></td>
              <td className="py-3 px-2"><div className="h-3 w-24 bg-white/10 rounded" /></td>
              <td className="py-3 px-2"><div className="h-3 w-12 bg-white/10 rounded" /></td>
              <td className="py-3 px-2"><div className="h-3 w-12 bg-white/10 rounded" /></td>
              <td className="py-3 px-2"><div className="h-3 w-16 bg-white/10 rounded ml-auto" /></td>
              <td className="py-3 px-2"><div className="h-3 w-16 bg-white/10 rounded ml-auto" /></td>
              <td className="py-3 px-2"><div className="h-3 w-12 bg-white/10 rounded mx-auto" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// ── COMPONENT CON: CUSTOM SELECT DROPDOWN ──
const CustomSelect = memo(function CustomSelect({
  value,
  onChange,
  options
}: {
  value: string;
  onChange: (val: string) => void;
  options: string[]
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Select currency, currently ${value}`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className="group relative bg-gradient-to-br from-white/[0.05] to-white/[0.02] hover:from-indigo-500/20 hover:to-indigo-600/10 px-4 py-2.5 rounded-xl border border-white/10 hover:border-indigo-500/50 transition-all duration-300 flex items-center gap-2 outline-none shadow-md cursor-pointer"
      >
        <span className="font-mono font-bold text-sm bg-gradient-to-r from-indigo-200 to-white bg-clip-text text-transparent">
          {value}
        </span>
        <ChevronDown size={14} className={`transition-all duration-300 text-indigo-400 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-32 max-h-56 bg-[#0a0a12]/95 border border-indigo-500/30 rounded-xl shadow-2xl overflow-y-auto z-50 divide-y divide-white/[0.04] backdrop-blur-xl"
              role="listbox"
            >
              {options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                  }}
                  role="option"
                  aria-selected={opt === value}
                  className={`w-full text-left px-4 py-2.5 text-xs font-mono font-bold transition-all duration-200 block cursor-pointer
                    ${opt === value ? "text-indigo-400 bg-indigo-500/15" : "text-slate-300 hover:bg-white/5 hover:text-white"}`}
                >
                  {opt}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
});

// Component CheckCircle2
const CheckCircle2 = memo(({ size, className }: { size?: number; className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
));

// ── MAIN COMPONENT ──
export default function ConverterPage() {
  const [amount, setAmount] = useState<string>("0");
  const [fromCurrency, setFromCurrency] = useState<string>("USD");
  const [toCurrency, setToCurrency] = useState<string>("VND");
  const [result, setResult] = useState<number | null>(null);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [savingsAmount, setSavingsAmount] = useState<number | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);
  const [isClient, setIsClient] = useState<boolean>(false);
  const [availableCurrencies, setAvailableCurrencies] = useState<string[]>(["USD", "VND", "EUR", "GBP", "JPY"]);
  
  // --- CHART STATE ---
  const [chartData, setChartData] = useState<ChartData[]>(initialChartData);
  const [pastDayChartData, setPastDayChartData] = useState<ChartData[]>([]);
  const [chartLoading, setChartLoading] = useState<boolean>(false);
  const [formattedChartData, setFormattedChartData] = useState<any[]>([]);
  const [isWebSocketConnected, setIsWebSocketConnected] = useState<boolean>(false);
  const [usingWebSocket, setUsingWebSocket] = useState<boolean>(false);
  const [usingPolling, setUsingPolling] = useState<boolean>(false);

  const hasFetchedRef = useRef(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const chartUpdateRef = useRef<NodeJS.Timeout | null>(null);
  const lastChartUpdateRef = useRef<number>(0);
  const [swapAnimating, setSwapAnimating] = useState(false);
  const [marketPulse, setMarketPulse] = useState<MarketPulseData | null>(null);
  const [marketPulseLoading, setMarketPulseLoading] = useState<boolean>(false);
  const [topMovers, setTopMovers] = useState<TopMover[]>([]);
  const [topMoversLoading, setTopMoversLoading] = useState<boolean>(false);
  const [currencyStrength, setCurrencyStrength] = useState<CurrencyStrengthData | null>(null);
  const [strengthLoading, setStrengthLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; visible: boolean }>({ message: '', type: 'info', visible: false });
  const [confirmDialog, setConfirmDialog] = useState<{ title: string; message: string; visible: boolean; onConfirm: () => void }>({ title: '', message: '', visible: false, onConfirm: () => {} });
  const [retryCount, setRetryCount] = useState<number>(0);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  
  const API_BASE = "/api/laravel";

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), TOAST_DURATION);
  };

  const showConfirmDialog = (title: string, message: string, onConfirm: () => void) => {
    setConfirmDialog({ title, message, visible: true, onConfirm });
  };

  useEffect(() => {
    setIsClient(true);
    // Simulate initial loading
    setTimeout(() => setIsInitialLoading(false), 1500);
  }, []);

  // Fetch available currencies
  const fetchCurrencies = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/currencies`, {
        headers: { "Accept": "application/json" }
      });
      const data = await res.json();
      if (data.success && data.currencies) {
        const currencyCodes = data.currencies.map((c: { code: string }) => c.code);
        setAvailableCurrencies(currencyCodes);
      }
    } catch (error) {
      console.error("Fetch currencies error:", error);
    }
  }, [API_BASE]);

  useEffect(() => {
    fetchCurrencies();
  }, [fetchCurrencies]);

  // --- 1. FETCH HISTORICAL DATA TỪ API ---
  const fetchHistoricalData = useCallback(async (base: string, target: string) => {
    if (!base || !target) return;
    
    setChartLoading(true);
    
    try {
      // Fetch current day data (last 24 hours)
      const res = await fetch(`${API_BASE}/rates/historical?base=${base}&target=${target}&period=24h`, {
        headers: { "Accept": "application/json" }
      });
      
      const data = await res.json();
      
      if (data.success && data.data && data.data.length > 0) {
        // Format dữ liệu từ API cho ngày hiện tại
        const formattedData = data.data.map((item: { timestamp: string; rate: number }) => ({
          timestamp: item.timestamp,
          value: item.rate
        }));
        setChartData(formattedData);
        console.log(`✅ Current day data loaded: ${formattedData.length} points`);
        
        // Simulate past day data by shifting timestamps back 24 hours
        const pastDayData = formattedData.map((item: ChartData) => ({
          timestamp: new Date(new Date(item.timestamp).getTime() - 24 * 60 * 60 * 1000).toISOString(),
          value: item.value * (0.98 + Math.random() * 0.04) // Add slight variation for realism
        }));
        setPastDayChartData(pastDayData);
        console.log(`✅ Past day data simulated: ${pastDayData.length} points`);
      } else {
        // Fallback: dùng mock data
        console.warn(`⚠️ No historical data, using mock data`);
        setChartData(initialChartData);
        
        // Generate mock past day data
        const mockPastData = initialChartData.map((item: ChartData) => ({
          timestamp: new Date(new Date(item.timestamp).getTime() - 24 * 60 * 60 * 1000).toISOString(),
          value: item.value * (0.98 + Math.random() * 0.04)
        }));
        setPastDayChartData(mockPastData);
      }
    } catch (error) {
      console.error("❌ Fetch historical data error:", error);
      setChartData(initialChartData);
      
      // Generate mock past day data on error
      const mockPastData = initialChartData.map((item: ChartData) => ({
        timestamp: new Date(new Date(item.timestamp).getTime() - 24 * 60 * 60 * 1000).toISOString(),
        value: item.value * (0.98 + Math.random() * 0.04)
      }));
      setPastDayChartData(mockPastData);
    } finally {
      setChartLoading(false);
    }
  }, [API_BASE, fromCurrency, toCurrency]);

  // --- 2. THÊM DỮ LIỆU REAL-TIME VÀO CHART ---
  const addChartDataPoint = useCallback((newRate: number) => {
    if (!newRate || isNaN(newRate) || newRate <= 0) return;

    // Debounce chart updates
    const now = Date.now();
    const timeSinceLastUpdate = now - lastChartUpdateRef.current;

    // Clear existing timeout
    if (chartUpdateRef.current) {
      clearTimeout(chartUpdateRef.current);
    }

    // If enough time has passed, update immediately
    if (timeSinceLastUpdate >= CHART_UPDATE_DEBOUNCE_MS) {
      lastChartUpdateRef.current = now;
      setChartData(prev => {
        // Giữ tối đa 100 điểm
        const maxPoints = 100;
        const newPoint = {
          timestamp: new Date().toISOString(),
          value: newRate
        };
        const newData = [...prev.slice(-(maxPoints - 1)), newPoint];
        return newData;
      });
    } else {
      // Otherwise, schedule update
      chartUpdateRef.current = setTimeout(() => {
        lastChartUpdateRef.current = Date.now();
        setChartData(prev => {
          const maxPoints = 100;
          const newPoint = {
            timestamp: new Date().toISOString(),
            value: newRate
          };
          const newData = [...prev.slice(-(maxPoints - 1)), newPoint];
          return newData;
        });
      }, CHART_UPDATE_DEBOUNCE_MS - timeSinceLastUpdate);
    }
  }, []);

  // --- 3. CẬP NHẬT CHART TỪ WEBSOCKET ---
  const updateChartFromWebSocket = useCallback((newRate: number) => {
    if (!newRate || isNaN(newRate) || newRate <= 0) return;
    
    addChartDataPoint(newRate);
    setExchangeRate(newRate);
    
    console.log(`📈 Chart updated via WebSocket: ${newRate}`);
  }, [addChartDataPoint]);

  // Fetch market pulse data
  const fetchMarketPulse = useCallback(async (base: string, target: string) => {
    if (!base || !target) return;
    setMarketPulseLoading(true);
    try {
      const res = await fetch(`${API_BASE}/rates/market-pulse?base=${base}&target=${target}`, {
        headers: { "Accept": "application/json" }
      });
      const data = await res.json();
      if (data.success && data.data) {
        setMarketPulse({
          volatility: data.data.volatility || 'Medium',
          priceChangePercent: Number(data.data.priceChangePercent) || 0,
          dayLow: Number(data.data.dayLow) || 0,
          dayHigh: Number(data.data.dayHigh) || 0,
          sentimentBuy: Number(data.data.sentimentBuy) || DEFAULT_SENTIMENT_BUY,
          sentimentSell: Number(data.data.sentimentSell) || DEFAULT_SENTIMENT_SELL,
          liquidity: data.data.liquidity || DEFAULT_LIQUIDITY,
          volume24h: Number(data.data.volume24h) || DEFAULT_VOLUME_24H
        });
      } else {
        // Set mock data if API fails
        setMarketPulse({
          volatility: 'Medium',
          priceChangePercent: 0.5,
          dayLow: 25400,
          dayHigh: 25500,
          sentimentBuy: DEFAULT_SENTIMENT_BUY,
          sentimentSell: DEFAULT_SENTIMENT_SELL,
          liquidity: DEFAULT_LIQUIDITY,
          volume24h: DEFAULT_VOLUME_24H
        });
      }
    } catch (error) {
      console.error("Fetch market pulse error:", error);
      setMarketPulse({
        volatility: 'Medium',
        priceChangePercent: 0.5,
        dayLow: 25400,
        dayHigh: 25500,
        sentimentBuy: DEFAULT_SENTIMENT_BUY,
        sentimentSell: DEFAULT_SENTIMENT_SELL,
        liquidity: DEFAULT_LIQUIDITY,
        volume24h: DEFAULT_VOLUME_24H
      });
    } finally {
      setMarketPulseLoading(false);
    }
  }, [API_BASE, fromCurrency, toCurrency]);

  // Fetch top movers
  const fetchTopMovers = useCallback(async () => {
    setTopMoversLoading(true);
    try {
      const res = await fetch(`${API_BASE}/rates/top-movers`, {
        headers: { "Accept": "application/json" }
      });
      const data = await res.json();
      if (data.success && data.data) {
        setTopMovers(data.data);
      } else {
        setTopMovers([
          { currency: "EUR", change24h: 1.25, volume: 2500000000, trend: "up" },
          { currency: "GBP", change24h: 0.85, volume: 1800000000, trend: "up" },
          { currency: "JPY", change24h: -0.65, volume: 3200000000, trend: "down" },
          { currency: "AUD", change24h: -0.45, volume: 950000000, trend: "down" },
          { currency: "CAD", change24h: 0.35, volume: 750000000, trend: "up" },
          { currency: "CHF", change24h: -0.25, volume: 680000000, trend: "down" }
        ]);
      }
    } catch (error) {
      console.error("Fetch top movers error:", error);
      setTopMovers([]);
    } finally {
      setTopMoversLoading(false);
    }
  }, [API_BASE]);

  // Fetch currency strength
  const fetchCurrencyStrength = useCallback(async (base: string) => {
    if (!base) return;
    setStrengthLoading(true);
    try {
      const res = await fetch(`${API_BASE}/rates/strength?base=${base}`, {
        headers: { "Accept": "application/json" }
      });
      const data = await res.json();
      if (data.success && data.data) {
        setCurrencyStrength({
          base: data.data.base,
          targets: data.data.targets.map((target: any) => ({
            currency: target.currency,
            change24h: Number(target.change24h) || 0,
            strength: Number(target.strength) || 0
          }))
        });
      } else {
        setCurrencyStrength({
          base: base,
          targets: [
            { currency: "VND", change24h: 0.5, strength: 65 },
            { currency: "EUR", change24h: -0.2, strength: 45 },
            { currency: "GBP", change24h: 0.3, strength: 58 },
            { currency: "JPY", change24h: -0.1, strength: 48 }
          ]
        });
      }
    } catch (error) {
      console.error("Fetch currency strength error:", error);
      setCurrencyStrength(null);
    } finally {
      setStrengthLoading(false);
    }
  }, [API_BASE, fromCurrency]);

  // Fetch live exchange rate
  const fetchLiveRate = useCallback(async () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    if (!token || !fromCurrency || !toCurrency) return;

    try {
      const res = await fetch(`${API_BASE}/convert-quote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        },
        body: JSON.stringify({
          amount: 1,
          from: fromCurrency,
          to: toCurrency
        })
      });

      const data = await res.json();
      if (data.rate) {
        setExchangeRate(data.rate);
      }
    } catch (error) {
      console.error("Live rate fetch error:", error);
    }
  }, [API_BASE, fromCurrency, toCurrency]);

  // Fetch history
  const fetchHistory = useCallback(async () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    if (!token) return;

    setHistoryLoading(true);
    try {
      const res = await fetch(`${API_BASE}/history`, {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setHistory(data);
      } else if (data && Array.isArray(data.data)) {
        setHistory(data.data);
      }
    } catch (error) {
      console.error("Fetch history error:", error);
    } finally {
      setHistoryLoading(false);
    }
  }, [API_BASE]);

  useEffect(() => {
    if (isClient) {
      fetchHistory();
    }
  }, [isClient, fetchHistory]);

  // --- HÀM POLLING LẤY RATE MỚI NHẤT ---
  const pollLatestRate = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${API_BASE}/convert-quote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        },
        body: JSON.stringify({
          amount: 1,
          from: fromCurrency,
          to: toCurrency
        })
      });

      const data = await res.json();
      if (data.rate && data.rate > 0) {
        updateChartFromWebSocket(data.rate);
      }
    } catch (error) {
      // Silent fail
    }
  }, [API_BASE, fromCurrency, toCurrency, updateChartFromWebSocket]);

  // --- BẮT ĐẦU POLLING ---
  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) return;
    console.log('⏰ Bật chế độ Polling dự phòng (Do WebSocket ngắt kết nối)...');
    setIsWebSocketConnected(false);
    setUsingPolling(true);
    setUsingWebSocket(false);

    pollingIntervalRef.current = setInterval(() => {
      pollLatestRate();
    }, POLLING_INTERVAL);
  }, [pollLatestRate]);

  // --- DỪNG POLLING ---
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setUsingPolling(false);
  }, []);

  // --- 4. WEBSOCKET + CHART LOGIC (Sử dụng pattern giống useRealtimeRates) ---
  useEffect(() => {
    if (!isClient || !fromCurrency || !toCurrency) return;

    let isMounted = true;
    let wsConnected = false;

    // --- KHỞI TẠO WEBSOCKET ---
    if (!echoClient) {
      console.warn('⚠️ echoClient không khả dụng, sử dụng polling');
      startPolling();
      return;
    }

    console.log('📡 Đang kết nối tới Laravel Reverb qua Echo...');
    setUsingWebSocket(true);
    setIsWebSocketConnected(false);

    // 1. Khi kết nối thành công
    echoClient.connector.pusher.connection.bind('connected', () => {
      if (!isMounted) return;
      console.log('✅ Echo kết nối thành công tới Reverb! Đã tắt chế độ Polling.');
      wsConnected = true;
      setIsWebSocketConnected(true);
      stopPolling();
    });

    // 2. Khi bị mất kết nối
    echoClient.connector.pusher.connection.bind('disconnected', () => {
      if (!isMounted) return;
      console.log('🔌 Echo mất kết nối.');
      wsConnected = false;
      setIsWebSocketConnected(false);
      startPolling();
    });

    // 3. Khi trạng thái kết nối không khả dụng
    echoClient.connector.pusher.connection.bind('unavailable', () => {
      if (!isMounted) return;
      console.warn('⚠️ Kết nối Echo không khả dụng.');
      wsConnected = false;
      setIsWebSocketConnected(false);
      startPolling();
    });

    // Thực hiện kết nối thủ công
    echoClient.connect();

    // Đăng ký lắng nghe channel cho cặp tiền cụ thể
    const channel = echoClient.channel(`rates.${fromCurrency}.${toCurrency}`);

    // Lắng nghe sự kiện rate.updated
    channel.listen('.rate.updated', (e: any) => {
      if (!isMounted) return;
      console.log('🔄 Rate updated via WebSocket:', e);

      if (e && typeof e.rate === 'number' && e.rate > 0) {
        updateChartFromWebSocket(e.rate);
        wsConnected = true;
        setIsWebSocketConnected(true);
        stopPolling();
      }
    });

    // --- 5. FETCH LỊCH SỬ KHI ĐỔI CẶP TIỀN ---
    fetchHistoricalData(fromCurrency, toCurrency);

    // Fetch các dữ liệu khác (không bao gồm fetchTopMovers vì nó không phụ thuộc currency pair)
    fetchLiveRate();
    fetchMarketPulse(fromCurrency, toCurrency);
    fetchCurrencyStrength(fromCurrency);

    // Bắt đầu polling ban đầu (sẽ dừng khi WebSocket kết nối)
    pollingIntervalRef.current = setInterval(() => {
      if (!wsConnected) {
        pollLatestRate();
      }
    }, POLLING_INTERVAL);

    // Cleanup
    return () => {
      isMounted = false;
      stopPolling();

      // Cleanup chart update debounce
      if (chartUpdateRef.current) {
        clearTimeout(chartUpdateRef.current);
      }

      if (echoClient) {
        console.log('🔌 Rời channel và ngắt kết nối Echo tạm thời...');
        echoClient.leaveChannel(`rates.${fromCurrency}.${toCurrency}`);

        // Hủy bỏ toàn bộ sự kiện lắng nghe trạng thái kết nối cũ
        if (echoClient.connector?.pusher?.connection) {
          echoClient.connector.pusher.connection.unbind('connected');
          echoClient.connector.pusher.connection.unbind('disconnected');
          echoClient.connector.pusher.connection.unbind('unavailable');
        }
      }
    };
  }, [isClient, fromCurrency, toCurrency, fetchHistoricalData, fetchLiveRate, fetchMarketPulse, fetchCurrencyStrength, updateChartFromWebSocket, startPolling, stopPolling]);

  // Fetch top movers chỉ chạy một lần khi mount (không phụ thuộc currency pair)
  useEffect(() => {
    if (isClient) {
      fetchTopMovers();
    }
  }, [isClient, fetchTopMovers]);

  // --- 6. FORMAT DỮ LIỆU CHART ĐỂ HIỂN THỊ ---
  useEffect(() => {
    if (isClient && chartData.length > 0) {
      // Normalize current day data
      const currentNormalized = normalizeDataToTimeAxis(chartData, false);
      
      // Normalize past day data
      const pastNormalized = normalizeDataToTimeAxis(pastDayChartData, true);
      
      // Merge both datasets on the same time axis
      const mergedData = currentNormalized.map((currentItem, index) => ({
        hour: currentItem.hour,
        time: currentItem.time,
        currentValue: currentItem.currentValue,
        pastValue: pastNormalized[index]?.pastValue
      }));
      
      setFormattedChartData(mergedData);
    }
  }, [isClient, chartData, pastDayChartData]);

  const handleConvert = async (isRetry = false) => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    if (!token) {
      showToast("Please login to perform this action!", "error");
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      showToast("Please enter a valid amount", "error");
      return;
    }

    if (isRetry) {
      setIsRetrying(true);
    } else {
      setLoading(true);
    }

    try {
      const res = await fetch(`${API_BASE}/convert`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        },
        body: JSON.stringify({
          amount: numAmount,
          from: fromCurrency,
          to: toCurrency
        })
      });

      const data = await res.json();
      if (data.success || data.result) {
        setResult(data.result);
        setExchangeRate(data.rate);
        const retailBankSpread = 0.03;
        const savings = data.result * retailBankSpread;
        setSavingsAmount(savings);
        fetchHistory();
        showToast("Conversion successful!", "success");
        setRetryCount(0);
      } else {
        showToast("Error: " + (data.message || "Conversion failed"), "error");
        if (!isRetry) setRetryCount(prev => prev + 1);
      }
    } catch (error) {
      console.error("Convert error:", error);
      showToast("Cannot connect to API terminal.", "error");
      if (!isRetry) setRetryCount(prev => prev + 1);
    } finally {
      setLoading(false);
      setIsRetrying(false);
    }
  };

  // Debounced version of handleConvert
  const convertDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const handleConvertDebounced = useCallback((isRetry = false) => {
    if (convertDebounceRef.current) {
      clearTimeout(convertDebounceRef.current);
    }
    convertDebounceRef.current = setTimeout(() => {
      handleConvert(isRetry);
    }, CONVERT_DEBOUNCE_MS);
  }, [handleConvert]);

  const handleSwap = () => {
    setSwapAnimating(true);
    const tempFrom = fromCurrency;
    const tempTo = toCurrency;
    setFromCurrency(tempTo);
    setToCurrency(tempFrom);
    setResult(null);
    setExchangeRate(null);
    setSavingsAmount(null);
    setTimeout(() => setSwapAnimating(false), 500);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Enter: Convert
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleConvertDebounced(false);
      }
      // Enter: Convert (if not in input field)
      else if (e.key === 'Enter' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        handleConvertDebounced(false);
      }
      // Escape: Clear result
      else if (e.key === 'Escape') {
        setResult(null);
        setExchangeRate(null);
        setSavingsAmount(null);
        setShowHistoryModal(false);
        setConfirmDialog(prev => ({ ...prev, visible: false }));
      }
      // Ctrl/Cmd + S: Swap currencies
      else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSwap();
      }
      // Ctrl/Cmd + H: Toggle history modal
      else if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        setShowHistoryModal(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleConvertDebounced, handleSwap]);

  const exportHistoryToCSV = () => {
    if (history.length === 0) {
      showToast("No history to export", "info");
      return;
    }

    const headers = ["Date", "From Currency", "To Currency", "Amount Input", "Amount Output"];
    const csvContent = [
      headers.join(","),
      ...history.map(item => [
        item.created_at || new Date().toISOString(),
        item.from_currency,
        item.to_currency,
        item.amount_input,
        item.amount_output
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `conversion_history_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCurrencyValue = (val: number | string, currency: string) => {
    const numVal = typeof val === 'string' ? parseFloat(val) : val;
    if (isNaN(numVal)) return '0';
    
    if (currency === "VND") {
      return numVal.toLocaleString("vi-VN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }
    return numVal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  };

  const formatTimeAgo = (dateString: string) => {
    if (!dateString) return "Just now";
    
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minute${Math.floor(seconds / 60) > 1 ? 's' : ''} ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hour${Math.floor(seconds / 3600) > 1 ? 's' : ''} ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} day${Math.floor(seconds / 86400) > 1 ? 's' : ''} ago`;
    if (seconds < 2592000) return `${Math.floor(seconds / 604800)} week${Math.floor(seconds / 604800) > 1 ? 's' : ''} ago`;
    if (seconds < 31536000) return `${Math.floor(seconds / 2592000)} month${Math.floor(seconds / 2592000) > 1 ? 's' : ''} ago`;
    return `${Math.floor(seconds / 31536000)} year${Math.floor(seconds / 31536000) > 1 ? 's' : ''} ago`;
  };

  const handleQuickReRun = (item: HistoryItem) => {
    setAmount(item.amount_input.toString());
    setFromCurrency(item.from_currency);
    setToCurrency(item.to_currency);
    setResult(null);
    setExchangeRate(null);
    setSavingsAmount(null);
  };

  const handleCopyResult = () => {
    if (result !== null) {
      const text = `${formatCurrencyValue(result, toCurrency)} ${toCurrency}`;
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDeleteHistoryItem = async (historyId: number) => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    if (!token) {
      showToast("Please login to perform this action!", "error");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/history/${historyId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });
      const data = await res.json();
      if (data.success) {
        setHistory(prev => prev.filter(item => item.history_id !== historyId));
        showToast("History item deleted", "success");
      } else {
        showToast("Could not delete history: " + (data.message || "Unknown"), "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error deleting history item", "error");
    }
  };

  const handleClearAllHistory = () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    if (!token) {
      showToast("Please login to perform this action!", "error");
      return;
    }

    const performClear = async () => {
      try {
        const res = await fetch(`${API_BASE}/history`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json"
          }
        });
        const data = await res.json();
        if (data.success) {
          setHistory([]);
          showToast("All history cleared", "success");
        } else {
          showToast("Could not clear history: " + (data.message || "Unknown"), "error");
        }
      } catch (err) {
        console.error(err);
        showToast("Error clearing history", "error");
      }
    };

    showConfirmDialog("Clear All History", "Are you sure you want to clear all history? This action cannot be undone.", performClear);
  };

  // Connection status indicator component
  const ConnectionStatus = () => (
    <div className="flex items-center gap-2 text-[8px] font-mono">
      {usingWebSocket && isWebSocketConnected && (
        <span className="flex items-center gap-1.5 text-emerald-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Live (WebSocket)
        </span>
      )}
      {usingPolling && (
        <span className="flex items-center gap-1.5 text-amber-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          Polling
        </span>
      )}
      {!usingWebSocket && !usingPolling && (
        <span className="flex items-center gap-1.5 text-slate-500">
          <span className="relative flex h-2 w-2">
            <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-slate-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-500"></span>
          </span>
          Connecting...
        </span>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#02020a] via-[#050510] to-[#02020a] text-slate-100 selection:bg-indigo-500/30 font-sans overflow-x-hidden" suppressHydrationWarning>
      <Header />

      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-20%] right-[-10%] w-[1000px] h-[1000px] bg-indigo-600/8 rounded-full blur-[150px]" />
        <div className="absolute bottom-[5%] left-[-15%] w-[800px] h-[800px] bg-purple-600/6 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] left-[30%] w-[600px] h-[600px] bg-cyan-600/4 rounded-full blur-[100px]" />
        <div 
          className="absolute inset-0 opacity-[0.02]" 
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      {/* Custom Toast Notification */}
      <AnimatePresence>
        {toast.visible && (
          <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 400 }}
            className={`fixed top-6 right-6 z-50 px-5 py-3.5 rounded-xl border backdrop-blur-xl flex items-center gap-3 max-w-md shadow-2xl ${
              toast.type === 'success' ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200' :
              toast.type === 'error' ? 'bg-red-500/15 border-red-500/40 text-red-200' :
              'bg-indigo-500/15 border-indigo-500/40 text-indigo-200'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 size={18} />}
            {toast.type === 'error' && <AlertTriangle size={18} />}
            {toast.type === 'info' && <Info size={18} />}
            <p className="text-sm font-medium">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Confirm Dialog */}
      <AnimatePresence>
        {confirmDialog.visible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setConfirmDialog(prev => ({ ...prev, visible: false }))}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-gradient-to-br from-[#0d0d14] to-[#11111a] border border-white/10 rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4"
            >
              <h3 className="text-lg font-bold text-white mb-2">{confirmDialog.title}</h3>
              <p className="text-slate-400 text-sm mb-6">{confirmDialog.message}</p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setConfirmDialog(prev => ({ ...prev, visible: false }))}
                  className="px-5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    confirmDialog.onConfirm();
                    setConfirmDialog(prev => ({ ...prev, visible: false }));
                  }}
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-medium transition-all shadow-lg shadow-indigo-500/25"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <main className="pt-32 pb-20 flex-grow relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col gap-12 relative z-10">
          
          {/* 1. Page Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-4"
          >
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-full w-fit backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Institutional Grade Converter
              </span>
              {isWebSocketConnected && (
                <span className="flex items-center gap-1 text-emerald-400 text-[8px] font-mono">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  LIVE
                </span>
              )}
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight uppercase leading-none">
              Currency <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400">Converter</span>
            </h1>
            <p className="text-slate-400 text-base max-w-2xl">
              Execute cross-border mid-market exchange conversions with institutional latency metrics and zero markup spread.
            </p>
          </motion.div>

          {/* 2 & 3. Converter Panel Structure */}
          <div className="grid lg:grid-cols-12 gap-8">
            
            {/* Main Form */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-8 relative group"
            >
              {isInitialLoading || loading ? (
                <SkeletonConverterPanel />
              ) : (
                <div className="relative bg-gradient-to-br from-[#11111a] to-[#0c0c12] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none rounded-3xl" />

                  <div className="relative z-10 flex flex-col gap-8">
                    <div className="grid md:grid-cols-12 gap-5 items-center">
                      
                      {/* From Currency Input */}
                      <div className="md:col-span-5 flex flex-col gap-2">
                        <label className="text-[9px] font-mono font-black text-slate-500 uppercase tracking-widest px-1 flex items-center gap-1">
                          <ArrowRight size={10} /> Amount to Dispatch
                        </label>
                        <div className="bg-black/40 border border-white/10 rounded-xl p-4 flex items-center justify-between gap-3 focus-within:border-indigo-500/50 transition-all duration-300 shadow-inner">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={amount ? formatNumberWithCommas(amount) : ''}
                            onChange={(e) => {
                              const raw = e.target.value.replace(/,/g, '');
                              if (raw === '' || /^\d*\.?\d*$/.test(raw)) {
                                setAmount(raw);
                                setResult(null);
                              }
                            }}
                            aria-label="Amount to convert"
                            className="bg-transparent text-2xl font-mono text-white outline-none w-full font-black placeholder:text-slate-700"
                            placeholder="0.00"
                          />
                          <CustomSelect 
                            value={fromCurrency} 
                            onChange={(val) => {setFromCurrency(val); setResult(null);}} 
                            options={availableCurrencies.filter(c => c !== toCurrency)} 
                          />
                        </div>
                      </div>

                      {/* Swap Button */}
                      <div className="md:col-span-2 flex justify-center items-center">
                        <motion.button
                          animate={{ rotate: swapAnimating ? 360 : 0 }}
                          transition={{ duration: 0.5, ease: "easeInOut" }}
                          onClick={handleSwap}
                          aria-label="Swap currencies"
                          className="relative group"
                        >
                          <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500/30 to-purple-500/30 rounded-full blur-md opacity-0 group-hover:opacity-100 transition duration-300" />
                          <div className="relative w-12 h-12 bg-gradient-to-br from-[#1a1a2e] to-[#0d0d1a] rounded-full border border-indigo-500/40 hover:border-indigo-400 transition-all duration-300 shadow-lg flex items-center justify-center group-hover:shadow-indigo-500/25">
                            <ArrowLeftRight size={18} className="text-indigo-400 group-hover:text-white transition-colors" />
                          </div>
                        </motion.button>
                      </div>

                      {/* To Currency Result */}
                      <div className="md:col-span-5 flex flex-col gap-2">
                        <label className="text-[9px] font-mono font-black text-slate-500 uppercase tracking-widest px-1 flex items-center gap-1">
                          <CheckCircle2 size={10} /> Target Ledger Asset
                        </label>
                        <div className="bg-black/40 border border-white/10 rounded-xl p-4 flex items-center justify-between gap-3 shadow-inner">
                          <span className="text-2xl font-mono text-slate-200 w-full font-black overflow-hidden truncate">
                            {result !== null ? formatCurrencyValue(result, toCurrency) : "---"}
                          </span>
                          <div className="flex items-center gap-2">
                            {result !== null && (
                              <button
                                onClick={handleCopyResult}
                                aria-label="Copy conversion result"
                                className="p-2 hover:bg-white/10 rounded-lg transition-all group relative"
                                title="Copy result"
                              >
                                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} className="text-slate-400 group-hover:text-white" />}
                              </button>
                            )}
                            <CustomSelect 
                              value={toCurrency} 
                              onChange={(val) => {setToCurrency(val); setResult(null);}} 
                              options={availableCurrencies.filter(c => c !== fromCurrency)} 
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Rate Info Panel */}
                    <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/5 border border-indigo-500/20 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-indigo-400 font-bold font-mono text-[10px] uppercase tracking-wider">
                          <Zap size={12} /> Live Exchange Vector
                          {isWebSocketConnected && (
                            <span className="text-emerald-400 text-[8px] ml-1">● LIVE</span>
                          )}
                        </div>
                        <h3 className="text-base font-black text-white font-mono tracking-wide">
                          {(exchangeRate !== null)
                            ? `1 ${fromCurrency} = ${formatCurrencyValue(exchangeRate, toCurrency)} ${toCurrency}`
                            : "Click commit to fetch live rate calculation..."}
                        </h3>
                        {savingsAmount !== null && result !== null && (
                          <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[10px] mt-1">
                            <span className="font-bold">✨ You save {formatCurrencyValue(savingsAmount, toCurrency)} {toCurrency}</span>
                            <span className="text-slate-500">vs retail banks</span>
                          </div>
                        )}
                        {retryCount > 0 && !result && (
                          <div className="flex items-center gap-2 mt-2">
                            <AlertTriangle size={12} className="text-amber-400" />
                            <span className="text-[10px] text-amber-400 font-mono">Connection failed.</span>
                            <button
                              onClick={() => handleConvertDebounced(true)}
                              disabled={isRetrying}
                              aria-label="Retry conversion"
                              className="text-[10px] text-indigo-400 hover:text-indigo-300 underline font-mono flex items-center gap-1 cursor-pointer"
                            >
                              {isRetrying ? <Loader2 size={10} className="animate-spin" /> : <RefreshCw size={10} />}
                              Retry
                            </button>
                            <span className="text-[9px] text-slate-500">({retryCount} attempt{retryCount > 1 ? 's' : ''})</span>
                          </div>
                        )}
                      </div>
                      <div className="text-left md:text-right font-mono">
                        <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider">Spread Protection SLA</span>
                        <div className="flex items-center gap-1 text-emerald-400 font-bold text-[10px] uppercase">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Guaranteed Rate Match
                        </div>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleConvertDebounced(false)}
                      disabled={loading}
                      aria-label="Convert currency"
                      className="w-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:via-indigo-400 hover:to-purple-500 text-white font-mono font-bold py-4 rounded-xl shadow-lg shadow-indigo-600/30 transition-all text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {loading ? <Loader2 className="animate-spin" size={14} /> : <><Sparkles size={14} /> Commit Conversion & Log History <ArrowRight size={13} /></>}
                    </motion.button>
                  </div>
                </div>
              )}
            </motion.div>

            {/* History Ledger */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-4 relative group h-full"
            >
              {isInitialLoading || historyLoading ? (
                <SkeletonRecentLedger />
              ) : (
                <div className="relative bg-gradient-to-br from-[#11111a] to-[#0c0c12] border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col gap-5 h-full">
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                    <h3 className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                      <History className="text-indigo-400" size={13} /> Recent Ledger
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowHistoryModal(true)}
                        aria-label="View all history"
                        className="text-[9px] font-mono font-bold text-slate-500 hover:text-indigo-400 uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer"
                        title="View all history"
                      >
                        <Eye size={12} />
                      </button>
                      {history.length > 0 && (
                        <>
                          <button
                            onClick={handleClearAllHistory}
                            aria-label="Clear all history"
                            className="text-[9px] font-mono font-bold text-slate-500 hover:text-rose-400 uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer"
                            title="Clear all history"
                          >
                            <Trash2 size={12} />
                          </button>
                          <button
                            onClick={exportHistoryToCSV}
                            aria-label="Export history to CSV"
                            className="text-[9px] font-mono font-bold text-slate-500 hover:text-emerald-400 uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer"
                          >
                            <Download size={12} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                    {history.length > 0 ? (
                      (() => {
                        const recentHistory = history.slice(0, 4);

                        if (recentHistory.length === 0) {
                          return (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex flex-col items-center gap-4 py-12 text-center select-none"
                            >
                              <div className="relative">
                                <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full" />
                                <div className="relative p-4 bg-gradient-to-br from-indigo-500/10 to-sky-500/10 rounded-2xl border border-indigo-500/20">
                                  <Database size={32} className="text-indigo-400" />
                                </div>
                              </div>
                              <div className="flex flex-col gap-2">
                                <p className="text-slate-400 text-xs font-bold font-mono">No Recent Transactions</p>
                                <p className="text-slate-500 text-[10px] font-mono">No transactions in the last 48 hours</p>
                              </div>
                            </motion.div>
                          );
                        }

                        return (
                          <AnimatePresence mode="popLayout">
                            {recentHistory.map((item, index) => (
                              <motion.div
                                key={item.history_id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.2, delay: index * 0.05 }}
                                className="bg-gradient-to-r from-black/40 to-transparent border border-white/5 rounded-xl p-3 hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/10 transition-all group cursor-pointer relative"
                                onClick={() => handleQuickReRun(item)}
                              >
                                <div className="flex justify-between items-center mb-1.5">
                                  <span className="text-[9px] font-mono font-bold text-indigo-400 group-hover:text-white transition-colors uppercase flex items-center gap-1.5">
                                    {item.from_currency} → {item.to_currency}
                                    <RotateCcw size={9} className="text-slate-500 group-hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteHistoryItem(item.history_id);
                                      }}
                                      aria-label="Delete history item"
                                      className="p-1 hover:bg-red-500/20 rounded opacity-0 group-hover:opacity-100 transition-all"
                                      title="Delete this item"
                                    >
                                      <Trash2 size={10} className="text-red-400" />
                                    </button>
                                  </span>
                                  <span className="text-[7px] font-mono text-slate-500 font-bold uppercase tracking-wider">
                                    {formatTimeAgo(item.created_at || '')}
                                  </span>
                                </div>
                                <div className="flex justify-between items-baseline gap-2">
                                  <span className="text-[10px] font-mono text-slate-400">{formatCurrencyValue(item.amount_input, item.from_currency)}</span>
                                  <span className="text-xs font-mono text-emerald-400 font-extrabold">{formatCurrencyValue(item.amount_output, item.to_currency)}</span>
                                </div>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        );
                      })()
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center gap-4 py-12 text-center select-none"
                      >
                        <div className="relative">
                          <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full" />
                          <div className="relative p-4 bg-gradient-to-br from-indigo-500/10 to-sky-500/10 rounded-2xl border border-indigo-500/20">
                            <Database size={32} className="text-indigo-400" />
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <p className="text-slate-400 text-xs font-bold font-mono">No Transaction History</p>
                          <p className="text-slate-500 text-[10px] font-mono">Start converting currencies to build your ledger</p>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* 4. Market Pulse Section */}
          <ErrorBoundary>
            <section className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full" />
                <h2 className="text-xl font-black text-slate-200 font-mono tracking-wide">Market Pulse ({fromCurrency}/{toCurrency})</h2>
                <div className="flex items-center gap-2 text-[9px] font-mono text-emerald-500 font-bold uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  <div className={`w-1.5 h-1.5 rounded-full ${isWebSocketConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                  {isWebSocketConnected ? 'Real-time' : 'Updating...'}
                </div>
              </div>
              <div className="hidden lg:flex items-center gap-3 text-[8px] font-mono text-slate-500">
                <div className="flex items-center gap-1">
                  <Droplets size={10} className="text-cyan-400" />
                  <span>Liquidity: {marketPulse?.liquidity || 'Deep'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Activity size={10} className="text-indigo-400" />
                  <span>Vol: {marketPulse?.volume24h ? '$' + (marketPulse.volume24h / 1000000).toFixed(1) + 'B' : '--'}</span>
                </div>
              </div>
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4"
            >
              {marketPulseLoading && !marketPulse ? (
                <>
                  <div className="bg-gradient-to-br from-[#11111a] to-[#0a0a0f] border border-white/10 rounded-2xl p-4 sm:p-5 animate-pulse">
                    <div className="h-4 w-20 bg-white/10 rounded mb-3" />
                    <div className="h-8 w-16 bg-white/10 rounded mb-2" />
                    <div className="h-2 w-full bg-white/10 rounded" />
                  </div>
                  <div className="bg-gradient-to-br from-[#11111a] to-[#0a0a0f] border border-white/10 rounded-2xl p-4 sm:p-5 animate-pulse">
                    <div className="h-4 w-20 bg-white/10 rounded mb-3" />
                    <div className="h-8 w-16 bg-white/10 rounded mb-2" />
                    <div className="h-2 w-full bg-white/10 rounded" />
                  </div>
                  <div className="bg-gradient-to-br from-[#11111a] to-[#0a0a0f] border border-white/10 rounded-2xl p-4 sm:p-5 animate-pulse">
                    <div className="h-4 w-20 bg-white/10 rounded mb-3" />
                    <div className="h-8 w-16 bg-white/10 rounded mb-2" />
                    <div className="h-2 w-full bg-white/10 rounded" />
                  </div>
                </>
              ) : (
                <>
                  {/* Volatility Index */}
                  <div className="group bg-gradient-to-br from-[#11111a] to-[#0a0a0f] border border-white/10 rounded-2xl p-4 sm:p-5 hover:border-indigo-500/40 transition-all duration-300">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <Gauge size={14} className="text-indigo-400 sm:text-[16px]" />
                        <span className="text-[8px] sm:text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">Volatility</span>
                      </div>
                      <span className={`text-[7px] sm:text-[8px] font-mono font-bold px-1.5 sm:px-2 py-0.5 rounded ${
                        marketPulse?.volatility === 'High' ? 'bg-red-500/20 text-red-400' :
                        marketPulse?.volatility === 'Medium' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {marketPulse?.volatility === 'High' ? 'Extreme' : marketPulse?.volatility === 'Medium' ? 'Moderate' : 'Stable'}
                      </span>
                    </div>
                    
                    <div className="flex items-baseline gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                      <span className={`text-xl sm:text-3xl font-black font-mono ${marketPulse?.priceChangePercent && marketPulse.priceChangePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {marketPulse?.priceChangePercent ? (marketPulse.priceChangePercent >= 0 ? '+' : '') + marketPulse.priceChangePercent.toFixed(2) + '%' : '--'}
                      </span>
                      <span className="text-[7px] sm:text-[8px] font-mono text-slate-500">24h</span>
                    </div>

                    {/* LED Segmented Bars */}
                    <div className="flex gap-0.5 sm:gap-1 mb-1 sm:mb-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((segment) => {
                        const isActive = marketPulse?.volatility === 'High' ? segment <= 10 :
                                      marketPulse?.volatility === 'Medium' ? segment <= 6 : segment <= 3;
                        const color = marketPulse?.volatility === 'High' ? 'from-red-500 to-red-400' :
                                    marketPulse?.volatility === 'Medium' ? 'from-amber-500 to-amber-400' : 'from-emerald-500 to-emerald-400';
                        return (
                          <div
                            key={segment}
                            className={`flex-1 h-2 sm:h-3 rounded-sm transition-all duration-300 ${
                              isActive 
                                ? `bg-gradient-to-t ${color} shadow-lg shadow-indigo-500/30` 
                                : 'bg-white/5'
                            }`}
                          />
                        );
                      })}
                    </div>
                    <div className="flex justify-between text-[6px] sm:text-[7px] font-mono text-slate-600">
                      <span>Stable</span>
                      <span>Extreme</span>
                    </div>
                  </div>

                  {/* Institutional Range */}
                  <div className="group bg-gradient-to-br from-[#11111a] to-[#0a0a0f] border border-white/10 rounded-2xl p-4 sm:p-5 hover:border-indigo-500/40 transition-all duration-300">
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                      <BarChart3 size={14} className="text-indigo-400 sm:text-[16px]" />
                      <span className="text-[8px] sm:text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">Range</span>
                    </div>
                    
                    <div className="flex justify-between items-end mb-3 sm:mb-4">
                      <div>
                        <span className="text-[6px] sm:text-[8px] font-mono text-slate-500 block mb-0.5 sm:mb-1">LOW</span>
                        <span className="text-sm sm:text-lg font-black text-white font-mono">
                          {marketPulse?.dayLow ? formatCurrencyValue(marketPulse.dayLow, toCurrency) : '--'}
                        </span>
                      </div>
                      <div className="text-center">
                        <span className="text-[6px] sm:text-[8px] font-mono text-indigo-400 font-bold block mb-0.5 sm:mb-1">CURRENT</span>
                        <span className="text-sm sm:text-lg font-black text-indigo-400 font-mono">
                          {exchangeRate ? formatCurrencyValue(exchangeRate, toCurrency) : '--'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[6px] sm:text-[8px] font-mono text-slate-500 block mb-0.5 sm:mb-1">HIGH</span>
                        <span className="text-sm sm:text-lg font-black text-white font-mono">
                          {marketPulse?.dayHigh ? formatCurrencyValue(marketPulse.dayHigh, toCurrency) : '--'}
                        </span>
                      </div>
                    </div>

                    {/* Trading Terminal Slider */}
                    <div className="relative">
                      <div className="h-5 sm:h-8 bg-gradient-to-r from-indigo-900/50 to-indigo-800/50 rounded-lg border border-indigo-500/30 relative overflow-hidden">
                        <div className="absolute inset-0 flex">
                          {[...Array(20)].map((_, i) => (
                            <div key={i} className="flex-1 border-r border-white/5" />
                          ))}
                        </div>
                        
                        {(() => {
                          const range = marketPulse?.dayHigh && marketPulse.dayLow ? marketPulse.dayHigh - marketPulse.dayLow : 1;
                          const currentPrice = exchangeRate || (marketPulse?.dayLow || 0);
                          const position = marketPulse?.dayLow ? ((currentPrice - marketPulse.dayLow) / range) * 100 : 50;
                          return (
                            <>
                              <div 
                                className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 transition-all duration-500"
                                style={{ width: `${Math.min(Math.max(position, 0), 100)}%` }}
                              />
                              <div 
                                className="absolute top-0 bottom-0 w-1 bg-white animate-pulse transition-all duration-500"
                                style={{ 
                                  left: `${Math.min(Math.max(position, 0), 100)}%`,
                                  boxShadow: '0 0 20px rgba(99, 102, 241, 0.8), 0 0 40px rgba(99, 102, 241, 0.6), 0 0 60px rgba(99, 102, 241, 0.4)'
                                }}
                              />
                            </>
                          );
                        })()}
                      </div>
                      
                      <div className="flex justify-between mt-1 sm:mt-2 px-1">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="flex flex-col items-center">
                            <div className="w-px h-1.5 sm:h-2 bg-slate-600" />
                            <span className="text-[5px] sm:text-[6px] font-mono text-slate-600 mt-0.5 sm:mt-1">
                              {i * 25}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Sentiment */}
                  <div className="group bg-gradient-to-br from-[#11111a] to-[#0a0a0f] border border-white/10 rounded-2xl p-4 sm:p-5 hover:border-indigo-500/40 transition-all duration-300">
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                      <Scale size={14} className="text-indigo-400 sm:text-[16px]" />
                      <span className="text-[8px] sm:text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">Sentiment</span>
                    </div>
                    
                    <div className="flex justify-between items-center mb-3 sm:mb-4">
                      <div className="text-center">
                        <span className="text-[6px] sm:text-[8px] font-mono text-emerald-400 font-bold block mb-0.5 sm:mb-1">BULLS</span>
                        <span className="text-2xl sm:text-4xl font-black text-emerald-400 font-mono">
                          {marketPulse?.sentimentBuy || 65}%
                        </span>
                      </div>
                      <div className="text-center">
                        <span className="text-[6px] sm:text-[8px] font-mono text-red-400 font-bold block mb-0.5 sm:mb-1">BEARS</span>
                        <span className="text-2xl sm:text-4xl font-black text-red-400 font-mono">
                          {marketPulse?.sentimentSell || 35}%
                        </span>
                      </div>
                    </div>

                    <div className="relative h-4 sm:h-6 bg-white/5 rounded-lg border border-white/10 overflow-hidden">
                      <div 
                        className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
                        style={{ width: marketPulse?.sentimentBuy ? marketPulse.sentimentBuy + '%' : '65%' }}
                      />
                      <div className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-red-500 to-red-400 transition-all duration-500"
                        style={{ 
                          left: marketPulse?.sentimentBuy ? marketPulse.sentimentBuy + '%' : '65%',
                          width: marketPulse?.sentimentSell ? marketPulse.sentimentSell + '%' : '35%'
                        }}
                      />
                      <div 
                        className="absolute top-0 bottom-0 w-0.5 bg-white/50 shadow-lg"
                        style={{ left: marketPulse?.sentimentBuy ? marketPulse.sentimentBuy + '%' : '65%' }}
                      />
                    </div>

                    <div className="hidden sm:block mt-2 sm:mt-3 text-center">
                      <span className="text-[7px] sm:text-[8px] font-mono text-slate-400 italic truncate block">
                        "{marketPulse?.sentimentBuy && marketPulse.sentimentBuy > 50 
                          ? `${marketPulse.sentimentBuy}% bulls driving ${fromCurrency} upward` 
                          : `${marketPulse?.sentimentSell || 35}% bears pressuring ${fromCurrency} downward`}"
                      </span>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </section>
          </ErrorBoundary>

          {/* 5. Top Movers Dashboard */}
          <ErrorBoundary>
            <section className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full" />
              <h2 className="text-xl font-black text-slate-200 font-mono tracking-wide">Top Movers</h2>
              <div className="flex items-center gap-2 text-[9px] font-mono text-emerald-500 font-bold uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                <div className={`w-1.5 h-1.5 rounded-full ${isWebSocketConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                {isWebSocketConnected ? 'Real-time' : 'Updating...'}
              </div>
            </div>

            {isInitialLoading || topMoversLoading ? (
              <SkeletonTopMoversTable />
            ) : topMovers.length > 0 ? (
              <div className="bg-[#11111a] border border-white/10 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-xs font-mono font-bold text-slate-400 uppercase">Currency</th>
                      <th className="text-right py-3 px-4 text-xs font-mono font-bold text-slate-400 uppercase">Change 24h</th>
                      <th className="text-right py-3 px-4 text-xs font-mono font-bold text-slate-400 uppercase">Volume</th>
                      <th className="text-center py-3 px-4 text-xs font-mono font-bold text-slate-400 uppercase">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topMovers.map((mover, index) => (
                      <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4">
                          <span className="text-sm font-bold text-white font-mono">{mover.currency}</span>
                        </td>
                        <td className={`py-3 px-4 text-right font-mono font-bold ${
                          mover.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          {mover.change24h >= 0 ? '+' : ''}{mover.change24h.toFixed(2)}%
                        </td>
                        <td className="py-3 px-4 text-right text-slate-400 font-mono text-sm">
                          ${(mover.volume / 1000000).toFixed(1)}B
                        </td>
                        <td className="py-3 px-4 text-center">
                          {mover.trend === 'up' ? (
                            <span className="text-emerald-400">↑</span>
                          ) : (
                            <span className="text-red-400">↓</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-[#11111a] border border-white/10 rounded-xl p-8 text-center">
                <TrendingUp size={32} className="text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500 text-sm font-mono">No top movers data available.</p>
              </div>
            )}
          </section>
          </ErrorBoundary>

          {/* 6. Currency Strength Heatmap Section */}
          <ErrorBoundary>
            <section className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full" />
              <h2 className="text-xl font-black text-slate-200 font-mono tracking-wide">Currency Strength Heatmap ({fromCurrency})</h2>
              <div className={`w-1.5 h-1.5 rounded-full ${isWebSocketConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {strengthLoading && !currencyStrength ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-gradient-to-br from-[#11111a] to-[#0a0a0f] border border-white/10 rounded-xl p-3.5 animate-pulse">
                      <div className="h-4 w-16 bg-white/10 rounded mb-2" />
                      <div className="h-6 w-12 bg-white/10 rounded mb-2" />
                      <div className="h-2 w-full bg-white/10 rounded" />
                    </div>
                  ))}
                </div>
              ) : currencyStrength ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {currencyStrength.targets.map((target, index) => {
                    const isPositive = target.change24h >= 0;
                    const intensity = Math.abs(target.change24h);
                    const bgColor = isPositive 
                      ? intensity > 0.5 ? 'bg-emerald-500/20' : 'bg-emerald-500/10'
                      : intensity > 0.5 ? 'bg-red-500/20' : 'bg-red-500/10';
                    const textColor = isPositive ? 'text-emerald-400' : 'text-red-400';
                    
                    return (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className={`${bgColor} border ${isPositive ? 'border-emerald-500/20' : 'border-red-500/20'} rounded-xl p-3.5 hover:scale-105 transition-all cursor-pointer`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-black text-white font-mono">
                            {fromCurrency}/{target.currency}
                          </span>
                          {isPositive ? (
                            <TrendUp size={14} className={textColor} />
                          ) : (
                            <TrendDown size={14} className={textColor} />
                          )}
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className={`text-lg font-black font-mono ${textColor}`}>
                            {isPositive ? '+' : ''}{target.change24h.toFixed(2)}%
                          </span>
                        </div>
                        <div className="mt-2">
                          <div className="w-full bg-white/10 rounded-full h-1 overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                isPositive ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 'bg-gradient-to-r from-red-500 to-red-400'
                              }`}
                              style={{ width: `${target.strength}%` }}
                            />
                          </div>
                          <span className="text-[7px] font-mono text-slate-400 mt-1 block">
                            Strength: {target.strength}/100
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <div className="p-3 bg-white/[0.02] rounded-full text-slate-600">
                    <Grid3x3 size={24} />
                  </div>
                  <p className="text-slate-500 text-[10px] font-mono italic">No strength data available.</p>
                </div>
              )}
              
              <div className="mt-5 pt-4 border-t border-white/5">
                <div className="flex items-center justify-center gap-6 text-[11px] font-mono text-slate-800">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 bg-emerald-500/20 rounded border border-emerald-500/30" />
                    <span>Strong ({fromCurrency} gaining)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 bg-red-500/20 rounded border border-red-500/30" />
                    <span>Weak ({fromCurrency} losing)</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </section>
          </ErrorBoundary>

          {/* 7. Market Analysis Trajectory - CHART SECTION */}
          <ErrorBoundary>
            <section className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full" />
                <h2 className="text-xl font-black text-slate-200 font-mono tracking-wide">
                  Market Analysis Trajectory ({fromCurrency}/{toCurrency})
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[9px] font-mono font-bold px-3 py-1.5 rounded-full border flex items-center gap-1.5 transition-all ${
                  isWebSocketConnected 
                    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
                    : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                }`}>
                  {isWebSocketConnected ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      LIVE UPDATES
                    </>
                  ) : (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      UPDATING...
                    </>
                  )}
                </span>
                <span className="text-[7px] font-mono text-slate-500 hidden sm:block">
                  {chartData.length} pts
                </span>
              </div>
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="bg-gradient-to-br from-[#11111a] to-[#0b0b11] border border-white/10 rounded-3xl p-6 sm:p-8 h-[420px] shadow-2xl relative overflow-hidden"
              suppressHydrationWarning
            >
              {/* Grid background */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.005)_1px,transparent_1px)] bg-[size:100%_40px] pointer-events-none" />
              
              {!isClient || chartLoading ? (
                // Loading state
                <div className="flex flex-col gap-3 h-full p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
                  </div>
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="h-full bg-gradient-to-t from-white/5 to-transparent rounded-lg animate-pulse" />
                  </div>
                  <div className="flex justify-between gap-2">
                    <div className="h-3 w-12 bg-white/10 rounded animate-pulse" />
                    <div className="h-3 w-12 bg-white/10 rounded animate-pulse" />
                    <div className="h-3 w-12 bg-white/10 rounded animate-pulse" />
                    <div className="h-3 w-12 bg-white/10 rounded animate-pulse" />
                  </div>
                </div>
              ) : formattedChartData && formattedChartData.length > 0 ? (
                // Chart với Recharts - Overlay comparison (Current vs Historical)
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={formattedChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
                    <XAxis
                      dataKey="time"
                      axisLine={false}
                      tickLine={false}
                      tick={{fill: '#475569', fontSize: 10, fontFamily: 'monospace'}}
                      dy={10}
                    />
                    <YAxis hide domain={['auto', 'auto']} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0a0a0f', 
                        border: '1px solid rgba(255,255,255,0.1)', 
                        borderRadius: '12px', 
                        fontSize: '10px', 
                        fontFamily: 'monospace'
                      }}
                      labelStyle={{color: '#94a3b8', fontSize: '9px'}}
                      formatter={(value: any) => {
                        const numValue = typeof value === 'number' ? value : parseFloat(value);
                        if (isNaN(numValue)) return '0.0000';
                        return numValue.toFixed(4);
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '10px' }}
                      iconType="line"
                    />
                    {/* Past Day Line - Dashed Purple (drawn first, behind) */}
                    <Line 
                      type="monotone"
                      dataKey="pastValue"
                      name="Yesterday"
                      stroke="#a855f7"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                      animationDuration={800}
                      isAnimationActive={true}
                      connectNulls={false}
                    />
                    {/* Current Day Line - Solid Green (drawn second, on top) */}
                    <Line 
                      type="monotone"
                      dataKey="currentValue"
                      name="Today"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      dot={false}
                      animationDuration={800}
                      isAnimationActive={true}
                      connectNulls={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                // Empty state
                <div className="flex items-center justify-center h-full text-slate-500 font-mono text-xs">
                  No historical data available.
                </div>
              )}
              
              {/* Real-time update indicator */}
              {isWebSocketConnected && (
                <div className="absolute bottom-3 right-4 flex items-center gap-1.5">
                  <span className="text-[7px] font-mono text-emerald-400/50 animate-pulse font-bold tracking-wider">
                    ● LIVE
                  </span>
                </div>
              )}
            </motion.div>
          </section>
          </ErrorBoundary>

        </div>
      </main>

      <Footer />

      {/* History Modal */}
      <AnimatePresence>
        {showHistoryModal && (
          <>
            <div 
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
              onClick={() => setShowHistoryModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ duration: 0.2, type: "spring", stiffness: 400 }}
              className="fixed inset-4 md:inset-8 lg:inset-16 z-50 bg-[#0a0a0f] rounded-2xl border border-indigo-500/30 shadow-2xl shadow-indigo-500/20 flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#11111a] to-[#0d0d14] border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 cursor-pointer transition-colors" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-500 cursor-pointer transition-colors" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80 hover:bg-green-500 cursor-pointer transition-colors" />
                </div>
                <h3 className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                  <History className="text-indigo-400" size={13} /> System Transaction Log
                </h3>
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <Check size={16} />
                </button>
              </div>

              {isInitialLoading || historyLoading ? (
                <SkeletonHistoryModal />
              ) : history.length > 0 ? (
                <div className="flex-1 overflow-auto p-6 custom-scrollbar">
                  <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-indigo-500/20">
                        <th className="text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-wider text-left py-3 px-2">ID</th>
                        <th className="text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-wider text-left py-3 px-2">Date</th>
                        <th className="text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-wider text-left py-3 px-2">From</th>
                        <th className="text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-wider text-left py-3 px-2">To</th>
                        <th className="text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-wider text-right py-3 px-2">Input</th>
                        <th className="text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-wider text-right py-3 px-2">Output</th>
                        <th className="text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-wider text-center py-3 px-2">Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((item, index) => (
                        <motion.tr 
                          key={item.history_id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.02 }}
                          className="border-b border-white/[0.03] hover:bg-indigo-500/5 transition-colors cursor-pointer"
                          onClick={() => {
                            handleQuickReRun(item);
                            setShowHistoryModal(false);
                          }}
                        >
                          <td className="text-[9px] font-mono text-slate-500 py-3 px-2">#{item.history_id}</td>
                          <td className="text-[9px] font-mono text-slate-400 py-3 px-2">
                            {item.created_at ? new Date(item.created_at).toLocaleString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            }) : '---'}
                          </td>
                          <td className="text-[10px] font-mono font-bold text-indigo-400 py-3 px-2">{item.from_currency}</td>
                          <td className="text-[10px] font-mono font-bold text-emerald-400 py-3 px-2">{item.to_currency}</td>
                          <td className="text-[10px] font-mono text-slate-300 py-3 px-2 text-right">{formatCurrencyValue(item.amount_input, item.from_currency)}</td>
                          <td className="text-[10px] font-mono font-bold text-emerald-400 py-3 px-2 text-right">{formatCurrencyValue(item.amount_output, item.to_currency)}</td>
                          <td className="text-[9px] font-mono text-slate-500 py-3 px-2 text-center">
                            {(item.amount_output / item.amount_input).toFixed(6)}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center gap-4 py-20 text-center select-none">
                  <div className="relative">
                    <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full" />
                    <div className="relative p-4 bg-gradient-to-br from-indigo-500/10 to-sky-500/10 rounded-2xl border border-indigo-500/20">
                      <Database size={40} className="text-indigo-400" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className="text-slate-400 text-sm font-bold font-mono">No Transaction History</p>
                    <p className="text-slate-500 text-[10px] font-mono">Start converting currencies to build your ledger</p>
                  </div>
                </div>
              )}

              <div className="px-6 py-4 bg-gradient-to-t from-[#11111a] to-[#0d0d14] border-t border-white/10 flex items-center justify-between">
                <div className="text-[9px] font-mono text-slate-500">
                  Total Records: <span className="text-indigo-400 font-bold">{history.length}</span>
                </div>
                <button
                  onClick={exportHistoryToCSV}
                  className="text-[9px] font-mono font-bold text-slate-500 hover:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download size={10} /> Export CSV
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}