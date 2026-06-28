import type { NextConfig } from "next";

const laravelOrigin =
  process.env.LARAVEL_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:8000";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/storage/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/storage/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/laravel/:path*",
        destination: `${laravelOrigin}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
