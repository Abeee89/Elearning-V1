"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Battery, Zap, AlertTriangle } from "lucide-react";

export function OhmsLawVisualizer() {
  const [voltage, setVoltage] = useState(12);
  const [resistance, setResistance] = useState(2);

  const current = voltage / resistance;
  const duration = Math.max(0.2, 5 / current);
  const numParticles = Math.min(20, Math.max(3, current * 2));

  return (
    <div className="w-full max-w-4xl mx-auto bg-white/5 rounded-2xl p-8 border border-white/10 backdrop-blur-sm shadow-2xl text-white">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Controls */}
        <div className="col-span-1 space-y-8 bg-black/30 p-6 rounded-xl border border-white/10">
          <div>
            <h3 className="text-lg font-bold font-space-grotesk flex items-center gap-2 mb-4 text-blue-400">
              <Battery className="w-5 h-5" /> Tegangan (V)
            </h3>
            <input
              type="range"
              min="1"
              max="24"
              value={voltage}
              onChange={(e) => setVoltage(Number(e.target.value))}
              className="w-full h-2 bg-blue-900/50 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="text-right mt-2 text-2xl font-jetbrains-mono text-blue-300">{voltage} V</div>
          </div>

          <div>
            <h3 className="text-lg font-bold font-space-grotesk flex items-center gap-2 mb-4 text-red-400">
              <AlertTriangle className="w-5 h-5" /> Hambatan (R)
            </h3>
            <input
              type="range"
              min="1"
              max="12"
              value={resistance}
              onChange={(e) => setResistance(Number(e.target.value))}
              className="w-full h-2 bg-red-900/50 rounded-lg appearance-none cursor-pointer accent-red-500"
            />
            <div className="text-right mt-2 text-2xl font-jetbrains-mono text-red-300">{resistance} Ω</div>
          </div>

          <div className="pt-4 border-t border-white/10">
            <h3 className="text-lg font-bold font-space-grotesk flex items-center gap-2 mb-2 text-trace-teal">
              <Zap className="w-5 h-5" /> Arus (I) = V / R
            </h3>
            <div className="text-right mt-2 text-4xl font-bold font-jetbrains-mono text-trace-teal">
              {current.toFixed(1)} A
            </div>
          </div>
        </div>

        {/* Visualization area */}
        <div className="col-span-1 md:col-span-2 relative h-64 md:h-auto bg-black/40 rounded-xl border border-white/10 flex items-center justify-center overflow-hidden min-h-[250px]">
          
          {/* Wire Container */}
          <div className="absolute inset-x-8 h-24 bg-gradient-to-r from-blue-900/30 via-purple-900/30 to-trace-teal/10 rounded-full border border-white/10 backdrop-blur-md overflow-hidden">
            
            {/* Particles (Electrons) */}
            {Array.from({ length: Math.floor(numParticles) }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-5 h-5 bg-trace-teal rounded-full blur-[2px] shadow-[0_0_12px_var(--color-trace-teal)]"
                style={{
                  top: `${20 + ((i * 37) % 60)}%`,
                  left: "-10%",
                }}
                animate={{
                  left: "110%",
                }}
                transition={{
                  repeat: Infinity,
                  duration: duration,
                  delay: (i * duration) / numParticles,
                  ease: "linear",
                }}
              />
            ))}
            
            {/* Visual Resistance (The narrowing) */}
            <div className="absolute left-1/2 top-0 bottom-0 w-32 -translate-x-1/2 flex items-center justify-center">
               <motion.div 
                 className="h-full bg-red-500/20 border-x-4 border-red-500/50 flex flex-col justify-between"
                 animate={{
                   width: `${Math.max(10, resistance * 8)}%`,
                 }}
               >
                 <div className="w-full text-center text-red-400/80 font-bold text-[10px] mt-1 font-jetbrains-mono">HAMBATAN</div>
               </motion.div>
            </div>
            
          </div>
          
          <div className="absolute left-2 top-1/2 -translate-y-1/2 text-blue-400 font-bold bg-black/60 p-2 rounded-lg border border-blue-900/50 z-10 shadow-lg text-sm text-center font-jetbrains-mono">
            IN (+) <br/><span className="text-lg">{voltage}V</span>
          </div>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 font-bold bg-black/60 p-2 rounded-lg border border-white/10 z-10 shadow-lg text-sm text-center font-jetbrains-mono">
            OUT (-) <br/><span className="text-lg">0V</span>
          </div>

        </div>
      </div>
    </div>
  );
}
