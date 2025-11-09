import Link from 'next/link'
import Head from 'next/head'

export default function Custom404() {
  return (
    <>
      <Head>
        <title>404 - Page Not Found | NEET.me</title>
      </Head>
      <div className="min-h-screen bg-dark-gradient flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="card-neon-glow p-6 sm:p-8 md:p-10">
            {/* 404 Image */}
            <div className="mb-6 sm:mb-8 flex justify-center">
              <img 
                src="/404.jpg" 
                alt="404 - Page Not Found" 
                className="max-w-full h-auto rounded-lg shadow-neon-md"
                style={{ maxHeight: '400px' }}
              />
            </div>

            {/* Error Message */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-neon-primary text-glow">
              404
            </h1>
            <h2 className="text-xl sm:text-2xl font-semibold mb-3 text-primary">
              Page Not Found
            </h2>
            <p className="text-base sm:text-lg text-gray-secondary mb-8">
              Oops! The page you're looking for doesn't exist or has been moved.
            </p>

            {/* Home Button */}
            <Link href="/" className="inline-block">
              <button className="btn-neon px-8 py-3 text-base sm:text-lg">
                Go Back Home
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

