import "../styles/globals.css";
import type { AppProps } from "next/app";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AppKitProvider, useAppKitAccount } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet, arbitrum, polygon, base, optimism } from '@reown/appkit/networks'
import type { AppKitNetwork } from '@reown/appkit-common'
import { useEffect, useState } from 'react'
import { AuthContext } from '../lib/authContext'
import Head from 'next/head'

const queryClient = new QueryClient()

const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || ''
const networks: [AppKitNetwork, ...AppKitNetwork[]] = [mainnet, arbitrum, polygon, base, optimism]

function AuthProvider({ children }: { children: React.ReactNode }) {
  const { address, isConnected } = useAppKitAccount()
  const [user, setUser] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = async () => {
    if (!isConnected || !address) {
      setUser(null)
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      })
      
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Error fetching user:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshUser()
  }, [address, isConnected])

  useEffect(() => {
    if (!isConnected && user) {
      setUser(null)
    }
  }, [isConnected])

  // Redirect to username setup if connected but no username
  useEffect(() => {
    if (isConnected && address && !loading && user && (!user.username || user.username.startsWith('temp_'))) {
      const currentPath = window.location.pathname
      if (currentPath !== '/setup/username' && currentPath !== '/auth/signin') {
        window.location.href = '/setup/username'
      }
    }
  }, [isConnected, address, user, loading])

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/img/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/img/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/img/logo-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/img/logo-512x512.png" />
        <meta name="description" content="Your personal link hub. Connect all your important links in one place." />
      </Head>
      <AppKitProvider
      adapters={[new WagmiAdapter({ networks, projectId })]}
      networks={networks}
      projectId={projectId}
      metadata={{
        name: 'NeetMeTree',
        description: 'Your personal link hub',
        url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:1337',
        icons: [`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:1337'}/img/logo-192x192.png`]
      }}
      features={{
        email: true,
        socials: ['google', 'github', 'apple', 'x', 'discord'],
      }}
      themeMode="light"
      themeVariables={{
        '--w3m-accent': '#3b82f6',
      }}
    >
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Component {...pageProps} />
        </AuthProvider>
      </QueryClientProvider>
    </AppKitProvider>
    </>
  )
}
