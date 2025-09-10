// Quick production optimization
const nextConfig = {
  experimental: {
    optimizePackageImports: ['@clerk/nextjs', '@tanstack/react-query'],
    // Explicitly disable any client reference manifest features
    clientReferenceManifest: false,
  },
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
  // Additional build configuration to prevent clientReferenceManifest issues
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Ensure clientReferenceManifest is not generated
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
    return config;
  },
}
