import { OhmsLawVisualizer } from "@/components/simulasi/OhmsLawVisualizer";

export default function HukumOhmPage() {
  return (
    <div className="space-y-10">
      <section className="bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl relative overflow-hidden backdrop-blur-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />
        <h2 className="text-3xl font-bold mb-4 text-white font-space-grotesk">
          <span className="text-blue-500">Modul 1:</span> Hukum Ohm — Besaran & Hukum Dasar Listrik
        </h2>
        <div className="bg-blue-950/30 border border-blue-900/50 rounded-xl p-6 relative z-10 backdrop-blur-sm">
          <h3 className="text-lg font-bold text-blue-300 mb-3 flex items-center gap-2 font-space-grotesk">
            🎯 Tujuan Pembelajaran
          </h3>
          <ul className="list-disc list-inside space-y-2 text-gray-300 font-inter">
            <li>Memahami hubungan antara Tegangan (V), Arus (I), dan Hambatan (R).</li>
            <li>Mendefinisikan Hukum Ohm dan menerapkan rumusnya dalam perhitungan dasar.</li>
            <li>Mengidentifikasi secara visual bagaimana perubahan hambatan mempengaruhi aliran arus dalam rangkaian tertutup.</li>
          </ul>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h3 className="text-2xl font-bold text-white mb-2 font-space-grotesk">Visualisasi Hukum Ohm</h3>
          <p className="text-gray-400 font-inter">
            Gerakkan slider di bawah untuk melihat bagaimana Tegangan dan Hambatan mempengaruhi Arus secara real-time.
          </p>
        </div>
        <OhmsLawVisualizer />
      </section>

      <div className="pt-8 border-t border-white/10">
        <h3 className="text-xl font-bold text-white font-space-grotesk mb-3">Ringkasan</h3>
        <p className="text-gray-300 leading-relaxed font-inter">
          Hukum Ohm menyatakan bahwa arus yang mengalir melalui konduktor antara dua titik berbanding lurus dengan tegangan di kedua titik tersebut.
          Ketika tegangan (gaya dorong) dinaikkan, arus meningkat. Ketika hambatan (penghalang) dinaikkan, arus menurun.
          Gunakan visualisasi ini untuk membangun pemahaman intuitif tentang hukum dasar ini sebelum lanjut ke rangkaian yang lebih kompleks.
        </p>
      </div>
    </div>
  );
}
