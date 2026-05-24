import React, { useEffect, useState, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { 
  Network, AlertTriangle, CheckCircle, Database, Cpu, FileCode, Zap, Info, ShieldAlert, Sparkles, RefreshCw
} from 'lucide-react';

interface ModuleNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  size: number;
  type: 'server' | 'handler' | 'scanner' | 'service' | 'ui' | 'component';
  circularRisk: 'none' | 'low' | 'medium' | 'high';
  hazardDescription?: string;
  filesize: string;
  importsCount: number;
  importedByCount: number;
}

interface ModuleLink extends d3.SimulationLinkDatum<ModuleNode> {
  source: string | ModuleNode;
  target: string | ModuleNode;
  isPartOfCircularLoop: boolean;
  type: string;
}

interface D3DependencyGraphProps {
  onTriggerSound: (freq?: number) => void;
  onTriggerNotification?: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export default function D3DependencyGraph({ onTriggerSound, onTriggerNotification }: D3DependencyGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dims, setDims] = useState({ width: 620, height: 350 });
  const [selectedNode, setSelectedNode] = useState<ModuleNode | null>(null);
  const [activeTab, setActiveTab] = useState<'graph' | 'tabular'>('graph');
  const [chargeStrength, setChargeStrength] = useState<number>(-220);

