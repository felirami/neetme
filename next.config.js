/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.walletconnect.com https://*.walletconnect.org https://*.web3modal.org",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com data: blob:",
              "img-src 'self' data: https: blob:",
              "connect-src 'self' https://*.walletconnect.com https://*.walletconnect.org https://*.reown.com https://*.web3modal.org https://api.web3modal.org https://cca-lite.coinbase.com wss://*.walletconnect.com wss://*.walletconnect.org",
              "frame-src 'self' https://*.walletconnect.com https://*.walletconnect.org https://secure.walletconnect.org",
              "frame-ancestors 'self'",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig

