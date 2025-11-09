import { NextApiRequest, NextApiResponse } from "next";
import { authenticateRequest } from "../../lib/auth";
import { prisma } from "../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Dev mode: Allow direct access with userId
  if (process.env.NODE_ENV !== 'production' && req.body?.userId && req.headers['x-user-address'] === 'dev-mode') {
    const { userId, bio, avatar, name } = req.body;

    if (req.method === "PATCH") {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          ...(bio !== undefined && { bio }),
          ...(avatar !== undefined && { avatar }),
          ...(name !== undefined && { name }),
        },
        select: {
          username: true,
          bio: true,
          avatar: true,
          name: true,
        },
      });

      return res.status(200).json(updatedUser);
    }
  }

  const auth = await authenticateRequest(req, res);
  if (!auth) return; // Response already sent

  const { user } = auth;

  if (req.method === "PATCH") {
    const { bio, avatar, name } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(bio !== undefined && { bio }),
        ...(avatar !== undefined && { avatar }),
        ...(name !== undefined && { name }),
      },
      select: {
        username: true,
        bio: true,
        avatar: true,
        name: true,
      },
    });

    return res.status(200).json(updatedUser);
  }

  return res.status(405).json({ error: "Method not allowed" });
}

