import { getStudentEvaluations } from "@/actions/evaluations";
import { EvaluationClient } from "@/components/EvaluationClient";

export default async function EvaluasiPage() {
  const evaluations = await getStudentEvaluations();

  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl">
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
