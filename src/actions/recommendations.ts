"use server";
import { db } from "@/db";
import { subchapters, learningProgress } from "@/db/schema";
import { eq, asc, notInArray, and } from "drizzle-orm";
import { requireRole } from "./auth";

export async function getRecommendedMaterials() {
  const user = await requireRole(["student"]);
  
  // Get all subchapters the student has completed
  const completedProgress = await db.select({
    subchapterId: learningProgress.subchapterId
  }).from(learningProgress)
  .where(
    and(
      eq(learningProgress.studentId, user.id),
      eq(learningProgress.status, "completed")
    )
  );
  
  const completedIds = completedProgress.map(p => p.subchapterId);
  
  // Find up to 3 subchapters that haven't been completed yet, ordered by order_index
  let query = db.select({
    id: subchapters.id,
    chapterId: subchapters.chapterId,
    title: subchapters.title,
    orderIndex: subchapters.orderIndex
  }).from(subchapters).orderBy(asc(subchapters.orderIndex));
  
  if (completedIds.length > 0) {
    query = query.where(notInArray(subchapters.id, completedIds)) as any;
  }
  
  const recommendations = await query.limit(3);
  
  return recommendations;
}
