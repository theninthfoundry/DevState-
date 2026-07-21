import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, Network, Zap, ShieldAlert, Cpu, Database, Server, 
  RefreshCw, Layers, TrendingUp, Sparkles, CheckCircle2, AlertTriangle
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { useHUDStore } from '../../store/useHUDStore';

// Mock agents to display when the Aether WebSocket server is offline
const MOCK_AGENTS = [
  {
    uid: "payment_gateway_alpha",
    x: [0.045, 120, 0.02, 12.5],
    belief: [0.040, 110, 0.01, 11.0],
    surprise: 0.15,
    energy: 1.0,
    tau: [4.5, 4.8, 4.9, 4.2],
    version: 154,
    meta: {
      constraints: [
        { name: "cost_limit", upper: 1.0 },
        { name: "latency_limit", upper: 5000.0 },
        { name: "error_limit", upper: 0.2 },
        { name: "token_limit", upper: 20.0 }
      ]
    }
  },
  {
    uid: "llm_moderator_omega",
    x: [0.420, 3100, 0.18, 18.2],
    belief: [0.100, 2200, 0.15, 16.0],
    surprise: 1.84,
    energy: 0.6,
    tau: [1.2, 0.95, 0.8, 1.4],
    version: 89,
    meta: {
      constraints: [
        { name: "cost_limit", upper: 0.5 },
        { name: "latency_limit", upper: 3000.0 },
        { name: "error_limit", upper: 0.1 },
        { name: "token_limit", upper: 15.0 }
      ]
    }
  }
];

// Mini Radial Gauge Component
const RadialGauge = ({ value, max, color, label, unit }: { value: number; max: number; color: string; label: string; unit: string }) => {
  const percentage = Math.min(100, (value / (max || 1)) * 100);
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center relative p-3">
      <svg width="85" height="85" className="transform -rotate-90">
        <circle cx="42.5" cy="42.5" r={radius} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="5" />
        <motion.circle
          cx="42.5" cy="42.5" r={radius} fill="none"
          stroke={color} strokeWidth="5" strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ type: "spring", duration: 1.2, bounce: 0 }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-[13px] font-bold font-mono text-white">
          {value >= 1 ? value.toFixed(0) : value.toFixed(3)}
        </span>
        <span className="text-[8px] text-slate-500 uppercase font-mono">{unit}</span>
      </div>
      <span className="mt-2 text-[9px] text-slate-400 font-mono uppercase tracking-widest text-center">{label}</span>
    </div>
  );
};

