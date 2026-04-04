/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '30001',
        pathname: '/images/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:30001/api/:path*',
      },
      {
        source: '/images/:path*',
        destination: 'http://localhost:30001/images/:path*',
      },
    ]
  },
}

module.exports = nextConfig
