import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { 
  Globe, Database, Cpu, Send, Fingerprint, Share2, 
  Zap, Workflow, Maximize2, ShieldAlert, Sparkles, Info
} from 'lucide-react';
import { InstancedNodes, NeuralNode } from './telemetry/InstancedNodes';

interface SystemNode extends NeuralNode {
  name: string;
  type: 'service' | 'api' | 'component' | 'database' | 'event';
  tech: string;
  status: 'online' | 'warning' | 'degraded';
  description: string;
  load: number;
  instability: number;
  dependencies: string[];
}

const CONST_NODES: SystemNode[] = [
  { id: '1', name: 'Cognitive Runtime', type: 'service', group: 'service', tech: 'Node.js/Bun/Fastify', status: 'online', description: 'Core scanning engine and dynamic AST compiler crawler.', load: 0.35, instability: 0.12, dependencies: ['2', '3', '6', '11'], technicalDebt: 0.8 },
  { id: '2', name: 'Neural UI HUD', type: 'component', group: 'ui', tech: 'React/Three.js/Tailwind', status: 'online', description: 'Immersive cockpit UI layer rendering canvas telemetry and reactive streams.', load: 0.85, instability: 0.28, dependencies: [], technicalDebt: 0.2 },
  { id: '3', name: 'Gemini Agent Orchestrator', type: 'service', group: 'service', tech: 'Gemini 3.5 Flash', status: 'online', description: 'Dynamic prompt chaining and autonomous codebase repair executor.', load: 0.62, instability: 0.45, dependencies: ['11'], technicalDebt: 0.1 },
  { id: '4', name: '/api/github/pulls', type: 'api', group: 'api', tech: 'REST v3 HTTPS', status: 'online', description: 'Git integration handler synchronizing active pull request statuses.', load: 0.18, instability: 0.08, dependencies: ['1'], technicalDebt: 0.5 },
  { id: '5', name: 'Websocket Gateway', type: 'service', group: 'service', tech: 'Socket.io Cluster', status: 'warning', description: 'Multiplexed event delivery bus transmitting active file updates.', load: 0.72, instability: 0.52, dependencies: ['1'], technicalDebt: 0.9 },
  { id: '6', name: 'Prisma SQLite State', type: 'database', group: 'config', tech: 'SQL database', status: 'online', description: 'Persistent storage for user sessions and telemetry histories.', load: 0.24, instability: 0.05, dependencies: [], technicalDebt: 0.3 },
  { id: '7', name: 'Ghost System Detector', type: 'service', group: 'service', tech: 'AST Crawler', status: 'online', description: 'Identifies unreachable routes and orphaned packages.', load: 0.12, instability: 0.15, dependencies: ['1'], technicalDebt: 0.1 },
  { id: '8', name: 'Chaos Simulator API', type: 'api', group: 'api', tech: 'Express Endpoint', status: 'online', description: 'Injects network latency spikes and database lockouts.', load: 0.05, instability: 0.85, dependencies: ['1', '5'], technicalDebt: 0.6 },
  { id: '9', name: 'Developer Flow Watcher', type: 'component', group: 'ui', tech: 'Zustand Store', status: 'online', description: 'Accumulates developer typing speed and keyboard interval focus loops.', load: 0.41, instability: 0.18, dependencies: ['2'], technicalDebt: 0.2 },
  { id: '10', name: 'AI Security Observatory', type: 'service', group: 'service', tech: 'Semantic Scanners', status: 'online', description: 'Examines workspace directories for exposed credentials and unsafe routes.', load: 0.29, instability: 0.21, dependencies: ['3'], technicalDebt: 0.4 },
  { id: '11', name: 'Local Vector DB Index', type: 'database', group: 'config', tech: 'Memory Store', status: 'online', description: 'Stores mathematical file embeddings for lightning context recall.', load: 0.48, instability: 0.09, dependencies: [], technicalDebt: 0.1 }
];

