import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet, arbitrum, polygon, base, optimism } from '@reown/appkit/networks'
import type { AppKitNetwork } from '@reown/appkit-common'

// Get project ID from environment variable
// Sign up at https://dashboard.reown.com to get your project ID
const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || ''

const networks: [AppKitNetwork, ...AppKitNetwork[]] = [mainnet, arbitrum, polygon, base, optimism]

export const appKit = createAppKit({
  adapters: [
    new WagmiAdapter({
      networks,
      projectId,
    }),
  ],
  networks,
  projectId,
  metadata: {
    name: 'NeetMeTree',
    description: 'Your personal link hub',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:1337',
    icons: [`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:1337'}/img/logo-192x192.png`]
  },
  features: {
    email: true,
    socials: ['google', 'github', 'apple', 'x', 'discord'],
  },
  themeMode: 'light',
  themeVariables: {
    '--w3m-accent': '#3b82f6',
  },
})

