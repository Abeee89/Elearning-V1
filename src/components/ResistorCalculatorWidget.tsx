"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

const colorValues: Record<string, { value: number, multiplier: number, tolerance?: number, colorCode: string }> = {
  black: { value: 0, multiplier: 1, colorCode: "bg-black" },
  brown: { value: 1, multiplier: 10, tolerance: 1, colorCode: "bg-amber-900" },
  red: { value: 2, multiplier: 100, tolerance: 2, colorCode: "bg-red-600" },
  orange: { value: 3, multiplier: 1000, colorCode: "bg-orange-500" },
  yellow: { value: 4, multiplier: 10000, colorCode: "bg-yellow-400" },
  green: { value: 5, multiplier: 100000, tolerance: 0.5, colorCode: "bg-green-600" },
  blue: { value: 6, multiplier: 1000000, tolerance: 0.25, colorCode: "bg-blue-600" },
  violet: { value: 7, multiplier: 10000000, tolerance: 0.1, colorCode: "bg-violet-600" },
  gray: { value: 8, multiplier: 100000000, tolerance: 0.05, colorCode: "bg-gray-500" },
  white: { value: 9, multiplier: 1000000000, colorCode: "bg-white" },
  gold: { value: -1, multiplier: 0.1, tolerance: 5, colorCode: "bg-yellow-600" },
  silver: { value: -1, multiplier: 0.01, tolerance: 10, colorCode: "bg-gray-300" },
};

const band1Colors = ["brown", "red", "orange", "yellow", "green", "blue", "violet", "gray", "white"];
const band2Colors = ["black", "brown", "red", "orange", "yellow", "green", "blue", "violet", "gray", "white"];
const multiplierColors = ["black", "brown", "red", "orange", "yellow", "green", "blue", "violet", "gray", "white", "gold", "silver"];
const toleranceColors = ["brown", "red", "green", "blue", "violet", "gray", "gold", "silver"];

export function ResistorCalculatorWidget() {
  const [band1, setBand1] = useState("red");
  const [band2, setBand2] = useState("red");
  const [multiplier, setMultiplier] = useState("brown");
  const [tolerance, setTolerance] = useState("gold");

  const calculateResistance = () => {
    const b1 = colorValues[band1].value;
    const b2 = colorValues[band2].value;
    const mult = colorValues[multiplier].multiplier;
    
    let resistance = ((b1 * 10) + b2) * mult;
    let unit = "Ω";
    
    if (resistance >= 1000000) {
      resistance = resistance / 1000000;
      unit = "MΩ";
    } else if (resistance >= 1000) {
      resistance = resistance / 1000;
      unit = "kΩ";
    }

    return `${resistance} ${unit}`;
  };

  return (
    <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl font-space-grotesk text-white">Kalkulator Resistor 4 Gelang</CardTitle>
        <CardDescription>Hitung nilai resistansi berdasarkan kode warna</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center mb-8">
          <div className="relative w-64 h-16 flex items-center">
             <div className="absolute w-full h-2 bg-gray-400 top-1/2 -translate-y-1/2 z-0 rounded"></div>
             <div className="absolute w-40 h-12 bg-amber-100 left-1/2 -translate-x-1/2 rounded-full border border-gray-400 z-10 overflow-hidden flex items-center justify-around px-2 shadow-inner">
                <div className={`w-4 h-full ${colorValues[band1].colorCode}`}></div>
                <div className={`w-4 h-full ${colorValues[band2].colorCode}`}></div>
                <div className={`w-4 h-full ${colorValues[multiplier].colorCode}`}></div>
                <div className={`w-4 h-full ${colorValues[tolerance].colorCode} ml-4`}></div>
             </div>
          </div>
        </div>

        <div className="text-center mb-8">
          <div className="text-4xl font-bold font-jetbrains-mono text-trace-teal shadow-[0_0_10px_rgba(45,212,191,0.3)] inline-block p-4 rounded-lg bg-black/50 border border-trace-teal/30">
            {calculateResistance()} ±{colorValues[tolerance].tolerance}%
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label className="text-white/70 text-xs uppercase tracking-wider">Gelang 1</Label>
            <select 
              value={band1} 
              onChange={(e) => setBand1(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-md p-2 text-white font-jetbrains-mono text-sm"
            >
              {band1Colors.map(c => <option key={c} value={c} className="bg-black text-white">{c.toUpperCase()}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label className="text-white/70 text-xs uppercase tracking-wider">Gelang 2</Label>
            <select 
              value={band2} 
              onChange={(e) => setBand2(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-md p-2 text-white font-jetbrains-mono text-sm"
            >
              {band2Colors.map(c => <option key={c} value={c} className="bg-black text-white">{c.toUpperCase()}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label className="text-white/70 text-xs uppercase tracking-wider">Pengali</Label>
            <select 
              value={multiplier} 
              onChange={(e) => setMultiplier(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-md p-2 text-white font-jetbrains-mono text-sm"
            >
              {multiplierColors.map(c => <option key={c} value={c} className="bg-black text-white">{c.toUpperCase()}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label className="text-white/70 text-xs uppercase tracking-wider">Toleransi</Label>
            <select 
              value={tolerance} 
              onChange={(e) => setTolerance(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-md p-2 text-white font-jetbrains-mono text-sm"
            >
              {toleranceColors.map(c => <option key={c} value={c} className="bg-black text-white">{c.toUpperCase()}</option>)}
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
