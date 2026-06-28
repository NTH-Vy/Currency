"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  Menu,
  X,
  User as UserIcon,
  LogOut,
  Database,
  Globe,
  Newspaper,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  Clock,
  Zap,
  Activity,
  Cpu,
  FileText,
  Settings,
  LifeBuoy,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminHeader() {
  const router = useRouter();
  const pathname = usePathname();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [adminData, setAdminData] = useState({
    username: "ADMIN_OPERATOR",
    role: "ROOT",
  });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.getUTCFullYear() +
          "-" +
          String(now.getUTCMonth() + 1).padStart(2, "0") +
          "-" +
          String(now.getUTCDate()).padStart(2, "0") +
          " " +
          String(now.getUTCHours()).padStart(2, "0") +
          ":" +
          String(now.getUTCMinutes()).padStart(2, "0") +
          ":" +
          String(now.getUTCSeconds()).padStart(2, "0") +
          " UTC"
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);

    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setAdminData({
          username: user.username || "ADMIN_OPERATOR",
          role: user.role || "ADMIN",
        });
      } catch (e) {
        console.error(e);
      }
    }
    return () => clearInterval(interval);
  }, []);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch(`${API_BASE}/notifications/unread-count`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json"
          }
        });

        const data = await res.json();
        if (data.success !== undefined) {
          setUnreadCount(data.count || 0);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchNotificationsList = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${API_BASE}/notifications`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });

      const data = await res.json();
      if (data.success !== undefined) {
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error("Error fetching notifications list:", error);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await fetch(`${API_BASE}/notifications/${notificationId}/read`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });

      setNotifications(prev => prev.map(n => n.notification_id === notificationId ? { ...n, is_read: 1 } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await fetch(`${API_BASE}/notifications/mark-all-read`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });

      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const formatNotificationCount = (count: number) => {
    return count > 99 ? "99+" : String(count);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  const navLinks = [
    { name: "Dashboard", href: "/Admin", icon: <Database size={16} /> },
    { name: "Users", href: "/Admin/Users", icon: <ShieldCheck size={16} /> },
    { name: "Rates", href: "/Admin/Rates", icon: <Globe size={16} /> },
    { name: "News", href: "/Admin/News", icon: <Newspaper size={16} /> },
    { name: "Communities", href: "/Admin/Communities", icon: <ShieldCheck size={16} /> },
    { name: "Reports", href: "/Admin/Reports", icon: <FileText size={16} /> },
    { name: "Settings", href: "/Admin/Setting", icon: <Settings size={16} /> },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <header className="fixed top-0 z-50 w-full transition-all duration-300 font-sans">
      {/* 1. TICKER BAR */}
      <div className="bg-black text-slate-500 py-2 border-b border-white/[0.08] relative z-20 hidden md:block overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center text-[10px] uppercase tracking-[0.2em] font-black">
          <div className="flex animate-ticker whitespace-nowrap gap-12">
            <div className="flex items-center gap-3 shrink-0">
              <Cpu size={12} className="text-indigo-500" />
              <span>
                Status: <span className="text-emerald-400">Stable</span>
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0 text-slate-400">
              <Clock size={12} className="text-indigo-500" />
              <span className="font-mono tabular-nums">{currentTime}</span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Activity size={12} className="text-indigo-400" />
              <span>
                Network: <span className="text-indigo-400">Verified</span>
              </span>
            </div>
            {/* duplicate set so the loop reads seamlessly */}
            <div className="flex items-center gap-3 shrink-0">
              <Cpu size={12} className="text-indigo-500" />
              <span>
                Status: <span className="text-emerald-400">Stable</span>
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0 text-slate-400">
              <Clock size={12} className="text-indigo-500" />
              <span className="font-mono tabular-nums">{currentTime}</span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Activity size={12} className="text-indigo-400" />
              <span>
                Network: <span className="text-indigo-400">Verified</span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-400 shrink-0 ml-8 bg-black z-10 pl-4 font-mono">
            <div className="relative w-1.5 h-1.5">
              <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-60" />
              <div className="absolute inset-0 rounded-full bg-emerald-500" />
            </div>
            CONSOLE_L5_ACTIVE
          </div>
        </div>
      </div>

      {/* 2. MAIN NAV BAR */}
      <div
        className={`relative transition-all duration-500 ${
          scrolled
            ? "bg-[#0a0a0f]/80 backdrop-blur-2xl border-b border-white/10 py-3 shadow-[0_8px_30px_-10px_rgba(0,0,0,0.7)]"
            : "bg-gradient-to-b from-[#0a0a0f]/60 to-transparent border-b border-white/[0.06] py-5"
        }`}
      >
        {/* faint top hairline glow for depth */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="relative flex items-center justify-between">
            {/* Logo */}
            <Link href="/Admin" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-600 blur-lg opacity-25 group-hover:opacity-50 transition-opacity duration-300" />
                <div className="relative bg-gradient-to-br from-indigo-500 to-indigo-700 p-2.5 rounded-xl group-hover:scale-105 group-hover:rotate-3 transition-transform duration-300 shadow-lg shadow-indigo-600/30 ring-1 ring-white/10">
                  <Zap size={20} className="text-white fill-white/30" />
                </div>
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-lg font-black tracking-tighter text-white uppercase">
                  Cortex<span className="text-indigo-500">Command</span>
                </span>
                <span className="text-[8px] font-mono font-bold tracking-[0.3em] text-slate-500 uppercase mt-0.5">
                  Admin Ops
                </span>
              </div>
            </Link>

            {/* Nav Links */}
            <nav className="hidden lg:flex items-center gap-1 p-1 rounded-full bg-white/[0.03] border border-white/[0.06]">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[11px] font-black transition-all duration-200 uppercase tracking-[0.12em] ${
                    isActive(link.href)
                      ? "text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {isActive(link.href) && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-indigo-600 rounded-full shadow-md shadow-indigo-600/40"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                    />
                  )}
                  <span className="relative z-10 hidden xl:inline">{link.icon}</span>
                  <span className="relative z-10">{link.name}</span>
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Notification Button */}
              <div className="relative">
                <button
                  onClick={() => {
                    setNotificationDropdownOpen(!notificationDropdownOpen);
                    if (!notificationDropdownOpen) {
                      fetchNotificationsList();
                    }
                  }}
                  className="relative w-9 h-9 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:border-white/20 hover:bg-white/10 transition-all duration-200"
                >
                  <Bell size={17} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-indigo-600 text-white text-[9px] font-bold rounded-full border-2 border-[#0a0a0f]">
                      {formatNotificationCount(unreadCount)}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                <AnimatePresence>
                  {notificationDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setNotificationDropdownOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 10 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute right-0 mt-3 w-96 rounded-2xl bg-[#12121c]/95 border border-white/10 shadow-2xl shadow-black/50 p-3 space-y-3 z-50 backdrop-blur-2xl max-h-[500px] overflow-hidden flex flex-col"
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between p-3 border-b border-white/10">
                          <h3 className="text-xs font-black text-white uppercase tracking-wider">Notifications</h3>
                          {unreadCount > 0 && (
                            <button
                              onClick={markAllAsRead}
                              className="text-[9px] font-mono text-indigo-400 hover:text-indigo-300 uppercase tracking-wider transition-colors"
                            >
                              Mark all read
                            </button>
                          )}
                        </div>

                        {/* Notifications List */}
                        <div className="flex-1 overflow-y-auto space-y-1">
                          {notifications.length === 0 ? (
                            <div className="py-8 text-center text-slate-500 text-xs">
                              No notifications
                            </div>
                          ) : (
                            notifications.map((notification) => (
                              <div
                                key={notification.notification_id}
                                onClick={() => markAsRead(notification.notification_id)}
                                className={`p-3 rounded-xl cursor-pointer transition-all ${
                                  notification.is_read
                                    ? 'bg-white/5 hover:bg-white/10'
                                    : 'bg-indigo-500/10 hover:bg-indigo-500/15 border border-indigo-500/20'
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                    notification.is_read ? 'bg-white/10' : 'bg-indigo-500/20'
                                  }`}>
                                    <Bell size={14} className={notification.is_read ? 'text-slate-400' : 'text-indigo-400'} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-xs font-medium truncate ${
                                      notification.is_read ? 'text-slate-400' : 'text-white'
                                    }`}>
                                      {notification.comment_content}
                                    </p>
                                    <p className="text-[9px] text-slate-500 font-mono mt-1">
                                      {notification.actor_username || 'System'}
                                    </p>
                                  </div>
                                  {!notification.is_read && (
                                    <div className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0 mt-2" />
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Footer */}
                        <div className="pt-2 border-t border-white/10">
                          <Link
                            href="/Admin/Contact"
                            onClick={() => setNotificationDropdownOpen(false)}
                            className="block w-full text-center py-2 text-[10px] font-mono text-slate-400 hover:text-white uppercase tracking-wider transition-colors"
                          >
                            View Support Center
                          </Link>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              <div className="h-6 w-px bg-white/10 mx-0.5 hidden sm:block" />

              {/* PROFILE BOX */}
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className={`flex items-center gap-2 pl-1 pr-2 py-1 rounded-full border transition-all duration-200 ${
                    profileDropdownOpen
                      ? "bg-indigo-600/15 border-indigo-500/60"
                      : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-bold flex items-center justify-center text-sm uppercase shadow-inner ring-1 ring-white/15">
                    {adminData.username.charAt(0)}
                  </div>
                  <ChevronDown
                    size={14}
                    className={`text-slate-400 transition-transform duration-300 ${
                      profileDropdownOpen ? "rotate-180 text-white" : ""
                    }`}
                  />
                </button>

                {/* DROPDOWN */}
                <AnimatePresence>
                  {profileDropdownOpen && (
                    <>
                      {/* click-away backdrop */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setProfileDropdownOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 10 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute right-0 mt-3 w-80 rounded-2xl bg-[#12121c]/95 border border-white/10 shadow-2xl shadow-black/50 p-3 space-y-3 z-50 backdrop-blur-2xl"
                      >
                        {/* Profile summary */}
                        <div className="relative overflow-hidden p-3 rounded-xl bg-gradient-to-br from-indigo-600/15 via-white/[0.02] to-transparent border border-indigo-500/25">
                          <Link
                            href="/Admin"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-3"
                          >
                            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-bold flex items-center justify-center text-base uppercase shrink-0 ring-2 ring-indigo-500/40">
                              {adminData.username.charAt(0)}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs font-black text-white uppercase tracking-tight truncate">
                                @{adminData.username}
                              </span>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[9px] text-slate-400 font-mono uppercase tracking-wider font-bold">
                                  {adminData.role} NODE
                                </span>
                              </div>
                            </div>
                          </Link>

                          <Link
                            href="/Admin"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="mt-3 w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-white/[0.06] hover:bg-white/10 text-[11px] font-bold text-slate-200 transition-colors text-center"
                          >
                            <UserIcon size={13} />
                            <span>See all admin settings</span>
                          </Link>
                        </div>

                        {/* Navigation rows */}
                        <div className="space-y-1">
                          <Link
                            href="/Admin"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-white/5 text-slate-300 hover:text-white transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-white/5 text-slate-300 group-hover:bg-indigo-600/20 group-hover:text-indigo-400 flex items-center justify-center transition-colors">
                                <Database size={17} />
                              </div>
                              <span className="text-xs font-semibold">Dashboard console</span>
                            </div>
                            <ChevronRight size={15} className="text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                          </Link>

                          <Link
                            href="/Admin/Contact"
                            onClick={() => setProfileDropdownOpen(false)}
                            className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-white/5 text-slate-300 hover:text-white transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-white/5 text-slate-300 group-hover:bg-emerald-600/20 group-hover:text-emerald-400 flex items-center justify-center transition-colors">
                                <LifeBuoy size={17} />
                              </div>
                              <span className="text-xs font-semibold">Support Center</span>
                            </div>
                            <ChevronRight size={15} className="text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                          </Link>

                          <div className="h-px bg-white/[0.06] my-1" />

                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-rose-500/10 text-slate-300 hover:text-rose-400 transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-white/5 text-slate-300 group-hover:bg-rose-500/20 group-hover:text-rose-400 flex items-center justify-center transition-colors">
                                <LogOut size={17} />
                              </div>
                              <span className="text-xs font-semibold">Terminate Session</span>
                            </div>
                            <ChevronRight size={15} className="text-slate-500 group-hover:text-rose-400 group-hover:translate-x-0.5 transition-all" />
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Menu Toggle */}
              <button
                className="lg:hidden relative w-9 h-9 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isMenuOpen ? (
                    <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                      <X size={20} />
                    </motion.span>
                  ) : (
                    <motion.span key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                      <Menu size={20} />
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MOBILE NAV DRAWER */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="lg:hidden overflow-hidden bg-[#0a0a0f]/95 backdrop-blur-2xl border-b border-white/10"
          >
            <nav className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-[0.12em] transition-colors ${
                    isActive(link.href)
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {link.icon}
                  {link.name}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes ticker {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-ticker {
          animation: ticker 30s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-ticker {
            animation: none;
          }
        }
      `}</style>
    </header>
  );
}