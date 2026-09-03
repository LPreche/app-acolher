import type { NextConfig } from "next";

const BACKEND_URL =
  process.env.BACKEND_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'https://app-acolher.onrender.com';

const nextConfig: NextConfig = {
  devIndicators: false,
  allowedDevOrigins: [
    '*.ngrok-free.app',
    '*.ngrok-free.dev',
    '*.ngrok.io',
    'localhost:3000',
    '127.0.0.1:3000',
  ],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
