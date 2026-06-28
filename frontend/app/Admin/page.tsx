"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ShieldAlert, RotateCcw, Globe, Newspaper, ShieldCheck, 
  MessageSquare, ArrowRight, Activity, Database, Wifi, 
  Terminal, Loader2, Clock, Zap, Send, Server, ChevronRight,
  TrendingUp, TrendingDown, Users, Eye, Bell, Settings,
  BarChart3, PieChart, LineChart, CheckCircle2, AlertCircle,
  Copy, RefreshCw, Link2, Radio, Cpu, HardDrive, Cloud,
  MoreHorizontal, UserCheck, Fingerprint, Sparkles, ScanEye,
  Navigation, Compass, Gauge, Radar, DollarSign, BarChart,
  FileText, UserPlus, LogOut, Shield, AlertTriangle, CheckCheck,
  Brain, CircuitBoard, Key, Lock, EyeOff
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "../css/Admin/Dashboard.css";

export default function AdminDashboardView() {
  const router = useRouter();
  const [ratesCount, setRatesCount] = useState(0);
  const [newsCount, setNewsCount] = useState(0);
  const [usersCount, setUsersCount] = useState(0);
  const [postsCount, setPostsCount] = useState(0);
  const [ratesTrend, setRatesTrend] = useState(0);
  const [newsTrend, setNewsTrend] = useState(0);
  const [usersTrend, setUsersTrend] = useState(0);
  const [postsTrend, setPostsTrend] = useState(0);
  const [activityLogs, setActivityLogs] = useState([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [time, setTime] = useState(new Date());
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastContent, setBroadcastContent] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: string; visible: boolean }>({ message: '', type: '', visible: false });
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  
  // System health stats
  const [systemStats, setSystemStats] = useState<{
    cpu: number;
    cpu_cores: { core_1: number; core_2: number; core_3: number; core_4: number };
    db: string;
    latency: number;
    memory: { usage_percent: number; total: number; free: number };
    disk: { usage_percent: number; total: number; free: number; used: number };
    network_throughput: number;
    system_health: number;
    security: {
      firewall: string;
      ddos_protection: string;
      ssl: string;
    };
    uptime: string;
  }>({
    cpu: 42,
    cpu_cores: { core_1: 38, core_2: 45, core_3: 41, core_4: 44 },
    db: 'ONLINE',
    latency: 14,
    memory: { usage_percent: 67, total: 0, free: 0 },
    disk: { usage_percent: 67, total: 0, free: 0, used: 0 },
    network_throughput: 342,
    system_health: 98.4,
    security: {
      firewall: 'active',
      ddos_protection: 'enabled',
      ssl: 'valid',
    },
    uptime: '0d 0h 0m',
  });

  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  
  // Oracle Override state
  const [oraclePair, setOraclePair] = useState("EUR/USD");
  const [oracleRate, setOracleRate] = useState("");
  const [isOverriding, setIsOverriding] = useState(false);
  const [currentRateInfo, setCurrentRateInfo] = useState<{ price: string; change: string; trend: string; volume: string; lastUpdated: string } | null>(null);

  // Mock data cho activity logs
  const mockActivityLogs = [
    { log_id: 1, user_id: "U001", username: "0xKaelen", activity_type: "RATE_UPDATE", description: "Modified EUR/USD spread parameters", target_type: "rate", target_id: "eur_usd", created_at: new Date().toISOString(), avatar: "K", status: "success" },
    { log_id: 2, user_id: "U002", username: "VY123", activity_type: "COMMENT", description: "Posted analysis on NFP report", target_type: "post", target_id: "post_42", created_at: new Date(Date.now() - 2*60000).toISOString(), avatar: "V", status: "info" },
    { log_id: 3, user_id: "U003", username: "CipherVault", activity_type: "SECURITY", description: "Two-factor authentication enabled", target_type: "user", target_id: "user_89", created_at: new Date(Date.now() - 7*60000).toISOString(), avatar: "C", status: "warning" },
    { log_id: 4, user_id: "U004", username: "FX_Wizard", activity_type: "TRADE_EXEC", description: "Placed limit order @ 1.0892", target_type: "trade", target_id: "tx_1234", created_at: new Date(Date.now() - 15*60000).toISOString(), avatar: "F", status: "success" },
    { log_id: 5, user_id: "U005", username: "NeonNova", activity_type: "SYNC", description: "Wallet synchronized with blockchain", target_type: "wallet", target_id: "0x8f3...a1e", created_at: new Date(Date.now() - 28*60000).toISOString(), avatar: "N", status: "info" },
    { log_id: 6, user_id: "U002", username: "VY123", activity_type: "ALERT", description: "Price target reached: GBP/USD", target_type: "alert", target_id: "alert_07", created_at: new Date(Date.now() - 45*60000).toISOString(), avatar: "V", status: "warning" },
    { log_id: 7, user_id: "U006", username: "CryptoKing", activity_type: "TRADE_EXEC", description: "Executed BTC buy order @ $43,200", target_type: "trade", target_id: "tx_5678", created_at: new Date(Date.now() - 52*60000).toISOString(), avatar: "C", status: "success" },
    { log_id: 8, user_id: "U007", username: "MoonTrader", activity_type: "COMMENT", description: "Commented on ETH price analysis", target_type: "post", target_id: "post_89", created_at: new Date(Date.now() - 68*60000).toISOString(), avatar: "M", status: "info" },
    { log_id: 9, user_id: "U008", username: "WhaleWatcher", activity_type: "ALERT", description: "Large transaction detected: 500 ETH", target_type: "alert", target_id: "alert_12", created_at: new Date(Date.now() - 82*60000).toISOString(), avatar: "W", status: "warning" },
    { log_id: 10, user_id: "U009", username: "QuantTrader", activity_type: "RATE_UPDATE", description: "Updated USD/JPY leverage limits", target_type: "rate", target_id: "usd_jpy", created_at: new Date(Date.now() - 95*60000).toISOString(), avatar: "Q", status: "success" },
    { log_id: 11, user_id: "U010", username: "AlphaSignal", activity_type: "COMMENT", description: "Shared technical analysis on S&P 500", target_type: "post", target_id: "post_101", created_at: new Date(Date.now() - 110*60000).toISOString(), avatar: "A", status: "info" },
    { log_id: 12, user_id: "U011", username: "BetaTrader", activity_type: "TRADE_EXEC", description: "Closed position: +342 pips", target_type: "trade", target_id: "tx_9012", created_at: new Date(Date.now() - 125*60000).toISOString(), avatar: "B", status: "success" },
  ];

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) { router.push("/login"); return; }
    const user = JSON.parse(userStr);
    if (user.role !== "admin") { router.push("/"); return; }
    setCurrentUser(user);
    setIsLoading(false);

    const loadData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://127.0.0.1:8000/api/admin/statistics", {
          headers: { "Authorization": `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setRatesCount(data.data.rates_count);
            setNewsCount(data.data.news_count);
            setUsersCount(data.data.users_count);
            setPostsCount(data.data.posts_count);
            setRatesTrend(data.data.rates_trend || 0);
            setNewsTrend(data.data.news_trend || 0);
            setUsersTrend(data.data.users_trend || 0);
            setPostsTrend(data.data.posts_trend || 0);
          }
        }
      } catch (error) {
        console.error("Error fetching statistics:", error);
        // Fallback to localStorage if API fails
        setRatesCount(JSON.parse(localStorage.getItem("sandbox-rates-cache") || "[]").length || 6);
        setNewsCount(JSON.parse(localStorage.getItem("sandbox-news-articles") || "[]").length || 2);
        setUsersCount(JSON.parse(localStorage.getItem("sandbox-users-cache") || "[]").length || 4);
        setPostsCount(JSON.parse(localStorage.getItem("sandbox-community-discussions") || "[]").length || 8);
        setRatesTrend(12);
        setNewsTrend(5);
        setUsersTrend(8);
        setPostsTrend(3);
      }
    };
    loadData();
  }, [router]);

  const fetchActivityLogs = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://127.0.0.1:8000/api/admin/activity-logs", {
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.length > 0) {
          setActivityLogs(data.data);
          return;
        }
      }
      setActivityLogs(mockActivityLogs);
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      setActivityLogs(mockActivityLogs);
    }
  };

  // Initial fetch of activity logs
  useEffect(() => {
    fetchActivityLogs();
  }, []);

  const handlePublishBroadcast = async () => {
    if (!broadcastContent.trim()) return;

    setIsPublishing(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://127.0.0.1:8000/api/admin/broadcast-notices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: broadcastTitle || "System Notice",
          content: broadcastContent,
        }),
      });

      if (response.ok) {
        setBroadcastTitle("");
        setBroadcastContent("");
        showToast("Broadcast notice published successfully!", "success");
      } else {
        showToast("Failed to publish broadcast notice", "error");
      }
    } catch (error) {
      console.error("Error publishing broadcast:", error);
      showToast("Error publishing broadcast notice", "error");
    } finally {
      setIsPublishing(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  };

  const handleFactoryReset = async () => {
    setIsResetting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://127.0.0.1:8000/api/admin/factory-reset", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          showToast("Factory reset completed successfully!", "success");
          // Reload the page after a short delay
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } else {
          showToast("Factory reset failed", "error");
        }
      } else {
        showToast("Failed to perform factory reset", "error");
      }
    } catch (error) {
      console.error("Error performing factory reset:", error);
      showToast("Error performing factory reset", "error");
    } finally {
      setIsResetting(false);
      setShowResetConfirm(false);
    }
  };

  // Fetch current rate info for Oracle Override
  const fetchCurrentRateInfo = async (pair: string) => {
    try {
      const [base, target] = pair.split('/');
      const response = await fetch(`http://127.0.0.1:8000/api/rates/current`);
      const data = await response.json();
      
      if (data.success && data.rates) {
        const rate = data.rates.find((r: any) => r.pair === pair);
        if (rate) {
          setCurrentRateInfo({
            price: rate.price,
            change: rate.change,
            trend: rate.trend,
            volume: rate.volume || '$2.4B',
            lastUpdated: 'Just now'
          });
          setOracleRate(rate.price);
        }
      }
    } catch (error) {
      console.error('Error fetching current rate:', error);
      // Set default values if API fails
      setCurrentRateInfo({
        price: '1.08542',
        change: '+0.23%',
        trend: 'up',
        volume: '$2.4B',
        lastUpdated: '2 mins ago'
      });
      setOracleRate('1.0854');
    }
  };

  // Handle Oracle Override
  const handleOracleOverride = async () => {
    if (!oraclePair || !oracleRate) {
      showToast('Please select a pair and enter a rate', 'error');
      return;
    }

    setIsOverriding(true);
    try {
      const token = localStorage.getItem('token');
      const [base, target] = oraclePair.split('/');
      const priceChangePercent = parseFloat(currentRateInfo?.change.replace('%', '') || '0');
      
      const payload = {
        base_currency: base,
        target_currency: target,
        exchange_rate: parseFloat(oracleRate),
        price_change_percent: priceChangePercent,
        trend: currentRateInfo?.trend || 'up',
        volatility: 'Med',
        volume_24h: currentRateInfo?.volume || '$2.4B',
        source: 'oracle_override'
      };

      const response = await fetch('http://127.0.0.1:8000/api/admin/rates', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (data.success) {
        showToast(`Oracle override successful: ${oraclePair} → ${oracleRate}`, 'success');
        // Refresh rate info
        await fetchCurrentRateInfo(oraclePair);
        // Update rates count
        setRatesCount(prev => prev + 1);
      } else {
        showToast('Failed to override rate', 'error');
      }
    } catch (error) {
      console.error('Error overriding rate:', error);
      showToast('Error overriding rate', 'error');
    } finally {
      setIsOverriding(false);
    }
  };

  // Fetch rate info when pair changes
  useEffect(() => {
    fetchCurrentRateInfo(oraclePair);
  }, [oraclePair]);

  // Poll server health stats every 5 seconds
  useEffect(() => {
    const fetchSystemHealth = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://127.0.0.1:8000/api/admin/health", {
          headers: { "Authorization": `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setSystemStats(data.data);
            setLastSyncTime(new Date());
          }
        }
      } catch (error) {
        console.error("Error fetching system health:", error);
        // Keep using default values if API fails
      }
    };

    // Initial fetch
    fetchSystemHealth();

    // Poll every 5 seconds
    const interval = setInterval(fetchSystemHealth, 5000);

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#02020a] via-[#050510] to-[#02020a] flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full" />
          <Loader2 className="animate-spin text-indigo-500 relative z-10" size={40} />
        </div>
        <span className="text-[10px] uppercase tracking-[0.3em] text-indigo-400 font-bold font-mono animate-pulse">
          Loading Cortex Terminal...
        </span>
      </div>
    );
  }

  // Tạo danh sách logs với 16 logs (vừa đẹp cho chiều cao 910px)
  const extendedLogs = [...activityLogs, ...activityLogs.slice(0, 4)];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#02020a] via-[#050510] to-[#02020a] text-slate-100 selection:bg-indigo-500/30 font-sans overflow-x-hidden pb-20">
      
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[5%] left-[-15%] w-[600px] h-[600px] bg-purple-600/8 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] left-[30%] w-[500px] h-[500px] bg-cyan-600/5 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#02020a_85%)]" />
        <div 
          className="absolute inset-0 opacity-[0.025]" 
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
            className={`fixed bottom-6 right-6 z-50 pl-3 pr-5 py-3 rounded-2xl border backdrop-blur-2xl flex items-center gap-3 shadow-2xl ${
              toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200' :
              toast.type === 'error' ? 'bg-red-500/10 border-red-500/40 text-red-200' :
              'bg-indigo-500/10 border-indigo-500/40 text-indigo-200'
            }`}
          >
            <div className={`p-1.5 rounded-full ${
              toast.type === 'success' ? 'bg-emerald-500/20' :
              toast.type === 'error' ? 'bg-red-500/20' : 'bg-indigo-500/20'
            }`}>
              {toast.type === 'success' && <CheckCircle2 size={15} />}
              {toast.type === 'error' && <AlertCircle size={15} />}
              {toast.type === 'info' && <Zap size={15} />}
            </div>
            <p className="text-sm font-medium">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Factory Reset Confirmation Dialog */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, type: "spring", stiffness: 300 }}
              className="relative bg-gradient-to-br from-[#15151f] to-[#0c0c12] rounded-2xl border border-red-500/20 shadow-2xl shadow-red-950/40 p-8 max-w-md w-full mx-4 overflow-hidden"
            >
              <div className="pointer-events-none absolute -top-16 -right-16 w-48 h-48 bg-red-600/10 rounded-full blur-[80px]" />
              <div className="relative flex items-center gap-3 mb-4">
                <div className="relative p-3 bg-red-500/15 rounded-xl border border-red-500/30">
                  <div className="absolute inset-0 bg-red-500/20 rounded-xl blur-md animate-pulse" />
                  <AlertTriangle size={24} className="relative text-red-400" />
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight">Factory Reset</h3>
              </div>
              <p className="relative text-sm text-slate-400 mb-6 leading-relaxed">
                This action will reset all system configurations to default values. All custom settings, cached data, and temporary configurations will be permanently deleted. This action cannot be undone.
              </p>
              <div className="relative flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowResetConfirm(false)}
                  disabled={isResetting}
                  className="flex-1 border border-white/10 bg-white/5 text-slate-300 px-6 py-3 rounded-xl font-mono text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleFactoryReset}
                  disabled={isResetting}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-black px-6 py-3 rounded-xl text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResetting ? (
                    <>
                      <Loader2 size={12} className="animate-spin" /> Resetting...
                    </>
                  ) : (
                    <>
                      <RotateCcw size={12} /> Confirm Reset
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col gap-8 pt-32 lg:pt-36">
        
        {/* HEADER SECTION */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative group"
        >
          <div className="relative bg-gradient-to-br from-[#12121c] via-[#0d0d14] to-[#0a0a10] rounded-[2rem] p-8 sm:p-10 border border-white/10 overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
            <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 bg-indigo-600/15 rounded-full blur-[100px]" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-7">
              <div className="flex flex-col gap-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full w-fit">
                  <ShieldAlert size={12} className="text-indigo-400" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 font-mono">System Command Terminal</span>
                  <span className="w-1 h-1 rounded-full bg-indigo-500/50" />
                  <span className="text-[10px] font-mono text-indigo-400/70">v2.4</span>
                </div>
                <h1 className="text-4xl sm:text-6xl font-black tracking-tight uppercase leading-[0.95]">
                  Cortex <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-sky-400">Control</span>
                </h1>
                <p className="text-[13px] text-slate-500 font-medium max-w-lg leading-relaxed">
                  Unified administrative interface for rate management, security bulletins, and node diagnostics.
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="relative w-1.5 h-1.5">
                    <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-60" />
                    <div className="absolute inset-0 rounded-full bg-emerald-500" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">All systems nominal &middot; {currentUser?.username || "operator"} logged in</span>
                </div>
              </div>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowResetConfirm(true)}
                className="relative z-10 border border-red-500/30 bg-red-500/10 text-red-400 px-6 py-3 rounded-xl font-mono text-[10px] font-bold uppercase tracking-widest hover:bg-red-500/20 hover:border-red-500/50 transition-all flex items-center gap-2 shrink-0"
              >
                <RotateCcw size={14} /> Factory Reset
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* MAIN GRID */}
        <div className="grid lg:grid-cols-12 gap-8 items-stretch">
          
          {/* LEFT COLUMN (8/12) */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            
            {/* Stat Cards 2x2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <StatCard 
                label="Exchange Rates" 
                value={ratesCount} 
                sub="Active Pairs" 
                icon={<Globe size={20}/>} 
                color="indigo" 
                trend={`${ratesTrend >= 0 ? '+' : ''}${ratesTrend}%`}
                onClick={() => router.push("/Admin/Rates")} 
              />
              <StatCard 
                label="Bulletins" 
                value={newsCount} 
                sub="Reports" 
                icon={<Newspaper size={20}/>} 
                color="emerald" 
                trend={`${newsTrend >= 0 ? '+' : ''}${newsTrend}%`}
                onClick={() => router.push("/Admin/News")} 
              />
              <StatCard 
                label="Node Roster" 
                value={usersCount} 
                sub="Verified" 
                icon={<ShieldCheck size={20}/>} 
                color="sky" 
                trend={`${usersTrend >= 0 ? '+' : ''}${usersTrend}%`}
                onClick={() => router.push("/Admin/Users")} 
              />
              <StatCard 
                label="Signals" 
                value={postsCount} 
                sub="Transmissions" 
                icon={<MessageSquare size={20}/>} 
                color="amber" 
                trend={`${postsTrend >= 0 ? '+' : ''}${postsTrend}%`}
                onClick={() => router.push("/Admin/Communities")} 
              />
            </div>

            {/* Activity Ledger - EXTENDED VERSION */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-[#0a0a12] via-[#0c0c14] to-[#08080f] rounded-2xl border border-white/10 flex flex-col shadow-2xl overflow-hidden backdrop-blur-sm"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-white/[0.03] to-transparent shrink-0">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-indigo-500/30 rounded-xl blur-md" />
                    <div className="relative p-2 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl border border-indigo-500/30">
                      <Radar size={14} className="text-indigo-400" />
                    </div>
                  </div>
                  <div>
                    <span className="font-mono text-[11px] font-black uppercase tracking-[0.2em] bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                      Activity Ledger
                    </span>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5 flex items-center gap-1">
                      <Activity size={8} className="inline" />
                      Real-time system telemetry
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-emerald-500/30 rounded-lg blur-sm animate-pulse" />
                    <div className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 to-emerald-600/5">
                      <div className="relative">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <div className="absolute inset-0 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping opacity-75" />
                      </div>
                      <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-emerald-400">LIVE_FEED</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => fetchActivityLogs()}
                    className="p-1.5 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-110 active:scale-95"
                  >
                    <RefreshCw size={12} className="text-slate-400 hover:text-indigo-400 transition-colors" />
                  </button>
                </div>
              </div>
              
              {/* Content */}
              <div className="flex-grow p-4" style={{ minHeight: '1025px' }}>
                {extendedLogs.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center h-full gap-4 text-center"
                  >
                    <div className="p-5 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl border border-indigo-500/20">
                      <Terminal size={40} className="text-indigo-400/60" />
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-slate-500 font-bold">{">_"} No session logs detected</span>
                    <p className="text-[10px] text-slate-600 font-mono">Awaiting incoming transactions...</p>
                  </motion.div>
                ) : (
                  <div className="h-full flex flex-col">
                    {/* Column headers */}
                    <div className="grid grid-cols-12 gap-3 px-4 py-2.5 border-b border-white/5 text-[10px] font-mono font-black uppercase tracking-[0.15em] text-slate-500 shrink-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent">
                      <div className="col-span-3 flex items-center gap-1">
                        <Users size={8} />
                        USER
                      </div>
                      <div className="col-span-6 flex items-center gap-1">
                        <Activity size={8} />
                        ACTIVITY
                      </div>
                      <div className="col-span-3 text-right flex items-center justify-end gap-1">
                        <Clock size={8} />
                        TIME
                      </div>
                    </div>
                    
                    {/* Scrollable list - ĐÃ XÓA THANH CUỘN NGANG */}
                    <div className="flex-grow overflow-y-auto overflow-x-hidden pr-1 space-y-2 mt-2 custom-scrollbar" style={{ maxHeight: '910px' }}>
                      {extendedLogs.map((log: any, idx: number) => (
                        <motion.div
                          key={`${log.log_id || idx}-${idx}`}
                          initial={{ opacity: 0, x: -20, scale: 0.95 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          transition={{ delay: Math.min(idx * 0.015, 0.5), type: "spring", stiffness: 300 }}
                          whileHover={{ scale: 1.01, x: 4 }}
                          className="group relative cursor-pointer overflow-x-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/0 to-indigo-500/0 group-hover:via-indigo-500/8 rounded-xl transition-all duration-500" />
                          
                          <div className="relative grid grid-cols-12 gap-3 items-center p-3.5 bg-white/[0.02] hover:bg-white/[0.045] rounded-xl border border-white/5 hover:border-indigo-500/20 transition-all duration-300">
                            
                            {/* Avatar + Username */}
                            <div className="col-span-3 flex items-center gap-2.5 min-w-0">
                              <div className="relative shrink-0">
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/50 to-purple-500/50 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <div className={`relative w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold font-mono shrink-0 transition-all duration-300 group-hover:scale-105
                                  ${getStatusColor(log.status || log.activity_type)}`}>
                                  {log.avatar || log.username?.charAt(0).toUpperCase()}
                                </div>
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-[11px] font-bold text-white font-mono group-hover:text-indigo-300 transition-colors truncate">
                                  {log.username}
                                </span>
                                <span className="text-[11px] text-slate-600 font-mono uppercase truncate">
                                  ID: {log.user_id || log.log_id}
                                </span>
                              </div>
                            </div>
                            
                            {/* Activity content */}
                            <div className="col-span-6 min-w-0">
                              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-mono uppercase tracking-wider border border-white/5 whitespace-nowrap">
                                  {log.activity_type?.replace('_', ' ')}
                                </span>
                                {getPremiumStatusBadge(log.status || log.activity_type)}
                              </div>
                              <p className="text-[11px] text-slate-400 font-mono truncate">
                                {log.description || `${log.activity_type} on ${log.target_type} #${log.target_id}`}
                              </p>
                            </div>
                            
                            {/* Time */}
                            <div className="col-span-3 text-right">
                              <div className="flex flex-col items-end">
                                <div className="text-[11px] text-slate-400 font-mono font-bold tabular-nums whitespace-nowrap">
                                  {new Date(log.created_at).toLocaleTimeString('en-US', { 
                                    hour: '2-digit', 
                                    minute: '2-digit',
                                    hour12: true 
                                  })}
                                </div>
                                <div className="text-[11px] text-slate-600 font-mono uppercase tracking-wider whitespace-nowrap">
                                  {new Date(log.created_at).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric' 
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    
                    {/* Footer */}
                    <div className="mt-3 pt-3 border-t border-white/10 flex justify-between items-center px-2">
                      <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500">
                        <div className="flex items-center gap-1">
                          <div className="w-1 h-1 rounded-full bg-emerald-500" />
                          <span>{extendedLogs.length} active sessions</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Zap size={8} />
                          <span>Updated just now</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Activity size={8} />
                          <span>24/h volume: 2,568</span>
                        </div>
                      </div>
                      <button className="text-[10px] font-mono text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">
                        View All <ChevronRight size={8} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* RIGHT COLUMN (4/12) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Time Widget */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="relative bg-gradient-to-br from-[#12121c] to-[#0a0a10] rounded-2xl p-6 border border-white/10 shadow-xl overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/15 to-transparent rounded-full blur-2xl group-hover:from-indigo-500/25 transition-all duration-500" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold uppercase tracking-widest text-[10px] font-mono">
                    <Clock size={11} /> Platform System Time
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                    <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                    UTC+0
                  </div>
                </div>
                <div className="text-5xl font-mono font-black text-white tracking-wider mb-2 tabular-nums">
                  {time.toLocaleTimeString('en-GB', { hour12: false })}
                </div>
                <div className="text-[11px] font-mono text-slate-500 font-bold uppercase tracking-wider flex items-center gap-2">
                  <span>{time.toLocaleDateString('en-US', { weekday: 'long' })}</span>
                  <span className="text-slate-700">&middot;</span>
                  <span>{time.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div className="mt-4 pt-3 border-t border-white/10 flex justify-between text-[10px] font-mono text-slate-500">
                  <span>Uptime: <span className="text-slate-300">{systemStats.uptime}</span></span>
                  <span>Last sync: <span className="text-slate-300">{getTimeAgo(lastSyncTime)}</span></span>
                </div>
              </div>
            </motion.div>

            {/* Oracle Override */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-gradient-to-br from-[#12121c] to-[#0a0a10] rounded-2xl p-6 border border-white/10 shadow-xl"
            >
              <div className="flex items-center gap-2 text-indigo-400 font-bold uppercase tracking-widest text-[10px] mb-4 font-mono">
                <Sparkles size={10} /> Sandbox Oracle Adjuster
              </div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight mb-5">Quick Rate Override</h3>
              
              <div className="mb-5 p-3 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-xl border border-indigo-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono uppercase">Current Rate</span>
                    <div className="text-2xl font-mono font-bold text-white tracking-tight">{currentRateInfo?.price || '1.08542'}</div>
                    <div className="text-[11px] text-slate-600 font-mono mt-1">Last updated: {currentRateInfo?.lastUpdated || '2 mins ago'}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 font-mono uppercase">Change (24h)</span>
                    <div className={`text-sm font-bold flex items-center gap-1 ${currentRateInfo?.trend === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {currentRateInfo?.trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {currentRateInfo?.change || '+0.23%'}
                    </div>
                    <div className="text-[11px] text-slate-600 font-mono mt-1">Volume: {currentRateInfo?.volume || '$2.4B'}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono flex items-center gap-2">
                    <Navigation size={8} /> Target Core Asset
                  </label>
                  <select 
                    value={oraclePair}
                    onChange={(e) => setOraclePair(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-[11px] font-bold text-slate-300 outline-none appearance-none cursor-pointer hover:border-indigo-500/30 transition-all focus:border-indigo-500/50"
                  >
                    <option value="EUR/USD">EUR/USD • Euro / US Dollar</option>
                    <option value="GBP/USD">GBP/USD • British Pound / US Dollar</option>
                    <option value="USD/JPY">USD/JPY • US Dollar / Japanese Yen</option>
                    <option value="BTC/USD">BTC/USD • Bitcoin / US Dollar</option>
                    <option value="ETH/USD">ETH/USD • Ethereum / US Dollar</option>
                    <option value="XAU/USD">XAU/USD • Gold / US Dollar</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono flex items-center gap-2">
                    <Gauge size={8} /> New Exchange Rate
                  </label>
                  <input 
                    type="text" 
                    value={oracleRate}
                    onChange={(e) => setOracleRate(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono font-bold text-white outline-none focus:border-indigo-500/50 transition-all" 
                    placeholder="Enter new rate..."
                  />
                  <p className="text-[11px] text-slate-600 font-mono">Emergency override - applies immediately to all users</p>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleOracleOverride}
                  disabled={isOverriding || !oracleRate}
                  className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-black py-3.5 rounded-xl text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isOverriding ? (
                    <>
                      <Loader2 size={12} className="animate-spin" /> Overriding...
                    </>
                  ) : (
                    <>
                      Override Exchange Price <ArrowRight size={12} />
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>

            {/* Notice Broadcasting */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-[#12121c] to-[#0a0a10] rounded-2xl p-6 border border-white/10 shadow-xl"
            >
              <div className="flex items-center gap-2 text-indigo-400 font-bold uppercase tracking-widest text-[10px] mb-4 font-mono">
                <Send size={10} /> Telemetry Notifications
              </div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight mb-5">Notice Broadcasting</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono">Notice Title (Optional)</label>
                  <input
                    type="text"
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
                    placeholder="Enter title..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-[11px] font-medium text-slate-300 outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-600"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-mono">Public Notice Content</label>
                  <textarea
                    value={broadcastContent}
                    onChange={(e) => setBroadcastContent(e.target.value)}
                    placeholder="Enter broadcast text for global admin panel..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-[11px] font-medium text-slate-300 outline-none h-28 resize-none focus:border-indigo-500/50 transition-all placeholder:text-slate-600"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePublishBroadcast}
                  disabled={isPublishing || !broadcastContent.trim()}
                  className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-black py-3.5 rounded-xl text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/30"
                >
                  {isPublishing ? (
                    <>
                      <Loader2 size={10} className="animate-spin" /> Publishing...
                    </>
                  ) : (
                    <>
                      Publish Broadcast <Send size={10} />
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>

            {/* Gateway Infrastructure */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-gradient-to-br from-[#12121c] to-[#0a0a10] rounded-2xl p-6 border border-white/10 shadow-xl"
            >
              <div className="flex items-center gap-2 text-indigo-400 font-bold uppercase tracking-widest text-[10px] mb-5 font-mono">
                <Server size={10} /> Secure Gateway Infrastructure
              </div>
              <div className="space-y-4 font-mono">
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-slate-500 uppercase flex items-center gap-2 text-[11px] font-bold">
                    <Database size={10} /> Database Status
                  </span>
                  <span className={`${systemStats.db === 'ONLINE' ? 'text-emerald-400' : 'text-red-400'} flex items-center gap-1.5 uppercase tracking-tighter text-[10px]`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${systemStats.db === 'ONLINE' ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`} /> {systemStats.db}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-slate-500 uppercase flex items-center gap-2 text-[11px] font-bold">
                    <Zap size={10} /> Response Latency
                  </span>
                  <span className="text-indigo-400 font-black text-[11px] tabular-nums">{systemStats.latency.toFixed(0)}ms <span className="text-[10px] text-slate-500">avg</span></span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-slate-500 uppercase flex items-center gap-2 text-[11px] font-bold">
                    <Wifi size={10} /> Network Throughput
                  </span>
                  <span className="text-cyan-400 font-black text-[11px] tabular-nums">{systemStats.network_throughput} <span className="text-[10px] text-slate-500">Mbps</span></span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-slate-500 uppercase flex items-center gap-2 text-[11px] font-bold">
                    <HardDrive size={10} /> Storage Usage
                  </span>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-gradient-to-r rounded-full transition-all duration-500 ${
                            systemStats.disk.usage_percent > 80 ? 'from-red-500 to-red-400' :
                            systemStats.disk.usage_percent > 60 ? 'from-amber-500 to-amber-400' :
                            'from-emerald-500 to-emerald-400'
                          }`} 
                          style={{ width: `${systemStats.disk.usage_percent}%` }}
                        />
                      </div>
                      <span className="text-slate-400 text-[11px] font-black tabular-nums">{systemStats.disk.usage_percent.toFixed(0)}%</span>
                    </div>
                    <span className="text-[11px] text-slate-600">
                      {(systemStats.disk.used / (1024 ** 3)).toFixed(1)}GB / {(systemStats.disk.total / (1024 ** 3)).toFixed(1)}GB
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-500 uppercase flex items-center gap-2 text-[11px] font-bold">
                    <Cpu size={10} /> CPU Utilization
                  </span>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-gradient-to-r rounded-full transition-all duration-500 ${
                            systemStats.cpu > 80 ? 'from-red-500 to-red-400' :
                            systemStats.cpu > 60 ? 'from-amber-500 to-amber-400' :
                            'from-emerald-500 to-emerald-400'
                          }`} 
                          style={{ width: `${systemStats.cpu}%` }}
                        />
                      </div>
                      <span className="text-slate-400 text-[11px] font-black tabular-nums">{systemStats.cpu.toFixed(0)}%</span>
                    </div>
                    <div className="flex gap-2 text-[11px] text-slate-600">
                      <span>Core 1: {systemStats.cpu_cores.core_1.toFixed(0)}%</span>
                      <span>Core 2: {systemStats.cpu_cores.core_2.toFixed(0)}%</span>
                      <span>Core 3: {systemStats.cpu_cores.core_3.toFixed(0)}%</span>
                      <span>Core 4: {systemStats.cpu_cores.core_4.toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-600 uppercase tracking-wider">System Health</span>
                <div className="flex items-center gap-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${systemStats.system_health > 90 ? 'bg-emerald-500' : systemStats.system_health > 70 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                  <div className={`w-1.5 h-1.5 rounded-full ${systemStats.system_health > 80 ? 'bg-emerald-500' : systemStats.system_health > 60 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                  <div className={`w-1.5 h-1.5 rounded-full ${systemStats.system_health > 70 ? 'bg-emerald-500' : systemStats.system_health > 50 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                  <div className={`w-1.5 h-1.5 rounded-full ${systemStats.system_health > 60 ? 'bg-emerald-500' : systemStats.system_health > 40 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                  <div className={`w-1.5 h-1.5 rounded-full ${systemStats.system_health > 50 ? 'bg-emerald-500' : systemStats.system_health > 30 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                  <span className="text-[10px] text-slate-500 ml-1 font-mono">{systemStats.system_health.toFixed(1)}%</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between text-[10px] font-mono mb-3">
                  <span className="text-slate-500 uppercase tracking-wider">Security Status</span>
                  <span className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${systemStats.security.firewall === 'active' && systemStats.security.ddos_protection === 'enabled' && systemStats.security.ssl === 'valid' ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'}`}>
                    <Shield size={10} /> {systemStats.security.firewall === 'active' && systemStats.security.ddos_protection === 'enabled' && systemStats.security.ssl === 'valid' ? 'PROTECTED' : 'ATTENTION'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className={`flex flex-col items-center gap-1 py-2 rounded-lg border text-[10px] font-mono ${systemStats.security.firewall === 'active' ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400' : 'border-red-500/20 bg-red-500/5 text-red-400'}`}>
                    <Lock size={12} />
                    <span className="font-bold">{systemStats.security.firewall.toUpperCase()}</span>
                    <span className="text-[9px] text-slate-500 uppercase">Firewall</span>
                  </div>
                  <div className={`flex flex-col items-center gap-1 py-2 rounded-lg border text-[10px] font-mono ${systemStats.security.ddos_protection === 'enabled' ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400' : 'border-red-500/20 bg-red-500/5 text-red-400'}`}>
                    <ShieldCheck size={12} />
                    <span className="font-bold">{systemStats.security.ddos_protection.toUpperCase()}</span>
                    <span className="text-[9px] text-slate-500 uppercase">DDoS</span>
                  </div>
                  <div className={`flex flex-col items-center gap-1 py-2 rounded-lg border text-[10px] font-mono ${systemStats.security.ssl === 'valid' ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400' : 'border-red-500/20 bg-red-500/5 text-red-400'}`}>
                    <Key size={12} />
                    <span className="font-bold">{systemStats.security.ssl.toUpperCase()}</span>
                    <span className="text-[9px] text-slate-500 uppercase">SSL</span>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </main>
    </div>
  );
}

// Helper functions
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds}s ago`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  }
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    success: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    warning: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    info: 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30',
    RATE_UPDATE: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    COMMENT: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
    SECURITY: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    TRADE_EXEC: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    SYNC: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
    ALERT: 'bg-red-500/20 text-red-400 border border-red-500/30',
  };
  return colors[status] || colors.info;
}

function getPremiumStatusBadge(status: string) {
  const badges: Record<string, JSX.Element> = {
    success: (
      <span className="relative inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded-full bg-gradient-to-r from-emerald-500/20 to-emerald-600/10 text-emerald-300 font-mono uppercase tracking-wider border border-emerald-500/30">
        <div className="w-1 h-1 rounded-full bg-emerald-400" />
        SUCCESS
      </span>
    ),
    warning: (
      <span className="relative inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-amber-600/10 text-amber-300 font-mono uppercase tracking-wider border border-amber-500/30">
        <AlertCircle size={6} />
        WARNING
      </span>
    ),
    info: (
      <span className="relative inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded-full bg-gradient-to-r from-indigo-500/20 to-indigo-600/10 text-indigo-300 font-mono uppercase tracking-wider border border-indigo-500/30">
        <Activity size={6} />
        INFO
      </span>
    ),
  };
  return badges[status] || badges.info;
}

function StatCard({ label, value, sub, icon, color, trend, onClick }: any) {
  const colors: any = {
    indigo: { bg: "from-indigo-500/20 to-indigo-600/5", text: "text-indigo-400", border: "border-indigo-500/30", glow: "bg-indigo-500/20" },
    emerald: { bg: "from-emerald-500/20 to-emerald-600/5", text: "text-emerald-400", border: "border-emerald-500/30", glow: "bg-emerald-500/20" },
    sky: { bg: "from-sky-500/20 to-sky-600/5", text: "text-sky-400", border: "border-sky-500/30", glow: "bg-sky-500/20" },
    amber: { bg: "from-amber-500/20 to-amber-600/5", text: "text-amber-400", border: "border-amber-500/30", glow: "bg-amber-500/20" },
  };

  const isPositive = trend?.startsWith('+');

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="relative group cursor-pointer"
    >
      <div className={`absolute -inset-px bg-gradient-to-br ${colors[color].bg} rounded-2xl opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-500`} />
      <div className="relative bg-gradient-to-br from-[#12121c] to-[#0c0c12] p-5 rounded-2xl border border-white/10 group-hover:border-white/15 shadow-xl overflow-hidden transition-colors duration-300">
        <div className={`pointer-events-none absolute -top-10 -right-10 w-28 h-28 ${colors[color].glow} rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

        <div className="relative flex justify-between items-start mb-5">
          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${colors[color].bg} border ${colors[color].border}`}>
            {icon}
          </div>
          {trend && (
            <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-mono font-bold ${isPositive ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'}`}>
              {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {trend}
            </span>
          )}
        </div>
        <div className="relative">
          <div className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-[0.2em] mb-1.5">{label}</div>
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-white tracking-tighter tabular-nums">{value}</span>
              <span className={`text-[10px] font-black uppercase tracking-widest ${colors[color].text}`}>{sub}</span>
            </div>
            <ChevronRight size={14} className="text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all shrink-0" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}