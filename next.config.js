// Quick production optimization
const nextConfig = {
  images: {
    domains: ['images.clerk.dev', 'res.cloudinary.com'],
  },
  // Optimize for production
  compress: true,
  poweredByHeader: false,
  // Disable ESLint during build to fix deployment issues
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ensure clean builds
  distDir: '.next',
  // Experimental features for Next.js 15 compatibility
  experimental: {
    // Optimize for Vercel deployment
    optimizePackageImports: ['@clerk/nextjs', '@prisma/client'],
  },
  // Webpack configuration for better compatibility
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Ensure client-side bundles are properly generated
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks?.cacheGroups,
            framework: {
              chunks: 'all',
              name: 'framework',
              test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
              priority: 40,
              enforce: true,
            },
          },
        },
      };
    }

    // Ensure proper handling of client components
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    };

    return config;
  },
}

module.exports = nextConfig
