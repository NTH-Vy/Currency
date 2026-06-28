"use client";

import {
  Search, Globe, User, TrendingUp, Menu, X, LogOut,
  ArrowRightLeft, LayoutDashboard, Newspaper, Users, Bell,
  ChevronDown, ThumbsUp, MessageSquare, AlertTriangle, ShieldAlert
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TickerItem {
  pair: string;
  value: string;
  change: string;
  positive: boolean;
}

interface BroadcastNotice {
  notice_id: number;
  title: string;
  content: string;
  created_at: string;
}

interface NotificationItem {
  id: number;
  title: string;
  content: string;
  time: string;
  read: boolean;
  isBroadcast: boolean;
  type?: 'like' | 'reply' | 'mention' | 'report' | 'warning' | 'ban';
  actorUsername?: string;
  postId?: number;
  commentId?: number;
}

interface ApiNotification {
  notification_id: number;
  type: 'like' | 'reply' | 'mention' | 'report' | 'warning' | 'ban';
  actor_id: number;
  actor_username: string;
  post_id: number | null;
  comment_id: number | null;
  comment_content: string | null;
  is_read: number;
  created_at: string;
}

type AuthUser = {
  username: string;
};

function readStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("user");
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored) as AuthUser;
    return parsed.username ? parsed : null;
  } catch {
    return null;
  }
}

