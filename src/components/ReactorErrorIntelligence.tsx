import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, ShieldCheck, Flame, RefreshCw, Key, AlertTriangle, 
  Trash2, Copy, FileCode, CheckCircle2, Radio, Network, Lock, 
  MapPin, ShieldPlus, Server, Eye, EyeOff, Plus, FileText, Check,
  Sliders, UserCheck, AlertOctagon, HelpCircle, Activity, Heart, Search,
  Bug, Zap, Users, Globe, Terminal, Settings, ChevronRight, Play, ExternalLink,
  Code, Send, Calendar, Clock, AlertCircle, Hash, TrendingUp, XCircle, Skull
} from 'lucide-react';

interface ErrorEvent {
  id: string;
  fingerprint: string;
  title: string;
  exception: string;
  message: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  occurrences: number;
  firstSeen: string;
  lastSeen: string;
  affectedUsers: number;
  assignedTo: string;
  env: string;
  release: string;
  browser: string;
  os: string;
  route: string;
  stackTrace: { file: string; line: number; col: number; method: string; codeAround: string[]; blameAuthor: string; blameCommit: string }[];
  breadcrumbs: { timestamp: string; category: string; message: string; type: string }[];
  requestContext: { url: string; method: string; ip: string; headers: Record<string, string>; body: string };
  resolutionNote?: string;
  linearIssue?: string;
}

