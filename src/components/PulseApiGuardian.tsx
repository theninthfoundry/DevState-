import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, Activity, RefreshCw, Send, Plus, Search, FileCode, CheckCircle, 
  AlertTriangle, Flame, ShieldAlert, Cpu, Terminal, Eye, Sliders, Play, 
  Save, Database, Code, Zap, FileText, ChevronRight, HelpCircle, X, ShieldCheck
} from 'lucide-react';

interface PulseApiGuardianProps {
  onTriggerSound: (freq?: number) => void;
  onTriggerNotification: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

interface ApiEndpoint {
  id: string;
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  category: 'Internal' | 'External' | 'Partner';
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  uptime: string;
  p95: string;
  errorRate: string;
  regions: string[];
}

export default function PulseApiGuardian({ onTriggerSound, onTriggerNotification }: PulseApiGuardianProps) {
  const [activeTab, setActiveTab] = useState<'registry' | 'workbench' | 'contracts' | 'mocking' | 'webhooks' | 'performance' | 'docs'>('registry');
  const [searchTerm, setSearchTerm] = useState('');

  // API Registry list state
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([
    { id: 'api-1', name: 'User Account Fetcher', url: 'https://api.devstate.os/v1/users', method: 'GET', category: 'Internal', status: 'HEALTHY', uptime: '99.98%', p95: '42ms', errorRate: '0.01%', regions: ['US-East', 'EU-West'] },
    { id: 'api-2', name: 'OpenAI Embeddings Proxy', url: 'https://api.openai.com/v1/embeddings', method: 'POST', category: 'External', status: 'DEGRADED', uptime: '98.45%', p95: '480ms', errorRate: '2.5%', regions: ['US-West', 'AP-East'] },
    { id: 'api-3', name: 'Realtime Files Indexer Service', url: 'https://api.devstate.os/v1/crawler/index', method: 'POST', category: 'Internal', status: 'HEALTHY', uptime: '99.99%', p95: '12ms', errorRate: '0.0%', regions: ['US-East'] },
    { id: 'api-4', name: 'Stripe webhook payments router', url: 'https://api.stripe.com/v2/charges', method: 'POST', category: 'External', status: 'HEALTHY', uptime: '99.90%', p95: '180ms', errorRate: '0.12%', regions: ['US-West', 'EU-Central'] },
    { id: 'api-5', name: 'Gemini Session context model provider', url: 'http://localhost:3000/api/workspace/vision/analysis', method: 'GET', category: 'Internal', status: 'DOWN', uptime: '82.3%', p95: '2500ms', errorRate: '18.4%', regions: ['Localhost-Node'] }
  ]);

  // Http Workbench State (Postman style request builder)
  const [wbMethod, setWbMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>('POST');
  const [wbUrl, setWbUrl] = useState('https://api.devstate.os/v1/users');
  const [wbHeaders, setWbHeaders] = useState([
    { key: 'Content-Type', value: 'application/json' },
    { key: 'Authorization', value: 'Bearer sk-devstate-93817' }
  ]);
  const [wbPayload, setWbPayload] = useState('{\n  "username": "sreeshanth_nam",\n  "role": "Lead Architect"\n}');
  const [wbResponse, setWbResponse] = useState<any>(null);
  const [wbStatus, setWbStatus] = useState<number | null>(null);
  const [wbLoading, setWbLoading] = useState(false);
  const [wbErrorShake, setWbErrorShake] = useState(false);
  const [wbSelectedLanguage, setWbSelectedLanguage] = useState<'curl' | 'js' | 'python'>('curl');

  // Sync / Scan status state
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Contract analysis rules mockup
  const contracts = [
    { name: 'Workspace analysis contract', path: '/api/workspace/analytics', spec_match: true, changes: 'None' },
    { name: 'Stripe webhook schema specification', path: '/api/stripe/payment-intent', spec_match: false, changes: 'Field "payment_method_types" missing' },
    { name: 'Github Commit webhooks binding', path: '/api/github/webhook', spec_match: true, changes: 'None' }
  ];

  // Webhooks log
  const [incomingWebhooks, setIncomingWebhooks] = useState([
    { id: 'wh-1', event: 'stripe.payment_intent.succeeded', source: 'Stripe', time: '10 sec ago', payload: '{"amount": 4900, "currency": "usd"}' },
    { id: 'wh-2', event: 'github.push_event_resolved', source: 'GitHub', time: '1 min ago', payload: '{"commits": [{"author": "sreeshanth", "msg": "merge conflict fixed"}]}' }
  ]);

  // Mock server configurations
  const [mockLatency, setMockLatency] = useState<number>(150);
  const [mockStatusCode, setMockStatusCode] = useState<number>(200);

  const runAllHeartbeatPings = () => {
    setIsRefreshing(true);
    onTriggerSound(1.3);
    onTriggerNotification('Deploying heartbeat diagnostic packets to API roots...', 'info');

    setTimeout(() => {
      setIsRefreshing(false);
      onTriggerSound(1.5);
      onTriggerNotification('Biometric heartbeat diagnostic complete. 4/5 endpoints stable.', 'success');
      // Revive endpoint 5 to healthy to display beautiful transition
      setEndpoints(prev => prev.map(e => e.id === 'api-5' ? { ...e, status: 'HEALTHY', p95: '88ms', errorRate: '0.0%' } : e));
    }, 1800);
  };

  const executeWorkbenchRequest = () => {
    setWbLoading(true);
    onTriggerSound(1.1);
    
    // Simulate API request delays
    setTimeout(() => {
      try {
        if (!wbUrl.startsWith('https://') && !wbUrl.startsWith('http://')) {
          throw new Error('MALFORMED ROOT PROTOCOL: Please provide valid origin.');
        }

        const mockBody = JSON.parse(wbPayload);
        setWbStatus(200);
        setWbResponse({
          status: "SUCCESS_OK",
          message: "Account record resolved securely.",
          timestamp: new Date().toISOString(),
          context: {
            host: "api.devstate.os",
            sandbox_integrity: "STABLE",
            auth_verification: "JWT_SECURE_TOKEN",
            data: mockBody
          }
        });
        setWbLoading(false);
        onTriggerSound(1.6);
        onTriggerNotification(`Workbench: Response code 200 resolved in 34ms`, 'success');
      } catch (err: any) {
        setWbStatus(500);
        setWbResponse({
          status: "CRITICAL_REQUEST_FAULT",
          reason: err.message || "Parse schema conflict. Invalid JSON payload format input.",
          environment_lock: "ACTIVE"
        });
        setWbLoading(false);
        setWbErrorShake(true);
        setTimeout(() => setWbErrorShake(false), 500);
        onTriggerSound(0.75);
        onTriggerNotification(`Workbench: Compilation / request target fault.`, 'error');
      }
    }, 1000);
  };

  const getEcgWaveformPath = (status: 'HEALTHY' | 'DEGRADED' | 'DOWN', speedOffset: number = 0) => {
    if (status === 'DOWN') {
      // Flatline representation with subtle electrical variance noise
      return `M 0 15 L 30 15 L 60 14 L 90 15 L 120 15 L 150 15 L 180 15 L 210 14 L 240 15 L 270 15 L 300 15`;
    }
    if (status === 'DEGRADED') {
      // Irregular, chaotic intervals
      return `M 0 15 L 30 15 L 45 5 L 53 28 L 60 15 L 90 15 L 105 8 L 115 25 L 122 15 L 150 14 L 165 -5 L 175 32 L 185 15 L 210 15 L 240 15 L 270 10 L 285 24 L 300 15`;
    }
    // High-resolution biometrically stable rhythmic ECG sweep
    return `M 0 15 L 45 15 L 60 2 L 68 28 L 75 15 L 110 15 L 125 15 L 138 2 L 145 28 L 153 15 L 210 15 L 225 15 L 238 2 L 245 28 L 253 15 L 300 15`;
  };

  // Helper snippet generator
  const getSimulatedCode = (lang: 'curl' | 'js' | 'python') => {
    if (lang === 'curl') {
      return `curl -X ${wbMethod} "${wbUrl}" \\\n  -H "Content-Type: application/json" \\\n  -H "Authorization: Bearer sk-devstate-93817" \\\n  -d '${wbPayload.replace(/\n\s*/g, '')}'`;
    }
    if (lang === 'js') {
      return `fetch("${wbUrl}", {\n  method: "${wbMethod}",\n  headers: {\n    "Content-Type": "application/json",\n    "Authorization": "Bearer sk-devstate-93817"\n  },\n  body: JSON.stringify(${wbPayload.replace(/\n\s*/g, '')})\n})\n.then(res => res.json())\n.then(data => console.log(data));`;
    }
    return `import requests\n\nurl = "${wbUrl}"\nheaders = {\n    "Content-Type": "application/json",\n    "Authorization": "Bearer sk-devstate-93817"\n}\npayload = ${wbPayload.replace(/\n\s*/g, '')}\n\nresponse = requests.post(url, json=payload, headers=headers)\nprint(response.json())`;
  };

  return (
    <div id="pulse-api-guardian-module" className="space-y-6 text-slate-100 select-text">
      
      {/* HEADER BAR HERO BANNER */}
      <div className="bg-[#0b0d14]/80 backdrop-blur-md border border-emerald-950/40 p-6 rounded-3xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full filter blur-2xl pointer-events-none animate-pulse"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-emerald-500 animate-pulse shrink-0" />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 font-mono">
              BIOMETRIC WEB VITAL SIGNAL OPERATIONS
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white mt-1.5 flex items-center gap-2 font-sans">
            <Activity className="w-5 h-5 text-emerald-500 animate-pulse" />
            Pulse API Guardian & Mock Lab
          </h2>
          <p className="text-xs text-slate-450 mt-1 max-w-2xl leading-relaxed">
            Continuously probe response latencies, run JSON contract assertions, simulate high-concurrency staging delays, and capture active webhook payloads instantly.
          </p>
        </div>

        <div className="flex items-center gap-2 relative z-10 shrink-0">
          <button
            onClick={runAllHeartbeatPings}
            disabled={isRefreshing}
            className="px-4.5 py-3 cursor-pointer bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-mono font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/20 active:scale-95 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'PROBING VITAL ENDPOINTS...' : 'PING HEARTBEAT REGISTRY'}
          </button>
        </div>
      </div>

      {/* SEARCH AND INTERNAL NAVIGATION SUBBAR */}
      <div className="flex flex-wrap items-center justify-between bg-[#080a10]/85 border border-slate-900 px-4 py-2 rounded-2xl gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
          {[
            { id: 'registry', name: 'Vital registry' },
            { id: 'workbench', name: 'Workbench client' },
            { id: 'contracts', name: 'JSON Contracts' },
            { id: 'mocking', name: 'Mock Engine' },
            { id: 'webhooks', name: 'Webhook Studio' },
            { id: 'performance', name: 'Latency waterfall' },
            { id: 'docs', name: 'Swagger interactive' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { onTriggerSound(1.02); setActiveTab(tab.id as any); }}
              className={`px-3.5 py-2 text-[10.5px] font-mono font-bold rounded-xl whitespace-nowrap transition cursor-pointer border ${
                activeTab === tab.id 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-extrabold' 
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
            placeholder="Filter APIs/contracts..."
            className="w-full bg-[#030509] border border-slate-850/60 rounded-xl pl-9 pr-4 py-1.5 text-xs font-mono text-slate-300 placeholder:text-slate-650 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
          />
        </div>
      </div>

      {/* TAB 1: BIOMETRIC API REGISTRY */}
      {activeTab === 'registry' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          
          <div className="lg:col-span-12 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {endpoints
                .filter(e => {
                  if (!searchTerm) return true;
                  return e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         e.url.toLowerCase().includes(searchTerm.toLowerCase());
                })
                .map((endpoint) => (
                  <div key={endpoint.id} className="bg-[#090b11] border border-slate-850/60 p-5 rounded-3xl space-y-4 relative overflow-hidden flex flex-col justify-between min-h-[220px]">
                    <div className="absolute top-0 right-0 p-2 bg-[#000]" style={{ borderBottomLeftRadius: '12px' }}>
                      <span className={`text-[8.5px] font-black uppercase px-2 py-0.5 rounded border ${
                        endpoint.category === 'Internal' ? 'text-indigo-400 border-indigo-900/30 bg-indigo-950/20' : 'text-[#00ffd1] border-[#00ffd1]/20 bg-[#00ffd1]/5'
                      }`}>
                        {endpoint.category}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${
                          endpoint.status === 'HEALTHY' ? 'bg-emerald-500' : endpoint.status === 'DEGRADED' ? 'bg-amber-500 animate-pulse' : 'bg-red-500 animate-pulse'
                        }`} />
                        <h4 className="text-xs font-black text-slate-100 font-sans tracking-tight">{endpoint.name}</h4>
                      </div>
                      <p className="text-[10px] text-slate-450 font-mono mt-1 break-all bg-black/60 p-1.5 rounded border border-slate-900">
                        {endpoint.method} {endpoint.url}
                      </p>
                    </div>

                    {/* MEDICAL ECG DYNAMIC DISPLAY */}
                    <div className="h-10 bg-slate-950/60 border border-slate-900 p-1 rounded-2xl flex items-center overflow-hidden">
                      <svg viewBox="0 0 300 30 animate-pulse" className={`w-full h-full stroke-2 fill-none ${
                        endpoint.status === 'HEALTHY' ? 'text-emerald-500' : endpoint.status === 'DEGRADED' ? 'text-amber-500' : 'text-red-500'
                      }`}>
                        <path d={getEcgWaveformPath(endpoint.status)} />
                      </svg>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono text-slate-500 border-t border-slate-900 pt-3">
                      <div>
                        <span className="block text-[8px] font-bold">UPTIME</span>
                        <strong className="text-slate-205 text-[#00ffd1] mt-0.5 block">{endpoint.uptime}</strong>
                      </div>
                      <div>
                        <span className="block text-[8px] font-bold">LATENCY</span>
                        <strong className="text-slate-205 mt-0.5 block text-slate-300">{endpoint.p95}</strong>
                      </div>
                      <div>
                        <span className="block text-[8px] font-bold">ERRORS</span>
                        <strong className="text-slate-205 mt-0.5 block text-slate-300">{endpoint.errorRate}</strong>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: POSTMAN-STYLE HTTP WORKBENCH */}
      {activeTab === 'workbench' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          
          {/* REQUEST BUILDER */}
          <div className="lg:col-span-6 bg-[#090b11] border border-slate-850/60 p-5 rounded-3xl space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono pb-2 border-b border-white/5 flex items-center justify-between">
              <span>SANDBOX API REQUEST BUILDER</span>
              <span className="text-[10px] text-indigo-400 font-bold bg-[#000] px-2 py-0.5 rounded-lg border border-slate-900">
                METHOD: {wbMethod}
              </span>
            </h3>

            <div className="flex gap-2">
              <select
                value={wbMethod}
                onChange={e => setWbMethod(e.target.value as any)}
                className="bg-slate-950 border border-slate-900 rounded-xl px-3 py-2 text-xs font-mono text-slate-300 focus:outline-none"
              >
                <option>GET</option>
                <option>POST</option>
                <option>PUT</option>
                <option>DELETE</option>
              </select>
              
              <input
                type="text"
                value={wbUrl}
                onChange={e => setWbUrl(e.target.value)}
                placeholder="https://api.devstate.os/v1/users"
                className="flex-1 bg-slate-950 border border-slate-900 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
              />

              <button
                onClick={executeWorkbenchRequest}
                disabled={wbLoading}
                className="px-4 py-2 cursor-pointer bg-emerald-650 hover:bg-emerald-550 bg-emerald-700 hover:bg-emerald-600 text-white font-mono font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {wbLoading ? 'CALLING...' : 'SEND'}
              </button>
            </div>

            {/* HEADERS FIELD MANAGER */}
            <div className="space-y-2">
              <span className="text-[10.5px] font-mono text-slate-500 block font-bold">AUTONOMOUS REQUEST HEADERS</span>
              {wbHeaders.map((header, idx) => (
                <div key={idx} className="flex gap-2 text-xs font-mono">
                  <input
                    type="text"
                    value={header.key}
                    disabled
                    className="w-1/3 bg-slate-950 border border-slate-900 rounded-lg p-1.5 text-slate-500"
                  />
                  <input
                    type="text"
                    value={header.value}
                    disabled
                    className="flex-1 bg-slate-950 border border-slate-900 rounded-lg p-1.5 text-slate-400"
                  />
                </div>
              ))}
            </div>

            {/* RAW PAYLOAD BODY JSON */}
            <div className="space-y-1.5">
              <span className="text-[10.5px] font-mono text-slate-500 block font-bold">BODY (RAW APPLICATION/JSON)</span>
              <textarea
                value={wbPayload}
                onChange={e => setWbPayload(e.target.value)}
                rows={5}
                className="w-full bg-slate-950 border border-slate-900 rounded-xl p-3.5 text-xs font-mono text-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-555/35 focus:ring-emerald-500/30 leading-relaxed"
              />
            </div>
          </div>

          {/* RESPONSE VIEWER */}
          <div className={`lg:col-span-6 bg-slate-950 border border-slate-900 p-5 rounded-3xl flex flex-col justify-between min-h-[440px] transition-all ${wbErrorShake ? 'translate-x-1 animate-ping bg-red-950/5 border-red-500/25' : ''}`}>
            <div>
              <div className="flex items-center justify-between pb-3.5 border-b border-white/5 mb-4">
                <span className="text-xs font-bold text-slate-300 font-mono tracking-tight">RESPONSE DATA BLUEPRINT</span>
                {wbStatus !== null && (
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border font-mono ${
                    wbStatus === 200 ? 'text-emerald-450 border-emerald-950/40 bg-emerald-950/20' : 'text-red-400 border-red-500/20 bg-red-500/5'
                  }`}>
                    STATUS_CODE: {wbStatus}
                  </span>
                )}
              </div>

              {wbResponse ? (
                <div className="space-y-4">
                  <pre className="text-[11px] leading-relaxed select-text font-mono text-slate-300 bg-[#030509] border border-slate-900 p-4 rounded-2xl overflow-y-auto max-h-[220px]">
                    {JSON.stringify(wbResponse, null, 2)}
                  </pre>

                  {/* CODE GENERATION SNIPPET ACCORDION */}
                  <div className="space-y-2 pt-3 border-t border-slate-900">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                      <span>EXPORT CLIENT SNIPPET:</span>
                      <div className="flex bg-[#000] rounded overflow-hidden">
                        {(['curl', 'js', 'python'] as const).map(lang => (
                          <button
                            key={lang}
                            onClick={() => setWbSelectedLanguage(lang)}
                            className={`px-2 py-0.5 uppercase ${wbSelectedLanguage === lang ? 'bg-indigo-600/30 text-white font-extrabold' : 'text-slate-500 hover:text-slate-300'}`}
                          >
                            {lang}
                          </button>
                        ))}
                      </div>
                    </div>
                    <pre className="text-[10px] leading-relaxed select-text font-mono text-[#00ffd1] bg-[#030509] border border-slate-900 p-3 rounded-xl overflow-x-auto">
                      {getSimulatedCode(wbSelectedLanguage)}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="text-center py-24 text-slate-650 font-mono text-xs select-none">
                  Workbench idle. Trigger request variables to capture JSON payloads.
                </div>
              )}
            </div>

            <div className="p-3.5 bg-[#080b0f] rounded-2xl border border-slate-900 text-[10.5px] font-mono text-slate-500 flex items-start gap-2 relative overflow-hidden mt-6">
              <Zap className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-400 font-black block text-[9.5px]">AUTOMATED ASSERTIONS REPORT</span>
                Response JSON schemas match production models. No active drift detected within the structural attributes.
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: CONTRACT TESTING */}
      {activeTab === 'contracts' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          
          <div className="lg:col-span-8 bg-[#090b11] border border-slate-850/60 p-5 rounded-3xl space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono pb-2 border-b border-white/5">
              OPENAPI SPEC SCHEMA DRIFT DETECTIONS
            </h3>

            <div className="space-y-3">
              {contracts.map((item, idx) => (
                <div key={idx} className="p-4 bg-slate-950/70 border border-slate-900 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-xl border ${
                      item.spec_match ? 'bg-emerald-500/5 border-emerald-500/25 text-emerald-400' : 'bg-rose-500/5 border-rose-500/25 text-rose-500 animate-pulse'
                    }`}>
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="text-slate-100 text-xs font-mono">{item.name}</strong>
                      <p className="text-[10px] text-slate-500 font-mono mt-1">
                        Endpoint Target: <span className="text-slate-400">{item.path}</span>
                      </p>
                      <span className="text-[9.5px] font-mono text-slate-550 block mt-1">Status: {item.changes}</span>
                    </div>
                  </div>

                  <span className={`text-[8.5px] font-mono font-bold px-2 py-1 rounded border uppercase ${
                    item.spec_match ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5' : 'text-red-400 border-red-500/20 bg-red-500/5 animate-pulse'
                  }`}>
                    {item.spec_match ? 'SCHEMA MATCH' : 'DRIFT DETECTED'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 bg-slate-950 border border-slate-900 p-5 rounded-3xl text-center space-y-4 py-8">
            <Code className="w-12 h-12 text-[#00ffd1] mx-auto stroke-1" />
            <h4 className="text-xs font-sans font-bold text-slate-205">TYPES GENERATION SANDBOX</h4>
            <p className="text-[11px] font-mono text-slate-500">
              Instantly scaffold standard structural TypeScript types from active client OpenAPI specifications schemas.
            </p>
            <button
              onClick={() => { onTriggerSound(1.25); onTriggerNotification('TypeScript contract types exported in types.ts', 'success'); }}
              className="px-4 py-2 w-full bg-slate-900 hover:bg-slate-850 text-slate-300 font-bold text-xs rounded-xl border border-slate-805"
            >
              GENERATE SCRIPT TYPES
            </button>
          </div>

        </div>
      )}

      {/* TAB 4: MOCK SERVER */}
      {activeTab === 'mocking' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          
          <div className="lg:col-span-8 bg-[#090b11] border border-slate-850/60 p-5 rounded-3xl space-y-5">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono pb-2 border-b border-white/5">
              SIMULATED DELAYS & FAULTS
            </h3>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-mono text-slate-450 mb-1">
                  <span>ARTIFICIAL SIMULATED LATENCY</span>
                  <strong className="text-[#00ffd1]">{mockLatency}ms</strong>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5000"
                  step="50"
                  value={mockLatency}
                  onChange={e => setMockLatency(Number(e.target.value))}
                  className="w-full accent-[#00ffd1] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-slate-455 text-slate-500 mb-1">
                  <span>MOCK RESPONSE STATUS CODE</span>
                  <strong className="text-white">{mockStatusCode} OK</strong>
                </div>
                <div className="flex gap-1.5 bg-[#000] p-1.5 rounded-xl border border-slate-900">
                  {[200, 201, 400, 401, 500, 503].map(code => (
                    <button
                      key={code}
                      onClick={() => { onTriggerSound(1.0); setMockStatusCode(code); }}
                      className={`flex-1 py-1.5 text-xs font-mono rounded-lg transition ${
                        mockStatusCode === code ? 'bg-indigo-600/30 text-white font-extrabold border border-indigo-500/20' : 'text-slate-550'
                      }`}
                    >
                      {code}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 bg-slate-950 border border-slate-900 p-5 rounded-3xl space-y-4 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono text-slate-500 block font-bold">MOCK TUNNEL</span>
              <p className="text-[11px] font-mono text-slate-450 mt-1">
                Share a local sandbox tunnel with your team securely for responsive interface alignments.
              </p>
              <div className="bg-[#080b0f] p-2.5 rounded-xl border border-slate-900 text-xs font-mono text-[#00ffd1] mt-3 truncate">
                https://ais-pre-7vmrqrz...run.app/mocks/v1
              </div>
            </div>

            <button
              onClick={() => { onTriggerSound(1.3); onTriggerNotification('Local ngrok proxy routing active on port 3000', 'success'); }}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-850 hover:text-white text-slate-300 font-sans text-xs font-black uppercase rounded-xl transition cursor-pointer border border-slate-805"
            >
              DEPLOY TUNNEL MOCK
            </button>
          </div>

        </div>
      )}

      {/* TAB 5: WEBHOOK LABORATORY */}
      {activeTab === 'webhooks' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
          
          <div className="lg:col-span-8 bg-[#090b11] border border-slate-850/60 p-5 rounded-3xl space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono pb-2 border-b border-white/5">
              CAPTURED INCOMING WEBHOOK EVENTS
            </h3>

            <div className="space-y-3">
              {incomingWebhooks.map(item => (
                <div key={item.id} className="p-4 bg-slate-950 border border-slate-900 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white">{item.event}</span>
                      <span className="text-[9px] font-mono bg-indigo-950 text-indigo-400 px-1.5 py-0.5 rounded">
                        {item.source}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono mt-1">Captured: {item.time}</p>
                    <pre className="text-[10px] bg-[#000] p-2 rounded border border-slate-900 text-emerald-400 font-mono">
                      {item.payload}
                    </pre>
                  </div>

                  <button
                    onClick={() => { onTriggerSound(1.15); onTriggerNotification(`Event resolution replayed: ${item.event}`, 'success'); }}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 text-slate-350 hover:text-white font-mono font-bold text-[10px] rounded-lg transition"
                  >
                    REPLAY EVENT
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 bg-slate-950 border border-slate-900 p-5 rounded-3xl text-center space-y-3 py-12">
            <Send className="w-10 h-10 text-emerald-500 mx-auto stroke-1 animate-bounce" />
            <h5 className="text-xs font-bold text-white font-sans">WEBHOOK.SITE TUNNEL</h5>
            <p className="text-[11px] font-mono text-slate-500">
              Instantly bind a live mock webhook URL directly. Trigger external callbacks to parse events layout.
            </p>
          </div>

        </div>
      )}

      {/* TAB 6: PERFORMANCE LATENCY ANALYSIS */}
      {activeTab === 'performance' && (
        <div className="bg-[#090b11] border border-slate-850/60 p-6 rounded-3xl space-y-4 animate-fade-in select-none">
          <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase font-bold block">
            NESTED NESTING WATERFALL EXECUTION CHAINS
          </span>
          
          <div className="space-y-4 pb-4">
            {[
              { label: 'DB Client Ingest (PostgreSQL)', pct: 15, delay: '4ms' },
              { label: 'Token signature verify (jsonwebtoken)', pct: 35, delay: '9ms' },
              { label: 'Spec delta scanner (fs.read)', pct: 85, delay: '22ms' },
              { label: 'Gemini model pipeline (HTTP call)', pct: 100, delay: '2600ms' }
            ].map((chain, i) => (
              <div key={i} className="space-y-1.5 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-300 font-bold">{chain.label}</span>
                  <span className="text-emerald-450 text-emerald-400">{chain.delay}</span>
                </div>
                <div className="h-2 bg-[#000] border border-slate-900 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${chain.pct}%` }}
                    transition={{ duration: 1.0, delay: i * 0.1 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: DOCUMENTATIONS INTERACTIVE SWAGGER */}
      {activeTab === 'docs' && (
        <div className="bg-[#090b11] border border-slate-850/60 p-6 rounded-3xl space-y-4 animate-fade-in select-text">
          <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase font-bold block">Changelogs & Interactive specs Swagger</span>
          <div className="border border-slate-900 rounded-2xl bg-slate-950/60 p-5 text-xs font-mono space-y-3 leading-relaxed">
            <div className="text-emerald-400 font-extrabold font-mono text-xs">API VERSION: V4.5 STABLE</div>
            <p className="text-slate-400">
              Generated OpenAPI specification v3.0.0. Intercepted traffic logs match specifications structure precisely.
            </p>
            <div className="p-3 bg-[#030509] rounded border border-slate-900 text-slate-500">
              GET /api/workspace/files <br />
              POST /api/security/vault/secret-lock <br />
              GET /api/heartbeat/pings <br />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
