"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Power, ShieldAlert, ZapOff, CheckCircle } from "lucide-react";

const APPLIANCES = [
  { name: "Lampu LED", power: 15 },
  { name: "Kipas Angin", power: 75 },
  { name: "Komputer", power: 450 },
  { name: "AC", power: 1500 },
  { name: "Pemanas", power: 3000 },
];

const MCBS = [2, 6, 10, 16, 20];

export function CircuitSafetySim() {
  const [selectedAppliances, setSelectedAppliances] = useState<number[]>([]);
  const [mcbRating, setMcbRating] = useState<number>(6);
  const [isPoweredOn, setIsPoweredOn] = useState(false);

  const VOLTAGE = 220;
  const totalPower = selectedAppliances.reduce((sum, idx) => sum + APPLIANCES[idx].power, 0);
  const totalCurrent = totalPower / VOLTAGE;
  
  const isTripped = isPoweredOn && totalCurrent > mcbRating;

  const toggleAppliance = (idx: number) => {
    setIsPoweredOn(false);
    if (selectedAppliances.includes(idx)) {
      setSelectedAppliances(selectedAppliances.filter((i) => i !== idx));
    } else {
      setSelectedAppliances([...selectedAppliances, idx]);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white/5 rounded-2xl p-8 border border-white/10 backdrop-blur-sm shadow-2xl text-white">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold font-space-grotesk bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-500">
          Simulator Beban Lebih & Keamanan
        </h3>
        <p className="text-gray-400 font-inter">Sistem 220V. Rumus: I = P / V</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Controls */}
        <div className="space-y-6">
          <div className="bg-black/30 p-4 rounded-xl border border-white/10">
            <h4 className="font-bold font-space-grotesk text-gray-300 mb-3 flex items-center gap-2">
              <Power className="w-4 h-4" /> 1. Pilih Peralatan yang Terhubung
            </h4>
            <div className="flex flex-wrap gap-2">
              {APPLIANCES.map((app, idx) => (
                <button
                  key={idx}
                  onClick={() => toggleAppliance(idx)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-all border font-inter ${
                    selectedAppliances.includes(idx)
                      ? "bg-orange-500/20 border-orange-500 text-orange-300"
                      : "bg-black/40 border-white/10 text-gray-400 hover:bg-white/5"
                  }`}
                >
                  {app.name} <span className="opacity-60">({app.power}W)</span>
                </button>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-white/10 flex justify-between font-inter">
              <span className="text-gray-400">Total Beban:</span>
              <span className="font-jetbrains-mono text-xl text-orange-400 font-bold">{totalPower} W</span>
            </div>
            <div className="flex justify-between font-inter">
              <span className="text-gray-400">Arus yang Diharapkan:</span>
              <span className="font-jetbrains-mono text-xl text-yellow-400 font-bold">{totalCurrent.toFixed(2)} A</span>
            </div>
          </div>

          <div className="bg-black/30 p-4 rounded-xl border border-white/10">
            <h4 className="font-bold font-space-grotesk text-gray-300 mb-3 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" /> 2. Pilih Rating MCB
            </h4>
            <div className="flex gap-2">
              {MCBS.map((m) => (
                <button
                  key={m}
                  onClick={() => { setMcbRating(m); setIsPoweredOn(false); }}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-all font-jetbrains-mono ${
                    mcbRating === m
                      ? "bg-blue-500/20 border-blue-500 text-blue-300"
                      : "bg-black/40 border-white/10 text-gray-500"
                  }`}
                >
                  {m}A
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setIsPoweredOn(!isPoweredOn)}
            disabled={selectedAppliances.length === 0}
            className={`w-full py-3 rounded-xl font-bold text-lg transition-all border font-space-grotesk ${
              isPoweredOn
                ? "bg-red-500/20 border-red-500 text-red-400 hover:bg-red-500/30"
                : "bg-trace-teal/20 border-trace-teal text-trace-teal hover:bg-trace-teal/30"
            } disabled:opacity-30 disabled:cursor-not-allowed`}
          >
            {isPoweredOn ? "⚡ Matikan Daya" : "🔌 Nyalakan Daya"}
          </button>
        </div>

        {/* Visual Result */}
        <div className="flex flex-col gap-4">
          <div className="flex-1 bg-black/40 rounded-xl border border-white/10 p-6 flex flex-col items-center justify-center min-h-[200px] relative overflow-hidden">
            <AnimatePresence mode="wait">
              {!isPoweredOn && (
                <motion.div
                  key="off"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="text-center"
                >
                  <ZapOff className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 font-inter">Daya belum dinyalakan</p>
                  {selectedAppliances.length === 0 && (
                    <p className="text-gray-600 text-sm mt-2 font-inter">Pilih peralatan terlebih dahulu</p>
                  )}
                </motion.div>
              )}

              {isPoweredOn && !isTripped && (
                <motion.div
                  key="safe"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="text-center"
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                  </motion.div>
                  <p className="text-emerald-400 font-bold text-xl font-space-grotesk">AMAN ✅</p>
                  <p className="text-gray-400 text-sm mt-2 font-inter">
                    Arus {totalCurrent.toFixed(2)}A di bawah batas MCB {mcbRating}A
                  </p>
                </motion.div>
              )}

              {isTripped && (
                <motion.div
                  key="tripped"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="text-center"
                >
                  <div className="absolute inset-0 bg-red-500/5 animate-pulse pointer-events-none" />
                  <motion.div
                    animate={{ rotate: [-5, 5, -5] }}
                    transition={{ repeat: Infinity, duration: 0.3 }}
                  >
                    <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  </motion.div>
                  <p className="text-red-500 font-bold text-xl font-space-grotesk">MCB TRIP! ⚠️</p>
                  <p className="text-gray-400 text-sm mt-2 font-inter">
                    Arus {totalCurrent.toFixed(2)}A melebihi batas MCB {mcbRating}A
                  </p>
                  <p className="text-red-400/70 text-xs mt-1 font-inter">
                    MCB memutus daya untuk mencegah kebakaran
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* MCB status bar */}
          <div className="bg-black/30 rounded-xl border border-white/10 p-4">
            <div className="flex justify-between text-sm mb-2 font-inter">
              <span className="text-gray-400">Beban Arus</span>
              <span className="font-jetbrains-mono text-gray-300">{totalCurrent.toFixed(2)}A / {mcbRating}A</span>
            </div>
            <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden border border-white/5">
              <motion.div
                className={`h-full rounded-full ${
                  totalCurrent / mcbRating > 1
                    ? "bg-red-500"
                    : totalCurrent / mcbRating > 0.8
                    ? "bg-yellow-500"
                    : "bg-trace-teal"
                }`}
                animate={{ width: `${Math.min(100, (totalCurrent / mcbRating) * 100)}%` }}
                transition={{ type: "spring", stiffness: 100 }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
