"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Mail, Lock, User, ShieldCheck, Zap, Globe2, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        router.push("/login");
      } else if (data.errors) {
        const firstError = Object.values(data.errors).flat()[0] as string;
        setError(firstError);
      } else {
        setError(data.message || "Registration failed.");
      }
    } catch {
      setError("Cannot reach the server.");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = (provider: 'google' | 'facebook') => {
    window.location.href = `http://127.0.0.1:8000/api/auth/${provider}/redirect`;
  };

  const benefits = [
    { icon: <Zap className="text-indigo-400" size={18} />, title: "Zero Latency", desc: "Execute trades with sub-15ms response times." },
    { icon: <ShieldCheck className="text-emerald-400" size={18} />, title: "Military Encryption", desc: "Bank-grade protocols for every transaction." },
    { icon: <Globe2 className="text-sky-400" size={18} />, title: "Global Liquidity", desc: "Access 150+ fiat and crypto assets instantly." }
  ];

  return (
    <div className="min-h-screen bg-[#05050a] text-slate-100 selection:bg-indigo-500/30 font-sans">
      <Header />
      
      <main className="pt-32 pb-20 min-h-screen flex items-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none select-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-sky-500/5 rounded-full blur-[100px] pointer-events-none select-none" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            
            {/* Left side: Branding */}
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="hidden lg:flex flex-col gap-12">
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-[9px] uppercase tracking-[0.3em] font-mono">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                  </span>
                  Network Expansion Active
                </div>
                <h1 className="text-6xl font-black text-white tracking-tighter leading-[0.9] uppercase font-display">
                  Join The <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-sky-400">Financial</span> <br /> 
                  Revolution.
                </h1>
                <p className="text-slate-400 max-w-md font-medium leading-relaxed">
                  Initialize your secure operator node and access the world's most advanced liquidity matching infrastructure.
                </p>
              </div>

              <div className="flex flex-col gap-5">
                {benefits.map((benefit, i) => (
                  <div key={i} className="flex gap-6 p-6 bg-white/[0.02] border border-white/5 rounded-2xl group hover:border-indigo-500/20 transition-all duration-300">
                    <div className="w-12 h-12 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center shrink-0 shadow-inner">
                      {benefit.icon}
                    </div>
                    <div className="flex flex-col gap-1">
                      <h4 className="text-white font-mono font-bold text-sm uppercase tracking-wide">{benefit.title}</h4>
                      <p className="text-slate-500 text-xs font-medium leading-relaxed">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right: Register Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="w-full max-w-[480px] mx-auto bg-gradient-to-b from-[#11111a] to-[#0c0c12] border border-white/5 rounded-3xl p-8 lg:p-12 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

              <div className="relative z-10 flex flex-col gap-8">
                <div>
                  <h2 className="text-3xl font-black text-white tracking-tight uppercase font-display">Create Account</h2>
                  <p className="text-slate-500 font-mono text-[10px] uppercase tracking-widest mt-1">Deployment Tier: Global Individual</p>
                </div>

                <form className="flex flex-col gap-5" onSubmit={handleRegister}>
                  {error && (
                    <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-mono font-bold uppercase tracking-widest rounded-xl text-center">
                      Security Alert: {error}
                    </div>
                  )}
                  
                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] font-mono font-black text-slate-500 uppercase tracking-widest px-1">Operator Name</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" size={16} />
                      <input 
                        required type="text" placeholder="Full Name" 
                        value={formData.username} 
                        onChange={(e) => setFormData({...formData, username: e.target.value})} 
                        className="w-full bg-black/45 border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white text-sm focus:border-indigo-500/40 outline-none transition-all" 
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] font-mono font-black text-slate-500 uppercase tracking-widest px-1">Identity (Email)</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" size={16} />
                      <input 
                        required type="email" placeholder="operator@tradertm.node" 
                        value={formData.email} 
                        onChange={(e) => setFormData({...formData, email: e.target.value})} 
                        className="w-full bg-black/45 border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white font-mono text-sm focus:border-indigo-500/40 outline-none transition-all" 
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[9px] font-mono font-black text-slate-500 uppercase tracking-widest px-1">Access Secret</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" size={16} />
                      <input 
                        required type="password" placeholder="••••••••••••" 
                        value={formData.password} 
                        onChange={(e) => setFormData({...formData, password: e.target.value})} 
                        className="w-full bg-black/45 border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white font-mono text-sm focus:border-indigo-500/40 outline-none transition-all" 
                      />
                    </div>
                  </div>

                  <button 
                    disabled={loading} type="submit" 
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-black text-xs py-4.5 rounded-xl mt-2 transition-all flex items-center justify-center gap-3 uppercase tracking-[0.2em] disabled:opacity-40 shadow-lg shadow-indigo-600/20 border border-indigo-400/20"
                  >
                    {loading ? <Loader2 className="animate-spin" size={16} /> : <><span>Initialize Account</span> <ArrowRight size={16} /></>}
                  </button>
                </form>

                {/* --- CHUYỂN SOCIAL XUỐNG DƯỚI ĐÂY --- */}
                <div className="flex flex-col gap-6 mt-2">
                  <div className="relative flex items-center">
                    <div className="flex-grow border-t border-white/5"></div>
                    <span className="flex-shrink mx-4 text-[9px] font-mono text-slate-600 uppercase tracking-[0.2em]">OR REGISTER VIA</span>
                    <div className="flex-grow border-t border-white/5"></div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => handleSocialAuth('google')}
                      className="flex items-center justify-center gap-3 bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] hover:border-white/10 transition-all py-3.5 rounded-xl group"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest group-hover:text-white transition-colors">Google</span>
                    </button>

                    <button 
                      onClick={() => handleSocialAuth('facebook')}
                      className="flex items-center justify-center gap-3 bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] hover:border-white/10 transition-all py-3.5 rounded-xl group"
                    >
                      <svg className="w-4 h-4 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest group-hover:text-white transition-colors">Facebook</span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-4">
                  <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest text-center">
                    Registered?{" "}
                    <Link href="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                      Sign in to Terminal
                    </Link>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}