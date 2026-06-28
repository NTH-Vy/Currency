"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Trash2, 
  Edit, 
  Plus, 
  Search, 
  Newspaper, 
  Save, 
  X,
  Loader2,
  Upload,
  Calendar,
  User,
  Tag,
  Eye,
  Clock,
  Filter,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Globe,
  TrendingUp,
  Zap,
  Shield,
  Image as ImageIcon,
  MoreHorizontal,
  Link2,
  RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DOMPurify from 'dompurify';

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
          open ? "border-emerald-500/50 bg-black/60" : "border-white/10 hover:border-white/20"
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
                    ? "bg-emerald-500/15 text-emerald-300"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span>{opt.label}</span>
                {opt.value === value && <CheckCircle2 size={12} className="text-emerald-400" />}
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
          open ? "border-emerald-500/50 bg-black/60" : "border-white/10 hover:border-white/20"
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
                        ? "bg-emerald-500 text-white font-bold"
                        : isToday
                        ? "border border-emerald-500/50 text-emerald-300"
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
                className="text-[9px] font-mono text-emerald-400 hover:text-emerald-300 uppercase tracking-wider transition-colors"
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
    <th className="px-4 py-4"><div className="h-3 w-16 bg-white/5 rounded animate-pulse" /></th>
    <th className="px-4 py-4 w-28"><div className="h-3 w-14 bg-white/5 rounded animate-pulse" /></th>
    <th className="px-4 py-4 w-36"><div className="h-3 w-12 bg-white/5 rounded animate-pulse" /></th>
    <th className="px-4 py-4 w-36 text-center"><div className="h-3 w-12 bg-white/5 rounded animate-pulse mx-auto" /></th>
    <th className="px-4 py-4 w-28 text-center"><div className="h-3 w-12 bg-white/5 rounded animate-pulse mx-auto" /></th>
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
                  <td className="px-4 py-4"><div className="h-12 w-16 bg-white/5 rounded-lg animate-pulse" /></td>
                  <td className="px-4 py-4">
                    <div className="space-y-1.5">
                      <div className="h-4 w-48 bg-white/5 rounded animate-pulse" />
                      <div className="h-3 w-32 bg-white/5 rounded animate-pulse" />
                    </div>
                  </td>
                  <td className="px-4 py-4"><div className="h-6 w-20 bg-white/5 rounded-md animate-pulse" /></td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-white/5 animate-pulse" />
                      <div className="h-3 w-16 bg-white/5 rounded animate-pulse" />
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

const PageSkeleton = () => (
  <div className="flex flex-col gap-8">
    <HeaderSkeleton />
    <SearchSkeleton />
    <TableSkeleton />
    <PaginationSkeleton />
  </div>
);

// ---------- Main Component ----------
interface NewsArticle {
  news_id: number;
  category: string;
  title: string;
  content: string;
  image_url: string;
  published_at: string;
  author?: {
    username: string;
    role?: string;
  };
}

interface FilterState {
  search: string;
  category: string;
  dateFrom: string;
  dateTo: string;
}

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  visible: boolean;
}

