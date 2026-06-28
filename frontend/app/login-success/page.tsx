"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export default function LoginSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const user = searchParams.get("user");

    if (token && user) {
      // Lưu vào LocalStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", decodeURIComponent(user));
      
      // Kích hoạt sự kiện để Header cập nhật
      window.dispatchEvent(new Event("auth-changed"));

      // Chuyển hướng sau 2 giây để người dùng thấy hiệu ứng
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } else {
      router.push("/login?error=auth_failed");
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-[#05050a] flex items-center justify-center text-white font-mono" suppressHydrationWarning>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="flex flex-col items-center gap-4"
      >
        <Loader2 className="animate-spin text-indigo-500" size={40} />
        <h2 className="text-xl font-bold tracking-widest uppercase">Initializing Session...</h2>
        <p className="text-slate-500 text-sm">Synchronizing with Secure Terminal</p>
      </motion.div>
    </div>
  );
}