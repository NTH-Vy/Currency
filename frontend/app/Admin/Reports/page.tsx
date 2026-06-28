"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Trash2, 
  Edit, 
  Plus, 
  Search, 
  Save, 
  X,
  UserCheck,
  UserX,
  ShieldCheck,
  Loader2,
  Users,
  Mail,
  Hash,
  Calendar,
  Activity,
  Zap,
  Shield,
  Crown,
  Star,
  Filter,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  MoreHorizontal,
  Copy,
  RefreshCw,
  History,
  ArrowRight,
  Wallet,
  TrendingUp,
  Database,
  RotateCcw,
  Download,
  MessageSquare,
  ThumbsUp,
  Reply,
  Flag,
  Clock,
  Check,
  Ban,
  AlertTriangle,
  Tag
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ---------- Custom themed dropdown ----------
interface SelectOption {
  value: string;
  label: string;
}

const CustomSelect = ({
  value,
  options,
  onChange,
}: {
  value: string;
  options: SelectOption[];
  onChange: (v: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center justify-between bg-black/40 border rounded-xl pl-4 pr-3 py-2.5 text-[11px] font-mono text-white transition-all focus:outline-none ${
          open ? "border-red-500/50 bg-black/60" : "border-white/10 hover:border-white/20"
        }`}
      >
        <span className="truncate">{selected?.label}</span>
        <ChevronRight
          size={12}
          className={`text-slate-500 transition-transform duration-200 flex-shrink-0 ml-2 ${
            open ? "-rotate-90" : "rotate-90"
          }`}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-2 w-full bg-[#15151f] border border-white/10 rounded-xl shadow-2xl overflow-hidden py-1.5"
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-[11px] font-mono transition-colors flex items-center justify-between ${
                  opt.value === value
                    ? "bg-red-500/15 text-red-300"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span>{opt.label}</span>
                {opt.value === value && <CheckCircle2 size={12} className="text-red-400" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ---------- Custom date picker ----------
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

const pad2 = (n: number) => String(n).padStart(2, "0");
const toDateStr = (y: number, m: number, d: number) => `${y}-${pad2(m + 1)}-${pad2(d)}`;

const CustomDatePicker = ({
  value,
  onChange,
  placeholder = "dd/mm/yyyy",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) => {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() =>
    value ? new Date(`${value}T00:00:00`) : new Date()
  );
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (value) setViewDate(new Date(`${value}T00:00:00`));
  }, [value]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells: { day: number; current: boolean }[] = [];
  for (let i = firstWeekday - 1; i >= 0; i--) cells.push({ day: daysInPrevMonth - i, current: false });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, current: true });
  let nextDay = 1;
  while (cells.length < 42) cells.push({ day: nextDay++, current: false });

  const todayStr = toDateStr(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

  const formatDisplay = (v: string) => {
    if (!v) return "";
    const [y, m, d] = v.split("-");
    return `${d}/${m}/${y}`;
  };

  const handlePick = (day: number, current: boolean) => {
    if (!current) return;
    onChange(toDateStr(year, month, day));
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center justify-between bg-black/40 border rounded-xl pl-4 pr-3 py-2.5 text-[11px] font-mono transition-all focus:outline-none ${
          open ? "border-red-500/50 bg-black/60" : "border-white/10 hover:border-white/20"
        }`}
      >
        <span className={value ? "text-white" : "text-slate-600"}>
          {value ? formatDisplay(value) : placeholder}
        </span>
        <Calendar size={12} className="text-slate-500 flex-shrink-0 ml-2" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-2 w-72 bg-[#15151f] border border-white/10 rounded-2xl shadow-2xl p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-white font-mono">
                {MONTH_NAMES[month]} {year}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setViewDate(new Date(year, month - 1, 1))}
                  className="p-1 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setViewDate(new Date(year, month + 1, 1))}
                  className="p-1 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-1">
              {WEEKDAY_LABELS.map((d, i) => (
                <div key={i} className="text-center text-[8px] font-mono text-slate-500 uppercase py-1">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {cells.map((c, idx) => {
                const cellStr = c.current ? toDateStr(year, month, c.day) : "";
                const isSelected = c.current && value === cellStr;
                const isToday = c.current && cellStr === todayStr;
                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={!c.current}
                    onClick={() => handlePick(c.day, c.current)}
                    className={`h-7 w-7 mx-auto flex items-center justify-center rounded-lg text-[10px] font-mono transition-all ${
                      !c.current
                        ? "text-slate-700 cursor-default"
                        : isSelected
                        ? "bg-red-500 text-white font-bold"
                        : isToday
                        ? "border border-red-500/50 text-red-300"
                        : "text-slate-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {c.day}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setOpen(false);
                }}
                className="text-[9px] font-mono text-slate-400 hover:text-white uppercase tracking-wider transition-colors"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => {
                  const t = new Date();
                  const str = toDateStr(t.getFullYear(), t.getMonth(), t.getDate());
                  onChange(str);
                  setViewDate(t);
                  setOpen(false);
                }}
                className="text-[9px] font-mono text-red-400 hover:text-red-300 uppercase tracking-wider transition-colors"
              >
                Today
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ---------- Skeleton Components ----------
const HeaderSkeleton = () => (
  <div className="relative group">
    <div className="relative bg-gradient-to-br from-[#11111a] to-[#0c0c12] rounded-[2.5rem] p-8 md:p-10 border border-white/10 shadow-2xl overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex flex-col gap-3 w-full md:w-2/3">
          <div className="h-6 w-48 bg-white/5 rounded-full animate-pulse" />
          <div className="h-12 w-3/4 bg-white/5 rounded-xl animate-pulse" />
          <div className="h-4 w-full max-w-2xl bg-white/5 rounded-lg animate-pulse" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-12 w-28 bg-white/5 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  </div>
);

const StatsSkeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {[...Array(4)].map((_, idx) => (
      <div key={idx} className="bg-[#11111a] border border-white/10 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/5 animate-pulse" />
          <div className="flex-1">
            <div className="h-3 w-20 bg-white/5 rounded animate-pulse mb-1" />
            <div className="h-7 w-12 bg-white/5 rounded animate-pulse" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

const SearchSkeleton = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div 
      className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-end"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateX(0)' : 'translateX(50px)',
        transition: 'all 0.4s ease-out'
      }}
    >
      <div className="relative w-full sm:w-80">
        <div className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 h-12 animate-pulse" />
      </div>
      <div className="flex items-center gap-2">
        <div className="h-12 w-28 bg-white/5 rounded-xl animate-pulse" />
      </div>
    </div>
  );
};

const TableHeaderSkeleton = () => (
  <tr className="border-b border-white/10 bg-white/5">
    <th className="px-4 py-4 w-24"><div className="h-3 w-10 bg-white/5 rounded animate-pulse" /></th>
    <th className="px-4 py-4 w-36"><div className="h-3 w-12 bg-white/5 rounded animate-pulse" /></th>
    <th className="px-4 py-4 w-36"><div className="h-3 w-12 bg-white/5 rounded animate-pulse" /></th>
    <th className="px-4 py-4"><div className="h-3 w-14 bg-white/5 rounded animate-pulse" /></th>
    <th className="px-4 py-4 w-28"><div className="h-3 w-12 bg-white/5 rounded animate-pulse" /></th>
    <th className="px-4 py-4 w-32 text-center"><div className="h-3 w-12 bg-white/5 rounded animate-pulse mx-auto" /></th>
  </tr>
);

const TableSkeleton = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div 
      className="bg-gradient-to-br from-[#11111a] to-[#0c0c12] rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateX(0)' : 'translateX(50px)',
        transition: 'all 0.5s ease-out'
      }}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono">
          <thead>
            <TableHeaderSkeleton />
          </thead>
          <tbody className="divide-y divide-white/5">
            {[...Array(5)].map((_, idx) => {
              const delay = idx * 80;
              return (
                <tr 
                  key={idx}
                  className="border-b border-white/5"
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'translateX(0)' : 'translateX(50px)',
                    transition: `all 0.4s ease-out ${delay}ms`
                  }}
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-white/5 animate-pulse" />
                      <div className="h-4 w-12 bg-white/5 rounded animate-pulse" />
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      <div className="h-4 w-20 bg-white/5 rounded animate-pulse" />
                      <div className="h-3 w-28 bg-white/5 rounded animate-pulse" />
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      <div className="h-4 w-20 bg-white/5 rounded animate-pulse" />
                      <div className="h-3 w-28 bg-white/5 rounded animate-pulse" />
                    </div>
                  </td>
                  <td className="px-4 py-4"><div className="h-6 w-24 bg-white/5 rounded-lg animate-pulse" /></td>
                  <td className="px-4 py-4"><div className="h-6 w-20 bg-white/5 rounded-lg animate-pulse" /></td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <div className="w-8 h-8 bg-white/5 rounded-lg animate-pulse" />
                      <div className="w-8 h-8 bg-white/5 rounded-lg animate-pulse" />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const PaginationSkeleton = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div 
      className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-br from-[#11111a] to-[#0c0c12] border border-white/10 rounded-xl p-4"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateX(0)' : 'translateX(50px)',
        transition: 'all 0.5s ease-out'
      }}
    >
      <div className="h-3 w-48 bg-white/5 rounded animate-pulse" />
      <div className="flex items-center gap-1.5">
        <div className="h-8 w-16 bg-white/5 rounded-lg animate-pulse" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-8 w-8 bg-white/5 rounded-lg animate-pulse" />
        ))}
        <div className="h-8 w-16 bg-white/5 rounded-lg animate-pulse" />
      </div>
    </div>
  );
};

const PageSkeleton = () => (
  <div className="flex flex-col gap-8">
    <HeaderSkeleton />
    <StatsSkeleton />
    <SearchSkeleton />
    <TableSkeleton />
    <PaginationSkeleton />
  </div>
);

// ---------- Main Component ----------
interface ReportItem {
  report_id: number;
  reporter_id: number;
  comment_id: number;
  reason: string;
  description: string | null;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by: number | null;
  reviewed_at: string | null;
  action_taken: 'none' | 'warning' | 'delete_comment' | 'temporary_ban' | 'permanent_ban';
  ban_duration_days: number | null;
  ban_until: string | null;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
  reporter?: {
    user_id: number;
    username: string;
    email: string;
  };
  comment?: {
    comment_id: number;
    content: string;
    user_id: number;
    user?: {
      user_id: number;
      username: string;
      email: string;
    };
  };
  reviewer?: {
    user_id: number;
    username: string;
  };
}

interface FilterState {
  search: string;
  status: string;
  reason: string;
  dateFrom: string;
  dateTo: string;
}

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  visible: boolean;
}

export default function AdminReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [toast, setToast] = useState<ToastState>({ 
    message: '', 
    type: 'info', 
    visible: false 
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: 'pending',
    reason: 'All',
    dateFrom: '',
    dateTo: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [stats, setStats] = useState<any>(null);

  // Modal states
  const [viewModal, setViewModal] = useState<{ show: boolean; data: ReportItem | null }>({
    show: false, data: null
  });

  // Processing states
  const [processing, setProcessing] = useState(false);
  const [action, setAction] = useState('');
  const [banDays, setBanDays] = useState(7);
  const [adminNote, setAdminNote] = useState('');
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);

  const API_BASE = "http://127.0.0.1:8000/api";

  const showToast = (message: string, type: ToastState['type'] = 'info') => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  };

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showToast("Please login to access admin panel", "error");
        setIsLoading(false);
        return;
      }

      const params = new URLSearchParams();
      params.append('page', String(currentPage));
      if (filters.search) params.append('search', filters.search);
      if (filters.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters.reason && filters.reason !== 'All') params.append('reason', filters.reason);
      if (filters.dateFrom) params.append('date_from', filters.dateFrom);
      if (filters.dateTo) params.append('date_to', filters.dateTo);

      const response = await fetch(`${API_BASE}/admin/reports?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          showToast("Session expired. Please login again.", "error");
        } else if (response.status === 403) {
          showToast("You don't have permission to access this page.", "error");
        }
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      if (data.data) {
        setReports(data.data);
        setTotalPages(data.last_page || 1);
        setTotalItems(data.total || 0);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      showToast("Failed to load reports", "error");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, filters]);

  const fetchStats = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/admin/reports/statistics`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

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
    fetchReports();
    fetchStats();
  }, [router, fetchReports, fetchStats]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [filters.search, filters.status, filters.reason]);

  const resetFilters = () => {
    setFilters({
      search: '',
      status: 'pending',
      reason: 'All',
      dateFrom: '',
      dateTo: ''
    });
    setCurrentPage(1);
  };

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      spam: 'Spam',
      offensive: 'Offensive',
      harassment: 'Harassment',
      misinformation: 'Misinformation',
      hate_speech: 'Hate Speech',
      inappropriate_content: 'Inappropriate',
      other: 'Other'
    };
    return labels[reason] || reason;
  };

  const getReasonColor = (reason: string) => {
    const colors: Record<string, string> = {
      spam: 'bg-yellow-500/15 border-yellow-500/30 text-yellow-400',
      offensive: 'bg-red-500/15 border-red-500/30 text-red-400',
      harassment: 'bg-purple-500/15 border-purple-500/30 text-purple-400',
      misinformation: 'bg-orange-500/15 border-orange-500/30 text-orange-400',
      hate_speech: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
      inappropriate_content: 'bg-pink-500/15 border-pink-500/30 text-pink-400',
      other: 'bg-slate-500/15 border-slate-500/30 text-slate-400'
    };
    return colors[reason] || colors.other;
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; icon: JSX.Element; label: string }> = {
      pending: { bg: 'bg-yellow-500/15 border-yellow-500/30 text-yellow-400', icon: <Clock size={10} />, label: 'Pending' },
      approved: { bg: 'bg-red-500/15 border-red-500/30 text-red-400', icon: <Check size={10} />, label: 'Approved' },
      rejected: { bg: 'bg-slate-500/15 border-slate-500/30 text-slate-400', icon: <X size={10} />, label: 'Rejected' }
    };
    return styles[status] || styles.pending;
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      none: 'No Action',
      warning: 'Warning',
      delete_comment: 'Deleted Comment',
      temporary_ban: 'Temp Ban',
      permanent_ban: 'Perm Ban'
    };
    return labels[action] || action;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return { date: 'N/A', time: '' };
    try {
      const date = new Date(dateString);
      return {
        date: date.toLocaleDateString('vi-VN', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        time: date.toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit'
        })
      };
    } catch {
      return { date: 'N/A', time: '' };
    }
  };

  const handleReview = async (reportId: number) => {
    if (!action) {
      showToast('Please select an action', 'error');
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      router.push('/login');
      return;
    }

    setProcessing(true);
    try {
      const res = await fetch(`${API_BASE}/admin/reports/${reportId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          action: action,
          ban_duration_days: action === 'temporary_ban' ? banDays : null,
          admin_note: adminNote
        })
      });

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
        return;
      }

      const data = await res.json();
      
      if (res.ok) {
        showToast('Report processed successfully!', 'success');
        setViewModal({ show: false, data: null });
        setAction('');
        setAdminNote('');
        setSelectedReportId(null);
        fetchReports();
        fetchStats();
      } else {
        showToast(data.message || 'Failed to process report', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Error processing report', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (reportId: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push('/login');
      return;
    }

    setProcessing(true);
    try {
      const res = await fetch(`${API_BASE}/admin/reports/${reportId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({ admin_note: adminNote || 'Rejected' })
      });

      if (res.ok) {
        showToast('Report rejected', 'success');
        setViewModal({ show: false, data: null });
        setAction('');
        setAdminNote('');
        setSelectedReportId(null);
        fetchReports();
        fetchStats();
      } else {
        const data = await res.json();
        showToast(data.message || 'Failed to reject report', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Error rejecting report', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const renderPaginationPages = () => {
    if (!totalPages || totalPages <= 1) return null;
    
    const total = totalPages;
    const current = currentPage;
    let pages: (number | string)[] = [];
    
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push('...');
      for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
        pages.push(i);
      }
      if (current < total - 2) pages.push('...');
      pages.push(total);
    }
    
    return pages.map((pageNum, idx) => {
      if (pageNum === '...') {
        return (
          <span key={`ellipsis-${idx}`} className="px-2 text-slate-500 text-[8px] font-mono">…</span>
        );
      }
      return (
        <motion.button
          key={pageNum}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setCurrentPage(pageNum as number)}
          className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all ${
            current === pageNum
              ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md'
              : 'bg-white/5 hover:bg-white/10 text-slate-400'
          }`}
        >
          {pageNum}
        </motion.button>
      );
    });
  };

  return (
    <div className="min-h-screen bg-[#05050a] text-slate-100 flex flex-col font-sans pt-28 pb-20 selection:bg-red-500/30 overflow-x-hidden">
      
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
              toast.type === 'warning' ? 'bg-yellow-500/15 border-yellow-500/40 text-yellow-200' :
              'bg-indigo-500/15 border-indigo-500/40 text-indigo-200'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 size={16} />}
            {toast.type === 'error' && <AlertCircle size={16} />}
            {toast.type === 'warning' && <AlertCircle size={16} />}
            {toast.type === 'info' && <Flag size={16} />}
            <p className="text-sm font-medium">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 right-[-5%] w-[800px] h-[800px] bg-red-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-[10%] left-[-5%] w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative w-full flex flex-col gap-8">
        
        {/* Hiển thị Skeleton khi đang loading */}
        {isLoading ? (
          <PageSkeleton />
        ) : (
          <>
            {/* Header */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-red-500/30 via-orange-500/30 to-red-500/30 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition duration-700" />
              <div className="relative bg-gradient-to-br from-[#11111a] to-[#0c0c12] rounded-[2.5rem] p-8 md:p-10 border border-white/10 shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex flex-col gap-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full w-fit">
                      <Flag size={12} className="text-red-400" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-400 font-mono">Moderation Control Panel</span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter uppercase text-white leading-none">
                      Report <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-red-400">Oversight</span>
                    </h1>
                    <p className="text-xs text-slate-500 max-w-2xl">
                      Review and manage user reports, enforce community guidelines, and maintain platform safety.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        fetchReports();
                        fetchStats();
                      }}
                      className="bg-white/5 hover:bg-white/10 text-slate-300 font-mono text-[9px] font-black uppercase tracking-widest px-4 py-3 rounded-xl transition-all flex items-center gap-2 border border-white/10"
                    >
                      <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} /> 
                      {isLoading ? "Loading..." : "Refresh"}
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Stats */}
            {stats && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
              >
                <div className="bg-gradient-to-br from-[#11111a] to-[#0c0c12] border border-white/10 rounded-2xl p-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <Flag size={16} className="text-slate-400" />
                    </div>
                    <div>
                      <p className="text-[8px] font-mono text-slate-500 uppercase tracking-wider">Total Reports</p>
                      <p className="text-2xl font-black text-white">{stats.total_reports}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-[#11111a] to-[#0c0c12] border border-yellow-500/20 rounded-2xl p-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                      <Clock size={16} className="text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-[8px] font-mono text-slate-500 uppercase tracking-wider">Pending</p>
                      <p className="text-2xl font-black text-yellow-400">{stats.pending_reports}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-[#11111a] to-[#0c0c12] border border-red-500/20 rounded-2xl p-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                      <Check size={16} className="text-red-400" />
                    </div>
                    <div>
                      <p className="text-[8px] font-mono text-slate-500 uppercase tracking-wider">Approved</p>
                      <p className="text-2xl font-black text-red-400">{stats.approved_reports}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-[#11111a] to-[#0c0c12] border border-slate-500/20 rounded-2xl p-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-500/10 border border-slate-500/20 flex items-center justify-center">
                      <X size={16} className="text-slate-400" />
                    </div>
                    <div>
                      <p className="text-[8px] font-mono text-slate-500 uppercase tracking-wider">Rejected</p>
                      <p className="text-2xl font-black text-slate-400">{stats.rejected_reports}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Search & Filters */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-end"
            >
              <div className="relative w-full sm:w-80 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-red-400 transition-colors" size={14} />
                <input 
                  placeholder="Search reports..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full bg-black/40 border border-white/10 hover:border-white/20 focus:border-red-500/50 rounded-xl py-3 pl-10 pr-4 text-[11px] font-mono text-white placeholder:text-slate-600 focus:outline-none focus:bg-black/60 transition-all"
                />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border ${
                    showFilters 
                      ? 'bg-red-500/20 border-red-500/40 text-red-400' 
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <Filter size={12} />
                  Filters
                  {Object.values(filters).some(v => v !== '' && v !== 'All' && v !== 'pending') && (
                    <span className="flex h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
                  )}
                </motion.button>
                {(filters.search || filters.status !== 'pending' || filters.reason !== 'All' || filters.dateFrom || filters.dateTo) && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={resetFilters}
                    className="px-3 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all text-[8px] font-mono uppercase tracking-wider flex items-center gap-1"
                  >
                    <X size={12} /> Clear
                  </motion.button>
                )}
              </div>
            </motion.div>

            {/* Filter Panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="relative bg-gradient-to-br from-[#11111a] to-[#0c0c12] border border-white/10 rounded-2xl p-6 shadow-xl">
                    <div className="absolute inset-0 rounded-2xl overflow-hidden bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
                    <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Status */}
                      <div>
                        <label className="text-[8px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                          <Activity size={10} className="text-red-400" />
                          Status
                        </label>
                        <CustomSelect
                          value={filters.status}
                          onChange={(v) => setFilters(prev => ({ ...prev, status: v }))}
                          options={[
                            { value: "pending", label: "Pending" },
                            { value: "approved", label: "Approved" },
                            { value: "rejected", label: "Rejected" },
                            { value: "all", label: "All" },
                          ]}
                        />
                      </div>

                      {/* Reason */}
                      <div>
                        <label className="text-[8px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                          <AlertCircle size={10} className="text-red-400" />
                          Reason
                        </label>
                        <CustomSelect
                          value={filters.reason}
                          onChange={(v) => setFilters(prev => ({ ...prev, reason: v }))}
                          options={[
                            { value: "All", label: "All reasons" },
                            { value: "spam", label: "Spam" },
                            { value: "offensive", label: "Offensive" },
                            { value: "harassment", label: "Harassment" },
                            { value: "misinformation", label: "Misinformation" },
                            { value: "hate_speech", label: "Hate Speech" },
                            { value: "inappropriate_content", label: "Inappropriate" },
                            { value: "other", label: "Other" },
                          ]}
                        />
                      </div>

                      {/* From Date */}
                      <div>
                        <label className="text-[8px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                          <Calendar size={10} className="text-red-400" />
                          From Date
                        </label>
                        <CustomDatePicker
                          value={filters.dateFrom}
                          onChange={(v) => setFilters(prev => ({ ...prev, dateFrom: v }))}
                        />
                      </div>

                      {/* To Date */}
                      <div>
                        <label className="text-[8px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                          <Calendar size={10} className="text-red-400" />
                          To Date
                        </label>
                        <CustomDatePicker
                          value={filters.dateTo}
                          onChange={(v) => setFilters(prev => ({ ...prev, dateTo: v }))}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Reports Table */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="bg-gradient-to-br from-[#11111a] to-[#0c0c12] rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5 text-[8px] text-slate-400 uppercase tracking-[0.2em] font-black">
                      <th className="px-4 py-4 w-24">ID</th>
                      <th className="px-4 py-4 w-36">Reporter</th>
                      <th className="px-4 py-4 w-36">Target</th>
                      <th className="px-4 py-4">Reason</th>
                      <th className="px-4 py-4 w-28">Status</th>
                      <th className="px-4 py-4 w-32 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {reports.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-20 text-center">
                          <div className="flex flex-col items-center gap-4">
                            <div className="p-4 bg-red-500/10 rounded-2xl border border-red-500/20">
                              <ShieldCheck size={32} className="text-red-400" />
                            </div>
                            <p className="text-slate-400 font-mono text-sm font-bold">No reports found</p>
                            <p className="text-slate-500 text-[9px] font-mono">Try adjusting your search or filters</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      reports.map((report, idx) => {
                        const statusStyle = getStatusBadge(report.status);
                        const formattedDate = formatDate(report.created_at);
                        return (
                          <motion.tr 
                            key={report.report_id} 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: Math.min(idx * 0.03, 0.3) }}
                            onMouseEnter={() => setHoveredRow(report.report_id)}
                            onMouseLeave={() => setHoveredRow(null)}
                            className="hover:bg-white/5 transition-all group"
                          >
                            {/* ID */}
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 flex items-center justify-center flex-shrink-0">
                                  <Flag size={12} className="text-red-400" />
                                </div>
                                <span className="text-red-400 font-black text-[11px]">R-{report.report_id}</span>
                              </div>
                            </td>
                            
                            {/* Reporter */}
                            <td className="px-4 py-4">
                              <div className="flex flex-col">
                                <span className="text-white font-black text-sm font-sans tracking-tight">
                                  @{report.reporter?.username || 'Unknown'}
                                </span>
                                <span className="text-[8px] text-slate-500 font-mono truncate max-w-[120px]">
                                  {report.reporter?.email || ''}
                                </span>
                              </div>
                            </td>
                            
                            {/* Target */}
                            <td className="px-4 py-4">
                              <div className="flex flex-col">
                                <span className="text-white font-black text-sm font-sans tracking-tight">
                                  @{report.comment?.user?.username || 'Unknown'}
                                </span>
                                <span className="text-[8px] text-slate-500 font-mono truncate max-w-[150px]">
                                  "{report.comment?.content?.substring(0, 30) || 'N/A'}..."
                                </span>
                              </div>
                            </td>
                            
                            {/* Reason */}
                            <td className="px-4 py-4">
                              <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border ${getReasonColor(report.reason)}`}>
                                <AlertCircle size={8} />
                                <span className="text-[7px] font-black uppercase">{getReasonLabel(report.reason)}</span>
                              </div>
                            </td>
                            
                            {/* Status */}
                            <td className="px-4 py-4">
                              <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border ${statusStyle.bg}`}>
                                {statusStyle.icon}
                                <span className="text-[7px] font-black uppercase">{statusStyle.label}</span>
                              </div>
                            </td>
                            
                            {/* Actions */}
                            <td className="px-4 py-4 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <motion.button 
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => setViewModal({ show: true, data: report })} 
                                  className="p-2 bg-white/5 hover:bg-sky-500/20 rounded-lg text-slate-400 hover:text-sky-400 transition-all border border-transparent hover:border-sky-500/30"
                                  title="View report details"
                                >
                                  <Eye size={12} />
                                </motion.button>
                                {report.status === 'pending' && (
                                  <motion.button 
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                      setViewModal({ show: true, data: report });
                                      setSelectedReportId(report.report_id);
                                    }} 
                                    className="p-2 bg-white/5 hover:bg-indigo-500/20 rounded-lg text-slate-400 hover:text-indigo-400 transition-all border border-transparent hover:border-indigo-500/30"
                                    title="Process report"
                                  >
                                    <ShieldCheck size={12} />
                                  </motion.button>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-br from-[#11111a] to-[#0c0c12] border border-white/10 rounded-xl p-4"
              >
                <div className="text-[8px] font-mono text-slate-500">
                  Showing {((currentPage - 1) * 10) + 1} to{' '}
                  {Math.min(currentPage * 10, totalItems)} of {totalItems} entries
                </div>
                <div className="flex items-center gap-1.5 flex-wrap justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-[8px] font-black uppercase tracking-wider transition-all flex items-center gap-1"
                  >
                    <ChevronLeft size={10} /> Prev
                  </motion.button>
                  
                  {renderPaginationPages()}
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-[8px] font-black uppercase tracking-wider transition-all flex items-center gap-1"
                  >
                    Next <ChevronRight size={10} />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </>
        )}

        {/* View / Process Modal */}
        <AnimatePresence>
          {viewModal.show && viewModal.data && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setViewModal({ show: false, data: null })}
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gradient-to-br from-[#11111a] to-[#0c0c12] border border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
              >
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-white/5 to-transparent flex-shrink-0 sticky top-0 bg-[#11111a]/95 backdrop-blur-sm z-10">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-red-500/10 rounded-lg">
                      <Flag size={14} className="text-red-400" />
                    </div>
                    <h3 className="text-base font-black uppercase text-white">
                      Report #{viewModal.data.report_id}
                    </h3>
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-[7px] font-mono font-bold uppercase border ${getStatusBadge(viewModal.data.status).bg}`}>
                      {viewModal.data.status}
                    </span>
                  </div>
                  <button 
                    onClick={() => setViewModal({ show: false, data: null })} 
                    className="text-slate-500 hover:text-white p-1.5 rounded-lg bg-white/5 transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>
                
                <div className="p-6 flex-1 overflow-y-auto">
                  <div className="space-y-4">
                    {/* Reporter & Target */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[8px] font-mono font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                          <UserCheck size={10} /> Reporter
                        </label>
                        <div className="bg-black/40 border border-white/10 rounded-xl p-3">
                          <p className="text-sm font-bold text-white">@{viewModal.data.reporter?.username || 'Unknown'}</p>
                          <p className="text-[9px] text-slate-500">{viewModal.data.reporter?.email || ''}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[8px] font-mono font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                          <Users size={10} /> Target User
                        </label>
                        <div className="bg-black/40 border border-white/10 rounded-xl p-3">
                          <p className="text-sm font-bold text-white">@{viewModal.data.comment?.user?.username || 'Unknown'}</p>
                          <p className="text-[9px] text-slate-500">Comment ID: {viewModal.data.comment_id}</p>
                        </div>
                      </div>
                    </div>

                    {/* Reason */}
                    <div className="space-y-2">
                      <label className="text-[8px] font-mono font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                        <AlertCircle size={10} /> Reason
                      </label>
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${getReasonColor(viewModal.data.reason)}`}>
                        <AlertCircle size={10} />
                        <span className="text-[9px] font-black uppercase">{getReasonLabel(viewModal.data.reason)}</span>
                      </div>
                    </div>

                    {viewModal.data.description && (
                      <div className="space-y-2">
                        <label className="text-[8px] font-mono font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                          <MessageSquare size={10} /> Additional Details
                        </label>
                        <div className="bg-black/40 border border-white/10 rounded-xl p-3">
                          <p className="text-sm text-slate-300">{viewModal.data.description}</p>
                        </div>
                      </div>
                    )}

                    {/* Comment Content */}
                    <div className="space-y-2">
                      <label className="text-[8px] font-mono font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                        <MessageSquare size={10} /> Reported Comment
                      </label>
                      <div className="bg-black/40 border border-white/10 rounded-xl p-3">
                        <p className="text-sm text-slate-300 italic">"{viewModal.data.comment?.content || 'Comment deleted'}"</p>
                      </div>
                    </div>

                    {/* Timestamp */}
                    <div className="space-y-2">
                      <label className="text-[8px] font-mono font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                        <Calendar size={10} /> Reported At
                      </label>
                      <div className="bg-black/40 border border-white/10 rounded-xl p-3">
                        <p className="text-sm font-mono text-slate-300">{new Date(viewModal.data.created_at).toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Review Info */}
                    {viewModal.data.status !== 'pending' && viewModal.data.reviewer && (
                      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                          {viewModal.data.status === 'approved' ? (
                            <Check size={16} className="text-red-400" />
                          ) : (
                            <X size={16} className="text-slate-400" />
                          )}
                          <div>
                            <p className="text-[9px] font-mono text-slate-300">
                              {viewModal.data.status === 'approved' ? 'Approved' : 'Rejected'} by @{viewModal.data.reviewer?.username}
                            </p>
                            {viewModal.data.action_taken !== 'none' && (
                              <p className="text-[8px] font-mono text-slate-400">
                                Action: {getActionLabel(viewModal.data.action_taken)}
                              </p>
                            )}
                            {viewModal.data.ban_until && (
                              <p className="text-[8px] font-mono text-yellow-400">
                                Banned until: {new Date(viewModal.data.ban_until).toLocaleDateString()}
                              </p>
                            )}
                            {viewModal.data.admin_note && (
                              <p className="text-[8px] font-mono text-slate-500 mt-1">
                                Note: {viewModal.data.admin_note}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions - Only show for pending reports */}
                {viewModal.data.status === 'pending' && (
                  <div className="p-6 border-t border-white/10 bg-gradient-to-t from-[#11111a] to-[#0d0d14] flex-shrink-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[8px] font-mono font-black text-slate-500 uppercase tracking-widest block mb-1">
                          <ShieldCheck size={10} className="inline mr-1" /> Action *
                        </label>
                        <CustomSelect
                          value={action}
                          onChange={(v) => setAction(v)}
                          options={[
                            { value: "", label: "Select action..." },
                            { value: "warning", label: "⚠️ Warning" },
                            { value: "delete_comment", label: "🗑️ Delete Comment" },
                            { value: "temporary_ban", label: "🔒 Temporary Ban" },
                            { value: "permanent_ban", label: "🚫 Permanent Ban" },
                            { value: "none", label: "⏭️ No Action" },
                          ]}
                        />
                      </div>

                      {action === 'temporary_ban' && (
                        <div>
                          <label className="text-[8px] font-mono font-black text-slate-500 uppercase tracking-widest block mb-1">
                            <Clock size={10} className="inline mr-1" /> Ban Duration (days)
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="365"
                            value={banDays}
                            onChange={(e) => setBanDays(Number(e.target.value))}
                            className="w-full bg-black/40 border border-white/10 focus:border-red-500/50 rounded-xl px-3 py-2.5 text-sm font-mono text-white outline-none transition-all"
                          />
                        </div>
                      )}

                      <div className="md:col-span-2">
                        <label className="text-[8px] font-mono font-black text-slate-500 uppercase tracking-widest block mb-1">
                          <Edit size={10} className="inline mr-1" /> Admin Note
                        </label>
                        <textarea
                          value={adminNote}
                          onChange={(e) => setAdminNote(e.target.value)}
                          placeholder="Add notes about this report..."
                          className="w-full bg-black/40 border border-white/10 focus:border-red-500/50 rounded-xl px-3 py-2.5 text-sm font-mono text-white outline-none transition-all resize-none min-h-[60px]"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => handleReview(viewModal.data!.report_id)}
                        disabled={processing || !action}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white text-[9px] font-black uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-red-600/30"
                      >
                        {processing ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />}
                        Process Report
                      </button>
                      <button
                        onClick={() => handleReject(viewModal.data!.report_id)}
                        disabled={processing}
                        className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-all text-[9px] font-black uppercase tracking-wider disabled:opacity-50 flex items-center gap-2"
                      >
                        <X size={14} /> Reject
                      </button>
                    </div>
                  </div>
                )}

                {/* Close button for processed reports */}
                {viewModal.data.status !== 'pending' && (
                  <div className="p-4 border-t border-white/10 bg-gradient-to-t from-[#11111a] to-[#0d0d14] flex-shrink-0 flex justify-end">
                    <button
                      onClick={() => setViewModal({ show: false, data: null })}
                      className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all"
                    >
                      Close
                    </button>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}