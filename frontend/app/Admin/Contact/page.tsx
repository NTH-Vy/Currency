// app/admin/contact/page.tsx
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  LifeBuoy,
  Mail,
  MessageSquare,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Send,
  Search,
  Filter,
  Trash2,
  MoreVertical,
  ChevronDown,
  User,
  Calendar,
  Tag,
  Reply,
  Loader2,
  RefreshCw,
  ShieldAlert,
  Check,
  ChevronRight,
  ChevronLeft,
  Eye,
  Flag,
  X,
  Star,
  Newspaper,
  Link2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DOMPurify from 'dompurify';

interface SupportTicket {
  ticket_id: number;
  user_id: number | null;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  admin_response: string | null;
  admin_id: number | null;
  responded_at: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    user_id: number;
    username: string;
  };
  admin?: {
    user_id: number;
    username: string;
  };
}

interface TicketStats {
  total: number;
  open: number;
  in_progress: number;
  resolved: number;
  closed: number;
  high_priority: number;
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
  status: string;
  priority: string;
  search: string;
  dateFrom: string;
  dateTo: string;
}

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
                {opt.value === value && <Check size={12} className="text-indigo-400" />}
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
  <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
    {[...Array(6)].map((_, idx) => (
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
                      <div className="h-5 w-16 bg-white/5 rounded animate-pulse" />
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

const PageSkeleton = () => (
  <div className="flex flex-col gap-8">
    <HeaderSkeleton />
    <StatsSkeleton />
    <SearchSkeleton />
    <TableSkeleton />
    <PaginationSkeleton />
  </div>
);

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export default function AdminContact() {
  const router = useRouter();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [stats, setStats] = useState<TicketStats>({
    total: 0,
    open: 0,
    in_progress: 0,
    resolved: 0,
    closed: 0,
    high_priority: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [responseText, setResponseText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [toast, setToast] = useState<ToastState>({ 
    message: '', 
    type: 'info', 
    visible: false 
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    priority: 'all',
    search: '',
    dateFrom: '',
    dateTo: ''
  });

  const showToast = (message: string, type: ToastState['type'] = 'info') => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  };

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showToast("Please login to access admin panel", "error");
        setLoading(false);
        return;
      }

      const params = new URLSearchParams();
      params.append('page', String(currentPage));
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.priority !== 'all') params.append('priority', filters.priority);
      if (filters.search) params.append('search', filters.search);
      if (filters.dateFrom) params.append('date_from', filters.dateFrom);
      if (filters.dateTo) params.append('date_to', filters.dateTo);

      const res = await fetch(`${API_BASE}/admin/support-tickets?${params}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });

      if (!res.ok) {
        if (res.status === 401) {
          showToast("Session expired. Please login again.", "error");
        } else if (res.status === 403) {
          showToast("You don't have permission to access this page.", "error");
        }
        setLoading(false);
        return;
      }

      const data = await res.json();
      if (data.success) {
        setTickets(data.tickets.data || []);
        setPagination(data.tickets.pagination || data.tickets);
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
      showToast("Failed to load tickets", "error");
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/admin/support-tickets/statistics`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });

      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchTickets();
    fetchStats();
  }, [fetchTickets]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [filters.search]);

  const handleRespond = async () => {
    if (!selectedTicket || !responseText.trim()) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/admin/support-tickets/${selectedTicket.ticket_id}/respond`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        },
        body: JSON.stringify({
          response: responseText,
          status: selectedTicket.status === 'open' ? 'in_progress' : selectedTicket.status
        })
      });

      const data = await res.json();
      if (data.success) {
        setSelectedTicket(data.ticket);
        setResponseText("");
        fetchTickets();
        fetchStats();
        showToast("Response sent successfully", "success");
      }
    } catch (error) {
      console.error("Error responding to ticket:", error);
      showToast("Failed to send response", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (ticketId: number, status: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/admin/support-tickets/${ticketId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        },
        body: JSON.stringify({ status })
      });

      const data = await res.json();
      if (data.success) {
        fetchTickets();
        fetchStats();
        if (selectedTicket && selectedTicket.ticket_id === ticketId) {
          setSelectedTicket(data.ticket);
        }
        showToast(`Status updated to ${status}`, "success");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      showToast("Failed to update status", "error");
    }
  };

  const handleDelete = async (ticketId: number) => {
    setIsDeleting(ticketId);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/admin/support-tickets/${ticketId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });

      const data = await res.json();
      if (data.success) {
        if (selectedTicket && selectedTicket.ticket_id === ticketId) {
          setSelectedTicket(null);
        }
        fetchTickets();
        fetchStats();
        showToast("Ticket deleted successfully", "success");
      }
    } catch (error) {
      console.error("Error deleting ticket:", error);
      showToast("Failed to delete ticket", "error");
    } finally {
      setIsDeleting(null);
      setShowDeleteConfirm(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'in_progress': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'resolved': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'closed': return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
      case 'medium': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'urgent': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
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

  const getStatusBadge = (ticket: SupportTicket) => {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-mono font-bold border ${getStatusColor(ticket.status)}`}>
        {ticket.status.replace('_', ' ')}
      </span>
    );
  };

  const getPriorityBadge = (ticket: SupportTicket) => {
    const colors = {
      low: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
      medium: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      urgent: 'bg-rose-500/20 text-rose-400 border-rose-500/30'
    };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-mono font-bold border ${colors[ticket.priority]}`}>
        {ticket.priority}
      </span>
    );
  };

  const resetFilters = () => {
    setFilters({
      status: 'all',
      priority: 'all',
      search: '',
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
        
        {loading ? (
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
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 font-mono">Support Center</span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter uppercase text-white leading-none">
                      Support <span className="text-indigo-400">Tickets</span>
                    </h1>
                    <p className="text-xs text-slate-500 max-w-2xl">
                      Manage and respond to user support tickets. Track issues, provide solutions, and maintain customer satisfaction.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { fetchTickets(); fetchStats(); }}
                      className="bg-white/5 hover:bg-white/10 text-slate-300 font-mono text-[9px] font-black uppercase tracking-widest px-4 py-3 rounded-xl transition-all flex items-center gap-2 border border-white/10"
                    >
                      <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> 
                      {loading ? "Loading..." : "Refresh"}
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05, duration: 0.4 }}
              className="grid grid-cols-2 md:grid-cols-6 gap-4"
            >
              <div className="bg-gradient-to-br from-[#11111a] to-[#0c0c12] border border-white/10 rounded-2xl p-4 shadow-xl">
                <div className="text-2xl font-black text-white">{stats.total}</div>
                <div className="text-[8px] text-slate-500 font-mono uppercase tracking-wider mt-1">Total</div>
              </div>
              <div className="bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 rounded-2xl p-4 shadow-xl">
                <div className="text-2xl font-black text-amber-400">{stats.open}</div>
                <div className="text-[8px] text-slate-500 font-mono uppercase tracking-wider mt-1">Open</div>
              </div>
              <div className="bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 rounded-2xl p-4 shadow-xl">
                <div className="text-2xl font-black text-blue-400">{stats.in_progress}</div>
                <div className="text-[8px] text-slate-500 font-mono uppercase tracking-wider mt-1">In Progress</div>
              </div>
              <div className="bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-2xl p-4 shadow-xl">
                <div className="text-2xl font-black text-emerald-400">{stats.resolved}</div>
                <div className="text-[8px] text-slate-500 font-mono uppercase tracking-wider mt-1">Resolved</div>
              </div>
              <div className="bg-gradient-to-br from-slate-500/10 to-transparent border border-slate-500/20 rounded-2xl p-4 shadow-xl">
                <div className="text-2xl font-black text-slate-400">{stats.closed}</div>
                <div className="text-[8px] text-slate-500 font-mono uppercase tracking-wider mt-1">Closed</div>
              </div>
              <div className="bg-gradient-to-br from-rose-500/10 to-transparent border border-rose-500/20 rounded-2xl p-4 shadow-xl">
                <div className="text-2xl font-black text-rose-400">{stats.high_priority}</div>
                <div className="text-[8px] text-slate-500 font-mono uppercase tracking-wider mt-1">High Priority</div>
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
                  placeholder="Search tickets..."
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
                  {(filters.status !== 'all' || filters.priority !== 'all' || filters.dateFrom || filters.dateTo) && (
                    <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  )}
                </motion.button>
                {(filters.status !== 'all' || filters.priority !== 'all' || filters.search || filters.dateFrom || filters.dateTo) && (
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
                          <AlertCircle size={10} className="text-amber-400" />
                          Status
                        </label>
                        <CustomSelect
                          value={filters.status}
                          onChange={(v) => setFilters(prev => ({ ...prev, status: v }))}
                          options={[
                            { value: "all", label: "All Status" },
                            { value: "open", label: "Open" },
                            { value: "in_progress", label: "In Progress" },
                            { value: "resolved", label: "Resolved" },
                            { value: "closed", label: "Closed" },
                          ]}
                        />
                      </div>

                      {/* Priority */}
                      <div>
                        <label className="text-[8px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                          <Flag size={10} className="text-rose-400" />
                          Priority
                        </label>
                        <CustomSelect
                          value={filters.priority}
                          onChange={(v) => setFilters(prev => ({ ...prev, priority: v }))}
                          options={[
                            { value: "all", label: "All Priority" },
                            { value: "low", label: "Low" },
                            { value: "medium", label: "Medium" },
                            { value: "high", label: "High" },
                            { value: "urgent", label: "Urgent" },
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

            {/* Tickets Table */}
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
                      <th className="px-4 py-4 w-28">Priority</th>
                      <th className="px-4 py-4">Subject / Message</th>
                      <th className="px-4 py-4 w-24 text-center">Status</th>
                      <th className="px-4 py-4 w-36 text-center">Response</th>
                      <th className="px-4 py-4 w-36">Date</th>
                      <th className="px-4 py-4 w-28 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {tickets.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-20 text-center">
                          <div className="flex flex-col items-center gap-4">
                            <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                              <LifeBuoy size={32} className="text-indigo-400" />
                            </div>
                            <p className="text-slate-400 font-mono text-sm font-bold">No tickets found</p>
                            <p className="text-slate-500 text-[9px] font-mono">Try adjusting your search or filters</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      tickets.map((ticket, idx) => (
                        <motion.tr 
                          key={ticket.ticket_id} 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: Math.min(idx * 0.03, 0.3) }}
                          className={`hover:bg-white/5 transition-all group cursor-pointer ${ticket.priority === 'urgent' ? 'bg-rose-500/5' : ''}`}
                          onClick={() => setSelectedTicket(ticket)}
                        >
                          {/* ID */}
                          <td className="px-4 py-4">
                            <span className="text-indigo-400 font-black text-[11px] whitespace-nowrap">#{ticket.ticket_id}</span>
                          </td>
                          
                          {/* User */}
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                                <span className="text-[8px] text-white font-black">
                                  {ticket.name?.charAt(0)?.toUpperCase() || "?"}
                                </span>
                              </div>
                              <div className="min-w-0">
                                <p className="text-white text-xs font-bold truncate">{ticket.name}</p>
                                <p className="text-[7px] text-slate-500 font-mono truncate">{ticket.email}</p>
                              </div>
                            </div>
                          </td>
                          
                          {/* Priority */}
                          <td className="px-4 py-4">
                            <div className="flex justify-start">
                              {getPriorityBadge(ticket)}
                            </div>
                          </td>
                          
                          {/* Subject / Message */}
                          <td className="px-4 py-4 max-w-[250px]">
                            <div className="space-y-1">
                              <p className="text-white text-xs font-bold truncate">
                                {ticket.subject || 'Infrastructure Request'}
                              </p>
                              <p className="text-[10px] text-slate-400 line-clamp-1">
                                {ticket.message}
                              </p>
                            </div>
                          </td>
                          
                          {/* Status */}
                          <td className="px-4 py-4 text-center">
                            <div className="flex justify-center min-w-[80px]">
                              {getStatusBadge(ticket)}
                            </div>
                          </td>
                          
                          {/* Response */}
                          <td className="px-4 py-4 text-center">
                            {ticket.admin_response ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-[8px] text-emerald-400 font-mono font-bold whitespace-nowrap">
                                <Check size={8} /> Replied
                              </span>
                            ) : (
                              <span className="text-[8px] text-slate-500 font-mono">Pending</span>
                            )}
                          </td>
                          
                          {/* Date */}
                          <td className="px-4 py-4">
                            <div className="flex flex-col whitespace-nowrap">
                              <span className="text-[9px] text-slate-400 font-mono">{formatDate(ticket.created_at)}</span>
                            </div>
                          </td>
                          
                          {/* Actions */}
                          <td className="px-4 py-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedTicket(ticket);
                                }}
                                className="p-2 bg-white/5 hover:bg-indigo-500/20 rounded-lg text-slate-400 hover:text-indigo-400 transition-all border border-transparent hover:border-indigo-500/30"
                                title="View details"
                              >
                                <Eye size={12} />
                              </motion.button>
                              <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowDeleteConfirm(ticket.ticket_id);
                                }}
                                className="p-2 bg-white/5 hover:bg-rose-500/20 rounded-lg text-slate-400 hover:text-rose-400 transition-all border border-transparent hover:border-rose-500/30"
                                title="Delete ticket"
                              >
                                {isDeleting === ticket.ticket_id ? (
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
                      <h3 id="delete-modal-title" className="text-sm font-black text-white font-mono uppercase">Delete Ticket</h3>
                    </div>
                    <p className="text-slate-400 text-sm mb-6">
                      Are you sure you want to permanently delete this ticket? This action cannot be undone.
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowDeleteConfirm(null)}
                        className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all font-mono text-[9px] font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-white/20"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleDelete(showDeleteConfirm)}
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
          </>
        )}
      </div>
    </div>
  );
}