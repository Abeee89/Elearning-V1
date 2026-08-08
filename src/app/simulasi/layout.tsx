import { ReactNode, Suspense } from "react";
import { ChevronLeft, Cpu } from "lucide-react";
import { SimulasiBackButton } from "@/components/SimulasiBackButton";
import { Navbar } from "@/components/Navbar";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { checkCanGenerateEvaluation } from "@/actions/evaluations";

export default async function SimulasiLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const canGenerate = await checkCanGenerateEvaluation();

  return (
    <div className="min-h-screen bg-bg-base bg-schematic-grid text-white flex flex-col font-sans">
      <Navbar user={session.user} canGenerateEvaluation={canGenerate} />
      
      {/* Technical instrument sub-header */}
      <div className="bg-black/20 border-b border-grid-line backdrop-blur-sm">
        <div className="container mx-auto px-4 h-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Suspense fallback={
              <div className="p-1 rounded bg-white/5 animate-pulse">
                <ChevronLeft className="w-4 h-4 text-gray-400" />
              </div>
            }>
              <SimulasiBackButton />
            </Suspense>
            <span className="text-xs font-semibold text-text-muted font-space-grotesk tracking-wider uppercase">Laboratorium Virtual</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-trace-teal font-mono">
            <Cpu className="w-3.5 h-3.5" />
            <span>INSTRUMENT_CHECK: OK</span>
          </div>
        </div>
      </div>
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl">
        {children}
      </main>
    </div>
  );
}
