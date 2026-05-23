import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, Unlock, Key, RefreshCw, Copy, Check, FileCode, Sliders, ShieldCheck, 
  Eye, EyeOff, Plus, Trash2, ShieldAlert, Share2, Activity, Database, Cloud, 
  UserCheck, Terminal, HelpCircle, FileText, Download, Upload, CheckCircle, Search
} from 'lucide-react';

interface VaultEnvironmentProps {
  onTriggerSound: (freq?: number) => void;
  onTriggerNotification: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

interface VaultSecret {
  id: string;
  name: string;
  value: string;
  environment: 'development' | 'staging' | 'production';
  category: 'API Key' | 'DB Url' | 'SSH Key' | 'Certificate';
  lastUsed: string;
  expiryDays: number;
}

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  secret: string;
}

export default function VaultEnvironment({ onTriggerSound, onTriggerNotification }: VaultEnvironmentProps) {
  const [activeTab, setActiveTab] = useState<'secrets' | 'matrix' | 'access' | 'rotation' | 'hub' | 'health' | 'share'>('secrets');
  
  // Vault Initial Unlock state
  const [isVaultClosed, setIsVaultClosed] = useState(true);
  const [decryptingSecretId, setDecryptingSecretId] = useState<string | null>(null);
  const [revealedSecrets, setRevealedSecrets] = useState<Record<string, boolean>>({});
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // SECRETS STATE
  const [secretsList, setSecretsList] = useState<VaultSecret[]>([
    { id: 'vsec-1', name: 'DATABASE_URL', value: 'postgresql://master_sreesh_db:strong_p0ssword@db.host.os:5432/main', environment: 'production', category: 'DB Url', lastUsed: '5 min ago', expiryDays: 14 },
    { id: 'vsec-2', name: 'GEMINI_API_KEY', value: 'AIzaSyCh481_v79F12_ex9L30N', environment: 'production', category: 'API Key', lastUsed: '1 hour ago', expiryDays: 90 },
    { id: 'vsec-3', name: 'STRIPE_SECRET_KEY', value: 'sk_live_51Nv982Gf17Hsa91P3j7', environment: 'production', category: 'API Key', lastUsed: '3 hours ago', expiryDays: 6 },
    { id: 'vsec-4', name: 'SSH_DEPLOYER_PRIVATE_KEY', value: '-----BEGIN OPENSSH PRIVATE KEY-----\nb3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAA...', environment: 'staging', category: 'SSH Key', lastUsed: '1 day ago', expiryDays: 240 },
    { id: 'vsec-5', name: 'LOCAL_LOG_SALT', value: 'b817faee0cb29...', environment: 'development', category: 'Certificate', lastUsed: 'Just now', expiryDays: 360 }
  ]);

  // ENVIRONMENT MATRIX VARIABLE VALUES
  const [matrixEnv, setMatrixEnv] = useState<'development' | 'staging' | 'production'>('production');

  // AUDIT LOG
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    { id: 'aud-1', timestamp: '09:30:15', user: 'namireddysreeshanth@gmail.com', action: 'REVEAL_SECRET_VALUE', secret: 'GEMINI_API_KEY' },
    { id: 'aud-2', timestamp: '09:28:42', user: 'namireddysreeshanth@gmail.com', action: 'ROTATE_KEY_ROTATION', secret: 'STRIPE_SECRET_KEY' },
    { id: 'aud-3', timestamp: '09:15:10', user: 'system_daemon_watch', action: 'REQUIRED_VARS_VERIFILED', secret: 'ALL' }
  ]);

  // COPY ANIMATION TEMP STATE
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // ROTATION SCRIPT PREHOOK
  const [prehookCommand, setPrehookCommand] = useState('npm run security-check');

  // TEMPORARY ZERO KNOWLEDGE TIME LINK EXPIRE
  const [temporaryLink, setTemporaryLink] = useState('');
  const [tempSecretInput, setTempSecretInput] = useState('');
  const [tempViews, setTempViews] = useState(0);

  const toggleRevealSecretCode = (id: string, name: string) => {
    onTriggerSound(1.2);
    setRevealedSecrets(prev => {
      const updated = { ...prev, [id]: !prev[id] };
      // Log event
      const logAction = updated[id] ? 'REVEAL_SECRET_VALUE' : 'RE-CIPHER_REDACT_VALUE';
      const time = new Date().toTimeString().split(' ')[0];
      setAuditLogs(logs => [
        { id: Date.now().toString(), timestamp: time, user: 'namireddysreeshanth@gmail.com', action: logAction, secret: name },
        ...logs
      ]);
      return updated;
    });
  };

  const copyToClipboardSimulated = (id: string, text: string, name: string) => {
    onTriggerSound(1.4);
    setCopiedId(id);
    navigator.clipboard?.writeText(text);
    onTriggerNotification(`Secured credentials copied to clipboard: ${name}`, 'success');
    
    const time = new Date().toTimeString().split(' ')[0];
    setAuditLogs(logs => [
      { id: Date.now().toString(), timestamp: time, user: 'namireddysreeshanth@gmail.com', action: 'COPY_VALUE_CLIPBOARD', secret: name },
      ...logs
    ]);

    setTimeout(() => setCopiedId(null), 1500);
  };

  const forceRotateKey = (id: string, name: string) => {
    onTriggerSound(1.6);
    setSecretsList(prev => prev.map(s => {
      if (s.id === id) {
        return {
          ...s,
          value: s.value.substring(0, 8) + '...ROTATED_' + Math.random().toString(36).substring(2, 7).toUpperCase(),
          expiryDays: 90
        };
      }
      return s;
    }));

    onTriggerNotification(`Credentials updated and cycled for secret ${name}. Pre-hooks dispatched successfully.`, 'success');

    const time = new Date().toTimeString().split(' ')[0];
    setAuditLogs(logs => [
      { id: Date.now().toString(), timestamp: time, user: 'namireddysreeshanth@gmail.com', action: 'ROTATE_KEY_ROTATION', secret: name },
      ...logs
    ]);
  };

  const createTemporalOneTimeLink = () => {
    if (!tempSecretInput.trim()) return;
    onTriggerSound(1.15);
    const token = Math.sin(Date.now()).toString(36).substring(3, 12);
    setTemporaryLink(`https://ais-pre-7vmrqrz...run.app/secrets/share?auth_token=${token}`);
    setTempViews(1);
    onTriggerNotification('Zero-knowledge disposable password payload encrypted.', 'success');
  };

  return (
    <div id="vault-fort-knox-module" className="space-y-6 text-slate-100 select-text">
      
      {/* INITIAL MECHANICAL BANK VAULT OPENING SYSTEM COV */}
      <AnimatePresence>
        {isVaultClosed && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.65, ease: "easeInOut" }}
            className="fixed inset-0 z-50 bg-[#06080d]/98 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center select-none"
          >
            <div className="max-w-md space-y-6">
              {/* Vault Wheel graphic */}
              <div className="relative flex items-center justify-center">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
                  className="w-48 h-48 rounded-full border-8 border-dashed border-sky-500/25 flex items-center justify-center"
                />
                <div className="absolute w-36 h-36 rounded-full bg-[#0d1326] border-4 border-slate-755 border-slate-800 flex items-center justify-center shadow-2xl">
                  <Lock className="w-16 h-16 text-sky-400 animate-pulse" />
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono tracking-widest text-sky-400 font-extrabold uppercase block">
                  FORT_KNOX SECURE_LEVEL_5 INTEL
                </span>
                <h3 className="text-xl font-bold tracking-tight text-white mt-1">
                  Authenticate Cipher Vault
                </h3>
                <p className="text-xs text-slate-450 mt-2 max-w-sm leading-relaxed mx-auto">
                  Local DevState credentials matrix is currently encrypted with sandbox AES-256 keys. Unlock to review secure configurations.
                </p>
              </div>

              <button
                onClick={() => { onTriggerSound(1.6); setIsVaultClosed(false); onTriggerNotification("CIPHER VAULT DECRYPTED SECURELY", "success"); }}
                className="px-6 py-3 bg-gradient-to-r from-sky-600 to-indigo-650 bg-gradient-to-r from-sky-700 to-indigo-700 hover:from-sky-600 hover:to-indigo-600 text-white font-mono font-black text-xs uppercase tracking-wide rounded-xl shadow-lg shadow-sky-955/20 active:scale-95 transition cursor-pointer"
              >
                UNLOCK PRIVATE SECRETS
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* REGULAR VAULT SECURE HEADBOARD */}
      <div className="bg-[#0b0d14]/80 backdrop-blur-md border border-sky-950/40 p-6 rounded-3xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/5 rounded-full filter blur-2xl pointer-events-none animate-pulse"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <Unlock className="w-4 h-4 text-sky-400 shrink-0" />
            <span className="text-[10px] font-black uppercase tracking-widest text-sky-400 font-mono">
              CIPHER ENCRYPTED ENVIRONMENT VAULT
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white mt-1.5 flex items-center gap-2 font-sans">
            <Database className="w-5 h-5 text-sky-455" />
            Fort Knox Secrets Matrix
          </h2>
          <p className="text-xs text-slate-450 mt-1 max-w-2xl leading-relaxed">
            Manage your variables, synchronize with Vercel/Railway containers, rotate signature signing secrets automatically, and dispatch time-limited links.
          </p>
        </div>

        <div className="flex items-center gap-2 relative z-10 shrink-0">
          <button
            onClick={() => { onTriggerSound(1.3); setIsVaultClosed(true); }}
            className="px-4.5 py-3 cursor-pointer bg-slate-900 hover:bg-slate-850 hover:text-white border border-slate-800 text-slate-300 font-mono font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition active:scale-95"
          >
            <Lock className="w-3.5 h-3.5" />
            CYPHER LOCK NOW
          </button>
        </div>
      </div>

      {/* SEARCH AND INTERNAL NAVIGATION SUBBAR */}
      <div className="flex flex-wrap items-center justify-between bg-[#080a10]/85 border border-slate-900 px-4 py-2 rounded-2xl gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
          {[
            { id: 'secrets', name: 'Secrets registry' },
            { id: 'matrix', name: 'Env Matrix' },
            { id: 'access', name: 'Audit trails' },
            { id: 'rotation', name: 'Rotation scripts' },
            { id: 'hub', name: 'Sync Integration' },
            { id: 'health', name: 'Vault health' },
            { id: 'share', name: 'Z-K Shared links' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { onTriggerSound(1.0); setActiveTab(tab.id as any); }}
              className={`px-3.5 py-2 text-[10.5px] font-mono font-bold rounded-xl whitespace-nowrap transition cursor-pointer border ${
                activeTab === tab.id 
                  ? 'bg-sky-500/10 border-sky-500/30 text-sky-400 font-extrabold' 
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
            placeholder="Filter vault variables..."
            className="w-full bg-[#030509] border border-slate-850/60 rounded-xl pl-9 pr-4 py-1.5 text-xs font-mono text-slate-300 placeholder:text-slate-650 focus:outline-none focus:ring-1 focus:ring-sky-500/40"
          />
        </div>
      </div>

      {/* TAB 1: SECRETS REGISTRY */}
      {activeTab === 'secrets' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          
          <div className="lg:col-span-8 bg-[#090b11] border border-slate-850/60 p-5 rounded-3xl space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono pb-2 border-b border-white/5 flex items-center justify-between">
              <span>SECURED VARIABLES LOG</span>
              <span className="text-[10px] text-sky-450 font-mono">STATUS: HIGH_INTEGRITY</span>
            </h3>

            <div className="space-y-3">
              {secretsList
                .filter(s => {
                  if (!searchTerm) return true;
                  return s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         s.category.toLowerCase().includes(searchTerm.toLowerCase());
                })
                .map((secret) => {
                  const isRevealed = !!revealedSecrets[secret.id];
                  return (
                    <div key={secret.id} className="p-4 bg-slate-950/70 border border-slate-900 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 bg-sky-500/5 border border-sky-500/20 text-sky-400 rounded-xl mt-0.5">
                          <Key className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-sans font-bold text-slate-200 text-xs">{secret.name}</span>
                            <span className="text-[9px] font-mono bg-sky-950 text-sky-400 border border-sky-900/30 px-1.5 py-0.5 rounded uppercase">
                              {secret.environment}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-550 font-mono mt-1">
                            Type: {secret.category} | Last accessed: {secret.lastUsed}
                          </p>
                          <div className="mt-2 text-xs font-mono bg-[#030509] p-2.5 rounded-xl border border-slate-900 flex items-center justify-between max-w-md">
                            <span className="truncate max-w-[280px]">
                              {isRevealed ? secret.value : '••••••••••••••••••••••••••••••••••••'}
                            </span>
                            
                            <div className="flex items-center gap-1.5">
                              <button 
                                onClick={() => toggleRevealSecretCode(secret.id, secret.name)}
                                className="text-slate-500 hover:text-white"
                              >
                                {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                              <button 
                                onClick={() => copyToClipboardSimulated(secret.id, secret.value, secret.name)}
                                className="text-slate-500 hover:text-white"
                              >
                                {copiedId === secret.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 md:self-end">
                        <button
                          onClick={() => forceRotateKey(secret.id, secret.name)}
                          className="px-3 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-400 font-mono text-[10px] font-bold rounded-lg cursor-pointer transition"
                        >
                          Manual Cycle
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="lg:col-span-4 bg-slate-950 border border-slate-900 p-5 rounded-3xl space-y-4">
            <h4 className="text-xs font-mono font-bold text-slate-350 uppercase tracking-wider">
              ROTATION ALERTER SYSTEM
            </h4>

            <div className="space-y-3">
              {secretsList.slice(0, 3).map((item) => (
                <div key={item.id} className="p-3 bg-[#080b10] border border-slate-900 rounded-xl flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="block font-bold text-slate-200">{item.name}</span>
                    <span className={`text-[10px] ${item.expiryDays <= 7 ? 'text-rose-400 animate-pulse' : 'text-slate-500'}`}>
                      Expires in: {item.expiryDays} days
                    </span>
                  </div>
                  {item.expiryDays <= 7 && (
                    <span className="text-[9px] font-bold text-rose-405 text-red-400 uppercase tracking-widest bg-red-950/20 px-1.5 py-0.5 rounded border border-red-900/40 animate-pulse">
                      CRIT
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: ENVIRONMENT MATRIX COMPARATIVE */}
      {activeTab === 'matrix' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          
          <div className="lg:col-span-8 bg-[#090b11] border border-slate-850/60 p-5 rounded-3xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <h3 className="text-xs font-semibold uppercase text-slate-300 font-mono">
                VARIABLE VALUE ENV MATRIX COMPARATOR
              </h3>
              
              <div className="flex bg-[#000] p-1 rounded-xl border border-slate-900">
                {(['development', 'staging', 'production'] as const).map(env => (
                  <button
                    key={env}
                    onClick={() => { onTriggerSound(1.0); setMatrixEnv(env); }}
                    className={`px-3 py-1 text-[10px] font-mono leading-none rounded-lg uppercase tracking-wide transition ${
                      matrixEnv === env ? 'bg-sky-600/20 border border-sky-500/30 text-sky-400 font-black' : 'text-slate-500'
                    }`}
                  >
                    {env}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              {[
                { key: 'API_ORIGIN_HOST', val: matrixEnv === 'production' ? 'https://production.devstate.os' : 'http://localhost:3000' },
                { key: 'ENABLE_SANDBOX_STRESS', val: matrixEnv === 'development' ? 'true' : 'false' },
                { key: 'SESSION_TTL_MS', val: matrixEnv === 'production' ? '86400000 (24h)' : '3600000 (1h)' }
              ].map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-950 border border-slate-900 rounded-xl flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-400 font-black">{item.key}</span>
                  <span className="text-slate-205 text-[#00ffd1]">{item.val}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 bg-slate-955 bg-slate-950 border border-slate-905 border-slate-900 p-5 rounded-3xl text-center space-y-4 py-8">
            <FileCode className="w-12 h-12 text-sky-450 mx-auto stroke-1" />
            <span className="block text-xs font-sans font-black uppercase text-slate-200">Export variables dataset</span>
            <p className="text-[11px] font-mono text-slate-500 leading-normal">
              Directly download current configuration as local standard encrypted files.
            </p>
            <button
              onClick={() => { onTriggerSound(1.2); onTriggerNotification('Local cryptographically secure build file .env.production saved.', 'success'); }}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-850 hover:text-white border border-slate-805 text-slate-350 text-xs font-mono font-bold uppercase rounded-xl transition cursor-pointer w-full"
            >
              DOWNLOAD .ENV FILE
            </button>
          </div>

        </div>
      )}

      {/* TAB 3: ACCESS CONTROL TRAILS */}
      {activeTab === 'access' && (
        <div className="bg-[#090b11] border border-slate-850/60 p-5 rounded-3xl space-y-4 animate-fade-in select-text">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
            CYPHER SECURITY AUDIT ACCESS CHANNELS
          </h3>

          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3 bg-slate-950 border border-slate-900 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono gap-2 text-slate-350">
                <div className="flex items-center gap-2">
                  <span className="text-sky-400">[{log.timestamp}]</span>
                  <span className="text-slate-500 font-black">{log.action}</span>
                </div>
                <div>
                  <span className="text-indigo-400">Key: {log.secret}</span> | Operator: <span className="text-slate-300 font-medium">{log.user}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ROTATION CONFIG */}
      {activeTab === 'rotation' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          
          <div className="lg:col-span-8 bg-[#090b11] border border-slate-850/60 p-5 rounded-3xl space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono pb-2 border-b border-white/5">
              PRE / POST SYNC ROTATION SCRIPTS
            </h3>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-slate-550 block font-bold">PRE-ROTATION PIPELINE TRIGGER CODE</span>
                <input
                  type="text"
                  value={prehookCommand}
                  onChange={e => setPrehookCommand(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3.5 py-2.5 text-xs font-mono text-emerald-400 focus:outline-none focus:ring-1 focus:ring-sky-500/40"
                />
              </div>

              <p className="text-[11px] text-slate-550 leading-relaxed font-mono">
                System dispatches the above command checks securely before writing variables into target containers. Status values: LOCKED.
              </p>
            </div>
          </div>

          <div className="lg:col-span-4 bg-slate-950 border border-slate-900 p-5 rounded-3xl space-y-3">
            <span className="text-[9.5px] font-mono text-slate-550 block uppercase font-bold">AUTOMATION CADENCE</span>
            <p className="text-[11px] font-mono text-slate-450 leading-relaxed">
              Rotation operations trigger automatically every 30 days. No manual supervision required during background deployments.
            </p>
          </div>

        </div>
      )}

      {/* TAB 5: SYNC ACTIONS INTEGRATION HUB */}
      {activeTab === 'hub' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {[
            { tag: 'Vercel Env Matrix API', desc: 'Secure variables push to build targets.', path: 'INTEGRATED' },
            { tag: 'Railway deployment variables', desc: 'Sync staging environments values instantly.', path: 'NOT_CONNECTED' },
            { tag: 'GitHub Action repository secrets', desc: 'Deploy pipeline security hashes securely.', path: 'INTEGRATED' }
          ].map((hub, i) => (
            <div key={i} className="bg-slate-950 border border-slate-900 p-5 rounded-3xl flex flex-col justify-between min-h-[160px]">
              <div>
                <strong className="text-slate-100 text-xs font-sans">{hub.tag}</strong>
                <p className="text-[11px] text-slate-450 mt-1 leading-normal font-mono">{hub.desc}</p>
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className={`text-[9px] font-mono font-bold leading-none px-1.5 py-1 rounded border ${
                  hub.path === 'INTEGRATED' ? 'text-emerald-405 text-emerald-400 border-emerald-900/30 bg-emerald-950/20' : 'text-slate-500 border-slate-900 bg-slate-950'
                }`}>
                  {hub.path}
                </span>

                <button
                  onClick={() => { onTriggerSound(1.1); onTriggerNotification(`Synchronizing matrix updates for provider: ${hub.tag}`, 'success'); }}
                  className="px-2 py-1 text-[10px] bg-slate-900 text-slate-350 hover:text-white rounded border border-slate-805 font-mono"
                >
                  Sync Key
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 6: SECURITY VAULT MATRIX EXPIRED ISSUES */}
      {activeTab === 'health' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          
          <div className="lg:col-span-8 bg-[#090b11] border border-slate-850/60 p-5 rounded-3xl space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono pb-2 border-b border-white/5">
              VAULT CONFIG STABILITY HEALTH
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-950 border border-slate-900 rounded-2xl">
                <span className="block font-bold text-xs text-rose-450 text-red-400 font-mono">DANGER EXPIRED METRICS</span>
                <p className="text-[11px] font-mono text-slate-450 mt-1">
                  1 un-cycled stripeWebhook parameter credentials flagged above policy.
                </p>
              </div>
              <div className="p-4 bg-slate-950 border border-slate-900 rounded-2xl">
                <span className="block font-bold text-xs text-[#00ffd1] font-mono font-black">STABLE SANITY INDEX</span>
                <p className="text-[11px] font-mono text-slate-450 mt-1 font-medium">
                  All 8 production environment variables conform securely to schema structures.
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 7: ZERO KNOWLEDGE TEMPORARY SHARING */}
      {activeTab === 'share' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          
          <div className="lg:col-span-7 bg-[#090b11] border border-slate-850/60 p-5 rounded-3xl space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono pb-2 border-b border-white/5">
              ENCRYPT DISPOSABLE TEXT STRINGS
            </h3>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono text-slate-550 block font-bold mb-1">RAW SENSITIVE STRING PAYLOAD</span>
                <input
                  type="text"
                  placeholder="Paste credentials, certificates, or SSH content..."
                  value={tempSecretInput}
                  onChange={e => setTempSecretInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500/40"
                />
              </div>

              <button
                onClick={createTemporalOneTimeLink}
                className="px-4 py-2 bg-gradient-to-r from-sky-600 to-indigo-650 bg-gradient-to-r from-sky-700 to-indigo-700 hover:from-sky-600 hover:to-indigo-600 font-black text-xs font-mono uppercase text-white rounded-xl transition cursor-pointer"
              >
                GENERATE ONE-TIME VISITATION LINK
              </button>

              {temporaryLink && (
                <div className="space-y-2 p-3.5 bg-slate-950 border border-slate-900 rounded-2xl">
                  <span className="text-[10.5px] font-mono text-slate-500 block font-bold">TEMPORARY VISITATION TETHER</span>
                  <div className="flex text-xs font-mono gap-2">
                    <input
                      type="text"
                      readOnly
                      value={temporaryLink}
                      className="flex-1 bg-[#000] border border-slate-900 rounded p-1.5 text-sky-400 select-all"
                    />
                    <button 
                      onClick={() => copyToClipboardSimulated('copiedTemp', temporaryLink, 'Disposable link')}
                      className="text-slate-400 hover:text-white"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="text-[9px] font-mono text-slate-550">
                    This link will expire instantly once visited. Remainder access counts: {tempViews} views.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 bg-slate-955 bg-slate-950 border border-slate-900 rounded-3xl p-5 text-center flex flex-col justify-center space-y-3 py-12">
            <Share2 className="w-10 h-10 text-sky-400 mx-auto stroke-1" />
            <h5 className="text-xs font-bold text-white font-sans">Zero-Knowledge ciphering</h5>
            <p className="text-[11px] font-mono text-slate-550 max-w-xs mx-auto leading-normal">
              Encrypted value parameters are parsed only inside browser RAM via dynamic tokens, bypassing central database files.
            </p>
          </div>

        </div>
      )}

    </div>
  );
}
