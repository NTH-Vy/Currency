"use client";
import { 
  Globe, 
  ArrowRight, 
  Info,
  // Các icon an toàn tránh lỗi Build
  Send, 
  MessageSquare, 
  Code, 
  Share2 
} from "lucide-react";
import Link from "next/link";

export default function Footer() {
  const quickLinks = [
    { name: "Home", href: "/" },
    { name: "Converter", href: "/converter" },
    { name: "Rates", href: "/rates" },
    { name: "History", href: "/history" },
    { name: "News", href: "/news" },
    { name: "Community", href: "/community" },
  ];

  const popularConversions = [
    { name: "USD → VND", href: "/converter" },
    { name: "EUR → VND", href: "/converter" },
    { name: "JPY → VND", href: "/converter" },
    { name: "VND → USD", href: "/converter" },
  ];

  const support = [
    { name: "Contact", href: "/contact" },
    { name: "FAQ", href: "/faq" },
    { name: "Help Center", href: "/support" },
  ];

  const legal = [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms", href: "/terms" },
    { name: "Disclaimer", href: "/disclaimer" },
  ];

  const socialIcons = [
    { Icon: Send, label: "Twitter" },
    { Icon: Code, label: "Github" },
    { Icon: MessageSquare, label: "LinkedIn" },
    { Icon: Share2, label: "Facebook" },
  ];

  return (
    <footer className="relative bg-[#0a0a0b] border-t border-white/5 pt-24 pb-12 overflow-hidden">
      {/* Hiệu ứng ánh sáng nền */}
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 pb-16">
          
          {/* 1. Brand Column */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-600 blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
                <div className="relative bg-indigo-600 p-2.5 rounded-xl transition-transform duration-300">
                  <Globe className="text-white" size={20} />
                </div>
              </div>
              <span className="text-2xl font-black tracking-tighter text-white uppercase">
                Currency<span className="text-indigo-500">X</span>
              </span>
            </Link>
            <p className="text-slate-400 text-base leading-relaxed max-w-sm">
              The world's leading real-time exchange infrastructure. Professional-grade 
              market data and instant currency conversion for the global economy.
            </p>
            <div className="flex gap-4">
              {socialIcons.map((social, i) => (
                <button 
                  key={i} 
                  title={social.label}
                  className="p-3 bg-white/5 rounded-xl text-slate-500 hover:text-white hover:bg-white/10 transition-all active:scale-90"
                >
                  <social.Icon size={20} />
                </button>
              ))}
            </div>
          </div>

          {/* 2. Quick Links */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <h4 className="text-white text-sm font-black uppercase tracking-[0.2em] px-3 border-l-2 border-indigo-600">
              Quick Links
            </h4>
            <ul className="flex flex-col gap-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-slate-400 hover:text-white transition-colors text-base font-bold inline-flex items-center gap-2 group">
                    {link.name}
                    <ArrowRight size={14} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-indigo-500" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Conversions - Đã bỏ gạch chân và tăng kích thước */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <h4 className="text-white text-sm font-black uppercase tracking-[0.2em] px-3 border-l-2 border-indigo-600">
              Conversions
            </h4>
            <ul className="flex flex-col gap-3">
              {popularConversions.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-slate-400 hover:text-white transition-colors text-base font-bold italic">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 4. Support */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <h4 className="text-white text-sm font-black uppercase tracking-[0.2em] px-3 border-l-2 border-indigo-600">
              Support
            </h4>
            <ul className="flex flex-col gap-3">
              {support.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-slate-400 hover:text-white transition-colors text-base font-bold">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 5. Legal */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <h4 className="text-white text-sm font-black uppercase tracking-[0.2em] px-3 border-l-2 border-indigo-600">
              Legal
            </h4>
            <ul className="flex flex-col gap-3">
              {legal.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-slate-400 hover:text-white transition-colors text-base font-bold">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-12 border-t border-white/5">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="max-w-3xl flex gap-4">
              <Info size={22} className="shrink-0 text-indigo-500/50" />
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest leading-relaxed">
                <span className="text-slate-300">Financial Disclaimer:</span> Exchange rates are for informational purposes only. CurrencyX does not guarantee the accuracy of rates 
                provided and are subject to market volatility. Please consult with a financial advisor for large transactions.
              </p>
            </div>
            <div className="flex flex-col lg:items-end gap-1 shrink-0">
              <span className="text-white font-black text-base tracking-tighter uppercase">© 2026 CurrencyX.</span>
              <span className="text-slate-600 text-[10px] font-black uppercase tracking-[0.3em]">Institutional Grade Infrastructure</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}