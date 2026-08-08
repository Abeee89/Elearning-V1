import { getSubchapterById, getMaterialTree } from "@/actions/materials";
import { getStudentProgress, updateLearningProgress } from "@/actions/progress";
import { checkCanGenerateEvaluation } from "@/actions/evaluations";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { LessonViewer } from "@/components/LessonViewer";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { SubchapterSidebar } from "@/components/SubchapterSidebar";

export default async function SubchapterPage(
  props: {
    params: Promise<{ chapterId: string; subchapterId: string }>;
    searchParams: Promise<{ classId?: string }>;
  }
) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const classId = searchParams.classId;
  
  const session = await auth();
  if (!session?.user) redirect("/login");

  const subchapter = await getSubchapterById(params.subchapterId);
  
  if (!subchapter || subchapter.chapterId !== params.chapterId) {
    notFound();
  }

  // Auto-mark as in_progress when opened by a student
  if (session.user.role === "student") {
    await updateLearningProgress(subchapter.id, "in_progress");
  }

  const canGenerate = await checkCanGenerateEvaluation();
  const progress = await getStudentProgress();
  const materialTree = await getMaterialTree();
  const currentChapter = materialTree.find(c => c.id === params.chapterId);
  
  // Find prev/next
  let prevSub = null;
  let nextSub = null;

  if (currentChapter) {
    const currentIndex = currentChapter.subchapters.findIndex(s => s.id === subchapter.id);
    if (currentIndex > 0) prevSub = currentChapter.subchapters[currentIndex - 1];
    if (currentIndex < currentChapter.subchapters.length - 1) nextSub = currentChapter.subchapters[currentIndex + 1];
  }

  return (
    <div className="min-h-screen bg-bg-base bg-schematic-grid text-white flex flex-col font-sans">
      <Navbar user={session.user} canGenerateEvaluation={canGenerate} />
      
      <div className="flex-grow flex flex-col md:flex-row max-w-7xl mx-auto w-full p-4 sm:p-8 gap-6">
        
        {/* Subchapter Navigation Sidebar */}
        {currentChapter && (
          <SubchapterSidebar 
            subchapters={currentChapter.subchapters}
            currentSubchapterId={subchapter.id}
            studentProgress={progress}
            chapterId={params.chapterId}
            chapterTitle={currentChapter.title}
            classId={classId}
          />
        )}
        
        {/* Main Lesson Content Area */}
        <div className="flex-grow flex-1 min-w-0">
          <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <Link 
                href={classId ? `/materi?classId=${classId}` : "/materi"} 
                className="text-trace-teal hover:text-white flex items-center text-sm mb-4 transition-colors w-max font-jetbrains-mono"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Kembali ke Daftar Materi
              </Link>
              <div className="flex flex-wrap items-center gap-3">
                 <div className="text-xs font-bold bg-white/10 text-gray-300 px-3 py-1 rounded-full font-jetbrains-mono tracking-widest uppercase border border-grid-line">
                    BAB {currentChapter?.orderIndex}
                 </div>
                 <h1 className="text-2xl sm:text-3xl font-bold font-space-grotesk text-white">
                    {subchapter.title}
                 </h1>
              </div>
            </div>
          </div>

          <LessonViewer subchapter={subchapter} />

          <div className="mt-12 pt-8 border-t border-grid-line flex flex-col sm:flex-row items-center justify-between gap-4">
            {prevSub ? (
              <Link 
                href={`/materi/${currentChapter?.id}/${prevSub.id}${classId ? `?classId=${classId}` : ""}`}
                className={buttonVariants({ variant: "outline", className: "bg-black/50 border-grid-line text-white hover:bg-white/10 w-full sm:w-auto font-space-grotesk" })}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                <span className="truncate max-w-[200px]">Sebelumnya: {prevSub.title}</span>
              </Link>
            ) : <div className="hidden sm:block"></div>}

            {nextSub && (
              <Link 
                href={`/materi/${currentChapter?.id}/${nextSub.id}${classId ? `?classId=${classId}` : ""}`}
                className={buttonVariants({ className: "bg-trace-teal text-black hover:bg-trace-teal/90 w-full sm:w-auto font-bold font-space-grotesk shadow-[0_0_15px_rgba(79,209,197,0.3)]" })}
              >
                <span className="truncate max-w-[200px]">Selanjutnya: {nextSub.title}</span>
                <ChevronRight className="w-4 h-4 ml-2" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
