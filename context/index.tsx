// context/index.tsx
'use client'

import React, { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, cookieToInitialState, type Config } from 'wagmi'
import { createAppKit } from '@reown/appkit/react'
// Import config, networks, projectId, and wagmiAdapter from your config file
import { config, networks, projectId, wagmiAdapter } from '@/config'
// Import the default network separately if needed
import { mainnet } from '@reown/appkit/networks'

const queryClient = new QueryClient()

const metadata = {
  name: 'NEET.me',
  description: 'Your personal link hub',
  url: typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  icons: [`${typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/img/logo-192x192.png`],
}

// Initialize AppKit *outside* the component render cycle
// Add a check for projectId for type safety, although config throws error already.
if (!projectId) {
  console.error("AppKit Initialization Error: Project ID is missing.");
  // Optionally throw an error or render fallback UI
} else {
  createAppKit({
    adapters: [wagmiAdapter],
    // Use non-null assertion `!` as projectId is checked runtime, needed for TypeScript
    projectId: projectId!,
    // Pass networks directly (type is now correctly inferred from config)
    networks: networks,
    defaultNetwork: mainnet, // Or your preferred default
    metadata,
    features: { 
      analytics: true,
      email: true,
      socials: ['google', 'x'], // Only show Google and X as main social options
      emailShowWallets: true,
    },
    themeMode: 'dark',
    themeVariables: {
      '--w3m-accent': '#6AFF7F',
    },
    // Featured wallets will appear first in the modal
    // Phantom is prioritized first since it's the primary wallet for this platform
    featuredWalletIds: [
      'a797aa35c0fadbfc1a53e7f675162ed5226968b44a19ee3d24385c64d1d3c393', // Phantom (Solana) - Primary wallet
      'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
      '1ae92b26df02f24cac19a58e759176a8b51c0c0c8b8b8b8b8b8b8b8b8b8b8b8b', // Rainbow Wallet
    ],
    // Show all wallets but featured ones appear first
    enableWallets: true,
    showWallets: true,
  })
}

export default function ContextProvider({
  children,
  cookies,
}: {
  children: ReactNode
  cookies?: string | null // Cookies from server for hydration (optional for Pages Router)
}) {
  // Calculate initial state for Wagmi SSR hydration
  const initialState = cookieToInitialState(config as Config, cookies || undefined)

  return (
    // Cast config as Config for WagmiProvider
    <WagmiProvider config={config as Config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}

