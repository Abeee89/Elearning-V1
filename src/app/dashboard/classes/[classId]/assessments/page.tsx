import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getMaterialTree } from "@/actions/materials";
import { getAssessmentsWithQuestionCount } from "@/actions/assessments";
import { getClassById } from "@/actions/classes";
import { AssessmentManagerHub } from "@/components/AssessmentManagerHub";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function ClassAssessmentsPage(
  props: { params: Promise<{ classId: string }> }
) {
  const params = await props.params;
  const session = await auth();
  if (!session?.user || session.user.role !== "teacher") {
    redirect("/login");
  }

  const [classData, chapters, assessments] = await Promise.all([
    getClassById(params.classId),
    getMaterialTree(),
    getAssessmentsWithQuestionCount(),
  ]);

  if (!classData) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-black/95 p-8 text-white">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Navigation & Title */}
        <div className="space-y-4">
          <Link
            href={`/dashboard/classes/${params.classId}`}
            className="text-trace-teal text-sm hover:underline flex items-center gap-1 font-jetbrains-mono w-max transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Monitoring Kelas
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <h1 className="text-3xl font-space-grotesk font-bold text-white tracking-tight">
                Kelola Asesmen & Soal
              </h1>
              <p className="text-gray-400 font-inter mt-1">
                Kelas: <strong className="text-trace-teal">{classData.name}</strong>
              </p>
            </div>
            <div className="text-xs text-gray-500 font-jetbrains-mono bg-white/5 border border-white/10 px-3 py-1.5 rounded w-max">
              ID Kelas: {params.classId}
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-trace-teal/5 border border-trace-teal/20 p-4 rounded-lg text-sm font-inter leading-relaxed text-gray-300">
          <strong className="text-trace-teal">Petunjuk:</strong> Asesmen di platform ini bersifat global untuk seluruh sub-bab materi pembelajaran. Di halaman ini Anda dapat membuat asesmen baru untuk sub-bab yang belum memilikinya, mengatur Kriteria Ketuntasan Minimal (KKM), dan masuk ke menu <strong>Kelola Soal</strong> untuk menambah atau mengedit butir-butir pertanyaan beserta kunci jawaban dan gambar ilustrasi.
        </div>

        {/* Interactive Hub Component */}
        <AssessmentManagerHub
          classId={params.classId}
          chapters={chapters}
          initialAssessments={assessments}
        />

      </div>
    </div>
  );
}
