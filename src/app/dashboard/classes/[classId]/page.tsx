import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getClassProgressOverview } from "@/actions/progress";
import { getClassById } from "@/actions/classes";
import { checkCanGenerateEvaluation } from "@/actions/evaluations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookCheck, BookOpen, PenTool, FlaskConical, LineChart } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";

// A simple local Progress component tailored to the theme
function CustomProgress({ value }: { value: number }) {
  return (
    <div className="w-full bg-white/10 rounded-full h-2.5 mb-1 overflow-hidden">
      <div 
        className="bg-trace-teal h-2.5 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(79,209,197,0.5)]" 
        style={{ width: `${value}%` }}
      ></div>
    </div>
  );
}

export default async function ClassDashboard(
  props: { params: Promise<{ classId: string }> }
) {
  const params = await props.params;
  const session = await auth();
  if (!session?.user) redirect("/login");
  
  const canGenerate = await checkCanGenerateEvaluation();
  const classData = await getClassById(params.classId);
  if (!classData) redirect("/dashboard");

  if (session.user.role === "student") {
    return (
      <div className="min-h-screen bg-bg-base bg-schematic-grid flex flex-col font-sans text-white">
        <Navbar user={session.user} canGenerateEvaluation={canGenerate} />
        
        <div className="flex-grow p-4 sm:p-8">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex justify-between items-start pb-4 border-b border-grid-line">
              <div>
                <Link href="/dashboard" className="text-trace-teal text-sm hover:underline mb-2 block font-jetbrains-mono">
                  ← Kembali ke Dashboard
                </Link>
                <h1 className="text-3xl font-space-grotesk font-bold text-white">Kelas: {classData.name}</h1>
                <p className="text-text-muted font-inter mt-2">{classData.description || "Tidak ada deskripsi kelas."}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Link href={`/materi?classId=${params.classId}`} className="block group">
                <Card className="bg-bg-panel border-grid-line hover:border-trace-teal/55 transition-all h-full group-hover:shadow-[0_0_20px_rgba(79,209,197,0.15)] trace-border relative overflow-hidden">
                  <span className="trace-card-accent"></span>
                  <CardHeader>
                    <BookOpen className="w-8 h-8 text-trace-teal mb-4" />
                    <CardTitle className="text-xl text-white font-space-grotesk group-hover:text-trace-teal transition-colors">Materi Belajar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-text-muted text-sm font-inter leading-relaxed">Akses modul pembelajaran, bacaan, dan video interaktif.</p>
                  </CardContent>
                </Card>
              </Link>

              <Link href={`/simulasi?classId=${params.classId}`} className="block group">
                <Card className="bg-bg-panel border-grid-line hover:border-trace-teal/55 transition-all h-full group-hover:shadow-[0_0_20px_rgba(79,209,197,0.15)] trace-border relative overflow-hidden">
                  <span className="trace-card-accent"></span>
                  <CardHeader>
                    <FlaskConical className="w-8 h-8 text-trace-teal mb-4" />
                    <CardTitle className="text-xl text-white font-space-grotesk group-hover:text-trace-teal transition-colors">Simulasi</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-text-muted text-sm font-inter leading-relaxed">Praktikkan teori dengan alat simulasi interaktif.</p>
                  </CardContent>
                </Card>
              </Link>

              <Link href={`/asesmen?classId=${params.classId}`} className="block group">
                <Card className="bg-bg-panel border-grid-line hover:border-trace-teal/55 transition-all h-full group-hover:shadow-[0_0_20px_rgba(79,209,197,0.15)] trace-border relative overflow-hidden">
                  <span className="trace-card-accent"></span>
                  <CardHeader>
                    <PenTool className="w-8 h-8 text-trace-teal mb-4" />
                    <CardTitle className="text-xl text-white font-space-grotesk group-hover:text-trace-teal transition-colors">Asesmen</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-text-muted text-sm font-inter leading-relaxed">Kerjakan kuis dan ujian untuk menguji pemahaman.</p>
                  </CardContent>
                </Card>
              </Link>

              <Link href={`/evaluasi?classId=${params.classId}`} className="block group">
                <Card className="bg-bg-panel border-grid-line hover:border-trace-teal/55 transition-all h-full group-hover:shadow-[0_0_20px_rgba(79,209,197,0.15)] trace-border relative overflow-hidden">
                  <span className="trace-card-accent"></span>
                  <CardHeader>
                    <LineChart className="w-8 h-8 text-trace-teal mb-4" />
                    <CardTitle className="text-xl text-white font-space-grotesk group-hover:text-trace-teal transition-colors">Evaluasi AI</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-text-muted text-sm font-inter leading-relaxed">Dapatkan feedback otomatis dari asisten AI.</p>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const studentProgress = await getClassProgressOverview(params.classId);

  return (
    <div className="min-h-screen bg-bg-base bg-schematic-grid flex flex-col font-sans text-white">
      <Navbar user={session.user} canGenerateEvaluation={canGenerate} />
      
      <div className="flex-grow p-4 sm:p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          
          <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 pb-4 border-b border-grid-line">
             <div>
               <Link href="/dashboard" className="text-trace-teal text-sm hover:underline mb-2 block font-jetbrains-mono">
                 ← Kembali ke Dashboard Utama
               </Link>
               <h1 className="text-3xl font-space-grotesk font-bold text-white">Monitoring Kelas</h1>
               <p className="text-sm text-text-muted mt-1 font-inter">Kelas: <span className="text-white font-semibold">{classData.name}</span></p>
             </div>
             
             <div className="flex items-center gap-4 self-end sm:self-auto">
               <Link href={`/dashboard/classes/${params.classId}/assessments`}>
                 <Button className="bg-trace-teal hover:bg-trace-teal/90 text-black font-bold h-10 flex items-center font-space-grotesk shadow-[0_0_15px_rgba(79,209,197,0.2)]">
                   <PenTool className="w-4 h-4 mr-2" />
                   Kelola Asesmen
                 </Button>
               </Link>
               <div className="bg-white/5 border border-grid-line px-4 py-2 rounded-lg flex items-center h-10 text-sm font-medium">
                  <Users className="w-5 h-5 text-trace-teal mr-2" />
                  <span className="text-white font-jetbrains-mono">{studentProgress.length} Siswa</span>
               </div>
             </div>
          </div>

          {/* UUID Display for Teacher to share */}
          <div className="bg-trace-teal/5 border border-trace-teal/30 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between shadow-[0_0_15px_rgba(79,209,197,0.05)]">
             <div>
               <h3 className="text-trace-teal font-space-grotesk font-bold">Kode Kelas (UUID)</h3>
               <p className="text-text-muted text-sm font-inter">Bagikan kode ini kepada siswa agar mereka dapat bergabung ke kelas.</p>
             </div>
             <div className="mt-4 md:mt-0 bg-black/60 px-4 py-2.5 rounded-lg border border-grid-line font-jetbrains-mono text-white select-all select-text font-bold text-sm tracking-wider">
               {params.classId}
             </div>
          </div>

          <div className="bg-bg-panel border border-grid-line p-6 rounded-xl backdrop-blur-sm shadow-xl">
             <div className="flex items-center justify-between mb-6">
               <h2 className="text-2xl font-space-grotesk text-white font-bold">Progres Siswa</h2>
               <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="bg-trace-teal/10 border-trace-teal text-trace-teal hover:bg-trace-teal hover:text-black">Semua</Button>
                  <Button variant="outline" size="sm" className="border-grid-line text-text-muted hover:text-white hover:bg-white/5">Butuh Bantuan</Button>
               </div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {studentProgress.map((student) => (
                 <Card key={student.id} className="bg-black/40 border-grid-line hover:border-trace-teal/40 transition-colors trace-border relative overflow-hidden">
                   <span className="trace-card-accent"></span>
                   <CardHeader className="pb-2">
                     <CardTitle className="text-lg text-white font-space-grotesk font-bold">{student.fullName}</CardTitle>
                     <p className="text-xs text-text-muted font-jetbrains-mono">{student.email}</p>
                   </CardHeader>
                   <CardContent>
                     <div className="mt-4">
                       <div className="flex justify-between text-xs mb-1 font-inter">
                         <span className="text-text-muted">Penyelesaian</span>
                         <span className="text-trace-teal font-bold font-jetbrains-mono">{student.percentage}%</span>
                       </div>
                       <CustomProgress value={student.percentage} />
                       <div className="text-xs text-text-muted mt-3 flex items-center font-jetbrains-mono">
                         <BookCheck className="w-3.5 h-3.5 mr-1 text-trace-teal" />
                         {student.completedCount} / {student.totalCount} materi selesai
                       </div>
                     </div>
                     
                     <div className="mt-6 text-center">
                       <Button variant="outline" className="w-full border-trace-teal text-trace-teal hover:bg-trace-teal hover:text-black font-semibold font-space-grotesk">
                         Lihat Detail
                       </Button>
                     </div>
                   </CardContent>
                 </Card>
               ))}
               {studentProgress.length === 0 && (
                 <div className="col-span-full py-16 text-center text-text-muted border border-grid-line border-dashed rounded-xl bg-black/20">
                   Belum ada siswa yang bergabung di kelas ini.
                 </div>
               )}
             </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
