"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import "../css/User/rates.css";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  ChevronRight, 
  Bell, 
  Zap, 
  Newspaper, 
  Star, 
  ArrowRight,
  Activity,
  Info,
  Award,
  Trash2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Globe,
  Clock,
  Eye,
  RefreshCw,
  LineChart,
  BarChart3,
  DollarSign,
  Flame,
  Gauge,
  Target,
  Disc,
  Moon,
  Sun,
  Volume2,
  Users,
  Link2,
  Settings,
  HelpCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AreaChart, 
  Area, 
  Tooltip, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from "recharts";

// Import hooks
import { useRealtimeRates } from "@/hooks/useRealtimeRates";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const CATEGORIES = ["All", "Forex", "Crypto", "Commodities", "Favorites"];
const ITEMS_PER_PAGE = 10;

// Dynamic category mapping for better filtering
const CATEGORY_PATTERNS: Record<string, string[]> = {
  Forex: ['usd', 'eur', 'gbp', 'jpy', 'aud', 'cad', 'chf', 'cny'],
  Crypto: ['btc', 'eth', 'xrp', 'ltc', 'doge', 'ada'],
  Commodities: ['xau', 'xag', 'oil', 'natgas']
};

interface Rate {
  pair: string;
  name: string;
  price: string;
  change: string;
  trend: string;
  volatility: string;
  volume: string;
}

interface Mover {
  pair: string;
  price: string;
  change: string;
  trend: string;
}

interface ChartData {
  time: string;
  value: number;
}

interface NewsItem {
  news_id: number;
  title: string;
  category: string;
  content: string;
  published_at: string;
}

interface Alert {
  alert_id: number;
  base_currency: string;
  target_currency: string;
  target_rate: number;
  condition: 'above' | 'below';
  created_at: string;
}

// ─── SKELETON COMPONENTS ───

const SkeletonTopMover = () => (
  <div className="relative animate-pulse">
    <div className="relative bg-gradient-to-br from-[#11111a] to-[#0c0c12] border border-white/10 rounded-2xl p-5 flex items-center justify-between shadow-lg overflow-hidden">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-white/10 w-12 h-12" />
        <div className="flex flex-col gap-2">
          <div className="h-4 w-16 bg-white/10 rounded" />
          <div className="h-3 w-20 bg-white/10 rounded" />
        </div>
      </div>
      <div className="h-6 w-16 bg-white/10 rounded" />
    </div>
  </div>
);

// Skeleton Table Component
const SkeletonTable = () => (
  <div className="w-full animate-pulse">
    {/* Header skeleton */}
    <div className="px-6 py-4.5 border-b border-white/[0.06] bg-white/[0.01]">
      <div className="flex items-center gap-6">
        <div className="h-3 w-20 bg-white/10 rounded" />
        <div className="h-3 w-20 bg-white/10 rounded" />
        <div className="h-3 w-20 bg-white/10 rounded" />
        <div className="h-3 w-20 bg-white/10 rounded" />
        <div className="h-3 w-16 bg-white/10 rounded ml-auto" />
      </div>
    </div>
    {/* Rows skeleton */}
    <div className="divide-y divide-white/[0.03]">
      {[...Array(10)].map((_, i) => (
        <div key={i} className="px-6 py-4 flex items-center gap-6">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-3 h-3 bg-white/10 rounded" />
            <div className="flex flex-col gap-1.5">
              <div className="h-4 w-16 bg-white/10 rounded" />
              <div className="h-3 w-12 bg-white/10 rounded" />
            </div>
          </div>
          <div className="h-5 w-20 bg-white/10 rounded" />
          <div className="h-5 w-14 bg-white/10 rounded" />
          <div className="h-5 w-16 bg-white/10 rounded" />
          <div className="h-4 w-4 bg-white/10 rounded ml-auto" />
        </div>
      ))}
    </div>
  </div>
);

const SkeletonTableRow = () => (
  <tr className="animate-pulse">
    <td className="px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 bg-white/10 rounded" />
        <div className="flex flex-col gap-1.5">
          <div className="h-4 w-16 bg-white/10 rounded" />
          <div className="h-3 w-12 bg-white/10 rounded" />
        </div>
      </div>
    </td>
    <td className="px-6 py-4">
      <div className="h-5 w-20 bg-white/10 rounded" />
    </td>
    <td className="px-6 py-4">
      <div className="h-5 w-14 bg-white/10 rounded" />
    </td>
    <td className="px-6 py-4">
      <div className="h-5 w-16 bg-white/10 rounded" />
    </td>
    <td className="px-6 py-4 text-right">
      <div className="h-4 w-4 bg-white/10 rounded ml-auto" />
    </td>
  </tr>
);

const SkeletonPairDetail = () => (
  <div className="relative group animate-pulse">
    <div className="relative bg-gradient-to-br from-[#11111a] to-[#0c0c12] border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden">
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-white/10" />
              <div className="h-7 w-24 bg-white/10 rounded" />
            </div>
            <div className="h-3 w-20 bg-white/10 rounded" />
          </div>
          <div className="p-3 rounded-xl bg-white/10 w-12 h-12" />
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-black/40 border border-white/10 rounded-xl p-3.5">
            <div className="h-2 w-16 bg-white/10 rounded mb-2" />
            <div className="h-5 w-20 bg-white/10 rounded" />
          </div>
          <div className="bg-black/40 border border-white/10 rounded-xl p-3.5">
            <div className="h-2 w-16 bg-white/10 rounded mb-2" />
            <div className="h-5 w-16 bg-white/10 rounded" />
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-white/[0.06] space-y-4">
          <div className="flex justify-between items-center">
            <div className="h-3 w-32 bg-white/10 rounded" />
            <div className="h-3 w-20 bg-white/10 rounded" />
          </div>
          <div className="flex gap-3">
            <div className="flex-1 h-11 bg-white/10 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const SkeletonFavorites = () => (
  <div className="bg-gradient-to-br from-[#11111a] to-[#0c0c12] border border-white/10 rounded-2xl p-5 shadow-lg animate-pulse">
    <div className="h-4 w-24 bg-white/10 rounded mb-4" />
    <div className="space-y-2.5">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center justify-between bg-black/30 border border-white/5 rounded-xl p-3">
          <div className="flex flex-col gap-1.5">
            <div className="h-3 w-16 bg-white/10 rounded" />
            <div className="h-2 w-12 bg-white/10 rounded" />
          </div>
          <div className="w-3 h-3 bg-white/10 rounded" />
        </div>
      ))}
    </div>
  </div>
);

