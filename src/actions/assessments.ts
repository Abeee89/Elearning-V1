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
    options: questions.options,
    imageUrl: questions.imageUrl
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
  const score = allQuestions.length > 0 ? Math.round((correctCount / allQuestions.length) * 100) : 0;
  
  // Complete attempt
  await db.update(assessmentAttempts)
    .set({ score, completedAt: new Date() })
    .where(eq(assessmentAttempts.id, attemptId));
    
  return { success: true, score };
}

export async function createAssessment(subchapterId: string, title: string, passingScore: number) {
  try {
    await requireRole(["teacher"]);
    
    if (!subchapterId) throw new Error("Subchapter ID wajib diisi");
    if (!title) throw new Error("Judul asesmen wajib diisi");
    
    const newAssessment = await db.insert(assessments).values({
      subchapterId,
      title,
      passingScore: passingScore || 70,
    }).returning();
    
    return { success: true, assessmentId: newAssessment[0].id };
  } catch (error: any) {
    console.error("createAssessment error:", error);
    return { error: error.message || "Gagal membuat asesmen" };
  }
}

export async function updateAssessment(assessmentId: string, title: string, passingScore: number) {
  try {
    await requireRole(["teacher"]);
    
    if (!assessmentId) throw new Error("Assessment ID wajib diisi");
    if (!title) throw new Error("Judul asesmen wajib diisi");
    
    await db.update(assessments)
      .set({
        title,
        passingScore: passingScore || 70,
      })
      .where(eq(assessments.id, assessmentId));
      
    return { success: true };
  } catch (error: any) {
    console.error("updateAssessment error:", error);
    return { error: error.message || "Gagal memperbarui asesmen" };
  }
}

export async function createQuestion(
  assessmentId: string,
  questionText: string,
  questionType: string,
  options: any,
  correctAnswer: string,
  imageUrl: string | null
) {
  try {
    await requireRole(["teacher"]);
    
    if (!assessmentId) throw new Error("Assessment ID wajib diisi");
    if (!questionText) throw new Error("Teks pertanyaan wajib diisi");
    if (!questionType) throw new Error("Tipe pertanyaan wajib diisi");
    if (correctAnswer === undefined || correctAnswer === null || correctAnswer === "") {
      throw new Error("Kunci jawaban wajib diisi");
    }
    
    const newQuestion = await db.insert(questions).values({
      assessmentId,
      questionText,
      questionType,
      options: options || null,
      correctAnswer,
      imageUrl,
    }).returning();
    
    return { success: true, questionId: newQuestion[0].id };
  } catch (error: any) {
    console.error("createQuestion error:", error);
    return { error: error.message || "Gagal membuat pertanyaan" };
  }
}

export async function updateQuestion(
  questionId: string,
  questionText: string,
  questionType: string,
  options: any,
  correctAnswer: string,
  imageUrl: string | null
) {
  try {
    await requireRole(["teacher"]);
    
    if (!questionId) throw new Error("Question ID wajib diisi");
    if (!questionText) throw new Error("Teks pertanyaan wajib diisi");
    if (!questionType) throw new Error("Tipe pertanyaan wajib diisi");
    if (correctAnswer === undefined || correctAnswer === null || correctAnswer === "") {
      throw new Error("Kunci jawaban wajib diisi");
    }
    
    await db.update(questions)
      .set({
        questionText,
        questionType,
        options: options || null,
        correctAnswer,
        imageUrl,
      })
      .where(eq(questions.id, questionId));
      
    return { success: true };
  } catch (error: any) {
    console.error("updateQuestion error:", error);
    return { error: error.message || "Gagal memperbarui pertanyaan" };
  }
}

export async function deleteQuestion(questionId: string) {
  try {
    await requireRole(["teacher"]);
    
    if (!questionId) throw new Error("Question ID wajib diisi");
    
    await db.delete(questions).where(eq(questions.id, questionId));
    
    return { success: true };
  } catch (error: any) {
    console.error("deleteQuestion error:", error);
    return { error: error.message || "Gagal menghapus pertanyaan" };
  }
}

export async function getQuestionsForTeacher(assessmentId: string) {
  await requireRole(["teacher"]);
  
  if (!assessmentId) throw new Error("Assessment ID wajib diisi");
  
  return db.select().from(questions).where(eq(questions.assessmentId, assessmentId));
}

export async function getAssessmentsWithQuestionCount() {
  await requireRole(["teacher"]);
  
  const allAssessments = await db.select().from(assessments);
  const allQuestions = await db.select({ id: questions.id, assessmentId: questions.assessmentId }).from(questions);
  
  return allAssessments.map(a => ({
    ...a,
    questionCount: allQuestions.filter(q => q.assessmentId === a.id).length
  }));
}
