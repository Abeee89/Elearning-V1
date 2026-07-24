import { getAssessments } from "@/actions/assessments";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { ClipboardList, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function AsesmenPage() {
  const assessments = await getAssessments();

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-1 bg-trace-teal rounded-full"></div>
        <h1 className="text-4xl font-bold font-space-grotesk tracking-tight text-white">
          Asesmen & Kuis
        </h1>
      </div>
      
      <p className="text-gray-400 font-inter mb-10 max-w-2xl leading-relaxed">
        Uji pemahaman Anda dengan mengerjakan asesmen yang tersedia. Nilai akan disimpan untuk melacak perkembangan belajar Anda.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {assessments.map((assessment) => (
          <Card key={assessment.id} className="bg-black/40 border-white/10 hover:border-trace-teal/50 transition-colors group">
            <CardHeader>
              <div className="flex items-center justify-between">
                 <CardTitle className="text-xl font-space-grotesk text-white">
                   {assessment.title}
                 </CardTitle>
                 <ClipboardList className="w-5 h-5 text-trace-teal/70 group-hover:text-trace-teal transition-colors" />
              </div>
              <CardDescription className="text-gray-400 mt-2">
                Terkait dengan materi: <span className="text-white/80">{assessment.subchapterTitle}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm font-jetbrains-mono text-gray-500">
                  Passing Score: <span className="text-white">{assessment.passingScore}</span>
                </div>
                <Link href={`/asesmen/${assessment.id}`}>
                  <Button size="sm" className="bg-trace-teal text-black hover:bg-trace-teal/80">
                    Mulai Kerjakan
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
        {assessments.length === 0 && (
          <div className="col-span-full border border-white/10 p-8 text-center rounded-lg bg-white/5 text-gray-400">
            Belum ada asesmen yang tersedia saat ini.
          </div>
        )}
      </div>
    </div>
  );
}
