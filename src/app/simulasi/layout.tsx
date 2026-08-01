import { ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft, Cpu } from "lucide-react";

export default function SimulasiLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen text-white">
      <header className="sticky top-0 z-50 bg-bg-base/80 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 hover:bg-white/5 rounded-full transition-colors">
              <ChevronLeft className="w-5 h-5 text-gray-400" />
            </Link>
            <h1 className="font-bold text-lg bg-gradient-to-r from-trace-teal to-blue-400 bg-clip-text text-transparent font-space-grotesk">
              Simulasi Interaktif
            </h1>
          </div>
          <nav>
            <div className="flex items-center gap-2 text-sm text-gray-400 font-inter">
              <Cpu className="w-4 h-4" />
              <span>Dasar Kelistrikan</span>
            </div>
          </nav>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {children}
      </main>
    </div>
  );
}
