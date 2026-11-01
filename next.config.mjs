/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'igas-production.vercel.app' }],
        destination: 'https://igas-production-nu.vercel.app/:path*',
        permanent: false,
      },
    ]
  },
}

export default nextConfig
