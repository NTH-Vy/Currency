export type NewsArticle = {
  id: string;
  category: string;
  title: string;
  excerpt: string;
  description?: string;
  date: string;
  author: string;
  img: string;
  readTime: string;
};

export const featuredNews: NewsArticle = {
  id: "global-central-banks-digital-settlement",
  category: "Institutional",
  title: "Global Central Banks Shift to Digital Settlement Layer: A New Era for FX",
  description:
    "The integration of unified ledger systems among major central banks marks the most significant shift in currency exchange protocols since Bretton Woods. Experts predict a 40% reduction in settlement latency by Q4 2026.",
  excerpt:
    "The integration of unified ledger systems among major central banks marks the most significant shift in currency exchange protocols since Bretton Woods.",
  date: "2 hours ago",
  author: "Sarah J. Kovan",
  img: "https://images.unsplash.com/photo-1611974717483-3600171ea7f7?auto=format&fit=crop&q=80&w=1200",
  readTime: "8 min read",
};

export const articles: NewsArticle[] = [
  {
    id: "vnd-stability-analysis",
    category: "Forex",
    title: "VND Stability Analysis: Central Bank's New Intervention Framework",
    excerpt:
      "New liquidity management tools introduced this week have successfully stabilized the Dong against regional volatility.",
    date: "4 hours ago",
    author: "Tuan Nguyen",
    img: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=600",
    readTime: "5 min read",
  },
  {
    id: "us-dollar-index-resistance",
    category: "Markets",
    title: "US Dollar Index Hits 12-Month Resistance: What Traders Can Expect",
    excerpt:
      "Technical indicators suggest a significant correction phase as the DXY approaches key psychological levels.",
    date: "6 hours ago",
    author: "Marcus Vane",
    img: "https://images.unsplash.com/photo-1611974717483-3600171ea7f7?auto=format&fit=crop&q=80&w=600",
    readTime: "4 min read",
  },
  {
    id: "ethereum-liquidity-depth",
    category: "Crypto",
    title: "Ethereum Liquidity Depth Surges as Whale Accumulation Hits Peak",
    excerpt:
      "On-chain data reveals a massive shift from exchanges to cold storage, signaling high long-term holder confidence.",
    date: "Yesterday",
    author: "Elena Petrova",
    img: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&q=80&w=600",
    readTime: "6 min read",
  },
  {
    id: "eu-digital-asset-framework",
    category: "Policy",
    title: "New Digital Asset Framework Finalized by EU Commission",
    excerpt:
      "The comprehensive regulatory package aims to harmonize cross-border exchange rules across the eurozone.",
    date: "Yesterday",
    author: "John Doe",
    img: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=600",
    readTime: "10 min read",
  },
  {
    id: "goldman-sachs-fx-liquidity",
    category: "Institutional",
    title: "Goldman Sachs Expands Real-time FX Liquidity Pool Access",
    excerpt:
      "Partnering with edge networks to provide sub-10ms response times for institutional trading desks.",
    date: "2 days ago",
    author: "Sarah J. Kovan",
    img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=600",
    readTime: "7 min read",
  },
  {
    id: "asean-currencies-resilience",
    category: "Forex",
    title: "Emerging Market Resilience: A Deep Dive into ASEAN Currencies",
    excerpt:
      "Strong domestic demand and diversified export bases are shielding regional currencies from external shocks.",
    date: "2 days ago",
    author: "Minh Anh",
    img: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=600",
    readTime: "5 min read",
  },
];

export const allNews: NewsArticle[] = [featuredNews, ...articles];

export function getNewsById(id: string): NewsArticle | undefined {
  return allNews.find((article) => article.id === id);
}

export function getRelatedNews(currentId: string, limit = 2): NewsArticle[] {
  return allNews.filter((article) => article.id !== currentId).slice(0, limit);
}
