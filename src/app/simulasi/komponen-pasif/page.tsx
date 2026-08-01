import { ResistorCalculatorWidget } from "@/components/ResistorCalculatorWidget";

export default function KomponenPasifPage() {
  return (
    <div className="space-y-10">
      <section className="bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl relative overflow-hidden backdrop-blur-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />
        <h2 className="text-3xl font-bold mb-4 text-white font-space-grotesk">
          <span className="text-emerald-500">Modul 3:</span> Identifikasi Komponen Pasif
        </h2>
        <div className="bg-emerald-950/30 border border-emerald-900/50 rounded-xl p-6 relative z-10 backdrop-blur-sm">
          <h3 className="text-lg font-bold text-emerald-300 mb-3 flex items-center gap-2 font-space-grotesk">
            🎯 Tujuan Pembelajaran
          </h3>
          <ul className="list-disc list-inside space-y-2 text-gray-300 font-inter">
            <li>Membedakan komponen pasif dasar: Resistor, Kapasitor, dan Induktor.</li>
            <li>Membaca nilai resistor menggunakan sistem kode warna 4 dan 5 gelang.</li>
            <li>Menghitung nilai resistansi berdasarkan kode warna yang dipilih.</li>
          </ul>
        </div>
      </section>

      <section className="max-w-4xl mx-auto">
        <ResistorCalculatorWidget />
      </section>

      <div className="pt-8 border-t border-white/10">
        <h3 className="text-xl font-bold text-white font-space-grotesk mb-3">Panduan Kode Warna</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { color: "Hitam", value: "0", code: "bg-black border-gray-600" },
            { color: "Coklat", value: "1", code: "bg-amber-900" },
            { color: "Merah", value: "2", code: "bg-red-600" },
            { color: "Oranye", value: "3", code: "bg-orange-500" },
            { color: "Kuning", value: "4", code: "bg-yellow-400" },
            { color: "Hijau", value: "5", code: "bg-green-600" },
            { color: "Biru", value: "6", code: "bg-blue-600" },
            { color: "Ungu", value: "7", code: "bg-violet-600" },
            { color: "Abu-abu", value: "8", code: "bg-gray-500" },
            { color: "Putih", value: "9", code: "bg-white" },
          ].map((item) => (
            <div key={item.color} className="flex items-center gap-2 bg-black/30 rounded-lg p-2 border border-white/5">
              <div className={`w-6 h-6 rounded border ${item.code}`} />
              <div>
                <div className="text-xs text-white font-space-grotesk">{item.color}</div>
                <div className="text-xs text-gray-500 font-jetbrains-mono">= {item.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
