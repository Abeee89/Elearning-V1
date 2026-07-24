import { getMaterialTree } from "@/actions/materials";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { BookOpen, FileText, Video, PlayCircle } from "lucide-react";

export default async function MateriPage() {
  const materialTree = await getMaterialTree();

  const getIcon = (type: string) => {
    switch(type) {
      case 'video': return <Video className="w-4 h-4 mr-2" />;
      case 'pdf': return <FileText className="w-4 h-4 mr-2" />;
      default: return <BookOpen className="w-4 h-4 mr-2" />;
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-1 bg-trace-teal rounded-full"></div>
        <h1 className="text-4xl font-bold font-space-grotesk tracking-tight text-white">
          Materi Pembelajaran
        </h1>
      </div>
      
      <div className="space-y-12">
        {materialTree.map((chapter) => (
          <div key={chapter.id} className="relative">
            <div className="absolute left-[15px] top-10 bottom-[-40px] w-0.5 bg-white/10 md:block hidden z-0"></div>
            
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-4 relative z-10">
              <span className="bg-trace-teal text-black w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-[0_0_15px_rgba(45,212,191,0.5)]">
                {chapter.orderIndex}
              </span>
              {chapter.title}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-0 md:ml-12 relative z-10">
              {chapter.subchapters.map((sub) => (
                <Link key={sub.id} href={`/materi/${chapter.id}/${sub.id}`}>
                  <Card className="hover:border-trace-teal/50 hover:bg-trace-teal/5 transition-all cursor-pointer h-full border-white/10 bg-black/40 backdrop-blur-sm group">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-space-grotesk text-white/90 group-hover:text-trace-teal transition-colors line-clamp-2">
                        {sub.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center text-sm text-gray-400 font-jetbrains-mono">
                        <span className="flex items-center bg-white/5 px-3 py-1.5 rounded-md text-xs border border-white/5 group-hover:border-trace-teal/30 transition-colors">
                          {getIcon(sub.contentType)}
                          {sub.contentType.toUpperCase()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
              {chapter.subchapters.length === 0 && (
                <div className="text-gray-500 italic text-sm py-4">Belum ada materi di bab ini.</div>
              )}
            </div>
          </div>
        ))}
        {materialTree.length === 0 && (
          <div className="text-gray-400 border border-white/10 p-8 text-center rounded-lg bg-white/5">
            Belum ada bab materi yang tersedia.
          </div>
        )}
      </div>
    </div>
  );
}
