import { NextApiRequest, NextApiResponse } from 'next'
import { authenticateRequest } from '../../../lib/auth'
import { prisma } from '../../../lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Dev mode: Allow direct access with userId
  if (process.env.NODE_ENV !== 'production' && req.body?.userId && req.headers['x-user-address'] === 'dev-mode') {
    const { userId, username } = req.body

    // Validate username
    if (!username || typeof username !== 'string') {
      return res.status(400).json({ error: 'Username is required' })
    }

    if (username.length < 5) {
      return res.status(400).json({ error: 'Username must be at least 5 characters long' })
    }

    if (username.length > 30) {
      return res.status(400).json({ error: 'Username must be less than 30 characters' })
    }

    if (!/^[a-z0-9_-]+$/.test(username)) {
      return res.status(400).json({ error: 'Username can only contain lowercase letters, numbers, hyphens, and underscores' })
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    })

    if (existingUser && existingUser.id !== userId) {
      return res.status(409).json({ error: 'Username is already taken' })
    }

    if (user.username === username) {
      return res.status(400).json({ error: 'This is already your username' })
    }

    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { username },
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          avatar: true,
          bio: true,
        },
      })

      return res.status(200).json(updatedUser)
    } catch (error: any) {
      console.error('Error setting username:', error)
      return res.status(500).json({ error: 'Failed to set username' })
    }
  }

  const auth = await authenticateRequest(req, res)
  if (!auth) return

  const { user } = auth
  const { username } = req.body

  // Validate username
  if (!username || typeof username !== 'string') {
    return res.status(400).json({ error: 'Username is required' })
  }

  if (username.length < 5) {
    return res.status(400).json({ error: 'Username must be at least 5 characters long' })
  }

  if (username.length > 30) {
    return res.status(400).json({ error: 'Username must be less than 30 characters' })
  }

  if (!/^[a-z0-9_-]+$/.test(username)) {
    return res.status(400).json({ error: 'Username can only contain lowercase letters, numbers, hyphens, and underscores' })
  }

  // Check if username already exists
  const existingUser = await prisma.user.findUnique({
    where: { username },
  })

  if (existingUser && existingUser.id !== user.id) {
    return res.status(409).json({ error: 'Username is already taken' })
  }

  // Check if user already has a username (and it's not a temp one)
  if (user.username && !user.username.startsWith('temp_')) {
    // Allow updating username if it's different
    if (user.username === username) {
      return res.status(400).json({ error: 'This is already your username' })
    }
    // For now, we'll allow changing username - you can restrict this later if needed
    // return res.status(400).json({ error: 'Username already set. Please update it from dashboard settings.' })
  }

  try {
    // Update user with username
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { username },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        avatar: true,
        bio: true,
      },
    })

    return res.status(200).json(updatedUser)
  } catch (error: any) {
    console.error('Error setting username:', error)
    return res.status(500).json({ error: 'Failed to set username' })
  }
}

