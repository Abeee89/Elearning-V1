import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getTeacherClasses, getStudentClasses } from "@/actions/classes";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RecommendedMaterials } from "@/components/RecommendedMaterials";

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
    <div className="min-h-screen bg-bg-base p-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-sm border border-border-muted">
        <h1 className="text-3xl font-space-grotesk text-text-primary mb-2">
          Selamat Datang, {name}
        </h1>
        <p className="text-text-secondary font-inter mb-8">
          Anda login sebagai: <strong className="text-trace-teal uppercase">{role}</strong>
        </p>
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-space-grotesk text-text-primary">Daftar Kelas</h2>
          {role === "teacher" && (
            <Link href="/dashboard/classes/new">
              <Button className="bg-trace-teal hover:bg-teal-600 text-white">Buat Kelas Baru</Button>
            </Link>
          )}
          {role === "student" && (
            <Link href="/dashboard/classes/enroll">
              <Button className="bg-trace-teal hover:bg-teal-600 text-white">Gabung Kelas</Button>
            </Link>
          )}
        </div>

        {userClasses.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 border border-border-muted rounded-md text-text-secondary">
            Belum ada kelas.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userClasses.map((c) => (
              <div key={c.id} className="p-4 border border-border-muted rounded-md hover:border-trace-teal transition-colors">
                <h3 className="font-bold text-lg text-text-primary">{c.name}</h3>
                <p className="text-sm text-text-secondary mt-1 truncate">{c.description}</p>
                <div className="mt-4">
                  <Link href={`/dashboard/classes/${c.id}`}>
                    <Button variant="outline" className="w-full">Masuk Kelas</Button>
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
