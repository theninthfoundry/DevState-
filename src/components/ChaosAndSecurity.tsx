import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Flame, 
  Activity, 
  Check, 
  Cpu, 
  Database, 
  Globe, 
  Send, 
  AlertTriangle, 
  ChevronRight, 
  KeyRound, 
  Lock, 
  ShieldCheck, 
  Sparkles,
  Info
} from 'lucide-react';

interface ChaosChannel {
  name: string;
  type: string;
  icon: 'cpu' | 'database' | 'api' | 'ws';
  status: 'nominal' | 'affected' | 'collapsed';
  latency: number;
}

const INITIAL_CHANNELS: ChaosChannel[] = [
  { name: 'Core API Gateway', type: 'api', icon: 'api', status: 'nominal', latency: 15 },
  { name: 'WebSocket Event Queue', type: 'ws', icon: 'ws', status: 'nominal', latency: 4 },
  { name: 'Prisma DB Pool', type: 'database', icon: 'database', status: 'nominal', latency: 11 },
  { name: 'Gemini AI Core', type: 'cpu', icon: 'cpu', status: 'nominal', latency: 185 },
  { name: 'FS AST Crawler Daemon', type: 'cpu', icon: 'cpu', status: 'nominal', latency: 45 }
];

interface ThreatVector {
  vector: string;
  source: string;
  severity: 'high' | 'medium' | 'low';
  message: string;
  actionable: boolean;
  fixed?: boolean;
}

const CONST_THREATS: ThreatVector[] = [
  { vector: 'Insecure Routing Configuration', source: 'src/server/apiHandler.ts', severity: 'high', message: 'API CORS wildcard (*) enabled, exposing backend credentials to unauthorized frameworks.', actionable: true },
  { vector: 'Exposed Workspace Credentials', source: 'src/server/geminiService.ts', severity: 'high', message: 'Hardcoded placeholder keys detected in comments block.', actionable: true },
  { vector: 'Privilege Escalation Vector', source: 'node_modules/tar-parser', severity: 'medium', message: 'Tarball folder traversal vulnerability reported (CVE-2026-0422).', actionable: false },
  { vector: 'Unsafe Object Destructuring', source: 'src/App.tsx', severity: 'low', message: 'Unsanitized input interpolation inside innerHTML nodes.', actionable: true }
];