const SkeletonAlerts = () => (
  <div className="bg-gradient-to-br from-[#11111a] to-[#0c0c12] border border-white/10 rounded-2xl p-5 shadow-lg animate-pulse">
    <div className="h-4 w-24 bg-white/10 rounded mb-4" />
    <div className="space-y-2.5">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="flex items-center justify-between bg-black/30 border border-white/5 rounded-xl p-3">
          <div className="flex flex-col gap-1.5">
            <div className="h-3 w-20 bg-white/10 rounded" />
            <div className="h-2 w-16 bg-white/10 rounded" />
          </div>
          <div className="w-3 h-3 bg-white/10 rounded" />
        </div>
      ))}
    </div>
  </div>
);

const SkeletonChart = () => (
  <div className="relative bg-gradient-to-br from-[#11111a] to-[#0b0b11] border border-white/10 rounded-3xl p-6 sm:p-8 h-[420px] shadow-2xl overflow-hidden animate-pulse">
    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.005)_1px,transparent_1px)] bg-[size:100%_40px] pointer-events-none" />
    <div className="absolute inset-0 p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="h-6 w-40 bg-white/10 rounded" />
        <div className="flex gap-2">
          <div className="h-8 w-16 bg-white/10 rounded" />
          <div className="h-8 w-16 bg-white/10 rounded" />
          <div className="h-8 w-16 bg-white/10 rounded" />
        </div>
      </div>
      <div className="h-[280px] flex items-end gap-1">
        {[...Array(24)].map((_, i) => (
          <div
            key={i}
            className="flex-1 bg-gradient-to-t from-indigo-500/20 to-indigo-500/5 rounded-t"
            style={{
              height: `${20 + Math.random() * 60}%`,
              animationDelay: `${i * 40}ms`
            }}
          />
        ))}
      </div>
    </div>
  </div>
);

const SkeletonNewsCard = () => (
  <div className="relative group animate-pulse">
    <div className="relative bg-gradient-to-br from-[#11111a] to-[#0c0c12] border border-white/10 rounded-2xl p-5 shadow-lg overflow-hidden">
      <div className="flex items-start justify-between mb-3">
        <div className="h-5 w-16 bg-white/10 rounded-full" />
        <div className="h-3 w-20 bg-white/10 rounded" />
      </div>
      <div className="h-5 w-3/4 bg-white/10 rounded mb-2" />
      <div className="space-y-1.5 mb-3">
        <div className="h-3 w-full bg-white/10 rounded" />
        <div className="h-3 w-5/6 bg-white/10 rounded" />
        <div className="h-3 w-4/6 bg-white/10 rounded" />
      </div>
      <div className="h-3 w-24 bg-white/10 rounded" />
    </div>
  </div>
);

// ─── COMPONENTS ───

