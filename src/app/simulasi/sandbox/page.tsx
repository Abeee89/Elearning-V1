import { CircuitSandbox } from "@/components/simulasi/CircuitSandbox";

export default function SandboxPage() {
  return (
    <div className="space-y-10">
      <section className="bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl relative overflow-hidden backdrop-blur-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />
        <h2 className="text-3xl font-bold mb-4 text-white font-space-grotesk">
          <span className="text-amber-500">Modul 5:</span> Circuit Sandbox — Rangkaian Bebas
        </h2>
        <div className="bg-amber-950/30 border border-amber-900/50 rounded-xl p-6 relative z-10 backdrop-blur-sm">
          <h3 className="text-lg font-bold text-amber-300 mb-3 flex items-center gap-2 font-space-grotesk">
            🎯 Tujuan Pembelajaran
          </h3>
          <ul className="list-disc list-inside space-y-2 text-gray-300 font-inter">
            <li>Membangun rangkaian dasar menggunakan sumber daya, resistor, dan LED.</li>
            <li>Memverifikasi polaritas rangkaian yang benar.</li>
            <li>Mengidentifikasi konsekuensi hubung singkat dan resistor yang hilang (arus berlebih).</li>
          </ul>
        </div>
      </section>

      <section>
        <CircuitSandbox />
      </section>
    </div>
  );
}
