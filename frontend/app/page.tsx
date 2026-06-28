"use client";

import { useState, useEffect, useMemo, useCallback, useRef, memo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight, ArrowRightLeft, ShieldCheck, Zap, Globe2,
  TrendingUp, TrendingDown, Bell, Lock, Cpu, BarChart3,
  ChevronRight, History, Quote, Globe, Loader2, Info, ChevronDown,
  HelpCircle, Mail, MessageSquare, Send, CheckCircle2, Award, Sparkles,
  Activity, BarChart, Layers, Command, ExternalLink, Star,
  Wallet, RefreshCw, Database, Cloud, Fingerprint, Gauge, User,
  AlertTriangle, Copy, RotateCcw, Eye, Trash2, ArrowUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart, Line, Tooltip, ResponsiveContainer,
  XAxis, Cell, AreaChart, Area, CartesianGrid
} from "recharts";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Analytics } from "@vercel/analytics/react";
import "./css/User/home.css";
import { track } from "@vercel/analytics/react";

interface HistoryItem {
  history_id: number;
  amount_input: number;
  from_currency: string;
  to_currency: string;
  amount_output: number;
  created_at?: string;
}

interface NewsItem {
  news_id: number;
  title: string;
  category: string;
  content: string;
  image_url: string;
  views: number;
  published_at: string;
}

interface Rate {
  pair: string;
  name: string;
  price: string;
  change: string;
  trend: string;
  volatility: string;
  volume: string;
}

interface ChartData {
  timestamp: string;
  value: number;
}

interface MarketPair {
  pair: string;
  base: string;
  target: string;
}

interface OverviewChartData {
  time: string;
  value: number;
}

interface HealthData {
  latency: string;
  uptime: string;
}

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info';
  visible: boolean;
}

type ActiveInput = 'send' | 'receive';

// ─── CONSTANTS ───
const GUEST_ALLOWED_CODES = ["USD", "EUR", "GBP", "JPY", "VND"];
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
const GUEST_HISTORY_KEY = "guest_conversion_history";

// Debounce and timing constants
const DEBOUNCE_DELAY_MS = 300;
const POLLING_INTERVAL_MS = 5000;
const TOAST_DURATION_MS = 3000;
const SWAP_ANIMATION_DURATION_MS = 300;
const SWAP_ANIMATION_DELAY_MS = 150;

// Chart data constants
const CHART_DATA_MAX_POINTS = 19;
const CHART_TIME_INTERVALS = [
  0,
  3600000,   // 1 hour
  7200000,   // 2 hours
  10800000,  // 3 hours
  14400000,  // 4 hours
  18000000,  // 5 hours
  21600000,  // 6 hours
];

// Transaction constants
const DEFAULT_SLIPPAGE = 0.01;
const DEFAULT_FEE = 0;
const INITIAL_EXCHANGE_RATE = 25410;

// Animation constants
const SPRING_STIFFNESS = 300;
const ANIMATION_DURATION = 0.3;

// ─── FORMAT HELPERS ───
const getDecimalPrecision = (currency: string): number => {
  if (currency === "JPY") return 0;
  if (currency === "VND") return 2;
  const cryptoCurrencies = ["BTC", "ETH", "XRP", "LTC", "BCH", "ADA", "DOT", "LINK", "UNI", "AVAX"];
  if (cryptoCurrencies.includes(currency)) return 6;
  return 2;
};

const formatWithPrecision = (value: number, currency: string): string => {
  const precision = getDecimalPrecision(currency);
  return value.toLocaleString('en-US', {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision
  });
};

const formatNumberWithCommas = (value: string): string => {
  const numStr = value.replace(/,/g, '');
  if (!numStr || isNaN(parseFloat(numStr))) return '';
  const [int, dec] = numStr.split('.');
  return dec !== undefined ? `${int.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}.${dec}` : int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const parseFormattedNumber = (formatted: string): string => formatted.replace(/,/g, '');

const FAQ_DATA = [
  {
    question: "How are exchange rates updated?",
    answer: "Our system automatically synchronizes data in real-time every 30 seconds from global bank liquidity providers, ensuring rates are as close as possible to actual Mid-Market rates."
  },
  {
    question: "Are there any hidden fees in the Swap protocol?",
    answer: "No. The platform is committed to absolute transparency. All conversion parameters are clearly displayed with no hidden fees or markup beyond the public exchange rate."
  },
  {
    question: "What are the limitations of a Guest account?",
    answer: "Unverified Guest accounts are limited to 5 core currencies (USD, EUR, GBP, JPY, VND). To unlock the full global asset portfolio and permanent history storage, please create a system account."
  },
  {
    question: "How long does it take for transactions to be processed?",
    answer: "The Instant Swap engine runs directly on optimized software nodes, processing matches locally with sub-millisecond latency."
  }
];

const overviewMarketPairs: MarketPair[] = [
  { pair: "USD / VND", base: "USD", target: "VND" },
  { pair: "EUR / USD", base: "EUR", target: "USD" },
  { pair: "GBP / USD", base: "GBP", target: "USD" },
];

// ─── SKELETON COMPONENTS ───

const SkeletonCard = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gradient-to-br from-white/[0.03] to-white/[0.01] rounded-xl border border-white/5 ${className}`}>
    <div className="w-full h-full flex items-center justify-center">
      <Loader2 size={24} className="text-indigo-500/50 animate-spin" />
    </div>
  </div>
);

const SkeletonText = ({ className = "", width = "w-full" }: { className?: string; width?: string }) => (
  <div className={`animate-pulse bg-white/5 rounded ${width} ${className}`} style={{ height: '1em' }} />
);

const SkeletonMarketCard = () => (
  <div className="bg-gradient-to-br from-[#0d0d14] to-[#08080c] border border-white/10 rounded-2xl p-6 relative overflow-hidden animate-pulse">
    <div className="flex justify-between items-start mb-6">
      <div>
        <div className="h-3 w-20 bg-white/10 rounded mb-2" />
        <div className="h-8 w-24 bg-white/10 rounded" />
      </div>
      <div className="h-6 w-16 bg-white/10 rounded-xl" />
    </div>
    <div className="h-20 w-full bg-white/5 rounded" />
    <div className="mt-4 pt-3 border-t border-white/5 flex justify-between">
      <div className="h-3 w-16 bg-white/10 rounded" />
      <div className="h-3 w-20 bg-white/10 rounded" />
    </div>
  </div>
);

const SkeletonHistoryRow = () => (
  <tr className="animate-pulse">
    <td className="px-6 py-5">
      <div className="flex items-center gap-3">
        <div className="h-6 w-20 bg-white/10 rounded" />
        <div className="h-5 w-12 bg-white/10 rounded" />
      </div>
    </td>
    <td className="px-6 py-5">
      <div className="flex items-center gap-2">
        <div className="h-4 w-8 bg-white/10 rounded" />
        <div className="h-6 w-6 bg-white/10 rounded" />
        <div className="h-4 w-8 bg-white/10 rounded" />
      </div>
    </td>
    <td className="px-6 py-5 text-right">
      <div className="flex flex-col items-end gap-1">
        <div className="h-6 w-24 bg-white/10 rounded" />
        <div className="h-3 w-12 bg-white/10 rounded" />
      </div>
    </td>
  </tr>
);

const SkeletonNewsCard = () => (
  <div className="animate-pulse">
    <div className="relative aspect-[16/10] overflow-hidden rounded-xl mb-3 bg-white/5">
      <div className="w-full h-full bg-gradient-to-br from-white/5 to-white/10" />
    </div>
    <div className="h-4 w-3/4 bg-white/10 rounded mb-2" />
    <div className="flex items-center gap-2">
      <div className="h-3 w-16 bg-white/10 rounded" />
      <div className="w-1 h-1 rounded-full bg-white/10" />
      <div className="h-3 w-12 bg-white/10 rounded" />
    </div>
  </div>
);

const SkeletonToolCard = () => (
  <div className="group p-6 bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 rounded-xl animate-pulse">
    <div className="w-12 h-12 bg-white/10 rounded-xl mb-5" />
    <div className="h-4 w-3/4 bg-white/10 rounded mb-2" />
    <div className="h-3 w-full bg-white/10 rounded" />
    <div className="h-3 w-2/3 bg-white/10 rounded mt-1" />
  </div>
);

const SkeletonSecurityCard = () => (
  <div className="bg-gradient-to-br from-[#0d0d14] to-[#08080c] border border-white/10 rounded-2xl p-6 animate-pulse">
    <div className="w-12 h-12 bg-white/10 rounded-xl mb-4" />
    <div className="h-4 w-3/4 bg-white/10 rounded mb-2" />
    <div className="h-3 w-full bg-white/10 rounded" />
  </div>
);

const SkeletonFaqItem = () => (
  <div className="bg-gradient-to-br from-[#0d0d14] to-[#08080c] border border-white/10 rounded-xl p-5 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="h-4 w-3/4 bg-white/10 rounded" />
      <div className="h-4 w-4 bg-white/10 rounded" />
    </div>
  </div>
);

// ─── COMPONENTS ───

const CustomSelect = memo(({ value, onChange, options }: { value: string; onChange: (val: string) => void; options: string[] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
        setFocusedIndex(0);
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setFocusedIndex(-1);
        buttonRef.current?.focus();
        break;
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => (prev + 1) % options.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => (prev - 1 + options.length) % options.length);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0) {
          onChange(options[focusedIndex]);
          setIsOpen(false);
          setFocusedIndex(-1);
        }
        break;
    }
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Select currency, currently ${value}`}
        className="group relative bg-gradient-to-br from-white/[0.05] to-white/[0.02] hover:from-indigo-500/20 hover:to-indigo-600/10 px-4 py-2.5 rounded-xl border border-white/10 hover:border-indigo-500/50 transition-all duration-300 flex items-center gap-2 outline-none shadow-md cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#02020a]"
      >
        <span className="font-mono font-bold text-sm bg-gradient-to-r from-indigo-200 to-white bg-clip-text text-transparent">
          {value}
        </span>
        <ChevronDown size={14} className={`transition-all duration-300 text-indigo-400 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setIsOpen(false);
                  setFocusedIndex(-1);
                  buttonRef.current?.focus();
                }
              }}
            />
            <motion.div
              ref={listRef}
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              role="listbox"
              aria-activedescendant={focusedIndex >= 0 ? `option-${focusedIndex}` : undefined}
              className="absolute right-0 mt-2 w-32 max-h-56 bg-[#0a0a12]/95 border border-indigo-500/30 rounded-xl shadow-2xl overflow-y-auto z-50 divide-y divide-white/[0.04] backdrop-blur-xl"
            >
              {options.map((opt, idx) => (
                <button
                  key={opt}
                  id={`option-${idx}`}
                  type="button"
                  role="option"
                  aria-selected={opt === value}
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                    setFocusedIndex(-1);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-xs font-mono font-bold transition-all duration-200 block cursor-pointer outline-none
                    ${opt === value ? "text-indigo-400 bg-indigo-500/15" : "text-slate-300 hover:bg-white/5 hover:text-white"}
                    ${focusedIndex === idx ? "bg-indigo-500/20" : ""}`}
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

