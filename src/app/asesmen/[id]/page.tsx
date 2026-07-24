import { getAssessmentWithQuestions } from "@/actions/assessments";
import { AssessmentRunner } from "@/components/AssessmentRunner";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function AssessmentDetailPage(
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  
  try {
    const assessment = await getAssessmentWithQuestions(params.id);
    
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="mb-4">
          <Link href="/asesmen" className="text-trace-teal hover:text-white flex items-center text-sm w-max transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Kembali ke Daftar Asesmen
          </Link>
        </div>
        
        <div className="flex items-center gap-3 mb-2">
          <div className="h-8 w-1 bg-trace-teal rounded-full"></div>
          <h1 className="text-3xl font-bold font-space-grotesk tracking-tight text-white">
            {assessment.title}
          </h1>
        </div>
        
        <AssessmentRunner assessment={assessment} />
      </div>
    );
  } catch (error) {
    notFound();
  }
}
