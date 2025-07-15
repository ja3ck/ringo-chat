import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false, // Disable to prevent double execution in development
  images: {
    domains: ['localhost'], // Allow localhost images
    unoptimized: true, // Disable optimization for local development
  },
};

export default nextConfig;
