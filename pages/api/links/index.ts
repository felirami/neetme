import { NextApiRequest, NextApiResponse } from "next";
import { authenticateRequest } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Dev mode: Allow direct access with userId
  if (process.env.NODE_ENV !== 'production' && req.body?.userId && req.headers['x-user-address'] === 'dev-mode') {
    const { userId, title, url, icon, backgroundColor, textColor, iconColor } = req.body

    if (req.method === "POST") {
      if (!title || !url) {
        return res.status(400).json({ error: "Title and URL are required" });
      }

      const maxOrderLink = await prisma.link.findFirst({
        where: { userId },
        orderBy: { order: "desc" },
      });

      const newOrder = maxOrderLink ? maxOrderLink.order + 1 : 0;

      const link = await prisma.link.create({
        data: {
          title,
          url,
          icon: icon || null,
          backgroundColor: backgroundColor || null,
          textColor: textColor || null,
          iconColor: iconColor || null,
          userId,
          order: newOrder,
        },
      });

      return res.status(201).json(link);
    }

    if (req.method === "GET") {
      const links = await prisma.link.findMany({
        where: { userId },
        orderBy: { order: "asc" },
      });

      return res.status(200).json(links);
    }
  }

  const auth = await authenticateRequest(req, res);
  if (!auth) return; // Response already sent

  const { user } = auth;

  if (req.method === "POST") {
    const { title, url, icon, backgroundColor, textColor, iconColor } = req.body;

    if (!title || !url) {
      return res.status(400).json({ error: "Title and URL are required" });
    }

    // Get current max order
    const maxOrderLink = await prisma.link.findFirst({
      where: { userId: user.id },
      orderBy: { order: "desc" },
    });

    const newOrder = maxOrderLink ? maxOrderLink.order + 1 : 0;

    const link = await prisma.link.create({
      data: {
        title,
        url,
        icon: icon || null,
        backgroundColor: backgroundColor || null,
        textColor: textColor || null,
        iconColor: iconColor || null,
        userId: user.id,
        order: newOrder,
      },
    });

    return res.status(201).json(link);
  }

  if (req.method === "GET") {
    const links = await prisma.link.findMany({
      where: { userId: user.id },
      orderBy: { order: "asc" },
    });

    return res.status(200).json(links);
  }

  return res.status(405).json({ error: "Method not allowed" });
}

