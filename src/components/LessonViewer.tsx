"use client";

import { FileText, Video, BookOpen, ExternalLink } from "lucide-react";
import { Button, buttonVariants } from "./ui/button";

interface Subchapter {
  id: string;
  title: string;
  contentType: string;
  contentUrl: string | null;
  contentBody: string | null;
}

export function LessonViewer({ subchapter }: { subchapter: Subchapter }) {
  if (subchapter.contentType === "video") {
    return (
      <div className="space-y-4">
        <div className="aspect-video bg-black rounded-lg overflow-hidden border border-white/10 relative shadow-lg">
          {subchapter.contentUrl ? (
            <iframe 
              src={subchapter.contentUrl} 
              className="w-full h-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            ></iframe>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 flex-col gap-2">
              <Video className="w-12 h-12 opacity-20" />
              <p>Video URL tidak tersedia</p>
            </div>
          )}
        </div>
        {subchapter.contentBody && (
          <div className="prose prose-invert max-w-none mt-8 p-6 bg-white/5 rounded-lg border border-white/10 font-inter">
            <h3 className="text-xl font-bold mb-4 font-space-grotesk text-white">Catatan Materi</h3>
            <div dangerouslySetInnerHTML={{ __html: subchapter.contentBody }} />
          </div>
        )}
      </div>
    );
  }

  if (subchapter.contentType === "pdf") {
    return (
      <div className="space-y-4">
        <div className="h-[600px] bg-black/50 rounded-lg overflow-hidden border border-white/10 relative shadow-lg flex flex-col items-center justify-center">
          {subchapter.contentUrl ? (
            <iframe src={subchapter.contentUrl} className="w-full h-full border-none"></iframe>
          ) : (
            <div className="text-gray-500 flex flex-col items-center gap-2">
              <FileText className="w-12 h-12 opacity-20" />
              <p>Dokumen PDF tidak tersedia</p>
            </div>
          )}
        </div>
        {subchapter.contentUrl && (
          <div className="flex justify-end mt-4">
             <a 
               href={subchapter.contentUrl} 
               target="_blank" 
               rel="noreferrer"
               className={buttonVariants({ variant: "outline", className: "border-trace-teal text-trace-teal hover:bg-trace-teal hover:text-black" })}
             >
                <ExternalLink className="w-4 h-4 mr-2" />
                Buka di Tab Baru
             </a>
          </div>
        )}
      </div>
    );
  }

  // default to text
  return (
    <div className="space-y-6">
      <div className="prose prose-invert max-w-none p-8 bg-black/40 rounded-lg border border-white/10 font-inter shadow-lg backdrop-blur-sm">
        {subchapter.contentBody ? (
          <div className="font-jetbrains-mono leading-relaxed" dangerouslySetInnerHTML={{ __html: subchapter.contentBody }} />
        ) : (
          <div className="flex items-center justify-center py-20 text-gray-500 flex-col gap-3">
             <BookOpen className="w-12 h-12 opacity-20" />
             <p>Konten teks belum tersedia.</p>
          </div>
        )}
      </div>
    </div>
  );
}
