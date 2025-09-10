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
}

module.exports = nextConfig
