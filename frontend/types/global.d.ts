import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
  interface Window {
    Echo?: any;
    Pusher?: any;
  }
}

export {};
