/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',           // 靜態導出
  trailingSlash: true,        // Walrus Sites 需求
  images: {
    unoptimized: true         // 靜態部署需求
  },
  basePath: '',
  generateBuildId: () => 'build'
};

export default nextConfig;
