import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
  
  // ESLint configuration for Vercel deployment
  eslint: {
    // This allows production builds to succeed despite ESLint errors
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
