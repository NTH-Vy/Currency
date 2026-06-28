"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function MaintenanceProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if user is admin
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setIsAdmin(payload.role === 'admin');
      } catch (e) {
        // Invalid token, not admin
      }
    }

    // Skip maintenance check for admin routes, maintenance page, and login
    if (pathname?.startsWith("/Admin") || pathname?.startsWith("/Maintenance") || pathname === "/login") {
      return;
    }

    // Proactive maintenance check on mount
    const checkMaintenanceStatus = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/maintenance-status");
        const data = await response.json();
        
        if (data.maintenance === true && !isAdmin) {
          setIsMaintenance(true);
          router.push("/Maintenance");
        } else if (data.maintenance === false && isMaintenance) {
          // Maintenance ended, reload page
          window.location.reload();
        }
      } catch (error) {
        console.error("Error checking maintenance status:", error);
      }
    };

    // Initial check
    checkMaintenanceStatus();

    // Periodic check every 30 seconds
    const interval = setInterval(checkMaintenanceStatus, 30000);

    // Intercept fetch calls to handle 503 errors
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        if (response.status === 503 && !isAdmin) {
          try {
            const data = await response.json();
            if (data.maintenance === true) {
              setIsMaintenance(true);
              router.push("/Maintenance");
            }
          } catch (e) {
            // If we can't parse JSON, still redirect on 503
            setIsMaintenance(true);
            router.push("/Maintenance");
          }
        }
        
        return response;
      } catch (error) {
        // If fetch fails completely (e.g., network error, Chrome extension interference),
        // just propagate the error without breaking the app
        console.warn('Fetch intercepted but failed:', error);
        throw error;
      }
    };

    return () => {
      clearInterval(interval);
      window.fetch = originalFetch;
    };
  }, [router, pathname, isAdmin]);

  if (isMaintenance) {
    return null;
  }

  return <>{children}</>;
}
