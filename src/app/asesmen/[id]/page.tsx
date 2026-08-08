import { getAssessmentWithQuestions } from "@/actions/assessments";
import { checkCanGenerateEvaluation } from "@/actions/evaluations";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AssessmentRunner } from "@/components/AssessmentRunner";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/Navbar";

export default async function AssessmentDetailPage(
  props: { 
    params: Promise<{ id: string }>;
    searchParams: Promise<{ classId?: string }>;
  }
) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const classId = searchParams.classId;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const canGenerate = await checkCanGenerateEvaluation();
  
  try {
    const assessment = await getAssessmentWithQuestions(params.id);
    
    return (
      <div className="min-h-screen bg-bg-base bg-schematic-grid text-white flex flex-col font-sans">
        <Navbar user={session.user} canGenerateEvaluation={canGenerate} />
        
        <div className="flex-grow container mx-auto py-8 px-4 max-w-4xl">
          <div className="mb-4">
            <Link href={classId ? `/asesmen?classId=${classId}` : "/asesmen"} className="text-trace-teal hover:text-white flex items-center text-sm w-max transition-colors font-jetbrains-mono">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Kembali ke Daftar Asesmen
            </Link>
          </div>
          
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-1 bg-trace-teal rounded-full shadow-[0_0_8px_#4FD1C5]"></div>
            <h1 className="text-3xl font-bold font-space-grotesk tracking-tight text-white">
              {assessment.title}
            </h1>
          </div>
          
          <AssessmentRunner assessment={assessment} classId={classId} />
        </div>
      </div>
    );
  } catch (error) {
    notFound();
  }
}
