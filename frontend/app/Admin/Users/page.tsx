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
          open ? "border-indigo-500/50 bg-black/60" : "border-white/10 hover:border-white/20"
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
                    ? "bg-indigo-500/15 text-indigo-300"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span>{opt.label}</span>
                {opt.value === value && <CheckCircle2 size={12} className="text-indigo-400" />}
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
          open ? "border-indigo-500/50 bg-black/60" : "border-white/10 hover:border-white/20"
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
                        ? "bg-indigo-500 text-white font-bold"
                        : isToday
                        ? "border border-indigo-500/50 text-indigo-300"
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
                className="text-[9px] font-mono text-indigo-400 hover:text-indigo-300 uppercase tracking-wider transition-colors"
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
          <div className="h-12 w-28 bg-white/5 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
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
    <th className="px-4 py-4 w-20"><div className="h-3 w-10 bg-white/5 rounded animate-pulse" /></th>
    <th className="px-4 py-4"><div className="h-3 w-16 bg-white/5 rounded animate-pulse" /></th>
    <th className="px-4 py-4 w-24"><div className="h-3 w-10 bg-white/5 rounded animate-pulse" /></th>
    <th className="px-4 py-4 w-24"><div className="h-3 w-12 bg-white/5 rounded animate-pulse" /></th>
    <th className="px-4 py-4 w-32"><div className="h-3 w-14 bg-white/5 rounded animate-pulse" /></th>
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
          <tbody>
            {[...Array(10)].map((_, idx) => {
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
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-lg bg-white/5 animate-pulse" />
                      <div className="h-4 w-10 bg-white/5 rounded animate-pulse" />
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      <div className="h-4 w-20 bg-white/5 rounded animate-pulse" />
                      <div className="h-3 w-28 bg-white/5 rounded animate-pulse" />
                    </div>
                  </td>
                  <td className="px-4 py-4"><div className="h-6 w-16 bg-white/5 rounded-lg animate-pulse" /></td>
                  <td className="px-4 py-4"><div className="h-6 w-20 bg-white/5 rounded-lg animate-pulse" /></td>
                  <td className="px-4 py-4"><div className="h-4 w-24 bg-white/5 rounded animate-pulse" /></td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <div className="w-7 h-7 bg-white/5 rounded-lg animate-pulse" />
                      <div className="w-7 h-7 bg-white/5 rounded-lg animate-pulse" />
                      <div className="w-7 h-7 bg-white/5 rounded-lg animate-pulse" />
                      <div className="w-7 h-7 bg-white/5 rounded-lg animate-pulse" />
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
    <SearchSkeleton />
    <TableSkeleton />
    <PaginationSkeleton />
  </div>
);

// ---------- Main Component ----------
interface UserRegistryItem {
  user_id: number;
  username: string;
  email: string;
  role: string;
  is_active: number | boolean; 
  created_at: string;
}

interface SystemActivityItem {
  id: number;
  type: 'conversion' | 'comment' | 'reply' | 'favorite' | 'like';
  action: string;
  title: string;
  details: string;
  rating?: number;
  created_at: string;
}

interface FilterState {
  search: string;
  role: string;
  status: string;
  dateFrom: string;
  dateTo: string;
}

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  visible: boolean;
}

export default function UserPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserRegistryItem[]>([]);
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
    role: 'All',
    status: 'All',
    dateFrom: '',
    dateTo: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modal states
  const [userModal, setUserModal] = useState<{ show: boolean; mode: "create" | "edit"; data: UserRegistryItem | null }>({
    show: false, mode: "create", data: null
  });
  const [viewModal, setViewModal] = useState<{ show: boolean; data: UserRegistryItem | null }>({
    show: false, data: null
  });
  const [userForm, setUserForm] = useState<UserRegistryItem>({
    user_id: 0, username: "", email: "", role: "user", is_active: 1, created_at: ""
  });

  // Activity modal states
  const [systemActivities, setSystemActivities] = useState<SystemActivityItem[]>([]);
  const [systemActivitiesLoading, setSystemActivitiesLoading] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [activityCurrentPage, setActivityCurrentPage] = useState(1);
  const [activityTotalPages, setActivityTotalPages] = useState(1);
  const [activityTotal, setActivityTotal] = useState(0);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const API_BASE = "/api/laravel";

  const showToast = (message: string, type: ToastState['type'] = 'info') => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  };

  const fetchUsers = useCallback(async () => {
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
      if (filters.role && filters.role !== 'All') params.append('role', filters.role);
      if (filters.status && filters.status !== 'All') params.append('status', filters.status);
      if (filters.dateFrom) params.append('date_from', filters.dateFrom);
      if (filters.dateTo) params.append('date_to', filters.dateTo);

      const response = await fetch(`http://localhost:8000/api/admin/users?${params.toString()}`, {
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
      if (data.success) {
        setUsers(data.data);
        setTotalPages(data.pagination?.last_page || 1);
        setTotalItems(data.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      showToast("Failed to load users", "error");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, filters]);

  const fetchSystemActivities = useCallback(async (page = 1, userId?: number) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setSystemActivitiesLoading(true);
    try {
      const url = userId 
        ? `${API_BASE}/user/all-activities?page=${page}&per_page=12&user_id=${userId}`
        : `${API_BASE}/user/all-activities?page=${page}&per_page=12`;
      const res = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });
      const data = await res.json();

      if (res.ok && Array.isArray(data.activities)) {
        setSystemActivities(data.activities);
        setActivityTotal(data.total || data.activities.length);
        setActivityTotalPages(data.last_page || Math.ceil((data.total || data.activities.length) / 12));
      } else {
        setSystemActivities([]);
        setActivityTotal(0);
        setActivityTotalPages(1);
      }
    } catch (error) {
      console.error("Fetch activities error:", error);
      setSystemActivities([]);
      setActivityTotal(0);
      setActivityTotalPages(1);
    } finally {
      setSystemActivitiesLoading(false);
    }
  }, [API_BASE]);

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
    fetchUsers();
  }, [router, fetchUsers]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [filters.search, filters.role, filters.status]);

  const resetFilters = () => {
    setFilters({
      search: '',
      role: 'All',
      status: 'All',
      dateFrom: '',
      dateTo: ''
    });
    setCurrentPage(1);
  };

  const getRoleColor = (role: string) => {
    switch(role) {
      case 'admin': return { bg: 'from-red-500/20 to-red-600/10', text: 'text-red-400', border: 'border-red-500/30', icon: <Crown size={10} /> };
      case 'editor': return { bg: 'from-amber-500/20 to-amber-600/10', text: 'text-amber-400', border: 'border-amber-500/30', icon: <Star size={10} /> };
      default: return { bg: 'from-indigo-500/20 to-indigo-600/10', text: 'text-indigo-400', border: 'border-indigo-500/30', icon: <Shield size={10} /> };
    }
  };

  const getActivityTypeBadge = (type: string) => {
    switch(type) {
      case 'conversion':
        return { icon: <ArrowRight size={10} />, color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', label: 'CONVERSION' };
      case 'comment':
        return { icon: <MessageSquare size={10} />, color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20', label: 'COMMENT' };
      case 'reply':
        return { icon: <Reply size={10} />, color: 'bg-purple-500/10 text-purple-400 border-purple-500/20', label: 'REPLY' };
      case 'favorite':
        return { icon: <Star size={10} />, color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', label: 'SAVED' };
      case 'like':
        return { icon: <ThumbsUp size={10} />, color: 'bg-pink-500/10 text-pink-400 border-pink-500/20', label: 'LIKE' };
      default:
        return { icon: <Activity size={10} />, color: 'bg-slate-500/10 text-slate-400 border-slate-500/20', label: 'ACTIVITY' };
    }
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

  const openUserModal = (mode: "create" | "edit", item?: UserRegistryItem) => {
    if (mode === "edit" && item) {
      setUserForm({ ...item });
      setUserModal({ show: true, mode: "edit", data: item });
    } else {
      setUserForm({
        user_id: Date.now(),
        username: "",
        email: "",
        role: "user",
        is_active: 1,
        created_at: new Date().toISOString()
      });
      setUserModal({ show: true, mode: "create", data: null });
    }
  };

  const openViewModal = (item: UserRegistryItem) => {
    setViewModal({ show: true, data: item });
  };

  const openActivityModal = (userId?: number) => {
    setSelectedUserId(userId || null);
    setShowActivityModal(true);
    fetchSystemActivities(1, userId);
    setActivityCurrentPage(1);
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const url = `http://localhost:8000/api/admin/users`;
      const method = userModal.mode === "edit" ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...(userModal.mode === "edit" && { user_id: userForm.user_id }),
          username: userForm.username,
          email: userForm.email,
          role: userForm.role,
          is_active: userForm.is_active,
        }),
      });

      const data = await response.json();
      if (data.success) {
        showToast(
          userModal.mode === "edit" ? `Calibrated credentials for @${userForm.username}` : `Provisioned access block: @${userForm.username}`,
          "success"
        );
        fetchUsers();
        setUserModal({ show: false, mode: "create", data: null });
      } else {
        showToast(data.message || "Failed to save user", "error");
      }
    } catch (error) {
      console.error('Error saving user:', error);
      showToast("Error saving user", "error");
    }
  };

  const toggleUserActiveState = async (userId: number) => {
    try {
      const token = localStorage.getItem("token");
      const user = users.find(u => u.user_id === userId);
      if (!user) return;

      const response = await fetch(`http://localhost:8000/api/admin/users/${userId}/toggle-active`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: user.is_active ? 0 : 1 }),
      });

      const data = await response.json();
      if (data.success) {
        showToast(
          user.is_active ? "OPERATOR BLOCK DEFUSED" : "OPERATOR ACCESS SECURED",
          "success"
        );
        fetchUsers();
      } else {
        showToast(data.message || "Failed to update user status", "error");
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
      showToast("Error updating user status", "error");
    }
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      const token = localStorage.getItem("token");
      const user = users.find(u => u.user_id === userId);
      
      const response = await fetch(`http://localhost:8000/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        setUsers(prev => prev.filter(u => u.user_id !== userId));
        showToast(`Operator keys deleted: @${user?.username}`, "success");
      } else {
        const data = await response.json();
        showToast(data.message || "Failed to delete user", "error");
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      showToast("Error deleting user", "error");
    } finally {
      setShowDeleteConfirm(null);
    }
  };

  const exportActivitiesToCSV = () => {
    if (systemActivities.length === 0) {
      showToast("No activities to export", "info");
      return;
    }

    const headers = ["ID", "Type", "Action", "Title", "Details", "Timestamp"];
    const csvContent = [
      headers.join(","),
      ...systemActivities.map(item => [
        item.id,
        item.type,
        `"${item.action.replace(/"/g, '""')}"`,
        `"${item.title.replace(/"/g, '""')}"`,
        `"${item.details.replace(/"/g, '""')}"`,
        item.created_at
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `user_activities_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Activities exported successfully", "success");
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
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md'
              : 'bg-white/5 hover:bg-white/10 text-slate-400'
          }`}
        >
          {pageNum}
        </motion.button>
      );
    });
  };

  return (
    <div className="min-h-screen bg-[#05050a] text-slate-100 flex flex-col font-sans pt-28 pb-20 selection:bg-indigo-500/30 overflow-x-hidden">
      
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
            {toast.type === 'info' && <Users size={16} />}
            <p className="text-sm font-medium">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 right-[-5%] w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-[10%] left-[-5%] w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[120px]" />
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
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/30 via-purple-500/30 to-indigo-500/30 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition duration-700" />
              <div className="relative bg-gradient-to-br from-[#11111a] to-[#0c0c12] rounded-[2.5rem] p-8 md:p-10 border border-white/10 shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex flex-col gap-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full w-fit">
                      <ShieldCheck size={12} className="text-indigo-400" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 font-mono">User Security Roster</span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter uppercase text-white leading-none">
                      Node <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-400 to-cyan-400">Operators</span>
                    </h1>
                    <p className="text-xs text-slate-500 max-w-2xl">
                      Manage user access, roles, and security permissions for the network.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => fetchUsers()}
                      className="bg-white/5 hover:bg-white/10 text-slate-300 font-mono text-[9px] font-black uppercase tracking-widest px-4 py-3 rounded-xl transition-all flex items-center gap-2 border border-white/10"
                    >
                      <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} /> 
                      {isLoading ? "Loading..." : "Refresh"}
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => openUserModal("create")} 
                      className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-mono text-[9px] font-black uppercase tracking-widest px-6 py-3 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/30"
                    >
                      <Plus size={14} /> Install New Node
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Search & Filters */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-end"
            >
              <div className="relative w-full sm:w-80 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={14} />
                <input 
                  placeholder="Filter by sign-call or identifier..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full bg-black/40 border border-white/10 hover:border-white/20 focus:border-indigo-500/50 rounded-xl py-3 pl-10 pr-4 text-[11px] font-mono text-white placeholder:text-slate-600 focus:outline-none focus:bg-black/60 transition-all"
                />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border ${
                    showFilters 
                      ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400' 
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <Filter size={12} />
                  Filters
                  {Object.values(filters).some(v => v !== '' && v !== 'All') && (
                    <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  )}
                </motion.button>
                {(filters.search || filters.role !== 'All' || filters.status !== 'All' || filters.dateFrom || filters.dateTo) && (
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
                      {/* Role */}
                      <div>
                        <label className="text-[8px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                          <Shield size={10} className="text-indigo-400" />
                          Role
                        </label>
                        <CustomSelect
                          value={filters.role}
                          onChange={(v) => setFilters(prev => ({ ...prev, role: v }))}
                          options={[
                            { value: "All", label: "All roles" },
                            { value: "admin", label: "Administrator" },
                            { value: "editor", label: "Editor" },
                            { value: "user", label: "User" },
                          ]}
                        />
                      </div>

                      {/* Status */}
                      <div>
                        <label className="text-[8px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                          <Activity size={10} className="text-indigo-400" />
                          Status
                        </label>
                        <CustomSelect
                          value={filters.status}
                          onChange={(v) => setFilters(prev => ({ ...prev, status: v }))}
                          options={[
                            { value: "All", label: "All status" },
                            { value: "active", label: "Active" },
                            { value: "inactive", label: "Inactive" },
                          ]}
                        />
                      </div>

                      {/* From Date */}
                      <div>
                        <label className="text-[8px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                          <Calendar size={10} className="text-indigo-400" />
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
                          <Calendar size={10} className="text-indigo-400" />
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

            {/* Users Table */}
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
                      <th className="px-4 py-4 w-20">Node</th>
                      <th className="px-4 py-4">Operator</th>
                      <th className="px-4 py-4 w-24">Rank</th>
                      <th className="px-4 py-4 w-24">Status</th>
                      <th className="px-4 py-4 w-32">Joined</th>
                      <th className="px-4 py-4 w-32 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      // Hiển thị 10 dòng trống khi không có dữ liệu
                      [...Array(10)].map((_, idx) => (
                        <tr key={`empty-${idx}`} className="pointer-events-none">
                          <td className="px-4 py-4 h-[73px] border-none">&nbsp;</td>
                          <td className="px-4 py-4 h-[73px] border-none">&nbsp;</td>
                          <td className="px-4 py-4 h-[73px] border-none">&nbsp;</td>
                          <td className="px-4 py-4 h-[73px] border-none">&nbsp;</td>
                          <td className="px-4 py-4 h-[73px] border-none">&nbsp;</td>
                          <td className="px-4 py-4 h-[73px] text-center border-none">&nbsp;</td>
                        </tr>
                      ))
                    ) : (
                      <>
                        {users.map((user, idx) => {
                          const roleColor = getRoleColor(user.role);
                          const formattedDate = formatDate(user.created_at);
                          return (
                            <motion.tr 
                              key={user.user_id} 
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: Math.min(idx * 0.03, 0.3) }}
                              onMouseEnter={() => setHoveredRow(user.user_id)}
                              onMouseLeave={() => setHoveredRow(null)}
                              className="hover:bg-white/5 transition-all group border-b border-white/5"
                            >
                              {/* Node */}
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-1.5">
                                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
                                    <Users size={10} className="text-indigo-400" />
                                  </div>
                                  <span className="text-indigo-400 font-black text-[10px] whitespace-nowrap">U-{user.user_id}</span>
                                </div>
                              </td>
                              
                              {/* Operator */}
                              <td className="px-4 py-4">
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-2">
                                    <span className="text-white font-black text-sm font-sans tracking-tight">@{user.username}</span>
                                    {user.role === 'admin' && (
                                      <span className="text-[7px] font-mono font-bold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">ADMIN</span>
                                    )}
                                  </div>
                                  <span className="text-[8px] text-slate-500 font-mono flex items-center gap-1">
                                    <Mail size={8} /> {user.email}
                                  </span>
                                </div>
                              </td>
                              
                              {/* Rank */}
                              <td className="px-4 py-4">
                                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-gradient-to-br ${roleColor.bg} border ${roleColor.border}`}>
                                  {roleColor.icon}
                                  <span className={`text-[7px] font-black uppercase ${roleColor.text}`}>{user.role}</span>
                                </div>
                              </td>
                              
                              {/* Status */}
                              <td className="px-4 py-4">
                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => toggleUserActiveState(user.user_id)}
                                  className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[7px] font-black uppercase tracking-wider border transition-all ${
                                    user.is_active 
                                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20" 
                                      : "bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20"
                                  }`}
                                >
                                  {user.is_active ? <UserCheck size={9} /> : <UserX size={9} />}
                                  {user.is_active ? "SECURED" : "DEFUSED"}
                                </motion.button>
                              </td>
                              
                              {/* Joined */}
                              <td className="px-4 py-4">
                                <div className="flex flex-col whitespace-nowrap">
                                  <span className="text-[9px] text-slate-400 font-mono">{formattedDate.date}</span>
                                  <span className="text-[7px] text-slate-600 font-mono">{formattedDate.time}</span>
                                </div>
                              </td>
                              
                              {/* Actions */}
                              <td className="px-4 py-4 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <motion.button 
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => openViewModal(user)} 
                                    className="p-1.5 bg-white/5 hover:bg-sky-500/20 rounded-lg text-slate-400 hover:text-sky-400 transition-all border border-transparent hover:border-sky-500/30"
                                    title="View user details"
                                  >
                                    <Eye size={11} />
                                  </motion.button>
                                  <motion.button 
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => openUserModal("edit", user)} 
                                    className="p-1.5 bg-white/5 hover:bg-indigo-500/20 rounded-lg text-slate-400 hover:text-indigo-400 transition-all border border-transparent hover:border-indigo-500/30"
                                    title="Edit user"
                                  >
                                    <Edit size={11} />
                                  </motion.button>
                                  <motion.button 
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setShowDeleteConfirm(user.user_id)} 
                                    className="p-1.5 bg-white/5 hover:bg-rose-500/20 rounded-lg text-slate-400 hover:text-rose-400 transition-all border border-transparent hover:border-rose-500/30"
                                    title="Delete user"
                                  >
                                    <Trash2 size={11} />
                                  </motion.button>
                                  <motion.button 
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => openActivityModal(user.user_id)} 
                                    className="p-1.5 bg-white/5 hover:bg-emerald-500/20 rounded-lg text-slate-400 hover:text-emerald-400 transition-all border border-transparent hover:border-emerald-500/30"
                                    title="View user activity history"
                                  >
                                    <History size={11} />
                                  </motion.button>
                                </div>
                              </td>
                            </motion.tr>
                          );
                        })}
                        
                        {/* Thêm dòng trống để đủ 10 dòng - KHÔNG CÓ GẠCH NGANG */}
                        {users.length < 10 && [...Array(10 - users.length)].map((_, idx) => (
                          <tr key={`empty-${idx}`} className="pointer-events-none">
                            <td className="px-4 py-4 h-[73px] border-none">&nbsp;</td>
                            <td className="px-4 py-4 h-[73px] border-none">&nbsp;</td>
                            <td className="px-4 py-4 h-[73px] border-none">&nbsp;</td>
                            <td className="px-4 py-4 h-[73px] border-none">&nbsp;</td>
                            <td className="px-4 py-4 h-[73px] border-none">&nbsp;</td>
                            <td className="px-4 py-4 h-[73px] text-center border-none">&nbsp;</td>
                          </tr>
                        ))}
                      </>
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

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteConfirm(null)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setShowDeleteConfirm(null);
              }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-modal-title"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gradient-to-br from-[#11111a] to-[#0c0c12] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-500/10 rounded-xl border border-red-500/30">
                    <AlertCircle size={20} className="text-red-400" />
                  </div>
                  <h3 id="delete-modal-title" className="text-sm font-black text-white font-mono uppercase">Delete Operator</h3>
                </div>
                <p className="text-slate-400 text-sm mb-6">
                  Are you sure you want to permanently delete this user? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all font-mono text-[9px] font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-white/20"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteUser(showDeleteConfirm)}
                    className="flex-1 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white transition-all font-mono text-[9px] font-bold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500/50 flex items-center justify-center gap-2"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* User Modal */}
        <AnimatePresence>
          {userModal.show && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setUserModal({ show: false, mode: "create", data: null })}
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gradient-to-br from-[#11111a] to-[#0c0c12] border border-white/10 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-white/5 to-transparent sticky top-0 bg-[#11111a]/95 backdrop-blur-sm z-10">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-500/10 rounded-lg">
                      {userModal.mode === "edit" ? <Edit size={14} className="text-indigo-400" /> : <Plus size={14} className="text-indigo-400" />}
                    </div>
                    <div>
                      <h3 className="text-base font-black uppercase text-white">
                        {userModal.mode === "edit" ? "Adjust Node Keys" : "Install New Node"}
                      </h3>
                      <p className="text-[7px] text-slate-500 font-mono">User Parameters Configuration</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setUserModal({ show: false, mode: "create", data: null })} 
                    className="text-slate-500 hover:text-white p-1.5 rounded-lg bg-white/5 transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>

                <form onSubmit={handleUserSubmit} className="p-6 flex flex-col gap-5">
                  <div className="space-y-3">
                    <label className="text-[8px] font-mono font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                      <UserCheck size={10} /> Username
                    </label>
                    <input 
                      required 
                      value={userForm.username} 
                      onChange={(e) => setUserForm({ ...userForm, username: e.target.value })} 
                      placeholder="Enter username" 
                      className="w-full bg-black/40 border border-white/10 focus:border-indigo-500/50 rounded-xl p-3 text-sm font-mono text-white outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[8px] font-mono font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                      <Mail size={10} /> Email Address
                    </label>
                    <input 
                      required 
                      type="email" 
                      value={userForm.email} 
                      onChange={(e) => setUserForm({ ...userForm, email: e.target.value })} 
                      placeholder="user@example.com" 
                      className="w-full bg-black/40 border border-white/10 focus:border-indigo-500/50 rounded-xl p-3 text-sm font-mono text-white outline-none transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <label className="text-[8px] font-mono font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                        <Shield size={10} /> Role
                      </label>
                      <CustomSelect
                        value={userForm.role}
                        onChange={(v) => setUserForm({ ...userForm, role: v })}
                        options={[
                          { value: "admin", label: "Administrator" },
                          { value: "editor", label: "Editor" },
                          { value: "user", label: "User" },
                        ]}
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[8px] font-mono font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                        <Activity size={10} /> Status
                      </label>
                      <CustomSelect
                        value={userForm.is_active ? "active" : "inactive"}
                        onChange={(v) => setUserForm({ ...userForm, is_active: v === "active" ? 1 : 0 })}
                        options={[
                          { value: "active", label: "Active" },
                          { value: "inactive", label: "Inactive" },
                        ]}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-2">
                    <button
                      type="button"
                      onClick={() => setUserModal({ show: false, mode: "create", data: null })}
                      className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all"
                    >
                      Cancel
                    </button>
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit" 
                      className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/30"
                    >
                      <Save size={12} /> Commit Keys
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* View Modal */}
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
                className="bg-gradient-to-br from-[#11111a] to-[#0c0c12] border border-white/10 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
              >
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-white/5 to-transparent">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-sky-500/10 rounded-lg">
                      <Eye size={14} className="text-sky-400" />
                    </div>
                    <h3 className="text-base font-black uppercase text-white">View Node Details</h3>
                  </div>
                  <button 
                    onClick={() => setViewModal({ show: false, data: null })} 
                    className="text-slate-500 hover:text-white p-1.5 rounded-lg bg-white/5 transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="p-6 flex flex-col gap-5">
                  <div className="space-y-3">
                    <label className="text-[8px] font-mono font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                      <Hash size={10} /> Node ID
                    </label>
                    <div className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm font-mono text-slate-300">
                      U-{viewModal.data.user_id}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[8px] font-mono font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                      <UserCheck size={10} /> Username
                    </label>
                    <div className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm font-mono text-white">
                      @{viewModal.data.username}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[8px] font-mono font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                      <Mail size={10} /> Email Address
                    </label>
                    <div className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm font-mono text-white">
                      {viewModal.data.email}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <label className="text-[8px] font-mono font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                        <Shield size={10} /> Role
                      </label>
                      <div className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-br ${getRoleColor(viewModal.data.role).bg} border ${getRoleColor(viewModal.data.role).border}`}>
                        {getRoleColor(viewModal.data.role).icon}
                        <span className={`text-[8px] font-black uppercase ${getRoleColor(viewModal.data.role).text}`}>{viewModal.data.role}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[8px] font-mono font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                        <Activity size={10} /> Status
                      </label>
                      <div className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border ${
                        viewModal.data.is_active 
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                          : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                      }`}>
                        {viewModal.data.is_active ? <UserCheck size={10} /> : <UserX size={10} />}
                        <span className="text-[8px] font-black uppercase">{viewModal.data.is_active ? "ACTIVE" : "INACTIVE"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[8px] font-mono font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                      <Calendar size={10} /> Created At
                    </label>
                    <div className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm font-mono text-slate-300">
                      {new Date(viewModal.data.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={() => setViewModal({ show: false, data: null })}
                      className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Activity Modal */}
        <AnimatePresence mode="wait">
          {showActivityModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="absolute inset-0 bg-black/80"
                onClick={() => setShowActivityModal(false)}
              />
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ duration: 0.15, type: "spring", stiffness: 400 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-[95vw] max-h-[95vh] h-full bg-gradient-to-br from-[#0a0a0f] to-[#050508] rounded-2xl border border-indigo-500/30 shadow-2xl shadow-indigo-500/20 flex flex-col overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#11111a] to-[#0d0d14] border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 cursor-pointer transition-colors" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-500 cursor-pointer transition-colors" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80 hover:bg-green-500 cursor-pointer transition-colors" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-indigo-500/10 rounded-lg">
                      <History size={14} className="text-indigo-400" />
                    </div>
                    <h3 className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-widest">
                      System Transaction Log
                    </h3>
                    <div className="flex items-center gap-1.5 ml-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[7px] font-mono text-emerald-500">LIVE</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowActivityModal(false)}
                    className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Table Container */}
                <div className="flex-1 overflow-auto custom-scrollbar">
                  {systemActivitiesLoading ? (
                    <div className="flex justify-center py-20">
                      <div className="relative">
                        <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full" />
                        <Loader2 className="animate-spin text-indigo-500 relative z-10" size={32} />
                      </div>
                    </div>
                  ) : systemActivities.length > 0 ? (
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-indigo-500/20 bg-[#0a0a0f] shadow-lg">
                          <th className="z-20 text-[8px] font-mono font-black text-indigo-400 uppercase tracking-[0.2em] text-left py-4 px-3 bg-[#0a0a0f]">
                            <div className="flex items-center gap-1.5">TYPE</div>
                          </th>
                          <th className="z-20 text-[8px] font-mono font-black text-indigo-400 uppercase tracking-[0.2em] text-left py-4 px-3 bg-[#0a0a0f]">
                            <div className="flex items-center gap-1.5">ACTION / TITLE</div>
                          </th>
                          <th className="z-20 text-[8px] font-mono font-black text-indigo-400 uppercase tracking-[0.2em] text-left py-4 px-3 bg-[#0a0a0f]">
                            <div className="flex items-center gap-1.5">DETAILS</div>
                          </th>
                          <th className="z-20 text-[8px] font-mono font-black text-indigo-400 uppercase tracking-[0.2em] text-right py-4 px-3 bg-[#0a0a0f]">
                            <div className="flex items-center justify-end gap-1.5">TIMESTAMP</div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {systemActivities.map((item, index) => {
                          const badge = getActivityTypeBadge(item.type);
                          const formattedDate = new Date(item.created_at).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          });
                          return (
                            <motion.tr 
                              key={`${item.type}-${item.id}`}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.02 }}
                              className="border-b border-white/[0.03] hover:bg-gradient-to-r hover:from-indigo-500/10 hover:to-transparent transition-all duration-300"
                            >
                              <td className="py-3 px-3">
                                <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border ${badge.color}`}>
                                  {badge.icon}
                                  <span className="text-[7px] font-black uppercase">{badge.label}</span>
                                </div>
                              </td>
                              <td className="py-3 px-3">
                                <div className="flex flex-col">
                                  <span className="text-[10px] font-bold text-white">{item.action}</span>
                                  <span className="text-[8px] font-mono text-slate-500 truncate max-w-[250px]">{item.title}</span>
                                </div>
                              </td>
                              <td className="py-3 px-3">
                                <span className="text-[9px] font-mono text-slate-400 line-clamp-2">{item.details}</span>
                              </td>
                              <td className="py-3 px-3 text-right">
                                <span className="text-[9px] font-mono text-slate-300">{formattedDate}</span>
                              </td>
                            </motion.tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) : (
                    <div className="flex flex-col items-center gap-4 py-20 text-center select-none">
                      <div className="relative">
                        <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full" />
                        <div className="relative p-4 bg-gradient-to-br from-indigo-500/10 to-sky-500/10 rounded-2xl border border-indigo-500/20">
                          <Database size={40} className="text-indigo-400" />
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <p className="text-slate-400 text-sm font-bold font-mono">No Activity Found</p>
                        <p className="text-slate-500 text-[10px] font-mono">No user activities recorded yet.</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer with Pagination & Export */}
                {activityTotal > 0 && (
                  <div className="px-6 py-4 bg-gradient-to-t from-[#11111a] to-[#0d0d14] border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center">
                        <History size={12} className="text-indigo-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[7px] font-mono text-slate-500 uppercase tracking-wider">Total Records</span>
                        <span className="text-[11px] font-mono font-bold text-indigo-400">{activityTotal}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={exportActivitiesToCSV}
                        className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/30"
                      >
                        <Download size={10} /> Export CSV
                      </button>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const newPage = Math.max(1, activityCurrentPage - 1);
                            setActivityCurrentPage(newPage);
                            fetchSystemActivities(newPage, selectedUserId || undefined);
                          }}
                          disabled={activityCurrentPage === 1}
                          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-[8px] font-black uppercase tracking-wider transition-all flex items-center gap-1"
                        >
                          <ChevronLeft size={10} /> Prev
                        </button>
                        <span className="text-[8px] font-mono text-slate-500 px-2">
                          Page {activityCurrentPage} of {activityTotalPages}
                        </span>
                        <button
                          onClick={() => {
                            const newPage = Math.min(activityTotalPages, activityCurrentPage + 1);
                            setActivityCurrentPage(newPage);
                            fetchSystemActivities(newPage, selectedUserId || undefined);
                          }}
                          disabled={activityCurrentPage === activityTotalPages}
                          className="px-3 py-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-[8px] font-black uppercase tracking-wider transition-all flex items-center gap-1"
                        >
                          Next <ChevronRight size={10} />
                        </button>
                      </div>
                    </div>
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