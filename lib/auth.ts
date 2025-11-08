import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from './prisma'
import { getAddress, isAddress } from 'viem'

// Helper function to get user from address
async function getUserFromAddress(address: string) {
  if (!address || !isAddress(address)) return null
  
  try {
    const normalizedAddress = getAddress(address)
    
    const user = await prisma.user.findFirst({
      where: {
        accounts: {
          some: {
            providerAccountId: normalizedAddress,
            provider: 'reown',
          },
        },
      },
    })
    
    return user
  } catch (error) {
    console.error('Error getting user from address:', error)
    return null
  }
}

// Middleware to authenticate requests
export async function authenticateRequest(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<{ user: any } | null> {
  const address = req.headers['x-user-address'] as string || req.body?.address
  const userId = req.body?.userId as string | undefined

  // Dev mode: Allow bypassing auth with userId in development
  if (process.env.NODE_ENV !== 'production' && address === 'dev-mode' && userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })
    
    if (user) {
      return { user }
    }
  }

  if (!address || address === 'dev-mode') {
    res.status(401).json({ error: 'Unauthorized - Address required' })
    return null
  }

  const user = await getUserFromAddress(address)
  
  if (!user) {
    res.status(401).json({ error: 'Unauthorized - User not found. Please sign in first.' })
    return null
  }

  return { user }
}

