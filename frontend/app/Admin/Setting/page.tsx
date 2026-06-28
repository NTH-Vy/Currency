"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Settings, 
  ShieldCheck, 
  Database, 
  Globe, 
  Lock, 
  Bell, 
  Save, 
  RotateCcw, 
  Wifi, 
  Cpu, 
  Terminal, 
  Zap,
  ShieldAlert,
  Loader2,
  Key,
  Eye,
  EyeOff,
  Activity,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Server,
  Clock,
  CheckCircle,
  XCircle,
  HelpCircle,
  Info,
  ArrowRight,
  Calendar,
  Timer
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ============================================================
// SKELETON COMPONENTS
// ============================================================

// 1. Header Skeleton
const HeaderSkeleton = () => (
  <div className="bg-gradient-to-b from-[#11111a] to-[#0d0d14] rounded-[2.5rem] p-10 md:p-12 border border-white/5 shadow-2xl relative overflow-hidden">
    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
      <div className="flex flex-col gap-4 w-full md:w-2/3">
        <div className="flex items-center gap-2.5">
          <div className="w-3.5 h-3.5 bg-indigo-500/30 rounded animate-pulse" />
          <div className="w-40 h-2.5 bg-indigo-500/20 rounded animate-pulse" />
        </div>
        <div className="flex flex-col gap-2">
          <div className="h-10 sm:h-12 lg:h-14 w-3/4 bg-white/5 rounded-lg animate-pulse" />
          <div className="h-3 w-1/2 bg-white/5 rounded animate-pulse" />
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="h-3 w-full max-w-xl bg-white/5 rounded animate-pulse" />
          <div className="h-3 w-3/4 max-w-xl bg-white/5 rounded animate-pulse" />
        </div>
      </div>
      <div className="h-14 w-48 bg-indigo-600/20 rounded-2xl animate-pulse" />
    </div>
  </div>
);

// 2. Platform Settings Skeleton
const PlatformSettingsSkeleton = () => (
  <div className="relative bg-gradient-to-br from-[#11111a] to-[#0b0b11] border border-white/10 rounded-3xl shadow-2xl">
    <div className="px-6 py-5 border-b border-white/[0.06] bg-gradient-to-r from-white/[0.02] to-transparent flex justify-between items-center">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-indigo-400/30 rounded animate-pulse" />
        <div className="w-40 h-3 bg-white/10 rounded animate-pulse" />
      </div>
      <div className="w-24 h-5 bg-emerald-500/20 rounded-full animate-pulse" />
    </div>
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="w-32 h-2.5 bg-white/5 rounded animate-pulse" />
            <div className="h-12 bg-black/40 border border-white/10 rounded-xl animate-pulse" />
          </div>
        ))}
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <div className="w-32 h-2.5 bg-white/5 rounded animate-pulse" />
            <div className="h-28 bg-black/40 border border-white/10 rounded-xl animate-pulse" />
          </div>
          <div className="flex flex-col gap-2">
            <div className="w-32 h-2.5 bg-white/5 rounded animate-pulse" />
            <div className="h-12 bg-black/40 border border-white/10 rounded-xl animate-pulse" />
            <div className="h-4 w-40 bg-white/5 rounded animate-pulse mt-1" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

// 3. Gateway Settings Skeleton
const GatewaySettingsSkeleton = () => (
  <div className="relative bg-gradient-to-br from-[#11111a] to-[#0b0b11] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
    <div className="px-6 py-5 border-b border-white/[0.06] bg-gradient-to-r from-white/[0.02] to-transparent">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-sky-400/30 rounded animate-pulse" />
        <div className="w-48 h-3 bg-white/10 rounded animate-pulse" />
      </div>
    </div>
    <div className="p-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="w-32 h-2.5 bg-white/5 rounded animate-pulse" />
          <div className="h-12 bg-black/40 border border-white/10 rounded-xl animate-pulse" />
        </div>
        <div className="flex flex-col gap-2">
          <div className="w-40 h-2.5 bg-white/5 rounded animate-pulse" />
          <div className="h-12 bg-black/40 border border-white/10 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  </div>
);

