"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import "../css/User/newsdetail.css";
import ReactMarkdown from 'react-markdown';
import DOMPurify from 'dompurify';
import { Analytics } from "@vercel/analytics/react";
import { track } from "@vercel/analytics/react";

// Type Definitions
interface User {
  user_id: number;
  username: string;
}

interface Comment {
  comment_id: number;
  content: string;
  rating?: number;
  user: User;
  likes: number;
  is_liked: boolean;
  created_at: string;
  replies?: Comment[];
  parent_comment_id?: number;
  parent_user?: User;
  is_optimistic?: boolean;
}

interface Article {
  news_id?: number;
  title: string;
  content: string;
  image_url?: string;
  category: string;
  author: string;
  created_at: string;
  comments?: Comment[];
  views?: number;
}

interface Pagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface BanStatus {
  banned: boolean;
  ban_reason?: string;
  banned_until?: string;
}

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info';
  visible: boolean;
}
import {
  ArrowLeft, Clock, User, Globe2, MessageSquare,
  Star, Send, Loader2, Bookmark, Share2, Sparkles,
  Eye, ShieldCheck, Hash, ChevronRight, Activity, Edit, Trash2,
  Calendar, Award, TrendingUp, CheckCircle2, Zap, X,
  Quote, Link2, Copy,
  AlertCircle, Check, ThumbsUp, MessageCircle, MoreHorizontal,
  ChevronDown, ChevronUp, Flag
} from "lucide-react";
import { motion, useScroll, useSpring, AnimatePresence } from "framer-motion";

// Twitter và LinkedIn Icons
const TwitterIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const LinkedinIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

// Skeleton Components
const ArticleHeaderSkeleton = () => (
  <div className="mb-6">
    <div className="flex flex-wrap items-center gap-3 mb-4">
      <div className="h-7 w-24 bg-white/10 rounded-full animate-pulse" />
      <div className="flex items-center gap-3">
        <div className="h-4 w-20 bg-white/10 rounded animate-pulse" />
        <div className="h-4 w-16 bg-white/10 rounded animate-pulse" />
      </div>
    </div>
    <div className="h-12 w-3/4 bg-white/10 rounded animate-pulse mb-4" />
    <div className="h-12 w-1/2 bg-white/10 rounded animate-pulse mb-4" />
    <div className="flex items-center gap-3 mt-4 pb-4 border-b border-white/10">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
        <div className="flex flex-col gap-1">
          <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
          <div className="h-3 w-20 bg-white/10 rounded animate-pulse" />
        </div>
      </div>
    </div>
  </div>
);

const FeaturedImageSkeleton = () => (
  <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
    <div className="w-full aspect-video bg-white/10 animate-pulse" />
  </div>
);

const ArticleContentSkeleton = () => (
  <div className="space-y-4">
    <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
    <div className="h-4 w-5/6 bg-white/10 rounded animate-pulse" />
    <div className="h-4 w-4/6 bg-white/10 rounded animate-pulse" />
    <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
    <div className="h-4 w-3/4 bg-white/10 rounded animate-pulse" />
    <div className="h-4 w-5/6 bg-white/10 rounded animate-pulse" />
    <div className="h-4 w-2/3 bg-white/10 rounded animate-pulse" />
    <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
  </div>
);

const CommentsSkeleton = () => (
  <div className="space-y-4">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="flex gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
        <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
          <div className="h-3 w-full bg-white/10 rounded animate-pulse" />
          <div className="h-3 w-4/5 bg-white/10 rounded animate-pulse" />
        </div>
      </div>
    ))}
  </div>
);

const RelatedNewsSkeleton = () => (
  <div className="space-y-3">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="flex gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
        <div className="w-20 h-14 bg-white/10 rounded-lg animate-pulse flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-full bg-white/10 rounded animate-pulse" />
          <div className="h-3 w-2/3 bg-white/10 rounded animate-pulse" />
        </div>
      </div>
    ))}
  </div>
);

