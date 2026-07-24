import { getSandboxSimulations } from "@/actions/simulations";
import { ResistorCalculatorWidget } from "@/components/ResistorCalculatorWidget";
import { CircuitBuilderCanvas } from "@/components/CircuitBuilderCanvas";

export default async function SimulasiPage() {
  // Sandbox simulations might be used later to list saved user simulations
  // const sandboxSimulations = await getSandboxSimulations();

  return (
    <div className="container mx-auto py-10 px-4 max-w-6xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-1 bg-trace-teal rounded-full"></div>
        <h1 className="text-4xl font-bold font-space-grotesk tracking-tight text-white">
          Simulasi & Sandbox
        </h1>
      </div>
      
      <p className="text-gray-400 font-inter mb-10 max-w-2xl leading-relaxed">
        Gunakan berbagai alat simulasi interaktif di bawah ini untuk menguji konsep dasar elektronika secara langsung tanpa risiko perangkat keras.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 flex flex-col gap-8">
          {/* Resistor Calculator */}
          <ResistorCalculatorWidget />
          
          <div className="bg-white/5 border border-white/10 rounded-lg p-6 backdrop-blur-sm shadow-lg">
             <h3 className="text-lg font-bold font-space-grotesk text-white mb-3 flex items-center">
                <span className="w-2 h-2 bg-trace-teal rounded-full mr-2"></span>
                Panduan Simulasi
             </h3>
             <ul className="text-sm text-gray-400 space-y-3 font-inter">
                <li>• Gunakan kalkulator resistor untuk menentukan nilai resistansi dengan cepat.</li>
                <li>• Hubungkan komponen pada canvas di sebelah kanan untuk melihat aliran arus listrik.</li>
                <li>• Tekan "Mulai Simulasi" untuk mengaktifkan sumber tegangan.</li>
             </ul>
          </div>
        </div>

        <div className="lg:col-span-8 min-h-[500px]">
          {/* Main Sandbox Area */}
          <CircuitBuilderCanvas />
        </div>
      </div>
    </div>
  );
}