// 4. Security Settings Skeleton
const SecuritySettingsSkeleton = () => (
  <div className="relative bg-gradient-to-br from-[#11111a] to-[#0b0b11] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
    <div className="px-6 py-5 border-b border-white/[0.06] bg-gradient-to-r from-white/[0.02] to-transparent">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-indigo-400/30 rounded animate-pulse" />
        <div className="w-32 h-3 bg-white/10 rounded animate-pulse" />
      </div>
    </div>
    <div className="p-6">
      <div className="flex flex-col gap-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/5">
            <div className="flex flex-col gap-1.5">
              <div className="w-24 h-2.5 bg-white/10 rounded animate-pulse" />
              <div className="w-32 h-2 bg-white/5 rounded animate-pulse" />
            </div>
            <div className="w-10 h-5 bg-slate-800 rounded-full animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

// 5. Health Settings Skeleton
const HealthSettingsSkeleton = () => (
  <div className="relative bg-gradient-to-br from-[#11111a] to-[#0b0b11] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
    <div className="px-6 py-5 border-b border-white/[0.06] bg-gradient-to-r from-white/[0.02] to-transparent">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-emerald-400/30 rounded animate-pulse" />
        <div className="w-32 h-3 bg-white/10 rounded animate-pulse" />
      </div>
    </div>
    <div className="p-6">
      <div className="flex flex-col gap-5">
        <div className="flex justify-between items-center">
          <div className="w-24 h-2.5 bg-white/5 rounded animate-pulse" />
          <div className="w-16 h-2.5 bg-white/10 rounded animate-pulse" />
        </div>
        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden animate-pulse" />
        <div className="grid grid-cols-2 gap-3 mt-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-black/40 rounded-xl p-3 border border-white/5">
              <div className="w-12 h-2 bg-white/5 rounded animate-pulse mb-1.5" />
              <div className="w-16 h-3 bg-white/10 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// 6. Full Page Skeleton (kết hợp tất cả)
const FullPageSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-[#02020a] via-[#050510] to-[#02020a] text-slate-100 selection:bg-indigo-500/30 font-sans overflow-x-hidden">
    <div className="fixed inset-0 pointer-events-none -z-10">
      <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-indigo-600/8 rounded-full blur-[150px]" />
      <div className="absolute bottom-[5%] left-[-15%] w-[600px] h-[600px] bg-purple-600/6 rounded-full blur-[120px]" />
      <div className="absolute top-[40%] left-[30%] w-[500px] h-[500px] bg-cyan-600/4 rounded-full blur-[100px]" />
      <div 
        className="absolute inset-0 opacity-[0.02]" 
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />
    </div>
    
    <main className="pt-32 pb-20 flex-grow relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col gap-12 relative z-10">
        <HeaderSkeleton />
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 flex flex-col gap-8">
            <PlatformSettingsSkeleton />
            <GatewaySettingsSkeleton />
          </div>
          <div className="lg:col-span-4 flex flex-col gap-8">
            <SecuritySettingsSkeleton />
            <HealthSettingsSkeleton />
          </div>
        </div>
      </div>
    </main>
  </div>
);

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function AdminSettingsPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [successToast, setSuccessToast] = useState<{ message: string; type: string; visible: boolean }>({ 
    message: '', type: '', visible: false 
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isHealthLoading, setIsHealthLoading] = useState(true);
  const [healthData, setHealthData] = useState<any>(null);
  const [apiError, setApiError] = useState(false);

  // States cho các thiết lập
  const [config, setConfig] = useState({
    platformName: "CORTEX NETWORK",
    maintenanceMode: false,
    maintenanceMessage: "The system is undergoing maintenance. Please check back later.",
    maintenanceEstimatedEnd: "",
    publicRegistration: true,
    apiEndpoint: "http://127.0.0.1:8000/api/v1",
    apiKey: "CTX-9921-X88-ALPHA-LEDGER-001",
    syncFrequency: "30s",
    authStrict: true,
    autoDefuse: true
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setSuccessToast({ message, type, visible: true });
    setTimeout(() => setSuccessToast(prev => ({ ...prev, visible: false })), 3000);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://127.0.0.1:8000/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        },
        body: JSON.stringify(config)
      });
      
      const data = await response.json();
      if (response.ok) {
        showToast("SYSTEM CONFIGURATION UPDATED", 'success');
      } else {
        showToast("FAILED TO SAVE SETTINGS", 'error');
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      showToast("ERROR SAVING SETTINGS", 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleMaintenanceToggle = async () => {
    const newValue = !config.maintenanceMode;
    setConfig({...config, maintenanceMode: newValue});
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://127.0.0.1:8000/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        },
        body: JSON.stringify({...config, maintenanceMode: newValue})
      });
      
      if (response.ok) {
        showToast(newValue ? "MAINTENANCE MODE ENABLED" : "MAINTENANCE MODE DISABLED", 'success');
      } else {
        showToast("FAILED TO UPDATE MAINTENANCE MODE", 'error');
        setConfig({...config, maintenanceMode: !newValue});
      }
    } catch (error) {
      console.error("Error updating maintenance mode:", error);
      showToast("ERROR UPDATING MAINTENANCE MODE", 'error');
      setConfig({...config, maintenanceMode: !newValue});
    }
  };

  // Load settings
  const loadSettings = async () => {
    setIsLoading(true);
    setApiError(false);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/");
        return;
      }
      
      const response = await fetch("http://127.0.0.1:8000/api/admin/settings", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });
      
      const data = await response.json();
      if (response.ok) {
        setConfig({
          ...data,
          maintenanceEstimatedEnd: data.maintenanceEstimatedEnd || ""
        });
      } else {
        setApiError(true);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      setApiError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Load health data
  const loadHealthData = async () => {
    setIsHealthLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      
      const response = await fetch("http://127.0.0.1:8000/api/admin/health", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });
      
      const data = await response.json();
      if (response.ok && data.success) {
        setHealthData(data.data);
      }
    } catch (error) {
      console.error("Error loading health data:", error);
    } finally {
      setIsHealthLoading(false);
    }
  };

  useEffect(() => {
    const loadAllData = async () => {
      await Promise.all([
        loadSettings(),
        loadHealthData()
      ]);
    };
    
    loadAllData();
    
    const healthInterval = setInterval(loadHealthData, 30000);
    
    return () => clearInterval(healthInterval);
  }, [router]);

  const handleRetry = () => {
    setApiError(false);
    setIsLoading(true);
    const loadSettingsRetry = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://127.0.0.1:8000/api/admin/settings", {
          headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" }
        });
        const data = await response.json();
        if (response.ok) {
          setConfig({ ...data, maintenanceEstimatedEnd: data.maintenanceEstimatedEnd || "" });
        } else {
          setApiError(true);
        }
      } catch (error) {
        setApiError(true);
      } finally {
        setIsLoading(false);
      }
    };
    loadSettingsRetry();
  };

  // ============================================================
  // CYBERPUNK DATE/TIME PICKER
  // ============================================================
  
  const CyberpunkDateTimePicker = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(value ? new Date(value) : null);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [viewMode, setViewMode] = useState<'calendar' | 'time'>('calendar');

    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    const getDaysInMonth = (date: Date) => {
      const year = date.getFullYear();
      const month = date.getMonth();
      const firstDay = new Date(year, month, 1).getDay();
      const totalDays = new Date(year, month + 1, 0).getDate();
      
      const daysArr = [];
      for (let i = 0; i < firstDay; i++) daysArr.push(null);
      for (let i = 1; i <= totalDays; i++) daysArr.push(i);
      return daysArr;
    };

    const handleDateSelect = (day: number) => {
      const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      if (selectedDate) {
        newDate.setHours(selectedDate.getHours(), selectedDate.getMinutes());
      } else {
        newDate.setHours(12, 0);
      }
      setSelectedDate(newDate);
      setViewMode('time');
    };

    const handleTimeChange = (hours: number, minutes: number) => {
      const newDate = new Date(selectedDate || new Date());
      newDate.setHours(hours, minutes);
      setSelectedDate(newDate);
    };

    const handleConfirm = () => {
      if (selectedDate) {
        const tzOffset = selectedDate.getTimezoneOffset() * 60000;
        const localISOTime = new Date(selectedDate.getTime() - tzOffset).toISOString().slice(0, 16);
        onChange(localISOTime);
      }
      setIsOpen(false);
    };

    return (
      <div className="relative w-full">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-black/60 border border-white/10 hover:border-indigo-500/50 rounded-xl p-4 text-left outline-none transition-all flex items-center justify-between group shadow-inner"
        >
          <div className="flex items-center gap-3">
            <Calendar size={16} className="text-indigo-400 group-hover:text-indigo-300" />
            <span className={`font-mono text-xs ${selectedDate ? "text-white" : "text-slate-500"}`}>
              {selectedDate ? selectedDate.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).toUpperCase() : 'SELECT SCHEDULE'}
            </span>
          </div>
          <Timer size={14} className="text-slate-500 group-hover:text-indigo-400" />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute z-[100] mt-3 min-w-[320px] w-full right-0 lg:left-0 bg-[#0d0d14] border border-indigo-500/40 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_20px_rgba(79,70,229,0.2)] overflow-hidden backdrop-blur-xl"
            >
              <div className="flex bg-black/40 border-b border-white/5">
                <button 
                  onClick={() => setViewMode('calendar')}
                  className={`flex-1 py-3 text-[10px] font-mono font-bold tracking-widest transition-all ${viewMode === 'calendar' ? 'text-indigo-400 border-b-2 border-indigo-500 bg-indigo-500/10' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  CALENDAR
                </button>
                <button 
                  onClick={() => setViewMode('time')}
                  className={`flex-1 py-3 text-[10px] font-mono font-bold tracking-widest transition-all ${viewMode === 'time' ? 'text-indigo-400 border-b-2 border-indigo-500 bg-indigo-500/10' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  TIME SET
                </button>
              </div>

              {viewMode === 'calendar' ? (
                <div className="p-5">
                  <div className="flex items-center justify-between mb-5 px-1">
                    <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white">
                      <ArrowRight size={14} className="rotate-180" />
                    </button>
                    <span className="text-[11px] font-mono font-black text-white tracking-[0.2em]">
                      {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                    </span>
                    <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white">
                      <ArrowRight size={14} />
                    </button>
                  </div>

                  <div 
                    className="grid gap-1" 
                    style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}
                  >
                    {days.map(d => (
                      <div key={d} className="text-[10px] font-mono font-bold text-indigo-500/60 text-center pb-2">
                        {d}
                      </div>
                    ))}
                    {getDaysInMonth(currentMonth).map((day, idx) => (
                      <button
                        key={idx}
                        onClick={() => day && handleDateSelect(day)}
                        disabled={!day}
                        className={`
                          aspect-square flex items-center justify-center text-[12px] font-mono font-bold rounded-lg transition-all
                          ${!day ? 'opacity-0' : 'hover:bg-indigo-500/20 border border-transparent hover:border-indigo-500/30'}
                          ${selectedDate && day === selectedDate.getDate() && currentMonth.getMonth() === selectedDate.getMonth() && currentMonth.getFullYear() === selectedDate.getFullYear()
                            ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)] border-indigo-400' 
                            : 'text-slate-400'}
                        `}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-6">
                  <div className="flex flex-col items-center gap-6">
                    <div className="text-center">
                      <div className="text-5xl font-mono font-black text-white tracking-wider">
                        {(selectedDate?.getHours() || 0).toString().padStart(2, '0')}
                        <span className="text-indigo-500 animate-pulse mx-2">:</span>
                        {(selectedDate?.getMinutes() || 0).toString().padStart(2, '0')}
                      </div>
                      <div className="text-[8px] font-mono text-slate-500 mt-1 tracking-widest">
                        {(selectedDate?.getHours() || 0) >= 12 ? 'PM' : 'AM'}
                      </div>
                    </div>

                    <div className="w-full space-y-2">
                      <div className="flex justify-between text-[8px] font-mono text-slate-400">
                        <span>HOURS</span>
                        <span className="text-indigo-400">{String(selectedDate?.getHours() || 0).padStart(2, '0')}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="23"
                        value={selectedDate?.getHours() || 0}
                        onChange={(e) => handleTimeChange(parseInt(e.target.value), selectedDate?.getMinutes() || 0)}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-500 [&::-webkit-slider-thumb]:shadow-[0_0_10px_#4f46e5] [&::-webkit-slider-thumb]:cursor-pointer"
                      />
                    </div>

                    <div className="w-full space-y-2">
                      <div className="flex justify-between text-[8px] font-mono text-slate-400">
                        <span>MINUTES</span>
                        <span className="text-indigo-400">{String(selectedDate?.getMinutes() || 0).padStart(2, '0')}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="59"
                        step="1"
                        value={selectedDate?.getMinutes() || 0}
                        onChange={(e) => handleTimeChange(selectedDate?.getHours() || 0, parseInt(e.target.value))}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-500 [&::-webkit-slider-thumb]:shadow-[0_0_10px_#4f46e5] [&::-webkit-slider-thumb]:cursor-pointer"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2 w-full mt-2">
                      <button
                        onClick={() => {
                          const now = new Date();
                          handleTimeChange(now.getHours(), now.getMinutes());
                        }}
                        className="text-[9px] font-mono font-bold py-2 px-2 rounded-lg bg-indigo-500/20 border border-indigo-500/30 hover:bg-indigo-500/30 transition-all text-indigo-400"
                      >
                        NOW
                      </button>
                      <button
                        onClick={() => handleTimeChange(0, 0)}
                        className="text-[9px] font-mono font-bold py-2 px-2 rounded-lg bg-black/40 border border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all text-slate-300"
                      >
                        MIDNIGHT
                      </button>
                      <button
                        onClick={() => handleTimeChange(12, 0)}
                        className="text-[9px] font-mono font-bold py-2 px-2 rounded-lg bg-black/40 border border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all text-slate-300"
                      >
                        NOON
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-black/40 p-4 flex items-center justify-between border-t border-white/5 gap-3">
                <button onClick={() => { setSelectedDate(null); onChange(''); setIsOpen(false); }} className="px-4 py-2 text-[9px] font-mono font-bold text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all">
                  RESET
                </button>
                <div className="flex gap-2">
                  <button onClick={() => setIsOpen(false)} className="px-4 py-2 text-[9px] font-mono font-bold text-slate-400 hover:text-white transition-all">
                    CANCEL
                  </button>
                  <button onClick={handleConfirm} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-[9px] font-mono font-black rounded-lg shadow-lg shadow-indigo-600/20 transition-all">
                    CONFIRM_SET
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // Format thời gian để hiển thị
  const formatEstimatedTime = (datetime: string) => {
    if (!datetime) return "";
    const date = new Date(datetime);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const hourStr = hours.toString().padStart(2, '0');
    
    return `${day}/${month}/${year} ${hourStr}:${minutes} ${ampm}`;
  };

  // Nếu đang loading toàn bộ trang
  if (isLoading && !apiError) {
    return <FullPageSkeleton />;
  }

  // ============================================================
  // MAIN RENDER
  // ============================================================
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#02020a] via-[#050510] to-[#02020a] text-slate-100 selection:bg-indigo-500/30 font-sans overflow-x-hidden">
      
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-20%] right-[-10%] w-[1000px] h-[1000px] bg-indigo-600/8 rounded-full blur-[150px]" />
        <div className="absolute bottom-[5%] left-[-15%] w-[800px] h-[800px] bg-purple-600/6 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] left-[30%] w-[600px] h-[600px] bg-cyan-600/4 rounded-full blur-[100px]" />
        <div 
          className="absolute inset-0 opacity-[0.02]" 
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {successToast.visible && (
          <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 400 }}
            className={`fixed top-6 right-6 z-50 px-5 py-3.5 rounded-xl border backdrop-blur-xl flex items-center gap-3 max-w-md shadow-2xl ${
              successToast.type === 'success' ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200' :
              successToast.type === 'error' ? 'bg-red-500/15 border-red-500/40 text-red-200' :
              'bg-indigo-500/15 border-indigo-500/40 text-indigo-200'
            }`}
          >
            {successToast.type === 'success' && <Sparkles size={18} />}
            {successToast.type === 'error' && <AlertCircle size={18} />}
            {successToast.type === 'info' && <Info size={18} />}
            <p className="text-sm font-medium">{successToast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
      
      <main className="pt-32 pb-20 flex-grow relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col gap-12 relative z-10">
          
          {/* ============================================================
              1. JUMBOTRON HEADER
              ============================================================ */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-b from-[#11111a] to-[#0d0d14] rounded-[2.5rem] p-10 md:p-12 border border-white/5 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2.5 text-indigo-400 font-bold text-[10px] uppercase tracking-[0.2em] font-mono">
                  <Settings size={14} /> System Configuration
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter uppercase text-white leading-none">
                  Core <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-purple-400 to-indigo-400">Parameters</span>
                </h1>
                <p className="text-sm text-slate-400 max-w-xl font-medium leading-relaxed">
                  Global control interface for the Cortex ecosystem. Manage gateway endpoints, security ciphers, and operational maintenance states.
                </p>
              </div>
              
              <button
                onClick={handleSave} 
                disabled={isSaving || apiError}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-[10px] font-black uppercase tracking-widest px-10 py-4 rounded-2xl transition-all flex items-center gap-3 active:scale-95 shadow-xl shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                <span>{isSaving ? "Saving..." : "Commit Changes"}</span>
              </button>
            </div>
          </motion.div>

          {/* ============================================================
              2. SETTINGS GRID
              ============================================================ */}
          <div className="grid lg:grid-cols-12 gap-8">
            
            {/* Left Column - Settings Forms */}
            <div className="lg:col-span-8 flex flex-col gap-8">
              
              {/* Platform Infrastructure Card */}
              <motion.div 
                initial={{ opacity: 0, x: -30 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ duration: 0.6, delay: 0.1 }}
                className="relative group"
              >
                {apiError ? (
                  <div className="relative bg-gradient-to-br from-[#11111a] to-[#0b0b11] border border-white/10 rounded-3xl shadow-2xl">
                    <div className="px-6 py-5 border-b border-white/[0.06] bg-gradient-to-r from-white/[0.02] to-transparent flex justify-between items-center overflow-hidden">
                      <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                        <Globe size={12} className="text-indigo-400" /> Platform Infrastructure
                      </h3>
                      <div className="flex items-center gap-2 text-[10px] text-rose-400 font-mono font-bold uppercase tracking-wider bg-rose-500/10 px-3 py-1.5 rounded-full border border-rose-500/20">
                        <AlertCircle size={12} /> ERROR
                      </div>
                    </div>
                    <div className="p-12 flex flex-col items-center justify-center gap-5">
                      <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
                        <AlertCircle size={32} className="text-rose-400" />
                      </div>
                      <h3 className="text-lg font-black text-white font-mono uppercase tracking-wide">Data Under Maintenance</h3>
                      <p className="text-sm text-slate-500 font-mono text-center">Unable to load settings from server. Please try again later.</p>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleRetry}
                        className="mt-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-mono font-bold text-[11px] uppercase py-3 px-6 rounded-xl transition-all shadow-lg shadow-indigo-600/30"
                      >
                        <RefreshCw size={12} className="inline mr-2" /> Retry
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <div className="relative bg-gradient-to-br from-[#11111a] to-[#0b0b11] border border-white/10 rounded-3xl shadow-2xl">
                    <div className="px-6 py-5 border-b border-white/[0.06] bg-gradient-to-r from-white/[0.02] to-transparent flex justify-between items-center overflow-hidden">
                      <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                        <Globe size={12} className="text-indigo-400" /> Platform Infrastructure
                      </h3>
                      <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-mono font-bold uppercase tracking-wider bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        LIVE CONFIG
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest ml-1">Platform Branding Name</label>
                          <input 
                            value={config.platformName} 
                            onChange={(e) => setConfig({...config, platformName: e.target.value})}
                            className="bg-black/40 border border-white/10 focus:border-indigo-500/50 rounded-xl p-3.5 text-white outline-none transition-all focus:bg-black/60 font-mono text-sm w-full"
                          />
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest ml-1">Maintenance Mode</label>
                          <button 
                            onClick={handleMaintenanceToggle}
                            className={`flex items-center justify-between p-3.5 rounded-xl border transition-all w-full ${config.maintenanceMode ? 'bg-amber-500/10 border-amber-500/30' : 'bg-black/40 border-white/10'}`}
                          >
                            <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${config.maintenanceMode ? 'text-amber-500' : 'text-slate-500'}`}>
                              {config.maintenanceMode ? 'Enabled (Restricted)' : 'Disabled (Live)'}
                            </span>
                            <div className={`w-8 h-4 rounded-full relative transition-all ${config.maintenanceMode ? 'bg-amber-500' : 'bg-slate-700'}`}>
                              <div className={`absolute top-1 w-2 h-2 bg-white rounded-full transition-all ${config.maintenanceMode ? 'right-1' : 'left-1'}`} />
                            </div>
                          </button>
                        </div>
                        
                        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest ml-1">Maintenance Message</label>
                            <textarea 
                              rows={3}
                              value={config.maintenanceMessage} 
                              onChange={(e) => setConfig({...config, maintenanceMessage: e.target.value})}
                              className="bg-black/40 border border-white/10 focus:border-indigo-500/50 rounded-xl p-3.5 text-white outline-none transition-all focus:bg-black/60 font-mono text-xs resize-none h-28 w-full"
                              placeholder="Enter maintenance message displayed to users"
                            />
                          </div>
                          
                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest ml-1">Estimated End Time</label>
                            <CyberpunkDateTimePicker 
                              value={config.maintenanceEstimatedEnd || ""} 
                              onChange={(val) => setConfig({...config, maintenanceEstimatedEnd: val})}
                            />
                            {config.maintenanceEstimatedEnd && (
                              <div className="mt-1 text-[12px] font-mono text-slate-400 px-4 py-0">
                                {formatEstimatedTime(config.maintenanceEstimatedEnd)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Gateway & API Ledger Card */}
              <motion.div 
                initial={{ opacity: 0, x: -30 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ duration: 0.6, delay: 0.15 }}
                className="relative group"
              >
                <div className="relative bg-gradient-to-br from-[#11111a] to-[#0b0b11] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                  <div className="px-6 py-5 border-b border-white/[0.06] bg-gradient-to-r from-white/[0.02] to-transparent flex justify-between items-center">
                    <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                      <Zap size={12} className="text-sky-400" /> Gateway & API Ledger
                    </h3>
                  </div>

                  <div className="p-6">
                    <div className="flex flex-col gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest ml-1">Master API Endpoint</label>
                        <div className="relative flex items-center">
                          <input 
                            readOnly
                            value={config.apiEndpoint}
                            className="bg-black/40 border border-white/10 rounded-xl p-3.5 text-white outline-none font-mono text-xs w-full"
                          />
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                          <Key size={10} /> System API Private Key
                        </label>
                        <div className="relative flex items-center">
                          <input 
                            type={showApiKey ? "text" : "password"}
                            readOnly 
                            value={config.apiKey}
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-indigo-400 outline-none font-mono text-xs pr-10"
                          />
                          <button 
                            onClick={() => setShowApiKey(!showApiKey)}
                            className="absolute right-2 flex items-center justify-center text-slate-500 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
                            type="button"
                          >
                            {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Security & Health */}
            <div className="lg:col-span-4 flex flex-col gap-8">
              
              {/* Security Cipher Card */}
              <motion.div 
                initial={{ opacity: 0, x: 30 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative group"
              >
                <div className="relative bg-gradient-to-br from-[#11111a] to-[#0b0b11] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                  <div className="px-6 py-5 border-b border-white/[0.06] bg-gradient-to-r from-white/[0.02] to-transparent">
                    <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                      <Lock size={12} className="text-indigo-400" /> Security Cipher
                    </h3>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/5 hover:border-indigo-500/30 transition-all">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[10px] font-mono font-bold text-white uppercase">Strict Auth</span>
                          <span className="text-[7px] font-mono text-slate-500">Enforce 2FA & IP whitelist</span>
                        </div>
                        <button 
                          onClick={() => setConfig({...config, authStrict: !config.authStrict})} 
                          className={`w-10 h-5 rounded-full relative transition-all ${config.authStrict ? 'bg-indigo-500' : 'bg-slate-800'}`}
                        >
                          <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${config.authStrict ? 'right-1' : 'left-1'}`} />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/5 hover:border-indigo-500/30 transition-all">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[10px] font-mono font-bold text-white uppercase">Auto Defuse</span>
                          <span className="text-[7px] font-mono text-slate-500">Auto-lock on suspicious activity</span>
                        </div>
                        <button 
                          onClick={() => setConfig({...config, autoDefuse: !config.autoDefuse})} 
                          className={`w-10 h-5 rounded-full relative transition-all ${config.autoDefuse ? 'bg-indigo-500' : 'bg-slate-800'}`}
                        >
                          <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${config.autoDefuse ? 'right-1' : 'left-1'}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Node Health Pool Card */}
              <motion.div 
                initial={{ opacity: 0, x: 30 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ duration: 0.6, delay: 0.25 }}
                className="relative group"
              >
                {isHealthLoading ? (
                  <HealthSettingsSkeleton />
                ) : (
                  <div className="relative bg-gradient-to-br from-[#11111a] to-[#0b0b11] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="px-6 py-5 border-b border-white/[0.06] bg-gradient-to-r from-white/[0.02] to-transparent">
                      <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                        <Activity size={12} className="text-emerald-400" /> Node Health Pool
                      </h3>
                    </div>
                    
                    <div className="p-6">
                      <div className="flex flex-col gap-5">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">System Health</span>
                          <span className={`text-[10px] font-mono font-black ${healthData?.system_health > 90 ? 'text-emerald-400' : healthData?.system_health > 70 ? 'text-amber-400' : 'text-red-400'}`}>
                            {healthData?.system_health ? `${healthData.system_health.toFixed(1)}%` : '--'}
                          </span>
                        </div>
                        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full shadow-[0_0_10px_currentColor] transition-all duration-500 ${healthData?.system_health > 90 ? 'bg-emerald-500' : healthData?.system_health > 70 ? 'bg-amber-500' : 'bg-red-500'}`}
                            style={{ width: `${healthData?.system_health || 0}%` }}
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 mt-2">
                          <div className="bg-black/40 rounded-xl p-3 border border-white/5">
                            <div className="text-[7px] font-black text-slate-500 uppercase font-mono mb-1 flex items-center gap-1">
                              <Cpu size={8} /> CPU
                            </div>
                            <div className="text-[11px] font-black text-white font-mono">{healthData?.cpu ? `${healthData.cpu.toFixed(1)}%` : '--'}</div>
                          </div>
                          <div className="bg-black/40 rounded-xl p-3 border border-white/5">
                            <div className="text-[7px] font-black text-slate-500 uppercase font-mono mb-1 flex items-center gap-1">
                              <Database size={8} /> Memory
                            </div>
                            <div className="text-[11px] font-black text-white font-mono">{healthData?.memory?.usage_percent ? `${healthData.memory.usage_percent.toFixed(1)}%` : '--'}</div>
                          </div>
                          <div className="bg-black/40 rounded-xl p-3 border border-white/5">
                            <div className="text-[7px] font-black text-slate-500 uppercase font-mono mb-1 flex items-center gap-1">
                              <Server size={8} /> Database
                            </div>
                            <div className={`text-[11px] font-black font-mono flex items-center gap-1.5 ${healthData?.db === 'ONLINE' ? 'text-emerald-400' : 'text-red-400'}`}>
                              {healthData?.db === 'ONLINE' ? <CheckCircle size={10} /> : <XCircle size={10} />}
                              {healthData?.db || '--'}
                            </div>
                          </div>
                          <div className="bg-black/40 rounded-xl p-3 border border-white/5">
                            <div className="text-[7px] font-black text-slate-500 uppercase font-mono mb-1 flex items-center gap-1">
                              <Clock size={8} /> Latency
                            </div>
                            <div className="text-[11px] font-black text-white font-mono">{healthData?.latency ? `${healthData.latency.toFixed(0)}ms` : '--'}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        ::-webkit-scrollbar-track {
          background: #050508;
        }
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #4f46e5, #7c3aed);
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #6366f1, #8b5cf6);
        }
        * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        input[type="datetime-local"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}