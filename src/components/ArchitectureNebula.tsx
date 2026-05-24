import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Line } from '@react-three/drei';
// @ts-ignore
import { forceSimulation, forceLink, forceManyBody, forceCenter } from 'd3-force-3d';
import { 
  Globe, Database, Cpu, Send, Fingerprint, Share2, 
  Zap, Workflow, Maximize2, ShieldAlert, Sparkles, Info
} from 'lucide-react';

interface SystemNode {
  id: string;
  name: string;
  type: 'service' | 'api' | 'component' | 'database' | 'event';
  group: 'frontend' | 'backend' | 'infra' | 'external';
  tech: string;
  status: 'online' | 'warning' | 'degraded';
  description: string;
  load: number; // 0 to 1
  instability: number; // 0 to 1
  dependencies: string[];
  x?: number; y?: number; z?: number;
  vx?: number; vy?: number; vz?: number;
}

const CONST_NODES: SystemNode[] = [
  { id: '1', name: 'Cognitive Runtime', type: 'service', group: 'backend', tech: 'Node.js/Bun/Fastify', status: 'online', description: 'Core scanning engine and dynamic AST compiler crawler.', load: 0.35, instability: 0.12, dependencies: ['2', '3', '6', '11'] },
  { id: '2', name: 'Neural UI HUD', type: 'component', group: 'frontend', tech: 'React/Three.js/Tailwind', status: 'online', description: 'Immersive cockpit UI layer rendering canvas telemetry and reactive streams.', load: 0.85, instability: 0.28, dependencies: [] },
  { id: '3', name: 'Gemini Agent Orchestrator', type: 'service', group: 'backend', tech: 'Gemini 3.5 Flash', status: 'online', description: 'Dynamic prompt chaining and autonomous codebase repair executor.', load: 0.62, instability: 0.45, dependencies: ['11'] },
  { id: '4', name: '/api/github/pulls', type: 'api', group: 'backend', tech: 'REST v3 HTTPS', status: 'online', description: 'Git integration handler synchronizing active pull request statuses.', load: 0.18, instability: 0.08, dependencies: ['1'] },
  { id: '5', name: 'Websocket Gateway', type: 'service', group: 'backend', tech: 'Socket.io Cluster', status: 'warning', description: 'Multiplexed event delivery bus transmitting active file updates.', load: 0.72, instability: 0.52, dependencies: ['1'] },
  { id: '6', name: 'Prisma SQLite State', type: 'database', group: 'infra', tech: 'SQL database', status: 'online', description: 'Persistent storage for user sessions and telemetry histories.', load: 0.24, instability: 0.05, dependencies: [] },
  { id: '7', name: 'Ghost System Detector', type: 'service', group: 'backend', tech: 'AST Crawler', status: 'online', description: 'Identifies unreachable routes and orphaned packages.', load: 0.12, instability: 0.15, dependencies: ['1'] },
  { id: '8', name: 'Chaos Simulator API', type: 'api', group: 'external', tech: 'Express Endpoint', status: 'online', description: 'Injects network latency spikes and database lockouts.', load: 0.05, instability: 0.85, dependencies: ['1', '5'] },
  { id: '9', name: 'Developer Flow Watcher', type: 'component', group: 'frontend', tech: 'Zustand Store', status: 'online', description: 'Accumulates developer typing speed and keyboard interval focus loops.', load: 0.41, instability: 0.18, dependencies: ['2'] },
  { id: '10', name: 'AI Security Observatory', type: 'service', group: 'backend', tech: 'Semantic Scanners', status: 'online', description: 'Examines workspace directories for exposed credentials and unsafe routes.', load: 0.29, instability: 0.21, dependencies: ['3'] },
  { id: '11', name: 'Local Vector DB Index', type: 'database', group: 'infra', tech: 'Memory Store', status: 'online', description: 'Stores mathematical file embeddings for lightning context recall.', load: 0.48, instability: 0.09, dependencies: [] }
];

