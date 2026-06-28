"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import "../css/User/news.css";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Analytics } from "@vercel/analytics/react";
import { track } from "@vercel/analytics/react";
import {
  Search,
  TrendingUp,
  Clock,
  User,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Globe,
  Newspaper,
  Flame,
  Activity,
  BookOpen,
  Eye,
  AlertCircle,
  Zap,
  Sparkles,
  ShieldCheck,
  Award,
  Star,
  Mail,
  Send,
  CheckCircle2,
  Loader2,
  Calendar,
  BarChart3,
  PieChart,
  MessageSquare,
  ThumbsUp,
  Share2,
  Bookmark,
  MoreHorizontal
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Type Definitions
interface Article {
  news_id: string;
  title: string;
  content: string;
  category: string;
  image_url?: string;
  published_at: string;
  views?: number;
  author?: {
    username: string;
  };
}

interface PaginatedResponse<T> {
  data: T[];
  last_page: number;
  current_page: number;
  total: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Constants
const SEARCH_DEBOUNCE_MS = 500;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache TTL

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();

const getCachedData = (key: string) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }
  cache.delete(key);
  return null;
};

const setCachedData = (key: string, data: any) => {
  cache.set(key, { data, timestamp: Date.now() });
};

const newsCategories = ["All News", "Markets", "Forex", "Crypto", "Institutional", "Policy"];

const calculateReadingTime = (content: string): string => {
  const wordCount = content.split(/\s+/).length;
  const minutes = Math.ceil(wordCount / 200);
  return minutes < 1 ? "< 1 min" : `${minutes} min`;
};

const isFreshNews = (publishedAt: string): boolean => {
  const publishedTime = new Date(publishedAt).getTime();
  const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;
  return publishedTime > thirtyMinutesAgo;
};

const ArticleCardSkeleton = () => (
  <div className="flex flex-col h-full bg-gradient-to-b from-[#11111a] to-[#0b0b11] border border-white/10 rounded-2xl p-4">
    <div className="relative aspect-video rounded-xl overflow-hidden mb-3 border border-white/5 bg-gradient-to-r from-white/5 to-white/10 animate-pulse" />
    <div className="flex flex-col gap-2 flex-grow">
      <div className="flex items-center gap-2">
        <div className="h-3 w-20 bg-white/10 rounded animate-pulse" />
        <div className="w-1 h-1 rounded-full bg-slate-800" />
        <div className="h-3 w-16 bg-white/10 rounded animate-pulse" />
      </div>
      <div className="h-5 bg-white/10 rounded animate-pulse mt-1" />
      <div className="h-5 w-4/5 bg-white/10 rounded animate-pulse" />
      <div className="h-4 bg-white/5 rounded animate-pulse mt-2" />
      <div className="h-4 w-3/4 bg-white/5 rounded animate-pulse" />
    </div>
  </div>
);

// Featured News Skeleton Component
const FeaturedSkeleton = () => (
  <div className="relative h-[450px] lg:h-[480px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-gradient-to-br from-[#11111a] to-[#0b0b11]">
    <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 animate-pulse" />
    <div className="absolute inset-0 bg-gradient-to-t from-[#05050a] via-[#05050a]/60 to-transparent" />
    <div className="absolute inset-0 p-6 sm:p-10 lg:p-12 flex flex-col justify-end gap-4 max-w-3xl">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="h-4 w-16 bg-white/10 rounded-full animate-pulse" />
        <div className="h-4 w-20 bg-white/10 rounded-full animate-pulse" />
      </div>
      <div className="flex flex-col gap-2">
        <div className="h-10 w-3/4 bg-white/10 rounded animate-pulse" />
        <div className="h-10 w-2/3 bg-white/10 rounded animate-pulse" />
      </div>
      <div className="flex flex-col gap-2">
        <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
        <div className="h-4 w-4/5 bg-white/5 rounded animate-pulse" />
      </div>
      <div className="flex flex-wrap items-center gap-4 mt-2">
        <div className="h-8 w-36 bg-indigo-500/20 rounded-lg animate-pulse" />
        <div className="flex items-center gap-4">
          <div className="h-3 w-20 bg-white/5 rounded animate-pulse" />
          <div className="h-3 w-16 bg-white/5 rounded animate-pulse" />
          <div className="h-3 w-14 bg-white/5 rounded animate-pulse" />
        </div>
      </div>
    </div>
  </div>
);

