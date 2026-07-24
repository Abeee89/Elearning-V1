"use server";
import { db } from "@/db";
import { assessments, questions, assessmentAttempts, attemptAnswers, subchapters } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { requireRole } from "./auth";

export async function getAssessments() {
  await requireRole(["student", "teacher"]);
  
  return db.select({
    id: assessments.id,
    title: assessments.title,
    subchapterTitle: subchapters.title,
    passingScore: assessments.passingScore
  })
  .from(assessments)
  .leftJoin(subchapters, eq(assessments.subchapterId, subchapters.id));
}

export async function getAssessmentWithQuestions(assessmentId: string) {
  await requireRole(["student", "teacher"]);
  
  const assessmentData = await db.select().from(assessments).where(eq(assessments.id, assessmentId));
  if (!assessmentData.length) throw new Error("Assessment not found");
  
  const assessmentQuestions = await db.select({
    id: questions.id,
    questionText: questions.questionText,
    questionType: questions.questionType,
    options: questions.options
  }).from(questions).where(eq(questions.assessmentId, assessmentId));
  
  return {
    ...assessmentData[0],
    questions: assessmentQuestions
  };
}

export async function startAttempt(assessmentId: string) {
  const user = await requireRole(["student"]);
  
  const newAttempt = await db.insert(assessmentAttempts).values({
    studentId: user.id,
    assessmentId: assessmentId,
  }).returning();
  
  return { success: true, attemptId: newAttempt[0].id };
}

export async function submitAnswers(attemptId: string, answers: { questionId: string, answer: string }[]) {
  const user = await requireRole(["student"]);
  
  // Verify attempt belongs to user
  const attempt = await db.select().from(assessmentAttempts).where(and(eq(assessmentAttempts.id, attemptId), eq(assessmentAttempts.studentId, user.id)));
  if (!attempt.length) throw new Error("Invalid attempt");
  
  const attemptData = attempt[0];
  const assessmentId = attemptData.assessmentId;
  
  // Fetch correct answers for this assessment
  const allQuestions = await db.select().from(questions).where(eq(questions.assessmentId, assessmentId));
  
  let correctCount = 0;
  const answerInserts = answers.map(ans => {
    const q = allQuestions.find(q => q.id === ans.questionId);
    const isCorrect = q ? q.correctAnswer === ans.answer : false;
    if (isCorrect) correctCount++;
    
    return {
      attemptId,
      questionId: ans.questionId,
      studentAnswer: ans.answer,
      isCorrect
    };
  });
  
  // Insert answers
  if (answerInserts.length > 0) {
    await db.insert(attemptAnswers).values(answerInserts);
  }
  
  // Calculate score (out of 100)
  const score = Math.round((correctCount / allQuestions.length) * 100);
  
  // Complete attempt
  await db.update(assessmentAttempts)
    .set({ score, completedAt: new Date() })
    .where(eq(assessmentAttempts.id, attemptId));
    
  return { success: true, score };
}
