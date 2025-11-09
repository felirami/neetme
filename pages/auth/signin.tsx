import { useAppKit } from '@reown/appkit/react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useAuth } from '../../lib/authContext'

export default function SignIn() {
  const { open } = useAppKit()
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user && !loading) {
      // Check if user needs to set username
      if (!user.username || user.username.startsWith('temp_')) {
        router.push('/setup/username')
      } else {
        router.push('/dashboard')
      }
    }
  }, [user, loading, router])

  const handleSignIn = () => {
    // Open Reown modal
    open()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-primary mx-auto"></div>
          <p className="mt-4 text-gray-secondary">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-gradient flex items-center justify-center px-4 sm:px-6">
      <div className="max-w-md w-full card-neon-glow p-8 sm:p-10">
        <div className="text-center mb-6">
          <img 
            src="/img/logo-192x192.png" 
            alt="NEET.me Logo" 
            className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4"
          />
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-neon-primary text-glow">
            Sign in to NEET.me
          </h1>
          <p className="text-gray-secondary text-sm sm:text-base">
            Connect with your wallet, email, or social account
          </p>
        </div>
        
        <button
          onClick={handleSignIn}
          className="btn-neon w-full flex items-center justify-center gap-3 text-base sm:text-lg"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Connect Wallet or Sign In
        </button>

        <p className="text-xs text-gray-tertiary text-center mt-6">
          Supports 600+ wallets, email, Google, GitHub, Apple, X, and Discord
        </p>
      </div>
    </div>
  )
}
