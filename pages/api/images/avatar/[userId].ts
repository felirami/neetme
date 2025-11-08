import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { userId } = req.query

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'User ID is required' })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatar: true },
    })

    if (!user || !user.avatar) {
      return res.status(404).json({ error: 'Avatar not found' })
    }

    // If avatar is a data URI, extract and serve it
    if (user.avatar.startsWith('data:image')) {
      const base64Data = user.avatar.replace(/^data:image\/\w+;base64,/, '')
      const imageBuffer = Buffer.from(base64Data, 'base64')
      
      // Extract content type from data URI
      const contentTypeMatch = user.avatar.match(/^data:image\/(\w+);base64/)
      const contentType = contentTypeMatch 
        ? `image/${contentTypeMatch[1]}` 
        : 'image/jpeg'

      res.setHeader('Content-Type', contentType)
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
      return res.send(imageBuffer)
    }

    // If it's a URL, redirect or handle accordingly
    return res.status(200).json({ avatarUrl: user.avatar })
  } catch (error) {
    console.error('Error fetching avatar:', error)
    return res.status(500).json({ error: 'Failed to fetch avatar' })
  }
}

