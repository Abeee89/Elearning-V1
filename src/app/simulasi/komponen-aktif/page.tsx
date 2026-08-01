import { ActiveComponentsSim } from "@/components/simulasi/ActiveComponentsSim";

export default function KomponenAktifPage() {
  return (
    <div className="space-y-10">
      <section className="bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl relative overflow-hidden backdrop-blur-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />
        <h2 className="text-3xl font-bold mb-4 text-white font-space-grotesk">
          <span className="text-purple-500">Modul 4:</span> Komponen Elektronika Aktif
        </h2>
        <div className="bg-purple-950/30 border border-purple-900/50 rounded-xl p-6 relative z-10 backdrop-blur-sm">
          <h3 className="text-lg font-bold text-purple-300 mb-3 flex items-center gap-2 font-space-grotesk">
            🎯 Tujuan Pembelajaran
          </h3>
          <ul className="list-disc list-inside space-y-2 text-gray-300 font-inter">
            <li>Memahami fungsi komponen aktif yang memerlukan sumber daya.</li>
            <li>Menjelaskan cara kerja dioda PN junction pada bias maju dan bias mundur.</li>
            <li>Mengidentifikasi daerah deplesi dan perannya dalam mengontrol aliran elektron.</li>
          </ul>
        </div>
      </section>

      <section>
        <ActiveComponentsSim />
      </section>
    </div>
  );
}
