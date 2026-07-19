import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Terminal, ShieldAlert, GitBranch, Zap, Cpu, Settings, Activity, 
  Database, Network, Flame, Sparkles, Search, Keyboard, Info, Eye
} from 'lucide-react';
import { useHUDStore } from './store/useHUDStore';
import { useCommandDeck } from './hooks/useKeyboard';
import { useAudioHUD } from './hooks/useAudioHUD';

// Navigation & Telemetry Components
import { Sidebar } from './components/navigation/Sidebar';
import { TerminalDock } from './components/telemetry/TerminalDock';
import ArchitectureNebula from './components/ArchitectureNebula';
import ProductGenomeFlow from './components/ProductGenomeFlow';
import ChronicleDatabaseCockpit from './components/ChronicleDatabaseCockpit';
import ChaosAndSecurity from './components/ChaosAndSecurity';

// Redesigned AI engines
import { SentinelEngine } from './components/engines/SentinelEngine';
import { HydraEngine } from './components/engines/HydraEngine';
import { ConfigEngine } from './components/engines/ConfigEngine';
import { QuantumCIEngine } from './components/engines/QuantumCIEngine';

// Modals
import HotkeysModal from './components/HotkeysModal';

export default function App() {
  const activeEngine = useHUDStore(s => s.activeEngine);
  const setEngine = useHUDStore(s => s.setEngine);
  const commandDeckOpen = useHUDStore(s => s.commandDeckOpen);
  const toggleCommandDeck = useHUDStore(s => s.toggleCommandDeck);
  const terminalOpen = useHUDStore(s => s.terminalOpen);
  const setTerminalOpen = useHUDStore(s => s.setTerminalOpen);
  const appendLog = useHUDStore(s => s.appendLog);
  const metrics = useHUDStore(s => s.metrics);
  const updateMetrics = useHUDStore(s => s.updateMetrics);

  const { playSound } = useAudioHUD();
  useCommandDeck();

  // Local View state
  const [isHotkeysOpen, setIsHotkeysOpen] = useState(false);
  const [activeEnv, setActiveEnv] = useState('PROD');
  const [activeBranch, setActiveBranch] = useState('main');
  const [cmdSearch, setCmdSearch] = useState('');

  // Initial stream population
  useEffect(() => {
    playSound('success');
    appendLog({ source: 'System', level: 'init', message: 'Booting DevState OS v2.4.0...' });
    
    const t1 = setTimeout(() => {
      appendLog({ source: 'Gateway', level: 'info', message: 'Connecting to WebSocket Telemetry Hub at ws://localhost:3000/telemetry' });
    }, 800);

    const t2 = setTimeout(() => {
      appendLog({ source: 'Scanner', level: 'warn', message: 'AST Parser detected 1 minor warning in configuration files.' });
    }, 2000);

    const t3 = setTimeout(() => {
      appendLog({ source: 'Sentinel', level: 'success', message: 'Governance checks completed. Security rating at 99.8%.' });
    }, 3200);

    // Periodically fluctuate random telemetry stats cleanly
    const metricInterval = setInterval(() => {
      updateMetrics({
        networkLatency: Math.max(8, Math.min(120, metrics.networkLatency + Math.floor(Math.random() * 11) - 5)),
        cognitiveLoad: Math.max(5, Math.min(95, metrics.cognitiveLoad + Math.floor(Math.random() * 7) - 3))
      });
    }, 4500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearInterval(metricInterval);
    };
  }, []);

  const ENGINES_METADATA = [
    { id: 'nebula', name: 'Architecture Nebula', icon: Network, desc: 'Interactive 3D simulation of AST abstract imports' },
    { id: 'sentinel', name: 'Sentinel AI Guardian', icon: ShieldAlert, desc: 'Governance scanning & real-time threat parsing' },
    { id: 'genome', name: 'Product Genome Flow', icon: Sparkles, desc: 'Interactive product structures and metrics flow' },
    { id: 'chronicle', name: 'Database Cockpit', icon: Database, desc: 'Relational data inspector & chronicle activity dashboard' },
    { id: 'chaos', name: 'Chaos Simulator', icon: Flame, desc: 'Active systems failure simulation & healing testbed' },
    { id: 'hydra', name: 'Hydra Telemetry Matrix', icon: Activity, desc: 'High-density system performance radial indicators' },
    { id: 'quantum-ci', name: 'Quantum CI Optimizer', icon: Zap, desc: 'Predictive module change test coverage tracer' },
    { id: 'config', name: 'Supreme OS Config', icon: Settings, desc: 'System properties, authentication tokens & parameters' }
  ];

  const filteredEngines = ENGINES_METADATA.filter(e => 
    e.name.toLowerCase().includes(cmdSearch.toLowerCase()) || 
    e.desc.toLowerCase().includes(cmdSearch.toLowerCase())
  );

  return (
    <div className="w-screen h-screen bg-[#020305] text-white flex flex-col overflow-hidden font-sans selection:bg-violet-500/30">
      
      {/* Background ambient radial glow */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-950/10 via-[#020305] to-[#020305] pointer-events-none z-0" />
      
      {/* TOP HEADER STATUS BAR (48px) */}
      <header className="h-[48px] bg-[#050609]/95 border-b border-white/5 flex items-center justify-between px-4 z-40 shrink-0 relative">
        {/* Left branding zone */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 mr-3 font-bold text-sm tracking-tight">
            <div className="relative flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-700 shadow-lg shadow-violet-500/20 border border-white/10">
              <Cpu className="w-4 h-4 text-white stroke-[2.5px]" />
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70 tracking-widest uppercase font-mono text-xs">DEVSTATE HUD</span>
          </div>

          {/* Environment Status Tag */}
          <button 
            onClick={() => {
              playSound('click');
              setActiveEnv(activeEnv === 'PROD' ? 'STAGING' : 'PROD');
              appendLog({ source: 'Config', level: 'info', message: `Active workspace region pointed to: ${activeEnv === 'PROD' ? 'STAGING' : 'PROD'}` });
            }}
            onMouseEnter={() => playSound('hover')}
            className={`text-[10px] font-mono font-bold uppercase border px-2 py-0.5 rounded cursor-pointer inline-flex items-center gap-1.5 transition-colors ${
              activeEnv === 'PROD' 
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20' 
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" /> {activeEnv}
          </button>

          {/* GitHub Branch list */}
          <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded px-2 py-0.5 text-xs text-slate-400">
            <GitBranch className="w-3 h-3 text-slate-500" />
            <select
              value={activeBranch}
              onChange={(e) => {
                playSound('click');
                setActiveBranch(e.target.value);
                appendLog({ source: 'Git', level: 'info', message: `Checked out branch: ${e.target.value}` });
              }}
              className="bg-transparent border-none p-0 outline-none hover:text-white text-[11px] font-mono pr-2 cursor-pointer focus:ring-0"
            >
              <option value="main" className="bg-[#050609] text-white">main</option>
              <option value="dev" className="bg-[#050609] text-white">dev</option>
              <option value="staging" className="bg-[#050609] text-white">staging</option>
            </select>
          </div>
        </div>

        {/* Global HUD Core Metric display for top bar */}
        <div className="hidden md:flex items-center gap-6 font-mono text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <Network className="w-3.5 h-3.5 text-violet-400" />
            <span>LATENCY: <strong className="text-white">{metrics.networkLatency}ms</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>COGNITIVE: <strong className="text-white">{metrics.cognitiveLoad}%</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>NEURAL LINK: <strong className="text-emerald-400 font-bold">ONLINE</strong></span>
          </div>
        </div>

        {/* Right shortcut zone */}
        <div className="flex items-center gap-2">
          {/* Terminal Toggle Button */}
          <button 
            id="btn-toggle-terminal-top"
            onClick={() => {
              playSound('click');
              setTerminalOpen(!terminalOpen);
            }}
            onMouseEnter={() => playSound('hover')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded border transition-all duration-200 cursor-pointer ${
              terminalOpen 
                ? 'bg-violet-500/10 text-violet-300 border-violet-500/30 hover:bg-violet-500/20 shadow-[0_0_10px_rgba(139,92,246,0.1)]' 
                : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white'
            }`}
            title={terminalOpen ? "Close Terminal" : "Open Terminal"}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Terminal</span>
          </button>

          <button 
            onClick={() => {
              playSound('click');
              setIsHotkeysOpen(true);
            }}
            onMouseEnter={() => playSound('hover')}
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-300 bg-white/5 hover:bg-white/10 rounded border border-white/10 transition-colors"
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Shortcuts</span>
          </button>
        </div>
      </header>

      {/* CORE SPLIT WORKSPACE */}
      <div className="flex flex-1 overflow-hidden relative z-10">
        
        {/* Left Nav (Sidebar) */}
        <Sidebar />

        {/* Dynamic Center Workstation Viewport */}
        <main className={`flex-1 relative transition-all duration-300 ${terminalOpen ? 'pb-48' : 'pb-0'} flex flex-col bg-[#010102]`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeEngine}
              initial={{ opacity: 0, scale: 0.985, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.985, y: -10 }}
              transition={{ 
                duration: 0.35, 
                ease: [0.16, 1, 0.3, 1],
                delay: 0.1
              }}
              className="flex-1 overflow-y-auto custom-scrollbar relative"
            >
              {activeEngine === 'nebula' && <ArchitectureNebula />}
              {activeEngine === 'sentinel' && <SentinelEngine />}
              {activeEngine === 'genome' && <ProductGenomeFlow />}
              {activeEngine === 'chronicle' && <ChronicleDatabaseCockpit />}
              {activeEngine === 'chaos' && <ChaosAndSecurity />}
              {activeEngine === 'hydra' && <HydraEngine />}
              {activeEngine === 'quantum-ci' && <QuantumCIEngine />}
              {activeEngine === 'config' && <ConfigEngine />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Live System Logs (Bottom Dock) */}
      <AnimatePresence>
        {terminalOpen && <TerminalDock />}
      </AnimatePresence>

      {/* GLOBAL COMMAND DECK WINDOW PALETTE (CMD+K) */}
      <AnimatePresence>
        {commandDeckOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => {
              playSound('click');
              toggleCommandDeck(false);
            }}
          >
            <motion.div 
              initial={{ scale: 0.93, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.93, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="w-full max-w-lg bg-[#0c0e15] border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(139,92,246,0.2)]"
              onClick={e => e.stopPropagation()}
            >
              {/* Search Bar */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/5 bg-white/[0.01]">
                <Search className="w-5 h-5 text-slate-500" />
                <input 
                  type="text"
                  placeholder="Search cognitive engines..."
                  value={cmdSearch}
                  onChange={e => setCmdSearch(e.target.value)}
                  autoFocus
                  className="w-full bg-transparent border-none text-white outline-none placeholder-slate-600 text-sm focus:ring-0"
                />
                <button 
                  onClick={() => {
                    playSound('click');
                    toggleCommandDeck(false);
                  }}
                  className="text-xs text-slate-500 hover:text-white px-1.5 py-0.5 rounded border border-white/10"
                >
                  ESC
                </button>
              </div>

              {/* Engine Shortcuts */}
              <div className="p-2 max-h-[320px] overflow-y-auto space-y-1 custom-scrollbar bg-black/40">
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-3 py-1.5">Direct Engine Hop</div>
                
                {filteredEngines.length === 0 ? (
                  <div className="text-xs text-slate-600 text-center py-6 font-mono">No matching engines identified</div>
                ) : (
                  filteredEngines.map((eng) => {
                    const Icon = eng.icon;
                    return (
                      <button
                        key={eng.id}
                        onClick={() => {
                          playSound('success');
                          setEngine(eng.id as any);
                          toggleCommandDeck(false);
                        }}
                        onMouseEnter={() => playSound('hover')}
                        className="w-full text-left flex items-center gap-3 p-3 rounded-xl hover:bg-violet-500/10 group transition-colors"
                      >
                        <div className="p-2 rounded-lg bg-white/5 group-hover:bg-violet-500/20 text-slate-400 group-hover:text-violet-400 transition-colors">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs font-bold text-white group-hover:text-violet-300 transition-colors">{eng.name}</div>
                          <div className="text-[10px] text-slate-500 group-hover:text-slate-400 transition-colors mt-0.5">{eng.desc}</div>
                        </div>
                        <span className="text-[10px] text-slate-600 group-hover:text-violet-400 font-mono font-bold bg-[#18181b] group-hover:bg-violet-500/20 border border-white/5 hover:border-violet-500/30 px-2 py-0.5 rounded transition-all">ROUTE</span>
                      </button>
                    );
                  })
                )}
              </div>

              <div className="px-4 py-2 bg-slate-950 font-mono text-[9px] text-slate-600 border-t border-white/5 uppercase tracking-wider flex justify-between">
                <span>DevState Central Kernel</span>
                <span>CMD+K shortcut master active</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard Modal controller */}
      <HotkeysModal isOpen={isHotkeysOpen} onClose={() => { playSound('click'); setIsHotkeysOpen(false); }} />

    </div>
  );
}
