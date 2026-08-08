import { getAssessments } from "@/actions/assessments";
import { checkCanGenerateEvaluation } from "@/actions/evaluations";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { ClipboardList, ChevronRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";

export default async function AsesmenPage(
  props: { searchParams: Promise<{ classId?: string }> }
) {
  const searchParams = await props.searchParams;
  const classId = searchParams.classId;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const canGenerate = await checkCanGenerateEvaluation();
  const assessments = await getAssessments();

  return (
    <div className="min-h-screen bg-bg-base bg-schematic-grid text-white flex flex-col font-sans">
      <Navbar user={session.user} canGenerateEvaluation={canGenerate} />
      
      <div className="flex-grow container mx-auto py-10 px-4 max-w-4xl">
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
          <div className="h-10 w-1 bg-trace-teal rounded-full shadow-[0_0_8px_#4FD1C5]"></div>
          <h1 className="text-4xl font-bold font-space-grotesk tracking-tight text-white">
            Asesmen & Kuis
          </h1>
        </div>
        
        <p className="text-text-muted font-inter mb-10 max-w-2xl leading-relaxed">
          Uji pemahaman Anda dengan mengerjakan asesmen yang tersedia. Nilai akan disimpan untuk melacak perkembangan belajar Anda.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assessments.map((assessment) => (
            <Card key={assessment.id} className="bg-bg-panel border-grid-line hover:border-trace-teal/50 transition-all group trace-border relative overflow-hidden">
              <span className="trace-card-accent"></span>
              <CardHeader>
                <div className="flex items-center justify-between">
                   <CardTitle className="text-xl font-space-grotesk text-white group-hover:text-trace-teal transition-colors">
                     {assessment.title}
                   </CardTitle>
                   <ClipboardList className="w-5 h-5 text-trace-teal/70 group-hover:text-trace-teal transition-colors" />
                </div>
                <CardDescription className="text-text-muted mt-2 font-inter leading-relaxed">
                  Terkait dengan materi: <span className="text-white/80 font-medium">{assessment.subchapterTitle}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm font-instrument text-text-muted">
                    Passing Score: <span className="text-white font-bold">{assessment.passingScore}</span>
                  </div>
                  <Link href={`/asesmen/${assessment.id}${classId ? `?classId=${classId}` : ""}`}>
                    <Button size="sm" className="bg-trace-teal text-black hover:bg-trace-teal/90 font-bold font-space-grotesk shadow-[0_0_10px_rgba(79,209,197,0.2)]">
                      Mulai Kerjakan
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
          {assessments.length === 0 && (
            <div className="col-span-full border border-grid-line border-dashed p-8 text-center rounded-xl bg-bg-panel text-text-muted font-inter">
              Belum ada asesmen yang tersedia saat ini.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
