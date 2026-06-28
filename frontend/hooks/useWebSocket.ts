// hooks/useWebSocket.ts
import { useEffect, useRef, useState, useCallback } from 'react';

interface WebSocketHookOptions {
  url: string;
  onMessage?: (data: any) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  autoConnect?: boolean;
}

interface WebSocketHookReturn {
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  sendMessage: (message: any) => void;
  reconnect: () => void;
  disconnect: () => void;
  connectionAttempts: number;
}

export function useWebSocket({
  url,
  onMessage,
  onConnect,
  onDisconnect,
  onError,
  reconnectInterval = 3000,
  maxReconnectAttempts = 10,
  autoConnect = true,
}: WebSocketHookOptions): WebSocketHookReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting');
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const shouldReconnectRef = useRef(true);
  const isManualCloseRef = useRef(false);
  const isConnectingRef = useRef(false);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    // Prevent multiple connection attempts
    if (isConnectingRef.current) {
      return;
    }

    // Nếu đã có kết nối mở, không tạo mới
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    // Nếu đang kết nối, không tạo mới
    if (wsRef.current?.readyState === WebSocket.CONNECTING) {
      return;
    }

    isConnectingRef.current = true;
    setConnectionStatus('connecting');
    setConnectionAttempts(prev => prev + 1);
    
    try {
      // 🔥 FIX: Cho phép localhost với port, không cần kiểm tra ws:// hay wss://
      // Chỉ cần URL không rỗng
      if (!url || url.trim() === '') {
        console.error('WebSocket URL is empty');
        setConnectionStatus('error');
        isConnectingRef.current = false;
        return;
      }

      console.log(`🔄 Connecting to WebSocket: ${url}`);
      const ws = new WebSocket(url);
      wsRef.current = ws;

      // Set timeout for connection
      const connectionTimeout = setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN) {
          console.warn('⏰ WebSocket connection timeout');
          ws.close();
          setConnectionStatus('error');
          isConnectingRef.current = false;
          onError?.(new Event('timeout'));
        }
      }, 5000);

      ws.onopen = () => {
        clearTimeout(connectionTimeout);
        setIsConnected(true);
        setConnectionStatus('connected');
        reconnectAttemptsRef.current = 0;
        isManualCloseRef.current = false;
        isConnectingRef.current = false;
        console.log('✅ WebSocket connected successfully');
        onConnect?.();

        // Setup ping to keep connection alive
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
        }
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ event: 'ping' }));
          }
        }, 30000);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          // Handle ping response
          if (data.event === 'pong') {
            return;
          }
          onMessage?.(data);
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        clearTimeout(connectionTimeout);
        setIsConnected(false);
        setConnectionStatus('disconnected');
        wsRef.current = null;
        isConnectingRef.current = false;
        
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = null;
        }
        
        console.log(`🔌 WebSocket closed: ${event.code} - ${event.reason}`);
        onDisconnect?.();

        // Không reconnect nếu là manual close hoặc không cho phép reconnect
        if (isManualCloseRef.current || !shouldReconnectRef.current) {
          return;
        }

        // Kiểm tra nếu đã đạt số lần thử tối đa
        if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          console.log('❌ WebSocket: Max reconnect attempts reached');
          setConnectionStatus('error');
          return;
        }

        // Thử reconnect với exponential backoff
        reconnectAttemptsRef.current++;
        const delay = Math.min(
          reconnectInterval * Math.pow(1.5, reconnectAttemptsRef.current - 1),
          30000 // Max 30 seconds
        );
        
        console.log(`🔄 WebSocket reconnecting in ${delay}ms... Attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts}`);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, delay);
      };

      ws.onerror = (error) => {
        clearTimeout(connectionTimeout);
        console.error('❌ WebSocket error event:', error);
        setConnectionStatus('error');
        isConnectingRef.current = false;
        onError?.(error);
      };

    } catch (error) {
      console.error('❌ Error creating WebSocket connection:', error);
      setConnectionStatus('error');
      isConnectingRef.current = false;
      onError?.(error as Event);
    }
  }, [url, onConnect, onDisconnect, onError, reconnectInterval, maxReconnectAttempts]);

  const disconnect = useCallback(() => {
    isManualCloseRef.current = true;
    shouldReconnectRef.current = false;
    isConnectingRef.current = false;
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    
    if (wsRef.current) {
      try {
        wsRef.current.close(1000, 'Manual disconnect');
      } catch (error) {
        console.error('Error closing WebSocket:', error);
      }
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setConnectionStatus('disconnected');
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    shouldReconnectRef.current = true;
    reconnectAttemptsRef.current = 0;
    isManualCloseRef.current = false;
    isConnectingRef.current = false;
    setTimeout(() => connect(), 100);
  }, [disconnect, connect]);

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify(message));
        return true;
      } catch (error) {
        console.error('Error sending WebSocket message:', error);
        return false;
      }
    } else {
      console.warn('⚠️ WebSocket is not connected. Cannot send message.');
      return false;
    }
  }, []);

  useEffect(() => {
    if (autoConnect) {
      shouldReconnectRef.current = true;
      const timer = setTimeout(() => {
        connect();
      }, 500);
      return () => {
        clearTimeout(timer);
        disconnect();
      };
    }
  }, [connect, disconnect, autoConnect]);

  return {
    isConnected,
    connectionStatus,
    sendMessage,
    reconnect,
    disconnect,
    connectionAttempts,
  };
}