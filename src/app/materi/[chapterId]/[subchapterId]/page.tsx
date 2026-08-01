import { getSubchapterById, getMaterialTree } from "@/actions/materials";
import { LessonViewer } from "@/components/LessonViewer";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

export default async function SubchapterPage(
  props: {
    params: Promise<{ chapterId: string; subchapterId: string }>;
    searchParams: Promise<{ classId?: string }>;
  }
) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const classId = searchParams.classId;
  const subchapter = await getSubchapterById(params.subchapterId);
  
  if (!subchapter || subchapter.chapterId !== params.chapterId) {
    notFound();
  }

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
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link href={classId ? `/materi?classId=${classId}` : "/materi"} className="text-trace-teal hover:text-white flex items-center text-sm mb-4 transition-colors w-max">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Kembali ke Daftar Materi
          </Link>
          <div className="flex flex-wrap items-center gap-3">
             <div className="text-xs font-bold bg-white/10 text-gray-300 px-3 py-1 rounded-full font-jetbrains-mono tracking-widest uppercase">
                BAB {currentChapter?.orderIndex}
             </div>
             <h1 className="text-3xl font-bold font-space-grotesk text-white">
                {subchapter.title}
             </h1>
          </div>
        </div>
      </div>

      <LessonViewer subchapter={subchapter} />

      <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        {prevSub ? (
          <Link 
            href={`/materi/${currentChapter?.id}/${prevSub.id}${classId ? `?classId=${classId}` : ""}`}
            className={buttonVariants({ variant: "outline", className: "bg-black/50 border-white/10 text-white hover:bg-white/10 w-full sm:w-auto" })}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            <span className="truncate max-w-[200px]">Sebelumnya: {prevSub.title}</span>
          </Link>
        ) : <div className="hidden sm:block"></div>}

        {nextSub && (
          <Link 
            href={`/materi/${currentChapter?.id}/${nextSub.id}${classId ? `?classId=${classId}` : ""}`}
            className={buttonVariants({ className: "bg-trace-teal text-black hover:bg-trace-teal/80 w-full sm:w-auto" })}
          >
            <span className="truncate max-w-[200px]">Selanjutnya: {nextSub.title}</span>
            <ChevronRight className="w-4 h-4 ml-2" />
          </Link>
        )}
      </div>
    </div>
  );
}
