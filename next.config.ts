import type { NextConfig } from "next";

const withNextIntl = require('next-intl/plugin')(); // eslint-disable-line @typescript-eslint/no-require-imports

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
  images: {
    qualities: [75, 100],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '**.placeholder.com', // Optional fallback
      }
    ],
  },
};

// eslint-disable-next-line @typescript-eslint/no-require-imports
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

export default withBundleAnalyzer(withNextIntl(nextConfig));
