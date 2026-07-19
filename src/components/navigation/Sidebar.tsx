import React from 'react';
import { motion } from 'motion/react';
import { 
  Hexagon, ShieldAlert, Activity, Database, Settings, 
  TerminalSquare, Network, Flame, Sparkles, FastForward
} from 'lucide-react';
import { useHUDStore } from '../../store/useHUDStore';
import { cn } from '../ui/GlassCard';
import { useAudioHUD } from '../../hooks/useAudioHUD';

const ENGINES = [
  { id: 'nebula', icon: Network, label: 'Architecture Nebula' },
  { id: 'sentinel', icon: ShieldAlert, label: 'Sentinel Security' },
  { id: 'genome', icon: Sparkles, label: 'Genome Flow' },
  { id: 'chronicle', icon: Database, label: 'Database Cockpit' },
  { id: 'chaos', icon: Flame, label: 'Chaos Simulator' },
  { id: 'hydra', icon: Activity, label: 'Hydra Telemetry' },
  { id: 'quantum-ci', icon: FastForward, label: 'Quantum CI' },
];

export const Sidebar = () => {
  const { activeEngine, setEngine, toggleCommandDeck } = useHUDStore();
  const { playSound } = useAudioHUD();

  return (
    <nav className="w-20 h-full border-r border-[#3f3f46]/30 bg-[#050609]/90 backdrop-blur-2xl flex flex-col items-center py-6 z-50 shrink-0">
      {/* OS Logo */}
      <div 
        className="mb-10 cursor-pointer group" 
        onClick={() => {
          playSound('click');
          setEngine('nebula');
        }}
        onMouseEnter={() => playSound('hover')}
      >
        <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.3)] group-hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-shadow duration-300">
          <Hexagon className="text-white w-6 h-6 animate-pulse" />
        </div>
      </div>

      {/* Engine Routing */}
      <div className="flex-1 flex flex-col gap-4 w-full items-center">
        {ENGINES.map((engine) => {
          const Icon = engine.icon;
          const isActive = activeEngine === engine.id;

          return (
            <button
              key={engine.id}
              onClick={() => {
                playSound('click');
                setEngine(engine.id as any);
              }}
              onMouseEnter={() => playSound('hover')}
              className="relative p-3 rounded-xl group transition-colors duration-200"
              title={engine.label}
            >
              {isActive && (
                <motion.div
                  layoutId="active-nav-glow"
                  className="absolute inset-0 bg-violet-500/10 rounded-xl border border-violet-500/30 shadow-[0_0_15px_rgba(139,92,246,0.25)]"
                  transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                />
              )}
              <Icon 
                className={cn(
                  "w-5.5 h-5.5 relative z-10 transition-colors duration-300",
                  isActive ? "text-violet-400" : "text-slate-500 group-hover:text-slate-300"
                )} 
              />
            </button>
          );
        })}
      </div>

      {/* Bottom Actions */}
      <div className="flex flex-col gap-4 mt-auto">
        <button 
          onClick={() => {
            playSound('click');
            toggleCommandDeck();
          }}
          onMouseEnter={() => playSound('hover')}
          className="p-3 text-slate-500 hover:text-cyan-400 transition-colors duration-200"
          title="Command Deck (CMD+K)"
        >
          <TerminalSquare className="w-5.5 h-5.5" />
        </button>
        <button 
          onClick={() => {
            playSound('click');
            setEngine('config');
          }}
          onMouseEnter={() => playSound('hover')}
          className={cn(
            "p-3 rounded-xl transition-colors duration-200",
            activeEngine === 'config' ? "text-violet-400" : "text-slate-500 hover:text-slate-300"
          )}
          title="System Config"
        >
          <Settings className="w-5.5 h-5.5" />
        </button>
      </div>
    </nav>
  );
};
