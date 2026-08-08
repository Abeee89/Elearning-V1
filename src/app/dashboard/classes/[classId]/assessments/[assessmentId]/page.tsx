import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { getQuestionsForTeacher } from "@/actions/assessments";
import { getClassById } from "@/actions/classes";
import { db } from "@/db";
import { assessments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { QuestionManager } from "@/components/QuestionManager";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function AssessmentQuestionsPage(
  props: { 
    params: Promise<{ classId: string; assessmentId: string }> 
  }
) {
  const params = await props.params;
  const session = await auth();
  if (!session?.user || session.user.role !== "teacher") {
    redirect("/login");
  }

  const [classData, assessmentResult, questions] = await Promise.all([
    getClassById(params.classId),
    db.select().from(assessments).where(eq(assessments.id, params.assessmentId)).limit(1),
    getQuestionsForTeacher(params.assessmentId),
  ]);

  if (!classData || !assessmentResult.length) {
    notFound();
  }

  const assessment = assessmentResult[0];

  return (
    <div className="min-h-screen bg-black/95 p-8 text-white">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Navigation & Header */}
        <div className="space-y-4">
          <Link
            href={`/dashboard/classes/${params.classId}/assessments`}
            className="text-trace-teal text-sm hover:underline flex items-center gap-1 font-jetbrains-mono w-max transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Manajemen Asesmen
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <h1 className="text-3xl font-space-grotesk font-bold text-white tracking-tight">
                Kelola Soal Asesmen
              </h1>
              <p className="text-gray-400 font-inter mt-1">
                Asesmen: <strong className="text-trace-teal">{assessment.title}</strong>
              </p>
            </div>
            <div className="text-xs text-gray-500 font-jetbrains-mono bg-white/5 border border-white/10 px-3 py-1.5 rounded w-max">
              KKM Kelulusan: {assessment.passingScore}
            </div>
          </div>
        </div>

        {/* Question Manager UI */}
        <QuestionManager
          classId={params.classId}
          assessmentId={params.assessmentId}
          assessmentTitle={assessment.title}
          initialQuestions={questions}
        />

      </div>
    </div>
  );
}
