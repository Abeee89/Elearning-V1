"use server";
import { db } from "@/db";
import { learningProgress, classEnrollments, users, subchapters, chapters } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { requireRole } from "./auth";

export async function updateLearningProgress(subchapterId: string, status: "not_started" | "in_progress" | "completed") {
  const user = await requireRole(["student"]);
  
  // Try to find existing progress
  const existing = await db.select().from(learningProgress).where(
    and(eq(learningProgress.studentId, user.id), eq(learningProgress.subchapterId, subchapterId))
  );
  
  if (existing.length > 0) {
    await db.update(learningProgress).set({
      status,
      completedAt: status === "completed" ? new Date() : existing[0].completedAt
    }).where(eq(learningProgress.id, existing[0].id));
  } else {
    await db.insert(learningProgress).values({
      studentId: user.id,
      subchapterId,
      status,
      completedAt: status === "completed" ? new Date() : null
    });
  }
  
  return { success: true };
}

export async function getClassProgressOverview(classId: string) {
  await requireRole(["teacher"]);
  
  // Get all enrolled students
  const students = await db.select({
    id: users.id,
    fullName: users.fullName,
    email: users.email
  }).from(classEnrollments)
  .innerJoin(users, eq(classEnrollments.studentId, users.id))
  .where(eq(classEnrollments.classId, classId));
  
  // Fetch all learning progress for these students
  // For a large app, we would join efficiently. Doing it simpler here for demo.
  const progressPromises = students.map(async (student) => {
    const progress = await db.select({
      subchapterId: learningProgress.subchapterId,
      status: learningProgress.status,
    }).from(learningProgress).where(eq(learningProgress.studentId, student.id));
    
    return {
      ...student,
      progress
    };
  });
  
  const studentsWithProgress = await Promise.all(progressPromises);
  
  // Total subchapters 
  const totalSubchapters = await db.select().from(subchapters);
  
  // Calculate completion percentage
  return studentsWithProgress.map(student => {
    const completedCount = student.progress.filter(p => p.status === "completed").length;
    const percentage = totalSubchapters.length > 0 ? Math.round((completedCount / totalSubchapters.length) * 100) : 0;
    
    return {
      ...student,
      completedCount,
      totalCount: totalSubchapters.length,
      percentage
    };
  });
}