export default function RatesPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedPair, setSelectedPair] = useState<Rate | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [priceChanges, setPriceChanges] = useState<Record<string, 'up' | 'down' | null>>({});
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [targetRate, setTargetRate] = useState('');
  const [condition, setCondition] = useState<'above' | 'below'>('above');
  const [chartPeriod, setChartPeriod] = useState('24h');
  const [chartLoading, setChartLoading] = useState(false);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [comparisonPair, setComparisonPair] = useState<Rate | null>(null);
  const [comparisonChartData, setComparisonChartData] = useState<ChartData[]>([]);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [focusedRowIndex, setFocusedRowIndex] = useState<number>(-1);
  const [toast, setToast] = useState<{ message: string; type: string; visible: boolean }>({
    message: '',
    type: 'info',
    visible: false
  });

  // Loading states for sections
  const [isNewsLoading, setIsNewsLoading] = useState(true);
  const [isFavoritesLoading, setIsFavoritesLoading] = useState(true);
  const [isAlertsLoading, setIsAlertsLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Refs
  const prevSelectedPairRef = useRef<string | null>(null);
  const prevChartPeriodRef = useRef<string>('24h');

  // Sử dụng custom hook cho realtime data
  const {
    rates,
    topMovers,
    loading,
    isConnected,
    apiError,
    usingWebSocket,
    usingPolling,
    refreshData
  } = useRealtimeRates({
    initialFetchData: true,
    pollingInterval: 5000,
    enableWebSocket: true,
    enablePollingFallback: true,
  });

  // Toast notification
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  }, []);

  // Retry connection
  const retryConnection = useCallback(() => {
    refreshData();
    showToast('Reconnecting to data source...', 'info');
  }, [refreshData, showToast]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const isLoggedIn = useCallback(() => {
    return !!localStorage.getItem('token');
  }, []);

  const requireAuth = useCallback(() => {
    if (!isLoggedIn()) {
      router.push('/login');
      return false;
    }
    return true;
  }, [isLoggedIn, router]);

  // Fetch historical data
  const fetchHistoricalData = useCallback(async (pair: string, period: string = '1d', isComparison: boolean = false, showLoading: boolean = true) => {
    if (showLoading) {
      setChartLoading(true);
    }
    try {
      const [base, target] = pair.split('/');
      const periodMap: Record<string, { range: string; interval: string }> = {
        '1d': { range: '24h', interval: '1h' },
        '1w': { range: '7d', interval: '12h' },
        '1m': { range: '30d', interval: '1d' }
      };
      const periodConfig = periodMap[period] || periodMap['1d'];
      const response = await fetch(`${API_BASE_URL}/rates/historical?base=${base}&target=${target}&period=${periodConfig.range}&interval=${periodConfig.interval}`);
      const data = await response.json();
      if (data.success) {
        const formattedData = data.data.map((item: { timestamp: string; rate: number }) => {
          const date = new Date(item.timestamp);
          let timeLabel: string;
          
          if (period === '1d') {
            timeLabel = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
          } else if (period === '1w') {
            timeLabel = date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
          } else {
            timeLabel = date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
          }
          
          return {
            time: timeLabel,
            value: item.rate
          };
        });
        if (isComparison) {
          setComparisonChartData(formattedData);
        } else {
          setChartData(formattedData);
        }
      }
    } catch (error) {
      console.error('Error fetching historical data:', error);
    } finally {
      if (showLoading) {
        setChartLoading(false);
      }
    }
  }, []);

  // Fetch news
  const fetchNews = useCallback(async () => {
    setIsNewsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/news`);
      const data = await response.json();
      if (data.success || Array.isArray(data)) {
        setNews(Array.isArray(data) ? data.slice(0, 3) : (data.data || []).slice(0, 3));
      }
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setIsNewsLoading(false);
    }
  }, []);

  // Fetch favorites
  const fetchFavorites = useCallback(async () => {
    setIsFavoritesLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      setIsFavoritesLoading(false);
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/currencies/favorites`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.favorites) {
        setFavorites(data.favorites.map((f: { pair: string }) => f.pair));
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setIsFavoritesLoading(false);
    }
  }, []);

  // Fetch alerts
  const fetchAlerts = useCallback(async () => {
    setIsAlertsLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      setIsAlertsLoading(false);
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/rates/alerts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.alerts) {
        setAlerts(data.alerts);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setIsAlertsLoading(false);
    }
  }, []);

  // Toggle favorite
  const toggleFavorite = useCallback(async (pair: string) => {
    if (!requireAuth()) return;

    const [base, target] = pair.split('/');
    
    try {
      const response = await fetch(`${API_BASE_URL}/currencies/favorite`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ base_currency: base, target_currency: target })
      });
      const data = await response.json();
      if (data.favorited) {
        setFavorites([...favorites, pair]);
        showToast(`${pair} added to favorites`, 'success');
      } else {
        setFavorites(favorites.filter(f => f !== pair));
        showToast(`${pair} removed from favorites`, 'info');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  }, [requireAuth, favorites, showToast]);

  // Create alert with optimistic updates
  const createAlert = useCallback(async (targetRate: string, condition: "above" | "below") => {
    if (!requireAuth()) return false;

    if (!selectedPair || !targetRate) {
      return false;
    }

    const [base, target] = selectedPair.pair.split('/');

    const tempAlert: Alert = {
      alert_id: Date.now(),
      base_currency: base,
      target_currency: target,
      target_rate: parseFloat(targetRate),
      condition: condition,
      created_at: new Date().toISOString()
    };

    setAlerts(prev => [...prev, tempAlert]);

    try {
      const response = await fetch(`${API_BASE_URL}/rates/alerts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          base_currency: base,
          target_currency: target,
          target_rate: targetRate,
          condition: condition
        })
      });
      const data = await response.json();
      if (data.success) {
        fetchAlerts();
        return true;
      } else {
        setAlerts(prev => prev.filter(a => a.alert_id !== tempAlert.alert_id));
        return false;
      }
    } catch (error) {
      console.error('Error creating alert:', error);
      setAlerts(prev => prev.filter(a => a.alert_id !== tempAlert.alert_id));
      return false;
    }
  }, [requireAuth, selectedPair, fetchAlerts]);

  // Handle create alert
  const handleCreateAlert = useCallback(async () => {
    const success = await createAlert(targetRate, condition);
    if (success) {
      setAlertModalOpen(false);
      setTargetRate('');
      setCondition('above');
      showToast(`Alert created for ${selectedPair?.pair}`, 'success');
    }
  }, [createAlert, targetRate, condition, selectedPair, showToast]);

  // Delete alert
  const deleteAlert = useCallback(async (alertId: number) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/rates/alerts/${alertId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setAlerts(alerts.filter(a => a.alert_id !== alertId));
        showToast('Alert deleted', 'success');
      }
    } catch (error) {
      console.error('Error deleting alert:', error);
    }
  }, [alerts, showToast]);

  // Track price changes
  useEffect(() => {
    if (rates.length === 0) return;
    
    const newChanges: Record<string, 'up' | 'down' | null> = {};
    
    rates.forEach((newRate: Rate) => {
      const oldRate = rates.find(r => r.pair === newRate.pair);
      if (oldRate) {
        const oldPrice = parseFloat(oldRate.price);
        const newPrice = parseFloat(newRate.price);
        if (newPrice > oldPrice) {
          newChanges[newRate.pair] = 'up';
        } else if (newPrice < oldPrice) {
          newChanges[newRate.pair] = 'down';
        }
      }
    });
    
    setPriceChanges(newChanges);
    
    setTimeout(() => {
      setPriceChanges({});
    }, 1000);
  }, [rates]);

  // Fetch initial data
  useEffect(() => {
    fetchNews();
    fetchFavorites();
    fetchAlerts();
  }, [fetchNews, fetchFavorites, fetchAlerts]);

  // Set initial selected pair
  useEffect(() => {
    if (rates.length > 0 && !selectedPair) {
      setSelectedPair(rates[0]);
    }
  }, [rates, selectedPair]);

  // Calculate trend from change value for selectedPair
  const selectedPairWithTrend = useMemo(() => {
    if (!selectedPair) return null;
    const changeValue = parseFloat(selectedPair.change.replace('%', ''));
    const calculatedTrend = changeValue > 0 ? 'up' : (changeValue < 0 ? 'down' : 'neutral');
    return {
      ...selectedPair,
      trend: calculatedTrend
    };
  }, [selectedPair]);

  // Fetch chart data when selected pair or period changes
  useEffect(() => {
    if (selectedPair) {
      const currentPair = selectedPair.pair;
      const pairChanged = prevSelectedPairRef.current !== currentPair;
      const periodChanged = prevChartPeriodRef.current !== chartPeriod;
      const shouldShowLoading = pairChanged || periodChanged;
      fetchHistoricalData(selectedPair.pair, chartPeriod, false, shouldShowLoading);
      prevSelectedPairRef.current = currentPair;
      prevChartPeriodRef.current = chartPeriod;
    }
  }, [selectedPair, chartPeriod, fetchHistoricalData]);

  // Periodic chart data update
  useEffect(() => {
    if (!selectedPair) return;
    const interval = setInterval(() => {
      fetchHistoricalData(selectedPair.pair, chartPeriod, false, false);
    }, 30000);
    return () => clearInterval(interval);
  }, [selectedPair, chartPeriod, fetchHistoricalData]);

  // Fetch comparison chart data
  useEffect(() => {
    if (comparisonMode && comparisonPair) {
      fetchHistoricalData(comparisonPair.pair, chartPeriod, true);
    } else {
      setComparisonChartData([]);
    }
  }, [comparisonMode, comparisonPair, chartPeriod, fetchHistoricalData]);

  // Filter rates
  const filteredRates = useMemo(() => {
    return rates.filter(rate => {
      const matchesSearch = rate.pair.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                           rate.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase());

      if (activeCategory === "All") return matchesSearch;
      if (activeCategory === "Favorites") return matchesSearch && favorites.includes(rate.pair);

      const patterns = CATEGORY_PATTERNS[activeCategory];
      if (patterns) {
        const pair = rate.pair.toLowerCase();
        return matchesSearch && patterns.some(pattern => pair.includes(pattern));
      }

      return matchesSearch;
    }).map(rate => {
      const changeValue = parseFloat(rate.change.replace('%', ''));
      const calculatedTrend = changeValue > 0 ? 'up' : (changeValue < 0 ? 'down' : 'neutral');
      return {
        ...rate,
        trend: calculatedTrend
      };
    });
  }, [rates, debouncedSearchQuery, activeCategory, favorites]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredRates.length / ITEMS_PER_PAGE);
  }, [filteredRates.length]);

  const paginatedRates = useMemo(() => {
    return filteredRates.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );
  }, [filteredRates, currentPage]);

  // Keyboard navigation for table
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const paginatedRates = filteredRates.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedRowIndex(prev => Math.min(prev + 1, paginatedRates.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedRowIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && focusedRowIndex >= 0 && focusedRowIndex < paginatedRates.length) {
      e.preventDefault();
      setSelectedPair(paginatedRates[focusedRowIndex]);
    } else if (e.key === 'Escape') {
      setFocusedRowIndex(-1);
    }
  }, [filteredRates, currentPage, focusedRowIndex]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, debouncedSearchQuery]);

  // Connection status indicator component
  const ConnectionStatus = () => (
    <div className="flex items-center gap-2 text-[8px] font-mono">
      {usingWebSocket && isConnected && (
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
      {!usingWebSocket && !usingPolling && !apiError && (
        <span className="flex items-center gap-1.5 text-slate-500">
          <span className="relative flex h-2 w-2">
            <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-slate-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-500"></span>
          </span>
          Connecting...
        </span>
      )}
      {apiError && (
        <span className="flex items-center gap-1.5 text-rose-400">
          <AlertCircle size={12} />
          Error
        </span>
      )}
    </div>
  );

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-[#02020a] via-[#050510] to-[#02020a] text-slate-100 selection:bg-indigo-500/30 font-sans overflow-x-hidden">
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

      {/* Toast Notification */}
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
            {toast.type === 'success' && <Sparkles size={18} />}
            {toast.type === 'error' && <AlertCircle size={18} />}
            {toast.type === 'info' && <Info size={18} />}
            <p className="text-sm font-medium">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
      
      <main className="pt-32 pb-20 flex-grow relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col gap-12 relative z-10">
          
          {/* Page Title */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-3"
          >
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-full w-fit backdrop-blur-sm">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Real-time Exchange Network
              </span>
              {isConnected && (
                <span className="flex items-center gap-1 text-emerald-400 text-[8px] font-mono">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  LIVE
                </span>
              )}
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight uppercase leading-none">
              Live Market <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400">Rates</span>.
            </h1>
            <p className="text-slate-400 text-base max-w-2xl">
              {usingWebSocket && isConnected && 'Real-time data streamed via WebSocket'}
              {usingPolling && 'Data updated via polling (fallback mode)'}
              {!usingWebSocket && !usingPolling && !apiError && 'Connecting to data source...'}
              {apiError && 'Unable to connect to data source. Please try again.'}
            </p>
          </motion.div>

          {/* Top Movers */}
          <section className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full" />
              <h3 className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest">High Velocity Movers (24h Window)</h3>
              <div className="flex items-center gap-2 text-[8px] font-mono text-emerald-500 font-bold uppercase tracking-widest bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                <Flame size={10} /> Trending
              </div>
            </div>
            
            {loading && topMovers.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <SkeletonTopMover />
                <SkeletonTopMover />
                <SkeletonTopMover />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {topMovers.slice(0, 3).map((mover, i) => {
                  const changeValue = parseFloat(mover.change.replace('%', ''));
                  const trend = changeValue > 0 ? 'up' : (changeValue < 0 ? 'down' : 'neutral');

                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      whileHover={{ y: -4, scale: 1.02 }}
                      className="relative group cursor-pointer"
                    >
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/30 to-purple-500/30 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition duration-500" />
                      <div className="relative bg-gradient-to-br from-[#11111a] to-[#0c0c12] border border-white/10 rounded-2xl p-5 flex items-center justify-between shadow-lg overflow-hidden">
                        <div className={`absolute top-0 right-0 w-20 h-20 rounded-full blur-3xl ${trend === 'up' ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`} />
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl flex items-center justify-center shrink-0 ${
                            trend === 'up' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                          }`}>
                            {trend === 'up' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-white text-sm font-black font-mono tracking-wide">{mover.pair}</span>
                            <span className="text-[10px] font-mono text-slate-500">24h change</span>
                          </div>
                        </div>
                        <div className={`text-lg font-black font-mono ${trend === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {mover.change}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Search Bar */}
          <div className="flex justify-end">
            <div className="relative w-full lg:w-96 group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={14} />
              <input
                type="text"
                placeholder="Search currency pairs..."
                value={searchQuery}
                aria-label="Search currency pairs"
                role="searchbox" 
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/40 border border-white/10 focus:border-indigo-500/50 rounded-2xl py-3.5 pl-10 pr-4 text-xs font-mono text-white outline-none transition-all focus:bg-black/60 shadow-inner"
              />
            </div>
          </div>

          {/* Rates Table & Details */}
          <section className="grid lg:grid-cols-12 gap-8 items-start">
            {/* Main Table */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-8 relative group"
            >
              <div className="relative bg-gradient-to-br from-[#11111a] to-[#0b0b11] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                <div className="px-6 py-5 border-b border-white/[0.06] bg-gradient-to-r from-white/[0.02] to-transparent flex justify-between items-center">
                  <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                    <Activity size={12} className="text-indigo-400" /> Global Liquid Assets
                  </h3>
                  <div className={`flex items-center gap-2 text-[8px] font-mono font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border ${
                    usingWebSocket && isConnected 
                      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                      : usingPolling
                      ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                      : 'text-slate-400 bg-slate-500/10 border-slate-500/20'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      usingWebSocket && isConnected ? 'bg-emerald-500 animate-pulse' : 
                      usingPolling ? 'bg-amber-500 animate-pulse' : 
                      'bg-slate-500'
                    }`} />
                    {usingWebSocket && isConnected ? 'LIVE STREAM (WEBSOCKET)' : 
                     usingPolling ? 'POLLING' : 
                     'CONNECTING'}
                  </div>
                </div>

                <div className="flex flex-col min-h-[760px]">
                  <div className="overflow-x-auto flex-grow">
                  {loading && rates.length === 0 && !apiError ? (
                    <SkeletonTable />
                  ) : apiError ? (
                    <div className="p-12 flex flex-col items-center justify-center gap-5">
                      <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
                        <AlertCircle size={32} className="text-rose-400" />
                      </div>
                      <h3 className="text-lg font-black text-white font-mono uppercase tracking-wide">
                        {usingWebSocket ? 'WebSocket Connection Lost' : 'Data Unavailable'}
                      </h3>
                      <p className="text-sm text-slate-500 font-mono text-center max-w-md">
                        {usingWebSocket ? 
                          'WebSocket connection failed. Switching to polling mode...' : 
                          'Unable to fetch market data. Please check your connection.'}
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={retryConnection}
                        className="mt-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-mono font-bold text-[11px] uppercase py-3 px-6 rounded-xl transition-all shadow-lg shadow-indigo-600/30"
                      >
                        <RefreshCw size={12} className="inline mr-2" /> 
                        {usingWebSocket ? 'Reconnect WebSocket' : 'Retry'}
                      </motion.button>
                      {usingPolling && (
                        <p className="text-[9px] text-amber-400 font-mono mt-2">
                          <Clock size={10} className="inline mr-1" />
                          Using polling fallback (updates every 10s)
                        </p>
                      )}
                    </div>
                  ) : (
                    <table className="w-full text-left" onKeyDown={handleKeyDown} tabIndex={0} role="grid" aria-label="Currency rates table">
                      <thead>
                        <tr className="text-[9px] text-slate-500 font-mono font-black uppercase tracking-widest border-b border-white/[0.06] bg-white/[0.01]">
                          <th className="px-6 py-4.5">Instrument</th>
                          <th className="px-6 py-4.5">Last Price</th>
                          <th className="px-6 py-4.5">24h Change</th>
                          <th className="px-6 py-4.5">Volatility</th>
                          <th className="px-6 py-4.5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs">
                        {loading && rates.length === 0 ? (
                          <>
                            <SkeletonTableRow />
                            <SkeletonTableRow />
                            <SkeletonTableRow />
                            <SkeletonTableRow />
                            <SkeletonTableRow />
                          </>
                        ) : paginatedRates.length === 0 && filteredRates.length === 0 && activeCategory === "Favorites" ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-16 text-center">
                              <div className="flex flex-col items-center gap-4">
                                <div className="p-4 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl">
                                  <Star size={40} className="text-indigo-400" />
                                </div>
                                <h3 className="text-base font-black text-white font-mono uppercase tracking-wide">No Favorites Yet</h3>
                                <p className="text-xs text-slate-500 font-mono">Click the star icon to add currency pairs to favorites</p>
                              </div>
                            </td>
                          </tr>
                        ) : paginatedRates.length === 0 && filteredRates.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-16 text-center text-slate-500 text-sm font-mono">
                              No results found for "{searchQuery}"
                            </td>
                          </tr>
                        ) : (
                          paginatedRates.map((rate, i) => (
                            <motion.tr
                              key={rate.pair}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.03 }}
                              whileHover={{ backgroundColor: "rgba(99, 102, 241, 0.05)" }}
                              onClick={() => setSelectedPair(rate)}
                              className={`border-b border-white/[0.03] transition-all cursor-pointer group ${
                                selectedPair?.pair === rate.pair ? 'bg-indigo-600/10 border-l-2 border-l-indigo-500' : ''
                              } ${focusedRowIndex === i ? 'bg-indigo-500/20 outline outline-2 outline-indigo-500 outline-offset-[-2px]' : ''}`}
                              onMouseEnter={() => setHoveredRow(rate.pair)}
                              onMouseLeave={() => setHoveredRow(null)}
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  {isLoggedIn() ? (
                                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                      <Star 
                                        size={12} 
                                        className={`cursor-pointer transition-all ${favorites.includes(rate.pair) ? "text-indigo-500 fill-indigo-500" : "text-slate-600 hover:text-indigo-400"}`}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleFavorite(rate.pair);
                                        }}
                                      />
                                    </motion.div>
                                  ) : (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        router.push('/login');
                                      }}
                                      className="text-slate-600 hover:text-indigo-400 transition-colors"
                                      title="Login to add to favorites"
                                    >
                                      <Star size={12} />
                                    </button>
                                  )}
                                  <div className="flex flex-col">
                                    <span className="font-mono font-bold text-slate-200 group-hover:text-indigo-400 transition-colors uppercase tracking-wider text-sm">
                                      {rate.pair}
                                    </span>
                                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{rate.name}</span>
                                  </div>
                                </div>
                              </td>
                              <td className={`px-6 py-4 font-mono font-black text-base transition-all duration-300 ${
                                priceChanges[rate.pair] === 'up' ? 'text-emerald-400 scale-110' : 
                                priceChanges[rate.pair] === 'down' ? 'text-rose-400 scale-110' : 
                                'text-white'
                              }`}>
                                {rate.price}
                              </td>
                              <td className={`px-6 py-4 font-mono font-bold text-sm ${rate.trend === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                <div className="flex items-center gap-1">
                                  {rate.trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                  {rate.change}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`text-[9px] font-mono font-bold px-2.5 py-1 rounded-full border uppercase ${
                                  rate.volatility === 'High' ? 'border-rose-500/20 text-rose-300 bg-rose-500/10' : 
                                  rate.volatility === 'Medium' ? 'border-amber-500/20 text-amber-300 bg-amber-500/10' :
                                  'border-emerald-500/20 text-emerald-300 bg-emerald-500/10'
                                }`}>
                                  {rate.volatility}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <motion.div
                                  animate={{ x: hoveredRow === rate.pair ? 5 : 0 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <ChevronRight size={14} className="inline text-slate-600 group-hover:text-indigo-400 transition-all" />
                                </motion.div>
                              </td>
                            </motion.tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  )}
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && !apiError && !loading && (
                    <div className="px-6 py-4 border-t border-white/[0.06] bg-white/[0.01] flex items-center justify-between">
                      <div className="text-[9px] text-slate-500 font-mono">
                        Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredRates.length)} of {filteredRates.length} pairs
                      </div>
                      <div className="flex items-center gap-1.5">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="px-3 py-1.5 text-[9px] font-mono font-bold rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          Prev
                        </motion.button>
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          return (
                            <motion.button
                              key={pageNum}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`px-3 py-1.5 text-[9px] font-mono font-bold rounded-lg transition-all ${
                                currentPage === pageNum
                                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                                  : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                              }`}
                            >
                              {pageNum}
                            </motion.button>
                          );
                        })}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="px-3 py-1.5 text-[9px] font-mono font-bold rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          Next
                        </motion.button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Right Side: Pair Detail */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-4 flex flex-col gap-6"
            >
              {/* Rate Alert Info */}
              {selectedPair && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border border-indigo-500/20 rounded-2xl p-4 flex items-center gap-3 shadow-lg"
                >
                  <div className="p-2.5 bg-indigo-600/15 border border-indigo-500/20 text-indigo-400 rounded-xl">
                    <Bell size={16} />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <h5 className="font-bold text-slate-200 text-xs">Rate Alert Ready</h5>
                    <p className="text-[9px] text-slate-500 leading-normal">Get notified when {selectedPair.pair} hits your target</p>
                  </div>
                </motion.div>
              )}

              {loading && !selectedPair ? (
                <SkeletonPairDetail />
              ) : selectedPair ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="relative group"
                >
                  <div className="relative bg-gradient-to-br from-[#11111a] to-[#0c0c12] border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${selectedPairWithTrend?.trend === 'up' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                            <h4 className="text-2xl font-black text-white tracking-wider font-mono uppercase">{selectedPair?.pair}</h4>
                          </div>
                          <span className="text-[10px] font-bold text-indigo-400/80 uppercase font-mono tracking-widest">{selectedPair?.name}</span>
                        </div>
                        <div className={`p-3 rounded-xl ${selectedPairWithTrend?.trend === 'up' ? 'bg-emerald-500/15 border border-emerald-500/20 text-emerald-400' : 'bg-rose-500/15 border border-rose-500/20 text-rose-400'}`}>
                          {selectedPairWithTrend?.trend === 'up' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-black/40 border border-white/10 rounded-xl p-3.5 hover:border-indigo-500/30 transition-all">
                          <span className="text-[8px] text-slate-500 font-mono font-bold uppercase tracking-widest block mb-1 flex items-center gap-1">
                            <BarChart3 size={10} /> Volume (24h)
                          </span>
                          <span className="text-sm font-mono text-white font-extrabold">{selectedPair.volume}</span>
                        </div>
                        <div className="bg-black/40 border border-white/10 rounded-xl p-3.5 hover:border-indigo-500/30 transition-all">
                          <span className="text-[8px] text-slate-500 font-mono font-bold uppercase tracking-widest block mb-1 flex items-center gap-1">
                            <Gauge size={10} /> Volatility
                          </span>
                          <span className={`text-sm font-mono font-extrabold ${
                            selectedPair.volatility === 'High' ? 'text-rose-400' : 
                            selectedPair.volatility === 'Medium' ? 'text-amber-400' : 'text-emerald-400'
                          }`}>
                            {selectedPair.volatility}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-white/[0.06] space-y-4">
                        <div className="flex justify-between items-center text-[9px] font-mono">
                          <span className="text-slate-500 uppercase tracking-widest flex items-center gap-1">
                            <ShieldCheck size={10} /> Market Integration
                          </span>
                          <span className={`font-black tracking-wider flex items-center gap-1.5 ${
                            usingWebSocket && isConnected ? 'text-emerald-400' : 
                            usingPolling ? 'text-amber-400' : 
                            'text-slate-400'
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${
                              usingWebSocket && isConnected ? 'bg-emerald-500 animate-ping' : 
                              usingPolling ? 'bg-amber-500 animate-pulse' : 
                              'bg-slate-500'
                            }`} />
                            {usingWebSocket && isConnected ? 'LIVE' : 
                             usingPolling ? 'POLLING' : 
                             'CONNECTING'}
                          </span>
                        </div>
                        <div className="flex gap-3">
                          <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              if (isLoggedIn()) {
                                setAlertModalOpen(true);
                              } else {
                                router.push('/login');
                              }
                            }}
                            className="flex-1 bg-white/5 hover:bg-white/10 text-white font-mono font-bold text-[10px] uppercase py-3.5 rounded-xl transition-all border border-white/10 flex items-center justify-center gap-2 group"
                          >
                            <Bell size={12} className="group-hover:text-indigo-400 transition-colors" />
                            {isLoggedIn() ? 'Add Alert' : 'Login to Alert'}
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : null}

              {/* Favorites Section */}
              {isFavoritesLoading ? (
                <SkeletonFavorites />
              ) : favorites.length > 0 ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.32 }}
                  className="bg-gradient-to-br from-[#11111a] to-[#0c0c12] border border-white/10 rounded-2xl p-5 shadow-lg"
                >
                  <h5 className="font-bold text-slate-300 text-[11px] mb-4 flex items-center gap-2">
                    <Star size={12} className="text-indigo-400" /> Favorites
                  </h5>
                  <div className="space-y-2.5">
                    {favorites.slice(0, 5).map((pair, idx) => {
                      const rate = rates.find(r => r.pair === pair);
                      if (!rate) return null;
                      return (
                        <motion.div 
                          key={pair}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="flex items-center justify-between bg-black/30 border border-white/5 rounded-xl p-3 hover:border-indigo-500/30 transition-all cursor-pointer"
                          onClick={() => setSelectedPair(rate)}
                        >
                          <div className="flex flex-col">
                            <span className="text-[10px] font-mono font-bold text-white">{rate.pair}</span>
                            <span className={`text-[8px] font-mono ${rate.trend === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {rate.change}
                            </span>
                          </div>
                          <Star size={12} className="text-indigo-500 fill-indigo-500" />
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              ) : null}

              {/* Active Alerts */}
              {isAlertsLoading ? (
                <SkeletonAlerts />
              ) : alerts.length > 0 ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="bg-gradient-to-br from-[#11111a] to-[#0c0c12] border border-white/10 rounded-2xl p-5 shadow-lg"
                >
                  <h5 className="font-bold text-slate-300 text-[11px] mb-4 flex items-center gap-2">
                    <Target size={12} className="text-indigo-400" /> Active Alerts
                  </h5>
                  <div className="space-y-2.5">
                    {alerts.map((alert, idx) => (
                      <motion.div 
                        key={alert.alert_id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-center justify-between bg-black/30 border border-white/5 rounded-xl p-3 hover:border-indigo-500/30 transition-all"
                      >
                        <div className="flex flex-col">
                          <span className="text-[10px] font-mono font-bold text-white">{alert.base_currency}/{alert.target_currency}</span>
                          <span className={`text-[8px] font-mono ${alert.condition === 'above' ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {alert.condition} {parseFloat(alert.target_rate).toFixed(4)}
                          </span>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => deleteAlert(alert.alert_id)}
                          className="text-rose-400 hover:text-rose-300 transition-colors p-1.5 hover:bg-rose-500/10 rounded-lg"
                        >
                          <Trash2 size={12} />
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ) : null}
            </motion.div>
          </section>

          {/* Chart Section */}
          {selectedPair && (
            <section className="flex flex-col gap-5">
              <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full" />
                  <h2 className="text-lg font-black text-slate-200 font-mono tracking-wide">
                    {comparisonMode && comparisonPair ? `${selectedPair.pair} vs ${comparisonPair.pair}` : `${selectedPair.pair} Trend Analysis`}
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setComparisonMode(!comparisonMode);
                      if (!comparisonMode) {
                        setComparisonPair(null);
                        setComparisonChartData([]);
                      }
                    }}
                    className={`px-3 py-1.5 text-[9px] font-bold font-mono rounded-lg transition-all flex items-center gap-1.5 ${
                      comparisonMode
                        ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-600/30'
                        : 'bg-white/5 text-slate-500 hover:text-white border border-white/10'
                    }`}
                  >
                    <Link2 size={10} /> {comparisonMode ? 'Compare: ON' : 'Compare: OFF'}
                  </motion.button>
                  <div className="flex bg-white/[0.02] border border-white/10 p-1 rounded-xl gap-0.5">
                    {['1D', '1W', '1M'].map((period) => (
                      <motion.button
                        key={period}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setChartPeriod(period.toLowerCase())}
                        className={`px-3 py-1.5 text-[9px] font-bold font-mono rounded-lg transition-all ${
                          chartPeriod === period.toLowerCase()
                            ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                            : 'text-slate-500 hover:text-white'
                        }`}
                      >
                        {period}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
              
              {comparisonMode && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 mb-2 p-3 bg-indigo-500/5 border border-indigo-500/20 rounded-xl"
                >
                  <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">Compare with:</span>
                  <select
                    value={comparisonPair?.pair || ''}
                    onChange={(e) => {
                      const pair = rates.find(r => r.pair === e.target.value);
                      if (pair && pair.pair !== selectedPair?.pair) {
                        setComparisonPair(pair);
                      }
                    }}
                    className="bg-black/40 border border-white/10 focus:border-indigo-500/40 rounded-lg py-1.5 px-3 text-[10px] font-mono text-white outline-none transition-all"
                  >
                    <option value="">Select pair to compare</option>
                    {rates.filter(r => r.pair !== selectedPair?.pair).map((rate) => (
                      <option key={rate.pair} value={rate.pair}>{rate.pair} - {rate.name}</option>
                    ))}
                  </select>
                  {comparisonPair && (
                    <div className="flex items-center gap-1.5 ml-auto">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-[8px] font-mono text-slate-500">Comparing with {comparisonPair.pair}</span>
                    </div>
                  )}
                </motion.div>
              )}
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="relative group"
              >
                {chartLoading ? (
                  <SkeletonChart />
                ) : (
                  <div className="relative bg-gradient-to-br from-[#11111a] to-[#0b0b11] border border-white/10 rounded-3xl p-6 sm:p-8 h-[420px] shadow-2xl overflow-hidden">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.005)_1px,transparent_1px)] bg-[size:100%_40px] pointer-events-none" />
                    
                    {chartData.length === 0 ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
                            <LineChart size={32} className="text-indigo-400" />
                          </div>
                          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">No Chart Data Available</span>
                        </div>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={comparisonMode && comparisonChartData.length > 0 ? chartData.map((item, i) => ({
                          ...item,
                          comparisonValue: comparisonChartData[i]?.value || 0
                        })) : chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="ratesGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="comparisonGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
                          <XAxis 
                            dataKey="time" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: "#64748b", fontSize: 9, fontWeight: "bold", fontFamily: "monospace" }}
                            dy={10}
                          />
                          <YAxis 
                            domain={['dataMin - 0.001', 'dataMax + 0.001']} 
                            axisLine={false} 
                            tickLine={false}
                            tick={{ fill: "#64748b", fontSize: 9, fontWeight: "bold", fontFamily: "monospace" }}
                          />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#0a0a0f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px', fontFamily: 'monospace', backdropFilter: 'blur(10px)' }}
                            itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
                            labelStyle={{ color: '#64748b', fontSize: '9px' }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#6366f1" 
                            strokeWidth={2.5} 
                            fillOpacity={1} 
                            fill="url(#ratesGradient)" 
                            animationDuration={1500}
                            name={selectedPair?.pair}
                          />
                          {comparisonMode && comparisonChartData.length > 0 && (
                            <Area 
                              type="monotone" 
                              dataKey="comparisonValue" 
                              stroke="#10b981" 
                              strokeWidth={2.5} 
                              fillOpacity={1} 
                              fill="url(#comparisonGradient)" 
                              animationDuration={1500}
                              name={comparisonPair?.pair}
                            />
                          )}
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                )}
              </motion.div>
            </section>
          )}

          {/* Market News Section */}
          <section className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full" />
              <h2 className="text-lg font-black text-slate-200 font-mono tracking-wide">Market Intelligence</h2>
              <div className="flex items-center gap-2 text-[8px] font-mono text-indigo-400 font-bold uppercase tracking-widest bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                <Newspaper size={10} /> Latest Updates
              </div>
            </div>
            
            {isNewsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <SkeletonNewsCard />
                <SkeletonNewsCard />
                <SkeletonNewsCard />
              </div>
            ) : news.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {news.map((item, idx) => (
                  <motion.div
                    key={item.news_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ y: -4 }}
                    className="relative group cursor-pointer"
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition duration-500" />
                    <div className="relative bg-gradient-to-br from-[#11111a] to-[#0c0c12] border border-white/10 rounded-2xl p-5 shadow-lg overflow-hidden">
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-[8px] font-mono font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2 py-1 rounded-full border border-indigo-500/20">
                          {item.category}
                        </span>
                        <span className="text-[8px] font-mono text-slate-500 flex items-center gap-1">
                          <Clock size={8} /> {new Date(item.published_at).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors mb-2 leading-tight line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-3 mb-3">
                        {item.content}
                      </p>
                      <div className="flex items-center gap-2 text-[8px] text-indigo-400 font-mono font-bold uppercase tracking-wider group-hover:gap-3 transition-all">
                        Read more <ArrowRight size={10} />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : null}
          </section>

        </div>
      </main>

      <Footer />

      {/* Alert Modal */}
      <AnimatePresence>
        {alertModalOpen && selectedPair && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setAlertModalOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-[#11111a] to-[#0c0c12] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-400 rounded-xl">
                    <Bell size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white font-mono uppercase tracking-wide">Create Alert</h3>
                    <p className="text-[9px] text-slate-500 font-mono">{selectedPair.pair}</p>
                  </div>
                </div>
                <button
                  onClick={() => setAlertModalOpen(false)}
                  className="text-slate-500 hover:text-white transition-colors p-1"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-2">
                    Target Rate
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={targetRate}
                    onChange={(e) => setTargetRate(e.target.value)}
                    placeholder="Enter target rate..."
                    className="w-full bg-black/40 border border-white/10 focus:border-indigo-500/50 rounded-xl py-3 px-4 text-sm font-mono text-white outline-none transition-all focus:bg-black/60"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-3">
                    Condition
                  </label>
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setCondition('above')}
                      className={`flex-1 py-2.5 rounded-xl font-mono font-bold text-[10px] uppercase transition-all border ${
                        condition === 'above'
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 shadow-lg shadow-emerald-500/20'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      Above
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setCondition('below')}
                      className={`flex-1 py-2.5 rounded-xl font-mono font-bold text-[10px] uppercase transition-all border ${
                        condition === 'below'
                          ? 'bg-rose-500/15 border-rose-500/40 text-rose-400 shadow-lg shadow-rose-500/20'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      Below
                    </motion.button>
                  </div>
                </div>

                <div className="flex gap-3 pt-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setAlertModalOpen(false)}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white font-mono font-bold text-[10px] uppercase py-3 rounded-xl transition-all border border-white/10"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCreateAlert}
                    disabled={!targetRate}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-mono font-bold text-[10px] uppercase py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/30"
                  >
                    Create Alert
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </ErrorBoundary>
  );
}