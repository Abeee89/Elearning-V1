import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Zap, BookOpen, BrainCircuit } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-black/95 flex flex-col font-sans">
      
      {/* Navigation */}
      <nav className="w-full border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center text-white">
            <Zap className="w-6 h-6 text-trace-teal mr-2" />
            <span className="font-space-grotesk font-bold text-xl tracking-tight">Kelistrikan<span className="text-trace-teal">Pro</span></span>
          </div>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-gray-300 hover:text-white">Masuk</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-trace-teal text-black hover:bg-trace-teal/90">Daftar Gratis</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center relative overflow-hidden">
        
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-trace-teal/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-trace-teal/10 border border-trace-teal/20 text-trace-teal text-xs font-jetbrains-mono mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-trace-teal opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-trace-teal"></span>
          </span>
          Versi 1.0 Tersedia Sekarang
        </div>

        <h1 className="text-5xl md:text-7xl font-bold font-space-grotesk text-white tracking-tighter max-w-4xl mb-6">
          Kuasai Dasar Kelistrikan dengan <span className="text-transparent bg-clip-text bg-gradient-to-r from-trace-teal to-blue-400">Mudah & Interaktif</span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-400 font-inter max-w-2xl mb-12">
          Platform pembelajaran modern untuk SMK & SMA. Dilengkapi dengan simulasi interaktif, evaluasi AI, dan asisten virtual 24/7.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link href="/register" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto h-12 px-8 text-base bg-trace-teal text-black hover:bg-trace-teal/90 shadow-[0_0_20px_rgba(45,212,191,0.3)]">
              Mulai Belajar
            </Button>
          </Link>
          <Link href="/login" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto h-12 px-8 text-base border-white/20 text-white hover:bg-white/5">
              Sudah punya akun?
            </Button>
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 max-w-5xl">
           <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm text-left hover:border-trace-teal/30 transition-colors">
              <div className="w-12 h-12 bg-trace-teal/10 rounded-xl flex items-center justify-center mb-4">
                 <BookOpen className="w-6 h-6 text-trace-teal" />
              </div>
              <h3 className="text-white font-space-grotesk font-bold text-xl mb-2">Materi Terstruktur</h3>
              <p className="text-gray-400 text-sm font-inter">Modul pembelajaran yang disesuaikan dengan kurikulum standar industri.</p>
           </div>
           <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm text-left hover:border-trace-teal/30 transition-colors">
              <div className="w-12 h-12 bg-trace-teal/10 rounded-xl flex items-center justify-center mb-4">
                 <Zap className="w-6 h-6 text-trace-teal" />
              </div>
              <h3 className="text-white font-space-grotesk font-bold text-xl mb-2">Simulasi Interaktif</h3>
              <p className="text-gray-400 text-sm font-inter">Praktek langsung dengan kalkulator warna resistor dan simulasi sirkuit virtual.</p>
           </div>
           <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm text-left hover:border-trace-teal/30 transition-colors">
              <div className="w-12 h-12 bg-trace-teal/10 rounded-xl flex items-center justify-center mb-4">
                 <BrainCircuit className="w-6 h-6 text-trace-teal" />
              </div>
              <h3 className="text-white font-space-grotesk font-bold text-xl mb-2">Didukung AI</h3>
              <p className="text-gray-400 text-sm font-inter">Dapatkan evaluasi personal dan tanya jawab materi kelistrikan 24/7 dengan asisten AI.</p>
           </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-white/10 py-8 text-center">
         <p className="text-gray-500 text-sm font-jetbrains-mono">© 2026 Platform Pembelajaran Interaktif Kelistrikan</p>
      </footer>
    </div>
  );
}
