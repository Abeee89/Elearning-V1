import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getTeacherClasses, getStudentClasses } from "@/actions/classes";
import { checkCanGenerateEvaluation } from "@/actions/evaluations";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RecommendedMaterials } from "@/components/RecommendedMaterials";
import { Navbar } from "@/components/Navbar";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { role, name } = session.user;
  const canGenerate = await checkCanGenerateEvaluation();
  
  let userClasses: any[] = [];
  if (role === "teacher") {
    userClasses = await getTeacherClasses();
  } else if (role === "student") {
    userClasses = await getStudentClasses();
  }

  return (
    <div className="min-h-screen bg-bg-base bg-schematic-grid flex flex-col font-sans">
      <Navbar user={session.user} canGenerateEvaluation={canGenerate} />
      
      <div className="flex-grow p-4 sm:p-8">
        <div className="max-w-4xl mx-auto bg-black/40 p-6 sm:p-8 rounded-xl shadow-2xl border border-grid-line backdrop-blur-sm">
          <div className="mb-6">
            <h1 className="text-3xl sm:text-4xl font-space-grotesk text-white font-bold tracking-tight">
              Selamat Datang, <span className="text-trace-teal">{name}</span>
            </h1>
            <p className="text-sm text-text-muted mt-2 font-inter">
              Anda masuk sebagai: <strong className="text-trace-teal uppercase font-jetbrains-mono tracking-wider">{role}</strong>
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8 pt-4 border-t border-grid-line">
            <h2 className="text-2xl font-space-grotesk text-white font-bold">Daftar Kelas Anda</h2>
            {role === "teacher" && (
              <Link href="/dashboard/classes/new">
                <Button className="bg-trace-teal hover:bg-trace-teal/90 text-black font-bold font-space-grotesk shadow-[0_0_15px_rgba(79,209,197,0.3)]">
                  Buat Kelas Baru
                </Button>
              </Link>
            )}
            {role === "student" && (
              <Link href="/dashboard/classes/enroll">
                <Button className="bg-trace-teal hover:bg-trace-teal/90 text-black font-bold font-space-grotesk shadow-[0_0_15px_rgba(79,209,197,0.3)]">
                  Gabung Kelas
                </Button>
              </Link>
            )}
          </div>

          {userClasses.length === 0 ? (
            <div className="p-12 text-center bg-black/20 border border-grid-line border-dashed rounded-xl text-text-muted font-inter">
              Belum ada kelas terdaftar. {role === "teacher" ? "Buat kelas baru untuk memulai." : "Gunakan kode kelas dari guru untuk bergabung."}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userClasses.map((c) => (
                <div key={c.id} className="trace-border p-6 bg-bg-panel border border-grid-line rounded-xl hover:border-trace-teal/50 hover:shadow-[0_0_20px_rgba(79,209,197,0.15)] transition-all flex flex-col justify-between group">
                  <span className="trace-card-accent"></span>
                  <div>
                    <h3 className="font-bold text-xl text-white font-space-grotesk group-hover:text-trace-teal transition-colors">{c.name}</h3>
                    <p className="text-sm text-text-muted mt-2 font-inter leading-relaxed line-clamp-2">{c.description || "Tidak ada deskripsi kelas."}</p>
                  </div>
                  <div className="mt-6">
                    <Link href={`/dashboard/classes/${c.id}`}>
                      <Button variant="outline" className="w-full border-trace-teal text-trace-teal hover:bg-trace-teal hover:text-black font-semibold font-space-grotesk">
                        Masuk Kelas
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {role === "student" && <RecommendedMaterials />}
        </div>
      </div>
    </div>
  );
}
