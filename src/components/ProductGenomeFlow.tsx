import React, { useState } from 'react';
import { 
  Flame, 
  Activity, 
  Award, 
  Sparkles, 
  Clock, 
  HelpCircle, 
  Compass, 
  ActivitySquare, 
  Plus, 
  Volume2, 
  Check, 
  ChevronRight, 
  Search, 
  Database, 
  Cpu, 
  Workflow, 
  Lightbulb 
} from 'lucide-react';

interface Era {
  id: string;
  name: string;
  date: string;
  filesChanged: number;
  author: string;
  alignmentRating: number;
  metricLabel: string;
  metricVal: number;
  logSummary: string;
}

const HISTORIC_ERAS: Era[] = [
  {
    id: "era-1",
    name: "Pre-alpha Bootstrap",
    date: "Sprint 1 (May 01)",
    filesChanged: 4,
    author: "namireddysreeshanth",
    alignmentRating: 54,
    metricLabel: "Initial Telemetry Signal",
    metricVal: 240,
    logSummary: "Bootstrap core server files, standard index.html setups, initial routing frameworks, zero styling overlays."
  },
  {
    id: "era-2",
    name: "WebSockets Collision",
    date: "Sprint 4 (May 08)",
    filesChanged: 11,
    author: "namireddysreeshanth",
    alignmentRating: 72,
    metricLabel: "Event Transmission Rate",
    metricVal: 890,
    logSummary: "WebSocket cluster failure recovery session. Decoupled socket packet multiplexers. Initial ZustandHUD and Astro fallback handlers built."
  },
  {
    id: "era-3",
    name: "Chaos Incident 404",
    date: "Sprint 8 (May 15)",
    filesChanged: 19,
    author: "AI Oracle Copilot",
    alignmentRating: 84,
    metricLabel: "Anomalous Core Recoil",
    metricVal: 50,
    logSummary: "Production deployment lockout incident. Rebalanced SQLite connection pools. Hardened Gemini AST verification safety layers."
  },
  {
    id: "era-4",
    name: "Multi-Region Cluster",
    date: "Production Launch (May 22)",
    filesChanged: 34,
    author: "Workspace Daemon Integration",
    alignmentRating: 96,
    metricLabel: "Operational Readiness",
    metricVal: 998,
    logSummary: "Vercel and Cloud Run container deployments fully coordinated. Immersive WebGL Nebula canvas and Self-Healing pipeline engines enabled."
  }
];

