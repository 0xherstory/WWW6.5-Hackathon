/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@rainbow-me/rainbowkit"],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      // 浏览器构建不需要 RN 与可选日志依赖
      "@react-native-async-storage/async-storage": false,
      "pino-pretty": false,
    };
    return config;
  },
};

export default nextConfig;
