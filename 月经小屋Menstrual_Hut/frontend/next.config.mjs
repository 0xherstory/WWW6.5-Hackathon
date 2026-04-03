/** @type {import('next').NextConfig} */
const nextConfig = {
  // ThirdWeb 兼容性配置
  webpack: (config, { dev, isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
    };

    // 忽略 ThirdWeb 中某些可选的原生模块
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      { module: /thirdweb/ },
    ];

    return config;
  },
};

export default nextConfig;