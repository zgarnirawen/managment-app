/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['@heroicons/react']
  },
  // Add this to silence the workspace root warning
  outputFileTracingRoot: __dirname,
  
  // Allow cross-origin development access
  allowedDevOrigins: [
    'localhost:3000',
    '127.0.0.1:3000',
    '192.168.100.9:3000'
  ],
  
  // Optimize chunk loading and reduce timeouts
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Optimize chunk loading in development
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: {
              minChunks: 1,
              priority: -20,
              reuseExistingChunk: true
            },
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              priority: -10,
              reuseExistingChunk: true
            }
          }
        }
      };
    }
    return config;
  },
  
  // Optimize server and client
  compress: true,
  poweredByHeader: false
}

module.exports = nextConfig
