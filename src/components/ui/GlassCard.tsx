import React from 'react';
import { motion } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for perfect tailwind class merging
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'violet' | 'cyan' | 'emerald' | 'danger';
  interactive?: boolean;
}

const glowMaps = {
  violet: 'shadow-[0_0_40px_rgba(139,92,246,0.15)] border-violet-500/20 hover:border-violet-500/40',
  cyan: 'shadow-[0_0_40px_rgba(6,182,212,0.15)] border-cyan-500/20 hover:border-cyan-500/40',
  emerald: 'shadow-[0_0_40px_rgba(16,185,129,0.15)] border-emerald-500/20 hover:border-emerald-500/40',
  danger: 'shadow-[0_0_40px_rgba(239,68,68,0.15)] border-red-500/20 hover:border-red-500/40',
};

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  glowColor = 'violet',
  interactive = false,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className={cn(
        "relative rounded-2xl bg-gradient-to-b from-[#0e1017]/95 to-[#050609]/95 backdrop-blur-xl border",
        glowMaps[glowColor],
        interactive && "cursor-pointer hover:-translate-y-1 transition-transform duration-300",
        className
      )}
    >
      {/* Precision Corner Accents */}
      <div className="absolute top-2 left-2 w-1 h-1 border-t border-l border-slate-500/50" />
      <div className="absolute top-2 right-2 w-1 h-1 border-t border-r border-slate-500/50" />
      <div className="absolute bottom-2 left-2 w-1 h-1 border-b border-l border-slate-500/50" />
      <div className="absolute bottom-2 right-2 w-1 h-1 border-b border-r border-slate-500/50" />
      
      <div className="relative z-10 p-6">
        {children}
      </div>
    </motion.div>
  );
};