  // Track resizing of container correctly
  useEffect(() => {
    if (!containerRef.current) return;
    const updateDims = () => {
      const w = containerRef.current?.getBoundingClientRect().width || 620;
      setDims({ width: w, height: 350 });
    };
    updateDims();
    const observer = new ResizeObserver(updateDims);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Pre-configured nodes & links depicting actual module dependencies & hypothetical circular risks
  const initialNodes: ModuleNode[] = useMemo(() => [
    { id: 'server.ts', label: 'server.ts', size: 18, type: 'server', circularRisk: 'none', filesize: '4.2 KB', importsCount: 4, importedByCount: 0 },
    { id: 'apiHandler.ts', label: 'apiHandler.ts', size: 24, type: 'handler', circularRisk: 'high', hazardDescription: 'Circular dependencies with geminiService.ts. Subroutine imports can create a lock contention during hot-reloading.', filesize: '17.4 KB', importsCount: 8, importedByCount: 2 },
    { id: 'workspaceScanner.ts', label: 'workspaceScanner.ts', size: 14, type: 'scanner', circularRisk: 'none', filesize: '7.8 KB', importsCount: 2, importedByCount: 3 },
    { id: 'geminiService.ts', label: 'geminiService.ts', size: 19, type: 'service', circularRisk: 'high', hazardDescription: 'Circular references to apiHandler.ts via context response decorators. Prefer decoupling via event registers.', filesize: '12.1 KB', importsCount: 5, importedByCount: 3 },
    { id: 'App.tsx', label: 'App.tsx', size: 32, type: 'ui', circularRisk: 'medium', hazardDescription: 'Large view imports components containing dynamic state hooks. Re-importing layouts triggers structural render loops.', filesize: '304.2 KB', importsCount: 16, importedByCount: 0 },
    { id: 'NexusAndForge.tsx', label: 'NexusAndForge.tsx', size: 15, type: 'component', circularRisk: 'medium', hazardDescription: 'Coupling to App.tsx variables or callbacks without proper event handling parameters.', filesize: '65.4 KB', importsCount: 6, importedByCount: 1 },
    { id: 'D3PerformanceChart.tsx', label: 'D3PerformanceChart.tsx', size: 12, type: 'component', circularRisk: 'none', filesize: '18.9 KB', importsCount: 3, importedByCount: 1 },
    { id: 'ChaosAndSecurity.tsx', label: 'ChaosAndSecurity.tsx', size: 13, type: 'component', circularRisk: 'none', filesize: '11.5 KB', importsCount: 4, importedByCount: 1 }
  ], []);

  const initialLinks: ModuleLink[] = useMemo(() => [
    { source: 'server.ts', target: 'apiHandler.ts', isPartOfCircularLoop: false, type: 'imports' },
    { source: 'apiHandler.ts', target: 'workspaceScanner.ts', isPartOfCircularLoop: false, type: 'imports' },
    { source: 'apiHandler.ts', target: 'geminiService.ts', isPartOfCircularLoop: true, type: 'circular-loop' },
    { source: 'geminiService.ts', target: 'apiHandler.ts', isPartOfCircularLoop: true, type: 'circular-loop' },
    { source: 'App.tsx', target: 'NexusAndForge.tsx', isPartOfCircularLoop: false, type: 'imports' },
    { source: 'App.tsx', target: 'D3PerformanceChart.tsx', isPartOfCircularLoop: false, type: 'imports' },
    { source: 'App.tsx', target: 'ChaosAndSecurity.tsx', isPartOfCircularLoop: false, type: 'imports' },
    { source: 'NexusAndForge.tsx', target: 'App.tsx', isPartOfCircularLoop: true, type: 'circular-loop' },
    { source: 'geminiService.ts', target: 'workspaceScanner.ts', isPartOfCircularLoop: false, type: 'imports' },
    { source: 'apiHandler.ts', target: 'workspaceScanner.ts', isPartOfCircularLoop: false, type: 'imports' }
  ], []);

  // Set-up d3 Simulation
  const [nodes, setNodes] = useState<ModuleNode[]>([]);
  const [links, setLinks] = useState<ModuleLink[]>([]);

  useEffect(() => {
    // Clone nodes and links to safely inject position references inside D3
    const d3Nodes: ModuleNode[] = initialNodes.map(n => ({ ...n }));
    const d3Links: ModuleLink[] = initialLinks.map(l => {
      // Find matching cloned node instances
      const srcNode = d3Nodes.find(n => n.id === (typeof l.source === 'string' ? l.source : l.source.id));
      const tgtNode = d3Nodes.find(n => n.id === (typeof l.target === 'string' ? l.target : l.target.id));
      return {
        ...l,
        source: srcNode || l.source,
        target: tgtNode || l.target
      };
    });

    const w = dims.width;
    const h = dims.height;

    // Simulation Setup
    const simulation = d3.forceSimulation<ModuleNode>(d3Nodes)
      .force('link', d3.forceLink<ModuleNode, ModuleLink>(d3Links)
        .id(d => d.id)
        .distance(80)
      )
      .force('charge', d3.forceManyBody().strength(chargeStrength))
      .force('center', d3.forceCenter(w / 2, h / 2))
      .force('collision', d3.forceCollide<ModuleNode>().radius((d) => d.size + 15))
      .stop();

    // Statically simulate 100 iterations ahead of time for initial placement
    for (let i = 0; i < 120; ++i) simulation.tick();

    setNodes(d3Nodes);
    setLinks(d3Links);

    return () => {
      simulation.stop();
    };
  }, [initialNodes, initialLinks, dims.width, dims.height, chargeStrength]);

  const handleSelectNode = (node: ModuleNode) => {
    onTriggerSound(1.2);
    setSelectedNode(node);
    if (node.circularRisk === 'high') {
      onTriggerNotification?.(`CRITICAL RISK: Circular cycle detected involving ${node.id}!`, "error");
    } else {
      onTriggerNotification?.(`Inspecting module dependency details: ${node.id}`, "info");
    }
  };

  const forceRebalanceSimulation = () => {
    onTriggerSound(1.3);
    setChargeStrength(prev => prev === -220 ? -380 : -220); // triggers re-tick
    onTriggerNotification?.("Re-evaluating D3 force simulation repulsion vectors.", "info");
  };

  // Node circular risk styling mapping
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return '#ef4444'; // Red
      case 'medium': return '#f59e0b'; // Amber
      case 'low': return '#3b82f6'; // Blue
      default: return '#e4e4e7'; // Cyan / Teal
    }
  };

