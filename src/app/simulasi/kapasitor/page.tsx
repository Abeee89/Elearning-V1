import { CapacitorDynamicsSim } from "@/components/simulasi/CapacitorDynamicsSim";

export default function KapasitorPage() {
  return (
    <div className="space-y-10">
      <section className="bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl relative overflow-hidden backdrop-blur-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 blur-[100px] rounded-full pointer-events-none" />
        <h2 className="text-3xl font-bold mb-4 text-white font-space-grotesk">
          <span className="text-pink-500">Modul 6:</span> Dinamika Kapasitor
        </h2>
        <div className="bg-pink-950/30 border border-pink-900/50 rounded-xl p-6 relative z-10 backdrop-blur-sm">
          <h3 className="text-lg font-bold text-pink-300 mb-3 flex items-center gap-2 font-space-grotesk">
            🎯 Tujuan Pembelajaran
          </h3>
          <ul className="list-disc list-inside space-y-2 text-gray-300 font-inter">
            <li>Memahami perilaku matematika dan fisika penyimpanan potensial listrik.</li>
            <li>Mengisi kapasitor dari sumber DC dan menganalisis konstanta waktu (τ = RC).</li>
            <li>Mengamati pengosongan energi melalui beban lampu secara real-time.</li>
          </ul>
        </div>
      </section>

      <section>
        <CapacitorDynamicsSim />
      </section>
    </div>
  );
}
