// Quick production optimization
const nextConfig = {
  experimental: {
    optimizePackageImports: ['@clerk/nextjs', '@tanstack/react-query']
  },
  images: {
    domains: ['images.clerk.dev', 'res.cloudinary.com'],
  },
  // Optimize for production
  compress: true,
  poweredByHeader: false,
  // Set output file tracing root to silence workspace warning
  outputFileTracingRoot: __dirname,
}

module.exports = nextConfig
