import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Database, Server, Shield, Activity, Search, Play, 
  Terminal, History, Save, Download, FileJson, BarChart3, 
  Sparkles, Layers, RefreshCw, Trash2, Edit2, Check, AlertCircle, 
  Lock, Globe, Clock, ArrowRight, Eye, Sparkle, Plus, AlertTriangle, 
  Undo2, FileText, ChevronRight, LayoutGrid, Cpu, TrendingUp, KeyRound, CloudLightning
} from "lucide-react";
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend 
} from "recharts";

interface ChronicleDatabaseCockpitProps {
  onTriggerSound?: (multiplier?: number) => void;
  onTriggerNotification?: (msg: string, type: "success" | "info" | "error") => void;
}

// Simulated active pool stats
interface PoolStats {
  active: number;
  idle: number;
  max: number;
  queueSize: number;
}

interface TableColumn {
  name: string;
  type: string;
  isPk: boolean;
  isFk: boolean;
  refTable?: string;
  isNullable: boolean;
}

interface DatabaseTable {
  name: string;
  rows: number;
  columns: TableColumn[];
  indexes: string[];
}

interface QueryTab {
  id: string;
  title: string;
  code: string;
}

export default function ChronicleDatabaseCockpit({ 
  onTriggerSound = () => {}, 
  onTriggerNotification = () => {} 
}: ChronicleDatabaseCockpitProps) {
  // Mode selection: Connection, Schema, Workbench, AI Assistant, Migrations, Data Browser, Diagnostics, Backups
  const [activeSubTab, setActiveSubTab] = useState<
    "connection" | "schema" | "workbench" | "ai" | "migrations" | "data" | "diagnostics" | "backups" | "access"
  >("workbench");

  // State
  const [selectedProfile, setSelectedProfile] = useState<string>("prod-neon-main");
  const [searchTableQuery, setSearchTableQuery] = useState<string>("");
  const [selectedTable, setSelectedTable] = useState<string>("users");
  const [latency, setLatency] = useState<number>(14);
  const [isPinging, setIsPinging] = useState<boolean>(false);
  
  // Connection Pool Live Simulation
  const [poolStats, setPoolStats] = useState<PoolStats>({
    active: 12,
    idle: 28,
    max: 100,
    queueSize: 0,
  });

  // Query workbench state
  const [queryTabs, setQueryTabs] = useState<QueryTab[]>([
    { id: "tab-1", title: "Active Registrations", code: "SELECT DATE_TRUNC('day', created_at) AS date, COUNT(*) AS count\nFROM users\nWHERE created_at >= NOW() - INTERVAL '30 days'\nGROUP BY 1 ORDER BY 1 DESC;" },
    { id: "tab-2", title: "Revenue Analysis", code: "SELECT u.channel, SUM(o.amount_usd) as revenue\nFROM orders o\nJOIN users u ON o.user_id = u.id\nGROUP BY u.channel\nORDER BY revenue DESC;" },
    { id: "tab-3", title: "Slow Query Sandbox", code: "SELECT * FROM audit_logs WHERE payload->>'event' = 'auth.login' LIMIT 1000;" }
  ]);
  const [activeTabId, setActiveTabId] = useState<string>("tab-1");
  const [queryInput, setQueryInput] = useState<string>(queryTabs[0].code);
  const [queryTime, setQueryTime] = useState<number>(0);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [workbenchResultFormat, setWorkbenchResultFormat] = useState<"table" | "json" | "chart" | "explain">("table");
  const [historySearchQuery, setHistorySearchQuery] = useState<string>("");
  const [queryHistory, setQueryHistory] = useState<Array<{ id: string; sql: string; time: number; timestamp: string }>>([
    { id: "h-1", sql: "SELECT * FROM users LIMIT 10;", time: 4, timestamp: "11:32 AM" },
    { id: "h-2", sql: "SELECT COUNT(*), is_active FROM users GROUP BY is_active;", time: 18, timestamp: "10:15 AM" },
    { id: "h-3", sql: "UPDATE integrations SET sync_rate = 95 WHERE id = 'slack';", time: 25, timestamp: "09:44 AM" }
  ]);
  const [savedQueries, setSavedQueries] = useState<Array<{ name: string; sql: string }>>([
    { name: "Monthly Active Users", sql: "SELECT COUNT(DISTINCT user_id) FROM sessions WHERE login_at > NOW() - INTERVAL '30 days';" },
    { name: "List Large Tables", sql: "SELECT table_name, pg_relation_size(quote_ident(table_name)) as size FROM information_schema.tables WHERE table_schema='public';" }
  ]);

  // AI assistant states
  const [aiPrompt, setAiPrompt] = useState<string>("");
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  // Connection settings states
  const [sshEnabled, setSshEnabled] = useState<boolean>(false);
  const [sslEnabled, setSslEnabled] = useState<boolean>(true);
  
  // Simulated row data state (for Data Browser)
  const [gridData, setGridData] = useState<Array<any>>([
    { id: 101, username: "alexandria_scribe", email: "scribe@chronicle.io", active: true, role: "archivist", count: 48 },
    { id: 102, username: "neo_matrix", email: "neo@neon.tech", active: true, role: "sentinel", count: 120 },
    { id: 103, username: "hypatia_math", email: "hypatia@alexandria.edu", active: false, role: "curator", count: 4 },
    { id: 104, username: "ptolemy_stars", email: "ptolemy@universe.org", active: true, role: "scribe", count: 75 },
    { id: 105, username: "augustus_caesar", email: "caesar@rome.gov", active: false, role: "magistrate", count: 0 },
  ]);
  const [dataBrowserFilterField, setDataBrowserFilterField] = useState<string>("role");
  const [dataBrowserFilterValue, setDataBrowserFilterValue] = useState<string>("");
  const [editingCell, setEditingCell] = useState<{ id: number; field: string } | null>(null);

  // Migration configurations
  const [migrations, setMigrations] = useState([
    { id: "m-001", name: "001_initial_bootstrap_schema", status: "applied", date: "2026-04-12 14:02", diff: { tablesCreated: ["users", "sessions", "audit_logs"], columnsAdded: 18 } },
    { id: "m-002", name: "002_add_indexing_on_user_email", status: "applied", date: "2026-05-01 09:20", diff: { tablesCreated: [], columnsAdded: 0, indexesCreated: ["idx_users_email"] } },
    { id: "m-003", name: "003_secure_audit_records_hash", status: "applied", date: "2026-05-18 17:55", diff: { tablesCreated: [], columnsAdded: 1, columnsModified: ["audit_logs.payload"] } },
    { id: "m-004", name: "004_create_orders_table_foreign_keys", status: "pending", date: "-", diff: { tablesCreated: ["orders"], columnsAdded: 6, constraintsAdded: ["fk_orders_user_id"] } },
  ]);
  const [showBackupModal, setShowBackupModal] = useState<boolean>(false);
  const [backupSchedule, setBackupSchedule] = useState<string>("daily");
  const [tempRestoreProgress, setTempRestoreProgress] = useState<number | null>(null);

  // Slow queries logs
  const [slowQueryLogs, setSlowQueryLogs] = useState([
    { qid: "q-sf9", duration: "1.45s", timestamp: "5 mins ago", sql: "SELECT SUM(payment_cents) FROM transaction_history u JOIN ledger l ON u.ledger_id = l.id WHERE is_void = false GROUP BY category;", table: "transaction_history", recommendation: "Create composite index on (ledger_id, is_void)" },
    { qid: "q-ap0", duration: "840ms", timestamp: "18 mins ago", sql: "SELECT * FROM audit_logs WHERE LOWER(payload->>'event') LIKE '%auth%' AND created_at < NOW() - INTERVAL '1 year';", table: "audit_logs", recommendation: "Partition audit_logs by year or extract JSON column fields into proper columns" },
    { qid: "q-xz2", duration: "620ms", timestamp: "1 hr ago", sql: "SELECT * FROM profiles WHERE description ILIKE '%engineer%' ORDER BY rating DESC;", table: "profiles", recommendation: "Enable Postgres pg_trgm extension and use full-text GIN search" }
  ]);

  // Periodic simulated variations: connection health & pool fluctuations
  useEffect(() => {
    const timer = setInterval(() => {
      // Simulate connection pool changes
      setPoolStats(prev => {
        const delta = Math.floor(Math.random() * 5) - 2;
        const newActive = Math.max(2, Math.min(60, prev.active + delta));
        const idle = Math.max(5, 70 - newActive);
        return {
          ...prev,
          active: newActive,
          idle: idle,
          queueSize: Math.random() > 0.85 ? Math.floor(Math.random() * 3) : 0
        };
      });

      // Subtle latency drift
      setLatency(prev => {
        const drift = Math.floor(Math.random() * 3) - 1;
        return Math.max(6, Math.min(45, prev + drift));
      });
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  // Update query code state when active tab switches
  useEffect(() => {
    const currentTab = queryTabs.find(t => t.id === activeTabId);
    if (currentTab) {
      setQueryInput(currentTab.code);
    }
  }, [activeTabId, queryTabs]);

  // Profiles data
  const profiles = [
    { id: "prod-neon-main", name: "Neon Production Cluster", type: "PostgreSQL", env: "production", host: "pg.neon.tech", db: "chronicle_main" },
    { id: "staging-supabase", name: "Supabase Staging", type: "PostgreSQL", env: "staging", host: "db.supabase.co", db: "supabase_staging" },
    { id: "local-sqlite", name: "Local SQLite Storage", type: "SQLite", env: "development", host: "localhost", db: "sqlite.db" },
    { id: "redis-cache", name: "Redis Remote Cache", type: "Redis", env: "production", host: "redis.planetscale.live", db: "db_0" },
    { id: "planetscale-v2", name: "PlanetScale DB Server", type: "MySQL", env: "production", host: "aws.planetscale.com", db: "planet_ecommerce" }
  ];

  // Schema data tables definition
  const schemaTables: DatabaseTable[] = [
    {
      name: "users",
      rows: 154820,
      columns: [
        { name: "id", type: "INT4", isPk: true, isFk: false, isNullable: false },
        { name: "username", type: "VARCHAR(64)", isPk: false, isFk: false, isNullable: false },
        { name: "email", type: "VARCHAR(255)", isPk: false, isFk: false, isNullable: false },
        { name: "role", type: "VARCHAR(32)", isPk: false, isFk: false, isNullable: false },
        { name: "channel", type: "VARCHAR(32)", isPk: false, isFk: false, isNullable: true },
        { name: "is_active", type: "BOOL", isPk: false, isFk: false, isNullable: false },
        { name: "created_at", type: "TIMESTAMPTZ", isPk: false, isFk: false, isNullable: false }
      ],
      indexes: ["idx_users_email", "idx_users_active_created"]
    },
    {
      name: "orders",
      rows: 48920,
      columns: [
        { name: "id", type: "INT4", isPk: true, isFk: false, isNullable: false },
        { name: "user_id", type: "INT4", isPk: false, isFk: true, refTable: "users", isNullable: false },
        { name: "amount_usd", type: "NUMERIC(12,2)", isPk: false, isFk: false, isNullable: false },
        { name: "status", type: "VARCHAR(32)", isPk: false, isFk: false, isNullable: false },
        { name: "created_at", type: "TIMESTAMPTZ", isPk: false, isFk: false, isNullable: false }
      ],
      indexes: ["orders_user_id_fk_idx", "idx_orders_created"]
    },
    {
      name: "sessions",
      rows: 843210,
      columns: [
        { name: "token", type: "UUID", isPk: true, isFk: false, isNullable: false },
        { name: "user_id", type: "INT4", isPk: false, isFk: true, refTable: "users", isNullable: false },
        { name: "ip_address", type: "INET", isPk: false, isFk: false, isNullable: true },
        { name: "login_at", type: "TIMESTAMPTZ", isPk: false, isFk: false, isNullable: false }
      ],
      indexes: ["idx_sessions_user_id"]
    },
    {
      name: "audit_logs",
      rows: 4983020,
      columns: [
        { name: "id", type: "INT8", isPk: true, isFk: false, isNullable: false },
        { name: "user_id", type: "INT4", isPk: false, isFk: true, refTable: "users", isNullable: true },
        { name: "payload", type: "JSONB", isPk: false, isFk: false, isNullable: false },
        { name: "created_at", type: "TIMESTAMPTZ", isPk: false, isFk: false, isNullable: false }
      ],
      indexes: ["idx_audit_logs_user_json", "idx_audit_logs_created"]
    }
  ];

  // Simulated chart data based on query output
  const barChartData = [
    { name: "Organic Search", users: 4210, revenue: 125000 },
    { name: "GitHub Referrals", users: 3820, revenue: 98000 },
    { name: "HackerNews Promo", users: 8400, revenue: 185000 },
    { name: "X/Twitter Post", users: 1950, revenue: 41000 },
    { name: "Sponsor Logos", users: 650, revenue: 12000 },
  ];

  const speedTrendData = [
    { label: "10:00", ms: 4 },
    { label: "10:15", ms: 12 },
    { label: "10:30", ms: 14 },
    { label: "10:45", ms: 8 },
    { label: "11:00", ms: 22 },
    { label: "11:15", ms: 14 },
    { label: "11:30", ms: 16 },
  ];

  const handlePingTest = () => {
    setIsPinging(true);
    onTriggerSound(1.2);
    setTimeout(() => {
      setIsPinging(false);
      setLatency(10 + Math.floor(Math.random() * 8));
      onTriggerNotification("Latent response refreshed successfully.", "success");
    }, 850);
  };

  const handleExecuteQuery = () => {
    setIsExecuting(true);
    onTriggerSound(1.4);
    setTimeout(() => {
      setIsExecuting(false);
      const executionMs = 12 + Math.floor(Math.random() * 25);
      setQueryTime(executionMs);
      onTriggerNotification(`Query telemetry verified in ${executionMs}ms.`, "success");

      // Add to query history
      setQueryHistory(prev => [
        { id: `h-${Date.now()}`, sql: queryInput, time: executionMs, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
        ...prev
      ]);
    }, 1100);
  };

  const explainPlanSteps = [
    { step: "NESTED LOOP LEFT JOIN", cost: "128..4920", rows: 154, desc: "Joins user profiles into the billing registers on index pk_id" },
    { step: "  -> INDEX SCAN ON idx_users_email", cost: "0.28..12", rows: 1, desc: "Seeks email addresses matches specifically focusing on the given filter" },
    { step: "  -> SEQUENTIAL SCAN ON orders", cost: "24..3900", rows: 48920, desc: "Scans active transaction history with status='completed' predicate" },
  ];

  // AI response engine simulation
  const handleAskOracle = () => {
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    onTriggerSound(1.1);
    setTimeout(() => {
      setIsAiLoading(false);
      const promptLower = aiPrompt.toLowerCase();
      if (promptLower.includes("sign") || promptLower.includes("user")) {
        setAiResponse(`-- Deep Oracle Automated SQL Suggestion
-- Show users who signed up last month but haven't made a purchase
SELECT 
  u.id, 
  u.username, 
  u.email, 
  u.created_at
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
  AND u.created_at < DATE_TRUNC('month', CURRENT_DATE)
  AND o.id IS NULL;

/* 
EXPLANATION:
1. Joins the user registry with orders table via a LEFT OUTER JOIN.
2. Filter keeps records from last calendar month by clipping intervals.
3. Tests for NULL order IDs which indicates no matching row exists.
*/`);
      } else if (promptLower.includes("slow") || promptLower.includes("index") || promptLower.includes("optimize")) {
        setAiResponse(`-- Optimizing Search Telemetry indices
-- Created a composite GIN index on users.username for faster searches
CREATE INDEX CONCURRENTLY idx_users_username_trgm 
ON users USING pg_trgm (username);

/*
OPTIMIZATION SUMMARY:
- Replacing current B-Tree scan which fails on wildcard searches like '%term%'.
- Decreases typical search latency from 450ms matching scans to ~12ms.
*/`);
      } else {
        setAiResponse(`-- Chronicle Database AI Engine Generated Query
SELECT name, count(*), SUM(size)
FROM schema_catalogs
WHERE domain = '${aiPrompt.replace(/'/g, "''")}'
GROUP BY 1
HAVING count(*) > 5
ORDER BY 3 DESC;

-- Proactive Advice: Verify index triggers are enabled to minimize transactional write latency.`);
      }
      onTriggerNotification("SQL Oracle prophecy downloaded.", "success");
    }, 1400);
  };

  const handleApplyMigration = (id: string) => {
    onTriggerSound(1.3);
    const updated = migrations.map(m => m.id === id ? { ...m, status: "applied", date: new Date().toISOString().slice(0, 16).replace("T", " ") } : m);
    setMigrations(updated);
    onTriggerNotification(`Migration ${id} launched and verified successfully.`, "success");
  };

  const handleRollbackMigration = (id: string) => {
    onTriggerSound(0.8);
    const updated = migrations.map(m => m.id === id ? { ...m, status: "pending", date: "-" } : m);
    setMigrations(updated);
    onTriggerNotification(`Rollback on ${id} executed with snapshot preservation.`, "info");
  };

  const activeProfileData = profiles.find(p => p.id === selectedProfile) || profiles[0];

  return (
    <div className="text-[#e2e8f0]" id="chronicle-cockpit-container">
      {/* HEADER SECTION WITH CHRONICLE BRANDING */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center border-b border-white/10 pb-6 mb-6 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="relative p-2.5 bg-white/5 border border-white/10 rounded-2xl shadow-[0_0_15px_rgba(20,184,166,0.15)] animate-pulse">
              <Database className="w-6 h-6 text-zinc-300" />
              <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-[#090d16]" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-indigo-100 to-amber-200 uppercase font-sans">
                Chronicle Database Cockpit
              </h1>
              <p className="text-[11px] text-zinc-300/70 font-mono tracking-widest uppercase">
                Library of Alexandria Serverless Core Engine • DevState Active Node
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* PROFILE SELECTOR */}
          <div className="flex items-center bg-[#070b12] border border-white/10 rounded-xl px-3 py-1.5 shadow-md">
            <Server className="w-3.5 h-3.5 text-zinc-300 mr-2" />
            <select
              value={selectedProfile}
              onChange={(e) => {
                setSelectedProfile(e.target.value);
                onTriggerSound(1.05);
                onTriggerNotification(`Switched database channel: ${e.target.value}`, "info");
              }}
              className="bg-transparent border-none text-xs font-semibold text-slate-100 focus:outline-none cursor-pointer text-ellipsis max-w-[170px]"
              id="db-profile-selector"
            >
              {profiles.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#0b0f19] text-[#e2e8f0]">
                  [{p.env.toUpperCase()}] {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* ACTIVE LATENCY INDICATOR */}
          <button 
            onClick={handlePingTest}
            disabled={isPinging}
            className="flex items-center bg-[#070b12] border border-white/10 hover:border-white/10 text-slate-300 rounded-xl px-3.5 py-1.5 text-xs font-mono transition duration-150 active:scale-95 disabled:opacity-50"
            title="Refreshes communication ping stats"
            id="db-ping-health-btn"
          >
            <Activity className={`w-3.5 h-3.5 text-zinc-300 mr-1.5 ${isPinging ? 'animate-spin' : 'animate-pulse'}`} />
            <span>PING: </span>
            <span className="font-bold text-amber-400 ml-1">{latency}ms</span>
          </button>
        </div>
      </div>

      {/* HORIZONTAL NAV RAIL WITH ANCIENT-FUTURISTIC COPPER-GOLD GLOW */}
      <div className="flex overflow-x-auto gap-2 p-1.5 bg-[#05070a]/90 border border-white/10 rounded-2xl mb-6 scrollbar-none shadow-inner" id="chronicle-subtabs">
        {[
          { id: "connection", label: "Connection Master", icon: KeyRound, color: "text-amber-400" },
          { id: "schema", label: "Schema Explorer & ERD", icon: Layers, color: "text-zinc-300" },
          { id: "workbench", label: "Query Workbench", icon: Terminal, color: "text-zinc-300" },
          { id: "data", label: "Interactive Data Browser", icon: LayoutGrid, color: "text-amber-400" },
          { id: "ai", label: "Oracle SQL Writer", icon: Sparkles, color: "text-zinc-300" },
          { id: "migrations", label: "Migration Ledger", icon: FileText, color: "text-zinc-300" },
          { id: "diagnostics", label: "NOC Vitals", icon: Activity, color: "text-amber-400 animate-pulse" },
          { id: "backups", label: "Backup Vaults", icon: Lock, color: "text-zinc-300" },
          { id: "access", label: "Access & Roles", icon: Shield, color: "text-zinc-300" }
        ].map((tab) => {
          const isActive = activeSubTab === tab.id;
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSubTab(tab.id as any);
                onTriggerSound(1.15);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 whitespace-nowrap outline-none cursor-pointer ${
                isActive 
                  ? "bg-white/5 text-zinc-200 border border-white/10 shadow-[0_0_12px_rgba(20,184,166,0.18)]" 
                  : "text-slate-400 hover:text-slate-200 hover:bg-[#080c14]/60 border border-transparent"
              }`}
              id={`chronicle-subtab-${tab.id}`}
            >
              <TabIcon className={`w-3.5 h-3.5 ${tab.color}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* MODULE MAIN STAGE */}
      <div className="grid grid-cols-1 gap-6" id="chronicle-main-grid">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: CONNECTION MASTER */}
          {activeSubTab === "connection" && (
            <motion.div
              key="connection-master"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* PROFILE SETUP */}
              <div className="lg:col-span-2 bg-[#09090b]/90 border border-white/10 rounded-2.5xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-zinc-800/5 to-transparent rounded-bl-full pointer-events-none" />
                <h3 className="text-sm font-bold text-zinc-200 mb-4 flex items-center gap-2 font-mono uppercase">
                  <Server className="w-4 h-4 text-amber-500 font-bold" />
                  Connection Profile Configurator
                </h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] text-slate-400 font-mono block uppercase mb-1.5">Profile Label</label>
                      <input 
                        type="text" 
                        defaultValue={activeProfileData.name} 
                        className="w-full bg-[#18181b] border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-white/10 text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-mono block uppercase mb-1.5">Database Dialect</label>
                      <select 
                        defaultValue={activeProfileData.type}
                        className="w-full bg-[#18181b] border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-white/10 text-slate-100"
                      >
                        <option value="PostgreSQL">PostgreSQL</option>
                        <option value="MySQL">MySQL</option>
                        <option value="SQLite">SQLite3 Embedded</option>
                        <option value="Redis">Redis Key Store</option>
                        <option value="MongoDB">MongoDB Document</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="text-[10px] text-slate-400 font-mono block uppercase mb-1.5">Host address / cluster</label>
                      <input 
                        type="text" 
                        defaultValue={activeProfileData.host} 
                        className="w-full bg-[#18181b] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-white/10 text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-mono block uppercase mb-1.5">Port identifier</label>
                      <input 
                        type="number" 
                        defaultValue={activeProfileData.type === "PostgreSQL" ? 5432 : 3306} 
                        className="w-full bg-[#18181b] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-white/10 text-slate-100"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <h4 className="text-xs font-bold text-amber-400 mb-2.5 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5" /> Security & tunneling settings
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-200">Force SSL encryption certificate</span>
                          <span className="text-[10px] text-slate-400">Restricts profiles to verified TLS channels only</span>
                        </div>
                        <button 
                          onClick={() => { setSslEnabled(!sslEnabled); onTriggerSound(1.0); }}
                          className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-200 ${sslEnabled ? "bg-zinc-800" : "bg-slate-800"}`}
                        >
                          <div className={`w-4.5 h-4.5 rounded-full bg-slate-900 transition-transform duration-200 ${sslEnabled ? "translate-x-4.5" : "translate-x-0"}`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between border-t border-white/10 pt-3">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-200">Activate Secure SSH Tunnel</span>
                          <span className="text-[10px] text-slate-400">Routes payload inside active SSH jumps</span>
                        </div>
                        <button 
                          onClick={() => { setSshEnabled(!sshEnabled); onTriggerSound(1.0); }}
                          className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-200 ${sshEnabled ? "bg-amber-500" : "bg-slate-800"}`}
                        >
                          <div className={`w-4.5 h-4.5 rounded-full bg-slate-900 transition-transform duration-200 ${sshEnabled ? "translate-x-4.5" : "translate-x-0"}`} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {sshEnabled && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="p-3 bg-[#0d1320] rounded-xl border border-amber-500/20 space-y-3"
                    >
                      <h5 className="text-[11px] font-mono font-bold text-amber-500 uppercase">SSH Key Tunnel Params</h5>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[9px] text-slate-400 block uppercase mb-1">Jump Server IP</label>
                          <input type="text" placeholder="10.84.192.1" className="w-full bg-[#05080e] border border-amber-500/20 rounded-lg px-2.5 py-1 text-xs text-slate-200" />
                        </div>
                        <div>
                          <label className="text-[9px] text-slate-400 block uppercase mb-1">SSH Username</label>
                          <input type="text" placeholder="root_devstate" className="w-full bg-[#05080e] border border-amber-500/20 rounded-lg px-2.5 py-1 text-xs text-slate-200" />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div className="flex justify-end gap-3 pt-3">
                    <button 
                      onClick={() => {
                        onTriggerSound(1.2);
                        onTriggerNotification("Profile settings successfully preserved in Vault storage.", "success");
                      }}
                      className="bg-gradient-to-r from-zinc-800 to-zinc-900 hover:from-indigo-650 hover:to-blue-650 text-slate-900 font-bold text-xs px-4 py-2 rounded-xl transition duration-150 active:scale-95"
                    >
                      Save Profile Parameters
                    </button>
                  </div>
                </div>
              </div>

              {/* LIVE POOL METRICS */}
              <div className="bg-[#09090b]/90 border border-white/10 rounded-2.5xl p-6 shadow-xl relative flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-zinc-200 mb-4 flex items-center gap-2 font-mono uppercase">
                    <Activity className="w-4 h-4 text-zinc-300" />
                    Connection Pool Telemetry
                  </h3>

                  <div className="space-y-4">
                    <div className="bg-[#18181b] p-3 rounded-xl border border-white/10">
                      <div className="flex justify-between items-center text-[11px] font-mono mb-1.5 text-slate-300">
                        <span>ACTIVE CHANNELS (IN-USE)</span>
                        <span className="text-zinc-300 font-bold">{poolStats.active} / {poolStats.max}</span>
                      </div>
                      <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-400 to-zinc-900 transition-all duration-500" 
                          style={{ width: `${(poolStats.active / poolStats.max) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="bg-[#18181b] p-3 rounded-xl border border-white/10">
                      <div className="flex justify-between items-center text-[11px] font-mono mb-1.5 text-slate-300">
                        <span>IDLE BUFFER HEALTH</span>
                        <span className="text-slate-100 font-bold">{poolStats.idle} channels</span>
                      </div>
                      <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-500 transition-all duration-500" 
                          style={{ width: `${(poolStats.idle / poolStats.max) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="bg-[#18181b] p-2.5 rounded-xl border border-white/10">
                        <span className="block text-[9px] text-slate-400 uppercase font-mono">Max Pool limit</span>
                        <span className="text-sm font-mono font-bold text-zinc-300">{poolStats.max}</span>
                      </div>
                      <div className="bg-[#18181b] p-2.5 rounded-xl border border-white/10">
                        <span className="block text-[9px] text-slate-400 uppercase font-mono">Enqueued requests</span>
                        <span className={`text-sm font-mono font-bold ${poolStats.queueSize > 0 ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`}>
                          {poolStats.queueSize}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Shield className="w-4 h-4 text-zinc-300 shrink-0" />
                    <span>IP Restriction Active: 10.244.x.x range only proxy allowed.</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: SCHEMA EXPLORER & ERD */}
          {activeSubTab === "schema" && (
            <motion.div
              key="schema-explorer"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-4 gap-6"
            >
              {/* TABLES DIRECTORY CARD */}
              <div className="bg-[#09090b]/95 border border-white/10 rounded-2.5xl p-5 shadow-xl flex flex-col h-[520px]">
                <h3 className="text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider mb-3">Database Catalogs</h3>
                
                <div className="relative mb-4">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search tables..."
                    value={searchTableQuery}
                    onChange={(e) => setSearchTableQuery(e.target.value)}
                    className="w-full bg-[#18181b] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-white/10 font-mono text-slate-100"
                  />
                </div>

                <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
                  {schemaTables
                    .filter(t => t.name.toLowerCase().includes(searchTableQuery.toLowerCase()))
                    .map((table) => (
                      <button
                        key={table.name}
                        onClick={() => {
                          setSelectedTable(table.name);
                          onTriggerSound(1.05);
                        }}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl transition duration-150 flex items-center justify-between cursor-pointer ${
                          selectedTable === table.name 
                            ? "bg-white/5 border border-white/10 shadow-[0_0_8px_rgba(20,184,166,0.12)] text-zinc-200"
                            : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/45 border border-transparent"
                        }`}
                      >
                        <span className="font-mono text-xs font-bold font-semibold">{table.name}</span>
                        <span className="text-[10px] bg-white/5 py-0.5 px-2 rounded-full font-mono text-amber-400/80">
                          {table.rows.toLocaleString()}
                        </span>
                      </button>
                    ))}
                </div>
              </div>

              {/* DETAILED COLUMNS & INTERACTIVE ERD DIAGRAM */}
              <div className="lg:col-span-3 bg-[#09090b]/95 border border-white/10 rounded-2.5xl p-6 shadow-xl flex flex-col justify-between min-h-[520px] relative">
                <div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-white/10 mb-4 gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-zinc-200 font-mono uppercase">
                        Structure: <span className="text-amber-400">{selectedTable}</span>
                      </h3>
                      <p className="text-[10px] text-slate-400 font-mono tracking-wide">
                        Physical schema descriptor for table definition
                      </p>
                    </div>

                    <div className="flex gap-2 text-[10px] font-mono text-slate-400">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 bg-yellow-500 rounded-sm" /> PRIMARY KEY</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 bg-zinc-700 rounded-sm" /> FOREIGN KEY</span>
                    </div>
                  </div>

                  {/* SCHEMA INFO TABLE */}
                  <div className="overflow-x-auto select-none">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-white/10 text-zinc-300/75 uppercase tracking-wider font-mono">
                          <th className="py-2 px-3 text-[10px]">Column</th>
                          <th className="py-2 px-3 text-[10px]">Type</th>
                          <th className="py-2 px-3 text-[10px]">Role</th>
                          <th className="py-2 px-3 text-[10px]">Nullable</th>
                          <th className="py-2 px-3 text-[10px]">Index Bind</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-indigo-500/5 font-mono">
                        {(schemaTables.find(t => t.name === selectedTable)?.columns || []).map((col) => (
                          <tr key={col.name} className="hover:bg-white/5 transition-colors">
                            <td className="py-3 px-3 font-semibold text-slate-100 flex items-center gap-2">
                              {col.isPk ? (
                                <span className="w-2 h-2 bg-yellow-500 rounded-sm shrink-0" title="Primary Key constraint anchor" />
                              ) : col.isFk ? (
                                <span className="w-2 h-2 bg-zinc-800 rounded-sm shrink-0" title={`Foreign Key: refs ${col.refTable}`} />
                              ) : (
                                <span className="w-2 h-2 bg-slate-700 rounded-sm shrink-0" />
                              )}
                              <span>{col.name}</span>
                            </td>
                            <td className="py-2 px-3 text-slate-300">{col.type}</td>
                            <td className="py-2 px-3 text-slate-400">
                              {col.isPk ? "PK" : col.isFk ? `FK → ${col.refTable}` : "data field"}
                            </td>
                            <td className="py-2 px-3">
                              <span className={col.isNullable ? "text-slate-400" : "text-zinc-300 font-bold"}>
                                {col.isNullable ? "NULL allowed" : "NOT NULL"}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-amber-500/80">
                              {col.isPk ? "PK_unique_btree" : col.name === "email" ? "idx_users_email_hash" : "none"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* VISUAL ERD RELATIONSHIP SCHEMA PATHS */}
                  <div className="mt-8 p-4 bg-white/5 rounded-2.5xl border border-white/10">
                    <h4 className="text-[11px] font-mono font-bold text-zinc-200 uppercase tracking-widest mb-3">Interactive ERD-Schema Mapping</h4>
                    
                    {/* Simplified schematic representation of database ERD */}
                    <div className="h-32 flex justify-around items-center relative overflow-hidden bg-[#04060b] border border-white/5 rounded-xl px-4">
                      
                      {/* Grid representation */}
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,#090d16_1px,transparent_1px),linear-gradient(to_bottom,#090d16_1px,transparent_1px)] bg-[size:16px_16px] opacity-20 pointer-events-none" />

                      {/* Line connector simulation */}
                      <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        <path 
                          d="M 120 70 C 180 70, 240 70, 310 70" 
                          stroke="#14b8a6" 
                          strokeWidth="2.5" 
                          strokeDasharray="4 3" 
                          fill="none" 
                          className="animate-pulse"
                        />
                        <path 
                          d="M 310 70 C 350 70, 350 100, 480 100" 
                          stroke="#eab308" 
                          strokeWidth="1.5" 
                          fill="none" 
                        />
                      </svg>

                      {/* ERD Nodes */}
                      <div className="px-3.5 py-2.5 bg-[#18181b] border border-white/10 rounded-lg text-center z-10 w-28">
                        <span className="block text-[10px] font-mono font-bold text-zinc-200 uppercase border-b border-white/10 pb-1 mb-1">users</span>
                        <span className="text-[9px] text-slate-500 block font-mono">id (PK)</span>
                        <span className="text-[9px] text-slate-500 block font-mono">email</span>
                      </div>

                      <div className="px-3.5 py-2.5 bg-[#18181b] border border-white/10 rounded-lg text-center z-10 w-28">
                        <span className="block text-[10px] font-mono font-bold text-zinc-200 uppercase border-b border-white/10 pb-1 mb-1">orders</span>
                        <span className="text-[9px] text-yellow-500 block font-mono">user_id (FK)</span>
                        <span className="text-[9px] text-slate-500 block font-mono">amount_usd</span>
                      </div>

                      <div className="px-3.5 py-2.5 bg-[#18181b] border border-amber-500/25 rounded-lg text-center z-10 w-28">
                        <span className="block text-[10px] font-mono font-bold text-amber-400 uppercase border-b border-amber-500/10 pb-1 mb-1">audit_logs</span>
                        <span className="text-[9px] text-yellow-500 block font-mono">user_id (FK)</span>
                        <span className="text-[9px] text-slate-500 block font-mono">payload (jsonb)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center mt-6 pt-4 border-t border-white/10 gap-2 text-[11px] text-slate-400">
                  <span>Current database schema integrity matched state.</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        onTriggerSound(1.2);
                        onTriggerNotification("Generating physical schema dump catalog format...", "info");
                      }}
                      className="text-zinc-300 hover:text-zinc-200 font-bold transition font-mono uppercase"
                    >
                      [EXPORT GRAPH]
                    </button>
                    <span>|</span>
                    <button 
                      onClick={() => {
                        onTriggerSound(1.0);
                        onTriggerNotification("Comparing live state to stored branch catalog.", "info");
                      }}
                      className="text-amber-500 hover:text-amber-400 font-bold transition font-mono uppercase"
                    >
                      [MAPPED DRIFT ALIGN]
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: QUERY WORKBENCH */}
          {activeSubTab === "workbench" && (
            <motion.div
              key="query-workbench"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* INTERACTIVE WORKSPACE GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                
                {/* SAVED & HISTORIC QUERY ARCHIVE SIDE PANEL */}
                <div className="bg-[#09090b]/95 border border-white/10 rounded-2.5xl p-5 shadow-xl flex flex-col justify-between h-[480px]">
                  <div>
                    <h3 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest mb-4 flex items-center justify-between">
                      <span>Query Archives</span>
                      <History className="w-3.5 h-3.5" />
                    </h3>

                    {/* SAVED QUERY SECTION */}
                    <div className="mb-6">
                      <span className="text-[10px] text-slate-400 tracking-wider font-mono uppercase block mb-2">Saved Queries Library</span>
                      <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                        {savedQueries.map((q) => (
                          <button
                            key={q.name}
                            onClick={() => {
                              setQueryInput(q.sql);
                              onTriggerSound(1.1);
                              onTriggerNotification(`Loaded: ${q.name}`, "info");
                            }}
                            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white/5 text-slate-300 hover:text-zinc-200 transition-colors flex items-center justify-between text-xs font-semibold"
                          >
                            <span className="truncate max-w-[150px]">{q.name}</span>
                            <ChevronRight className="w-3 h-3 text-slate-500 shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* HISTORY LIST */}
                    <div className="flex flex-col flex-1">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] text-slate-400 tracking-wider font-mono uppercase block">Query History Log</span>
                        <div className="relative">
                          <Search className="w-3 h-3 absolute left-1.5 top-1.5 text-slate-400" />
                          <input 
                            type="text" 
                            placeholder="Search history..." 
                            value={historySearchQuery}
                            onChange={(e) => setHistorySearchQuery(e.target.value)}
                            className="bg-[#18181b] border border-white/10 text-[10px] rounded px-5 py-1 text-slate-300 focus:outline-none focus:border-white/10 w-32 font-mono"
                          />
                        </div>
                      </div>
                      <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                        {queryHistory.filter(h => h.sql.toLowerCase().includes(historySearchQuery.toLowerCase())).map((h, i) => (
                          <div
                            key={h.id || i}
                            onClick={() => {
                              setQueryInput(h.sql);
                              onTriggerSound(1.0);
                            }}
                            className="p-2 rounded-lg bg-[#0c101a] border border-white/10 hover:border-white/10 hover:bg-slate-900/60 cursor-pointer text-[11px] font-mono truncate transition"
                            title={h.sql}
                          >
                            <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1">
                              <span>Executed: {h.timestamp}</span>
                              <span className="text-amber-500">{h.time}ms</span>
                            </div>
                            <span className="text-slate-300 truncate font-semibold block">{h.sql}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onTriggerSound(0.9);
                      setQueryHistory([]);
                      onTriggerNotification("Query history database pruned.", "info");
                    }}
                    className="w-full border border-red-950 hover:bg-red-950/10 text-rose-500 hover:text-white transition rounded-xl py-2 text-xs font-mono tracking-wider uppercase"
                  >
                    Wipe History Logs
                  </button>
                </div>

                {/* EDITOR CONTAINER */}
                <div className="lg:col-span-3 bg-[#09090b]/95 border border-white/10 rounded-2.5xl p-6 shadow-xl flex flex-col justify-between h-[480px]">
                  
                  {/* WORKBENCH WORKSPACE HEADER TABS */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/10 pb-4.5 gap-2">
                    <div className="flex gap-1.5 scrollbar-none overflow-x-auto">
                      {queryTabs.map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => {
                            setActiveTabId(tab.id);
                            onTriggerSound(1.02);
                          }}
                          className={`px-3.5 py-1.5 rounded-xl font-mono text-[11px] font-bold tracking-wide transition ${
                            activeTabId === tab.id
                              ? "bg-white/5 border border-white/10 text-zinc-200"
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          {tab.title}.sql
                        </button>
                      ))}
                      <button
                        onClick={() => {
                          const newId = `tab-${Date.now()}`;
                          const newTab = { id: newId, title: "Untitled Query", code: "SELECT * FROM users LIMIT 10;" };
                          setQueryTabs([...queryTabs, newTab]);
                          setActiveTabId(newId);
                          onTriggerSound(1.2);
                        }}
                        className="p-1 px-2.5 rounded-xl border border-dashed border-white/10 text-zinc-300 hover:bg-white/5 transition"
                        title="New Query Tab"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          onTriggerSound(1.1);
                          onTriggerNotification(`Saved current query edit: "${queryTabs.find(t => t.id === activeTabId)?.title}"`, "success");
                        }}
                        className="p-2 border border-white/10 hover:border-white/10 text-slate-400 hover:text-slate-100 transition rounded-xl bg-slate-900/60"
                        title="Persist SQL to query files"
                      >
                        <Save className="w-3.5 h-3.5 text-zinc-300" />
                      </button>
                    </div>
                  </div>

                  {/* ACTIVE SQL EDITOR BOX WITH ARCHAEOLOGICAL INSCRIPTIONS STYLE */}
                  <div className="flex-1 my-4 bg-[#04060b] border border-white/10 rounded-2.5xl p-4.5 font-mono text-xs relative overflow-hidden flex flex-col">
                    {/* Ambient Glows */}
                    <div className="absolute top-4 left-6 pointer-events-none opacity-20">
                      <Database className="w-24 h-24 text-zinc-400/10" />
                    </div>

                    <textarea
                      value={queryInput}
                      onChange={(e) => {
                        setQueryInput(e.target.value);
                        setQueryTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, code: e.target.value } : t));
                      }}
                      className="w-full flex-1 bg-transparent border-none outline-none font-mono text-indigo-200 resize-none leading-relaxed overflow-y-auto selection:bg-zinc-800 focus:ring-0"
                      style={{ tabSize: 2 }}
                    />

                    {/* Inline suggestions floating status bar */}
                    <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500 select-none">
                      <span className="flex items-center gap-1.5">
                        <Sparkle className="w-3 h-3 text-amber-500" />
                        <span>Autocompletion suggestions online (Ctrl+Space to summon Assistant)</span>
                      </span>
                      <span>Targeting Profile: <span className="font-bold text-zinc-300">{activeProfileData.host}</span></span>
                    </div>
                  </div>

                  {/* EXECUTION CONTROL STATS */}
                  <div className="flex justify-between items-center">
                    <div className="text-[11px] font-mono text-slate-400">
                      {queryTime > 0 && (
                        <span>Last run completed in: <span className="text-amber-400 font-bold">{queryTime}ms</span></span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={handleExecuteQuery}
                        disabled={isExecuting}
                        className="bg-gradient-to-r from-zinc-800 via-zinc-800 to-amber-400 hover:from-indigo-650 hover:to-amber-550 text-slate-900 font-extrabold text-xs px-5 py-2.5 rounded-2xl flex items-center gap-2 tracking-wider transition active:scale-95 disabled:opacity-50 select-none"
                      >
                        <Play className={`w-3.5 h-3.5 ${isExecuting ? 'animate-pulse' : ''}`} />
                        <span>{isExecuting ? "EXECUTING SQL..." : "SUMMON INSCRIPTION ENGINES"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* RESULT DISPLAY DECK CONTAINER */}
              <div className="bg-[#09090b]/95 border border-white/10 rounded-2.5xl p-6 shadow-xl min-h-[340px]">
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center pb-4.5 border-b border-white/10 mb-4 gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <LayoutGrid className="w-4 h-4 text-amber-500 animate-pulse" />
                    <h4 className="text-xs font-mono font-bold text-zinc-200 uppercase tracking-widest">
                      Inscriptions Output Grid
                    </h4>
                    {workbenchResultFormat === "table" && (
                      <button 
                        onClick={() => {
                          onTriggerSound(1.1);
                          onTriggerNotification("Exported results grid to CSV file.", "success");
                        }}
                        className="ml-2 flex items-center gap-1 px-3 py-1 bg-[#18181b] border border-white/10 rounded text-[10px] font-mono font-bold text-slate-400 hover:text-zinc-200 hover:bg-white/5 transition cursor-pointer"
                        title="Export grid data"
                      >
                        <Download className="w-3 h-3 text-zinc-300" />
                        EXPORT CSV
                      </button>
                    )}
                  </div>

                  <div className="flex bg-[#04060a] p-1 border border-white/10 rounded-xl gap-1">
                    {[
                      { id: "table", label: "Dataset Inscription", icon: LayoutGrid },
                      { id: "json", label: "RAW JSON JSONB", icon: FileJson },
                      { id: "chart", label: "Oracle Charting", icon: BarChart3 },
                      { id: "explain", label: "EXPLAIN Visualizer", icon: Cpu }
                    ].map((fmt) => {
                      const isSelected = workbenchResultFormat === fmt.id;
                      return (
                        <button
                          key={fmt.id}
                          onClick={() => {
                            setWorkbenchResultFormat(fmt.id as any);
                            onTriggerSound(1.05);
                          }}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold transition duration-150 ${
                            isSelected 
                              ? "bg-white/5 text-zinc-200 border border-white/10" 
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                          title={fmt.label}
                        >
                          <fmt.icon className="w-3 h-3 text-amber-500" />
                          <span className="hidden sm:inline">{fmt.id.toUpperCase()}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* RESULT VIEWER SWAP */}
                <AnimatePresence mode="wait">
                  {workbenchResultFormat === "table" && (
                    <motion.div
                      key="table-res"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="overflow-x-auto"
                    >
                      <table className="w-full text-left border-collapse text-xs select-text">
                        <thead>
                          <tr className="border-b border-white/10 text-zinc-300/80 uppercase font-mono">
                            <th className="py-2.5 px-3">RECORD ID</th>
                            <th className="py-2.5 px-3">USERNAME KEY</th>
                            <th className="py-2.5 px-3">EMAIL ATTACH</th>
                            <th className="py-2.5 px-3">STATUS ROLE</th>
                            <th className="py-2.5 px-3">SYNC FREQUENCY</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-indigo-500/5 font-mono">
                          {gridData.map((row) => (
                            <tr key={row.id} className="hover:bg-white/5 transition-colors">
                              <td className="py-2.5 px-3 font-semibold text-zinc-300">#x-{row.id}</td>
                              <td className="py-2.5 px-3 text-slate-100 font-bold">{row.username}</td>
                              <td className="py-2.5 px-3 text-slate-300">{row.email}</td>
                              <td className="py-2.5 px-3">
                                <span className="text-[10px] bg-slate-900 border border-white/10 text-amber-400 rounded-lg px-2 py-0.5">
                                  {row.role.toUpperCase()}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-slate-400">{row.count} times/month</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </motion.div>
                  )}

                  {workbenchResultFormat === "json" && (
                    <motion.div
                      key="json-res"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="bg-slate-950 p-4 rounded-xl border border-white/5 font-mono text-xs text-indigo-200 overflow-x-auto select-text leading-relaxed"
                    >
                      <pre>{JSON.stringify(gridData, null, 2)}</pre>
                    </motion.div>
                  )}

                  {workbenchResultFormat === "chart" && (
                    <motion.div
                      key="chart-res"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="h-64"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barChartData}>
                          <XAxis dataKey="name" stroke="#52525b" fontSize={11} fontStyle="italic" />
                          <YAxis stroke="#52525b" fontSize={11} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: "#09090b", borderColor: "rgba(20, 184, 166, 0.2)", borderRadius: "12px" }}
                            labelStyle={{ color: "#2dd4bf" }}
                          />
                          <Legend />
                          <Bar dataKey="revenue" fill="#14b8a6" radius={[4, 4, 0, 0]} name="Inscribed Revenue ($)">
                            {barChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#14b8a6" : "#f59e0b"} />
                            ))}
                          </Bar>
                          <Bar dataKey="users" fill="#d97706" radius={[4, 4, 0, 0]} name="Active Accounts" />
                        </BarChart>
                      </ResponsiveContainer>
                    </motion.div>
                  )}

                  {workbenchResultFormat === "explain" && (
                    <motion.div
                      key="explain-res"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      <div className="bg-[#18181b] p-3 rounded-xl border border-amber-500/20">
                        <span className="text-[10px] font-mono text-amber-500 font-bold block uppercase mb-1">Estimated Cost Metrics</span>
                        <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                          <div className="bg-[#04060a] p-2 rounded-lg">
                            <span className="block text-[9px] text-slate-500">START COST</span>
                            <span className="font-bold text-zinc-300">128.45</span>
                          </div>
                          <div className="bg-[#04060a] p-2 rounded-lg">
                            <span className="block text-[9px] text-slate-500">PEAK SHIELD TIME</span>
                            <span className="font-bold text-amber-400">4,921.10 ms</span>
                          </div>
                          <div className="bg-[#04060a] p-2 rounded-lg">
                            <span className="block text-[9px] text-slate-500">MAX BUFFER SIZE</span>
                            <span className="font-bold text-slate-200">1.4 MB</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {explainPlanSteps.map((node, i) => (
                          <div key={i} className="flex gap-3 items-start bg-[#0b0f19] border border-white/10 p-3 rounded-xl hover:border-white/10">
                            <div className="p-1 px-2.5 bg-white/5 border border-white/10 rounded text-[10px] font-bold font-mono text-zinc-300">
                              STEP {i + 1}
                            </div>
                            <div className="font-mono">
                              <span className="text-xs font-bold font-semibold block text-slate-100">{node.step}</span>
                              <span className="text-[10px] text-slate-400 block mt-0.5">{node.desc}</span>
                              <div className="flex gap-4 text-[9px] text-zinc-300/80 mt-1">
                                <span>Indexed rows: {node.rows}</span>
                                <span>B-Tree Cost Node: {node.cost}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* TAB 4: INTERACTIVE DATA BROWSER */}
          {activeSubTab === "data" && (
            <motion.div
              key="interactive-data"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-[#09090b]/95 border border-white/10 rounded-2.5xl p-6 shadow-xl space-y-6"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4.5 border-b border-white/10 gap-2">
                <div>
                  <h3 className="text-sm font-bold text-zinc-200 font-mono uppercase">
                    Data Grid Table Browser
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Direct visual cell edit. Double-click fields to update. No SQL required.
                  </p>
                </div>

                {/* ADD RECORD & FILTERS */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex bg-[#18181b] border border-white/10 rounded-xl px-2 py-1 items-center">
                    <select
                      value={dataBrowserFilterField}
                      onChange={(e) => setDataBrowserFilterField(e.target.value)}
                      className="bg-transparent text-xs text-zinc-300 font-mono outline-none focus:ring-0 mr-1.5 focus:bg-[#070b13]"
                    >
                      <option value="username">Username</option>
                      <option value="email">Email</option>
                      <option value="role">Role</option>
                    </select>
                    <input 
                      type="text" 
                      placeholder="Filter value..."
                      value={dataBrowserFilterValue}
                      onChange={(e) => setDataBrowserFilterValue(e.target.value)}
                      className="bg-transparent text-xs font-mono border-none outline-none text-slate-100 max-w-[120px] focus:ring-0" 
                    />
                  </div>

                  <button
                    onClick={() => {
                      const newId = 100 + Math.floor(Math.random() * 900);
                      const newRow = { id: newId, username: "new_scribe_" + newId, email: `scribe${newId}@chronicle.org`, active: true, role: "scribe", count: 0 };
                      setGridData([newRow, ...gridData]);
                      onTriggerSound(1.3);
                      onTriggerNotification("New blank inscript catalog row inserted.", "success");
                    }}
                    className="bg-zinc-800 hover:bg-zinc-800 text-slate-900 font-extrabold text-[11px] px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition active:scale-95"
                    id="add-db-row-btn"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>ADD ROW</span>
                  </button>
                </div>
              </div>

              {/* INTERACTIVE ROW GRID CARDS */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-mono">
                  <thead>
                    <tr className="border-b border-white/10 text-zinc-300 bg-white/5 uppercase">
                      <th className="py-2.5 px-3">#ID</th>
                      <th className="py-2.5 px-3">Username (Primary)</th>
                      <th className="py-2.5 px-3">Email Anchor</th>
                      <th className="py-2.5 px-3">Role Status</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-indigo-500/5">
                    {gridData
                      .filter(row => {
                        if (!dataBrowserFilterValue) return true;
                        const val = row[dataBrowserFilterField]?.toString().toLowerCase();
                        return val?.includes(dataBrowserFilterValue.toLowerCase());
                      })
                      .map((row) => (
                        <tr key={row.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-3 px-3 text-amber-500 font-semibold">{row.id}</td>
                          
                          {/* Username Edit */}
                          <td 
                            className="py-3 px-3 cursor-pointer"
                            onDoubleClick={() => setEditingCell({ id: row.id, field: "username" })}
                          >
                            {editingCell?.id === row.id && editingCell?.field === "username" ? (
                              <input 
                                type="text"
                                defaultValue={row.username}
                                onBlur={(e) => {
                                  setGridData(gridData.map(r => r.id === row.id ? { ...r, username: e.target.value } : r));
                                  setEditingCell(null);
                                  onTriggerSound(0.9);
                                  onTriggerNotification("Inscribed value permanently changed.", "success");
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    setGridData(gridData.map(r => r.id === row.id ? { ...r, username: (e.target as any).value } : r));
                                    setEditingCell(null);
                                    onTriggerSound(0.9);
                                  }
                                }}
                                className="bg-slate-900 text-zinc-200 px-2 py-0.5 border border-white/10 rounded outline-none w-full"
                                autoFocus
                              />
                            ) : (
                              <span className="text-slate-100 font-bold hover:underline" title="Double click to edit cell">{row.username}</span>
                            )}
                          </td>

                          {/* Email Edit */}
                          <td 
                            className="py-3 px-3 cursor-pointer"
                            onDoubleClick={() => setEditingCell({ id: row.id, field: "email" })}
                          >
                            {editingCell?.id === row.id && editingCell?.field === "email" ? (
                              <input 
                                type="text"
                                defaultValue={row.email}
                                onBlur={(e) => {
                                  setGridData(gridData.map(r => r.id === row.id ? { ...r, email: e.target.value } : r));
                                  setEditingCell(null);
                                  onTriggerSound(0.9);
                                }}
                                className="bg-slate-900 text-zinc-200 px-2 py-0.5 border border-white/10 rounded outline-none w-full"
                                autoFocus
                              />
                            ) : (
                              <span className="text-slate-300 hover:underline">{row.email}</span>
                            )}
                          </td>

                          {/* Role selector */}
                          <td className="py-3 px-3">
                            <select
                              value={row.role}
                              onChange={(e) => {
                                setGridData(gridData.map(r => r.id === row.id ? { ...r, role: e.target.value } : r));
                                onTriggerSound(0.95);
                              }}
                              className="bg-[#0b0f19] border border-white/10 text-amber-500 text-[10px] rounded px-2 py-0.5 focus:outline-none"
                            >
                              <option value="archivist">Archivist</option>
                              <option value="sentinel">Sentinel</option>
                              <option value="curator">Curator</option>
                              <option value="scribe">Scribe</option>
                              <option value="magistrate">Magistrate</option>
                            </select>
                          </td>

                          {/* Bulk & Row Operations */}
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => {
                                setGridData(gridData.filter(r => r.id !== row.id));
                                onTriggerSound(0.7);
                                onTriggerNotification(`Row with ID ${row.id} scrubbed from table.`, "error");
                              }}
                              className="text-red-500 hover:text-red-400 p-1 rounded hover:bg-red-950/15 transition-colors"
                              title="Delete row"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* TAB 5: AI SQL WRITER */}
          {activeSubTab === "ai" && (
            <motion.div
              key="oracle-ai"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* INPUT PANEL */}
              <div className="bg-[#09090b]/95 border border-white/10 rounded-2.5xl p-6 shadow-xl flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-zinc-200 font-mono uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-zinc-300 animate-pulse" />
                    Oracle AI SQL Inscriptionist
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono mb-4">
                    Convert natural human intent to database-native queries immediately.
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] text-slate-400 font-mono block uppercase mb-1.5">Your Intent Prompt</label>
                      <textarea
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="e.g. 'Show slow queries grouped by tables' or 'Filter users who have orders worth more than $500'"
                        className="w-full bg-[#0a0d14] border border-white/10 rounded-2xl p-4 text-xs font-mono text-slate-100 min-h-[140px] focus:outline-none focus:border-white/10 resize-none leading-relaxed"
                      />
                    </div>

                    {/* SUGGESTED SHORTCUTS */}
                    <div>
                      <span className="text-[9px] font-mono text-slate-500 block uppercase mb-2">PROMPTS TEMPLATES</span>
                      <div className="flex flex-wrap gap-2">
                        {[
                          "Users signed up this week",
                          "List duplicate order registers",
                          "Add composite index optimization script"
                        ].map((suggestion) => (
                          <button
                            key={suggestion}
                            onClick={() => {
                              setAiPrompt(suggestion);
                              onTriggerSound(1.1);
                            }}
                            className="bg-[#18181b] hover:bg-white/5 border border-white/10 hover:border-white/10 rounded-xl px-3 py-1.5 text-[10px] text-slate-300 transition"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <button
                    onClick={handleAskOracle}
                    disabled={isAiLoading || !aiPrompt.trim()}
                    className="w-full bg-zinc-800 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold text-xs py-3 rounded-2xl flex items-center justify-center gap-1.5 tracking-wider transition active:scale-95 shrink-0"
                    id="db-ai-summon-btn"
                  >
                    <Sparkles className={`w-4 h-4 ${isAiLoading ? 'animate-spin' : ''}`} />
                    <span>{isAiLoading ? "TRANSLATING INTENT..." : "INSCRIBE MAPPED PROPHESY"}</span>
                  </button>
                </div>
              </div>

              {/* OUTPUT PANEL */}
              <div className="bg-[#09090b]/95 border border-white/10 rounded-2.5xl p-6 shadow-xl flex flex-col justify-between min-h-[400px]">
                <div>
                  <span className="text-xs font-mono font-bold text-amber-400 block uppercase tracking-wider mb-3">
                    Resulting Prophesy SQL Schema
                  </span>

                  <AnimatePresence mode="wait">
                    {aiResponse ? (
                      <motion.div
                        key="ai-res"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="bg-slate-950/80 p-4.5 rounded-2xl border border-white/5 font-mono text-xs text-zinc-200 overflow-x-auto leading-relaxed h-[300px]"
                      >
                        <pre className="select-text whitespace-pre-wrap">{aiResponse}</pre>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="ai-empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center h-[300px] text-center border border-dashed border-white/10 rounded-2.5xl bg-slate-950/20"
                      >
                        <Terminal className="w-10 h-10 text-slate-600 mb-2.5" />
                        <span className="text-xs text-slate-400 font-mono uppercase">Oracle core query generator idle.</span>
                        <span className="text-[10px] text-slate-600 font-mono block mt-1">Prompt and summon engine to begin.</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {aiResponse && (
                  <div className="flex justify-end gap-2.5 pt-4 border-t border-white/10">
                    <button
                      onClick={() => {
                        setQueryInput(aiResponse);
                        setActiveSubTab("workbench");
                        onTriggerSound(1.3);
                        onTriggerNotification("Query transferred back to Query Workbench.", "success");
                      }}
                      className="bg-zinc-800 hover:bg-zinc-800 text-slate-900 font-bold text-xs px-4 py-2 rounded-xl transition duration-150 active:scale-95"
                    >
                      Export to Workbench
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 6: MIGRATIONS PANEL */}
          {activeSubTab === "migrations" && (
            <motion.div
              key="migration-manager"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-[#09090b]/95 border border-white/10 rounded-2.5xl p-6 shadow-xl space-y-6"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4.5 border-b border-white/10 gap-2">
                <div>
                  <h3 className="text-sm font-bold text-zinc-200 font-mono uppercase">
                    Active Migrations & Diff Engine
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Ensure production code schema alignment in real-time.
                  </p>
                </div>

                <button
                  onClick={() => {
                    const newMigId = `m-00${migrations.length + 1}`;
                    const newMig = {
                      id: newMigId,
                      name: `00${migrations.length + 1}_incremental_generated_diff`,
                      status: "pending",
                      date: "-",
                      diff: { tablesCreated: [], columnsAdded: 2, indexesCreated: ["idx_generated_" + Date.now().toString().slice(-4)] }
                    };
                    setMigrations([...migrations, newMig]);
                    onTriggerSound(1.2);
                    onTriggerNotification("Schema compared; pending migration template created.", "info");
                  }}
                  className="bg-[#18181b] hover:bg-white/5 border border-white/10 text-zinc-300 font-bold text-[11px] px-3.5 py-1.5 rounded-xl transition active:scale-95"
                  id="generate-migration-btn"
                >
                  COMPUTE DIFFERENCES (GENERATE)
                </button>
              </div>

              {/* LISTING LEDGERS */}
              <div className="space-y-4">
                {migrations.map((mig) => (
                  <div 
                    key={mig.id}
                    className={`p-4 rounded-2.5xl border transition ${
                      mig.status === "applied" 
                        ? "bg-[#0b0f19]/80 border-slate-900" 
                        : "bg-[#11121d] border-amber-900/35"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="font-mono">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 rounded px-2 py-0.5 uppercase tracking-wide">
                            {mig.id}
                          </span>
                          <span className="text-xs font-bold text-slate-100">{mig.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-1">Status: {mig.status.toUpperCase()} • Sync Stamp: {mig.date}</span>
                      </div>

                      <div className="flex gap-2">
                        {mig.status === "pending" ? (
                          <button
                            onClick={() => handleApplyMigration(mig.id)}
                            className="bg-amber-500 hover:bg-amber-600 text-slate-900 text-[10px] font-extrabold px-3 py-1.5 rounded-lg tracking-wider uppercase transition active:scale-95"
                          >
                            Apply Inscription
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              if (window.confirm("CRITICAL: Rollback may cause metadata compression anomalies. Do you wish to continue?")) {
                                handleRollbackMigration(mig.id);
                              }
                            }}
                            className="bg-slate-900 hover:bg-red-950/15 border border-red-500/25 text-red-500 text-[10px] font-extrabold px-3 py-1.5 rounded-lg tracking-wider uppercase transition"
                            title="Rollback action"
                          >
                            UNDO / ROLLBACK
                          </button>
                        )}
                      </div>
                    </div>

                    {/* MAPPED DIFF ANALYSIS */}
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <span className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Estimated Inscription Impact</span>
                      <div className="flex gap-3 text-[10px] font-mono">
                        {mig.diff.tablesCreated && mig.diff.tablesCreated.length > 0 && (
                          <span className="text-zinc-300">Tables created: {mig.diff.tablesCreated.join(", ")}</span>
                        )}
                        {mig.diff.columnsAdded > 0 && (
                          <span className="text-zinc-300">Columns appended: {mig.diff.columnsAdded}</span>
                        )}
                        {mig.diff.indexesCreated && mig.diff.indexesCreated.length > 0 && (
                          <span className="text-amber-400">Indexes added: {mig.diff.indexesCreated.join(", ")}</span>
                        )}
                        {(!mig.diff.tablesCreated || mig.diff.tablesCreated.length === 0) && mig.diff.columnsAdded === 0 && (!mig.diff.indexesCreated || mig.diff.indexesCreated.length === 0) && (
                          <span className="text-slate-500">No drastic schema alignment impacts calculated.</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB 7: NOC DIAGNOSTICS */}
          {activeSubTab === "diagnostics" && (
            <motion.div
              key="diagnostics-vitals"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* SLOW QUERY TELEMETRY TABLE */}
              <div className="lg:col-span-2 bg-[#09090b]/95 border border-white/10 rounded-2.5xl p-6 shadow-xl flex flex-col justify-between min-h-[460px]">
                <div>
                  <h3 className="text-sm font-bold text-zinc-200 font-mono uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                    <AlertTriangle className="text-rose-500 w-4 h-4 animate-bounce" />
                    Hydra Database Bottlenecks NOC
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono mb-4">
                    Real-time captures matching slow threshold limits (&gt; 500ms duration).
                  </p>

                  <div className="space-y-4">
                    {slowQueryLogs.map((log) => (
                      <div key={log.qid} className="p-3 bg-[#0d101a] border border-red-500/10 rounded-xl hover:border-red-500/20 transition duration-150">
                        <div className="flex justify-between items-center text-[10px] font-mono uppercase text-slate-400 mb-1">
                          <span>QID: {log.qid} • Capture: {log.timestamp}</span>
                          <span className="text-red-400 font-bold bg-red-950/40 px-2 py-0.5 rounded border border-red-900/35">{log.duration}</span>
                        </div>
                        <code className="text-xs text-amber-200/90 font-semibold block truncate select-text my-1.5 font-mono">{log.sql}</code>
                        <div className="text-[10px] font-mono text-zinc-300 mt-2 flex items-start gap-1">
                          <span className="font-extrabold uppercase shrink-0">RECOM-ADVICE:</span>
                          <span>{log.recommendation}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-between items-center text-[11px] font-mono text-slate-500">
                  <span>Slow Logger Filter Level configured: &gt;500ms</span>
                  <button 
                    onClick={() => {
                      onTriggerSound(1.1);
                      onTriggerNotification("Performance logs analyzed; indices alignment checked.", "success");
                    }}
                    className="text-zinc-300 hover:text-zinc-200 uppercase font-bold"
                  >
                    [VACUUM FULL SCHEMA ANALYZE]
                  </button>
                </div>
              </div>

              {/* LIVE CACHE RATIO GAUGES */}
              <div className="bg-[#09090b]/95 border border-white/10 rounded-2.5xl p-6 shadow-xl flex flex-col justify-between min-h-[460px]">
                <div>
                  <h3 className="text-sm font-bold text-zinc-200 font-mono uppercase tracking-widest mb-4">
                    Cache Hit registers
                  </h3>

                  <div className="space-y-6">
                    {/* Index cache */}
                    <div className="bg-[#18181b] p-4 rounded-xl border border-white/10 text-center">
                      <span className="block text-[10px] font-mono text-slate-400 uppercase mb-2">INDEX HIT SPEED RATIO</span>
                      <span className="text-2xl font-mono font-bold text-zinc-300">99.78%</span>
                      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-3">
                        <div className="h-full bg-zinc-800" style={{ width: "99.78%" }} />
                      </div>
                    </div>

                    {/* Sequential Cache */}
                    <div className="bg-[#18181b] p-4 rounded-xl border border-white/10 text-center">
                      <span className="block text-[10px] font-mono text-slate-400 uppercase mb-2">SEQ CACHE TABLE RATIO</span>
                      <span className="text-2xl font-mono font-bold text-amber-500 animate-pulse">84.12%</span>
                      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-3">
                        <div className="h-full bg-amber-500" style={{ width: "84.12%" }} />
                      </div>
                    </div>

                    {/* Read IOPS */}
                    <div className="bg-[#18181b] p-4 rounded-xl border border-white/10 flex justify-between items-center font-mono text-xs">
                      <span className="text-slate-400 uppercase">Average Inscription IOPS</span>
                      <span className="font-bold text-zinc-300">4,321 transactions/s</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2 text-xs text-amber-400 leading-snug">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Table Bloat Alert: audit_logs index size exceeds memory limit of 512MB.</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 8: BACKUPS */}
          {activeSubTab === "backups" && (
            <motion.div
              key="backups-vault"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-[#09090b]/95 border border-white/10 rounded-2.5xl p-6 shadow-xl space-y-6"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4.5 border-b border-white/10 gap-2">
                <div>
                  <h3 className="text-sm font-bold text-zinc-200 font-mono uppercase">
                    Storage Vault & Backups Backup Scheduler
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Snapshot databases directly to Amazon S3, Google Cloud, or local volumes.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      onTriggerSound(1.3);
                      setTempRestoreProgress(1);
                      onTriggerNotification("Point-in-time database restoration simulator triggered success verification.", "info");
                    }}
                    className="bg-amber-500 text-slate-900 hover:bg-amber-600 font-bold text-[11px] px-3.5 py-1.5 rounded-xl transition duration-150 active:scale-95"
                    id="trigger-restore-simulate-btn"
                  >
                    TRIGGER POINT-IN-TIME RESTORE
                  </button>
                </div>
              </div>

              {tempRestoreProgress !== null && (
                <div className="p-4 bg-[#0d1320] border border-amber-500/25 rounded-2.5xl space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-amber-400 font-bold uppercase animate-pulse">RESTORATION SIMULATOR IN PROGRESS</span>
                    <span>95% complete</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 animate-pulse" style={{ width: "95%" }} />
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono block">Restoring catalog blocks to temp schema sandboxes, scanning, and validating tables count.</span>
                  <div className="flex justify-end gap-2 pt-2">
                    <button 
                      onClick={() => {
                        setTempRestoreProgress(null);
                        onTriggerSound(1.0);
                        onTriggerNotification("Bypassed restoration state.", "info");
                      }}
                      className="text-[11px] text-slate-400 hover:text-slate-200 uppercase font-bold font-mono"
                    >
                      [DISMISS STATE]
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-[#0b0f19] border border-white/10 rounded-2.5xl">
                  <h4 className="text-xs font-mono font-bold text-slate-200 uppercase mb-3 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-500" /> Snapshot Archives
                  </h4>
                  <div className="space-y-3 font-mono text-xs">
                    <div className="flex justify-between items-center text-slate-300">
                      <span>Daily-S3-Backup-May22</span>
                      <span className="text-zinc-300 text-[11px]">1.8 GB FILE</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-300">
                      <span>Monthly-FullSnapshot-May23</span>
                      <span className="text-zinc-300 text-[11px]">42.5 GB FILE</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-[#0b0f19] border border-white/10 rounded-2.5xl">
                  <h4 className="text-xs font-mono font-bold text-slate-200 uppercase mb-3">Backup Target Provider</h4>
                  <div className="space-y-2 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                      <input type="radio" name="provider" defaultChecked className="text-indigo-550 focus:ring-0" />
                      <span>Amazon Simple Storage S3 Secure Buckets</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-slate-400">
                      <input type="radio" name="provider" className="text-indigo-550 focus:ring-0" />
                      <span>Google Cloud Cloud Storage (GCS) Multi-Region</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-slate-400">
                      <input type="radio" name="provider" className="text-indigo-550 focus:ring-0" />
                      <span>Internal Vault Local Volumes Drive Storage</span>
                    </label>
                  </div>
                </div>
              </div>
            </motion.div>
          )}


          {/* TAB 9: ACCESS & ROLES */}
          {activeSubTab === "access" && (
            <motion.div
              key="access-roles"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 gap-6"
            >
              <div className="bg-[#09090b]/95 border border-white/10 rounded-2.5xl p-6 shadow-xl space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4.5 border-b border-white/10 gap-2">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-zinc-300" />
                    <h3 className="text-sm font-bold text-zinc-200 font-mono uppercase">
                      Identity & Access Management (IAM)
                    </h3>
                  </div>
                  <button className="flex items-center gap-1.5 px-4 py-2 bg-zinc-800 text-zinc-300 hover:text-zinc-200 hover:bg-zinc-800 border border-white/10 rounded-xl text-xs font-mono font-bold transition active:scale-95">
                    <Plus className="w-3.5 h-3.5" /> NEW ROLE
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { role: 'db_owner', users: 2, desc: 'Full administrative privileges including schema modifications.' },
                    { role: 'readonly_reporter', users: 14, desc: 'SELECT-only access for data analysts and BI tools.' },
                    { role: 'app_backend', users: 3, desc: 'Read/Write access for active microservice connections.' },
                  ].map((r, i) => (
                    <div key={i} className="bg-[#18181b] border border-white/10 rounded-xl p-4 flex flex-col justify-between hover:border-white/10 transition">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-bold font-mono text-zinc-200">{r.role}</span>
                          <span className="text-xs bg-slate-900 border border-white/10 px-2 py-0.5 rounded-lg text-amber-500 font-mono">{r.users} USERS</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed font-sans">{r.desc}</p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-white/10 flex justify-between">
                         <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">Active</span>
                         <button className="text-zinc-300 hover:text-zinc-200 text-[10px] font-mono font-bold">EDIT</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