export default function ChaosAndSecurity() {
  const [activeTab, setActiveTab] = useState<'chaos' | 'security'>('chaos');
  const [channels, setChannels] = useState<ChaosChannel[]>(INITIAL_CHANNELS);
  const [chaosLog, setChaosLog] = useState<string[]>(["✓ All services nominal on port 3000. Operating queues are stable <2ms."]);
  const [threats, setThreats] = useState<ThreatVector[]>(CONST_THREATS);
  const [patchingVector, setPatchingVector] = useState<string | null>(null);

  // Trigger Outage simulation
  const triggerChaosOutage = (targetName: string, intensity: 'overflow' | 'deadlock' | 'quota' | 'latency') => {
    setChannels(prev => {
      return prev.map(ch => {
        if (ch.name === targetName) {
          return {
            ...ch,
            status: intensity === 'quota' || intensity === 'deadlock' ? 'collapsed' : 'affected',
            latency: intensity === 'latency' ? 1420 : intensity === 'overflow' ? 320 : 9999
          };
        }
        
        // Simulating Cascading failovers!
        if (targetName === 'Gemini AI Core' && ch.name === 'FS AST Crawler Daemon') {
          return {
            ...ch,
            status: 'affected',
            latency: 240 // crawler slows down trying fallback schemas
          };
        }
        if (targetName === 'Prisma DB Pool' && ch.name === 'Core API Gateway') {
          return {
            ...ch,
            status: 'affected',
            latency: 790
          };
        }
        return ch;
      });
    });

    const timestamp = new Date().toLocaleTimeString();
    let newLogs = [`[${timestamp}] ⚠️ OUTAGE TRIGGERED: Anomaly cascade hit [${targetName}]`];
    
    if (intensity === 'quota') {
      newLogs.push(`[${timestamp}] 🤖 AI Failover engaged successfully: Engaging AST fallback local model!`);
    } else if (intensity === 'deadlock') {
      newLogs.push(`[${timestamp}] ⚠️ Cascading blockage! Re-routing pool traffic to temporary standby databases.`);
    } else {
      newLogs.push(`[${timestamp}] 🌐 Alert: Latency limits exceeded. Routing traffic throttle queues.`);
    }

    setChaosLog(prev => [...newLogs, ...prev]);
  };

  const handleResetChaos = () => {
    setChannels(INITIAL_CHANNELS);
    setChaosLog(["✓ Chaos Incident Resolved. All pipelines returned cleanly to original nominal parameters."]);
  };

  // Secure patches simulation
  const triggerPatchVector = (vectorName: string) => {
    setPatchingVector(vectorName);
    
    setTimeout(() => {
      setThreats(prev => {
        return prev.map(thr => {
          if (thr.vector === vectorName) {
            return { ...thr, fixed: true };
          }
          return thr;
        });
      });
      setPatchingVector(null);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-900 pb-5">
        <div>
          <span className="text-[10px] font-mono font-black text-violet-400 bg-violet-950/20 border border-violet-900/40 px-2.5 py-1 rounded-md tracking-wider uppercase">
            Chaos Lab & Cyber Security
          </span>
          <h2 className="text-xl font-bold tracking-tight text-white mt-2">
            Simulative Chaos & Security Observatory
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-2xl mt-1">
            Simulate outages, observe how the AI-driven fallback gateways recovery cascade instantly, and patch exposed workspace routes and secret injection vulnerabilities.
          </p>
        </div>

        {/* Tab switcher navigation pills */}
        <div className="bg-slate-900/80 p-1 rounded-2xl flex items-center border border-slate-800 text-xs select-none">
          <button
            onClick={() => { setActiveTab('chaos'); }}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
              activeTab === 'chaos' ? 'bg-slate-850 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Live Chaos Engine
          </button>
          <button
            onClick={() => { setActiveTab('security'); }}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all ${
              activeTab === 'security' ? 'bg-slate-850 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Security Observatory
          </button>
        </div>
      </div>

      {activeTab === 'chaos' ? (
        /* SECTION A: CHAOS SIMULATION LAB */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch animate-fade-in select-text">
          
          {/* Chaos Channels Dashboard (8 columns) */}
          <div className="lg:col-span-8 bg-slate-950/75 border border-slate-900 rounded-3xl p-5 relative space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-500 block">
                Workspace Infrastructure Channels
              </span>
              <button
                onClick={handleResetChaos}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-850 text-white border border-slate-800 rounded-xl text-[9px] font-bold transition cursor-pointer font-mono"
              >
                Reset System State
              </button>
            </div>

            {/* Grid display representing service nodes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {channels.map((ch) => {
                let statusColor = 'text-emerald-400 bg-emerald-950/15';
                let cardBorder = 'border-slate-900';
                if (ch.status === 'affected') {
                  statusColor = 'text-amber-500 bg-amber-955/20 border-amber-900/30';
                  cardBorder = 'border-amber-900/40';
                }
                if (ch.status === 'collapsed') {
                  statusColor = 'text-rose-400 bg-rose-955/25 border-rose-900/30';
                  cardBorder = 'border-rose-900/40';
                }

                return (
                  <div key={ch.name} className={`p-4 bg-[#07090e]/85 rounded-2xl border ${cardBorder} flex flex-col justify-between space-y-4 transition-all duration-300 relative`}>
                    
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <span className="text-[8.5px] uppercase font-mono tracking-wider font-bold text-slate-500 block">
                          CHANNEL LAYER
                        </span>
                        <h4 className="text-xs font-bold text-white font-sans">{ch.name}</h4>
                      </div>

                      {ch.icon === 'database' ? (
                        <Database className="w-4 h-4 text-teal-400" />
                      ) : ch.icon === 'ws' ? (
                        <Send className="w-4.5 h-4.5 text-indigo-400" />
                      ) : ch.icon === 'cpu' ? (
                        <Cpu className="w-4.5 h-4.5 text-violet-400" />
                      ) : (
                        <Globe className="w-4.5 h-4.5 text-cyan-400" />
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between font-mono text-[10px]">
                        <span className="text-slate-500">Latency Metric:</span>
                        <span className="text-white font-bold">
                          {ch.status === 'collapsed' ? 'Timeout' : `${ch.latency} ms`}
                        </span>
                      </div>

                      <div className="flex items-center justify-between font-mono text-[10px]">
                        <span className="text-slate-500">Node Status:</span>
                        <span className={`px-2 py-0.5 rounded-full uppercase text-[8px] font-black ${statusColor}`}>
                          {ch.status}
                        </span>
                      </div>
                    </div>

                    {/* Simulators */}
                    <div className="pt-2 border-t border-slate-900/60 flex items-center justify-between gap-1">
                      {ch.icon === 'cpu' ? (
                        <button
                          onClick={() => triggerChaosOutage(ch.name, 'quota')}
                          className="flex-1 py-1 bg-rose-950/20 text-rose-400 border border-rose-900/30 hover:bg-rose-900/30 rounded-lg text-[8.5px] font-black transition cursor-pointer"
                        >
                          Gemini 429 Block
                        </button>
                      ) : ch.icon === 'database' ? (
                        <button
                          onClick={() => triggerChaosOutage(ch.name, 'deadlock')}
                          className="flex-1 py-1 bg-amber-950/20 text-amber-500 border border-amber-900/20 hover:bg-amber-900/30 rounded-lg text-[8.5px] font-black transition cursor-pointer"
                        >
                          Simulate Lock
                        </button>
                      ) : (
                        <button
                          onClick={() => triggerChaosOutage(ch.name, 'latency')}
                          className="flex-1 py-1 bg-indigo-950/20 text-indigo-400 border border-indigo-900/20 hover:bg-indigo-900/30 rounded-lg text-[8.5px] font-black transition cursor-pointer"
                        >
                          Latency Spike
                        </button>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

          {/* Real-time incident logs stream right (4 columns) */}
          <div className="lg:col-span-4 bg-[#07090e]/95 border border-slate-900 rounded-3xl p-5 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-slate-500 select-none block">
                Chaos Logs Telemetry Stream
              </span>

              <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                {chaosLog.map((log, i) => (
                  <div key={i} className="p-3 bg-slate-950 rounded-2xl border border-slate-900 text-[10px] font-mono text-slate-350 select-text leading-relaxed animate-fade-in flex items-start gap-2">
                    <ChevronRight className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#0b0c15] p-3 border border-slate-900 rounded-2xl mt-4 select-text">
              <span className="text-[10px] font-mono text-white flex items-center gap-1.5 font-bold">
                <Info className="w-3.5 h-3.5 text-violet-400" />
                Autonomous Resilience:
              </span>
              <p className="text-[10.5px] text-slate-450 leading-relaxed font-sans font-medium mt-1">
                Whenever Gemini components encounter quota blockage, the local DevState router triggers fallback models ensuring AST crawling and recovery metrics maintain complete reliability.
              </p>
            </div>
          </div>

        </div>
      ) : (
        /* SECTION B: SECURITY OBSERVATORY */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch animate-fade-in select-text">
          
          {/* Threats overview checklist (8 columns) */}
          <div className="lg:col-span-8 bg-slate-950/75 border border-slate-900 rounded-3xl p-5 space-y-4 relative">
            <span className="text-[10px] uppercase font-mono font-bold text-slate-500 block">
              Workspace Vulnerability Checklist
            </span>

            <div className="space-y-3.5">
              {threats.map((thr) => (
                <div key={thr.vector} className={`p-4.5 bg-[#07090e]/85 rounded-2xl border ${thr.fixed ? 'border-emerald-950 bg-[#000a02]/10' : 'border-slate-900'} flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 relative`}>
                  
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[8px] font-mono uppercase px-2 py-0.5 rounded-full font-black ${
                        thr.fixed 
                          ? 'bg-emerald-950/30 text-emerald-400' 
                          : thr.severity === 'high' 
                            ? 'bg-rose-950/30 text-rose-450 border border-rose-900/20' 
                            : 'bg-amber-955/35 text-amber-500 border border-amber-900/20'
                      }`}>
                        {thr.fixed ? 'Secured' : `${thr.severity} threat`}
                      </span>
                      <span className="text-[10.5px] font-mono font-bold text-slate-450">{thr.source}</span>
                    </div>

                    <h4 className="text-xs font-bold text-white font-sans">{thr.vector}</h4>
                    <p className="text-[10.5px] text-slate-450 leading-relaxed font-sans font-medium">
                      {thr.message}
                    </p>
                  </div>

                  {/* Patching buttons */}
                  <div className="shrink-0 text-right">
                    {thr.fixed ? (
                      <span className="text-emerald-500 font-extrabold text-[10.5px] flex items-center justify-end gap-1 font-mono">
                        <ShieldCheck className="w-4 h-4 animate-bounce" /> Patched Mapped
                      </span>
                    ) : thr.actionable ? (
                      <button
                        onClick={() => triggerPatchVector(thr.vector)}
                        disabled={patchingVector !== null}
                        className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[10px] font-bold font-mono transition cursor-pointer select-none active:scale-95 shadow-md shadow-rose-950/30"
                      >
                        {patchingVector === thr.vector ? 'Securing...' : 'Generate Patch'}
                      </button>
                    ) : (
                      <span className="text-slate-600 text-[10px] font-mono">System Root Locked</span>
                    )}
                  </div>

                </div>
              ))}
            </div>
          </div>

          {/* Security Heatmap & recommendations right (4 columns) */}
          <div className="lg:col-span-4 bg-[#07090e]/95 border border-slate-900 rounded-3xl p-5 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-slate-500 select-none block">
                Observatory Threat Heatmap Metrics
              </span>

              {/* Graphic matrix heatmap block */}
              <div className="space-y-3 font-mono text-[10px]">
                <div className="grid grid-cols-5 gap-1.5 select-none">
                  {[...Array(15)].map((_, i) => {
                    let tileColor = 'bg-slate-900 border border-slate-850';
                    if (i === 2 || i === 7) tileColor = 'bg-rose-650 border border-rose-900 animate-pulse';
                    if (i === 12) tileColor = 'bg-amber-600 border border-amber-900 animate-pulse';
                    if (i < 5 && i !== 2) tileColor = 'bg-emerald-950 border border-emerald-900';
                    return (
                      <div 
                        key={i} 
                        className={`h-8 rounded-lg flex items-center justify-center font-bold text-white ${tileColor}`}
                        title="Vulnerability sector"
                      >
                        {i+1}
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between items-center text-[9px] text-slate-500 pt-1.5 select-none">
                  <span>Sector 3: Insecure Headers</span>
                  <span>Sector 8: Temp Credentials</span>
                </div>
              </div>
            </div>

            <div className="bg-[#0b0c15] p-3.5 border border-slate-900 rounded-2xl mt-4 select-text">
              <span className="text-[10.5px] font-mono text-white flex items-center gap-1.5 font-bold">
                <KeyRound className="w-4 h-4 text-violet-400" />
                Hardening Active Patches:
              </span>
              <p className="text-[10.5px] text-slate-450 leading-relaxed font-sans font-medium mt-1">
                Generate dynamic patching to normalize CORS requests on workspace endpoints and automatically hash credentials securely in local environment registries.
              </p>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
