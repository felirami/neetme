import { NextApiRequest, NextApiResponse } from "next";
import { authenticateRequest } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Dev mode: Allow direct access with userId
  if (process.env.NODE_ENV !== 'production' && req.body?.userId && req.headers['x-user-address'] === 'dev-mode') {
    const { userId, id } = { userId: req.body.userId, id: req.query.id };

    if (req.method === "DELETE") {
      const link = await prisma.link.findUnique({
        where: { id: id as string },
      });

      if (!link || link.userId !== userId) {
        return res.status(404).json({ error: "Link not found" });
      }

      await prisma.link.delete({
        where: { id: id as string },
      });

      return res.status(200).json({ success: true });
    }

    if (req.method === "PATCH") {
      const { title, url, icon, order, backgroundColor, textColor, iconColor } = req.body;

      const link = await prisma.link.findUnique({
        where: { id: id as string },
      });

      if (!link || link.userId !== userId) {
        return res.status(404).json({ error: "Link not found" });
      }

      const updatedLink = await prisma.link.update({
        where: { id: id as string },
        data: {
          ...(title && { title }),
          ...(url && { url }),
          ...(icon !== undefined && { icon }),
          ...(order !== undefined && { order }),
          ...(backgroundColor !== undefined && { backgroundColor }),
          ...(textColor !== undefined && { textColor }),
          ...(iconColor !== undefined && { iconColor }),
        },
      });

      return res.status(200).json(updatedLink);
    }
  }

  const auth = await authenticateRequest(req, res);
  if (!auth) return; // Response already sent

  const { user } = auth;
  const { id } = req.query;

  if (req.method === "DELETE") {
    // Verify the link belongs to the user
    const link = await prisma.link.findUnique({
      where: { id: id as string },
    });

    if (!link || link.userId !== user.id) {
      return res.status(404).json({ error: "Link not found" });
    }

    await prisma.link.delete({
      where: { id: id as string },
    });

    return res.status(200).json({ success: true });
  }

  if (req.method === "PATCH") {
    const { title, url, icon, order, backgroundColor, textColor, iconColor } = req.body;

    // Verify the link belongs to the user
    const link = await prisma.link.findUnique({
      where: { id: id as string },
    });

    if (!link || link.userId !== user.id) {
      return res.status(404).json({ error: "Link not found" });
    }

    const updatedLink = await prisma.link.update({
      where: { id: id as string },
      data: {
        ...(title && { title }),
        ...(url && { url }),
        ...(icon !== undefined && { icon }),
        ...(order !== undefined && { order }),
        ...(backgroundColor !== undefined && { backgroundColor }),
        ...(textColor !== undefined && { textColor }),
        ...(iconColor !== undefined && { iconColor }),
      },
    });

    return res.status(200).json(updatedLink);
  }

  return res.status(405).json({ error: "Method not allowed" });
}