export const HydraEngine = () => {
  const agentsFromStore = useHUDStore((state) => state.agents);
  const selectedAgentId = useHUDStore((state) => state.selectedAgentId);
  const setSelectedAgentId = useHUDStore((state) => state.setSelectedAgentId);
  const systemStatus = useHUDStore((state) => state.systemStatus);
  const alerts = useHUDStore((state) => state.alerts);
  const appendLog = useHUDStore((state) => state.appendLog);

  const activeAgents = agentsFromStore.length > 0 ? agentsFromStore : MOCK_AGENTS;
  const currentAgentId = selectedAgentId || activeAgents[0]?.uid;
  const activeAgent = activeAgents.find((a) => a.uid === currentAgentId) || activeAgents[0];

  const handleAgentSelect = (uid: string) => {
    setSelectedAgentId(uid);
    appendLog({
      source: 'HUD Client',
      level: 'info',
      message: `Focused dashboard telemetric link on agent: ${uid}`
    });
  };

  // Get metrics from activeAgent
  const cost = activeAgent?.x?.[0] ?? 0;
  const latency = activeAgent?.x?.[1] ?? 0;
  const errorRate = activeAgent?.x?.[2] ?? 0;
  const tokens = activeAgent?.x?.[3] ?? 0;

  // Get limits
  const constraints = activeAgent?.meta?.constraints || [
    { name: "cost_limit", upper: 1.0 },
    { name: "latency_limit", upper: 5000.0 },
    { name: "error_limit", upper: 0.2 },
    { name: "token_limit", upper: 20.0 }
  ];

  const costLimit = constraints[0]?.upper || 1.0;
  const latencyLimit = constraints[1]?.upper || 5000.0;
  const errorLimit = constraints[2]?.upper || 0.2;
  const tokenLimit = constraints[3]?.upper || 20.0;

  const costSurprise = activeAgent?.surprise > 1.5;
  const latencySurprise = latency > latencyLimit;
  const errorSurprise = errorRate > errorLimit;
  const tokenSurprise = tokens > tokenLimit;

  return (
    <div className="w-full h-full p-6 flex flex-col gap-5 bg-[#020305]/60 overflow-y-auto max-h-[calc(100vh-48px)]">
      
      {/* HEADER SECTION */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-4 shrink-0 gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-wide uppercase flex items-center gap-3">
            <Activity className="text-violet-400 w-7 h-7 stroke-[2.5px] animate-pulse" />
            Hydra Telemetry Matrix
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Aether Constraint-Native Cognitive Monitoring Gateway
          </p>
        </div>
        
        {/* Connection status badge */}
        <div className="flex items-center gap-3 font-mono text-[10px] bg-white/[0.02] border border-white/10 px-3 py-1.5 rounded-xl">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${agentsFromStore.length > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="text-slate-300">
              STREAM: {agentsFromStore.length > 0 ? 'LIVE AETHER' : 'SIMULATION MODE'}
            </span>
          </div>
          {systemStatus && (
            <>
              <span className="text-white/20">|</span>
              <span className="text-slate-400">UPTIME: <strong className="text-white">{Math.round(systemStatus.uptime)}s</strong></span>
              <span className="text-white/20">|</span>
              <span className="text-slate-400">MEM: <strong className="text-white">{systemStatus.memory_mb.toFixed(0)}MB</strong></span>
            </>
          )}
        </div>
      </header>

      {/* CORE SIDEBAR & VIEWPORT SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 items-start">
        
        {/* Left Side: Agents List */}
        <div className="lg:col-span-1 flex flex-col gap-3">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider px-1">Monitored Cognitive Agents</div>
          <div className="space-y-2 max-h-[350px] lg:max-h-[600px] overflow-y-auto custom-scrollbar">
            {activeAgents.map((agent) => {
              const isSelected = agent.uid === currentAgentId;
              const hasAlert = agent.surprise > 1.5 || agent.x[1] > (agent.meta?.constraints?.[1]?.upper || 5000.0);
              
              return (
                <button
                  key={agent.uid}
                  onClick={() => handleAgentSelect(agent.uid)}
                  className={`w-full text-left p-3 rounded-2xl border transition-all duration-300 cursor-pointer ${
                    isSelected 
                      ? 'bg-violet-950/20 border-violet-500/35 shadow-[0_0_15px_rgba(139,92,246,0.05)]' 
                      : 'bg-white/[0.01] border-white/5 hover:bg-white/[0.03] hover:border-white/10'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold font-mono text-white truncate max-w-[140px] block">{agent.uid}</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      hasAlert ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'
                    }`} />
                  </div>
                  
                  <div className="flex justify-between items-center mt-2.5 text-[10px] text-slate-400 font-mono">
                    <span>Surprise: <strong className={hasAlert ? 'text-rose-400' : 'text-slate-200'}>{agent.surprise.toFixed(2)}</strong></span>
                    <span>v{(agent.version || 0)}</span>
                  </div>
                  
                  {/* Energy bar indicator */}
                  <div className="w-full h-1 bg-white/5 mt-2 rounded overflow-hidden">
                    <div 
                      className="h-full bg-violet-400" 
                      style={{ width: `${(agent.energy || 0.5) * 100}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Telemetry Cockpit */}
        <div className="lg:col-span-3 flex flex-col gap-5">
          {activeAgent ? (
            <>
              {/* Agent Detail Overview Card */}
              <GlassCard glowColor={activeAgent.surprise > 1.5 ? 'danger' : 'violet'} className="p-5 flex flex-col md:flex-row justify-between gap-5 items-start md:items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-mono text-xs uppercase">Target Node:</span>
                    <strong className="text-sm font-mono text-white">{activeAgent.uid}</strong>
                  </div>
                  <h2 className="text-xl font-black text-white mt-1.5 tracking-tight flex items-center gap-2">
                    {activeAgent.surprise > 1.5 ? (
                      <>
                        <AlertTriangle className="w-5 h-5 text-rose-500 animate-bounce" />
                        <span className="text-rose-400">SURPRISE SPIKE DETECTED</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-200">CONSTRAINT MANIFOLD STABLE</span>
                      </>
                    )}
                  </h2>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-md">
                    Belief coordinates represent smoothed trajectories mapping observations under Lagrange limits.
                  </p>
                </div>

                {/* Cognitive load details */}
                <div className="flex gap-6 font-mono text-[11px] bg-black/40 p-3 rounded-xl border border-white/5">
                  <div>
                    <span className="text-slate-500 text-[9px] uppercase block">Surprise Index</span>
                    <span className={`text-base font-bold ${activeAgent.surprise > 1.5 ? 'text-rose-400' : 'text-zinc-300'}`}>
                      {activeAgent.surprise.toFixed(4)}
                    </span>
                  </div>
                  <div className="w-px bg-white/5" />
                  <div>
                    <span className="text-slate-500 text-[9px] uppercase block">Adaptive Capacity (C)</span>
                    <span className="text-base font-bold text-violet-400">
                      {activeAgent.energy.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-px bg-white/5" />
                  <div>
                    <span className="text-slate-500 text-[9px] uppercase block">Update ticks</span>
                    <span className="text-base font-bold text-slate-300">
                      #{activeAgent.version}
                    </span>
                  </div>
                </div>
              </GlassCard>

              {/* 2x2 Constraints Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Metric 1: Cost */}
                <GlassCard glowColor={costSurprise ? 'danger' : 'violet'} className="p-4 flex flex-col justify-between min-h-[140px]">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block font-bold">API Transaction Cost</span>
                      <div className="text-2xl font-black text-white font-mono mt-1">
                        ${cost.toFixed(4)}
                      </div>
                    </div>
                    <div className="text-right font-mono text-[9px] text-slate-400">
                      <div>Limit: <strong className="text-white">${costLimit.toFixed(2)}</strong></div>
                      <div className="mt-0.5">Belief: <strong className="text-slate-300">${(activeAgent.belief?.[0] || 0).toFixed(3)}</strong></div>
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="mt-4">
                    <div className="w-full h-1 bg-white/5 rounded overflow-hidden">
                      <div 
                        className={`h-full ${costSurprise ? 'bg-rose-500 animate-pulse' : 'bg-violet-500'}`} 
                        style={{ width: `${Math.min(100, (cost / costLimit) * 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center mt-1.5 text-[9px] font-mono text-slate-500">
                      <span>Precision link (τ): {(activeAgent.tau?.[0] || 0.0).toFixed(2)}</span>
                      <span>{Math.round((cost / costLimit) * 100)}% threshold</span>
                    </div>
                  </div>
                </GlassCard>

                {/* Metric 2: Latency */}
                <GlassCard glowColor={latencySurprise ? 'danger' : 'cyan'} className="p-4 flex flex-col justify-between min-h-[140px]">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block font-bold">Response Velocity</span>
                      <div className="text-2xl font-black text-white font-mono mt-1">
                        {Math.round(latency)} <span className="text-xs text-slate-400">ms</span>
                      </div>
                    </div>
                    <div className="text-right font-mono text-[9px] text-slate-400">
                      <div>Limit: <strong className="text-white">{latencyLimit}ms</strong></div>
                      <div className="mt-0.5">Belief: <strong className="text-slate-300">{Math.round(activeAgent.belief?.[1] || 0)}ms</strong></div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="w-full h-1 bg-white/5 rounded overflow-hidden">
                      <div 
                        className={`h-full ${latencySurprise ? 'bg-rose-500 animate-pulse' : 'bg-cyan-400'}`} 
                        style={{ width: `${Math.min(100, (latency / latencyLimit) * 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center mt-1.5 text-[9px] font-mono text-slate-500">
                      <span>Precision link (τ): {(activeAgent.tau?.[1] || 0.0).toFixed(2)}</span>
                      <span>{Math.round((latency / latencyLimit) * 100)}% threshold</span>
                    </div>
                  </div>
                </GlassCard>

                {/* Metric 3: Error Rate */}
                <GlassCard glowColor={errorSurprise ? 'danger' : 'emerald'} className="p-4 flex flex-col justify-between min-h-[140px]">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block font-bold">Fault Dispersion</span>
                      <div className="text-2xl font-black text-white font-mono mt-1">
                        {(errorRate * 100).toFixed(1)} <span className="text-xs text-slate-400">%</span>
                      </div>
                    </div>
                    <div className="text-right font-mono text-[9px] text-slate-400">
                      <div>Limit: <strong className="text-white">{(errorLimit * 100).toFixed(1)}%</strong></div>
                      <div className="mt-0.5">Belief: <strong className="text-slate-300">{(activeAgent.belief?.[2] * 100 || 0).toFixed(1)}%</strong></div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="w-full h-1 bg-white/5 rounded overflow-hidden">
                      <div 
                        className={`h-full ${errorSurprise ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} 
                        style={{ width: `${Math.min(100, (errorRate / errorLimit) * 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center mt-1.5 text-[9px] font-mono text-slate-500">
                      <span>Precision link (τ): {(activeAgent.tau?.[2] || 0.0).toFixed(2)}</span>
                      <span>{Math.round((errorRate / errorLimit) * 100)}% threshold</span>
                    </div>
                  </div>
                </GlassCard>

                {/* Metric 4: Tokens */}
                <GlassCard glowColor={tokenSurprise ? 'danger' : 'amber'} className="p-4 flex flex-col justify-between min-h-[140px]">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block font-bold">Lexicon volume (Tokens)</span>
                      <div className="text-2xl font-black text-white font-mono mt-1">
                        {tokens.toFixed(2)} <span className="text-xs text-slate-400">k</span>
                      </div>
                    </div>
                    <div className="text-right font-mono text-[9px] text-slate-400">
                      <div>Limit: <strong className="text-white">{tokenLimit}k</strong></div>
                      <div className="mt-0.5">Belief: <strong className="text-slate-300">{(activeAgent.belief?.[3] || 0).toFixed(1)}k</strong></div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="w-full h-1 bg-white/5 rounded overflow-hidden">
                      <div 
                        className={`h-full ${tokenSurprise ? 'bg-rose-500 animate-pulse' : 'bg-amber-400'}`} 
                        style={{ width: `${Math.min(100, (tokens / tokenLimit) * 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center mt-1.5 text-[9px] font-mono text-slate-500">
                      <span>Precision link (τ): {(activeAgent.tau?.[3] || 0.0).toFixed(2)}</span>
                      <span>{Math.round((tokens / tokenLimit) * 100)}% threshold</span>
                    </div>
                  </div>
                </GlassCard>
              </div>

              {/* Alerts feed for this agent */}
              <div className="flex flex-col gap-2">
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider px-1">Causal Alert History ({alerts.filter(a => a.agent_id === currentAgentId).length})</div>
                <div className="space-y-2">
                  {alerts.filter(a => a.agent_id === currentAgentId).length === 0 ? (
                    <div className="text-slate-600 text-xs font-mono py-4 text-center border border-white/5 rounded-xl bg-black/20">
                      No active anomalies registered for this coupling link.
                    </div>
                  ) : (
                    alerts.filter(a => a.agent_id === currentAgentId).map((alert, idx) => (
                      <div key={idx} className={`p-3.5 rounded-xl border font-mono text-xs ${
                        alert.resolved 
                          ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-300' 
                          : 'bg-rose-500/5 border-rose-500/20 text-white'
                      }`}>
                        <div className="flex justify-between items-center">
                          <span className={alert.resolved ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                            {alert.resolved ? 'RESOLVED' : `ALERT: Surprise ${alert.priority?.toFixed(2)}`}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {new Date(alert.timestamp * 1000).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="mt-1.5 text-slate-300">{alert.message}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          ) : (
            <GlassCard className="p-8 text-center text-slate-500 font-mono text-xs">
              Waiting for Aether telemetry connection...
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
};
