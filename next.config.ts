import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // React Compiler (Next 16 top-level, needs babel-plugin-react-compiler).
  // EXPERIMENTAL TRIAL on beta-v3.0.0 — auto-memoizes components. Adds a Babel
  // pass (slower build/dev). Verify the imperative WebGL/Motion surfaces before
  // keeping; switch to { compilationMode: 'annotation' } to opt-in per-component.
  reactCompiler: true,
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
