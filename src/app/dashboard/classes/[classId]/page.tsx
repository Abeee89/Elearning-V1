import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getClassProgressOverview } from "@/actions/progress";
import { getClassById } from "@/actions/classes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookCheck, BookOpen, PenTool, FlaskConical, LineChart } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/auth/LogoutButton";

// A simple local Progress component since we don't have shadcn progress initialized
// Let's create a custom styled one to fit the theme
function CustomProgress({ value }: { value: number }) {
  return (
    <div className="w-full bg-white/10 rounded-full h-2.5 mb-1 overflow-hidden">
      <div 
        className="bg-trace-teal h-2.5 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(45,212,191,0.5)]" 
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
  
  const classData = await getClassById(params.classId);
  if (!classData) redirect("/dashboard");

  if (session.user.role === "student") {
    return (
      <div className="min-h-screen bg-black/95 p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex justify-between items-start">
            <div>
              <Link href="/dashboard" className="text-trace-teal text-sm hover:underline mb-2 block font-jetbrains-mono">
                ← Kembali ke Dashboard
              </Link>
              <h1 className="text-3xl font-space-grotesk font-bold text-white">Kelas: {classData.name}</h1>
              <p className="text-gray-400 font-inter mt-2">{classData.description}</p>
            </div>
            <LogoutButton />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/materi" className="block group">
              <Card className="bg-black/40 border-white/10 hover:border-trace-teal/50 transition-all h-full group-hover:shadow-[0_0_15px_rgba(45,212,191,0.2)]">
                <CardHeader>
                  <BookOpen className="w-8 h-8 text-trace-teal mb-4" />
                  <CardTitle className="text-xl text-white font-space-grotesk">Materi Belajar</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 text-sm font-inter">Akses modul pembelajaran, bacaan, dan video interaktif.</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/simulasi" className="block group">
              <Card className="bg-black/40 border-white/10 hover:border-trace-teal/50 transition-all h-full group-hover:shadow-[0_0_15px_rgba(45,212,191,0.2)]">
                <CardHeader>
                  <FlaskConical className="w-8 h-8 text-trace-teal mb-4" />
                  <CardTitle className="text-xl text-white font-space-grotesk">Simulasi</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 text-sm font-inter">Praktikkan teori dengan alat simulasi interaktif.</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/asesmen" className="block group">
              <Card className="bg-black/40 border-white/10 hover:border-trace-teal/50 transition-all h-full group-hover:shadow-[0_0_15px_rgba(45,212,191,0.2)]">
                <CardHeader>
                  <PenTool className="w-8 h-8 text-trace-teal mb-4" />
                  <CardTitle className="text-xl text-white font-space-grotesk">Asesmen</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 text-sm font-inter">Kerjakan kuis dan ujian untuk menguji pemahaman.</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/evaluasi" className="block group">
              <Card className="bg-black/40 border-white/10 hover:border-trace-teal/50 transition-all h-full group-hover:shadow-[0_0_15px_rgba(45,212,191,0.2)]">
                <CardHeader>
                  <LineChart className="w-8 h-8 text-trace-teal mb-4" />
                  <CardTitle className="text-xl text-white font-space-grotesk">Evaluasi AI</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 text-sm font-inter">Dapatkan feedback otomatis dari asisten AI.</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const studentProgress = await getClassProgressOverview(params.classId);

  return (
    <div className="min-h-screen bg-black/95 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="flex justify-between items-start">
           <div>
             <Link href="/dashboard" className="text-trace-teal text-sm hover:underline mb-2 block">
               ← Kembali ke Dashboard Utama
             </Link>
             <h1 className="text-3xl font-space-grotesk font-bold text-white">Monitoring Kelas</h1>
           </div>
           
           <div className="flex items-center gap-4">
             <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-lg flex items-center h-10">
                <Users className="w-5 h-5 text-trace-teal mr-2" />
                <span className="text-white font-jetbrains-mono">{studentProgress.length} Siswa</span>
             </div>
             <LogoutButton />
           </div>
        </div>

        {/* UUID Display for Teacher to share */}
        <div className="bg-trace-teal/10 border border-trace-teal/30 p-4 rounded-lg flex flex-col md:flex-row items-center justify-between">
           <div>
             <h3 className="text-trace-teal font-space-grotesk font-bold">Kode Kelas (UUID)</h3>
             <p className="text-gray-400 text-sm">Bagikan kode ini kepada siswa agar mereka dapat bergabung ke kelas.</p>
           </div>
           <div className="mt-4 md:mt-0 bg-black/50 px-4 py-2 rounded border border-white/10 font-jetbrains-mono text-white select-all">
             {params.classId}
           </div>
        </div>

        <div className="bg-white/5 border border-white/10 p-6 rounded-lg backdrop-blur-sm shadow-lg">
           <div className="flex items-center justify-between mb-6">
             <h2 className="text-xl font-space-grotesk text-white">Progres Siswa</h2>
             {/* ProgressFilterBar placeholder */}
             <div className="flex gap-2">
                <Button variant="outline" size="sm" className="bg-trace-teal/10 border-trace-teal/50 text-trace-teal">Semua</Button>
                <Button variant="outline" size="sm" className="border-white/10 text-gray-400 hover:text-white">Butuh Bantuan</Button>
             </div>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {studentProgress.map((student) => (
               <Card key={student.id} className="bg-black/40 border-white/10 hover:border-trace-teal/30 transition-colors">
                 <CardHeader className="pb-2">
                   <CardTitle className="text-lg text-white font-inter">{student.fullName}</CardTitle>
                   <p className="text-xs text-gray-500 font-jetbrains-mono">{student.email}</p>
                 </CardHeader>
                 <CardContent>
                   <div className="mt-4">
                     <div className="flex justify-between text-xs mb-1">
                       <span className="text-gray-400">Penyelesaian</span>
                       <span className="text-trace-teal font-bold">{student.percentage}%</span>
                     </div>
                     <CustomProgress value={student.percentage} />
                     <div className="text-xs text-gray-500 mt-2 flex items-center">
                       <BookCheck className="w-3 h-3 mr-1" />
                       {student.completedCount} / {student.totalCount} materi selesai
                     </div>
                   </div>
                   
                   <div className="mt-6 text-center">
                     {/* StudentDetailDrawer Trigger Placeholder */}
                     <Button variant="outline" className="w-full border-trace-teal text-trace-teal hover:bg-trace-teal hover:text-black">
                       Lihat Detail
                     </Button>
                   </div>
                 </CardContent>
               </Card>
             ))}
             {studentProgress.length === 0 && (
               <div className="col-span-full py-12 text-center text-gray-500 border border-white/10 border-dashed rounded-lg">
                 Belum ada siswa yang bergabung di kelas ini.
               </div>
             )}
           </div>
        </div>
        
      </div>
    </div>
  );
}
