/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    formats: ['image/avif', 'image/webp'],
  },
  // Enable compression
  compress: true,
  // Generate ETags for caching
  generateEtags: true,
  // Optimize page loading
  poweredByHeader: false,
  // Trailing slash for better SEO
  trailingSlash: false,
  // Strict mode for better performance
  reactStrictMode: true,
  // Optimize fonts
  optimizeFonts: true,
  // Enable SWC minification
  swcMinify: true,
  // Headers for security and SEO
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
        ],
      },
    ]
  },
}

export default nextConfig