// Comment component với giao diện giống Facebook - có highlight @username
const CommentItem = ({
  comment,
  currentUserId,
  onLike,
  onEdit,
  onDelete,
  onReport,
  isDeleting,
  editingCommentId,
  editContent,
  setEditContent,
  onSaveEdit,
  onCancelEdit,
  replyingTo,
  setReplyingTo,
  replyContent,
  setReplyContent,
  onSubmitReply,
  isSubmittingReply,
  depth = 0
}: any) => {
  const [showReplies, setShowReplies] = useState(true);
  const hasReplies = comment.replies && comment.replies.length > 0;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Tính toán độ thụt vào dựa trên depth
  const indentLevel = depth > 0 ? `${depth * 44}px` : '0px';

  // Hàm xử lý khi bắt đầu reply
  const handleStartReply = () => {
    if (replyingTo === comment.comment_id) {
      setReplyingTo(null);
      setReplyContent("");
    } else {
      setReplyingTo(comment.comment_id);
      // Đặt nội dung reply với tag @username và khoảng trắng sau nó
      const username = comment.user?.username || 'user';
      setReplyContent(`@${username} `);
      
      // Focus vào textarea sau khi state được cập nhật
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          // Đặt cursor ở cuối text (sau dấu cách)
          const length = textareaRef.current.value.length;
          textareaRef.current.setSelectionRange(length, length);
        }
      }, 50);
    }
  };

  // Hàm xử lý khi gõ trong textarea reply
  const handleReplyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    // Nếu đang reply và tag bị xóa hoặc thay đổi, tự động thêm lại
    if (replyingTo && value.trim().length === 0) {
      const username = comment.user?.username || 'user';
      setReplyContent(`@${username} `);
      // Đặt cursor sau tag
      setTimeout(() => {
        if (textareaRef.current) {
          const length = textareaRef.current.value.length;
          textareaRef.current.setSelectionRange(length, length);
        }
      }, 10);
    } else {
      setReplyContent(value);
    }
  };

  // Hàm render nội dung với tag được bôi màu
  const renderContentWithHighlight = (content: string) => {
    // Tìm tất cả các tag @username trong nội dung
    const parts = content.split(/(@\w+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        return (
          <span key={index} className="text-indigo-400 font-semibold">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div
      className={`relative ${depth > 0 ? 'mt-2' : 'mb-4'}`}
      style={{ marginLeft: depth > 0 ? indentLevel : '0' }}
      tabIndex={0}
      role="article"
      aria-label={`Comment by ${comment.user?.username || 'Anonymous'}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleStartReply();
        }
      }}
    >
      {/* Đường kẻ dọc cho replies - style Facebook */}
      {depth > 0 && (
        <div 
          className="absolute left-0 top-0 bottom-0 w-0.5 bg-indigo-500/20 rounded-full"
          style={{ left: '16px' }}
        />
      )}

      {/* Comment Card - style Facebook */}
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <User size={16} className="text-white" />
          </div>
        </div>

        {/* Comment Body */}
        <div className="flex-1 min-w-0">
          <div className={`${depth > 0 ? 'bg-[#1a1a24]' : 'bg-[#18181f]'} rounded-2xl px-4 py-2.5 border border-white/5`}>
            {/* Header: Username + Time + Rating */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-white hover:underline cursor-pointer">
                {comment.user?.username || 'Anonymous'}
              </span>
              {comment.user?.user_id === currentUserId && (
                <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
                  You
                </span>
              )}
              {depth > 0 && comment.parent_user?.username && (
                <span className="text-[9px] font-mono text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded-full border border-indigo-500/20">
                  @{comment.parent_user.username}
                </span>
              )}
              <span className="text-[10px] text-slate-500">·</span>
              <span className="text-[10px] text-slate-500">
                {new Date(comment.created_at).toLocaleDateString('vi-VN', { 
                  day: '2-digit', 
                  month: '2-digit', 
                  year: 'numeric' 
                })}
              </span>
              {comment.rating && (
                <>
                  <span className="text-[10px] text-slate-600">·</span>
                  <div className="flex items-center gap-0.5">
                    <Star size={10} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-[9px] text-slate-400">{comment.rating}</span>
                  </div>
                </>
              )}
            </div>

            {/* Content / Edit Form - với highlight cho @username */}
            {editingCommentId === comment.comment_id ? (
              <div className="mt-1 space-y-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-slate-200 text-sm outline-none focus:border-indigo-500/50 resize-none min-h-[60px]"
                  placeholder="Edit your comment..."
                  autoFocus
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={onCancelEdit}
                    className="px-3 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => onSaveEdit(comment.comment_id)}
                    className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-all"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-200 leading-relaxed mt-0.5 break-words">
                {renderContentWithHighlight(comment.content)}
              </p>
            )}
          </div>

          {/* Action Buttons - style Facebook */}
          <div className="flex items-center gap-1 mt-0.5 ml-1">
            <button
              onClick={() => onLike(comment.comment_id)}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium transition-all hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                comment.is_liked
                  ? 'text-indigo-400'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
              aria-label={`Like comment by ${comment.user?.username || 'Anonymous'}`}
            >
              <ThumbsUp size={12} className={comment.is_liked ? 'fill-indigo-400' : ''} />
              <span>{comment.likes || 0}</span>
            </button>

            <button
              onClick={handleStartReply}
              className="flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              aria-label={`Reply to comment by ${comment.user?.username || 'Anonymous'}`}
            >
              <MessageCircle size={12} />
              Reply
            </button>

            {/* Report button - only for other users' comments */}
            {comment.user?.user_id !== currentUserId && (
              <button
                onClick={() => onReport(comment.comment_id, comment.user?.username)}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all focus:outline-none focus:ring-2 focus:ring-red-500/50"
                aria-label={`Report comment by ${comment.user?.username || 'Anonymous'}`}
              >
                <Flag size={12} />
              </button>
            )}

            {/* Edit/Delete buttons - only for own comments */}
            {comment.user?.user_id === currentUserId && (
              <>
                <button
                  onClick={() => onEdit(comment)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  aria-label="Edit your comment"
                >
                  <Edit size={12} />
                </button>
                <button
                  onClick={() => onDelete(comment.comment_id)}
                  disabled={isDeleting === comment.comment_id}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  aria-label="Delete your comment"
                >
                  {isDeleting === comment.comment_id ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Trash2 size={12} />
                  )}
                </button>
              </>
            )}
          </div>

          {/* Reply Form - với tag @username được bôi màu */}
          {replyingTo === comment.comment_id && (
            <div className="mt-2 ml-1">
              <div className="flex gap-2 items-start">
                <div className="flex-shrink-0">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                    <User size={12} className="text-white" />
                  </div>
                </div>
                <div className="flex-1 bg-[#1a1a24] rounded-2xl px-3 py-2 border border-white/5">
                  <textarea
                    ref={textareaRef}
                    value={replyContent}
                    onChange={handleReplyChange}
                    className="w-full bg-transparent border-none text-slate-200 text-sm outline-none resize-none min-h-[40px] placeholder:text-slate-600"
                    placeholder={`Reply to ${comment.user?.username}...`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        onSubmitReply(e, comment.comment_id);
                      }
                    }}
                  />
                  <div className="flex gap-2 justify-end mt-1">
                    <button
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyContent("");
                      }}
                      className="px-3 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={(e) => onSubmitReply(e, comment.comment_id)}
                      disabled={isSubmittingReply || !replyContent.trim() || replyContent === `@${comment.user?.username} `}
                      className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      {isSubmittingReply ? <Loader2 className="animate-spin" size={12} /> : <Send size={12} />}
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Replies Section */}
      {hasReplies && (
        <div className="mt-1">
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-indigo-400 transition-colors mb-1 ml-12"
          >
            {showReplies ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {showReplies ? 'Hide' : 'View'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
          </button>
          {showReplies && (
            <div className="space-y-3">
              {comment.replies.map((reply: any) => (
                <CommentItem
                  key={reply.comment_id}
                  comment={reply}
                  currentUserId={currentUserId}
                  onLike={onLike}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onReport={onReport}
                  isDeleting={isDeleting}
                  editingCommentId={editingCommentId}
                  editContent={editContent}
                  setEditContent={setEditContent}
                  onSaveEdit={onSaveEdit}
                  onCancelEdit={onCancelEdit}
                  replyingTo={replyingTo}
                  setReplyingTo={setReplyingTo}
                  replyContent={replyContent}
                  setReplyContent={setReplyContent}
                  onSubmitReply={onSubmitReply}
                  isSubmittingReply={isSubmittingReply}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function NewsDetailPage() {
  const params = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const commentSectionRef = useRef<HTMLDivElement>(null);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [aiSummary, setAiSummary] = useState<string[]>([]);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [showBriefing, setShowBriefing] = useState(false);
  const [relatedNews, setRelatedNews] = useState<Article[]>([]);
  const [toast, setToast] = useState<ToastState>({ message: '', type: 'info', visible: false });
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Report states
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportingCommentId, setReportingCommentId] = useState<number | null>(null);
  const [reportingUsername, setReportingUsername] = useState<string>('');
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [userBanStatus, setUserBanStatus] = useState<BanStatus | null>(null);
  const [commentPage, setCommentPage] = useState(1);
  const [commentPagination, setCommentPagination] = useState<Pagination | null>(null);

  // Debounce/cooldown for comment submission
  const lastCommentSubmissionTime = useRef<number>(0);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isLoadingMoreComments, setIsLoadingMoreComments] = useState(false);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [topComments, setTopComments] = useState<any[]>([]);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Constants
  const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache TTL
  const COMMENT_SUBMISSION_COOLDOWN_MS = 2000; // 2 seconds cooldown
  const INTERSECTION_THRESHOLD = 0.1;
  const TOAST_DURATION_MS = 3000;
  const COPY_FEEDBACK_DURATION_MS = 2000;

  // Cache Strategy
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

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), TOAST_DURATION_MS);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast("Link copied to clipboard!", "success");
    setTimeout(() => setCopied(false), COPY_FEEDBACK_DURATION_MS);
  };

  // Consolidated API calls on mount - use Promise.all for parallel requests
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!params.id) return;

      const token = localStorage.getItem("token");
      const headers: any = { "Accept": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      try {
        // Fetch all data in parallel using Promise.all
        const [
          articleData,
          commentsData,
          relatedNewsData,
          topCommentsData,
          currentUserData,
          banStatusData
        ] = await Promise.allSettled([
          // Fetch article
          (async () => {
            const cacheKey = `article_${params.id}`;
            const cachedData = getCachedData(cacheKey);

            if (cachedData) {
              return cachedData;
            }

            const res = await fetch(`${API_BASE}/news/${params.id}`, { headers });
            const data = await res.json();
            if (data && data.news) {
              setCachedData(cacheKey, data);
              const articleId = Array.isArray(params.id) ? params.id[0] : params.id;
              track('article_view', { article_id: String(articleId), title: data.news.title, category: data.news.category });
            }
            return data;
          })(),

          // Fetch comments (first page only)
          (async () => {
            const cacheKey = `comments_${params.id}_page_1`;
            const cachedData = getCachedData(cacheKey);

            if (cachedData) {
              return cachedData;
            }

            const res = await fetch(`${API_BASE}/news/${params.id}/comments?page=1`, { headers });
            const data = await res.json();
            if (data && data.success) {
              setCachedData(cacheKey, data);
            }
            return data;
          })(),

          // Fetch related news
          (async () => {
            const cacheKey = `related_${params.id}`;
            const cachedData = getCachedData(cacheKey);

            if (cachedData) {
              return cachedData;
            }

            const res = await fetch(`${API_BASE}/news/${params.id}/related`);
            const data = await res.json();
            if (data) {
              setCachedData(cacheKey, data);
            }
            return data;
          })(),

          // Fetch top comments
          (async () => {
            const res = await fetch(`${API_BASE}/news/${params.id}/top-comments`, { headers });
            const data = await res.json();
            return data;
          })(),

          // Fetch current user
          (async () => {
            if (!token) return null;
            const res = await fetch(`${API_BASE}/user`, {
              headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" }
            });
            if (res.ok) {
              const data = await res.json();
              return data.user?.user_id || data.user_id;
            }
            return null;
          })(),

          // Check ban status
          (async () => {
            if (!token) return null;
            const res = await fetch(`${API_BASE}/user/ban-status`, {
              headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            return data;
          })()
        ]);

        // Handle results
        if (articleData.status === 'fulfilled' && articleData.value && articleData.value.news) {
          setArticle({ ...articleData.value.news, comments: [] });
          setIsFavorited(articleData.value.is_favorited);
        }

        if (commentsData.status === 'fulfilled' && commentsData.value && commentsData.value.success) {
          setArticle(prev => ({ ...prev, comments: commentsData.value.data || [] }));
          setCommentPagination(commentsData.value.pagination);
          setHasMoreComments(commentsData.value.pagination?.current_page < commentsData.value.pagination?.last_page);
        }

        if (relatedNewsData.status === 'fulfilled') {
          setRelatedNews(relatedNewsData.value || []);
        }

        if (topCommentsData.status === 'fulfilled' && topCommentsData.value && topCommentsData.value.success) {
          setTopComments(topCommentsData.value.data || []);
        }

        if (currentUserData.status === 'fulfilled' && currentUserData.value) {
          setCurrentUserId(currentUserData.value);
        }

        if (banStatusData.status === 'fulfilled' && banStatusData.value) {
          setUserBanStatus(banStatusData.value);
        }

      } catch (error) {
        console.error("Error fetching initial data:", error);
      } finally {
        setLoading(false);
        setIsLoadingComments(false);
      }
    };

    fetchInitialData();
  }, [params.id]);

  const loadMoreComments = useCallback(() => {
    if (!isLoadingMoreComments && hasMoreComments) {
      setCommentPage(prev => prev + 1);
    }
  }, [isLoadingMoreComments, hasMoreComments]);

  // Separate useEffect for load more comments (triggered by intersection observer)
  useEffect(() => {
    const fetchComments = async () => {
      if (!params.id || commentPage === 1) return; // Skip first page (already loaded)

      setIsLoadingMoreComments(true);
      try {
        const cacheKey = `comments_${params.id}_page_${commentPage}`;
        const cachedData = getCachedData(cacheKey);

        if (cachedData) {
          setArticle(prev => ({ ...prev, comments: [...(prev.comments || []), ...cachedData.data] }));
          setCommentPagination(cachedData.pagination);
          setHasMoreComments(cachedData.pagination?.current_page < cachedData.pagination?.last_page);
          return;
        }

        const token = localStorage.getItem("token");
        const headers: any = { "Accept": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(`${API_BASE}/news/${params.id}/comments?page=${commentPage}`, { headers });
        const data = await res.json();

        if (data && data.success) {
          setArticle(prev => ({ ...prev, comments: [...(prev.comments || []), ...data.data] }));
          setCommentPagination(data.pagination);
          setHasMoreComments(data.pagination?.current_page < data.pagination?.last_page);
          setCachedData(cacheKey, data);
        }
      } catch (error) {
        console.error("Error loading more comments:", error);
      } finally {
        setIsLoadingMoreComments(false);
      }
    };

    fetchComments();
  }, [params.id, commentPage]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreComments && !isLoadingMoreComments) {
          loadMoreComments();
        }
      },
      { threshold: INTERSECTION_THRESHOLD }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [hasMoreComments, isLoadingMoreComments, loadMoreComments]);

  const handleToggleFavorite = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      showToast("Please login to favorite!", "error");
      return;
    }
    setFavLoading(true);
    try {
      const res = await fetch(`${API_BASE}/news/${params.id}/favorite`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" }
      });
      const data = await res.json();
      setIsFavorited(data.is_favorited);
      showToast(data.is_favorited ? "Added to favorites" : "Removed from favorites", "success");
    } finally { setFavLoading(false); }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      showToast("Please login to comment", "error");
      return;
    }

    // Kiểm tra user bị ban
    if (userBanStatus?.banned) {
      showToast(`You are banned from commenting: ${userBanStatus.ban_reason}`, "error");
      return;
    }

    if (!comment.trim()) return;

    // Check cooldown to prevent spam
    const now = Date.now();
    if (now - lastCommentSubmissionTime.current < COMMENT_SUBMISSION_COOLDOWN_MS) {
      const remainingTime = Math.ceil((COMMENT_SUBMISSION_COOLDOWN_MS - (now - lastCommentSubmissionTime.current)) / 1000);
      showToast(`Please wait ${remainingTime} seconds before posting another comment`, "error");
      return;
    }

    // Create optimistic comment
    const optimisticComment = {
      comment_id: Date.now(), // Temporary ID
      content: comment,
      rating: rating,
      user: {
        user_id: currentUserId,
        username: 'You',
      },
      likes: 0,
      is_liked: false,
      created_at: new Date().toISOString(),
      replies: [],
      is_optimistic: true, // Flag to identify optimistic comments
    };

    // Add optimistic comment immediately
    setArticle({
      ...article,
      comments: [optimisticComment, ...(article.comments || [])]
    });

    const originalComment = comment;
    setComment("");
    setRating(5);

    // Update last submission time
    lastCommentSubmissionTime.current = Date.now();

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/news/${params.id}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ content: originalComment, rating })
      });
      const data = await res.json();
      if (res.ok) {
        // Replace optimistic comment with real server response
        setArticle(prev => ({
          ...prev,
          comments: prev.comments?.map(c =>
            c.is_optimistic ? { ...data.comment, replies: [] } : c
          ) || []
        }));
        showToast("Comment posted successfully!", "success");
        const articleId = Array.isArray(params.id) ? params.id[0] : params.id;
        track('comment_submit', { article_id: String(articleId) });
      } else if (res.status === 403) {
        // User bị ban - remove optimistic comment
        setArticle(prev => ({
          ...prev,
          comments: prev.comments?.filter(c => !c.is_optimistic) || []
        }));
        showToast(data.message || "You are banned from commenting", "error");
        setUserBanStatus(data);
        // Restore comment text
        setComment(originalComment);
        // Reset cooldown on error
        lastCommentSubmissionTime.current = 0;
      } else {
        // Other error - remove optimistic comment
        setArticle(prev => ({
          ...prev,
          comments: prev.comments?.filter(c => !c.is_optimistic) || []
        }));
        showToast(data.message || "Failed to post comment", "error");
        // Restore comment text
        setComment(originalComment);
        // Reset cooldown on error
        lastCommentSubmissionTime.current = 0;
      }
    } catch (error) {
      // Network error - remove optimistic comment
      setArticle(prev => ({
        ...prev,
        comments: prev.comments?.filter(c => !c.is_optimistic) || []
      }));
      showToast("Failed to post comment. Please try again.", "error");
      // Restore comment text
      setComment(originalComment);
      // Reset cooldown on error
      lastCommentSubmissionTime.current = 0;
    } finally { setIsSubmitting(false); }
  };

  const handleDeleteComment = async (commentId: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      showToast("Please login to delete comment", "error");
      return;
    }

    if (!confirm("Are you sure you want to delete this comment?")) return;

    setIsDeleting(commentId);
    try {
      const res = await fetch(`${API_BASE}/news/${params.id}/comment/${commentId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        // Remove comment from nested structure
        const removeComment = (comments: any[], id: number): any[] => {
          return comments.filter((c: any) => {
            if (c.comment_id === id) return false;
            if (c.replies) {
              c.replies = removeComment(c.replies, id);
            }
            return true;
          });
        };
        setArticle({
          ...article,
          comments: removeComment(article.comments, commentId)
        });
        showToast("Comment deleted", "success");
      }
    } finally { setIsDeleting(null); }
  };

  const handleEditComment = (comment: any) => {
    setEditingCommentId(comment.comment_id);
    setEditContent(comment.content);
  };

  const handleSaveEdit = async (commentId: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      showToast("Please login to edit comment", "error");
      return;
    }
    if (!editContent.trim()) return;

    try {
      const res = await fetch(`${API_BASE}/news/${params.id}/comment/${commentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ content: editContent })
      });
      const data = await res.json();
      if (res.ok) {
        // Update comment in nested structure
        const updateComment = (comments: any[]): any[] => {
          return comments.map((c: any) => {
            if (c.comment_id === commentId) {
              return { ...c, content: data.comment.content };
            }
            if (c.replies) {
              c.replies = updateComment(c.replies);
            }
            return c;
          });
        };
        setArticle({
          ...article,
          comments: updateComment(article.comments)
        });
        setEditingCommentId(null);
        setEditContent("");
        showToast("Comment updated", "success");
      }
    } catch (error) {
      console.error("Error editing comment:", error);
    }
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditContent("");
  };

  const handleLikeComment = async (commentId: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      showToast("Please login to like comment", "error");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/news/${params.id}/comment/${commentId}/like`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" }
      });
      const data = await res.json();
      
      if (res.ok) {
        // Update like in nested structure
        const updateLike = (comments: any[]): any[] => {
          return comments.map((c: any) => {
            if (c.comment_id === commentId) {
              return { ...c, likes: data.likes, is_liked: data.liked };
            }
            if (c.replies) {
              c.replies = updateLike(c.replies);
            }
            return c;
          });
        };
        setArticle({
          ...article,
          comments: updateLike(article.comments || [])
        });
        const articleId = Array.isArray(params.id) ? params.id[0] : params.id;
        track('comment_like', { article_id: String(articleId), comment_id: commentId });
      }
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  const handleReplyComment = async (e: React.FormEvent, parentCommentId: number) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      showToast("Please login to reply", "error");
      return;
    }
    if (userBanStatus?.banned) {
      showToast(`You are banned from commenting: ${userBanStatus.ban_reason}`, "error");
      return;
    }
    if (!replyContent.trim()) return;

    // Check cooldown to prevent spam
    const now = Date.now();
    if (now - lastCommentSubmissionTime.current < COMMENT_SUBMISSION_COOLDOWN_MS) {
      const remainingTime = Math.ceil((COMMENT_SUBMISSION_COOLDOWN_MS - (now - lastCommentSubmissionTime.current)) / 1000);
      showToast(`Please wait ${remainingTime} seconds before posting another reply`, "error");
      return;
    }

    // Create optimistic reply
    const optimisticReply = {
      comment_id: Date.now(), // Temporary ID
      content: replyContent,
      rating: 5,
      user: {
        user_id: currentUserId,
        username: 'You',
      },
      likes: 0,
      is_liked: false,
      created_at: new Date().toISOString(),
      replies: [],
      is_optimistic: true, // Flag to identify optimistic comments
    };

    // Add optimistic reply immediately
    const addOptimisticReply = (comments: any[]): any[] => {
      return comments.map((c: any) => {
        if (c.comment_id === parentCommentId) {
          return { ...c, replies: [optimisticReply, ...(c.replies || [])] };
        }
        if (c.replies) {
          c.replies = addOptimisticReply(c.replies);
        }
        return c;
      });
    };
    setArticle({
      ...article,
      comments: addOptimisticReply(article.comments)
    });

    const originalReplyContent = replyContent;
    setReplyContent("");
    setReplyingTo(null);

    // Update last submission time
    lastCommentSubmissionTime.current = Date.now();

    setIsSubmittingReply(true);
    try {
      const res = await fetch(`${API_BASE}/news/${params.id}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ content: originalReplyContent, rating: 5, parent_comment_id: parentCommentId })
      });
      const data = await res.json();
      if (res.ok) {
        // Replace optimistic reply with real server response
        const replaceOptimisticReply = (comments: any[]): any[] => {
          return comments.map((c: any) => {
            if (c.comment_id === parentCommentId) {
              return {
                ...c,
                replies: c.replies?.map((r: any) =>
                  r.is_optimistic ? { ...data.comment, replies: [] } : r
                ) || []
              };
            }
            if (c.replies) {
              c.replies = replaceOptimisticReply(c.replies);
            }
            return c;
          });
        };
        setArticle(prev => ({
          ...prev,
          comments: replaceOptimisticReply(prev.comments)
        }));
        showToast("Reply posted successfully!", "success");
      } else if (res.status === 403) {
        // User bị ban - remove optimistic reply
        const removeOptimisticReply = (comments: any[]): any[] => {
          return comments.map((c: any) => {
            if (c.comment_id === parentCommentId) {
              return {
                ...c,
                replies: c.replies?.filter((r: any) => !r.is_optimistic) || []
              };
            }
            if (c.replies) {
              c.replies = removeOptimisticReply(c.replies);
            }
            return c;
          });
        };
        setArticle(prev => ({
          ...prev,
          comments: removeOptimisticReply(prev.comments)
        }));
        showToast(data.message || "You are banned from commenting", "error");
        setUserBanStatus(data);
        // Restore reply text
        setReplyContent(originalReplyContent);
        setReplyingTo(parentCommentId);
        // Reset cooldown on error
        lastCommentSubmissionTime.current = 0;
      } else {
        // Other error - remove optimistic reply
        const removeOptimisticReply = (comments: any[]): any[] => {
          return comments.map((c: any) => {
            if (c.comment_id === parentCommentId) {
              return {
                ...c,
                replies: c.replies?.filter((r: any) => !r.is_optimistic) || []
              };
            }
            if (c.replies) {
              c.replies = removeOptimisticReply(c.replies);
            }
            return c;
          });
        };
        setArticle(prev => ({
          ...prev,
          comments: removeOptimisticReply(prev.comments)
        }));
        showToast(data.message || "Failed to post reply", "error");
        // Restore reply text
        setReplyContent(originalReplyContent);
        setReplyingTo(parentCommentId);
        // Reset cooldown on error
        lastCommentSubmissionTime.current = 0;
      }
    } catch (error) {
      // Network error - remove optimistic reply
      const removeOptimisticReply = (comments: any[]): any[] => {
        return comments.map((c: any) => {
          if (c.comment_id === parentCommentId) {
            return {
              ...c,
              replies: c.replies?.filter((r: any) => !r.is_optimistic) || []
            };
          }
          if (c.replies) {
            c.replies = removeOptimisticReply(c.replies);
          }
          return c;
        });
      };
      setArticle(prev => ({
        ...prev,
        comments: removeOptimisticReply(prev.comments)
      }));
      showToast("Failed to post reply. Please try again.", "error");
      // Restore reply text
      setReplyContent(originalReplyContent);
      setReplyingTo(parentCommentId);
      // Reset cooldown on error
      lastCommentSubmissionTime.current = 0;
    } finally { setIsSubmittingReply(false); }
  };

  // Handle Report
  const handleOpenReport = (commentId: number, username: string) => {
    setReportingCommentId(commentId);
    setReportingUsername(username);
    setShowReportModal(true);
  };

  const handleSubmitReport = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      showToast("Please login to report", "error");
      return;
    }
    if (!reportReason) {
      showToast("Please select a reason", "error");
      return;
    }

    setIsSubmittingReport(true);
    try {
      const res = await fetch(`${API_BASE}/comments/${reportingCommentId}/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          reason: reportReason,
          description: reportDescription
        })
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Report submitted successfully!", "success");
        setShowReportModal(false);
        setReportReason('');
        setReportDescription('');
        setReportingCommentId(null);
        setReportingUsername('');
      } else if (res.status === 403) {
        showToast(data.message || "You cannot report your own comment", "error");
      } else if (res.status === 409) {
        showToast(data.message || "You have already reported this comment", "error");
      } else {
        showToast(data.message || "Failed to submit report", "error");
      }
    } catch (error) {
      showToast("Error submitting report", "error");
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (!article?.content) return;

    setIsGeneratingSummary(true);
    try {
      const token = localStorage.getItem("token");
      const headers: any = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/ai/summary`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          content: article.content,
          title: article.title
        })
      });

      if (res.ok) {
        const data = await res.json();
        setAiSummary(data.summary || []);
        setShowBriefing(true);
        showToast("AI summary generated!", "success");
        const articleId = Array.isArray(params.id) ? params.id[0] : params.id;
        track('ai_summary_generate', { article_id: String(articleId) });
      } else {
        showToast("Failed to generate summary", "error");
      }
    } catch (error) {
      console.error("Error generating summary:", error);
      showToast("Error generating summary", "error");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const title = article?.title;
    
    switch(platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank');
        const articleId = Array.isArray(params.id) ? params.id[0] : params.id;
        track('article_share', { article_id: String(articleId), platform: 'twitter' });
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
        const articleId2 = Array.isArray(params.id) ? params.id[0] : params.id;
        track('article_share', { article_id: String(articleId2), platform: 'linkedin' });
        break;
      case 'copy':
        copyToClipboard(url);
        setShareModalOpen(false);
        const articleId3 = Array.isArray(params.id) ? params.id[0] : params.id;
        track('article_share', { article_id: String(articleId3), platform: 'copy' });
        break;
    }
  };

  // Function to count total comments including replies
  const countTotalComments = (comments: any[]): number => {
    let total = comments.length;
    comments.forEach(comment => {
      if (comment.replies && comment.replies.length) {
        total += countTotalComments(comment.replies);
      }
    });
    return total;
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-[#02020a] via-[#050510] to-[#02020a] text-slate-100 selection:bg-indigo-500/30 font-sans overflow-x-hidden">
      <Header />
      <main className="pt-32 pb-20 relative px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 flex flex-col gap-8">
              <ArticleHeaderSkeleton />
              <FeaturedImageSkeleton />
              <ArticleContentSkeleton />
              <CommentsSkeleton />
            </div>
            <div className="lg:col-span-4 space-y-6">
              <RelatedNewsSkeleton />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );

  if (!article) return (
    <div className="min-h-screen bg-gradient-to-br from-[#02020a] via-[#050510] to-[#02020a] flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <AlertCircle size={40} className="text-red-400" />
        </div>
        <p className="text-slate-400 font-mono text-xs uppercase tracking-widest">Article Not Found.</p>
      </div>
    </div>
  );

  const totalComments = countTotalComments(article.comments || []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#02020a] via-[#050510] to-[#02020a] text-slate-100 selection:bg-indigo-500/30 font-sans overflow-x-hidden">
      {/* Progress Bar */}
      <motion.div className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 z-[100] origin-left" style={{ scaleX }} />
      
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-[5%] left-[-15%] w-[500px] h-[500px] bg-purple-600/6 rounded-full blur-[100px]" />
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

      {/* Share Modal */}
      <AnimatePresence>
        {shareModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShareModalOpen(false)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setShareModalOpen(false);
              }
            }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-modal-title"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-[#11111a] to-[#0c0c12] border border-white/10 rounded-2xl p-6 w-full max-w-sm"
              ref={(el) => {
                if (el) {
                  const focusableElements = el.querySelectorAll('button');
                  if (focusableElements.length > 0) {
                    (focusableElements[0] as HTMLElement).focus();
                  }
                }
              }}
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-500/10 rounded-lg">
                    <Share2 size={16} className="text-indigo-400" />
                  </div>
                  <h3 id="share-modal-title" className="text-sm font-black text-white font-mono uppercase">Share Intel</h3>
                </div>
                <button
                  onClick={() => setShareModalOpen(false)}
                  className="text-slate-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 rounded-lg p-1"
                  aria-label="Close share modal"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => handleShare('twitter')}
                  className="flex flex-col items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-xl hover:border-sky-500/30 hover:bg-sky-500/10 transition-all group focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                  aria-label="Share on Twitter"
                >
                  <TwitterIcon />
                  <span className="text-[8px] font-mono text-slate-400 group-hover:text-sky-400">Twitter</span>
                </button>
                <button
                  onClick={() => handleShare('linkedin')}
                  className="flex flex-col items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-xl hover:border-blue-500/30 hover:bg-blue-500/10 transition-all group focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  aria-label="Share on LinkedIn"
                >
                  <LinkedinIcon />
                  <span className="text-[8px] font-mono text-slate-400 group-hover:text-blue-400">LinkedIn</span>
                </button>
                <button
                  onClick={() => handleShare('copy')}
                  className="flex flex-col items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-xl hover:border-emerald-500/30 hover:bg-emerald-500/10 transition-all group focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  aria-label="Copy link to clipboard"
                >
                  {copied ? <Check size={20} className="text-emerald-400" /> : <Copy size={20} className="text-emerald-400" />}
                  <span className="text-[8px] font-mono text-slate-400 group-hover:text-emerald-400">Copy Link</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Report Modal */}
      <AnimatePresence>
        {showReportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowReportModal(false)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setShowReportModal(false);
              }
            }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-modal-title"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-[#11111a] to-[#0c0c12] border border-white/10 rounded-2xl p-6 w-full max-w-md"
              ref={(el) => {
                if (el) {
                  const selectElement = el.querySelector('select');
                  if (selectElement) {
                    (selectElement as HTMLElement).focus();
                  }
                }
              }}
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-red-500/10 rounded-lg">
                    <Flag size={16} className="text-red-400" />
                  </div>
                  <h3 id="report-modal-title" className="text-sm font-black text-white font-mono uppercase">Report Comment</h3>
                </div>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="text-slate-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 rounded-lg p-1"
                  aria-label="Close report modal"
                >
                  <X size={16} />
                </button>
              </div>

              {reportingUsername && (
                <p className="text-[9px] text-slate-400 font-mono mb-4">
                  Reporting comment by <span className="text-red-400 font-bold">@{reportingUsername}</span>
                </p>
              )}

              <div className="space-y-4">
                <div>
                  <label htmlFor="report-reason" className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block mb-2">
                    Reason *
                  </label>
                  <select
                    id="report-reason"
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-slate-200 text-sm outline-none focus:border-red-500/50 focus:ring-2 focus:ring-red-500/50 font-mono"
                  >
                    <option value="">Select a reason...</option>
                    <option value="spam">Spam / Advertising</option>
                    <option value="offensive">Offensive Content</option>
                    <option value="harassment">Harassment</option>
                    <option value="misinformation">Misinformation</option>
                    <option value="hate_speech">Hate Speech</option>
                    <option value="inappropriate_content">Inappropriate Content</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="report-description" className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block mb-2">
                    Additional Details
                  </label>
                  <textarea
                    id="report-description"
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    placeholder="Please provide more details about the violation..."
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-slate-200 text-sm outline-none focus:border-red-500/50 focus:ring-2 focus:ring-red-500/50 resize-none min-h-[80px] font-mono"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowReportModal(false)}
                    className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all font-mono text-[9px] font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-white/20"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitReport}
                    disabled={isSubmittingReport || !reportReason}
                    className="flex-1 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white transition-all font-mono text-[9px] font-bold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  >
                    {isSubmittingReport ? <Loader2 className="animate-spin inline" size={12} /> : 'Submit Report'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Header />
      
      <main className="pt-32 pb-20 relative px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto relative z-10">
          
          {/* Breadcrumb */}
          <motion.nav 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-6"
          >
            <Link href="/news" className="flex items-center gap-2 text-indigo-400 font-bold font-mono text-[10px] uppercase tracking-[0.2em] hover:text-white transition-all group">
              <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
              <span>Back to Terminal</span>
            </Link>
            <span className="w-1 h-1 rounded-full bg-slate-700" />
            <div className="flex items-center gap-2 font-mono text-[9px] text-slate-500 uppercase tracking-widest">
              <Hash size={9} /> Intel ID: {article?.news_id}
            </div>
          </motion.nav>

          {/* Ban Warning Banner */}
          {userBanStatus?.banned && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3"
            >
              <AlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-400 font-mono text-[10px] font-bold uppercase tracking-wider">
                  Account Restricted
                </p>
                <p className="text-slate-400 text-xs mt-1">
                  {userBanStatus.ban_reason || 'You have been banned from commenting.'}
                  {userBanStatus.ban_remaining && (
                    <span className="block text-[9px] text-slate-500 mt-0.5">
                      Remaining: {userBanStatus.ban_remaining}
                    </span>
                  )}
                </p>
              </div>
            </motion.div>
          )}

          {/* Main Header */}
          <ErrorBoundary>
            <motion.header
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6"
            >
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="px-3 py-1.5 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-full text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-widest">
                  {article?.category}
                </span>
                <div className="flex items-center gap-3 font-mono text-[9px] text-slate-500 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5"><Calendar size={10} /> {new Date(article?.published_at).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1.5 text-indigo-400"><Eye size={10} /> {article?.views || 0} Views</span>
                </div>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.1] max-w-4xl">
                {article?.title}
              </h1>
              <div className="flex items-center gap-3 mt-4 pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                    <User size={14} className="text-white" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white">{article?.author?.username || 'System'}</span>
                    <span className="text-[8px] text-slate-500 block font-mono">Verified Author</span>
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    <Star size={12} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-[10px] font-mono text-slate-400">4.8</span>
                  </div>
                </div>
              </div>
            </motion.header>
          </ErrorBoundary>

          {/* 2-COLUMN LAYOUT */}
          <div className="grid lg:grid-cols-12 gap-8">
            
            {/* Left Column */}
            <div className="lg:col-span-8 flex flex-col gap-8">
              
              {/* Featured Image */}
              <ErrorBoundary>
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="relative group rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
                >
                  <div className="relative w-full aspect-video">
                    <img
                      src={article?.image_url || "https://images.unsplash.com/photo-1611974717483-3600171ea7f7?w=1200"}
                      alt={article?.title || "Article featured image"}
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#05050a] via-transparent to-transparent opacity-40" />
                </motion.div>
              </ErrorBoundary>

              {/* AI Executive Briefing */}
              <ErrorBoundary>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gradient-to-br from-indigo-950/30 via-purple-950/20 to-transparent border border-indigo-500/20 rounded-2xl p-5 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-[60px]" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
                          <Sparkles size={16} className="text-indigo-400" />
                        </div>
                        <div>
                          <h4 className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-[0.2em]">AI Executive Briefing</h4>
                          <p className="text-[8px] font-mono text-slate-500 uppercase tracking-wider">Neural Intelligence Summary</p>
                        </div>
                      </div>
                      {!showBriefing && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleGenerateSummary}
                          disabled={isGeneratingSummary}
                          className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 rounded-lg text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-wider transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                          {isGeneratingSummary ? <><Loader2 className="animate-spin" size={10} /> Processing</> : <><Zap size={10} /> Generate Summary</>}
                        </motion.button>
                      )}
                    </div>

                    <AnimatePresence mode="wait">
                      {showBriefing && aiSummary.length > 0 ? (
                        <motion.ul
                          key="summary"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-3"
                        >
                          {aiSummary.map((point, index) => (
                            <motion.li
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-start gap-3 group"
                            >
                              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mt-0.5">
                                <span className="text-[8px] font-mono font-bold text-indigo-400">{index + 1}</span>
                              </div>
                              <p className="text-slate-300 text-xs leading-relaxed font-normal flex-1">{point}</p>
                            </motion.li>
                          ))}
                        </motion.ul>
                      ) : showBriefing && aiSummary.length === 0 ? (
                        <p className="text-slate-500 text-[10px] font-mono text-center py-3">No summary available</p>
                      ) : (
                        <p className="text-slate-600 text-[10px] font-mono text-center py-3">Click "Generate Summary" for AI-powered insights</p>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              </ErrorBoundary>

              {/* Article Content */}
              <ErrorBoundary>
                <motion.article
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="relative"
                >
                  <div className="text-slate-300 text-base leading-relaxed space-y-6 font-normal prose prose-invert prose-headings:text-white prose-p:text-slate-300 prose-a:text-indigo-400 prose-strong:text-white prose-em:text-slate-200 prose-ul:text-slate-300 prose-ol:text-slate-300 prose-li:text-slate-300 prose-blockquote:text-slate-400 prose-code:text-indigo-300 prose-pre:bg-black/30 prose-pre:border prose-pre:border-white/10 max-w-none">
                    <ReactMarkdown
                      components={{
                        h1: ({ children }) => <h1 className="text-3xl font-black text-white mb-6">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-2xl font-bold text-white mb-4 mt-8 border-l-4 border-indigo-500 pl-4">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-xl font-semibold text-white mb-3 mt-6">{children}</h3>,
                        p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-2 ml-4">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-2 ml-4">{children}</ol>,
                        li: ({ children }) => <li className="text-slate-300">{children}</li>,
                        blockquote: ({ children }) => <blockquote className="border-l-4 border-indigo-500 pl-4 italic text-slate-400 my-4 bg-indigo-500/5 py-2 rounded-r">{children}</blockquote>,
                        a: ({ children, href }) => <a href={href} className="text-indigo-400 hover:text-indigo-300 underline transition-colors" target="_blank" rel="noopener noreferrer">{children}</a>,
                        strong: ({ children }) => <strong className="text-white font-bold">{children}</strong>,
                        em: ({ children }) => <em className="text-slate-200 italic">{children}</em>,
                        code: ({ children }) => <code className="bg-indigo-500/10 text-indigo-300 px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>,
                        img: ({ src, alt }) => {
                          return <img src={src as string} alt={alt || ''} className="rounded-xl my-6 w-full border border-white/10" />;
                        },
                      }}
                    >
                      {DOMPurify.sanitize(article?.content || '')}
                    </ReactMarkdown>
                  </div>
                </motion.article>
              </ErrorBoundary>

              {/* Discussion Section - Threaded Comments style Facebook */}
              <ErrorBoundary>
                <motion.section
                  ref={commentSectionRef}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-8 border-t border-white/10 pt-10"
                >
                <div className="mb-6">
                  <div className="flex items-center gap-2 text-indigo-400 font-mono text-[9px] font-bold uppercase tracking-[0.25em] mb-2">
                    <MessageSquare size={12} /> Discussion Terminal
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-black text-white uppercase tracking-tight">
                        Public <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Ledger</span>
                      </h3>
                      <p className="text-[9px] text-slate-500 font-mono mt-1">
                        {totalComments} {totalComments === 1 ? 'comment' : 'comments'} • Join the conversation
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-[7px] text-slate-500 font-mono">
                      <Sparkles size={8} className="text-indigo-400" />
                      Threaded discussion
                    </div>
                  </div>
                </div>

                {/* Comment Form - style Facebook */}
                <div className="bg-[#11111a] border border-white/10 rounded-2xl overflow-hidden mb-8">
                  <div className="px-4 py-3 border-b border-white/[0.06] bg-white/[0.02] flex items-center justify-between flex-wrap gap-3">
                    <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Sparkles size={10} className="text-indigo-400" /> Post Analysis
                    </span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <motion.button
                          key={star}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setRating(star)}
                          className="cursor-pointer"
                        >
                          <Star size={14} className={`transition-all ${star <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-slate-700 hover:text-slate-500'}`} />
                        </motion.button>
                      ))}
                    </div>
                  </div>
                  <form onSubmit={handlePostComment} className="p-4">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                          <User size={16} className="text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <textarea 
                          value={comment} 
                          onChange={(e) => setComment(e.target.value)} 
                          placeholder={userBanStatus?.banned ? "You are banned from commenting" : "Share your insights on this analysis..."} 
                          className="w-full bg-transparent border-none text-slate-200 text-sm outline-none min-h-[60px] placeholder:text-slate-600 resize-none disabled:opacity-50"
                          disabled={userBanStatus?.banned}
                        />
                        <div className="flex justify-end mt-2">
                          <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={isSubmitting || !comment.trim() || userBanStatus?.banned} 
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium shadow-lg shadow-indigo-600/30"
                          >
                            {isSubmitting ? <Loader2 className="animate-spin" size={14} /> : <><Send size={14} /> Comment</>}
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>

                {/* Threaded Comments List - style Facebook */}
                <div className="space-y-4">
                  {isLoadingComments ? (
                    <div className="text-center py-10 bg-white/[0.01] border border-white/10 rounded-xl">
                      <Loader2 className="animate-spin text-indigo-500 mx-auto mb-2" size={24} />
                      <p className="text-slate-500 font-mono text-[9px] uppercase tracking-wider">Loading comments...</p>
                    </div>
                  ) : article?.comments?.length > 0 ? (
                    <>
                      {article.comments.map((comment: any) => (
                        <CommentItem
                          key={comment.comment_id}
                          comment={comment}
                          currentUserId={currentUserId}
                          onLike={handleLikeComment}
                          onEdit={handleEditComment}
                          onDelete={handleDeleteComment}
                          onReport={handleOpenReport}
                          isDeleting={isDeleting}
                          editingCommentId={editingCommentId}
                          editContent={editContent}
                          setEditContent={setEditContent}
                          onSaveEdit={handleSaveEdit}
                          onCancelEdit={handleCancelEdit}
                          replyingTo={replyingTo}
                          setReplyingTo={setReplyingTo}
                          replyContent={replyContent}
                          setReplyContent={setReplyContent}
                          onSubmitReply={handleReplyComment}
                          isSubmittingReply={isSubmittingReply}
                          depth={0}
                        />
                      ))}

                      {/* Load More Trigger for Infinite Scroll */}
                      {hasMoreComments && (
                        <div ref={loadMoreRef} className="py-4">
                          {isLoadingMoreComments ? (
                            <div className="flex items-center justify-center gap-2 py-4">
                              <Loader2 className="animate-spin text-indigo-500" size={16} />
                              <p className="text-slate-500 font-mono text-[9px] uppercase tracking-wider">Loading more comments...</p>
                            </div>
                          ) : (
                            <div className="text-center py-4">
                              <p className="text-slate-600 font-mono text-[8px] uppercase tracking-wider">Scroll to load more</p>
                            </div>
                          )}
                        </div>
                      )}

                      {!hasMoreComments && article?.comments?.length > 0 && (
                        <div className="text-center py-4">
                          <p className="text-slate-600 font-mono text-[8px] uppercase tracking-wider">No more comments</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-10 bg-white/[0.01] border border-white/10 rounded-xl">
                      <MessageCircle size={24} className="text-slate-600 mx-auto mb-2" />
                      <p className="text-slate-500 font-mono text-[9px] uppercase tracking-wider">No comments yet</p>
                      <p className="text-slate-600 text-[7px] font-mono mt-1">Be the first to share your analysis</p>
                    </div>
                  )}
                </div>
              </motion.section>
            </ErrorBoundary>
            </div>

            {/* Right Sidebar */}
            <ErrorBoundary>
              <aside className="lg:col-span-4">
                <div className="sticky top-28 flex flex-col gap-5">
                
                {/* Intel Metrics Box */}
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                  className="bg-gradient-to-br from-[#11111a] to-[#0c0c12] border border-white/10 rounded-2xl p-5 shadow-xl"
                >
                  <h4 className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-[0.2em] flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
                    <Activity size={12} className="text-indigo-500" /> Intel Metrics
                  </h4>
                  
                  <div className="space-y-3">
                    {[
                      { label: "AUTHOR", val: article?.author?.username || "System", icon: User },
                      { label: "CATEGORY", val: article?.category || "General", icon: Hash },
                      { label: "VIEWS", val: article?.views || 0, icon: Eye, suffix: "reads" },
                      { label: "STATUS", val: "Verified", icon: ShieldCheck, color: "text-emerald-400" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between py-1 group">
                        <div className="flex items-center gap-2">
                          <item.icon size={11} className="text-slate-600 group-hover:text-indigo-400 transition-colors" />
                          <span className="text-[8px] text-slate-500 font-mono uppercase tracking-wider">{item.label}</span>
                        </div>
                        <span className={`text-[9px] font-mono font-bold uppercase ${item.color || 'text-slate-200'}`}>
                          {item.val} {item.suffix && <span className="text-slate-500 text-[7px]">{item.suffix}</span>}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* User Activity Widget */}
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.18 }}
                  className="bg-gradient-to-br from-[#11111a] to-[#0c0c12] border border-white/10 rounded-2xl p-5 shadow-xl"
                >
                  <h4 className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-[0.2em] flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
                    <MessageCircle size={12} className="text-indigo-500" /> User Activity
                  </h4>
                  
                  <div className="space-y-3">
                    {(() => {
                      // Find all replies to current user's comments
                      const userReplies: any[] = [];
                      const findRepliesToUser = (comments: any[], targetUserId: number) => {
                        comments.forEach(comment => {
                          if (comment.user?.id === targetUserId && comment.replies?.length > 0) {
                            comment.replies.forEach((reply: any) => {
                              userReplies.push({
                                username: reply.user?.username,
                                content: reply.content,
                                created_at: reply.created_at,
                                parentComment: comment.content
                              });
                            });
                          }
                          if (comment.replies?.length > 0) {
                            findRepliesToUser(comment.replies, targetUserId);
                          }
                        });
                      };
                      
                      if (currentUserId) {
                        findRepliesToUser(article?.comments || [], currentUserId);
                      }
                      
                      if (userReplies.length === 0) {
                        return (
                          <div className="text-center py-4">
                            <MessageCircle size={20} className="text-slate-600 mx-auto mb-2" />
                            <p className="text-[8px] text-slate-500 font-mono uppercase tracking-wider">No replies yet</p>
                          </div>
                        );
                      }
                      
                      return userReplies.slice(0, 5).map((reply, idx) => (
                        <div key={idx} className="bg-white/[0.02] border border-white/10 rounded-xl p-3 hover:border-indigo-500/30 transition-all">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                              <User size={8} className="text-white" />
                            </div>
                            <span className="text-[8px] font-mono font-bold text-indigo-400 uppercase">
                              @{reply.username}
                            </span>
                            <span className="text-[7px] text-slate-500 font-mono ml-auto">
                              {new Date(reply.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-[8px] text-slate-400 line-clamp-2 mb-1">"{reply.content}"</p>
                          <p className="text-[7px] text-slate-600 font-mono italic">replied to your comment</p>
                        </div>
                      ));
                    })()}
                  </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="grid grid-cols-2 gap-3"
                >
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleToggleFavorite} 
                    disabled={favLoading} 
                    className={`flex flex-col items-center justify-center gap-1.5 py-4 rounded-xl border transition-all ${
                      isFavorited 
                        ? "bg-indigo-600/15 border-indigo-500/40 text-indigo-400 shadow-lg" 
                        : "bg-white/[0.02] border-white/10 text-slate-500 hover:text-white hover:border-white/20"
                    }`}
                  >
                    {favLoading ? <Loader2 size={16} className="animate-spin" /> : <Bookmark size={16} fill={isFavorited ? "currentColor" : "none"} />}
                    <span className="text-[8px] font-mono font-bold uppercase tracking-wider">{isFavorited ? "Saved" : "Archive"}</span>
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShareModalOpen(true)}
                    className="flex flex-col items-center justify-center gap-1.5 py-4 bg-white/[0.02] border border-white/10 rounded-xl text-slate-500 hover:text-emerald-400 hover:border-emerald-500/30 transition-all"
                  >
                    <Share2 size={16} />
                    <span className="text-[8px] font-mono font-bold uppercase tracking-wider">Share</span>
                  </motion.button>
                </motion.div>

                {/* Related News */}
                {relatedNews.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-[#11111a] to-[#0c0c12] border border-white/10 rounded-2xl p-5 shadow-xl"
                  >
                    <h4 className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-[0.2em] flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
                      <TrendingUp size={12} className="text-indigo-500" /> Related Intel
                    </h4>
                    <div className="space-y-3">
                      {relatedNews.slice(0, 5).map((news: any, idx: number) => (
                        <Link key={news.news_id} href={`/news/${news.news_id}`} className="block group">
                          <div className="bg-white/[0.02] border border-white/10 rounded-xl p-3 hover:border-indigo-500/40 transition-all group-hover:bg-white/[0.04]">
                            <div className="flex items-start gap-2">
                              <span className="text-[8px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded shrink-0">{idx + 1}</span>
                              <div className="flex-1 min-w-0">
                                <h5 className="text-[10px] font-bold text-slate-200 mb-1 line-clamp-2 group-hover:text-indigo-400 transition-colors">
                                  {news.title}
                                </h5>
                                <div className="flex items-center gap-2 text-[7px] text-slate-500 font-mono uppercase tracking-wider">
                                  <span className="flex items-center gap-0.5">
                                    <Eye size={7} /> {news.views || 0}
                                  </span>
                                  <span className="px-1.5 py-0.5 bg-indigo-500/10 rounded text-indigo-400">
                                    {news.category}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Top Comments Widget - Grid Layout */}
                {topComments.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.32 }}
                    className="bg-gradient-to-br from-[#11111a] to-[#0c0c12] border border-white/10 rounded-2xl p-5 shadow-xl"
                  >
                    <h4 className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-[0.2em] flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
                      <Award size={12} className="text-indigo-500" /> Top Comments
                    </h4>
                    
                    {/* Header Row */}
                    <div className="grid grid-cols-3 gap-0 mb-0">
                      <div className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-wider px-2 py-2 border-b border-white/10 border-r border-white/5">Rank</div>
                      <div className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-wider px-2 py-2 border-b border-white/10 border-r border-white/5">User Name</div>
                      <div className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-wider px-2 py-2 border-b border-white/10 text-right">Likes</div>
                    </div>

                    {/* Data Rows */}
                    <div className="space-y-0">
                      {topComments.map((comment: any, idx: number) => {
                        const rank = idx + 1;
                        const getRankIcon = (r: number) => {
                          if (r === 1) return '🥇';
                          if (r === 2) return '🥈';
                          if (r === 3) return '🥉';
                          return `0${r}`;
                        };
                        
                        return (
                          <div key={comment.comment_id} className="grid grid-cols-3 gap-0 hover:bg-white/[0.03] transition-all">
                            {/* Rank Column */}
                            <div className="flex items-center gap-1 px-2 py-2 border-b border-white/5 border-r border-white/5">
                              <span className="text-sm">{getRankIcon(rank)}</span>
                            </div>
                            
                            {/* User Name Column */}
                            <div className="flex items-center gap-2 px-2 py-2 border-b border-white/5 border-r border-white/5">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                                <User size={9} className="text-white" />
                              </div>
                              <div className="min-w-0">
                                <span className="text-[9px] font-semibold text-white truncate block">
                                  {comment.user?.username || 'Anonymous'}
                                </span>
                                {comment.user?.user_id === currentUserId && (
                                  <span className="text-[7px] font-mono text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded-full border border-emerald-500/20">
                                    You
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {/* Likes Column */}
                            <div className="flex items-center justify-end gap-1 px-2 py-2 border-b border-white/5">
                              <ThumbsUp size={8} className="text-indigo-400" />
                              <span className="text-[9px] font-mono font-bold text-slate-300">{comment.likes || 0}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Connection Status */}
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 }}
                  className="bg-black/40 border border-white/10 px-3 py-2 rounded-xl flex items-center gap-2"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[7px] font-mono text-slate-400 uppercase tracking-wider">Terminal Status: Secure</span>
                  <ShieldCheck size={8} className="text-emerald-400 ml-auto" />
                </motion.div>
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