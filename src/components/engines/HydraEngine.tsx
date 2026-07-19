import React from 'react';
import { motion } from 'motion/react';
import { Activity, Network, Zap } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { useHUDStore } from '../../store/useHUDStore';

// Mini Radial Gauge Component
const RadialGauge = ({ value, color, label }: { value: number; color: string; label: string }) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center relative">
      <svg width="100" height="100" className="transform -rotate-90">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
        <motion.circle
          cx="50" cy="50" r={radius} fill="none"
          stroke={color} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ type: "spring", duration: 1.5, bounce: 0 }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-xl font-bold font-mono text-white">{value}%</span>
      </div>
      <span className="mt-2 text-xs text-slate-500 uppercase tracking-widest">{label}</span>
    </div>
  );
};

export const HydraEngine = () => {
  const metrics = useHUDStore((state) => state.metrics);

  return (
    <div className="w-full h-full p-8 flex flex-col gap-6">
      <header className="mb-4">
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <Activity className="text-cyan-400 w-8 h-8" />
          Hydra Performance Matrix
        </h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Radial Gauges */}
        <GlassCard glowColor="cyan" className="col-span-1 md:col-span-2 flex justify-around items-center py-8">
          <RadialGauge value={metrics.cognitiveLoad} color="#06b6d4" label="Cognitive Load" />
          <RadialGauge value={Math.max(1, Math.min(100, 100 - metrics.networkLatency))} color="#8b5cf6" label="System Vigor" />
          <RadialGauge value={metrics.visionAlignment} color="#10b981" label="Vision Sync" />
        </GlassCard>

        {/* Live Network Latency */}
        <GlassCard glowColor="violet" className="col-span-1 flex flex-col justify-center">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Network className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider">Gateway Latency</span>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-5xl font-bold font-mono text-white">{metrics.networkLatency}</span>
            <span className="text-slate-500 mb-1 font-mono">ms</span>
          </div>
          <div className="w-full h-1 bg-white/5 mt-4 rounded overflow-hidden">
            <motion.div 
              className="h-full bg-violet-500" 
              animate={{ width: `${Math.min(100, metrics.networkLatency * 2)}%` }}
            />
          </div>
        </GlassCard>

        {/* Caffeine / Fuel Tracker */}
        <GlassCard glowColor="emerald" className="col-span-1 flex flex-col justify-center">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span className="text-xs uppercase tracking-wider">Developer Fuel</span>
          </div>
          <div className="text-3xl font-bold font-mono text-emerald-400 mt-2">Optimal</div>
          <div className="text-xs text-slate-500 mt-2">Sustaining peak execution velocity.</div>
        </GlassCard>
      </div>
    </div>
  );
};
