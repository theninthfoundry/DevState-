import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, Cpu, Database, Network, Sliders, AlertTriangle, 
  RefreshCw, CheckCircle2, TrendingUp, Zap, Server, Code,
  Clock, Flame, HelpCircle, HardDrive, BarChart2, ShieldAlert
} from 'lucide-react';

interface WaveformProps {
  pointsCount: number;
  multiplier: number;
  color: string;
  speed: number;
}

// ICU Waveform generator
function RealtimeIcuWaveform({ pointsCount = 45, multiplier = 20, color = '#d4d4d8', speed = 1.6 }: WaveformProps) {
  const [points, setPoints] = useState<number[]>(Array(pointsCount).fill(15));
  
  useEffect(() => {
    let animId: number;
    let t = 0;
    
    const tick = () => {
      t += speed;
      setPoints(prev => {
        const next = [...prev.slice(1)];
        // Create standard heart block electrical pulse shape
        let val = 15;
        const cycle = Math.floor(t) % 15;
        if (cycle === 1) val = 2; // high spike
        else if (cycle === 2) val = 28; // low dip
        else val = 15 + Math.sin(t * 0.8) * multiplier; // ambient noise
        
        next.push(val);
        return next;
      });
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [multiplier, pointsCount, speed]);

  const pathD = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${(idx * 7)} ${p}`).join(' ');

  return (
    <svg viewBox={`0 0 ${pointsCount * 7} 30`} className="w-full h-8 fill-none stroke-[1.8] saturate-150 transition-all duration-300" style={{ stroke: color }}>
      <path d={pathD} />
    </svg>
  );
}

interface HydraProps {
  onTriggerSound: (freq?: number) => void;
  onTriggerNotification: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export default function HydraPerformanceTelemetry({ onTriggerSound, onTriggerNotification }: HydraProps) {
  const [activeTab, setActiveTab] = useState<'vitals' | 'requests' | 'traces' | 'db'>('vitals');
  
  // Realtime state parameters
  const [cpuServer, setCpuServer] = useState(18.2);
  const [cpuClient, setCpuClient] = useState(6.4);
  const [memoryHeap, setMemoryHeap] = useState(84.1);
  const [activeConns, setActiveConns] = useState(14);
  const [pps, setPps] = useState(112); // packets per second

  // Budget managers
  const [p95Budget, setP95Budget] = useState(240); // ms limit
  const [currentP95, setCurrentP95] = useState(184); // actual P95

  // OpenTelemetry Span Selection
  const [selectedTraceId, setSelectedTraceId] = useState<string>('tr-01');

  // Simulation ticks
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuServer(prev => Math.max(10, Math.min(95, prev + (Math.random() - 0.5) * 4)));
      setCpuClient(prev => Math.max(3, Math.min(30, prev + (Math.random() - 0.5) * 1.5)));
      setMemoryHeap(prev => Math.max(70, Math.min(256, prev + (Math.random() - 0.4) * 0.5)));
      setActiveConns(prev => Math.max(5, Math.min(40, prev + (Math.random() > 0.5 ? 1 : -1))));
      setPps(prev => Math.max(40, Math.min(250, prev + Math.floor((Math.random() - 0.5) * 15))));

      // Slowly drift P95
      setCurrentP95(prev => {
        const drift = (Math.random() - 0.5) * 12;
        const next = Math.max(80, Math.min(400, prev + drift));
        if (next > p95Budget) {
          onTriggerSound(320); // Deep error alert frequency
        }
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [p95Budget, onTriggerSound]);

  return (
    <div id="hydra-performance-telemetry" className="font-sans text-slate-100 select-none">
      
      {/* PERFORMANCE HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-violet-950/40 pb-5 mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1 px-1.5 bg-zinc-800 text-[#e4e4e7] rounded-lg text-[9px] font-mono border border-white/10 uppercase tracking-widest font-black animate-pulse">
              TELEMETRY CORE UP
            </span>
            <span className="text-slate-550 font-mono text-[10px]">ICU STATUS: NO BUDGET BREACHES</span>
          </div>
          <h2 className="text-2xl font-black text-zinc-300 uppercase tracking-widest flex items-center gap-2">
            <Activity className="w-6 h-6 text-zinc-300 animate-pulse" />
            HYDRA PERFORMANCE TELEMETRY
          </h2>
          <p className="text-xs text-slate-400 max-w-xl mt-1">
            ICU monitoring station tracking Node.js event-loop lag, garbage collection pressures, distributed trace latency spans, and performance budget benchmarks.
          </p>
        </div>

        {/* COMPREHENSIVE BUD-ACCURATE TELEMETRY GAUGES */}
        <div className="flex items-center bg-slate-950/60 p-3 rounded-2xl border border-violet-950/20 font-mono text-[10.5px]">
          <div className="px-3">
            <span className="text-slate-500 text-[8.5px] uppercase block">P95 LATENCY</span>
            <span className={`text-base font-black tracking-tighter block mt-0.5 ${
              currentP95 > p95Budget ? 'text-red-400 animate-pulse' : 'text-zinc-300'
            }`}>
              {currentP95.toFixed(0)} ms
            </span>
            <span className="text-[8px] text-slate-550 block mt-0.5">BUDGET Limit: {p95Budget}ms</span>
          </div>
          
          <div className="w-px h-8 bg-slate-900" />
          
          <div className="px-3">
            <span className="text-slate-500 text-[8.5px] uppercase block">TRAFFIC CAPACITY</span>
            <span className="text-base font-black text-zinc-300 block mt-0.5">{pps} pps</span>
            <span className="text-[8px] text-slate-550 block mt-0.5">Stable payload</span>
          </div>
        </div>
      </div>

      {/* CORE PERFORMANCE RIBBON (Respiratory CPU and Memory telemetry cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        
        {/* Cpu Card */}
        <div className="bg-[#04060a]/90 border border-slate-900 rounded-2.5xl p-4 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[9.5px] font-mono uppercase text-slate-500 font-bold">Node CPU consumption</span>
            <Cpu className="w-4 h-4 text-zinc-300" />
          </div>
          <div className="text-lg font-black tracking-tight text-slate-200 mt-1">
            {(cpuServer + cpuClient).toFixed(1)} %
          </div>
          {/* Waves inside ECG Card */}
          <div className="mt-2.5">
            <RealtimeIcuWaveform multiplier={0.25} pointsCount={25} color="#d4d4d8" speed={0.9} />
          </div>
        </div>

        {/* Memory heap Card */}
        <div className="bg-[#04060a]/90 border border-slate-900 rounded-2.5xl p-4 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[9.5px] font-mono uppercase text-slate-500 font-bold">Memory heap RSS</span>
            <HardDrive className="w-4 h-4 text-zinc-300" />
          </div>
          <div className="text-lg font-black tracking-tight text-slate-200 mt-1">
            {memoryHeap.toFixed(1)} MB
          </div>
          <div className="mt-2.5">
            <RealtimeIcuWaveform multiplier={0.15} pointsCount={25} color="#38bdf8" speed={0.6} />
          </div>
        </div>

        {/* Network connections load */}
        <div className="bg-[#04060a]/90 border border-slate-900 rounded-2.5xl p-4 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[9.5px] font-mono uppercase text-slate-500 font-bold">SOCKET CONNS LEVEL</span>
            <Network className="w-4 h-4 text-zinc-300" />
          </div>
          <div className="text-lg font-black tracking-tight text-slate-200 mt-1">
            {activeConns} Active Sockets
          </div>
          <div className="mt-2.5">
            <RealtimeIcuWaveform multiplier={0.3} pointsCount={25} color="#a78bfa" speed={1.1} />
          </div>
        </div>

        {/* Event Loop Telemetry */}
        <div className="bg-[#04060a]/90 border border-slate-900 rounded-2.5xl p-4 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[9.5px] font-mono uppercase text-slate-500 font-bold">EVENT LOOP LAG</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-lg font-black tracking-tight text-slate-200 mt-1">
            1.24 ms delay
          </div>
          <div className="mt-2.5">
            <RealtimeIcuWaveform multiplier={0.2} pointsCount={25} color="#fbbf24" speed={1.5} />
          </div>
        </div>

      </div>

      {/* COMPASS TAB NAVIGATION */}
      <div className="flex border-b border-slate-900 pb-3 mb-6 gap-2">
        <button
          onClick={() => { onTriggerSound(520); setActiveTab('vitals'); }}
          className={`px-4 py-2 font-mono text-xs font-bold rounded-xl transition border ${
            activeTab === 'vitals'
              ? 'bg-zinc-800 border-white/10 text-zinc-300 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          📈 LIVE SYSTEM VITALS
        </button>
        <button
          onClick={() => { onTriggerSound(580); setActiveTab('requests'); }}
          className={`px-4 py-2 font-mono text-xs font-bold rounded-xl transition border ${
            activeTab === 'requests'
              ? 'bg-zinc-800 border-white/10 text-zinc-300 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          ⚡ TRANSMISSION VOLUME
        </button>
        <button
          onClick={() => { onTriggerSound(640); setActiveTab('traces'); }}
          className={`px-4 py-2 font-mono text-xs font-bold rounded-xl transition border ${
            activeTab === 'traces'
              ? 'bg-zinc-800 border-white/10 text-zinc-300 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          🔍 DISTRIBUTED TRACING SPANS
        </button>
        <button
          onClick={() => { onTriggerSound(700); setActiveTab('db'); }}
          className={`px-4 py-2 font-mono text-xs font-bold rounded-xl transition border ${
            activeTab === 'db'
              ? 'bg-zinc-800 border-white/10 text-zinc-300 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          💾 SPANNER DB OPTIMIZER
        </button>
      </div>

      <AnimatePresence mode="wait">
        
        {/* TAB 1: SYSTEM VITALS & BUDGET BUILDER */}
        {activeTab === 'vitals' && (
          <motion.div
            key="vitals"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* SLIDERS BUDGET MANAGER */}
            <div className="lg:col-span-4 bg-slate-950/80 p-5 border border-slate-900 rounded-3xl space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="text-xs font-black text-violet-450 uppercase font-mono tracking-wider flex items-center gap-1">
                  <Sliders className="w-4 h-4" />
                  PERFORMANCE BUDGET MANAGER
                </h3>
                <p className="text-[11px] text-slate-505 leading-relaxed">
                  Budgeting defines threshold guard values. When real-time sweeps exceed targets, audio indicators trip alert triggers instantly.
                </p>

                <div className="space-y-4 font-mono">
                  <div>
                    <label className="text-[10.5px] block text-slate-350">
                      P95 latency budget threshold limit: <span className="text-[#e4e4e7] font-bold">{p95Budget}ms</span>
                    </label>
                    <input
                      type="range"
                      min="100"
                      max="400"
                      value={p95Budget}
                      onChange={(e) => { onTriggerSound(560); setP95Budget(parseInt(e.target.value)); }}
                      className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-[#e4e4e7] mt-2"
                    />
                  </div>

                  <div className="bg-[#030509] p-3 rounded-xl border border-slate-900 flex justify-between items-center">
                    <span className="text-[10px] text-slate-500 uppercase">Budget Status</span>
                    {currentP95 <= p95Budget ? (
                      <span className="text-zinc-300 font-black text-[10px] bg-zinc-800 px-2 py-0.5 rounded">BUD_COMPLIANTED</span>
                    ) : (
                      <span className="text-red-400 font-black text-[10px] bg-red-500/10 px-2 py-0.5 rounded animate-pulse">BUDGET EXCEEDED</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-zinc-800 p-3.5 border border-white/10 rounded-2xl text-[10px] text-zinc-300/90 leading-relaxed font-mono">
                💡 Caching advisory: Running bulk memory caches would reduce typical REST- renew sessions loads from ~200ms to 8ms.
              </div>
            </div>

            {/* ENHANCED FRONTEND CORE WEB VITALS METRICS */}
            <div className="lg:col-span-8 bg-[#0a0c12]/80 border border-slate-900 rounded-3xl p-5 md:p-6 space-y-6">
              <h3 className="text-xs font-black text-slate-300 font-mono uppercase tracking-widest">
                🧭 CORE WEB VITALS SCORECARD & LAZY-LOADING AUDITS
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-center">
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-900">
                  <span className="text-slate-500 text-[9px] block uppercase">LCP (Largest Render)</span>
                  <span className="text-xl font-black text-zinc-300 block mt-1">1.12 s</span>
                  <span className="text-[8px] text-zinc-400 uppercase font-black bg-zinc-800 px-1.5 py-0.5 rounded mt-2 inline-block">EXCELLENT</span>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-900">
                  <span className="text-slate-500 text-[9px] block uppercase">INP (Input Response)</span>
                  <span className="text-xl font-black text-zinc-300 block mt-1">45 ms</span>
                  <span className="text-[8px] text-zinc-400 uppercase font-black bg-zinc-800 px-1.5 py-0.5 rounded mt-2 inline-block">EXCELLENT</span>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-900">
                  <span className="text-slate-500 text-[9px] block uppercase">CLS (Layout Shift)</span>
                  <span className="text-xl font-black text-zinc-300 block mt-1">0.01</span>
                  <span className="text-[8px] text-zinc-400 uppercase font-black bg-zinc-800 px-1.5 py-0.5 rounded mt-2 inline-block">STABLE</span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-900 font-mono text-[11px] text-slate-400 space-y-2">
                <div className="font-extrabold text-slate-200">Recommended Optimization Actions:</div>
                <ul className="list-disc pl-4 space-y-1 text-slate-450 list-inside text-[10.5px]">
                  <li>Bundle chunk separation inside <code className="text-zinc-300">framer-motion</code>.</li>
                  <li>Enable static gzip responses for telemetry assets payloads.</li>
                </ul>
              </div>
            </div>

          </motion.div>
        )}

        {/* TAB 2: REQUEST TELEMETRY */}
        {activeTab === 'requests' && (
          <motion.div
            key="requests"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6 select-text"
          >
            <div className="bg-slate-950/85 p-5 md:p-6 border border-slate-900 rounded-3xl space-y-5 font-mono">
              <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest">
                🔥 SLOWEST API ROUTE PATH LEADERBOARD
              </h3>

              <div className="space-y-2.5">
                <div className="p-3 bg-red-950/10 border border-red-500/20 rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <span className="font-black text-red-400">/api/v1/analytics/db-scan (GET)</span>
                    <span className="text-[9.5px] text-slate-505 block mt-1">Reason: Complex Spanner table indexing scans without filter cache headers.</span>
                  </div>
                  <span className="font-black text-red-400">850 ms (P50)</span>
                </div>

                <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-amber-400">/api/v1/auth/session/renew (POST)</span>
                    <span className="text-[9.5px] text-slate-500 block mt-1">Reason: Encryption validation algorithms of expiring session tokens.</span>
                  </div>
                  <span className="font-bold text-amber-400">224 ms (P50)</span>
                </div>

                <div className="p-3 bg-slate-900/40 rounded-xl flex justify-between items-center text-xs text-slate-450">
                  <div>
                    <span>/api/workspace (GET)</span>
                    <span className="text-[9.5px] text-slate-550 block mt-1">Reason: File IO stat queries on node_modules subtrees.</span>
                  </div>
                  <span>140 ms (P50)</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 3: TRACES */}
        {activeTab === 'traces' && (
          <motion.div
            key="traces"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 select-text"
          >
            {/* Trace Picker */}
            <div className="lg:col-span-4 bg-slate-950/80 p-4 border border-slate-900 rounded-3xl space-y-3 font-mono text-xs">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Distributed Traces</h4>
              
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                <div 
                  onClick={() => { onTriggerSound(490); setSelectedTraceId('tr-01'); }}
                  className={`p-3 rounded-xl border cursor-pointer transition ${
                    selectedTraceId === 'tr-01' ? 'bg-[#0d1e1c] border-[#d4d4d8]/50' : 'bg-slate-900/65 border-transparent'
                  }`}
                >
                  <div className="font-bold text-slate-200">id: tr-af88019</div>
                  <div className="text-[9.5px] text-slate-500 mt-1">POST /auth/session/renew | 224ms</div>
                </div>

                <div 
                  onClick={() => { onTriggerSound(490); setSelectedTraceId('tr-02'); }}
                  className={`p-3 rounded-xl border cursor-pointer transition ${
                    selectedTraceId === 'tr-02' ? 'bg-[#e4e4e7]/5 border-slate-900' : 'bg-slate-900/65 border-transparent'
                  }`}
                >
                  <div className="font-bold text-slate-200">id: tr-cc019bc</div>
                  <div className="text-[9.5px] text-slate-500 mt-1">GET /api/workspace | 140ms</div>
                </div>
              </div>
            </div>

            {/* Timeline spans (Gantt representation) */}
            <div className="lg:col-span-8 bg-slate-955 bg-slate-950 p-5 md:p-6 border border-slate-900 rounded-3xl space-y-5 font-mono">
              <h4 className="text-xs font-black text-slate-350 uppercase tracking-widest">
                ⏳ TRACE SPAN SEQUENCE TIMELINE (GANTT VIEW)
              </h4>

              {selectedTraceId === 'tr-01' ? (
                <div className="space-y-4">
                  {/* Span 1 */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-bold text-slate-200">HTTP Entry Gate (express_handler)</span>
                      <span className="text-slate-550">0ms - 224ms (224ms)</span>
                    </div>
                    <div className="h-4 bg-zinc-800 border border-white/10 rounded-md relative overflow-hidden">
                      <div className="absolute top-0 left-0 h-full bg-violet-450 w-full opacity-65" />
                    </div>
                  </div>

                  {/* Span 2 (nested) */}
                  <div className="space-y-1 pl-6">
                    <div className="flex justify-between text-[10.5px]">
                      <span className="text-slate-300">Authentication parser jwt verification</span>
                      <span className="text-slate-550">12ms - 180ms (168ms)</span>
                    </div>
                    <div className="h-3.5 bg-zinc-800 border border-white/10 rounded-md relative overflow-hidden">
                      <div className="absolute top-0 left-[5.4%] h-full bg-zinc-700 w-[75%] opacity-65" />
                    </div>
                  </div>

                  {/* Span 3 (nested deeper) */}
                  <div className="space-y-1 pl-12">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-400">Auth Token parse (internal)</span>
                      <span className="text-slate-550">18ms - 32ms (14ms)</span>
                    </div>
                    <div className="h-3 bg-zinc-800 border border-white/10 rounded-md relative overflow-hidden">
                      <div className="absolute top-0 left-[8%] h-full bg-violet-405 w-[6.2%] opacity-65 bg-zinc-800" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 animate-fade-in">
                  {/* Workspace Trace */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-bold text-slate-200">Express GET /api/workspace</span>
                      <span className="text-slate-555 text-slate-500">0ms - 140ms (140ms)</span>
                    </div>
                    <div className="h-4 bg-indigo-505/20 border border-white/10 rounded-md relative overflow-hidden">
                      <div className="absolute top-0 left-0 h-full bg-zinc-800 w-full opacity-60" />
                    </div>
                  </div>
                </div>
              )}
            </div>

          </motion.div>
        )}

        {/* TAB 4: DATABASE SQL DB ANALYSIS */}
        {activeTab === 'db' && (
          <motion.div
            key="db"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6 select-text"
          >
            <div className="bg-slate-950 p-5 md:p-6 border border-slate-900 rounded-3xl space-y-5 font-mono">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <h3 className="text-sm font-black text-zinc-300 uppercase tracking-widest flex items-center gap-1.5">
                  <Database className="w-5 h-5 text-zinc-300" />
                  DATABASE EXPLAIN QUERY PLAN & N+1 SENSORS
                </h3>
                <span className="px-2.5 py-1 bg-red-500/10 border border-red-500/20 rounded text-[10px] text-red-400 font-extrabold animate-pulse">
                  N+1 QUERY RISK ALERT
                </span>
              </div>

              <div className="p-4 bg-slate-900/40 rounded-2xl border border-red-950/20 space-y-3">
                <div className="flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Alert: Multi-loop sequence executing query manually inside loop parameters</h4>
                    <p className="text-[10.5px] text-slate-500 mt-1">
                      Function <code className="text-zinc-300">scanWorkspace</code> triggers file reading recursive loop calls inside synchronous blocks. Results in high system stack trace iterations.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-[#030509] border border-slate-900 rounded-xl overflow-hidden p-3.5">
                <span className="text-[9.5px] text-slate-550 block mb-2 font-bold uppercase">Estimated Execution Explain Profile</span>
                <code className="text-[11px] text-[#e4e4e7] block whitespace-pre leading-relaxed">
                  {`EXPLAIN SELECT * FROM auth_tokens WHERE client_id = ?;
-> Index Scan using idx_tokens_client_id (cost=0.15..12.55)
-> Filter: (status = 'active'::text)
-> Total Time: 0.12ms (OPTIMAL)`}
                </code>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