interface ReactorErrorIntelligenceProps {
  onTriggerSound: (freq?: number) => void;
  onTriggerNotification: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export default function ReactorErrorIntelligence({ onTriggerSound, onTriggerNotification }: ReactorErrorIntelligenceProps) {
  const [activeTab, setActiveTab] = useState<'feed' | 'alerting' | 'analytics' | 'replay'>('feed');
  const [selectedErrorId, setSelectedErrorId] = useState<string | null>('err-01');
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  
  // Simulation control
  const [coreTemperature, setCoreTemperature] = useState(72.4); // Glow state based on core temps
  const [radiationLevel, setRadiationLevel] = useState(0.12); // Pulse rates based on radiation levels
  
  // AI State
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<Record<string, {
    hypothesis: string;
    confidence: number;
    filesInvolved: string[];
    suggestedFix: string;
    explanation: string;
  }>>({});
  
  // Alert Configuration
  const [alertThreshold, setAlertThreshold] = useState(15);
  const [slackEnabled, setSlackEnabled] = useState(true);
  const [pagerDutyEnabled, setPagerDutyEnabled] = useState(false);

  // Errors state
  const [errorsList, setErrorsList] = useState<ErrorEvent[]>([
    {
      id: 'err-01',
      fingerprint: '3aef90bc1142e09ff7b',
      title: 'TypeError: Cannot read properties of null (reading "sessionToken")',
      exception: 'TypeError',
      message: 'Cannot read properties of null (reading "sessionToken")',
      severity: 'CRITICAL',
      status: 'Open',
      occurrences: 412,
      firstSeen: '2026-05-23 09:30:12',
      lastSeen: '2026-05-23 09:58:44',
      affectedUsers: 148,
      assignedTo: 'namireddysreeshanth@gmail.com',
      env: 'production',
      release: 'v2.14.0-rc2',
      browser: 'Chrome 125.0',
      os: 'macOS Sonoma',
      route: '/api/v1/auth/session/renew',
      stackTrace: [
        {
          file: 'src/server/authService.ts',
          line: 142,
          col: 28,
          method: 'renewSessionCookie',
          codeAround: [
            "140: export async function renewSessionCookie(req: Request) {",
            "141:   const payload = await parseAuthHeader(req);",
            "142:   const sessionToken = payload.sessionToken; // 🚨 CRASH: payload is null",
            "143:   if (!sessionToken) throw new Error('Void Token');"
          ],
          blameAuthor: 'jameson',
          blameCommit: 'a3f7beb0'
        },
        {
          file: 'src/server/apiHandler.ts',
          line: 218,
          col: 14,
          method: 'handleRequest',
          codeAround: [
            "216:   try {",
            "217:     if (req.url.includes('/renew')) {",
            "218:       return await renewSessionCookie(req);",
            "219:     }"
          ],
          blameAuthor: 'sreeshanth',
          blameCommit: '76dd20a1'
        }
      ],
      breadcrumbs: [
        { timestamp: '09:58:41', category: 'navigation', message: 'User navigated to /dashboard/security', type: 'info' },
        { timestamp: '09:58:42', category: 'api', message: 'POST /api/v1/auth/session/renew initiated', type: 'network' },
        { timestamp: '09:58:43', category: 'auth', message: 'Authorization header read successfully', type: 'security' },
        { timestamp: '09:58:44', category: 'crash', message: 'TypeError reported to Sentinel NOC', type: 'error' }
      ],
      requestContext: {
        url: 'https://api.devstate.internal/api/v1/auth/session/renew',
        method: 'POST',
        ip: '192.168.4.155',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)...',
          'X-Correlation-Id': 'corr-ef78-aa21'
        },
        body: '{"expiredToken": "jwt-sec-99a", "clientId": "dashboard-v3"}'
      },
      linearIssue: 'DEV-1082'
    },
    {
      id: 'err-02',
      fingerprint: '9ee3d120a1a5b48e',
      title: 'DatabaseTimeoutError: Connection acquisition timed out after 5000ms',
      exception: 'DatabaseTimeoutError',
      message: 'Connection acquisition timed out after 5000ms',
      severity: 'CRITICAL',
      status: 'In Progress',
      occurrences: 84,
      firstSeen: '2026-05-23 08:14:02',
      lastSeen: '2026-05-23 09:55:01',
      affectedUsers: 72,
      assignedTo: 'namireddysreeshanth@gmail.com',
      env: 'production',
      release: 'v2.14.0-rc2',
      browser: 'All Clients',
      os: 'Linux Server',
      route: '/api/v1/analytics/db-scan',
      stackTrace: [
        {
          file: 'src/server/spannerDB.ts',
          line: 89,
          col: 34,
          method: 'executeQuery',
          codeAround: [
            "87: export async function executeQuery(sql: string) {",
            "88:   const pool = getClientConnectionPool();",
            "89:   const conn = await pool.acquire({ timeout: 5000 }); // 🚨 TIMEOUT",
            "90:   return conn.run(sql);"
          ],
          blameAuthor: 'jameson',
          blameCommit: 'a3f7beb0'
        }
      ],
      breadcrumbs: [
        { timestamp: '09:54:55', category: 'system', message: 'Event loop intensive cycle detected', type: 'info' },
        { timestamp: '09:54:58', category: 'db', message: 'Acquisition queue length rose to 184', type: 'warning' },
        { timestamp: '09:55:01', category: 'db-crash', message: 'Acquisition pool exhausted completely', type: 'error' }
      ],
      requestContext: {
        url: 'https://api.devstate.internal/api/v1/analytics/db-scan',
        method: 'GET',
        ip: '10.0.8.44',
        headers: {
          'User-Agent': 'CronSchedulerWorker/1.0'
        },
        body: '{}'
      }
    },
    {
      id: 'err-03',
      fingerprint: '11bb9e5ff421a99',
      title: 'IndexOutOfBoundsException: Requested index 12 is larger than array size 8',
      exception: 'IndexOutOfBoundsException',
      message: 'Requested index 12 is larger than array size 8',
      severity: 'WARNING',
      status: 'Open',
      occurrences: 19,
      firstSeen: '2026-05-23 09:12:33',
      lastSeen: '2026-05-23 09:47:12',
      affectedUsers: 4,
      assignedTo: 'Unassigned',
      env: 'staging',
      release: 'v2.13.8',
      browser: 'Firefox 126.3',
      os: 'Windows 11',
      route: '/api/v1/vault/keys/list',
      stackTrace: [
        {
          file: 'src/server/vaultService.ts',
          line: 45,
          col: 19,
          method: 'retrieveKeysChunk',
          codeAround: [
            "43: export function retrieveKeysChunk(keys: string[], chunkIndex: number) {",
            "44:   const offset = chunkIndex * 10;",
            "45:   return keys.slice(offset, offset + 12); // 🚨 Boundary breach trigger"
          ],
          blameAuthor: 'developer-jane',
          blameCommit: 'e69bc5bb'
        }
      ],
      breadcrumbs: [
        { timestamp: '09:47:05', category: 'api', message: 'Call retrieved chunk list size 8', type: 'info' },
        { timestamp: '09:47:12', category: 'exception', message: 'Out of bounds slice', type: 'error' }
      ],
      requestContext: {
        url: 'https://api.devstate.internal/api/v1/vault/keys/list?chunk=3',
        method: 'GET',
        ip: '172.56.12.89',
        headers: {
          'Content-Type': 'application/json'
        },
        body: ''
      }
    }
  ]);

  // Periodic simulated error injector
  useEffect(() => {
    const interval = setInterval(() => {
      // Chance of random simulated spike or tick
      const randomTrigger = Math.random();
      if (randomTrigger > 0.75) {
        setErrorsList(prev => {
          // Increase event occurrences of err-01
          return prev.map(err => {
            if (err.id === 'err-01') {
              const updatedOccurrences = err.occurrences + Math.floor(Math.random() * 5) + 1;
              const randUserDelta = Math.random() > 0.6 ? 1 : 0;
              return {
                ...err,
                occurrences: updatedOccurrences,
                affectedUsers: err.affectedUsers + randUserDelta,
                lastSeen: new Date().toISOString().replace('T', ' ').substring(0, 19)
              };
            }
            return err;
          });
        });
        
        // Slightly heat up core temperature temporarily
        setCoreTemperature(prev => Math.min(98.5, prev + Math.random() * 2));
        setRadiationLevel(prev => Math.min(2.5, prev + Math.random() * 0.15));
        onTriggerSound(440); // Soft medical blip sound
      } else {
        // Cooling down
        setCoreTemperature(prev => Math.max(70.2, prev - 0.4));
        setRadiationLevel(prev => Math.max(0.10, prev - 0.03));
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [onTriggerSound]);

  // Command to run simulated AI diagnostic
  const runAiDiagnostic = (errId: string) => {
    onTriggerSound(880);
    setAnalyzingId(errId);
    
    setTimeout(() => {
      setAiAnalysisResult(prev => ({
        ...prev,
        [errId]: {
          hypothesis: "Null-reference object retrieval failure in parseAuthHeader helper payload parser",
          confidence: 94,
          filesInvolved: ["src/server/authService.ts", "src/server/apiHandler.ts"],
          suggestedFix: "export async function renewSessionCookie(req: Request) {\n  const payload = await parseAuthHeader(req);\n  if (!payload || !payload.sessionToken) {\n    throw new Error('Unauthorized renew target exception: authentication empty');\n  }\n  const sessionToken = payload.sessionToken;\n  ...",
          explanation: "Recent changes in deployment v2.14.0-rc2 altered headers behavior so expired sessions return a null payload instead of an empty payload object structure. The token parser fails of null exception."
        }
      }));
      setAnalyzingId(null);
      onTriggerNotification("Nuclear AI model completed diagnosis hypothesis with 94% confidence map metrics.", "success");
    }, 2000);
  };

  const handleApplyFix = (errId: string) => {
    onTriggerSound(1100);
    setErrorsList(prev => prev.map(err => {
      if (err.id === errId) {
        return {
          ...err,
          status: 'Resolved',
          resolutionNote: 'Fixed via AI Code Patch automation targeting null authentication head guard.'
        };
      }
      return err;
    }));
    onTriggerNotification("Automatic software patch compiled & deployed. Target cooled down to Resolved state.", "success");
  };

  const selectedError = errorsList.find(e => e.id === selectedErrorId);

  // Filter list
  const filteredErrors = errorsList.filter(err => {
    if (severityFilter !== 'All' && err.severity !== severityFilter) return false;
    if (statusFilter !== 'All' && err.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return err.title.toLowerCase().includes(q) || 
             err.exception.toLowerCase().includes(q) ||
             err.message.toLowerCase().includes(q) ||
             err.route.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div id="reactor-error-intelligence" className="font-sans text-slate-100">
      
      {/* NUCLEAR CONTROL ROOM TITLE HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-rose-950/40 pb-6 mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1 px-1.5 bg-rose-500/10 text-rose-400 rounded-lg text-[9px] font-mono border border-rose-500/20 uppercase tracking-widest animate-pulse font-black">
              Nuclear Threat Status
            </span>
            <span className="text-slate-550 font-mono text-[10px]">COCKPIT ID: REACTOR_CORE_NOC</span>
          </div>
          <h2 className="text-2xl font-black text-rose-500 uppercase tracking-wide flex items-center gap-2">
            <Skull className="w-6 h-6 animate-spin text-rose-500" style={{ animationDuration: '6s' }} />
            REACTOR ERROR INTELLIGENCE
          </h2>
          <p className="text-xs text-slate-400 max-w-xl mt-1">
            Nuclear control room telemetry deck. Active errors act as raw reactions to be contained, cooled down, and eliminated via AI diagnostics before core meltdown occurs.
          </p>
        </div>

        {/* ANALOG GAUGES COMPONENT */}
        <div className="flex items-center gap-4 bg-slate-950/60 p-3.5 rounded-2.5xl border border-rose-950/30 font-mono">
          <div className="text-center px-2">
            <div className="text-[9px] text-slate-500 uppercase font-black">Core Temp</div>
            <div className={`text-lg font-black tracking-tighter ${coreTemperature > 85 ? 'text-red-500 animate-pulse' : 'text-amber-500'}`}>
              {coreTemperature.toFixed(1)}°C
            </div>
            <div className="text-[8px] text-slate-550">Limit 100°C</div>
          </div>
          
          <div className="w-px h-8 bg-slate-900" />
          
          <div className="text-center px-2">
            <div className="text-[9px] text-slate-500 uppercase font-black">Rad Pulse</div>
            <div className={`text-lg font-black tracking-tighter ${radiationLevel > 1.5 ? 'text-red-500 animate-pulse' : 'text-zinc-300'}`}>
              {radiationLevel.toFixed(2)} R/h
            </div>
            <div className="text-[8px] text-slate-550">Stable &lt; 0.50</div>
          </div>

          <div className="w-px h-8 bg-slate-900" />

          {/* Concentric rings represent radiation sensor containment */}
          <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
            <motion.div 
              className="absolute w-10 h-10 rounded-full border border-rose-500/20"
              animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.8, 0.3] }}
              transition={{ repeat: Infinity, duration: Math.max(0.6, 3.0 - radiationLevel * 1.5) }}
            />
            <motion.div 
              className="absolute w-7 h-7 rounded-full border border-rose-500/40"
              animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.9, 0.4] }}
              transition={{ repeat: Infinity, duration: Math.max(0.6, 3.0 - radiationLevel * 1.5), delay: 0.15 }}
            />
            <div className={`w-3 h-3 rounded-full ${coreTemperature > 85 ? 'bg-red-500' : 'bg-amber-500'} animate-pulse`} />
          </div>
        </div>
      </div>

      {/* METRIC RIBBON */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#09090b]/75 border border-slate-900 rounded-2xl p-3.5 flex items-center gap-3">
          <div className="p-2.5 bg-rose-500/10 rounded-xl border border-rose-500/20 text-rose-400 shrink-0">
            <Bug className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[9px] font-mono uppercase text-slate-500">Unresolved Errors</div>
            <div className="text-lg font-black text-rose-400 tracking-tight">
              {errorsList.filter(e => e.status !== 'Resolved' && e.status !== 'Closed').length}
            </div>
          </div>
        </div>

        <div className="bg-[#09090b]/75 border border-slate-900 rounded-2xl p-3.5 flex items-center gap-3">
          <div className="p-2.5 bg-zinc-800 rounded-xl border border-white/10 text-zinc-300 shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[9px] font-mono uppercase text-slate-500">Affected Users (Live)</div>
            <div className="text-lg font-black text-zinc-300 tracking-tight">
              {errorsList.reduce((acc, err) => acc + (err.status !== 'Resolved' ? err.affectedUsers : 0), 0)}
            </div>
          </div>
        </div>

        <div className="bg-[#09090b]/75 border border-slate-900 rounded-2xl p-3.5 flex items-center gap-3">
          <div className="p-2.5 bg-zinc-800 rounded-xl border border-white/10 text-zinc-300 shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[9px] font-mono uppercase text-slate-500">Containment MTTR</div>
            <div className="text-lg font-black text-zinc-300 tracking-tight">
              11.4 mins
            </div>
          </div>
        </div>

        <div className="bg-[#09090b]/75 border border-slate-900 rounded-2xl p-3.5 flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400 shrink-0">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[9px] font-mono uppercase text-slate-500">Uncaught Error Rate</div>
            <div className="text-lg font-black text-amber-400 tracking-tight">
              0.14 %
            </div>
          </div>
        </div>
      </div>

      {/* CORE CONTROL TABS */}
      <div className="flex border-b border-slate-900 pb-3 mb-6 gap-2">
        <button
          onClick={() => { onTriggerSound(520); setActiveTab('feed'); }}
          className={`px-4 py-2 font-mono text-xs font-bold rounded-xl transition border ${
            activeTab === 'feed'
              ? 'bg-rose-500/10 border-rose-500/25 text-rose-400 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          ☢️ CORE REACTION FEED
        </button>
        <button
          onClick={() => { onTriggerSound(580); setActiveTab('alerting'); }}
          className={`px-4 py-2 font-mono text-xs font-bold rounded-xl transition border ${
            activeTab === 'alerting'
              ? 'bg-rose-500/10 border-rose-500/25 text-rose-400 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          🚨 ALERTING GATE RULES
        </button>
        <button
          onClick={() => { onTriggerSound(640); setActiveTab('analytics'); }}
          className={`px-4 py-2 font-mono text-xs font-bold rounded-xl transition border ${
            activeTab === 'analytics'
              ? 'bg-rose-500/10 border-rose-500/25 text-rose-400 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          📊 ANALYTICAL DECAY
        </button>
        <button
          onClick={() => { onTriggerSound(700); setActiveTab('replay'); }}
          className={`px-4 py-2 font-mono text-xs font-bold rounded-xl transition border ${
            activeTab === 'replay'
              ? 'bg-rose-500/10 border-rose-500/25 text-rose-400 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          📹 USER REPLAY DECKS
        </button>
      </div>

      <AnimatePresence mode="wait">
        
        {/* TABS 1: FEED & CONTROL CENTER */}
        {activeTab === 'feed' && (
          <motion.div 
            key="feed"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* LEFT: ERROR GROUPS COLUMN */}
            <div className="lg:col-span-4 space-y-4">
              
              {/* Search and Filters */}
              <div className="bg-slate-950/80 p-4 border border-rose-950/20 rounded-2.5xl space-y-3">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-550" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search stack trace message..."
                    className="w-full bg-[#030509] border border-slate-900 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-300 placeholder-slate-550 focus:outline-none focus:ring-1 focus:ring-rose-500/40 font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] font-mono uppercase text-slate-500 block mb-1">Severity</label>
                    <select
                      value={severityFilter}
                      onChange={(e) => setSeverityFilter(e.target.value)}
                      className="w-full bg-[#030509] border border-slate-900 rounded-lg px-2 py-1 text-[10px] font-mono text-slate-350 focus:outline-none"
                    >
                      <option value="All">ALL SEVERITY</option>
                      <option value="CRITICAL">🔴 CRITICAL</option>
                      <option value="WARNING">🟡 WARNING</option>
                      <option value="INFO">🔵 INFO</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-mono uppercase text-slate-500 block mb-1">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full bg-[#030509] border border-slate-900 rounded-lg px-2 py-1 text-[10px] font-mono text-slate-350 focus:outline-none"
                    >
                      <option value="All">ALL STATUS</option>
                      <option value="Open">📖 OPEN</option>
                      <option value="In Progress">⚡ IN PROGRESS</option>
                      <option value="Resolved">🟢 RESOLVED</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Error list */}
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {filteredErrors.map((err) => {
                  const isSelected = err.id === selectedErrorId;
                  const isCritical = err.severity === 'CRITICAL';
                  const isResolved = err.status === 'Resolved';
                  
                  return (
                    <div
                      key={err.id}
                      onClick={() => { onTriggerSound(500); setSelectedErrorId(err.id); }}
                      className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                        isSelected 
                          ? 'bg-rose-950/20 border-rose-500/60 shadow-[0_0_12px_rgba(239,68,68,0.15)]' 
                          : isResolved 
                            ? 'bg-slate-950/40 border-slate-900/60 hover:bg-slate-950/70'
                            : isCritical 
                              ? 'bg-[#0c0508]/80 border-rose-950/30 hover:border-rose-500/30' 
                              : 'bg-slate-950/80 border-slate-900/60 hover:border-amber-500/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[8.5px] font-mono text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                          FINGERPRINT: {err.fingerprint.substring(0, 8)}
                        </span>
                        
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[8.5px] font-bold font-mono px-1.5 py-0.2 rounded ${
                            err.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                          }`}>
                            {err.severity}
                          </span>
                          <span className={`text-[8.5px] px-1.5 py-0.2 font-bold font-mono rounded ${
                            err.status === 'Resolved' ? 'bg-zinc-800 text-zinc-300' : 'bg-rose-500/20 text-rose-400'
                          }`}>
                            {err.status.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <h4 className={`text-xs font-extrabold line-clamp-1 truncate ${
                        isResolved ? 'text-slate-500 line-through' : 'text-slate-200'
                      }`}>
                        {err.title}
                      </h4>
                      <p className="text-[10px] font-mono text-slate-500 mt-1 line-clamp-1">{err.route}</p>

                      <div className="flex items-center justify-between mt-3 text-[10px] font-mono text-slate-550 border-t border-slate-900/50 pt-2">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {err.occurrences} matches
                        </span>
                        <span>{err.affectedUsers} affected users</span>
                      </div>
                    </div>
                  );
                })}

                {filteredErrors.length === 0 && (
                  <div className="p-8 text-center bg-slate-950/40 border border-slate-900 rounded-3xl text-slate-500 font-mono text-xs">
                    No active exception cascades found. Core reaction stable.
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: ERROR DETAIL & ACTION PANEL */}
            <div className="lg:col-span-8">
              <AnimatePresence mode="wait">
                {selectedError ? (
                  <motion.div
                    key={selectedError.id}
                    initial={{ opacity: 0, scale: 0.99 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-[#09090b]/85 border border-rose-950/30 rounded-3xl p-5 md:p-6 space-y-6 shadow-2xl"
                  >
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4 border-b border-rose-950/20 pb-5">
                      <div>
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 font-mono text-[9px] rounded-md border border-rose-500/20 uppercase">
                            RELEASE: {selectedError.release}
                          </span>
                          <span className="px-2 py-0.5 bg-[#0e1625] text-zinc-300 font-mono text-[9px] rounded-md border border-white/10 uppercase">
                            ENV: {selectedError.env}
                          </span>
                          <span className="px-2 py-0.5 bg-slate-900 text-slate-400 font-mono text-[9px] rounded-md border border-slate-800 uppercase">
                            ROUTE: {selectedError.route}
                          </span>
                        </div>
                        <h3 className="text-base font-black text-rose-450 tracking-wide break-words max-w-2xl leading-snug">
                          {selectedError.title}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">{selectedError.message}</p>
                      </div>

                      {/* Manual cool assignment workflows */}
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <div className="text-right">
                          <span className="text-[9px] font-mono uppercase text-slate-500 block">Responsible Guard</span>
                          <span className="text-xs font-mono font-bold text-zinc-300">{selectedError.assignedTo}</span>
                        </div>
                        
                        {selectedError.status !== 'Resolved' ? (
                          <div className="flex gap-2 mt-1">
                            <button
                              onClick={() => {
                                onTriggerSound(450);
                                setErrorsList(prev => prev.map(e => e.id === selectedError.id ? { ...e, assignedTo: 'namireddysreeshanth@gmail.com' } : e));
                                onTriggerNotification("Nuclear reactor bug assigned to master engineer Sreeshanth.", "info");
                              }}
                              className="px-2.5 py-1.5 bg-slate-905 hover:bg-slate-900 text-slate-350 border border-slate-800 rounded-lg font-mono text-[10px] font-bold"
                            >
                              Assign to Me
                            </button>
                            <button
                              onClick={() => {
                                onTriggerSound(750);
                                setErrorsList(prev => prev.map(e => e.id === selectedError.id ? { ...e, status: 'In Progress' } : e));
                                onTriggerNotification("Signal state transitioned to IN_PROGRESS.", "info");
                              }}
                              className="px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-lg font-mono text-[10px] font-bold"
                            >
                              Flag Progress
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-zinc-300 font-mono text-[10px] border border-white/10 bg-zinc-800 px-3 py-1.5 rounded-lg font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5 animate-bounce" />
                            CRASH MELTDOWN CONTAINED
                          </div>
                        )}
                      </div>
                    </div>

                    {/* INTERACTIVE STACK TRACE & BLAME MAP */}
                    <div>
                      <h4 className="text-xs font-bold font-mono text-slate-400 mb-2.5 flex items-center gap-1.5">
                        <Terminal className="w-4 h-4 text-rose-500" />
                        INTERACTIVE REACTION TRACE & RECENT COMMITS (GIT BLAME)
                      </h4>
                      <div className="space-y-4">
                        {selectedError.stackTrace.map((frame, fileIdx) => (
                          <div key={fileIdx} className="bg-slate-950/80 border border-slate-900 rounded-2xl overflow-hidden font-mono">
                            {/* Frame Header */}
                            <div className="bg-slate-900 px-4 py-2 flex justify-between items-center text-[10.5px]">
                              <span className="text-slate-300 font-bold">
                                {frame.file}:{frame.line} in <code className="text-rose-400 font-black">{frame.method}()</code>
                              </span>
                              <span className="text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded text-[9px] border border-amber-500/15">
                                Blame: @{frame.blameAuthor} ({frame.blameCommit})
                              </span>
                            </div>
                            {/* Surrounding Code snippet */}
                            <div className="p-3 text-[10.5px] text-slate-450 leading-relaxed space-y-1">
                              {frame.codeAround.map((codeLine, lineIdx) => {
                                const isTarget = codeLine.includes('CRASH') || codeLine.includes('🚨');
                                return (
                                  <pre 
                                    key={lineIdx} 
                                    className={`px-2 py-1 rounded ${
                                      isTarget ? 'bg-red-500/10 border-l-2 border-red-500 text-rose-450 font-extrabold animate-pulse' : ''
                                    }`}
                                  >
                                    {codeLine}
                                  </pre>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* VIOLET GLOWING AI DIAGNOSTIC ENGINE */}
                    <div className="bg-white/5 border border-white/10 rounded-2.5xl p-5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-48 h-48 bg-zinc-800 rounded-full blur-3xl pointer-events-none" />
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-zinc-800 animate-pulse shrink-0" />
                          <h4 className="text-xs font-black font-mono text-zinc-300 uppercase tracking-widest">
                            AI Oracle-X Root Cause Diagnostic Model
                          </h4>
                        </div>
                        
                        <button
                          onClick={() => runAiDiagnostic(selectedError.id)}
                          disabled={analyzingId === selectedError.id}
                          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-800 disabled:opacity-40 text-white font-mono text-[10.5px] font-black uppercase rounded-xl shadow-lg shadow-indigo-600/15 border border-white/10 transition flex items-center gap-1.5 shrink-0"
                        >
                          {analyzingId === selectedError.id ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              RECONSTRUCTING DATA FLOW...
                            </>
                          ) : (
                            <>
                              <Zap className="w-3.5 h-3.5 text-amber-300" />
                              ANALYZE VIA COGNITIVE RADAR
                            </>
                          )}
                        </button>
                      </div>

                      {aiAnalysisResult[selectedError.id] ? (
                        <div className="space-y-4 animate-fade-in font-mono text-[11px] select-text">
                          <div className="bg-slate-950/60 p-3.5 border border-white/10 rounded-xl">
                            <span className="text-[9.5px] uppercase font-black text-slate-500 block mb-1">Culpability Hypothesis</span>
                            <div className="text-zinc-300 font-bold">{aiAnalysisResult[selectedError.id].hypothesis}</div>
                            <div className="text-[10px] text-amber-400 mt-1 font-bold">Confidence Score: {aiAnalysisResult[selectedError.id].confidence}%</div>
                          </div>

                          <div className="bg-[#030509] p-3.5 border border-slate-900 rounded-xl">
                            <span className="text-[9.5px] uppercase font-black text-slate-500 block mb-1">Explanation Summary</span>
                            <p className="text-slate-400 leading-relaxed text-xs">{aiAnalysisResult[selectedError.id].explanation}</p>
                          </div>

                          <div className="bg-slate-950/90 border border-slate-900 rounded-xl overflow-hidden">
                            <div className="bg-slate-900 px-3 py-1.5 text-[9px] uppercase font-black text-slate-500 flex justify-between items-center">
                              <span>Remediation Target Proposal</span>
                              <span className="text-zinc-300">RECOMMENDED FIX</span>
                            </div>
                            <pre className="p-3 text-[10.5px] text-zinc-300 leading-relaxed overflow-x-auto">
                              {aiAnalysisResult[selectedError.id].suggestedFix}
                            </pre>
                          </div>

                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleApplyFix(selectedError.id)}
                              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-800 text-white font-mono text-xs font-black uppercase rounded-lg border border-white/10 shadow transition active:scale-95"
                            >
                              COMPILE & APPLY AUTOMATED FIX
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-[10px] font-mono text-slate-500 leading-relaxed">
                          Hypothesize connection leakages, undefined objects state, and memory pressure. Trigger Oracle scan on exception stack frames or Git change logs to pinpoint fault vectors.
                        </p>
                      )}
                    </div>

                    {/* DEP CORRELATION TIMELINE */}
                    <div className="bg-slate-950/60 p-4 border border-slate-900 rounded-2.5xl space-y-3 font-mono">
                      <h4 className="text-[10.5px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-[#e4e4e7]" />
                        DEPLOYMENT CORRELATION TIMELINE
                      </h4>
                      <div className="p-3 bg-[#0d1625]/20 border border-[#1d4ed8]/20 rounded-xl text-xs text-zinc-300 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-zinc-300 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-extrabold text-slate-200">Meltdown spike correlated in commit delta stream:</p>
                          <p className="text-[11px] mt-1 text-indigo-305">
                            This error started <span className="text-amber-400 font-black animate-pulse">2 minutes after</span> deploy <code className="bg-slate-950 px-1 py-0.5 rounded text-zinc-200">v2.14.0-rc2 (a3f7beb0)</code> pushed by @jameson.
                          </p>
                          <p className="text-[10px] text-slate-500 mt-2">
                            Affected files include: <code className="text-zinc-300 font-bold">src/server/authService.ts</code>. Includes pull request #a3f7.
                          </p>
                          <a 
                            href="#pr-link-mimic" 
                            onClick={(e) => { e.preventDefault(); onTriggerNotification("Mock transition: opened Pull Request #1402 on Github.", "info"); }}
                            className="inline-flex items-center gap-1 text-[10px] text-zinc-300 hover:underline mt-2 font-bold"
                          >
                            Open pull request detail review <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* METADATA REQUEST CONTEXT TABS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Request Info */}
                      <div className="bg-slate-950 p-4 border border-slate-900 rounded-2.5xl space-y-3.5 font-mono">
                        <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">HTTP Transmission Payload</h4>
                        <div className="text-[10.5px] space-y-1.5 text-slate-450 select-text">
                          <div>
                            <span className="text-slate-550 mr-1.5">URL:</span>
                            <span className="text-slate-200 break-all">{selectedError.requestContext.url}</span>
                          </div>
                          <div>
                            <span className="text-slate-550 mr-1.5">METHOD:</span>
                            <span className="text-rose-400 font-black">{selectedError.requestContext.method}</span>
                          </div>
                          <div>
                            <span className="text-slate-550 mr-1.5">CLIENT CLIENT_IP:</span>
                            <span className="text-zinc-300">{selectedError.requestContext.ip}</span>
                          </div>
                          <div>
                            <span className="text-slate-550 mr-1.5">PAYLOAD PAYLOAD:</span>
                            <code className="block bg-[#030509] p-2 rounded border border-slate-900 mt-1 max-w-full text-slate-300">{selectedError.requestContext.body}</code>
                          </div>
                        </div>
                      </div>

                      {/* Event logs timeline */}
                      <div className="bg-slate-950 p-4 border border-slate-900 rounded-2.5xl space-y-3 font-mono">
                        <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">BREADCRUMB TIMELINE STEPS</h4>
                        <div className="space-y-2">
                          {selectedError.breadcrumbs.map((bc, idx) => (
                            <div key={idx} className="flex gap-2 text-[10px]">
                              <span className="text-slate-550 shrink-0">{bc.timestamp}</span>
                              <span className={`px-1.5 py-0.2 rounded shrink-0 leading-none h-3.5 ${
                                bc.type === 'error' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-slate-900 text-slate-400'
                              }`}>
                                {bc.category}
                              </span>
                              <span className="text-slate-350 break-words">{bc.message}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                  </motion.div>
                ) : (
                  <div className="h-full flex items-center justify-center p-12 text-center bg-slate-950/40 border border-slate-900 rounded-3xl text-slate-550 font-mono text-xs">
                    Please select an active atomic failure reactor node to analyze its fallout profile.
                  </div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* TAB 2: ALERTING ENGINE */}
        {activeTab === 'alerting' && (
          <motion.div 
            key="alerting"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <div className="bg-[#09090b]/75 border border-slate-900 rounded-2.5xl p-5 md:p-6 space-y-6">
              <div>
                <h3 className="text-sm font-black text-slate-300 uppercase font-mono tracking-wider">☢️ INCIDENT CONTROLLER SLA SETTINGS</h3>
                <p className="text-xs text-slate-500 mt-1">Configure threshold containment triggers. If standard occurrences bypass configured targets, paging and telemetry gates lock automatic deploys.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold font-mono text-slate-400 block mb-2">
                      Error spike thresh rate (Occurrences / Minute): <span className="text-[#e4e4e7] font-black">{alertThreshold}</span>
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="100"
                      value={alertThreshold}
                      onChange={(e) => { onTriggerSound(560); setAlertThreshold(parseInt(e.target.value)); }}
                      className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-[#e4e4e7]"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-slate-550 mt-1">
                      <span>5 Err/min</span>
                      <span>50 Err/min</span>
                      <span>100 Err/min</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <span className="text-xs font-bold font-mono text-slate-400 block">Integration Channels Enabled</span>
                    
                    <label className="flex items-center gap-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-900 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={slackEnabled}
                        onChange={(e) => { onTriggerSound(420); setSlackEnabled(e.target.checked); }}
                        className="rounded border-[#2e4260] bg-[#020408] text-rose-500 focus:ring-rose-500/40"
                      />
                      <div className="font-mono text-xs">
                        <div className="font-bold text-slate-200">Slack Stream Notification (#ops-incident-warroom)</div>
                        <span className="text-[10px] text-slate-500">Post full incident context blocks automatically to channels.</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-900 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pagerDutyEnabled}
                        onChange={(e) => { onTriggerSound(490); setPagerDutyEnabled(e.target.checked); }}
                        className="rounded border-[#2e4260] bg-[#020408] text-rose-500 focus:ring-rose-500/30"
                      />
                      <div className="font-mono text-xs">
                        <div className="font-bold text-slate-200">PagerDuty Call Escalations</div>
                        <span className="text-[10px] text-slate-500">Initiate automated phone paging to on-call engineers.</span>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="bg-slate-950/60 p-4 border border-rose-950/10 rounded-2xl space-y-4 font-mono">
                  <h4 className="text-[10.5px] font-black text-rose-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Activity className="w-4 h-4 animate-pulse" />
                    LIVE DEFENSE ROSTER (ON-CALL SCHEDULE)
                  </h4>
                  <div className="space-y-2.5 text-xs text-slate-350">
                    <div className="p-3 bg-slate-900 rounded-xl flex justify-between items-center border border-slate-850">
                      <div>
                        <span className="text-slate-500 text-[9px] block">PRIMARY SENTRY</span>
                        <span className="font-bold text-slate-250">Sreeshanth Namireddy</span>
                      </div>
                      <span className="text-[9.5px] bg-[#e4e4e7]/10 text-[#e4e4e7] border border-[#e4e4e7]/20 px-2 py-0.5 rounded">ACTIVE ON duty</span>
                    </div>
                    
                    <div className="p-3 bg-slate-900/40 rounded-xl flex justify-between items-center text-slate-450 border border-transparent">
                      <div>
                        <span className="text-slate-550 text-[9px] block">SECONDARY SUPPORT</span>
                        <span>Jameson K.</span>
                      </div>
                      <span className="text-[9.5px] text-slate-500">STANDBY</span>
                    </div>

                    <p className="text-[10px] text-slate-500 leading-relaxed border-t border-slate-900 pt-3">
                      Paging rotation cycles every 168 hours. Escalates to executive engineering if incident goes unacknowledged under 12 minutes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 3: ERROR ANALYTICS */}
        {activeTab === 'analytics' && (
          <motion.div 
            key="analytics"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Leaderboard */}
              <div className="bg-slate-950/80 p-5 border border-slate-900 rounded-2.5xl space-y-4 font-mono">
                <h4 className="text-xs font-black text-rose-400 uppercase tracking-widest">🏆 INCIDENT FREQUENCY LEADERBOARD</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-rose-500/5 rounded-xl border border-rose-500/10 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-rose-350">TypeError: Property "sessionToken" null</span>
                      <span className="text-[9px] text-slate-500 block mt-1">Route: /api/v1/auth/session/renew</span>
                    </div>
                    <span className="font-black text-rose-400">412 Instances</span>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-850 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-slate-300">DatabaseTimeoutError: Connection leak</span>
                      <span className="text-[9px] text-slate-500 block mt-1">Route: /api/v1/analytics/db-scan</span>
                    </div>
                    <span className="font-bold text-slate-400">84 Instances</span>
                  </div>

                  <div className="p-3 bg-slate-900/60 rounded-xl flex justify-between items-center text-xs text-slate-450 border border-transparent">
                    <div>
                      <span className="text-slate-400">IndexOutOfBoundsException: request keys chunk</span>
                      <span className="text-[9px] text-slate-550 block mt-1">Route: /api/v1/vault/keys/list</span>
                    </div>
                    <span>19 Instances</span>
                  </div>
                </div>
              </div>

              {/* SLA compliance */}
              <div className="bg-slate-950/80 p-5 border border-slate-900 rounded-2.5xl space-y-4 font-mono select-text">
                <h4 className="text-xs font-black text-zinc-300 uppercase tracking-widest">🛡️ ERROR BUDGET & SLA HYGIENE</h4>
                <div className="space-y-3.5">
                  <div className="flex justify-between text-xs text-slate-350">
                    <span>Monthly SLA Budget Allocated:</span>
                    <span className="font-bold text-slate-200">99.95 %</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-350">
                    <span>Current Active Score:</span>
                    <span className="font-bold text-zinc-300">99.98 %</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-350 border-b border-slate-900 pb-2">
                    <span>Remaining Error Budget:</span>
                    <span className="font-bold text-[#e4e4e7]">0.02% of requests</span>
                  </div>

                  <div className="bg-zinc-800 p-3 rounded-xl border border-white/10 text-[10.5px] text-zinc-300 leading-relaxed">
                    SLA criteria maintained with exceptional margins. Excellent mean time to resolution and low user occurrence footprint monitored by the active on-call sentry.
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* TAB 4: REPLAY ENGINE */}
        {activeTab === 'replay' && (
          <motion.div 
            key="replay"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <div className="bg-slate-950/80 p-5 border border-slate-900 rounded-2.5xl space-y-5 font-mono">
              <div>
                <h3 className="text-sm font-black text-slate-300 uppercase tracking-wider">📹 DEFIANT REPLAY RECONSTRUCTION DECK</h3>
                <p className="text-xs text-slate-505 mt-1">Session recording replays the absolute layout events and inputs of users at the exact millisecond of fault triggers to replicate crashes in local scopes.</p>
              </div>

              <div className="p-4 bg-[#030509] rounded-2xl border border-slate-900 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-900 pb-3 flex-wrap gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                    <span className="font-bold text-slate-300">Replaying session: user_sess_7af88019</span>
                  </div>
                  <span className="text-slate-500 text-[11px]">Recorded Live: 2026-05-23 09:58:44</span>
                </div>

                <div className="relative h-48 bg-[#010204]/90 rounded-xl border border-slate-900/60 flex flex-col items-center justify-center p-6 text-center text-slate-450 overflow-hidden">
                  <div className="absolute top-2 left-2 text-[9px] text-[#e4e4e7] animate-pulse">● PLAYING SEC_RECORDING</div>
                  <Play className="w-8 h-8 text-rose-500 animate-pulse mb-2.5" />
                  <p className="text-xs max-w-sm text-slate-350 leading-relaxed font-bold">
                    Replay simulated user mouse cursor navigating to page <code className="text-zinc-300">/api/v1/auth/session/renew</code>, firing header metadata.
                  </p>
                  <p className="text-[10px] text-slate-550 mt-1">
                    Wait time: 00:03.412 | Mouse Event (58, 240) | Trigger Exception Code C_68
                  </p>
                </div>

                <div className="bg-[#030509] border border-slate-900 rounded-xl">
                  <div className="bg-slate-900 px-3.5 py-1.5 text-[9.5px] text-slate-400 font-extrabold uppercase flex justify-between">
                    <span>Generated Test Script (Vitest/Playwright Mock)</span>
                    <span className="text-zinc-300">Isolated Reproduction Script</span>
                  </div>
                  <pre className="p-3.5 text-[10.5px] text-slate-400 leading-relaxed overflow-x-auto whitespace-pre-wrap">
                    {`import { test, expect } from 'vitest';
import { renewSessionCookie } from './authService';

test('reproduce crash session_7af88019', async () => {
  const mockRequest = new Request('https://api.devstate.internal/api/v1/auth/session/renew', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ expiredToken: 'jwt-sec-99a' })
  });
  
  // Re-run execution route locally to capture TypeError
  await expect(renewSessionCookie(mockRequest)).rejects.toThrow();
});`}
                  </pre>
                </div>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
