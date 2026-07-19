import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, AlertTriangle, Fingerprint } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';

export const SentinelEngine = () => {
  return (
    <div className="w-full h-full p-8 flex flex-col gap-6">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <ShieldCheck className="text-emerald-400 w-8 h-8" />
            Sentinel AI Guardian
          </h1>
          <p className="text-slate-400 mt-2 font-mono text-sm uppercase tracking-wider">Continuous Governance & Threat Parsing</p>
        </div>
        <div className="text-right">
          <div className="text-5xl font-mono text-emerald-400 font-bold blur-[0.5px]">99.8%</div>
          <div className="text-xs text-slate-500 uppercase tracking-widest mt-1">Network Integrity</div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
        {/* Module 1 */}
        <GlassCard glowColor="emerald" className="col-span-1">
          <div className="flex items-center gap-3 mb-4">
            <Fingerprint className="text-emerald-400 w-5 h-5" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Credential Scans</h3>
          </div>
          <div className="space-y-3">
            {[
              { path: '.env.production', status: 'SECURE' },
              { path: 'src/config/aws.ts', status: 'SECURE' },
              { path: 'database/seeds.sql', status: 'SECURE' },
            ].map((file, i) => (
              <div key={i} className="flex justify-between items-center text-xs font-mono border-b border-white/5 pb-2">
                <span className="text-slate-400 truncate max-w-[180px]">{file.path}</span>
                <span className="text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">{file.status}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Module 2: Active Threat Board */}
        <GlassCard glowColor="danger" className="col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="text-red-500 w-5 h-5" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Active Anomalies</h3>
          </div>
          <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4 font-mono text-sm">
            <div className="flex items-start gap-4">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-ping mt-1.5" />
              <div>
                <div className="text-red-400 font-bold">Insecure Deserialization Risk Detected</div>
                <div className="text-slate-400 text-xs mt-1">Target: `src/server/gateway/websocket-hub.ts` Line 42</div>
                <div className="text-slate-500 text-xs mt-2">
                  <span className="text-slate-300">Suggestion:</span> Implement Zod schema validation before parsing incoming telemetry frames.
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
