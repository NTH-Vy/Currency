"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import {
  User,
  Lock,
  History,
  MessageSquare,
  MessageCircle,
  ShieldCheck,
  LogOut,
  ArrowRightLeft,
  ExternalLink,
  RefreshCw,
  Loader2,
  Mail,
  BadgeCheck,
  Database,
  Settings,
  Bell,
  CreditCard,
  Fingerprint,
  Globe,
  Zap,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Copy,
  Gift,
  Award,
  Clock,
  Calendar,
  FileText,
  Star,
  TrendingUp,
  Wallet,
  Smartphone,
  Activity,
  ThumbsUp,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MessageCircleMore,
  Reply,
  Quote
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type AccountUser = {
  user_id: number;
  username: string;
  email: string;
  role: string;
  preferred_currency: string | null;
  is_active: number;
};

const API_BASE = "/api/laravel";

interface ConversionHistoryItem {
  history_id: number;
  from_currency: string;
  to_currency: string;
  amount_input: number;
  amount_output: number;
  created_at: string;
}

interface UserComment {
  comment_id: number;
  content: string;
  rating: number;
  created_at: string;
  news: {
    news_id: number;
    title: string;
  };
  user: {
    user_id: number;
    username: string;
  };
  replies?: UserComment[];
  parent_comment?: {
    comment_id: number;
    content: string;
    user?: {
      user_id: number;
      username: string;
    };
  };
}

interface ReplyToUser {
  comment_id: number;
  content: string;
  rating: number;
  created_at: string;
  news: {
    news_id: number;
    title: string;
  };
  user: {
    user_id: number;
    username: string;
  };
  parent_comment?: {
    comment_id: number;
    content: string;
  };
}

interface SystemActivityItem {
  id: number;
  type: 'conversion' | 'comment' | 'reply' | 'favorite' | 'like';
  action: string;
  title: string;
  details: string;
  created_at: string;
}

// Combined activity item type
type ActivityItem = {
  id: number;
  type: 'comment' | 'reply';
  content: string;
  rating: number;
  created_at: string;
  news_title: string;
  news_id: number;
  author: string;
  parent_content?: string;
};

