/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // Optimize for Docker deployments - reduces image size and speeds up Docker export/import
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
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.walletconnect.com https://*.walletconnect.org",
              "font-src 'self' https://fonts.gstatic.com https://fonts.reown.com data: blob:",
              "img-src 'self' data: blob: https: https://walletconnect.org https://walletconnect.com https://secure.walletconnect.com https://secure.walletconnect.org https://tokens-data.1inch.io https://tokens.1inch.io https://ipfs.io https://cdn.zerion.io",
              "connect-src 'self' https://rpc.walletconnect.com https://rpc.walletconnect.org https://relay.walletconnect.com https://relay.walletconnect.org wss://relay.walletconnect.com wss://relay.walletconnect.org https://pulse.walletconnect.com https://pulse.walletconnect.org https://keys.walletconnect.com https://keys.walletconnect.org https://notify.walletconnect.com https://notify.walletconnect.org https://echo.walletconnect.com https://echo.walletconnect.org https://push.walletconnect.com https://push.walletconnect.org https://*.walletconnect.com https://*.walletconnect.org https://*.reown.com https://*.web3modal.org https://api.web3modal.com https://api.web3modal.org https://cca-lite.coinbase.com wss://*.walletconnect.com wss://*.walletconnect.org",
              "frame-src 'self' https://verify.walletconnect.com https://verify.walletconnect.org https://*.walletconnect.com https://*.walletconnect.org https://secure.walletconnect.com https://secure.walletconnect.org",
              "frame-ancestors 'self' http://localhost:* https://*.walletconnect.com https://*.walletconnect.org https://secure.walletconnect.com https://secure.walletconnect.org https://secure-mobile.walletconnect.com https://secure-mobile.walletconnect.org https://*.reown.com https://*.pages.dev https://*.vercel.app https://*.ngrok-free.app",
            ].join('; '),
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig

