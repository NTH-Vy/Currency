// app/admin/comments/page.tsx
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { 
  MessageSquare, Search, ShieldCheck, Trash2, Loader2, 
  ThumbsUp, Star, Newspaper, Check, ShieldAlert,
  Activity, Clock, User, ChevronRight, 
  ChevronLeft, Hash, Calendar, Eye, RefreshCw, AlertCircle,
  Filter, X, Flag, MoreHorizontal, Link2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import DOMPurify from 'dompurify';

interface Comment {
  comment_id: number;
  user_id: number;
  news_id: number;
  post_id: number | null;
  content: string;
  rating: number | null;
  created_at: string;
  parent_comment_id: number | null;
  user?: {
    user_id: number;
    username: string;
    email: string;
    is_active: number;
  };
  news?: {
    news_id: number;
    title: string;
  };
  likes_count?: number;
  report_count?: number;
  is_reported?: boolean;
}

interface Pagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  visible: boolean;
}

interface FilterState {
  search: string;
  minRating: number;
  hasReport: boolean;
  dateFrom: string;
  dateTo: string;
}

// ---------- Custom themed dropdown (replaces native <select> popup) ----------
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
                {opt.value === value && <Check size={12} className="text-indigo-400" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ---------- Custom themed date picker (replaces native <input type="date"> popup) ----------
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

// Skeleton Components
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

// Sửa SearchSkeleton - thêm animation từ phải sang
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
    <th className="px-4 py-4 w-16"><div className="h-3 w-8 bg-white/5 rounded animate-pulse" /></th>
    <th className="px-4 py-4 w-36"><div className="h-3 w-12 bg-white/5 rounded animate-pulse" /></th>
    <th className="px-4 py-4 w-28"><div className="h-3 w-14 bg-white/5 rounded animate-pulse" /></th>
    <th className="px-4 py-4"><div className="h-3 w-16 bg-white/5 rounded animate-pulse" /></th>
    <th className="px-4 py-4 w-24 text-center"><div className="h-3 w-12 bg-white/5 rounded animate-pulse mx-auto" /></th>
    <th className="px-4 py-4 w-36 text-center"><div className="h-3 w-12 bg-white/5 rounded animate-pulse mx-auto" /></th>
    <th className="px-4 py-4 w-36"><div className="h-3 w-12 bg-white/5 rounded animate-pulse" /></th>
    <th className="px-4 py-4 w-28 text-center"><div className="h-3 w-12 bg-white/5 rounded animate-pulse mx-auto" /></th>
  </tr>
);

const TableRowSkeleton = () => (
  <tr className="border-b border-white/5">
    <td className="px-4 py-4"><div className="h-4 w-12 bg-white/5 rounded animate-pulse" /></td>
    <td className="px-4 py-4">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-white/5 animate-pulse" />
        <div className="flex-1">
          <div className="h-3 w-16 bg-white/5 rounded animate-pulse mb-1" />
          <div className="h-2 w-20 bg-white/5 rounded animate-pulse" />
        </div>
      </div>
    </td>
    <td className="px-4 py-4"><div className="h-6 w-20 bg-white/5 rounded-md animate-pulse" /></td>
    <td className="px-4 py-4">
      <div className="space-y-1.5">
        <div className="h-3 w-48 bg-white/5 rounded animate-pulse" />
        <div className="h-3 w-32 bg-white/5 rounded animate-pulse" />
      </div>
    </td>
    <td className="px-4 py-4 text-center">
      <div className="flex flex-col items-center gap-0.5">
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-2.5 h-2.5 bg-white/5 rounded animate-pulse" />
          ))}
        </div>
      </div>
    </td>
    <td className="px-4 py-4 text-center">
      <div className="h-5 w-20 bg-white/5 rounded-full animate-pulse mx-auto" />
    </td>
    <td className="px-4 py-4">
      <div className="space-y-1">
        <div className="h-3 w-16 bg-white/5 rounded animate-pulse" />
        <div className="h-2 w-12 bg-white/5 rounded animate-pulse" />
      </div>
    </td>
    <td className="px-4 py-4 text-center">
      <div className="flex items-center justify-center gap-1.5">
        <div className="w-8 h-8 bg-white/5 rounded-lg animate-pulse" />
        <div className="w-8 h-8 bg-white/5 rounded-lg animate-pulse" />
      </div>
    </td>
  </tr>
);

