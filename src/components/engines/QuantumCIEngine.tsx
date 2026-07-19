import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FastForward, CheckCircle2, GitPullRequest, Beaker, 
  HelpCircle, RefreshCw, Layers, ShieldCheck, Zap
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { useHUDStore } from '../../store/useHUDStore';
import { useAudioHUD } from '../../hooks/useAudioHUD';

interface ImpactReport {
  modifiedFile: string;
  affectedFiles: string[];
  testsToRun: string[];
  computeSavedPct: number;
}

export const QuantumCIEngine = () => {
  const { playSound } = useAudioHUD();
  const appendLog = useHUDStore(s => s.appendLog);

  // States
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState<string[]>([]);
  const [tests, setTests] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [report, setReport] = useState<ImpactReport | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);
  const [executingIndex, setExecutingIndex] = useState(-1);

  // Load project files and tests
  const fetchFiles = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/ci/files');
      const data = await res.json();
      if (data.success) {
        setFiles(data.files || []);
        setTests(data.tests || []);
        
        // Pick a default non-test file if exists, or select the first TSX/TS file
        const sourceFiles = (data.files || []).filter((f: string) => !f.endsWith('.test.tsx') && !f.endsWith('.test.ts'));
        if (sourceFiles.length > 0) {
          setSelectedFile(sourceFiles[0]);
          fetchImpact(sourceFiles[0]);
        } else if (data.files.length > 0) {
          setSelectedFile(data.files[0]);
          fetchImpact(data.files[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load files for impact analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get dynamic impact report
  const fetchImpact = async (filePath: string) => {
    if (!filePath) return;
    try {
      const res = await fetch('/api/ci/impact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath })
      });
      const data = await res.json();
      if (data.success && data.report) {
        setReport(data.report);
      }
    } catch (err) {
      console.error('Failed to calculate dependency impact:', err);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedFile(val);
    playSound('click');
    fetchImpact(val);
    appendLog({
      source: 'CI Optimizer',
      level: 'info',
      message: `Analyzing blast radius for modified target: ${val}`
    });
  };

  // Simulate execution of tests
  const triggerTestSuiteExecution = () => {
    if (!report || report.testsToRun.length === 0) {
      playSound('error');
      return;
    }
    playSound('success');
    setIsExecuting(true);
    setExecutionLogs([]);
    setExecutingIndex(0);
    appendLog({
      source: 'CI Optimizer',
      level: 'info',
      message: `Spinning up containerized parallel runner for ${report.testsToRun.length} targeted test suites.`
    });
  };

  useEffect(() => {
    if (!isExecuting || !report || executingIndex === -1) return;

    if (executingIndex < report.testsToRun.length) {
      const testFile = report.testsToRun[executingIndex];
      const duration = Math.floor(Math.random() * 800) + 400; // 0.4s to 1.2s

      const timer = setTimeout(() => {
        playSound('success');
        setExecutionLogs(prev => [
          ...prev,
          `PASS  ${testFile} (${(duration / 1000).toFixed(2)}s)`
        ]);
        setExecutingIndex(executingIndex + 1);
      }, duration);

      return () => clearTimeout(timer);
    } else {
      // Completed execution
      const timer = setTimeout(() => {
        setIsExecuting(false);
        setExecutingIndex(-1);
        playSound('success');
        appendLog({
          source: 'CI Optimizer',
          level: 'success',
          message: `Predictive execution pipelines green. Reclaimed compute: ${report.computeSavedPct}%`
        });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isExecuting, executingIndex, report]);

  // Calculate stats based on 1.5 minutes average runtime per bypassed test
  const calculateSavingsTime = (reportObj: ImpactReport | null) => {
    if (!reportObj) return '0m 00s';
    const totalCount = tests.length || 1;
    const bypassedCount = totalCount - reportObj.testsToRun.length;
    if (bypassedCount <= 0) return '0s';
    
    const minutesSaved = bypassedCount * 1.5; // 1.5 min per test
    if (minutesSaved >= 60) {
      const hrs = Math.floor(minutesSaved / 60);
      const mins = Math.round(minutesSaved % 60);
      return `${hrs}h ${mins}m`;
    }
    return `${Math.round(minutesSaved)}m 00s`;
  };

  return (
    <div className="w-full h-full p-8 flex flex-col gap-6 max-w-6xl mx-auto text-slate-100 font-sans z-10 relative">
      <header className="flex justify-between items-end border-b border-white/5 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <FastForward className="text-violet-400 w-8 h-8 animate-pulse" />
            Quantum CI Optimizer
          </h1>
          <p className="text-slate-400 mt-2 font-mono text-xs uppercase tracking-widest">Predictive Test Execution Pipeline</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 justify-end text-emerald-400 font-mono text-xs mb-1">
            <CheckCircle2 className="w-4.5 h-4.5 animate-pulse" /> Pipeline Ready
          </div>
          <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Active Branch: feat/checkout-flow</div>
        </div>
      </header>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-24 gap-4">
          <RefreshCw className="w-8 h-8 text-violet-400 animate-spin" />
          <p className="text-xs text-slate-400 font-mono uppercase tracking-wider">Compiling reverse dependency matrix...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          
          {/* Main Compute Saved Glass Card */}
          <GlassCard glowColor="emerald" className="col-span-1 md:col-span-3 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-emerald-950/10 border-emerald-500/20 p-6 rounded-2xl gap-4">
            <div>
              <div className="text-slate-400 text-[10px] font-mono uppercase tracking-widest mb-1">Enterprise Compute Saved (Active Mutation)</div>
              <div className="text-5xl md:text-6xl font-black text-emerald-400 tracking-tighter">
                {report ? report.computeSavedPct : 100}%
              </div>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-slate-400 text-[10px] font-mono uppercase tracking-widest mb-1">Developer Time Reclaimed</div>
              <div className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                {calculateSavingsTime(report)}
              </div>
            </div>
          </GlassCard>

          {/* Left Column: Targeted Mutation controls */}
          <div className="col-span-1 flex flex-col gap-6">
            <GlassCard className="p-5 flex flex-col gap-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <GitPullRequest className="w-4 h-4 text-violet-400" /> Simulate Code Mutation
              </h3>
              
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Select target file:</label>
                <div className="relative">
                  <select
                    value={selectedFile}
                    onChange={handleFileChange}
                    className="w-full bg-slate-950/90 hover:bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono rounded-lg p-3 outline-none focus:border-violet-500/50 appearance-none cursor-pointer pr-10"
                  >
                    {files.map(f => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                  <div className="absolute top-1/2 right-3 -translate-y-1/2 pointer-events-none text-slate-500 text-[9px] font-black uppercase tracking-widest bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded">
                    List
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 space-y-3 font-mono text-[10px]">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Total System Suites</span>
                  <span className="text-white font-bold">{tests.length} tests</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Blast Radius</span>
                  <span className={`font-bold ${report && report.affectedFiles.length > 5 ? 'text-amber-400 animate-pulse' : 'text-slate-300'}`}>
                    {report ? report.affectedFiles.length : 0} files
                  </span>
                </div>
                <div className="flex justify-between items-center text-violet-400">
                  <span>Impacted Tests required</span>
                  <span className="font-bold text-violet-300">
                    {report ? report.testsToRun.length : 0} tests
                  </span>
                </div>
              </div>
            </GlassCard>

            {/* Blast radius breakdown list */}
            <GlassCard className="p-5 flex flex-col flex-1 min-h-[220px]">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between mb-4">
                <span className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" /> Dependency Blast Radius
                </span>
                <span className="text-[8px] tracking-widest font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-1.5 py-0.5 rounded uppercase">
                  Reverse Traced
                </span>
              </h3>

              <div className="flex-1 overflow-y-auto max-h-[300px] space-y-2 pr-1 custom-scrollbar">
                {report && report.affectedFiles.length > 0 ? (
                  report.affectedFiles.map((file, idx) => {
                    const isTest = file.endsWith('.test.ts') || file.endsWith('.test.tsx') || file.endsWith('.spec.ts') || file.endsWith('.spec.tsx');
                    return (
                      <motion.div
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: Math.min(idx * 0.05, 0.4) }}
                        key={file}
                        className="bg-white/[0.01] border border-white/5 p-2 rounded flex items-center justify-between text-[10px] hover:bg-white/[0.03] transition-colors"
                      >
                        <span className="font-mono text-slate-300 truncate max-w-[200px]" title={file}>
                          {file}
                        </span>
                        <span className={`text-[8px] font-bold uppercase tracking-wider shrink-0 px-1.5 py-0.2 rounded border ${
                          isTest 
                            ? 'bg-amber-500/5 text-amber-400 border-amber-500/20' 
                            : 'bg-indigo-500/5 text-indigo-400 border-indigo-500/20'
                        }`}>
                          {isTest ? 'test suite' : 'module'}
                        </span>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-500 font-mono text-[9px] space-y-2 py-10">
                    <ShieldCheck className="w-6 h-6 text-slate-600" />
                    <p className="uppercase tracking-wider">Zero Blast Radius Affected</p>
                    <p className="text-[8px] text-slate-600 scale-95 lowercase">This file is isolated & has no dependents.</p>
                  </div>
                )}
              </div>
            </GlassCard>
          </div>

          {/* Right Column: Execution View and Smart Queue */}
          <div className="col-span-1 md:col-span-2 flex flex-col gap-6">
            <GlassCard className="p-5 flex flex-col flex-1">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between mb-4">
                <span className="flex items-center gap-2">
                  <Beaker className="w-4 h-4 text-cyan-400" /> Predictive Run Queue
                </span>
                <span className="text-[9px] text-slate-400 font-mono text-right">
                  Bypassed <strong className="text-emerald-400">{tests.length - (report?.testsToRun?.length || 0)}</strong> / {tests.length} tests
                </span>
              </h3>

              {/* Run button */}
              <div className="mb-4">
                <button
                  id="btn-execute-targeted-suite"
                  disabled={isExecuting || !report || report.testsToRun.length === 0}
                  onClick={triggerTestSuiteExecution}
                  className="w-full py-3 px-4 rounded-xl font-bold uppercase tracking-widest text-[11px] font-mono transition-all border border-violet-500/30 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed text-white cursor-pointer bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 hover:shadow-[0_0_24px_rgba(139,92,246,0.35)]"
                >
                  {isExecuting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Executing Pipeline Container...
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
                      Execute Targeted Test Suite
                    </>
                  )}
                </button>
              </div>

              {/* Dynamic list showing queue status */}
              <div className="grid grid-cols-1 gap-2 flex-1 max-h-[220px] overflow-y-auto pr-1 select-none custom-scrollbar">
                {report && report.testsToRun.length > 0 ? (
                  report.testsToRun.map((testFile, i) => {
                    const isPassed = executionLogs.some(log => log.includes(testFile));
                    const isRunningNow = isExecuting && executingIndex === i;
                    
                    return (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        key={testFile} 
                        className={`flex items-center gap-3 p-2.5 border rounded-lg transition-colors font-mono text-[10px] ${
                          isRunningNow 
                            ? 'bg-violet-500/15 border-violet-500/40 text-violet-200' 
                            : isPassed 
                            ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-300/90' 
                            : 'bg-white/[0.01] border-white/5 text-slate-400'
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full shrink-0 ${
                          isRunningNow 
                            ? 'bg-violet-400 animate-ping' 
                            : isPassed 
                            ? 'bg-emerald-400' 
                            : 'bg-slate-600 hover:bg-slate-500'
                        }`} />
                        <span className="flex-1 truncate" title={testFile}>{testFile}</span>
                        <span className={`text-[8px] font-bold uppercase tracking-widest px-1 py-0.2 rounded shrink-0 ${
                          isRunningNow 
                            ? 'text-violet-300' 
                            : isPassed 
                            ? 'text-emerald-400' 
                            : 'text-slate-500'
                        }`}>
                          {isRunningNow ? 'Running' : isPassed ? 'Pass' : 'Pending'}
                        </span>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 font-mono text-[9px] space-y-2 py-12">
                    <ShieldCheck className="w-8 h-8 text-emerald-500 animate-pulse" />
                    <p className="uppercase tracking-widest text-emerald-400 font-bold">100% Pre-compiled Integrity Safe</p>
                    <p className="text-[8px] text-slate-600 scale-95 lowercase">no tests require execution since files are bypassed.</p>
                  </div>
                )}
              </div>
            </GlassCard>

            {/* Simulated Live Console Log Feed to display outputs */}
            <GlassCard className="p-5 flex flex-col min-h-[160px] bg-slate-950/40 border-slate-900">
              <h4 className="text-[10px] text-white font-mono font-bold uppercase tracking-wider mb-2 border-b border-white/5 pb-1.5 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" /> CI Runner Console Stdout
              </h4>
              <div className="bg-black/80 border border-slate-900 rounded-lg p-3 pt-2 font-mono text-[9px] text-slate-300 flex-1 overflow-y-auto max-h-[130px] custom-scrollbar space-y-1">
                {isExecuting && (
                  <div className="text-violet-400 animate-pulse">Running jest --config=jest.config.js {report?.testsToRun?.join(' ')}...</div>
                )}
                {executionLogs.map((log, idx) => (
                  <div key={idx} className="text-emerald-400/90 whitespace-pre">
                    {log}
                  </div>
                ))}
                {!isExecuting && executionLogs.length > 0 && (
                  <div className="text-emerald-400 font-extrabold mt-1 uppercase border-t border-emerald-500/10 pt-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Simulation Completed. Replaced 100% compute cycles successfully.
                  </div>
                )}
                {!isExecuting && executionLogs.length === 0 && (
                  <span className="text-slate-600">Console streams idle. Select targeted mutation code files above inside HUD and trigger pipeline execution.</span>
                )}
              </div>
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
};
