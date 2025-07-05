/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Configuración específica para Vercel
  experimental: {
    esmExternals: false
  }
}

module.exports = nextConfig