const NodeMaterial = {
  uniforms: {
    time: { value: 0 },
    instability: { value: 0 },
    baseColor: { value: new THREE.Color(0xa78bfa) }
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float time;
    uniform float instability;
    uniform vec3 baseColor;
    varying vec2 vUv;
    varying vec3 vNormal;
    void main() {
      float intensity = pow(0.75 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
      float pulse = sin(time * 3.0 * instability) * 0.5 + 0.5;
      vec3 glow = baseColor * intensity * (1.0 + pulse * instability * 2.0);
      gl_FragColor = vec4(glow + baseColor * 0.2, 0.8);
    }
  `
};

function NebulaGraph({ nodes, activePulse, selectedId, onSelect, gravityMultiplier }: any) {
  const simNodes = useMemo(() => nodes.map((n: any) => ({ ...n, x: Math.random()*20-10, y: Math.random()*20-10, z: Math.random()*20-10 })), [nodes]);
  const simLinks = useMemo(() => {
    let links: any[] = [];
    nodes.forEach((n: any) => {
      n.dependencies.forEach((d: string) => {
        if (nodes.find((target: any) => target.id === d)) {
          links.push({ source: n.id, target: d });
        }
      });
    });
    return links;
  }, [nodes]);

  const simulationRef = useRef<any>(null);
  const meshesRef = useRef<{ [key: string]: THREE.Mesh }>({});
  const linksRef = useRef<{ [key: string]: any }>({});
  
  useEffect(() => {
    const simulation = forceSimulation(simNodes as any)
      .force('link', forceLink(simLinks).id((d: any) => d.id).distance(15))
      .force('charge', forceManyBody().strength(-100 * gravityMultiplier))
      .force('center', forceCenter(0, 0, 0));
    
    simulationRef.current = simulation;

    return () => simulation.stop();
  }, [simNodes, simLinks, gravityMultiplier]);

  useFrame((state) => {
    if (simulationRef.current) {
      simulationRef.current.tick();
      
      const { clock } = state;
      const t = clock.getElapsedTime();

      // Update positions
      simNodes.forEach((node: any) => {
        const mesh = meshesRef.current[node.id];
        if (mesh) {
          // Add orbital noise if activePulse is on
          const shake = activePulse ? Math.sin(t * 20 + node.id) * 0.5 : 0;
          mesh.position.set(node.x, node.y + shake, node.z);
          mesh.rotation.y += 0.01;
          mesh.rotation.x += 0.005;

          // Update shader uniforms
          const material = mesh.material as THREE.ShaderMaterial;
          if (material && material.uniforms) {
            material.uniforms.time.value = t;
          }
        }
      });

      // Update links
      simLinks.forEach((link: any, idx: number) => {
        const line = linksRef.current[idx];
        if (line) {
          const positions = new Float32Array([
            link.source.x, link.source.y, link.source.z,
            link.target.x, link.target.y, link.target.z
          ]);
          line.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
          line.geometry.attributes.position.needsUpdate = true;
        }
      });
    }
  });

  const getColor = (node: SystemNode) => {
    if (node.status === 'degraded') return new THREE.Color(0xef4444);
    if (node.status === 'warning') return new THREE.Color(0xf59e0b);
    if (node.type === 'database') return new THREE.Color(0x14b8a6);
    if (node.type === 'api') return new THREE.Color(0x06b6d4);
    return new THREE.Color(0xa78bfa);
  };

  return (
    <group>
      {simLinks.map((link: any, idx: number) => (
        <line key={`link-${idx}`} ref={(el: any) => { linksRef.current[idx] = el; }}>
          <bufferGeometry />
          <lineBasicMaterial color={0x475569} transparent opacity={0.3} />
        </line>
      ))}

      {simNodes.map((node: any) => (
        <mesh 
          key={node.id} 
          ref={(el) => (meshesRef.current[node.id] = el as THREE.Mesh)}
          onClick={(e) => { e.stopPropagation(); onSelect(node); }}
          onPointerOver={(e) => { document.body.style.cursor = 'pointer'; }}
          onPointerOut={(e) => { document.body.style.cursor = 'auto'; }}
        >
          <sphereGeometry args={[1 + node.load * 0.5, 32, 32]} />
          <shaderMaterial 
            vertexShader={NodeMaterial.vertexShader}
            fragmentShader={NodeMaterial.fragmentShader}
            uniforms={{
              time: { value: 0 },
              instability: { value: node.instability },
              baseColor: { value: getColor(node) }
            }}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
          {selectedId === node.id && (
            <mesh>
              <sphereGeometry args={[1.5 + node.load * 0.5, 32, 32]} />
              <meshBasicMaterial color={getColor(node)} wireframe transparent opacity={0.5} />
            </mesh>
          )}
          
          <Html distanceFactor={25} className="pointer-events-none transition-opacity opacity-0 group-hover:opacity-100">
            <div className={`px-2 py-1 text-[10px] font-mono whitespace-nowrap font-bold rounded border bg-black/80 backdrop-blur-md ${selectedId === node.id ? 'text-white border-violet-500' : 'text-slate-300 border-white/10'}`}>
              {node.name}
            </div>
          </Html>
        </mesh>
      ))}
    </group>
  );
}

export default function ArchitectureNebula() {
  const [selectedNode, setSelectedNode] = useState<SystemNode>(CONST_NODES[0]);
  const [gravity, setGravity] = useState<number>(1.2);
  const [activePulse, setActivePulse] = useState<boolean>(false);

  const triggerTrafficPulse = () => {
    setActivePulse(true);
    setTimeout(() => setActivePulse(false), 1200);
  };

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
            <span className="text-[#a78bfa] bg-[#a78bfa]/10 border border-[#a78bfa]/20 px-1.5 py-0.5 rounded-md font-black">{CONST_NODES.length} Nodes</span>
          </div>

          <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
            {CONST_NODES.map((node) => {
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
            <NebulaGraph 
              nodes={CONST_NODES} 
              activePulse={activePulse}
              selectedId={selectedNode.id}
              onSelect={setSelectedNode}
              gravityMultiplier={gravity}
            />
            <OrbitControls enableDamping dampingFactor={0.05} />
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
                const counterpart = CONST_NODES.find(n => n.id === depId);
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
