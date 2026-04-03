/** @type {import('next').NextConfig} */
const createNextIntlPlugin = require('next-intl/plugin');
const path = require('path');

const withNextIntl = createNextIntlPlugin(path.resolve(__dirname, './src/i18n.ts'));

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['ipfs.io', 'nftstorage.link'],
    unoptimized: false,
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
}

module.exports = withNextIntl(nextConfig)
