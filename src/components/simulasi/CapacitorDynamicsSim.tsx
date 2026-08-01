"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, Lightbulb, Zap, LineChart } from "lucide-react";

export function CapacitorDynamicsSim() {
  const [capacitance, setCapacitance] = useState(100); // μF
  const [resistance, setResistance] = useState(10); // kΩ
  const [batteryVoltage, setBatteryVoltage] = useState(9); // V
  const [switchState, setSwitchState] = useState<"charge" | "neutral" | "discharge">("neutral");
  const [capVoltage, setCapVoltage] = useState(0);
  const [timeHistory, setTimeHistory] = useState<{ time: number; voltage: number; current: number }[]>([]);
  const [isPlaying, setIsPlaying] = useState(true);

  const requestRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);
  const simTimeRef = useRef<number>(0);
  const initialVoltageRef = useRef<number>(0);

  const rOhms = resistance * 1000;
  const cFarads = capacitance * 1e-6;
  const tau = rOhms * cFarads; // seconds

  useEffect(() => {
    initialVoltageRef.current = capVoltage;
    simTimeRef.current = 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [switchState]);

  useEffect(() => {
    const loop = (time: number) => {
      if (previousTimeRef.current !== null && isPlaying) {
        const dt = Math.min((time - previousTimeRef.current) / 1000, 0.1);
        simTimeRef.current += dt;

        let nextVoltage = capVoltage;
        let current = 0;

        if (switchState === "charge") {
          const V0 = initialVoltageRef.current;
          nextVoltage = batteryVoltage - (batteryVoltage - V0) * Math.exp(-simTimeRef.current / tau);
          current = ((batteryVoltage - nextVoltage) / rOhms) * 1000; // mA
        } else if (switchState === "discharge") {
          const V0 = initialVoltageRef.current;
          nextVoltage = V0 * Math.exp(-simTimeRef.current / tau);
          current = -(nextVoltage / rOhms) * 1000; // mA
        } else {
          nextVoltage = Math.max(0, capVoltage - 0.01 * dt);
          current = 0;
        }

        setCapVoltage(nextVoltage);

        setTimeHistory((prev) => {
          const lastEntry = prev[prev.length - 1];
          const newTime = lastEntry ? lastEntry.time + dt : 0;
          const nextHistory = [...prev, { time: newTime, voltage: nextVoltage, current }];
          if (nextHistory.length > 120) {
            nextHistory.shift();
          }
          return nextHistory;
        });
      }
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(loop);
    };

    requestRef.current = requestAnimationFrame(loop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [switchState, isPlaying, batteryVoltage, tau, rOhms]);

  const resetSim = () => {
    setSwitchState("neutral");
    setCapVoltage(0);
    setTimeHistory([]);
    simTimeRef.current = 0;
    initialVoltageRef.current = 0;
    previousTimeRef.current = null;
  };

  // SVG graph
  const graphWidth = 400;
  const graphHeight = 140;
  const voltagePoints = timeHistory
    .map((p, i) => {
      const x = (i / 120) * graphWidth;
      const y = graphHeight - (p.voltage / (batteryVoltage || 1)) * graphHeight;
      return `${x},${y}`;
    })
    .join(" ");

  const currentPoints = timeHistory
    .map((p, i) => {
      const x = (i / 120) * graphWidth;
      const maxCurrent = (batteryVoltage / rOhms) * 1000;
      const normalizedCurrent = Math.abs(p.current) / (maxCurrent || 1);
      const y = graphHeight - normalizedCurrent * graphHeight;
      return `${x},${y}`;
    })
    .join(" ");

  const chargePercent = batteryVoltage > 0 ? Math.min(100, (capVoltage / batteryVoltage) * 100) : 0;
  const bulbIntensity = switchState === "discharge" ? Math.min(1, capVoltage / batteryVoltage) : 0;

  return (
    <div className="w-full max-w-5xl mx-auto bg-white/5 rounded-2xl p-8 border border-white/10 backdrop-blur-sm shadow-2xl text-white">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold font-space-grotesk bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-500">
          Dinamika Kapasitor (Pengisian & Pengosongan RC)
        </h3>
        <p className="text-gray-400 font-inter">τ = R × C = {(tau * 1000).toFixed(1)} ms</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="space-y-4">
          <div className="bg-black/30 p-4 rounded-xl border border-white/10 space-y-4">
            <div>
              <label className="text-sm text-gray-400 font-inter">Kapasitansi (C)</label>
              <input type="range" min="10" max="1000" step="10" value={capacitance}
                onChange={(e) => setCapacitance(Number(e.target.value))}
                className="w-full h-2 bg-pink-900/50 rounded-lg appearance-none cursor-pointer accent-pink-500"
              />
              <div className="text-right font-jetbrains-mono text-pink-300">{capacitance} μF</div>
            </div>
            <div>
              <label className="text-sm text-gray-400 font-inter">Hambatan (R)</label>
              <input type="range" min="1" max="100" value={resistance}
                onChange={(e) => setResistance(Number(e.target.value))}
                className="w-full h-2 bg-orange-900/50 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
              <div className="text-right font-jetbrains-mono text-orange-300">{resistance} kΩ</div>
            </div>
            <div>
              <label className="text-sm text-gray-400 font-inter">Tegangan Baterai (V)</label>
              <input type="range" min="1" max="12" value={batteryVoltage}
                onChange={(e) => setBatteryVoltage(Number(e.target.value))}
                className="w-full h-2 bg-blue-900/50 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="text-right font-jetbrains-mono text-blue-300">{batteryVoltage} V</div>
            </div>
          </div>

          {/* Switch Controls */}
          <div className="bg-black/30 p-4 rounded-xl border border-white/10 space-y-2">
            <p className="text-sm text-gray-400 font-inter mb-2">Posisi Saklar:</p>
            <div className="grid grid-cols-3 gap-2">
              {(["charge", "neutral", "discharge"] as const).map((state) => (
                <button
                  key={state}
                  onClick={() => setSwitchState(state)}
                  className={`py-2 rounded-lg text-xs font-bold border transition-all font-space-grotesk ${
                    switchState === state
                      ? state === "charge" ? "bg-blue-500/20 border-blue-500 text-blue-300"
                        : state === "discharge" ? "bg-amber-500/20 border-amber-500 text-amber-300"
                        : "bg-gray-500/20 border-gray-500 text-gray-300"
                      : "bg-black/40 border-white/10 text-gray-500"
                  }`}
                >
                  {state === "charge" ? "⚡ Isi" : state === "discharge" ? "💡 Kosong" : "⏸ Netral"}
                </button>
              ))}
            </div>
          </div>

          {/* Playback */}
          <div className="flex gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex-1 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-all font-space-grotesk text-sm flex items-center justify-center gap-2"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? "Jeda" : "Putar"}
            </button>
            <button
              onClick={resetSim}
              className="py-2 px-4 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Visualization */}
        <div className="lg:col-span-2 space-y-4">
          {/* Capacitor Visual */}
          <div className="bg-black/40 rounded-xl border border-white/10 p-6 flex items-center justify-center gap-8">
            {/* Capacitor Plates */}
            <div className="relative w-20 h-32 flex flex-col items-center justify-center gap-1">
              <Zap className="w-4 h-4 text-gray-500 absolute -top-5" />
              <div className="w-16 h-1 bg-gray-400 rounded" />
              <div className="relative w-12 h-20 overflow-hidden">
                <div className="absolute bottom-0 left-0 right-0 bg-trace-teal/40 transition-all duration-300"
                  style={{ height: `${chargePercent}%` }}
                />
                <div className="absolute inset-0 border-2 border-gray-500 rounded" />
              </div>
              <div className="w-16 h-1 bg-gray-400 rounded" />
              <div className="text-center font-jetbrains-mono text-sm text-trace-teal mt-1">
                {capVoltage.toFixed(2)}V
              </div>
            </div>

            {/* Arrow */}
            <div className="text-gray-500 text-2xl">→</div>

            {/* Lightbulb */}
            <div className="flex flex-col items-center">
              <motion.div
                animate={{ 
                  opacity: 0.3 + bulbIntensity * 0.7,
                  scale: 0.8 + bulbIntensity * 0.2,
                }}
                className="relative"
              >
                <Lightbulb 
                  className="w-12 h-12 transition-colors duration-300" 
                  style={{ 
                    color: bulbIntensity > 0.1 ? `rgba(250, 204, 21, ${bulbIntensity})` : "#4b5563",
                    filter: bulbIntensity > 0.1 ? `drop-shadow(0 0 ${bulbIntensity * 15}px rgba(250, 204, 21, ${bulbIntensity}))` : "none",
                  }}
                />
              </motion.div>
              <p className="text-xs text-gray-500 mt-2 font-inter">
                {switchState === "discharge" ? "Menyala" : "Mati"}
              </p>
            </div>
          </div>

          {/* Graph */}
          <div className="bg-black/40 rounded-xl border border-white/10 p-4">
            <div className="flex items-center gap-2 mb-2">
              <LineChart className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400 font-inter">Grafik Waktu Nyata</span>
              <div className="flex gap-4 ml-auto text-xs font-inter">
                <span className="text-trace-teal">● Tegangan</span>
                <span className="text-amber-400">● Arus</span>
              </div>
            </div>
            <svg width="100%" viewBox={`0 0 ${graphWidth} ${graphHeight}`} className="overflow-visible">
              {/* Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((f) => (
                <line key={f} x1="0" y1={f * graphHeight} x2={graphWidth} y2={f * graphHeight}
                  stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              ))}
              {/* Voltage line */}
              {voltagePoints && (
                <polyline fill="none" stroke="var(--color-trace-teal)" strokeWidth="2" points={voltagePoints} />
              )}
              {/* Current line */}
              {currentPoints && (
                <polyline fill="none" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="4 2" points={currentPoints} />
              )}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
