import { getMaterialTree } from "@/actions/materials";
import { checkCanGenerateEvaluation } from "@/actions/evaluations";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { BookOpen, FileText, Video, ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/Navbar";

const chapterExplanations: Record<number, string> = {
  1: "Proses bisnis ketenagalistrikan melibatkan siklus rantai pasok energi listrik yang kompleks, dimulai dari Pembangkitan (Generation) yang mengubah energi primer menjadi listrik, Transmisi (Transmission) untuk menyalurkan tegangan tinggi melalui jaringan transmisi (SUTET), dan Distribusi (Distribution) yang menurunkan tegangan untuk disalurkan ke konsumen akhir seperti industri, bisnis, dan rumah tangga.",
  2: "Sektor ketenagalistrikan sedang bertransisi menuju pemanfaatan Energi Baru Terbarukan (EBT) seperti PLTS dan PLTB untuk menekan emisi karbon global. Modernisasi sistem dilakukan melalui digitalisasi jaringan menggunakan teknologi Smart Grid, IoT, Smart Metering, serta Supervisory Control and Data Acquisition (SCADA) untuk keandalan penyaluran.",
  3: "Profil profesi ketenagalistrikan tersertifikasi nasional meliputi Operator Gardu Induk, Teknisi Distribusi, dan Teknisi PDKB (Pekerjaan Dalam Keadaan Bertegangan). Peluang wirausaha (technopreneurship) terbuka lebar di bidang jasa instalasi penerangan bangunan, perawatan AC, serta penyedia jasa PLTS Atap mandiri.",
  4: "Dasar kerja instalasi kelistrikan meliputi teknik kupas-sambung kabel (pigtail, bell hanger, Western Union), pemasangan komponen PHB, sakelar, fitting lampu, stop kontak dengan kabel pentanahan (grounding), serta keterampilan menyolder kaki komponen elektronika pada papan sirkuit cetak (PCB).",
  5: "Implementasi Keselamatan dan Kesehatan Kerja serta Lingkungan Hidup (K3LH) berlandaskan UU No. 1 Tahun 1970 untuk mencegah kecelakaan sengatan listrik dan luka bakar (arc flash). Setiap teknisi wajib menggunakan APD tersertifikasi dielektrik dan menerapkan budaya kerja industri 5R/5S (Ringkas, Rapi, Resik, Rawat, Rajin).",
  6: "Teori dasar listrik berakar pada Hukum Ohm (V = I x R) dan Hukum Kirchoff yang merelasikan besaran Tegangan (Volt), Arus (Ampere), dan Hambatan (Ohm). Material kelistrikan terbagi atas Konduktor (penghantar arus), Isolator (selubung pengaman anti kebocoran arus), dan Semikonduktor (bahan dasar komponen elektronika aktif).",
  7: "Pekerjaan mekanik listrik memanfaatkan aneka perkakas tangan yang dilengkapi pengaman isolasi standar VDE 1000V. Perkakas tersebut meliputi tang kombinasi, tang potong, tang lancip untuk membuat loop mata itik, obeng fasa berisolator, solder listrik, serta bor tangan untuk pemasangan conduit.",
  8: "Pengukuran listrik krusial untuk diagnosis sistem. Pengukuran tegangan, arus, dan hambatan menggunakan Multimeter (AVO Meter) analog/digital. Pengujian keselamatan instalasi dilakukan dengan Insulation Tester (Megger) untuk tahanan isolasi kabel, serta Earth Tester untuk memastikan nilai resistansi grounding di bawah 5 Ohm.",
  9: "Gambar teknik berfungsi sebagai diagram instruksi kelistrikan berstandar internasional (IEC 60617 / ANSI). Pembuatan rancangan diagram satu garis (single line diagram) dan pengawatan instalasi dilakukan menggunakan software Computer-Aided Design (CAD) khusus listrik seperti AutoCAD Electrical atau QElectroTech."
};

export default async function MateriPage(
  props: { searchParams: Promise<{ classId?: string }> }
) {
  const searchParams = await props.searchParams;
  const classId = searchParams.classId;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const canGenerate = await checkCanGenerateEvaluation();
  const materialTree = await getMaterialTree();

  const getIcon = (type: string) => {
    switch(type) {
      case 'video': return <Video className="w-4 h-4 mr-2 text-trace-teal" />;
      case 'pdf': return <FileText className="w-4 h-4 mr-2 text-trace-teal" />;
      default: return <BookOpen className="w-4 h-4 mr-2 text-trace-teal" />;
    }
  };

  return (
    <div className="min-h-screen bg-bg-base bg-schematic-grid text-white flex flex-col font-sans">
      <Navbar user={session.user} canGenerateEvaluation={canGenerate} />
      
      <div className="flex-grow container mx-auto py-10 px-4 max-w-4xl">
        <div className="mb-6">
          <Link 
            href={classId ? `/dashboard/classes/${classId}` : "/dashboard"} 
            className="text-trace-teal hover:text-white flex items-center text-sm w-max transition-colors font-jetbrains-mono"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Kembali ke {classId ? "Kelas" : "Dashboard"}
          </Link>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-1 bg-trace-teal rounded-full shadow-[0_0_8px_#4FD1C5]"></div>
          <h1 className="text-4xl font-bold font-space-grotesk tracking-tight text-white">
            Materi Pembelajaran
          </h1>
        </div>
        
        <div className="space-y-12">
          {materialTree.map((chapter) => (
            <div key={chapter.id} className="relative">
              <div className="absolute left-[15px] top-10 bottom-[-40px] w-0.5 bg-grid-line md:block hidden z-0"></div>
              
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-4 relative z-10 font-space-grotesk">
                <span className="bg-trace-teal text-black w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-[0_0_15px_rgba(79,209,197,0.5)] font-mono">
                  {chapter.orderIndex}
                </span>
                {chapter.title}
              </h2>
              <p className="text-text-muted text-sm ml-0 md:ml-12 mb-6 font-inter max-w-3xl leading-relaxed relative z-10">
                {chapterExplanations[chapter.orderIndex]}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-0 md:ml-12 relative z-10">
                {chapter.subchapters.map((sub) => (
                  <Link key={sub.id} href={`/materi/${chapter.id}/${sub.id}${classId ? `?classId=${classId}` : ""}`}>
                    <Card className="hover:border-trace-teal/50 hover:bg-bg-panel transition-all cursor-pointer h-full border-grid-line bg-black/40 backdrop-blur-sm group trace-border relative overflow-hidden">
                      <span className="trace-card-accent"></span>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-space-grotesk text-white/90 group-hover:text-trace-teal transition-colors line-clamp-2">
                          {sub.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center text-sm text-text-muted font-jetbrains-mono">
                          <span className="flex items-center bg-white/5 px-3 py-1.5 rounded-md text-xs border border-grid-line group-hover:border-trace-teal/30 transition-colors">
                            {getIcon(sub.contentType)}
                            {sub.contentType.toUpperCase()}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
                {chapter.subchapters.length === 0 && (
                  <div className="text-text-muted italic text-sm py-4 ml-0 md:ml-12">Belum ada materi di bab ini.</div>
                )}
              </div>
            </div>
          ))}
          {materialTree.length === 0 && (
            <div className="text-text-muted border border-grid-line border-dashed p-8 text-center rounded-xl bg-bg-panel">
              Belum ada bab materi yang tersedia.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
