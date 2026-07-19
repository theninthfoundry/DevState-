import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, ShieldCheck, Compass, Settings, User, Code, FileCode,
  CheckCircle2, RefreshCw, Send, ChevronRight, Play, ExternalLink,
  Target, Award, Zap, HelpCircle, FileText, Search, Activity, BookOpen, AlertCircle
} from 'lucide-react';

interface OracleProps {
  onTriggerSound: (freq?: number) => void;
  onTriggerNotification: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export default function OracleAiArchitect({ onTriggerSound, onTriggerNotification }: OracleProps) {
  const [activeTab, setActiveTab] = useState<'review' | 'scaffold' | 'refactor' | 'genome'>('review');
  const [inputText, setInputText] = useState('');
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'oracle'; text: string; code?: string }[]>([
    { sender: 'oracle', text: "Greetings, namireddysreeshanth@gmail.com. I am the Oracle AI Architect. Pitch your design concepts, and I will generate enterprise scaffold directories, conduct complete OWASP compliance checklists, and code robust unit-test files." }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  // Genome details
  const [radarSecurity, setRadarSecurity] = useState(88);
  const [radarPerformance, setRadarPerformance] = useState(74);
  const [radarMaintainability, setRadarMaintainability] = useState(92);
  const [radarObservability, setRadarObservability] = useState(81);
  const [radarResilience, setRadarResilience] = useState(85);

  const triggerChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    onTriggerSound(650);
    const userMsg = inputText;
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await fetch("/api/architecture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userMsg }),
      });
      const data = await response.json();
      onTriggerSound(800);
      
      let replyText = data.text || "Failed to parse oracle's architecture transmission.";
      
      // If we have grounding chunks, format them
      if (data.chunks && data.chunks.length > 0) {
        replyText += "\n\nSearch References:\n" + data.chunks.map((c: any) => {
          if (c.web) return `- [${c.web.title}](${c.web.uri})`;
          return '';
        }).filter(Boolean).join('\n');
      }

      setChatMessages(prev => [...prev, { sender: 'oracle', text: replyText }]);
      onTriggerNotification("Oracle returned architecture specifications schemas templates.", "success");
    } catch (e) {
      setChatMessages(prev => [...prev, { sender: 'oracle', text: "Network anomaly detected. Access denied to Oracle." }]);
      onTriggerNotification("Network failure connecting to core", "error");
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div id="oracle-ai-architect" className="font-sans text-slate-100 select-none">
      
      {/* HEADER SECTION WITH MYSTICAL VIOLET SPECS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-indigo-950/40 pb-5 mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1 px-1.5 bg-zinc-800 text-zinc-300 rounded-lg text-[9.5px] font-mono border border-indigo-505 border-indigo-550 uppercase tracking-widest font-black animate-pulse">
              Oracle Cognitive Hub Online
            </span>
            <span className="text-slate-550 font-mono text-[10px]">ENGINE SPEC: CLAUDE_SONNET_MODEL</span>
          </div>
          <h2 className="text-2xl font-black text-zinc-300 uppercase tracking-wide flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-zinc-300 animate-pulse" />
            ORACLE AI ARCHITECT
          </h2>
          <p className="text-xs text-slate-400 max-w-xl mt-1">
            Mystical-technological diagnostic senior auditor. Conducts JSDoc compilations, complete OWASP threat assessments, refactoring guidance, and product integrity genome scores.
          </p>
        </div>

        {/* ORACLE GENERAL STATS INDICATOR */}
        <div className="flex items-center bg-slate-950/70 p-3 rounded-2xl border border-indigo-950/30 font-mono text-[10.5px] shadow-lg">
          <div className="px-3 text-center">
            <span className="text-slate-550 text-[8.5px] block">SECURITY AUDIT</span>
            <span className="text-sm font-black text-violet-450 block mt-0.5">OWASP_A_PASS</span>
          </div>
          <div className="w-px h-8 bg-slate-900" />
          <div className="px-3 text-center">
            <span className="text-slate-550 text-[8.5px] block">REUSE RATIO</span>
            <span className="text-sm font-black text-zinc-300 block mt-0.5">92.4%</span>
          </div>
        </div>
      </div>

      {/* CORE NAVIGATION TABS */}
      <div className="flex border-b border-slate-900 pb-3 mb-6 gap-2">
        <button
          onClick={() => { onTriggerSound(510); setActiveTab('review'); }}
          className={`px-4 py-2 font-mono text-xs font-bold rounded-xl transition border ${
            activeTab === 'review'
              ? 'bg-indigo-505/10 border-white/10 text-zinc-300 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          🔮 COMPREHENSIVE CODE GUARD
        </button>
        <button
          onClick={() => { onTriggerSound(570); setActiveTab('scaffold'); }}
          className={`px-4 py-2 font-mono text-xs font-bold rounded-xl transition border ${
            activeTab === 'scaffold'
              ? 'bg-indigo-505/10 border-white/10 text-zinc-300 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          🏗️ SCATTER DIR SCAFFOLDING
        </button>
        <button
          onClick={() => { onTriggerSound(630); setActiveTab('refactor'); }}
          className={`px-4 py-2 font-mono text-xs font-bold rounded-xl transition border ${
            activeTab === 'refactor'
              ? 'bg-indigo-505/10 border-white/10 text-zinc-300 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          🧼 REFACTORING DRAWER
        </button>
        <button
          onClick={() => { onTriggerSound(695); setActiveTab('genome'); }}
          className={`px-4 py-2 font-mono text-xs font-bold rounded-xl transition border ${
            activeTab === 'genome'
              ? 'bg-indigo-505/10 border-white/10 text-zinc-300 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          🛡️ PRODUCT INTEGRITY GENOME
        </button>
      </div>

      <AnimatePresence mode="wait">
        
        {/* TAB 1: CODE REVIEW ENGINE */}
        {activeTab === 'review' && (
          <motion.div
            key="review"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Diff review scorecard left */}
            <div className="lg:col-span-8 bg-[#09090b]/75 border border-slate-900 rounded-3xl p-5 md:p-6 space-y-6">
              <h3 className="text-xs font-black text-slate-350 font-mono uppercase tracking-widest flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-zinc-300" />
                Line Audit & Diff Commentary
              </h3>

              <div className="bg-slate-950/70 border border-slate-900 rounded-2xl overflow-hidden font-mono text-[11px] select-text">
                <div className="bg-slate-900 px-4 py-2.5 text-[9.5px] uppercase font-bold text-slate-500">
                  Target Diff File: src/components/VaultEnvironment.tsx
                </div>
                
                <div className="p-3 space-y-2">
                  <pre className="text-red-400/80 line-through">- const [secretsList, setSecretsList] = useState&lt;VaultSecret[]&gt;([ ... ]);</pre>
                  <pre className="text-zinc-300 font-black">+ const [secretsList, setSecretsList] = useState&lt;VaultSecret[]&gt;([ ... ]);</pre>
                  <pre className="text-purple-400 mt-2 font-bold">// 🔮 Oracle commentary: Good refinement adding explicit ID selectors filtering logic inside Vault delete-secret actions. Limits memory footprint.</pre>
                </div>
              </div>

              <div className="p-4 bg-zinc-800 border border-white/10 rounded-2.5xl space-y-2 font-mono text-xs">
                <span className="font-extrabold text-indigo-350 uppercase tracking-wider block">Security Risk Assessment</span>
                <p className="text-slate-400 text-[11px]">Zero OWASP vulnerabilities found in active session hooks. Keep env secrets under lock files inside default dot env matrices.</p>
              </div>
            </div>

            {/* Quick JSDoc annotations generator right */}
            <div className="lg:col-span-4 bg-slate-950/80 border border-slate-900 rounded-3xl p-5 space-y-4 font-mono text-xs flex flex-col justify-between">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-indigo-450 uppercase tracking-widest flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  JSDoc Markup Compiler
                </h4>

                <div className="p-3.5 bg-[#030509] rounded-xl border border-slate-900 text-slate-400 text-[10.5px] leading-relaxed overflow-x-auto">
                  <pre>{`/**
 * @function renewSessionCookie
 * @param {Request} req HTTP transport headers
 * @returns {Promise<SessionToken>} 
 * @throws {TypeError} if payload void
 */`}</pre>
                </div>
              </div>

              <button
                onClick={() => {
                  onTriggerSound(600);
                  onTriggerNotification("Automatic documentation JSDoc tags copied to clipboard.", "success");
                }}
                className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-800 border border-white/10 text-zinc-300 font-bold uppercase rounded-xl transition"
              >
                COPY JSDoc tags
              </button>
            </div>

          </motion.div>
        )}

        {/* TAB 2: SCAFFOLD CHAT AI */}
        {activeTab === 'scaffold' && (
          <motion.div
            key="scaffold"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-slate-950/70 border border-slate-900 rounded-3xl p-5 md:p-6 space-y-5"
          >
            <div>
              <h3 className="text-sm font-black text-slate-300 font-mono uppercase tracking-widest flex items-center gap-1.5">
                <Compass className="w-5 h-5 text-zinc-300" />
                ENTERPRISE DIR SCAFFOLDER COMPASS
              </h3>
              <p className="text-xs text-slate-500 mt-1">Prompt the Oracle model to automatically output secure database schemas, docker configuration vectors, or visual flow layouts.</p>
            </div>

            {/* Chat Frame */}
            <div className="bg-[#030509] rounded-2.5xl p-4 border border-slate-900 min-h-[250px] max-h-[350px] overflow-y-auto space-y-4 font-mono text-xs select-text">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 max-w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.sender === 'oracle' && (
                    <div className="w-6 h-6 bg-zinc-800 rounded-full border border-white/10 text-[9px] font-black flex items-center justify-center shrink-0 text-indigo-455">
                      OR
                    </div>
                  )}
                  
                  <div className={`p-3 rounded-2xl max-w-2xl leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-zinc-800 text-white rounded-br-none' 
                      : 'bg-slate-905 border border-slate-850 text-slate-350 rounded-bl-none'
                  }`}>
                    {msg.text}

                    {msg.code && (
                      <pre className="mt-3 p-2.5 bg-black/60 rounded-xl border border-white/10 text-[#e4e4e7] text-[10.5px] overflow-x-auto whitespace-pre">
                        {msg.code}
                      </pre>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="text-zinc-300 animate-pulse text-[10.5px]">Oracle is configuring schemas templates...</div>
              )}
            </div>

            {/* Input Box */}
            <form onSubmit={triggerChat} className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Declare features metadata (e.g., 'scaffold payment database schema')"
                className="flex-1 bg-slate-950 border border-slate-900 rounded-xl px-4 py-3 text-xs text-slate-300 placeholder-slate-550 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 font-mono"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="bg-zinc-800 hover:bg-zinc-800 disabled:opacity-40 text-white px-5 rounded-xl text-xs font-black font-mono transition flex items-center gap-1 md:gap-1.5"
              >
                SEND <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}

        {/* TAB 3: REFACTOR ASSISTANT */}
        {activeTab === 'refactor' && (
          <motion.div
            key="refactor"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6 select-text"
          >
            <div className="bg-[#09090b]/75 border border-slate-900 rounded-2.5xl p-5 md:p-6 space-y-4 font-mono text-xs">
              <h3 className="text-slate-300 font-bold uppercase tracking-wider">🧼 REFACTORING SPLIT & MOCKED UNIT TEST CREATIONS</h3>
              <p className="text-slate-500 text-[11px]">Converts single giant layout components controllers into secure modular submodules. Generates fully mock happy path assertions.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Proposed mock refactor result 1 */}
                <div className="p-4 bg-slate-950 border border-slate-900 rounded-2xl space-y-3">
                  <span className="font-extrabold text-zinc-300 block">Proposed split: src/components/VaultEnvironment.tsx</span>
                  <p className="text-[10px] text-slate-500">Isolates standard Vault secrets visual table from secret creation fields controls. Boosts execution cycle rates up to 14%.</p>
                  
                  <div className="p-2.5 bg-[#030509] rounded-xl text-[10.5px] border border-slate-900">
                    <span className="text-[8.5px] text-slate-550 block">REF SUBCOMPONENT SCAFFOLD</span>
                    <code>src/components/VaultSecretsList.tsx</code>
                  </div>
                </div>

                {/* Happy Path Test generation */}
                <div className="p-4 bg-slate-950 border border-slate-900 rounded-2xl space-y-3">
                  <span className="font-extrabold text-[#e4e4e7] block">Automatedhappy path test suite generator</span>
                  <p className="text-[10px] text-slate-500">Inject vitest mock definitions validating list rendering and filter updates of selected categories values.</p>

                  <div className="p-2.5 bg-black/40 rounded-xl text-[10.5px] border border-slate-900 overflow-x-auto">
                    <pre>{`test('filters secrets list', () => {
  const result = secrets.filter(s => s.cat === 'DB Url');
  expect(result.length).toBe(1);
});`}</pre>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 4: PRODUCT INTEGRITY RADAR CHART */}
        {activeTab === 'genome' && (
          <motion.div
            key="genome"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 select-text"
          >
            {/* Visual Radar Pulse Chart */}
            <div className="lg:col-span-6 bg-slate-950/80 border border-slate-900 rounded-3xl p-5 flex flex-col justify-between items-center text-center">
              <div>
                <h4 className="text-[10px] font-black text-zinc-300 font-mono uppercase tracking-widest flex items-center gap-1">
                  <Target className="w-4 h-4 animate-spin text-zinc-300" style={{ animationDuration: '8s' }} />
                  COGNITIVE HEALTH VECTOR SPEEDOMETER (RADAR)
                </h4>
                <p className="text-[9.5px] font-mono text-slate-500 max-w-sm mt-1">Multi-axis system security and maintainability assessment benchmarks.</p>
              </div>

              {/* Pulsing visual representation SVG */}
              <div className="relative w-48 h-48 my-6 flex items-center justify-center">
                <motion.div 
                  className="absolute w-48 h-48 rounded-full border border-white/10"
                  animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.7, 0.3] }}
                  transition={{ repeat: Infinity, duration: 4.0, ease: 'easeOut' }}
                />
                <motion.div 
                  className="absolute w-36 h-36 rounded-full border border-white/10"
                  animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.8, 0.4] }}
                  transition={{ repeat: Infinity, duration: 4.0, ease: 'easeOut', delay: 0.5 }}
                />
                
