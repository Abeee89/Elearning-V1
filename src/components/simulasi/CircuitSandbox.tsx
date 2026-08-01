"use client";

import { useState, useCallback } from "react";
import {
  ReactFlow, Controls, Background, applyNodeChanges, applyEdgeChanges, addEdge,
  Node, Edge, NodeChange, EdgeChange, Connection, Handle, Position,
  BackgroundVariant, ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Battery, Zap, Power, RotateCcw, X, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ─── types ─── */
interface BatteryData { voltage: number; shortCircuit?: boolean; [key: string]: unknown }
interface ResistorData { resistance: number; [key: string]: unknown }
interface LEDData { forwardVoltage: number; maxCurrent: number; lit: boolean; burnt: boolean; dim: boolean; [key: string]: unknown }
type CircuitState = "idle" | "short" | "overcurrent" | "underpowered" | "open" | "success";
interface EvalResult { state: CircuitState; current?: number; message: string; hint: string }

const fmt = (v: number) => v >= 1000 ? `${(v/1000).toFixed(1)}kΩ` : `${v}Ω`;

/* ─── custom nodes ─── */
function BatteryNode({ data }: { data: BatteryData }) {
  return (
    <div className={`bg-black/60 border-2 rounded-lg p-2 text-white shadow-xl w-28 transition-all backdrop-blur-sm
      ${data.shortCircuit ? "border-red-500 animate-[shake_0.3s_infinite]" : "border-blue-500"}`}>
      <Handle type="target" position={Position.Left} id="in" style={{ background: "#3b82f6" }} />
      <div className="text-center font-bold text-xs mb-1 font-jetbrains-mono">{data.voltage}V Baterai</div>
      <div className="relative flex justify-center">
        <Battery className={`w-full ${data.shortCircuit ? "text-red-400" : "text-blue-400"}`} />
        {data.shortCircuit && (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 32 32">
              <path d="M16 2 L18 13 L24 13 L14 30 L15 18 L8 18 Z" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1"/>
            </svg>
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Right} id="out" style={{ background: "#ef4444" }} />
    </div>
  );
}

function ResistorNode({ data }: { data: ResistorData }) {
  return (
    <div className="bg-black/60 border-2 border-orange-500 rounded-lg p-2 text-white shadow-xl w-28 backdrop-blur-sm">
      <Handle type="target" position={Position.Left} id="in" />
      <div className="text-center font-bold text-xs mb-1 font-jetbrains-mono">{fmt(data.resistance)}</div>
      <svg width="100%" height="20" viewBox="0 0 100 20">
        <path d="M0,10 L15,10 L20,0 L30,20 L40,0 L50,20 L60,0 L70,20 L80,0 L85,10 L100,10" fill="none" stroke="#f97316" strokeWidth="3"/>
      </svg>
      <Handle type="source" position={Position.Right} id="out" />
    </div>
  );
}

function LEDNode({ data }: { data: LEDData }) {
  const border = data.burnt ? "border-amber-900" : data.lit ? "border-emerald-400" : data.dim ? "border-yellow-800" : "border-white/20";
  const bg = data.burnt ? "bg-amber-950/80" : "bg-black/60";
  const bulb = data.burnt
    ? "bg-neutral-800"
    : data.lit
    ? "bg-emerald-400 shadow-[0_0_20px_#34d399]"
    : data.dim
    ? "bg-yellow-900/40"
    : "bg-gray-700";
  return (
    <div className={`${bg} border-2 ${border} rounded-lg p-2 shadow-xl w-24 flex flex-col items-center backdrop-blur-sm
      ${data.lit ? "animate-[successPulse_2s_infinite]" : ""}`}>
      <Handle type="target" position={Position.Top} id="in" />
      <div className="text-center font-bold text-[9px] text-gray-400 mb-0.5 font-jetbrains-mono">LED</div>
      <div className="text-[8px] text-gray-500 mb-1 font-jetbrains-mono">{data.forwardVoltage}V / {data.maxCurrent}mA</div>
      <div className={`w-8 h-8 rounded-full mb-1 transition-all ${bulb}`} />
      <Handle type="source" position={Position.Bottom} id="out" />
    </div>
  );
}

const nodeTypes = { battery: BatteryNode, resistor: ResistorNode, led: LEDNode };
let idCounter = 10;
const getId = () => `node_${++idCounter}`;

/* ─── evaluation engine ─── */
function evaluateCircuit(nodes: Node[], edges: Edge[]): EvalResult {
  if (nodes.length === 0) return { state: "idle", message: "", hint: "" };

  const batteries = nodes.filter(n => n.type === "battery");
  const resistors = nodes.filter(n => n.type === "resistor");
  const leds = nodes.filter(n => n.type === "led");

  if (batteries.length === 0) return { state: "open", message: "Tidak ada baterai dalam rangkaian.", hint: "Tambahkan baterai untuk menyediakan tegangan." };

  // BFS loop detection
  const adj: Record<string, string[]> = {};
  nodes.forEach(n => { adj[n.id] = []; });
  edges.forEach(e => { adj[e.source]?.push(e.target); adj[e.target]?.push(e.source); });

  function hasLoop(startId: string): boolean {
    const visited = new Set<string>();
    const queue = [startId];
    visited.add(startId);
    while (queue.length) {
      const cur = queue.shift()!;
      for (const nb of (adj[cur] || [])) {
        if (nb === startId && visited.size > 2) return true;
        if (!visited.has(nb)) { visited.add(nb); queue.push(nb); }
      }
    }
    return false;
  }

  const batteryId = batteries[0].id;
  const loopExists = hasLoop(batteryId);

  if (!loopExists) {
    return { state: "open", message: "Rangkaian terbuka — tidak ada jalur loop tertutup.", hint: "Hubungkan komponen membentuk loop kembali ke baterai." };
  }

  const totalVoltage = batteries.reduce((s, b) => s + ((b.data as unknown as BatteryData).voltage || 0), 0);
  const totalResistance = resistors.reduce((s, r) => s + ((r.data as unknown as ResistorData).resistance || 0), 0);

  if (totalResistance === 0 && leds.length === 0) {
    return { state: "short", current: Infinity, message: "⚡ HUBUNG SINGKAT! Tidak ada resistansi dalam rangkaian.", hint: "Tambahkan resistor untuk membatasi arus." };
  }

  const ledVDrop = leds.reduce((s, l) => s + ((l.data as unknown as LEDData).forwardVoltage || 0), 0);
  const effectiveVoltage = totalVoltage - ledVDrop;

  if (effectiveVoltage <= 0) {
    return { state: "underpowered", message: "Tegangan kurang — LED membutuhkan tegangan lebih.", hint: "Naikkan tegangan baterai atau kurangi jumlah LED." };
  }

  const current = totalResistance > 0 ? (effectiveVoltage / totalResistance) * 1000 : Infinity; // mA

  if (leds.length > 0) {
    const ledMaxCurrent = Math.min(...leds.map(l => (l.data as unknown as LEDData).maxCurrent));
    if (current > ledMaxCurrent * 2) {
      return { state: "overcurrent", current, message: `⚠️ Arus berlebih! ${current.toFixed(0)}mA melebihi batas LED.`, hint: "Tambahkan resistor yang lebih besar untuk membatasi arus." };
    }
  }

  return { state: "success", current, message: `✅ Rangkaian valid! Arus: ${current.toFixed(1)}mA`, hint: "LED menyala dengan aman. Coba ubah nilai komponen!" };
}

/* ─── main component ─── */
function CircuitSandboxInner() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isPowered, setIsPowered] = useState(false);
  const [evalResult, setEvalResult] = useState<EvalResult>({ state: "idle", message: "", hint: "" });
  const [showPanel, setShowPanel] = useState(true);

  const onNodesChange = useCallback((changes: NodeChange[]) => setNodes(nds => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes: EdgeChange[]) => setEdges(eds => applyEdgeChanges(changes, eds)), []);
  const onConnect = useCallback((connection: Connection) => setEdges(eds => addEdge({ ...connection, animated: isPowered, style: { stroke: isPowered ? "#4FD1C5" : "#64748b" } }, eds)), [isPowered]);

  const addNode = (type: string) => {
    const id = getId();
    let data: BatteryData | ResistorData | LEDData;
    if (type === "battery") data = { voltage: 9, shortCircuit: false };
    else if (type === "resistor") data = { resistance: 220 };
    else data = { forwardVoltage: 2, maxCurrent: 20, lit: false, burnt: false, dim: false };

    setNodes(nds => [...nds, {
      id, type, data,
      position: { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 },
    }]);
  };

  const togglePower = () => {
    const nextPower = !isPowered;
    setIsPowered(nextPower);

    if (nextPower) {
      const result = evaluateCircuit(nodes, edges);
      setEvalResult(result);

      // Update node visuals based on evaluation
      setNodes(nds => nds.map(n => {
        if (n.type === "battery") {
          return { ...n, data: { ...n.data, shortCircuit: result.state === "short" } };
        }
        if (n.type === "led") {
          return {
            ...n,
            data: {
              ...n.data,
              lit: result.state === "success",
              burnt: result.state === "overcurrent",
              dim: result.state === "underpowered",
            },
          };
        }
        return n;
      }));

      // Animate edges
      setEdges(eds => eds.map(e => ({ ...e, animated: true, style: { stroke: result.state === "success" ? "#4FD1C5" : result.state === "short" ? "#ef4444" : "#64748b" } })));
    } else {
      setEvalResult({ state: "idle", message: "", hint: "" });
      setNodes(nds => nds.map(n => {
        if (n.type === "battery") return { ...n, data: { ...n.data, shortCircuit: false } };
        if (n.type === "led") return { ...n, data: { ...n.data, lit: false, burnt: false, dim: false } };
        return n;
      }));
      setEdges(eds => eds.map(e => ({ ...e, animated: false, style: { stroke: "#64748b" } })));
    }
  };

  const resetAll = () => {
    setNodes([]);
    setEdges([]);
    setIsPowered(false);
    setEvalResult({ state: "idle", message: "", hint: "" });
    idCounter = 10;
  };

  const stateColors: Record<CircuitState, string> = {
    idle: "border-white/10",
    success: "border-emerald-500/50 bg-emerald-500/5",
    short: "border-red-500/50 bg-red-500/5",
    overcurrent: "border-amber-500/50 bg-amber-500/5",
    underpowered: "border-yellow-500/50 bg-yellow-500/5",
    open: "border-blue-500/50 bg-blue-500/5",
  };

  return (
    <div className="w-full space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm text-gray-400 font-inter mr-2">Tambah Komponen:</span>
        <button onClick={() => addNode("battery")}
          className="px-3 py-1.5 rounded-lg text-sm bg-blue-500/10 border border-blue-500/30 text-blue-300 hover:bg-blue-500/20 transition-all font-space-grotesk flex items-center gap-1">
          <Battery className="w-3.5 h-3.5" /> Baterai
        </button>
        <button onClick={() => addNode("resistor")}
          className="px-3 py-1.5 rounded-lg text-sm bg-orange-500/10 border border-orange-500/30 text-orange-300 hover:bg-orange-500/20 transition-all font-space-grotesk flex items-center gap-1">
          <Zap className="w-3.5 h-3.5" /> Resistor
        </button>
        <button onClick={() => addNode("led")}
          className="px-3 py-1.5 rounded-lg text-sm bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 transition-all font-space-grotesk flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-emerald-400" /> LED
        </button>

        <div className="ml-auto flex gap-2">
          <button onClick={togglePower}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold border transition-all font-space-grotesk ${
              isPowered
                ? "bg-red-500/20 border-red-500 text-red-300 hover:bg-red-500/30"
                : "bg-trace-teal/20 border-trace-teal text-trace-teal hover:bg-trace-teal/30"
            }`}>
            <Power className="w-4 h-4 inline mr-1" />
            {isPowered ? "Matikan" : "Nyalakan"}
          </button>
          <button onClick={resetAll}
            className="px-3 py-1.5 rounded-lg text-sm bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 transition-all">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="h-[500px] bg-black/40 rounded-xl border border-white/10 overflow-hidden relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          className="bg-black/20"
        >
          <Controls className="!bg-black/60 !border-white/10 !rounded-lg [&>button]:!bg-black/40 [&>button]:!border-white/10 [&>button]:!text-white [&>button:hover]:!bg-white/10" />
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="rgba(255,255,255,0.05)" />
        </ReactFlow>

        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-white/15 font-jetbrains-mono border border-dashed border-white/10 px-8 py-4 rounded-lg bg-black/20 text-center">
              Tambahkan komponen dari toolbar di atas,<br/>lalu hubungkan dengan menyeret antar konektor.
            </p>
          </div>
        )}
      </div>

      {/* Result Panel */}
      <AnimatePresence>
        {evalResult.state !== "idle" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={`rounded-xl border p-4 ${stateColors[evalResult.state]}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold font-space-grotesk text-white">{evalResult.message}</p>
                {evalResult.hint && <p className="text-sm text-gray-400 mt-1 font-inter">{evalResult.hint}</p>}
              </div>
              <button onClick={() => setShowPanel(!showPanel)} className="text-gray-500 hover:text-white">
                {showPanel ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function CircuitSandbox() {
  return (
    <ReactFlowProvider>
      <CircuitSandboxInner />
    </ReactFlowProvider>
  );
}
