import { GetServerSideProps } from "next";
import { useAuth } from "../lib/authContext";
import Link from "next/link";
import { useAppKit } from '@reown/appkit/react'
import { modal } from '@reown/appkit/react'
import { useRouter } from 'next/router'

interface HomeProps {
  isDev?: boolean;
}

export default function Home({ isDev }: HomeProps) {
  const { user: authUser, loading: authLoading } = useAuth();
  const { open } = useAppKit();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      // Disconnect using AppKit modal instance
      if (modal) {
        await modal.disconnect();
      }
      router.push('/');
    } catch (error) {
      console.error('Error disconnecting:', error);
      // Still redirect even if disconnect fails
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8 flex justify-center">
            <img 
              src="/img/logo-192x192.png" 
              alt="NeetMeTree Logo" 
              className="w-24 h-24 object-contain"
            />
          </div>
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            NeetMeTree
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12">
            Your personal link hub. Connect all your important links in one place.
          </p>

          {authLoading ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
              </div>
            </div>
          ) : authUser ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
              {authUser.username && !authUser.username.startsWith('temp_') ? (
                <>
                  <h2 className="text-2xl font-semibold mb-4">Welcome back, {authUser.name || 'User'}!</h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Your profile is live at:{" "}
                    <Link 
                      href={`/${authUser.username}`}
                      className="text-blue-600 hover:underline font-semibold"
                    >
                      /{authUser.username}
                    </Link>
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Link
                      href="/dashboard"
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-semibold mb-4">Welcome!</h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Complete your profile setup to get started
                  </p>
                  <Link
                    href="/setup/username"
                    className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Set Up Username
                  </Link>
                </>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
              <h2 className="text-2xl font-semibold mb-4">Get Started</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Connect with your wallet, email, or social account to create your personalized link page
              </p>
              <button
                onClick={() => open()}
                className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Get Started
              </button>
            </div>
          )}

          {/* Dev Mode Section - Hidden from homepage, only accessible via /dev */}
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {
      isDev: process.env.NODE_ENV !== 'production',
    },
  };
};