// Sửa TableSkeleton - thêm animation từ phải sang
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
                  <td className="px-4 py-4"><div className="h-4 w-12 bg-white/5 rounded animate-pulse" /></td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-white/5 animate-pulse" />
                      <div className="flex-1">
                        <div className="h-3 w-16 bg-white/5 rounded animate-pulse mb-1" />
                        <div className="h-2 w-20 bg-white/5 rounded animate-pulse" />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4"><div className="h-6 w-20 bg-white/5 rounded-md animate-pulse" /></td>
                  <td className="px-4 py-4">
                    <div className="space-y-1.5">
                      <div className="h-3 w-48 bg-white/5 rounded animate-pulse" />
                      <div className="h-3 w-32 bg-white/5 rounded animate-pulse" />
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="w-2.5 h-2.5 bg-white/5 rounded animate-pulse" />
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <div className="h-5 w-20 bg-white/5 rounded-full animate-pulse mx-auto" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      <div className="h-3 w-16 bg-white/5 rounded animate-pulse" />
                      <div className="h-2 w-12 bg-white/5 rounded animate-pulse" />
                    </div>
                  </td>
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

// Skeleton cho toàn bộ trang - tất cả đều có animation từ phải sang
const PageSkeleton = () => (
  <div className="flex flex-col gap-8">
    <HeaderSkeleton />
    <StatsSkeleton />
    <SearchSkeleton />
    <TableSkeleton />
    <PaginationSkeleton />
  </div>
);