                {/* SVG radar graph poly lines */}
                <svg className="absolute w-44 h-44 fill-indigo-500/25 stroke-indigo-400 stroke-2 overflow-visible">
                  {/* Polygon markers */}
                  <polygon points="88,20 145,55 130,135 46,135 31,55" />
                  
                  {/* Dots at vertices */}
                  <circle cx="88" cy="20" r="3" className="fill-indigo-400" />
                  <circle cx="145" cy="55" r="3" className="fill-indigo-400" />
                  <circle cx="130" cy="135" r="3" className="fill-indigo-400" />
                  <circle cx="46" cy="135" r="3" className="fill-indigo-400" />
                  <circle cx="31" cy="55" r="3" className="fill-indigo-400" />
                </svg>

                <div className="absolute text-[10.5px] font-mono font-black text-slate-200">85.4%</div>
              </div>

              <span className="text-[9px] font-mono text-slate-550 block">SYSTEM BENCHMARKS: OPTIMAL HEALTH HYGIENE STANDARDS</span>
            </div>

            {/* Customizer Slider list right */}
            <div className="lg:col-span-6 bg-[#0c0e14]/90 border border-slate-900 rounded-3xl p-5 md:p-6 space-y-4 font-mono text-xs">
              <h4 className="text-xs font-black text-slate-350 uppercase tracking-widest">
                ⚙️ Live Vector parameters adjust settings
              </h4>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-400">Security OWASP score:</span>
                    <span className="text-[#e4e4e7] font-bold">{radarSecurity}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={radarSecurity}
                    onChange={(e) => { onTriggerSound(420); setRadarSecurity(parseInt(e.target.value)); }}
                    className="w-full h-1 bg-slate-950 rounded cursor-pointer accent-[#e4e4e7]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-400">Latency & P95 performance:</span>
                    <span className="text-sky-450 text-zinc-300 font-bold">{radarPerformance}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={radarPerformance}
                    onChange={(e) => { onTriggerSound(470); setRadarPerformance(parseInt(e.target.value)); }}
                    className="w-full h-1 bg-slate-950 rounded cursor-pointer accent-sky-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-400">Maintainability LOC splits:</span>
                    <span className="text-zinc-300 font-bold">{radarMaintainability}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={radarMaintainability}
                    onChange={(e) => { onTriggerSound(520); setRadarMaintainability(parseInt(e.target.value)); }}
                    className="w-full h-1 bg-slate-950 rounded cursor-pointer accent-indigo-400"
                  />
                </div>
              </div>
            </div>

          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
