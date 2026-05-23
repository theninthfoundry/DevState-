import React, { useState, useEffect, useRef } from 'react';
import { 
  Cpu, 
  Layers, 
  Activity, 
  Flame, 
  ShieldAlert, 
  Wrench, 
  ShieldCheck, 
  Workflow, 
  Compass, 
  BookOpen, 
  Terminal, 
  Play, 
  RotateCcw, 
  Eye, 
  Clock, 
  Lock, 
  Sparkles, 
  TrendingUp, 
  Zap, 
  HeartHandshake, 
  Radio, 
  Check, 
  AlertTriangle, 
  Dribbble, 
  Coffee,
  HelpCircle,
  TrendingDown,
  Database,
  Unplug,
  DollarSign,
  Users,
  Briefcase,
  ChevronRight,
  Code,
  Sliders,
  AlertOctagon,
  Gauge
} from 'lucide-react';

interface SupremeOSControlPanelProps {
  onTriggerNotification?: (message: string, type?: 'success' | 'info' | 'error') => void;
  onTriggerSound?: (pitch?: number) => void;
  stateRating?: number;
}

export default function SupremeOSControlPanel({ 
  onTriggerNotification = () => {}, 
  onTriggerSound = () => {},
  stateRating = 84 
}: SupremeOSControlPanelProps) {
  // STATE MANAGEMENT FOR ACTIVE VIEWS: 'engines' | 'pricing'
  const [activeTab, setActiveTab] = useState<'engines' | 'pricing'>('engines');
  const [activeInnovation, setActiveInnovation] = useState<number>(0);
  
  // 1. Holographic Architecture Universe
  const [archHoveredNode, setArchHoveredNode] = useState<string | null>(null);
  const [archPulseOn, setArchPulseOn] = useState<boolean>(true);
  
  // 2. Engineering Time Machine
  const [timelineIndex, setTimelineIndex] = useState<number>(4); // Current active sprint
  const [isTimePlaying, setIsTimePlaying] = useState<boolean>(false);
  
  // 3. AI Engineering Memory
  const [memorySearch, setMemorySearch] = useState<string>("");
  
  // 4. Self-Healing Code Infrastructure
  const [isHealing, setIsHealing] = useState<boolean>(false);
  const [healingLogs, setHealingLogs] = useState<string[]>([
    "System standby. Core AST integrity nominal.",
    "✓ Memory cache alignment secured."
  ]);
  const [healingProgress, setHealingProgress] = useState<number>(0);

  // 5. AI Flow State Engine
  const [flowRate, setFlowRate] = useState<number>(85);
  const [isFlowBreathing, setIsFlowBreathing] = useState<boolean>(true);

  // 6. Vision-to-Code Intelligence
  const [visionInput, setVisionInput] = useState<string>("Build a real-time WebSocket messaging spine with automatic Redis failover");
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [synthesizedResult, setSynthesizedResult] = useState<any | null>(null);

  // 7. AI Deployment Orchestrator
  const [deployConfidence, setDeployConfidence] = useState<number>(94);
  const [deployChecks, setDeployChecks] = useState({
    portsBound: true,
    envExampleComplete: true,
    noExposedPrivateKeys: true,
    bundleClean: true
  });

  // 8. Live Chaos Engine
  const [chaosIntensity, setChaosIntensity] = useState<number>(0);
  const [chaosLogs, setChaosLogs] = useState<string[]>([
    "✓ Chaos matrix standby. Ports binding nominal."
  ]);

  // 9. AI Security Observatory
  const [securityHeatLevel, setSecurityHeatLevel] = useState<'nominal' | 'elevated' | 'critical'>('nominal');
  const [activeVulnerabilities, setActiveVulnerabilities] = useState([
    { id: 'v1', name: 'Exposed Wildcard CORS Header Policies', status: 'unresolved', sev: 'high' },
    { id: 'v2', name: 'Exposed Hardcoded API Secret Keys inside index.ts', status: 'unresolved', sev: 'critical' },
    { id: 'v3', name: 'Unsanitized HTML script injections in markdown output', status: 'repaired', sev: 'medium' }
  ]);

  // 10. Product Genome Engine
  const [genomeScores, setGenomeScores] = useState({
    scalability: 82,
    observability: 78,
    monetization: 88,
    aiMaturity: 90,
    uxCompleteness: 95
  });

  // 11. API Intelligence Matrix STATE
  const [apiMatrixLogs, setApiMatrixLogs] = useState<string[]>([
    "Initialized API matrix router. Watching routes on port 3000..."
  ]);
  const [selectedApiEndpoint, setSelectedApiEndpoint] = useState<string>("/api/telemetry");
  const [testingEndpoint, setTestingEndpoint] = useState<boolean>(false);

  // 12. Database Evolution Observatory STATE
  const [dbDriftStatus, setDbDriftStatus] = useState<'aligned' | 'drifted'>('drifted');
  const [isCheckingDb, setIsCheckingDb] = useState<boolean>(false);
  const [dbLogs, setDbLogs] = useState<string[]>([
    "PRAGMA foreign_key checked. Database tables mapping nominal."
  ]);

  // 13. Event Flow Visualizer STATE
  const [eventBacklog, setEventBacklog] = useState<number>(42);
  const [isFlushingEvents, setIsFlushingEvents] = useState<boolean>(false);

  // 14. Security Posture Lens STATE
  const [securityScore, setSecurityScore] = useState<number>(76);
  const [hasScannedPosture, setHasScannedPosture] = useState<boolean>(false);

  // 15. Performance Pressure Map STATE
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null);

  // 16. Feature Lifecycle Tracker STATE
  const [lifecycles, setLifecycles] = useState([
    { name: "Cognitive HUD OS Dashboard", status: "Validated", desc: "Live user controls, styling presets, status rings.", progress: 100 },
    { name: "Self-Healing AST Engine", status: "Active Beta", desc: "Interactive syntax level code diagnostic repairs.", progress: 85 },
    { name: "Event Flow Pipeline Sifter", status: "Alpha Phase", desc: "Asynchronous retry pipelines and backlogs indexer.", progress: 40 },
    { name: "Multi-Agent Unified Collaboration Rooms", status: "Planned Milestone", desc: "Dual user socket synchronized workspaces.", progress: 0 }
  ]);

  // 17. Decision Vault STATE
  const [vaultSearch, setVaultSearch] = useState<string>("");

  // 18. AI Code Review Agent STATE
  const [reviewScore, setReviewScore] = useState<number | null>(null);
  const [isReviewing, setIsReviewing] = useState<boolean>(false);

  // 19. Multi-Context Command Palette STATE
  const [cmdQuery, setCmdQuery] = useState<string>("scan architecture");
  const [cmdLogs, setCmdLogs] = useState<string[]>([
    "Awaiting tactical CLI input instructions..."
  ]);

  // 20. Team Copilot Rooms STATE
  const [activeUsers, setActiveUsers] = useState([
    { email: "namireddysreeshanth@gmail.com", role: "Sovereign Creator", status: "online" },
    { email: "aistudio_agent@google.internal", role: "AI OS Companion", status: "online" }
  ]);
  const [isSyncingRooms, setIsSyncingRooms] = useState<boolean>(false);

  // PRICING / LICENSE CALCULATOR STATES
  const [licensePlan, setLicensePlan] = useState<'free' | 'pro' | 'team' | 'enterprise'>('pro');
  const [userSeats, setUserSeats] = useState<number>(5);
  const [promoCode, setPromoCode] = useState<string>("");
  const [isLicenseApplied, setIsLicenseApplied] = useState<boolean>(false);
  const [promoFeedback, setPromoFeedback] = useState<string>("");

  // SOUND & NOTIFICATION TRIGGER WRAPPERS
  const playClick = (pitch = 1.0) => {
    onTriggerSound(pitch);
  };

  const showToast = (txt: string, t: 'success' | 'info' | 'error' = 'info') => {
    onTriggerNotification(txt, t);
  };

  // 20 COMPLETE STRATEGIC INNOVATIONS METADATA
  const innovations = [
    { id: 1, name: "Holographic Architecture Universe", icon: Layers, accent: "text-violet-400", bgAccent: "bg-violet-950/25", desc: "Cinematic 3D-linked software dependency graph showing service tension, bottleneck radiation, and file clusters.", badge: "Cinematic" },
    { id: 2, name: "Engineering Time Machine", icon: Clock, accent: "text-emerald-400", bgAccent: "bg-emerald-950/25", desc: "Replay codebase architecture evolution, technical debt accumulation, and historical file-growth timelines.", badge: "Scrubbable" },
    { id: 3, name: "AI Engineering Memory", icon: BookOpen, accent: "text-blue-400", bgAccent: "bg-blue-950/25", desc: "Retrieves past architectural decisions, solved debugging loops, and historical scaling incidents directly from indexing.", badge: "Semantic" },
    { id: 4, name: "Self-Healing Infrastructure", icon: Wrench, accent: "text-rose-450 text-rose-400", bgAccent: "bg-rose-950/25", desc: "Automated real-time AST audits, dead code sifting, CORS config patching, and imports self-repair.", badge: "Autonomous" },
    { id: 5, name: "AI Flow State Engine", icon: Activity, accent: "text-amber-400", bgAccent: "bg-amber-950/25", desc: "Monitors context switching, diagnostic looping velocity, and burnout signals to optimize developer focus.", badge: "Bio-Cognitive" },
    { id: 6, name: "Vision-to-Code Intelligence", icon: Sparkles, accent: "text-indigo-400", bgAccent: "bg-indigo-950/25", desc: "Translate high-level feature notes to complete schema updates, websocket specs, and estimated implementation maturity.", badge: "Predictive" },
    { id: 7, name: "AI Deployment Orchestrator", icon: ShieldCheck, accent: "text-teal-400", bgAccent: "bg-teal-950/25", desc: "Pre-flight environment variable validation, workspace drift scans, bundle volume metrics, and production safety scores.", badge: "Preflight" },
    { id: 8, name: "Live Chaos Engine", icon: Flame, accent: "text-red-400", bgAccent: "bg-red-950/25", desc: "Simulate API outages, database congestion, rate limit errors, and analyze cascading service failovers on port 3000.", badge: "Chaos Simulator" },
    { id: 9, name: "AI Security Observatory", icon: ShieldAlert, accent: "text-pink-400", bgAccent: "bg-pink-950/25", desc: "Live attack-vector scanners, wildcard credential leakage traps, and dynamic security hotspot mapping.", badge: "Sentry" },
    { id: 10, name: "Product Genome Engine", icon: Workflow, accent: "text-cyan-400", bgAccent: "bg-cyan-950/25", desc: "Interactive monetization readiness, observability health, and UX fidelity mapping into a comprehensive readiness index.", badge: "Strategic" },
    { id: 11, name: "API Intelligence Matrix", icon: Radio, accent: "text-emerald-400", bgAccent: "bg-emerald-950/25", desc: "Monitor endpoints health, latency variations and dynamic auth parameters across system APIs on port 3000.", badge: "API Matrix" },
    { id: 12, name: "Database Evolution Observatory", icon: Database, accent: "text-indigo-400", bgAccent: "bg-indigo-950/25", desc: "Check DB migration risks, column typings mapping, relational decay factor and active column constraints index.", badge: "DB Schema" },
    { id: 13, name: "Event Flow Visualizer", icon: Unplug, accent: "text-amber-400", bgAccent: "bg-amber-950/25", desc: "Live asynchronous retry streams, event-bus packet queues, backpressure alerts and job loop delays tracking.", badge: "Asynchronous" },
    { id: 14, name: "Security Posture Lens", icon: Lock, accent: "text-rose-400", bgAccent: "bg-rose-950/25", desc: "Validate access logs, exposed secrets, wildcard keys and user access privilege escalation hazards.", badge: "Threat Matrix" },
    { id: 15, name: "Performance Pressure Maps", icon: Gauge, accent: "text-teal-400", bgAccent: "bg-teal-950/25", desc: "Interactive visual performance terrain layout tracking hydration lag factors, REST delays and runtime shifts.", badge: "Terrain Map" },
    { id: 16, name: "Feature Lifecycle Tracker", icon: TrendingUp, accent: "text-cyan-400", bgAccent: "bg-cyan-950/25", desc: "Track progress from user tickets/concepts to alpha, beta, shipping, validation, and historical deprecations.", badge: "Product Lift" },
    { id: 17, name: "Decision Vault", icon: HelpCircle, accent: "text-indigo-400", bgAccent: "bg-indigo-950/25", desc: "Record the historical 'why' of key architecture decisions, framework tradeoffs, and SDK code integrations.", badge: "Rationale" },
    { id: 18, name: "AI Code Review Agent", icon: Code, accent: "text-violet-400", bgAccent: "bg-violet-950/25", desc: "Interactive automated lint reviews testing system structure against enterprise standards.", badge: "Scorecard" },
    { id: 19, name: "Command Palette Launcher", icon: Terminal, accent: "text-sky-400", bgAccent: "bg-sky-950/25", desc: "Command-driven search sifter and automation engine for the ultimate operation command deck.", badge: "OS Commander" },
    { id: 20, name: "Team Copilot Rooms", icon: Users, accent: "text-fuchsia-400", bgAccent: "bg-fuchsia-950/25", desc: "Synchronized dual developer workspace simulation checking alignment gaps across connected team accounts.", badge: "Collaboration" }
  ];

  // Self-repair logic handler (Pillar 04)
  const triggerSelfHealing = () => {
    if (isHealing) return;
    setIsHealing(true);
    playClick(1.4);
    showToast("Launching Self-Healing AST Engine", "success");
    setHealingProgress(10);
    
    setHealingLogs([
      "⚙️ Initiating system code scan via ts-morph...",
      "🔍 Loading local file patterns and indexers on port 3000..."
    ]);

    setTimeout(() => {
      setHealingProgress(45);
      setHealingLogs(l => [
        ...l, 
        "⚠️ FOUND EXPOSED WILDCARD CORS in src/server/apiHandler.ts [Line 46].",
        "✓ Cleaned and updated CORS config to restrict specific domains.",
        "✓ Mitigated vulnerability risk automatically with regex."
      ]);
      playClick(1.2);
    }, 1000);

    setTimeout(() => {
      setHealingProgress(75);
      setHealingLogs(l => [
        ...l,
        "⚠️ FOUND SECRETS KEY in /config/keys_unresolved.json [Line 11].",
        "✓ Safely scrubbed vulnerable key strings and replaced with process.env bindings."
      ]);
      playClick(1.3);
    }, 2000);

    setTimeout(() => {
      setHealingProgress(100);
      setHealingLogs(l => [
        ...l,
        "✓ Cleaned unused dependencies and resolved dead filesystem routes.",
        "🎉 SYSTEM AST REPAIR MERGED SUCCESSFULLY! OS security index boosted to 98%."
      ]);
      setIsHealing(false);
      // Clean up vul list elements!
      setActiveVulnerabilities(prev => prev.map(v => ({ ...v, status: 'repaired' })));
      setSecurityScore(98);
      showToast("Cognitive code AST repairs deployed!", "success");
      playClick(1.6);
    }, 3200);
  };

  // Interactive Vision Sandbox (Pillar 06)
  const runVisionToCode = () => {
    if (!visionInput.trim()) return;
    setIsSynthesizing(true);
    playClick(0.9);
    showToast("Synthesizing user vision specifications...", "info");

    setTimeout(() => {
      setIsSynthesizing(false);
      setSynthesizedResult({
        title: "Robust Dynamic WebSocket & Pub-Sub Backbone System",
        infrastructureConfidence: "98%",
        changesRequired: [
          "Create file `/src/server/websocketBus.ts` to manage multiplexed connections.",
          "Add Express path `/api/ws/health` to throttle status packets.",
          "Inject local Zustand store parameter: `activeSocketSubscribersCount`."
        ],
        estimatedMaturity: "A+ Enterprise Ready Grade",
        suggestedDB: "Prisma Schema Model: `WebSocketConnectionLog` clustered by client_uuid"
      });
      playClick(1.4);
      showToast("Vision criteria compiled successfully!", "success");
    }, 1400);
  };

  // Time Machine Play loop (Pillar 02)
  useEffect(() => {
    let interval: any;
    if (isTimePlaying) {
      interval = setInterval(() => {
        setTimelineIndex(current => {
          if (current >= 4) {
            setIsTimePlaying(false);
            return 4;
          }
          playClick(1.0 + current * 0.1);
          return current + 1;
        });
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isTimePlaying]);

  const timelineMilestones = [
    { title: "Sprint 1: Genesis Spawn", date: "May 01", desc: "Bootstrap bare development server, standard routing endpoints, placeholder layout grids.", drift: "54% Alignment" },
    { title: "Sprint 2: Websocket Spike", date: "May 06", desc: "Unified interactive Websockets event controller and dynamic mock state handlers.", drift: "68% Alignment" },
    { title: "Sprint 3: Indexing Agent", date: "May 12", desc: "Integrated AST analyzer and autonomous filesystem watcher triggers.", drift: "78% Alignment" },
    { title: "Sprint 4: Drifter Sentinel", date: "May 18", desc: "Exposed api vulnerabilities log, Gemini sandbox models and security alarms.", drift: "86% Alignment" },
    { title: "Active Dev: Cosmic Blueprint", date: "May 23", desc: "Massive 20-module cognitive OS Cockpit and monetization selector engine active.", drift: "98% Alignment" }
  ];

  const simulatedMemories = [
    { q: "Wildcard CORS policy leaked", ans: "Occurred on Sprint 3. Rectified using automated AST self-heal config patches safely.", cat: "security" },
    { q: "429 API rate limit threshold", ans: "Model fallback redirected from expensive models to lightweight local ast analyzer.", cat: "ai" },
    { q: "WebSockets queue overflow", ans: "Throttled real-time visual telemetry frame rate to 45Hz under high load conditions to maximize thread cycles.", cat: "performance" }
  ];

  // API Testing Simulation (Pillar 11)
  const executeApiTelemetryTest = () => {
    setTestingEndpoint(true);
    playClick(1.1);
    const timestamp = new Date().toLocaleTimeString();
    setApiMatrixLogs(prev => [`[${timestamp}] ⚙️ Dispatching telemetry probe to ${selectedApiEndpoint}...`, ...prev]);

    setTimeout(() => {
      setTestingEndpoint(false);
      setApiMatrixLogs(prev => [
        `[${timestamp}] ✓ Response 200 OK — Latency: 14ms.`,
        `[${timestamp}] DATA: { status: "nominal", host_port: 3000, context_drift: 0.02 }`,
        ...prev
      ]);
      playClick(1.4);
      showToast(`Probe to ${selectedApiEndpoint} returned 200 OK`, "success");
    }, 1000);
  };

  // Run DB Migration check (Pillar 12)
  const auditDatabaseDrift = () => {
    setIsCheckingDb(true);
    playClick(1.1);
    showToast("Scanning database schema tables context...", "info");
    
    setTimeout(() => {
      setIsCheckingDb(false);
      setDbDriftStatus('aligned');
      setDbLogs(prev => [
        `[${new Date().toLocaleTimeString()}] ✓ Alignment completed. Local sqlite schema matches physical state.`,
        "✓ No missing index paths detected on columns.",
        ...prev
      ]);
      playClick(1.5);
      showToast("Prisma models aligned successfully!", "success");
    }, 1200);
  };

  // Flush Event Backlog (Pillar 13)
  const flushSystemEvents = () => {
    setIsFlushingEvents(true);
    playClick(0.8);
    showToast("Clearing system event bus backlog...", "info");

    setTimeout(() => {
      setIsFlushingEvents(false);
      setEventBacklog(0);
      playClick(1.4);
      showToast("Asynchronous queue backlog drained!", "success");
    }, 1500);
  };

  // Scan Security Posture (Pillar 14)
  const executeSecurityPostureCheck = () => {
    setHasScannedPosture(true);
    playClick(1.2);
    showToast("Initiating live attack vector simulation...", "info");

    setTimeout(() => {
      setSecurityScore(94);
      playClick(1.5);
      showToast("Security posture evaluation successfully scored at 94%!", "success");
    }, 1400);
  };

  // AI Code review execution (Pillar 18)
  const triggerReviewScan = () => {
    setIsReviewing(true);
    playClick(1.1);
    showToast("Code Review Agent auditing files...", "info");

    setTimeout(() => {
      setIsReviewing(false);
      setReviewScore(96);
      playClick(1.5);
      showToast("Code score generated successfully!", "success");
    }, 1500);
  };

  // Command palette run simulation (Pillar 19)
  const executePaletteCommand = () => {
    if (!cmdQuery.trim()) return;
    playClick(1.1);
    const query = cmdQuery.toLowerCase().trim();
    let reply = "";

    if (query.includes("architecture") || query.includes("scan")) {
      reply = "🛡️ Holographic Universe: 20 endpoints audited. Alignment factor at 98%. Core port 3000 mapping secure.";
    } else if (query.includes("outage") || query.includes("simulate")) {
      reply = "⚠️ Chaos Engine: Attempted latency spike on Port 3000 bypass router. Intercepted by failover controller in 11ms.";
    } else if (query.includes("refactor")) {
      reply = "💡 Refactor Forge: Recommends modular splitting of 'SupremeOSControlPanel.tsx' to support dynamic routing pipelines.";
    } else {
      reply = `🤖 Executed command successfully. Telemetry index aligns with cognitive roadmap instructions.`;
    }

    setCmdLogs(prev => [
      `>_ ${cmdQuery}`,
      `[REPLY] ${reply}`,
      ...prev
    ]);
    setCmdQuery("");
  };

  // Sync rooms channel (Pillar 20)
  const triggerCopilotSync = () => {
    setIsSyncingRooms(true);
    playClick(1.2);
    showToast("Broadcasting workspace token delta to active sessions...", "info");

    setTimeout(() => {
      setIsSyncingRooms(false);
      playClick(1.5);
      showToast("Copilot room session safely synchronized alignment!", "success");
    }, 1200);
  };

  // Promo code validation handles
  const applyPromoDiscount = () => {
    playClick(1.1);
    if (promoCode.toUpperCase() === "NEOTOKYO" || promoCode.toUpperCase() === "NAMIREDDY") {
      setIsLicenseApplied(true);
      setPromoFeedback("🎉 Ultra Validation Token Applied! Enjoy custom seat scaling discounts.");
      showToast("License discount applied successfully!", "success");
    } else {
      setPromoFeedback("❌ Stale code payload. Try applying 'NEOTOKYO' for custom pricing optimization.");
      showToast("Invalid promo payload.", "error");
    }
  };

  return (
    <div className="space-y-6 text-slate-100 font-sans select-none">
      
      {/* SECTION MASTER HEADER BLOCK */}
      <div className="relative overflow-hidden p-6 rounded-3xl bg-[#090b11]/90 border border-slate-800/80 shadow-2xl flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-0 left-0 w-40 h-40 bg-[#10b981]/5 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="flex items-center gap-4 relative">
          <div className="p-4 bg-gradient-to-tr from-violet-600/15 to-indigo-600/15 rounded-2.5xl border border-violet-500/25 text-[#c084fc] relative shrink-0">
            <Cpu className="w-10 h-10 animate-spin-slow text-violet-400" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full animate-ping"></span>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[9px] bg-[#8b5cf6]/20 text-[#c084fc] font-black tracking-widest font-mono uppercase px-2.5 py-0.5 rounded-full border border-[#8b5cf6]/30">
                MASTER BLUEPRINT COCKPIT
              </span>
              <span className="text-[10px] text-emerald-400 font-mono tracking-wider font-extrabold flex items-center gap-1">
                ● COGNITION RUNTIME ONLINE
              </span>
            </div>
            <h1 className="text-xl font-extrabold text-white tracking-tight mt-1 font-display">
              Supreme Self-Aware Engineering Intelligence OS
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl font-medium">
              A category-defining software operating system mapping codebase intent, AST alignments, runtime latency, active telemetry pipelines, database migrations risk, and organizational productivity metrics on port 3000.
            </p>
          </div>
        </div>

        {/* Dynamic score dashboard summary */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="p-4 bg-[#07080c] border border-slate-800/60 rounded-2.5xl min-w-[130px] text-center">
            <span className="text-[8px] uppercase font-mono tracking-widest text-violet-400 block font-bold">ALIGNMENT INDEX</span>
            <span className="text-3xl font-black text-white mt-0.5 font-sans">
              98.2%
            </span>
            <span className="text-[9px] font-mono text-emerald-400 font-bold block mt-0.5 tracking-wide uppercase">
              AST COHERENT
            </span>
          </div>
          
          <div className="p-4 bg-[#07080c] border border-slate-800/60 rounded-2.5xl min-w-[130px] text-center">
            <span className="text-[8px] uppercase font-mono tracking-widest text-[#10b981] block font-bold">RUNTIME HEALTH</span>
            <span className="text-3xl font-black text-white mt-0.5 font-sans">
              99.9%
            </span>
            <span className="text-[9px] font-mono text-emerald-400 font-bold block mt-0.5 tracking-wide uppercase">
              14ms RESP
            </span>
          </div>
        </div>
      </div>

      {/* TACTILE HUD PAGE TABS SELECTOR */}
      <div className="flex items-center justify-between border-b border-slate-800/60 pb-3 gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setActiveTab('engines'); playClick(1.0); }}
            className={`px-4.5 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer border ${
              activeTab === 'engines' 
                ? 'bg-gradient-to-r from-violet-950/40 to-indigo-950/40 border-violet-500/30 text-white shadow-lg' 
                : 'bg-transparent border-transparent text-slate-400 hover:text-white hover:bg-slate-900/40'
            }`}
          >
            <Sliders className="w-4 h-4 text-violet-400" />
            <span>20 COGNITIVE SYSTEMS MATRIX</span>
          </button>
          
          <button
            onClick={() => { setActiveTab('pricing'); playClick(1.1); }}
            className={`px-4.5 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer border ${
              activeTab === 'pricing' 
                ? 'bg-gradient-to-r from-violet-950/40 to-indigo-950/40 border-violet-500/30 text-white shadow-lg' 
                : 'bg-transparent border-transparent text-slate-400 hover:text-white hover:bg-slate-900/40'
            }`}
          >
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>PRODUCT LICENSE & REVENUE TIERS</span>
            <span className="text-[8px] bg-emerald-500/10 text-emerald-400 font-bold px-1.5 py-0.5 rounded-full border border-emerald-500/20">
              PROVE
            </span>
          </button>
        </div>

        <div className="text-[10px] text-slate-400 font-mono hidden md:block">
          UTC: 2026-05-23 06:19:56Z | HOST: CONTAINER_3000
        </div>
      </div>

      {/* MATRIX AND GRID CARRIER */}
      {activeTab === 'engines' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* SIDEBAR SELECTOR (Left, 4 columns) */}
          <div className="col-span-12 lg:col-span-4 space-y-2.5">
            <div className="p-4 bg-[#090b11] border border-slate-800/60 rounded-2.5xl">
              <header className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-bold text-violet-400 tracking-widest font-mono uppercase block">
                  CHOOSE REPOSITORY SYSTEM
                </span>
                <span className="text-[8px] bg-[#10b981]/15 text-[#10b981] font-bold font-mono px-1.5 py-0.5 rounded-full border border-emerald-500/20">
                  20 IN-INDEX
                </span>
              </header>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Interact with each blueprint engine to simulate live downtime recoveries, trace performance pressure graphs, query model memory or generate schemas.
              </p>
            </div>

            <div className="space-y-1.5 max-h-[640px] overflow-y-auto scrollbar-thin pr-1 select-none">
              {innovations.map((inv, idx) => {
                const ActiveIcon = inv.icon;
                const isSelected = activeInnovation === idx;
                return (
                  <div
                    key={inv.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveInnovation(idx);
                      playClick(1.0 + idx * 0.03);
                    }}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? 'bg-violet-950/20 border-violet-500/35 shadow-md shadow-violet-500/5'
                        : 'bg-[#090b10]/90 border-slate-900 text-slate-400 hover:text-slate-100 hover:border-slate-800'
                    }`}
                  >
                    <div className={`p-2 rounded-xl border shrink-0 transition ${
                      isSelected ? 'bg-violet-500/10 border-violet-400/20 text-violet-400' : 'bg-slate-950 border-slate-850 text-slate-500'
                    }`}>
                      <ActiveIcon className="w-4 h-4 animate-pulse" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[11px] font-bold tracking-tight block font-sans truncate text-white">
                          0{inv.id}. {inv.name}
                        </span>
                        <span className={`text-[8px] font-mono font-bold leading-none px-1.5 py-0.5 rounded-full border shrink-0 ${
                          isSelected ? 'bg-indigo-950/40 border-indigo-900/40 text-indigo-300' : 'bg-slate-900 border-slate-850 text-slate-500'
                        }`}>
                          {inv.badge}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-sans block mt-0.5 line-clamp-1 leading-relaxed">
                        {inv.desc}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ACTIVE MODULE CONTAINER (Right, 8 columns) */}
          <div className="col-span-12 lg:col-span-8 bg-[#090b11]/92 backdrop-blur-xl border border-slate-850 rounded-3.5xl p-6 shadow-2xl relative min-h-[580px]">
            <div className="absolute inset-0 bg-cover bg-grid-pattern opacity-5 pointer-events-none"></div>

            {/* ACTIVE INGREDIENT INDICATOR */}
            <div className="relative flex flex-col md:flex-row md:items-center justify-between border-b border-slate-850 pb-4 mb-6 gap-4 select-none">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-violet-650/15 border border-violet-500/20 text-[#c084fc]">
                  {React.createElement(innovations[activeInnovation].icon, { className: 'w-5 h-5 ' + innovations[activeInnovation].accent })}
                </div>
                <div>
                  <span className="text-[9.5px] font-bold text-violet-400 tracking-widest font-mono uppercase block">
                    MODULE ENGINE {innovations[activeInnovation].id} OF 20 — COGNITIVE LABS
                  </span>
                  <h2 className="text-base font-bold text-white tracking-tight">
                    {innovations[activeInnovation].name}
                  </h2>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                <span className="text-[10px] text-slate-450 font-mono font-semibold">SIGNAL COHERENT</span>
              </div>
            </div>

            {/* ACTIVE SCREEN RENDERS */}
            <div className="relative">
              
              {/* 1. Holographic Architecture Universe */}
              {activeInnovation === 0 && (
                <div className="space-y-6 animate-fade-in text-slate-300">
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    The software dependency universe maps the workspace structures layout on port 3000 into dynamic interactive nodes. Leverage electromagnetic constraints to evaluate connection stability.
                  </p>

                  <div className="relative bg-[#050508] border border-slate-900 rounded-3xl h-64 flex items-center justify-center overflow-hidden p-6">
                    <div className="absolute inset-0 bg-cover bg-grid-pattern opacity-10"></div>
                    
                    <div className="absolute border border-dashed border-violet-500/10 rounded-full w-56 h-56 animate-spin-slow pointer-events-none" />
                    <div className="absolute border border-dashed border-emerald-500/5 rounded-full w-40 h-40 [animation-duration:12s] animate-spin-slow pointer-events-none" />

                    <div className="absolute bg-[#0b0d14]/90 border border-slate-800 rounded-xl px-3 py-1.5 text-[10px] font-mono bottom-3 left-3 text-slate-400 shadow-xl pointer-events-none">
                      Hover Node to pull AST specs delta...
                    </div>

                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                      <line x1="30%" y1="50%" x2="50%" y2="50%" stroke="rgba(139, 92, 246, 0.25)" strokeWidth={archPulseOn ? "2" : "1"} strokeDasharray="4 4" />
                      <line x1="50%" y1="50%" x2="70%" y2="35%" stroke="rgba(16, 185, 129, 0.25)" strokeWidth="1" />
                      <line x1="50%" y1="50%" x2="70%" y2="65%" stroke="rgba(244, 63, 94, 0.2)" strokeWidth="1" strokeDasharray="3 3" />
                    </svg>

                    <div className="relative flex items-center justify-between w-full h-full text-center">
                      <div 
                        onMouseEnter={() => setArchHoveredNode('api-gateway')}
                        onMouseLeave={() => setArchHoveredNode(null)}
                        onClick={() => { playClick(1.0); showToast("Node apiGateway Selected", "info"); }}
                        className={`absolute left-[15%] top-[40%] px-3.5 py-2 hover:scale-105 active:scale-95 transition bg-slate-950/90 border rounded-2xl cursor-pointer select-none ${
                          archHoveredNode === 'api-gateway' ? 'border-[#818cf8] text-white shadow-lg' : 'border-slate-850 text-slate-400'
                        }`}
                      >
                        <Layers className="w-3.5 h-3.5 mx-auto mb-1 text-indigo-400 animate-pulse" />
                        <span className="text-[9px] font-mono uppercase tracking-wide block">ApiGateway</span>
                        <span className="text-[8px] text-indigo-400 font-bold">Port 3000</span>
                      </div>

                      <div 
                        onMouseEnter={() => setArchHoveredNode('brain')}
                        onMouseLeave={() => setArchHoveredNode(null)}
                        onClick={() => { playClick(1.5); showToast("Cognitive brain engine active", "success"); }}
                        className={`absolute left-[45%] top-[30%] px-5 py-3 hover:scale-110 active:scale-95 transition bg-[#090b14]/95 border rounded-3xl cursor-pointer select-none ${
                          archHoveredNode === 'brain' ? 'border-violet-500 text-white shadow-xl' : 'border-violet-900/50 text-violet-300'
                        }`}
                      >
                        <Cpu className="w-5 h-5 mx-auto mb-1.5 text-violet-300 animate-spin-slow" />
                        <span className="text-[10px] font-black tracking-widest block font-mono">COGNITIVE.OS</span>
                        <span className="text-[8px] text-emerald-400 block font-mono">AST Coherent</span>
                      </div>

                      <div 
                        onMouseEnter={() => setArchHoveredNode('db')}
                        onMouseLeave={() => setArchHoveredNode(null)}
                        onClick={() => { playClick(1.1); showToast("Local SQLite Connection Pool selected", "info"); }}
                        className={`absolute right-[12%] top-[15%] px-3.5 py-2 hover:scale-105 active:scale-95 transition bg-slate-950/90 border rounded-2xl cursor-pointer select-none ${
                          archHoveredNode === 'db' ? 'border-emerald-400 text-white shadow-lg' : 'border-slate-850 text-slate-400'
                        }`}
                      >
                        <Compass className="w-3.5 h-3.5 mx-auto mb-1 text-emerald-400" />
                        <span className="text-[9px] font-mono uppercase tracking-wide block">WorkspaceDB</span>
                        <span className="text-[8px] text-emerald-400 block">sqlite (11ms)</span>
                      </div>

                      <div 
                        onMouseEnter={() => setArchHoveredNode('chaos')}
                        onMouseLeave={() => setArchHoveredNode(null)}
                        className={`absolute right-[12%] top-[60%] px-3.5 py-2 hover:scale-105 transition bg-slate-950/90 border rounded-2xl cursor-pointer ${
                          archHoveredNode === 'chaos' ? 'border-rose-500 text-white' : 'border-slate-800 text-slate-400'
                        }`}
                      >
                        <Flame className="w-3.5 h-3.5 mx-auto mb-1 text-rose-500 animate-bounce" />
                        <span className="text-[9px] font-mono block">ChaosDampener</span>
                        <span className="text-[8px] text-slate-500 block">Stable</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#0b0c13] border border-slate-900 rounded-2.5xl p-4 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-violet-400 block">Universe Force Simulation</span>
                      <span className="text-xs text-slate-450 mt-1 block">Toggle dynamic connection gravity index to test repository balance scores.</span>
                    </div>
                    <button
                      onClick={() => { setArchPulseOn(!archPulseOn); playClick(1.2); showToast("Simulation vectors aligned!", "info"); }}
                      className="px-4 py-2 bg-indigo-650 hover:bg-indigo-600 active:scale-95 text-white font-mono font-bold rounded-xl text-xs transition cursor-pointer"
                    >
                      {archPulseOn ? "GRAVITY: DENSE" : "GRAVITY: REBALANCED"}
                    </button>
                  </div>
                </div>
              )}

              {/* 2. Engineering Time Machine */}
              {activeInnovation === 1 && (
                <div className="space-y-6 animate-fade-in text-slate-300">
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    Scrub architecture commits, debt accumulation, and historical file layouts timelines. Evolve structures visually across key engineering cycles.
                  </p>

                  <div className="bg-[#06060c] border border-slate-900 rounded-3xl p-5 shadow-inner">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-[10px] text-emerald-400 font-mono font-bold block uppercase">Checkpoint Selected</span>
                        <span className="text-sm font-bold text-white block">{timelineMilestones[timelineIndex].title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setIsTimePlaying(!isTimePlaying); playClick(1.2); }}
                          className="p-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl border border-slate-800 active:scale-95 transition cursor-pointer"
                          title={isTimePlaying ? "Pause autoplay" : "Autoplay timeline transition"}
                        >
                          <Play className={`w-4 h-4 ${isTimePlaying ? 'text-emerald-400 animate-spin-slow' : 'text-slate-450'}`} />
                        </button>
                        <button
                          onClick={() => { setTimelineIndex(0); playClick(0.9); }}
                          className="p-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl border border-slate-800 active:scale-95 transition cursor-pointer"
                          title="Reset timeline"
                        >
                          <RotateCcw className="w-4 h-4 text-slate-450" />
                        </button>
                      </div>
                    </div>

                    <div className="relative h-20 flex items-center justify-between px-4 select-none">
                      <div className="absolute left-6 right-6 h-0.5 bg-slate-800/80" />
                      
                      {timelineMilestones.map((ms, index) => {
                        const isActive = timelineIndex === index;
                        return (
                          <div 
                            key={index}
                            onClick={() => { setTimelineIndex(index); playClick(1.0 + index * 0.08); }}
                            className="relative flex flex-col items-center cursor-pointer z-10"
                          >
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all border duration-353 ${
                              isActive 
                                ? 'bg-[#10b981] border-[#10b981] scale-125 shadow-lg shadow-[#10b981]/25' 
                                : 'bg-[#10121a] border-slate-700 hover:border-slate-400 hover:scale-110'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-slate-500'}`} />
                            </div>
                            <span className={`text-[9px] font-mono block mt-1.5 font-bold uppercase transition ${isActive ? 'text-white' : 'text-slate-500'}`}>
                              {ms.date}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-[#0b0c13] border border-slate-900 rounded-2.5xl p-5">
                    <header className="flex items-center justify-between text-[10px] font-mono text-slate-400 border-b border-slate-850 pb-2 mb-3">
                      <span>ALIGNMENT DRIFT: <strong className="text-[#10b981] font-bold">{timelineMilestones[timelineIndex].drift}</strong></span>
                      <span>COMMITTER: creator_agent_pro</span>
                    </header>
                    <p className="text-xs text-slate-350 leading-relaxed font-sans">
                      {timelineMilestones[timelineIndex].desc}
                    </p>
                  </div>
                </div>
              )}

              {/* 3. AI Engineering Memory */}
              {activeInnovation === 2 && (
                <div className="space-y-6 animate-fade-in text-slate-300 text-xs">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Queries semantic records of ancient architectural incidents, previous debug loops and configuration failures to ensure continuity across restarts.
                  </p>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={memorySearch}
                      onChange={(e) => setMemorySearch(e.target.value)}
                      placeholder="Search semantic database memories (e.g. CORS, WS, websocket)..."
                      className="bg-[#050508] border border-slate-850 text-xs rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-violet-500 w-full font-mono transition"
                    />
                    <button
                      onClick={() => { setMemorySearch(""); playClick(0.9); }}
                      className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-xs font-mono font-bold border border-slate-800 rounded-2xl active:scale-95 transition cursor-pointer"
                    >
                      CLEAR
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {simulatedMemories
                      .filter(m => m.q.toLowerCase().includes(memorySearch.toLowerCase()) || m.ans.toLowerCase().includes(memorySearch.toLowerCase()))
                      .map((item, id) => (
                        <div key={id} className="bg-[#06060c] border border-slate-900 rounded-2.5xl p-4 hover:border-violet-500/15 transition">
                          <div className="flex items-center justify-between mb-1.5 font-mono">
                            <span className="text-xs font-bold text-white flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5 text-violet-400" />
                              {item.q}
                            </span>
                            <span className="text-[9px] font-bold text-violet-400 bg-violet-950/40 border border-violet-900/30 px-2.5 py-0.5 rounded-full uppercase">
                              {item.cat}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed font-sans">
                            {item.ans}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* 4. Self-Healing Code Infrastructure */}
              {activeInnovation === 3 && (
                <div className="space-y-6 animate-fade-in text-slate-300">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Scanning code syntax via AST (Abstract Syntax Tree) sifter. Detect and secure exposed API secrets or trailing wildcard CORS loops instantly inside files.
                  </p>

                  <div className="bg-[#050508] border border-slate-900 rounded-3xl p-5 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-[10px] text-rose-400 font-mono block font-bold uppercase">Fixer Diagnostics Console</span>
                        <span className="text-xs text-slate-400">Launch live autonomous repairs:</span>
                      </div>
                      
                      <button
                        onClick={triggerSelfHealing}
                        disabled={isHealing}
                        className={`px-5 py-2.5 rounded-2xl font-mono text-xs font-bold transition flex items-center gap-2 cursor-pointer border ${
                          isHealing 
                            ? 'bg-rose-950/20 text-rose-450 border-rose-500/20 animate-pulse' 
                            : 'bg-rose-600 text-white border-rose-500 hover:bg-rose-500 active:scale-95'
                        }`}
                      >
                        <Wrench className="w-4 h-4 animate-spin-slow" />
                        {isHealing ? `HEALING (${healingProgress}%)` : 'EXECUTE COGNITIVE REPAIR'}
                      </button>
                    </div>

                    <div className="w-full bg-[#10121a] h-1.5 rounded-full overflow-hidden mb-4 border border-slate-850">
                      <div 
                        className="bg-gradient-to-r from-rose-500 to-rose-400 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${healingProgress}%` }}
                      />
                    </div>

                    <div className="bg-black/80 rounded-2.5xl p-4 h-44 overflow-y-auto font-mono text-slate-300 text-[11px] leading-relaxed border border-slate-920 space-y-2 scrollbar-thin select-text">
                      {healingLogs.map((log, id) => (
                        <div key={id} className="transition-all block text-slate-300">
                          {log}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 5. AI Flow State Engine */}
              {activeInnovation === 4 && (
                <div className="space-y-6 animate-fade-in text-slate-300">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Evaluates developer burnout, cognitive loops, and context switching cycles during active sprints.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#050508] border border-slate-900 rounded-3xl p-5 flex flex-col justify-between h-48">
                      <div>
                        <span className="text-[9.5px] uppercase font-mono tracking-wider font-bold text-amber-400 block">Focus State Waveform</span>
                        <h3 className="text-base font-bold text-white mt-1">Brain Activity Sensor</h3>
                      </div>

                      <div className="flex items-end justify-center gap-2 h-20">
                        {[65, 75, 92, 84, 98, isFlowBreathing ? 100 : 60, 80, 72, 88, 94].map((val, id) => (
                          <div 
                            key={id} 
                            style={{ height: `${val}%` }} 
                            className={`w-4 rounded-t bg-gradient-to-t ${id === timelineIndex ? 'from-[#f59e0b] to-yellow-300 animate-pulse' : 'from-slate-800 to-slate-700'} transition-all duration-1000`}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="bg-[#050510] border border-slate-900 rounded-3xl p-5 flex flex-col justify-between h-48">
                      <div>
                        <span className="text-[10px] text-amber-400 font-mono font-bold uppercase tracking-widest block">Focus Metrics Diagnostics</span>
                        <div className="mt-3.5 space-y-2 text-xs">
                          <div className="flex items-center justify-between border-b border-slate-850 pb-1.5">
                            <span className="text-slate-450">Stress Telemetry Index</span>
                            <span className="text-white font-mono font-bold">{isFlowBreathing ? "11%" : "38%"} (Optimal)</span>
                          </div>
                          <div className="flex items-center justify-between border-b border-slate-850 pb-1.5">
                            <span className="text-slate-450">Context Switching Index</span>
                            <span className="text-white font-mono font-bold">1 per hr</span>
                          </div>
                          <div className="flex items-center justify-between pb-1.5 font-bold text-amber-405">
                            <span className="text-slate-450">Burnout Danger Threshold</span>
                            <span className="text-amber-400 font-mono">SAFE</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => { setIsFlowBreathing(!isFlowBreathing); playClick(1.25); showToast("Rhythm cycle rebalanced!", "success"); }}
                        className="px-3.5 py-2 hover:bg-slate-800 bg-slate-900 border border-slate-800 active:scale-95 transition text-slate-200 rounded-xl text-xs font-semibold cursor-pointer text-center block"
                      >
                        {isFlowBreathing ? 'DISENGAGE FLOW REGULATOR' : 'ENGAGE FOCUS BREATHING'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 6. Vision-to-Code Intelligence */}
              {activeInnovation === 5 && (
                <div className="space-y-6 animate-fade-in text-slate-300">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Describe requirements down for database tables or WS APIs. The generator compiles prompt trees into actionable files layout checklists.
                  </p>

                  <div className="bg-[#050508] border border-slate-905 rounded-3xl p-5 shadow-inner">
                    <div className="flex flex-col gap-3.5">
                      <label className="text-[9px] uppercase font-mono tracking-widest font-black text-indigo-400 select-none">
                        Cortex Target Concept Specifier
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={visionInput}
                          onChange={(e) => setVisionInput(e.target.value)}
                          placeholder="What would you like to build?..."
                          className="bg-slate-950 border border-slate-900 text-xs rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-indigo-400 w-full font-sans transition"
                        />
                        <button
                          onClick={runVisionToCode}
                          disabled={isSynthesizing}
                          className="px-5 py-2.5 bg-indigo-650 hover:bg-indigo-600 text-xs font-mono font-bold text-white rounded-2xl active:scale-95 transition cursor-pointer shrink-0"
                        >
                          {isSynthesizing ? 'FORGING...' : 'GENERATE SPECS'}
                        </button>
                      </div>
                    </div>

                    {synthesizedResult && (
                      <div className="bg-[#0a0a14] border border-indigo-500/15 rounded-2.5xl p-4.5 mt-4 text-xs animate-fade-in select-text">
                        <header className="flex items-center justify-between border-b border-indigo-500/10 pb-2 mb-3">
                          <strong className="text-indigo-300 font-bold uppercase tracking-wide">Forced Architecture Specifications</strong>
                          <span className="text-[9px] bg-indigo-950 text-indigo-300 font-mono px-2.5 py-0.5 rounded-full border border-indigo-900/30 font-bold">
                            {synthesizedResult.estimatedMaturity}
                          </span>
                        </header>
                        
                        <div className="space-y-2.5">
                          <div className="grid grid-cols-2 gap-2 text-[11px] mb-2">
                            <div>
                              <span className="text-slate-450 block">Blast Radius:</span>
                              <span className="text-white font-semibold">Minimal (Local Node)</span>
                            </div>
                            <div>
                              <span className="text-slate-450 block">Complexity Score:</span>
                              <span className="text-emerald-400 font-bold">98% Perfect fit</span>
                            </div>
                          </div>
                          <div>
                            <span className="text-slate-450 block text-[10px] font-mono leading-none">Database Table Entity Schema:</span>
                            <span className="text-white block mt-0.5 font-mono bg-black/40 px-2 py-1.5 rounded">{synthesizedResult.suggestedDB}</span>
                          </div>
                          <div>
                            <span className="text-slate-450 block text-[10px] font-mono leading-none">Required Code Files layout:</span>
                            <ul className="list-disc pl-4 mt-1 text-slate-350 space-y-1 block leading-relaxed font-sans">
                              {synthesizedResult.changesRequired.map((ch: string, i: number) => (
                                <li key={i}>{ch}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 7. AI Deployment Orchestrator */}
              {activeInnovation === 6 && (
                <div className="space-y-6 animate-fade-in text-slate-300">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Evaluates environment boundaries, verifies example configurations, checks wildcard secrets leakages, and estimates Docker compile success parameters.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                    <div className="bg-[#050508] border border-slate-900 rounded-3xl p-5 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-teal-400 block">Preflight Checks Status</span>
                        <div className="mt-3.5 space-y-2 px-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400 flex items-center gap-1.5">
                              <Radio className="w-3.5 h-3.5 text-teal-400" /> Host & Port 3000 Ingress Bound
                            </span>
                            <span className="text-emerald-400 font-mono font-bold">PASS</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400 flex items-center gap-1.5">
                              <Radio className="w-3.5 h-3.5 text-teal-400" /> Env Example Registry Check
                            </span>
                            <span className="text-emerald-400 font-mono font-bold">PASS</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400 flex items-center gap-1.5">
                              <Radio className="w-3.5 h-3.5 text-rose-400" /> Private Keys exposed in Git AST
                            </span>
                            <span className="text-emerald-400 font-mono font-bold">0 DETECTED</span>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-slate-900 pt-3 text-[10px] text-slate-450 font-mono uppercase font-bold text-teal-400">
                        Target platform: Cloud Run Container
                      </div>
                    </div>

                    <div className="bg-[#05050c] border border-slate-900 rounded-3xl p-5 flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] text-teal-400 font-mono font-bold uppercase tracking-widest block mb-1">DEPLOY CONTINUOUS CONFIDENCE</span>
                      <span className="text-4xl font-black text-white font-sans">
                        {deployConfidence}%
                      </span>
                      <span className="text-xs text-slate-400 mt-2 block max-w-xs leading-relaxed">
                        AST validated. Clean bundle generated correctly inside dist/server.cjs.
                      </span>

                      <button
                        onClick={() => { playClick(1.4); showToast("Docker bundle verified successfully!", "success"); }}
                        className="px-4 py-2 mt-4 bg-teal-600 hover:bg-teal-500 active:scale-95 text-white rounded-xl text-xs font-semibold font-mono transition cursor-pointer"
                      >
                        RUN MANIFEST VERIFICATION
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 8. Live Chaos Engine */}
              {activeInnovation === 7 && (
                <div className="space-y-6 animate-fade-in text-slate-300">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Trigger simulated outages (such as sqlite congestion, latency spikes, rate limits, WebSocket bottlenecks) and audit cascading failures on port 3000.
                  </p>

                  <div className="bg-[#050508] border border-slate-900 rounded-3xl p-5 shadow-inner">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] uppercase font-mono tracking-widest font-black text-rose-500 block">
                        Chaos Intensity calibration
                      </span>
                      <span className="text-xs text-rose-400 font-mono font-bold">{chaosIntensity === 0 ? 'MATRIX STANDBY' : `INTENSITY LEVEL ${chaosIntensity}`}</span>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="5"
                      value={chaosIntensity}
                      onChange={(e) => {
                        const level = Number(e.target.value);
                        setChaosIntensity(level);
                        playClick(0.6 + level * 0.15);
                        
                        const timestamp = new Date().toLocaleTimeString();
                        if (level === 0) {
                          setChaosLogs(["✓ System re-stabilized. Outages cleared successfully."]);
                          showToast("Chaos matrix stabilized!", "success");
                        } else {
                          setChaosLogs(prev => [
                            `[${timestamp}] ⚠️ CHAOS OUTAGE INTENSITY DEGRADATION LEVEL ${level} INJECTED.`,
                            `[${timestamp}] Port 3000 routing degraded. Bottlenecks throttled (<${level * 220}ms delays).`,
                            ...prev
                          ]);
                          showToast(`Injecting level ${level} simulated latency outage...`, "error");
                        }
                      }}
                      className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-rose-500 select-none"
                    />

                    <div className="bg-black/80 rounded-2.5xl p-4.5 h-36 overflow-y-auto mt-4 font-mono text-slate-300 text-[10.5px] leading-relaxed border border-[#3e141a]/20 space-y-1.5 scrollbar-thin select-text">
                      {chaosLogs.map((log, id) => (
                        <div key={id} className="transition-all block">
                          {log}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 9. AI Security Observatory */}
              {activeInnovation === 8 && (
                <div className="space-y-6 animate-fade-in text-slate-300">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Live scan matching threat signatures (CORS wildcard, token leakage, unsanitized parameters).
                  </p>

                  <div className="space-y-2.5">
                    {activeVulnerabilities.map((vul) => (
                      <div 
                        key={vul.id} 
                        onClick={() => {
                          if (vul.status === 'unresolved') {
                            playClick(1.1);
                            showToast(`Trigger self healing (Pillar 04) to resolve ${vul.name}!`, "info");
                          } else {
                            playClick(1.5);
                            showToast("Vulnerability already patches AST!", "success");
                          }
                        }}
                        className="bg-[#06060c]/95 hover:border-slate-800 cursor-pointer border border-slate-900 rounded-2.5xl p-4 flex items-center justify-between transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl shrink-0 ${
                            vul.status === 'repaired' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/30' : 'bg-rose-950/40 text-rose-450 border border-rose-900/30 animate-pulse'
                          }`}>
                            <ShieldAlert className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-white block">{vul.name}</span>
                            <span className="text-[9px] text-slate-450 block font-mono">Severity: {vul.sev.toUpperCase()}</span>
                          </div>
                        </div>

                        <span className={`text-[9.5px] font-mono font-bold px-2.5 py-1 rounded-full uppercase border ${
                          vul.status === 'repaired'
                            ? 'bg-emerald-950 text-emerald-400 border-emerald-900/40'
                            : 'bg-rose-950/20 text-rose-450 border-rose-500/20 animate-pulse'
                        }`}>
                          {vul.status === 'repaired' ? 'SECURED AST' : 'AUDIT FAIL'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 10. Product Genome Engine */}
              {activeInnovation === 9 && (
                <div className="space-y-6 animate-fade-in text-slate-300">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Measures scalability footprint, monetization parameters, UX completeness, and observability status based on active file index metrics.
                  </p>

                  <div className="space-y-3.5 select-none">
                    {Object.entries(genomeScores).map(([key, value]) => (
                      <div key={key}>
                        <div className="flex items-center justify-between text-xs font-bold font-sans">
                          <span className="text-slate-300 capitalize">{key.replace(/([A-Z])/g, ' $1')} Index Rating</span>
                          <span className="text-violet-400 font-mono">{value}%</span>
                        </div>
                        <div className="bg-slate-950 h-2 rounded-full mt-1.5 overflow-hidden border border-slate-900">
                          <div className="bg-gradient-to-r from-violet-600 to-[#10b981] h-full rounded-full transition-all duration-300" style={{ width: `${value}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 11. API Intelligence Matrix */}
              {activeInnovation === 10 && (
                <div className="space-y-6 animate-fade-in text-slate-300">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Check endpoint health parameters, auth security status, and mock API request pipelines live under Port 3000.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#050508] border border-slate-900 rounded-3xl p-5 space-y-3">
                      <span className="text-[10px] text-emerald-400 font-mono font-bold block uppercase">Select Test Root Endpoints</span>
                      
                      <select 
                        value={selectedApiEndpoint}
                        onChange={(e) => setSelectedApiEndpoint(e.target.value)}
                        className="bg-black border border-slate-800 rounded-xl p-2.5 text-xs text-white w-full font-mono outline-none"
                      >
                        <option value="/api/telemetry">GET /api/telemetry (Secure)</option>
                        <option value="/api/healer/ast">POST /api/healer/ast (AST Repair)</option>
                        <option value="/api/chaos/latencies">POST /api/chaos/latencies (Simulate Outage)</option>
                        <option value="/api/workspace/alignment">GET /api/workspace/alignment (Roadmap Check)</option>
                      </select>

                      <div className="text-[11px] space-y-1.5 text-slate-400">
                        <div className="flex justify-between">
                          <span>Target Port:</span>
                          <span className="font-mono text-white">3000 (Ingress bound)</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Authorization:</span>
                          <span className="font-mono text-white">OAuth Workspace token</span>
                        </div>
                      </div>

                      <button
                        onClick={executeApiTelemetryTest}
                        disabled={testingEndpoint}
                        className="w-full py-2 bg-emerald-650 hover:bg-emerald-600 text-white font-mono font-bold text-xs rounded-xl active:scale-95 transition cursor-pointer"
                      >
                        {testingEndpoint ? "PROBING PIPELINE..." : "TEST PATH INGRESS"}
                      </button>
                    </div>

                    <div className="bg-[#05050c] border border-slate-900 rounded-3xl p-5 flex flex-col justify-between">
                      <span className="text-[10px] text-[#10b981] font-mono font-bold uppercase block">Ingress Response Payload Logs</span>
                      <div className="bg-black/60 rounded-xl p-3 h-28 overflow-y-auto font-mono text-[10px] text-[#10b981] space-y-1 scrollbar-thin">
                        {apiMatrixLogs.map((log, idx) => (
                          <div key={idx} className="truncate">{log}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 12. Database Evolution Observatory */}
              {activeInnovation === 11 && (
                <div className="space-y-6 animate-fade-in text-slate-300">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Simulate relational schemas alignment, verify database migrations logs, and execute drift validation alerts securely.
                  </p>

                  <div className="bg-[#050508] border border-slate-900 rounded-3xl p-5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-850 pb-3 mb-4 gap-2">
                      <div>
                        <span className="text-[10px] text-indigo-400 font-mono font-bold block">SCHEMA COALITION PATTERNS</span>
                        <span className="text-xs text-slate-400">Database Engine type: <strong className="text-white">SQLite / SQLite3</strong></span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${dbDriftStatus === 'aligned' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                        <span className="text-[11px] font-mono uppercase font-bold text-white">
                          Schema: {dbDriftStatus.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono text-indigo-405 block font-bold text-indigo-400 uppercase">Interactive Migrations Checklist</span>
                        <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-900 space-y-1.5 text-[11px] font-mono">
                          <div className="flex justify-between text-slate-400">
                            <span>m01_schema_init</span>
                            <span className="text-emerald-400">APPLIED</span>
                          </div>
                          <div className="flex justify-between text-slate-405 text-slate-400">
                            <span>m02_oauth_credentials</span>
                            <span className="text-emerald-400">APPLIED</span>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span>m03_alignment_drift</span>
                            <span className={dbDriftStatus === 'aligned' ? 'text-emerald-400' : 'text-amber-500 font-bold animate-pulse'}>
                              {dbDriftStatus === 'aligned' ? 'APPLIED' : 'DRIFTED'}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={auditDatabaseDrift}
                          disabled={isCheckingDb}
                          className="w-full py-2 bg-indigo-650 hover:bg-indigo-600 text-white font-mono text-xs rounded-xl active:scale-95 transition cursor-pointer font-bold"
                        >
                          {isCheckingDb ? "VERIFYING INDEX DRIFT..." : "COMMENCE ALIGNMENT DRIFT PATCHAR"}
                        </button>
                      </div>

                      <div className="bg-black/60 p-3.5 rounded-xl border border-slate-900 h-32 overflow-y-auto font-mono text-[10px] text-slate-350 space-y-1 scrollbar-thin">
                        {dbLogs.map((log, idx) => (
                          <div key={idx}>{log}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 13. Event Flow Visualizer */}
              {activeInnovation === 12 && (
                <div className="space-y-6 animate-fade-in text-slate-300">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Inspect asynchronous backlog queues, worker event retry states, and avoid thread blocks.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-[#050510] border border-slate-900 rounded-3xl p-5 text-center">
                      <span className="text-[9px] font-mono text-amber-400 font-bold block uppercase mb-1">Queue Backlog Packets</span>
                      <span className="text-3xl font-black text-white font-sans">{eventBacklog}</span>
                      <span className="text-[10px] text-slate-500 block mt-1">Pending job processing cycle</span>
                    </div>

                    <div className="bg-[#050510] border border-slate-900 rounded-3xl p-5 text-center">
                      <span className="text-[9px] font-mono text-amber-400 font-bold block uppercase mb-1">Retry Loop Storm Factor</span>
                      <span className="text-3xl font-black text-rose-500 font-sans">0</span>
                      <span className="text-[10px] text-[#10b981] block mt-1 font-bold">NOMINAL SPEED</span>
                    </div>

                    <div className="bg-[#050510] border border-slate-900 rounded-3xl p-5 flex flex-col justify-center">
                      <button
                        onClick={flushSystemEvents}
                        disabled={isFlushingEvents || eventBacklog === 0}
                        className="w-full py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-900 text-black font-mono font-bold text-xs rounded-xl active:scale-95 transition cursor-pointer"
                      >
                        {isFlushingEvents ? "DRAINING..." : "FLUSH QUEUE BACKLOG"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 14. Security Posture Lens */}
              {activeInnovation === 13 && (
                <div className="space-y-6 animate-fade-in text-slate-300">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Measures repository security configurations, auditing open ports, exposed credential variables and wildcard settings.
                  </p>

                  <div className="bg-[#050508] border border-slate-900 rounded-3xl p-5 text-center space-y-4">
                    <div className="flex items-center justify-between max-w-sm mx-auto">
                      <span className="text-xs text-slate-400">Continuous Security Posture Score:</span>
                      <span className="text-2xl font-black text-white font-mono">{securityScore}%</span>
                    </div>

                    <div className="w-full bg-[#10121a] h-2 rounded-full overflow-hidden border border-slate-850">
                      <div className="bg-gradient-to-r from-red-500 via-amber-400 to-emerald-400 h-full rounded-full transition-all duration-700" style={{ width: `${securityScore}%` }} />
                    </div>

                    <button
                      onClick={executeSecurityPostureCheck}
                      className="px-6 py-2 bg-rose-950/40 border border-rose-500/25 text-rose-400 rounded-xl text-xs font-mono font-bold hover:bg-rose-900/30 transition cursor-pointer"
                    >
                      {hasScannedPosture ? "RE-RUN PENETRATION ATTACK SIMULATOR" : "EXECUTE PENETRATION ATTACK SIMULATOR"}
                    </button>
                  </div>
                </div>
              )}

              {/* 15. Performance Pressure Maps */}
              {activeInnovation === 14 && (
                <div className="space-y-6 animate-fade-in text-slate-300">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Interactive performance terrain map highlighting hydration delays, request latency zones and slow layouts.
                  </p>

                  <div className="bg-black/60 border border-slate-900 rounded-3xl p-5">
                    <span className="text-[10px] text-teal-400 font-mono font-bold block uppercase mb-3 text-center">TAP HOTSPOT TO INSPECT PROPAGATION LAGS</span>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { name: "Hydration Sync Zone", delay: "2ms delay", status: "Perfect" },
                        { name: "Index AST Watching", delay: "4ms delay", status: "Nominal" },
                        { name: "Prisma SQLite Query Pool", delay: "12ms delay", status: "Nominal" },
                        { name: "WebSockets broadcast frame", delay: "32ms delay", status: "Heavy" },
                      ].map((hs, i) => (
                        <div 
                          key={i} 
                          onClick={() => { setSelectedHotspot(hs.name); playClick(1.0 + i * 0.1); }}
                          className={`p-3 rounded-2xl border cursor-pointer transition select-none text-center ${
                            selectedHotspot === hs.name ? 'bg-teal-950/20 border-teal-500/40 text-teal-400 scale-105' : 'bg-slate-950/45 border-slate-900 text-slate-400 hover:border-slate-800'
                          }`}
                        >
                          <span className="text-[11px] font-bold block text-white">{hs.name}</span>
                          <span className="text-[10px] font-mono text-teal-400 block mt-1">{hs.delay}</span>
                          <span className="text-[9px] text-slate-500 block uppercase font-mono">{hs.status}</span>
                        </div>
                      ))}
                    </div>

                    {selectedHotspot && (
                      <div className="bg-[#050508] p-3 rounded-xl border border-teal-950/50 mt-4 text-xs font-sans text-center text-teal-300 animate-fade-in">
                        🏁 <strong>Hotspot: {selectedHotspot}</strong> - System thread capacity nominal. Outage risks low. All hooks fully stable.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 16. Feature Lifecycle Tracker */}
              {activeInnovation === 15 && (
                <div className="space-y-6 animate-fade-in text-slate-300">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Continuous mapping tracking concepts from initial PRDs/sprints towards beta deployment validations.
                  </p>

                  <div className="space-y-2.5">
                    {lifecycles.map((lf, i) => (
                      <div key={i} className="bg-black/40 border border-slate-900 p-3.5 rounded-2xl flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-white block">{lf.name}</span>
                          <span className="text-[10px] text-slate-450 block">{lf.desc}</span>
                        </div>
                        
                        <div className="text-right shrink-0">
                          <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded-full uppercase block">
                            {lf.status} (Prg: {lf.progress}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 17. Decision Vault */}
              {activeInnovation === 16 && (
                <div className="space-y-6 animate-fade-in text-slate-300 select-text">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Records the core framework architectural 'why' tradeoffs, justifying library choices, API patterns constraints and structural layouts.
                  </p>

                  <div className="bg-[#050510] border border-slate-900 rounded-3xl p-5 space-y-3.5">
                    <span className="text-[10.5px] text-indigo-400 font-mono font-bold block uppercase">Historical Software Architecture Decider Logs</span>
                    
                    <div className="space-y-2.5 text-xs text-slate-350">
                      <div className="border-l-2 border-indigo-500 pl-3.5">
                        <span className="font-bold text-white block">Decider 01: Client vs Server architecture fallback parameters</span>
                        <p className="mt-1 leading-relaxed text-[11px]">Choose server-side fallback endpoints inside Express to proxy API keys. Avoid exposing credentials directly to public client routers.</p>
                      </div>
                      
                      <div className="border-l-2 border-indigo-500 pl-3.5">
                        <span className="font-bold text-white block">Decider 02: Bundle formats optimization payload</span>
                        <p className="mt-1 leading-relaxed text-[11px]">Compile whole server entrypoints into dist/server.cjs using esbuild external strategies. Keeps build output self-sufficient.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 18. AI Code Review Agent */}
              {activeInnovation === 17 && (
                <div className="space-y-6 animate-fade-in text-slate-300">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Runs strict audits testing AST syntax imports alignment against enterprise codebases constraints.
                  </p>

                  <div className="bg-[#050508] border border-slate-900 rounded-3xl p-5 text-center space-y-4">
                    <span className="text-[10px] text-violet-400 font-mono font-bold block uppercase">AI Code Scoreboard Engine</span>
                    
                    {reviewScore ? (
                      <div className="animate-fade-in space-y-2">
                        <span className="text-4xl font-extrabold text-white font-mono">{reviewScore}%</span>
                        <span className="text-xs text-emerald-400 block font-semibold">✓ PRISTINE QUALITY ASSURANCE RATING</span>
                        <p className="text-[11px] text-slate-450 max-w-sm mx-auto">Imports are clean, files separated properly, no trailing wildcard exports, no exposed secrets.</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <span className="text-sm text-slate-450 block">Awaiting continuous static check trigger...</span>
                      </div>
                    )}

                    <button
                      onClick={triggerReviewScan}
                      disabled={isReviewing}
                      className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-mono text-xs rounded-xl active:scale-95 transition cursor-pointer"
                    >
                      {isReviewing ? "SCANNING ABSTRACT SYNTAX..." : "BOOT AI CODE REVIEW EVALUATION"}
                    </button>
                  </div>
                </div>
              )}

              {/* 19. Multi-Context Command Palette */}
              {activeInnovation === 18 && (
                <div className="space-y-6 animate-fade-in text-slate-300 select-text font-mono text-xs">
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    Universal terminal manager interface. Run automated instruction shortcuts (such as scan architecture, simulate outage, refactor).
                  </p>

                  <div className="bg-[#050508] border border-slate-900 rounded-3xl p-5 shadow-inner">
                    <div className="flex gap-2 mb-3.5">
                      <span className="text-slate-500 flex items-center shrink-0 pl-1 select-none">$&gt;</span>
                      <input 
                        type="text"
                        value={cmdQuery}
                        onChange={(e) => setCmdQuery(e.target.value)}
                        placeholder="Type prompt instruction (e.g. scan architecture)..."
                        onKeyDown={(e) => { if(e.key === 'Enter') executePaletteCommand(); }}
                        className="bg-transparent text-white font-mono text-xs focus:outline-none w-full"
                      />
                      <button 
                        onClick={executePaletteCommand}
                        className="px-4 py-1.5 bg-slate-900 text-slate-205 hover:bg-slate-800 text-xs border border-slate-800 rounded-xl"
                      >
                        RUN
                      </button>
                    </div>

                    <div className="bg-black/70 rounded-2xl p-3 h-36 overflow-y-auto space-y-1 text-[11px] scrollbar-thin select-text">
                      {cmdLogs.map((log, i) => (
                        <div key={i} className="whitespace-pre-wrap">{log}</div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 20. Team Copilot Rooms */}
              {activeInnovation === 19 && (
                <div className="space-y-6 animate-fade-in text-slate-300">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Simulate real-time synchronized companion streams. Check workspace token alignments with active copilot connections.
                  </p>

                  <div className="bg-black/40 border border-slate-900 rounded-3xl p-5 shadow-inner">
                    <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-850 pb-3 mb-4 gap-2">
                      <span className="text-[10px] text-fuchsia-400 font-mono font-bold uppercase block">ACTIVE COMPANIONS IN WORKSPACE</span>
                      
                      <button
                        onClick={triggerCopilotSync}
                        disabled={isSyncingRooms}
                        className="px-3.5 py-1.5 bg-fuchsia-950/40 border border-fuchsia-500/25 text-fuchsia-400 rounded-lg text-xs font-mono font-bold hover:bg-fuchsia-900/30 transition cursor-pointer"
                      >
                        {isSyncingRooms ? "SYNCING..." : "FORCE SYNC SESSIONS"}
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {activeUsers.map((usr, i) => (
                        <div key={i} className="flex items-center justify-between text-xs p-2 hover:bg-slate-900/40 rounded-xl">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                            <span className="font-mono text-white">{usr.email}</span>
                          </div>
                          <span className="text-[10px] text-slate-450 uppercase">{usr.role}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>
      ) : (
        /* REVENUE-DRIVING FEATURE GROUPS AND LICENSE BOOKING */
        <div className="animate-fade-in space-y-8 select-text text-slate-300">
          
          {/* PARENT TIER DEFINITIONS BANNER */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 select-none">
            
            {/* TIER 1 */}
            <div 
              onClick={() => { setLicensePlan('free'); playClick(1.0); }}
              className={`p-5 rounded-2.5xl cursor-pointer border transition ${
                licensePlan === 'free' ? 'bg-slate-950 border-slate-600 ring-2 ring-violet-500/20' : 'bg-black/30 border-slate-900 hover:border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-slate-400 font-bold block">ENTRY TIER</span>
                <span className="text-[9px] bg-slate-800 px-2 py-0.5 rounded-full text-slate-300">FREE</span>
              </div>
              <h2 className="text-lg font-black text-white">Entry Basic</h2>
              <span className="text-[10px] text-slate-400 block mt-1">For single builders scanning syntax.</span>
              
              <ul className="text-[10.5px] text-slate-450 mt-4 space-y-1.5 block">
                <li>✓ Local Files AST Scanning</li>
                <li>✓ Basic Roadmap Alignment Score</li>
                <li>✓ Core Workspace Diagnostics</li>
                <li>✓ Static Dependency Map</li>
              </ul>
            </div>

            {/* TIER 2 */}
            <div 
              onClick={() => { setLicensePlan('pro'); playClick(1.1); }}
              className={`p-5 rounded-2.5xl cursor-pointer border transition ${
                licensePlan === 'pro' ? 'bg-[#0f0b18]/80 border-violet-500/40 ring-2 ring-violet-500/20' : 'bg-black/30 border-slate-900 hover:border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-violet-400 font-bold block">INDIVIDUAL PRO</span>
                <span className="text-[9px] bg-violet-950/50 border border-violet-900/30 text-violet-300 px-2.5 py-0.5 rounded-full font-bold">POPULAR</span>
              </div>
              <h2 className="text-lg font-black text-white">Pro Developer</h2>
              <span className="text-[10px] text-slate-400 block mt-1">Deploys server-side proxies and AI.</span>
              
              <ul className="text-[10.5px] text-slate-300 mt-4 space-y-1.5 block">
                <li>✓ Autonomous AI Integrations</li>
                <li>✓ Deep AST Self-Heal Repair</li>
                <li>✓ Command Palette palettize</li>
                <li>✓ API Outages Chaos simulator</li>
                <li>✓ Performance terrain zoning</li>
              </ul>
            </div>

            {/* TIER 3 */}
            <div 
              onClick={() => { setLicensePlan('team'); playClick(1.2); }}
              className={`p-5 rounded-2.5xl cursor-pointer border transition ${
                licensePlan === 'team' ? 'bg-slate-950 border-slate-600 ring-2 ring-violet-500/20' : 'bg-black/30 border-slate-900 hover:border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-teal-400 font-bold block">SHARED CORE</span>
                <span className="text-[9.5px] bg-[#1a2f2b] text-[#10b981] px-2 py-0.5 rounded-full font-bold">TEAM</span>
              </div>
              <h2 className="text-lg font-black text-white">Unified Team</h2>
              <span className="text-[10px] text-slate-400 block mt-1">Secure collaboration rooms.</span>
              
              <ul className="text-[10.5px] text-slate-450 mt-4 space-y-1.5 block">
                <li>✓ Scriptor Decision Vault</li>
                <li>✓ Team Copilot Sync Room</li>
                <li>✓ Ownership alignment radar</li>
                <li>✓ Strategic product genome</li>
              </ul>
            </div>

            {/* TIER 4 */}
            <div 
              onClick={() => { setLicensePlan('enterprise'); playClick(1.3); }}
              className={`p-5 rounded-2.5xl cursor-pointer border transition ${
                licensePlan === 'enterprise' ? 'bg-[#140b0d]/80 border-rose-500/40 ring-2 ring-rose-500/20' : 'bg-black/30 border-slate-900 hover:border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-rose-450 text-rose-400 font-bold block">ENTERPRISE SYSTEM</span>
                <span className="text-[9px] bg-rose-950/40 text-rose-400 px-2 py-0.5 rounded-full font-bold">CUSTOM</span>
              </div>
              <h2 className="text-lg font-black text-white">Sovereign Enterprise</h2>
              <span className="text-[10px] text-slate-400 block mt-1">Multi-tenant governance pools.</span>
              
              <ul className="text-[10.5px] text-slate-450 mt-4 space-y-1.5 block">
                <li>✓ Continuous Compliance Sentry</li>
                <li>✓ Policy enforcement scripts</li>
                <li>✓ 24/7 dedicated system agents</li>
                <li>✓ Zero limits on scanner threads</li>
              </ul>
            </div>

          </div>

          {/* DYNAMIC SUBSCRIPTION COST ESTIMATOR */}
          <div className="bg-[#050508] border border-slate-850 p-6 rounded-3xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            <div className="col-span-12 lg:col-span-8 space-y-4">
              <span className="text-[10px] text-violet-400 font-mono font-bold uppercase block tracking-widest">CALIBRATE YOUR SEATS SUBSCRIPTION SCALE</span>
              
              <div>
                <span className="text-xs text-slate-400">Specify user seats constraints layout: <strong className="text-white">{userSeats} seats</strong></span>
                <input 
                  type="range"
                  min="1"
                  max="100"
                  value={userSeats}
                  onChange={(e) => { setUserSeats(Number(e.target.value)); playClick(1.0); }}
                  className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-violet-500 select-none mt-2"
                />
              </div>

              <div>
                <span className="text-xs text-slate-400 block mb-1.5">Apply Promo Code payload (Try Applying CODE: <strong>NEOTOKYO</strong>):</span>
                <div className="flex gap-2 max-w-sm">
                  <input 
                    type="text" 
                    value={promoCode} 
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="e.g. NEOTOKYO"
                    className="bg-black border border-slate-800 text-xs px-3 py-2 rounded-xl text-white outline-none focus:border-violet-500 font-mono"
                  />
                  <button 
                    onClick={applyPromoDiscount}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-mono rounded-xl cursor-pointer"
                  >
                    VALIDATE
                  </button>
                </div>
                {promoFeedback && (
                  <span className="text-[11px] font-mono text-emerald-400 block mt-2">{promoFeedback}</span>
                )}
              </div>
            </div>

            <div className="col-span-12 lg:col-span-4 bg-black/60 p-6 rounded-2.5xl border border-slate-900 text-center space-y-4">
              <span className="text-[9.5px] text-slate-450 font-mono block uppercase">ESTIMATED CYCLE BILLING</span>
              
              <div className="space-y-1">
                <span className="text-4xl font-extrabold text-white font-sans">
                  ${Math.round(
                    (licensePlan === 'free' ? 0 : licensePlan === 'pro' ? 29 : licensePlan === 'team' ? 99 : 499) 
                    * userSeats 
                    * (isLicenseApplied ? 0.75 : 1)
                  )}
                </span>
                <span className="text-xs text-slate-400 block uppercase font-mono tracking-widest">USD / MONTH</span>
              </div>

              <button
                onClick={() => {
                  playClick(1.6);
                  showToast(`Simulated Premium ${licensePlan.toUpperCase()} token injected! Alignment drift secured.`, "success");
                }}
                className="w-full py-2.5 bg-violet-650 hover:bg-violet-600 text-white font-semibold rounded-xl text-xs font-mono tracking-wide active:scale-95 transition"
              >
                PROVISION COGNITIVE LICENSE
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
