"use client";

import { useState, useTransition, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createQuestion, updateQuestion, deleteQuestion } from "@/actions/assessments";
import { Plus, PenTool, Trash2, Image as ImageIcon, AlertCircle, Loader2, ArrowLeft, Check, Upload, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Question {
  id: string;
  assessmentId: string;
  questionText: string;
  questionType: string;
  options: any; // expects array of { value: string, label: string } for multiple choice
  correctAnswer: string;
  imageUrl: string | null;
}

export function QuestionManager({
  classId,
  assessmentId,
  assessmentTitle,
  initialQuestions,
}: {
  classId: string;
  assessmentId: string;
  assessmentTitle: string;
  initialQuestions: Question[];
}) {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Form states
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [questionText, setQuestionText] = useState("");
  const [questionType, setQuestionType] = useState("multiple_choice");
  
  // Multiple Choice options
  const [optA, setOptA] = useState("");
  const [optB, setOptB] = useState("");
  const [optC, setOptC] = useState("");
  const [optD, setOptD] = useState("");
  
  // Correct answers
  const [correctMC, setCorrectMC] = useState("A");
  const [correctTF, setCorrectTF] = useState("true");
  
  // Image upload states
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const [formError, setFormError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setEditingQuestionId(null);
    setQuestionText("");
    setQuestionType("multiple_choice");
    setOptA("");
    setOptB("");
    setOptC("");
    setOptD("");
    setCorrectMC("A");
    setCorrectTF("true");
    setImageUrl(null);
    setFormError(null);
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleEditClick = (q: Question) => {
    setFormError(null);
    setUploadError(null);
    setEditingQuestionId(q.id);
    setQuestionText(q.questionText);
    setQuestionType(q.questionType);
    setImageUrl(q.imageUrl);

    if (q.questionType === "multiple_choice" && Array.isArray(q.options)) {
      const a = q.options.find((o: any) => o.value === "A")?.label || "";
      const b = q.options.find((o: any) => o.value === "B")?.label || "";
      const c = q.options.find((o: any) => o.value === "C")?.label || "";
      const d = q.options.find((o: any) => o.value === "D")?.label || "";
      setOptA(a);
      setOptB(b);
      setOptC(c);
      setOptD(d);
      setCorrectMC(q.correctAnswer);
    } else if (q.questionType === "true_false") {
      setCorrectTF(q.correctAnswer);
    }
    
    // Scroll form into view
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("File harus berupa gambar");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal mengunggah gambar");
      }

      setImageUrl(data.url);
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || "Gagal mengunggah gambar");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) {
      setFormError("Pertanyaan tidak boleh kosong");
      return;
    }

    let finalOptions = null;
    let finalCorrectAnswer = "";

    if (questionType === "multiple_choice") {
      if (!optA.trim() || !optB.trim() || !optC.trim() || !optD.trim()) {
        setFormError("Semua pilihan jawaban (A, B, C, D) harus diisi");
        return;
      }
      finalOptions = [
        { value: "A", label: optA.trim() },
        { value: "B", label: optB.trim() },
        { value: "C", label: optC.trim() },
        { value: "D", label: optD.trim() },
      ];
      finalCorrectAnswer = correctMC;
    } else {
      finalCorrectAnswer = correctTF;
    }

    setFormError(null);

    startTransition(async () => {
      if (editingQuestionId) {
        // Edit Mode
        const res = await updateQuestion(
          editingQuestionId,
          questionText,
          questionType,
          finalOptions,
          finalCorrectAnswer,
          imageUrl
        );
        if (res.error) {
          setFormError(res.error);
        } else if (res.success) {
          setQuestions((prev) =>
            prev.map((q) =>
              q.id === editingQuestionId
                ? {
                    ...q,
                    questionText,
                    questionType,
                    options: finalOptions,
                    correctAnswer: finalCorrectAnswer,
                    imageUrl,
                  }
                : q
            )
          );
          resetForm();
          router.refresh();
        }
      } else {
        // Add Mode
        const res = await createQuestion(
          assessmentId,
          questionText,
          questionType,
          finalOptions,
          finalCorrectAnswer,
          imageUrl
        );
        if (res.error) {
          setFormError(res.error);
        } else if (res.success && res.questionId) {
          setQuestions((prev) => [
            ...prev,
            {
              id: res.questionId!,
              assessmentId,
              questionText,
              questionType,
              options: finalOptions,
              correctAnswer: finalCorrectAnswer,
              imageUrl,
            },
          ]);
          resetForm();
          router.refresh();
        }
      }
    });
  };

  const handleDeleteClick = async (questionId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus soal ini?")) return;

    startTransition(async () => {
      const res = await deleteQuestion(questionId);
      if (res.error) {
        alert(res.error);
      } else if (res.success) {
        setQuestions((prev) => prev.filter((q) => q.id !== questionId));
        router.refresh();
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* Left Column: Input Form */}
      <div className="lg:col-span-5 space-y-6">
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm sticky top-6">
          <CardHeader className="border-b border-white/5">
            <CardTitle className="text-xl font-space-grotesk text-white flex items-center gap-2">
              <PenTool className="w-5 h-5 text-trace-teal" />
              {editingQuestionId ? "Edit Pertanyaan" : "Tambah Soal Baru"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {formError && (
                <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/30 p-3 rounded-md flex items-center gap-2 font-inter">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {formError}
                </div>
              )}

              {/* Question Text */}
              <div className="space-y-2">
                <Label htmlFor="qText" className="text-gray-300 font-inter">Teks Pertanyaan</Label>
                <textarea
                  id="qText"
                  rows={4}
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Masukkan pertanyaan di sini..."
                  className="w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-trace-teal"
                  required
                />
              </div>

              {/* Question Type */}
              <div className="space-y-2">
                <Label htmlFor="qType" className="text-gray-300 font-inter">Tipe Pertanyaan</Label>
                <select
                  id="qType"
                  value={questionType}
                  onChange={(e) => {
                    setQuestionType(e.target.value);
                    setFormError(null);
                  }}
                  className="w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-trace-teal"
                >
                  <option value="multiple_choice" className="bg-neutral-900">Pilihan Ganda</option>
                  <option value="true_false" className="bg-neutral-900">Benar / Salah</option>
                </select>
              </div>

              {/* Image Upload Block */}
              <div className="space-y-2">
                <Label className="text-gray-300 font-inter flex items-center gap-1">
                  <ImageIcon className="w-4 h-4 text-trace-teal" />
                  Gambar Ilustrasi (Opsional)
                </Label>
                
                {imageUrl ? (
                  <div className="relative border border-white/10 rounded-md bg-black/50 p-2 group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageUrl} alt="Ilustrasi Soal" className="max-h-40 mx-auto object-contain rounded" />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                      title="Hapus Gambar"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center border border-white/10 border-dashed rounded-md bg-black/30 p-4 hover:border-trace-teal/50 transition-colors">
                    {isUploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-trace-teal" />
                        <span className="text-xs text-gray-400 font-inter">Mengunggah...</span>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center gap-2 cursor-pointer">
                        <Upload className="w-6 h-6 text-gray-500 hover:text-trace-teal transition-colors" />
                        <span className="text-xs text-gray-400 font-inter text-center">
                          Klik untuk unggah gambar ilustrasi
                        </span>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleImageUpload}
                          accept="image/*"
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                )}
                {uploadError && <p className="text-xs text-red-500 font-inter mt-1">{uploadError}</p>}
              </div>

              {/* Multiple Choice Options Fields */}
              {questionType === "multiple_choice" && (
                <div className="space-y-3 border-t border-white/5 pt-4">
                  <span className="text-sm font-semibold text-gray-300 block font-space-grotesk">Pilihan Jawaban</span>
                  
                  <div className="grid grid-cols-12 gap-2 items-center">
                    <span className="col-span-1 font-jetbrains-mono text-center font-bold text-trace-teal">A</span>
                    <div className="col-span-11">
                      <Input
                        value={optA}
                        onChange={(e) => setOptA(e.target.value)}
                        placeholder="Pilihan A"
                        className="bg-black/50 border-white/10 focus-visible:ring-trace-teal text-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-12 gap-2 items-center">
                    <span className="col-span-1 font-jetbrains-mono text-center font-bold text-trace-teal">B</span>
                    <div className="col-span-11">
                      <Input
                        value={optB}
                        onChange={(e) => setOptB(e.target.value)}
                        placeholder="Pilihan B"
                        className="bg-black/50 border-white/10 focus-visible:ring-trace-teal text-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-12 gap-2 items-center">
                    <span className="col-span-1 font-jetbrains-mono text-center font-bold text-trace-teal">C</span>
                    <div className="col-span-11">
                      <Input
                        value={optC}
                        onChange={(e) => setOptC(e.target.value)}
                        placeholder="Pilihan C"
                        className="bg-black/50 border-white/10 focus-visible:ring-trace-teal text-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-12 gap-2 items-center">
                    <span className="col-span-1 font-jetbrains-mono text-center font-bold text-trace-teal">D</span>
                    <div className="col-span-11">
                      <Input
                        value={optD}
                        onChange={(e) => setOptD(e.target.value)}
                        placeholder="Pilihan D"
                        className="bg-black/50 border-white/10 focus-visible:ring-trace-teal text-white"
                        required
                      />
                    </div>
                  </div>

                  {/* MCQ Answer Key */}
                  <div className="space-y-2 border-t border-white/5 pt-3">
                    <Label htmlFor="correctMC" className="text-gray-300 font-inter">Kunci Jawaban Benar</Label>
                    <select
                      id="correctMC"
                      value={correctMC}
                      onChange={(e) => setCorrectMC(e.target.value)}
                      className="w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-trace-teal font-jetbrains-mono"
                    >
                      <option value="A" className="bg-neutral-900">A</option>
                      <option value="B" className="bg-neutral-900">B</option>
                      <option value="C" className="bg-neutral-900">C</option>
                      <option value="D" className="bg-neutral-900">D</option>
                    </select>
                  </div>
                </div>
              )}

              {/* True/False Answer Key */}
              {questionType === "true_false" && (
                <div className="space-y-2 border-t border-white/5 pt-4">
                  <Label htmlFor="correctTF" className="text-gray-300 font-inter">Kunci Jawaban Benar</Label>
                  <select
                    id="correctTF"
                    value={correctTF}
                    onChange={(e) => setCorrectTF(e.target.value)}
                    className="w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-trace-teal font-inter"
                  >
                    <option value="true" className="bg-neutral-900">Benar</option>
                    <option value="false" className="bg-neutral-900">Salah</option>
                  </select>
                </div>
              )}

              {/* Submit / Cancel Buttons */}
              <div className="flex gap-2 pt-4">
                {editingQuestionId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    className="flex-1 border-white/10 text-gray-400 hover:text-white"
                    disabled={isPending}
                  >
                    Batal
                  </Button>
                )}
                <Button
                  type="submit"
                  className="flex-1 bg-trace-teal text-black hover:bg-trace-teal/80 font-bold"
                  disabled={isPending}
                >
                  {isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : editingQuestionId ? (
                    "Simpan Perubahan"
                  ) : (
                    "Tambah Soal"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Question List */}
      <div className="lg:col-span-7 space-y-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-space-grotesk text-white">Daftar Pertanyaan ({questions.length})</h2>
          {editingQuestionId && (
            <Button
              variant="outline"
              size="sm"
              onClick={resetForm}
              className="border-trace-teal/50 text-trace-teal hover:bg-trace-teal/10"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Buat Soal Baru
            </Button>
          )}
        </div>

        {questions.length === 0 ? (
          <Card className="bg-black/20 border-white/10 border-dashed p-12 text-center text-gray-500 font-inter">
            Asesmen ini belum memiliki pertanyaan. Gunakan form di sebelah kiri untuk menambahkan pertanyaan pertama!
          </Card>
        ) : (
          <div className="space-y-4">
            {questions.map((q, idx) => (
              <Card key={q.id} className="bg-white/5 border-white/10 hover:border-white/20 transition-all">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3">
                      <span className="font-jetbrains-mono font-bold text-trace-teal bg-trace-teal/10 w-6 h-6 flex items-center justify-center rounded-full shrink-0 text-sm mt-0.5">
                        {idx + 1}
                      </span>
                      <div className="space-y-1">
                        <p className="text-white font-inter leading-relaxed whitespace-pre-line">{q.questionText}</p>
                        <span className="inline-block text-[10px] uppercase font-jetbrains-mono bg-white/5 px-2 py-0.5 rounded text-gray-400">
                          {q.questionType === "multiple_choice" ? "Pilihan Ganda" : "Benar / Salah"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEditClick(q)}
                        className="w-8 h-8 text-gray-400 hover:text-white"
                        title="Edit Soal"
                        disabled={isPending}
                      >
                        <PenTool className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeleteClick(q.id)}
                        className="w-8 h-8 text-red-400 hover:text-red-500 hover:bg-red-500/10"
                        title="Hapus Soal"
                        disabled={isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Question Image Preview */}
                  {q.imageUrl && (
                    <div className="pl-9">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={q.imageUrl}
                        alt={`Ilustrasi Soal ${idx + 1}`}
                        className="max-h-40 object-contain rounded border border-white/10 bg-black/30"
                      />
                    </div>
                  )}

                  {/* Options Render */}
                  {q.questionType === "multiple_choice" && Array.isArray(q.options) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-9">
                      {q.options.map((opt: any) => {
                        const isCorrect = q.correctAnswer === opt.value;
                        return (
                          <div
                            key={opt.value}
                            className={`flex items-center gap-2 p-2.5 rounded border text-sm font-inter transition-all ${
                              isCorrect
                                ? "bg-trace-teal/5 border-trace-teal text-white font-medium"
                                : "bg-black/10 border-white/5 text-gray-400"
                            }`}
                          >
                            <span
                              className={`w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold font-jetbrains-mono shrink-0 ${
                                isCorrect ? "bg-trace-teal text-black" : "bg-white/5 text-gray-400"
                              }`}
                            >
                              {opt.value}
                            </span>
                            <span className="truncate">{opt.label}</span>
                            {isCorrect && <Check className="w-3.5 h-3.5 text-trace-teal ml-auto shrink-0" />}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* True/False Render */}
                  {q.questionType === "true_false" && (
                    <div className="flex gap-2 pl-9 font-inter text-sm">
                      <div
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded border ${
                          q.correctAnswer === "true"
                            ? "bg-trace-teal/5 border-trace-teal text-white font-medium"
                            : "bg-black/10 border-white/5 text-gray-400"
                        }`}
                      >
                        {q.correctAnswer === "true" && <Check className="w-3.5 h-3.5 text-trace-teal" />}
                        Benar
                      </div>
                      <div
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded border ${
                          q.correctAnswer === "false"
                            ? "bg-trace-teal/5 border-trace-teal text-white font-medium"
                            : "bg-black/10 border-white/5 text-gray-400"
                        }`}
                      >
                        {q.correctAnswer === "false" && <Check className="w-3.5 h-3.5 text-trace-teal" />}
                        Salah
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