  const getRiskTextColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'text-red-400 border-red-500/20 bg-red-500/5';
      case 'medium': return 'text-amber-400 border-amber-500/20 bg-amber-500/5';
      case 'low': return 'text-zinc-300 border-white/10 bg-zinc-800';
      default: return 'text-zinc-300 border-white/10 bg-zinc-800';
    }
  };

  return (
    <div id="d3-cognition-dependency-deck" className="bg-[#09090b]/80 border border-slate-800/80 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]"></div>
      
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-slate-850/60 mb-5 gap-4 relative z-10">
        <div>
          <span className="text-[9px] font-black uppercase tracking-widest text-[#e4e4e7] font-mono block">
            AI COGNITION BLUEPRINT DECK
          </span>
          <h4 className="text-sm font-bold text-slate-200 mt-0.5 font-sans flex items-center gap-1.5">
            <Network className="w-4 h-4 text-[#e4e4e7] animate-pulse" />
            Topological Dependency Ring & Circular Hazards Chart
          </h4>
        </div>

        <div className="flex items-center gap-2">
          {/* Deck Toggles */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-900 p-1 rounded-xl">
            <button
              onClick={() => { onTriggerSound(1.0); setActiveTab('graph'); }}
              className={`px-3 py-1.5 text-[10px] font-mono font-bold rounded-lg transition-all ${
                activeTab === 'graph' 
                  ? 'bg-zinc-800 border border-white/10 text-zinc-300 font-extrabold' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              VISUAL GRAPH
            </button>
            <button
              onClick={() => { onTriggerSound(1.0); setActiveTab('tabular'); }}
              className={`px-3 py-1.5 text-[10px] font-mono font-bold rounded-lg transition-all ${
                activeTab === 'tabular' 
                  ? 'bg-zinc-800 border border-white/10 text-zinc-300 font-extrabold' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              RISK AUDIT LEDGER
            </button>
          </div>

          <button
            onClick={forceRebalanceSimulation}
            className="p-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:white rounded-xl transition cursor-pointer flex items-center gap-1 text-[10px] font-mono font-bold uppercase shrink-0"
            title="Recalculate dynamic nodes repel"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#e4e4e7]" />
            RE-LAYOUT
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start relative z-10">
        
        {/* GRAPH OR TABLE DISPLAY COLUMNS */}
        <div className="lg:col-span-8 bg-[#07080d]/90 rounded-2.5xl border border-slate-850/50 p-2 overflow-hidden min-h-[350px]">
          {activeTab === 'graph' ? (
            <div ref={containerRef} className="w-full h-full relative">
              <svg 
                ref={svgRef}
                viewBox={`0 0 ${dims.width} ${dims.height}`}
                className="w-full h-full text-slate-300"
              >
                <defs>
                  {/* Arrow markers for directed graphs */}
                  <marker
                    id="arrow"
                    viewBox="0 -5 10 10"
                    refX="25"
                    refY="0"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto"
                  >
                    <path d="M0,-3L10,0L0,3" fill="#334155" />
                  </marker>
                  <marker
                    id="arrow-risk"
                    viewBox="0 -5 10 10"
                    refX="25"
                    refY="0"
                    markerWidth="8"
                    markerHeight="8"
                    orient="auto"
                  >
                    <path d="M0,-3L10,0L0,3" fill="#ef4444" />
                  </marker>
                  <filter id="neon-node-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3.5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* GRAPH BACKGROUND GRID WATERMARK */}
                <g opacity="0.1">
                  <circle cx={dims.width / 2} cy={dims.height / 2} r="140" fill="none" stroke="#2563eb" strokeDasharray="3,6" strokeWidth="1" />
                  <circle cx={dims.width / 2} cy={dims.height / 2} r="60" fill="none" stroke="#2563eb" strokeDasharray="2,4" strokeWidth="1" />
                </g>

                {/* RENDER RELATIONSHIP LINKS */}
                <g>
                  {links.map((link, idx) => {
                    const sourceNode = typeof link.source === 'object' ? (link.source as ModuleNode) : null;
                    const targetNode = typeof link.target === 'object' ? (link.target as ModuleNode) : null;
                    if (!sourceNode || !targetNode) return null;

                    const isCircular = link.isPartOfCircularLoop;
                    return (
                      <line
                        key={`link-${idx}`}
                        x1={sourceNode.x || 0}
                        y1={sourceNode.y || 0}
                        x2={targetNode.x || 0}
                        y2={targetNode.y || 0}
                        stroke={isCircular ? '#f87171' : '#334155'}
                        strokeWidth={isCircular ? "2" : "1.25"}
                        strokeOpacity="0.75"
                        strokeDasharray={isCircular ? "4,3" : "none"}
                        markerEnd={`url(#${isCircular ? 'arrow-risk' : 'arrow'})`}
                        className={isCircular ? "animate-pulse" : ""}
                      />
                    );
                  })}
                </g>

                {/* RENDER VERTEX MODULE NODES */}
                <g>
                  {nodes.map((node, idx) => {
                    const isSelected = selectedNode?.id === node.id;
                    const nodeColor = getRiskColor(node.circularRisk);
                    const fileGlowFilter = node.circularRisk === 'high' ? 'url(#neon-node-glow)' : undefined;

                    return (
                      <g 
                        key={node.id} 
                        transform={`translate(${node.x || 0}, ${node.y || 0})`}
                        onClick={(e) => { e.stopPropagation(); handleSelectNode(node); }}
                        className="cursor-pointer group select-none"
                      >
                        {/* Outer Glow Halo for high hazards */}
                        {node.circularRisk === 'high' && (
                          <circle
                            r={node.size + 8}
                            fill="none"
                            stroke="#ef4444"
                            strokeWidth="1.5"
                            strokeOpacity="0.25"
                            className="animate-ping"
                            style={{ animationDuration: '3s' }}
                          />
                        )}

                        <circle
                          r={isSelected ? node.size + 4 : node.size}
                          fill="#0d111b"
                          stroke={nodeColor}
                          strokeWidth={isSelected ? "3.5" : "1.8"}
                          style={{ filter: fileGlowFilter }}
                          className="transition-all duration-150 shadow"
                        />

                        {/* Node Label Indicator Text */}
                        <text
                          y={-node.size - 6}
                          textAnchor="middle"
                          fill={isSelected ? '#fff' : '#94a3b8'}
                          className={`text-[9px] font-mono leading-none transition-all ${isSelected ? 'font-black' : 'font-semibold group-hover:fill-slate-100'}`}
                        >
                          {node.label}
                        </text>

                        {/* Symbolic icon depending on type */}
                        <text
                          y="3"
                          textAnchor="middle"
                          fill={nodeColor}
                          className="text-[9.5px] font-bold font-mono"
                        >
                          {node.type === 'ui' ? 'UI' : node.type === 'server' ? 'SV' : node.type === 'component' ? 'CP' : 'MD'}
                        </text>
                      </g>
                    );
                  })}
                </g>
              </svg>
              <div className="absolute bottom-3 left-3 bg-black/70 px-2 py-1 border border-slate-805/50 rounded text-[9.5px] font-mono text-slate-500">
                🔴 RED LOOP: Circular import threat cycle | CP: Component,UI: User interface,SV: Server,MD: Code module
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-2 max-h-[330px] overflow-y-auto">
              {initialNodes.map(node => {
                const colors = getRiskTextColor(node.circularRisk);
                return (
                  <div 
                    key={node.id}
                    onClick={() => handleSelectNode(node)}
                    className="flex items-center justify-between p-2.5 bg-slate-950/60 border border-slate-900 rounded-xl hover:border-slate-800 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileCode className={`w-4 h-4 shrink-0 ${node.circularRisk === 'high' ? 'text-red-400' : 'text-slate-400'}`} />
                      <div className="truncate">
                        <span className="block font-sans font-bold text-slate-200 text-xs truncate">{node.id}</span>
                        <span className="block font-mono text-[9px] text-slate-500">{node.type.toUpperCase()} • Size: {node.filesize}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right text-[10px] text-slate-500 font-mono">
                        <span>In: {node.importedByCount} | Out: {node.importsCount}</span>
                      </div>
                      <span className={`text-[8.5px] font-mono font-bold leading-none px-2 py-1 rounded border uppercase ${colors}`}>
                        {node.circularRisk === 'none' ? 'SAFE' : `${node.circularRisk.toUpperCase()} Hazard`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* DETAILS INSPECTOR COLUMN PANEL */}
        <div className="lg:col-span-4 bg-slate-950 border border-slate-900 rounded-2.5xl p-5 min-h-[350px] flex flex-col justify-between">
          <div>
            <div className="border-b border-white/5 pb-2.5 mb-4">
              <span className="text-[10px] font-mono uppercase text-slate-500 block font-bold">Inspection Node</span>
              <h5 className="text-xs font-bold text-white font-mono flex items-center gap-1.5 mt-0.5">
                <Info className="w-3.5 h-3.5 text-[#e4e4e7]" />
                Module Attributes
              </h5>
            </div>

            {selectedNode ? (
              <div className="space-y-4 animate-fade-in select-text">
                <div>
                  <h4 className="text-sm font-black font-sans leading-none text-white break-all">
                    {selectedNode.id}
                  </h4>
                  <span className="text-[9.5px] font-mono text-slate-550 inline-block bg-slate-900/60 border border-slate-800 px-1.5 py-0.5 rounded mt-1.5">
                    TYPE: {selectedNode.type.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-[#090b11] p-3 border border-slate-900/60 rounded-2xl text-[10.5px] font-mono text-slate-400">
                  <div>
                    <span className="text-slate-500 block text-[9px] font-bold">FILE SIZE</span>
                    <strong className="text-slate-200 text-xs mt-0.5 block">{selectedNode.filesize}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] font-bold">RISK CATEGORY</span>
                    <strong className={`block text-xs mt-0.5 uppercase ${
                      selectedNode.circularRisk === 'high' ? 'text-red-400 font-black' : selectedNode.circularRisk === 'medium' ? 'text-amber-400' : 'text-slate-205'
                    }`}>
                      {selectedNode.circularRisk}
                    </strong>
                  </div>
                  <div className="mt-1">
                    <span className="text-slate-500 block text-[9px] font-bold">IMPORTS (OUT)</span>
                    <strong className="text-[#e4e4e7] font-extrabold block text-xs mt-0.5">{selectedNode.importsCount} nodes</strong>
                  </div>
                  <div className="mt-1">
                    <span className="text-slate-500 block text-[9px] font-bold">IMPORTED BY (IN)</span>
                    <strong className="text-zinc-300 font-extrabold block text-xs mt-0.5">{selectedNode.importedByCount} roots</strong>
                  </div>
                </div>

                {selectedNode.hazardDescription && (
                  <div className="bg-red-500/5 border border-red-500/15 p-3 rounded-xl">
                    <div className="text-[9px] font-mono uppercase font-black text-red-400 flex items-center gap-1 mb-1 leading-none">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      Circular Link Impact:
                    </div>
                    <p className="text-[10px] font-sans font-medium text-slate-400 leading-normal">
                      {selectedNode.hazardDescription}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-550 space-y-2 select-none">
                <Network className="w-10 h-10 text-slate-700 mx-auto stroke-1 animate-pulse" />
                <p className="text-[11px] font-mono text-slate-500 max-w-xs mx-auto">
                  Click any module node inside the force-directed graph to fetch circular risk assessments, coupling ratios, and layout specifications.
                </p>
              </div>
            )}
          </div>

          <div className="p-3.5 bg-[#090b11]/80 rounded-2xl border border-slate-900 text-[10px] font-mono text-slate-500 flex items-start gap-2 relative overflow-hidden select-text">
            <Sparkles className="w-4 h-4 text-[#e4e4e7] shrink-0 mt-0.5" />
            <div>
              <span className="text-slate-400 font-black block text-[9.5px]">AUTOMATED REFACTOR HELPER</span>
              Resolving circular paths isolates dependencies, accelerating build speed by up to 45% in parallel pipelines.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
