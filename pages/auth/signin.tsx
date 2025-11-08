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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Sign in to NeetMeTree
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
          Connect with your wallet, email, or social account
        </p>
        
        <button
          onClick={handleSignIn}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Connect Wallet or Sign In
        </button>

        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-6">
          Supports 600+ wallets, email, Google, GitHub, Apple, X, and Discord
        </p>
      </div>
    </div>
  )
}
