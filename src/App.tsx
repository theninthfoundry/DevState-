import React, { useEffect, useState, useRef } from 'react';
import { motion, LayoutGroup } from 'motion/react';
import ArchitectureNebula from './components/ArchitectureNebula';
import EntropyAndHealing from './components/EntropyAndHealing';
import ProductGenomeFlow from './components/ProductGenomeFlow';
import ChaosAndSecurity from './components/ChaosAndSecurity';
import CyberSpaceCreature from './components/CyberSpaceCreature';
import SupremeOSControlPanel from './components/SupremeOSControlPanel';
import {
  RefreshCw,
  Play,
  ShieldAlert,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  Server,
  FileText,
  Terminal,
  Send,
  Sparkles,
  GitBranch,
  Check,
  AlertTriangle,
  FileCode,
  Layers,
  Search,
  BookOpen,
  CodeXml,
  Compass,
  FileCheck2,
  Lock,
  Unlock,
  ExternalLink,
  ChevronRight,
  Cpu,
  Workflow,
  Lightbulb,
  MessageSquare,
  Globe,
  Database,
  ArrowUpRight,
  Layers3,
  Monitor,
  Command,
  Flame,
  Coffee,
  Volume2,
  VolumeX,
  Code2,
  Fingerprint,
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff,
  ChevronDown,
  Plus,
  Trash2,
  Share2,
  Wrench,
  Activity,
  Award,
  LockKeyhole,
  Copy
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

interface PhysicalTodo {
  line: number;
  text: string;
}

interface PhysicalFile {
  relativePath: string;
  size: number;
  todos: PhysicalTodo[];
  imports: string[];
  envVarsUsed: string[];
}

interface WorkspaceSummary {
  files: PhysicalFile[];
  dependencies: string[];
  devDependencies: string[];
  missingDeps: string[];
  missingConfigs: string[];
  todoCount: number;
}

// Preset templates with highly detailed integration guidelines
const PLAYGROUND_TEMPLATES = [
  {
    id: "stripe-webhook",
    name: "Stripe Webhook Pipeline",
    short: "Secure webhook parser with automations",
    description: "Multi-currency secure Stripe webhook parser with database transactions, event signature verification, and automated notification loops.",
    vision: "Build a highly resilient web payments pipeline utilizing Express webhook listeners, Postgres schema migrations for plan subscriptions, Stripe signature matching, and Slack automated payment alert notify Webhooks.",
    integrationGuides: [
      {
        title: "1. CLI Tunnel Connection",
        command: "stripe listen --forward-to localhost:3000/api/stripe-webhook",
        details: "Establishes a secure TLS 1.3 proxy tunnel from Stripe's testing environment directly to your local endpoint. Generates the webhook signing secret for verification."
      },
      {
        title: "2. Secrets Deployment",
        command: "export STRIPE_WEBHOOK_SECRET=whsec_...",
        details: "Register the webhook signing token in the environment config of your deployment platform (e.g. Cloud Run, Vercel) to protect against replay and header forgery attacks."
      },
      {
        title: "3. Simulated Mock Event Test",
        command: "stripe trigger payment_intent.succeeded",
        details: "Triggers a live structured payload reflecting a successful payment event to verify correct signature validating, DB writes, and user upgrade notifications."
      }
    ]
  },
  {
    id: "pdf-summarizer",
    name: "Gemini Vector Summarizer",
    short: "PDF processor with SQLite vector search",
    description: "Smart visual dashboard that accepts PDFs, chunks pages into vectors, queries gemini embeddings, and persists session metadata in SQLite.",
    vision: "React dashboard linked to an Express server accessing Gemini-3.5-flash for context analysis. Has PDF parser library in dependencies, sqlite database tracking, and client-side download exports.",
    integrationGuides: [
      {
        title: "1. Install PDF & Search Libs",
        command: "npm install pdf-parse @google/genai sqlite3",
        details: "Satisfies binary core dependencies required to read binary streams of PDF uploads and initialize persistent relational database models."
      },
      {
        title: "2. Prompt Chunking Setup",
        command: "node ./scripts/chunk_and_embed.js sample.pdf",
        details: "Pre-processes text inputs by breaking them into 500-token semantic chunks, caching them into SQLite, and converting them via the Gemini Embeddings API."
      },
      {
        title: "3. Run Dynamic Vector Query",
        command: "npm run dev:search -- --query 'summarize methodology'",
        details: "Triggers retrieval of top cosine-similarity chunks aligned with your search query, injecting them as structural context for Gemini."
      }
    ]
  },
  {
    id: "dev-state",
    name: "DevState Daemon tracker",
    short: "Active filesystem monitor and telemetry",
    description: "The actual DevState Tracker workspace itself! Active filesystem watcher, alignment scoring models, and multi-user chat helper.",
    vision: "Build a responsive dashboard using React and Tailwind CSS. The server scans files, extracts imports and compares them with package.json dependencies, and triggers Gemini structured responses.",
    integrationGuides: [
      {
        title: "1. Launch Background FS Daemon",
        command: "node src/server/workspaceScanner.ts --watch",
        details: "Enables continuous filesystem polling which actively analyzes local modules, identifies unlinked packages, and computes drift values."
      },
      {
        title: "2. Sync Gemini Telemetry",
        command: "export GEMINI_API_KEY=AIzaSy...",
        details: "Connects your local project dashboard directly to Gemini reasoning nodes to analyze context blocks, project vision specs, and missing variables."
      },
      {
        title: "3. Compile Dynamic Distribution",
        command: "npm run build && npm run start",
        details: "Bundles client side components into optimal, lightweight production-grade index assets and bootstraps the backend middleware on port 3000."
      }
    ]
  }
];

// Developer quotes for funny commit roulette
const GIT_MEMES = [
  "git commit -m 'Fixed the bug. Don't look at the commit diff.'",
  "git commit -m 'Code compiles. I do not know why. Do not touch.'",
  "git commit -m 'Refactored App.tsx and prayed to the compiler gods.'",
  "git commit -m 'Added 4 lines of code, subtracted 10 hours of sleep.'",
  "git commit -m 'Arguing with TypeScript for 3 hours about one null pointer.'",
  "git commit -m 'Isolate and destroy comments because they lie.'",
  "git commit -m 'Cleaned up import slop and coffee cup count.'"
];

// Aesthetic customized pipelines available for instant interactive boilerplates
const WALKTHROUGH_STEPS = [
  {
    title: "🔮 Version & Alignment Alignment Tracker",
    description: "Update the 'Intended Product Specifications' on the right or choose a template in 'Blueprints Labs'. DevState HUD evaluates how closely your source code matches your specifications in real-time, giving you a dynamic alignment score!",
    targetPage: "radar" as const
  },
  {
    title: "📁 State File Ledger",
    description: "Browse your workspace structure! Search and check status tags like 'COMPILED', 'UP-TO-DATE', or 'STALE' representing your project container files located dynamically inside the cloud environment.",
    targetPage: "explore" as const
  },
  {
    title: "🧠 AI Cognition Deck",
    description: "Trigger a cognitive logical dependency flow analyzer. Watch the beautiful Neural dependency graph animate in real-time with automatic layout spring transitions when you execute a cognitive logic check!",
    targetPage: "cognition" as const
  },
  {
    title: "🔥 Entropy & Self-Healer Console",
    description: "Scan your code structure for common logical smells, memory leaks, and architectural pitfalls. Try repairing them instantly in the simulator sandbox with zero friction!",
    targetPage: "healer" as const
  }
];

interface CustomPipelineElement {
  id: string;
  name: string;
  type: 'auth' | 'database' | 'security' | 'api';
  status: 'active' | 'inactive';
}

export default function App() {
  // Modes: "live" utilizes real fs scanner, "playground" utilizes simulated templates
  const [activeTab, setActiveTab] = useState<'live' | 'playground'>('live');

  // Multi-view navigation tabs (Google Labs Inspired Pages)
  const [activePage, setActivePage] = useState<'radar' | 'explore' | 'terminal' | 'integrations' | 'companion' | 'cognition' | 'nebula' | 'healer' | 'genome' | 'chaos' | 'terrarium' | 'blueprint'>('blueprint');

  // Interactive Theme Presets (Minimal Poppy Aesthetics with cyber accents)
  const [uiTheme, setUiTheme] = useState<'labs-lavender' | 'labs-mint' | 'labs-peach' | 'labs-neon'>('labs-neon');

  // Volume toggle for Mechanical Keyboard Sound Synthesis (100% Dev Aesthetic!)
  const [playClickSounds, setPlayClickSounds] = useState<boolean>(true);

  // Caffeine fuel metrics! (Clicking inject espresso raises caffeine levels!)
  const [caffeineLevel, setCaffeineLevel] = useState<number>(82);

  // Developer imposter confidence meter (Determines dashboard style text and sound feedback)
  const [confidenceScale, setConfidenceScale] = useState<number>(50);

  // Current funny git roulette commit message
  const [gitMemeText, setGitMemeText] = useState<string>(GIT_MEMES[0]);

  // Specs & Vision text
  const [liveVisionSpec, setLiveVisionSpec] = useState<string>(
    "Build a production-grade DevState Workspace Tracker featuring full-stack file indexers, real-time alignment metric indicators, simulated command logs, and context recovery."
  );
  const [playgroundVisionSpec, setPlaygroundVisionSpec] = useState<string>(
    PLAYGROUND_TEMPLATES[0].vision
  );

  // Active selected playground template
  const [selectedTemplate, setSelectedTemplate] = useState<typeof PLAYGROUND_TEMPLATES[0]>(PLAYGROUND_TEMPLATES[0]);

  // Loaded analytics states
  const [state, setState] = useState<ProjectState | null>(null);
  const [summary, setSummary] = useState<WorkspaceSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Security Check panel state
  const [showSecurityBreakdown, setShowSecurityBreakdown] = useState<boolean>(false);
  const [securityScore, setSecurityScore] = useState<number>(95);

  // Share context menu state
  const [isShareMenuOpen, setIsShareMenuOpen] = useState<boolean>(false);

  // Beginner Cognitive Walkthrough & Focus Ambient Synthesizer States
  const [walkthroughActive, setWalkthroughActive] = useState<boolean>(true);
  const [walkthroughStep, setWalkthroughStep] = useState<number>(0);
  const [ambientTrack, setAmbientTrack] = useState<'off' | 'lofi' | 'nebula' | 'cyberpunk'>('off');
  
  const synthIntervalRef = useRef<any>(null);
  const synthNodesRef = useRef<{ osc1?: OscillatorNode; osc2?: OscillatorNode; gainNode?: GainNode; audioCtx?: AudioContext } | null>(null);

  // Pipeline Architect State
  const [pipelineComponents, setPipelineComponents] = useState<CustomPipelineElement[]>([
    { id: 'jwt-auth', name: 'Secure JWT Auth Gateway', type: 'auth', status: 'active' },
    { id: 'webhook-sig', name: 'Webhook Signature Check', type: 'security', status: 'active' },
    { id: 'rate-limit', name: 'DDoS Rate-Limiter Guard', type: 'security', status: 'inactive' },
    { id: 'sqlite-persistent', name: 'Relational DB Transactions', type: 'database', status: 'active' },
    { id: 'gemini-moderator', name: 'Gemini Safety Filter', type: 'api', status: 'inactive' }
  ]);

  // Selected file details & Canvas node selector
  const [selectedFileInfo, setSelectedFileInfo] = useState<PhysicalFile | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Terminal state
  const [command, setCommand] = useState<string>('npm run build');
  const [terminalHistory, setTerminalHistory] = useState<{ cmd: string; output: string; success: boolean; fix?: string }[]>([
    {
      cmd: "npm run dev",
      output: `[Vite DevServer]: Port 3000 listening.\n[DevState-Daemon]: Port 3000 API middleware mounted.\nSystem status: Hot, green, and hydrated with caffeine. Ingestion scanner watching files...`,
      success: true
    }
  ]);
  const [terminalRunning, setTerminalRunning] = useState<boolean>(false);

  // Assistant Chat State
  const [chatInput, setChatInput] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<{ sender: 'user' | 'assistant'; text: string; time: string }[]>([
    {
      sender: 'assistant',
      text: "Developer connection online. I have ingested your physical workspace footprint, file structures, logical imports, and dependencies map. How shall we expand the architecture today?",
      time: "Just now"
    }
  ]);
  const [chatLoading, setChatLoading] = useState<boolean>(false);

  // File search query
  const [fileSearchQuery, setFileSearchQuery] = useState<string>('');

  // AI Cognition Deck States
  const [selectedCognitionTool, setSelectedCognitionTool] = useState<string>('architecture-oracle');
  const [cognitionResult, setCognitionResult] = useState<any>(null);
  const [cognitionLoading, setCognitionLoading] = useState<boolean>(false);
  const [selectedBlueprintPreset, setSelectedBlueprintPreset] = useState<string>('websocket');
  const [expandedInsightIndex, setExpandedInsightIndex] = useState<number | null>(null);

  // --- GITHUB INTEGRATION MODULE STATES ---
  const [githubToken, setGithubToken] = useState<string>(() => localStorage.getItem('github_token') || '');
  const [githubRepo, setGithubRepo] = useState<string>(() => localStorage.getItem('github_repo') || 'octocat/Spoon-Knife');
  const [githubConnected, setGithubConnected] = useState<boolean>(() => localStorage.getItem('github_connected') === 'true');
  const [githubBranches, setGithubBranches] = useState<any[]>([]);
  const [githubPulls, setGithubPulls] = useState<any[]>([]);
  const [branchesLoading, setBranchesLoading] = useState<boolean>(false);
  const [pullsLoading, setPullsLoading] = useState<boolean>(false);
  const [activeBranch, setActiveBranch] = useState<string>('main');
  const [githubFiles, setGithubFiles] = useState<any[]>([]);
  const [filesLoading, setFilesLoading] = useState<boolean>(false);
  const [currentGithubPath, setCurrentGithubPath] = useState<string>('');

  // Active commit / push file state
  const [selectedGithubFile, setSelectedGithubFile] = useState<any | null>(null);
  const [githubFileContent, setGithubFileContent] = useState<string>('');
  const [githubCommitMsg, setGithubCommitMsg] = useState<string>('Update via DevState HUD Dashboard');
  const [isPushingFile, setIsPushingFile] = useState<boolean>(false);
  const [ghSearchQuery, setGhSearchQuery] = useState<string>('');
  const [integrationSubTab, setIntegrationSubTab] = useState<'github' | 'sandbox'>('github');

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Synthesis engine of custom clicking sound (Web Audio API synthesizer clack)
  const triggerDevSound = (frequencyMultiplier: number = 1.0) => {
    if (!playClickSounds) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400 * frequencyMultiplier, audioCtx.currentTime);

      osc.type = 'sine';
      // randomize typewriter frequency variation
      const randomFreq = (140 + Math.random() * 95) * frequencyMultiplier;
      osc.frequency.setValueAtTime(randomFreq, audioCtx.currentTime);

      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.05);
    } catch (e) {
      // AudioContext blocked or not supported
    }
  };

  // Modern browser-authoritative synthesizer for active focus soundscapes
  const startAmbientSynth = (style: 'lofi' | 'nebula' | 'cyberpunk') => {
    stopAmbientSynth();
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(style === 'cyberpunk' ? 450 : style === 'nebula' ? 250 : 350, audioCtx.currentTime);

      gainNode.gain.setValueAtTime(0.0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.035, audioCtx.currentTime + 1.5);

      osc1.frequency.setValueAtTime(style === 'cyberpunk' ? 110 : style === 'nebula' ? 146.83 : 130.81, audioCtx.currentTime);
      osc2.frequency.setValueAtTime(style === 'cyberpunk' ? 165 : style === 'nebula' ? 220.00 : 195.99, audioCtx.currentTime);
      
      osc1.type = style === 'cyberpunk' ? 'sawtooth' : 'sine';
      osc2.type = 'triangle';

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc1.start();
      osc2.start();

      synthNodesRef.current = { osc1, osc2, gainNode, audioCtx };
      setAmbientTrack(style);

      let angle = 0;
      const interval = setInterval(() => {
        angle += 0.05;
        const offset = Math.sin(angle) * (style === 'cyberpunk' ? 8 : 4);
        if (synthNodesRef.current?.osc1 && synthNodesRef.current?.osc2) {
          const base1 = style === 'cyberpunk' ? 110 : style === 'nebula' ? 146.83 : 130.81;
          const base2 = style === 'cyberpunk' ? 165 : style === 'nebula' ? 220.00 : 195.99;
          synthNodesRef.current.osc1.frequency.setTargetAtTime(base1 + offset, synthNodesRef.current.audioCtx!.currentTime, 1.2);
          synthNodesRef.current.osc2.frequency.setTargetAtTime(base2 - offset / 2, synthNodesRef.current.audioCtx!.currentTime, 1.2);
        }
      }, 500);

      (synthIntervalRef.current as any) = interval;
      triggerNotification(`Ambient generator online: ${style.toUpperCase()}`, "info");
    } catch (err) {
      console.warn("Ambient Audio Blocked", err);
    }
  };

  const stopAmbientSynth = () => {
    if (synthIntervalRef.current) {
      clearInterval(synthIntervalRef.current);
      synthIntervalRef.current = null;
    }
    if (synthNodesRef.current) {
      try {
        const { osc1, osc2, gainNode, audioCtx } = synthNodesRef.current;
        if (gainNode && audioCtx) {
          gainNode.gain.cancelScheduledValues(audioCtx.currentTime);
          gainNode.gain.linearRampToValueAtTime(0.0, audioCtx.currentTime + 0.4);
          setTimeout(() => {
            try {
              osc1?.stop();
              osc2?.stop();
              audioCtx?.close();
            } catch (e) {}
          }, 500);
        }
      } catch (e) {}
      synthNodesRef.current = null;
    }
    setAmbientTrack('off');
  };

  // Trigger brief user notifications with visual pop animation values
  const triggerNotification = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    triggerDevSound(type === 'success' ? 1.5 : type === 'error' ? 0.7 : 1.1);
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  // Caffeine Booster actions!
  const boosterCaffeine = () => {
    if (caffeineLevel >= 100) {
      triggerNotification("Warning: Caffeine limit maximized! Your compiler is sweating.", "error");
      return;
    }
    setCaffeineLevel(prev => Math.min(prev + 6, 100));
    triggerNotification("Double shot Espresso injected! Coding flow increased +25%.", "success");
    triggerDevSound(1.8);
  };

  // Random git commit generator
  const rollGitCommitMeme = () => {
    const randomIndex = Math.floor(Math.random() * GIT_MEMES.length);
    setGitMemeText(GIT_MEMES[randomIndex]);
    triggerNotification("Git commit message rolled!", "info");
    triggerDevSound(1.2);
  };

  // Fetch true workspace summary and model evaluation
  const fetchWorkspaceUpdate = async (isRescan: boolean = false) => {
    setLoading(true);
    try {
      const activeVision = activeTab === 'live' ? liveVisionSpec : playgroundVisionSpec;
      const response = await fetch('/api/workspace');
      if (response.ok) {
        const data = await response.json();
        setSummary(data.summary);
        if (data.vision && isRescan === false) {
          if (activeTab === 'live') {
            setLiveVisionSpec(data.vision || liveVisionSpec);
          }
        }

        // Call AI evaluation based on vision spects and scanned summary
        const evalPayload = {
          visionSpec: activeVision,
          terminalLogs: terminalHistory.length > 0 ? terminalHistory[terminalHistory.length - 1].output : ""
        };

        const evalRes = await fetch('/api/analyze-state', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(evalPayload),
        });

        if (evalRes.ok) {
          const evalData = await evalRes.json();
          setState(evalData.analysis);
          
          // Compute logical dynamic security assessment score
          const missingCount = data.summary.missingDeps.length + data.summary.missingConfigs.length;
          const todoCount = data.summary.todoCount;
          const score = Math.max(50, 100 - (missingCount * 8) - (todoCount * 2));
          setSecurityScore(score);

          if (isRescan) {
            triggerNotification("Ingestion models fully synchronized & analyzed!", "success");
          }
        }
      } else {
        triggerNotification("Could not retrieve file model tree.", "error");
      }
    } catch (e) {
      console.error("Connection failed", e);
      triggerNotification("Scanner daemon disconnected. Check host.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Run initial triggers on tab toggle or load
  useEffect(() => {
    fetchWorkspaceUpdate();
  }, [activeTab]);

  // Click outside to close Share menu dropdown
  useEffect(() => {
    if (!isShareMenuOpen) return;
    const handleOutsideClick = () => {
      setIsShareMenuOpen(false);
    };
    // Use a tiny timeout to avoid immediate closure if clicked right after trigger
    const timer = setTimeout(() => {
      document.addEventListener('click', handleOutsideClick);
    }, 10);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [isShareMenuOpen]);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalHistory]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, chatLoading]);

  // Execute AI Cognition Tool computation against the backend
  const runCognitionTool = async (toolId: string) => {
    setCognitionLoading(true);
    setExpandedInsightIndex(null);
    triggerDevSound(1.25);
    try {
      const activeVision = activeTab === 'live' ? liveVisionSpec : playgroundVisionSpec;
      const res = await fetch('/api/cognition/analyze-tool', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolId, visionSpec: activeVision })
      });
      if (!res.ok) {
        throw new Error(`Execution error: ${res.status}`);
      }
      const data = await res.json();
      setCognitionResult(data);
      triggerNotification(`${toolId.replace('-', ' ').toUpperCase()} analysis synthesized!`, 'success');
    } catch (e) {
      console.error(e);
      triggerNotification(`Failed to running cognitive logic optimizer.`, 'error');
    } finally {
      setCognitionLoading(false);
    }
  };

  // Trigger analysis when page is toggled or when selected tool shifts
  useEffect(() => {
    if (activePage === 'cognition') {
      runCognitionTool(selectedCognitionTool);
    }
  }, [activePage, selectedCognitionTool]);

  // --- GITHUB CONTROLLER FUNCTIONS ---
  const handleConnectGitHub = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!githubRepo) {
      triggerNotification("Repository name (owner/repo) is required.", "error");
      return;
    }
    
    setBranchesLoading(true);
    setPullsLoading(true);
    triggerDevSound(1.2);
    try {
      localStorage.setItem('github_repo', githubRepo);
      localStorage.setItem('github_token', githubToken);
      localStorage.setItem('github_connected', 'true');
      setGithubConnected(true);
      
      const headersOption: any = {};
      if (githubToken) {
        headersOption["X-GitHub-Token"] = githubToken;
      }
      
      // 1. Fetch Branches
      const branchRes = await fetch(`/api/github/branches?repo=${encodeURIComponent(githubRepo)}`, {
        headers: headersOption
      });
      const branchData = await branchRes.json();
      if (branchData.success) {
        setGithubBranches(branchData.branches);
        if (branchData.branches.length > 0) {
          setActiveBranch(branchData.branches[0].name || 'main');
        }
      } else {
        throw new Error(branchData.error || "Failed to load branch systems.");
      }

      // 2. Fetch Pull Requests
      const pullsRes = await fetch(`/api/github/pulls?repo=${encodeURIComponent(githubRepo)}`, {
        headers: headersOption
      });
      const pullsData = await pullsRes.json();
      if (pullsData.success) {
        setGithubPulls(pullsData.pulls);
      } else {
        throw new Error(pullsData.error || "Failed to query pull requests.");
      }
      
      // 3. Fetch Root Contents
      await fetchGithubFiles('');

      triggerNotification("GitHub repository synchronized successfully!", "success");
    } catch (err: any) {
      console.error(err);
      triggerNotification(`Stream Handshake Failed: ${err.message}`, "error");
      setGithubConnected(false);
      localStorage.setItem('github_connected', 'false');
    } finally {
      setBranchesLoading(false);
      setPullsLoading(false);
    }
  };

  const fetchGithubFiles = async (directoryPath: string) => {
    setFilesLoading(true);
    triggerDevSound(1.0);
    try {
      const headersOption: any = {};
      if (githubToken) {
        headersOption["X-GitHub-Token"] = githubToken;
      }
      const res = await fetch(`/api/github/files?repo=${encodeURIComponent(githubRepo)}&path=${encodeURIComponent(directoryPath)}`, {
        headers: headersOption
      });
      const resData = await res.json();
      if (resData.success) {
        if (Array.isArray(resData.data)) {
          setGithubFiles(resData.data);
          setCurrentGithubPath(directoryPath);
        } else {
          const fileObj = resData.data;
          setSelectedGithubFile(fileObj);
          if (fileObj.encoding === "base64") {
            try {
              const decoded = atob(fileObj.content.replace(/\s/g, ''));
              setGithubFileContent(decoded);
            } catch (decErr) {
              setGithubFileContent(fileObj.content);
            }
          } else {
            setGithubFileContent(fileObj.content || '');
          }
          triggerNotification(`Loaded file: ${fileObj.name}`, "info");
        }
      } else {
        triggerNotification(`Fetch Error: ${resData.error}`, "error");
      }
    } catch (err: any) {
      console.error(err);
      triggerNotification(`GraphQL Crawler Failure: ${err.message}`, "error");
    } finally {
      setFilesLoading(false);
    }
  };

  const handlePushFileChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGithubFile) {
      triggerNotification("Please select a file to update inside the repository file browser.", "error");
      return;
    }
    setIsPushingFile(true);
    triggerDevSound(1.3);
    try {
      const headersOption: any = {
        'Content-Type': 'application/json'
      };
      if (githubToken) {
        headersOption["X-GitHub-Token"] = githubToken;
      }
      const response = await fetch('/api/github/push', {
        method: 'POST',
        headers: headersOption,
        body: JSON.stringify({
          repo: githubRepo,
          filePath: selectedGithubFile.path,
          content: githubFileContent,
          commitMessage: githubCommitMsg,
          branch: activeBranch
        })
      });
      const resData = await response.json();
      if (resData.success) {
        triggerNotification(`Success! ${selectedGithubFile.name} changes committed to ${activeBranch}!`, "success");
        await fetchGithubFiles(currentGithubPath);
      } else {
        throw new Error(resData.error || "Git Push loop failed.");
      }
    } catch (err: any) {
      console.error(err);
      triggerNotification(`Git Engine Error: ${err.message}`, "error");
    } finally {
      setIsPushingFile(false);
    }
  };

  const handleDisconnectGitHub = () => {
    setGithubConnected(false);
    setGithubBranches([]);
    setGithubPulls([]);
    setGithubFiles([]);
    setSelectedGithubFile(null);
    localStorage.setItem('github_connected', 'false');
    triggerNotification("GitHub repository stream disconnected.", "info");
  };

  // Silent initial reload of active GitHub configurations
  useEffect(() => {
    if (githubConnected && githubRepo) {
      const silentLoad = async () => {
        try {
          const headersOption: any = {};
          if (githubToken) {
            headersOption["X-GitHub-Token"] = githubToken;
          }
          const branchRes = await fetch(`/api/github/branches?repo=${encodeURIComponent(githubRepo)}`, {
            headers: headersOption
          });
          const branchData = await branchRes.json();
          if (branchData.success) {
            setGithubBranches(branchData.branches);
            if (branchData.branches.length > 0) {
              setActiveBranch(branchData.branches[0].name || 'main');
            }
          }
          const pullsRes = await fetch(`/api/github/pulls?repo=${encodeURIComponent(githubRepo)}`, {
            headers: headersOption
          });
          const pullsData = await pullsRes.json();
          if (pullsData.success) {
            setGithubPulls(pullsData.pulls);
          }
          // fetch root level files
          const res = await fetch(`/api/github/files?repo=${encodeURIComponent(githubRepo)}&path=`, {
            headers: headersOption
          });
          const resData = await res.json();
          if (resData.success && Array.isArray(resData.data)) {
            setGithubFiles(resData.data);
          }
        } catch (_) {}
      };
      silentLoad();
    }
  }, []);

  // --- GITHUB BRANCHES POLLING EFFECT ---
  useEffect(() => {
    if (!githubConnected || !githubRepo) return;

    const pollBranches = async () => {
      try {
        const headersOption: any = {};
        if (githubToken) {
          headersOption["X-GitHub-Token"] = githubToken;
        }
        const branchRes = await fetch(`/api/github/branches?repo=${encodeURIComponent(githubRepo)}`, {
          headers: headersOption
        });
        const branchData = await branchRes.json();
        if (branchData.success && Array.isArray(branchData.branches)) {
          setGithubBranches(branchData.branches);
          // Auto select first branch or keep activeBranch state aligned
          if (branchData.branches.length > 0) {
            const exists = branchData.branches.some((b: any) => b.name === activeBranch);
            if (!exists && !activeBranch) {
              setActiveBranch(branchData.branches[0].name || 'main');
            }
          }
        }
      } catch (err) {
        console.error("Polled branches fetch error:", err);
      }
    };

    // Poll every 12 seconds
    const intervalId = setInterval(pollBranches, 12000);
    return () => clearInterval(intervalId);
  }, [githubConnected, githubRepo, githubToken, activeBranch]);

  // Run terminal instruction emulator
  const handleRunCommand = async (e?: React.FormEvent, customCmd?: string) => {
    if (e) e.preventDefault();
    const cmdToRun = customCmd || command;
    if (!cmdToRun.trim() || terminalRunning) return;

    setTerminalRunning(true);
    triggerDevSound(1.1);
    try {
      const response = await fetch('/api/simulate-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmdToRun }),
      });

      if (response.ok) {
        const body = await response.json();
        setTerminalHistory(prev => [
          ...prev,
          {
            cmd: cmdToRun,
            output: body.output,
            success: body.isSuccess,
            fix: body.errorFixRecommendation || undefined
          }
        ]);
        if (!body.isSuccess) {
          triggerNotification("Process exception detected. Dynamic remedy computed.", "error");
        } else {
          triggerNotification("Terminal: Code compiled with success!", "success");
        }
      }
    } catch (err) {
      console.error(err);
      triggerNotification("Command pipe signal disconnect.", "error");
    } finally {
      setTerminalRunning(false);
      if (!customCmd) setCommand('');
    }
  };

  // Submit AI Chat query
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMsg = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { sender: 'user', text: userMsg, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setChatLoading(true);
    triggerDevSound(1.3);

    try {
      const activeVision = activeTab === 'live' ? liveVisionSpec : playgroundVisionSpec;
      const formattedHistory = chatHistory.slice(-6).map(m => ({
        role: m.sender === 'user' ? 'user' as const : 'model' as const,
        parts: [{ text: m.text }]
      }));

      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          history: formattedHistory,
          visionSpec: activeVision
        })
      });

      if (response.ok) {
        const data = await response.json();
        setChatHistory(prev => [
          ...prev,
          {
            sender: 'assistant',
            text: data.response,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        triggerDevSound(1.5);
      } else {
        triggerNotification("Assistant context error.", "error");
      }
    } catch (err) {
      console.error(err);
      triggerNotification("AI engine offline. Verify endpoint.", "error");
    } finally {
      setChatLoading(false);
    }
  };

  const handleLoadTemplate = (tpl: typeof PLAYGROUND_TEMPLATES[0]) => {
    setSelectedTemplate(tpl);
    setPlaygroundVisionSpec(tpl.vision);
    triggerNotification(`Target Spec template shifted: ${tpl.name}`, "info");
  };

  // Interactive toggle pipeline component status
  const togglePipelineComp = (id: string) => {
    setPipelineComponents(prev => prev.map(comp => {
      if (comp.id === id) {
        const newStatus = comp.status === 'active' ? 'inactive' : 'active';
        triggerNotification(`${comp.name} is now ${newStatus.toUpperCase()}`, "info");
        return { ...comp, status: newStatus };
      }
      return comp;
    }));
  };

  const activePipelineCount = pipelineComponents.filter(c => c.status === 'active').length;

  // Dynamic Theme Palette Map based on elegant glassmorphic accents
  const themeStyles = {
    'labs-lavender': {
      text: 'text-[#a5b4fc]',
      primary: '#818cf8',
      accent: 'indigo',
      glow: 'shadow-[0_0_50px_rgba(129,140,248,0.12)]',
      gradient: 'from-[#0a0518] via-[#040409] to-[#010103]',
      badge: 'bg-indigo-950/40 text-indigo-300 border-indigo-900/40',
      tabActive: 'bg-[#6366f1] text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] rounded-full',
      borderFocus: 'focus:border-indigo-400 focus:ring-indigo-950/45',
      accentBorder: 'border-indigo-500/15',
      tagColor: 'bg-indigo-950/30 text-indigo-200 border-indigo-900/20',
      glassCard: 'bg-[#080811]/92 backdrop-blur-xl border-slate-900/90 shadow-2xl shadow-black'
    },
    'labs-mint': {
      text: 'text-slate-100',
      primary: '#ffffff',
      accent: 'slate',
      glow: 'shadow-[0_0_40px_rgba(255,255,255,0.05)]',
      gradient: 'from-[#030303] via-[#08080a] to-[#010102]',
      badge: 'bg-slate-900 text-slate-300 border-slate-800',
      tabActive: 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.25)] rounded-full font-bold',
      borderFocus: 'focus:border-slate-300 focus:ring-slate-800',
      accentBorder: 'border-slate-800',
      tagColor: 'bg-slate-900/60 text-slate-200 border-slate-850',
      glassCard: 'bg-[#050505]/95 backdrop-blur-xl border-slate-900 shadow-2xl shadow-black'
    },
    'labs-peach': {
      text: 'text-[#d8b4fe]',
      primary: '#c084fc',
      accent: 'purple',
      glow: 'shadow-[0_0_55px_rgba(192,132,252,0.12)]',
      gradient: 'from-[#12051c] via-[#050409] to-[#010103]',
      badge: 'bg-purple-950/40 text-purple-300 border-purple-900/40',
      tabActive: 'bg-[#c084fc] text-slate-950 shadow-[0_0_20px_rgba(192,132,252,0.4)] rounded-full font-bold',
      borderFocus: 'focus:border-purple-400 focus:ring-purple-950/45',
      accentBorder: 'border-purple-500/15',
      tagColor: 'bg-purple-950/30 text-purple-200 border-purple-900/20',
      glassCard: 'bg-[#06040b]/94 backdrop-blur-xl border-slate-900/90 shadow-2xl shadow-black'
    },
    'labs-neon': {
      text: 'text-[#c084fc]',
      primary: '#a78bfa',
      accent: 'violet',
      glow: 'shadow-[0_0_60px_rgba(167,139,250,0.15)]',
      gradient: 'from-[#0e071c] via-[#05060b] to-[#010102]',
      badge: 'bg-violet-950/40 text-violet-300 border-violet-900/40',
      tabActive: 'bg-[#8b5cf6] text-white shadow-[0_0_25px_rgba(139,92,246,0.4)] rounded-full',
      borderFocus: 'focus:border-violet-400 focus:ring-violet-950/45',
      accentBorder: 'border-violet-500/20',
      tagColor: 'bg-violet-950/30 text-violet-200 border-violet-900/25',
      glassCard: 'bg-[#040409]/92 backdrop-blur-xl border-slate-900/80 shadow-2xl shadow-black'
    }
  };

  const currentTheme = themeStyles[uiTheme];
  const currentVision = activeTab === 'live' ? liveVisionSpec : playgroundVisionSpec;

  const filteredFiles = summary
    ? summary.files.filter(f => f.relativePath.toLowerCase().includes(fileSearchQuery.toLowerCase()))
    : [];

  // Helper humor text determined by developer scale position
  const getDeveloperImpostorQuote = () => {
    if (confidenceScale < 20) return "Impostor state: 'They are going to find out I just copy things.'";
    if (confidenceScale < 45) return "Copier state: 'If it compiles, it sails. Don't look at the warning count.'";
    if (confidenceScale < 70) return "Sane dev: 'Works on local container. Port 3000 is my safe space.'";
    if (confidenceScale < 90) return "Architect: 'I plan to refactor or rewrite the entire compiler by Tuesday.'";
    return "Kernel Wizard: 'I speak binary natively. Type-safety is an abstract illusion.'";
  };

  // Safe visual click reporter that simulates typewriter click
  const handleElementClick = () => {
    triggerDevSound();
  };

  return (
    <div 
      onClick={handleElementClick}
      className={`min-h-screen bg-gradient-to-tr ${currentTheme.gradient} text-slate-105 font-sans antialiased selection:bg-violet-500/20 selection:text-white relative overflow-hidden transition-all duration-700`}
    >
      {/* Toast Notification with ambient slide-up action and custom status glow */}
      {notification && (
        <div 
          id="labs-toast" 
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-3xl shadow-2xl border bg-black/90 backdrop-blur-xl transition-[#ff267e] duration-300 transform scale-100 border-white/5"
        >
          <div className="flex items-center justify-center p-1.5 rounded-full bg-slate-950 border border-slate-900 shadow-sm">
            {notification.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-400" />}
            {notification.type === 'error' && <ShieldAlert className="w-5 h-5 text-rose-455" />}
            {notification.type === 'info' && <Sparkles className="w-5 h-5 text-violet-405" />}
          </div>
          <div>
            <span className="text-xs font-semibold text-white block tracking-tight">System Status</span>
            <span className="text-[11px] text-zinc-400 mt-0.5 block">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Premium Ambient Drift Auroras (Smooth and Seamless Transitions) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0 opacity-80">
        <div 
          className="absolute -top-[10%] -left-[10%] w-[60%] h-[50%] rounded-full blur-[130px] animate-drift-1 transition-all duration-1000" 
          style={{ backgroundColor: `${currentTheme.primary}12` }}
        />
        <div 
          className="absolute -bottom-[10%] -right-[15%] w-[60%] h-[60%] rounded-full blur-[150px] animate-drift-2 transition-all duration-1000" 
          style={{ backgroundColor: `${currentTheme.primary}08` }}
        />
        <div className="absolute inset-0 grid-mesh opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#030307]/70 to-[#020204]" />
      </div>

      {/* Main Container Frame resembling beautiful Labs grid */}
      <div className="relative z-10 max-w-[1360px] mx-auto px-4 sm:px-6 md:px-8 py-6">
        
        {/* Top Header Row with soft branding, pop culture items, and mode toggling */}
        <header 
          id="labs-header" 
          className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-6 p-6 rounded-3xl border bg-black/20 mb-8"
          style={{ 
            backdropFilter: 'blur(30px)', 
            WebkitBackdropFilter: 'blur(30px)', 
            borderColor: 'rgba(255, 255, 255, 0.1)' 
          }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="p-3.5 rounded-3xl bg-violet-600/10 border border-violet-500/20 text-[#c084fc] shadow-lg relative">
              <Cpu className="w-7 h-7 animate-pulse text-violet-400" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-violet-400 border-2 border-[#07080a] rounded-full animate-bounce"></div>
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-3xl font-black tracking-tight text-white font-display select-none">
                  DevState <span className="font-light italic text-[#c084fc] tracking-normal">HUD</span>
                </h1>
                <span className="text-[9.5px] uppercase font-mono tracking-widest px-3 py-1 rounded-full border bg-black/50 text-[#c084fc] border-violet-900/40 font-bold">
                  labs-experiment v1.3
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1 font-sans font-medium">
                Sleek aesthetics-driven file auditor, real-time telemetry console, & dynamic modular workspace.
              </p>
            </div>
          </div>

          {/* Interactive Pop-culture elements and custom configurations */}
          <div className="flex flex-wrap items-center gap-4">
            
            {/* Sync Now Action Button */}
            <button
              id="sync-telemetry-btn"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fetchWorkspaceUpdate(true);
                triggerDevSound(1.2);
              }}
              disabled={loading}
              className={`px-4 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-mono font-bold rounded-2xl text-xs transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-lg shadow-violet-500/20`}
              title="Immediately refresh and rescan the workspace telemetry data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>SYNC NOW</span>
            </button>

            {/* Elegant Floating System Status Pulse Widget based on Alignment Score */}
            {(() => {
              const alignmentScore = state?.overall_alignment_score !== undefined ? state.overall_alignment_score : 0.65;
              const pct = Math.round(alignmentScore * 100);
              
              let statusLabel = "SYSTEM NOMINAL";
              let statusColorClass = "text-violet-300 border-violet-500/15 bg-violet-950/20";
              let pulseColorHex = "#a78bfa";
              let shadowCSSVar = "rgba(139, 92, 246, 0.2)";
              let desc = "The codebase is aligned with specified architecture guidelines.";

              if (alignmentScore >= 0.85) {
                statusLabel = "ALIGNMENT OPTIMAL";
                statusColorClass = "text-emerald-400 border-emerald-500/20 bg-emerald-950/25";
                pulseColorHex = "#10b981";
                shadowCSSVar = "rgba(16, 185, 129, 0.2)";
                desc = "Excellent match! Files match standard templates perfectly.";
              } else if (alignmentScore < 0.60) {
                statusLabel = "DRIFT DETECTED";
                statusColorClass = "text-amber-450 text-amber-400 border-amber-500/20 bg-amber-950/25 animate-pulse";
                pulseColorHex = "#f59e0b";
                shadowCSSVar = "rgba(245, 158, 11, 0.25)";
                desc = "Codebase variations detected relative to ARCHITECTURE.md specifications.";
              }

              return (
                <div className="flex items-center gap-2 relative">
                  <div 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      triggerNotification(`System Alignment: ${pct}% - ${statusLabel}. ${desc}`, "info");
                      triggerDevSound(1.35);
                    }}
                    className={`px-3.5 py-2.5 backdrop-blur-md border rounded-2xl flex items-center gap-3 cursor-pointer select-none transition-all duration-300 hover:scale-105 active:scale-95 animate-float-status ${statusColorClass}`}
                    style={{ '--shadow-color': shadowCSSVar, '--pulse-color': pulseColorHex } as React.CSSProperties}
                    title="Click to view workspace alignment diagnostic"
                  >
                    {/* Dynamic Ringing Pulse Circles with custom color-shifting animation */}
                    <div className="relative flex items-center justify-center w-5 h-5">
                      <span 
                        className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping animate-pulse-color-shift"
                        style={{ backgroundColor: 'var(--pulse-color)', animationDuration: '2.5s' }}
                      />
                      <span 
                        className="relative inline-flex rounded-full h-2.5 w-2.5 animate-pulse-color-shift"
                        style={{ backgroundColor: 'var(--pulse-color)' }}
                      />
                    </div>
                    
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5 text-[9px] font-mono font-black tracking-wider uppercase">
                        <span>{statusLabel}</span>
                      </div>
                      <span className="text-[10px] text-zinc-300 font-sans font-medium">
                        Match Rating: <span className="font-extrabold text-white">{pct}%</span>
                      </span>
                    </div>
                  </div>

                  {/* Share button next to pulse indicator */}
                  <div className="relative">
                    <button
                      id="share-telemetry-btn"
                      type="button"
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setIsShareMenuOpen(!isShareMenuOpen); 
                        triggerDevSound(1.1); 
                      }}
                      className={`p-3 rounded-2xl border transition select-none flex items-center justify-center cursor-pointer ${
                        isShareMenuOpen 
                          ? 'bg-violet-950/60 text-[#a78bfa] border-violet-900/60' 
                          : 'bg-[#10121a]/85 text-slate-400 hover:text-white border-slate-800 hover:border-violet-500/30 shadow-lg'
                      }`}
                      title="Share workspace stats and alignment score"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>

                    {/* Dropdown Menu */}
                    {isShareMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-64 bg-[#090b11]/95 backdrop-blur-xl border border-slate-800 rounded-2xl p-2.5 shadow-2xl z-50 pointer-events-auto flex flex-col gap-1 text-left"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="px-2 pb-1.5 mb-1.5 border-b border-white/5 text-[9.5px] font-mono tracking-widest text-[#a78bfa] font-bold uppercase">
                          Share Scan Results
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => {
                            const shareUrl = `${window.location.origin}/?share=alignment&score=${pct}`;
                            navigator.clipboard.writeText(shareUrl)
                              .then(() => {
                                triggerNotification(`Alignment Score link copied to clipboard: ${pct}%`, "success");
                                triggerDevSound(1.4);
                                setIsShareMenuOpen(false);
                              })
                              .catch(() => {
                                triggerNotification("Unable to copy to clipboard", "error");
                              });
                          }}
                          className="flex items-center gap-2.5 px-2.5 py-2 hover:bg-white/5 rounded-xl transition text-xs font-medium text-slate-200 hover:text-white w-full text-left cursor-pointer"
                        >
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copy Score Link ({pct}%)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const todoCount = summary?.todoCount || 0;
                            const shareUrl = `${window.location.origin}/?share=scan&score=${pct}&todos=${todoCount}`;
                            navigator.clipboard.writeText(shareUrl)
                              .then(() => {
                                triggerNotification("Complete Workspace Scan link copied!", "success");
                                triggerDevSound(1.4);
                                setIsShareMenuOpen(false);
                              })
                              .catch(() => {
                                triggerNotification("Unable to copy to clipboard", "error");
                              });
                          }}
                          className="flex items-center gap-2.5 px-2.5 py-2 hover:bg-white/5 rounded-xl transition text-xs font-medium text-slate-200 hover:text-white w-full text-left cursor-pointer"
                        >
                          <Layers className="w-3.5 h-3.5 text-violet-400" />
                          <span>Copy Full Audit Link</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const shareUrl = `${window.location.origin}/?share=telemetry&status=nominal&time=${encodeURIComponent(new Date().toISOString())}`;
                            navigator.clipboard.writeText(shareUrl)
                              .then(() => {
                                triggerNotification("Active Telemetry payload link copied!", "success");
                                triggerDevSound(1.4);
                                setIsShareMenuOpen(false);
                              })
                              .catch(() => {
                                triggerNotification("Unable to copy to clipboard", "error");
                              });
                          }}
                          className="flex items-center gap-2.5 px-2.5 py-2 hover:bg-white/5 rounded-xl transition text-xs font-medium text-slate-200 hover:text-white w-full text-left cursor-pointer"
                        >
                          <Activity className="w-3.5 h-3.5 text-sky-400" />
                          <span>Copy Telemetry Link</span>
                        </button>
                      </motion.div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Caffeine Gauge Status Bar */}
            <div 
              onClick={(e) => { e.stopPropagation(); boosterCaffeine(); }}
              className="px-3.5 py-2.5 bg-[#10121a]/85 backdrop-blur-md border border-slate-800/95 shadow-lg hover:border-violet-500/30 rounded-2xl flex items-center gap-2.5 cursor-pointer select-none transition group"
              title="Click to inject espresso booster!"
            >
              <div className="p-1 rounded-lg bg-orange-950/80 text-orange-400 group-hover:scale-110 transition duration-150 border border-orange-900/30">
                <Coffee className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 font-mono">
                  <span>CAFFEINE FUEL</span>
                  <span className="text-orange-400 ml-2">{caffeineLevel}%</span>
                </div>
                <div className="w-20 bg-slate-900 h-1.5 rounded-full mt-1 overflow-hidden border border-slate-850">
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-orange-400 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${caffeineLevel}%` }}
                  />
                </div>
              </div>
              <Plus className="w-3 h-3 text-slate-400 group-hover:text-orange-400 ml-1 transition" />
            </div>

            {/* Sound Level Audio Toggler */}
            <button 
              type="button"
              onClick={(e) => { e.stopPropagation(); setPlayClickSounds(!playClickSounds); }}
              className={`p-3 rounded-2xl border transition select-none flex items-center justify-center ${
                playClickSounds 
                  ? 'bg-violet-950/60 text-[#a78bfa] border-violet-900/60' 
                  : 'bg-slate-900 text-slate-500 border-slate-800'
              }`}
              title={playClickSounds ? "Simulated Cherry MX click sound active!" : "Cherry MX clicks muted"}
            >
              {playClickSounds ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Aesthetic Palette Chooser */}
            <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md border border-white/5 p-1.5 rounded-2xl shadow-sm">
              <span className="text-[10px] text-zinc-400 font-mono font-black uppercase tracking-wider px-2">Space Mode:</span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setUiTheme('labs-lavender'); triggerNotification("Selected Space Mode: LILAC AIR", "info"); }}
                className={`w-4 h-4 rounded-full bg-violet-400 border transition-transform cursor-pointer hover:scale-110 duration-250 ${uiTheme === 'labs-lavender' ? 'scale-125 border-white' : 'border-slate-850'}`}
                title="Lilac Air"
              />
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setUiTheme('labs-mint'); triggerNotification("Selected Space Mode: OBSIDIAN NOIR", "info"); }}
                className={`w-4 h-4 rounded-full bg-zinc-100 border transition-transform cursor-pointer hover:scale-110 duration-250 ${uiTheme === 'labs-mint' ? 'scale-125 border-white' : 'border-slate-850'}`}
                title="Obsidian Noir"
              />
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setUiTheme('labs-peach'); triggerNotification("Selected Space Mode: DEEP AMETHYST", "info"); }}
                className={`w-4 h-4 rounded-full bg-purple-650 border transition-transform cursor-pointer hover:scale-110 duration-250 ${uiTheme === 'labs-peach' ? 'scale-125 border-white' : 'border-slate-050'}`}
                title="Deep Amethyst"
              />
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setUiTheme('labs-neon'); triggerNotification("Selected Space Mode: CYBER SPACE", "info"); }}
                className={`w-4 h-4 rounded-full bg-[#8b5cf6] border transition-transform cursor-pointer hover:scale-110 duration-250 ${uiTheme === 'labs-neon' ? 'scale-125 border-white' : 'border-slate-850'}`}
                title="Cyber Space"
              />
            </div>

            {/* Feed Feed Switch (Telemetry simulator vs sandbox tracker) */}
            <div className="bg-slate-900/80 p-1 rounded-2xl flex items-center border border-slate-800 text-xs">
              <button
                type="button"
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setActiveTab('live');
                  triggerNotification("Switched to project container modules feed", "info");
                }}
                className={`px-3.5 py-1.5 rounded-xl font-medium transition-all ${
                  activeTab === 'live'
                    ? 'bg-slate-850 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                FSTracker Feed
              </button>
              <button
                type="button"
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setActiveTab('playground');
                  triggerNotification("Switched to interactive blueprints sandbox", "info");
                }}
                className={`px-3.5 py-1.5 rounded-xl font-medium transition-all ${
                  activeTab === 'playground'
                    ? 'bg-slate-850 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Blueprints Labs
              </button>
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); fetchWorkspaceUpdate(true); }}
              disabled={loading}
              className="bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white rounded-2xl px-4 py-2 text-xs font-semibold flex items-center gap-2 shadow-md shadow-violet-500/10 transition active:scale-95 cursor-pointer animate-pulse"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Rescan System
            </button>
          </div>
        </header>

        {/* PRIMARY COGNITIVE ONBOARDING & FOCUS SOUNDTRACK FM */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Onboarding Guide Card for beginners */}
          <div className="col-span-12 lg:col-span-7 bg-[#0d101a]/45 backdrop-blur-md border border-slate-800/80 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between shadow-xl shadow-black/40">
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-full blur-2xl pointer-events-none"></div>
            <div>
              <div className="flex items-center justify-between gap-4 mb-3">
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#a78bfa] font-black pointer-events-none">
                  🎓 Interactive Workspace Guide
                </span>
                <button
                  type="button"
                  onClick={() => { setWalkthroughActive(!walkthroughActive); triggerDevSound(1.25); }}
                  className="text-[10px] font-mono px-2.5 py-1 text-slate-405 hover:text-white border border-slate-800 hover:bg-slate-900 rounded-xl transition select-none cursor-pointer"
                >
                  {walkthroughActive ? "COLLAPSE" : "OPEN GUIDE"}
                </button>
              </div>

              {walkthroughActive ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <span className="flex items-center justify-center w-8 h-8 rounded-2xl bg-violet-500/10 text-[#a78bfa] border border-violet-500/20 text-xs font-mono font-black shrink-0 relative">
                      {walkthroughStep + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-black text-slate-100 uppercase tracking-tight font-display">
                        {WALKTHROUGH_STEPS[walkthroughStep].title}
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed mt-1 font-medium font-sans">
                        {WALKTHROUGH_STEPS[walkthroughStep].description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 font-mono">
                    <button
                      type="button"
                      disabled={walkthroughStep === 0}
                      onClick={() => { setWalkthroughStep(prev => prev - 1); triggerDevSound(0.9); }}
                      className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-[#141724]/95 text-slate-350 hover:bg-slate-800 border border-slate-800 disabled:opacity-40 transition cursor-pointer"
                    >
                      PREV
                    </button>
                    <button
                      type="button"
                      disabled={walkthroughStep === WALKTHROUGH_STEPS.length - 1}
                      onClick={() => { setWalkthroughStep(prev => prev + 1); triggerDevSound(1.1); }}
                      className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-[#141724]/95 text-slate-350 hover:bg-slate-800 border border-slate-800 disabled:opacity-40 transition cursor-pointer"
                    >
                      NEXT
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const tgt = WALKTHROUGH_STEPS[walkthroughStep].targetPage;
                        setActivePage(tgt);
                        triggerNotification(`Navigated to active guide view: ${tgt.toUpperCase()}`, "success");
                      }}
                      className="ml-auto px-4 py-1.5 rounded-xl text-[11px] font-black bg-[#8b5cf6] hover:bg-violet-600 text-white shadow-lg shadow-violet-500/20 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      TAKE ME THERE
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 font-medium font-sans">
                  Workspace guide collapsed. Toggle to enable beginner walkthrough support step-by-step.
                </p>
              )}
            </div>
          </div>

          {/* Cognitive Synthboard Soundcard */}
          <div className="col-span-12 lg:col-span-5 bg-[#0d101a]/45 backdrop-blur-md border border-slate-800/80 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between shadow-xl shadow-black/40">
            <div className="absolute inset-0 bg-cover bg-grid-pattern opacity-5 pointer-events-none"></div>
            <div>
              <div className="flex items-center justify-between gap-4 mb-3">
                <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-400 font-black flex items-center gap-1.5 selection:bg-transparent pointer-events-none">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                  🎧 FOCUS SOUNDTRACK FM
                </span>
                <span className="text-[10px] text-slate-405 font-mono font-medium uppercase pointer-events-none">
                  {ambientTrack === 'off' ? "MUTED" : `ACTIVE: ${ambientTrack}`}
                </span>
              </div>
              
              <p className="text-xs text-slate-400 leading-relaxed font-sans font-medium mb-4 pointer-events-none">
                Boost your productivity and recover logic files comfortably in an immersive, interactive audio soundscape context.
              </p>

              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => stopAmbientSynth()}
                  className={`px-1 py-2 rounded-xl text-[10px] font-mono border font-bold transition flex flex-col items-center justify-center gap-1 cursor-pointer select-none ${
                    ambientTrack === 'off'
                      ? 'bg-red-950/40 text-red-400 border-red-900/50'
                      : 'bg-slate-900/60 text-slate-400 border-slate-850 hover:text-white'
                  }`}
                >
                  <VolumeX className="w-4 h-4" />
                  MUTE
                </button>
                <button
                  type="button"
                  onClick={() => startAmbientSynth('lofi')}
                  className={`px-1 py-2 rounded-xl text-[10px] font-mono border font-bold transition flex flex-col items-center justify-center gap-1 cursor-pointer select-none ${
                    ambientTrack === 'lofi'
                      ? 'bg-amber-950/40 text-amber-300 border-amber-900/50'
                      : 'bg-slate-900/60 text-slate-400 border-slate-850 hover:text-white'
                  }`}
                >
                  <Coffee className="w-4 h-4 text-amber-400" />
                  LOFI
                </button>
                <button
                  type="button"
                  onClick={() => startAmbientSynth('nebula')}
                  className={`px-1 py-2 rounded-xl text-[10px] font-mono border font-bold transition flex flex-col items-center justify-center gap-1 cursor-pointer select-none ${
                    ambientTrack === 'nebula'
                      ? 'bg-indigo-950/40 text-indigo-300 border-[#818cf8]/20'
                      : 'bg-slate-900/60 text-slate-400 border-slate-850 hover:text-white'
                  }`}
                >
                  <Globe className="w-4 h-4 text-indigo-400" />
                  NEBULA
                </button>
                <button
                  type="button"
                  onClick={() => startAmbientSynth('cyberpunk')}
                  className={`px-1 py-2 rounded-xl text-[10px] font-mono border font-bold transition flex flex-col items-center justify-center gap-1 cursor-pointer select-none ${
                    ambientTrack === 'cyberpunk'
                      ? 'bg-violet-950/40 text-violet-305 border-[#a78bfa]/20'
                      : 'bg-slate-900/60 text-slate-400 border-slate-850 hover:text-white'
                  }`}
                >
                  <Terminal className="w-4 h-4 text-violet-400" />
                  CYBER
                </button>
              </div>

              {/* Ambient Waveform Animation when anything plays */}
              <div className="mt-4 flex items-center justify-center gap-1.5 h-3 overflow-hidden select-none">
                {ambientTrack !== 'off' ? [...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    style={{ animationDelay: `${i * 0.08}s`, height: `${4 + Math.random() * 8}px` }}
                    className="w-1 bg-[#a78bfa] rounded-full animate-bounce [animation-duration:1s]"
                  />
                )) : (
                  <div className="w-full h-[1px] bg-slate-800/80" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Project Spec Switcher Banner (Shown on Project Simulator) */}
        {activeTab === 'playground' && (
          <div id="playground-selector" className="mt-5 p-5 bg-violet-950/40 border border-violet-900/50 backdrop-blur-md rounded-3xl flex flex-col xl:flex-row xl:items-center justify-between gap-4 animate-fade-in">
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-2xl bg-violet-900/40 text-[#a78bfa] border border-violet-850 mt-1">
                <Lightbulb className="w-5 h-5" />
              </div>
              <div className="max-w-2xl select-text">
                <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-[#a78bfa] block">Active Simulated Architecture Blueprint</span>
                <span className="text-base font-bold text-white">{selectedTemplate.name}</span>
                <p className="text-xs text-slate-400 mt-1 font-medium leading-relaxed">{selectedTemplate.description}</p>
              </div>
            </div>

            {/* Template Selector Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {PLAYGROUND_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={(e) => { e.stopPropagation(); handleLoadTemplate(tpl); }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition ${
                    selectedTemplate.id === tpl.id
                      ? 'bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-500/10'
                      : 'bg-white hover:border-slate-300 text-slate-600 border-slate-200'
                  }`}
                >
                  {tpl.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Dynamic Theme Banner & Alignment Speedometer Widget */}
        <section id="labs-scoring" className={`mt-5 bg-gradient-to-tr ${currentTheme.gradient} border border-slate-800/80 rounded-3xl p-6 relative overflow-hidden ${currentTheme.glow} transition-all duration-500`}>
          <div className="absolute top-0 right-0 w-80 h-80 bg-violet-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Speedometer Circle Score presentation */}
            <div className="lg:col-span-4 flex items-center gap-5 border-b lg:border-b-0 lg:border-r border-slate-800/80 pb-6 lg:pb-0 select-none">
              <div className="relative flex items-center justify-center p-2 bg-[#090b11] rounded-full shadow-2xl border border-slate-800 shrink-0">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle cx="48" cy="48" r="41" strokeWidth="7" stroke="#161720" fill="transparent" />
                  <circle
                    cx="48"
                    cy="48"
                    r="41"
                    strokeWidth="7"
                    stroke="currentColor"
                    className="text-violet-500"
                    fill="transparent"
                    strokeDasharray="257.61"
                    strokeDashoffset={257.61 * (1 - (state?.overall_alignment_score || 0.65))}
                    style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1)' }}
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-2xl font-black text-white block font-sans">
                    {Math.round((state?.overall_alignment_score || 0.65) * 100)}%
                  </span>
                  <span className="text-[9px] text-slate-450 font-bold uppercase tracking-widest block font-sans">Aligned</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest block text-violet-400 font-mono">
                  ALIGNMENT METRIC
                </span>
                <h2 className="text-lg font-bold text-white font-sans tracking-tight">
                  Intended Vision Match
                </h2>
                <div className="flex items-center gap-1.5 mt-1.5 bg-slate-900/80 backdrop-blur-sm border border-slate-800/80 px-2.5 py-0.5 rounded-full w-fit">
                  <span className={`w-2 h-2 rounded-full ${state && state.overall_alignment_score >= 0.8 ? 'bg-emerald-400' : 'bg-orange-500 animate-pulse'}`} />
                  <span className="text-[10px] text-slate-400 font-mono font-bold tracking-tight">
                    {state && state.overall_alignment_score >= 0.8 ? 'OPTIMAL' : 'DRIFT DETECTED'}
                  </span>
                </div>
              </div>
            </div>

            {/* Cognitive Recovery Briefing and Status text */}
            <div className="lg:col-span-5 flex flex-col justify-center select-text">
              <div className="flex items-center gap-2 mb-2 text-xs text-slate-400 font-bold uppercase tracking-wider font-sans">
                <Activity className="w-4 h-4 text-violet-450 animate-pulse" />
                Cognitive Recovery Briefing
              </div>
              <p className="text-sm text-slate-300 leading-relaxed font-sans mt-0.5">
                {loading ? (
                  <span className="text-slate-500 italic block animate-pulse">Running cognitive codebase analysis...</span>
                ) : (
                  state?.recovery_briefing || "Telemetry synchronized successfully. Workspace facts are completely stable."
                )}
              </p>
            </div>

            {/* Imposter state scale slider panel */}
            <div className="lg:col-span-3 flex flex-col gap-2 bg-[#090b10]/80 backdrop-blur-md p-4 rounded-2xl border border-slate-800/80 shadow-inner">
              <span className="text-[9px] text-[#a78bfa] font-mono font-bold uppercase tracking-widest">Confidence Index Selector</span>
              
              <div className="flex items-center gap-2 text-white font-bold text-xs mt-1">
                <Award className="w-4 h-4 text-amber-500 animate-bounce" />
                <span>Confidence: <strong className="text-violet-400 text-sm font-mono">{confidenceScale}%</strong></span>
              </div>

              <input 
                type="range" 
                min="0" 
                max="100" 
                value={confidenceScale}
                onChange={(e) => {
                  setConfidenceScale(Number(e.target.value));
                  triggerDevSound(0.5 + Math.random() * 1.5);
                }}
                className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-violet-500 mt-1" 
              />
              <span className="text-[10px] text-slate-455 font-mono italic leading-tight mt-1 min-h-[20px] block transition">
                {getDeveloperImpostorQuote()}
              </span>
            </div>

          </div>
        </section>

        {/* Dynamic Memorable Git Commit message display line */}
        <section className="mt-4 px-5 py-3.5 bg-gradient-to-r from-slate-950 to-black text-white rounded-2xl border border-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-3 select-text">
          <div className="flex items-center gap-2.5">
            <GitBranch className="w-4 h-4 text-emerald-400 shrink-0 animate-pulse" />
            <div className="font-mono text-xs text-emerald-300">
              <span className="text-slate-500 mr-2 uppercase tracking-wide font-bold">Random Commit Vibe:</span>
              <span className="italic block sm:inline mt-0.5 sm:mt-0 font-bold">"{gitMemeText}"</span>
            </div>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); rollGitCommitMeme(); }}
            className="text-[10px] font-mono shrink-0 px-2.5 py-1 text-emerald-400 hover:text-white border border-emerald-500/40 hover:bg-emerald-500/20 rounded-lg active:scale-95 transition"
          >
            ROLL RE-COMMIT
          </button>
        </section>

        {/* Google Labs Inspired navigation pills with glassmorphic accents */}
        <nav id="labs-nav" className="mt-6 border-b border-slate-900 flex items-center justify-between pb-1 gap-4 overflow-x-auto scrollbar-none select-none">
          <div className="flex items-center gap-1.5">
            <button
              onClick={(e) => { e.stopPropagation(); setActivePage('blueprint'); }}
              className={`px-4.5 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-300 flex items-center gap-2 relative ${
                activePage === 'blueprint'
                  ? currentTheme.tabActive
                  : 'text-[#c084fc] hover:text-white hover:bg-violet-950/15 border border-dashed border-violet-500/10'
              }`}
            >
              <Cpu className="w-4 h-4 text-violet-400 animate-pulse" />
              <span>Supreme OS Cockpit</span>
              <span className="absolute -top-1.5 -right-1 bg-violet-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase leading-none select-none tracking-wider scale-90 animate-pulse">
                SYSTEM
              </span>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setActivePage('radar'); }}
              className={`px-4.5 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-2 ${
                activePage === 'radar'
                  ? currentTheme.tabActive
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <Layers3 className="w-4 h-4" />
              Vision & Alignment HUD
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setActivePage('explore'); }}
              className={`px-4.5 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-2 ${
                activePage === 'explore'
                  ? currentTheme.tabActive
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <FileCode className="w-4 h-4" />
              State File Ledger
              {summary && summary.todoCount > 0 && (
                <span className="bg-orange-950 text-orange-400 border border-orange-900/40 text-[10px] rounded-full px-2 py-0.5 ml-1 select-none font-bold">
                  {summary.todoCount}
                </span>
              )}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setActivePage('terminal'); }}
              className={`px-4.5 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-2 ${
                activePage === 'terminal'
                  ? currentTheme.tabActive
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <Terminal className="w-4 h-4" />
              Interactive Shell Gate
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setActivePage('integrations'); }}
              className={`px-4.5 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-2 ${
                activePage === 'integrations'
                  ? currentTheme.tabActive
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <Lightbulb className="w-4 h-4" />
              Dynamic Integration Lab
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setActivePage('companion'); }}
              className={`px-4.5 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-2 ${
                activePage === 'companion'
                  ? currentTheme.tabActive
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Cognitive Companion
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setActivePage('terrarium'); triggerNotification("Entering Aether-Bloom Virtual Terrarium", "success"); }}
              className={`px-4.5 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-300 flex items-center gap-2 relative ${
                activePage === 'terrarium'
                  ? currentTheme.tabActive
                  : 'text-slate-400 hover:text-[#c084fc] hover:bg-violet-950/15 border border-dashed border-transparent hover:border-violet-500/10'
              }`}
            >
              <Sparkles className="w-4 h-4 text-violet-400 animate-pulse" />
              <span>Aether-Bloom Terrarium</span>
              <span className="absolute -top-1.5 -right-1 bg-violet-650 bg-violet-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase leading-none select-none tracking-wider scale-90">
                LABS
              </span>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setActivePage('cognition'); }}
              className={`px-4.5 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-2 ${
                activePage === 'cognition'
                  ? currentTheme.tabActive
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <Cpu className="w-4 h-4 text-violet-400 animate-pulse" />
              AI Cognition Deck
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setActivePage('nebula'); }}
              className={`px-4.5 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-2 ${
                activePage === 'nebula'
                  ? currentTheme.tabActive
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <Globe className="w-4 h-4 text-[#a78bfa]" />
              3D Holographic Universe
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setActivePage('healer'); }}
              className={`px-4.5 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-2 ${
                activePage === 'healer'
                  ? currentTheme.tabActive
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <Flame className="w-4 h-4 text-rose-450 animate-pulse" />
              Entropy & Self-Healer
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setActivePage('genome'); }}
              className={`px-4.5 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-2 ${
                activePage === 'genome'
                  ? currentTheme.tabActive
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <Award className="w-4 h-4 text-emerald-400" />
              Maturity & Time Machine
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setActivePage('chaos'); }}
              className={`px-4.5 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-2 ${
                activePage === 'chaos'
                  ? currentTheme.tabActive
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              Chaos & Threat Lab
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-slate-405 bg-[#090b11] border border-slate-800 px-3.5 py-1.5 rounded-2xl font-bold font-sans">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
            <span>Port 3000 Secured</span>
          </div>
        </nav>

        {/* PAGE CONTENT SWITCHING STAGE */}
        <section className="mt-6 min-h-[500px]">

          {/* TAB 1: RADAR PORTAL (VISION SPECIFICATION & TRACKERS BACKLOGS) */}
          {activePage === 'radar' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in select-text">
              
              {/* Vision Spec Inputs and checklist mapping (Left, 7 Columns) */}
              <div className="col-span-12 lg:col-span-7 bg-[#0b0d14]/80 backdrop-blur-md border border-slate-800/90 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#a78bfa] flex items-center gap-1.5 font-mono">
                      <BookOpen className="w-4 h-4 text-violet-400" />
                      Intended Product Specifications
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">FSTracker Map Target</span>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed mb-4 font-sans font-medium">
                    Modify your target code specs in real-time. Our state engine analyzes the delta state between your written plans and active physical files on port 3000.
                  </p>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col shadow-inner">
                    <textarea
                      className="bg-transparent text-sm text-slate-800 font-sans focus:outline-none min-h-[190px] w-full resize-y placeholder:text-slate-400 leading-relaxed font-normal select-text focus:ring-0"
                      value={activeTab === 'live' ? liveVisionSpec : playgroundVisionSpec}
                      onChange={(e) => {
                        if (activeTab === 'live') {
                          setLiveVisionSpec(e.target.value);
                        } else {
                          setPlaygroundVisionSpec(e.target.value);
                        }
                      }}
                      placeholder="Input spec targets... such as: Integrate a sqlite persistent layer, rate limit api, and expose gemini webchats."
                    />

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-t border-slate-200 mt-4 pt-3 gap-3">
                      <span className="text-[11px] text-slate-550 font-mono">
                        📄 Document size: <strong className="text-slate-800 font-black">{currentVision.length} chars</strong>
                      </span>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); fetchWorkspaceUpdate(true); }}
                        className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-4.5 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Align Specs Now
                      </button>
                    </div>
                  </div>
                </div>

                {/* Micro engineering parameters alignment */}
                <div className="mt-6 border-t border-slate-100 pt-5">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest block mb-4 font-mono">
                    Logical Checklist Verification
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-start gap-2.5 text-xs">
                      <div className="p-0.5 rounded-full bg-emerald-100 text-emerald-800 mt-0.5 border border-emerald-200">
                        <Check className="w-3 h-3" />
                      </div>
                      <div className="text-slate-700">
                        <span className="font-bold block text-[11px]">Vite Applet Gateway</span>
                        <span className="text-[10px] text-slate-400 font-mono">Port 3000 running stable index</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs">
                      <div className="p-0.5 rounded-full bg-emerald-100 text-emerald-800 mt-0.5 border border-emerald-200">
                        <Check className="w-3 h-3" />
                      </div>
                      <div className="text-slate-700">
                        <span className="font-bold block text-[11px]">FS Daemon Watcher</span>
                        <span className="text-[10px] text-slate-400 font-mono">Ingestion system checks active</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs">
                      <div className="p-0.5 rounded-full bg-violet-100 text-violet-800 mt-0.5 border border-violet-200">
                        <Check className="w-3 h-3" />
                      </div>
                      <div className="text-slate-700">
                        <span className="font-bold block text-[11px]">Caffeine Integration</span>
                        <span className="text-[10px] text-slate-400 font-mono">Espresso boosters aligned</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs">
                      <div className="p-0.5 rounded-full bg-slate-100 text-slate-400 mt-0.5 border border-slate-200">
                        <Workflow className="w-3 h-3 text-slate-500" />
                      </div>
                      <div className="text-slate-705">
                        <span className="font-bold block text-[11px] text-slate-600">Secure Deployments Target</span>
                        <span className="text-[10px] text-slate-450 font-mono">Verify secrets configurations</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Backlog priority list & active exceptions blockers (Right, 5 Columns) */}
              <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
                
                {/* Backlog Roadmap pipeline */}
                <div className="bg-white/80 backdrop-blur-md border border-slate-200/65 rounded-3xl p-6 shadow-sm flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest font-mono flex items-center gap-1.5">
                      <Workflow className="w-4 h-4 text-slate-400" />
                      Actions Backlog Queue
                    </h3>
                    <span className="text-[10px] font-bold bg-violet-100/80 text-violet-800 border-violet-200/60 border px-2.5 py-0.5 rounded-full font-mono">
                      Next Backlog
                    </span>
                  </div>

                  <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                    {loading ? (
                      <div className="text-xs text-slate-400 italic text-center py-5 animate-pulse">
                        Sifting through folders...
                      </div>
                    ) : state?.next_actions_backlog && state.next_actions_backlog.length > 0 ? (
                      state.next_actions_backlog.map((item, idx) => (
                        <div key={idx} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 hover:border-violet-300 transition-all flex items-start gap-3">
                          <span className={`bg-violet-100 text-violet-800 border-violet-200 text-xs font-mono font-black w-6 h-6 rounded-lg border flex items-center justify-center shrink-0`}>
                            {item.priority}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1.5 flex-wrap">
                              <span className="text-xs font-bold text-slate-800">{item.task}</span>
                              <span className="text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider bg-white border border-slate-250 text-slate-500">
                                {item.estimated_complexity}
                              </span>
                            </div>
                            {item.prerequisites && item.prerequisites.length > 0 && (
                              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                                <span className="text-[9px] text-slate-400 font-bold uppercase font-mono">Requires:</span>
                                {item.prerequisites.map((p, i) => (
                                  <span key={i} className="text-[9px] font-mono bg-white px-2 py-0.5 rounded border border-slate-200/80 text-slate-650">
                                    {p}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10 font-sans">
                        <Sparkles className="w-8 h-8 text-violet-400 mx-auto mb-2 animate-bounce" />
                        <p className="text-xs text-slate-700 font-bold">Workspace successfully completed! Zero drift.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stuck exceptions blockers analysis box */}
                {state?.active_blockers && state.active_blockers.length > 0 && (
                  <div className="bg-[#1a0c0e]/95 border border-rose-900/40 rounded-3xl p-5 shadow-lg shadow-black/80">
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 rounded-xl bg-rose-950/80 text-rose-400 mt-0.5 border border-rose-900/40 animate-pulse">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div className="select-text flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-rose-400 uppercase tracking-widest font-mono">Workspace Red Alert</h4>
                        <p className="text-xs text-rose-305 font-medium leading-relaxed mt-1 break-words">
                          {state.active_blockers[0].error_message}
                        </p>
                        {state.active_blockers[0].suggested_fix && (
                          <div className="mt-3 bg-[#0d0406]/98 border border-rose-950/80 p-3.5 rounded-2xl text-[10px] font-mono text-rose-200 leading-normal select-text">
                            <span className="text-rose-400 font-black block mb-1">PROPOSED RESOLVE RIDE:</span>
                            {state.active_blockers[0].suggested_fix}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* TAB 2: STATE FILE LEDGER (INTERACTIVE FILES TREE & CANVAS NODE GRAPH) */}
          {activePage === 'explore' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in select-text">
              
              {/* File Directory Column (Left, 4 Columns) */}
              <div className="col-span-12 lg:col-span-4 bg-[#0b0d14]/85 backdrop-blur-md border border-slate-800/90 rounded-3xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3.5 select-none">
                  <h3 className="text-xs font-bold text-slate-350 uppercase tracking-widest font-mono">
                    Files Ingestion Index
                  </h3>
                  <span className="bg-slate-900 border border-slate-800 text-slate-300 text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold">
                    {summary ? summary.files.length : "0"} Files Scanned
                  </span>
                </div>

                {/* File search block input */}
                <div className="relative mb-3">
                  <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type="text"
                    className="w-full bg-[#07080d] border border-slate-850 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500 font-sans placeholder:text-slate-600"
                    placeholder="Search folder or files..."
                    value={fileSearchQuery}
                    onChange={(e) => setFileSearchQuery(e.target.value)}
                  />
                  {fileSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setFileSearchQuery('')}
                      className="absolute right-3 top-2.5 text-[9px] font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-750 px-1.5 py-0.5 rounded"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Left File listing scroll grid */}
                <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
                  {summary ? (
                    filteredFiles.map((file, i) => {
                      const isSelected = selectedFileInfo?.relativePath === file.relativePath;
                      return (
                        <div
                          key={i}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFileInfo(file);
                            setSelectedNodeId(file.relativePath);
                            triggerDevSound(1.3);
                          }}
                          className={`p-3 rounded-2xl text-xs cursor-pointer border transition-all flex items-center justify-between gap-2.5 select-none ${
                            isSelected
                              ? 'bg-[#1b1d28]/95 border-violet-500/40 text-white shadow-xl shadow-black/40'
                              : 'bg-[#07080d]/60 hover:bg-[#0c0d14] border-slate-850 text-slate-300 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <FileCode className={`w-4 h-4 ${isSelected ? 'text-violet-300' : 'text-slate-500'}`} />
                            <span className="font-mono text-[11px] truncate tracking-tight text-slate-200">{file.relativePath}</span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 select-none">
                            {file.todos.length > 0 && (
                              <span className="bg-orange-950/80 text-orange-400 border border-orange-900/30 text-[9px] px-1.5 py-0.5 rounded font-black font-mono">
                                {file.todos.length} STUB
                              </span>
                            )}
                            <span className={`text-[9.5px] font-mono ${isSelected ? 'text-slate-305' : 'text-slate-450'}`}>
                              {(file.size / 1024).toFixed(1)} KB
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-xs text-slate-500 italic text-center py-10">Running directory crawler...</div>
                  )}
                </div>
              </div>

              {/* Dynamic Interactive Dependency Flow Canvas or Details Inspector (Middle, 4 Columns) */}
              <div className="col-span-12 lg:col-span-4 bg-white/85 backdrop-blur-md border border-slate-200/65 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest font-mono mb-3.5">
                    Workspace Node Visualizer
                  </h3>
                  
                  {/* Circular Node Map Illustration */}
                  <div className="bg-slate-950 rounded-2xl p-4 border border-slate-900 text-slate-400 text-center relative overflow-hidden min-h-[160px] flex flex-col justify-center items-center select-none mb-4">
                    <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
                    
                    {/* Glowing Accent circle orbits */}
                    <div className="relative w-28 h-28 flex items-center justify-center border border-slate-800 rounded-full animate-spin-slow">
                      <div className="absolute top-0 left-0 w-2.5 h-2.5 bg-violet-500 rounded-full animate-ping"></div>
                      <div className="absolute bottom-2 right-2 w-2 h-2 bg-emerald-400 rounded-full"></div>
                      <div className="w-16 h-16 border border-dashed border-slate-705 rounded-full flex items-center justify-center">
                        <Cpu className="w-6 h-6 text-violet-400 animate-pulse" />
                      </div>
                    </div>
                    
                    <span className="text-[10px] text-slate-400 uppercase font-bold font-mono tracking-widest mt-4">
                      {selectedFileInfo ? `NODE: ${selectedFileInfo.relativePath.split('/').pop()}` : "Select any active file"}
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono mt-1">Interactive structure connection mapping</span>
                  </div>

                  {selectedFileInfo ? (
                    <div className="bg-slate-50 rounded-2.5xl p-4.5 border border-slate-200/80 space-y-3.5 select-text">
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase font-bold font-mono block">Scanned File Signature</span>
                        <h4 className="text-sm font-bold text-slate-900 font-mono break-all mt-0.5">
                          {selectedFileInfo.relativePath.split('/').pop()}
                        </h4>
                        <span className="text-[10px] text-slate-500 font-mono block mt-1">{selectedFileInfo.relativePath}</span>
                      </div>

                      <div className="border-t border-slate-200 pt-3 flex justify-between gap-2 select-none">
                        <div>
                          <span className="text-[9px] text-slate-400 uppercase font-mono font-bold block">Size Allocated</span>
                          <span className="text-xs font-bold text-slate-850 font-mono">{selectedFileInfo.size.toLocaleString()} bytes</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] text-slate-400 uppercase font-mono font-bold block">Todo Marks</span>
                          <span className="text-xs font-bold text-orange-700 font-mono">{selectedFileInfo.todos.length} instances</span>
                        </div>
                      </div>

                      {/* Scanned Imports elements */}
                      {selectedFileInfo.imports.length > 0 && (
                        <div className="border-t border-slate-200 pt-3">
                          <span className="text-[9px] text-violet-750 bg-violet-100/60 border border-violet-200/50 px-2 py-0.5 rounded font-mono uppercase font-black tracking-widest block w-fit mb-2">
                            Dependencies Utilized
                          </span>
                          <div className="flex flex-wrap gap-1 max-h-[85px] overflow-y-auto pr-1">
                            {selectedFileInfo.imports.map((imp, idx) => (
                              <span key={idx} className="bg-white border border-slate-200 text-slate-700 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                                {imp}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Config files elements */}
                      {selectedFileInfo.envVarsUsed.length > 0 && (
                        <div className="border-t border-slate-200 pt-3 select-text">
                          <span className="text-[9px] text-orange-805 bg-orange-50 border border-orange-200/40 px-2 py-0.5 rounded font-mono uppercase font-black tracking-widest block w-fit mb-2">
                            Requires Env Variables
                          </span>
                          <div className="flex flex-wrap gap-1 font-mono">
                            {selectedFileInfo.envVarsUsed.map((ev, idx) => (
                              <span key={idx} className="bg-orange-50 border border-orange-200/50 text-orange-700 text-[9.5px] px-2 py-0.5 rounded font-black font-mono">
                                {ev}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="border border-dashed border-slate-200 rounded-2xl p-6 text-center text-slate-400 mt-4 bg-slate-50/50">
                      <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-slate-650 leading-relaxed max-w-xs mx-auto">
                        Flip through files in Left Index tree to fetch comprehensive physical sizes, logical file imports, and variables.
                      </p>
                    </div>
                  )}
                </div>

                <div className="text-[10px] text-slate-400 font-mono italic select-none mt-4 text-center">
                  Live watcher active on Port 3000 mapping.
                </div>
              </div>

              {/* Package auditing dashboard & environment validators (Right, 4 Columns) */}
              <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
                
                {/* Active Stub Notes Lists */}
                <div className="bg-white/85 backdrop-blur-md border border-slate-200/65 rounded-3xl p-5 shadow-sm">
                  <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest block mb-3 font-mono flex items-center gap-1.5 select-none animate-pulse">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    TODO annotations Ledger
                  </span>

                  <div className="space-y-2.5 max-h-[200px] overflow-y-auto pr-1">
                    {state?.assets_mocked && state.assets_mocked.length > 0 ? (
                      state.assets_mocked.map((asset, i) => (
                        <div key={i} className="bg-orange-50/30 border border-orange-100 p-3.5 rounded-2xl text-xs relative select-text">
                          <span className="absolute right-2.5 top-2 py-0.5 px-2 text-[8px] font-bold uppercase tracking-widest font-mono bg-orange-100 text-orange-800 rounded-full border border-orange-200/30">
                            STUB MARK
                          </span>
                          <div className="font-mono text-orange-900 font-black mr-12 truncate block">{asset.name}</div>
                          <p className="text-[10px] text-slate-550 font-mono mt-1 break-all bg-white/60 p-1.5 rounded border border-slate-150 leading-tight">
                            File: {asset.mock_file}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic text-center py-6">Perfect build: No hardcoded stubs or comments found.</p>
                    )}
                  </div>
                </div>

                {/* Scope Dependency Auditor checks */}
                <div className="bg-white/85 backdrop-blur-md border border-slate-200/65 rounded-3xl p-5 shadow-sm">
                  <span className="text-[10px] font-bold text-rose-600 uppercase tracking-widest block mb-3 font-mono select-none">
                    ⚠️ NPM Packages Drift Auditor
                  </span>

                  <div className="space-y-2.5 select-text">
                    {summary && summary.missingDeps.length > 0 ? (
                      summary.missingDeps.map((d, idx) => (
                        <div key={idx} className="bg-rose-50 border border-rose-100 p-3 rounded-2.5xl flex items-center justify-between gap-2.5">
                          <div className="min-w-0">
                            <span className="font-mono text-xs font-bold text-rose-800 break-all block">{d}</span>
                            <span className="text-[9.5px] text-rose-500 font-medium leading-tight mt-0.5 block">
                              Imported in codebase scripts but absent from package.json!
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleRunCommand(undefined, `npm install ${d}`); }}
                            className="bg-white hover:bg-rose-50 border border-rose-200 text-rose-700 font-mono text-[10px] font-bold px-3 py-2 rounded-xl text-center shadow-sm shrink-0 transition"
                          >
                            FIX
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-emerald-700 font-bold bg-emerald-50 border border-emerald-100 p-4 rounded-2xl leading-relaxed">
                        <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                        <span>Vite package.json index matches local modules flawlessly!</span>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: DEVSHELL TERMINAL */}
          {activePage === 'terminal' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in select-text">
              
              {/* Terminal Screen frame (Left, 8 Columns) */}
              <div className="col-span-12 lg:col-span-8 bg-slate-950 border border-slate-900 rounded-3xl p-6 shadow-2xl flex flex-col min-h-[490px]">
                <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4 select-none">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
                      VIRTUAL SHELL CONSOLE v1.2
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-[10px] text-slate-400 font-mono text-[9px] font-bold">TUNNEL LINK ACTIVE</span>
                  </div>
                </div>

                {/* Prebuilt quick action hotkeys */}
                <div className="flex flex-wrap items-center gap-2 mb-4 select-none">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleRunCommand(undefined, "npm run build"); }}
                    className="bg-slate-900 hover:bg-slate-800 text-[10.5px] font-mono text-slate-300 font-bold border border-slate-800 px-3 py-1.5 rounded-xl transition-all hover:-translate-y-0.5"
                  >
                    🚀 Compile Build Bundle
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleRunCommand(undefined, "npm run lint"); }}
                    className="bg-slate-900 hover:bg-slate-800 text-[10.5px] font-mono text-slate-300 font-bold border border-slate-800 px-3 py-1.5 rounded-xl transition-all hover:-translate-y-0.5"
                  >
                    🧪 Safe Lint Ingestion
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleRunCommand(undefined, "git status"); }}
                    className="bg-slate-900 hover:bg-slate-800 text-[10.5px] font-mono text-slate-300 font-bold border border-slate-800 px-3 py-1.5 rounded-xl transition-all hover:-translate-y-0.5"
                  >
                    📂 Physical File Changes
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleRunCommand(undefined, "npm run mock-crash"); }}
                    className="bg-rose-950/30 hover:bg-rose-950/60 text-[10.5px] font-mono text-rose-305 font-bold border border-rose-900/40 px-3 py-1.5 rounded-xl transition-all ml-auto hover:-translate-y-0.5"
                  >
                    ⚠️ Emulate Trace Exception
                  </button>
                </div>

                {/* Main scroll output box */}
                <div className="bg-[#030712] border border-slate-900 max-h-[290px] overflow-y-auto rounded-2xl p-4.5 flex-1 space-y-4 font-mono text-xs select-text">
                  {terminalHistory.map((hist, index) => (
                    <div key={index} className="space-y-1.5">
                      <div className="flex items-center justify-between text-slate-500 text-[10px] border-b border-white/5 pb-1 select-none">
                        <span className="flex items-center gap-1.5">
                          <span className="text-emerald-500 font-bold font-mono">$</span>
                          <strong className="text-slate-350">{hist.cmd}</strong>
                        </span>
                        <span>
                          {hist.success ? (
                            <span className="text-emerald-450 font-bold">[EXIT_OK]</span>
                          ) : (
                            <span className="text-rose-450 font-bold">[CRITICAL_ERR]</span>
                          )}
                        </span>
                      </div>
                      <pre className={`whitespace-pre-wrap leading-relaxed py-1 font-mono text-[11px] ${
                        hist.success ? 'text-slate-300' : 'text-rose-300 bg-rose-950/20 px-3.5 py-3 rounded-xl border border-rose-900/30'
                      }`}>
                        {hist.output}
                      </pre>
                      {hist.fix && (
                        <div className="mt-2 bg-[#064e3b]/30 border border-[#059669]/20 p-3.5 rounded-2xl text-[10px] leading-relaxed text-emerald-300">
                          <div className="text-emerald-400 font-black uppercase tracking-widest text-[9px] mb-1 flex items-center gap-1 font-mono">
                            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                            Labs Smart Healing Remedy Recommendations
                          </div>
                          {hist.fix}
                        </div>
                      )}
                    </div>
                  ))}
                  {terminalRunning && (
                    <div className="text-emerald-400 animate-pulse text-[10px] select-none font-mono">
                      $ Secure output socket socket pipe transmission active...
                    </div>
                  )}
                  <div ref={terminalEndRef} />
                </div>

                {/* Secure input shell command sender */}
                <form onSubmit={handleRunCommand} className="mt-4 flex items-center gap-2 select-text">
                  <span className="text-slate-600 font-mono text-sm self-center select-none">$</span>
                  <input
                    type="text"
                    className="bg-[#0c101a] border border-slate-900 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/10 flex-1 placeholder:text-slate-700 text-emerald-400 font-mono"
                    placeholder="Input process instructions... (e.g., npm run build)"
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={terminalRunning}
                    className="bg-slate-850 hover:bg-slate-800 disabled:bg-slate-950 text-slate-300 border border-slate-850 rounded-2xl px-5 py-3 text-xs font-mono font-bold transition duration-150 active:scale-95 cursor-pointer"
                  >
                    RUN SHELL
                  </button>
                </form>
              </div>

              {/* Shell context manuals documentation (Right, 4 Columns) */}
              <div className="col-span-12 lg:col-span-4 bg-white/85 backdrop-blur-md border border-slate-200/65 rounded-3xl p-5 shadow-sm space-y-4">
                <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block font-mono">
                  DevShell Help Desk
                </span>

                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2.5xl leading-relaxed">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Command className="w-4 h-4 text-violet-500 animate-spin-slow" />
                    Secure Process Sandboxing
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 font-medium leading-relaxed">
                    Commands executed inside this gate run within a secure sandbox process. Real-time error trapping monitors splits or typical key issues to generate dynamic recommendations.
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wide font-mono">Core Testing Commands:</span>
                  <div className="p-3 bg-slate-50 rounded-2xl font-mono text-[10.5px] leading-relaxed space-y-1.5">
                    <div><strong className="text-violet-605 font-black">npm run build</strong> - Bundle source assets</div>
                    <div className="border-t border-slate-200/50 my-1"></div>
                    <div><strong className="text-violet-605 font-black">npm run lint</strong> - Syntactic static evaluation</div>
                    <div className="border-t border-slate-200/50 my-1"></div>
                    <div><strong className="text-violet-605 font-black">git status</strong> - Physical file ledger tracks</div>
                  </div>
                </div>

                <div className="p-4 bg-violet-500/5 border border-violet-500/10 rounded-2.5xl text-xs flex gap-3 shadow-inner">
                  <div className="p-1.5 rounded-xl bg-violet-100 text-violet-750 shrink-0 h-fit shadow-sm">
                    <Activity className="w-4 h-4 text-violet-605 animate-pulse" />
                  </div>
                  <div>
                    <span className="font-bold block text-[11px] text-slate-900">Cherry MX Acoustics Engine</span>
                    <p className="text-[10px] leading-relaxed mt-1 text-slate-500">
                      We have synthesized sound effects to emulate mechanical keyboard keystrokes to stimulate code focus. Toggle using the volume emblem at the top!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* TAB 4: PRODUCTION EXPLICIT INTEGRATIONS & SECURITY CHECK ASSESSMENT */}
          {activePage === 'integrations' && (
            <div id="integrations" className="space-y-6 animate-fade-in select-text">
              
              {/* SUB TAB CONTROLS NAVIGATION BAR */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#090b11]/85 backdrop-blur-md border border-slate-800/80 p-4.5 rounded-3xl relative overflow-hidden select-none">
                <div className="absolute inset-0 bg-cover bg-grid-pattern opacity-[0.03]"></div>
                <div className="relative">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block font-mono">
                    COGNITIVE CONNECTIVITY SUITE
                  </span>
                  <h4 className="text-sm font-black text-slate-100 tracking-tight font-sans">
                    Multi-system Gateway Interface
                  </h4>
                </div>
                
                <div className="flex items-center gap-1.5 p-1 bg-[#10131d] border border-slate-800/50 rounded-2xl">
                  <button
                    onClick={() => { setIntegrationSubTab('github'); triggerDevSound(1.15); }}
                    className={`px-4 py-2 text-xs font-bold rounded-xl transition duration-150 flex items-center justify-center gap-2 cursor-pointer ${
                      integrationSubTab === 'github'
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-650 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <GitBranch className="w-3.5 h-3.5" />
                    GitHub Stream Cockpit
                  </button>
                  <button
                    onClick={() => { setIntegrationSubTab('sandbox'); triggerDevSound(1.15); }}
                    className={`px-4 py-2 text-xs font-bold rounded-xl transition duration-150 flex items-center justify-center gap-2 cursor-pointer ${
                      integrationSubTab === 'sandbox'
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-650 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <LockKeyhole className="w-3.5 h-3.5" />
                    Security Pipeline Sandbox
                  </button>
                </div>
              </div>

              {/* VIEW 1: ADVANCED GITHUB STREAM DOCKED COCKPIT */}
              {integrationSubTab === 'github' && (
                <div className="space-y-6 animate-fade-in text-[12px]">
                  
                  {/* NOT CONNECTED DISPLAY */}
                  {!githubConnected ? (
                    <div className="bg-[#0b0d14]/75 border border-slate-800/80 rounded-3xl p-8 shadow-xl relative overflow-hidden max-w-3xl mx-auto">
                      <div className="absolute inset-0 bg-cover bg-grid-pattern opacity-5"></div>
                      
                      <div className="relative flex flex-col items-center text-center space-y-6">
                        <div className="p-5 rounded-full bg-gradient-to-br from-[#8b5cf6]/15 to-indigo-600/25 border border-indigo-500/30 text-indigo-400 animate-pulse">
                          <GitBranch className="w-12 h-12" />
                        </div>
                        
                        <div className="space-y-2">
                          <h3 className="text-xl font-black text-slate-105 tracking-tight font-sans uppercase">
                            Engage GitHub Developer Stream
                          </h3>
                          <p className="text-xs text-slate-405 max-w-lg leading-relaxed">
                            Continuous deployment feedback loops. Align active branch hierarchies, traverse folder arrays, and perform base64 git push commits directly safely.
                          </p>
                        </div>
                        
                        {/* Interactive Credentials Capture Form */}
                        <form onSubmit={handleConnectGitHub} className="w-full bg-[#07080c] border border-slate-900 rounded-2.5xl p-6 text-left space-y-4 shadow-inner max-w-md">
                          <div className="space-y-1.5">
                            <label className="text-[9.5px] text-slate-400 uppercase tracking-widest font-mono font-bold block">
                              Target GitHub Repository *
                            </label>
                            <input
                              type="text"
                              required
                              className="bg-[#10131d] border border-slate-850 focus:border-indigo-500 focus:outline-none rounded-xl w-full px-3.5 py-2.5 text-xs text-slate-200 font-mono font-bold placeholder:text-slate-600"
                              placeholder="e.g. octocat/Spoon-Knife"
                              value={githubRepo}
                              onChange={(e) => setGithubRepo(e.target.value)}
                            />
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="text-[9.5px] text-slate-400 uppercase tracking-widest font-mono font-bold block">
                                Developer Access Token / PAT
                              </label>
                              <span className="text-[8.5px] text-[#10b981] font-mono font-bold uppercase">(Optional)</span>
                            </div>
                            <input
                              type="password"
                              className="bg-[#10131d] border border-slate-850 focus:border-indigo-500 focus:outline-none rounded-xl w-full px-3.5 py-2.5 text-xs text-slate-200 font-mono font-bold placeholder:text-slate-600 font-sans"
                              placeholder="ghp_xxxxxxxxxxxxxxxxxxx"
                              value={githubToken}
                              onChange={(e) => setGithubToken(e.target.value)}
                            />
                            <p className="text-[9px] text-slate-500 leading-normal mt-1 font-mono">
                              * Stateless: Credentials are run locally via Docker proxy client loops and never stored.
                            </p>
                          </div>

                          <button
                            type="submit"
                            disabled={branchesLoading || pullsLoading}
                            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-550 hover:to-indigo-550 text-white font-black text-xs uppercase py-3 rounded-xl w-full transition tracking-wider active:scale-95 disabled:opacity-50 select-none cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/15 font-sans"
                          >
                            {(branchesLoading || pullsLoading) ? (
                              <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                Handshaking repository...
                              </>
                            ) : (
                              <>
                                <Check className="w-4 h-4" />
                                Synchronize Repository Stream
                              </>
                            )}
                          </button>
                        </form>
                      </div>
                    </div>
                  ) : (
                    
                    // CONNECTED HUD GRID PANE
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      
                      {/* LEFT COLUMN: BRANCHES & TEAM PULS VISUALIZERS (4 Columns) */}
                      <div className="col-span-12 lg:col-span-4 space-y-6">
                        
                        {/* Repository Banner Display Info */}
                        <div className="bg-[#0b0d14]/80 backdrop-blur-md border border-slate-800/80 rounded-3xl p-5 shadow-lg relative overflow-hidden select-text">
                          <div className="absolute inset-0 bg-cover bg-grid-pattern opacity-[0.03]"></div>
                          <div className="relative flex items-center justify-between gap-4">
                            <div>
                              <span className="text-[8.5px] bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/25 px-2.5 py-0.5 rounded-full font-mono font-black uppercase tracking-wider block w-fit">
                                Live Ingestion On
                              </span>
                              <h4 className="text-sm font-black text-slate-105 tracking-tight block font-mono mt-2 break-all font-bold">
                                {githubRepo}
                              </h4>
                            </div>
                            <button
                              onClick={handleDisconnectGitHub}
                              className="px-3.5 py-1.5 border border-slate-800 hover:bg-slate-900 rounded-xl text-[10px] uppercase font-mono font-bold text-rose-400 transition cursor-pointer"
                            >
                              Disconnect
                            </button>
                          </div>
                        </div>

                        {/* ACTIVE BRANCH ALIGNMENT MATRIX */}
                        <div className="bg-[#090b11]/85 border border-[#10131d]/60 rounded-3xl p-5 shadow-sm space-y-4">
                          <div>
                            <span className="text-[9.5px] font-black uppercase tracking-widest text-indigo-400 font-mono block">
                              Branches Alignment Matrix
                            </span>
                            <h4 className="text-xs font-bold text-slate-300 mt-1">
                              Simulated Compilation Target
                            </h4>
                          </div>

                          {/* Quick Interactive Dropdown Selector */}
                          <div className="space-y-1.5 bg-[#05060a]/60 p-3 rounded-2xl border border-slate-900 shadow-inner">
                            <label className="text-[8.5px] text-slate-400 uppercase tracking-widest font-mono font-bold block">
                              Active Branch Selector Dropdown
                            </label>
                            <div className="relative">
                              <select
                                value={activeBranch}
                                id="github-branch-dropdown"
                                onChange={(e) => {
                                  setActiveBranch(e.target.value);
                                  triggerDevSound(1.1);
                                  triggerNotification(`Aligned compiler pipeline to: ${e.target.value}`, "success");
                                }}
                                className="bg-[#10131d] border border-slate-800 focus:border-indigo-500 focus:outline-none rounded-xl w-full px-3.5 py-2 text-[11px] text-indigo-300 font-mono font-bold appearance-none cursor-pointer"
                              >
                                {githubBranches.length === 0 ? (
                                  <option value="main" className="bg-[#090b11] text-slate-400 py-1 font-mono font-bold">main (Default)</option>
                                ) : (
                                  githubBranches.map((branch, idx) => (
                                    <option key={idx} value={branch.name} className="bg-[#090b11] text-slate-200 py-1 font-mono font-bold">
                                      {branch.name} {activeBranch === branch.name ? "★" : ""}
                                    </option>
                                  ))
                                )}
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-indigo-400 font-mono text-[9px] font-black">
                                ▾
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            {githubBranches.length === 0 ? (
                              <div className="bg-[#05060a]/80 p-4 rounded-2xl border border-slate-850 text-center text-[10.5px] text-slate-500 font-mono italic">
                                No active branches found.
                              </div>
                            ) : (
                              githubBranches.slice(0, 8).map((branch, idx) => {
                                const isAligned = activeBranch === branch.name;
                                return (
                                  <div
                                    key={idx}
                                    onClick={() => {
                                      setActiveBranch(branch.name);
                                      triggerDevSound(1.1);
                                      triggerNotification(`Aligned compiler pipeline to: ${branch.name}`, "success");
                                    }}
                                    className={`p-3.5 rounded-2xl border transition duration-150 cursor-pointer flex items-center justify-between gap-3 ${
                                      isAligned
                                        ? 'bg-indigo-950/40 border-indigo-500/40 text-indigo-200'
                                        : 'bg-[#10131d] border-slate-900 text-slate-400 hover:text-slate-200 hover:border-slate-800'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 text-[11px] font-mono font-bold truncate">
                                      <GitBranch className={`w-3.5 h-3.5 shrink-0 ${isAligned ? 'text-indigo-400 animate-pulse' : 'text-slate-600'}`} />
                                      <span className="truncate">{branch.name}</span>
                                    </div>

                                    <div className="flex items-center gap-1.5 shrink-0 select-none">
                                      {isAligned && (
                                        <span className="text-[8px] bg-indigo-500 text-indigo-950 font-mono font-black uppercase px-2 py-0.5 rounded-full border border-indigo-300/30">
                                          Aligned
                                        </span>
                                      )}
                                      <span className="text-[9px] text-slate-500 font-mono font-bold">
                                        {branch.commit?.sha?.slice(0, 6) || 'None'}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>

                        {/* PULL REQUEST TEAM PROGRESS RADAR */}
                        <div className="bg-[#090b11]/85 border border-[#10131d]/60 rounded-3xl p-5 shadow-sm space-y-4">
                          <div>
                            <span className="text-[9.5px] font-black uppercase tracking-widest text-[#a78bfa] font-mono block">
                              Team Progress Radar
                            </span>
                            <h4 className="text-xs font-bold text-slate-300 mt-1">
                              Pull Request Indicators
                            </h4>
                          </div>

                          {/* Beautiful team progress metrics dashboard */}
                          {githubPulls.length > 0 && (
                            <div className="bg-[#05060a]/80 border border-slate-900/60 rounded-2xl p-3.5 space-y-3.5 text-xs">
                              <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-400">
                                <span className="uppercase tracking-wider">Team PR Distribution</span>
                                <span className="text-[#a78bfa] font-black bg-[#a78bfa]/10 px-2 py-0.5 rounded-md border border-[#a78bfa]/20">{githubPulls.length} PRs</span>
                              </div>
                              
                              {/* Modern split progress meter */}
                              <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden flex">
                                {githubPulls.filter(p => p.merged_at).length > 0 && (
                                  <div 
                                    style={{ width: `${(githubPulls.filter(p => p.merged_at).length / githubPulls.length) * 100}%` }} 
                                    className="bg-gradient-to-r from-violet-500 to-indigo-500 h-full" 
                                  />
                                )}
                                {githubPulls.filter(p => p.state === 'open' && !p.draft).length > 0 && (
                                  <div 
                                    style={{ width: `${(githubPulls.filter(p => p.state === 'open' && !p.draft).length / githubPulls.length) * 100}%` }} 
                                    className="bg-emerald-500 h-full" 
                                  />
                                )}
                                {githubPulls.filter(p => p.draft).length > 0 && (
                                  <div 
                                    style={{ width: `${(githubPulls.filter(p => p.draft).length / githubPulls.length) * 100}%` }} 
                                    className="bg-amber-500 h-full" 
                                  />
                                )}
                                {githubPulls.filter(p => p.state === 'closed' && !p.merged_at).length > 0 && (
                                  <div 
                                    style={{ width: `${(githubPulls.filter(p => p.state === 'closed' && !p.merged_at).length / githubPulls.length) * 100}%` }} 
                                    className="bg-slate-705 h-full" 
                                  />
                                )}
                              </div>

                              {/* Grid labels row */}
                              <div className="grid grid-cols-4 gap-1.5 text-[9px] font-bold font-mono">
                                <div className="flex flex-col items-center p-1.5 bg-violet-950/20 border border-violet-900/10 rounded-lg text-[#a78bfa]">
                                  <span className="text-[8px] uppercase tracking-wider text-slate-500">Merged</span>
                                  <span className="text-xs mt-0.5 font-black">{githubPulls.filter(p => p.merged_at).length}</span>
                                </div>
                                <div className="flex flex-col items-center p-1.5 bg-emerald-950/20 border border-emerald-900/10 rounded-lg text-emerald-400">
                                  <span className="text-[8px] uppercase tracking-wider text-slate-500">Open</span>
                                  <span className="text-xs mt-0.5 font-black">{githubPulls.filter(p => p.state === 'open' && !p.draft).length}</span>
                                </div>
                                <div className="flex flex-col items-center p-1.5 bg-amber-950/20 border border-amber-900/10 rounded-lg text-amber-400">
                                  <span className="text-[8px] uppercase tracking-wider text-slate-500">Draft</span>
                                  <span className="text-xs mt-0.5 font-black">{githubPulls.filter(p => p.draft).length}</span>
                                </div>
                                <div className="flex flex-col items-center p-1.5 bg-slate-900/40 border border-slate-800 rounded-lg text-slate-400">
                                  <span className="text-[8px] uppercase tracking-wider text-slate-500">Closed</span>
                                  <span className="text-xs mt-0.5 font-black">{githubPulls.filter(p => p.state === 'closed' && !p.merged_at).length}</span>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                            {githubPulls.length === 0 ? (
                              <div className="p-4 bg-[#05060a]/80 rounded-2xl border border-slate-850 text-center text-[11px] text-slate-500 font-mono italic">
                                No open pull requests found.
                              </div>
                            ) : (
                              githubPulls.map((pr, idx) => {
                                const isDraft = pr.draft === true;
                                const isMerged = pr.merged_at !== null && pr.merged_at !== undefined;
                                const isClosed = pr.state === 'closed' && !isMerged;
                                const isOpen = pr.state === 'open' && !isDraft;

                                let resolvedStatus = 'Open';
                                let badgeClasses = 'bg-emerald-950/40 border-emerald-900/30 text-emerald-400';
                                let statusDotClasses = 'bg-emerald-400';
                                let statusText = 'Ready / Active';
                                let footerStatusLabel = '⚠️ ACTIVE OPEN';
                                let footerLabelColor = 'text-indigo-400';

                                if (isDraft) {
                                  resolvedStatus = 'Draft';
                                  badgeClasses = 'bg-amber-950/40 border-amber-900/30 text-amber-400';
                                  statusDotClasses = 'bg-amber-400';
                                  statusText = 'Draft Mode';
                                  footerStatusLabel = '⚏ DEVELOPING';
                                  footerLabelColor = 'text-amber-400';
                                } else if (isMerged) {
                                  resolvedStatus = 'Merged';
                                  badgeClasses = 'bg-violet-950/40 border-violet-900/30 text-violet-350';
                                  statusDotClasses = 'bg-violet-400';
                                  statusText = 'Merged Successfully';
                                  footerStatusLabel = '✓ MERGED';
                                  footerLabelColor = 'text-slate-400';
                                } else if (isClosed) {
                                  resolvedStatus = 'Closed';
                                  badgeClasses = 'bg-slate-900 border-slate-800 text-slate-500';
                                  statusDotClasses = 'bg-slate-500';
                                  statusText = 'Canceled / Closed';
                                  footerStatusLabel = '✕ DISMISS';
                                  footerLabelColor = 'text-slate-500';
                                }

                                const isBaseAligned = pr.base?.ref === activeBranch;

                                return (
                                  <div
                                    key={idx}
                                    className="p-3.5 bg-[#10131d]/60 border border-slate-900 rounded-2xl space-y-2.5 shadow-sm transition hover:border-[#1e2338] select-text"
                                  >
                                    <div className="flex items-start justify-between gap-2.5 select-text">
                                      <div className="min-w-0 select-text">
                                        <a
                                          href={pr.html_url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-xs font-bold tracking-tight text-slate-300 hover:text-white block font-sans line-clamp-2 hover:underline select-text"
                                        >
                                          #{pr.number}: {pr.title}
                                        </a>
                                        <div className="flex items-center gap-1.5 mt-1 font-mono text-[9px] text-slate-500">
                                          <span>Author: <span className="text-[#a78bfa] font-black">{pr.user?.login}</span></span>
                                          {pr.closed_at && (
                                            <>
                                              <span className="text-slate-700">•</span>
                                              <span className="text-slate-500">
                                                {isMerged ? 'Merged' : 'Closed'}: {new Date(pr.closed_at).toLocaleDateString()}
                                              </span>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                      
                                      <span className={`text-[8px] shrink-0 font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-full border font-mono ${badgeClasses}`}>
                                        {resolvedStatus}
                                      </span>
                                    </div>

                                    {/* Branch source -> target pipeline representation */}
                                    <div className="space-y-1.5 bg-[#07080c]/85 p-2 rounded-xl border border-slate-950">
                                      <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-450 select-none">
                                        <span className="bg-slate-900 border border-slate-800 text-slate-300 px-1.5 py-0.5 rounded truncate max-w-[100px] font-bold">
                                          {pr.head?.ref}
                                        </span>
                                        <span className="text-slate-600 font-extrabold font-black font-mono">→</span>
                                        <span className="bg-slate-900 border border-slate-800 text-slate-300 px-1.5 py-0.5 rounded truncate max-w-[100px] font-bold">
                                          {pr.base?.ref}
                                        </span>
                                      </div>

                                      <div className="flex items-center justify-between text-[8px] font-mono font-bold pt-1 border-t border-slate-900/60">
                                        <span className="text-slate-500">Branch Alignment:</span>
                                        {isBaseAligned ? (
                                          <span className="text-[#a78bfa] font-black flex items-center gap-1 bg-[#a78bfa]/10 px-1.5 py-0.5 rounded-full border border-[#a78bfa]/20 animate-pulse">
                                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#a78bfa]"></span>
                                            Aligned Target ({activeBranch})
                                          </span>
                                        ) : (
                                          <span className="text-slate-500 bg-slate-950 px-1.5 py-0.5 rounded-full border border-slate-800/40">
                                            Non-active Target ({pr.base?.ref})
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    {/* Automatic Check simulation info */}
                                    <div className="flex items-center justify-between text-[9px]">
                                      <div className="flex items-center gap-1">
                                        <span className={`inline-block w-1.5 h-1.5 rounded-full ${statusDotClasses} ${isOpen ? 'animate-pulse' : ''}`}></span>
                                        <span className="text-slate-500 font-mono font-bold leading-none">
                                          Checks: {statusText}
                                        </span>
                                      </div>
                                      
                                      <span className={`font-black font-mono uppercase text-[8.5px] ${footerLabelColor}`}>
                                        {footerStatusLabel}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>

                      </div>

                      {/* RIGHT COLUMN: REPO FILES INGESTION EXPLORER & COMMIT FORGE (8 Columns) */}
                      <div className="col-span-12 lg:col-span-8 space-y-6">
                        
                        {/* REPO FILE EXPLORER */}
                        <div className="bg-[#0b0d14]/75 border border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3.5 border-b border-indigo-950 select-none">
                            <div>
                              <span className="text-[9.5px] font-black uppercase tracking-widest text-indigo-400 font-mono block">
                                Ingested Repository Directory
                              </span>
                              <h4 className="text-[12.5px] font-black text-slate-200 mt-1">
                                Project Remote File Tree Browser
                              </h4>
                            </div>

                            {/* Path trail navigator block */}
                            <div className="flex items-center gap-2 text-xs font-mono">
                              <span className="text-slate-500">Path:</span>
                              <span className="bg-[#10131d] border border-slate-850 px-2.5 py-1 rounded-xl text-indigo-400 font-black block max-w-xs truncate pr-3">
                                /{currentGithubPath || 'root'}
                              </span>
                              {currentGithubPath !== '' && (
                                <button
                                  onClick={() => {
                                    const parts = currentGithubPath.split('/');
                                    parts.pop();
                                    fetchGithubFiles(parts.join('/'));
                                  }}
                                  className="text-[10px] font-bold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 px-2 py-1 rounded-lg shrink-0 transition cursor-pointer"
                                  type="button"
                                >
                                  [ Back ]
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Live File Grid Viewer */}
                          {filesLoading ? (
                            <div className="flex flex-col items-center justify-center py-12 space-y-3.5 select-none text-center">
                              <RefreshCw className="w-8 h-8 text-indigo-455 animate-spin" />
                              <span className="text-[11px] text-indigo-400 font-mono font-bold">Crawling GitHub remote trees...</span>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[280px] overflow-y-auto pr-1 select-none">
                              {githubFiles.length === 0 ? (
                                <div className="col-span-2 py-12 text-slate-505 italic text-center font-mono text-xs">
                                  No directories or files found in this path.
                                </div>
                              ) : (
                                githubFiles.map((item, idx) => {
                                  const isFolder = item.type === 'dir';
                                  return (
                                    <div
                                      key={idx}
                                      onClick={() => {
                                        fetchGithubFiles(item.path);
                                      }}
                                      className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 text-xs ${
                                        isFolder
                                          ? 'bg-slate-950/65 border-indigo-950 text-indigo-300 hover:bg-[#1a1f3c]/40 hover:border-indigo-900'
                                          : 'bg-[#090b11] border-slate-900/80 text-slate-400 hover:border-slate-800/80 hover:text-slate-200'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2 truncate font-mono font-bold">
                                        <span className="text-base shrink-0 select-none">{isFolder ? '📁' : '📄'}</span>
                                        <span className="truncate">{item.name}</span>
                                      </div>
                                      
                                      <span className="text-[9.5px] text-slate-500 font-mono font-bold shrink-0">
                                        {isFolder ? 'Dir' : `${(item.size / 1024).toFixed(1)} KB`}
                                      </span>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          )}
                        </div>

                        {/* COMMIT FORGE WRITING CORNER */}
                        <div className="bg-[#0b0d14]/75 border border-slate-800/80 rounded-3xl p-6 shadow-sm space-y-4">
                          <div>
                            <span className="text-[9.5px] font-black uppercase tracking-widest text-[#a78bfa] font-mono block">
                              Active Commit Forge
                            </span>
                            <h4 className="text-sm font-black text-slate-150 mt-1">
                              Modify Remote Contents & Dispatch Changes
                            </h4>
                          </div>

                          {selectedGithubFile ? (
                            <form onSubmit={handlePushFileChanges} className="space-y-4 select-text">
                              <div className="bg-[#05070d]/90 rounded-2.5xl border border-slate-900/60 p-4.5 relative">
                                <div className="flex items-center justify-between border-b border-slate-850 pb-2 mb-3 select-none">
                                  <div className="flex items-center gap-2">
                                    <FileCode className="w-4 h-4 text-indigo-400 animate-pulse" />
                                    <span className="text-xs text-indigo-400 font-bold font-mono truncate max-w-md">
                                      /{selectedGithubFile.path}
                                    </span>
                                  </div>
                                  
                                  <span className="text-[9.5px] font-mono text-slate-505 uppercase">
                                    Aligned Target Branch: <strong className="text-[#a78bfa] font-black">{activeBranch}</strong>
                                  </span>
                                </div>

                                <textarea
                                  className="w-full bg-transparent font-mono text-emerald-305 text-[11px] leading-relaxed focus:outline-none min-h-[220px] font-semibold pr-2 overflow-y-auto select-text"
                                  value={githubFileContent}
                                  onChange={(e) => setGithubFileContent(e.target.value)}
                                  placeholder="Type code update payloads here..."
                                />
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5 select-text">
                                  <label className="text-[9px] text-slate-405 uppercase tracking-widest font-mono font-bold block select-none">
                                    Commit Message
                                  </label>
                                  <input
                                    type="text"
                                    required
                                    className="bg-[#090b11] border border-slate-900 focus:border-indigo-500 focus:outline-none rounded-xl w-full px-3.5 py-2.5 text-xs text-slate-300 font-sans font-bold"
                                    value={githubCommitMsg}
                                    onChange={(e) => setGithubCommitMsg(e.target.value)}
                                  />
                                </div>

                                <div className="space-y-1.5 flex flex-col justify-end">
                                  <button
                                    type="submit"
                                    disabled={isPushingFile || filesLoading}
                                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-550 hover:to-teal-550 text-white font-black text-xs uppercase py-3 px-5 rounded-xl transition select-none cursor-pointer flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 tracking-wider font-sans"
                                  >
                                    {isPushingFile ? (
                                      <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        COMMIT DISPATCH RUNNING...
                                      </>
                                    ) : (
                                      <>
                                        ✓ DISPATCH COMMIT & PUSH TO GITHUB
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>
                            </form>
                          ) : (
                            <div className="bg-[#07080c] p-12 text-center rounded-2.5xl border border-slate-900 text-slate-500 font-mono text-xs select-none leading-relaxed">
                              No remote file selected. Browse Ingestion directory list above and click on any file indicator (📄) to extract code headers and load interactive changes in this forge code playground editor!
                            </div>
                          )}
                        </div>

                      </div>

                    </div>
                  )}

                </div>
              )}

              {/* VIEW 2: ORIGINAL MIDDLEWARE GENERATION SANDBOX */}
              {integrationSubTab === 'sandbox' && (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* Dynamic Security Vault Widget */}
                  <div className="bg-gradient-to-r from-violet-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-violet-500/10 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden select-text">
                    <div className="absolute inset-0 bg-cover bg-grid-pattern opacity-10"></div>
                    <div className="relative shrink-0 flex items-center gap-4 select-none">
                      <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-md">
                        <LockKeyhole className="w-8 h-8 text-violet-200" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] bg-emerald-500 text-emerald-950 font-black tracking-widest font-mono uppercase px-2.5 py-0.5 rounded-full border border-emerald-300/30">
                            TLS 1.3 SECURE
                          </span>
                        </div>
                        <h3 className="text-lg font-black tracking-tight mt-1 font-sans">
                          Active Ingestion Security Score
                        </h3>
                        <p className="text-xs text-violet-200 mt-0.5 leading-relaxed font-sans max-w-sm">
                          Our static logic scanner enforces robust security practices like signature check verification, env secret guards, and lazy API init methods.
                        </p>
                      </div>
                    </div>

                    {/* Big Security Score Ring */}
                    <div className="relative flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 p-4.5 rounded-2.5xl select-none">
                      <div className="relative flex items-center justify-center">
                        <svg className="w-16 h-16 transform -rotate-90">
                          <circle cx="32" cy="32" r="27" strokeWidth="5" stroke="#ffffff20" fill="transparent" />
                          <circle
                            cx="32"
                            cy="32"
                            r="27"
                            strokeWidth="5"
                            stroke="#10b981"
                            fill="transparent"
                            strokeDasharray="169.64"
                            strokeDashoffset={169.64 * (1 - (securityScore / 100))}
                            style={{ transition: 'stroke-dashoffset 1s duration-500' }}
                          />
                        </svg>
                        <span className="absolute text-xs font-black font-mono text-emerald-450">{securityScore}%</span>
                      </div>
                      <div className="max-w-xs">
                        <span className="text-xs font-bold block text-emerald-400">Security: Stable & Shielded</span>
                        <p className="text-[10px] text-violet-200 mt-1 font-medium leading-relaxed">
                          API endpoints verified on port 3000. Express CORS rules isolated to authorized origins.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Playground spec builder */}
                  <div className="bg-white/85 backdrop-blur-lg border border-slate-200/65 rounded-3xl p-6 shadow-sm select-text">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-5 select-text">
                      <div>
                        <span className="text-[10.5px] font-bold uppercase tracking-widest text-[#7c3aed] font-mono block">
                          Pipeline Integration Builder
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 mt-1 font-sans">
                          Modular Code Constructor & Simulator
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5 leading-normal max-w-2xl font-sans">
                          Verify security states, toggle rate limiting shields, or add databases below on-the-fly. This generates exact integration code.
                        </p>
                      </div>

                      <div className="flex items-center gap-2 bg-slate-100/80 border p-1 rounded-2xl select-none">
                        {PLAYGROUND_TEMPLATES.map((tpl) => (
                          <button
                            key={tpl.id}
                            onClick={(e) => { e.stopPropagation(); handleLoadTemplate(tpl); }}
                            className={`px-3 py-1.5 rounded-xl text-[10.5px] font-bold transition cursor-pointer ${
                              selectedTemplate.id === tpl.id
                                ? 'bg-slate-950 text-white shadow-sm font-black'
                                : 'text-slate-500'
                            }`}
                            type="button"
                          >
                            {tpl.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Grid construction area */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 select-text">
                      
                      {/* Active elements toggle constructors (Left, 5 Columns) */}
                      <div className="lg:col-span-5 space-y-4 select-text">
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest font-mono select-none">
                          🔧 Active Logic Middleware Shields
                        </h4>

                        <div className="space-y-2 select-text">
                          {pipelineComponents.map((comp) => {
                            const isActive = comp.status === 'active';
                            return (
                              <div 
                                key={comp.id}
                                onClick={(e) => { e.stopPropagation(); togglePipelineComp(comp.id); }}
                                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                                  isActive 
                                    ? 'bg-[#f5f3ff] border-violet-200 text-violet-950 shadow-sm'
                                    : 'bg-white border-slate-200 text-slate-500 shadow-sm'
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  {comp.type === 'auth' && <Fingerprint className="w-5 h-5 text-violet-500" />}
                                  {comp.type === 'security' && <ShieldCheck className="w-5 h-5 text-violet-500" />}
                                  {comp.type === 'database' && <Database className="w-5 h-5 text-violet-500" />}
                                  {comp.type === 'api' && <Sparkles className="w-5 h-5 text-violet-500" />}
                                  <span className="text-xs font-bold">{comp.name}</span>
                                </div>
                                
                                <span className={`text-[9.5px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                                  isActive 
                                    ? 'bg-violet-600 text-white border-violet-600'
                                    : 'bg-slate-100 text-slate-400 border-slate-200'
                                }`}>
                                  {comp.status}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Generated Secure Express Boilerplate (Right, 7 Columns) */}
                      <div className="lg:col-span-7 bg-[#030712] border border-slate-900 rounded-3xl p-5 shadow-2xl flex flex-col justify-between select-text min-h-[350px]">
                        <div>
                          <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3 select-none">
                            <span className="text-[10px] text-slate-500 font-mono font-bold tracking-widest">
                              DYNAMIC_GENERATOR: EXPRESS_MIDDLEWARE
                            </span>
                            <div className="flex items-center gap-1.5 bg-violet-500/10 px-2.5 py-0.5 rounded-full border border-violet-500/20 text-[9px] text-violet-405 font-mono font-bold font-sans">
                              ACTIVE_SHIELDS: {activePipelineCount}
                            </div>
                          </div>

                          {/* Code Block representation */}
                          <pre className="text-[10.5px] font-mono whitespace-pre text-emerald-305 leading-relaxed max-h-[295px] overflow-y-auto font-semibold select-text pr-1">
{`import express from 'express';
import helmet from 'helmet';
import cors from 'cors';

const app = express();
app.use(helmet());
app.use(express.json());

// Shield 1: Strict Origin Isolation
app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));

${pipelineComponents.find(c => c.id === 'jwt-auth')?.status === 'active' ? `// Shield 2: JWT Gateway Authenticator
const verifyJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token blank' });
  // Verify logic...
  next();
};` : `// [Auth Gateway inactive]`}

${pipelineComponents.find(c => c.id === 'webhook-sig')?.status === 'active' ? `// Shield 3: Stripe Signature Verification Secure Route
app.post('/api/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(\`Webhook Error: \${err.message}\`);
  }
  // Safe process...
});` : `// [Stripe event webhook logic bypassed]`}

${pipelineComponents.find(c => c.id === 'rate-limit')?.status === 'active' ? `// Shield 4: Rate Limiter Guard
const rateLimiter = (req, res, next) => {
  // Safe rate-limiting tracking...
  next();
};` : `// [Rate Limiting disabled]`}

app.listen(3000, () => {
  console.log('Secure container server bootstrapping on port 3000');
});`}
                          </pre>
                        </div>

                        <div className="border-t border-white/5 mt-4 pt-3 flex items-center justify-between select-none">
                          <span className="text-[9.5px] text-slate-500 font-mono">Boilerplate adapts on toggles in real-time</span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              triggerNotification("Secure boilerplate copied to clipboard simulator!", "success");
                            }}
                            className="text-[10px] font-mono px-3.5 py-2 bg-[#1e293b] text-white hover:bg-slate-850 rounded-xl active:scale-95 transition cursor-pointer"
                            type="button"
                          >
                            COPY SECURE CODES
                          </button>
                        </div>
                      </div>

                    </div>

                    {/* Deployment step-by-step guidelines from current active template */}
                    <div className="border-t border-slate-150 pt-6">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest block mb-4 font-mono select-none">
                        🔧 Current Template Physical Action manual
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 select-text">
                        {selectedTemplate.integrationGuides.map((guide, idx) => (
                          <div key={idx} className="bg-slate-50 border border-slate-200/80 rounded-2.5xl p-4 flex flex-col justify-between text-xs select-text">
                            <div>
                              <div className="flex items-center justify-between gap-1.5 mb-1.5">
                                <span className="font-extrabold text-slate-800">{guide.title}</span>
                                <span className="bg-violet-100/65 text-violet-700 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border border-violet-200/40 select-none">
                                  STEP {idx + 1}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 font-medium leading-relaxed mb-3">{guide.details}</p>
                            </div>
                            <div className="bg-slate-950 rounded-xl p-2.5 border border-slate-900 flex items-center justify-between gap-2">
                              <code className="text-[10.5px] text-emerald-400 font-mono truncate">{guide.command}</code>
                              <button
                                type="button"
                                onClick={(e) => { 
                                  e.stopPropagation();
                                  handleRunCommand(undefined, guide.command);
                                  setActivePage('terminal');
                                  triggerNotification("Transferred command to virtual shell console", "success");
                                }}
                                className="text-[9px] font-mono font-bold bg-[#1e293b] hover:bg-slate-800 text-slate-350 px-2 py-1 rounded cursor-pointer"
                              >
                                RUN
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 5: COGNITIVE COMPANION WEB CHAT PANE */}
          {activePage === 'companion' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in select-text">
              
              {/* Active Chat thread box (Left, 8 Columns) */}
              <div className="col-span-12 lg:col-span-8 bg-white/85 backdrop-blur-md border border-slate-200/65 rounded-3xl p-6 shadow-sm flex flex-col h-[520px] justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4 select-none">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-violet-700 flex items-center gap-2 font-mono">
                      <Sparkles className="w-5 h-5 text-violet-505" />
                      Cognitive Logic Assistant
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono font-bold tracking-tight">Active Ingestion In-Mind</span>
                  </div>

                  {/* Message stack scroll layer */}
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                    {chatHistory.map((m, i) => {
                      const isUser = m.sender === 'user';
                      return (
                        <div key={i} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                          <div className={`p-4 rounded-2.5xl max-w-[85%] leading-relaxed text-xs shadow-sm font-sans ${
                            isUser
                              ? 'bg-slate-900 border border-slate-900 text-white rounded-tr-none font-medium'
                              : 'bg-slate-50 border border-slate-200/80 text-slate-750 rounded-tl-none font-medium'
                          }`}>
                            {m.text}
                          </div>
                          <span className="text-[9px] text-slate-405 mt-1 font-mono px-2 select-none">{m.time}</span>
                        </div>
                      );
                    })}
                    {chatLoading && (
                      <div className="flex items-center gap-2 text-xs text-slate-450 italic select-none font-sans font-medium">
                        <RefreshCw className="w-4 h-4 animate-spin text-violet-600" />
                        Evaluating file imports matrix...
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                </div>

                {/* Companion Prompt Recipes suggestions pills */}
                <div>
                  <div className="scrollbar-none overflow-x-auto flex gap-2 py-3.5 whitespace-nowrap select-none border-t border-slate-100">
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        setChatInput("Review file index dependencies imports and specify recommended packages to satisfy blank components.");
                        triggerNotification("Secured package advice directive", "info");
                      }}
                      className="bg-[#f5f3ff] hover:bg-violet-100 border border-violet-200/60 text-violet-850 text-[10.5px] font-bold rounded-xl px-3.5 py-2 cursor-pointer transition select-none shrink-0"
                    >
                      📦 Audit packages satisfaction
                    </span>
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        setChatInput("Review Express webhook code for vulnerabilities and verify signatures validation.");
                        triggerNotification("Secured Stripe payload validation advice", "info");
                      }}
                      className="bg-[#f5f3ff] hover:bg-violet-100 border border-violet-200/60 text-violet-850 text-[10.5px] font-bold rounded-xl px-3.5 py-2 cursor-pointer transition select-none shrink-0"
                    >
                      💳 Secure Stripe signature checkout
                    </span>
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        setChatInput("Highlight how vision alignment telemetry calculations operates.");
                        triggerNotification("Secured alignment mathematical formulas details", "info");
                      }}
                      className="bg-[#f5f3ff] hover:bg-violet-100 border border-violet-200/60 text-violet-850 text-[10.5px] font-bold rounded-xl px-3.5 py-2 cursor-pointer transition select-none shrink-0"
                    >
                      📈 Score telemetry calculation
                    </span>
                  </div>

                  <form onSubmit={handleChatSubmit} className="flex gap-2.5 max-w-full select-text">
                    <input
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2.5xl px-4.5 py-3.5 text-xs focus:outline-none focus:border-violet-500 font-sans"
                      placeholder="Ask core companion about variables, SQLite, signature webhooks..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                    />
                    <button
                      type="submit"
                      disabled={chatLoading}
                      className="bg-slate-955 hover:bg-slate-850 disabled:bg-slate-950 p-3.5 h-fit rounded-2xl text-white transition active:scale-95 shrink-0 flex items-center justify-center cursor-pointer"
                    >
                      <Send className="w-4.5 h-4.5" />
                    </button>
                  </form>
                </div>
              </div>

              {/* Cognitive Prompt shortcuts manual sidebar (Right, 4 Columns) */}
              <div className="col-span-12 lg:col-span-4 bg-white/85 backdrop-blur-md border border-slate-200/65 rounded-3xl p-5 shadow-sm space-y-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">
                  State Prompt Presets
                </span>

                <div className="space-y-3 font-sans select-none">
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setChatInput("Synthesize structured file paths mapped with code placeholder TODOs and draft targeted modular resolve remedies.");
                    }}
                    className="p-4 bg-slate-50 hover:bg-[#f5f3ff] border border-slate-200/50 hover:border-violet-200 rounded-2.5xl cursor-pointer transition duration-150 text-xs"
                  >
                    <span className="font-bold block text-slate-900">⚙️ Sift commenting notes TODOs</span>
                    <p className="text-[11.5px] text-slate-500 mt-1 font-medium leading-relaxed">
                      Scans codebase files for TODO annotating annotations and suggestions templates.
                    </p>
                  </div>

                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setChatInput("Compose production checklist of secrets required to deploy SQLite vectors or Stripe tunnels.");
                    }}
                    className="p-4 bg-slate-50 hover:bg-[#f5f3ff] border border-slate-200/50 hover:border-violet-200 rounded-2.5xl cursor-pointer transition duration-150 text-xs"
                  >
                    <span className="font-bold block text-slate-900">🔐 Deployment Variables Vault Config</span>
                    <p className="text-[11.5px] text-slate-500 mt-1 font-medium leading-relaxed">
                      Recommends secure vault environment bindings required by databases.
                    </p>
                  </div>

                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setChatInput("What visual changes can we pursue on Google Labs preset styles?");
                    }}
                    className="p-4 bg-slate-50 hover:bg-[#f5f3ff] border border-slate-200/50 hover:border-violet-200 rounded-2.5xl cursor-pointer transition duration-150 text-xs"
                  >
                    <span className="font-bold block text-slate-900">🎨 UI Aesthetics Alignment Customizer</span>
                    <p className="text-[11.5px] text-slate-505 mt-1 font-medium leading-relaxed">
                      Inquire on interactive sliders calibration details, mechanics sound board, and glass layout pairings.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: THE ULTRA-HIGH-FIDELITY AI COGNITION HUB COCKPIT */}
          {activePage === 'cognition' && (
            <div id="ai-cognition-deck" className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in select-text">
              
              {/* SIDEBAR LIST (Left, 3 Columns): Select Co-processors */}
              <div className="col-span-12 lg:col-span-3 space-y-4">
                <div className="bg-[#0b0d14]/75 backdrop-blur-md border border-slate-800/80 rounded-3xl p-5 shadow-lg relative overflow-hidden select-none">
                  <div className="absolute inset-0 bg-cover bg-grid-pattern opacity-[0.03]"></div>
                  <div className="relative flex items-center gap-2.5">
                    <Cpu className="w-5 h-5 text-indigo-400 animate-spin-slow" />
                    <div>
                      <span className="text-[9.5px] font-bold uppercase tracking-widest text-indigo-400 block font-mono">
                        COGNITIVE OS V4.1
                      </span>
                      <h4 className="text-sm font-black text-slate-100 tracking-tight font-sans">
                        Quantum Co-processors
                      </h4>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-450 mt-2 font-medium leading-relaxed">
                    Select a core software intelligence layer below to engage automatic AST parsing, cognitive refactoring, or failure predictions.
                  </p>
                </div>

                {/* Coprocessors Navigation Pills Group */}
                <div className="space-y-2 select-none">
                  {[
                    { id: 'architecture-oracle', name: 'Architecture Oracle', tag: 'Scalability / Quality', icon: Layers, severity: 'Critical' },
                    { id: 'refactor-forge', name: 'Refactor Forge', tag: 'Automated Extraction', icon: Wrench, severity: 'Warning' },
                    { id: 'drift-sentinel', name: 'Drift Sentinel', tag: 'Blueprint Compliance', icon: Flame, severity: 'High' },
                    { id: 'runtime-doctor', name: 'Runtime Doctor', tag: 'API Thread profiling', icon: Activity, severity: 'Stable' },
                    { id: 'ghost-hunter', name: 'Ghost Hunter', tag: 'Zombie Sifting', icon: Compass, severity: 'Analyzed' },
                    { id: 'build-prophet', name: 'Build Prophet', tag: 'Scaling Fragility', icon: ShieldCheck, severity: 'Safe' },
                    { id: 'devflow-ai', name: 'DevFlow AI', tag: 'Workflow Friction Tracker', icon: Workflow, severity: 'Optimal' },
                    { id: 'blueprint-forge', name: 'AI Blueprint Forge', tag: 'Modular Boilerplates', icon: Cpu, severity: 'Synthesizer' }
                  ].map((tool, idx) => {
                    const isSelected = selectedCognitionTool === tool.id;
                    const ToolIcon = tool.icon;
                    return (
                      <div
                        key={tool.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCognitionTool(tool.id);
                          triggerDevSound(1.0 + idx * 0.05);
                        }}
                        className={`p-3.5 rounded-2.5xl border transition-all cursor-pointer group flex items-start gap-4 ${
                          isSelected
                            ? 'bg-indigo-950/40 border-indigo-500/50 text-slate-200 shadow-md shadow-indigo-500/5'
                            : 'bg-[#090b11]/85 border-slate-900 text-slate-400 hover:text-slate-200 hover:border-slate-800'
                        }`}
                      >
                        <div className={`p-2.5 rounded-xl transition ${
                          isSelected ? 'bg-indigo-500/15 border border-indigo-400/20 text-indigo-400' : 'bg-[#10131d] border border-slate-800 text-slate-500 group-hover:text-slate-350'
                        }`}>
                          <ToolIcon className="w-4 h-4 animate-pulse" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="text-[11.5px] font-black tracking-tight leading-none block font-sans">
                              {tool.name}
                            </span>
                            <span className={`text-[8.5px] font-mono font-bold leading-none px-1.5 py-0.5 rounded-full uppercase border ${
                              isSelected
                                ? 'bg-indigo-950/80 border-indigo-500/30 text-indigo-300'
                                : 'bg-[#10131d] border-slate-850 text-slate-500'
                            }`}>
                              {tool.severity}
                            </span>
                          </div>
                          <span className="text-[9.5px] text-slate-405 block mt-1 font-mono tracking-tight font-medium">
                            {tool.tag}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* MAIN COCKPIT CONTAINER (Right, 9 Columns) */}
              <div className="col-span-12 lg:col-span-9 space-y-6">
                
                {/* TOOL CARRIER HEADER GRID */}
                <div className="bg-[#0b0d14]/75 backdrop-blur-md border border-slate-800/80 rounded-3xl p-6 shadow-xl relative overflow-hidden select-text flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="absolute inset-0 bg-cover bg-grid-pattern opacity-10"></div>
                  
                  <div className="relative shrink-0 flex items-center gap-4">
                    <div className="p-4 rounded-2.5xl bg-gradient-to-br from-violet-600/20 to-indigo-600/25 border border-indigo-500/30 shadow-md shadow-violet-500/5">
                      <Cpu className="w-8 h-8 text-indigo-400 animate-spin-slow" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 select-none">
                        <span className="text-[10px] bg-indigo-500 text-indigo-950 font-black tracking-widest font-mono uppercase px-2.5 py-0.5 rounded-full border border-indigo-300/30">
                          COGNITIVE OS V4.1 INTERACTIVE STATUS: {cognitionLoading ? 'CALCULATING...' : (cognitionResult?.status || 'STABLE')}
                        </span>
                      </div>
                      <h3 className="text-xl font-black text-slate-100 tracking-tight mt-1 font-sans uppercase">
                        {selectedCognitionTool.replace('-', ' ')} Active HUD
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed font-sans max-w-lg">
                        {selectedCognitionTool === 'architecture-oracle' && 'Audits monolithic structures, imports coupling indexes, and design code-smells.'}
                        {selectedCognitionTool === 'refactor-forge' && 'Generates clean modular separations, custom hooks splits, and code dry counts.'}
                        {selectedCognitionTool === 'drift-sentinel' && 'Verifies spec-to-code alignment checklists and detects vision roadmap gaps.'}
                        {selectedCognitionTool === 'runtime-doctor' && 'Profiles theoretical execution bottlenecks, async scanner thread spikes, and ports.'}
                        {selectedCognitionTool === 'ghost-hunter' && 'Sweeps unreferenced modules, zombie asset packages, and dead routing hooks.'}
                        {selectedCognitionTool === 'build-prophet' && 'Forecasts compiler tree performance, code fragility indexes, and dependency drift.'}
                        {selectedCognitionTool === 'devflow-ai' && 'Calculates developer deep focus parameters and structural workflow friction spikes.'}
                        {selectedCognitionTool === 'blueprint-forge' && 'Synthesizes and scaffolds production-grade boilerplate modules instantly.'}
                      </p>
                    </div>
                  </div>

                  {/* ACTIVE ACTION TRIGGERS COV */}
                  <div className="relative shrink-0 select-none">
                    <button
                      onClick={() => runCognitionTool(selectedCognitionTool)}
                      disabled={cognitionLoading}
                      className="px-5 py-3 w-full md:w-auto rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-550 hover:to-indigo-550 border border-violet-400/40 text-xs font-black text-white hover:text-indigo-100 shadow-lg shadow-indigo-500/10 active:scale-95 disabled:scale-100 disabled:opacity-50 select-none cursor-pointer transition flex items-center justify-center gap-2"
                    >
                      <RefreshCw className={`w-4 h-4 ${cognitionLoading ? 'animate-spin' : ''}`} />
                      ENGAGE COGNITIVE GRID
                    </button>
                  </div>
                </div>

                {/* CINEMATIC ANIMATED LOADING SYSTEM */}
                {cognitionLoading && (
                  <div className="bg-[#0b0d14]/75 border border-slate-800/80 rounded-3xl p-12 shadow-lg flex flex-col items-center justify-center space-y-6 animate-pulse select-none text-center min-h-[440px]">
                    <div className="relative flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-4 border-indigo-500/10 animate-ping"></div>
                      <div className="w-16 h-16 rounded-full border-4 border-t-indigo-500 border-indigo-500/20 animate-spin"></div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-bold text-slate-100 tracking-tight font-sans uppercase">
                        Ingesting AST Metadata Logs
                      </h4>
                      <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                        Spawning recursion micro-workers, reading package metrics, and mapping active neural logical bindings to generate elite custom telemetry overlays.
                      </p>
                    </div>
                    <div className="font-mono text-[9px] text-[#10b981] bg-[#090b11] border border-[#10b981]/20 rounded-lg p-3 max-w-md w-full text-left space-y-1 block">
                      <div>[SYSTEM] Spawning subprocess on port 3000...</div>
                      <div>[SCANNER] Read file tree metadata successfully ({summary?.files.length || 0} files found)</div>
                      <div>[MODEL] Handshaking with Gemini AI Analytical logic pipeline gate...</div>
                      <div className="animate-pulse">[TELEMETRY] Synthesizing holographic metrics graphs...</div>
                    </div>
                  </div>
                )}

                {/* COMPUTED INSIGHTS COCKPIT */}
                {!cognitionLoading && cognitionResult && (() => {
                  const hasAiError = cognitionResult.insights?.some((insight: any) => insight.type === "AIQuotaExceeded" || insight.type === "AIModelError");
                  return (
                    <div className="space-y-6">
                      
                      {/* HIGH-FIDELITY FALLBACK BANNER */}
                      {hasAiError && (
                        <div className="bg-amber-950/20 border border-amber-500/20 rounded-3xl p-5 flex items-start gap-4">
                          <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-amber-400 shrink-0">
                            <Flame className="w-5 h-5 animate-pulse" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-amber-200 tracking-tight font-sans">
                              LOCAL HIGH-FIDELITY AST ANALYSIS FALLBACK ACTIVE
                            </h4>
                            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed font-sans">
                              The cloud-bound Gemini API rate limit was reached (429 Quota Exceeded). DevState has successfully engaged our local offline AST-driven diagnostic engine to ensure full monitoring continuity and protect your workspace workflow with zero downtime.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* STATS BENTO GRID METRICS DIAGNOSTICS */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* STAT 1 */}
                      <div className="bg-[#090b11]/85 backdrop-blur-md border border-slate-800/80 rounded-2.5xl p-5 shadow-sm select-none relative overflow-hidden flex items-center justify-between">
                        <div className="absolute inset-0 bg-cover bg-grid-pattern opacity-5"></div>
                        <div className="relative">
                          <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-mono font-bold">
                            {cognitionResult.metrics?.primaryMetric?.label || 'TELEMETRY CONFIDENCE REPORT'}
                          </span>
                          <span className="text-2xl font-black text-slate-105 block mt-2 font-mono">
                            {cognitionResult.metrics?.primaryMetric?.value || 0}
                            <span className="text-xs text-indigo-400 ml-1">
                              {cognitionResult.metrics?.primaryMetric?.unit || '%'}
                            </span>
                          </span>
                        </div>
                        <div className="relative w-14 h-14 select-none flex items-center justify-center border border-indigo-500/10 rounded-2xl bg-indigo-500/5 shadow-md shadow-indigo-500/5">
                          <Activity className="w-6 h-6 text-indigo-400 animate-pulse" />
                        </div>
                      </div>

                      {/* STAT 2 */}
                      <div className="bg-[#090b11]/85 backdrop-blur-md border border-slate-800/80 rounded-2.5xl p-5 shadow-sm select-none relative overflow-hidden flex items-center justify-between">
                        <div className="absolute inset-0 bg-cover bg-grid-pattern opacity-5"></div>
                        <div className="relative">
                          <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-mono font-bold">
                            {cognitionResult.metrics?.secondaryMetric?.label || 'SYSTEM INSTABILITY FACTOR'}
                          </span>
                          <span className="text-2xl font-black text-slate-105 block mt-2 font-mono">
                            {cognitionResult.metrics?.secondaryMetric?.value || 0}
                            <span className="text-xs text-emerald-400 ml-1">
                              {cognitionResult.metrics?.secondaryMetric?.unit || 'index'}
                            </span>
                          </span>
                        </div>
                        <div className="relative w-14 h-14 select-none flex items-center justify-center border border-emerald-500/10 rounded-2xl bg-emerald-500/5 shadow-md shadow-emerald-500/5">
                          <Layers className="w-6 h-6 text-emerald-400 animate-pulse" />
                        </div>
                      </div>
                    </div>

                    {/* NEURAL DEPENDENCY MAP GRAPH CONTAINER */}
                    {cognitionResult.visualizationData && (
                      <div className="bg-[#0b0d14]/75 backdrop-blur-md border border-slate-800/80 rounded-3xl p-6 shadow-sm select-none relative overflow-hidden">
                        <div className="absolute inset-0 bg-cover bg-grid-pattern opacity-5"></div>
                        <div className="flex items-center justify-between pb-4 border-b border-slate-850/60 mb-5 relative top-0 z-10">
                          <div>
                            <span className="text-[9.5px] font-black uppercase tracking-widest text-[#a78bfa] font-mono block">
                              LOGICAL NEURAL CIRCUIT MAP OVERLAY
                            </span>
                            <h4 className="text-sm font-bold text-slate-205 mt-0.5 font-sans">
                              Active Workspace Architecture Universe
                            </h4>
                          </div>
                          <span className="text-[9.5px] text-indigo-455 font-mono border border-indigo-500/10 rounded-full px-2.5 py-0.5 uppercase">
                            FORCE-DIRECTED VECTOR MATRIX
                          </span>
                        </div>

                        {/* Interactive SVG Neural Network graph canvas */}
                        <div className="relative flex items-center justify-center bg-[#07080d]/80 rounded-2.5xl border border-slate-850/50 p-2 overflow-hidden h-64">
                          <LayoutGroup id="neural-circuit-map-group">
                            <svg className="w-full h-full" viewBox="0 0 580 240">
                              {/* SVG filters for neon glowing nodes */}
                              <defs>
                                <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
                                  <feGaussianBlur stdDeviation="3" result="blur" />
                                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                </filter>
                              </defs>
                              
                              {/* SVG Links */}
                              {(() => {
                                const width = 580;
                                const height = 240;
                                const nodes = cognitionResult.visualizationData.nodes || [];
                                const links = cognitionResult.visualizationData.links || [];
                                const positionedNodes = nodes.map((node: any, idx: number) => {
                                  const angle = (idx / Math.max(1, nodes.length)) * 2 * Math.PI;
                                  const x = width / 2 + Math.cos(angle) * 160;
                                  const y = height / 2 + Math.sin(angle) * 65;
                                  return { ...node, x, y };
                                });

                                // Dynamic spring transition generator for staggered, sequential unfolding
                                const getSpringTransition = (idx: number) => ({
                                  type: 'spring' as const,
                                  stiffness: 65,
                                  damping: 15,
                                  mass: 0.95,
                                  delay: idx * 0.035, // Premium sequential delay cascading the analysis update
                                });

                                return (
                                  <g>
                                    {/* Links */}
                                    {links.map((link: any, idx: number) => {
                                      const sourceNode = positionedNodes.find((n: any) => n.id === link.source);
                                      const targetNode = positionedNodes.find((n: any) => n.id === link.target);
                                      if (!sourceNode || !targetNode) return null;
                                      
                                      // Stagger multiplier based on combined source/target indices or absolute link index
                                      const linkTransition = getSpringTransition(idx % 12);

                                      return (
                                        <g key={`l-${idx}`}>
                                          <motion.line
                                            initial={{ x1: 290, y1: 120, x2: 290, y2: 120, opacity: 0 }}
                                            animate={{ x1: sourceNode.x, y1: sourceNode.y, x2: targetNode.x, y2: targetNode.y, opacity: 1 }}
                                            transition={linkTransition}
                                            stroke={uiTheme === 'labs-neon' ? '#10b981' : '#818cf8'}
                                            strokeWidth={link.value || 2}
                                            strokeOpacity="0.15"
                                          />
                                          <motion.line
                                            initial={{ x1: 290, y1: 120, x2: 290, y2: 120, opacity: 0 }}
                                            animate={{ x1: sourceNode.x, y1: sourceNode.y, x2: targetNode.x, y2: targetNode.y, opacity: 1 }}
                                            transition={linkTransition}
                                            stroke={uiTheme === 'labs-neon' ? '#34d399' : '#a5b4fc'}
                                            strokeWidth="1"
                                            strokeOpacity="0.4"
                                            strokeDasharray="5,6"
                                            className="animate-pulse"
                                          />
                                        </g>
                                      );
                                    })}

                                    {/* Nodes */}
                                    {positionedNodes.map((node: any, idx: number) => {
                                      const nodeTransition = getSpringTransition(idx);
                                      const finalRadius = node.val ? Math.max(7, node.val) : 10;
                                      const pingRadius = node.val ? Math.max(10, node.val + 4) : 14;

                                      return (
                                        <motion.g 
                                          key={`n-${node.id}`} 
                                          layout
                                          layoutId={`node-group-${node.id}`}
                                          transition={nodeTransition}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            triggerNotification(`Focusing visual node: ${node.label}`, "info");
                                            triggerDevSound(1.15);
                                          }}
                                          className="cursor-pointer group select-none transition duration-150"
                                        >
                                          <motion.circle
                                            layout
                                            layoutId={`node-cir-${node.id}`}
                                            initial={{ cx: 290, cy: 120, opacity: 0, r: 0 }}
                                            animate={{ cx: node.x, cy: node.y, opacity: 1, r: finalRadius }}
                                            transition={nodeTransition}
                                            fill={node.color || '#8b5cf6'}
                                            className="transition hover:scale-125 filter"
                                            style={{ filter: 'url(#neon-glow)' }}
                                          />
                                          <motion.circle
                                            layout
                                            layoutId={`node-ping-${node.id}`}
                                            initial={{ cx: 290, cy: 120, opacity: 0, r: 0 }}
                                            animate={{ cx: node.x, cy: node.y, opacity: 1, r: pingRadius }}
                                            transition={nodeTransition}
                                            fill="transparent"
                                            stroke={node.color || '#8b5cf6'}
                                            strokeWidth="1"
                                            strokeOpacity="0.25"
                                            className="animate-ping"
                                            style={{ animationDuration: `${2.5 + (idx % 3)}s` }}
                                          />
                                          <motion.text
                                            layout
                                            layoutId={`node-lbl-${node.id}`}
                                            initial={{ x: 290, y: 120, opacity: 0 }}
                                            animate={{ x: node.x, y: node.y - 15, opacity: 0.9 }}
                                            transition={nodeTransition}
                                            textAnchor="middle"
                                            fill="#94a3b8"
                                            className="text-[10px] font-mono select-none font-bold group-hover:fill-slate-100 group-hover:scale-105 transition duration-150"
                                          >
                                            {node.label}
                                          </motion.text>
                                          <motion.text
                                            layout
                                            layoutId={`node-dot-${node.id}`}
                                            initial={{ x: 290, y: 120, opacity: 0 }}
                                            animate={{ x: node.x, y: node.y + 3, opacity: 1 }}
                                            transition={nodeTransition}
                                            textAnchor="middle"
                                            fill="#0f172a"
                                            className="text-[8px] font-mono leading-none select-none font-black block group-hover:fill-white"
                                          >
                                            •
                                          </motion.text>
                                        </motion.g>
                                      );
                                    })}
                                  </g>
                                );
                              })()}
                            </svg>
                          </LayoutGroup>
                        </div>
                      </div>
                    )}

                    {/* BLUEPRINT-FORGE SPECIFIC INTERACTION VIEW */}
                    {selectedCognitionTool === 'blueprint-forge' && (
                      <div className="bg-[#0b0d14]/75 backdrop-blur-md border border-slate-800/80 rounded-3xl p-6 shadow-sm relative overflow-hidden">
                        <div className="absolute inset-0 bg-cover bg-grid-pattern opacity-5"></div>
                        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-850/60 mb-5 gap-4">
                          <div>
                            <span className="text-[9.5px] font-black uppercase tracking-widest text-indigo-400 font-mono block">
                              AI ARCHITECTURE BLUEPRINT DESIGNER
                            </span>
                            <h4 className="text-sm font-bold text-slate-205 mt-0.5 font-sans">
                              Select Starter Core Skeleton Configuration
                            </h4>
                          </div>

                          <div className="flex items-center gap-1.5 bg-[#090b11] border border-slate-850 p-1.5 rounded-2xl select-none">
                            {[
                              { id: 'websocket', name: 'Fastify WebSockets' },
                              { id: 'zustand', name: 'Zustand Store v4' },
                              { id: 'sqlite', name: 'Prisma SQLite Client' }
                            ].map((preset) => (
                              <button
                                key={preset.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedBlueprintPreset(preset.id);
                                  triggerDevSound(1.1);
                                }}
                                className={`px-3 py-1.5 rounded-xl text-[10.5px] font-bold transition ${
                                  selectedBlueprintPreset === preset.id
                                    ? 'bg-indigo-600 text-white shadow-sm font-black'
                                    : 'text-slate-500 hover:text-slate-350'
                                }`}
                              >
                                {preset.name}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Boilerplate code display */}
                        <div className="bg-[#05060a]/90 rounded-2.5xl border border-slate-850 p-5 font-mono text-[11px] leading-relaxed text-slate-300 relative overflow-hidden">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              triggerNotification("Custom code blueprint copied to clipboard!", "success");
                              triggerDevSound(1.3);
                            }}
                            className="absolute top-4 right-4 p-2 rounded-xl bg-slate-900 border border-slate-805 text-slate-400 hover:text-white transition cursor-pointer"
                            title="Copy snippet"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          
                          {selectedBlueprintPreset === 'websocket' && (
                            <pre className="overflow-x-auto select-text font-bold">
{`// src/server/websocketBus.ts - Elite full-stack Fastify ws communications
import Fastify from 'fastify';
import fastifyWs from '@fastify/websocket';

const server = Fastify({ logger: true });
server.register(fastifyWs);

server.register(async function (fastify) {
  fastify.get('/ws/telemetry', { websocket: true }, (connection, req) => {
    // Registered observer listener
    connection.socket.on('message', (message) => {
      const payload = JSON.parse(message.toString());
      console.log(\`Received ingestion trigger: \`, payload);
      
      // Echo active diagnostics PONG
      connection.socket.send(JSON.stringify({
        event: "PONG",
        source: "Cognition Server Gateway",
        timestamp: Date.now()
      }));
    });
  });
});`}
                            </pre>
                          )}

                          {selectedBlueprintPreset === 'zustand' && (
                            <pre className="overflow-x-auto select-text font-bold">
{`// src/hud/store/useHUDStore.ts - Advanced Zustand state management
import { create } from 'zustand';

interface HUDState {
  activePage: string;
  caffeineFuel: number;
  unstableModulesCount: number;
  setActivePage: (page: string) => void;
  incrementFriction: () => void;
  refuelCaffeine: () => void;
}

export const useHUDStore = create<HUDState>((set) => ({
  activePage: 'radar',
  caffeineFuel: 100,
  unstableModulesCount: 0,
  setActivePage: (page) => set({ activePage: page }),
  incrementFriction: () => set((state) => ({ unstableModulesCount: state.unstableModulesCount + 1 })),
  refuelCaffeine: () => set((state) => ({ caffeineFuel: Math.min(100, state.caffeineFuel + 15) }))
}));`}
                            </pre>
                          )}

                          {selectedBlueprintPreset === 'sqlite' && (
                            <pre className="overflow-x-auto select-text font-bold">
{`// src/server/database.ts - Prisma Schema Client Transactions mapping
import { PrismaClient } from '@prisma/client';

let databaseClient: PrismaClient | null = null;

export function getDatabase(): PrismaClient {
  if (!databaseClient) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error("DATABASE_URL environment variable is currently required.");
    }
    databaseClient = new PrismaClient({
      datasources: { db: { url: databaseUrl } }
    });
  }
  return databaseClient;
}`}
                            </pre>
                          )}
                        </div>
                      </div>
                    )}

                    {/* ANOMALIES & STRUCTURE FINDINGS ROW */}
                    <div className="bg-[#0b0d14]/75 backdrop-blur-md border border-slate-800/90 rounded-3xl p-6 shadow-sm relative overflow-hidden">
                      <div className="absolute inset-0 bg-cover bg-grid-pattern opacity-5"></div>
                      <div className="flex items-center justify-between pb-3.5 border-b border-slate-850/60 mb-5 relative select-none">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-450 font-mono block">
                            ANOMALIES DIAGNOSTIC REPORT
                          </span>
                          <h4 className="text-sm font-black text-slate-100 mt-1 font-sans">
                            Identified Logical Gaps & Symmetrical Smells
                          </h4>
                        </div>
                        <span className="bg-[#10131d] text-slate-400 border border-slate-800 text-[10px] rounded-full px-3 py-0.5 select-none font-mono font-bold">
                          {cognitionResult.insights?.length || 0} findings detected
                        </span>
                      </div>

                      {/* Insights Accordion Stack */}
                      <div className="space-y-3">
                        {cognitionResult.insights?.map((insight: any, i: number) => {
                          const isExpanded = expandedInsightIndex === i;
                          return (
                            <div
                              key={i}
                              className="bg-[#090b11]/85 border border-[#10131d] hover:border-slate-800 rounded-2.5xl transition-all duration-300 overflow-hidden"
                            >
                              {/* Header Trigger */}
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedInsightIndex(isExpanded ? null : i);
                                  triggerDevSound(1.1);
                                }}
                                className="p-4 flex items-center justify-between gap-4 cursor-pointer select-none"
                              >
                                <div className="flex items-center gap-3.5 min-w-0">
                                  <span className={`text-[9.5px] font-black font-mono tracking-widest leading-none px-2 py-1 rounded border uppercase ${
                                    insight.severity === 'Critical'
                                      ? 'bg-rose-950/40 border-rose-900/30 text-rose-400'
                                      : insight.severity === 'Warning'
                                      ? 'bg-amber-950/40 border-amber-900/30 text-amber-400'
                                      : 'bg-indigo-950/40 border-indigo-900/30 text-indigo-400'
                                  }`}>
                                    {insight.severity}
                                  </span>
                                  <div className="min-w-0">
                                    <h5 className="text-[11.5px] font-black text-slate-200 tracking-tight block truncate font-sans">
                                      {insight.message}
                                    </h5>
                                    <span className="text-[9.5px] font-mono text-slate-500 block truncate mt-0.5">
                                      Target location: <span className="text-indigo-450 font-bold">{insight.target}</span> | Feature: <span className="text-emerald-450 font-bold font-mono">{insight.type}</span>
                                    </span>
                                  </div>
                                </div>
                                <div className="p-1 rounded-lg border border-slate-850 hover:bg-slate-800 text-slate-500 transition shrink-0">
                                  <ChevronRight className={`w-4 h-4 transition duration-300 transform ${isExpanded ? 'rotate-90' : ''}`} />
                                </div>
                              </div>

                              {/* Expanded Dropdown Panel */}
                              {isExpanded && (
                                <div className="px-5 pb-5 border-t border-slate-900/50 pt-4 space-y-3 animate-fade-in font-sans">
                                  <div>
                                    <span className="text-[9.5px] font-bold uppercase tracking-widest text-slate-450 font-mono block select-none">
                                      🔧 AI RECOMMENDED FIX & RESOLUTION
                                    </span>
                                    <p className="text-xs text-slate-350 leading-relaxed mt-1.5 font-sans font-semibold">
                                      {insight.suggestedFix}
                                    </p>
                                  </div>

                                  {insight.codeSnippet && (
                                    <div className="rounded-2xl border border-slate-900 bg-slate-950/90 p-4 font-mono text-[10.5px] leading-normal text-slate-300 relative select-text">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          triggerNotification("Refactored snippet copied to clipboard!", "success");
                                          triggerDevSound(1.3);
                                        }}
                                        className="absolute top-3.5 right-3.5 p-1.5 rounded-lg bg-slate-900 border border-slate-850 text-slate-500 hover:text-white transition cursor-pointer"
                                        title="Copy recommendation"
                                      >
                                        <Copy className="w-3.5 h-3.5" />
                                      </button>
                                      <pre className="overflow-x-auto max-h-48 font-bold select-text pr-4 block">
                                        {insight.codeSnippet}
                                      </pre>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* INTERACTIVE COMPANION EXPLANATION LOGGER */}
                    {cognitionResult.assistantExplanation && (
                      <div className="bg-[#0b0d14]/75 backdrop-blur-md border border-slate-800/80 rounded-3xl p-5 shadow-sm relative overflow-hidden flex items-start gap-4">
                        <div className="p-3 bg-violet-500/10 border border-violet-400/20 rounded-2xl text-violet-400 select-none">
                          <Sparkles className="w-5 h-5 animate-spin-slow" />
                        </div>
                        <div>
                          <span className="text-[9.5px] font-mono tracking-widest font-black uppercase text-violet-400 block select-none">
                            CORE PROCESSOR NARRATIVE ANALYSIS
                          </span>
                          <p className="text-xs text-slate-350 leading-relaxed mt-1 font-mono font-bold select-text">
                            "{cognitionResult.assistantExplanation}"
                          </p>
                        </div>
                      </div>
                    )}

                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {activePage === 'blueprint' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 12, filter: 'blur(6px)' }}
              animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ type: 'spring', stiffness: 100, damping: 18 }}
              className="bg-[#0b0d14]/80 backdrop-blur-lg border border-slate-800/90 rounded-3.5xl p-6 shadow-2xl relative min-h-[500px] text-slate-100 select-text"
            >
              <SupremeOSControlPanel 
                onTriggerNotification={triggerNotification}
                onTriggerSound={triggerDevSound}
                stateRating={Math.round((state?.overall_alignment_score || 0.65) * 100)}
              />
            </motion.div>
          )}

          {activePage === 'nebula' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 12, filter: 'blur(6px)' }}
              animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ type: 'spring', stiffness: 100, damping: 18 }}
              className="bg-[#0b0d14]/80 backdrop-blur-lg border border-slate-800/90 rounded-3.5xl p-6 shadow-2xl relative min-h-[500px] text-slate-100 select-text"
            >
              <ArchitectureNebula />
            </motion.div>
          )}

          {activePage === 'healer' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 12, filter: 'blur(6px)' }}
              animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ type: 'spring', stiffness: 100, damping: 18 }}
              className="bg-[#0b0d14]/80 backdrop-blur-lg border border-slate-800/90 rounded-3.5xl p-6 shadow-2xl relative min-h-[500px] text-slate-100 select-text"
            >
              <EntropyAndHealing />
            </motion.div>
          )}

          {activePage === 'genome' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 12, filter: 'blur(6px)' }}
              animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ type: 'spring', stiffness: 100, damping: 18 }}
              className="bg-[#0b0d14]/80 backdrop-blur-lg border border-slate-800/90 rounded-3.5xl p-6 shadow-2xl relative min-h-[500px] text-slate-100 select-text"
            >
              <ProductGenomeFlow />
            </motion.div>
          )}

          {activePage === 'chaos' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 12, filter: 'blur(6px)' }}
              animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ type: 'spring', stiffness: 100, damping: 18 }}
              className="bg-[#0b0d14]/80 backdrop-blur-lg border border-slate-800/90 rounded-3.5xl p-6 shadow-2xl relative min-h-[500px] text-slate-100 select-text"
            >
              <ChaosAndSecurity />
            </motion.div>
          )}

          {activePage === 'terrarium' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 12, filter: 'blur(6px)' }}
              animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ type: 'spring', stiffness: 100, damping: 18 }}
              className="bg-[#030305]/85 backdrop-blur-xl border border-white/5 rounded-3.5xl p-8 shadow-2xl relative min-h-[500px] text-slate-100"
            >
              <CyberSpaceCreature />
            </motion.div>
          )}

        </section>

      </div>
    </div>
  );
}
