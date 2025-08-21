/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  webpack: (config, { isServer }) => {
    // 如果是服务器端构建
    if (isServer) {
      // 将 re2 模块标记为外部依赖
      config.externals = [...(config.externals || []), 're2'];
    }
    return config;
  },
  // 将 re2 添加到服务器外部包列表
  serverExternalPackages: ['re2']
};

module.exports = nextConfig;
