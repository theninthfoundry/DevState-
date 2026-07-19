import React, { useEffect, useState, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { 
  Play, Pause, RefreshCw, Cpu, Database, Sparkles, TrendingUp, BarChart3, AlertOctagon, RefreshCcw
} from 'lucide-react';
import { LineChart, Line, YAxis, ResponsiveContainer } from 'recharts';

interface MetricData {
  id: number;
  timestamp: Date;
  cpu: number;      // %
  memory: number;   // MB
  queueSize: number; // Pending AST chunks
}

interface WorkerState {
  id: number;
  name: string;
  status: 'ACTIVE' | 'IDLE' | 'THROTTLED';
  cpu: number;
  memory: number;
  processedCount: number;
}

interface D3PerformanceChartProps {
  onTriggerSound: (p: number) => void;
  onTriggerNotification?: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export default function D3PerformanceChart({ onTriggerSound, onTriggerNotification }: D3PerformanceChartProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [intensity, setIntensity] = useState<'LOW' | 'NORMAL' | 'HIGH' | 'MAX'>('NORMAL');
  const [activeMetricMode, setActiveMetricMode] = useState<'BOTH' | 'CPU' | 'MEMORY'>('BOTH');
  const [selectedPoint, setSelectedPoint] = useState<MetricData | null>(null);
  
  // Custom Line Path Toggles
  const [showCpu, setShowCpu] = useState(true);
  const [showMemory, setShowMemory] = useState(true);

  // Zoom transform state
  const [zoomTransform, setZoomTransform] = useState<d3.ZoomTransform>(d3.zoomIdentity);
  const svgRef = useRef<SVGSVGElement>(null);

  // Real-time mini chart metrics for active workers
  const [workerMiniHistory, setWorkerMiniHistory] = useState<{ time: number, avgMemory: number }[]>([]);

  // Real-time metrics history
  const [metrics, setMetrics] = useState<MetricData[]>(() => {
    const baseTime = Date.now();
    return Array.from({ length: 25 }, (_, i) => {
      const idx = i + 1;
      const t = new Date(baseTime - (25 - idx) * 2000);
      return {
        id: idx,
        timestamp: t,
        cpu: Math.round(25 + Math.sin(idx * 0.4) * 15 + Math.random() * 8),
        memory: Math.round(180 + Math.cos(idx * 0.3) * 30 + Math.random() * 12),
        queueSize: Math.round(Math.max(0, 4 + Math.sin(idx * 0.5) * 4 + (Math.random() > 0.7 ? 2 : -1)))
      };
    });
  });

  // Simulated separate worker processes
  const [workers, setWorkers] = useState<WorkerState[]>([
    { id: 1, name: "AST-Lexer-A", status: "ACTIVE", cpu: 45, memory: 198, processedCount: 1254 },
    { id: 2, name: "Scope-Parser-B", status: "ACTIVE", cpu: 32, memory: 184, processedCount: 981 },
    { id: 3, name: "Type-Resolver-C", status: "IDLE", cpu: 4, memory: 64, processedCount: 1542 },
    { id: 4, name: "Optimizer-D", status: "THROTTLED", cpu: 12, memory: 92, processedCount: 412 }
  ]);

  // Dimension tracking for responsive scaling
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ width: 620, height: 260 });

  useEffect(() => {
    if (!containerRef.current) return;
    const updateDims = () => {
      const w = containerRef.current?.getBoundingClientRect().width || 620;
      setDims({ width: w, height: 260 });
    };

    updateDims();
    const observer = new ResizeObserver(updateDims);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // SetInterval simulation
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      let cpuMultiplier = 1.0;
      let memoryBase = 180;
      if (intensity === 'LOW') { cpuMultiplier = 0.5; memoryBase = 120; }
      else if (intensity === 'HIGH') { cpuMultiplier = 1.4; memoryBase = 240; }
      else if (intensity === 'MAX') { cpuMultiplier = 1.9; memoryBase = 320; }

      const nextCpu = Math.min(100, Math.round((20 + Math.random() * 30) * cpuMultiplier));
      const nextMemory = Math.min(512, Math.round(memoryBase + Math.random() * 65 + Math.sin(Date.now() / 10000) * 15));
      const nextQueue = Math.max(0, Math.round(Math.random() * 8 + (intensity === 'MAX' ? 5 : 0)));

      // Update historical metrics (sliding window of 25)
      setMetrics(prev => {
        const updated = [...prev];
        const nextId = updated.length > 0 ? updated[updated.length - 1].id + 1 : 1;
        updated.push({
          id: nextId,
          timestamp: new Date(),
          cpu: nextCpu,
          memory: nextMemory,
          queueSize: nextQueue
        });
        if (updated.length > 25) {
          updated.shift();
        }
        return updated;
      });

      // We will compute active workers memory here first
      let avgMem = 0;

      // Update worker processes details randomly
      setWorkers(prev => {
        const updatedWorkers = prev.map(w => {
          let status = w.status;
          if (Math.random() > 0.8) {
            const statuses: ('ACTIVE' | 'IDLE' | 'THROTTLED')[] = ['ACTIVE', 'IDLE', 'THROTTLED'];
            status = statuses[Math.floor(Math.random() * statuses.length)];
          }
          
          let cpuVal = 0;
          let memVal = 32;
          if (status === 'ACTIVE') {
            cpuVal = Math.round((28 + Math.random() * 25) * cpuMultiplier);
            memVal = Math.round(140 + Math.random() * 50);
          } else if (status === 'THROTTLED') {
            cpuVal = Math.round((5 + Math.random() * 10));
            memVal = Math.round(60 + Math.random() * 20);
          } else {
            cpuVal = Math.round(1 + Math.random() * 3);
            memVal = Math.round(40 + Math.random() * 10);
          }

          return {
            ...w,
            status,
            cpu: Math.min(100, cpuVal),
            memory: Math.min(512, memVal),
            processedCount: w.processedCount + (status === 'ACTIVE' ? Math.round(Math.random() * 3) : 0)
          };
        });
        
        const activeWorkers = updatedWorkers.filter(w => w.status === 'ACTIVE');
        avgMem = activeWorkers.length > 0 
          ? activeWorkers.reduce((acc, curr) => acc + curr.memory, 0) / activeWorkers.length 
          : 0;
        
        return updatedWorkers;
      });
      
      // Track mini history for recharts active workers memory
      setWorkerMiniHistory(prevHist => {
        const newHist = [...prevHist, { time: Date.now(), avgMemory: avgMem }];
        if (newHist.length > 15) newHist.shift(); // Keep last 15 points
        return newHist;
      });

    }, 2000);

    return () => clearInterval(interval);
  }, [isPlaying, intensity]);

  // Check if threshold exceeded (memory > 400MB)
  const isThresholdExceeded = useMemo(() => {
    return metrics.some(m => m.memory > 400);
  }, [metrics]);

  // Alert trigger once when memory crosses 400MB
  const lastMetricMemory = metrics[metrics.length - 1]?.memory;
  const wasExceededRef = useRef(false);

  useEffect(() => {
    if (lastMetricMemory > 400) {
      if (!wasExceededRef.current) {
        onTriggerNotification?.("WARNING: Worker heap memory has exceeded the critical 400MB threshold! Auto-throttle enabled.", "error");
        onTriggerSound(1.5);
        wasExceededRef.current = true;
      }
    } else {
      wasExceededRef.current = false;
    }
  }, [lastMetricMemory, onTriggerNotification, onTriggerSound]);

  // Set-up d3 zoom listeners on the SVG element
  useEffect(() => {
    if (!svgRef.current) return;
    const svgEl = d3.select(svgRef.current);

    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 10])
      .on('zoom', (event) => {
        setZoomTransform(event.transform);
      });

    svgEl.call(zoomBehavior);

    return () => {
      svgEl.on('.zoom', null);
    };
  }, [dims.width, dims.height]);

  // SVG Render metrics with D3 scale calculations
  const chartProps = useMemo(() => {
    const margin = { top: 20, right: 40, bottom: 35, left: 45 };
    const chartWidth = Math.max(100, dims.width - margin.left - margin.right);
    const chartHeight = Math.max(100, dims.height - margin.top - margin.bottom);

    // X scale time
    const xDomain = d3.extent(metrics, d => d.timestamp) as [Date, Date];
    let xScale = d3.scaleTime()
      .domain(xDomain)
      .range([0, chartWidth]);

    // Rescale X according to active zoomTransform
    if (zoomTransform && zoomTransform !== d3.zoomIdentity) {
      xScale = zoomTransform.rescaleX(xScale);
    }

    // Y scale CPU (Left Axis)
    const yScaleCpu = d3.scaleLinear()
      .domain([0, 100])
      .range([chartHeight, 0]);

    // Y scale Memory (Right Axis, range 0 to 512)
    const yScaleMem = d3.scaleLinear()
      .domain([0, 512])
      .range([chartHeight, 0]);

    // D3 Line Generator rules
    const cpuLineGen = d3.line<MetricData>()
      .x(d => xScale(d.timestamp))
      .y(d => yScaleCpu(d.cpu))
      .curve(d3.curveMonotoneX);

    const memLineGen = d3.line<MetricData>()
      .x(d => xScale(d.timestamp))
      .y(d => yScaleMem(d.memory))
      .curve(d3.curveMonotoneX);

    // D3 Area generators for glowing gradients
    const cpuAreaGen = d3.area<MetricData>()
      .x(d => xScale(d.timestamp))
      .y0(chartHeight)
      .y1(d => yScaleCpu(d.cpu))
      .curve(d3.curveMonotoneX);

    const memAreaGen = d3.area<MetricData>()
      .x(d => xScale(d.timestamp))
      .y0(chartHeight)
      .y1(d => yScaleMem(d.memory))
      .curve(d3.curveMonotoneX);

    const cpuPath = cpuLineGen(metrics) || '';
    const memPath = memLineGen(metrics) || '';
    const cpuAreaPath = cpuAreaGen(metrics) || '';
    const memAreaPath = memAreaGen(metrics) || '';

    // Axis Helper Ticks
    const xTicks = xScale.ticks(5);
    const yTicksCpu = yScaleCpu.ticks(5);
    const yTicksMem = yScaleMem.ticks(5);

    return {
      margin,
      chartWidth,
      chartHeight,
      xScale,
      yScaleCpu,
      yScaleMem,
      cpuPath,
      memPath,
      cpuAreaPath,
      memAreaPath,
      xTicks,
      yTicksCpu,
      yTicksMem,
    };
  }, [metrics, dims, zoomTransform]);

  const handleManualMetricsTick = () => {
    onTriggerSound(1.2);
    setMetrics(prev => {
      const updated = [...prev];
      const nextId = updated.length > 0 ? updated[updated.length - 1].id + 1 : 1;
      updated.push({
        id: nextId,
        timestamp: new Date(),
        cpu: Math.round(15 + Math.random() * 65),
        memory: Math.round(135 + Math.random() * 290),
        queueSize: Math.round(Math.random() * 4)
      });
      if (updated.length > 25) updated.shift();
      return updated;
    });
  };

  const exportCSV = () => {
    onTriggerSound(1.1);
    const headers = "ID,Timestamp,CPU (%),Memory (MB),Queue Size\n";
    const rows = metrics.map(m => 
      `${m.id},"${m.timestamp.toISOString()}",${m.cpu},${m.memory},${m.queueSize}`
    ).join("\n");
    
    try {
      const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `ast_worker_metrics_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      onTriggerNotification?.("CSV Export successful! Saved AST parser performance history log.", "success");
    } catch (err) {
      onTriggerNotification?.("Failed to generate CSV export file.", "error");
    }
  };

  const handleResetZoom = () => {
    onTriggerSound(1.0);
    if (svgRef.current) {
      d3.select(svgRef.current)
        .transition()
        .duration(500)
        .call(d3.zoom<SVGSVGElement, unknown>().transform, d3.zoomIdentity);
    }
    setZoomTransform(d3.zoomIdentity);
    onTriggerNotification?.("View zoom scale reset to default index.", "info");
  };

  // Determine line memory color
  const memoryColor = isThresholdExceeded ? '#ef4444' : '#d4d4d8';

  return (
    <div id="d3-worker-metrics" className="bg-[#09090b]/75 border border-slate-800/80 rounded-3xl p-6 shadow-sm select-none relative overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-grid-pattern opacity-5"></div>
      
      <div className="flex flex-col xl:flex-row xl:items-center justify-between pb-4 border-b border-slate-850/60 mb-5 gap-4 relative z-10">
        <div>
          <span className="text-[9.5px] font-black uppercase tracking-widest text-[#e4e4e7] font-mono block">
            D3 METRICS TELEMETRY BRIDGE
          </span>
          <h4 className="text-sm font-bold text-slate-205 mt-0.5 font-sans flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-[#e4e4e7] animate-pulse" />
            Parallel AST-Parsing Worker Swarm Threads
          </h4>
        </div>

        {/* INTERACTIVE TOGGLE LABELS */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Header Toggle CPU Label */}
          <button
            type="button"
            onClick={() => { onTriggerSound(1.1); setShowCpu(!showCpu); }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-mono transition-all ${
              showCpu 
                ? 'bg-[#e4e4e7]/10 border-[#e4e4e7]/30 text-[#e4e4e7] font-extrabold shadow-sm' 
                : 'bg-slate-950/40 border-slate-900 text-slate-500'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#e4e4e7]" />
            CPU LOAD: {showCpu ? 'ACTIVE' : 'MUTED'}
          </button>

          {/* Header Toggle Memory Label */}
          <button
            type="button"
            onClick={() => { onTriggerSound(1.1); setShowMemory(!showMemory); }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-mono transition-all ${
              showMemory 
                ? `${isThresholdExceeded ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-zinc-800 border-white/10 text-zinc-300'} font-extrabold shadow-sm` 
                : 'bg-slate-950/40 border-slate-900 text-slate-500'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isThresholdExceeded ? 'bg-red-500 animate-pulse' : 'bg-violet-450'}`} />
            RAM HEAP: {showMemory ? 'ACTIVE' : 'MUTED'}
          </button>

          <div className="h-6 w-[1px] bg-slate-800 mx-1"></div>

          {/* EXPORT CSV BUTTON */}
          <button
            onClick={exportCSV}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-850 text-slate-300 font-mono text-xs font-bold border border-slate-800 rounded-xl transition duration-150 active:scale-95"
            title="Download timeseries telemetry record"
          >
            <Database className="w-3.5 h-3.5 text-[#e4e4e7]" />
            EXPORT CSV
          </button>

          {/* Metrics Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-900 p-1 rounded-xl">
            {(['BOTH', 'CPU', 'MEMORY'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => { onTriggerSound(1.05); setActiveMetricMode(mode); }}
                className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg transition-all ${
                  activeMetricMode === mode 
                    ? 'bg-zinc-800 border border-white/10 text-zinc-300 font-extrabold' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Intensity Selector */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-900 p-1 rounded-xl">
            {(['LOW', 'NORMAL', 'HIGH', 'MAX'] as const).map(rate => (
              <button
                key={rate}
                onClick={() => { onTriggerSound(1.15); setIntensity(rate); }}
                className={`px-2 py-1 text-[9px] font-black rounded-lg transition-all ${
                  intensity === rate 
                    ? 'bg-[#e4e4e7]/10 border border-[#e4e4e7]/20 text-[#e4e4e7] font-extrabold' 
                    : 'text-slate-500 hover:text-slate-350'
                }`}
              >
                {rate}
              </button>
            ))}
          </div>

          {/* Flow Toggles */}
          <button
            onClick={() => { onTriggerSound(1.0); setIsPlaying(!isPlaying); }}
            className={`p-1.5 border rounded-xl hover:scale-105 active:scale-95 transition ${
              isPlaying 
                ? 'bg-[#d4d4d8]/10 border-[#d4d4d8]/25 text-[#d4d4d8]' 
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
            title={isPlaying ? "Pause Stream" : "Play Stream"}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          
          <button
            onClick={handleManualMetricsTick}
            className="p-1.5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-xl hover:scale-105 active:scale-95 transition"
            title="Force parsing tick"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* CORE WORKER SWARM GRID STATUSES */}
      <div className="flex flex-col gap-3 mb-5 relative z-10">
        <div className="bg-[#090b11] border border-slate-900 rounded-2xl p-3 shadow-inner flex items-center justify-between">
          <div className="text-[10px] font-mono text-slate-400 font-bold uppercase">
            Active Worker Avg Memory Heap
          </div>
          <div className="w-48 h-8">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={workerMiniHistory}>
                <YAxis domain={['auto', 'auto']} hide />
                <Line 
                  type="monotone" 
                  dataKey="avgMemory" 
                  stroke="#a78bfa" 
                  strokeWidth={2} 
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {workers.map(w => {
            const statusBgColor = w.status === 'ACTIVE' 
              ? 'bg-zinc-800 border-white/10 text-zinc-300' 
              : w.status === 'THROTTLED'
              ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
              : 'bg-slate-900 border-slate-850 text-slate-500';

            return (
              <div key={w.id} className="bg-[#090b11] border border-slate-900 p-3 rounded-2xl flex flex-col justify-between shadow-inner">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] font-mono text-slate-400 truncate font-semibold">{w.name}</span>
                  <span className={`text-[7px] font-bold font-mono px-1 py-0.5 rounded uppercase leading-none ${statusBgColor}`}>
                    {w.status}
                  </span>
                </div>
                <div className="mt-2.5 flex items-end justify-between select-none">
                  <div>
                    <span className="text-[11.5px] font-bold font-mono text-slate-105 tracking-tight block">
                      {w.cpu}% <span className="text-[8px] text-slate-500">CPU</span>
                    </span>
                    <span className="text-[11.5px] font-bold font-mono text-slate-105 tracking-tight block mt-0.5">
                      {w.memory}M <span className="text-[8px] text-slate-500">RAM</span>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] font-mono text-slate-500 block uppercase font-bold">Processed</span>
                    <span className="text-[9.5px] font-mono font-bold text-slate-350">{w.processedCount}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* THE D3 CHART SVG CONTAINER */}
      <div ref={containerRef} className="relative bg-[#07080d]/80 rounded-2.5xl border border-slate-850/50 p-1 overflow-hidden h-72">
        <svg 
          ref={svgRef}
          className="w-full h-full cursor-grab active:cursor-grabbing" 
          viewBox={`0 0 ${dims.width} ${dims.height}`}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const mouseX = e.clientX - rect.left - chartProps.margin.left;
            
            // Invert scale to get Date
            const mouseTime = chartProps.xScale.invert(mouseX);
            // Find closest metric point in history
            let closest: MetricData | null = null;
            let minDist = Infinity;
            metrics.forEach(m => {
              const d = Math.abs(m.timestamp.getTime() - mouseTime.getTime());
              if (d < minDist) {
                minDist = d;
                closest = m;
              }
            });
            if (closest && mouseX >= 0 && mouseX <= chartProps.chartWidth) {
              setSelectedPoint(closest);
            } else {
              setSelectedPoint(null);
            }
          }}
          onMouseLeave={() => setSelectedPoint(null)}
        >
          {/* DEFINITIONS FOR GRADIENTS AND FILTERS */}
          <defs>
            <linearGradient id="cpu-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e4e4e7" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#e4e4e7" stopOpacity="0.00" />
            </linearGradient>
            <linearGradient id="mem-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={memoryColor} stopOpacity="0.25" />
              <stop offset="100%" stopColor={memoryColor} stopOpacity="0.00" />
            </linearGradient>
            <filter id="d3-glow" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* D3 TRANSPARENT SURFACE ENABLING SYSTEM-WIDE MULTI-AXIS ZOOM DRAGS */}
          <rect 
            width={dims.width} 
            height={dims.height} 
            fill="transparent" 
            pointerEvents="all" 
          />

          {/* CENTRAL CHART PLOT */}
          <g transform={`translate(${chartProps.margin.left}, ${chartProps.margin.top})`}>
            
            {/* HORIZONTAL DASHED D3 GRID LINES */}
            {chartProps.yTicksCpu.map((tickVal, i) => {
              const y = chartProps.yScaleCpu(tickVal);
              return (
                <g key={`grid-${i}`}>
                  <line 
                    x1={0} 
                    y1={y} 
                    x2={chartProps.chartWidth} 
                    y2={y} 
                    stroke="#1e293b" 
                    strokeWidth="1" 
                    strokeDasharray="4,4" 
                    strokeOpacity="0.5"
                  />
                  {/* Axis Grid Tick labels (Left axis CPU %) */}
                  {showCpu && (activeMetricMode === 'BOTH' || activeMetricMode === 'CPU') && (
                    <text
                      x={-10}
                      y={y + 3.5}
                      textAnchor="end"
                      fill="#e4e4e7"
                      fillOpacity="0.8"
                      className="text-[9px] font-mono font-bold leading-none"
                    >
                      {tickVal}%
                    </text>
                  )}
                </g>
              );
            })}

            {/* RIGHT SIDE MEMORY TICK LABELS (Memory MB) */}
            {showMemory && (activeMetricMode === 'BOTH' || activeMetricMode === 'MEMORY') && 
              chartProps.yTicksMem.map((tickVal, i) => {
                const y = chartProps.yScaleMem(tickVal);
                return (
                  <text
                    key={`mem-tick-${i}`}
                    x={chartProps.chartWidth + 10}
                    y={y + 3.5}
                    textAnchor="start"
                    fill={isThresholdExceeded ? "#ef4444" : "#a78bfa"}
                    fillOpacity="0.85"
                    className="text-[9px] font-mono leading-none font-bold"
                  >
                    {tickVal}M
                  </text>
                );
              })
            }

            {/* D3 TIMESERIES HORIZONTAL LABELS (X Axis) */}
            {chartProps.xTicks.map((tickDate, i) => {
              const x = chartProps.xScale(tickDate);
              const formattedTime = tickDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
              return (
                <g key={`x-tick-${i}`} transform={`translate(${x}, 0)`}>
                  <line 
                    x1={0} 
                    y1={chartProps.chartHeight} 
                    x2={0} 
                    y2={chartProps.chartHeight + 6} 
                    stroke="#334155" 
                    strokeWidth="1"
                  />
                  <text
                    x={0}
                    y={chartProps.chartHeight + 18}
                    textAnchor="middle"
                    fill="#64748b"
                    className="text-[8.5px] font-mono font-bold select-none leading-none"
                  >
                    {formattedTime}
                  </text>
                </g>
              );
            })}

            {/* CRITICAL HEAP THRESHOLD LINE AT 400MB */}
            {showMemory && (activeMetricMode === 'BOTH' || activeMetricMode === 'MEMORY') && (
              <g>
                <line
                  x1={0}
                  y1={chartProps.yScaleMem(400)}
                  x2={chartProps.chartWidth}
                  y2={chartProps.yScaleMem(400)}
                  stroke="#ef4444"
                  strokeWidth="1.5"
                  strokeDasharray="5,3"
                  strokeOpacity="0.85"
                  className="animate-pulse"
                />
                <text
                  x={chartProps.chartWidth - 6}
                  y={chartProps.yScaleMem(400) - 6}
                  textAnchor="end"
                  fill="#ef4444"
                  className="text-[8.5px] font-mono font-extrabold select-none bg-black/80 px-1 py-0.5 rounded leading-none"
                >
                  ⚠️ EXCEEDS THRESHOLD: 400MB
                </text>
              </g>
            )}

            {/* D3 AREA PATHS (SUBTLE GLOW BACKGROUNDS) */}
            {showCpu && (activeMetricMode === 'BOTH' || activeMetricMode === 'CPU') && (
              <path 
                d={chartProps.cpuAreaPath}
                fill="url(#cpu-gradient)"
                className="transition-all duration-300 pointer-events-none"
              />
            )}
            
            {showMemory && (activeMetricMode === 'BOTH' || activeMetricMode === 'MEMORY') && (
              <path 
                d={chartProps.memAreaPath}
                fill="url(#mem-gradient)"
                className="transition-all duration-300 pointer-events-none"
              />
            )}

            {/* D3 MAIN CURVED LINE PATHS */}
            {showCpu && (activeMetricMode === 'BOTH' || activeMetricMode === 'CPU') && (
              <path 
                d={chartProps.cpuPath}
                fill="none"
                stroke="#e4e4e7"
                strokeWidth="2.5"
                filter="url(#d3-glow)"
                className="transition-all duration-300 select-none pointer-events-none"
              />
            )}

            {showMemory && (activeMetricMode === 'BOTH' || activeMetricMode === 'MEMORY') && (
              <path 
                d={chartProps.memPath}
                fill="none"
                stroke={memoryColor}
                strokeWidth="2.5"
                filter="url(#d3-glow)"
                className="transition-all duration-300 select-none pointer-events-none"
              />
            )}

            {/* HIGHLIGHTED SCAN LINE & HOVER DOTS GUIDES */}
            {selectedPoint && (
              <g>
                {/* Vertical bar pointer line */}
                <line 
                  x1={chartProps.xScale(selectedPoint.timestamp)}
                  y1={0}
                  x2={chartProps.xScale(selectedPoint.timestamp)}
                  y2={chartProps.chartHeight}
                  stroke="#334155"
                  strokeWidth="1.5"
                  strokeDasharray="2,2"
                />

                {/* Left Dot CPU */}
                {showCpu && (activeMetricMode === 'BOTH' || activeMetricMode === 'CPU') && (
                  <circle 
                    cx={chartProps.xScale(selectedPoint.timestamp)}
                    cy={chartProps.yScaleCpu(selectedPoint.cpu)}
                    r="5"
                    fill="#fff"
                    stroke="#e4e4e7"
                    strokeWidth="3.5"
                  />
                )}

                {/* Right Dot Memory */}
                {showMemory && (activeMetricMode === 'BOTH' || activeMetricMode === 'MEMORY') && (
                  <circle 
                    cx={chartProps.xScale(selectedPoint.timestamp)}
                    cy={chartProps.yScaleMem(selectedPoint.memory)}
                    r="5"
                    fill="#fff"
                    stroke={memoryColor}
                    strokeWidth="3.5"
                  />
                )}
              </g>
            )}

          </g>
        </svg>

        {/* FLOATING LEGEND AND TOGGLES INSIDE THE D3 CHART CONTAINER */}
        <div className="absolute bottom-16 right-5 bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-xl px-3 py-1.5 flex items-center gap-4 text-[10px] font-mono z-20 select-none shadow-xl">
          <button 
            type="button"
            onClick={() => { onTriggerSound(1.1); setShowCpu(!showCpu); }}
            className={`flex items-center gap-1.5 transition-all duration-150 ${showCpu ? 'opacity-100 font-extrabold text-[#e4e4e7]' : 'opacity-35 text-slate-500'}`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#e4e4e7] shadow" />
            CPU LOAD
          </button>
          <button 
            type="button"
            onClick={() => { onTriggerSound(1.1); setShowMemory(!showMemory); }}
            className={`flex items-center gap-1.5 transition-all duration-150 ${showMemory ? 'opacity-100 font-extrabold text-zinc-300' : 'opacity-35 text-slate-500'}`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${isThresholdExceeded ? 'bg-red-500 animate-pulse' : 'bg-[#d4d4d8]'} shadow`} />
            HEAP RAM
          </button>
        </div>

        {/* FLOATING RESET ZOOM BUTTON */}
        {zoomTransform !== d3.zoomIdentity && (
          <button
            type="button"
            onClick={handleResetZoom}
            className="absolute bottom-16 left-5 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-200 font-mono text-[9px] font-bold px-2.5 py-1 rounded-xl transition-all z-20 shadow-md animate-pulse"
          >
            🔍 RESET ZOOM SCALE
          </button>
        )}

        {/* D3 DYNAMIC TOOLTIP CARD PANEL */}
        {selectedPoint && (
          <div className="absolute top-4 right-4 bg-slate-950/95 border border-slate-800 p-2 text-[10.5px] rounded-xl font-mono text-slate-350 space-y-1 block shadow-xl pointer-events-none max-w-44 select-none z-20">
            <div className="text-[9.5px] font-semibold text-slate-500 border-b border-slate-900 pb-1">
              Time: {selectedPoint.timestamp.toLocaleTimeString([], { hour12: false })}
            </div>
            {showCpu && (activeMetricMode === 'BOTH' || activeMetricMode === 'CPU') && (
              <div className="flex items-center justify-between gap-1">
                <span className="text-[#e4e4e7] font-bold">Worker CPU:</span>
                <span className="font-extrabold text-slate-105">{selectedPoint.cpu}%</span>
              </div>
            )}
            {showMemory && (activeMetricMode === 'BOTH' || activeMetricMode === 'MEMORY') && (
              <div className="flex items-center justify-between gap-1">
                <span className={`${isThresholdExceeded ? 'text-red-400' : 'text-[#aa8bf5]'} font-bold`}>Heaped Memory:</span>
                <span className={`font-extrabold ${isThresholdExceeded ? 'text-red-400 font-black' : 'text-slate-105'}`}>{selectedPoint.memory}MB</span>
              </div>
            )}
            <div className="flex items-center justify-between gap-1 border-t border-slate-900/50 pt-1 text-[9.5px]">
              <span className="text-slate-500">AST Task Queue:</span>
              <span className="font-bold text-zinc-300">{selectedPoint.queueSize} remaining</span>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER DIAGNOSTICS */}
      <div className="mt-3.5 flex items-center justify-between text-[9.5px] text-slate-500 font-mono font-medium leading-none">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-indigo-505 animate-pulse" />
          Interactive D3 Pan/Zoom Active | Scroll over chart area to explore segment history
        </span>
        <span className="text-right">
          Memory state: <strong className={isThresholdExceeded ? "text-red-400" : "text-zinc-300"}>{isThresholdExceeded ? "CRITICAL (ABOVE 400MB)" : "STEADY (<400MB)"}</strong>
        </span>
      </div>
    </div>
  );
}
