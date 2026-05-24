import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Command, Keyboard } from 'lucide-react';

export default function HotkeysModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-lg bg-[#0d1117] border border-[#30363d] rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#30363d] bg-[#161b22]">
          <div className="flex items-center gap-2 text-white">
            <Keyboard className="w-5 h-5 text-violet-400" />
            <h3 className="font-bold">Command Palette & Hotkeys</h3>
          </div>
          <button onClick={onClose} className="p-1 text-[#8b949e] hover:text-white rounded-lg hover:bg-[#30363d] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 sm:p-6 space-y-6">
          <div>
            <h4 className="text-xs font-bold text-[#8b949e] uppercase tracking-wider mb-3">Global Navigation</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2 border-b border-[#30363d]/50">
                <span className="text-sm text-slate-300">Open Command Palette</span>
                <span className="flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-[#21262d] border border-[#30363d] rounded text-xs text-[#c9d1d9] font-mono shadow-sm">Cmd</kbd>
                  <kbd className="px-2 py-1 bg-[#21262d] border border-[#30363d] rounded text-xs text-[#c9d1d9] font-mono shadow-sm">K</kbd>
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#30363d]/50">
                <span className="text-sm text-slate-300">Toggle Terminal</span>
                <span className="flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-[#21262d] border border-[#30363d] rounded text-xs text-[#c9d1d9] font-mono shadow-sm">Cmd</kbd>
                  <kbd className="px-2 py-1 bg-[#21262d] border border-[#30363d] rounded text-xs text-[#c9d1d9] font-mono shadow-sm">J</kbd>
                </span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-xs font-bold text-[#8b949e] uppercase tracking-wider mb-3">System Control</h4>
             <div className="space-y-2">
              <div className="flex items-center justify-between py-2 border-b border-[#30363d]/50">
                <span className="text-sm text-slate-300">Deploy Changes</span>
                <span className="flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-[#21262d] border border-[#30363d] rounded text-xs text-[#c9d1d9] font-mono shadow-sm">Cmd</kbd>
                  <kbd className="px-2 py-1 bg-[#21262d] border border-[#30363d] rounded text-xs text-[#c9d1d9] font-mono shadow-sm">Shift</kbd>
                  <kbd className="px-2 py-1 bg-[#21262d] border border-[#30363d] rounded text-xs text-[#c9d1d9] font-mono shadow-sm">D</kbd>
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
