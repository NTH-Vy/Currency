import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

if (typeof window !== 'undefined') {
  (window as any).Pusher = Pusher;
}

// Kiểm tra xem trang web hiện tại có đang chạy HTTPS hay không
const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';

export const echoClient = typeof window !== 'undefined'
  ? new Echo({
      broadcaster: 'reverb',
      key: process.env.NEXT_PUBLIC_REVERB_APP_KEY || 'fg9cbuw2xylucqhpwdly',
      wsHost: process.env.NEXT_PUBLIC_REVERB_HOST || 'localhost',
      wsPort: parseInt(process.env.NEXT_PUBLIC_REVERB_PORT || '8080', 10),
      wssPort: parseInt(process.env.NEXT_PUBLIC_REVERB_PORT || '8080', 10),
      forceTLS: isHttps, 
      // Chỉ cho phép DUY NHẤT một transport phù hợp để tránh trình duyệt cố đấm ăn xôi kết nối cả 2
      enabledTransports: isHttps ? ['wss'] : ['ws'],
      disableStats: true,
    })
  : null;