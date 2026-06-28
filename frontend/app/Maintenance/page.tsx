"use client";

import React, { useEffect, useState } from "react";
import { 
  AlertTriangle, 
  RefreshCw, 
  Clock,
  Wrench
} from "lucide-react";
import { motion } from "framer-motion";

export default function MaintenancePage() {
  const [maintenanceData, setMaintenanceData] = useState<any>(null);
  const [countdown, setCountdown] = useState<string>("");

  useEffect(() => {
    const fetchMaintenanceStatus = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/maintenance-status");
        const data = await response.json();
        if (data.maintenance) {
          setMaintenanceData(data);
          
          // Calculate countdown if estimated end time is provided
          if (data.estimated_end) {
            const endTime = new Date(data.estimated_end).getTime();
            const updateCountdown = () => {
              const now = new Date().getTime();
              const distance = endTime - now;
              
              if (distance > 0) {
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                setCountdown(`${hours}h ${minutes}m ${seconds}s`);
              } else {
                setCountdown("Almost done");
              }
            };
            
            updateCountdown();
            const interval = setInterval(updateCountdown, 1000);
            return () => clearInterval(interval);
          }
        } else {
          // Maintenance is over, redirect to home
          window.location.href = "/";
        }
      } catch (error) {
        console.error("Error fetching maintenance status:", error);
      }
    };

    fetchMaintenanceStatus();
    
    // Refresh status every 30 seconds
    const interval = setInterval(fetchMaintenanceStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#05050a] text-slate-100 flex flex-col items-center justify-center font-sans selection:bg-amber-500/30 overflow-hidden relative">
      
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        {/* Animated gradient orbs */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-[-20%] left-[-10%] w-[700px] h-[700px] bg-amber-500/10 rounded-full blur-[200px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.15, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[180px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.15, 0.3, 0.15]
          }}
          transition={{ 
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[400px] h-[400px] bg-yellow-500/5 rounded-full blur-[150px]" 
        />
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgNDBMMCAwTDQwIDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto px-6 text-center"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 20 }}
          className="mb-8 flex justify-center"
        >
          <motion.div
            animate={{ 
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-500 rounded-3xl blur-xl opacity-30 animate-pulse" />
            <div className="relative w-32 h-32 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-3xl flex items-center justify-center border border-amber-500/30 shadow-2xl shadow-amber-500/20 backdrop-blur-sm">
              <motion.div
                animate={{ 
                  scale: [1, 1.05, 1],
                  opacity: [0.8, 1, 0.8]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Wrench size={64} className="text-amber-400 drop-shadow-lg" />
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-5xl sm:text-6xl font-black tracking-tighter text-white mb-4"
        >
          SYSTEM IS UNDER{" "}
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-400 bg-size-200 animate-gradient"
            style={{
              backgroundSize: '200% auto',
              animation: 'gradient 3s linear infinite'
            }}
          >
            MAINTENANCE
          </motion.span>
        </motion.h1>

        {/* Custom Message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-slate-400 text-lg mb-8 max-w-lg mx-auto leading-relaxed"
        >
          {maintenanceData?.message || "We are performing important upgrades to improve your experience. The system will be back online shortly."}
        </motion.p>

        {/* Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8"
        >
          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ type: "spring", stiffness: 400 }}
            className="relative bg-gradient-to-br from-[#11111a] to-[#0a0a12] border border-white/5 rounded-2xl p-6 overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="relative"
            >
              <Clock className="text-amber-400 mb-3 mx-auto drop-shadow-lg" size={32} />
            </motion.div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 relative">ESTIMATED TIME</p>
            <p className="text-white font-bold text-lg relative">{countdown || "Almost done"}</p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ type: "spring", stiffness: 400 }}
            className="relative bg-gradient-to-br from-[#11111a] to-[#0a0a12] border border-white/5 rounded-2xl p-6 overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative"
            >
              <AlertTriangle className="text-amber-400 mb-3 mx-auto drop-shadow-lg" size={32} />
            </motion.div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 relative">STATUS</p>
            <p className="text-white font-bold text-lg relative">In Progress</p>
          </motion.div>
        </motion.div>

        {/* Refresh Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          onClick={handleRefresh}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-mono text-[10px] font-black uppercase tracking-widest px-8 py-4 rounded-2xl transition-all flex items-center gap-3 mx-auto shadow-xl shadow-amber-600/30 overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          <motion.div
            animate={{ rotate: 0 }}
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            <RefreshCw size={16} />
          </motion.div>
          <span className="relative">CHECK AGAIN</span>
        </motion.button>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-12"
        >
          <motion.p
            animate={{ 
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="text-slate-600 text-xs font-mono"
          >
            Thank you for your patience
          </motion.p>
          <motion.div 
            className="mt-2 flex justify-center gap-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 1, 0.3]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
                className="w-1 h-1 bg-amber-500/50 rounded-full"
              />
            ))}
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}