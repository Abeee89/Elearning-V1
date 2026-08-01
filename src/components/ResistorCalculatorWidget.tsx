"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info, HelpCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";

const BANDS_DIGIT = [
  { color: "Hitam", value: 0, hex: "#09090b", border: "border-slate-800", text: "text-white" },
  { color: "Cokelat", value: 1, hex: "#78350f", border: "border-amber-900", text: "text-white" },
  { color: "Merah", value: 2, hex: "#dc2626", border: "border-red-800", text: "text-white" },
  { color: "Oranye", value: 3, hex: "#ea580c", border: "border-orange-850", text: "text-white" },
  { color: "Kuning", value: 4, hex: "#eab308", border: "border-yellow-700", text: "text-black" },
  { color: "Hijau", value: 5, hex: "#16a34a", border: "border-green-800", text: "text-white" },
  { color: "Biru", value: 6, hex: "#2563eb", border: "border-blue-800", text: "text-white" },
  { color: "Ungu", value: 7, hex: "#d946ef", border: "border-pink-800", text: "text-white" },
  { color: "Abu-abu", value: 8, hex: "#4b5563", border: "border-gray-700", text: "text-white" },
  { color: "Putih", value: 9, hex: "#fafafa", border: "border-gray-300", text: "text-black" },
];

const MULTIPLIERS = [
  { color: "Hitam", mult: 1, hex: "#09090b", label: "1 Ω" },
  { color: "Cokelat", mult: 10, hex: "#78350f", label: "10 Ω" },
  { color: "Merah", mult: 100, hex: "#dc2626", label: "100 Ω" },
  { color: "Oranye", mult: 1000, hex: "#ea580c", label: "1 kΩ" },
  { color: "Kuning", mult: 10000, hex: "#eab308", label: "10 kΩ" },
  { color: "Hijau", mult: 100000, hex: "#16a34a", label: "100 kΩ" },
  { color: "Biru", mult: 1000000, hex: "#2563eb", label: "1 MΩ" },
  { color: "Ungu", mult: 10000000, hex: "#d946ef", label: "10 MΩ" },
  { color: "Emas", mult: 0.1, hex: "#fbbf24", label: "0.1 Ω" },
  { color: "Perak", mult: 0.01, hex: "#9ca3af", label: "0.01 Ω" },
];

const TOLERANCES = [
  { color: "Cokelat", tol: "±1%", hex: "#78350f" },
  { color: "Merah", tol: "±2%", hex: "#dc2626" },
  { color: "Hijau", tol: "±0.5%", hex: "#16a34a" },
  { color: "Biru", tol: "±0.25%", hex: "#2563eb" },
  { color: "Ungu", tol: "±0.1%", hex: "#d946ef" },
  { color: "Abu-abu", tol: "±0.05%", hex: "#4b5563" },
  { color: "Emas", tol: "±5%", hex: "#fbbf24" },
  { color: "Perak", tol: "±10%", hex: "#9ca3af" },
];

