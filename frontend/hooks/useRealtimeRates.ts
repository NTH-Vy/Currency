import { useState, useEffect, useCallback, useRef } from 'react';
import { echoClient } from '@/lib/echo'; // Sửa lại đường dẫn import cho đúng cấu trúc thư mục của bạn

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface Rate {
  pair: string;
  name: string;
  price: string;
  change: string;
  trend: string;
  volatility: string;
  volume: string;
}

interface Mover {
  pair: string;
  price: string;
  change: string;
  trend: string;
}

interface UseRealtimeRatesOptions {
  initialFetchData?: boolean;
  pollingInterval?: number;
  enableWebSocket?: boolean;
  enablePollingFallback?: boolean;
}

interface UseRealtimeRatesReturn {
  rates: Rate[];
  topMovers: Mover[];
  loading: boolean;
  isConnected: boolean;
  apiError: boolean;
  refreshData: () => Promise<void>;
  usingWebSocket: boolean;
  usingPolling: boolean;
}

export function useRealtimeRates(options: UseRealtimeRatesOptions = {}): UseRealtimeRatesReturn {
  const {
    initialFetchData = true,
    pollingInterval = 5000, // Cập nhật lại mỗi 5 giây nếu dùng Polling
    enableWebSocket = true,
    enablePollingFallback = true,
  } = options;

  const [rates, setRates] = useState<Rate[]>([]);
  const [topMovers, setTopMovers] = useState<Mover[]>([]);
  const [loading, setLoading] = useState(initialFetchData);
  const [apiError, setApiError] = useState(false);
  
  const [isConnected, setIsConnected] = useState(false);
  const [usingWebSocket, setUsingWebSocket] = useState(false);
  const [usingPolling, setUsingPolling] = useState(false);

  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const initialFetchDoneRef = useRef(false);

  // --- HÀM FETCH DATA TỪ API ---
  const fetchRatesFromAPI = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/rates/current`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      if (data.success) {
        setApiError(false);
        setRates(data.rates);
        updateTopMovers(data.rates);
        return data;
      } else {
        setApiError(true);
        throw new Error(data.message || 'API error');
      }
    } catch (error) {
      console.error('❌ Error fetching rates:', error);
      setApiError(true);
      return null;
    }
  }, []);

  const fetchTopMoversFromAPI = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/rates/top-movers`);
      const data = await response.json();
      if (data.success) {
        setTopMovers(data.movers);
      }
    } catch (error) {
      console.error('❌ Error fetching top movers:', error);
    }
  }, []);

  const updateTopMovers = (currentRates: Rate[]) => {
    const sortedByChange = [...currentRates]
      .sort((a, b) => Math.abs(parseFloat(b.change)) - Math.abs(parseFloat(a.change)))
      .slice(0, 3)
      .map(({ pair, price, change, trend }) => ({ pair, price, change, trend }));
    setTopMovers(sortedByChange);
  };

  const refreshData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchRatesFromAPI(), fetchTopMoversFromAPI()]);
    initialFetchDoneRef.current = true;
    setLoading(false);
  }, [fetchRatesFromAPI, fetchTopMoversFromAPI]);

  // --- QUẢN LÝ POLLING FALLBACK ---
  const startPolling = useCallback(() => {
    if (pollingTimerRef.current) return;
    console.log('⏰ Bật chế độ Polling dự phòng (Do WebSocket ngắt kết nối)...');
    setUsingPolling(true);
    
    pollingTimerRef.current = setInterval(async () => {
      await Promise.all([fetchRatesFromAPI(), fetchTopMoversFromAPI()]);
    }, pollingInterval);
  }, [fetchRatesFromAPI, fetchTopMoversFromAPI, pollingInterval]);

  const stopPolling = useCallback(() => {
    if (pollingTimerRef.current) {
      clearInterval(pollingTimerRef.current);
      pollingTimerRef.current = null;
    }
    setUsingPolling(false);
  }, []);

  // --- QUẢN LÝ LARAVEL ECHO (WEBSOCKET) ---
  useEffect(() => {
    // Lần đầu render, tải dữ liệu gốc từ API trước
    if (initialFetchData && !initialFetchDoneRef.current) {
      refreshData();
    }

    // Nếu tắt WS, lập tức kích hoạt Polling và dừng lại tại đây
    if (!enableWebSocket || !echoClient) {
      setUsingWebSocket(false);
      if (enablePollingFallback) startPolling();
      return;
    }

    console.log('📡 Đang kết nối tới Laravel Reverb qua Echo...');
    setUsingWebSocket(true);
    
    // Tạo một biến tham chiếu để kiểm tra kết nối cục bộ của Effect lần này
    let isMounted = true;

    // 1. Khi kết nối thành công thành công
    echoClient.connector.pusher.connection.bind('connected', () => {
      if (!isMounted) return;
      console.log('✅ Echo kết nối thành công tới Reverb! Đã tắt chế độ Polling.');
      setIsConnected(true);
      stopPolling(); // Kết nối ngon nghẻ -> Tắt ngay Polling dự phòng
    });

    // 2. Khi bị mất kết nối (Đứt mạng, server Reverb sập)
    echoClient.connector.pusher.connection.bind('disconnected', () => {
      if (!isMounted) return;
      console.log('🔌 Echo mất kết nối.');
      setIsConnected(false);
      if (enablePollingFallback) startPolling(); // Kích hoạt ngay Polling
    });

    // 3. Khi trạng thái kết nối không khả dụng
    echoClient.connector.pusher.connection.bind('unavailable', () => {
      if (!isMounted) return;
      console.warn('⚠️ Kết nối Echo không khả dụng.');
      setIsConnected(false);
      if (enablePollingFallback) startPolling(); // Kích hoạt ngay Polling
    });

    // Thực hiện kết nối thủ công (trong trường hợp trước đó đã gọi disconnect)
    echoClient.connect();

    // Đăng ký lắng nghe channel 'rates'
    const channel = echoClient.channel('rates');

    // Lắng nghe event Class 'RateUpdated' map với '.price_update' ở backend của bạn
    channel.listen('.price_update', (payload: any) => {
      console.log('💰 Nhận dữ liệu Real-time (Event: price_update):', payload);
      
      setRates(prev => 
        prev.map(rate => {
          if (rate.pair === payload.pair) {
            return {
              ...rate,
              price: payload.price?.toString() || rate.price,
              change: payload.change || rate.change,
              trend: payload.trend || rate.trend,
              volatility: payload.volatility || rate.volatility,
              volume: payload.volume || rate.volume,
            };
          }
          return rate;
        })
      );

      setTopMovers(prev => 
        prev.map(mover => {
          if (mover.pair === payload.pair) {
            return {
              ...mover,
              price: payload.price?.toString() || mover.price,
              change: payload.change || mover.change,
              trend: payload.trend || mover.trend,
            };
          }
          return mover;
        })
      );
    });

    // Cleanup khi component bị hủy hoặc khi lưu code (Fast Refresh)
    return () => {
      isMounted = false;
      stopPolling();
      
      if (echoClient) {
        console.log('🔌 Rời channel và ngắt kết nối Echo tạm thời...');
        echoClient.leaveChannel('rates');
        
        // Hủy bỏ toàn bộ sự kiện lắng nghe trạng thái kết nối cũ
        if (echoClient.connector?.pusher?.connection) {
          echoClient.connector.pusher.connection.unbind('connected');
          echoClient.connector.pusher.connection.unbind('disconnected');
          echoClient.connector.pusher.connection.unbind('unavailable');
          echoClient.connector.pusher.disconnect(); // Ngắt hẳn để dọn dẹp bộ nhớ RAM trình duyệt
        }
      }
    };
  }, [enableWebSocket, enablePollingFallback, initialFetchData, refreshData, startPolling, stopPolling]);

  return {
    rates,
    topMovers,
    loading,
    isConnected,
    apiError,
    refreshData,
    usingWebSocket,
    usingPolling,
  };
}