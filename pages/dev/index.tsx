import { useState } from 'react'
import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next'
import { prisma } from '../../lib/prisma'
import Link from 'next/link'

interface DevDashboardProps {
  users: Array<{
    username: string
    name: string | null
  }>
}

export default function DevDashboard({ users }: DevDashboardProps) {
  const router = useRouter()
  const [selectedUsername, setSelectedUsername] = useState('')

  const handleAccessDashboard = () => {
    if (selectedUsername) {
      router.push(`/dev/dashboard/${selectedUsername}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="bg-yellow-100 dark:bg-yellow-900 border-2 border-yellow-400 dark:border-yellow-600 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-yellow-800 dark:text-yellow-200 mb-2">
              ⚠️ Development Mode
            </h2>
            <p className="text-yellow-700 dark:text-yellow-300 text-sm">
              This feature is only available in development mode. Access any profile's dashboard without authentication.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
            <h1 className="text-3xl font-bold mb-6">Dev Dashboard Access</h1>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Select Profile
                </label>
                <select
                  value={selectedUsername}
                  onChange={(e) => setSelectedUsername(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="">Choose a profile...</option>
                  {users.map((user) => (
                    <option key={user.username} value={user.username}>
                      @{user.username} {user.name ? `- ${user.name}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleAccessDashboard}
                disabled={!selectedUsername}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                Access Dashboard
              </button>

              <div className="pt-4 border-t">
                <Link
                  href="/"
                  className="text-blue-600 hover:underline text-sm"
                >
                  ← Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return {
      notFound: true,
    }
  }

  const allUsers = await prisma.user.findMany({
    select: {
      username: true,
      name: true,
    },
    orderBy: {
      username: 'asc',
    },
  })

  // Filter out temp usernames
  const users = allUsers.filter(u => !u.username.startsWith('temp_'))

  return {
    props: {
      users,
    },
  }
}

