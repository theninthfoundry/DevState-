import React from 'react';
import { ShieldAlert, Zap, Cpu } from 'lucide-react';

export default function SystemLogs({ isCompact = false }: { isCompact?: boolean }) {
  return (
    <div className={`flex flex-col h-full bg-[#0d1117] text-[#8b949e] font-mono text-[10px] sm:text-xs overflow-hidden ${!isCompact ? 'p-2 sm:p-4' : 'p-2'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-cyan-400 font-bold uppercase tracking-widest text-[9px] sm:text-[10px] flex items-center gap-1 sm:gap-2">
          <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-400" />
          Live Neural Telemetry
        </div>
        <div className="flex gap-1.5 sm:gap-2">
          <span className="bg-[#238636] text-white px-1.5 sm:px-2 py-0.5 rounded-sm flex items-center gap-1 text-[8px] sm:text-[9px] font-bold uppercase">
            <Cpu className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Core Online
          </span>
          <span className="bg-[#1f6feb] text-white px-1.5 sm:px-2 py-0.5 rounded-sm flex items-center gap-1 text-[8px] sm:text-[9px] font-bold uppercase">
            Trace Active
          </span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-1 sm:space-y-1.5 custom-scrollbar pr-1 sm:pr-2">
        <div className="flex gap-2 sm:gap-3 leading-relaxed hover:bg-white/5 p-0.5 sm:p-1 rounded">
          <span className="text-[#484f58] shrink-0 w-12 sm:w-16">15:42:01</span>
          <span className="text-[#3fb950] shrink-0">[INIT]</span>
          <span className="text-slate-300 break-words">DevState Supreme OS Kernel booting...</span>
        </div>
        <div className="flex gap-2 sm:gap-3 leading-relaxed hover:bg-white/5 p-0.5 sm:p-1 rounded">
          <span className="text-[#484f58] shrink-0 w-12 sm:w-16">15:42:02</span>
          <span className="text-[#a5d6ff] shrink-0">[INFO]</span>
          <span className="text-slate-400 break-words">Establishing secure websocket tunnels.</span>
        </div>
        <div className="flex gap-2 sm:gap-3 leading-relaxed bg-[#f85149]/10 p-0.5 sm:p-1 rounded border border-[#f85149]/20">
          <span className="text-[#484f58] shrink-0 w-12 sm:w-16">15:42:05</span>
          <span className="text-[#f85149] shrink-0 font-bold">[WARN]</span>
          <span className="text-[#ff7b72] break-words flex items-start gap-1 sm:gap-2">
            <ShieldAlert className="w-3 h-3 sm:w-3.5 sm:h-3.5 mt-0.5 shrink-0" />
            Vulnerability detected in active dependency graph.
          </span>
        </div>
        <div className="flex gap-2 sm:gap-3 leading-relaxed hover:bg-white/5 p-0.5 sm:p-1 rounded">
          <span className="text-[#484f58] shrink-0 w-12 sm:w-16">15:42:10</span>
          <span className="text-[#d2a8ff] shrink-0">[AI]</span>
          <span className="text-violet-300 break-words">Evaluating abstract syntax tree... No syntax anomalies found.</span>
        </div>
        <div className="flex gap-2 sm:gap-3 leading-relaxed hover:bg-white/5 p-0.5 sm:p-1 rounded">
          <span className="text-[#484f58] shrink-0 w-12 sm:w-16">15:42:12</span>
          <span className="text-[#ff7b72] shrink-0">[NET]</span>
          <span className="text-slate-300 break-words">Connection to remote cluster timed out. Retrying...</span>
        </div>
        <div className="flex gap-2 sm:gap-3 leading-relaxed hover:bg-white/5 p-0.5 sm:p-1 rounded">
          <span className="text-[#484f58] shrink-0 w-12 sm:w-16">15:42:15</span>
          <span className="text-[#a5d6ff] shrink-0">[SYS]</span>
          <span className="text-slate-400 break-words">All microservices mapped. Memory allocation stable at 42%.</span>
        </div>
      </div>
    </div>
  );
}
