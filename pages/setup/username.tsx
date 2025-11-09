import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../../lib/authContext'
import { useAppKitAccount } from '@reown/appkit/react'
import { getDomain } from '../../lib/utils'

export default function UsernameSetup() {
  const { user, loading: authLoading, refreshUser } = useAuth()
  const { address, isConnected } = useAppKitAccount()
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Redirect if not connected (client-side only)
  useEffect(() => {
    if (!authLoading && (!isConnected || !address)) {
      router.push('/auth/signin')
    }
  }, [isConnected, address, authLoading, router])

  // Redirect if already has username (client-side only)
  useEffect(() => {
    if (!authLoading && user?.username && !user.username.startsWith('temp_')) {
      router.push('/dashboard')
    }
  }, [user, authLoading, router])

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-dark-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-primary mx-auto"></div>
          <p className="mt-4 text-gray-secondary">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render form if not connected or already has username
  if (!isConnected || !address || (user?.username && !user.username.startsWith('temp_'))) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    // Validate username
    if (username.length < 5) {
      setError('Username must be at least 5 characters long')
      return
    }

    if (!/^[a-z0-9_-]+$/.test(username)) {
      setError('Username can only contain lowercase letters, numbers, hyphens, and underscores')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/user/username', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-address': address,
        },
        body: JSON.stringify({ username, address }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to set username')
        setLoading(false)
        return
      }

      // Refresh user data and redirect to dashboard
      await refreshUser()
      router.push('/dashboard')
    } catch (err) {
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-gradient flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
      <div className="max-w-md w-full card-neon-glow p-8 sm:p-10">
        <div className="text-center mb-6">
          <img 
            src="/img/logo-192x192.png" 
            alt="NeetMeTree Logo" 
            className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4"
          />
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-neon-primary text-glow">
            Choose Your Username
          </h1>
          <p className="text-gray-secondary text-sm sm:text-base">
            Your profile will be available at <span className="font-semibold text-neon-primary">{getDomain()}/{username || 'username'}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-2 text-primary">
              Username
            </label>
            <div className="flex items-center gap-2">
              <span className="text-gray-tertiary whitespace-nowrap text-sm sm:text-base">{getDomain()}/</span>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => {
                  const value = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '')
                  setUsername(value)
                  setError('')
                }}
                className="input-neon flex-1 min-h-[44px]"
                placeholder="yourusername"
                minLength={5}
                maxLength={30}
                pattern="[a-z0-9_-]+"
                required
                autoFocus
              />
            </div>
            <p className="text-xs text-gray-tertiary mt-1">
              Minimum 5 characters. Only lowercase letters, numbers, hyphens, and underscores.
            </p>
            {error && (
              <p className="text-red-400 text-sm mt-2">{error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || username.length < 5}
            className="btn-neon w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Profile'}
          </button>
        </form>

        <p className="text-xs text-gray-tertiary text-center mt-6">
          You can change this later in your dashboard settings
        </p>
      </div>
    </div>
  )
}