// Trending Skeleton Component
const TrendingSkeleton = () => (
  <div className="flex flex-col gap-3">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex gap-2.5 items-start p-2 rounded-lg">
        <div className="flex items-center gap-1 shrink-0">
          <div className="w-5 h-4 bg-white/5 rounded animate-pulse" />
        </div>
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <div className="h-2 w-16 bg-white/5 rounded animate-pulse" />
          <div className="h-3 w-full bg-white/5 rounded animate-pulse" />
          <div className="h-2 w-24 bg-white/5 rounded animate-pulse" />
        </div>
      </div>
    ))}
  </div>
);

export default function NewsPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [trendingArticles, setTrendingArticles] = useState<Article[]>([]);
  const [breakingNews, setBreakingNews] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All News");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });
  const [emailSubscribed, setEmailSubscribed] = useState(false);
  const [subscribeEmail, setSubscribeEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const scrollPositionRef = useRef<number>(0);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

  const showToast = (message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  };

  const incrementViewCount = async (newsId: string) => {
    try {
      const res = await fetch(`${API_BASE}/news/${newsId}/view`, {
        method: "POST",
        headers: { "Accept": "application/json" }
      });
      if (!res.ok) {
        console.error("Failed to increment view count:", res.statusText);
      }
    } catch (err) {
      console.error("Error incrementing view count:", err);
    }
  };

  const fetchBreakingNews = useCallback(async () => {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const cacheKey = `breaking_${oneHourAgo}`;
      const cachedData = getCachedData(cacheKey);

      if (cachedData) {
        setBreakingNews(cachedData || []);
        return;
      }

      const res = await fetch(`${API_BASE}/news/breaking?since=${oneHourAgo}`, {
        headers: { "Accept": "application/json" }
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setBreakingNews(data || []);
      setCachedData(cacheKey, data);
    } catch (err) {
      console.error("Error fetching breaking news:", err);
      setBreakingNews([]);
    }
  }, [API_BASE]);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const cacheKey = `news_${activeCategory}_${searchQuery}_${currentPage}`;
      const cachedData = getCachedData(cacheKey);

      if (cachedData) {
        setArticles(cachedData.data || []);
        setLastPage(cachedData.last_page || 1);
        setLoading(false);
        return;
      }

      const url = `${API_BASE}/news?category=${activeCategory}&search=${searchQuery}&page=${currentPage}`;
      const res = await fetch(url, {
        headers: { "Accept": "application/json" }
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data: PaginatedResponse<Article> = await res.json();
      setArticles(data.data || []);
      setLastPage(data.last_page || 1);
      setCachedData(cacheKey, data);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load news. Please try again later.");
      setArticles([]);
      setLastPage(1);
    } finally {
      setLoading(false);
    }
  }, [API_BASE, activeCategory, searchQuery, currentPage]);

  const fetchTrending = useCallback(async () => {
    setTrendingLoading(true);
    try {
      const cacheKey = `trending_${activeCategory}`;
      const cachedData = getCachedData(cacheKey);

      if (cachedData) {
        setTrendingArticles(cachedData || []);
        setTrendingLoading(false);
        return;
      }

      const url = `${API_BASE}/news/trending?category=${activeCategory}`;
      const res = await fetch(url, {
        headers: { "Accept": "application/json" }
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data: Article[] = await res.json();
      setTrendingArticles(data || []);
      setCachedData(cacheKey, data);
    } catch (err) {
      console.error("Fetch trending error:", err);
      setTrendingArticles([]);
    } finally {
      setTrendingLoading(false);
    }
  }, [API_BASE, activeCategory]);

  useEffect(() => {
    fetchNews();
    fetchTrending();
    fetchBreakingNews();
  }, [fetchNews, fetchTrending, fetchBreakingNews]);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setCurrentPage(1);
    scrollPositionRef.current = 0;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    track('category_change', { category: cat });
  };

  const handlePageChange = (newPage: number) => {
    scrollPositionRef.current = window.scrollY;
    setCurrentPage(newPage);
  };

  useEffect(() => {
    if (currentPage > 1) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = setTimeout(() => {
      if (value.trim()) {
        track('search', { query: value });
      }
    }, SEARCH_DEBOUNCE_MS);
  };

  const handleSubscribe = () => {
    if (subscribeEmail && subscribeEmail.includes('@')) {
      setEmailSubscribed(true);
      showToast("Successfully subscribed to Daily Alpha!");
      setSubscribeEmail("");
      setTimeout(() => setEmailSubscribed(false), 3000);
    } else {
      showToast("Please enter a valid email address");
    }
  };

  const featured = articles.length > 0 ? articles[0] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#02020a] via-[#050510] to-[#02020a] text-slate-100 selection:bg-indigo-500/30 font-sans overflow-x-hidden">
      <Header />
      
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-indigo-600/8 rounded-full blur-[150px]" />
        <div className="absolute bottom-[5%] left-[-15%] w-[600px] h-[600px] bg-purple-600/6 rounded-full blur-[120px]" />
        <div className="absolute top-[30%] left-[20%] w-[500px] h-[500px] bg-cyan-600/4 rounded-full blur-[100px]" />
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast.visible && (
          <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 400 }}
            className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl border backdrop-blur-xl flex items-center gap-3 shadow-2xl bg-emerald-500/15 border-emerald-500/40 text-emerald-200"
          >
            <CheckCircle2 size={16} />
            <p className="text-sm font-medium">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Breaking News Ticker */}
      <ErrorBoundary>
        {breakingNews.length > 0 && (
          <div className="relative overflow-hidden bg-gradient-to-r from-red-950/30 via-orange-950/20 to-red-950/30 border-y border-red-500/20">
            <div className="max-w-7xl mx-auto px-4 lg:px-8 py-2.5 flex items-center gap-4">
              <div className="flex items-center gap-2 text-red-400 font-mono font-bold text-[10px] uppercase tracking-widest shrink-0 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/30">
                <AlertCircle size={12} className="animate-pulse" />
                Breaking
              </div>
              <div className="flex-1 overflow-hidden relative">
                <div className="flex gap-8 animate-marquee whitespace-nowrap">
                {breakingNews.map((news, idx) => (
                  <Link 
                    key={idx} 
                    href={`/news/${news.news_id}`} 
                    onClick={() => incrementViewCount(news.news_id)}
                    className="text-slate-300 hover:text-white text-xs font-medium transition-colors flex items-center gap-2 group"
                  >
                    <span className="text-red-400 font-mono text-[9px] uppercase px-2 py-0.5 rounded bg-red-500/10 border border-red-500/30">
                      {news.category}
                    </span>
                    <span className="group-hover:text-red-400 transition-colors">{news.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
        )}
      </ErrorBoundary>

      <main className="pt-32 pb-20 flex-grow relative">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 flex flex-col gap-10 relative z-10">
          
          {/* Header Title Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-3"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full w-fit backdrop-blur-sm">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-500"></span>
              </span>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400">
                Market Intelligence Network
              </span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight uppercase leading-none">
              Global <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-sky-400">Insights</span>
            </h1>
            <p className="text-slate-400 text-sm max-w-xl">
              Real-time central bank policy monitors, institutional sentiment briefs, and quantitative analysis feeds.
            </p>
          </motion.div>

          {/* 1. FEATURED NEWS */}
          <ErrorBoundary>
            {loading ? (
              <FeaturedSkeleton />
            ) : (
              featured && currentPage === 1 && searchQuery === "" && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="w-full"
                >
                  <Link href={`/news/${featured.news_id}`} onClick={() => incrementViewCount(featured.news_id)}>
                    <div className="relative group h-[450px] lg:h-[480px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl cursor-pointer">
                      <img
                        src={featured.image_url || "https://images.unsplash.com/photo-1611974717483-3600171ea7f7?w=1200"}
                        loading="eager"
                        className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-50 transition-all duration-700 group-hover:scale-105"
                        alt="Hero"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#05050a] via-[#05050a]/60 to-transparent" />
                      <div className="absolute inset-0 p-6 sm:p-10 lg:p-12 flex flex-col justify-end gap-4 max-w-3xl">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-indigo-400 font-bold text-[8px] uppercase tracking-widest bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/30 backdrop-blur-sm font-mono">
                            {featured.category}
                          </span>
                          <span className="text-emerald-400 font-bold text-[8px] uppercase tracking-widest bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30 backdrop-blur-sm font-mono">
                            Featured Brief
                          </span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight group-hover:text-indigo-400 transition-colors line-clamp-2">
                          {featured.title}
                        </h2>
                        <p className="text-slate-300 text-xs sm:text-sm line-clamp-2 max-w-2xl font-normal leading-relaxed">
                          {featured.content}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 mt-2">
                          <span className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-mono font-black text-[10px] uppercase tracking-wider px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/30">
                            Read Full Story <ArrowRight size={11} />
                          </span>
                          <div className="flex items-center gap-4 text-[10px] font-mono text-slate-400">
                            <span className="flex items-center gap-1.5">
                              <Clock size={10} /> {new Date(featured.published_at).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Eye size={10} /> {featured.views || 0} views
                            </span>
                            <span className="flex items-center gap-1.5">
                              <BookOpen size={10} /> {calculateReadingTime(featured.content)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.section>
              )
            )}
          </ErrorBoundary>

          {/* TWO-COLUMN GRID */}
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT SIDEBAR */}
            <div className="lg:col-span-8 flex flex-col gap-8">
              
              {/* Categories & Search */}
              <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
                <div className="flex bg-white/[0.02] border border-white/10 p-1 rounded-xl backdrop-blur-sm overflow-x-auto gap-1 scrollbar-none" role="tablist">
                  {newsCategories.map(cat => (
                    <motion.button
                      key={cat}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleCategoryChange(cat)}
                      role="tab"
                      aria-selected={activeCategory === cat}
                      aria-label={`Filter by ${cat}`}
                      className={`px-3 py-1.5 text-[10px] font-bold font-mono tracking-wide rounded-lg transition-all whitespace-nowrap cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                        activeCategory === cat
                          ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/30'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {cat}
                    </motion.button>
                  ))}
                </div>

                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={12} />
                  <input
                    type="text"
                    placeholder="Search terminal..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    aria-label="Search news articles"
                    className="w-full md:w-56 bg-black/40 border border-white/10 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 rounded-xl py-2 pl-8 pr-3 text-[11px] font-mono text-white outline-none transition-all focus:bg-black/60"
                  />
                </div>
              </div>

              {/* News Grid */}
              <ErrorBoundary>
                <div className="flex flex-col gap-6">
                  {loading ? (
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {[...Array(6)].map((_, i) => (
                        <ArticleCardSkeleton key={i} />
                      ))}
                    </div>
                  ) : (
                    <AnimatePresence mode="popLayout">
                      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {articles.length > 0 ? (
                          articles.map((article, i) => (
                            <Link key={article.news_id} href={`/news/${article.news_id}`} onClick={() => incrementViewCount(article.news_id)} aria-label={`Read article: ${article.title}`}>
                              <motion.article
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3, delay: i * 0.05 }}
                                className="group flex flex-col h-full bg-gradient-to-br from-[#11111a] to-[#0b0b11] border border-white/10 rounded-xl p-3 hover:border-indigo-500/40 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300 cursor-pointer"
                              >
                                <div className="relative aspect-video rounded-lg overflow-hidden mb-3 border border-white/5">
                                  <img
                                    src={article.image_url || "https://images.unsplash.com/photo-1611974717483-3600171ea7f7?w=400"}
                                    loading="lazy"
                                    className="w-full h-full object-cover grayscale-[60%] opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105"
                                    alt="News"
                                  />
                                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 backdrop-blur-md rounded-lg text-[7px] font-mono font-black text-indigo-400 uppercase tracking-widest border border-white/10">
                                    {article.category}
                                  </div>
                                  {isFreshNews(article.published_at) && (
                                    <div className="absolute top-2 right-2 px-2 py-0.5 bg-red-600/90 backdrop-blur-md rounded-lg text-[6px] font-mono font-black text-white uppercase tracking-widest border border-red-400/30 animate-pulse">
                                      NEW
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex flex-col gap-1.5 flex-grow">
                                  <div className="flex items-center gap-2 text-[8px] font-mono font-medium text-slate-500 uppercase tracking-wider">
                                    <span className="flex items-center gap-1">
                                      <Calendar size={8} /> {new Date(article.published_at).toLocaleDateString()}
                                    </span>
                                    <div className="w-0.5 h-0.5 rounded-full bg-slate-700" />
                                    <span className="flex items-center gap-1 truncate">
                                      <User size={8} /> {article.author?.username || 'system'}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-[8px] font-mono text-slate-500">
                                    <span className="flex items-center gap-1"><Eye size={8} /> {article.views || 0}</span>
                                    <span className="flex items-center gap-1"><BookOpen size={8} /> {calculateReadingTime(article.content)}</span>
                                  </div>
                                  <h3 className="text-xs font-bold text-slate-100 group-hover:text-indigo-400 transition-colors leading-tight line-clamp-2 mt-1">
                                    {article.title}
                                  </h3>
                                  <p className="text-[9px] text-slate-400 leading-relaxed line-clamp-2">
                                    {article.content.substring(0, 100)}...
                                  </p>
                                </div>
                              </motion.article>
                            </Link>
                          ))
                        ) : (
                          <div className="col-span-full py-16 text-center bg-[#0d0d14]/20 rounded-2xl border border-white/10 flex flex-col items-center justify-center gap-3">
                            <Newspaper size={28} className="text-slate-600" />
                            <p className="text-slate-500 font-mono text-xs italic">No articles match your query.</p>
                          </div>
                        )}
                      </div>
                    </AnimatePresence>
                  )}
                </div>
              </ErrorBoundary>

              {/* Pagination */}
              <ErrorBoundary>
                {!loading && lastPage > 1 && (
                  <div className="flex justify-center mt-2">
                    <div className="flex items-center gap-1 p-1 bg-black/40 border border-white/10 rounded-xl">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                        aria-label="Previous page"
                        className="p-1.5 text-slate-500 hover:text-white disabled:opacity-30 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      >
                        <ChevronLeft size={14} />
                      </motion.button>
                      {Array.from({ length: Math.min(lastPage, 5) }, (_, i) => {
                        let pageNum;
                        if (lastPage <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= lastPage - 2) {
                          pageNum = lastPage - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        return (
                          <motion.button
                            key={pageNum}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handlePageChange(pageNum)}
                            aria-label={`Go to page ${pageNum}`}
                            aria-current={currentPage === pageNum ? 'page' : undefined}
                            className={`w-7 h-7 flex items-center justify-center text-[9px] font-mono font-black rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                              currentPage === pageNum
                                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md'
                                : 'text-slate-500 hover:text-white hover:bg-white/5'
                            }`}
                          >
                            {pageNum}
                          </motion.button>
                        );
                      })}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={currentPage === lastPage}
                        onClick={() => handlePageChange(currentPage + 1)}
                        aria-label="Next page"
                        className="p-1.5 text-slate-500 hover:text-white disabled:opacity-30 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      >
                        <ChevronRight size={14} />
                      </motion.button>
                    </div>
                  </div>
                )}
              </ErrorBoundary>
            </div>

            {/* RIGHT SIDEBAR */}
            <ErrorBoundary>
              <aside className="lg:col-span-4 sticky top-28 space-y-5">
                {/* Trending News */}
                <div className="bg-gradient-to-br from-[#11111a] to-[#0c0c12] border border-white/10 rounded-xl p-4 shadow-xl">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06]">
                    <h3 className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                      <Flame size={12} className="text-orange-500" /> Hot Vectors
                    </h3>
                    <Activity size={10} className="text-slate-600" />
                  </div>

                  {trendingLoading ? (
                    <TrendingSkeleton />
                  ) : (
                    <div className="flex flex-col gap-3">
                      {trendingArticles.length > 0 ? (
                        trendingArticles.slice(0, 5).map((article, idx) => {
                          const isHot = idx < 3;
                          return (
                            <Link key={`trending-${article.news_id}`} href={`/news/${article.news_id}`} onClick={() => incrementViewCount(article.news_id)}>
                              <div className="group flex gap-2.5 items-start p-2 rounded-lg hover:bg-white/[0.02] transition-all duration-200">
                                <div className="flex items-center gap-1 shrink-0">
                                  {isHot && <Flame size={10} className="text-orange-500" />}
                                  <span className={`font-mono text-sm font-black transition-colors w-5 ${isHot ? 'text-orange-500' : 'text-slate-600 group-hover:text-indigo-400'}`}>
                                    {idx + 1}
                                  </span>
                                </div>
                                <div className="flex flex-col gap-1 flex-1 min-w-0">
                                  <span className="text-[7px] font-mono font-bold text-indigo-400 uppercase tracking-wider">
                                    {article.category}
                                  </span>
                                  <h4 className="text-[10px] font-bold text-slate-200 group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug">
                                    {article.title}
                                  </h4>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[7px] text-slate-500 font-mono">{new Date(article.published_at).toLocaleDateString()}</span>
                                    <span className="text-[7px] text-indigo-400 font-mono">{article.views || 0} views</span>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          );
                        })
                      ) : (
                        <p className="text-[10px] font-mono text-slate-600 italic py-4 text-center">No trending articles</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Newsletter Subscription */}
                <div className="bg-gradient-to-br from-indigo-950/30 to-purple-950/20 border border-indigo-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail size={14} className="text-indigo-400" />
                    <h4 className="text-[11px] font-mono font-bold text-slate-200 uppercase tracking-wider">Daily Alpha</h4>
                  </div>
                  <p className="text-[9px] text-slate-400 mb-3 leading-relaxed">Get market summary and top insights every morning</p>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={subscribeEmail}
                      onChange={(e) => setSubscribeEmail(e.target.value)}
                      placeholder="your@email.com"
                      aria-label="Email address for newsletter subscription"
                      className="flex-1 bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-[9px] text-slate-200 placeholder-slate-600 outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all font-mono"
                    />
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSubscribe}
                      aria-label="Subscribe to newsletter"
                      className="px-2.5 py-1.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-lg text-[8px] font-bold font-mono uppercase tracking-wider transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    >
                      <Send size={10} />
                    </motion.button>
                  </div>
                  {emailSubscribed && (
                    <p className="text-[7px] text-emerald-400 mt-2 flex items-center gap-1">
                      <CheckCircle2 size={8} /> Subscribed successfully!
                    </p>
                  )}
                </div>

                {/* Stats Widget */}
                <div className="bg-black/40 border border-white/10 rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <BarChart3 size={10} className="text-indigo-400" />
                      <span className="text-[8px] font-mono text-slate-400 uppercase tracking-wider">Network Stats</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[7px] font-mono text-emerald-400">LIVE</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="text-center">
                      <div className="text-xs font-black text-white">{articles.length}+</div>
                      <div className="text-[6px] text-slate-500 font-mono uppercase">Articles</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-black text-white">24/7</div>
                      <div className="text-[6px] text-slate-500 font-mono uppercase">Coverage</div>
                    </div>
                  </div>
                </div>

                {/* Connection Status */}
                <div className="bg-black/40 border border-white/10 px-3 py-2 rounded-lg flex items-center gap-2">
                  <Globe size={10} className="text-indigo-400" />
                  <span className="text-[8px] font-mono text-slate-400 uppercase tracking-wider">Secure Terminal: Active</span>
                  <ShieldCheck size={8} className="text-emerald-400 ml-auto" />
                </div>
              </aside>
            </ErrorBoundary>
          </div>
        </div>
      </main>

      <Footer />

      <Analytics />
    </div>
  );
}