export default function Header() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [tickerItems, setTickerItems] = useState<TickerItem[]>([]);
  const [broadcastNotices, setBroadcastNotices] = useState<BroadcastNotice[]>([]);
  const [userNotifications, setUserNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
  const pathname = usePathname();
  const API_BASE = "http://127.0.0.1:8000/api";
  
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  // Format notification count with 99+ logic
  const formatNotificationCount = (count: number) => {
    return count > 99 ? "99+" : String(count);
  };

  // Fetch broadcast notices
  useEffect(() => {
    const fetchBroadcastNotices = async () => {
      try {
        const response = await fetch(`${API_BASE}/broadcast-notices`);
        const data = await response.json();
        if (data.success) {
          setBroadcastNotices(data.notices);
        }
      } catch (error) {
        console.error("Error fetching broadcast notices:", error);
      }
    };

    fetchBroadcastNotices();
    const interval = setInterval(fetchBroadcastNotices, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [API_BASE]);

  // Fetch unread notification count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch(`${API_BASE}/notifications/unread-count`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json"
          }
        });
        const data = await response.json();
        if (data.success) {
          setUnreadCount(data.count || 0);
        }
      } catch (error) {
        console.error("Error fetching unread count:", error);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [API_BASE]);

  // Fetch user notifications
  useEffect(() => {
    const fetchUserNotifications = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch(`${API_BASE}/notifications`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json"
          }
        });
        const data = await response.json();
        if (data.success) {
          const notifications = data.notifications.map((notif: ApiNotification) => ({
            id: notif.notification_id,
            title: notif.type === 'like'
              ? `@${notif.actor_username} liked your post`
              : notif.type === 'reply'
              ? `@${notif.actor_username} sent a message`
              : notif.type === 'report'
              ? `Your comment has been reported`
              : notif.type === 'warning'
              ? `You have received a warning`
              : notif.type === 'ban'
              ? `Your account has been banned`
              : 'New notification',
            content: notif.comment_content || '',
            time: formatTimeAgo(notif.created_at),
            read: notif.is_read === 1,
            isBroadcast: false,
            type: notif.type,
            actorUsername: notif.actor_username,
            postId: notif.post_id || undefined,
            commentId: notif.comment_id || undefined
          }));
          setUserNotifications(notifications);
        }
      } catch (error) {
        console.error("Error fetching user notifications:", error);
      }
    };

    fetchUserNotifications();
    const interval = setInterval(fetchUserNotifications, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [API_BASE]);

  // Combine broadcast notices with user notifications
  const allNotifications = [
    ...userNotifications,
    ...broadcastNotices.map((notice) => ({
      id: notice.notice_id,
      title: notice.title || "System Notice",
      content: notice.content,
      time: formatTimeAgo(notice.created_at),
      read: false,
      isBroadcast: true,
    })),
  ];

  const syncUser = useCallback(() => {
    setUser(readStoredUser());
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("auth-changed"));
    setUser(null);
    setIsUserOpen(false);
    router.push("/login");
  };

  const handleNotificationClick = async (notif: NotificationItem) => {
    if (!notif.isBroadcast && !notif.read) {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          await fetch(`${API_BASE}/notifications/${notif.id}/read`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Accept": "application/json"
            }
          });
          setUserNotifications(prev =>
            prev.map(n => n.id === notif.id ? { ...n, read: true } : n)
          );
          setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
          console.error("Error marking notification as read:", error);
        }
      }
    }

    setSelectedNotification(notif);
    setShowNotificationModal(true);
    setIsNotifyOpen(false);
  };

  const handleMarkAllAsRead = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await fetch(`${API_BASE}/notifications/mark-all-read`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });
      setUserNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const navLinks = [
    { name: "Home", href: "/", icon: <LayoutDashboard size={18} /> },
    { name: "Converter", href: "/converter", icon: <ArrowRightLeft size={18} /> },
    { name: "Rates", href: "/rates", icon: <TrendingUp size={18} /> },
    { name: "News", href: "/news", icon: <Newspaper size={18} /> },
  ];

  useEffect(() => {
    syncUser();
    window.addEventListener("auth-changed", syncUser);
    window.addEventListener("storage", syncUser);
    return () => {
      window.removeEventListener("auth-changed", syncUser);
      window.removeEventListener("storage", syncUser);
    };
  }, [syncUser]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchTickerData = async () => {
      try {
        const res = await fetch(`${API_BASE}/rates/market-matrix`);
        const data = await res.json();
        if (data.success && data.rates) {
          const items = data.rates.map((rate: any) => ({
            pair: rate.pair,
            value: rate.price,
            change: rate.change,
            positive: rate.trend === 'up'
          }));
          setTickerItems(items);
        }
      } catch (error) {
        setTickerItems([
          { pair: "USD / VND", value: "25,450", change: "+0.02%", positive: true },
          { pair: "EUR / VND", value: "27,120", change: "+0.15%", positive: true },
          { pair: "JPY / VND", value: "165.4", change: "-0.05%", positive: false },
          { pair: "BTC / USD", value: "64,200", change: "+1.2%", positive: true },
        ]);
      }
    };
    fetchTickerData();
    const interval = setInterval(fetchTickerData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="fixed top-0 z-50 w-full transition-all duration-300">
      {/* 1. Ticker Bar */}
      <div className="bg-black text-slate-500 py-2 border-b border-white/10 relative z-20 hidden md:block overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center text-[10px] uppercase tracking-widest font-bold">
          <div className="flex animate-ticker whitespace-nowrap gap-12">
            {[...tickerItems, ...tickerItems].map((item, i) => (
              <div key={i} className="flex items-center gap-3 shrink-0">
                <span className="text-slate-500">{item.pair}</span>
                <span className="text-white font-mono">{item.value}</span>
                <span className={item.positive ? "text-emerald-400" : "text-rose-500"}>
                  {item.change}
                </span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 text-slate-400 shrink-0 ml-8 bg-black z-10 pl-4">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            LIVE MARKET DATA
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <div className={`transition-all duration-500 ${
        scrolled 
        ? 'bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/10 py-3' 
        : 'bg-transparent border-b border-white/5 py-5'
      }`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="relative flex items-center justify-start gap-12">
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group shrink-0">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-600 blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
                <div className="relative bg-indigo-600 p-2.5 rounded-xl group-hover:scale-105 transition-transform duration-300">
                  <Globe className="text-white" size={22} />
                </div>
              </div>
              <span className="text-xl font-black tracking-tighter text-white uppercase">
                Currency<span className="text-indigo-500">X</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link 
                    key={link.name} 
                    href={link.href}
                    className={`relative text-[13px] font-bold transition-colors uppercase tracking-wider ${
                      isActive ? 'text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {link.name}
                    {isActive && (
                      <motion.div 
                        layoutId="nav-underline"
                        className="absolute -bottom-2 left-0 right-0 h-0.5 bg-indigo-500"
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-4 ml-auto">
              {/* Search */}
              <div className="relative hidden xl:flex items-center">
                <Search className="absolute left-3 text-slate-500" size={14} />
                <input 
                  type="text" 
                  placeholder="Search assets..." 
                  className="bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-xs w-40 focus:outline-none focus:border-indigo-500/50 transition-all focus:w-60 text-white"
                />
              </div>

              {/* Bell Notification */}
              <div className="relative">
                <button
                  onClick={() => setIsNotifyOpen(!isNotifyOpen)}
                  className={`w-9 h-9 flex items-center justify-center rounded-full border transition-all relative ${
                    isNotifyOpen ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-indigo-600 text-white text-[9px] font-bold rounded-full border-2 border-[#0a0a0f]">
                      {formatNotificationCount(unreadCount)}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {isNotifyOpen && (
                    <>
                      <div className="fixed inset-0 z-0" onClick={() => setIsNotifyOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-80 bg-[#12121c] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
                      >
                        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
                          <h3 className="text-[10px] font-black uppercase tracking-widest text-white">Notifications</h3>
                          <button onClick={handleMarkAllAsRead} className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold uppercase">Mark all read</button>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto">
                          {allNotifications.map((notif) => (
                            <div
                              key={notif.id}
                              onClick={() => handleNotificationClick(notif)}
                              className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group"
                            >
                              <div className="flex gap-3">
                                <div className={`w-1.5 h-1.5 mt-1.5 rounded-full shrink-0 ${notif.read ? 'bg-transparent' : 'bg-indigo-500'}`} />
                                <div className="flex-1">
                                  <div className="flex items-start gap-2">
                                    {!notif.isBroadcast && notif.type === 'like' && (
                                      <ThumbsUp size={12} className="text-indigo-400 mt-0.5 shrink-0" />
                                    )}
                                    {!notif.isBroadcast && notif.type === 'reply' && (
                                      <MessageSquare size={12} className="text-emerald-400 mt-0.5 shrink-0" />
                                    )}
                                    {!notif.isBroadcast && notif.type === 'report' && (
                                      <AlertTriangle size={12} className="text-amber-400 mt-0.5 shrink-0" />
                                    )}
                                    {!notif.isBroadcast && notif.type === 'warning' && (
                                      <AlertTriangle size={12} className="text-orange-400 mt-0.5 shrink-0" />
                                    )}
                                    {!notif.isBroadcast && notif.type === 'ban' && (
                                      <ShieldAlert size={12} className="text-rose-400 mt-0.5 shrink-0" />
                                    )}
                                    <div className="flex-1">
                                      <p className="text-xs text-slate-200 group-hover:text-white transition-colors leading-relaxed">
                                        {notif.isBroadcast ? (
                                          <>
                                            <span className="text-indigo-400 font-bold">{notif.title}</span>
                                            <span className="text-slate-400">: {notif.content}</span>
                                          </>
                                        ) : (
                                          <>
                                            <span className="font-semibold">{notif.title}</span>
                                            {notif.content && <span className="text-slate-400 ml-1">: {notif.content}</span>}
                                          </>
                                        )}
                                      </p>
                                      <p className="text-[9px] text-slate-500 mt-1 uppercase font-bold tracking-tight">{notif.time}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <Link href="/notifications" className="block p-3 text-center text-[10px] font-black uppercase text-slate-400 hover:text-white border-t border-white/5 hover:bg-white/5">
                          View All
                        </Link>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* User Section - Facebook Style */}
              <div className="flex items-center" ref={userMenuRef}>
                {user ? (
                  <div className="relative hidden sm:block">
                    {/* Trigger Button */}
                    <button 
                      onClick={() => setIsUserOpen(!isUserOpen)}
                      className={`flex items-center gap-1.5 p-0.5 rounded-full border transition-all ${
                        isUserOpen 
                        ? 'bg-indigo-600/20 border-indigo-500' 
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-bold flex items-center justify-center text-sm uppercase shadow-inner">
                        {user.username.charAt(0)}
                      </div>
                      <div className="pr-1.5 text-slate-400">
                        <ChevronDown size={14} className={`transition-transform duration-300 ${isUserOpen ? 'rotate-180 text-white' : ''}`} />
                      </div>
                    </button>
                    
                    {/* Dropdown Menu - Facebook Style */}
                    <AnimatePresence>
                      {isUserOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 12, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 12, scale: 0.95 }}
                          transition={{ duration: 0.15, ease: "easeOut" }}
                          className="absolute right-0 mt-3 w-80 bg-[#12121c] border border-white/10 rounded-2xl shadow-2xl p-4 space-y-4 z-50"
                        >
                          {/* Profile Box Container */}
                          <div className="p-2 rounded-xl bg-white/[0.03] border border-indigo-500/30 shadow-md">
                            <Link 
                              href="/User" 
                              onClick={() => setIsUserOpen(false)}
                              className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
                            >
                              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-bold flex items-center justify-center text-base uppercase shrink-0 ring-2 ring-indigo-500/50">
                                {user.username.charAt(0)}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-sm font-bold text-white truncate group-hover:text-indigo-400">
                                  {user.username}
                                </span>
                                <span className="text-[11px] text-slate-400 truncate">Verified Account</span>
                              </div>
                            </Link>
                            
                            {/* See all profiles button */}
                            <div className="mt-2 pt-1 border-t border-white/5">
                              <Link
                                href="/User"
                                onClick={() => setIsUserOpen(false)}
                                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-200 transition-all text-center"
                              >
                                <User size={14} />
                                <span>See all profiles</span>
                              </Link>
                            </div>
                          </div>

                          {/* Navigation List */}
                          <div className="space-y-1.5">
                            <Link 
                              href="/User" 
                              onClick={() => setIsUserOpen(false)}
                              className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-white/5 text-slate-300 hover:text-white transition-colors group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-white/5 text-slate-300 group-hover:bg-indigo-600/20 group-hover:text-indigo-400 flex items-center justify-center transition-all">
                                  <LayoutDashboard size={18} />
                                </div>
                                <span className="text-xs font-semibold">Dashboard</span>
                              </div>
                              <ChevronDown size={16} className="-rotate-90 text-slate-500 group-hover:text-white transition-colors" />
                            </Link>

                            <button 
                              onClick={handleLogout}
                              className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-rose-500/5 text-slate-300 hover:text-rose-400 transition-colors group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-white/5 text-slate-300 group-hover:bg-rose-500/20 group-hover:text-rose-400 flex items-center justify-center transition-all">
                                  <LogOut size={18} />
                                </div>
                                <span className="text-xs font-semibold">Log Out</span>
                              </div>
                              <ChevronDown size={16} className="-rotate-90 text-slate-500 group-hover:text-rose-400 transition-colors" />
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link href="/login" className="hidden sm:block text-xs font-bold bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-500 transition-all active:scale-95 uppercase tracking-wider shadow-lg shadow-indigo-600/20">
                    Open Account
                  </Link>
                )}

                {/* Mobile Menu Trigger */}
                <button 
                  className="lg:hidden p-2 text-white hover:bg-white/5 rounded-xl transition-colors ml-2"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Mobile Navigation Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 top-0 z-40 lg:hidden"
          >
            <div className="absolute inset-0 bg-[#0a0a0f]/95 backdrop-blur-md" onClick={() => setIsMenuOpen(false)} />
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="absolute inset-x-0 top-24 bg-[#12121c] border-b border-white/10 shadow-2xl p-6"
            >
              <div className="grid grid-cols-2 gap-4">
                {navLinks.map((link) => (
                  <Link 
                    key={link.name} 
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex flex-col gap-3 p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-indigo-500/30 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      {link.icon}
                    </div>
                    <span className="font-bold text-white text-sm uppercase tracking-wide">{link.name}</span>
                  </Link>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker {
          animation: ticker 30s linear infinite;
        }
        .animate-ticker:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Notification Detail Modal */}
      <AnimatePresence>
        {showNotificationModal && selectedNotification && (
          <>
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
              onClick={() => setShowNotificationModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-[#12121c] border border-white/10 rounded-2xl shadow-2xl z-[70] overflow-hidden"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-start bg-white/5">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {selectedNotification.isBroadcast && (
                      <span className="px-2 py-1 bg-indigo-500/20 text-indigo-400 text-[9px] font-black uppercase tracking-wider rounded">
                        Broadcast
                      </span>
                    )}
                    <span className="text-[9px] text-slate-500 uppercase font-bold tracking-tight">
                      {selectedNotification.time}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{selectedNotification.title}</h3>
                </div>
                <button
                  onClick={() => setShowNotificationModal(false)}
                  className="ml-4 p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 max-h-[400px] overflow-y-auto">
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {selectedNotification.content || selectedNotification.title}
                </p>
              </div>
              <div className="p-4 border-t border-white/5 bg-white/5">
                <button
                  onClick={() => setShowNotificationModal(false)}
                  className="w-full py-3 bg-indigo-600 text-white font-black text-xs uppercase tracking-wider rounded-xl hover:bg-indigo-500 transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}