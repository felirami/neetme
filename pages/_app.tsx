import "../styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect, useState, useCallback } from 'react'
import { AuthContext } from '../lib/authContext'
import Head from 'next/head'
import ContextProvider from '@/context'
import { useAppKitAccount } from '@reown/appkit/react'

// For Pages Router, we'll get cookies client-side if needed
// SSR hydration will work on initial load

function AuthProvider({ children }: { children: React.ReactNode }) {
  const { address, isConnected } = useAppKitAccount()
  const [user, setUser] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = useCallback(async () => {
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
  }, [address, isConnected])

  useEffect(() => {
    // Initial load - ensure loading resolves after a short delay
    const timer = setTimeout(() => {
      if (!isConnected) {
        setLoading(false)
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  useEffect(() => {
    if (!isConnected && user) {
      setUser(null)
    }
  }, [isConnected, user])

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
  // For Pages Router, cookies are handled client-side for SSR hydration
  // Wagmi will properly hydrate the state from cookies on initial load
  const [cookies, setCookies] = useState<string | null>(null)

  useEffect(() => {
    // Set cookies on client-side for SSR hydration
    if (typeof document !== 'undefined') {
      setCookies(document.cookie || null)
      
      // Load markdown editor CSS only when on dashboard page, with delay
      const loadMarkdownCSS = () => {
        if (window.location.pathname === '/dashboard') {
          setTimeout(() => {
            // Load react-markdown-editor-lite CSS
            const link1 = document.createElement('link');
            link1.rel = 'stylesheet';
            link1.href = '/css/markdown-editor.css';
            if (!document.querySelector(`link[href="${link1.href}"]`)) {
              document.head.appendChild(link1);
            }
            
            // Load @uiw/react-md-editor CSS files
            const link2 = document.createElement('link');
            link2.rel = 'stylesheet';
            link2.href = '/css/mdeditor.css';
            if (!document.querySelector(`link[href="${link2.href}"]`)) {
              document.head.appendChild(link2);
            }
            
            const link3 = document.createElement('link');
            link3.rel = 'stylesheet';
            link3.href = '/css/markdown-preview.css';
            if (!document.querySelector(`link[href="${link3.href}"]`)) {
              document.head.appendChild(link3);
            }
          }, 500);
        }
      };
      
      loadMarkdownCSS();
    }
  }, [])

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
      <ContextProvider cookies={cookies}>
        <AuthProvider>
          <Component {...pageProps} />
        </AuthProvider>
      </ContextProvider>
    </>
  )
}
