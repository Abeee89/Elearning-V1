"use client";

import { useState } from "react";
import { startAttempt, submitAnswers } from "@/actions/assessments";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";

interface Question {
  id: string;
  questionText: string;
  questionType: string;
  options: any;
}

interface AssessmentData {
  id: string;
  title: string;
  passingScore: number;
  questions: Question[];
}

export function AssessmentRunner({ assessment }: { assessment: AssessmentData }) {
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number, passed: boolean } | null>(null);

  const handleStart = async () => {
    try {
      const res = await startAttempt(assessment.id);
      if (res.success) {
        setAttemptId(res.attemptId);
      }
    } catch (e) {
      console.error(e);
      alert("Gagal memulai asesmen");
    }
  };

  const handleOptionSelect = (questionId: string, optionValue: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionValue
    }));
  };

  const handleSubmit = async () => {
    if (!attemptId) return;
    
    // Check if all questions answered
    if (Object.keys(answers).length < assessment.questions.length) {
      if (!confirm("Masih ada pertanyaan yang belum dijawab. Yakin ingin mengumpulkan?")) {
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const formattedAnswers = Object.entries(answers).map(([qId, ans]) => ({
        questionId: qId,
        answer: ans
      }));
      
      const res = await submitAnswers(attemptId, formattedAnswers);
      if (res.success) {
        setResult({
          score: res.score,
          passed: res.score >= assessment.passingScore
        });
      }
    } catch (e) {
      console.error(e);
      alert("Gagal mengumpulkan jawaban");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (result) {
    return (
      <Card className="max-w-2xl mx-auto bg-black/40 border-white/10 backdrop-blur-sm mt-8">
        <CardContent className="pt-10 pb-8 text-center flex flex-col items-center">
          {result.passed ? (
            <CheckCircle2 className="w-20 h-20 text-trace-teal mb-4" />
          ) : (
            <AlertCircle className="w-20 h-20 text-red-500 mb-4" />
          )}
          
          <h2 className="text-3xl font-space-grotesk text-white mb-2">
            {result.passed ? "Selamat, Anda Lulus!" : "Anda Belum Lulus"}
          </h2>
          
          <div className="text-5xl font-bold font-jetbrains-mono my-6 text-white">
            {result.score} <span className="text-xl text-gray-500">/ 100</span>
          </div>
          
          <p className="text-gray-400 mb-8 font-inter">
            Batas kelulusan untuk asesmen ini adalah {assessment.passingScore}.
          </p>
          
          <div className="flex justify-center gap-4 mt-6">
             <Link 
                href="/asesmen"
                className={buttonVariants({ variant: "outline", className: "border-trace-teal text-trace-teal" })}
             >
                Kembali ke Daftar
             </Link>
             {result.passed && (
               <Link 
                  href="/evaluasi"
                  className={buttonVariants({ className: "bg-trace-teal text-black hover:bg-trace-teal/90" })}
               >
                 Lihat Evaluasi AI
               </Link>
             )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!attemptId) {
    return (
      <Card className="max-w-2xl mx-auto bg-black/40 border-white/10 backdrop-blur-sm mt-8">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-space-grotesk text-white">Mulai Asesmen</CardTitle>
        </CardHeader>
        <CardContent className="text-center pt-4">
          <p className="text-gray-300 font-inter mb-6">
            Anda akan memulai <strong>{assessment.title}</strong>.<br/>
            Terdapat {assessment.questions.length} pertanyaan dengan batas kelulusan {assessment.passingScore}.
          </p>
          <Button size="lg" onClick={handleStart} className="bg-trace-teal text-black hover:bg-trace-teal/80 w-full sm:w-auto px-10">
            Mulai Sekarang
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-8 space-y-8">
      {assessment.questions.map((q, index) => (
        <Card key={q.id} className="bg-white/5 border-white/10">
          <CardHeader>
            <div className="flex gap-4">
              <span className="font-jetbrains-mono font-bold text-trace-teal bg-trace-teal/10 w-8 h-8 flex items-center justify-center rounded-full shrink-0">
                {index + 1}
              </span>
              <CardTitle className="text-lg font-inter text-white leading-relaxed">
                {q.questionText}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pl-16">
            {q.questionType === 'multiple_choice' && Array.isArray(q.options) && (
              <div className="space-y-3">
                {q.options.map((opt: any) => (
                  <label key={opt.id || opt.value || opt} className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${answers[q.id] === (opt.value || opt) ? 'border-trace-teal bg-trace-teal/5' : 'border-white/10 hover:border-white/30'}`}>
                    <input 
                      type="radio" 
                      name={`q_${q.id}`} 
                      value={opt.value || opt}
                      checked={answers[q.id] === (opt.value || opt)}
                      onChange={() => handleOptionSelect(q.id, opt.value || opt)}
                      className="w-4 h-4 text-trace-teal bg-black border-white/30 focus:ring-trace-teal focus:ring-2"
                    />
                    <span className="ml-3 text-white/90 font-inter">{opt.label || opt.value || opt}</span>
                  </label>
                ))}
              </div>
            )}
            
            {q.questionType === 'true_false' && (
              <div className="flex gap-4">
                 <Button 
                   variant="outline" 
                   className={`flex-1 ${answers[q.id] === 'true' ? 'border-trace-teal bg-trace-teal/10 text-trace-teal' : 'border-white/20 text-white hover:bg-white/10'}`}
                   onClick={() => handleOptionSelect(q.id, 'true')}
                 >
                   Benar
                 </Button>
                 <Button 
                   variant="outline" 
                   className={`flex-1 ${answers[q.id] === 'false' ? 'border-trace-teal bg-trace-teal/10 text-trace-teal' : 'border-white/20 text-white hover:bg-white/10'}`}
                   onClick={() => handleOptionSelect(q.id, 'false')}
                 >
                   Salah
                 </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-end pt-4 pb-12">
        <Button 
          size="lg" 
          onClick={handleSubmit} 
          disabled={isSubmitting}
          className="bg-trace-teal text-black hover:bg-trace-teal/80 w-full sm:w-auto px-12"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
          {isSubmitting ? "Mengumpulkan..." : "Kumpulkan Jawaban"}
        </Button>
      </div>
    </div>
  );
}
