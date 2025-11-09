import { GetServerSideProps } from "next";
import { useAuth } from "../lib/authContext";
import Link from "next/link";
import { useAppKit, useAppKitAccount } from '@reown/appkit/react'
import { modal } from '@reown/appkit/react'
import { useRouter } from 'next/router'
import { useState } from 'react'

interface HomeProps {
  isDev?: boolean;
}

export default function Home({ isDev }: HomeProps) {
  const { user: authUser, loading: authLoading } = useAuth();
  const { open } = useAppKit();
  const { isConnected } = useAppKitAccount();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      // Disconnect using AppKit modal instance
      if (modal) {
        await modal.disconnect();
      }
      // Redirect to home page after sign out
      window.location.href = '/';
    } catch (error) {
      console.error('Error disconnecting:', error);
      // Still redirect even if disconnect fails
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-dark-gradient">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-6 sm:mb-8 flex justify-center">
            <img 
              src="/img/logo-192x192.png" 
              alt="NeetMeTree Logo" 
              className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain"
            />
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6 text-neon-primary text-glow">
            NeetMeTree
          </h1>
          <p className="text-lg sm:text-xl text-gray-secondary mb-8 sm:mb-12 px-4">
            Your personal link hub. Connect all your important links in one place.
          </p>

          {authLoading ? (
            <div className="card-neon-glow">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-primary mx-auto"></div>
                <p className="mt-4 text-gray-secondary">Loading...</p>
              </div>
            </div>
          ) : authUser ? (
            authUser.username && !authUser.username.startsWith('temp_') ? (
              <div className="card-neon-glow">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-primary">Welcome @{authUser.username}!</h2>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <Link
                    href="/dashboard"
                    className="btn-neon"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="btn-neon-outline"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="card-neon-glow">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-primary">Welcome!</h2>
                <p className="text-gray-secondary mb-6 text-sm sm:text-base">
                  Complete your profile setup to get started
                </p>
                <Link
                  href="/setup/username"
                  className="btn-neon inline-block"
                >
                  Set Up Username
                </Link>
              </div>
            )
          ) : (
            <div className="card-neon-glow">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-primary">Get Started</h2>
              <p className="text-gray-secondary mb-6 text-sm sm:text-base">
                Connect with your wallet, email, or social account to create your personalized link page
              </p>
              <button
                onClick={() => open()}
                className="btn-neon"
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

