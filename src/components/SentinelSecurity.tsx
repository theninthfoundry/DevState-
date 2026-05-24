import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, ShieldCheck, Flame, RefreshCw, Key, AlertTriangle, 
  Trash2, Copy, FileCode, CheckCircle, Radio, Network, Lock, 
  MapPin, ShieldPlus, Server, Eye, EyeOff, Plus, FileText, Check,
  Sliders, UserCheck, AlertOctagon, HelpCircle, Activity, Heart, Search
} from 'lucide-react';

interface SentinelSecurityProps {
  onTriggerSound: (freq?: number) => void;
  onTriggerNotification: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

interface SecretItem {
  id: string;
  name: string;
  value: string;
  patternType: string;
  location: string;
  risk: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  status: 'active' | 'secured' | 'ignored';
}

interface VulnItem {
  id: string;
  pkg: string;
  installed: string;
  latest: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  cve: string;
  license: string;
  supplyRisk: string;
}

interface ApiRouteNode {
  id: string;
  route: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  authType: 'Public' | 'Auth' | 'Admin';
  rateLimit: string;
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
  x: number;
  y: number;
}

export default function SentinelSecurity({ onTriggerSound, onTriggerNotification }: SentinelSecurityProps) {
  // Posture Score State
  const [securityScore, setSecurityScore] = useState<number>(74);
  const [lastScanTime, setLastScanTime] = useState<string>('3 min ago');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'vault' | 'vulnerabilities' | 'endpoints' | 'auth' | 'firewall' | 'playbooks' | 'compliance'>('dashboard');

  // Search/Filter capability
  const [searchTerm, setSearchTerm] = useState('');

  // SECRETS STORAGE STATE
  const [secrets, setSecrets] = useState<SecretItem[]>([
    { id: 'sec-1', name: 'OpenAI API Key', value: 'sk-proj-4j17A...9zL1', patternType: 'OpenAI SDK Token', location: 'src/server/geminiService.ts:34', risk: 'CRITICAL', status: 'active' },
    { id: 'sec-2', name: 'AWS Credentials Hash', value: 'AKIAIOSFODNN7EXAMPLE', patternType: 'AWS IAM Secret', location: 'package.json:12', risk: 'HIGH', status: 'active' },
    { id: 'sec-3', name: 'Stripe webhook signing', value: 'whsec_83726f18f...2', patternType: 'Stripe Signature key', location: '.env:5', risk: 'MEDIUM', status: 'active' },
    { id: 'sec-4', name: 'Database Connect Secret', value: 'postgresql://postgres:root123@...', patternType: 'Database Secret String', location: 'server.ts:16', risk: 'CRITICAL', status: 'active' },
    { id: 'sec-5', name: 'GitHub OAuth Client ClientSecret', value: 'db791fbfae0c9ef...a1', patternType: 'GitHub Secret Entry', location: 'src/components/GoogleWorkspaceHub.tsx:112', risk: 'HIGH', status: 'active' }
  ]);

  // VULNERABILITY STATE
  const [dependencies, setDependencies] = useState<VulnItem[]>([
    { id: 'v-1', pkg: 'express', installed: '4.17.1', latest: '4.19.2', severity: 'HIGH', cve: 'CVE-2024-29025', license: 'MIT', supplyRisk: 'Low' },
    { id: 'v-2', pkg: 'jsonwebtoken', installed: '8.5.1', latest: '9.0.2', severity: 'CRITICAL', cve: 'CVE-2022-25883', license: 'MIT', supplyRisk: 'Medium (Few Maintainers)' },
    { id: 'v-3', pkg: 'axios', installed: '0.21.1', latest: '1.6.8', severity: 'HIGH', cve: 'CVE-2023-45857', license: 'MIT', supplyRisk: 'Low' },
    { id: 'v-4', pkg: 'lodash', installed: '4.17.20', latest: '4.17.21', severity: 'MEDIUM', cve: 'CVE-2021-23337', license: 'MIT', supplyRisk: 'Low' },
    { id: 'v-5', pkg: 'minimist', installed: '1.2.5', latest: '1.2.8', severity: 'LOW', cve: 'CVE-2021-3517', license: 'MIT', supplyRisk: 'Abandoned' }
  ]);

  // ENDPOINTS STATE
  const apiRoutes: ApiRouteNode[] = [
    { id: 'ep-1', route: '/api/auth/login', method: 'POST', authType: 'Public', rateLimit: '30 req/min', risk: 'LOW', x: 120, y: 100 },
    { id: 'ep-2', route: '/api/admin/purge', method: 'POST', authType: 'Admin', rateLimit: 'unlimited', risk: 'HIGH', x: 280, y: 70 },
    { id: 'ep-3', route: '/api/files/download', method: 'GET', authType: 'Auth', rateLimit: '60 req/min', risk: 'MEDIUM', x: 200, y: 180 },
    { id: 'ep-4', route: '/api/gemini/chat', method: 'POST', authType: 'Auth', rateLimit: '5 req/min', risk: 'MEDIUM', x: 380, y: 160 },
    { id: 'ep-5', route: '/api/metrics-pulse', method: 'GET', authType: 'Public', rateLimit: 'unlimited', risk: 'HIGH', x: 440, y: 220 }
  ];

  const [selectedRoute, setSelectedRoute] = useState<ApiRouteNode | null>(apiRoutes[1]);

  // AUTH STATE
  const [mfaCoverage, setMfaCoverage] = useState([
    { user: 'admin@devstate.os', role: 'Security Admin', mfa: true, lastLogin: '2 min ago' },
    { user: 'lead_dev@devstate.os', role: 'Engineering Lead', mfa: false, lastLogin: '1 hour ago' },
    { user: 'contractor@external.com', role: 'Contributor', mfa: false, lastLogin: '1 day ago' },
  ]);

  // FIREWALL/RATE LIMITS
  const [rateLimitRule, setRateLimitRule] = useState<number>(60);
  const [ipAllowList, setIpAllowList] = useState<string[]>([
    '127.0.0.1 (LocalHost)',
    '192.168.1.150 (Gateway Office)',
    '82.16.89.201 (Production Proxy)'
  ]);
  const [newIp, setNewIp] = useState('');

  // PLAYBOOK STEPS
  const [playbookSelection, setPlaybookSelection] = useState<'leak' | 'ddos' | 'auth'>('leak');
  const [playbookLog, setPlaybookLog] = useState<{ id: string, msg: string, time: string }[]>([
    { id: 'l-1', msg: 'Playbook active. Escalation protocol initiated.', time: '09:30:11' }
  ]);

  const runVulnerabilityScan = () => {
    setIsScanning(true);
    onTriggerSound(1.4);
    onTriggerNotification('Threat Scanner calibrating logical audit paths...', 'info');

    setTimeout(() => {
      setIsScanning(false);
      setSecurityScore(92);
      setLastScanTime('Just now');
      onTriggerSound(1.6);
      onTriggerNotification('Sentinel security posture recalculation completed! Score: A (92/100).', 'success');
    }, 2000);
  };

  const secureSecret = (id: string, name: string) => {
    onTriggerSound(1.15);
    setSecrets(prev => prev.map(s => s.id === id ? { ...s, status: 'secured' } : s));
    setSecurityScore(prev => Math.min(100, prev + 3));
    onTriggerNotification(`Secret [${name}] relocated into HashiCorp Vault container and appended to gitignore.`, 'success');
  };

  const ignoreSecret = (id: string, name: string) => {
    onTriggerSound(0.9);
    setSecrets(prev => prev.map(s => s.id === id ? { ...s, status: 'ignored' } : s));
    onTriggerNotification(`Discretionary bypass registered for security event on: ${name}`, 'info');
  };

  const executeUpgrade = (pkg: string, targetVersion: string) => {
    onTriggerSound(1.25);
    onTriggerNotification(`Vulnerability upgrade script dispatched: npm install ${pkg}@${targetVersion}`, 'success');
    setDependencies(prev => prev.filter(d => d.pkg !== pkg));
    setSecurityScore(prev => Math.min(100, prev + 2));
  };

  const addAllowedIp = () => {
    if (!newIp.trim()) return;
    onTriggerSound(1.05);
    setIpAllowList(prev => [...prev, newIp]);
    onTriggerNotification(`Network Firewall: Rule created to whitelist IP: ${newIp}`, 'success');
    setNewIp('');
  };

  const addPlaybookAction = (msg: string) => {
    onTriggerSound(1.1);
    const time = new Date().toTimeString().split(' ')[0];
    setPlaybookLog(prev => [{ id: Date.now().toString(), msg, time }, ...prev]);
    onTriggerNotification(`Sentinel Response playbook executed: "${msg}"`, 'info');
  };

  // Score Letter Grade calculation Map
  const getLetterGrade = (score: number) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  const scoreBreakdowns = {
    secrets: { val: 20, description: "No cleartext credentials in workspace environment files" },
    dependencies: { val: 18, description: "Minimal circular packages & secure CVE bounds" },
    endpoints: { val: 15, description: "Exposed API routers mapped with active token security" },
    auth: { val: 12, description: "Mandatory Multi-factor coverage & strong SSO validation" },
    config: { val: 19, description: "Production hardening standards and environment segregation" }
  };

  return (
    <div id="sentinel-security-noc" className="space-y-6 select-text text-slate-100">
      
      {/* SECTION HEADER BLOCK */}
      <div className="bg-[#09090b]/80 backdrop-blur-md border border-red-950/40 p-6 rounded-3xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/5 rounded-full filter blur-2xl pointer-events-none animate-pulse"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-rose-500 animate-ping shrink-0" />
            <span className="text-[10px] font-black uppercase tracking-widest text-rose-400 font-mono">
              TACTICAL NETWORK OPERATIONS CENTER
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white mt-1.5 flex items-center gap-2 font-sans">
            <ShieldAlert className="w-5 h-5 text-red-500 animate-pulse" />
            Sentinel Space Security Guard v4.5
          </h2>
          <p className="text-xs text-slate-450 mt-1 max-w-2xl leading-relaxed">
            Autonomous binary secret analyzers, deep supply-chain package inspection, interactive API router surface discovery, and live incident mitigation playbook responses.
          </p>
        </div>

        <div className="flex items-center gap-2 relative z-10 shrink-0">
          <button
            onClick={runVulnerabilityScan}
            disabled={isScanning}
            className="px-4.5 py-3 cursor-pointer bg-gradient-to-r from-red-650 to-orange-655 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white font-mono font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-950/20 active:scale-95 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning ? 'DIAGNOSING SYSTEM COV...' : 'TRIGGER DEEP WORKSPACE SANITIZE'}
          </button>
        </div>
      </div>

      {/* SEARCH AND NAVIGATION SUBBAR */}
      <div className="flex flex-wrap items-center justify-between bg-[#080a10]/85 border border-slate-900 px-4 py-2 rounded-2xl gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
          {[
            { id: 'dashboard', name: 'NOC HUD' },
            { id: 'vault', name: 'Secrets Hub' },
            { id: 'vulnerabilities', name: 'Dependencies' },
            { id: 'endpoints', name: 'APIs surface' },
            { id: 'auth', name: 'Access Audit' },
            { id: 'firewall', name: 'Network Shield' },
            { id: 'playbooks', name: 'Playbooks' },
            { id: 'compliance', name: 'Certifications' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { onTriggerSound(1.0); setActiveTab(tab.id as any); }}
              className={`px-3.5 py-2 text-[10.5px] font-mono font-bold rounded-xl whitespace-nowrap transition cursor-pointer border ${
                activeTab === tab.id 
                  ? 'bg-red-500/10 border-red-500/30 text-rose-400 font-extrabold' 
                  : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab.name.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Global Keyword Filter Input */}
        <div className="relative w-full md:w-56">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter view assets..."
            className="w-full bg-[#030509] border border-slate-850/60 rounded-xl pl-9 pr-4 py-1.5 text-xs font-mono text-slate-300 placeholder:text-slate-650 focus:outline-none focus:ring-1 focus:ring-red-500/40"
          />
        </div>
      </div>

      {/* TAB 1: EXECUTIVE POSTURE NOC HUD */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          
          <div className="lg:col-span-4 bg-[#090b11] border border-slate-850/60 p-6 rounded-3xl flex flex-col justify-between items-center text-center relative overflow-hidden min-h-[320px]">
            {/* Liquid Score representation */}
            <div className="absolute inset-x-0 bottom-0 bg-red-650/5 h-1/3 animate-pulse"></div>
            
            <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase font-bold">
              OVERALL SECURITY POSTURE GRADE
            </span>

            <div className="my-6 relative flex items-center justify-center">
              {/* Radial Score outline */}
              <div className="w-36 h-36 rounded-full border-4 border-dashed border-red-500/20 flex items-center justify-center animate-spin" style={{ animationDuration: '40s' }}></div>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-black font-sans leading-none text-red-500 tracking-tight">
                  {getLetterGrade(securityScore)}
                </span>
                <span className="text-xs font-mono text-slate-450 mt-1 font-bold">
                  Score: {securityScore}/100
                </span>
              </div>
            </div>

            <div className="w-full space-y-2 relative z-10">
              <div className="h-2 w-full bg-slate-950/70 border border-slate-900 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-red-600 to-amber-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${securityScore}%` }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                <span>SYSTEM HARDENING STATUS</span>
                <span className="text-red-400 font-bold">THREAT LEVEL CRITICAL</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 bg-[#090b11] border border-slate-850/60 p-6 rounded-3xl flex flex-col justify-between min-h-[320px]">
            <div>
              <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase font-bold">
                SCORE DISTRIBUTION MATRIX
              </span>
              <p className="text-xs text-slate-400 mt-1 mb-4">
                Quantitative weight breakdown assigned to each high-level code module interface in real-time.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(scoreBreakdowns).map(([key, item]) => (
                  <div key={key} className="bg-slate-950 border border-slate-900 p-3.5 rounded-2xl">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11.5px] font-bold text-white capitalize font-sans">{key}</span>
                      <span className="text-[11px] font-mono text-red-400 font-bold">{item.val * 5}%</span>
                    </div>
                    <p className="text-[9.5px] text-slate-550 leading-relaxed leading-normal">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-900 pt-4 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-slate-500 gap-2">
              <span>SCAN TELEMETRY CADENCE: <strong>AUTONOMOUS SECURE HOOKS ACTIVATE</strong></span>
              <span>LAST AUDITED SCAN TIME: <strong className="text-white">{lastScanTime}</strong></span>
            </div>
          </div>

          {/* ACTIVE CRITICAL PRIORITY THREAT QUEUE */}
          <div className="lg:col-span-12 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest font-mono flex items-center gap-2">
              <Flame className="w-4 h-4 text-red-400 animate-pulse" />
              PRIORITY EVENTS INTELLIGENCE QUEUE
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <motion.div 
                className="bg-red-950/10 border border-red-500/20 p-4 rounded-2.5xl relative overflow-hidden flex items-start gap-4"
                animate={{
                  borderColor: ["rgba(239, 68, 68, 0.2)", "rgba(239, 68, 68, 0.6)", "rgba(239, 68, 68, 0.2)"],
                  boxShadow: [
                    "0 0 0 0 rgba(239, 68, 68, 0)",
                    "0 0 14px 2px rgba(239, 68, 68, 0.15)",
                    "0 0 0 0 rgba(239, 68, 68, 0)"
                  ]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2.0,
                  ease: "easeInOut"
                }}
              >
                {/* Visual Radar Sensor Ring Pulse */}
                <div className="absolute top-2.5 right-2.5 flex items-center justify-center w-6 h-6">
                  <motion.div 
                    className="absolute w-2 h-2 rounded-full bg-red-500" 
                    animate={{ scale: [1, 1.25, 1] }} 
                    transition={{ repeat: Infinity, duration: 2.0, ease: "easeInOut" }}
                  />
                  <motion.div 
                    className="absolute w-4 h-4 rounded-full border border-red-500/50" 
                    initial={{ scale: 0.5, opacity: 1 }}
                    animate={{ scale: 2.5, opacity: 0 }} 
                    transition={{ repeat: Infinity, duration: 2.0, ease: "easeOut" }}
                  />
                </div>

                <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/30 text-red-400 shrink-0">
                  <Key className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h5 className="text-xs font-black text-red-400 font-mono uppercase tracking-wide">API Key leakage</h5>
                  <p className="text-[11.5px] text-slate-350 mt-1 leading-relaxed leading-snug">
                    OpenAI platform credential exposed in cleartext within <strong>src/server/geminiService.ts</strong> file.
                  </p>
                  <span className="text-[9.5px] font-mono text-slate-550 block mt-2">DANGER MATRIX: EXTREMEMENT CRITIQUE</span>
                </div>
              </motion.div>

              <motion.div 
                className="bg-amber-950/10 border border-amber-500/20 p-4 rounded-2.5xl relative overflow-hidden flex items-start gap-4"
                animate={{
                  borderColor: ["rgba(245, 158, 11, 0.2)", "rgba(245, 158, 11, 0.6)", "rgba(245, 158, 11, 0.2)"],
                  boxShadow: [
                    "0 0 0 0 rgba(245, 158, 11, 0)",
                    "0 0 14px 2px rgba(245, 158, 11, 0.15)",
                    "0 0 0 0 rgba(245, 158, 11, 0)"
                  ]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2.2,
                  ease: "easeInOut"
                }}
              >
                {/* Visual Radar Sensor Ring Pulse */}
                <div className="absolute top-2.5 right-2.5 flex items-center justify-center w-6 h-6">
                  <motion.div 
                    className="absolute w-2 h-2 rounded-full bg-amber-500" 
                    animate={{ scale: [1, 1.25, 1] }} 
                    transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                  />
                  <motion.div 
                    className="absolute w-4 h-4 rounded-full border border-amber-500/50" 
                    initial={{ scale: 0.5, opacity: 1 }}
                    animate={{ scale: 2.5, opacity: 0 }} 
                    transition={{ repeat: Infinity, duration: 2.2, ease: "easeOut" }}
                  />
                </div>

                <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/30 text-amber-500 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-xs font-black text-amber-500 font-mono uppercase tracking-wide">CVE vulnerability</h5>
                  <p className="text-[11.5px] text-slate-350 mt-1 leading-relaxed leading-snug">
                    Standard supply dependency token <strong>jsonwebtoken</strong> features critical heap execution flaws.
                  </p>
                  <span className="text-[9.5px] font-mono text-slate-550 block mt-2">DANGER MATRIX: SEC_HIGH</span>
                </div>
              </motion.div>

              <motion.div 
                className="bg-orange-950/10 border border-orange-500/20 p-4 rounded-2.5xl relative overflow-hidden flex items-start gap-4"
                animate={{
                  borderColor: ["rgba(249, 115, 22, 0.2)", "rgba(249, 115, 22, 0.6)", "rgba(249, 115, 22, 0.2)"],
                  boxShadow: [
                    "0 0 0 0 rgba(249, 115, 22, 0)",
                    "0 0 14px 2px rgba(249, 115, 22, 0.15)",
                    "0 0 0 0 rgba(249, 115, 22, 0)"
                  ]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2.4,
                  ease: "easeInOut"
                }}
              >
                {/* Visual Radar Sensor Ring Pulse */}
                <div className="absolute top-2.5 right-2.5 flex items-center justify-center w-6 h-6">
                  <motion.div 
                    className="absolute w-2 h-2 rounded-full bg-orange-500" 
                    animate={{ scale: [1, 1.25, 1] }} 
                    transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
                  />
                  <motion.div 
                    className="absolute w-4 h-4 rounded-full border border-orange-500/50" 
                    initial={{ scale: 0.5, opacity: 1 }}
                    animate={{ scale: 2.5, opacity: 0 }} 
                    transition={{ repeat: Infinity, duration: 2.4, ease: "easeOut" }}
                  />
                </div>

                <div className="p-3 bg-orange-500/10 rounded-2xl border border-orange-500/30 text-orange-400 shrink-0">
                  <Radio className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h5 className="text-xs font-black text-orange-400 font-mono uppercase tracking-wide">UNAUTHENTICATED GATEWAY</h5>
                  <p className="text-[11.5px] text-slate-350 mt-1 leading-relaxed leading-snug">
                    Admin route purge access <strong>/api/admin/purge</strong> is currently exposed with missing rate-limits.
                  </p>
                  <span className="text-[9.5px] font-mono text-slate-550 block mt-2">DANGER MATRIX: ADM_EXPOSURE_CRIT</span>
                </div>
              </motion.div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: SECRETS SCANNER & VAULT */}
      {activeTab === 'vault' && (
        <div className="space-y-4 animate-fade-in grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          <div className="lg:col-span-8 bg-[#090b11] border border-slate-850/60 p-5 rounded-3xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-red-500" />
                DANGER: SOURCE ACCIDENTAL CLEAR-VAL SECRETS
              </h3>
              <span className="text-[10px] font-mono text-zinc-300 font-bold bg-white/5 border border-white/5 px-2 py-0.5 rounded-lg">
                SCAN CONSECUTIVE: ACTIVE
              </span>
            </div>

            <div className="space-y-3">
              {secrets
                .filter(s => {
                  if (s.status === 'secured') return false;
                  if (!searchTerm) return true;
                  return s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         s.patternType.toLowerCase().includes(searchTerm.toLowerCase());
                })
                .map(item => (
                  <div key={item.id} className="p-4 bg-slate-950/60 border border-slate-900 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl mt-0.5">
                        <Key className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-200 text-xs">{item.name}</span>
                          <span className={`text-[8px] font-black tracking-widest px-1.5 py-0.5 rounded border uppercase ${
                            item.risk === 'CRITICAL' ? 'text-red-400 border-red-500/20 bg-red-500/5' : 'text-amber-500 border-amber-500/20 bg-amber-500/5'
                          }`}>
                            {item.risk} RISK
                          </span>
                        </div>
                        <p className="text-[10.5px] text-slate-500 font-mono mt-1">
                          Pattern: {item.patternType} | File location: <span className="text-red-400/80 font-bold">{item.location}</span>
                        </p>
                        <div className="mt-2 text-xs font-mono bg-[#030509] p-2 rounded-lg border border-slate-900 text-slate-400 overflow-x-auto">
                          {item.value}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 md:self-end">
                      <button
                        onClick={() => secureSecret(item.id, item.name)}
                        className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/25 border border-red-550/30 hover:border-red-500 text-red-400 font-mono font-bold text-[10px] rounded-lg cursor-pointer transition"
                      >
                        VAULT KEY
                      </button>
                      <button
                        onClick={() => ignoreSecret(item.id, item.name)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-500 hover:text-slate-300 font-mono font-bold text-[10px] rounded-lg cursor-pointer transition"
                      >
                        IGNORE
                      </button>
                    </div>
                  </div>
                ))}

              {secrets.filter(s => s.status === 'active').length === 0 && (
                <div className="text-center py-8 text-slate-550 space-y-2">
                  <ShieldCheck className="w-12 h-12 text-zinc-400 mx-auto stroke-1" />
                  <p className="text-[11.5px] font-mono text-slate-500 max-w-sm mx-auto">
                    No active accidentally committed secret hashes detected inside code variables or local configurations!
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-4 bg-slate-950 border border-slate-900 p-5 rounded-3xl space-y-4">
            <h4 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider">
              VAULT PROVIDERS SYNC STATUS
            </h4>
            
            <div className="space-y-2.5">
              {[
                { name: '1Password Connect server', status: 'NOT_CONNECTED', action: 'DEPLOY TETHER' },
                { name: 'Doppler environment map', status: 'ACTIVE', action: 'REBUILD' },
                { name: 'AWS Secrets API', status: 'STABLE_ONLINE', action: 'DE-AUTHORIZE' },
                { name: 'HashiCorp Vault sandbox', status: 'NOT_CONNECTED', action: 'DEPLOY TETHER' }
              ].map((provider) => (
                <div key={provider.name} className="p-3 bg-[#080b0f] border border-slate-900 rounded-2xl flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="block font-bold text-slate-300">{provider.name}</span>
                    <span className={`text-[9px] font-bold ${provider.status === 'ACTIVE' || provider.status === 'STABLE_ONLINE' ? 'text-[#e4e4e7]' : 'text-slate-500'}`}>
                      {provider.status}
                    </span>
                  </div>
                  <button 
                    onClick={() => { onTriggerSound(1.1); onTriggerNotification(`Vaulting tethering configured for: ${provider.name}`, 'success'); }}
                    className="text-[9px] font-bold text-slate-400 bg-slate-900 px-2 py-1 rounded hover:text-white border border-slate-850/60 transition"
                  >
                    {provider.action}
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: DEPENDENCY VULNERABILITY TRACKER */}
      {activeTab === 'vulnerabilities' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          
          <div className="lg:col-span-8 bg-[#090b11] border border-slate-850/60 p-5 rounded-3xl space-y-4">
            <div className="flex items-center justify-between pb-2.5 border-b border-white/5">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-amber-500" />
                ESTIMATED VULNERABLE ARTIFACT BOUNDS
              </h3>
              <span className="text-[10px] font-mono text-amber-500 font-bold bg-amber-950/20 border border-amber-900/30 px-2 py-0.5 rounded-lg">
                AUDITED COMPLIANCE MATRIX MATCH
              </span>
            </div>

            <div className="space-y-3">
              {dependencies
                .filter(d => {
                  if (!searchTerm) return true;
                  return d.pkg.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         d.cve.toLowerCase().includes(searchTerm.toLowerCase());
                })
                .map((vuln) => (
                  <div key={vuln.id} className="p-4 bg-slate-950/70 border border-slate-900 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-amber-500/5 border border-amber-500/20 text-amber-500 rounded-xl mt-0.5">
                        <AlertOctagon className="w-4 h-4 animate-pulse" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-slate-200 text-xs font-mono">{vuln.pkg}</strong>
                          <span className={`text-[8.5px] font-bold font-mono px-1.5 py-0.5 rounded border uppercase ${
                            vuln.severity === 'CRITICAL' ? 'text-red-400 border-red-500/20 bg-red-500/5' : vuln.severity === 'HIGH' ? 'text-amber-500 border-amber-500/20 bg-amber-500/5' : 'text-zinc-300 border-white/10 bg-zinc-800'
                          }`}>
                            {vuln.severity} SEVERITY
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-mono mt-1">
                          Ref: <span className="text-zinc-300 font-black">{vuln.cve}</span> | Installed: <span className="text-rose-400">{vuln.installed}</span> → Available: <span className="text-zinc-300 font-bold">{vuln.latest}</span>
                        </p>
                        <p className="text-[10px] text-slate-450 mt-1">
                          License check: <span className="text-slate-350">{vuln.license}</span> | Supply Risk score: <span className="text-slate-350">{vuln.supplyRisk}</span>
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => executeUpgrade(vuln.pkg, vuln.latest)}
                      className="px-3.5 py-2 shrink-0 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-500 font-mono font-bold text-[10px] rounded-lg cursor-pointer transition text-center"
                    >
                      PATCH UPDATE
                    </button>
                  </div>
                ))}
            </div>
          </div>

          <div className="lg:col-span-4 bg-slate-950 border border-slate-900 p-5 rounded-3xl space-y-4">
            <h4 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider">
              LICENSE COMPLIANCE FLAGS
            </h4>

            <div className="space-y-2">
              {[
                { name: 'MIT Permissive Licensing', status: 'COMPLIANT', count: 124 },
                { name: 'Apache 2.0 Licensing', status: 'COMPLIANT', count: 48 },
                { name: 'GPL 3.0 Reciprocal License', status: 'HAZARD_FLAG_COPYLEFT', count: 3 },
                { name: 'Unidentified/Proprietary', status: 'UNKNOWN', count: 1 }
              ].map((license, idx) => (
                <div key={idx} className="p-3 bg-[#080a0e] border border-slate-900 rounded-2xl flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="block font-bold text-slate-200">{license.name}</span>
                    <span className="text-[10px] text-slate-500">{license.count} dependencies referenced</span>
                  </div>
                  <span className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded uppercase border ${
                    license.status === 'COMPLIANT' ? 'text-violet-450 border-white/5 bg-white/5' : 'text-amber-500 border-amber-900/30 bg-amber-950/20'
                  }`}>
                    {license.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 4: ENDPOINT EXPOSURE MAP */}
      {activeTab === 'endpoints' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in relative">
          
          <div className="lg:col-span-8 bg-[#090b11]/90 border border-slate-850/60 rounded-3xl p-5 min-h-[380px] relative overflow-hidden flex flex-col justify-between">
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.035]"></div>
            
            {/* RADAR SWEEP ANIMATION RING */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full border border-red-500/15 pointer-events-none flex items-center justify-center">
              <div className="w-56 h-56 rounded-full border border-red-500/10 flex items-center justify-center">
                <div className="w-28 h-28 rounded-full border border-red-505/5"></div>
              </div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-red-500/[0.03] to-transparent animate-spin" style={{ animationDuration: '6s' }}></div>
            </div>

            <div className="relative z-10">
              <span className="text-[10px] font-mono tracking-widest text-[#ef4444] uppercase block font-black">
                ACTIVE APPLICATION API ROUTER TAXONOMY
              </span>
              <p className="text-xs text-slate-450 max-w-lg mt-1 mb-8">
                Autonomous AST mapping discovers and classifies URL patterns into specific access authentication profiles. Click nodes below to audit lines.
              </p>
            </div>

            {/* INTERACTIVE NODES CANVAS */}
            <div className="h-64 relative border border-slate-900/60 bg-slate-950/40 rounded-2.5xl flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full text-slate-800">
                <line x1="120" y1="100" x2="280" y2="70" stroke="#ef4444" strokeWidth="1" strokeDasharray="3,3" />
                <line x1="280" y1="70" x2="200" y2="180" stroke="#ef4444" strokeWidth="1" strokeDasharray="3,3" />
                <line x1="200" y1="180" x2="380" y2="160" stroke="#ef4444" strokeWidth="1" strokeDasharray="3,3" />
                <line x1="380" y1="160" x2="440" y2="220" stroke="#ef4444" strokeWidth="1" />
              </svg>

              {apiRoutes.map((route) => {
                const isSelected = selectedRoute?.id === route.id;
                return (
                  <button
                    key={route.id}
                    onClick={() => { onTriggerSound(1.1); setSelectedRoute(route); }}
                    className="absolute p-2.5 rounded-xl border font-mono text-[10.5px] font-black uppercase transition-all duration-150 z-20 cursor-pointer flex items-center gap-1.5 bg-[#000]"
                    style={{ 
                      left: route.x, 
                      top: route.y,
                      transform: 'translate(-50%, -50%)',
                      borderColor: isSelected ? '#ef4444' : route.risk === 'HIGH' ? '#f59e0b' : '#334155',
                      color: isSelected ? '#fff' : route.risk === 'HIGH' ? '#f59e0b' : '#94a3b8'
                    }}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${route.risk === 'HIGH' ? 'bg-red-500 animate-pulse' : 'bg-[#e4e4e7]'}`}></span>
                    {route.method} {route.route}
                  </button>
                );
              })}
            </div>

            <div className="relative z-10 mt-4 text-[10.5px] font-mono text-slate-500 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-ping shrink-0" />
              SYSTEM TELEMETRY REPORT: ROUTE INTERCEPT DAEMON IS SECURED
            </div>
          </div>

          <div className="lg:col-span-4 bg-slate-950 border border-slate-900 p-5 rounded-3xl min-h-[380px] flex flex-col justify-between">
            {selectedRoute ? (
              <div className="space-y-4">
                <div className="pb-2.5 border-b border-white/5">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block font-bold">ROUTE SPECS</span>
                  <strong className="text-slate-200 text-sm font-mono block break-all mt-1">{selectedRoute.route}</strong>
                </div>

                <div className="space-y-3 font-mono text-xs text-slate-400">
                  <div className="flex justify-between border-b border-slate-900 pb-1.5">
                    <span className="text-slate-500 font-bold">METHOD</span>
                    <span className="text-white font-extrabold">{selectedRoute.method}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-900 pb-1.5">
                    <span className="text-slate-500 font-bold">AUTH REQUIREMENT</span>
                    <span className={`font-extrabold ${selectedRoute.authType === 'Admin' ? 'text-red-400 animate-pulse' : 'text-slate-200'}`}>
                      {selectedRoute.authType}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-900 pb-1.5">
                    <span className="text-slate-500 font-bold">RATE LIMIT STATE</span>
                    <span className="text-[#e4e4e7] font-bold">{selectedRoute.rateLimit}</span>
                  </div>
                  <div className="flex justify-between pb-1.5">
                    <span className="text-slate-500 font-bold">HAZARD COEFFICIENT</span>
                    <span className={`font-black ${selectedRoute.risk === 'HIGH' ? 'text-red-400' : 'text-[#e4e4e7]'}`}>
                      {selectedRoute.risk} RISK
                    </span>
                  </div>
                </div>

                {selectedRoute.risk === 'HIGH' && (
                  <div className="p-3 bg-red-500/5 border border-red-500/15 rounded-xl">
                    <span className="text-[9px] font-mono font-bold text-red-400 block mb-1">AUDIT ALARM CODE-SMELL</span>
                    <p className="text-[10.5px] font-sans text-slate-450 leading-normal">
                      This endpoint features missing global rate limits or lacks strong MFA session validation. Secure middleware config is strongly suggested.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-20 text-slate-600 font-mono text-xs">
                Select an active mapped node route path to visualize specifications and mitigation vectors.
              </div>
            )}

            <button
              onClick={() => { onTriggerSound(1.25); onTriggerNotification(`Codebase route analysis refreshed! All APIs locked.`, 'success'); }}
              className="w-full mt-6 py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-mono font-bold uppercase transition"
            >
              TRIGGER AST RE-CRAWL
            </button>
          </div>

        </div>
      )}

      {/* TAB 5: AUTHENTICATION AUDIT */}
      {activeTab === 'auth' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          
          <div className="lg:col-span-8 bg-[#090b11] border border-slate-850/60 p-5 rounded-3xl space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono pb-2 border-b border-white/5">
              AUTONOMOUS ACCOUNT MFA & MFA COVERAGE INTEGRITY
            </h3>

            <div className="space-y-3">
              {mfaCoverage.map((item, idx) => (
                <div key={idx} className="p-4 bg-slate-950/60 border border-slate-900 rounded-2xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl border ${
                      item.mfa ? 'bg-zinc-800 border-white/10 text-zinc-300' : 'bg-red-500/5 border-red-500/25 text-red-500 animate-pulse'
                    }`}>
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-slate-205 text-xs text-white block">{item.user}</strong>
                      <span className="text-[10px] text-slate-450 font-mono font-medium block mt-0.5">{item.role}</span>
                    </div>
                  </div>

                  <span className={`text-[8.5px] font-mono font-bold px-2 py-1 rounded border uppercase ${
                    item.mfa ? 'text-zinc-300 border-white/10 bg-zinc-800' : 'text-red-400 border-red-500/25 bg-red-500/5 animate-pulse'
                  }`}>
                    {item.mfa ? 'MFA ACTIVE' : 'MFA MISSING'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 bg-slate-950 border border-slate-900 p-5 rounded-3xl space-y-4">
            <h4 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider">
              ESTIMATED TOKEN EXPIRY REMINDERS
            </h4>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-3 bg-[#080b0f] border border-slate-900 rounded-xl flex justify-between items-center text-slate-400">
                <span>jwt_auth_cookie</span>
                <span className="text-[#e4e4e7] font-bold">18 min remaining</span>
              </div>
              <div className="p-3 bg-[#080b0f] border border-slate-900 rounded-xl flex justify-between items-center text-slate-400">
                <span>github_oauth_token</span>
                <span className="text-red-400 font-bold">Expired</span>
              </div>
              <div className="p-3 bg-[#080b0f] border border-slate-900 rounded-xl flex justify-between items-center text-slate-400">
                <span>stripe_signature_hash</span>
                <span className="text-slate-450">7 days left</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 6: FIREWALL & RATE LIMITS */}
      {activeTab === 'firewall' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          
          <div className="lg:col-span-8 bg-[#090b11] border border-slate-850/60 p-5 rounded-3xl space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono pb-2 border-b border-white/5">
              FIREWALL whitelist IP CONTROL LIST
            </h3>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ex: 198.51.100.42"
                value={newIp}
                onChange={e => setNewIp(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-900 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-red-500/40"
              />
              <button
                onClick={addAllowedIp}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs rounded-xl transition cursor-pointer"
              >
                ADD IP RULE
              </button>
            </div>

            <div className="space-y-2 mt-4">
              {ipAllowList.map((ip, index) => (
                <div key={index} className="p-3 bg-slate-950 border border-slate-900 rounded-xl flex justify-between items-center text-xs font-mono text-slate-320 text-slate-300">
                  <span>{ip}</span>
                  <button 
                    onClick={() => { setIpAllowList(prev => prev.filter((_, i) => i !== index)); onTriggerSound(0.9); }}
                    className="text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 bg-slate-950 border border-slate-900 p-5 rounded-3xl space-y-4">
            <h4 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider">
              DYNAMIC RATE LIMITS
            </h4>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-mono text-slate-450 mb-1">
                  <span>MAX BURST CONCURRENT</span>
                  <strong className="text-white">{rateLimitRule} req/min</strong>
                </div>
                <input
                  type="range"
                  min="10"
                  max="300"
                  value={rateLimitRule}
                  onChange={e => setRateLimitRule(Number(e.target.value))}
                  className="w-full accent-red-500 cursor-pointer"
                />
              </div>

              <div className="p-3 bg-[#080b0f] border border-slate-900 rounded-2xl space-y-1">
                <span className="text-[10px] font-mono text-slate-500 block font-bold">DDOS GUARD CAPACITY</span>
                <span className="text-[#e4e4e7] font-black text-xs block font-mono">AUTOMATED ADVANCED PROTECTION ACTIVE</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 7: INCIDENT RESOLVE PLAYBOOKS */}
      {activeTab === 'playbooks' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          
          <div className="lg:col-span-4 bg-slate-950 border border-slate-900 rounded-3xl p-5 space-y-3">
            <span className="text-[9.5px] font-mono uppercase text-slate-500 font-bold block">MITIGATION MANUALS</span>
            
            {[
              { id: 'leak', name: 'CREDENTIAL LEAK DISCOVERY' },
              { id: 'ddos', name: 'DISTRIBUTED DDOS ATTACK RESPONSE' },
              { id: 'auth', name: 'BROKEN SESSION BREACH RESPONSE' }
            ].map(pb => (
              <button
                key={pb.id}
                onClick={() => { onTriggerSound(1.05); setPlaybookSelection(pb.id as any); }}
                className={`w-full text-left p-3.5 rounded-2xl border transition font-mono font-bold text-xs ${
                  playbookSelection === pb.id 
                    ? 'bg-red-500/10 border-red-500/30 text-rose-400' 
                    : 'bg-[#090b11]/85 border-slate-900 text-slate-400 hover:text-slate-205'
                }`}
              >
                {pb.name}
              </button>
            ))}
          </div>

          <div className="lg:col-span-8 bg-[#090b11] border border-slate-850/60 rounded-3xl p-6 flex flex-col justify-between min-h-[380px]">
            <div className="space-y-4">
              <h4 className="text-xs font-black font-mono uppercase text-white pb-2 border-b border-white/5">
                ACTIVE CHECKLIST STEPS & TRIGGERS
              </h4>

              {playbookSelection === 'leak' ? (
                <div className="space-y-2 text-xs">
                  {[
                    { text: 'Instantly revoke OAuth key & tokens across cloud projects', action: 'REVOKE TOKENS' },
                    { text: 'Commit .gitignore modifications with the absolute node secret references', action: 'LOCK PARAMS' },
                    { text: 'Deploy environment hash updates to render clusters', action: 'SYNC PARAMS' }
                  ].map((step, idx) => (
                    <div key={idx} className="p-3 bg-slate-950/60 border border-slate-900 rounded-xl flex justify-between items-center gap-4 text-slate-300 font-mono">
                      <span>{step.text}</span>
                      <button 
                        onClick={() => addPlaybookAction(`Executed: ${step.action}`)}
                        className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white font-bold text-[9px] uppercase tracking-wider rounded transition"
                      >
                        {step.action}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-slate-550 font-mono text-xs select-none">
                  Manual bypass triggered. Standard procedures locked under security authorization codes. Use buttons actions to record.
                </div>
              )}
            </div>

            {/* Incident Log timeline */}
            <div className="border-t border-slate-900 mt-6 pt-4 space-y-2">
              <span className="text-[10px] font-mono text-slate-550 block font-bold">INCIDENT TIMELINE PROGRESS COV</span>
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {playbookLog.map(log => (
                  <div key={log.id} className="text-[10px] font-mono text-slate-450">
                    <span className="text-red-400">[{log.time}]</span> <span className="text-slate-350">{log.msg}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 8: GLOBAL COMPLIANCE STATUS */}
      {activeTab === 'compliance' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {[
            { title: 'OWASP Top 10 Standards', status: 'COMPLIANT', value: '10/10 mapped modules checked' },
            { title: 'GDPR Data Compliance', status: 'NEEDS_REVIEW', value: 'Right to delete endpoint lacks SSL' },
            { title: 'SOC 2 Readiness Index', status: '94% COMPLIANT', value: 'Requires session log archiving activation' },
            { title: 'PCI DSS Cryptographic Level', status: 'STABLE', value: 'AES-256 keys declared inside Vault container' }
          ].map((item, idx) => (
            <div key={idx} className="bg-slate-950 border border-slate-900 p-5 rounded-3xl space-y-3">
              <span className="text-[10px] font-mono text-slate-500 block uppercase font-bold">CERTIFICATE CATEGORY</span>
              <h5 className="text-xs font-bold text-slate-200 mt-0.5 font-sans block">{item.title}</h5>
              <div className="flex items-center justify-between text-xs font-mono pt-3 border-t border-slate-900">
                <span className="text-slate-450">{item.value}</span>
                <span className="text-[#e4e4e7] font-extrabold">{item.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
