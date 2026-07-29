import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getTeacherClasses, getStudentClasses } from "@/actions/classes";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RecommendedMaterials } from "@/components/RecommendedMaterials";
import { LogoutButton } from "@/components/auth/LogoutButton";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { role, name } = session.user;
  
  let userClasses: any[] = [];
  if (role === "teacher") {
    userClasses = await getTeacherClasses();
  } else if (role === "student") {
    userClasses = await getStudentClasses();
  }

  return (
    <div className="min-h-screen bg-black/95 p-8">
      <div className="max-w-4xl mx-auto bg-white/5 p-8 rounded-lg shadow-lg border border-white/10 backdrop-blur-sm">
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-3xl font-space-grotesk text-white">
            Selamat Datang, {name}
          </h1>
          <LogoutButton />
        </div>
        <p className="text-gray-400 font-inter mb-8">
          Anda login sebagai: <strong className="text-trace-teal uppercase font-jetbrains-mono">{role}</strong>
        </p>
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-space-grotesk text-white">Daftar Kelas</h2>
          {role === "teacher" && (
            <Link href="/dashboard/classes/new">
              <Button className="bg-trace-teal hover:bg-teal-600 text-black font-bold">Buat Kelas Baru</Button>
            </Link>
          )}
          {role === "student" && (
            <Link href="/dashboard/classes/enroll">
              <Button className="bg-trace-teal hover:bg-teal-600 text-black font-bold">Gabung Kelas</Button>
            </Link>
          )}
        </div>

        {userClasses.length === 0 ? (
          <div className="p-8 text-center bg-black/40 border border-white/10 border-dashed rounded-lg text-gray-500 font-inter">
            Belum ada kelas.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userClasses.map((c) => (
              <div key={c.id} className="p-4 bg-black/40 border border-white/10 rounded-lg hover:border-trace-teal/50 transition-all hover:shadow-[0_0_15px_rgba(45,212,191,0.1)]">
                <h3 className="font-bold text-lg text-white font-space-grotesk">{c.name}</h3>
                <p className="text-sm text-gray-400 mt-1 truncate font-inter">{c.description}</p>
                <div className="mt-4">
                  <Link href={`/dashboard/classes/${c.id}`}>
                    <Button variant="outline" className="w-full border-trace-teal/50 text-trace-teal hover:bg-trace-teal hover:text-black">
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
  );
}
