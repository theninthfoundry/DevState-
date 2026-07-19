import React from 'react';
import { Settings, Shield, Terminal } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { useHUDStore } from '../../store/useHUDStore';

export const ConfigEngine = () => {
  const { toggleCommandDeck, appendLog } = useHUDStore();

  const handleSystemReboot = () => {
    appendLog({ source: 'Config', level: 'warn', message: 'Initiating soft system reboot...' });
  };

  return (
    <div className="w-full h-full p-8 max-w-4xl mx-auto flex flex-col gap-6">
      <header className="mb-6 border-b border-white/5 pb-4">
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <Settings className="text-slate-300 w-8 h-8" />
          Supreme OS Configuration
        </h1>
        <p className="text-slate-500 mt-2 font-mono text-sm uppercase tracking-wider">System Parameters & Override Controls</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Core System Preferences */}
        <GlassCard className="col-span-1 space-y-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-4">
            <Terminal className="w-4 h-4 text-violet-400" /> UI & Environment
          </h3>
          
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <div>
              <div className="text-slate-300 text-sm">Holographic Post-Processing</div>
              <div className="text-slate-500 text-xs mt-1">Enable WebGL Bloom & Chromatic Aberration</div>
            </div>
            <div className="w-10 h-5 bg-violet-600 rounded-full border border-violet-400/30 flex items-center p-1 justify-end cursor-pointer">
              <div className="w-3 h-3 bg-white rounded-full shadow-md" />
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <div className="text-slate-300 text-sm">Command Deck Override</div>
              <div className="text-slate-500 text-xs mt-1">Bind quick-actions to CMD+K</div>
            </div>
            <button 
              onClick={() => toggleCommandDeck()}
              className="px-3 py-1 bg-white/5 hover:bg-white/10 text-xs text-slate-300 rounded border border-white/10 transition-colors"
            >
              Test Override
            </button>
          </div>
        </GlassCard>

        {/* Security & Access */}
        <GlassCard className="col-span-1 space-y-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-emerald-400" /> Authentication & Keys
          </h3>
          
          <div className="space-y-2">
            <label className="text-xs text-slate-500 uppercase tracking-widest">Gemini Neural API Key</label>
            <input 
              type="password" 
              defaultValue="AIzaSyC11PP1YRDppXXZ0JaIEAFGSgiAv4StWTM"
              disabled
              className="w-full bg-black/50 border border-white/15 rounded px-3 py-2 text-sm font-mono text-slate-400 opacity-50 cursor-not-allowed"
            />
          </div>

          <div className="pt-4 mt-4 border-t border-white/5">
            <button 
              onClick={handleSystemReboot}
              className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded text-sm uppercase tracking-wider font-bold transition-colors"
            >
              Purge Telemetry Cache
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