export default function NewsCommentsModerationView() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [toast, setToast] = useState<ToastState>({ 
    message: '', 
    type: 'info', 
    visible: false 
  });
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    minRating: 0,
    hasReport: false,
    dateFrom: '',
    dateTo: ''
  });
  const [stats, setStats] = useState({
    total: 0,
    withRating: 0,
    reported: 0,
    today: 0
  });

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

  const showToast = (message: string, type: ToastState['type'] = 'info') => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  };

  const fetchComments = useCallback(async () => {
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
      if (filters.minRating > 0) params.append('min_rating', String(filters.minRating));
      if (filters.hasReport) params.append('has_report', '1');
      if (filters.dateFrom) params.append('date_from', filters.dateFrom);
      if (filters.dateTo) params.append('date_to', filters.dateTo);

      const response = await fetch(`${API_BASE}/admin/comments?${params.toString()}`, {
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
        setComments(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      showToast("Failed to load comments", "error");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, filters]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [filters.search]);

  const handleDeleteComment = async (commentId: number) => {
    try {
      const token = localStorage.getItem("token");
      setIsDeleting(commentId);
      
      const response = await fetch(`${API_BASE}/admin/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        setComments(prev => prev.filter(c => c.comment_id !== commentId));
        showToast("Comment deleted successfully", "success");
      } else {
        const data = await response.json();
        showToast(data.message || "Failed to delete comment", "error");
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      showToast("Error deleting comment", "error");
    } finally {
      setIsDeleting(null);
      setShowDeleteConfirm(null);
    }
  };

  const handleViewDetail = (comment: Comment) => {
    setSelectedComment(comment);
    setShowDetailModal(true);
  };

  const renderStars = (rating: number | null) => {
    if (!rating) return <span className="text-[8px] text-slate-500 font-mono">No rating</span>;
    return (
      <div className="flex gap-0.5 justify-center">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={10} className={`${i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-slate-700'}`} />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (comment: Comment) => {
    if (comment.is_reported) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-500/20 border border-red-500/30 rounded-full text-[8px] text-red-400 font-mono font-bold whitespace-nowrap">
          <Flag size={8} className="flex-shrink-0" /> Reported ({comment.report_count})
        </span>
      );
    }
    if (comment.rating && comment.rating >= 4) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-[8px] text-emerald-400 font-mono font-bold whitespace-nowrap">
          <Check size={8} className="flex-shrink-0" /> High Quality
        </span>
      );
    }
    if (comment.rating) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-500/20 border border-slate-500/30 rounded-full text-[8px] text-slate-400 font-mono font-bold whitespace-nowrap">
          <Star size={8} className="flex-shrink-0" /> {comment.rating}/5
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-500/10 border border-slate-500/20 rounded-full text-[8px] text-slate-500 font-mono font-bold whitespace-nowrap">
        No rating
      </span>
    );
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      minRating: 0,
      hasReport: false,
      dateFrom: '',
      dateTo: ''
    });
    setCurrentPage(1);
  };

  const renderPaginationPages = () => {
    if (!pagination) return null;
    
    const total = pagination.last_page;
    const current = pagination.current_page;
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
            {toast.type === 'success' && <Check size={16} />}
            {toast.type === 'error' && <AlertCircle size={16} />}
            {toast.type === 'warning' && <AlertCircle size={16} />}
            {toast.type === 'info' && <MessageSquare size={16} />}
            <p className="text-sm font-medium">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 right-[-5%] w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-[10%] left-[-5%] w-[600px] h-[600px] bg-sky-500/5 rounded-full blur-[120px]" />
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
                      <ShieldAlert size={12} className="text-indigo-400" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 font-mono">News Comments Moderation</span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter uppercase text-white leading-none">
                      Comments <span className="text-indigo-400">Hub</span>
                    </h1>
                    <p className="text-xs text-slate-500 max-w-2xl">
                      Manage and moderate all comments from news articles. Review reported content, maintain quality discussions, and ensure community guidelines are followed.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => fetchComments()}
                      className="bg-white/5 hover:bg-white/10 text-slate-300 font-mono text-[9px] font-black uppercase tracking-widest px-4 py-3 rounded-xl transition-all flex items-center gap-2 border border-white/10"
                    >
                      <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} /> 
                      {isLoading ? "Loading..." : "Refresh"}
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
                  placeholder="Search by content or username..."
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
                  {Object.values(filters).some(v => v !== '' && v !== 0 && v !== false) && (
                    <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  )}
                </motion.button>
                {(filters.search || filters.minRating > 0 || filters.hasReport || filters.dateFrom || filters.dateTo) && (
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
                      {/* Min Rating */}
                      <div>
                        <label className="text-[8px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                          <Star size={10} className="text-yellow-500" />
                          Min Rating
                        </label>
                        <CustomSelect
                          value={String(filters.minRating)}
                          onChange={(v) => setFilters(prev => ({ ...prev, minRating: Number(v) }))}
                          options={[
                            { value: "0", label: "All ratings" },
                            { value: "1", label: "1★ and up" },
                            { value: "2", label: "2★ and up" },
                            { value: "3", label: "3★ and up" },
                            { value: "4", label: "4★ and up" },
                            { value: "5", label: "5★ only" },
                          ]}
                        />
                      </div>

                      {/* Status */}
                      <div>
                        <label className="text-[8px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                          <Flag size={10} className="text-red-400" />
                          Status
                        </label>
                        <CustomSelect
                          value={filters.hasReport ? "reported" : "all"}
                          onChange={(v) => setFilters(prev => ({ ...prev, hasReport: v === "reported" }))}
                          options={[
                            { value: "all", label: "All comments" },
                            { value: "reported", label: "Only reported" },
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

            {/* Comments Table */}
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
                      <th className="px-4 py-4 w-16">ID</th>
                      <th className="px-4 py-4 w-36">User</th>
                      <th className="px-4 py-4 w-28">Article</th>
                      <th className="px-4 py-4">Content</th>
                      <th className="px-4 py-4 w-24 text-center">Rating</th>
                      <th className="px-4 py-4 w-36 text-center">Status</th>
                      <th className="px-4 py-4 w-36">Date</th>
                      <th className="px-4 py-4 w-28 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {comments.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-20 text-center">
                          <div className="flex flex-col items-center gap-4">
                            <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                              <MessageSquare size={32} className="text-indigo-400" />
                            </div>
                            <p className="text-slate-400 font-mono text-sm font-bold">No comments found</p>
                            <p className="text-slate-500 text-[9px] font-mono">Try adjusting your search or filters</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      comments.map((comment, idx) => (
                        <motion.tr 
                          key={comment.comment_id} 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: Math.min(idx * 0.03, 0.3) }}
                          className={`hover:bg-white/5 transition-all group ${comment.is_reported ? 'bg-red-500/5' : ''}`}
                        >
                          {/* ID */}
                          <td className="px-4 py-4">
                            <span className="text-indigo-400 font-black text-[11px] whitespace-nowrap">#{comment.comment_id}</span>
                          </td>
                          
                          {/* User */}
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                                <span className="text-[8px] text-white font-black">
                                  {comment.user?.username?.[0]?.toUpperCase() || "?"}
                                </span>
                              </div>
                              <div className="min-w-0">
                                <p className="text-white text-xs font-bold truncate">@{comment.user?.username || "Unknown"}</p>
                                <p className="text-[7px] text-slate-500 font-mono truncate">{comment.user?.email || "No email"}</p>
                              </div>
                            </div>
                          </td>
                          
                          {/* Article */}
                          <td className="px-4 py-4">
                            <Link 
                              href={`/news/${comment.news_id}`} 
                              target="_blank"
                              className="flex items-center gap-1.5 text-[9px] px-2 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-md text-indigo-400 hover:bg-indigo-500/20 transition-all font-mono font-bold group-hover:border-indigo-500/40 max-w-[120px] truncate whitespace-nowrap"
                              title={comment.news?.title || `News #${comment.news_id}`}
                            >
                              <Newspaper size={8} className="flex-shrink-0" />
                              {comment.news?.title?.slice(0, 15) || `News #${comment.news_id}`}
                              {comment.news?.title?.length > 15 && '...'}
                            </Link>
                          </td>
                          
                          {/* Content */}
                          <td className="px-4 py-4 max-w-[300px]">
                            <div 
                              className="text-sm text-slate-300 line-clamp-2 font-sans"
                              dangerouslySetInnerHTML={{ 
                                __html: DOMPurify.sanitize(
                                  comment.content.length > 120 
                                    ? comment.content.slice(0, 120) + '...' 
                                    : comment.content
                                ) 
                              }}
                            />
                          </td>
                          
                          {/* Rating */}
                          <td className="px-4 py-4 text-center">
                            <div className="flex flex-col items-center gap-0.5">
                              {renderStars(comment.rating)}
                              {comment.rating && (
                                <span className="text-[7px] text-slate-500 font-mono">{comment.rating}/5</span>
                              )}
                            </div>
                          </td>
                          
                          {/* Status */}
                          <td className="px-4 py-4 text-center">
                            <div className="flex justify-center min-w-[90px]">
                              {getStatusBadge(comment)}
                            </div>
                          </td>
                          
                          {/* Date */}
                          <td className="px-4 py-4">
                            <div className="flex flex-col whitespace-nowrap">
                              <span className="text-[9px] text-slate-400 font-mono">{formatDate(comment.created_at)}</span>
                              <span className="text-[7px] text-slate-600 font-mono">
                                {new Date(comment.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </td>
                          
                          {/* Actions */}
                          <td className="px-4 py-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleViewDetail(comment)}
                                className="p-2 bg-white/5 hover:bg-indigo-500/20 rounded-lg text-slate-400 hover:text-indigo-400 transition-all border border-transparent hover:border-indigo-500/30"
                                title="View details"
                              >
                                <Eye size={12} />
                              </motion.button>
                              <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowDeleteConfirm(comment.comment_id)}
                                className="p-2 bg-white/5 hover:bg-rose-500/20 rounded-lg text-slate-400 hover:text-rose-400 transition-all border border-transparent hover:border-rose-500/30"
                                title="Delete comment"
                              >
                                {isDeleting === comment.comment_id ? (
                                  <Loader2 size={12} className="animate-spin" />
                                ) : (
                                  <Trash2 size={12} />
                                )}
                              </motion.button>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Pagination */}
            {pagination && pagination.last_page > 1 && (
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-br from-[#11111a] to-[#0c0c12] border border-white/10 rounded-xl p-4"
              >
                <div className="text-[8px] font-mono text-slate-500">
                  Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to{' '}
                  {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of {pagination.total} entries
                </div>
                <div className="flex items-center gap-1.5 flex-wrap justify-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={pagination.current_page === 1}
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-[8px] font-black uppercase tracking-wider transition-all flex items-center gap-1"
                  >
                    <ChevronLeft size={10} /> Prev
                  </motion.button>
                  
                  {renderPaginationPages()}
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentPage(p => Math.min(pagination.last_page, p + 1))}
                    disabled={pagination.current_page === pagination.last_page}
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
                  <h3 id="delete-modal-title" className="text-sm font-black text-white font-mono uppercase">Delete Comment</h3>
                </div>
                <p className="text-slate-400 text-sm mb-6">
                  Are you sure you want to permanently delete this comment? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all font-mono text-[9px] font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-white/20"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteComment(showDeleteConfirm)}
                    disabled={isDeleting === showDeleteConfirm}
                    className="flex-1 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white transition-all font-mono text-[9px] font-bold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500/50 flex items-center justify-center gap-2"
                  >
                    {isDeleting === showDeleteConfirm ? (
                      <Loader2 className="animate-spin" size={14} />
                    ) : (
                      <Trash2 size={14} />
                    )}
                    Delete
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Comment Detail Modal */}
        <AnimatePresence>
          {showDetailModal && selectedComment && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDetailModal(false)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setShowDetailModal(false);
              }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              role="dialog"
              aria-modal="true"
              aria-labelledby="detail-modal-title"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gradient-to-br from-[#11111a] to-[#0c0c12] border border-white/10 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/30">
                      <MessageSquare size={18} className="text-indigo-400" />
                    </div>
                    <h3 id="detail-modal-title" className="text-sm font-black text-white font-mono uppercase">
                      Comment Details
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="text-slate-500 hover:text-white transition-all p-1 rounded-lg hover:bg-white/5"
                    aria-label="Close modal"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* User Info */}
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm text-white font-black">
                        {selectedComment.user?.username?.[0]?.toUpperCase() || "?"}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-bold">@{selectedComment.user?.username || "Unknown"}</p>
                      <p className="text-[8px] text-slate-500 font-mono">{selectedComment.user?.email || "No email"}</p>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      {selectedComment.rating && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
                          <Star size={10} className="text-yellow-500 fill-yellow-500" />
                          <span className="text-[9px] font-mono font-bold text-yellow-400">{selectedComment.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 bg-black/30 rounded-xl border border-white/10">
                    <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-2">Content</p>
                    <div 
                      className="text-slate-200 text-base leading-relaxed font-sans"
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedComment.content) }}
                    />
                  </div>

                  {/* Meta Info */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-[7px] font-mono text-slate-500 uppercase tracking-widest">Article</p>
                      <Link 
                        href={`/news/${selectedComment.news_id}`} 
                        target="_blank"
                        className="text-indigo-400 text-xs font-bold hover:underline flex items-center gap-1.5 mt-1"
                      >
                        <Newspaper size={12} />
                        {selectedComment.news?.title || `News #${selectedComment.news_id}`}
                      </Link>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-[7px] font-mono text-slate-500 uppercase tracking-widest">Posted At</p>
                      <p className="text-white text-xs font-mono mt-1">{formatDate(selectedComment.created_at)}</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-[7px] font-mono text-slate-500 uppercase tracking-widest">Comment ID</p>
                      <p className="text-indigo-400 text-xs font-mono mt-1">#{selectedComment.comment_id}</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-[7px] font-mono text-slate-500 uppercase tracking-widest">Status</p>
                      <div className="mt-1">{getStatusBadge(selectedComment) || <span className="text-[9px] text-slate-500 font-mono">Normal</span>}</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2 border-t border-white/10">
                    <button
                      onClick={() => {
                        setShowDetailModal(false);
                        setShowDeleteConfirm(selectedComment.comment_id);
                      }}
                      className="flex-1 px-4 py-3 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 transition-all font-mono text-[9px] font-bold uppercase tracking-wider flex items-center justify-center gap-2"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                    <button
                      onClick={() => setShowDetailModal(false)}
                      className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all font-mono text-[9px] font-bold uppercase tracking-wider"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}