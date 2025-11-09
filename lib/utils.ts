/**
 * Get the base URL of the application
 * Works both client-side and server-side
 */
export function getBaseUrl(): string {
  // Server-side: use environment variable
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  }
  
  // Client-side: use window.location or environment variable
  return process.env.NEXT_PUBLIC_APP_URL || window.location.origin
}

/**
 * Get the domain name from the base URL (without protocol)
 */
export function getDomain(): string {
  const baseUrl = getBaseUrl()
  try {
    const url = new URL(baseUrl)
    return url.host
  } catch {
    // Fallback if URL parsing fails
    return baseUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')
  }
}

