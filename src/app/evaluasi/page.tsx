import { getStudentEvaluations } from "@/actions/evaluations";
import { EvaluationClient } from "@/components/EvaluationClient";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EvaluasiPage(
  props: { searchParams: Promise<{ classId?: string }> }
) {
  const searchParams = await props.searchParams;
  const classId = searchParams.classId;
  const evaluations = await getStudentEvaluations();

  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl">
      <div className="mb-6">
        <Link 
          href={classId ? `/dashboard/classes/${classId}` : "/dashboard"} 
          className="text-trace-teal hover:text-white flex items-center text-sm w-max transition-colors font-jetbrains-mono"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Kembali ke {classId ? "Kelas" : "Dashboard"}
        </Link>
      </div>

      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-1 bg-trace-teal rounded-full"></div>
        <h1 className="text-4xl font-bold font-space-grotesk tracking-tight text-white">
          Evaluasi AI
        </h1>
      </div>
      
      <p className="text-gray-400 font-inter mb-10 max-w-2xl leading-relaxed">
        Lihat analisis perkembangan belajar Anda yang digenerate secara otomatis oleh sistem AI kami berdasarkan hasil asesmen yang telah Anda kerjakan.
      </p>

      <EvaluationClient initialEvaluations={evaluations} />
    </div>
  );
}
