"use server";
import { db } from "@/db";
import { evaluations, assessmentAttempts, questions, attemptAnswers, assessments } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { requireRole } from "./auth";

export async function getStudentEvaluations() {
  const user = await requireRole(["student"]);
  return db.select().from(evaluations).where(eq(evaluations.studentId, user.id)).orderBy(desc(evaluations.generatedAt));
}

export async function generateEvaluation() {
  const user = await requireRole(["student"]);
  
  // Get all attempts for this student
  const attempts = await db.select({
    score: assessmentAttempts.score,
    completedAt: assessmentAttempts.completedAt,
    assessmentTitle: assessments.title,
  })
  .from(assessmentAttempts)
  .innerJoin(assessments, eq(assessmentAttempts.assessmentId, assessments.id))
  .where(eq(assessmentAttempts.studentId, user.id))
  .orderBy(desc(assessmentAttempts.completedAt));
  
  if (attempts.length === 0) {
    return { error: "Belum ada data asesmen untuk dievaluasi." };
  }
  
  // Format data for AI
  const historyText = attempts.map(a => `- ${a.assessmentTitle}: Skor ${a.score}`).join("\n");
  
  const prompt = `
    Anda adalah asisten AI untuk platform pembelajaran elektronika. Evaluasi perkembangan belajar siswa berikut berdasarkan riwayat asesmennya.
    
    Riwayat Asesmen:
    ${historyText}
    
    Berikan respons dalam format JSON persis seperti berikut tanpa tambahan teks apapun:
    {
      "strengths": "Kekuatan siswa (1-2 kalimat)",
      "weaknesses": "Kelemahan atau area yang perlu diperbaiki (1-2 kalimat)",
      "recommendations": "Saran belajar selanjutnya (1-2 kalimat)"
    }
  `;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "nvidia/nemotron-3-super-120b-a12b:free",
        response_format: { type: "json_object" },
        messages: [
          { role: "user", content: prompt }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const data = await response.json();
    const resultContent = data.choices[0].message.content;
    const parsed = JSON.parse(resultContent);
    
    const newEvaluation = await db.insert(evaluations).values({
      studentId: user.id,
      strengths: parsed.strengths || "Belum dapat diidentifikasi",
      weaknesses: parsed.weaknesses || "Belum dapat diidentifikasi",
      recommendations: parsed.recommendations || "Terus tingkatkan belajarmu",
    }).returning();
    
    return { success: true, evaluation: newEvaluation[0] };
    
  } catch (error: any) {
    console.error("AI Evaluation Error:", error);
    return { error: "Gagal menghasilkan evaluasi AI saat ini." };
  }
}

export async function checkCanGenerateEvaluation(): Promise<boolean> {
  try {
    const user = await requireRole(["student"]);
    const attempts = await db.select({ id: assessmentAttempts.id })
      .from(assessmentAttempts)
      .where(eq(assessmentAttempts.studentId, user.id))
      .limit(1);
    return attempts.length > 0;
  } catch (e) {
    return false;
  }
}
