import { getRecommendedMaterials } from "@/actions/recommendations";
import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";
import { Button, buttonVariants } from "./ui/button";

export async function RecommendedMaterials() {
  const recommendations = await getRecommendedMaterials();
  
  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 pt-8 border-t border-border-muted dark:border-white/10">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5 text-trace-teal" />
        <h2 className="text-xl font-space-grotesk font-bold dark:text-white">Rekomendasi Belajar Selanjutnya</h2>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {recommendations.map((rec) => (
          <div key={rec.id} className="p-4 rounded-xl border border-border-muted dark:border-white/10 dark:bg-white/5 hover:border-trace-teal dark:hover:border-trace-teal transition-all flex flex-col justify-between">
            <div>
               <h3 className="font-bold font-inter text-base dark:text-white mb-2">{rec.title}</h3>
               <p className="text-xs text-text-secondary dark:text-gray-400 font-jetbrains-mono mb-4">Materi belum diselesaikan</p>
            </div>
            <Link 
              href={`/materi/${rec.chapterId}/${rec.id}`}
              className={buttonVariants({ variant: "outline", className: "w-full justify-between group border-trace-teal text-trace-teal hover:bg-trace-teal hover:text-black" })}
            >
              Mulai Belajar
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