export default function NewsPage() {
  const router = useRouter();
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
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
    category: 'All',
    dateFrom: '',
    dateTo: ''
  });

  // Modal states
  const [newsModal, setNewsModal] = useState<{ show: boolean; mode: "create" | "edit"; data: NewsArticle | null }>({
    show: false, mode: "create", data: null
  });
  const [newsForm, setNewsForm] = useState<NewsArticle>({
    news_id: 0, category: "Markets", title: "", content: "", image_url: "", published_at: "", author: { username: "" }
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

  const showToast = (message: string, type: ToastState['type'] = 'info') => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  };

  const fetchNews = useCallback(async () => {
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
      if (filters.category && filters.category !== 'All') params.append('category', filters.category);
      if (filters.dateFrom) params.append('date_from', filters.dateFrom);
      if (filters.dateTo) params.append('date_to', filters.dateTo);

      const response = await fetch(`${API_BASE}/admin/news?${params.toString()}`, {
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
        setNews(data.data);
        setTotalPages(data.pagination?.last_page || 1);
        setTotalItems(data.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      showToast("Failed to load news", "error");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, filters]);

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

    fetchNews();
  }, [router, currentPage, fetchNews]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [filters.search, filters.category]);

  const getCategoryColor = (category: string) => {
    switch(category) {
      case "Markets": return "bg-indigo-500/15 border-indigo-500/30 text-indigo-400";
      case "Forex": return "bg-emerald-500/15 border-emerald-500/30 text-emerald-400";
      case "Crypto": return "bg-amber-500/15 border-amber-500/30 text-amber-400";
      case "Policy": return "bg-purple-500/15 border-purple-500/30 text-purple-400";
      default: return "bg-slate-500/15 border-slate-500/30 text-slate-400";
    }
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

  const resetFilters = () => {
    setFilters({
      search: '',
      category: 'All',
      dateFrom: '',
      dateTo: ''
    });
    setCurrentPage(1);
  };

  const openNewsModal = (mode: "create" | "edit", item?: NewsArticle) => {
    if (mode === "edit" && item) {
      setNewsForm({ ...item });
      setSelectedFile(null);
      setNewsModal({ show: true, mode: "edit", data: item });
    } else {
      setNewsForm({
        news_id: Date.now(),
        category: "Markets",
        title: "",
        content: "",
        image_url: "",
        published_at: new Date().toISOString(),
        author: { username: "" }
      });
      setSelectedFile(null);
      setNewsModal({ show: true, mode: "create", data: null });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append('image', file);
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE}/upload/news`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setNewsForm({ ...newsForm, image_url: data.url });
        showToast("Image uploaded successfully!", "success");
      } else {
        showToast(data.error || "Upload failed", "error");
      }
    } catch (error) {
      console.error('Upload error:', error);
      showToast("Upload failed", "error");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleNewsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const url = `${API_BASE}/admin/news`;
      const method = newsModal.mode === "edit" ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...(newsModal.mode === "edit" && { news_id: newsForm.news_id }),
          title: newsForm.title,
          category: newsForm.category,
          content: newsForm.content,
          image_url: newsForm.image_url,
          published_at: newsForm.published_at,
          author: newsForm.author,
        }),
      });

      const data = await response.json();

      if (data.success) {
        showToast(
          newsModal.mode === "edit" ? "Publication updated successfully!" : "New intelligence broadcasted!",
          "success"
        );
        fetchNews();
        setNewsModal({ show: false, mode: "create", data: null });
      } else {
        showToast(data.message || "Failed to save news", "error");
      }
    } catch (error) {
      console.error('Error saving news:', error);
      showToast("Error saving news", "error");
    }
  };

  const handleDeleteNews = async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      setIsDeleting(id);
      
      const response = await fetch(`${API_BASE}/admin/news/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        setNews(prev => prev.filter(item => item.news_id !== id));
        showToast("Publication shredded successfully.", "success");
      } else {
        const data = await response.json();
        showToast(data.message || "Failed to delete news", "error");
      }
    } catch (error) {
      console.error('Error deleting news:', error);
      showToast("Error deleting news", "error");
    } finally {
      setIsDeleting(null);
      setShowDeleteConfirm(null);
    }
  };

  const categories = ["All", "Markets", "Forex", "Crypto", "Policy"];

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
              ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-md'
              : 'bg-white/5 hover:bg-white/10 text-slate-400'
          }`}
        >
          {pageNum}
        </motion.button>
      );
    });
  };

  return (
    <div className="min-h-screen bg-[#05050a] text-slate-100 flex flex-col font-sans pt-28 pb-20 selection:bg-emerald-500/30 overflow-x-hidden">
      
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
            {toast.type === 'info' && <Newspaper size={16} />}
            <p className="text-sm font-medium">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 right-[-5%] w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-[10%] left-[-5%] w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-[120px]" />
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
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/30 via-teal-500/30 to-emerald-500/30 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition duration-700" />
              <div className="relative bg-gradient-to-br from-[#11111a] to-[#0c0c12] rounded-[2.5rem] p-8 md:p-10 border border-white/10 shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex flex-col gap-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full w-fit">
                      <Newspaper size={12} className="text-emerald-400" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 font-mono">News Intelligence Dispatch</span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter uppercase text-white leading-none">
                      Intelligence <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-400 to-cyan-400">Chronicles</span>
                    </h1>
                    <p className="text-xs text-slate-500 max-w-2xl">
                      Management of market insights, economic bulletins, and financial reports. Broadcast high-fidelity intelligence across the terminal network.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => fetchNews()}
                      className="bg-white/5 hover:bg-white/10 text-slate-300 font-mono text-[9px] font-black uppercase tracking-widest px-4 py-3 rounded-xl transition-all flex items-center gap-2 border border-white/10"
                    >
                      <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} /> 
                      {isLoading ? "Loading..." : "Refresh"}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => openNewsModal("create")}
                      className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-mono text-[9px] font-black uppercase tracking-widest px-6 py-3 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/30"
                    >
                      <Plus size={14} />
                      <span>Draft Dispatch</span>
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
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" size={14} />
                <input 
                  placeholder="Search by title or category..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full bg-black/40 border border-white/10 hover:border-white/20 focus:border-emerald-500/50 rounded-xl py-3 pl-10 pr-4 text-[11px] font-mono text-white placeholder:text-slate-600 focus:outline-none focus:bg-black/60 transition-all"
                />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border ${
                    showFilters 
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' 
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <Filter size={12} />
                  Filters
                  {Object.values(filters).some(v => v !== '' && v !== 'All') && (
                    <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  )}
                </motion.button>
                {(filters.search || filters.category !== 'All' || filters.dateFrom || filters.dateTo) && (
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
                    <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Category */}
                      <div>
                        <label className="text-[8px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                          <Tag size={10} className="text-emerald-400" />
                          Category
                        </label>
                        <CustomSelect
                          value={filters.category}
                          onChange={(v) => setFilters(prev => ({ ...prev, category: v }))}
                          options={[
                            { value: "All", label: "All categories" },
                            { value: "Markets", label: "Markets" },
                            { value: "Forex", label: "Forex" },
                            { value: "Crypto", label: "Crypto" },
                            { value: "Policy", label: "Policy" },
                          ]}
                        />
                      </div>

                      {/* From Date */}
                      <div>
                        <label className="text-[8px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                          <Calendar size={10} className="text-emerald-400" />
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
                          <Calendar size={10} className="text-emerald-400" />
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

            {/* News Table */}
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
                      <th className="px-4 py-4 w-16">Image</th>
                      <th className="px-4 py-4">Title</th>
                      <th className="px-4 py-4 w-28">Category</th>
                      <th className="px-4 py-4 w-36">Author</th>
                      <th className="px-4 py-4 w-40">Published</th>
                      <th className="px-4 py-4 w-28 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {news.length === 0 ? (
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
                        {news.map((item, idx) => (
                          <motion.tr 
                            key={item.news_id} 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: Math.min(idx * 0.03, 0.3) }}
                            onMouseEnter={() => setHoveredRow(item.news_id)}
                            onMouseLeave={() => setHoveredRow(null)}
                            className="hover:bg-white/5 transition-all group border-b border-white/5"
                          >
                            {/* Image */}
                            <td className="px-4 py-4">
                              <div className="relative w-14 h-12 rounded-lg overflow-hidden border border-white/10 bg-black/30 flex-shrink-0">
                                {item.image_url ? (
                                  <img 
                                    src={item.image_url} 
                                    alt="" 
                                    className="w-full h-full object-cover grayscale-[60%] opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300" 
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <ImageIcon size={16} className="text-slate-600" />
                                  </div>
                                )}
                              </div>
                            </td>
                            
                            {/* Title */}
                            <td className="px-4 py-4">
                              <div className="flex flex-col gap-1 max-w-md">
                                <span className="text-white font-black text-sm font-sans tracking-tight line-clamp-1 group-hover:text-emerald-400 transition-colors">
                                  {item.title}
                                </span>
                                <div className="flex items-center gap-2 text-[7px] text-slate-500 font-mono">
                                  <Clock size={8} />
                                  <span>{new Date(item.published_at).toLocaleDateString()}</span>
                                  <Eye size={8} />
                                  <span>1.2k views</span>
                                </div>
                              </div>
                            </td>
                            
                            {/* Category */}
                            <td className="px-4 py-4">
                              <span className={`px-2 py-1 rounded-lg text-[7px] font-black uppercase border ${getCategoryColor(item.category)}`}>
                                {item.category}
                              </span>
                            </td>
                            
                            {/* Author */}
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                                  <span className="text-[8px] text-emerald-400 font-black">
                                    {item.author?.username?.[0]?.toUpperCase() || "?"}
                                  </span>
                                </div>
                                <span className="text-slate-300 text-[9px] font-black uppercase tracking-tighter truncate max-w-[80px]">
                                  @{item.author?.username || "Unknown"}
                                </span>
                              </div>
                            </td>
                            
                            {/* Published */}
                            <td className="px-4 py-4">
                              <div className="flex flex-col whitespace-nowrap">
                                <span className="text-[9px] text-slate-400 font-mono">{formatDate(item.published_at)}</span>
                                <span className="text-[7px] text-slate-600 font-mono">
                                  {new Date(item.published_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </td>
                            
                            {/* Actions */}
                            <td className="px-4 py-4 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <motion.button 
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => openNewsModal("edit", item)} 
                                  className="p-2 bg-white/5 hover:bg-emerald-500/20 rounded-lg text-slate-400 hover:text-emerald-400 transition-all border border-transparent hover:border-emerald-500/30"
                                  title="Edit news"
                                >
                                  <Edit size={12} />
                                </motion.button>
                                <motion.button 
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => setShowDeleteConfirm(item.news_id)} 
                                  className="p-2 bg-white/5 hover:bg-rose-500/20 rounded-lg text-slate-400 hover:text-rose-400 transition-all border border-transparent hover:border-rose-500/30"
                                  title="Delete news"
                                >
                                  {isDeleting === item.news_id ? (
                                    <Loader2 size={12} className="animate-spin" />
                                  ) : (
                                    <Trash2 size={12} />
                                  )}
                                </motion.button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                        
                        {/* Thêm dòng trống để đủ 10 dòng - KHÔNG CÓ GẠCH NGANG */}
                        {news.length < 10 && [...Array(10 - news.length)].map((_, idx) => (
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
                  <h3 id="delete-modal-title" className="text-sm font-black text-white font-mono uppercase">Delete Publication</h3>
                </div>
                <p className="text-slate-400 text-sm mb-6">
                  Are you sure you want to permanently delete this news article? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all font-mono text-[9px] font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-white/20"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteNews(showDeleteConfirm)}
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

        {/* News Modal */}
        <AnimatePresence>
          {newsModal.show && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setNewsModal({ show: false, mode: "create", data: null })}
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gradient-to-br from-[#11111a] to-[#0c0c12] border border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-white/5 to-transparent sticky top-0 bg-[#11111a]/95 backdrop-blur-sm z-10">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-500/10 rounded-lg">
                      {newsModal.mode === "edit" ? <Edit size={14} className="text-emerald-400" /> : <Sparkles size={14} className="text-emerald-400" />}
                    </div>
                    <div>
                      <h3 className="text-base font-black uppercase text-white">
                        {newsModal.mode === "edit" ? "Refine Dispatch" : "New Intelligence"}
                      </h3>
                      <p className="text-[7px] text-slate-500 font-mono">Drafting Terminal</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setNewsModal({ show: false, mode: "create", data: null })} 
                    className="text-slate-500 hover:text-white p-1.5 rounded-lg bg-white/5 transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>

                <form onSubmit={handleNewsSubmit} className="p-6 flex flex-col gap-5">
                  <div className="space-y-2">
                    <label className="text-[7px] font-mono font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                      <Newspaper size={8} /> Headline Title
                    </label>
                    <input 
                      required 
                      value={newsForm.title}
                      onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 focus:border-emerald-500/50 rounded-xl p-3 text-sm font-black text-white outline-none transition-all"
                      placeholder="Enter news title..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[7px] font-mono font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                        <User size={8} /> Author
                      </label>
                      <input 
                        required 
                        value={newsForm.author?.username || ""}
                        onChange={(e) => setNewsForm({ ...newsForm, author: { username: e.target.value.toUpperCase() } })}
                        className="w-full bg-black/40 border border-white/10 focus:border-emerald-500/50 rounded-xl p-3 text-sm font-mono font-black text-white outline-none transition-all"
                        placeholder="USERNAME"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[7px] font-mono font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                        <Tag size={8} /> Category
                      </label>
                      <CustomSelect
                        value={newsForm.category}
                        onChange={(v) => setNewsForm({ ...newsForm, category: v })}
                        options={[
                          { value: "Markets", label: "Markets" },
                          { value: "Forex", label: "Forex" },
                          { value: "Crypto", label: "Crypto" },
                          { value: "Policy", label: "Policy" },
                        ]}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[7px] font-mono font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                      <ImageIcon size={8} /> Image
                    </label>
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-3 bg-black/40 border border-white/10 hover:border-emerald-500/40 rounded-xl p-3 cursor-pointer transition-all group">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={uploadingImage}
                          className="hidden"
                        />
                        <div className={`p-1.5 rounded-lg ${uploadingImage ? 'bg-emerald-500/20' : 'bg-white/5'} group-hover:bg-white/10 transition-all`}>
                          {uploadingImage ? <Loader2 size={12} className="animate-spin text-emerald-400" /> : <Upload size={12} className="text-slate-400" />}
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 group-hover:text-white transition-colors">
                          {uploadingImage ? "Uploading..." : selectedFile ? selectedFile.name : "Click to upload image"}
                        </span>
                      </label>
                      {newsForm.image_url && (
                        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 p-2 rounded-lg">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-[8px] text-emerald-400 font-mono">Image uploaded successfully</span>
                          <button
                            type="button"
                            onClick={() => setNewsForm({ ...newsForm, image_url: "" })}
                            className="ml-auto p-1 text-slate-400 hover:text-rose-400 transition-all"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[7px] font-mono font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                      <Globe size={8} /> Content
                    </label>
                    <textarea 
                      required 
                      rows={8} 
                      value={newsForm.content}
                      onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 focus:border-emerald-500/50 rounded-xl p-3 text-sm font-mono text-white outline-none transition-all resize-none"
                      placeholder="Write the news content here..."
                    />
                  </div>

                  <div className="flex justify-end gap-3 mt-2">
                    <button
                      type="button"
                      onClick={() => setNewsModal({ show: false, mode: "create", data: null })}
                      className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-[8px] font-black uppercase tracking-wider transition-all"
                    >
                      Cancel
                    </button>
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit" 
                      className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl text-[8px] font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/30"
                    >
                      <Save size={12} /> {newsModal.mode === "edit" ? "Commit Changes" : "Broadcast"}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}