import express from "express";
import { prisma } from "../db.js";

export const houseRouter = express.Router();

houseRouter.get("/", async (_req, res) => {
  const houses = await prisma.house.findMany({
    select: { name: true, slug: true },
    orderBy: { name: "asc" },
  });

  res.json({ data: houses });
});
