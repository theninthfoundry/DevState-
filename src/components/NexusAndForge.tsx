import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal, GitBranch, Play, ShieldAlert, BadgeInfo, AlertTriangle, 
  Trash2, Plus, X, Command, Sparkles, RefreshCw, Layers, CheckCircle2, 
  Settings, FolderGit2, FolderDown, GitMerge, ListFilter, PlayCircle,
  ArrowRight, Search, Activity, HelpCircle, HardDrive, Cpu, Laptop, 
  Volume2, Trash, Save, Copy, FileText, ExternalLink, Zap, Lock, Unlock, 
  Gauge, TrendingUp, BarChart3, AlertOctagon, GitPullRequest, Sliders
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Defined types for Nexus and Forge
interface TerminalSession {
  id: string;
  name: string;
  history: { cmd: string; output: string; success: boolean; fix?: string; timestamp: string }[];
  running: boolean;
  activePath: string;
}

interface SavedSnippet {
  id: string;
  name: string;
  cmdTemplate: string;
  category: string;
}

interface GitFileNode {
  path: string;
  status: 'staged' | 'unstaged' | 'untracked';
  size: string;
  type: string;
}

interface CommitNode {
  sha: string;
  author: string;
  message: string;
  branch: string;
  timestamp: string;
  status: 'pick' | 'squash' | 'edit' | 'drop';
}

interface RepoForge {
  id: string;
  name: string;
  lang: string;
  stars: number;
  health: number;
  lastCommit: string;
  status: 'idle' | 'online' | 'degraded' | 'syncing';
}

interface PipelinePhase {
  id: string;
  name: string;
  status: 'idle' | 'running' | 'success' | 'failed';
  duration: string;
  logPreview: string[];
}

interface NexusAndForgeProps {
  githubConnected: boolean;
  githubRepo: string;
  githubToken: string;
  githubBranches: any[];
  githubCommits: any[];
  terminalHistory: any[];
  terminalRunning: boolean;
  handleRunCommand: (e?: React.FormEvent, customCmd?: string) => Promise<any>;
  triggerNotification: (msg: string, type: 'success' | 'info' | 'error') => void;
  onTriggerSound: (freq?: number) => void;
}

