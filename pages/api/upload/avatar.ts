import { NextApiRequest, NextApiResponse } from 'next'
import { authenticateRequest } from '../../../lib/auth'
import { prisma } from '../../../lib/prisma'

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '2mb', // Limit to 2MB after compression
    },
  },
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Dev mode: Allow direct access with userId
  if (process.env.NODE_ENV !== 'production' && req.body?.userId && req.headers['x-user-address'] === 'dev-mode') {
    const { userId, imageData } = req.body

    if (!imageData || !imageData.startsWith('data:image')) {
      return res.status(400).json({ error: 'Invalid image data' })
    }

    try {
      // Store base64 data directly in database
      await prisma.user.update({
        where: { id: userId },
        data: { avatar: imageData },
      })

      // Return success with the data URI
      return res.status(200).json({ avatarUrl: imageData })
    } catch (error) {
      console.error('Error uploading image:', error)
      return res.status(500).json({ error: 'Failed to upload image' })
    }
  }

  const auth = await authenticateRequest(req, res)
  if (!auth) return

  const { user } = auth
  const { imageData } = req.body

  if (!imageData || !imageData.startsWith('data:image')) {
    return res.status(400).json({ error: 'Invalid image data' })
  }

  try {
    // Store base64 data directly in database
    await prisma.user.update({
      where: { id: user.id },
      data: { avatar: imageData },
    })

    // Return success with the data URI
    return res.status(200).json({ avatarUrl: imageData })
  } catch (error) {
    console.error('Error uploading image:', error)
    return res.status(500).json({ error: 'Failed to upload image' })
  }
}
