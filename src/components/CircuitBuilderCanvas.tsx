"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wrench, Play, RotateCcw } from "lucide-react";

export function CircuitBuilderCanvas() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <Card className="bg-black/40 border-white/10 backdrop-blur-sm h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-space-grotesk text-white flex items-center">
          <Wrench className="w-5 h-5 mr-2 text-trace-teal" />
          Rangkaian Sederhana
        </CardTitle>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="border-trace-teal text-trace-teal hover:bg-trace-teal hover:text-black"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            <Play className="w-4 h-4 mr-2" />
            {isPlaying ? "Hentikan Simulasi" : "Mulai Simulasi"}
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-[400px] relative bg-grid-white/[0.02] bg-[size:20px_20px]">
        {/* Placeholder for Circuit Builder Canvas */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-white/20 font-jetbrains-mono border border-dashed border-white/20 px-8 py-4 rounded-lg bg-black/20">
            [Area Canvas Rangkaian Elektronika]
          </p>
        </div>
        
        {isPlaying && (
          <div className="absolute inset-x-0 top-0 h-1 bg-trace-teal/50 shadow-[0_0_10px_rgba(45,212,191,0.5)] animate-pulse"></div>
        )}
      </CardContent>
    </Card>
  );
}
