import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'
import { getAddress } from 'viem'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { address } = req.body

    if (!address) {
      return res.status(400).json({ error: 'Address is required' })
    }

    // Normalize address (checksum)
    const normalizedAddress = getAddress(address)

    // Find or create user
    let user = await prisma.user.findFirst({
      where: {
        accounts: {
          some: {
            providerAccountId: normalizedAddress,
            provider: 'reown',
          },
        },
      },
      include: {
        accounts: true,
      },
    })

    if (!user) {
      // Create new user WITHOUT username - user will set it in setup flow
      user = await prisma.user.create({
        data: {
          name: normalizedAddress.slice(0, 6) + '...' + normalizedAddress.slice(-4),
          email: null,
          username: `temp_${Date.now()}`, // Temporary username, will be replaced in setup
          accounts: {
            create: {
              provider: 'reown',
              providerAccountId: normalizedAddress,
              type: 'wallet',
            },
          },
        },
        include: {
          accounts: true,
        },
      })
    }

    // Return user data (without sensitive info)
    return res.status(200).json({
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      address: normalizedAddress,
    })
  } catch (error: any) {
    console.error('Error in /api/auth/user:', error)
    return res.status(500).json({ error: error.message || 'Internal server error' })
  }
}

