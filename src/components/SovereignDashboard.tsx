import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Terminal, Play, Trash2, Shield, Activity, RefreshCw, Sparkles, Database, 
  Search, GitBranch, GitPullRequest, Check, AlertTriangle, Cpu, Globe, Zap, 
  Compass, Users, MessageSquare, Award, Flame, Bell, Settings, BookOpen, Key,
  Fingerprint, HelpCircle
} from 'lucide-react';

interface AssetBuilt { name: string; type: string; status: string; confidence: number; }
interface AssetMocked { name: string; type: string; mock_file: string; }
interface AssetMissing { name: string; type: string; description: string; }
interface Blocker { type: string; source: string; error_message: string; file?: string; line?: number; suggested_fix: string; }
interface TaskItem { priority: number; task: string; prerequisites: string[]; estimated_complexity: string; }

interface ProjectState {
  overall_alignment_score: number;
  assets_built: AssetBuilt[];
  assets_mocked: AssetMocked[];
  assets_missing: AssetMissing[];
  active_blockers: Blocker[];
  next_actions_backlog: TaskItem[];
  recovery_briefing: string;
}

interface SovereignDashboardProps {
  state: ProjectState | null;
  loading: boolean;
  activeTab: 'live' | 'playground';
  setActivePage: (page: any) => void;
  triggerDevSound: (multiplier?: number) => void;
  triggerNotification: (msg: string, type: 'success' | 'info' | 'error') => void;
  liveVisionSpec: string;
  setLiveVisionSpec: (spec: string) => void;
  playgroundVisionSpec: string;
  setPlaygroundVisionSpec: (spec: string) => void;
  fetchWorkspaceUpdate: (force?: boolean) => void;
  setIsCommandPaletteOpen: (open: boolean) => void;
}