export default function UserDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser] = useState<AccountUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: string; visible: boolean }>({ message: '', type: '', visible: false });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showMfaModal, setShowMfaModal] = useState(false);
  const [itemsPerPage] = useState(10);
  const [userComments, setUserComments] = useState<UserComment[]>([]);
  const [repliesToUser, setRepliesToUser] = useState<ReplyToUser[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [activityList, setActivityList] = useState<ActivityItem[]>([]);
  const [activityTotal, setActivityTotal] = useState(0);
  const [activityCurrentPage, setActivityCurrentPage] = useState(1);
  const [activityLoading, setActivityLoading] = useState(false);
  const [systemActivity, setSystemActivity] = useState<SystemActivityItem[]>([]);
  const [systemTotal, setSystemTotal] = useState(0);
  const [systemCurrentPage, setSystemCurrentPage] = useState(1);
  const [systemLoading, setSystemLoading] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }

    const loadProfile = async () => {
      try {
        const res = await fetch(`${API_BASE}/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.user) {
          setUser(data.user);
          localStorage.setItem("user", JSON.stringify(data.user));
          window.dispatchEvent(new Event("auth-changed"));
        } else {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.replace("/login");
        }
      } catch {
        const stored = localStorage.getItem("user");
        if (stored) {
          try { setUser(JSON.parse(stored)); } catch { router.replace("/login"); }
        } else {
          router.replace("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("auth-changed"));
    router.push("/login");
  };

  const fetchUserComments = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setCommentsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/user/comments`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });
      const data = await res.json();
      if (!res.ok) {
        console.error("Fetch user comments failed:", data);
        setUserComments([]);
        setRepliesToUser([]);
        setActivityList([]);
        return;
      }
      const comments = data.user_comments || [];
      const replies = data.replies_to_user || [];
      setUserComments(comments);
      setRepliesToUser(replies);
      
      // Combine both into a single activity list
      const combined: ActivityItem[] = [
        ...comments.map((c: UserComment) => ({
          id: c.comment_id,
          type: 'comment' as const,
          content: c.content,
          rating: c.rating,
          created_at: c.created_at,
          news_title: c.news?.title || 'Unknown News',
          news_id: c.news?.news_id,
          author: c.user?.username || 'You',
          parent_content: c.parent_comment?.content
        })),
        ...replies.map((r: ReplyToUser) => ({
          id: r.comment_id,
          type: 'reply' as const,
          content: r.content,
          rating: r.rating,
          created_at: r.created_at,
          news_title: r.news?.title || 'Unknown News',
          news_id: r.news?.news_id,
          author: r.user?.username || 'Unknown User',
          parent_content: r.parent_comment?.content
        }))
      ];
      
      // Sort by date (newest first)
      combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setActivityList(combined);
      setActivityTotal(combined.length);
      setActivityCurrentPage(1);
    } catch (error) {
      console.error("Fetch user comments error:", error);
      setUserComments([]);
      setRepliesToUser([]);
      setActivityList([]);
    } finally {
      setCommentsLoading(false);
    }
  }, []);

  const fetchSystemActivity = useCallback(async (page = 1) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setSystemLoading(true);
    try {
      const res = await fetch(`${API_BASE}/user/activity?page=${page}&per_page=${itemsPerPage}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });
      const data = await res.json();

      if (res.ok && Array.isArray(data.activities)) {
        setSystemActivity(data.activities);
        setSystemTotal(data.activities.length);
      } else {
        console.error("Fetch user activity failed:", data);
        setSystemActivity([]);
        setSystemTotal(0);
      }
    } catch (error) {
      console.error("Fetch user activity error:", error);
      setSystemActivity([]);
      setSystemTotal(0);
    } finally {
      setSystemLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && activeTab === "history") {
      const loadActivity = async () => {
        await fetchSystemActivity(systemCurrentPage);
      };
      loadActivity();
    }
  }, [user, activeTab, systemCurrentPage, fetchSystemActivity]);

  useEffect(() => {
    if (user && activeTab === "comments") {
      const loadComments = async () => {
        await fetchUserComments();
      };
      loadComments();
    }
  }, [user, activeTab, fetchUserComments]);

  const handleDeleteHistoryItem = async (historyId: number) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/history/${historyId}`, {
        method: 'DELETE',
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });
      const data = await res.json();
      if (data.success) {
        setConversionHistory(prev => prev.filter(item => item.history_id !== historyId));
        showToast("History item deleted successfully", "success");
      } else {
        showToast("Failed to delete history item", "error");
      }
    } catch (error) {
      console.error("Delete history item error:", error);
      showToast("Failed to delete history item", "error");
    }
  };

  const handleClearAllHistory = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    if (!confirm("Are you sure you want to clear all conversion history? This action cannot be undone.")) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/history`, {
        method: 'DELETE',
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });
      const data = await res.json();
      if (data.success) {
        setConversionHistory([]);
        setCurrentPage(1);
        showToast("All history cleared successfully", "success");
      } else {
        showToast("Failed to clear history", "error");
      }
    } catch (error) {
      console.error("Clear history error:", error);
      showToast("Failed to clear history", "error");
    }
  };

  const handleDeleteActivity = async (item: ActivityItem) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    if (!confirm(`Are you sure you want to delete this ${item.type}? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/comments/${item.id}`, {
        method: 'DELETE',
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });
      const data = await res.json();
      if (data.success) {
        showToast(`${item.type === 'comment' ? 'Comment' : 'Reply'} deleted successfully`, "success");
        // Refresh the list
        fetchUserComments();
      } else {
        showToast("Failed to delete", "error");
      }
    } catch (error) {
      console.error("Delete activity error:", error);
      showToast("Failed to delete", "error");
    }
  };

  // Paginate activity list
  const activityTotalPages = Math.max(1, Math.ceil(activityTotal / itemsPerPage));
  const paginatedActivity = activityList.slice(
    (activityCurrentPage - 1) * itemsPerPage,
    activityCurrentPage * itemsPerPage
  );

  const handleCopyId = () => {
    if (user) {
      navigator.clipboard.writeText(`#${user.user_id}`);
      showToast("Operator ID copied to clipboard!", "success");
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#02020a] via-[#050510] to-[#02020a] flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full" />
          <Loader2 className="animate-spin text-indigo-500 relative z-10" size={40} />
        </div>
        <span className="text-[10px] uppercase tracking-[0.3em] text-indigo-400 font-bold font-mono animate-pulse">
          Synchronizing Records...
        </span>
      </div>
    );
  }

  if (!user) return null;

  const tabs = [
    { id: "profile", label: "Identity & Security", icon: <User size={14} /> },
    { id: "history", label: "Trade Audit", icon: <History size={14} /> },
    { id: "comments", label: "Intelligence Activity", icon: <MessageSquare size={14} /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#02020a] via-[#050510] to-[#02020a] text-slate-100 selection:bg-indigo-500/30 font-sans overflow-x-hidden">
      <Header />
      
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-indigo-600/8 rounded-full blur-[150px]" />
        <div className="absolute bottom-[5%] left-[-15%] w-[600px] h-[600px] bg-purple-600/6 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] left-[30%] w-[500px] h-[500px] bg-cyan-600/4 rounded-full blur-[100px]" />
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast.visible && (
          <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 400 }}
            className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl border backdrop-blur-xl flex items-center gap-3 shadow-2xl ${
              toast.type === 'success' ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200' :
              toast.type === 'error' ? 'bg-red-500/15 border-red-500/40 text-red-200' :
              'bg-indigo-500/15 border-indigo-500/40 text-indigo-200'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 size={16} />}
            {toast.type === 'error' && <AlertCircle size={16} />}
            {toast.type === 'info' && <Sparkles size={16} />}
            <p className="text-sm font-medium">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
      
      <main className="pt-32 pb-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col gap-10 relative z-10">
          
          {/* Dashboard Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-8 border-b border-white/10"
          >
            <div className="flex flex-col gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full w-fit">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-emerald-400 font-mono">
                  Secure Terminal Session Active
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight uppercase leading-none">
                Control <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-sky-400">Center</span>
              </h1>
              <p className="text-slate-400 text-sm max-w-lg">
                Manage your identity, review transaction logs, and monitor network activity.
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end gap-1 font-mono text-right">
                <span className="text-white text-sm font-black uppercase tracking-wide">{user.username}</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[7px] text-emerald-400 font-black uppercase tracking-widest">Remote Node Active</span>
                </div>
              </div>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition duration-500" />
                <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-[#191929] to-[#11111a] border border-white/10 flex items-center justify-center text-indigo-400 font-mono font-black text-xl uppercase shadow-inner">
                  {user.username[0]}
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-12 gap-8">
            
            {/* Sidebar Navigation */}
            <motion.aside 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-3"
            >
              <div className="flex flex-col gap-1.5 p-2 bg-gradient-to-br from-[#11111a] to-[#0c0c12] border border-white/10 rounded-2xl sticky top-28 shadow-xl">
                {tabs.map((tab) => (
                  <motion.button
                    key={tab.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-bold font-mono uppercase tracking-widest transition-all cursor-pointer ${
                      activeTab === tab.id 
                      ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-600/30" 
                      : "text-slate-500 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </motion.button>
                ))}
                <div className="h-px bg-white/10 my-2 mx-3" />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-bold font-mono text-rose-500 uppercase tracking-widest hover:bg-rose-500/10 transition-all w-full text-left cursor-pointer"
                >
                  <LogOut size={14} />
                  Terminate Session
                </motion.button>
              </div>
            </motion.aside>

            {/* Main Content Area */}
            <div className="lg:col-span-9">
              <AnimatePresence mode="wait">
                {activeTab === "profile" && (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col gap-6"
                  >
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Identity Card */}
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gradient-to-br from-[#11111a] to-[#0c0c12] p-6 rounded-2xl border border-white/10 shadow-xl relative overflow-hidden group"
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl" />
                        <div className="relative z-10 flex flex-col gap-5">
                          <h3 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-white/10">
                            <User className="text-indigo-400" size={14} />
                            Identity Matrix
                          </h3>
                          <div className="flex flex-col gap-3">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[7px] font-mono font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                                <Database size={8} /> Operator ID
                              </label>
                              <div className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-white/10 hover:border-indigo-500/30 transition-all group">
                                <span className="text-indigo-300 font-mono text-sm font-black tracking-wider">#{user.user_id}</span>
                                <button 
                                  onClick={handleCopyId}
                                  className="p-1 hover:bg-indigo-500/20 rounded transition-all opacity-0 group-hover:opacity-100"
                                >
                                  <Copy size={12} className="text-slate-400 hover:text-indigo-400" />
                                </button>
                              </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[7px] font-mono font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                                <User size={8} /> Unique Username
                              </label>
                              <div className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-white/10">
                                <span className="text-white font-mono text-sm font-bold">{user.username}</span>
                                <BadgeCheck size={14} className="text-indigo-400" />
                              </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[7px] font-mono font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                                <Mail size={8} /> Email Node
                              </label>
                              <div className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-white/10">
                                <span className="text-white font-mono text-xs truncate">{user.email}</span>
                                <div className="flex items-center gap-1">
                                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  <span className="text-[6px] text-emerald-400 font-mono">VERIFIED</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>

                      {/* Security Card */}
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="bg-gradient-to-br from-[#11111a] to-[#0c0c12] p-6 rounded-2xl border border-white/10 shadow-xl relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl" />
                        <div className="relative z-10 flex flex-col gap-5">
                          <h3 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-white/10">
                            <Lock className="text-indigo-400" size={14} />
                            Terminal Security
                          </h3>
                          <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2 p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                              <ShieldCheck size={14} className="text-emerald-400" />
                              <span className="text-[8px] text-slate-300 font-mono">AES-256 Encryption Active</span>
                            </div>
                            <p className="text-[9px] text-slate-500 leading-relaxed font-mono">
                              Key rotation is highly recommended every 180 cycles for maximum sandbox security.
                            </p>
                            <motion.button 
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[8px] font-black font-mono text-slate-300 uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                            >
                              <RefreshCw size={10} /> Rotate Access Key
                            </motion.button>
                            <motion.button 
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="w-full py-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-[8px] font-black font-mono text-emerald-400 uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                            >
                              <Fingerprint size={10} /> Enable MFA
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    </div>

                    {/* Stats Widget */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-gradient-to-br from-[#11111a] to-[#0c0c12] p-6 rounded-2xl border border-white/10 shadow-xl"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex flex-col gap-2 p-4 bg-black/30 rounded-xl border border-white/5">
                          <span className="text-[7px] font-mono font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                            <Award size={8} /> Role Tier
                          </span>
                          <span className="text-slate-200 font-mono font-bold text-xs uppercase tracking-wide">{user.role}</span>
                        </div>
                        <div className="flex flex-col gap-2 p-4 bg-black/30 rounded-xl border border-white/5">
                          <span className="text-[7px] font-mono font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                            <ShieldCheck size={8} /> Account Status
                          </span>
                          <span className={`font-mono font-black text-xs uppercase flex items-center gap-1.5 ${user.is_active ? "text-emerald-400" : "text-rose-400"}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${user.is_active ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                            {user.is_active ? "Active" : "Disabled"}
                          </span>
                        </div>
                        <div className="flex flex-col gap-2 p-4 bg-black/30 rounded-xl border border-white/5">
                          <span className="text-[7px] font-mono font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                            <Wallet size={8} /> Preferred Currency
                          </span>
                          <span className="text-2xl font-black font-mono text-indigo-400 uppercase">
                            {user.preferred_currency || "—"}
                          </span>
                          <p className="text-[7px] text-slate-500 font-mono">
                            {user.preferred_currency
                              ? "Default target for terminal conversions"
                              : "No currency preference initialized"}
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Activity Summary */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 }}
                      className="bg-gradient-to-br from-[#11111a] to-[#0c0c12] p-6 rounded-2xl border border-white/10 shadow-xl"
                    >
                      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
                        <Activity size={12} className="text-indigo-400" />
                        <h3 className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-widest">Recent Activity</h3>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between py-2 border-b border-white/5">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span className="text-[9px] font-mono text-slate-400">Last Login</span>
                          </div>
                          <span className="text-[9px] font-mono text-slate-300">Today, 09:42 AM</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-white/5">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            <span className="text-[9px] font-mono text-slate-400">Total Conversions</span>
                          </div>
                          <span className="text-[9px] font-mono text-slate-300">24 transactions</span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                            <span className="text-[9px] font-mono text-slate-400">API Calls (24h)</span>
                          </div>
                          <span className="text-[9px] font-mono text-slate-300">143 requests</span>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}

                {activeTab === "history" && (
                  <motion.div
                    key="history"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="bg-gradient-to-br from-[#11111a] to-[#0c0c12] rounded-2xl overflow-hidden border border-white/10 shadow-xl"
                  >
                    <div className="px-6 py-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <History size={14} className="text-indigo-400" />
                        <h3 className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-widest">System Transaction Log</h3>
                        <span className="text-[8px] font-mono text-slate-500 bg-black/30 px-2 py-0.5 rounded-full">{systemTotal}</span>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left font-mono">
                        <thead>
                          <tr className="border-b border-white/10 bg-black/30">
                            <th className="px-6 py-4 text-[8px] font-bold text-slate-500 uppercase tracking-wider">Time</th>
                            <th className="px-6 py-4 text-[8px] font-bold text-slate-500 uppercase tracking-wider">Action</th>
                            <th className="px-6 py-4 text-[8px] font-bold text-slate-500 uppercase tracking-wider">Target</th>
                            <th className="px-6 py-4 text-[8px] font-bold text-slate-500 uppercase tracking-wider">Details</th>
                            <th className="px-6 py-4 text-[8px] font-bold text-slate-500 uppercase tracking-wider text-right">Timestamp</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {systemLoading ? (
                            <tr>
                              <td colSpan={5} className="px-6 py-12 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <Loader2 className="animate-spin text-indigo-500" size={16} />
                                  <span className="text-[9px] text-slate-500 font-mono">Loading transaction log...</span>
                                </div>
                              </td>
                            </tr>
                          ) : systemActivity.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-6 py-12 text-center">
                                <div className="flex flex-col items-center gap-2">
                                  <MessageCircleMore size={24} className="text-slate-600" />
                                  <span className="text-[9px] text-slate-500 font-mono">No activity found</span>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            systemActivity.slice((systemCurrentPage - 1) * itemsPerPage, systemCurrentPage * itemsPerPage).map((item, i) => {
                              const formattedDate = formatDate(item.created_at);
                              return (
                                <motion.tr
                                  key={`${item.type}-${item.id}`}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.03 }}
                                  className="hover:bg-white/5 transition-all"
                                >
                                  <td className="px-6 py-4">
                                    <span className="text-[9px] text-slate-300 font-mono">{formattedDate}</span>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-100">
                                      {item.action}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className="text-slate-200 text-[10px] font-bold">{item.title}</span>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className="text-slate-400 text-[9px] font-mono line-clamp-2">{item.details}</span>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    <span className="text-[9px] text-slate-500 font-mono">{formattedDate}</span>
                                  </td>
                                </motion.tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                    {systemActivity.length > 0 && (
                      <div className="px-6 py-4 border-t border-white/10 bg-black/20 flex justify-between items-center">
                        <span className="text-[7px] font-mono text-slate-500">
                          Showing {((systemCurrentPage - 1) * itemsPerPage) + 1} to {Math.min(systemCurrentPage * itemsPerPage, systemTotal)} of {systemTotal} activities
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSystemCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={systemCurrentPage === 1}
                            className="text-[8px] font-mono px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1"
                          >
                            <ChevronLeft size={10} />
                            Prev
                          </button>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(Math.max(1, Math.ceil(systemTotal / itemsPerPage)), 5) }, (_, i) => {
                              const pageNum = Math.min(Math.max(1, systemCurrentPage - 2 + i), Math.ceil(systemTotal / itemsPerPage));
                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => setSystemCurrentPage(pageNum)}
                                  className={`w-6 h-6 text-[8px] font-mono rounded-lg transition-all ${
                                    systemCurrentPage === pageNum
                                      ? 'bg-indigo-500 text-white'
                                      : 'border border-white/10 hover:bg-white/5 text-slate-400'
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              );
                            })}
                          </div>
                          <button
                            onClick={() => setSystemCurrentPage(prev => Math.min(Math.ceil(systemTotal / itemsPerPage), prev + 1))}
                            disabled={systemCurrentPage === Math.ceil(systemTotal / itemsPerPage)}
                            className="text-[8px] font-mono px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1"
                          >
                            Next
                            <ChevronRight size={10} />
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === "comments" && (
                  <motion.div
                    key="comments"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="bg-gradient-to-br from-[#11111a] to-[#0c0c12] rounded-2xl overflow-hidden border border-white/10 shadow-xl"
                  >
                    <div className="px-6 py-4 border-b border-white/10 bg-white/5">
                      <div className="flex items-center gap-2">
                        <MessageSquare size={14} className="text-indigo-400" />
                        <h3 className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-widest">Intelligence Activity Log</h3>
                        <span className="text-[8px] font-mono text-slate-500 bg-black/30 px-2 py-0.5 rounded-full">{activityTotal}</span>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left font-mono">
                        <thead>
                          <tr className="border-b border-white/10 bg-black/30">
                            <th className="px-6 py-4 text-[8px] font-bold text-slate-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-4 text-[8px] font-bold text-slate-500 uppercase tracking-wider">News Article</th>
                            <th className="px-6 py-4 text-[8px] font-bold text-slate-500 uppercase tracking-wider">Content</th>
                            <th className="px-6 py-4 text-[8px] font-bold text-slate-500 uppercase tracking-wider">Rating</th>
                            <th className="px-6 py-4 text-[8px] font-bold text-slate-500 uppercase tracking-wider text-right">Timestamp</th>
                            <th className="px-6 py-4 text-[8px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {commentsLoading || activityLoading ? (
                            <tr>
                              <td colSpan={6} className="px-6 py-12 text-center">
                                <div className="flex items-center justify-center gap-3">
                                  <Loader2 className="animate-spin text-indigo-500" size={20} />
                                  <span className="text-[9px] text-slate-500 font-mono">Loading intelligence data...</span>
                                </div>
                              </td>
                            </tr>
                          ) : paginatedActivity.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="px-6 py-12 text-center">
                                <div className="flex flex-col items-center gap-2">
                                  <MessageCircleMore size={24} className="text-slate-600" />
                                  <span className="text-[9px] text-slate-500 font-mono">No activity found</span>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            paginatedActivity.map((item, i) => {
                              const formattedDate = formatDate(item.created_at);
                              const truncatedContent = item.content.length > 60 
                                ? item.content.substring(0, 60) + '...' 
                                : item.content;

                              return (
                                <motion.tr 
                                  key={`${item.type}-${item.id}`}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.03 }}
                                  className="hover:bg-white/5 transition-all group"
                                >
                                  <td className="px-6 py-4">
                                    <div className={`flex items-center gap-1.5 text-[7px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border w-fit ${
                                      item.type === 'comment' 
                                        ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                                        : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                    }`}>
                                      {item.type === 'comment' ? (
                                        <MessageSquare size={8} />
                                      ) : (
                                        <Reply size={8} />
                                      )}
                                      {item.type === 'comment' ? 'Comment' : 'Reply'}
                                    </div>
                                   </td>
                                  <td className="px-6 py-4">
                                    <div className="flex flex-col gap-0.5 max-w-[200px]">
                                      <a 
                                        href={`/news/${item.news_id}`}
                                        className="text-slate-200 font-bold text-[9px] hover:text-indigo-400 transition-colors line-clamp-2 truncate"
                                      >
                                        {item.news_title}
                                      </a>
                                      <span className="text-[6px] text-slate-500 font-mono uppercase tracking-wider">
                                        by {item.author}
                                      </span>
                                    </div>
                                   </td>
                                  <td className="px-6 py-4">
                                    <div className="relative group/tooltip">
                                      <p className="text-slate-300 text-[10px] leading-relaxed max-w-[280px] line-clamp-2 font-sans">
                                        &ldquo;{truncatedContent}&rdquo;
                                      </p>
                                      {item.content.length > 60 && (
                                        <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-black/90 backdrop-blur-md rounded-lg border border-white/10 opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-300 z-10 w-80 pointer-events-none">
                                          <p className="text-slate-300 text-[10px] leading-relaxed font-sans">
                                            {item.content}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                    {item.parent_content && (
                                      <div className="mt-1 flex items-start gap-1 text-[6px] text-slate-500">
                                        <Quote size={8} className="shrink-0 mt-0.5" />
                                        <span className="line-clamp-1">Replying to: &ldquo;{item.parent_content.substring(0, 40)}&rdquo;</span>
                                      </div>
                                    )}
                                   </td>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-0.5">
                                      {[...Array(5)].map((_, idx) => (
                                        <Star 
                                          key={idx} 
                                          size={10} 
                                          className={idx < item.rating ? "text-yellow-500 fill-yellow-500" : "text-slate-600"}
                                        />
                                      ))}
                                    </div>
                                   </td>
                                  <td className="px-6 py-4 text-right">
                                    <span className="text-slate-100 font-bold text-[9px]">{formattedDate}</span>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-3">
                                      <a 
                                        href={`/news/${item.news_id}`}
                                        className="p-2 hover:bg-indigo-500/20 rounded-lg transition-all text-indigo-400 hover:text-white"
                                        title="View thread"
                                      >
                                        <ExternalLink size={14} />
                                      </a>
                                      <button
                                        onClick={() => handleDeleteActivity(item)}
                                        className="p-2 hover:bg-rose-500/20 rounded-lg transition-all text-rose-400 hover:text-rose-300 opacity-0 group-hover:opacity-100"
                                        title={`Delete this ${item.type}`}
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                   </td>
                                </motion.tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>

                    {activityTotal > 0 && (
                      <div className="px-6 py-4 border-t border-white/10 bg-black/20 flex justify-between items-center">
                        <span className="text-[7px] font-mono text-slate-500">
                          Showing {((activityCurrentPage - 1) * itemsPerPage) + 1} to {Math.min(activityCurrentPage * itemsPerPage, activityTotal)} of {activityTotal} activities
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setActivityCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={activityCurrentPage === 1}
                            className="text-[8px] font-mono px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1"
                          >
                            <ChevronLeft size={10} />
                            Prev
                          </button>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(activityTotalPages, 5) }, (_, i) => {
                              let pageNum;
                              if (activityTotalPages <= 5) {
                                pageNum = i + 1;
                              } else if (activityCurrentPage <= 3) {
                                pageNum = i + 1;
                              } else if (activityCurrentPage >= activityTotalPages - 2) {
                                pageNum = activityTotalPages - 4 + i;
                              } else {
                                pageNum = activityCurrentPage - 2 + i;
                              }
                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => setActivityCurrentPage(pageNum)}
                                  className={`w-6 h-6 text-[8px] font-mono rounded-lg transition-all ${
                                    activityCurrentPage === pageNum
                                      ? 'bg-indigo-500 text-white'
                                      : 'border border-white/10 hover:bg-white/5 text-slate-400'
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              );
                            })}
                          </div>
                          <button
                            onClick={() => setActivityCurrentPage(prev => Math.min(activityTotalPages, prev + 1))}
                            disabled={activityCurrentPage === activityTotalPages}
                            className="text-[8px] font-mono px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1"
                          >
                            Next
                            <ChevronRight size={10} />
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <style jsx global>{`
        ::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        ::-webkit-scrollbar-track {
          background: #050508;
        }
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #4f46e5, #7c3aed);
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #6366f1, #8b5cf6);
        }
        * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .truncate {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
}