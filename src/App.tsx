import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Terminal, ShieldAlert, GitBranch, Zap, Cpu, Settings, Activity, 
  Database, Network, Flame, User, Layout, ChevronDown, ChevronRight, Keyboard
} from 'lucide-react';

// Components
import SystemLogs from './components/SystemLogs';
import HotkeysModal from './components/HotkeysModal';
import ArchitectureNebula from './components/ArchitectureNebula';
import ProductGenomeFlow from './components/ProductGenomeFlow';
import SentinelSecurity from './components/SentinelSecurity';
import ChronicleDatabaseCockpit from './components/ChronicleDatabaseCockpit';
import ChaosAndSecurity from './components/ChaosAndSecurity';
import HydraPerformanceTelemetry from './components/HydraPerformanceTelemetry';
import SupremeOSControlPanel from './components/SupremeOSControlPanel';

export default function App() {
  const [activeSystemId, setActiveSystemId] = useState('nebula');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [activeProject, setActiveProject] = useState('Sovereign OS');
  const [activeEnv, setActiveEnv] = useState('PROD');
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isHotkeysOpen, setIsHotkeysOpen] = useState(false);
  
  // Fake state for notifications & github branches
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const githubBranches = [{name: 'main'}, {name: 'dev'}, {name: 'staging'}];
  const [activeBranch, setActiveBranch] = useState('main');

  // Handle global Cmd+K for command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      } else if (e.key === 'Escape') {
        setIsCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const NAVIGATION = [
    { id: 'nebula', label: 'Architecture Nebula', icon: Network },
    { id: 'sentinel', label: 'Sentinel Security', icon: ShieldAlert },
    { id: 'genome', label: 'Genome Flow', icon: Activity },
    { id: 'chronicle', label: 'Database Cockpit', icon: Database },
    { id: 'chaos', label: 'Chaos Simulator', icon: Flame },
    { id: 'hydra', label: 'Hydra Telemetry', icon: Zap },
    { id: 'supreme', label: 'Supreme OS Config', icon: Settings },
  ];

  const handleSound = () => {};
  const handleNotify = () => {};

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#090C10] text-[#f4f4f5] font-sans selection:bg-violet-500/30">
      
      {/* TOPBAR (48px) - Exact match to previous styling */}
      <header className="h-[48px] bg-[#09090b] border-b border-[#3f3f46] flex items-center justify-between px-4 z-40 shrink-0 shadow-sm relative">
        {/* LEFT ZONE */}
        <div className="flex items-center gap-0">
          {/* Logo */}
          <div className="flex items-center gap-2 mr-6 text-white font-black tracking-tighter text-lg">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-700 shadow-lg shadow-violet-500/20 border border-white/10">
              <Cpu className="w-5 h-5 text-white/90 stroke-[2.5px]" />
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70">DEVSTATE</span>
          </div>
          
          {/* Project Select */}
          <div className="relative group mr-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-transparent hover:border-[#3f3f46] hover:bg-[#18181b] cursor-pointer text-[13px] font-medium text-[#a1a1aa] hover:text-[#f4f4f5] transition-all">
            <Layout className="w-4 h-4 text-violet-500 group-hover:text-violet-400 transition-colors" />
            <span className="uppercase tracking-tight font-bold text-white shadow-sm">{activeProject}</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </div>

          {/* Branch select */}
          <div className="relative group flex items-center gap-1.5 px-2 py-1 rounded hover:bg-[#18181b] cursor-pointer text-[13px] text-[#a1a1aa] hover:text-[#f4f4f5] transition-colors">
            <GitBranch className="w-3.5 h-3.5 text-[#a1a1aa] group-hover:text-[#a1a1aa]" />
            <select
              value={activeBranch}
              onChange={(e) => setActiveBranch(e.target.value)}
              className="bg-transparent border-none p-0 outline-none hover:text-[#f4f4f5] focus:ring-0 text-[13px] font-medium pr-4 appearance-none cursor-pointer"
            >
              {githubBranches.map((b, i) => (
                <option key={i} value={b.name} className="bg-[#09090b] text-white">{b.name}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-1 flex items-center text-[#a1a1aa] text-[8px] font-black">▼</div>
          </div>
        </div>

        {/* CENTER ZONE */}
        <div className="flex-1 max-w-[320px] relative hidden lg:block">
          <div 
            onClick={() => setIsCommandPaletteOpen(true)}
            className="group w-full max-w-sm flex items-center justify-between px-4 py-1.5 bg-gradient-to-b from-[#181a1f] to-[#12141a] hover:from-[#1c212a] hover:to-[#161a22] border border-[#3f3f46]/60 hover:border-violet-500/50 rounded-xl text-[#a1a1aa] text-[13px] font-sans transition-all duration-300 cursor-pointer shadow-[0_0_0_transparent] hover:shadow-[0_0_20px_rgba(139,92,246,0.15)]"
          >
            <div className="flex items-center gap-2">
              <span className="opacity-70">Search everything...</span>
            </div>
            <div className="flex items-center gap-1 opacity-60">
              <span className="px-1.5 py-0.5 rounded border border-[#3f3f46] text-[10px] uppercase font-bold text-slate-300">Cmd</span>
              <span className="px-1.5 py-0.5 rounded border border-[#3f3f46] text-[10px] uppercase font-bold text-slate-300">K</span>
            </div>
          </div>
        </div>

        {/* RIGHT ZONE */}
        <div className="flex items-center gap-4">
          <div className="relative group">
            <span className={`text-[11px] font-bold uppercase border px-2 py-1 rounded-[6px] cursor-pointer inline-flex items-center gap-1 transition-colors ${activeEnv === 'PROD' ? 'bg-amber-500/15 text-amber-500 border-amber-500/20 hover:bg-amber-500/25' : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/25'}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" /> {activeEnv} ▾
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[12px] text-[#a1a1aa]">
            <span className="w-2 h-2 rounded-full bg-[#3FB950]" />
            <span>Healthy</span>
          </div>

          {/* Notifications */}
          <div className="relative group cursor-pointer p-2 rounded-xl border border-transparent hover:border-[#3f3f46] hover:bg-[#18181b] transition-all" onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}>
            <span className="text-[16px]">🔔</span>
            <span className="absolute top-0.5 right-0.5 bg-[#F85149] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-[0_0_8px_rgba(248,81,73,0.6)]">3</span>
          </div>

          {/* Avatar */}
          <div className="w-8 h-8 rounded-full border-2 border-[#3f3f46] bg-black text-[#6e7681] font-bold flex flex-col items-center justify-center select-none shadow-sm overflow-hidden bg-cover bg-center">
            <User className="w-4 h-4 text-slate-400" />
          </div>
        </div>
      </header>

      {/* MAIN CONTENT SPLIT */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* SIDEBAR */}
        <aside className="w-[260px] bg-[#05060b] border-r border-[#3f3f46]/50 flex flex-col z-20 shrink-0">
          <div className="p-4 border-b border-[#3f3f46]/30">
            <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">System Navigation</h2>
            <div className="space-y-1">
              {NAVIGATION.map((nav) => {
                const Icon = nav.icon;
                const isActive = activeSystemId === nav.id;
                return (
                  <button
                    key={nav.id}
                    onClick={() => setActiveSystemId(nav.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-sm transition-all group ${
                      isActive 
                        ? 'bg-violet-500/10 text-violet-400 font-medium' 
                        : 'text-slate-400 hover:bg-[#18181b] hover:text-slate-200'
                    }`}
                  >
                    <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-violet-500' : 'text-slate-500 group-hover:text-slate-300'}`} />
                    <span className="flex-1">{nav.label}</span>
                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />}
                  </button>
                )
              })}
            </div>
          </div>
          
          <div className="p-4 mt-auto">
            <button 
              onClick={() => setIsTerminalOpen(!isTerminalOpen)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-white/10 text-sm font-medium text-slate-300 transition-all"
            >
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>Toggle Terminal</span>
              </div>
              <ChevronRight className={`w-4 h-4 transition-transform ${isTerminalOpen ? 'rotate-90' : ''}`}/>
            </button>
          </div>
        </aside>

        {/* COGNITION CANVAS MAIN AREA */}
        <main className="flex-1 relative flex flex-col bg-[#010101]">
          {/* Framer Motion stagger entrance for panels */}
          <AnimatePresence mode="popLayout">
            <motion.div
              key={activeSystemId}
              initial={{ opacity: 0, scale: 0.98, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -15 }}
              transition={{ 
                duration: 0.4, 
                ease: [0.16, 1, 0.3, 1], // cinematic easing
                delay: 0.2 // STAGGERED 0.2s DELAY AS REQUESTED
              }}
              className="flex-1 overflow-auto custom-scrollbar relative"
            >
              {activeSystemId === 'nebula' && <ArchitectureNebula />}
              {activeSystemId === 'sentinel' && <SentinelSecurity onTriggerSound={handleSound} onTriggerNotification={handleNotify} />}
              {activeSystemId === 'genome' && <ProductGenomeFlow />}
              {activeSystemId === 'chronicle' && <ChronicleDatabaseCockpit />}
              {activeSystemId === 'chaos' && <ChaosAndSecurity />}
              {activeSystemId === 'hydra' && <HydraPerformanceTelemetry onTriggerSound={handleSound} onTriggerNotification={handleNotify} />}
              {activeSystemId === 'supreme' && <SupremeOSControlPanel />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* BOTTOM TERMINAL OVERLAY */}
      <AnimatePresence>
        {isTerminalOpen && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 h-[300px] border-t border-[#3f3f46] bg-[#05060b] shadow-[0_-20px_40px_rgba(0,0,0,0.6)] z-50 flex"
          >
            <div className="flex-1 flex overflow-hidden">
              <div className="w-1/2 h-full border-r border-[#3f3f46]/50">
                <SystemLogs />
              </div>
              <div className="w-1/2 p-4 text-slate-400 font-mono text-xs overflow-y-auto bg-[#0d1117] flex flex-col">
                <div className="text-cyan-400 font-bold mb-2 uppercase">Runtime Console</div>
                <div>Node execution context mounted...</div>
                <div>Websocket attached. Process PIDs monitored.</div>
                
                <div className="mt-auto pt-4 border-t border-white/5 space-y-2">
                  <div className="text-slate-500 uppercase tracking-widest text-[10px]">Shortcuts</div>
                  <button 
                    onClick={() => setIsHotkeysOpen(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 rounded transition-colors"
                  >
                    <Keyboard className="w-3.5 h-3.5" />
                    <span>View Hotkeys</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <HotkeysModal isOpen={isHotkeysOpen} onClose={() => setIsHotkeysOpen(false)} />
    </div>
  );
}
