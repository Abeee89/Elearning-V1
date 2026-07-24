"use server";
import { db } from "@/db";
import { chapters, subchapters } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { requireRole } from "./auth";

export async function getChapters() {
  await requireRole(["student", "teacher"]);
  return db.select().from(chapters).orderBy(asc(chapters.orderIndex));
}

export async function getSubchapters(chapterId: string) {
  await requireRole(["student", "teacher"]);
  return db.select().from(subchapters).where(eq(subchapters.chapterId, chapterId)).orderBy(asc(subchapters.orderIndex));
}

export async function getMaterialTree() {
  await requireRole(["student", "teacher"]);
  const allChapters = await db.select().from(chapters).orderBy(asc(chapters.orderIndex));
  const allSubchapters = await db.select().from(subchapters).orderBy(asc(subchapters.orderIndex));

  return allChapters.map(chapter => ({
    ...chapter,
    subchapters: allSubchapters.filter(sub => sub.chapterId === chapter.id)
  }));
}

export async function getSubchapterById(subchapterId: string) {
  await requireRole(["student", "teacher"]);
  const result = await db.select().from(subchapters).where(eq(subchapters.id, subchapterId));
  return result[0];
}
