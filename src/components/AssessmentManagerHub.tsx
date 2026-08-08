"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createAssessment, updateAssessment } from "@/actions/assessments";
import { ChevronDown, ChevronRight, PenTool, Plus, BookOpen, Settings, AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Subchapter {
  id: string;
  chapterId: string;
  title: string;
  orderIndex: number;
}

interface Chapter {
  id: string;
  title: string;
  orderIndex: number;
  subchapters: Subchapter[];
}

interface Assessment {
  id: string;
  subchapterId: string;
  title: string;
  passingScore: number;
  questionCount?: number;
}

export function AssessmentManagerHub({
  classId,
  chapters,
  initialAssessments,
}: {
  classId: string;
  chapters: Chapter[];
  initialAssessments: Assessment[];
}) {
  const [assessments, setAssessments] = useState<Assessment[]>(initialAssessments);
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>(
    chapters.reduce((acc, chap, idx) => ({ ...acc, [chap.id]: idx === 0 }), {})
  );
  
  // States for creating/editing assessment
  const [activeForm, setActiveForm] = useState<{
    type: "create" | "edit";
    subchapterId: string;
    assessmentId?: string;
  } | null>(null);

  const [formTitle, setFormTitle] = useState("");
  const [formPassingScore, setFormPassingScore] = useState(70);
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };

  const handleOpenCreate = (subchapterId: string, subchapterTitle: string) => {
    setFormError(null);
    setFormTitle(`Asesmen: ${subchapterTitle}`);
    setFormPassingScore(70);
    setActiveForm({ type: "create", subchapterId });
  };

  const handleOpenEdit = (assessment: Assessment) => {
    setFormError(null);
    setFormTitle(assessment.title);
    setFormPassingScore(assessment.passingScore);
    setActiveForm({ type: "edit", subchapterId: assessment.subchapterId, assessmentId: assessment.id });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setFormError("Judul asesmen tidak boleh kosong");
      return;
    }
    setFormError(null);

    startTransition(async () => {
      if (activeForm?.type === "create") {
        const res = await createAssessment(activeForm.subchapterId, formTitle, formPassingScore);
        if (res.error) {
          setFormError(res.error);
        } else if (res.success && res.assessmentId) {
          setAssessments((prev) => [
            ...prev,
            {
              id: res.assessmentId!,
              subchapterId: activeForm.subchapterId,
              title: formTitle,
              passingScore: formPassingScore,
              questionCount: 0,
            },
          ]);
          setActiveForm(null);
          router.refresh();
        }
      } else if (activeForm?.type === "edit" && activeForm.assessmentId) {
        const res = await updateAssessment(activeForm.assessmentId, formTitle, formPassingScore);
        if (res.error) {
          setFormError(res.error);
        } else if (res.success) {
          setAssessments((prev) =>
            prev.map((a) =>
              a.id === activeForm.assessmentId
                ? { ...a, title: formTitle, passingScore: formPassingScore }
                : a
            )
          );
          setActiveForm(null);
          router.refresh();
        }
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Form overlay/card */}
      {activeForm && (
        <Card className="bg-black/80 border-trace-teal/30 backdrop-blur-md shadow-[0_0_25px_rgba(45,212,191,0.15)] max-w-lg mx-auto">
          <CardHeader>
            <CardTitle className="text-xl font-space-grotesk text-white">
              {activeForm.type === "create" ? "Buat Asesmen Baru" : "Edit Pengaturan Asesmen"}
            </CardTitle>
          </CardHeader>
          <form onSubmit={handleFormSubmit}>
            <CardContent className="space-y-4">
              {formError && (
                <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/30 p-3 rounded-md flex items-center gap-2 font-inter">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {formError}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-gray-300 font-inter">Judul Asesmen</Label>
                <Input
                  id="title"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="bg-black/50 border-white/10 focus-visible:ring-trace-teal text-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="passingScore" className="text-gray-300 font-inter">Kriteria Kelulusan (Passing Score: 0 - 100)</Label>
                <Input
                  id="passingScore"
                  type="number"
                  min="0"
                  max="100"
                  value={formPassingScore}
                  onChange={(e) => setFormPassingScore(parseInt(e.target.value) || 0)}
                  className="bg-black/50 border-white/10 focus-visible:ring-trace-teal text-white font-jetbrains-mono"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="border-white/10 text-gray-400 hover:text-white"
                  onClick={() => setActiveForm(null)}
                  disabled={isPending}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="bg-trace-teal text-black hover:bg-trace-teal/80 font-bold"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan"
                  )}
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      )}

      {/* Chapters & Subchapters List */}
      <div className="space-y-4">
        {chapters.map((chapter) => {
          const isExpanded = expandedChapters[chapter.id];
          return (
            <Card key={chapter.id} className="bg-white/5 border-white/10 overflow-hidden backdrop-blur-sm">
              <button
                className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors text-left"
                onClick={() => toggleChapter(chapter.id)}
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-trace-teal" />
                  <h3 className="font-space-grotesk font-bold text-lg text-white">
                    Bab {chapter.orderIndex}: {chapter.title}
                  </h3>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {isExpanded && (
                <div className="border-t border-white/10 bg-black/20 divide-y divide-white/5">
                  {chapter.subchapters.map((sub) => {
                    const assessment = assessments.find((a) => a.subchapterId === sub.id);
                    return (
                      <div
                        key={sub.id}
                        className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <h4 className="font-inter font-medium text-white">
                            {chapter.orderIndex}.{sub.orderIndex} {sub.title}
                          </h4>
                          {assessment ? (
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-jetbrains-mono text-gray-400">
                              <span>
                                Asesmen: <strong className="text-trace-teal">{assessment.title}</strong>
                              </span>
                              <span>•</span>
                              <span>
                                KKM: <strong className="text-white">{assessment.passingScore}</strong>
                              </span>
                              {assessment.questionCount !== undefined && (
                                <>
                                  <span>•</span>
                                  <span>
                                    Jumlah Soal: <strong className="text-white">{assessment.questionCount}</strong>
                                  </span>
                                </>
                              )}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-500 font-inter">Belum ada asesmen untuk sub-bab ini</p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 self-end md:self-center">
                          {assessment ? (
                            <>
                              <Link
                                href={`/dashboard/classes/${classId}/assessments/${assessment.id}`}
                              >
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-trace-teal/50 text-trace-teal hover:bg-trace-teal hover:text-black font-semibold flex items-center gap-1"
                                >
                                  <PenTool className="w-3.5 h-3.5" />
                                  Kelola Soal
                                </Button>
                              </Link>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-white/10 text-gray-400 hover:text-white flex items-center gap-1"
                                onClick={() => handleOpenEdit(assessment)}
                              >
                                <Settings className="w-3.5 h-3.5" />
                                Pengaturan
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              className="bg-trace-teal/10 hover:bg-trace-teal text-trace-teal hover:text-black border border-trace-teal/30 font-semibold flex items-center gap-1"
                              onClick={() => handleOpenCreate(sub.id, sub.title)}
                            >
                              <Plus className="w-3.5 h-3.5" />
                              Buat Asesmen
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {chapter.subchapters.length === 0 && (
                    <div className="p-5 text-center text-gray-500 font-inter text-sm">
                      Belum ada sub-bab di bab ini.
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