export default function NexusAndForge({
  githubConnected,
  githubRepo,
  githubToken,
  githubBranches,
  githubCommits,
  terminalHistory,
  terminalRunning,
  handleRunCommand,
  triggerNotification,
  onTriggerSound
}: NexusAndForgeProps) {
  // Navigation internal tab
  const [activeModule, setActiveModule] = useState<'nexus' | 'forge'>('nexus');

  // ==========================================
  // NEXUS TERMINAL & GIT STATE HOOKS
  // ==========================================
  const [sessions, setSessions] = useState<TerminalSession[]>(() => {
    const saved = localStorage.getItem('labs_nexus_sessions');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [
      { id: 'session-main', name: 'main-sh', history: [
        { cmd: 'system diagnostics', output: 'DEVSTATE OS NUCLEAR INITIALIZATION COMPLETE\nSOCKET PORT: 3000 INTUBATION SECURED\nALL PHYSICAL NODES ALIGNED.', success: true, timestamp: '12:00:00' }
      ], running: false, activePath: '~/workspace' },
      { id: 'session-git', name: 'git-audit', history: [
        { cmd: 'git status', output: 'On branch main\nYour branch is up to date with \'origin/main\'.\n\nChanges to be committed:\n  (use "git restore --staged <file>..." to unstage)\n\tmodified:   src/server/apiHandler.ts\n\nChanges not staged for commit:\n  (use "git add <file>..." to update what will be committed)\n\tmodified:   src/App.tsx\n\nUntracked files:\n  (use "git add <file>..." to include in what will be committed)\n\t.env.example', success: true, timestamp: '12:01:20' }
      ], running: false, activePath: '~/workspace/src' }
    ];
  });
  const [activeSessionId, setActiveSessionId] = useState<string>('session-main');
  const [inputCmd, setInputCmd] = useState<string>('');
  const [cmdHistoryCursor, setCmdHistoryCursor] = useState<number>(-1);
  const [showDocsHover, setShowDocsHover] = useState<string | null>(null);
  const [terminalFilter, setTerminalFilter] = useState<string>('');

  // Snippets
  const [savedSnippets, setSavedSnippets] = useState<SavedSnippet[]>([
    { id: 'snip-1', name: 'Safe Ship', cmdTemplate: 'npm run lint && npm run build && git commit -m "{{message}}"', category: 'git' },
    { id: 'snip-2', name: 'Container Clean', cmdTemplate: 'docker system prune -a --volumes --force', category: 'docker' },
    { id: 'snip-3', name: 'K8s Check', cmdTemplate: 'kubectl get departments,pods --all-namespaces', category: 'kubernetes' }
  ]);
  const [snippetVar, setSnippetVar] = useState<string>('Optimized visual asset modules');

  // Virtual Git files
  const [gitFiles, setGitFiles] = useState<GitFileNode[]>([
    { path: 'src/server/apiHandler.ts', status: 'staged', size: '14.5 KB', type: 'TypeScript Server' },
    { path: 'src/App.tsx', status: 'unstaged', size: '310.2 KB', type: 'React Component' },
    { path: 'src/components/NexusAndForge.tsx', status: 'untracked', size: '18.4 KB', type: 'React Component' },
    { path: '.env.example', status: 'untracked', size: '1.2 KB', type: 'Env Template' }
  ]);
  const [gitCommitMsg, setGitCommitMsg] = useState<string>('Refactored App.tsx and optimized multi-thread core cycles');

  // Interactive Rebase commits state (draggable / adjustable status)
  const [rebaseCommits, setRebaseCommits] = useState<CommitNode[]>([
    { sha: '6f9a2d1', author: 'Sreeshanth', message: 'feat: add aether-bloom virtual bio-organism logic', branch: 'main', timestamp: '10 min ago', status: 'pick' },
    { sha: '8c4b11f', author: 'Sreeshanth', message: 'fix: solve hydration drift and memory leaks', branch: 'main', timestamp: '2 hours ago', status: 'pick' },
    { sha: 'd3e918c', author: 'Sreeshanth', message: 'docs: clarify licensing and port config telemetry', branch: 'main', timestamp: 'Yesterday', status: 'squash' },
    { sha: 'e4f20bf', author: 'Sreeshanth', message: 'refactor: split monolith component nodes to files', branch: 'main', timestamp: '2 days ago', status: 'pick' },
    { sha: 'a0f12bc', author: 'Sreeshanth', message: 'chore: install heavy fiber packages & D3 components', branch: 'main', timestamp: '3 days ago', status: 'drop' }
  ]);

  // Autocomplete suggestions
  const autocompleteDatabase = [
    { cmd: 'git status', desc: 'Query local directory branch status topology', category: 'git' },
    { cmd: 'git log --oneline --graph', desc: 'Display physical tree topological nodes', category: 'git' },
    { cmd: 'npm run build', desc: 'Initiate compiler verification pipeline', category: 'npm' },
    { cmd: 'npm run lint', desc: 'Execute diagnostic safe lint checks on AST', category: 'npm' },
    { cmd: 'docker ps -a', desc: 'Audit active workspace sandboxes', category: 'docker' },
    { cmd: 'kubectl get pods', desc: 'Explore kubernetes node pods topology', category: 'kubernetes' }
  ];

  // ==========================================
  // FORGE DEPLOYMENT CUSTOM SEED STATE
  // ==========================================
  const [repos, setRepos] = useState<RepoForge[]>([
    { id: 'repo-1', name: githubRepo || 'namireddy/devstate-core', lang: 'TypeScript + Go', stars: 142, health: 98, lastCommit: '6f9a2d1', status: 'online' },
    { id: 'repo-2', name: 'namireddy/space-bios-sandbox', lang: 'Rust + WebAssembly', stars: 89, health: 91, lastCommit: 'b0a4e32', status: 'idle' },
    { id: 'repo-3', name: 'namireddy/ast-healer-kernel', lang: 'Pure TypeScript', stars: 224, health: 100, lastCommit: 'fe6e40d', status: 'online' }
  ]);

  const [pipelinePhases, setPipelinePhases] = useState<PipelinePhase[]>([
    { id: 'phase-validate', name: 'AST Syntax Validation', status: 'idle', duration: '12s', logPreview: ['> Parsing syntax tree nodes...', '> Checking import resolution trees...', '✓ AST Syntax structure: OK'] },
    { id: 'phase-lint', name: 'Vulnerability Scanning', status: 'idle', duration: '18s', logPreview: ['> Running snyk-dependency-vault search...', '> Checking secrets credentials disclosure security...', '✓ No hardcoded secrets exposed.'] },
    { id: 'phase-build', name: 'Vite Production Bundler', status: 'idle', duration: '34s', logPreview: ['> vite build --minifyesbuild --sourcemap', '✓ Transpiling CJS modules to unified pipeline', '✓ Chunk sizes validated successfully.'] },
    { id: 'phase-container', name: 'Docker Container Realignment', status: 'idle', duration: '22s', logPreview: ['> docker build -t devstate-core:release .', '✓ Exporting layer metadata clusters', '✓ Registry handshake aligned.'] },
    { id: 'phase-deploy', name: 'Sovereign Production Rollout', status: 'idle', duration: '15s', logPreview: ['> Deploying container to Cloud Run', '> Routing socket ingress traffic to port 3000', '✓ Live environment verified successfully.'] }
  ]);

  const [activeDeployPhase, setActiveDeployPhase] = useState<number>(-1);
  const [forgeLogLines, setForgeLogLines] = useState<string[]>(['[FORGE REACTOR] Node listener mounted. Standby for launch commands.']);
  const [isDeploying, setIsDeploying] = useState<boolean>(false);
  const [deployPercent, setDeployPercent] = useState<number>(0);
  const [envLock, setEnvLock] = useState<boolean>(false);

  // Lighthouse score metrics delta comparison
  const [oldLightBox, setOldLightBox] = useState({ perf: 88, size: '24.2 MB', latency: '420ms' });
  const [newLightBox, setNewLightBox] = useState({ perf: 95, size: '18.4 MB', latency: '190ms' });

  // Persistence auto saver hook
  useEffect(() => {
    localStorage.setItem('labs_nexus_sessions', JSON.stringify(sessions));
  }, [sessions]);

  // Terminal history ref
  const terminalHistoryEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    terminalHistoryEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessions, activeSessionId, isDeploying, forgeLogLines]);

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];

  // ==========================================
  // NEXUS TERMINAL UTILITIES
  // ==========================================
  const executeLocalCommand = (cmdText: string) => {
    onTriggerSound(1.3);
    const text = cmdText.trim();
    if (!text) return;

    let responseOutput = '';
    let isSuccess = true;
    let autoFix = '';

    const normalized = text.toLowerCase();
    if (normalized === 'help') {
      responseOutput = 'Sovereign Nexus Console commands:\n - help: Display local manual index.\n - git status: Audit virtual file staging state.\n - git commit: Commit visual changes to virtual repository.\n - git log: Draw local topological commits.\n - clear: Wipe active screen cache lines.\n - diagnostics: Evaluate active port configurations.';
    } else if (normalized === 'clear') {
      setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, history: [] } : s));
      setInputCmd('');
      return;
    } else if (normalized.startsWith('git status')) {
      const stagedStr = gitFiles.filter(f => f.status === 'staged').map(f => `\tmodified:   ${f.path}`).join('\n');
      const unstagedStr = gitFiles.filter(f => f.status === 'unstaged').map(f => `\tmodified:   ${f.path}`).join('\n');
      const untrackedStr = gitFiles.filter(f => f.status === 'untracked').map(f => `\t${f.path}`).join('\n');

      responseOutput = `On branch main\nYour branch is up to date with \'origin/main\'.\n\nChanges to be committed:\n${stagedStr || '\t(None)'}\n\nChanges not staged for commit:\n${unstagedStr || '\t(None)'}\n\nUntracked files:\n${untrackedStr || '\t(None)'}`;
    } else if (normalized.startsWith('git add')) {
      const matchFile = text.replace('git add', '').trim();
      if (matchFile === '.') {
        setGitFiles(prev => prev.map(f => ({ ...f, status: 'staged' as const })));
        responseOutput = 'Staged all files inside active workspace node.';
      } else {
        setGitFiles(prev => prev.map(f => f.path.includes(matchFile) ? { ...f, status: 'staged' as const } : f));
        responseOutput = `Staged matched nodes: ${matchFile}`;
      }
    } else if (normalized.startsWith('git commit')) {
      responseOutput = `[main 7f20dbf] ${gitCommitMsg}\n 3 files changed, 204 insertions(+), 12 deletions(-)\n Staging stack auto-aligned.`;
      setGitFiles(prev => prev.map(f => f.status === 'staged' ? { ...f, status: 'staged' as const } : f).filter(f => f.status !== 'staged'));
    } else if (normalized === 'scan history') {
      responseOutput = 'WORKSPACE DIAGNOSTIC HISTORY (LAST 24 HOURS):\n\n[ERR-749] Cyclic Dependency Detected\nCircular import observed between src/components/NexusAndForge.tsx and src/App.tsx.\n\n[WRN-112] Unoptimized GPU Handlers\nThree.js canvas contexts in ArchitectureNebula are mounting without manual dispose handlers.\n\nTip: run > scan apply fixes <to automatically execute AI-suggested repairs>';
      isSuccess = false;
      autoFix = 'scan apply fixes';
    } else if (normalized === 'scan apply fixes') {
      responseOutput = 'Initializing autonomous AI self-healing pipelines...\n[OK] Automatically relocated shared states to \'src/store/\'.\n[OK] Attached automatic GL renderer dispose triggers to unmount cycles in root App.\n\nAll Workspace Scan anomalies successfully resolved. System optimal.';
      isSuccess = true;
    } else if (normalized === 'diagnostics') {
      responseOutput = 'AUDITING WORKSPACE INTEGRITY HOST INBOUND INTERFACES:\n- Interface Node: localhost\n- Port Target: 3000\n- Ingress Status: ACTIVE CONNECTED\n- Encryption state: SECURE END-TO-END TLSv1.3\n- Health Grade: 100%';
    } else {
      // Pass-through to general terminal handler
      handleRunCommand(undefined, text).then(res => {
        // App handles global history updating, but we can also log a copy locally here!
        if (res) {
          setSessions(prev => prev.map(s => {
            if (s.id === activeSessionId) {
              return {
                ...s,
                history: [...s.history, {
                  cmd: text,
                  output: res.output || 'Process ended with OK exit code.',
                  success: res.success !== false,
                  timestamp: new Date().toLocaleTimeString(),
                  fix: res.fix
                }]
              };
            }
            return s;
          }));
        }
      });
      setInputCmd('');
      return;
    }

    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        return {
          ...s,
          history: [...s.history, {
            cmd: text,
            output: responseOutput,
            success: isSuccess,
            timestamp: new Date().toLocaleTimeString(),
            fix: autoFix || undefined
          }]
        };
      }
      return s;
    }));

    setInputCmd('');
    setCmdHistoryCursor(-1);
  };

  // Autocomplete dynamic calculation with project-files
  const getAutocompleteSuggestions = () => {
    const suggestions = [...autocompleteDatabase];
    
    // Add file path completions from workspace
    gitFiles.forEach(f => {
      suggestions.push({
        cmd: `cat ${f.path}`,
        desc: 'View workspace file content (Workspace Path)',
        category: 'file'
      });
      suggestions.push({
        cmd: `git add ${f.path}`,
        desc: 'Stage specific workspace file',
        category: 'git'
      });
      suggestions.push({
        cmd: `nano ${f.path}`,
        desc: 'Edit specific workspace file',
        category: 'file'
      });
    });

    // Add dynamically standard package tasks
    suggestions.push({ cmd: 'npm run dev', desc: 'Initialize local dev server', category: 'npm' });
    suggestions.push({ cmd: 'npm run clean', desc: 'Wipe artifacts', category: 'npm' });
    suggestions.push({ cmd: 'npm run build', desc: 'Compile for production', category: 'npm' });
    suggestions.push({ cmd: 'npm run test:e2e', desc: 'Execute end-to-end simulation test suite', category: 'npm' });

    // AI Workspace Scan specific diagnostic commands
    suggestions.push({ cmd: 'scan apply fixes', desc: 'Automatically execute AI-suggested repairs for recent diagnostic errors', category: 'ai-sys' });
    suggestions.push({ cmd: 'scan history', desc: 'View past workspace architectural scan failures', category: 'ai-sys' });

    return suggestions;
  };

  // Keyboard autocomplete selector inside terminal inputs
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const available = getAutocompleteSuggestions();
      // Find matches where cmd starts with what user typed
      const matches = available.filter(i => i.cmd.toLowerCase().startsWith(inputCmd.toLowerCase()));
      // Find the first match that is strictly longer
      const matched = matches.find(i => i.cmd.toLowerCase() !== inputCmd.toLowerCase()) || matches[0];
      if (matched) {
        setInputCmd(matched.cmd);
        onTriggerSound(1.1);
      }
    }
  };

  // Create new session tab
  const createNewSessionTab = () => {
    const id = `session-c-${Date.now()}`;
    const newTab: TerminalSession = {
      id,
      name: `term-${sessions.length + 1}`,
      history: [{ cmd: 'init', output: `New shell context assigned. PID: ${Math.round(4000 + Math.random() * 8000)} mounted successfully.`, success: true, timestamp: new Date().toLocaleTimeString() }],
      running: false,
      activePath: '~/workspace'
    };
    setSessions([...sessions, newTab]);
    setActiveSessionId(id);
    onTriggerSound(1.5);
    triggerNotification("Created brand-new virtual shell pipeline", "success");
  };

  // Close session tab
  const closeSessionTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (sessions.length <= 1) {
      triggerNotification("Cannot wipe last surviving control socket!", "error");
      return;
    }
    const idx = sessions.findIndex(s => s.id === id);
    const filtered = sessions.filter(s => s.id !== id);
    setSessions(filtered);
    if (activeSessionId === id) {
      setActiveSessionId(filtered[Math.max(0, idx - 1)].id);
    }
    onTriggerSound(0.85);
  };

  // Export session to shell file
  const exportSessionAsScript = () => {
    const content = activeSession.history.map(h => `# Executed on: ${h.timestamp}\n${h.cmd}\n# Output:\n${h.output}\n`).join('\n\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeSession.name}-transcript.sh`;
    link.click();
    URL.revokeObjectURL(url);
    triggerNotification("Active session scripts transcript exported!", "success");
    onTriggerSound(1.6);
  };

  // Interactive git rebase trigger
  const updateRebaseStatus = (sha: string, newStatus: 'pick' | 'squash' | 'edit' | 'drop') => {
    setRebaseCommits(prev => prev.map(c => c.sha === sha ? { ...c, status: newStatus } : c));
    onTriggerSound(1.15);
    triggerNotification(`Set commit token ${sha} parameter status to [${newStatus.toUpperCase()}]`, "info");
  };

  const executeInteractiveRebase = () => {
    setIsDeploying(true);
    setForgeLogLines([]);
    onTriggerSound(1.7);
    triggerNotification("Performing critical git structural rebase sequence...", "info");
    setActiveModule('forge');

    let currentLog: string[] = ['[REBASE ENGINE] Triggering history realignment...'];
    setForgeLogLines([...currentLog]);

    setTimeout(() => {
      currentLog.push('[REBASE ENGINE] Parsing staging parent nodes...');
      const keeps = rebaseCommits.filter(c => c.status !== 'drop');
      currentLog.push(`[REBASE ENGINE] Alignment report: Identified ${keeps.length} surviving commit nodes.`);
      setForgeLogLines([...currentLog]);
    }, 500);

    setTimeout(() => {
      rebaseCommits.forEach(commit => {
        if (commit.status === 'drop') {
          currentLog.push(`[REBASE ENGINE] ! Purged branch artifact commit node: ${commit.sha} ("${commit.message}")`);
        } else if (commit.status === 'squash') {
          currentLog.push(`[REBASE ENGINE] + Folded node ${commit.sha} into parent lineage.`);
        } else {
          currentLog.push(`[REBASE ENGINE] ✓ Retained target path commit node: ${commit.sha}`);
        }
      });
      setForgeLogLines([...currentLog]);
    }, 1200);

    setTimeout(() => {
      currentLog.push('✓ REBASE COMPLETE. Linearized git branch history sanitized.');
      setForgeLogLines([...currentLog]);
      setIsDeploying(false);
      triggerNotification("Git branches re-aligned. Conflict matrices clear.", "success");
      onTriggerSound(1.4);
    }, 2200);
  };

  // ==========================================
  // FORGE MODULE DEPLOYMENT PIPELINE RUNNER
  // ==========================================
  const startNASAForgeDeployment = () => {
    if (envLock) {
      triggerNotification("Deployment pipeline is currently LOCKED by Administrator Mutex!", "error");
      onTriggerSound(0.7);
      return;
    }
    
    setIsDeploying(true);
    setDeployPercent(0);
    onTriggerSound(1.85);
    triggerNotification("🚀 DevState Forge: Initiating deep compile deployment...", "info");

    const logs: string[] = ['[FORGE REACTOR] Initializing NASA-Grade pipeline build...'];
    setForgeLogLines([...logs]);

    // Set phases to running sequentially
    let currentPhaseIdx = 0;
    
    const runNextPhase = () => {
      if (currentPhaseIdx >= pipelinePhases.length) {
        setIsDeploying(false);
        setDeployPercent(100);
        triggerNotification("🎉 Ship complete! High-performance portal is online on port 3000.", "success");
        onTriggerSound(1.5);
        return;
      }

      const activePhase = pipelinePhases[currentPhaseIdx];
      
      // Update local phase statuses
      setPipelinePhases(prev => prev.map((p, index) => 
        index === currentPhaseIdx ? { ...p, status: 'running' } : p
      ));

      // Stream fake syntax highlight logs
      let logIndex = 0;
      const interval = setInterval(() => {
        if (logIndex < activePhase.logPreview.length) {
          const line = `[${activePhase.name.toUpperCase()}] ${activePhase.logPreview[logIndex]}`;
          logs.push(line);
          setForgeLogLines([...logs]);
          setDeployPercent(prev => Math.min(95, prev + Math.floor(Math.random() * 4) + 1));
          logIndex++;
        } else {
          clearInterval(interval);
          
          // Complete phase
          setPipelinePhases(prev => prev.map((p, index) => 
            index === currentPhaseIdx ? { ...p, status: 'success' } : p
          ));

          onTriggerSound(1.2);
          currentPhaseIdx++;
          runNextPhase();
        }
      }, 900);
    };

    runNextPhase();
  };

  // Emergency abort button
  const emergencyAbortDeployment = () => {
    setIsDeploying(false);
    setPipelinePhases(prev => prev.map(p => ({ ...p, status: 'idle' })));
    setForgeLogLines(prev => [...prev, '💀 EMERGENCY FORCE STOP: Pipeline execution aborted by developer intervention.', '💀 INGRESS PORTS RE-SHIELDED. STANDBY BYPASSED.']);
    triggerNotification("Deployment aborted. Clean rollback mounted.", "error");
    onTriggerSound(0.5);
  };

  return (
    <div id="nexus-forge-integrated-cockpit" className="col-span-12 font-sans select-none">
      
      {/* COCKPIT NAVIGATION HEADER - Obsidian Realism Grid Tab Toggle */}
      <div className="flex items-center justify-between border border-[#2e4260]/40 bg-[#080d14]/90 p-1 rounded-2xl mb-6 select-none shadow-lg relative">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => { setActiveModule('nexus'); onTriggerSound(1.2); }}
            className={`px-5 py-2.5 rounded-xl text-xs font-black tracking-wider uppercase font-mono flex items-center gap-2 transition duration-300 cursor-pointer ${
              activeModule === 'nexus' 
                ? 'bg-[#e4e4e7]/10 text-[#e4e4e7] border border-[#e4e4e7]/20 shadow-[0_0_15px_rgba(0,255,209,0.15)]' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            NEXUS TERMINAL & GIT GATE
          </button>
          <button
            type="button"
            onClick={() => { setActiveModule('forge'); onTriggerSound(1.2); }}
            className={`px-5 py-2.5 rounded-xl text-xs font-black tracking-wider uppercase font-mono flex items-center gap-2 transition duration-300 cursor-pointer ${
              activeModule === 'forge' 
                ? 'bg-[#e4e4e7]/10 text-[#e4e4e7] border border-[#e4e4e7]/20 shadow-[0_0_15px_rgba(0,255,209,0.15)]' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            FORGE DEPLOYMENT HUD
            <span className="h-2 w-2 rounded-full bg-zinc-700 animate-ping" />
          </button>
        </div>

        {/* Global project diagnostics state bar display */}
        <div className="hidden md:flex items-center gap-4 text-[10px] font-mono text-slate-400 px-4">
          <div className="flex items-center gap-1.5 bg-[#0d1520] border border-white/5 px-3 py-1 rounded-full">
            <span className="h-1.5 w-1.5 bg-[#e4e4e7] rounded-full animate-pulse" />
            <span>NEXUS CONSOLE: OPERATIONAL</span>
          </div>
          <div className="flex items-center gap-1.5 bg-[#0d1520] border border-white/5 px-3 py-1 rounded-full">
            <span>REPOSITORY: <span className="text-zinc-300 font-bold">{githubRepo}</span></span>
          </div>
        </div>
      </div>

      {/* ========================================================== */}
      {/* MODULE 1: NEXUS TERMINAL & VISUAL GIT CONTROL */}
      {/* ========================================================== */}
      {activeModule === 'nexus' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          
          {/* TERMINAL HOUSING (8 Columns) */}
          <div className="col-span-12 lg:col-span-8 bg-[#080d14]/95 border border-[#2e4260]/30 rounded-3xl p-6 shadow-2xl flex flex-col relative overflow-hidden">
            <div className="bg-gradient-to-r from-[#e4e4e7]/10 via-transparent to-transparent h-1 w-full absolute top-0 left-0" />
            
            {/* Session Tabs row */}
            <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pr-4 max-w-lg">
                {sessions.map(s => (
                  <div
                    key={s.id}
                    onClick={() => { setActiveSessionId(s.id); onTriggerSound(1.1); }}
                    className={`flex items-center gap-2 border px-3 py-1.5 rounded-xl cursor-pointer text-xs font-mono transition duration-200 shrink-0 ${
                      activeSessionId === s.id 
                        ? 'bg-[#0d1520] border-[#e4e4e7]/40 text-[#e4e4e7]' 
                        : 'bg-transparent border-slate-900 text-slate-500 hover:text-slate-350 hover:border-slate-800'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${activeSessionId === s.id ? 'bg-[#e4e4e7] animate-pulse' : 'bg-slate-700'}`} />
                    <span>{s.name}</span>
                    <button 
                      type="button" 
                      onClick={(e) => closeSessionTab(s.id, e)}
                      className="hover:text-rose-400 px-0.5 rounded text-[10px] select-none"
                    >
                      <X className="w-3 h-3 hover:scale-125 transition" />
                    </button>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={createNewSessionTab}
                  className="p-1 px-2 hover:bg-white/5 text-slate-400 hover:text-white rounded-lg border border-dashed border-slate-800 transition flex items-center justify-center gap-1"
                  title="Inject a clean concurrent terminal session node"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="text-[9.5px] font-mono leading-none">NEW</span>
                </button>
              </div>

              {/* Console preferences and shortcuts */}
              <div className="flex items-center gap-1 bg-[#0c101a] border border-white/5 rounded-xl p-1 shrink-0">
                <button
                  type="button"
                  onClick={exportSessionAsScript}
                  className="px-2.5 py-1 text-slate-400 hover:text-[#e4e4e7] rounded-lg transition text-[10px] font-mono font-bold flex items-center gap-1.5"
                  title="Export active terminal pipeline history as `.sh` shell execution sequence"
                >
                  <FolderDown className="w-3 h-3 text-[#e4e4e7]" />
                  EXPORT TRANSCRIPT
                </button>
              </div>
            </div>

            {/* QUICK ACTIONS ACTION-BAR PANELS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              <button
                type="button"
                onClick={() => executeLocalCommand("git status")}
                className="bg-[#0b121e]/80 hover:bg-[#111c2f]/80 text-[#e4e4e7] font-mono text-[10px] font-black border border-[#2e4260]/30 px-3 py-2.5 rounded-xl transition duration-150 flex items-center gap-1.5 shadow-sm cursor-pointer hover:-translate-y-0.5"
              >
                <GitBranch className="w-3.5 h-3.5 animate-pulse" />
                GIT STATUS CHECK
              </button>
              <button
                type="button"
                onClick={() => executeLocalCommand("npm run build")}
                className="bg-[#0b121e]/80 hover:bg-[#111c2f]/80 text-[#c084fc] font-mono text-[10px] font-black border border-[#2e4260]/30 px-3 py-2.5 rounded-xl transition duration-150 flex items-center gap-1.5 shadow-sm cursor-pointer hover:-translate-y-0.5"
              >
                <Cpu className="w-3.5 h-3.5" />
                VERIFY BUNDLER
              </button>
              <button
                type="button"
                onClick={() => executeLocalCommand("diagnostics")}
                className="bg-[#0b121e]/80 hover:bg-[#111c2f]/80 text-[#39ff6a] font-mono text-[10px] font-black border border-[#2e4260]/30 px-3 py-2.5 rounded-xl transition duration-150 flex items-center gap-1.5 shadow-sm cursor-pointer hover:-translate-y-0.5"
              >
                <Activity className="w-3.5 h-3.5 text-[#39ff6a]" />
                DIAGNOSTIC TEST
              </button>
              <button
                type="button"
                onClick={() => {
                  setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, history: [] } : s));
                  triggerNotification("Cleared console pipeline cached outputs.", "info");
                  onTriggerSound(0.5);
                }}
                className="bg-transparent hover:bg-rose-950/20 text-slate-500 hover:text-rose-400 font-mono text-[10px] font-bold border border-slate-900 hover:border-rose-950 px-3 py-2.5 rounded-xl transition flex items-center justify-center gap-1 text-center shrink-0"
              >
                <Trash2 className="w-3 h-3" />
                CLEAR OUTPUTS
              </button>
            </div>

            {/* SCREEN LAYOUT VIEWPORTS TERMINAL HISTORY */}
            <div className="mb-3.5 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                id="terminal-history-filter"
                type="text"
                value={terminalFilter}
                onChange={(e) => {
                  setTerminalFilter(e.target.value);
                  onTriggerSound(1.05);
                }}
                placeholder="Filter terminal logs by keyword..."
                className="w-full bg-[#020408] border border-[#2e4260]/30 rounded-xl pl-9 pr-14 py-2 text-xs text-slate-350 focus:outline-none focus:ring-1 focus:ring-[#e4e4e7]/40 text-slate-200 font-mono"
              />
              {terminalFilter && (
                <button
                  type="button"
                  onClick={() => {
                    setTerminalFilter('');
                    onTriggerSound(0.9);
                  }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-455 hover:text-slate-300 text-[10px] font-mono uppercase tracking-widest font-bold"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="bg-[#020408] border border-[#233449]/40 rounded-2xl p-4 flex-1 min-h-[300px] max-h-[360px] overflow-y-auto space-y-4">
              <div className="border border-white/5 bg-slate-950/40 p-3 rounded-xl flex items-center justify-between text-[10px] font-mono text-slate-500 mb-2">
                <span>TERMINAL_SESSION: <span className="text-[#e4e4e7] font-bold">{activeSession.name.toUpperCase()}</span> | CONCURRENCY_LOCK: FALSE</span>
                <span>Active path: <span className="text-[#a78bfa] font-bold">{activeSession.activePath}</span></span>
              </div>

              {activeSession.history
                .filter(hist => {
                  if (!terminalFilter.trim()) return true;
                  const query = terminalFilter.toLowerCase();
                  return hist.cmd.toLowerCase().includes(query) || 
                    hist.output.toLowerCase().includes(query) || 
                    (hist.fix && hist.fix.toLowerCase().includes(query));
                })
                .map((hist, index) => (
                  <div key={index} className="space-y-1.5 animate-fade-in border-l border-white/5 pl-3">
                    <div className="flex items-center justify-between text-[9.5px] font-mono text-slate-600 border-b border-white/5 pb-1 select-none">
                      <span className="flex items-center gap-1">
                        <span className="text-[#e4e4e7] font-extrabold">$</span>
                        <strong className="text-slate-300 font-bold">{hist.cmd}</strong>
                      </span>
                      <span className="flex items-center gap-3">
                        <span>[{hist.timestamp}]</span>
                        {hist.success ? (
                          <span className="text-[#39ff6a] font-black">[EXIT_OK]</span>
                        ) : (
                          <span className="text-[#ff3d71] font-black">[FAULT]</span>
                        )}
                      </span>
                    </div>
                    <pre className={`whitespace-pre-wrap leading-relaxed py-1 font-mono text-[11px] select-text ${
                      hist.success ? 'text-slate-205 text-slate-300' : 'text-rose-350 bg-rose-950/15 p-3 rounded-lg border border-rose-900/40'
                    }`}>
                      {hist.output}
                    </pre>
                    {hist.fix && (
                      <div className="bg-[#e4e4e7]/5 border border-[#e4e4e7]/20 p-3.5 rounded-xl mt-2 text-[10px] text-white font-mono leading-relaxed relative">
                        <div className="text-[#e4e4e7] font-extrabold flex items-center gap-1.5 mb-1 text-[8.5px] uppercase tracking-wider">
                          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                          AI Smart Suggested Auto-healing Alignment
                        </div>
                        <div className="flex items-center justify-between">
                           <p className="text-slate-350">{hist.fix}</p>
                           <button 
                             onClick={() => executeLocalCommand(hist.fix!)} 
                             className="px-3 py-1 bg-[#10b981]/20 hover:bg-[#10b981]/30 text-[#10b981] border border-[#10b981]/40 rounded-lg whitespace-nowrap transition-colors active:scale-95">
                             RUN FIX
                           </button>
                         </div>
                      </div>
                    )}
                  </div>
                ))}

              {activeSession.history.filter(hist => {
                if (!terminalFilter.trim()) return true;
                const query = terminalFilter.toLowerCase();
                return hist.cmd.toLowerCase().includes(query) || 
                  hist.output.toLowerCase().includes(query) || 
                  (hist.fix && hist.fix.toLowerCase().includes(query));
              }).length === 0 && (
                <div className="text-center py-8 text-slate-500 font-mono text-xs select-none">
                  No matching execution log lines found for pattern: "{terminalFilter}"
                </div>
              )}

              {terminalRunning && (
                <div className="flex items-center gap-2 text-[#e4e4e7] animate-pulse text-[10.5px] select-none font-mono">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Secure live pipeline execution transmission active...</span>
                </div>
              )}
              <div ref={terminalHistoryEndRef} />
            </div>

            {/* COMMAND AUTOCOMPLETE & FUZZY SUGGEST DROPDOWN */}
            {inputCmd.trim().length > 0 && (
              <div className="absolute bottom-20 left-6 right-6 bg-[#080d14] border border-[#2e4260]/60 p-2.5 rounded-2xl shadow-2xl z-30 space-y-1">
                <div className="text-[8px] font-mono text-slate-550 border-b border-white/5 pb-1 px-1 flex justify-between select-none italic text-slate-500">
                  <span>FUZZY PATTERN CLUSTERS MATCH:</span>
                  <span>PRESS [TAB] TO AUTOMATICALLY CONSUME PATTERN</span>
                </div>
                {getAutocompleteSuggestions()
                  .filter(item => item.cmd.toLowerCase().includes(inputCmd.toLowerCase()) && inputCmd.length > 0)
                  .slice(0, 3)
                  .map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => { setInputCmd(item.cmd); onTriggerSound(1.1); }}
                      className="p-2 hover:bg-[#0c1320] border border-transparent hover:border-[#e4e4e7]/20 rounded-xl cursor-pointer flex items-center justify-between text-xs font-mono transition"
                    >
                      <span className="text-[#e4e4e7] font-black">{item.cmd}</span>
                      <span className="text-[10px] text-slate-400">{item.desc}</span>
                    </div>
                  ))
                }
              </div>
            )}

            {/* CONSOLE SECURE TRANSMISSION INPUT PANEL */}
            <form 
              onSubmit={(e) => { e.preventDefault(); executeLocalCommand(inputCmd); }}
              className="mt-4 flex items-center gap-2"
            >
              <div className="relative flex-1 flex items-center">
                <span className="absolute left-4 font-mono text-xs font-extrabold text-[#e4e4e7] select-none">$</span>
                <input
                  type="text"
                  value={inputCmd}
                  onChange={(e) => setInputCmd(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="bg-[#020408] border border-[#2e4260]/40 rounded-2xl pl-9 pr-4 py-3.5 text-xs text-[#e4e4e7] placeholder-[#2e4260] focus:ring-1 focus:ring-[#e4e4e7]/45 focus:border-[#e4e4e7]/60 focus:outline-none font-mono flex-1 transition duration-200"
                  placeholder="Inject execution instruction... (e.g., git add ., press [Tab] to autocomplete)"
                />
              </div>
              <button
                type="submit"
                disabled={!inputCmd.trim()}
                className="bg-[#0d1520] hover:bg-[#141f2e] disabled:opacity-40 text-slate-300 font-mono text-xs font-black uppercase tracking-wider px-6 py-3.5 rounded-2xl border border-[#2e4260]/40 transition duration-150 active:scale-95 cursor-pointer shrink-0"
              >
                DISPATCH CMD
              </button>
            </form>
          </div>

          {/* MASTER GIT CONTROL PANEL (4 Columns) */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            
            {/* VIRTUAL STAGING HUB */}
            <div className="bg-[#080d14]/95 border border-[#2e4260]/30 rounded-3xl p-5 shadow-xl relative overflow-hidden">
              <div className="bg-gradient-to-r from-[#e4e4e7]/10 via-transparent to-transparent h-1 w-full absolute top-0 left-0" />
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-4">
                <div className="flex items-center gap-2">
                  <FolderGit2 className="w-4 h-4 text-[#e4e4e7]" />
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-300 font-mono">
                    Visual Git Ledger
                  </h4>
                </div>
                <span className="text-[8px] font-mono font-black text-[#e4e4e7] bg-[#e4e4e7]/10 px-2 py-0.5 rounded border border-[#e4e4e7]/20">
                  {gitFiles.length} FILES
                </span>
              </div>

              {/* Staged files list with custom drag triggers */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 mb-4">
                {gitFiles.map((file, idx) => (
                  <div 
                    key={idx}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-mono transition duration-300 ${
                      file.status === 'staged' 
                        ? 'bg-[#e4e4e7]/5 border-[#e4e4e7]/20 text-[#e4e4e7]' 
                        : file.status === 'unstaged' 
                          ? 'bg-[#ffb800]/5 border-[#ffb800]/25 text-[#ffb800]' 
                          : 'bg-white/5 border-white/5 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <input 
                        type="checkbox" 
                        checked={file.status === 'staged'}
                        onChange={() => {
                          const nextStatus = file.status === 'staged' ? 'unstaged' : 'staged';
                          setGitFiles(prev => prev.map(f => f.path === file.path ? { ...f, status: nextStatus } : f));
                          onTriggerSound(1.35);
                          triggerNotification(`Staged/Unstaged: ${file.path}`, "info");
                        }}
                        className="rounded border-[#2e4260]/40 text-[#e4e4e7] focus:ring-[#e4e4e7]/25 h-3.5 w-3.5 bg-slate-900 cursor-pointer"
                      />
                      <div className="truncate">
                        <span className="block font-bold text-[11px] truncate">{file.path}</span>
                        <span className="block text-[8px] text-slate-500 font-mono uppercase">{file.type} • {file.size}</span>
                      </div>
                    </div>

                    <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded shrink-0 select-none scale-90">
                      {file.status}
                    </span>
                  </div>
                ))}
              </div>

              {/* Commit composer container */}
              <div className="space-y-2 pt-2 border-t border-white/5 select-text">
                <label className="text-[9.5px] font-mono uppercase font-black tracking-wider text-slate-500 block">Commit Segment Message</label>
                <textarea 
                  value={gitCommitMsg}
                  onChange={(e) => setGitCommitMsg(e.target.value)}
                  className="w-full h-14 bg-slate-950 border border-[#2e4260]/40 rounded-xl p-2 font-mono text-[10.5px] text-slate-300 focus:outline-none focus:ring-1 focus:ring-[#e4e4e7]/40"
                  placeholder="Enter message for virtual repository staging alignment..."
                />
                
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      executeLocalCommand(`git commit -m "${gitCommitMsg}"`);
                    }}
                    className="flex-1 bg-[#e4e4e7]/10 text-[#e4e4e7] border border-[#e4e4e7]/30 hover:bg-[#e4e4e7]/20 font-mono text-[10px] font-black py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    <GitMerge className="w-3.5 h-3.5" />
                    DISPATCH COMMIT
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setGitFiles(prev => prev.map(f => ({ ...f, status: 'staged' })));
                      triggerNotification("Force aligned physical stage configuration", "success");
                    }}
                    className="px-3 bg-slate-900 hover:bg-slate-850 text-slate-400 border border-white/5 rounded-xl transition text-[10px] font-mono leading-none font-bold"
                  >
                    STAGE ALL
                  </button>
                </div>
              </div>
            </div>

            {/* COGNITIVE CODE SNIPPETS STORAGE */}
            <div className="bg-[#080d14]/95 border border-[#2e4260]/30 rounded-3xl p-5 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-3">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-[#a78bfa]" />
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-300 font-mono">
                    Snippets Vault
                  </h4>
                </div>
              </div>

              <div className="space-y-3 select-text">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono uppercase text-slate-550 block font-bold text-slate-550">Dynamic Variable Snippet (message)</span>
                  <input
                    type="text"
                    value={snippetVar}
                    onChange={(e) => setSnippetVar(e.target.value)}
                    className="w-full bg-[#020408] border border-white/5 rounded-lg px-2.5 py-1.5 font-mono text-[10px] text-[#e4e4e7]"
                    placeholder="Enter value for {{message}}"
                  />
                </div>

                <div className="space-y-2">
                  {savedSnippets.map((snip, idx) => {
                    const resolvedCmd = snip.cmdTemplate.replace('{{message}}', snippetVar);
                    return (
                      <div key={idx} className="p-2.5 bg-slate-950 border border-white/5 rounded-xl hover:border-[#a78bfa]/30 transition group relative">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-wider">{snip.name}</span>
                          <span className="text-[8px] font-mono text-slate-550 bg-slate-900 px-1.5 py-0.5 rounded leading-none text-slate-500 uppercase">{snip.category}</span>
                        </div>
                        <code className="block text-[9.5px] font-mono text-zinc-300 truncate">{resolvedCmd}</code>
                        
                        <div className="absolute right-2 top-2 hidden group-hover:flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setInputCmd(resolvedCmd);
                              triggerNotification("Snippet command injected to sandbox line buffer", "info");
                              onTriggerSound(1.1);
                            }}
                            className="bg-[#a78bfa]/10 text-[#a78bfa] border border-[#a78bfa]/20 p-1 rounded hover:bg-[#a78bfa]/20 transition"
                            title="Insert snippet directly to terminal"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* INTERACTIVE COMPOSABLE GIT REBASE INTERFACE */}
            <div className="bg-[#080d14]/95 border border-[#2e4260]/30 rounded-3xl p-5 shadow-xl relative overflow-hidden">
              <div className="bg-gradient-to-r from-red-500/10 via-transparent to-transparent h-1 w-full absolute top-0 left-0" />
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-3">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#ff3d71]" />
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-300 font-mono">
                    Interactive Rebase Map
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={executeInteractiveRebase}
                  className="bg-[#ff3d71]/10 text-[#ff3d71] border border-[#ff3d71]/20 p-1 px-2.5 rounded-lg text-[9px] font-mono font-black"
                >
                  RUN REBASE
                </button>
              </div>

              <span className="text-[9px] font-mono leading-relaxed text-slate-400 mb-3 block italic leading-normal">
                Optimize and scrub branch history before final shipping. Adjust active commit actions below:
              </span>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {rebaseCommits.map((c, index) => (
                  <div key={index} className="p-2 bg-slate-950 border border-white/5 rounded-xl font-mono text-[10px] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#a78bfa] font-black">{c.sha}</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-405 text-slate-400 truncate max-w-[120px] font-bold">{c.author}</span>
                      </div>
                      <span className="text-[8px] text-slate-500">{c.timestamp}</span>
                    </div>

                    <p className="text-slate-300 truncate font-semibold">"{c.message}"</p>

                    <div className="flex items-center gap-1 pt-1.5 border-t border-white/5 justify-between">
                      <span className="text-[8px] text-slate-500">ACTION NODE:</span>
                      <div className="flex items-center gap-1">
                        {(['pick', 'squash', 'edit', 'drop'] as const).map(act => (
                          <button
                            key={act}
                            type="button"
                            onClick={() => updateRebaseStatus(c.sha, act)}
                            className={`p-1 px-2.5 rounded text-[8px] font-black uppercase leading-none transition ${
                              c.status === act 
                                ? act === 'pick' ? 'bg-[#39ff6a]/10 text-[#39ff6a] border border-[#39ff6a]/20'
                                  : act === 'squash' ? 'bg-[#ffb800]/10 text-[#ffb800] border border-[#ffb800]/20'
                                    : act === 'edit' ? 'bg-[#e4e4e7]/10 text-[#e4e4e7] border border-[#e4e4e7]/20'
                                      : 'bg-[#ff3d71]/10 text-[#ff3d71] border border-[#ff3d71]/20'
                                : 'bg-slate-900 text-slate-400 border border-transparent hover:border-white/5'
                            }`}
                          >
                            {act}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* MODULE 2: FORGE DEPLOYMENT HUD MISSION CONTROL */}
      {/* ========================================================== */}
      {activeModule === 'forge' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in select-text">
          
          {/* REPOS AND PIPELINE FLOW LINE (8 Columns) */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            
            {/* MULTI REPO ACTIVE INTEGRATION MATRIX */}
            <div className="bg-[#080d14]/95 border border-[#2e4260]/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
              <div className="bg-gradient-to-r from-[#e4e4e7]/15 to-transparent h-1 w-full absolute top-0 left-0" />
              <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-[#e4e4e7]" />
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-350 font-mono">
                    Sovereign Core Repository Matrix
                  </h4>
                </div>
                <span className="text-[9.5px] font-mono text-slate-500 font-bold">TUNNEL SYNC COMPLETE</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {repos.map(r => (
                  <div key={r.id} className="p-4 bg-slate-950 border border-white/5 rounded-2xl hover:border-[#e4e4e7]/20 transition relative">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] uppercase font-mono text-slate-500 block truncate">{r.lang}</span>
                      <span className={`h-2 w-2 rounded-full ${r.status === 'online' ? 'bg-[#39ff6a]' : 'bg-[#ffb800]'} animate-pulse`} />
                    </div>
                    <span className="text-xs font-black text-slate-200 block truncate font-mono">{r.name}</span>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5 font-mono text-[10px]">
                      <span className="text-slate-500">Last commit: <span className="text-zinc-300 font-bold">{r.lastCommit}</span></span>
                      <span className="text-[#39ff6a] font-bold">♥ {r.health}% HEALTH</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* NASA LAUNCH DEPLOYMENT PIPELINE HUD CHECKLIST */}
            <div className="bg-[#080d14]/95 border border-[#2e4260]/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
              <div className="bg-gradient-to-r from-[#ffb800]/10 via-transparent to-transparent h-1 w-full absolute top-0 left-0" />
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-4 mb-6 gap-3">
                <div className="flex items-center gap-2">
                  <Gauge className="w-5 h-5 text-[#ffb800]" />
                  <div className="font-mono">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-250">
                      Forge deployment alignment telemetry
                    </h4>
                    <span className="text-[9.5px] text-slate-500 block">NASA-STRENGTH SECURITY RUN ENVIRONMENT ENGINE</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isDeploying ? (
                    <button
                      type="button"
                      onClick={emergencyAbortDeployment}
                      className="bg-[#ff3d71]/15 hover:bg-[#ff3d71]/25 text-[#ff3d71] border border-[#ff3d71]/40 text-[10px] font-mono leading-none font-black px-4.5 py-3 rounded-2xl transition animate-pulse cursor-pointer flex items-center gap-1.5"
                    >
                      <AlertOctagon className="w-3.5 h-3.5" />
                      EMERGENCY ABORT
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={startNASAForgeDeployment}
                      className="bg-[#e4e4e7]/10 text-[#e4e4e7] border border-[#e4e4e7]/30 hover:bg-[#e4e4e7]/20 text-[10px] font-mono leading-none font-black px-5 py-3.5 rounded-2xl transition tracking-widest uppercase cursor-pointer flex items-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5" />
                      COMMENCE SHIP SEQUENCE
                    </button>
                  )}
                </div>
              </div>

              {/* Progress bar stream pipeline tracker */}
              <div className="mb-8 font-mono select-none">
                <div className="flex justify-between text-[10px] text-slate-400 mb-2">
                  <span>DEPLOY TOTAL PIPELINE ALIGNMENT PROGRESS:</span>
                  <span className="text-[#e4e4e7] font-black">{deployPercent}% READY</span>
                </div>
                <div className="w-full h-2.5 bg-slate-950 border border-white/5 rounded-full overflow-hidden p-0.5 shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-[#e4e4e7] via-[#a78bfa] to-[#ff3d71] rounded-full transition-all duration-300 relative shadow-[0_0_12px_#e4e4e7]"
                    style={{ width: `${deployPercent}%` }}
                  />
                </div>
              </div>

              {/* Graphical workflow stage node arrays */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative mb-6 select-none">
                {pipelinePhases.map((phase, idx) => (
                  <div 
                    key={phase.id}
                    className={`p-4 rounded-2xl border text-center transition duration-300 relative group font-mono ${
                      phase.status === 'success' 
                        ? 'bg-[#39ff6a]/5 border-[#39ff6a]/20 text-[#39ff6a]' 
                        : phase.status === 'running' 
                          ? 'bg-[#ffb800]/10 border-[#ffb800]/40 text-[#ffb800]' 
                          : 'bg-slate-950 border-white/5 text-slate-450 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-center mb-2">
                      {phase.status === 'success' ? (
                        <CheckCircle2 className="w-5 h-5 text-[#39ff6a] shrink-0" />
                      ) : phase.status === 'running' ? (
                        <RefreshCw className="w-5 h-5 text-[#ffb800] shrink-0 animate-spin" />
                      ) : (
                        <span className="text-[10px] font-bold text-slate-650 h-5 w-5 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center">
                          {idx + 1}
                        </span>
                      )}
                    </div>

                    <span className="text-[10px] font-black block leading-tight truncate uppercase tracking-tight">{phase.name}</span>
                    <span className="text-[8px] text-slate-550 block mt-1.5 text-slate-500">EST: {phase.duration}</span>

                    {/* Linking node arrows */}
                    {idx < 4 && (
                      <div className="hidden sm:block absolute top-1/2 -right-3.5 -translate-y-1/2 text-slate-700 z-10 select-none">
                        <ArrowRight className="w-4 h-4 scale-75" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Streaming NASA Log Stream window console */}
              <div className="bg-[#020408] border border-[#233449]/40 rounded-2xl p-4.5 font-mono text-[10.5px] max-h-52 overflow-y-auto space-y-1.5 shadow-inner">
                {forgeLogLines.map((log, index) => (
                  <div key={index} className="flex items-start gap-1 select-text text-slate-350">
                    <span className="text-slate-750 text-slate-605 select-none font-bold mr-1 shrink-0">{`[${String(index + 1).padStart(3, '0')}]`}</span>
                    <p className={`leading-relaxed ${
                      log.includes('✓') || log.includes('COMPLETE') 
                        ? 'text-[#39ff6a]' 
                        : log.includes('💀') || log.includes('ABORT') 
                          ? 'text-[#ff3d71]' 
                          : log.includes('running') || log.includes('Executing')
                            ? 'text-zinc-300 font-bold'
                            : 'text-slate-300'
                    }`}>{log}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ENVIRONMENT GRID COMPARATOR MATRIX (4 Columns) */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            
            {/* MUTEX LOCK & MATRIX GRID CHASSIS */}
            <div className="bg-[#080d14]/95 border border-[#2e4260]/30 rounded-3xl p-5 shadow-xl relative overflow-hidden">
              <div className="bg-gradient-to-r from-red-500/10 via-transparent to-transparent h-1 w-full absolute top-0 left-0" />
              
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-4">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#ffb800]" />
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-300 font-mono">
                    Environment Guardians
                  </h4>
                </div>
                
                {/* Visual Administrator lock trigger checkbox */}
                <button
                  type="button"
                  onClick={() => {
                    setEnvLock(!envLock);
                    onTriggerSound(!envLock ? 0.65 : 1.4);
                    triggerNotification(`Security Deployment guard mutex: ${!envLock ? 'LOCKED' : 'UNLOCKED'}`, !envLock ? "error" : "success");
                  }}
                  className={`p-1.5 px-3 rounded-lg text-[9px] font-mono font-black flex items-center gap-1 leading-none cursor-pointer transition ${
                    envLock 
                      ? 'bg-rose-950/40 text-[#ff3d71] border border-rose-910 border-rose-900/40 animate-pulse' 
                      : 'bg-white/5 text-[#39ff6a] border border-white/5'
                  }`}
                >
                  {envLock ? <Lock className="w-3 h-3 text-[#ff3d71]" /> : <Unlock className="w-3 h-3 text-[#39ff6a]" />}
                  {envLock ? 'MUTEX LOCKED' : 'RELEASED'}
                </button>
              </div>

              {/* Environments matrix statuses and promotes */}
              <div className="space-y-4 font-mono select-none">
                
                {/* DEV CELL */}
                <div className="bg-[#020408] border border-white/5 p-3 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 block font-bold">DEVELOPMENT NODE</span>
                    <span className="text-xs text-[#e4e4e7] font-black">7f20dbf (Active local)</span>
                  </div>
                  <span className="text-[9.5px] text-[#39ff6a] bg-[#39ff6a]/10 px-2.5 py-0.5 rounded border border-[#39ff6a]/20">
                    STABLE
                  </span>
                </div>

                {/* STAGING CELL */}
                <div className="bg-[#020408] border border-white/5 p-3 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 block font-bold">STAGING NODE</span>
                      <span className="text-xs text-zinc-200 font-black">6f9a2d1 (-1 commits drift)</span>
                    </div>
                    <span className="text-[9.5px] text-[#ffb800] bg-[#ffb800]/10 px-2.5 py-0.5 rounded border border-[#ffb800]/20 animate-pulse">
                      OUT OF SYNC
                    </span>
                  </div>
                  <button
                    type="button"
                    disabled={envLock}
                    onClick={() => {
                      triggerNotification("Promoting active developer branch to staging clusters...", "info");
                      onTriggerSound(1.3);
                    }}
                    className="w-full py-1.5 text-center text-[10px] font-black text-slate-300 hover:text-white bg-[#0d1520] hover:bg-[#141f2e] border border-white/5 rounded-lg cursor-pointer transition active:scale-95 disabled:opacity-40"
                  >
                    🚀 PROMOTE DEV TO STAGING
                  </button>
                </div>

                {/* PROD CELL */}
                <div className="bg-[#020408] border border-white/5 p-3 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 block font-bold">PRODUCTION CLOUD RUN</span>
                      <span className="text-xs text-[#ff3d71] font-black">8c4b11f (-2 commits drift)</span>
                    </div>
                    <span className="text-[9.5px] text-rose-455 text-[#ff3d71] bg-rose-950/20 px-2.5 py-0.5 rounded border border-rose-900/40">
                      DRIFT RED
                    </span>
                  </div>
                  <button
                    type="button"
                    disabled={envLock}
                    onClick={() => {
                      setNewLightBox({ perf: 98, size: '17.2 MB', latency: '150ms' });
                      triggerNotification("Dispatched production promote webhook sequence! Metrics updated.", "success");
                      onTriggerSound(1.65);
                    }}
                    className="w-full py-1.5 text-center text-[10px] font-black text-slate-300 hover:text-white bg-[#ff3d71]/10 hover:bg-[#ff3d71]/20 border border-[#ff3d71]/30 rounded-lg cursor-pointer transition active:scale-95 disabled:opacity-40"
                  >
                    🔥 FORCE COLD-PROMOTE TO LIVE
                  </button>
                </div>

              </div>
            </div>

            {/* LIGHTHOUSE QUALITY DELTA SCORE COMPARISON CARD */}
            <div className="bg-[#080d14]/95 border border-[#2e4260]/30 rounded-3xl p-5 shadow-xl relative overflow-hidden">
              <div className="bg-gradient-to-r from-zinc-800/10 via-transparent to-transparent h-1 w-full absolute top-0 left-0" />
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-zinc-300" />
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-300 font-mono">
                    Performance Quality delta
                  </h4>
                </div>
              </div>

              {/* Comparative visualization lists */}
              <div className="space-y-3 font-mono text-xs select-text">
                <div className="p-3 bg-[#020408] border border-white/5 rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-[10px] text-slate-500">
                    <span>INDEXED LIGHTHOUSE METRIC</span>
                    <span>DELTA OPTIMIZATION</span>
                  </div>

                  {/* Lighthouse Optimization Rating */}
                  <div className="flex justify-between items-center pt-1">
                    <span className="font-extrabold text-slate-350">Lighthouse Performance:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 line-through">{oldLightBox.perf}</span>
                      <span className="text-[#39ff6a] font-black">{newLightBox.perf} pts</span>
                      <span className="text-[9px] font-bold text-[#39ff6a] bg-[#39ff6a]/15 px-1 rounded">+{newLightBox.perf - oldLightBox.perf}</span>
                    </div>
                  </div>

                  {/* Bundle footprint sizes */}
                  <div className="flex justify-between items-center pt-1 border-t border-white/5">
                    <span className="font-extrabold text-slate-350">Staged Bundle footprint:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 line-through">{oldLightBox.size}</span>
                      <span className="text-[#e4e4e7] font-black">{newLightBox.size}</span>
                      <span className="text-[9px] font-bold text-[#e4e4e7] bg-[#e4e4e7]/15 px-1 rounded">-5.8MB</span>
                    </div>
                  </div>

                  {/* Latency feedback times */}
                  <div className="flex justify-between items-center pt-1 border-t border-white/5">
                    <span className="font-extrabold text-slate-350">P95 Client Latency status:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 line-through">{oldLightBox.latency}</span>
                      <span className="text-violet-405 text-zinc-300 font-extrabold">{newLightBox.latency}</span>
                      <span className="text-[9px] font-bold text-zinc-300 bg-white/5 px-1 rounded">P95 SECURE</span>
                    </div>
                  </div>
                </div>

                <div className="p-2.5 bg-[#e4e4e7]/5 border border-[#e4e4e7]/25 rounded-xl flex items-start gap-2.5 text-[9.5px]">
                  <TrendingUp className="w-4 h-4 text-[#e4e4e7] shrink-0 mt-0.5" />
                  <p className="leading-relaxed text-slate-300 font-semibold text-[#e4e4e7]/95">
                    Active build alignments have successfully reduced total AST logical cycle loads, dropping cold bootstrap speeds underneath the critical 200ms cockpit threshold.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
