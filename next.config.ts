import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },
  webpack(config) {
    const svgr = {
      test: /\.svg$/,
      use: [{ loader: '@svgr/webpack', options: { icon: true } }],
    }
    config.module.rules.push(svgr)
    return config
  },
  productionBrowserSourceMaps: true,
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
}

export default nextConfig
