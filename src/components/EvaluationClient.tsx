"use client";

import { useState } from "react";
import { generateEvaluation } from "@/actions/evaluations";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BrainCircuit, Loader2, Target, TrendingUp, AlertTriangle } from "lucide-react";

export function EvaluationClient({ initialEvaluations }: { initialEvaluations: any[] }) {
  const [evaluations, setEvaluations] = useState(initialEvaluations);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await generateEvaluation();
      if (res.success && res.evaluation) {
        setEvaluations([res.evaluation, ...evaluations]);
      } else {
        alert(res.error || "Gagal membuat evaluasi");
      }
    } catch (e) {
      console.error(e);
      alert("Terjadi kesalahan sistem.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-black/40 p-6 rounded-lg border border-white/10 backdrop-blur-sm shadow-lg">
         <div>
            <h2 className="text-xl font-space-grotesk text-white font-bold flex items-center">
               <BrainCircuit className="w-6 h-6 mr-3 text-trace-teal" />
               Evaluasi AI
            </h2>
            <p className="text-sm text-gray-400 mt-1 font-inter">
               Dapatkan analisis personal mengenai perkembangan belajar Anda.
            </p>
         </div>
         <Button 
           onClick={handleGenerate} 
           disabled={isGenerating}
           className="bg-trace-teal text-black hover:bg-trace-teal/80 shadow-[0_0_15px_rgba(45,212,191,0.3)]"
         >
           {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
           {isGenerating ? "Menganalisis..." : "Generate Evaluasi Baru"}
         </Button>
      </div>

      <div className="space-y-6">
        {evaluations.map((ev) => (
          <Card key={ev.id} className="bg-white/5 border-white/10 overflow-hidden">
            <div className="h-1 bg-trace-teal w-full"></div>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-jetbrains-mono text-gray-400">
                Dievaluasi pada: {new Date(ev.generatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              <div className="space-y-3">
                 <div className="flex items-center text-trace-teal font-bold font-space-grotesk">
                    <TrendingUp className="w-5 h-5 mr-2" /> Kekuatan
                 </div>
                 <p className="text-gray-300 text-sm font-inter leading-relaxed">{ev.strengths}</p>
              </div>
              <div className="space-y-3">
                 <div className="flex items-center text-amber-500 font-bold font-space-grotesk">
                    <AlertTriangle className="w-5 h-5 mr-2" /> Area Perbaikan
                 </div>
                 <p className="text-gray-300 text-sm font-inter leading-relaxed">{ev.weaknesses}</p>
              </div>
              <div className="space-y-3">
                 <div className="flex items-center text-blue-400 font-bold font-space-grotesk">
                    <Target className="w-5 h-5 mr-2" /> Rekomendasi
                 </div>
                 <p className="text-gray-300 text-sm font-inter leading-relaxed">{ev.recommendations}</p>
              </div>
            </CardContent>
          </Card>
        ))}
        {evaluations.length === 0 && (
          <div className="text-center p-12 border border-white/10 border-dashed rounded-lg text-gray-500">
             Belum ada evaluasi. Silakan kerjakan beberapa asesmen lalu tekan tombol "Generate Evaluasi Baru".
          </div>
        )}
      </div>
    </div>
  );
}