CustomSelect.displayName = 'CustomSelect';

const NumberInput = memo(({ value, onChange, disabled }: { value: string; onChange: (val: string) => void; disabled?: boolean }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const raw = e.target.value.replace(/,/g, '');
    if (raw === '' || /^\d*\.?\d*$/.test(raw)) {
      onChange(raw);
    }
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        inputMode="decimal"
        value={value ? formatNumberWithCommas(value) : ''}
        onChange={handleChange}
        disabled={disabled}
        aria-label="Enter amount to send"
        className={`bg-transparent text-5xl font-mono font-bold text-white outline-none w-full placeholder:text-slate-700 focus:placeholder:text-slate-600 transition-all rounded-lg ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        placeholder="0.00"
      />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
    </div>
  );
});

NumberInput.displayName = 'NumberInput';

// ─── MAIN PAGE ───

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [amount, setAmount] = useState<string>("0");
  const [from, setFrom] = useState<string>("USD");
  const [to, setTo] = useState<string>("VND");
  const [result, setResult] = useState<number | null>(null);
  const [receiveAmount, setReceiveAmount] = useState<string>("");
  const [activeInput, setActiveInput] = useState<'send' | 'receive'>('send');
  const [isCalculating, setIsCalculating] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isGuest, setIsGuest] = useState<boolean>(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [swapAnimating, setSwapAnimating] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [currentUser, setCurrentUser] = useState<{ username?: string; email?: string } | null>(null);
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [popularNews, setPopularNews] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [rates, setRates] = useState<Rate[]>([]);
  const [overviewChartData, setOverviewChartData] = useState<Record<string, { time: string; value: number }[]>>({});
  const [healthData, setHealthData] = useState<HealthData>({ latency: "0.001s", uptime: "99.99%" });
  const [availableCurrencies, setAvailableCurrencies] = useState<string[]>(GUEST_ALLOWED_CODES);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [slippage] = useState(DEFAULT_SLIPPAGE);
  const [fee] = useState(DEFAULT_FEE);
  
  // Loading states for each section
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [isMarketLoading, setIsMarketLoading] = useState(true);
  const [isToolsLoading, setIsToolsLoading] = useState(true);
  const [isSecurityLoading, setIsSecurityLoading] = useState(true);
  const [isFaqLoading, setIsFaqLoading] = useState(true);
  
  // Toast state
  const [toast, setToast] = useState<ToastState>({
    message: '',
    type: 'info',
    visible: false
  });

  // Chart state
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [chartLoading, setChartLoading] = useState<boolean>(false);
  const [isWebSocketConnected, setIsWebSocketConnected] = useState<boolean>(false);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  
  // Scroll to top state
  const [showScrollTop, setShowScrollTop] = useState(false);

  // ─── SCROLL TO TOP ───
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const initialChartData = [
    { timestamp: new Date().toISOString(), value: 25410 },
    { timestamp: new Date(Date.now() - 3600000).toISOString(), value: 25430 },
    { timestamp: new Date(Date.now() - 7200000).toISOString(), value: 25420 },
    { timestamp: new Date(Date.now() - 10800000).toISOString(), value: 25460 },
    { timestamp: new Date(Date.now() - 14400000).toISOString(), value: 25450 },
    { timestamp: new Date(Date.now() - 18000000).toISOString(), value: 25470 },
    { timestamp: new Date(Date.now() - 21600000).toISOString(), value: 25455 },
  ];

  // ─── TOAST HELPER ───
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), TOAST_DURATION_MS);
  }, []);

  // ─── DEBOUNCE HOOK ───
  const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);

    return debouncedValue;
  };

  // Apply debounce to amount inputs
  const debouncedAmount = useDebounce(amount, DEBOUNCE_DELAY_MS);
  const debouncedReceiveAmount = useDebounce(receiveAmount, DEBOUNCE_DELAY_MS);

  // ─── CURRENCY OPTIONS ───
  const currencyOptions = useMemo(() => {
    if (isGuest) return GUEST_ALLOWED_CODES;
    return availableCurrencies;
  }, [isGuest, availableCurrencies]);

  // ─── EXCHANGE RATE ───
  const currentExchangeRate = useMemo(() => {
    // Only show exchange rate after successful conversion
    if (result === null) return 0;
    return exchangeRate || 0;
  }, [result, exchangeRate]);

  // ─── BIDIRECTIONAL INPUT HANDLERS ───
  const handleSendAmountChange = useCallback((val: string) => {
    setAmount(val);
    setResult(null);
    setReceiveAmount('');
  }, []);

  const handleReceiveAmountChange = useCallback((val: string) => {
    setReceiveAmount(val);
    setResult(null);
    setAmount('');
  }, []);

  // Track currency changes
  const handleFromChange = useCallback((val: string) => {
    setFrom(val);
    track('currency_change', { type: 'from', currency: val });
  }, []);

  const handleToChange = useCallback((val: string) => {
    setTo(val);
    track('currency_change', { type: 'to', currency: val });
  }, []);

  // ─── API FUNCTIONS ───
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
  }, []);

  const fetchHistoricalData = useCallback(async (base: string, target: string) => {
    if (!base || !target) return;
    
    setChartLoading(true);
    
    try {
      const res = await fetch(`${API_BASE}/rates/historical?base=${base}&target=${target}&period=24h`, {
        headers: { "Accept": "application/json" }
      });
      
      const data = await res.json();
      
      if (data.success && data.data && data.data.length > 0) {
        const formattedData = data.data.map((item: { timestamp: string; rate: number }) => ({
          timestamp: item.timestamp,
          value: item.rate
        }));
        setChartData(formattedData);
        console.log(`✅ Historical data loaded: ${formattedData.length} points`);
      } else {
        console.warn(`⚠️ No historical data, using mock data`);
        setChartData(initialChartData);
      }
    } catch (error) {
      console.error("❌ Fetch historical data error:", error);
      setChartData(initialChartData);
    } finally {
      setChartLoading(false);
    }
  }, []);

  const fetchHistoricalDataForOverview = useCallback(async (base: string, target: string, pair: string) => {
    try {
      const response = await fetch(`${API_BASE}/rates/historical?base=${base}&target=${target}&period=24h`);
      const data = await response.json();
      if (data.success && data.data) {
        const formattedData = data.data.map((item: { timestamp: string; rate: number }) => ({
          time: new Date(item.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          value: item.rate
        }));
        setOverviewChartData(prev => ({ ...prev, [pair]: formattedData }));
        setIsMarketLoading(false);
      }
    } catch (error) {
      console.error('Error fetching historical data for overview:', error);
      setIsMarketLoading(false);
    }
  }, []);

  const fetchLiveRate = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

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
          from: from,
          to: to
        })
      });

      const data = await res.json();
      // Don't set exchange rate here - only set after successful conversion
    } catch (error) {
      console.error("Live rate fetch error:", error);
    }
  }, [from, to]);

  const fetchRates = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/rates/current`);
      const data = await response.json();
      if (data.success) {
        setRates(data.rates);
      }
    } catch (error) {
      console.error('Error fetching rates:', error);
    }
  }, []);

  const fetchPopularNews = useCallback(async () => {
    setNewsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/news?page=1`);
      const data = await res.json();
      if (data.success && data.data) {
        const sortedByViews = data.data.sort((a: NewsItem, b: NewsItem) => b.views - a.views);
        setPopularNews(sortedByViews.slice(0, 8));
      }
    } catch (err) {
      console.error("Error fetching popular news:", err);
      setPopularNews([]);
    } finally {
      setNewsLoading(false);
    }
  }, []);

  const fetchHealthData = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/health`);
      if (!response.ok) return;
      const data = await response.json();
      if (data.success) {
        setHealthData({
          latency: `${data.latency}ms`,
          uptime: `${data.uptime}%`
        });
      }
    } catch (error) {
      console.error('Error fetching health data:', error);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    setIsHistoryLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      const guestHistory = JSON.parse(localStorage.getItem(GUEST_HISTORY_KEY) || "[]");
      setHistory(guestHistory);
      setIsHistoryLoading(false);
      return;
    }
    
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
      setIsHistoryLoading(false);
    }
  }, []);

  const refreshAllRates = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/refresh-rates`, {
        headers: {
          ...(token && { "Authorization": `Bearer ${token}` }),
          "Accept": "application/json"
        }
      });
      const data = await res.json();
      if (data.success) {
        showToast("Rates updated successfully!", "success");
        await fetchRates();
        await fetchHistoricalData(from, to);
        // Update overview charts
        overviewMarketPairs.forEach(market => {
          fetchHistoricalDataForOverview(market.base, market.target, market.pair);
        });
      } else {
        showToast("Failed to refresh rates", "error");
      }
    } catch (error) {
      console.error("Refresh rates error:", error);
      showToast("Error refreshing rates", "error");
    } finally {
      setIsRefreshing(false);
    }
  }, [from, to, fetchRates, fetchHistoricalData, fetchHistoricalDataForOverview, showToast]);

  // ─── CONVERT HANDLER ───
  const handleConvert = useCallback(async () => {
    const numericAmount = parseFloat(amount) || 0;
    if (numericAmount <= 0) {
      showToast("Please enter a valid amount", "error");
      return;
    }

    // Check guest restrictions
    if (isGuest) {
      if (!GUEST_ALLOWED_CODES.includes(from) || !GUEST_ALLOWED_CODES.includes(to)) {
        showToast("Guest accounts are limited to 5 core currencies: USD, EUR, GBP, JPY, VND", "error");
        return;
      }
    }

    setLoading(true);
    setIsCalculating(true);
    setResult(null);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/convert`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` }),
          "Accept": "application/json"
        },
        body: JSON.stringify({
          amount: numericAmount,
          from: from,
          to: to
        })
      });

      const data = await res.json();
      if (data.success) {
        setResult(data.result);
        setExchangeRate(data.rate);
        // Cập nhật receive amount
        setReceiveAmount(data.result.toString());
        showToast("Conversion successful!", "success");
        track('currency_conversion', { from, to, amount: numericAmount, result: data.result });

        if (data.history) {
          setHistory(prev => [data.history, ...prev].slice(0, 10));
        } else {
          await fetchHistory();
        }
      } else {
        showToast(data.message || "Conversion failed", "error");
        track('conversion_failed', { from, to, amount: numericAmount, error: data.message });
      }
    } catch (error) {
      console.error("Convert error:", error);
      showToast("Cannot connect to API terminal.", "error");
      track('conversion_error', { from, to, amount: numericAmount });
    } finally {
      setLoading(false);
      setIsCalculating(false);
    }
  }, [amount, from, to, isGuest, fetchHistory, showToast]);

  // ─── SWAP HANDLER ───
  const handleSwap = useCallback(() => {
    setSwapAnimating(true);
    const tempFrom = from;
    const tempTo = to;
    setFrom(tempTo);
    setTo(tempFrom);
    setResult(null);
    setAmount('0');
    setReceiveAmount('');
    track('currency_swap', { from: tempFrom, to: tempTo });
    setTimeout(() => setSwapAnimating(false), SWAP_ANIMATION_DURATION_MS);
  }, [from, to]);

  // ─── CONTACT FORM HANDLER ───
  const handleContactSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingContact(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/support-tickets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` }),
          "Accept": "application/json"
        },
        body: JSON.stringify({
          name: contactForm.name,
          email: contactForm.email,
          subject: contactForm.subject || 'Infrastructure Request',
          message: contactForm.message
        })
      });

      const data = await res.json();
      if (data.success) {
        setFormSubmitted(true);
        showToast("Support ticket submitted successfully!", "success");
        setContactForm({ name: '', email: '', subject: '', message: '' });
      } else {
        showToast(data.message || "Failed to submit support ticket", "error");
      }
    } catch (error) {
      console.error("Contact form error:", error);
      showToast("Cannot connect to server. Please try again.", "error");
    } finally {
      setIsSubmittingContact(false);
    }
  }, [contactForm, showToast]);


  // ─── WEBSOCKET HELPER FUNCTIONS ───
  const setupEchoInstance = useCallback(() => {
    if (typeof window === 'undefined') return null;
    
    if (!window.Echo) {
      return import('pusher-js').then((PusherModule) => {
        const Pusher = PusherModule.default;
        return import('laravel-echo').then((EchoModule) => {
          const Echo = EchoModule.default;
          window.Pusher = Pusher;
          window.Echo = new Echo({
            broadcaster: 'reverb',
            key: process.env.NEXT_PUBLIC_REVERB_APP_KEY || 'local-key',
            wsHost: process.env.NEXT_PUBLIC_REVERB_HOST || 'localhost',
            wsPort: parseInt(process.env.NEXT_PUBLIC_REVERB_PORT || '8080'),
            wssPort: parseInt(process.env.NEXT_PUBLIC_REVERB_PORT || '8080'),
            forceTLS: process.env.NEXT_PUBLIC_REVERB_SCHEME === 'https',
            enabledTransports: ['ws', 'wss'],
            disableStats: true,
          });
          return window.Echo;
        });
      });
    }
    return Promise.resolve(window.Echo);
  }, []);

  const setupMainRateChannel = useCallback((echo: any, from: string, to: string, activeInput: string, amount: string, receiveAmount: string, currentExchangeRate: number | null, setExchangeRate: (rate: number) => void, setIsWebSocketConnected: (connected: boolean) => void, pollingInterval: NodeJS.Timeout | null, pollLatestRate: () => Promise<void>) => {
    const rateChannel = echo.channel(`rates.${from}.${to}`);
    
    rateChannel.listen('.rate.updated', (e: any) => {
      if (e && typeof e.rate === 'number' && e.rate > 0) {
        setExchangeRate(e.rate);
        setIsWebSocketConnected(true);

        if (pollingInterval) {
          clearInterval(pollingInterval);
        }
      }
    });
    
    rateChannel.error(() => {
      setIsWebSocketConnected(false);
    });
  }, []);

  const setupOverviewChannels = useCallback((echo: any, marketPairs: any[], setOverviewChartData: (data: any) => void) => {
    marketPairs.forEach(market => {
      const overviewChannel = echo.channel(`rates.${market.base}.${market.target}`);
      overviewChannel.listen('.rate.updated', (e: any) => {
        if (e && e.rate) {
          setOverviewChartData((prev: any) => {
            const pair = `${market.base} / ${market.target}`;
            const existing = prev[pair] || [];
            const newPoint = {
              time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
              value: e.rate
            };
            const updated = [...existing.slice(-CHART_DATA_MAX_POINTS), newPoint];
            return { ...prev, [pair]: updated };
          });
        }
      });
    });
  }, []);

  const pollLatestRate = useCallback(async (from: string, to: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${API_BASE}/convert-quote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` }),
          "Accept": "application/json"
        },
        body: JSON.stringify({
          amount: 1,
          from: from,
          to: to
        })
      });

      const data = await res.json();
      // Don't set exchange rate here - only set after successful conversion
    } catch (error) {
      // Silent fail
    }
  }, []);

  // ─── WEBSOCKET SETUP ───
  useEffect(() => {
    if (!mounted || !from || !to) return;

    let echo: any = null;
    let pollingInterval: NodeJS.Timeout | null = null;
    let wsConnected = false;

    const initWebSocket = async () => {
      try {
        echo = await setupEchoInstance();
        if (!echo) return;

        // Setup main rate channel
        setupMainRateChannel(
          echo,
          from,
          to,
          activeInput,
          amount,
          receiveAmount,
          currentExchangeRate,
          setExchangeRate,
          setIsWebSocketConnected,
          pollingInterval,
          () => pollLatestRate(from, to)
        );

        // Setup overview market channels
        setupOverviewChannels(echo, overviewMarketPairs, setOverviewChartData);
        
        wsConnected = true;
        setIsWebSocketConnected(true);
      } catch (error) {
        console.warn('⚠️ WebSocket initialization failed, using polling:', error);
        wsConnected = false;
        setIsWebSocketConnected(false);
      }
    };

    initWebSocket();

    // Initial data fetch
    fetchHistoricalData(from, to);
    fetchRates();
    fetchHealthData();
    
    overviewMarketPairs.forEach(market => {
      fetchHistoricalDataForOverview(market.base, market.target, market.pair);
    });

    // Fallback polling
    if (!pollingInterval) {
      pollingInterval = setInterval(() => pollLatestRate(from, to), POLLING_INTERVAL_MS);
    }

    return () => {
      if (echo) {
        try {
          echo.leave(`rates.${from}.${to}`);
          overviewMarketPairs.forEach(market => {
            echo.leave(`rates.${market.base}.${market.target}`);
          });
        } catch (e) {
          console.warn('Error leaving channels:', e);
        }
      }
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [mounted, from, to, activeInput, amount, receiveAmount, currentExchangeRate, fetchHistoricalData, fetchHistoricalDataForOverview, fetchRates, fetchHealthData, setupEchoInstance, setupMainRateChannel, setupOverviewChannels, pollLatestRate]);

  // ─── CHART FORMAT ───
  const formattedChartData = useMemo(() => {
    if (!mounted || chartData.length === 0) return [];
    return chartData.map((item: any) => {
      const date = new Date(item.timestamp);
      const isValidDate = !isNaN(date.getTime());
      return {
        time: isValidDate ? date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--:--',
        value: item.value
      };
    });
  }, [mounted, chartData]);

  // ─── OVERVIEW MARKET DATA ───
  const overviewMarkets = useMemo(() => {
    return overviewMarketPairs.map(market => {
      const chartData = overviewChartData[market.pair] || [];
      const lastValue = chartData.length > 0 ? Number(chartData[chartData.length - 1].value) : 0;
      const firstValue = chartData.length > 0 ? Number(chartData[0].value) : 0;
      return {
        pair: market.pair,
        price: chartData.length > 0 ? lastValue.toFixed(4) : "---",
        change: chartData.length > 1 
          ? ((lastValue - firstValue) / firstValue * 100).toFixed(2) + "%"
          : "---",
        trend: chartData.length > 1 && lastValue >= firstValue ? "up" : "down",
        vol: "$1.4B",
        data: chartData
      };
    });
  }, [overviewChartData]);

  // ─── EFFECTS ───
  useEffect(() => {
    setMounted(true);
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      setIsGuest(!token);
      
      // Load user data from localStorage
      if (token) {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          try {
            const userData = JSON.parse(userStr);
            setCurrentUser(userData);
            setContactForm(prev => ({
              ...prev,
              name: userData.username || '',
              email: userData.email || ''
            }));
          } catch (e) {
            console.error("Error parsing user data:", e);
          }
        }
      }
    };
    checkAuth();
    fetchHistory();
    fetchPopularNews();
    fetchCurrencies();

    // Simulate loading completion for skeletons
    setTimeout(() => {
      setIsToolsLoading(false);
      setIsSecurityLoading(false);
      setIsFaqLoading(false);
    }, 1000);

    // Track page view
    track('page_view', { page: 'home', is_guest: !localStorage.getItem("token") });
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#02020a] via-[#050510] to-[#02020a] text-slate-100 selection:bg-indigo-500/30 font-sans overflow-x-hidden">
      <Header />

      {/* ─── AMBIENT BACKGROUND ─── */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-20%] right-[-10%] w-[1000px] h-[1000px] bg-indigo-600/10 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-[5%] left-[-15%] w-[800px] h-[800px] bg-purple-600/8 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] left-[30%] w-[600px] h-[600px] bg-cyan-600/5 rounded-full blur-[100px]" />
        <div 
          className="absolute inset-0 opacity-[0.02]" 
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      {/* ─── TOAST NOTIFICATION ─── */}
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

      <main className="max-w-7xl mx-auto px-6 lg:px-8 w-full flex flex-col gap-28 lg:gap-40 py-12 pt-44">

        {/* ─── 1. HERO & CONVERTER ─── */}
        <ErrorBoundary>
          <section className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -40 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-full mb-8 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                v4.0 Quantum Core Active
              </span>
              {isWebSocketConnected && (
                <span className="flex items-center gap-1 text-emerald-400 text-[8px] font-mono">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  LIVE
                </span>
              )}
            </div>

            <h1 className="text-[clamp(3rem,8vw,6rem)] font-black leading-[0.9] uppercase italic tracking-tighter mb-6">
              <span className="text-white block">Next-Gen</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 animate-gradient-x">Liquidity</span>
              <span className="text-white block relative">
                Protocol
                <span className="text-indigo-500">.</span>
                <span className="absolute -top-2 -right-8 text-[8px] font-mono bg-indigo-500/20 px-2 py-0.5 rounded-full text-indigo-300">BETA</span>
              </span>
            </h1>

            <p className="text-slate-400 text-lg max-w-md leading-relaxed mb-10 font-medium border-l-2 border-indigo-500/40 pl-6">
              Near-zero latency conversion with institutional-grade risk parameters. Built for the modern global economy.
            </p>

            <div className="flex flex-wrap gap-4">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/converter')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    router.push('/converter');
                  }
                }}
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-2xl font-bold text-sm uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#02020a]"
              >
                Launch Terminal <Sparkles size={16} />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  const element = document.getElementById('advanced-tools');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const element = document.getElementById('advanced-tools');
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }
                }}
                className="px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all backdrop-blur-sm cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#02020a]"
              >
                Explore Nodes
              </motion.button>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center gap-6 mt-12 pt-6 border-t border-white/5">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span className="text-[10px] font-mono text-slate-500">SECURE</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap size={14} className="text-yellow-500" />
                <span className="text-[10px] font-mono text-slate-500">{healthData.latency} LATENCY</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe2 size={14} className="text-cyan-500" />
                <span className="text-[10px] font-mono text-slate-500">190+ COUNTRIES</span>
              </div>
            </div>
          </motion.div>

          {/* ─── CONVERTER CARD ─── */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 rounded-[2.5rem] blur-2xl opacity-30 group-hover:opacity-60 transition duration-1000" />
            <div className="relative bg-gradient-to-br from-[#0f0f18] to-[#08080e] backdrop-blur-3xl border border-white/10 rounded-[2.2rem] p-8 lg:p-10 shadow-2xl">
              
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-black text-white uppercase italic flex items-center gap-2">
                    Instant Swap
                    <span className={`text-[8px] px-2 py-1 rounded-full font-mono normal-case not-italic ${
                      isWebSocketConnected 
                        ? 'bg-emerald-500/20 text-emerald-400' 
                        : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {isWebSocketConnected ? 'LIVE' : 'UPDATING'}
                    </span>
                    {isGuest && (
                      <span className="text-[8px] bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded-full font-mono normal-case not-italic">
                        GUEST
                      </span>
                    )}
                  </h2>
                  <div className="flex items-center gap-2 mt-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${isWebSocketConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                    <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                      {isWebSocketConnected ? 'Verified Mid-Market Rate' : 'Syncing...'}
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <Globe size={20} className="text-indigo-400" />
                </div>
              </div>

              <div className="space-y-4">
                {/* Send Amount */}
                <div className="group/input p-6 bg-gradient-to-br from-black/40 to-black/20 rounded-[1.5rem] border border-white/5 focus-within:border-indigo-500/40 transition-all duration-300">
                  <label className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest block mb-3 flex items-center gap-2">
                    <ArrowRight size={10} /> Amount to Send
                  </label>
                  <div className="flex items-center justify-between gap-4">
                    <NumberInput 
                      value={amount} 
                      onChange={handleSendAmountChange}
                      disabled={activeInput === 'receive' && isCalculating}
                    />
                    <CustomSelect 
                      value={from} 
                      onChange={(val) => {
                        setFrom(val);
                        setResult(null);
                      }} 
                      options={currencyOptions.filter(c => c !== to)} 
                    />
                  </div>
                </div>

                {/* Swap Button */}
                <div className="flex justify-center -my-7 relative z-10">
                  <motion.button 
                    animate={{ rotate: swapAnimating ? 360 : 0 }}
                    transition={{ rotate: { duration: 0.6, ease: [0.34, 1.56, 0.64, 1] } }}
                    onClick={handleSwap}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSwap();
                      }
                    }}
                    aria-label={`Swap currencies from ${from} to ${to}`}
                    className="relative group outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a1a2e] rounded-full"
                  >
                    <div className="relative w-14 h-14 bg-gradient-to-br from-[#1a1a2e] to-[#0d0d1a] rounded-full border border-indigo-500/40 hover:border-indigo-400 transition-all duration-300 shadow-lg flex items-center justify-center group-hover:shadow-indigo-500/20">
                      <div className="absolute inset-1 rounded-full bg-gradient-to-br from-indigo-500/5 to-purple-500/5" />
                      <motion.div
                        animate={{ rotate: swapAnimating ? 180 : 0 }}
                        transition={{ duration: ANIMATION_DURATION, delay: SWAP_ANIMATION_DELAY_MS / 1000 }}
                      >
                        <ArrowRightLeft size={20} className="text-indigo-400 group-hover:text-white transition-colors duration-300 relative z-10" />
                      </motion.div>
                    </div>
                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none translate-y-2 group-hover:translate-y-0">
                      <div className="relative">
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-indigo-600 rotate-45" />
                        <span className="text-[8px] font-mono font-bold text-white bg-indigo-600 px-2 py-1 rounded-md whitespace-nowrap">
                          {from} ↔ {to}
                        </span>
                      </div>
                    </div>
                  </motion.button>
                </div>

                {/* Receive Amount */}
                <div className="p-6 bg-gradient-to-br from-black/40 to-black/20 rounded-[1.5rem] border border-white/5">
                  <label className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest block mb-3 flex items-center gap-2">
                    <CheckCircle2 size={10} /> Recipient Receives
                  </label>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <input 
                        type="text"
                        inputMode="decimal"
                        value={receiveAmount ? formatNumberWithCommas(receiveAmount) : ''}
                        onChange={(e) => handleReceiveAmountChange(e.target.value)}
                        disabled={isCalculating}
                        aria-label={`Receive amount in ${to}`}
                        className={`bg-transparent text-5xl font-mono font-bold outline-none w-full placeholder:text-slate-700 focus:placeholder:text-slate-600 transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f0f18] rounded-lg ${
                          isCalculating ? 'text-slate-600 animate-pulse cursor-not-allowed' : 'bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent'
                        }`}
                        placeholder="0.00"
                      />
                      {activeInput === 'receive' && (
                        <div className="text-[8px] text-indigo-400 font-mono mt-1">
                          ⚡ Calculating send amount...
                        </div>
                      )}
                    </div>
                    <CustomSelect 
                      value={to} 
                      onChange={(val) => {
                        setTo(val);
                        setResult(null);
                      }} 
                      options={currencyOptions.filter(c => c !== from)} 
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/10 space-y-4">
                <div className="flex justify-between items-center text-[11px] font-mono font-bold px-2">
                  <span className="text-slate-500">Exchange Rate:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                      {isWebSocketConnected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      )}
                      1 {from} = {currentExchangeRate > 0 ? formatWithPrecision(currentExchangeRate, to) : "---"} {to}
                    </span>
                    <button 
                      onClick={refreshAllRates}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          refreshAllRates();
                        }
                      }}
                      disabled={isRefreshing}
                      aria-label="Refresh exchange rates"
                      className="text-slate-600 hover:text-indigo-400 transition-colors relative cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f0f18] rounded-lg p-1"
                    >
                      <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
                      {isRefreshing && (
                        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[7px] text-indigo-400 whitespace-nowrap">
                          Updating...
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleConvert} 
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleConvert();
                    }
                  }}
                  disabled={loading}
                  aria-label={`Convert ${amount} ${from} to ${to}`}
                  className="w-full py-5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-lg shadow-indigo-600/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f0f18]"
                >
                  {loading ? <Loader2 className="animate-spin" size={16} /> : <><Sparkles size={16} /> Execute Protocol</>}
                </motion.button>

                {isGuest && (
                  <div className="text-center text-[9px] text-amber-400/70 font-mono flex items-center justify-center gap-2">
                    <AlertTriangle size={10} />
                    Guest: Limited to USD, EUR, GBP, JPY, VND
                    <Link href="/login" className="text-indigo-400 hover:text-indigo-300 underline">
                      Sign in for full access
                    </Link>
                  </div>
                )}
              </div>

              <div className="mt-4 text-center text-[9px] text-slate-600 font-mono">
                No hidden fees • Best execution guarantee
              </div>
            </div>
          </motion.div>
        </section>
        </ErrorBoundary>

        {/* ─── 2. MARKET OVERVIEW ─── */}
        <ErrorBoundary>
          <section className="flex flex-col gap-10">
          <div className="flex items-center justify-between border-b border-white/10 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-1 h-10 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full" />
              <div>
                <h2 className="text-2xl font-black uppercase italic tracking-tight text-white">Market Intelligence</h2>
                <p className="text-[12px] text-slate-500 font-mono mt-1">Real-time market data streaming</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-[9px] font-mono text-emerald-500 font-bold uppercase tracking-widest bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20">
              <div className={`w-1.5 h-1.5 rounded-full ${isWebSocketConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              {isWebSocketConnected ? 'Real-time Global Feed' : 'Updating...'}
            </div>
          </div>

          {isMarketLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <SkeletonMarketCard />
              <SkeletonMarketCard />
              <SkeletonMarketCard />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {overviewMarkets.map((market, i) => (
                <motion.div 
                  key={i} 
                  whileHover={{ y: -8 }} 
                  transition={{ type: "spring", stiffness: SPRING_STIFFNESS }}
                  className="bg-gradient-to-br from-[#0d0d14] to-[#08080c] border border-white/10 rounded-2xl p-6 relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/5 to-transparent rounded-full blur-2xl" />
                  
                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <div>
                      <h3 className="text-slate-500 font-mono text-[10px] font-black uppercase tracking-widest mb-1">{market.pair}</h3>
                      <div className="text-3xl font-mono font-bold text-white tracking-tighter">{market.price}</div>
                    </div>
                    <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black font-mono border flex items-center gap-1 ${
                      market.trend === 'up' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>
                      {market.trend === 'up' ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                      {market.change}
                    </div>
                  </div>

                  <div className="h-20 w-full opacity-60 group-hover:opacity-100 transition-opacity">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={market.data}>
                        <defs>
                          <linearGradient id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={market.trend === 'up' ? '#10b981' : '#f43f5e'} stopOpacity={0.4}/>
                            <stop offset="100%" stopColor={market.trend === 'up' ? '#10b981' : '#f43f5e'} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke={market.trend === 'up' ? '#10b981' : '#f43f5e'} 
                          strokeWidth={2} 
                          fill={`url(#grad-${i})`} 
                          dot={false} 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 flex justify-between text-[9px] font-mono text-slate-600">
                    <span>24h Vol: {market.vol}</span>
                    <span>Liquidity: High</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
        </ErrorBoundary>

        {/* ─── 3. SETTLEMENT LEDGER ─── */}
        <ErrorBoundary>
          <section className="flex flex-col gap-10">
          <div className="flex items-center justify-between border-b border-white/10 pb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-xl">
                <History size={20} className="text-indigo-400" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white uppercase italic tracking-tight">Settlement Ledger</h2>
                <p className="text-[10px] text-slate-500 font-mono uppercase font-bold tracking-[0.2em] mt-1 flex items-center gap-2">
                  <Database size={10} />
                  {isGuest ? "Recent Local Matching Engine Records" : "System Index Records"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#0d0d14] to-[#08080c] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono">
                <thead>
                  <tr className="border-b border-white/5 bg-gradient-to-r from-white/[0.03] to-transparent">
                    <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Source Asset</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Swap Protocol</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Settlement Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {isHistoryLoading ? (
                    <>
                      <SkeletonHistoryRow />
                      <SkeletonHistoryRow />
                      <SkeletonHistoryRow />
                      <SkeletonHistoryRow />
                      <SkeletonHistoryRow />
                    </>
                  ) : history.length > 0 ? history.slice(0, 5).map((h, i) => (
                    <motion.tr 
                      key={i} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="hover:bg-white/[0.03] transition-colors group"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-white text-base">{h.amount_input?.toLocaleString()}</span>
                          <span className="text-[8px] bg-white/5 border border-white/10 px-2 py-1 rounded-md text-slate-400 font-black">{h.from_currency}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
                          <span className="w-6 h-px bg-white/10" />
                          <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400"><ArrowRight size={10} /></div>
                          <span className="font-bold text-slate-400">{h.to_currency}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex flex-col items-end">
                          <span className="font-mono font-black text-emerald-400 text-base">
                            +{formatWithPrecision(h.amount_output, h.to_currency)}
                          </span>
                          <span className="text-emerald-500/50 text-[8px] font-bold uppercase tracking-widest">{h.to_currency}</span>
                        </div>
                      </td>
                    </motion.tr>
                  )) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                            <Database size={20} className="text-slate-600" />
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono italic uppercase tracking-widest">
                            Waiting for new telemetry data...
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
        </ErrorBoundary>

        {/* ─── 4. NEWS FEED ─── */}
        <ErrorBoundary>
          <section className="flex flex-col gap-10">
          <div className="flex items-center justify-between border-b border-white/10 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-1 h-10 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full" />
              <div>
                <h2 className="text-2xl font-black uppercase italic tracking-tight text-white">Institutional Briefs </h2>
                <p className="text-[12px] text-slate-500 font-mono mt-1">Latest market insights</p>
              </div>
            </div>
            <Link href="/news">
              <button className="text-[10px] font-mono font-black text-indigo-400 hover:text-indigo-300 uppercase tracking-widest border border-indigo-500/30 px-4 py-2.5 rounded-xl transition-all hover:bg-indigo-500/10 flex items-center gap-2 group cursor-pointer">
                View More <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>

          {newsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <SkeletonNewsCard />
              <SkeletonNewsCard />
              <SkeletonNewsCard />
              <SkeletonNewsCard />
              <SkeletonNewsCard />
              <SkeletonNewsCard />
              <SkeletonNewsCard />
              <SkeletonNewsCard />
            </div>
          ) : popularNews.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {popularNews.slice(0, 8).map((news, idx) => (
                <motion.div
                  key={news.news_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Link href={`/news/${news.news_id}`}>
                    <div className="group cursor-pointer">
                      <div className="relative aspect-[16/10] overflow-hidden rounded-xl mb-3 border border-white/10 bg-white/5">
                        <img 
                          src={news.image_url || "https://images.unsplash.com/photo-1611974717483-3600171ea7f7?w=600"} 
                          className="w-full h-full object-cover grayscale-[60%] opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105" 
                          alt={news.title}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1611974717483-3600171ea7f7?w=600";
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-transparent to-transparent opacity-60" />
                        <span className="absolute top-3 left-3 text-[7px] font-mono font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 text-indigo-400">
                          {news.category}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-200 group-hover:text-indigo-400 transition-colors mb-2 leading-snug line-clamp-2">
                        {news.title}
                      </h3>
                      <div className="flex items-center gap-2 text-[9px] text-slate-500 font-mono font-bold uppercase">
                        <span>{new Date(news.published_at).toLocaleDateString()}</span>
                        <div className="w-1 h-1 rounded-full bg-slate-700" />
                        <span>📊 {news.views} views</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="col-span-full py-16 text-center">
              <div className="text-slate-500 font-mono text-xs">No news available</div>
            </div>
          )}
        </section>
        </ErrorBoundary>

        {/* ─── 5. ADVANCED TOOLS (id="advanced-tools") ─── */}
        <ErrorBoundary>
          <section id="advanced-tools" className="grid lg:grid-cols-2 gap-16 items-center">
          {isToolsLoading ? (
            <div className="grid grid-cols-2 gap-4">
              <SkeletonToolCard />
              <SkeletonToolCard />
              <SkeletonToolCard />
              <SkeletonToolCard />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: <Lock size={22} />, title: "Quantum Cipher", desc: "Military-grade encryption with zero-knowledge proofs." },
                { icon: <Cpu size={22} />, title: "Titan Reactor", desc: "Sub-millisecond latency processing on dedicated nodes." },
                { icon: <ShieldCheck size={22} />, title: "Verified Ledger", desc: "Immutable record of all transactions on-chain." },
                { icon: <Globe2 size={22} />, title: "Global Anycast", desc: "Optimized routing fabric across 190+ countries." },
              ].map((f, i) => (
                <motion.div 
                  key={i} 
                  whileHover={{ scale: 1.02 }}
                  className="group p-6 bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 rounded-xl hover:border-indigo-500/30 transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                    <div className="text-indigo-400">{f.icon}</div>
                  </div>
                  <h4 className="text-sm font-black text-white uppercase mb-2 tracking-wide">{f.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          )}

          <div className="space-y-8">
            <div className="relative">
              <div className="absolute -left-4 top-0 w-1 h-20 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full" />
              <h2 className="text-5xl font-black text-white uppercase italic leading-[0.95] tracking-tighter pl-6">
                Advanced Tools<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400">For The Modern</span><br />
                Edge.
              </h2>
            </div>
            <p className="text-slate-400 text-lg leading-relaxed font-medium pl-6">
              We provide the most sophisticated software infrastructure to process foreign exchange transactions with absolute precision.
            </p>
            <div className="pl-6">
              <motion.button 
                whileHover={{ x: 5 }}
                className="flex items-center gap-3 text-indigo-400 font-black uppercase text-xs tracking-widest group cursor-pointer"
              >
                Review Infrastructure Documentation 
                <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
              </motion.button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4 pt-6 pl-6">
              <motion.div 
                whileHover={{ y: -4, scale: 1.02 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/10 rounded-xl p-4 text-center backdrop-blur-sm group-hover:border-indigo-500/40 transition-all duration-300">
                  <div className="text-2xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                    $2.4B
                  </div>
                  <div className="text-[9px] text-slate-500 font-mono mt-1 flex items-center justify-center gap-1">
                    <Activity size={10} className="text-emerald-500" />
                    Volume (24h)
                  </div>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ y: -4, scale: 1.02 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/10 rounded-xl p-4 text-center backdrop-blur-sm group-hover:border-cyan-500/40 transition-all duration-300">
                  <div className="text-2xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    190+
                  </div>
                  <div className="text-[9px] text-slate-500 font-mono mt-1 flex items-center justify-center gap-1">
                    <Globe2 size={10} className="text-cyan-500" />
                    Countries
                  </div>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ y: -4, scale: 1.02 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/10 rounded-xl p-4 text-center backdrop-blur-sm group-hover:border-emerald-500/40 transition-all duration-300">
                  <div className="text-2xl font-black bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                    {healthData.uptime}
                  </div>
                  <div className="text-[9px] text-slate-500 font-mono mt-1 flex items-center justify-center gap-1">
                    <Zap size={10} className="text-emerald-500" />
                    Uptime
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
        </ErrorBoundary>

        {/* ─── 6. NEURAL SETTLEMENT ENGINE ─── */}
        <ErrorBoundary>
          <section className="flex flex-col gap-10">
          <div className="flex items-center gap-4">
            <div className="w-1 h-10 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full" />
            <div>
              <h2 className="text-2xl font-black uppercase italic tracking-tight text-white">Neural Settlement Engine</h2>
              <p className="text-[12px] text-slate-500 font-mono mt-1">Sub-millisecond transaction processing core</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-br from-[#0d0d14] to-[#08080c] border border-white/10 rounded-2xl p-8 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl" />
              <div className="relative z-10">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-xl flex items-center justify-center mb-6">
                  <Zap size={28} className="text-indigo-400" />
                </div>
                <h3 className="text-xl font-black text-white uppercase mb-4">Quantum-Speed Processing</h3>
                <p className="text-slate-400 leading-relaxed">
                  Our proprietary neural engine processes transactions in under 1 millisecond using distributed computing nodes across global data centers. Zero latency, maximum throughput.
                </p>
                <div className="mt-6 flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-black text-indigo-400">{healthData.latency}</div>
                    <div className="text-[9px] text-slate-500 font-mono uppercase">Latency</div>
                  </div>
                  <div className="w-px h-10 bg-white/10" />
                  <div className="text-center">
                    <div className="text-2xl font-black text-purple-400">{healthData.uptime}</div>
                    <div className="text-[9px] text-slate-500 font-mono uppercase">Uptime</div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-gradient-to-br from-[#0d0d14] to-[#08080c] border border-white/10 rounded-2xl p-8 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl" />
              <div className="relative z-10">
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-xl flex items-center justify-center mb-6">
                  <Cpu size={28} className="text-cyan-400" />
                </div>
                <h3 className="text-xl font-black text-white uppercase mb-4">Distributed Architecture</h3>
                <p className="text-slate-400 leading-relaxed">
                  Multi-region deployment ensures redundancy and failover capabilities. Your transactions are processed at the nearest node for optimal performance.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  <span className="text-[9px] font-mono font-bold text-cyan-400 bg-cyan-500/10 px-3 py-1.5 rounded-lg border border-cyan-500/20">190+ LOCATIONS</span>
                  <span className="text-[9px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20">AUTO-SCALING</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
        </ErrorBoundary>

        {/* ─── 7. PROTOCOL SECURITY ─── */}
        <ErrorBoundary>
          <section className="flex flex-col gap-10">
          <div className="flex items-center gap-4">
            <div className="w-1 h-10 bg-emerald-500 rounded-full" />
            <div>
              <h2 className="text-2xl font-black uppercase italic tracking-tight text-white">Protocol Security</h2>
              <p className="text-[12px] text-slate-500 font-mono mt-1">Military-grade encryption and protection layers</p>
            </div>
          </div>

          {isSecurityLoading ? (
            <div className="grid md:grid-cols-3 gap-6">
              <SkeletonSecurityCard />
              <SkeletonSecurityCard />
              <SkeletonSecurityCard />
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: <Lock size={24} />, title: "SSL/TLS Encryption", desc: "256-bit SSL encryption for all data in transit", color: "emerald" },
                { icon: <ShieldCheck size={24} />, title: "AES-256 Encryption", desc: "Advanced encryption standard for data at rest", color: "cyan" },
                { icon: <Globe2 size={24} />, title: "DDoS Protection", desc: "Enterprise-grade mitigation against attacks", color: "indigo" }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-gradient-to-br from-[#0d0d14] to-[#08080c] border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all group"
                >
                  <div className={`w-12 h-12 bg-gradient-to-br from-${item.color}-500/20 to-${item.color}-500/10 border border-${item.color}-500/30 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <div className={`text-${item.color}-400`}>{item.icon}</div>
                  </div>
                  <h3 className="text-sm font-black text-white uppercase mb-2">{item.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* ─── 8. COMPLIANCE & TRANSPARENCY ─── */}
        <section className="flex flex-col gap-10">
          <div className="flex items-center gap-4">
            <div className="w-1 h-10 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full" />
            <div>
              <h2 className="text-2xl font-black uppercase italic tracking-tight text-white">Compliance & Transparency</h2>
              <p className="text-[12px] text-slate-500 font-mono mt-1">Regulatory compliance and operational transparency</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#0d0d14] to-[#08080c] border border-white/10 rounded-2xl p-8 lg:p-12">
            <div className="grid lg:grid-cols-2 gap-10">
              <div>
                <h3 className="text-lg font-black text-white uppercase mb-6 flex items-center gap-3">
                  <Award size={20} className="text-purple-400" />
                  Regulatory Compliance
                </h3>
                <ul className="space-y-4">
                  {[
                    "KYC/AML verification for all users",
                    "FATCA and CRS reporting compliance",
                    "GDPR data protection standards",
                    "Regular third-party security audits"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0" />
                      <span className="text-sm text-slate-400">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-black text-white uppercase mb-6 flex items-center gap-3">
                  <Layers size={20} className="text-pink-400" />
                  Operational Transparency
                </h3>
                <ul className="space-y-4">
                  {[
                    "Real-time transaction monitoring",
                    "Public audit reports available",
                    "Clear fee structure disclosure",
                    "24/7 customer support access"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-pink-500 mt-2 shrink-0" />
                      <span className="text-sm text-slate-400">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-white/10 flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-[9px] font-mono text-slate-500">
                <CheckCircle2 size={12} className="text-emerald-500" />
                ISO 27001 Certified
              </div>
              <div className="flex items-center gap-2 text-[9px] font-mono text-slate-500">
                <CheckCircle2 size={12} className="text-emerald-500" />
                SOC 2 Type II Compliant
              </div>
              <div className="flex items-center gap-2 text-[9px] font-mono text-slate-500">
                <CheckCircle2 size={12} className="text-emerald-500" />
                PCI DSS Level 1
              </div>
            </div>
          </div>
        </section>
        </ErrorBoundary>

        {/* ─── 9. FAQ ─── */}
        <ErrorBoundary>
          <section className="max-w-3xl mx-auto w-full">
          <div className="text-center mb-12 space-y-4">
            <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl border border-white/10 mb-4">
              <HelpCircle size={24} className="text-indigo-400" />
            </div>
            <h2 className="text-4xl font-black text-white uppercase italic tracking-tight">Knowledge Base</h2>
            <p className="text-slate-500 font-medium">Learn more about how the Swap protocol works.</p>
          </div>

          {isFaqLoading ? (
            <div className="flex flex-col gap-3">
              <SkeletonFaqItem />
              <SkeletonFaqItem />
              <SkeletonFaqItem />
              <SkeletonFaqItem />
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {FAQ_DATA.map((faq, index) => (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-gradient-to-br from-[#0d0d14] to-[#08080c] border rounded-xl overflow-hidden transition-all duration-300 ${
                    openFaq === index ? "border-indigo-500/40 shadow-lg shadow-indigo-500/10" : "border-white/10"
                  }`}
                >
                  <button 
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setOpenFaq(openFaq === index ? null : index);
                      }
                    }}
                    aria-expanded={openFaq === index}
                    aria-controls={`faq-answer-${index}`}
                    className="w-full flex items-center justify-between p-5 text-left outline-none group cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0d14] rounded-lg"
                  >
                    <span className={`text-sm font-bold transition-colors ${openFaq === index ? "text-indigo-400" : "text-slate-200 group-hover:text-white"}`}>
                      {faq.question}
                    </span>
                    <ChevronDown size={16} className={`transition-all duration-300 ${openFaq === index ? "rotate-180 text-indigo-400" : "text-slate-600"}`} />
                  </button>
                  <AnimatePresence>
                    {openFaq === index && (
                      <motion.div 
                        id={`faq-answer-${index}`}
                        role="region"
                        aria-labelledby={`faq-question-${index}`}
                        initial={{ height: 0, opacity: 0 }} 
                        animate={{ height: "auto", opacity: 1 }} 
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="px-5 pb-5 text-sm text-slate-400 leading-relaxed font-medium border-t border-white/10 pt-4">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          )}
        </section>
        </ErrorBoundary>

        {/* ─── 10. CONTACT ─── */}
        <ErrorBoundary>
          <section className="grid lg:grid-cols-12 gap-12 items-start border-t border-white/10 pt-24 pb-16">
          <div className="lg:col-span-5 space-y-6">
            <div className="relative">
              <div className="absolute -left-4 top-0 w-1 h-16 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full" />
              <h2 className="text-4xl font-black text-white uppercase italic tracking-tight leading-none pl-6">
                Connect With<br />Our Engineers.
              </h2>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed font-medium max-w-sm pl-6">
              Facing technical issues or need enterprise solutions? Our rapid response team is always ready.
            </p>
            <div className="flex flex-col gap-3 pt-4 pl-6">
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-white/5 to-transparent rounded-xl border border-white/10 w-fit group hover:border-indigo-500/30 transition-all">
                <Mail className="text-indigo-400" size={16} />
                <span className="text-xs font-mono font-bold text-slate-300 group-hover:text-indigo-400 transition-colors">viee1525@gmail.com</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-white/5 to-transparent rounded-xl border border-white/10 w-fit group hover:border-indigo-500/30 transition-all">
                <MessageSquare className="text-indigo-400" size={16} />
                <span className="text-xs font-mono font-bold text-slate-300">( +84 ) 0765687090</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pl-6 pt-4">
              <div className={`w-2 h-2 rounded-full ${isWebSocketConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span className="text-[9px] font-mono text-emerald-500">{isWebSocketConnected ? 'All systems operational' : 'Syncing...'}</span>
            </div>
          </div>

          <div className="lg:col-span-7 relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 blur-3xl rounded-full" />
            <div className="relative bg-gradient-to-br from-[#0d0d14] to-[#08080c] border border-white/10 rounded-xl p-8 lg:p-10">
              {!formSubmitted ? (
                <form onSubmit={handleContactSubmit} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[9px] font-mono font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1">
                        <User size={10} /> Identity
                      </label>
                      <input
                        type="text"
                        placeholder="Your Name"
                        required
                        value={contactForm.name}
                        onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                        aria-label="Your name"
                        className="w-full bg-black/40 border border-white/10 focus:border-indigo-500/50 rounded-lg p-3.5 text-sm font-mono text-white outline-none transition-all focus:bg-black/60 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0d14]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-mono font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1">
                        <Mail size={10} /> Node Endpoint
                      </label>
                      <input
                        type="email"
                        placeholder="name@domain.com"
                        required
                        value={contactForm.email}
                        onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                        disabled={!!currentUser?.email}
                        aria-label="Your email address"
                        className={`w-full bg-black/40 border border-white/10 focus:border-indigo-500/50 rounded-lg p-3.5 text-sm font-mono text-white outline-none transition-all focus:bg-black/60 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0d14] ${currentUser?.email ? 'opacity-60 cursor-not-allowed' : ''}`}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-mono font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-1">
                      <Send size={10} /> Transmission Data
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Describe infrastructure requests in detail..."
                      required
                      value={contactForm.message}
                      onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                      aria-label="Your message"
                      className="w-full bg-black/40 border border-white/10 focus:border-indigo-500/50 rounded-lg p-3.5 text-sm font-mono text-white outline-none resize-none transition-all focus:bg-black/60 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0d14]"
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isSubmittingContact}
                    className="w-full bg-gradient-to-r from-white to-slate-200 text-indigo-950 font-black text-xs uppercase tracking-[0.2em] py-4 rounded-lg flex items-center justify-center gap-3 hover:from-indigo-50 hover:to-white transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0d14] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmittingContact ? (
                      <>
                        <Loader2 size={12} className="animate-spin" />
                        Transmitting...
                      </>
                    ) : (
                      <>
                        Transmit Message <Send size={12} />
                      </>
                    )}
                  </motion.button>
                </form>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-16 text-center flex flex-col items-center justify-center gap-5"
                >
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 size={32} />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-white uppercase italic tracking-tight">Transmission Successful</h4>
                    <p className="text-slate-500 text-sm mt-2">Your data has been recorded in the response log.</p>
                  </div>
                  <button 
                    onClick={() => setFormSubmitted(false)} 
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setFormSubmitted(false);
                      }
                    }}
                    aria-label="Send another message"
                    className="text-indigo-400 text-[10px] font-black uppercase tracking-widest hover:underline mt-2 flex items-center gap-1 cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0d14] rounded px-2 py-1"
                  >
                    <RefreshCw size={10} /> Send another query
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </section>
        </ErrorBoundary>

      </main>
      
      <Footer />

      {/* ─── SCROLL TO TOP BUTTON ─── */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            onClick={scrollToTop}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                scrollToTop();
              }
            }}
            aria-label="Scroll to top"
            className="fixed bottom-8 right-8 z-50 w-14 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full border border-indigo-500/50 shadow-lg shadow-indigo-500/30 flex items-center justify-center text-white hover:scale-110 transition-all duration-300 cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#02020a] group"
          >
            <ArrowUp size={22} className="group-hover:-translate-y-0.5 transition-transform" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full" />
          </motion.button>
        )}
      </AnimatePresence>

      <style jsx global>{`

      `}</style>
    </div>
  );
}