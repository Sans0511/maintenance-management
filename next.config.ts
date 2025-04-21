import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  webpack(config, { isServer }) {
    // Optional: prevent Sequelize bundling issues on server
    if (isServer) {
      config.externals?.push?.('sequelize')
    }

    // Support SVG imports as React components
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    })

    return config
  },
}

export default nextConfig