export function ResistorCalculatorWidget() {
  const [numBands, setNumBands] = useState<4 | 5>(4);
  const [b1, setB1] = useState(1); // Cokelat (1)
  const [b2, setB2] = useState(0); // Hitam (0)
  const [b3, setB3] = useState(0); // Hitam (0) - 5-band saja
  const [mult, setMult] = useState(2); // Merah (x100)
  const [tol, setTol] = useState(6); // Emas (5%)
  const [showGuide, setShowGuide] = useState(false);

  // Hitung Hambatan
  const digitValue = numBands === 4 
    ? (BANDS_DIGIT[b1].value * 10 + BANDS_DIGIT[b2].value)
    : (BANDS_DIGIT[b1].value * 100 + BANDS_DIGIT[b2].value * 10 + BANDS_DIGIT[b3].value);

  const resistance = digitValue * MULTIPLIERS[mult].mult;

  const formatResistance = (r: number) => {
    if (r >= 1000000) return `${(r / 1000000).toFixed(r % 1000000 === 0 ? 0 : 2)} MΩ`;
    if (r >= 1000) return `${(r / 1000).toFixed(r % 1000 === 0 ? 0 : 2)} kΩ`;
    return `${r.toFixed(r % 1 === 0 ? 0 : 2)} Ω`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Kartu Informasi Komponen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-black/40 border border-white/10 p-6 rounded-2xl flex flex-col items-center shadow-lg backdrop-blur-sm">
          <div className="w-20 h-20 mb-4 relative flex items-center justify-center">
            <div className="w-full h-6 bg-[#d2b48c] rounded border border-[#8b4513] relative overflow-hidden flex shadow-inner">
              <div className="absolute top-0 bottom-0 left-3 w-2.5 bg-red-650" />
              <div className="absolute top-0 bottom-0 left-7 w-2.5 bg-amber-800" />
              <div className="absolute top-0 bottom-0 left-11 w-2.5 bg-[#ea580c]" />
              <div className="absolute top-0 bottom-0 right-3 w-3 bg-[#fbbf24]" />
            </div>
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-500 -z-10 -translate-y-1/2 scale-x-125" />
          </div>
          <h4 className="text-lg font-bold text-white font-space-grotesk">Resistor</h4>
          <p className="text-xs text-gray-400 text-center mt-2 font-inter">Menghambat aliran arus listrik dalam sirkuit. Diukur dalam Ohm (Ω).</p>
        </div>

        <div className="bg-black/40 border border-white/10 p-6 rounded-2xl flex flex-col items-center shadow-lg backdrop-blur-sm">
          <div className="w-20 h-20 mb-4 flex items-center justify-center relative">
            <div className="w-14 h-14 bg-blue-500/10 border-2 border-blue-500/30 rounded-full flex items-center justify-center">
              <div className="flex gap-1.5 h-6">
                <div className="w-1.5 bg-blue-400 rounded-sm" />
                <div className="w-1.5 bg-blue-400 rounded-sm" />
              </div>
            </div>
          </div>
          <h4 className="text-lg font-bold text-white font-space-grotesk">Kapasitor</h4>
          <p className="text-xs text-gray-400 text-center mt-2 font-inter">Menyimpan energi potensial listrik dalam medan listrik. Diukur dalam Farad (F).</p>
        </div>

        <div className="bg-black/40 border border-white/10 p-6 rounded-2xl flex flex-col items-center shadow-lg backdrop-blur-sm">
          <div className="w-20 h-20 mb-4 flex items-center justify-center relative">
            <svg width="50" height="30" viewBox="0 0 100 50">
              <path d="M 0 25 L 20 25 Q 30 -5 40 25 Q 50 -5 60 25 Q 70 -5 80 25 L 100 25" fill="none" stroke="#d946ef" strokeWidth="6" strokeLinecap="round" />
            </svg>
          </div>
          <h4 className="text-lg font-bold text-white font-space-grotesk">Induktor</h4>
          <p className="text-xs text-gray-400 text-center mt-2 font-inter">Menyimpan energi dalam medan magnet ketika dilewati arus listrik. Diukur dalam Henry (H).</p>
        </div>
      </div>

      {/* Kalkulator Utama */}
      <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-xl md:text-2xl font-bold font-space-grotesk text-white">
              Kalkulator Kode Warna Resistor
            </CardTitle>
            <CardDescription className="font-inter">
              Hitung nilai resistansi berdasarkan kode warna gelang resistor.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowGuide(!showGuide)}
              className="p-2 text-gray-400 hover:text-white transition-colors bg-white/5 rounded-xl border border-white/10"
              title="Tampilkan Tabel Kode Warna"
            >
              <Info className="w-4 h-4" />
            </button>
            <div className="bg-black/40 p-1 rounded-xl border border-white/10 flex gap-1 font-inter">
              <button
                onClick={() => setNumBands(4)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  numBands === 4 
                    ? "bg-trace-teal text-black shadow-lg" 
                    : "text-gray-400 hover:text-white"
                }`}
              >
                4-Gelang
              </button>
              <button
                onClick={() => setNumBands(5)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  numBands === 5 
                    ? "bg-trace-teal text-black shadow-lg" 
                    : "text-gray-400 hover:text-white"
                }`}
              >
                5-Gelang
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Visual Resistor Body */}
          <div className="bg-black/30 rounded-xl p-8 border border-white/5 flex flex-col md:flex-row items-center gap-8 justify-between mb-8">
            <div className="flex-1 w-full flex justify-center py-8 relative overflow-visible">
              {/* Kawat Resistor */}
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-600/70 -translate-y-1/2 rounded" />

              {/* Badan Resistor */}
              <div className="w-72 h-20 bg-[#e3b88d] rounded-full border border-[#8b6b4c] relative flex items-center justify-between px-8 shadow-2xl z-10">
                
                {/* Gelang Warna Dinamis */}
                <div
                  className="w-4 h-full transition-all duration-300 shadow-md rounded-sm"
                  style={{ backgroundColor: BANDS_DIGIT[b1].hex }}
                />
                <div
                  className="w-4 h-full transition-all duration-300 shadow-md rounded-sm"
                  style={{ backgroundColor: BANDS_DIGIT[b2].hex }}
                />
                {numBands === 5 && (
                  <div
                    className="w-4 h-full transition-all duration-300 shadow-md rounded-sm"
                    style={{ backgroundColor: BANDS_DIGIT[b3].hex }}
                  />
                )}
                <div
                  className="w-4 h-full transition-all duration-300 shadow-md rounded-sm"
                  style={{ backgroundColor: MULTIPLIERS[mult].hex }}
                />
                <div
                  className="w-4 h-full transition-all duration-300 shadow-md rounded-sm"
                  style={{ backgroundColor: TOLERANCES[tol].hex }}
                />
              </div>
            </div>

            <div className="w-full md:w-80 space-y-4">
              <div className="bg-black/40 border border-white/15 p-4 rounded-xl flex justify-between items-center shadow-lg">
                <span className="text-xs text-gray-400 font-medium font-inter">Nilai Resistansi</span>
                <span className="text-2xl font-bold font-jetbrains-mono text-trace-teal">{formatResistance(resistance)}</span>
              </div>
              <div className="bg-black/40 border border-white/15 p-4 rounded-xl flex justify-between items-center shadow-lg">
                <span className="text-xs text-gray-400 font-medium font-inter">Rentang Toleransi</span>
                <span className="text-lg font-bold font-jetbrains-mono text-blue-400">{TOLERANCES[tol].tol}</span>
              </div>
            </div>
          </div>

          {/* Grid Pemilih Warna Gelang */}
          <div className={`grid grid-cols-2 ${numBands === 4 ? "md:grid-cols-4" : "md:grid-cols-5"} gap-4 font-inter`}>
            <div>
              <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-2 block">Gelang 1</label>
              <select
                value={b1}
                onChange={(e) => setB1(Number(e.target.value))}
                className="w-full bg-black/60 border border-white/10 text-white rounded-xl p-2.5 text-sm focus:outline-none focus:border-trace-teal font-jetbrains-mono"
              >
                {BANDS_DIGIT.map((b, i) => (
                  <option key={i} value={i} className="bg-zinc-950 text-white">
                    {b.color} ({b.value})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-2 block">Gelang 2</label>
              <select
                value={b2}
                onChange={(e) => setB2(Number(e.target.value))}
                className="w-full bg-black/60 border border-white/10 text-white rounded-xl p-2.5 text-sm focus:outline-none focus:border-trace-teal font-jetbrains-mono"
              >
                {BANDS_DIGIT.map((b, i) => (
                  <option key={i} value={i} className="bg-zinc-950 text-white">
                    {b.color} ({b.value})
                  </option>
                ))}
              </select>
            </div>

            {numBands === 5 && (
              <div>
                <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-2 block">Gelang 3</label>
                <select
                  value={b3}
                  onChange={(e) => setB3(Number(e.target.value))}
                  className="w-full bg-black/60 border border-white/10 text-white rounded-xl p-2.5 text-sm focus:outline-none focus:border-trace-teal font-jetbrains-mono"
                >
                  {BANDS_DIGIT.map((b, i) => (
                    <option key={i} value={i} className="bg-zinc-950 text-white">
                      {b.color} ({b.value})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-2 block">Pengali</label>
              <select
                value={mult}
                onChange={(e) => setMult(Number(e.target.value))}
                className="w-full bg-black/60 border border-white/10 text-white rounded-xl p-2.5 text-sm focus:outline-none focus:border-trace-teal font-jetbrains-mono"
              >
                {MULTIPLIERS.map((b, i) => (
                  <option key={i} value={i} className="bg-zinc-950 text-white">
                    {b.color} ({b.label})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-2 block">Toleransi</label>
              <select
                value={tol}
                onChange={(e) => setTol(Number(e.target.value))}
                className="w-full bg-black/60 border border-white/10 text-white rounded-xl p-2.5 text-sm focus:outline-none focus:border-trace-teal font-jetbrains-mono"
              >
                {TOLERANCES.map((t, i) => (
                  <option key={i} value={i} className="bg-zinc-950 text-white">
                    {t.color} ({t.tol})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Laci Referensi Cepat Kode Warna */}
          <AnimatePresence>
            {showGuide && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden mt-8 border-t border-white/10 pt-6"
              >
                <h4 className="text-white font-semibold mb-4 flex items-center gap-2 font-space-grotesk">
                  <HelpCircle className="w-4 h-4 text-trace-teal" />
                  Tabel Acuan Cepat Kode Warna Resistor
                </h4>
                <div className="overflow-x-auto rounded-xl border border-white/10">
                  <table className="w-full text-xs text-gray-300 text-left border-collapse font-inter">
                    <thead>
                      <tr className="border-b border-white/10 text-gray-400 bg-white/5">
                        <th className="py-2.5 px-3">Warna</th>
                        <th className="py-2.5 px-3 text-center">Digit</th>
                        <th className="py-2.5 px-3 text-center">Pengali</th>
                        <th className="py-2.5 px-3 text-center">Toleransi</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-white/5">
                        <td className="py-2 px-3 font-semibold text-white bg-zinc-950 border-r border-white/5">Hitam</td>
                        <td className="py-2 px-3 text-center">0</td>
                        <td className="py-2 px-3 text-center">x1</td>
                        <td className="py-2 px-3 text-center">-</td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="py-2 px-3 font-semibold text-amber-700 bg-zinc-950 border-r border-white/5">Cokelat</td>
                        <td className="py-2 px-3 text-center">1</td>
                        <td className="py-2 px-3 text-center">x10</td>
                        <td className="py-2 px-3 text-center">±1%</td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="py-2 px-3 font-semibold text-red-500 bg-zinc-950 border-r border-white/5">Merah</td>
                        <td className="py-2 px-3 text-center">2</td>
                        <td className="py-2 px-3 text-center">x100</td>
                        <td className="py-2 px-3 text-center">±2%</td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="py-2 px-3 font-semibold text-orange-500 bg-zinc-950 border-r border-white/5">Oranye</td>
                        <td className="py-2 px-3 text-center">3</td>
                        <td className="py-2 px-3 text-center">x1k</td>
                        <td className="py-2 px-3 text-center">-</td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="py-2 px-3 font-semibold text-yellow-550 bg-zinc-950 border-r border-white/5">Kuning</td>
                        <td className="py-2 px-3 text-center">4</td>
                        <td className="py-2 px-3 text-center">x10k</td>
                        <td className="py-2 px-3 text-center">-</td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="py-2 px-3 font-semibold text-green-500 bg-zinc-950 border-r border-white/5">Hijau</td>
                        <td className="py-2 px-3 text-center">5</td>
                        <td className="py-2 px-3 text-center">x100k</td>
                        <td className="py-2 px-3 text-center">±0.5%</td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="py-2 px-3 font-semibold text-blue-500 bg-zinc-950 border-r border-white/5">Biru</td>
                        <td className="py-2 px-3 text-center">6</td>
                        <td className="py-2 px-3 text-center">x1M</td>
                        <td className="py-2 px-3 text-center">±0.25%</td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="py-2 px-3 font-semibold text-pink-500 bg-zinc-950 border-r border-white/5">Ungu</td>
                        <td className="py-2 px-3 text-center">7</td>
                        <td className="py-2 px-3 text-center">x10M</td>
                        <td className="py-2 px-3 text-center">±0.1%</td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="py-2 px-3 font-semibold text-yellow-500 bg-zinc-950 border-r border-white/5">Emas</td>
                        <td className="py-2 px-3 text-center">-</td>
                        <td className="py-2 px-3 text-center">x0.1</td>
                        <td className="py-2 px-3 text-center">±5%</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-semibold text-gray-400 bg-zinc-950 border-r border-white/5">Perak</td>
                        <td className="py-2 px-3 text-center">-</td>
                        <td className="py-2 px-3 text-center">x0.01</td>
                        <td className="py-2 px-3 text-center">±10%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
