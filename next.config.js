/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        ignored: [
          '**/node_modules/**',
          '**/.next/**',
          '**/C:/**' // Ignore Windows system paths
        ]
      }
    }
    return config
  }
}

module.exports = nextConfig