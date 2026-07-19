import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Terminal, X } from 'lucide-react';
import { useHUDStore } from '../../store/useHUDStore';
import { DecryptedText } from '../ui/DecryptedText';
import { useAudioHUD } from '../../hooks/useAudioHUD';

const LogLevelColors = {
  info: 'text-cyan-400',
  warn: 'text-amber-400',
  error: 'text-red-500',
  success: 'text-emerald-400',
  init: 'text-violet-400',
};

export const TerminalDock = () => {
  const logs = useHUDStore((state) => state.logs);
  const setTerminalOpen = useHUDStore((state) => state.setTerminalOpen);
  const { playSound } = useAudioHUD();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new logs
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <motion.div 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 220 }}
      className="h-48 bg-[#020305]/95 border-t border-white/10 backdrop-blur-xl flex flex-col z-40 shrink-0 select-text"
    >
      {/* Dock Header */}
      <div className="h-8 border-b border-white/5 flex items-center justify-between px-4 bg-white/[0.02]">
        <div className="flex items-center">
          <Terminal className="w-4 h-4 text-slate-500 mr-2" />
          <span className="text-xs text-slate-500 font-mono uppercase tracking-widest">System Execution Shell</span>
        </div>
        <button 
          id="btn-close-terminal"
          onClick={() => {
            playSound('click');
            setTerminalOpen(false);
          }}
          onMouseEnter={() => playSound('hover')}
          className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-white/5 transition-colors cursor-pointer"
          aria-label="Close Terminal"
          title="Close Terminal"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Log Stream */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-1 font-mono text-[11px] custom-scrollbar">
        {logs.length === 0 && (
          <div className="text-slate-600 animate-pulse">Awaiting telemetry stream...</div>
        )}
        
        {/* Render standard top-to-bottom but with latest updates */}
        {[...logs].reverse().map((log) => (
          <div key={log.id} className="flex items-start gap-3 hover:bg-white/[0.02] p-1 rounded transition-colors duration-150">
            <span className="text-slate-600 shrink-0">
              [{new Date(log.timestamp).toLocaleTimeString([], { hour12: false, second: '2-digit' })}]
            </span>
            <span className={`${LogLevelColors[log.level] || 'text-slate-400'} shrink-0 font-bold`}>
              [{log.level.toUpperCase()}]
            </span>
            <span className="text-slate-300">
              <DecryptedText text={log.message} speed={15} />
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