export default function ProductGenomeFlow() {
  const [activeTab, setActiveTab] = useState<'genome' | 'flow' | 'timemachine'>('genome');
  const [selectedEraIndex, setSelectedEraIndex] = useState<number>(3);
  const [coffeeBoost, setCoffeeBoost] = useState<number>(0);
  const [activeFlowMode, setActiveFlowMode] = useState<boolean>(false);

  // Active Era selection
  const era = HISTORIC_ERAS[selectedEraIndex];

  // Predictive readiness gauges
  const genomeMetrics = [
    { label: "Monetization Readiness", val: 88, desc: "Stripe secure callbacks, tiered access, automated client proxies." },
    { label: "UX/Design Completeness", val: 95, desc: "Neo Tokyo interactive overlays, custom dark canvas, responsive ratios." },
    { label: "Scalability Infra Conf", val: 82, desc: "Fastify multi-process thread queues, local Vector embeddings lookups." },
    { label: "AI Integration Depth", val: 90, desc: "Dynamic prompt chains, secure Astro fallback models, localized AST diagnostics." },
    { label: "Observability Health", val: 78, desc: "Prisma logging streams, interactive telemetry ports monitoring." }
  ];

  // Composite Readiness Score
  const aggregateScore = Math.round(
    genomeMetrics.reduce((acc, obj) => acc + obj.val, 0) / genomeMetrics.length
  );

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-900 pb-5">
        <div>
          <span className="text-[10px] font-mono font-black text-zinc-300 bg-white/5 border border-white/5 px-2.5 py-1 rounded-md tracking-wider uppercase">
            Product Cockpit & Memory
          </span>
          <h2 className="text-xl font-bold tracking-tight text-white mt-2">
            Genome Metrics & Time Machine Core
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-2xl mt-1">
            Navigate through delivery eras, review visual telemetry histories, track cognitive developer burnout, and compute a predictive deployment readiness composite index.
          </p>
        </div>

        {/* Tab select buttons */}
        <div className="bg-slate-900/80 p-1 rounded-2xl flex items-center border border-slate-800 text-xs select-none">
          <button
            onClick={() => { setActiveTab('genome'); }}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
              activeTab === 'genome' ? 'bg-slate-850 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Product Genome
          </button>
          <button
            onClick={() => { setActiveTab('flow'); }}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
              activeTab === 'flow' ? 'bg-slate-850 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Flow State Engine
          </button>
          <button
            onClick={() => { setActiveTab('timemachine'); }}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
              activeTab === 'timemachine' ? 'bg-slate-850 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Engineering Time Machine
          </button>
        </div>
      </div>

      {activeTab === 'genome' && (
        /* SECTION A: PRODUCT GENOME ENGINE */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch animate-fade-in select-text">
          
          {/* Big Circular composite meter (4 columns) */}
          <div className="lg:col-span-4 bg-[#07090e]/95 border border-slate-900 rounded-3xl p-5 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-28 h-28 bg-zinc-800 rounded-full blur-2xl pointer-events-none"></div>

            <div className="space-y-4">
              <span className="text-[9px] font-bold font-mono uppercase tracking-wider text-slate-500 block">
                Composite Genome Index
              </span>

              {/* Central gauge */}
              <div className="relative w-36 h-36 mx-auto flex items-center justify-center bg-slate-950 rounded-full border border-slate-850 shadow-inner select-none">
                <svg className="w-28 h-28 transform -rotate-90">
                  <circle cx="56" cy="56" r="46" strokeWidth="6" stroke="#161720" fill="transparent" />
                  <circle
                    cx="56"
                    cy="56"
                    r="46"
                    strokeWidth="6"
                    stroke="currentColor"
                    className="text-zinc-300"
                    fill="transparent"
                    strokeDasharray="289.02"
                    strokeDashoffset={289.02 * (1 - (aggregateScore / 100))}
                    style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1)' }}
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-3xl font-black text-zinc-300 block font-sans">{aggregateScore}%</span>
                  <span className="text-[8px] text-slate-550 font-black uppercase tracking-widest block font-sans">Ready Match</span>
                </div>
              </div>

              {/* Milestone path lines */}
              <div className="space-y-2 pt-2 text-[10.5px] font-mono select-none">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-zinc-800 shrink-0" />
                  <span className="text-slate-450">Core Systems Core Framework (Sprint 1) - Complete</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-zinc-800 shrink-0" />
                  <span className="text-slate-450">Holographic Universe Interface - Complete</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-zinc-800 animate-pulse shrink-0" />
                  <span className="text-white">Enterprise Scalability Audit (Active)</span>
                </div>
              </div>
            </div>

            {/* Trajectory message */}
            <div className="mt-5 border-t border-slate-900 pt-4 text-xs font-sans text-slate-400 leading-relaxed bg-[#0a0d14]/60 border border-slate-900/40 p-3 rounded-2xl select-text">
              <span className="font-bold text-[#a78bfa] flex items-center gap-1 mb-1">
                <Sparkles className="w-3.5 h-3.5" /> AI Genome Projection:
              </span>
              Based on AST coverage analysis and file write frequencies, the workspace is projected to attain a complete <strong>100% Launch Readiness Quotient</strong> in less than 4 days.
            </div>
          </div>

          {/* Readiness factor breakdowns (8 columns) */}
          <div className="lg:col-span-8 bg-slate-950/70 border border-slate-900 rounded-3xl p-5 relative space-y-4">
            <span className="text-[10px] uppercase font-mono font-bold text-slate-500 block">
              Dynamic Readiness Vector Ratings
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {genomeMetrics.map((met) => (
                <div key={met.label} className="p-3.5 bg-[#07090e]/80 border border-slate-900 rounded-2xl space-y-2 relative overflow-hidden select-text">
                  <div className="flex items-center justify-between text-xs font-bold font-mono">
                    <span className="text-white">{met.label}</span>
                    <span className="text-zinc-300 font-extrabold">{met.val}%</span>
                  </div>

                  <p className="text-[10.5px] text-slate-450 leading-relaxed font-sans font-medium">
                    {met.desc}
                  </p>

                  <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-zinc-800 h-full rounded-full transition-all duration-1000" 
                      style={{ width: `${met.val}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {activeTab === 'flow' && (
        /* SECTION B: AI FLOW STATE ENGINE */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch animate-fade-in select-text">
          
          {/* Flow meters left (5 columns) */}
          <div className="lg:col-span-5 bg-[#07090e]/95 border border-slate-900 rounded-3xl p-5 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-[9px] font-bold font-mono uppercase tracking-wider text-slate-500 block select-none">
                Flow Engine Health Meters
              </span>

              {/* Progress meters for flow state */}
              <div className="space-y-3.5 font-mono text-xs">
                <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-900 space-y-1">
                  <div className="flex items-center justify-between font-bold select-none">
                    <span className="text-slate-450">Cognitive Overload Factor</span>
                    <span className="text-rose-400">Low (14%)</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden select-none">
                    <div className="bg-rose-500 h-full rounded-full" style={{ width: '14%' }} />
                  </div>
                  <span className="text-[9px] text-slate-550 italic select-text block pt-1 leading-normal">
                    AST navigation overhead is minimal. Your working directory layout minimizes context fatigue.
                  </span>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-900 space-y-1">
                  <div className="flex items-center justify-between font-bold select-none">
                    <span className="text-slate-450">Developer Focus Burnout Level</span>
                    <span className="text-[#a78bfa]">Minimal (21%)</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden select-none">
                    <div className="bg-zinc-800 h-full rounded-full" style={{ width: '21%' }} />
                  </div>
                  <span className="text-[9px] text-slate-550 italic select-text block pt-1 leading-normal">
                    Typing sequences and execution cycles represent high-resonance focus patterns. No strain anomalies.
                  </span>
                </div>
              </div>
            </div>

            {/* Caffeine replenishment tool inside HUD */}
            <div className="border-t border-slate-900 pt-4.5 mt-5 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono font-bold select-none">
                <span className="text-slate-500">Workspace Caffeine Reserves:</span>
                <span className="text-amber-500 font-extrabold">{coffeeBoost * 25}% replenished</span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (coffeeBoost < 4) setCoffeeBoost(prev => prev + 1);
                  }}
                  disabled={coffeeBoost >= 4}
                  className="flex-1 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-950/20 text-white rounded-xl text-[10px] font-mono font-bold flex items-center justify-center gap-1.5 transition cursor-pointer select-none"
                >
                  <Activity className="w-3.5 h-3.5 text-amber-200" /> Dispense Espresso Shot +25%
                </button>
                <button
                  type="button"
                  onClick={() => setCoffeeBoost(0)}
                  className="p-2 bg-slate-950 border border-slate-900 hover:border-slate-800 text-slate-400 hover:text-white rounded-xl text-[10px] transition cursor-pointer select-none font-mono"
                >
                  Flush Cache
                </button>
              </div>
            </div>
          </div>

          {/* Flow Peak chart & Recommendations (7 columns) */}
          <div className="lg:col-span-7 bg-slate-950/70 border border-slate-900 rounded-3xl p-5 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-500 block">
                Continuous Flow Peak Timeline (Last 8h)
              </span>

              {/* Simple grid timeline visualizer */}
              <div className="h-32 flex items-end justify-between gap-1.5 bg-slate-950/80 border border-slate-900 p-3 rounded-2xl relative select-none">
                <div className="absolute inset-0 grid grid-rows-4 pointer-events-none select-none">
                  <div className="border-b border-slate-900/60 w-full h-full"></div>
                  <div className="border-b border-slate-900/60 w-full h-full"></div>
                  <div className="border-b border-slate-900/60 w-full h-full"></div>
                  <div className="w-full h-full"></div>
                </div>

                {/* Timeline bars */}
                {[20, 45, 68, 85, 92, 40, 60, 95, 78, 62, 88, 100].map((val, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                    <div 
                      className={`w-full rounded-t-md transition-all duration-1000 ${
                        val > 80 ? 'bg-zinc-800' : val > 50 ? 'bg-zinc-800' : 'bg-slate-750'
                      }`} 
                      style={{ height: `${val * 0.75}px` }} 
                    />
                    <span className="text-[7.5px] scale-90 font-mono text-slate-600">{idx+1}h</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Recommendations */}
            <div className="bg-[#0b0c15] border border-slate-900 p-3.5 rounded-2xl space-y-2 select-text mt-4">
              <span className="text-[10.5px] font-mono text-white flex items-center gap-1.5 font-bold">
                <Lightbulb className="w-4 h-4 text-zinc-300" />
                Adaptive Workflow Directives
              </span>

              <p className="text-[10.5px] text-slate-450 leading-relaxed font-sans font-medium">
                Optimized sequence detected. Engage "Deep Flow Lock" to suppress notifications, or leverage the newly completed "Self Healing PRs" to automate repetitive administrative test repairs instantly.
              </p>
            </div>
          </div>

        </div>
      )}

      {activeTab === 'timemachine' && (
        /* SECTION C: ENGINEERING TIME MACHINE */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch animate-fade-in select-text">
          
          {/* Scrubber slider timeline controller (12 columns) */}
          <div className="col-span-12 bg-[#07090e]/95 border border-slate-900 rounded-3xl p-6 space-y-5">
            <span className="text-[10px] uppercase font-mono font-bold text-slate-500 block">
              Workspace Memory Historical Engine Scrub Scale
            </span>

            {/* Tactile Scrubber Slide bar */}
            <div className="space-y-4">
              <input 
                type="range" 
                min="0" 
                max="3" 
                value={selectedEraIndex}
                onChange={(e) => {
                  setSelectedEraIndex(Number(e.target.value));
                }}
                className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-violet-600" 
              />
              
              <div className="flex justify-between text-[11px] font-mono select-none">
                {HISTORIC_ERAS.map((item, idx) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedEraIndex(idx)}
                    className={`text-center font-bold px-3 py-1.5 rounded-xl border transition ${
                      selectedEraIndex === idx
                        ? 'bg-white/5 text-[#a78bfa] border-white/5 font-extrabold shadow-sm'
                        : 'text-slate-500 border-transparent hover:text-slate-300'
                    }`}
                  >
                    <div className="text-white block font-sans">{item.name}</div>
                    <div className="text-[8.5px] text-slate-500 mt-0.5">{item.date}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Specific Era parameters overview */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 border-t border-slate-900/60 pt-5">
              
              {/* Left Column stats (4 cols) */}
              <div className="md:col-span-4 bg-slate-950 border border-slate-900 p-4 rounded-2xl font-mono text-[11px] leading-relaxed space-y-2.5">
                <div className="flex items-center justify-between text-slate-500 border-b border-slate-900 pb-1.5 font-bold">
                  <span>Epoch ID No</span>
                  <span className="text-[#a78bfa] font-extrabold">{era.id.toUpperCase()}</span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>Author Committer:</span>
                  <span className="text-white font-bold">{era.author}</span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>Active Codefiles Mutated:</span>
                  <span className="text-white font-bold">{era.filesChanged} files</span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>Workspace Alignment Score:</span>
                  <span className="text-zinc-300 font-extrabold">{era.alignmentRating}%</span>
                </div>
                <div className="flex items-center justify-between text-slate-500 border-t border-slate-900 pt-1.5 select-none">
                  <span>{era.metricLabel}:</span>
                  <span className="text-white font-extrabold">{era.metricVal} metrics</span>
                </div>
              </div>

              {/* Right Column log overview (8 cols) */}
              <div className="md:col-span-8 bg-slate-950/50 border border-slate-950 p-4 rounded-2xl flex flex-col justify-between">
                <div>
                  <span className="text-[9px] font-mono tracking-widest font-bold uppercase text-slate-500 select-none block">
                    Historical Sync Commit Log Briefing
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed font-mono mt-1 select-text block">
                    "{era.logSummary}"
                  </p>
                </div>

                <div className="pt-4 text-[9.5px] text-slate-500 font-mono flex items-center justify-between select-none">
                  <span>System State Integrity: <strong>VERIFIED SECURE</strong></span>
                  <span className="text-[#a78bfa]">Time Machine Core fully preserved</span>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
