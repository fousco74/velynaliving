import express from "express";
import { houseSchema } from "@velyna/shared";
import { prisma } from "../db.js";

export const houseRouter = express.Router();

houseRouter.get("/", async (_req, res) => {
  const houses = await prisma.house.findMany({
    select: { name: true, slug: true },
    orderBy: { name: "asc" },
  });

  res.json({ data: houses });
});

houseRouter.post("/", async (req, res) => {
  const parsed = houseSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues });
  }

  const existing = await prisma.house.findFirst({
    where: { OR: [{ slug: parsed.data.slug }, { name: parsed.data.name }] },
    select: { slug: true },
  });

  if (existing) {
    return res.status(409).json({ error: "Une maison avec ce nom ou ce slug existe déjà." });
  }

  const house = await prisma.house.create({
    data: parsed.data,
    select: { name: true, slug: true },
  });

  res.status(201).json({ data: house });
});
