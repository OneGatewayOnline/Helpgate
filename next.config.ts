import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Allow Wi-Fi dev access without cross-origin dev warnings
  // @ts-ignore Next.js 15+ allowedDevOrigins
  allowedDevOrigins: ['192.168.1.8', 'localhost:3000'],
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };
    return config;
  },
};

export default nextConfig;
