import React, { useState } from 'react';
import { 
  Flame, 
  Trash2, 
  Activity, 
  Sparkles, 
  Play, 
  Check, 
  AlertTriangle, 
  GitBranch, 
  FileCheck2, 
  Compass, 
  ChevronRight, 
  Terminal, 
  CodeXml,
  LockKeyhole
} from 'lucide-react';

interface GhostRoute {
  path: string;
  type: string;
  lastUsedDays: number;
  deadWeightKB: number;
  actionable: boolean;
}

interface DuplicateLogicBlock {
  files: string[];
  lines: string;
  similarity: number;
  loc: number;
}

const CONST_GHOST_ROUTES: GhostRoute[] = [
  { path: '/api/v1/beta/legacy-auth', type: 'Zombie Route', lastUsedDays: 142, deadWeightKB: 45.2, actionable: true },
  { path: '/api/v1/playground/dev-logger', type: 'Unreachable Route', lastUsedDays: 98, deadWeightKB: 12.8, actionable: true },
  { path: 'src/hud/obsolete-telemetry-canvas.js', type: 'Orphaned Module', lastUsedDays: 64, deadWeightKB: 84.5, actionable: true },
  { path: 'node_modules/unreferenced-parser-util', type: 'Abandoned Dependency', lastUsedDays: 180, deadWeightKB: 412.0, actionable: false },
  { path: 'src/server/dead-config.json', type: 'Ghost File', lastUsedDays: 52, deadWeightKB: 3.4, actionable: true }
];

const CONST_DUPLICATES: DuplicateLogicBlock[] = [
  { files: ['src/App.tsx', 'src/hud/state.ts'], lines: 'Lines 501-525 & Lines 82-106', similarity: 92, loc: 24 },
  { files: ['src/server/apiHandler.ts', 'src/server/geminiService.ts'], lines: 'Lines 124-142 & Lines 445-463', similarity: 85, loc: 18 }
];

const REPAIR_TEMPLATES = [
  {
    id: "dead-imports",
    title: "Prune Abandoned Imports",
    description: "Cleans up unreferenced module declarations across standard files to reduce bundle bloat.",
    diff: {
      old: `import React, { useState, useEffect } from 'react';\nimport { Canvas, useFrame } from '@react-three/fiber';\nimport { OrbitControls, Sparkles, Stars, Torus } from '@react-three/drei';\nimport { Trash2, AlertCircle, RefreshCw, Layers } from 'lucide-react';\n\n// Obsolete dependencies left here\nimport axios from 'axios';\nimport md5 from 'md5';\nimport lodash from 'lodash';`,
      new: `import React, { useState, useEffect } from 'react';\nimport { Canvas, useFrame } from '@react-three/fiber';\nimport { OrbitControls, Sparkles } from '@react-three/drei';\nimport { Trash2, AlertCircle, RefreshCw } from 'lucide-react';\n\n// Abandoned dependencies successfully pruned by AI Forge`
    }
  },
  {
    id: "eslint-bugs",
    title: "Auto-Fix ESLint & Compile Errors",
    description: "Evaluates the workspace linter report, resolves missing TypeScript interfaces, and fixes unused variable declarations.",
    diff: {
      old: `export function evaluateProjectDrift(payload) {\n  let fileCount = payload.files.length;\n  let activeError = "None";\n  // BUG: unused vars, implicit any, no return type\n  const isStale = payload.stale;\n  const statusIndex = 12;\n}`,
      new: `export function evaluateProjectDrift(payload: { files: any[]; stale?: boolean }): { success: boolean; score: number } {\n  const fileCount = payload.files.length;\n  const isStale = payload.stale ?? false;\n  \n  return {\n    success: true,\n    score: isStale ? 45 : 100\n  };\n}`
    }
  },
  {
    id: "duplicate-logic",
    title: "Deduplicate Redundant Logic Blocks",
    description: "Identifies overlapping code implementations and extracts them into reusable abstract helpers.",
    diff: {
      old: `// App.tsx\nconst scaleDelta = (val * 100) / max;\nconst confidence = Math.max(0, Math.min(100, scaleDelta));\n\n// state.ts\nconst deltaScalar = (speed * 100) / upperLimit;\nconst normalizedScale = Math.max(0, Math.min(100, deltaScalar));`,
      new: `// Extracted and consolidated into util.ts\nexport function calculateConfidence(value: number, limit: number): number {\n  const delta = (value * 100) / limit;\n  return Math.max(0, Math.min(100, delta));\n}`
    }
  }
];

