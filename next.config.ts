import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    // Custom loader: serve Sanity images directly from Sanity's CDN (already
    // optimized) instead of round-tripping through Next's optimizer. See
    // src/sanity/image-loader.ts. (remotePatterns/formats/minimumCacheTTL only
    // applied to the built-in optimizer, which this replaces, so they're dropped.)
    loader: 'custom',
    loaderFile: './src/sanity/image-loader.ts',
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
        loaders: [{ loader: '@svgr/webpack', options: { icon: true } }],
        as: '*.js',
      },
    },
  },
}

export default nextConfig
