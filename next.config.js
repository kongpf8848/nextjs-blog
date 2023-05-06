/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  env: {
    DOMAIN: 'gmail.com'
  }
}

module.exports = nextConfig