export default function SovereignDashboard({
  state,
  loading,
  activeTab,
  setActivePage,
  triggerDevSound,
  triggerNotification,
  liveVisionSpec,
  setLiveVisionSpec,
  playgroundVisionSpec,
  setPlaygroundVisionSpec,
  fetchWorkspaceUpdate,
  setIsCommandPaletteOpen
}: SovereignDashboardProps) {
  // Activity Feed status filter
  const [activityFilter, setActivityFilter] = useState<'all' | 'critical' | 'git'>('all');
  
  // Local active events database
  const [events, setEvents] = useState([
    { id: 1, type: 'git', title: 'Sreeshanth N. pushed 3 commits to main', meta: 'feat: add auth middleware, fix: vault route initializers', time: '2m ago', severity: 'neutral', initials: 'SN', badge: 'main' },
    { id: 2, type: 'error', title: 'Error spike detected — /api/users', meta: '142 occurrences in 60s, rate limit threshold overrun', time: '4m ago', severity: 'danger', initials: 'RA', badge: 'CRITICAL' },
    { id: 3, type: 'deploy', title: 'Deploy succeeded — v2.4.1 → production', meta: 'main container build compiled in 48s with 100% test coverage', time: '8m ago', severity: 'success', initials: 'CD', badge: 'PROD' },
    { id: 4, type: 'pr', title: 'Elena R. opened pull request #122 in vault', meta: 'Security: Implement lazy initializer client secrets', time: '1h ago', severity: 'info', initials: 'ER', badge: 'vault' },
    { id: 5, type: 'secret', title: 'Environment variable API_KEY expiring soon', meta: 'Rotations warning: rotation needed in 3 days', time: '3h ago', severity: 'warning', initials: 'VT', badge: 'SYSTEM' }
  ]);

  // Handle filter
  const filteredEvents = events.filter(e => {
    if (activityFilter === 'critical') return e.severity === 'danger' || e.severity === 'warning';
    if (activityFilter === 'git') return e.type === 'git';
    return true;
  });

  const handleQuickAction = (actionId: string) => {
    triggerDevSound(1.1);
    switch (actionId) {
      case 'palette':
        setIsCommandPaletteOpen(true);
        triggerNotification("Command Palette Activated", "info");
        break;
      case 'deploy':
        setActivePage('blueprint');
        triggerNotification("Forge deployments cockpit active", "info");
        break;
      case 'search':
        setActivePage('explore');
        triggerNotification("Codebase static inspector loaded", "info");
        break;
      case 'branch':
        setActivePage('terminal');
        triggerNotification("Git terminal session online", "info");
        break;
      case 'oracle':
        setActivePage('oracle');
        triggerNotification("Consulting Oracle intelligence", "info");
        break;
      case 'errors':
        setActivePage('reactor');
        triggerNotification("Reactor incident center ready", "info");
        break;
      default:
        break;
    }
  };

  // SVG Sparkline drawing helper
  const drawSparkline = (points: number[]) => {
    const width = 100;
    const height = 24;
    const maxVal = Math.max(...points, 1);
    const minVal = Math.min(...points, 0);
    const range = maxVal - minVal;
    
    return points.map((p, i) => {
      const x = (i / (points.length - 1)) * width;
      const y = height - ((p - minVal) / range) * height + 1; // 1px margin
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ');
  };

  const getSystemScoreColor = (scoreNum: number) => {
    if (scoreNum >= 95) return 'text-zinc-300';
    if (scoreNum >= 80) return 'text-amber-400';
    return 'text-rose-400';
  };

  return (
    <div className="space-y-6 select-text text-zinc-100 font-sans animate-fade-in" id="sovereign-ov-dashboard">
      
      {/* 7A. SYSTEM STATUS BAR */}
      <div 
        id="system-status-indicator-strip"
        className="grid grid-cols-2 md:grid-cols-5 bg-bg-raised border border-border-subtle rounded-lg divide-x divide-border-subtle overflow-hidden text-xs"
      >
        {[
          { name: 'GitHub', value: 'Connected', sub: '3 active repos', status: 'success', page: 'terminal' },
          { name: 'Deploy', value: 'Last: 2m ago', sub: 'v2.4.1 stable', status: 'success', page: 'blueprint' },
          { name: 'Database', value: 'PostgreSQL', sub: '28ms avg connection', status: 'success', page: 'chronicle' },
          { name: 'APIs', value: '12 healthy', sub: '1 degraded state', status: 'warning', page: 'pulse' },
          { name: 'AI Engine', value: 'Claude 3.5 Sonnet', sub: 'API response nominal', status: 'success', page: 'oracle' }
        ].map((cell, idx) => (
          <button
            key={cell.name}
            onClick={() => {
              triggerDevSound(1.0);
              setActivePage(cell.page);
            }}
            className="flex flex-col items-start p-3 hover:bg-bg-elevated transition text-left cursor-pointer outline-none w-full border-none"
          >
            <div className="flex items-center gap-1.5 font-medium text-text-primary">
              <span className={`w-2 h-2 rounded-full ${
                cell.status === 'success' ? 'bg-status-success' : 
                cell.status === 'warning' ? 'bg-status-warning' : 'bg-status-danger'
              }`} />
              <span>{cell.name}</span>
            </div>
            <span className="text-[11px] text-text-secondary mt-1 font-mono">{cell.value}</span>
            <span className="text-[10px] text-text-muted mt-0.5 font-sans leading-none">{cell.sub}</span>
          </button>
        ))}
      </div>

      {/* 7B. KPI ROW (4 Metric Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Active Errors */}
        <div 
          onClick={() => { triggerDevSound(1.1); setActivePage('reactor'); }}
          className="bg-bg-raised border border-border-subtle hover:border-border-default rounded-lg p-4 flex flex-col justify-between h-24 shadow-sm cursor-pointer transition"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] text-text-secondary font-mono tracking-wider uppercase">
              <Zap className="w-3.5 h-3.5 text-rose-450 animate-pulse" />
              <span>ACTIVE ERRORS</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-rose-950/40 text-rose-400 border border-rose-900/40">
              {state?.active_blockers && state.active_blockers.length > 0 ? `+${state.active_blockers.length} today` : '0 today'}
            </span>
          </div>
          <div className="text-2xl font-bold text-text-primary tracking-tight font-sans">
            {state?.active_blockers ? state.active_blockers.length : 3}
          </div>
          <div className="text-[11px] text-text-secondary">
            {state?.active_blockers && state.active_blockers.length > 0 
              ? `${state.active_blockers.length} critical blocker actions required` 
              : 'Diagnostics clean · nomimal health'}
          </div>
        </div>

        {/* Card 2: Deploy Status */}
        <div 
          onClick={() => { triggerDevSound(1.1); setActivePage('blueprint'); }}
          className="bg-bg-raised border border-border-subtle hover:border-border-default rounded-lg p-4 flex flex-col justify-between h-24 shadow-sm cursor-pointer transition"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] text-text-secondary font-mono tracking-wider uppercase">
              <GitBranch className="w-3.5 h-3.5 text-accent" />
              <span>LAST DEPLOY</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-accent-muted text-accent border border-accent-border">
              ✓ SUCCESS
            </span>
          </div>
          <div className="text-2xl font-bold text-text-primary tracking-tight font-sans">
            2m ago
          </div>
          <div className="text-[11px] text-text-secondary truncate">
            main → production · v2.4.1
          </div>
        </div>

        {/* Card 3: API Health */}
        <div 
          onClick={() => { triggerDevSound(1.1); setActivePage('pulse'); }}
          className="bg-bg-raised border border-border-subtle hover:border-border-default rounded-lg p-4 flex flex-col justify-between h-24 shadow-sm cursor-pointer transition"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] text-text-secondary font-mono tracking-wider uppercase">
              <Activity className="w-3.5 h-3.5 text-zinc-300" />
              <span>API HEALTH</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-amber-950/40 text-amber-400 border border-amber-900/40">
              ↓ 1 DEGRADED
            </span>
          </div>
          <div className="text-2xl font-bold text-text-primary tracking-tight font-sans">
            12/13
          </div>
          <div className="text-[11px] text-text-secondary font-mono">
            142ms avg P95 connection
          </div>
        </div>

        {/* Card 4: AI Oracle Usage */}
        <div 
          onClick={() => { triggerDevSound(1.1); setActivePage('oracle'); }}
          className="bg-bg-raised border border-border-subtle hover:border-border-default rounded-lg p-4 flex flex-col justify-between h-24 shadow-sm cursor-pointer transition"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] text-text-secondary font-mono tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
              <span>AI ORACLE</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-bg-overlay text-text-secondary border border-border-default">
              340 LEFT
            </span>
          </div>
          <div className="text-2xl font-bold text-text-primary tracking-tight font-sans">
            160/500
          </div>
          <div className="space-y-1">
            <div className="w-full bg-bg-overlay h-1 rounded-full overflow-hidden">
              <div className="bg-accent h-1 rounded-full transition-all duration-500" style={{ width: '32%' }} />
            </div>
            <div className="text-[10px] text-text-secondary flex justify-between">
              <span>Monthly quota usage</span>
              <span>Resets in 12d</span>
            </div>
          </div>
        </div>
      </div>

      {/* SYSTEM DRIFT DESCRIPTION / TEXT AREA VERIFICATION */}
      <div className="bg-bg-raised border border-border-subtle rounded-lg p-5">
        <div className="flex items-center justify-between mb-3 border-b border-border-subtle pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-accent" />
            <span className="text-xs font-bold font-mono tracking-wide text-text-primary uppercase">Workspace Vision Objectives</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-text-secondary font-mono">Alignment Scale:</span>
            <span className={`text-[11px] font-mono font-black ${getSystemScoreColor(state?.overall_alignment_score ? state.overall_alignment_score * 100 : 85)} bg-bg-base border border-border-subtle px-2 py-0.5 rounded`}>
              {state?.overall_alignment_score ? Math.round(state.overall_alignment_score * 100) : 85}%
            </span>
          </div>
        </div>

        <p className="text-xs text-text-secondary leading-relaxed mb-4">
          Describe your intended full-stack features. The background daemon actively compares these specs with codebase physical modules to track implementation progress.
        </p>

        <div className="bg-bg-base border border-border-subtle rounded-lg p-3.5 shadow-inner">
          <textarea
            className="bg-transparent text-sm text-text-primary font-sans focus:outline-none min-h-[90px] w-full resize-y placeholder:text-text-muted leading-relaxed select-text"
            value={activeTab === 'live' ? liveVisionSpec : playgroundVisionSpec}
            onChange={(e) => {
              if (activeTab === 'live') {
                setLiveVisionSpec(e.target.value);
              } else {
                setPlaygroundVisionSpec(e.target.value);
              }
            }}
            placeholder="E.g., Implement PostgreSQL databases, configure robust security cipher modules, parse logs, etc."
          />
          <div className="flex items-center justify-between border-t border-border-subtle mt-3 pt-3 text-[11px] text-text-secondary font-mono">
            <span>📄 Objectives context: {activeTab === 'live' ? liveVisionSpec.length : playgroundVisionSpec.length} chars</span>
            <button
              onClick={() => {
                triggerDevSound(1.25);
                fetchWorkspaceUpdate(true);
              }}
              className="bg-accent hover:opacity-90 font-bold text-bg-void text-xs px-3.5 py-1.5 rounded transition flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-bg-void animate-spin" style={{ animationDuration: '4s' }} />
              Align Vision NOW
            </button>
          </div>
        </div>
      </div>

      {/* 7C & 7D & 7E & 7F: MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: ACTIVITY & DEPLOYMENT TIMELINE (7 columns) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 7C. ACTIVITY FEED */}
          <div className="bg-bg-raised border border-border-subtle rounded-lg p-5">
            <div className="flex items-center justify-between border-b border-border-subtle pb-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tracking-tight text-text-primary">System Activity Feed</span>
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/5 text-zinc-300 border border-white/5 font-mono text-[10px]">
                  <span className="w-1.5 h-1.5 bg-zinc-800 rounded-full animate-ping" />
                  <span>LIVE</span>
                </div>
              </div>

              <div className="flex gap-1.5 text-[11px] font-mono">
                <button 
                  onClick={() => { setActivityFilter('all'); triggerDevSound(0.9); }}
                  className={`px-2 py-0.5 rounded cursor-pointer ${activityFilter === 'all' ? 'bg-bg-overlay text-accent border border-accent-border' : 'text-text-secondary'}`}
                >
                  All
                </button>
                <button 
                  onClick={() => { setActivityFilter('critical'); triggerDevSound(0.9); }}
                  className={`px-2 py-0.5 rounded cursor-pointer ${activityFilter === 'critical' ? 'bg-bg-overlay text-rose-400 border border-rose-900/40' : 'text-text-secondary'}`}
                >
                  Events
                </button>
                <button 
                  onClick={() => { setActivityFilter('git'); triggerDevSound(0.9); }}
                  className={`px-2 py-0.5 rounded cursor-pointer ${activityFilter === 'git' ? 'bg-bg-overlay text-zinc-300 border border-white/5' : 'text-text-secondary'}`}
                >
                  Git Only
                </button>
              </div>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {filteredEvents.map(evt => (
                <div key={evt.id} className="p-3 bg-bg-base border border-border-subtle rounded-md flex gap-3 items-start hover:border-border-default transition">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-mono font-bold text-xs uppercase ${
                    evt.severity === 'danger' ? 'bg-rose-950 text-rose-400' :
                    evt.severity === 'warning' ? 'bg-amber-955 bg-amber-950 text-amber-400' :
                    evt.severity === 'success' ? 'bg-white/5 text-zinc-300' :
                    evt.type === 'git' ? 'bg-white/5 text-zinc-300' : 'bg-bg-overlay text-text-secondary'
                  }`}>
                    {evt.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center text-[10px] text-text-secondary mb-0.5">
                      <span className="font-mono text-text-primary font-semibold">{evt.type.toUpperCase()}</span>
                      <span>{evt.time}</span>
                    </div>
                    <p className="text-xs font-medium text-text-primary">{evt.title}</p>
                    <p className="text-[11px] text-text-secondary font-mono mt-1 leading-relaxed truncate">{evt.meta}</p>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-bg-overlay text-text-muted select-none">
                    {evt.badge}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 7D. DEPLOYMENT TIMELINE */}
          <div className="bg-bg-raised border border-border-subtle rounded-lg p-5">
            <div className="flex justify-between items-center pb-4 border-b border-border-subtle mb-4">
              <span className="text-sm font-bold tracking-tight text-text-primary">Deployments Pipeline Matrix</span>
              <button 
                onClick={() => { triggerDevSound(1.1); setActivePage('blueprint'); }}
                className="text-xs text-text-link hover:underline bg-transparent border-none cursor-pointer"
              >
                View all in Forge →
              </button>
            </div>

            <div className="space-y-2">
              {[
                { branch: 'main', version: 'v2.4.1', author: 'JS', time: '2m ago', state: 'success' },
                { branch: 'main', version: 'v2.4.0', author: 'MR', time: '1h ago', state: 'success' },
                { branch: 'feat/auth', version: 'v2.3.9-rc', author: 'TK', time: '3h ago', state: 'error' },
                { branch: 'main', version: 'v2.3.8', author: 'JS', time: '6h ago', state: 'success' },
                { branch: 'patch/indexer', version: 'v2.3.7', author: 'SN', time: '1d ago', state: 'success' },
                { branch: 'release-candidate', version: 'v2.3.6', author: 'ER', time: '2d ago', state: 'success' },
                { branch: 'main', version: 'v2.3.5', author: 'JS', time: '3d ago', state: 'success' }
              ].map((dep, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-border-subtle/50 last:border-0 text-xs font-mono">
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${dep.state === 'success' ? 'bg-status-success' : 'bg-status-danger'}`} />
                    <span 
                      onClick={() => { triggerDevSound(1.0); setActivePage('blueprint'); }}
                      className="text-text-primary font-semibold hover:text-text-link cursor-pointer"
                    >
                      {dep.branch}
                    </span>
                    <span className="text-text-secondary text-[11px] bg-bg-base border border-border-subtle px-1.5 rounded">{dep.version}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] w-5 h-5 rounded-full bg-border-subtle text-text-primary flex items-center justify-center font-bold text-[9px] uppercase font-mono shadow-sm">
                      {dep.author}
                    </span>
                    <span className="text-[11px] text-text-muted w-14 text-right">{dep.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: QUICK ACTIONS & MODULE HEALTH (5 columns) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* 7E. QUICK ACTIONS PANEL */}
          <div className="bg-bg-raised border border-border-subtle rounded-lg p-5">
            <span className="text-sm font-bold tracking-tight text-text-primary block mb-4">Interactive Quick Actions</span>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { id: 'palette', label: 'Open command palette', icon: Terminal, key: 'CMD+K' },
                { id: 'deploy', label: 'New deployment pipeline', icon: GitPullRequest, key: 'CMD+SHIFT+D' },
                { id: 'search', label: 'Search active codebase', icon: Search, key: 'CMD+F' },
                { id: 'branch', label: 'Create daemon branch', icon: GitBranch, key: 'CMD+SHIFT+B' },
                { id: 'oracle', label: 'Consult system Oracle', icon: Sparkles, key: 'CMD+.' },
                { id: 'errors', label: 'Verify active crashes', icon: AlertTriangle, key: 'CMD+E' }
              ].map((act) => {
                const IconComp = act.icon;
                return (
                  <button
                    key={act.id}
                    onClick={() => handleQuickAction(act.id)}
                    className="w-full h-11 bg-bg-base border border-border-subtle hover:border-border-default hover:bg-bg-elevated rounded-md p-2.5 flex items-center justify-between text-left cursor-pointer transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <IconComp className="w-3.5 h-3.5 text-accent" />
                      <span className="text-xs text-text-primary font-medium">{act.label}</span>
                    </div>
                    <span className="text-[9px] text-text-muted font-mono border border-border-subtle bg-bg-raised px-1.5 rounded">
                      {act.key}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 7F. MODULE HEALTH GRID */}
          <div className="bg-bg-raised border border-border-subtle rounded-lg p-5">
            <span className="text-sm font-bold tracking-tight text-text-primary block mb-4">Live Module Health Glance</span>
            
            <div className="grid grid-cols-2 gap-y-3 gap-x-4 font-mono text-[11px]">
              {[
                { name: 'Nexus Shell', val: '3 sessions active', status: 'success', page: 'terminal' },
                { name: 'Forge Build', val: '2 pipelines ready', status: 'success', page: 'blueprint' },
                { name: 'Sentinel NOC', val: 'Grade SEC: 100%', status: 'success', page: 'sentinel' },
                { name: 'Pulse APIs', val: '12 endpoints live', status: 'warning', page: 'pulse' },
                { name: 'Fort Knox', val: '2 secrets expiring', status: 'warning', page: 'vault' },
                { name: 'Reactor Guard', val: 'Incidents: 0 open', status: 'success', page: 'reactor' },
                { name: 'Cartographer', val: '4 architectural items', status: 'success', page: 'cartographer' },
                { name: 'Hydra Vitals', val: 'P95 latency: 142ms', status: 'success', page: 'hydra' },
                { name: 'Oracle AI', val: '340 credits left', status: 'success', page: 'oracle' },
                { name: 'Chronicle DB', val: '3 Postgres nodes on', status: 'success', page: 'chronicle' },
                { name: 'Tribunal Team', val: '2 PRs waiting sync', status: 'success', page: 'tribunal' },
                { name: 'Developer Hub', val: 'Stability index: 98%', status: 'success', page: 'radar' }
              ].map((mod, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    triggerDevSound(1.0);
                    setActivePage(mod.page);
                  }}
                  className="flex items-center justify-between hover:bg-bg-overlay/50 p-1.5 rounded text-left transition select-none w-full border-none cursor-pointer"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${mod.status === 'success' ? 'bg-status-success' : 'bg-status-warning'}`} />
                    <span className="text-text-primary font-semibold truncate hover:text-accent">{mod.name}</span>
                  </div>
                  <span className="text-[10px] text-text-secondary truncate text-right shrink-0">{mod.val}</span>
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* 7G: BOTTOM ROW (3 equal cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* CARD 1 — TOP ERRORS (last 24h) */}
        <div className="bg-bg-raised border border-border-subtle rounded-lg p-5">
          <span className="text-xs font-bold font-mono tracking-wide text-text-primary block uppercase mb-3 text-rose-450 flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
            TOP WORKSPACE CRASHES (24H)
          </span>
          
          <div className="space-y-3 font-mono text-[11px] leading-relaxed">
            <div className="border-b border-border-subtle/50 pb-2">
              <div className="flex justify-between font-semibold text-text-primary">
                <span className="truncate max-w-[170px]" title="TypeError: Cannot read properties of undefined">TypeError: Cannot read properties...</span>
                <span className="text-rose-400">142 hits (↑ 28%)</span>
              </div>
              <p className="text-[10px] text-text-secondary">File: /src/server/workspaceScanner.ts:184</p>
            </div>
            <div className="border-b border-border-subtle/50 pb-2">
              <div className="flex justify-between font-semibold text-text-primary">
                <span className="truncate max-w-[170px]" title="ECONNREFUSED: Database connection timeout">ECONNREFUSED: DB connection...</span>
                <span className="text-amber-400">38 hits (↓ 12%)</span>
              </div>
              <p className="text-[10px] text-text-secondary">File: Chronicle db integration module</p>
            </div>
            <div className="border-b border-border-subtle/50 pb-2">
              <div className="flex justify-between font-semibold text-text-primary">
                <span className="truncate max-w-[170px]">401 Unauthorized /api/vault</span>
                <span className="text-text-secondary">27 hits (→ 0%)</span>
              </div>
              <p className="text-[10px] text-text-secondary">File: devstate-daemon-vault controller</p>
            </div>
          </div>

          <button 
            onClick={() => { triggerDevSound(1.1); setActivePage('reactor'); }}
            className="w-full text-center text-xs text-text-link font-semibold hover:underline bg-transparent border-none mt-5 cursor-pointer block"
          >
            Open Reactor Incident Deck →
          </button>
        </div>

        {/* CARD 2 — API RESPONSE TIMES (P95) with Sparklines */}
        <div className="bg-bg-raised border border-border-subtle rounded-lg p-5">
          <span className="text-xs font-bold font-mono tracking-wide text-text-primary block uppercase mb-3 text-accent">
            P95 ENDPOINT LATENCY (MOCK)
          </span>
          
          <div className="space-y-4 font-mono text-[11px]">
            {[
              { path: 'GET /api/users', p95: '142ms', points: [10, 25, 45, 12, 5, 42, 10, 30, 15, 20], color: 'stroke-accent' },
              { path: 'POST /api/auth', p95: '89ms', points: [4, 18, 12, 10, 8, 30, 22, 12, 14, 18], color: 'stroke-text-link' },
              { path: 'GET /api/deploy', p95: '312ms', points: [30, 55, 75, 95, 100, 70, 52, 40, 48, 55], color: 'stroke-status-warning' }
            ].map((endpoint, i) => (
              <div key={i} className="flex items-center justify-between">
                <div>
                  <span className={`font-semibold ${i === 2 ? 'text-status-warning' : 'text-text-primary'}`}>{endpoint.path}</span>
                  <p className="text-[10px] text-text-secondary">Latency: {endpoint.p95}</p>
                </div>
                {/* Embedded SVG sparkline */}
                <svg className="w-18 h-7 pointer-events-none" viewBox="0 0 100 24">
                  <path 
                    d={drawSparkline(endpoint.points)} 
                    fill="none" 
                    className={`${endpoint.color}`}
                    strokeWidth="1.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                  />
                </svg>
              </div>
            ))}
          </div>

          <button
            onClick={() => { triggerDevSound(1.1); setActivePage('hydra'); }}
            className="w-full text-center text-xs text-text-link font-semibold hover:underline bg-transparent border-none mt-5 cursor-pointer block"
          >
            Review parameters in Hydra →
          </button>
        </div>

        {/* CARD 3 — GIT ACTIVITY INTEGRATION & HEATMAP */}
        <div className="bg-bg-raised border border-border-subtle rounded-lg p-5 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold font-mono tracking-wide text-text-primary block uppercase mb-3 shadow-sm text-zinc-300">
              GIT HEATMAP (LAST 30 DAYS)
            </span>
            
            {/* 30-day contribution graph box layout */}
            <div className="grid grid-cols-10 gap-1 mb-4 select-none">
              {[...Array(30)].map((_, i) => {
                // Generate some varying contribution intensity
                const intensities = [0, 1, 2, 0, 3, 1, 0, 2, 4, 1, 0, 0, 2, 3, 1, 0, 1, 2, 4, 3, 0, 1, 2, 0, 3, 1, 0, 2, 1, 4];
                const intensity = intensities[i];
                return (
                  <div 
                    key={i} 
                    className={`h-2.5 rounded-sm ${
                      intensity === 4 ? 'bg-[#e4e4e7]' :
                      intensity === 3 ? 'bg-[#a1a1aa]/70' :
                      intensity === 2 ? 'bg-[#a1a1aa]/40' :
                      intensity === 1 ? 'bg-[#a1a1aa]/15' : 'bg-bg-base border border-border-subtle/40'
                    }`}
                    title={`${intensity} commits made`}
                  />
                );
              })}
            </div>

            <div className="font-mono text-[10.5px] border-t border-border-subtle pt-3 text-text-secondary truncate leading-relaxed">
              <span className="font-bold text-text-primary">Recent Commit:</span> feat: add rate limiting middleware (JS, 1h ago)
            </div>
          </div>

          <button 
            onClick={() => { triggerDevSound(1.1); setActivePage('terminal'); }}
            className="w-full text-center text-xs text-text-link font-semibold hover:underline bg-transparent border-none mt-4 cursor-pointer block"
          >
            Workspace terminal sync →
          </button>
        </div>

      </div>

    </div>
  );
}
