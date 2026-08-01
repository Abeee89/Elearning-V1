import Link from "next/link";
import { Zap, ShieldAlert, Target, Activity, Settings2, CircuitBoard, ArrowRight } from "lucide-react";

const modules = [
  { id: "hukum-ohm", title: "Hukum Ohm", desc: "Pelajari Hukum Ohm dengan visualisasi arus interaktif.", icon: Zap, color: "blue" },
  { id: "keamanan-rangkaian", title: "Keamanan Rangkaian", desc: "Eksplorasi MCB, sekering, dan skenario beban lebih.", icon: ShieldAlert, color: "red" },
  { id: "komponen-pasif", title: "Komponen Pasif", desc: "Kalkulator kode warna resistor 4 dan 5 gelang.", icon: Target, color: "emerald" },
  { id: "komponen-aktif", title: "Komponen Aktif", desc: "Dioda PN junction, bias maju dan mundur.", icon: Activity, color: "purple" },
  { id: "sandbox", title: "Circuit Sandbox", desc: "Drag-and-drop komponen untuk membangun rangkaian nyata.", icon: Settings2, color: "amber" },
  { id: "kapasitor", title: "Dinamika Kapasitor", desc: "Pengisian dan pengosongan energi kapasitor secara real-time.", icon: CircuitBoard, color: "pink" },
];

const colorMap: Record<string, { text: string; bg: string; border: string; glow: string }> = {
  blue: { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", glow: "hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]" },
  red: { text: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", glow: "hover:shadow-[0_0_20px_rgba(239,68,68,0.15)]" },
  emerald: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", glow: "hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]" },
  purple: { text: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20", glow: "hover:shadow-[0_0_20px_rgba(168,85,247,0.15)]" },
  amber: { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", glow: "hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]" },
  pink: { text: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/20", glow: "hover:shadow-[0_0_20px_rgba(236,72,153,0.15)]" },
};

export default async function SimulasiHubPage(
  props: { searchParams: Promise<{ classId?: string }> }
) {
  const searchParams = await props.searchParams;
  const classId = searchParams.classId;

  return (
    <div className="flex flex-col">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-1 bg-trace-teal rounded-full" />
          <h1 className="text-4xl md:text-5xl font-bold text-white font-space-grotesk">
            Simulation <span className="text-trace-teal">Hub</span>
          </h1>
        </div>
        <p className="text-gray-400 text-lg max-w-2xl font-inter leading-relaxed">
          Jelajahi modul-modul simulasi interaktif. Eksperimen dengan komponen,
          visualisasikan aliran arus, dan bangun rangkaian nyata — langsung dari browser Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((mod, i) => {
          const Icon = mod.icon;
          const c = colorMap[mod.color];
          return (
            <Link
              key={mod.id}
              href={`/simulasi/${mod.id}${classId ? `?classId=${classId}` : ""}`}
              className={`block group bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-white/20 ${c.glow}`}
            >
              <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center ${c.bg} ${c.text} border ${c.border}`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-trace-teal transition-colors font-space-grotesk">
                Modul {i + 1}: {mod.title}
              </h3>
              <p className="text-gray-400 text-sm mb-4 font-inter">{mod.desc}</p>
              <div className="flex items-center gap-1 text-sm text-gray-500 group-hover:text-trace-teal transition-colors font-inter font-medium">
                Mulai
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