export default function ArchitectureNebula() {
  const [selectedNode, setSelectedNode] = useState<SystemNode>(CONST_NODES[0]);
  const [gravity, setGravity] = useState<number>(1.2);
  const [chargeStrength, setChargeStrength] = useState<number>(-80);
  const [linkDistance, setLinkDistance] = useState<number>(50);
  const [activePulse, setActivePulse] = useState<boolean>(false);
  const [liveNodes, setLiveNodes] = useState<SystemNode[]>(CONST_NODES);
  const [showParticleLabels, setShowParticleLabels] = useState<boolean>(true);

  useEffect(() => {
    // Establish WebSocket connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/telemetry`);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'GRAPH_UPDATE') {
          // Trigger the visual pulse
          triggerTrafficPulse();
          
          if (data.payload && data.payload.summary && data.payload.summary.files) {
            const files = data.payload.summary.files;
            // Map the physical files into visual SystemNode items
            const mappedNodes: SystemNode[] = files.map((file: any) => {
              const todoCount = file.todos?.length || 0;
              const hasComplexity = file.complexity || 0;
              const technicalDebt = Math.min(0.9, (hasComplexity * 0.1) + (todoCount * 0.15) + (file.size > 20000 ? 0.15 : 0));
              
              const nodeGroup = file.group || 'config';
              let type: 'service' | 'api' | 'component' | 'database' | 'event' = 'component';
              if (nodeGroup === 'ui') type = 'component';
              else if (nodeGroup === 'service') type = 'service';
              else if (nodeGroup === 'api') type = 'api';
              else type = 'database';

              return {
                id: file.relativePath,
                name: file.relativePath,
                type,
                group: nodeGroup,
                tech: file.relativePath.endsWith('.tsx') ? 'React + TSX' : file.relativePath.endsWith('.ts') ? 'TypeScript' : 'JSON/Config',
                status: technicalDebt > 0.65 ? 'warning' : 'online',
                description: `Size: ${(file.size / 1024).toFixed(1)} KB. Found ${todoCount} TODOs. Cognitive load (branches): ${hasComplexity}.`,
                load: Math.min(0.95, 0.1 + (file.size / 50000)),
                instability: Math.min(0.95, (todoCount * 0.1) + (hasComplexity * 0.05)),
                dependencies: file.imports || [],
                technicalDebt: technicalDebt || 0.1
              };
            });

            // Adjust dependencies to refer to matched ids
            mappedNodes.forEach(node => {
              const matchedDeps: string[] = [];
              const rawDeps = node.dependencies || [];
              rawDeps.forEach((depPkg: string) => {
                const found = mappedNodes.find(n => n.name.toLowerCase().includes(depPkg.toLowerCase()));
                if (found) {
                  matchedDeps.push(found.id);
                }
              });
              node.dependencies = matchedDeps;
            });

            if (mappedNodes.length > 0) {
              setLiveNodes(mappedNodes);
            }
          }
        }
      } catch (err) {
        console.error('Failed to parse telemetry', err);
      }
    };

    return () => ws.close();
  }, []);

  const triggerTrafficPulse = () => {
    setActivePulse(true);
    setTimeout(() => setActivePulse(false), 1200);
  };

  const simLinks = React.useMemo(() => {
    let links: any[] = [];
    liveNodes.forEach((n: any) => {
      n.dependencies.forEach((d: string) => {
        if (liveNodes.find((target: any) => target.id === d)) {
          links.push({ source: n.id, target: d });
        }
      });
    });
    return links;
  }, [liveNodes]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-900 pb-5">
        <div>
          <span className="text-[10px] font-mono font-black text-zinc-300 bg-white/5 border border-white/5 px-2.5 py-1 rounded-md tracking-wider uppercase">
            Holographic Universe v5.0
          </span>
          <h2 className="text-xl font-bold tracking-tight text-white mt-2">
            3D Cybernetic Dependency Nebula
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-2xl mt-1">
            An immersive 3D spatialized topology engine mapped to physical API endpoints, powered by d3-force-3d and React Three Fiber custom GLSL shaders.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        {/* LEFTSIDE BAR */}
        <div className="xl:col-span-3 flex flex-col gap-3.5 bg-[#07090e]/95 border border-slate-900/80 rounded-3xl p-4.5 select-none relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-zinc-800 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center justify-between text-[10px] font-bold font-mono tracking-wider text-slate-500">
            <span className="uppercase">Systems Directory</span>
            <span className="text-[#a78bfa] bg-[#a78bfa]/10 border border-[#a78bfa]/20 px-1.5 py-0.5 rounded-md font-black">{liveNodes.length} Nodes</span>
          </div>

          <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
            {liveNodes.map((node) => {
              const isSelected = selectedNode.id === node.id;
              let typeColor = 'text-zinc-300 bg-white/5';
              if (node.type === 'api') typeColor = 'text-cyan-400 bg-cyan-950/15';
              if (node.type === 'event') typeColor = 'text-amber-400 bg-amber-950/15';

              return (
                <button
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition ${
                    isSelected ? 'bg-white/5 border-violet-850 text-white shadow-lg' : 'bg-transparent border-slate-900 text-slate-400 hover:border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <div className="min-w-0 flex items-center gap-2">
                    {node.type === 'database' ? <Database className="w-3.5 h-3.5 shrink-0 text-zinc-300" /> : (node.type === 'api' ? <Globe className="w-3.5 h-3.5 shrink-0 text-cyan-400" /> : <Cpu className="w-3.5 h-3.5 shrink-0 text-zinc-300" />)}
                    <div className="truncate text-xs font-semibold font-sans">{node.name}</div>
                  </div>
                  <span className={`text-[8px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-full font-bold ${typeColor}`}>{node.type}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-auto border-t border-slate-850/60 pt-4.5 space-y-3 font-mono text-[10px]">
            <div className="flex items-center justify-between text-slate-500 font-bold">
              <span>Gravity Force</span>
              <span className="text-[#a78bfa] font-black">{gravity}G</span>
            </div>
            <input 
              type="range" min="0.2" max="3" step="0.1"
              value={gravity} onChange={(e) => setGravity(Number(e.target.value))}
              className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-violet-500" 
            />

            <div className="flex items-center justify-between text-slate-500 font-bold mt-2">
              <span>Charge Strength</span>
              <span className="text-[#a78bfa] font-black">{chargeStrength}</span>
            </div>
            <input 
              type="range" min="-300" max="-10" step="5"
              value={chargeStrength} onChange={(e) => setChargeStrength(Number(e.target.value))}
              className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-violet-500" 
            />

            <div className="flex items-center justify-between text-slate-500 font-bold mt-2">
              <span>Link Distance</span>
              <span className="text-[#a78bfa] font-black">{linkDistance}px</span>
            </div>
            <input 
              type="range" min="10" max="150" step="2"
              value={linkDistance} onChange={(e) => setLinkDistance(Number(e.target.value))}
              className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-violet-500" 
            />

            <div className="flex items-center justify-between text-slate-500 font-bold mt-3.5 pt-3 border-t border-slate-900/40">
              <span>Particle Labels</span>
              <button
                type="button"
                id="btn-toggle-particle-labels"
                onClick={() => setShowParticleLabels(!showParticleLabels)}
                className={`px-2 py-0.5 rounded font-mono text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  showParticleLabels
                    ? 'bg-violet-500/10 text-violet-300 border border-violet-500/30'
                    : 'bg-white/5 text-slate-500 border border-transparent'
                }`}
              >
                {showParticleLabels ? 'Show All' : 'Hidden'}
              </button>
            </div>
          </div>
        </div>

        {/* 3D CANVAS PORTAL */}
        <div className="xl:col-span-6 bg-slate-950/75 border border-slate-900 rounded-3xl overflow-hidden relative flex flex-col justify-between min-h-[440px] shadow-2xl relative">
          {activePulse && (
            <div className="absolute inset-0 bg-zinc-800 animate-pulse border-2 border-white/10 pointer-events-none z-10 rounded-3xl flex items-center justify-center">
              <div className="text-[10px] font-mono font-black text-zinc-300 bg-black/90 px-3 py-1.5 border border-white/5 uppercase rounded-xl tracking-widest scale-125 transition-transform duration-500 select-none animate-bounce">
                ⚡ TRAFFIC CASCADE SIGNAL SENT
              </div>
            </div>
          )}

          <Canvas camera={{ position: [0, 5, 30], fov: 60 }} className="w-full h-full cursor-grab active:cursor-grabbing">
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1.5} />
            <OrbitControls 
              enableDamping 
              dampingFactor={0.05} 
              minDistance={10}
              maxDistance={100}
            />
            <InstancedNodes 
              nodes={liveNodes} 
              links={simLinks}
              chargeStrength={chargeStrength}
              linkDistance={linkDistance}
              gravity={gravity}
              showLabels={showParticleLabels}
              onNodeSelect={(node) => {
                const found = liveNodes.find(n => n.id === node.id);
                if (found) setSelectedNode(found);
              }}
            />
          </Canvas>

          <div className="absolute top-4 right-4 flex items-center z-10">
            <button
              onClick={triggerTrafficPulse}
              className="px-3.5 py-1.5 bg-zinc-800 hover:bg-violet-700 text-white rounded-2xl text-[10px] font-mono font-black flex items-center gap-1.5 shadow-lg shadow-violet-950/40 cursor-pointer select-none active:scale-95 transition"
            >
              <Zap className="w-3 h-3 text-amber-200 animate-pulse fill-amber-200" /> Pulse Traffic Beam
            </button>
          </div>
        </div>

        {/* RIGHT SIDE BAR */}
        <div className="xl:col-span-3 flex flex-col gap-4 bg-[#07090e]/95 border border-slate-900/80 rounded-3xl p-5 select-text relative">
          <div className="absolute top-0 left-0 w-32 h-32 bg-zinc-800 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-850/60 font-mono text-[10px] font-bold text-slate-500 select-none">
            <span className="uppercase">Node Diagnostics</span>
            <span className={`px-2 py-0.5 rounded-full uppercase text-[8px] font-black ${selectedNode.status === 'online' ? 'bg-white/5 text-zinc-300' : 'bg-amber-950/30 text-amber-500'}`}>{selectedNode.status}</span>
          </div>

          <div className="space-y-1">
            <span className="text-[8.5px] uppercase font-mono tracking-wider font-bold text-slate-500">Node Identifier</span>
            <h3 className="text-base font-bold text-white flex items-center gap-2"><Zap className="w-4 h-4 text-zinc-300" /> {selectedNode.name}</h3>
            <p className="text-xs text-slate-400 font-sans font-medium mt-1">{selectedNode.description}</p>
          </div>

          <div className="space-y-1 bg-slate-950 p-3 rounded-2xl border border-slate-900 font-mono text-[10.5px]">
            <div className="flex items-center justify-between text-slate-450 border-b border-slate-900 pb-1.5"><span>Stack Backbone:</span> <span className="text-white font-bold">{selectedNode.tech}</span></div>
            <div className="flex items-center justify-between text-slate-450 pt-1.5"><span>Sub-System Layer:</span> <span className="text-[#a78bfa] font-bold uppercase">{selectedNode.group}</span></div>
          </div>

          <div className="space-y-3.5">
            <div className="space-y-1 font-mono text-[10px]">
              <div className="flex items-center justify-between text-slate-450 font-bold"><span>Active Core Load Factor</span> <span className="text-[#a78bfa] font-black">{Math.round(selectedNode.load * 100)}%</span></div>
              <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden"><div className="bg-zinc-800 h-full transition-all duration-500" style={{ width: `${selectedNode.load * 100}%` }} /></div>
            </div>
            <div className="space-y-1 font-mono text-[10px]">
              <div className="flex items-center justify-between text-slate-450 font-bold"><span>Chaos Instability Coeff</span> <span className={`font-black ${selectedNode.instability > 0.4 ? 'text-amber-500' : 'text-[#a78bfa]'}`}>{Math.round(selectedNode.instability * 100)}%</span></div>
              <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden"><div className={`h-full transition-all duration-500 ${selectedNode.instability > 0.4 ? 'bg-amber-500' : 'bg-zinc-800'}`} style={{ width: `${selectedNode.instability * 100}%` }} /></div>
            </div>
          </div>

          <div className="bg-[#050609] p-3 border border-slate-900 rounded-2xl mt-auto min-h-[100px] flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold uppercase text-slate-500 pb-1.5 border-b border-slate-900"><Fingerprint className="w-3.5 h-3.5 text-zinc-300"/> <span>Flow Proximity Links</span></div>
            <div className="flex flex-wrap items-center gap-1.5 pt-2">
              {selectedNode.dependencies.length > 0 ? selectedNode.dependencies.map(depId => {
                const counterpart = liveNodes.find(n => n.id === depId);
                return counterpart ? (
                  <span key={depId} className="px-2 py-0.5 bg-slate-900 border border-slate-850 hover:border-violet-605 text-[9px] text-slate-400 font-mono rounded font-bold flex items-center gap-1" title={counterpart.description}>
                    <Share2 className="w-2.5 h-2.5 text-violet-450" /> {counterpart.name}
                  </span>
                ) : null;
              }) : <span className="text-[10px] text-slate-550 font-mono italic">Zero active dependents mapped. Zero AST collision risk.</span>}
            </div>
            <div className="mt-3 text-[9px] font-sans text-slate-400 p-2 bg-white/5 border border-white/5 rounded-xl font-medium leading-relaxed">
              <span className="font-semibold text-zinc-300">🤖 AI Observatory Diagnostic:</span><br/>{selectedNode.instability > 0.4 ? "Warnings triggered. High event throughput causes thread saturation. Decouple pipeline memory buffer indices." : "Performance is optimal. Zero heap anomalies or structural drift detected on compiled abstract syntax trees."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