export default function EntropyAndHealing() {
  const [activeTab, setActiveTab] = useState<'scan' | 'forge'>('scan');
  const [entropyProgress, setEntropyProgress] = useState<number>(0);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scannedGhostRoutes, setScannedGhostRoutes] = useState<GhostRoute[]>(CONST_GHOST_ROUTES);
  const [resolvedRoutes, setResolvedRoutes] = useState<string[]>([]);
  const [healingStage, setHealingStage] = useState<'idle' | 'running' | 'success'>('idle');
  const [selectedRepair, setSelectedRepair] = useState(REPAIR_TEMPLATES[0]);
  const [repairLogs, setRepairLogs] = useState<string[]>([]);
  const [prCreated, setPrCreated] = useState<boolean>(false);

  // Trigger Workspace Entropy Scan Simulation
  const triggerEntropyScan = () => {
    setIsScanning(true);
    setEntropyProgress(0);
    setResolvedRoutes([]);
    
    const interval = setInterval(() => {
      setEntropyProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          return 100;
        }
        return prev + 12;
      });
    }, 120);
  };

  // Safe delete simulated Zombie route
  const executeCleanRoute = (routePath: string) => {
    setResolvedRoutes(prev => [...prev, routePath]);
  };

  const handleRunRepair = () => {
    setHealingStage('running');
    setRepairLogs([]);
    setPrCreated(false);
    
    const logs = [
      "⚡ Initializing Autonomous AI Repair Daemon...",
      "🔍 Accessing AST Abstract Syntax Tree for analysis...",
      "🧬 Locating target AST indices and module mappings...",
      "🛠️ Applying custom ts-morph code refactor modifications...",
      "🔍 Re-scanning project scope with lint compiler tests...",
      "✓ TypeScript type check passes with 0 error codes detected!",
      "✓ Build validation compiles successfully inside workspace!",
      "🚀 Self-Healing Code Routine completed with outstanding stability scores!"
    ];

    let count = 0;
    const interval = setInterval(() => {
      if (count >= logs.length) {
        clearInterval(interval);
        setHealingStage('success');
        return;
      }
      setRepairLogs(prev => [...prev, logs[count]]);
      count++;
    }, 350);
  };

  return (
    <div className="space-y-6">
      
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-900 pb-5">
        <div>
          <span className="text-[10px] font-mono font-black text-rose-400 bg-rose-950/25 border border-rose-900/40 px-2.5 py-1 rounded-md tracking-wider uppercase">
            Entropy Shield / Self Healer
          </span>
          <h2 className="text-xl font-bold tracking-tight text-white mt-2">
            Workspace Entropy & AI Self-Healer
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-2xl mt-1">
            Detect and resolve structural debris. Scan your codebase directories for ghost modules, zombie routes, and redundant logic before repairing them instantly using AI Forge AST modifiers.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="bg-slate-900/80 p-1 rounded-2xl flex items-center border border-slate-800 text-xs">
          <button
            onClick={() => { setActiveTab('scan'); }}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
              activeTab === 'scan' ? 'bg-slate-850 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Entropy & Ghost Scan
          </button>
          <button
            onClick={() => { setActiveTab('forge'); }}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
              activeTab === 'forge' ? 'bg-slate-850 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            AI Healer Forge
          </button>
        </div>
      </div>

      {activeTab === 'scan' ? (
        /* SECTION A: ENTROPY & GHOST SCANNER */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch animate-fade-in select-text">
          
          {/* Dashboard Left Overview (5 columns) */}
          <div className="lg:col-span-4 bg-[#07090e]/95 border border-slate-900 rounded-3xl p-5 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-28 h-28 bg-rose-500/5 rounded-full blur-2xl pointer-events-none"></div>

            <div className="space-y-4">
              <span className="text-[9px] font-bold font-mono uppercase tracking-wider text-slate-500 select-none block">
                Entropy Assessment Index
              </span>

              {/* Huge circular dial representing debt */}
              <div className="relative w-36 h-36 mx-auto flex items-center justify-center bg-slate-950 rounded-full border border-slate-850 shadow-inner select-none">
                <svg className="w-28 h-28 transform -rotate-90">
                  <circle cx="56" cy="56" r="46" strokeWidth="6" stroke="#161720" fill="transparent" />
                  <circle
                    cx="56"
                    cy="56"
                    r="46"
                    strokeWidth="6"
                    stroke="currentColor"
                    className="text-rose-500"
                    fill="transparent"
                    strokeDasharray="289.02"
                    strokeDashoffset={289.02 * (1 - 0.28)} // 28% debt index
                    style={{ transition: 'stroke-dashoffset 1s' }}
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-3xl font-black text-rose-450 block font-sans">28%</span>
                  <span className="text-[8px] text-slate-550 font-black uppercase tracking-widest block font-sans">Debris Scale</span>
                </div>
              </div>

              {/* Key Diagnostic stats */}
              <div className="space-y-2 pt-2 text-xs font-mono">
                <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-900">
                  <span className="text-slate-500">Total Orphaned Weight:</span>
                  <span className="text-white font-bold">559.1 KB</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-900">
                  <span className="text-slate-500">Similarity Instability:</span>
                  <span className="text-amber-400 font-bold">High (92%)</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-900">
                  <span className="text-slate-500">Unresolved Redundancies:</span>
                  <span className="text-white font-bold">{CONST_DUPLICATES.length} Blocks</span>
                </div>
              </div>
            </div>

            {/* Scan button */}
            <div className="border-t border-slate-900/60 pt-4.5 mt-5">
              <button
                onClick={triggerEntropyScan}
                disabled={isScanning}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-rose-950/20 active:scale-95 transition cursor-pointer"
              >
                <Flame className={`w-3.5 h-3.5 ${isScanning ? 'animate-bounce' : 'animate-pulse'}`} />
                {isScanning ? `Crawling filesystems... ${entropyProgress}%` : "Initiate AST Debris Scan"}
              </button>
            </div>
          </div>

          {/* Scanned Debris Results Right (8 columns) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Table representation of Ghost routes */}
            <div className="bg-slate-950/75 border border-slate-900 rounded-3xl p-5 relative">
              <div className="flex items-center justify-between mb-4.5">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-450 block">
                  Detected Zombie Modules & Route Debris
                </span>
                <span className="text-[9px] text-[#a78bfa] font-mono font-bold">Workspace Health Checklist</span>
              </div>

              {isScanning ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-3 font-mono">
                  <Activity className="w-8 h-8 text-rose-500 animate-spin" />
                  <span className="text-xs text-slate-400">Scanning physical dependency trees...</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-slate-900 text-slate-500 text-[10px]">
                        <th className="pb-2.5">TARGET COMPONENT PATH / RESOURCE</th>
                        <th className="pb-2.5">ANOMALY WEIGHT</th>
                        <th className="pb-2.5 text-right">ACTION DISMISS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-905/30">
                      {scannedGhostRoutes.map((route) => {
                        const isResolved = resolvedRoutes.includes(route.path);
                        return (
                          <tr key={route.path} className={`group ${isResolved ? 'opacity-30' : ''}`}>
                            <td className="py-3.5 pr-3 select-text">
                              <span className="text-white block font-semibold font-sans">{route.path}</span>
                              <span className="text-[8.5px] uppercase font-mono tracking-wider font-bold text-rose-400 bg-rose-950/10 border border-rose-900/20 px-1.5 py-0.5 rounded-full mt-1.5 inline-block">
                                {route.type}
                              </span>
                            </td>
                            <td className="py-3.5 text-slate-400 font-bold select-text">
                              {route.deadWeightKB} KB
                            </td>
                            <td className="py-3.5 text-right">
                              {isResolved ? (
                                <span className="text-emerald-500 font-extrabold text-[10px] flex items-center justify-end gap-1 font-mono">
                                  <Check className="w-3.5 h-3.5" /> Pruned Clean
                                </span>
                              ) : route.actionable ? (
                                <button
                                  onClick={() => executeCleanRoute(route.path)}
                                  className="px-2.5 py-1 bg-[#160b0e] border border-red-950 hover:bg-rose-950/40 text-rose-450 rounded-lg text-[9px] font-black transition cursor-pointer"
                                >
                                  Clean Module
                                </button>
                              ) : (
                                <span className="text-slate-600 text-[9px]">Root External Lock</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Duplicated code warnings card */}
            <div className="bg-[#0b0d14]/70 border border-slate-900 rounded-3xl p-5">
              <div className="flex items-center gap-2 mb-3 select-none">
                <AlertTriangle className="w-4 h-4 text-amber-500 animate-pulse" />
                <span className="text-[10px] font-mono font-bold uppercase text-slate-450 block">AST Redundancy Warnings</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CONST_DUPLICATES.map((dup, i) => (
                  <div key={i} className="p-3.5 bg-slate-950 border border-slate-900 rounded-2xl space-y-2.5 relative overflow-hidden select-text">
                    <div className="flex items-center justify-between text-[10.5px] font-mono">
                      <span className="text-rose-450 font-bold">Overlap Rank #{i+1}</span>
                      <span className="text-amber-400 font-extrabold bg-amber-950/20 px-2 py-0.5 rounded-md border border-amber-900/30">
                        {dup.similarity}% duplicate
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] font-mono text-slate-500 block">Colliding Files:</span>
                      <div className="flex flex-wrap items-center gap-1">
                        {dup.files.map(f => (
                          <span key={f} className="text-[9.5px] font-mono text-white bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="font-mono text-[9px] text-slate-550 border-t border-slate-900 pt-2 select-none flex items-center justify-between">
                      <span>Affected Range: <strong>{dup.lines}</strong></span>
                      <span className="text-rose-400/80">({dup.loc} duplicates)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      ) : (
        /* SECTION B: AI FORGE & SELF HEALER */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch animate-fade-in select-text">
          
          {/* Healing Task Selector (4 columns) */}
          <div className="lg:col-span-4 bg-[#07090e]/95 border border-slate-900 rounded-3xl p-5 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                Repair Task Forge Selection
              </span>

              <div className="space-y-2">
                {REPAIR_TEMPLATES.map((tpl) => {
                  const isSelected = selectedRepair.id === tpl.id;
                  return (
                    <button
                      key={tpl.id}
                      onClick={() => {
                        setSelectedRepair(tpl);
                        setHealingStage('idle');
                        setRepairLogs([]);
                        setPrCreated(false);
                      }}
                      className={`w-full text-left p-3 rounded-2xl border transition ${
                        isSelected 
                          ? 'bg-rose-950/25 border-rose-900/40 text-white shadow-md shadow-rose-950/10' 
                          : 'bg-transparent border-slate-900 text-slate-400 hover:border-slate-800'
                      }`}
                    >
                      <h4 className="text-xs font-bold font-sans flex items-center gap-2">
                        <FileCheck2 className={`w-3.5 h-3.5 ${isSelected ? 'text-rose-400 animate-pulse' : 'text-slate-500'}`} />
                        {tpl.title}
                      </h4>
                      <p className="text-[10.5px] text-slate-450 leading-relaxed font-sans font-medium mt-1">
                        {tpl.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-slate-900/60 pt-4.5 mt-6">
              <button
                onClick={handleRunRepair}
                disabled={healingStage === 'running'}
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-450 text-white rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-rose-950/25 active:scale-95 transition cursor-pointer select-none"
              >
                <Sparkles className="w-4 h-4 text-rose-200 animate-spin-slow" />
                {healingStage === 'running' ? "Running AST Repairs..." : "EXECUTE REPAIR LOOP"}
              </button>
            </div>
          </div>

          {/* Diff & Code Simulation view (8 columns) */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            
            {healingStage === 'idle' && (
              <div className="flex-1 bg-slate-950/75 border border-slate-900 rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-4">
                <div className="p-3.5 bg-rose-950/20 border border-rose-900/30 rounded-full text-rose-400 select-none">
                  <Terminal className="w-8 h-8 animate-bounce" />
                </div>
                <div className="max-w-md space-y-1">
                  <h3 className="text-sm font-bold text-white font-sans">Awaiting Command Initialization</h3>
                  <p className="text-xs text-slate-450 font-sans font-medium leading-relaxed">
                    Select a healing target on the left panel, and click "EXECUTE REPAIR LOOP" to run a diagnostic ast-repair daemon.
                  </p>
                </div>
              </div>
            )}

            {healingStage === 'running' && (
              <div className="flex-1 bg-[#050608] border border-slate-900 rounded-3xl p-5 font-mono text-[10.5px] space-y-2 min-h-[300px]">
                <div className="flex items-center gap-2 text-rose-400 font-bold border-b border-slate-900 pb-2 mb-3">
                  <Terminal className="w-4 h-4 animate-spin-slow" />
                  <span>AI FORGE LOCAL CRAWLER ACTIVE</span>
                </div>

                <div className="space-y-1.5 overflow-y-auto max-h-[260px]">
                  {repairLogs.map((log, i) => (
                    <div key={i} className="text-slate-350 animate-fade-in flex items-center gap-2">
                      <ChevronRight className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span>{log}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {healingStage === 'success' && (
              <div className="flex-1 bg-slate-955 border border-slate-90 w-full rounded-2xl overflow-hidden space-y-5 animate-fade-in">
                
                {/* Banner Status */}
                <div className="p-4 bg-emerald-950/30 border-b border-emerald-900/30 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-400 select-none">
                      <Check className="w-4 h-4 animate-bounce" />
                    </span>
                    <div className="font-mono text-xs text-emerald-400">
                      <span className="font-black uppercase">REPAIR SEQUENCE SUCCESSFUL</span>
                      <span className="text-[9px] text-slate-500 block mt-0.5">AST compiler checking fully synchronized</span>
                    </div>
                  </div>

                  {prCreated ? (
                    <span className="text-indigo-400 font-bold text-[10px] font-mono bg-indigo-950/30 border border-indigo-900/30 px-3 py-1 rounded-xl flex items-center gap-1">
                      <GitBranch className="w-3.5 h-3.5" /> Pull Request #42 Created
                    </span>
                  ) : (
                    <button
                      onClick={() => setPrCreated(true)}
                      className="px-3.5 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl text-[10px] font-bold font-mono cursor-pointer active:scale-95 transition flex items-center gap-1 shadow-lg shadow-violet-950/30"
                    >
                      <GitBranch className="w-3 h-3" /> Push AI Healing PR
                    </button>
                  )}
                </div>

                {/* Diff View block */}
                <div className="p-5 space-y-4">
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-500 block">AST AST Refactored Diff Preview</span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Before block */}
                    <div className="rounded-2xl border border-red-950/40 bg-[#0e0002]/40 p-4.5 space-y-2.5">
                      <span className="text-[10px] font-mono font-bold text-rose-500 bg-rose-950/30 border border-rose-900/40 px-2 py-0.5 rounded-full select-none inline-block">
                        - Redundant Source File Context
                      </span>
                      <pre className="font-mono text-[10px] text-rose-300 leading-normal overflow-x-auto select-text whitespace-pre-wrap max-h-56">
                        {selectedRepair.diff.old}
                      </pre>
                    </div>

                    {/* After block */}
                    <div className="rounded-2xl border border-emerald-950/40 bg-[#000a03]/40 p-4.5 space-y-2.5">
                      <span className="text-[10px] font-mono font-bold text-emerald-500 bg-emerald-950/30 border border-emerald-900/40 px-2 py-0.5 rounded-full select-none inline-block">
                        + Clean Optimized File Context
                      </span>
                      <pre className="font-mono text-[10px] text-emerald-300 leading-normal overflow-x-auto select-text whitespace-pre-wrap max-h-56">
                        {selectedRepair.diff.new}
                      </pre>
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
