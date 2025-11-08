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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Choose Your Username
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
          Your profile will be available at <span className="font-semibold">{getDomain()}/{username || 'username'}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-2">
              Username
            </label>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 dark:text-gray-400">{getDomain()}/</span>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => {
                  const value = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '')
                  setUsername(value)
                  setError('')
                }}
                className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="yourusername"
                minLength={5}
                maxLength={30}
                pattern="[a-z0-9_-]+"
                required
                autoFocus
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Minimum 5 characters. Only lowercase letters, numbers, hyphens, and underscores.
            </p>
            {error && (
              <p className="text-red-500 text-sm mt-2">{error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || username.length < 5}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Profile'}
          </button>
        </form>

        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-6">
          You can change this later in your dashboard settings
        </p>
      </div>
    </div>
  )
}

