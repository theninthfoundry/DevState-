import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { 
  OrbitControls 
} from 'three/examples/jsm/controls/OrbitControls.js';
import { 
  Globe, 
  Database, 
  Cpu, 
  Send, 
  Fingerprint, 
  Share2, 
  Zap, 
  Workflow, 
  Maximize2, 
  ShieldAlert, 
  Sparkles,
  Info
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
  x?: number;
  y?: number;
  z?: number;
  dependencies: string[];
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

export default function ArchitectureNebula() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedNode, setSelectedNode] = useState<SystemNode>(CONST_NODES[0]);
  const [gravity, setGravity] = useState<number>(1.2);
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const [activePulse, setActivePulse] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<string>("Overview");

  // Three.js instances ref
  const threeRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    controls: OrbitControls;
    nodeMeshes: { [id: string]: THREE.Mesh };
    connectionLines: THREE.LineSegments[];
    particles: THREE.Points;
    animationFrameId: number;
    raycaster: THREE.Raycaster;
    pointer: THREE.Vector2;
  } | null>(null);

  // Initialize 3D scene
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = Math.max(containerRef.current.clientHeight, 400);

    // Create scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050609, 0.015);

    // Create camera
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 5, 25);

    // Create renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Create controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 60;
    controls.minDistance = 8;

    // Create interactive Raycasting helpers
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    // Assign 3D coordinates using force calculations
    const nodeMeshes: { [id: string]: THREE.Mesh } = {};
    const processedNodes = [...CONST_NODES].map((node, i) => {
      const angle = (i / CONST_NODES.length) * Math.PI * 2;
      const radius = 10 + Math.sin(i * 1.5) * 4;
      node.x = Math.cos(angle) * radius;
      node.y = Math.sin(angle) * radius + (Math.random() - 0.5) * 5;
      node.z = (Math.random() - 0.5) * 8;
      return node;
    });

    // Create mesh objects for nodes
    processedNodes.forEach(node => {
      // Color selector
      let col = 0xa78bfa; // primary cyber violet
      if (node.status === 'warning') col = 0xf59e0b; // amber
      if (node.status === 'degraded') col = 0xef4444; // red
      if (node.type === 'database') col = 0x14b8a6; // mint teal
      if (node.type === 'api') col = 0x06b6d4; // cyan

      // Geometry: Sphere framed by thin torus rings
      const sphereGeo = new THREE.SphereGeometry(1.0 + (node.load * 0.4), 16, 16);
      const wireMat = new THREE.MeshBasicMaterial({
        color: col,
        wireframe: true,
        transparent: true,
        opacity: 0.65
      });
      const solidMat = new THREE.MeshBasicMaterial({
        color: col,
        transparent: true,
        opacity: 0.15
      });

      const group = new THREE.Group();
      
      const solidMesh = new THREE.Mesh(sphereGeo, solidMat);
      const wireMesh = new THREE.Mesh(sphereGeo, wireMat);
      
      // Store reference metadata for Raycaster picking
      solidMesh.userData = { nodeId: node.id };
      wireMesh.userData = { nodeId: node.id };

      group.add(solidMesh);
      group.add(wireMesh);

      // Outer glowing orbital ring for visual gravity
      const ringGeo = new THREE.TorusGeometry(1.8 + (node.load * 0.3), 0.04, 8, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: col,
        transparent: true,
        opacity: 0.2
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.random() * Math.PI;
      ringMesh.rotation.y = Math.random() * Math.PI;
      group.add(ringMesh);

      // Node coordinates
      group.position.set(node.x || 0, node.y || 0, node.z || 0);
      scene.add(group);

      // Store group reference
      nodeMeshes[node.id] = solidMesh; // Keep solid reference for checking intersection
      
      // Store total group reference as user data for moving/animating together
      solidMesh.userData.groupRef = group;
      wireMesh.userData.groupRef = group;
    });

    // Create connection lines
    const lineSegments: THREE.LineSegments[] = [];
    processedNodes.forEach(node => {
      if (node.dependencies && node.dependencies.length > 0) {
        node.dependencies.forEach(tId => {
          const target = processedNodes.find(n => n.id === tId);
          if (target) {
            const material = new THREE.LineBasicMaterial({
              color: 0x475569,
              transparent: true,
              opacity: 0.35,
              linewidth: 2
            });

            // Set up endpoints
            const points = [
              new THREE.Vector3(node.x || 0, node.y || 0, node.z || 0),
              new THREE.Vector3(target.x || 0, target.y || 0, target.z || 0)
            ];
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(geometry, material);
            scene.add(line);
          }
        });
      }
    });

    // Ambient background galaxy space dust
    const starsCount = 600;
    const starsGeo = new THREE.BufferGeometry();
    const starsPos = new Float32Array(starsCount * 3);
    const starsVel = new Float32Array(starsCount);
    
    for (let i = 0; i < starsCount * 3; i += 3) {
      starsPos[i] = (Math.random() - 0.5) * 80;
      starsPos[i + 1] = (Math.random() - 0.5) * 80;
      starsPos[i + 2] = (Math.random() - 0.5) * 80;
      starsVel[i / 3] = 0.05 + Math.random() * 0.1;
    }
    
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starsPos, 3));
    const starsMat = new THREE.PointsMaterial({
      color: 0x8b5cf6, // purple star nebula
      size: 0.15,
      transparent: true,
      opacity: 0.65,
      sizeAttenuation: true
    });
    
    const starField = new THREE.Points(starsGeo, starsMat);
    scene.add(starField);

    // Save references to ref for updates
    threeRef.current = {
      scene,
      camera,
      renderer,
      controls,
      nodeMeshes,
      connectionLines: [],
      particles: starField,
      animationFrameId: 0,
      raycaster,
      pointer
    };

    // Raycast selector handler
    const handleMouseUp = (e: MouseEvent) => {
      if (!canvasRef.current || !threeRef.current) return;
      
      // Calculate normalized device coordinates
      const rect = canvasRef.current.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      // Find first node mesh model that was hit
      for (let hit of intersects) {
        if (hit.object.userData && hit.object.userData.nodeId) {
          const clickedId = hit.object.userData.nodeId;
          const found = CONST_NODES.find(n => n.id === clickedId);
          if (found) {
            setSelectedNode(found);
            
            // Move camera to focus gently on selected node
            const group = hit.object.userData.groupRef;
            if (group) {
              const targetPos = new THREE.Vector3();
              group.getWorldPosition(targetPos);
              
              // Animated path
              new THREE.BoxHelper(group, 0x8b5cf6); // brief visual helper flash
              setZoomLevel(`Node: ${found.name}`);
            }
            break;
          }
        }
      }
    };

    // Add pointer listener
    canvasRef.current.addEventListener('mouseup', handleMouseUp);

    // Resizing observer
    const resizeObserver = new ResizeObserver(entries => {
      if (!entries || entries.length === 0) return;
      const entry = entries[0];
      const w = entry.contentRect.width;
      const h = Math.max(entry.contentRect.height, 400);

      if (threeRef.current) {
        threeRef.current.camera.aspect = w / h;
        threeRef.current.camera.updateProjectionMatrix();
        threeRef.current.renderer.setSize(w, h);
      }
    });
    
    resizeObserver.observe(containerRef.current);

    // Component Animation loop
    let lastTime = 0;
    const animate = (time: number) => {
      if (!threeRef.current) return;
      
      const delta = (time - lastTime) * 0.001;
      lastTime = time;

      // Rotate star particles
      if (isRotating && starField) {
        starField.rotation.y += 0.001 * gravity;
        starField.rotation.x += 0.0003 * gravity;
      }

      // Rotate individual node meshes based on status and load speed factors
      Object.keys(nodeMeshes).forEach(id => {
        const solidMesh = nodeMeshes[id];
        const groupRef = solidMesh.userData.groupRef;
        if (groupRef) {
          const node = CONST_NODES.find(n => n.id === id);
          if (node) {
            // Speed of node rotations reflects active data load!
            const speed = 0.5 + (node.load * 2);
            
            if (isRotating) {
              // Orbit the entire group slightly around central axis to look floating
              const orbitalRadius = Math.sqrt(groupRef.position.x ** 2 + groupRef.position.z ** 2);
              const angle = Math.atan2(groupRef.position.z, groupRef.position.x);
              const newAngle = angle + (0.05 / orbitalRadius) * speed * delta * gravity;
              
              groupRef.position.x = Math.cos(newAngle) * orbitalRadius;
              groupRef.position.z = Math.sin(newAngle) * orbitalRadius;
              
              // Subtly bob up/down in Y
              groupRef.position.y += Math.sin(time * 0.0015 + parseInt(id)) * 0.003;
            }

            // Spin torus rings
            groupRef.children.forEach((child: any) => {
              if (child instanceof THREE.Mesh && child.geometry instanceof THREE.TorusGeometry) {
                child.rotation.z += 0.4 * speed * delta;
                child.rotation.x += 0.2 * delta;
              }
            });
          }
        }
      });

      threeRef.current.controls.update();
      threeRef.current.renderer.render(threeRef.current.scene, threeRef.current.camera);
      threeRef.current.animationFrameId = requestAnimationFrame(animate);
    };

    threeRef.current.animationFrameId = requestAnimationFrame(animate);

    // Cleanup inside hook
    return () => {
      resizeObserver.disconnect();
      if (canvasRef.current) {
        canvasRef.current.removeEventListener('mouseup', handleMouseUp);
      }
      if (threeRef.current) {
        cancelAnimationFrame(threeRef.current.animationFrameId);
        threeRef.current.renderer.dispose();
      }
    };
  }, [isRotating, gravity]);

  // Handle sudden pipeline traffic pulse
  const triggerTrafficPulse = () => {
    setActivePulse(true);
    setTimeout(() => {
      setActivePulse(false);
    }, 1200);

    // Shake the camera subtly in Three.js parameters to represent high traffic impact!
    if (threeRef.current) {
      const originalY = threeRef.current.camera.position.y;
      let count = 0;
      const shakeInterval = setInterval(() => {
        if (count > 8 || !threeRef.current) {
          clearInterval(shakeInterval);
          return;
        }
        threeRef.current.camera.position.y = originalY + (Math.random() - 0.5) * 0.4;
        count++;
      }, 50);
    }
  };

  const setFixedCameraView = (view: 'reset' | 'top' | 'side' | 'zoomNode') => {
    if (!threeRef.current) return;
    const { camera, controls } = threeRef.current;
    setZoomLevel(view === 'reset' ? 'Overview' : view === 'top' ? 'Zenith View' : 'Horizon View');

    if (view === 'reset') {
      camera.position.set(0, 5, 25);
      controls.target.set(0, 0, 0);
    } else if (view === 'top') {
      camera.position.set(0, 24, 0.1);
      controls.target.set(0, 0, 0);
    } else if (view === 'side') {
      camera.position.set(24, 0, 0);
      controls.target.set(0, 0, 0);
    } else if (view === 'zoomNode' && selectedNode) {
      // Find position of mesh group
      const solidMesh = threeRef.current.nodeMeshes[selectedNode.id];
      const group = solidMesh?.userData?.groupRef;
      if (group) {
        const targetPos = new THREE.Vector3();
        group.getWorldPosition(targetPos);
        camera.position.set(targetPos.x, targetPos.y + 2, targetPos.z + 6);
        controls.target.copy(targetPos);
        setZoomLevel(`Close-up: ${selectedNode.name}`);
      }
    }
    controls.update();
  };

  return (
    <div className="space-y-6">
      
      {/* Title section with cyber aesthetic */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-900 pb-5">
        <div>
          <span className="text-[10px] font-mono font-black text-violet-400 bg-violet-950/20 border border-violet-900/40 px-2.5 py-1 rounded-md tracking-wider uppercase">
            Holographic Universe v4.1
          </span>
          <h2 className="text-xl font-bold tracking-tight text-white mt-2">
            3D Cybernetic Dependency Nebula
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-2xl mt-1">
            An immersive 3D spatialized topology engine mapped to physical API endpoints, Prisma DB states, and websocket nodes. Click nodes in the viewport to evaluate diagnostic metrics in real-time.
          </p>
        </div>

        {/* Orbit State Summary */}
        <div className="flex items-center gap-1.5 bg-[#0b0c15] p-2 border border-slate-850 rounded-2xl text-[10px] font-mono">
          <span className="text-slate-500">Camera Focus:</span>
          <span className="text-[#a78bfa] font-bold uppercase">{zoomLevel}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        
        {/* SIDE BAR LEFT: Interactive Systems Directory */}
        <div className="xl:col-span-3 flex flex-col gap-3.5 bg-[#07090e]/95 border border-slate-900/80 rounded-3xl p-4.5 select-none relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="flex items-center justify-between text-[10px] font-bold font-mono tracking-wider text-slate-500">
            <span className="uppercase">Systems Directory</span>
            <span className="text-[#a78bfa] bg-[#a78bfa]/10 border border-[#a78bfa]/20 px-1.5 py-0.5 rounded-md font-black">{CONST_NODES.length} Node Layers</span>
          </div>

          <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
            {CONST_NODES.map((node) => {
              const isSelected = selectedNode.id === node.id;
              
              let typeColor = 'text-violet-400 bg-violet-950/20';
              if (node.type === 'database') typeColor = 'text-teal-400 bg-teal-950/15';
              if (node.type === 'api') typeColor = 'text-cyan-400 bg-cyan-950/15';
              if (node.type === 'event') typeColor = 'text-amber-400 bg-amber-950/15';

              return (
                <button
                  key={node.id}
                  onClick={() => {
                    setSelectedNode(node);
                    setFixedCameraView('zoomNode');
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition ${
                    isSelected 
                      ? 'bg-violet-950/30 border-violet-850 text-white shadow-lg' 
                      : 'bg-transparent border-slate-900 text-slate-400 hover:border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <div className="min-w-0 flex items-center gap-2">
                    {node.type === 'database' ? (
                      <Database className="w-3.5 h-3.5 shrink-0 text-teal-400" />
                    ) : node.type === 'api' ? (
                      <Globe className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
                    ) : (
                      <Cpu className="w-3.5 h-3.5 shrink-0 text-violet-400" />
                    )}
                    <div className="truncate text-xs font-semibold font-sans">{node.name}</div>
                  </div>

                  <span className={`text-[8px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-full font-bold font-mono ${typeColor}`}>
                    {node.type}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Gravity & Orbit Controls inside the directory box */}
          <div className="mt-auto border-t border-slate-850/60 pt-4.5 space-y-3 font-mono text-[10px]">
            <div className="flex items-center justify-between text-slate-500 font-bold">
              <span>Gravity Force</span>
              <span className="text-[#a78bfa] font-black">{gravity}G</span>
            </div>
            <input 
              type="range" 
              min="0.2" 
              max="3" 
              step="0.1"
              value={gravity}
              onChange={(e) => setGravity(Number(e.target.value))}
              className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-violet-500" 
            />

            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-bold">Orbital Rotation</span>
              <button
                type="button"
                onClick={() => setIsRotating(!isRotating)}
                className={`px-2 py-0.5 rounded border text-[9px] font-black ${
                  isRotating 
                    ? 'bg-violet-950/40 text-[#a78bfa] border-violet-900/40' 
                    : 'bg-slate-900 text-slate-500 border-slate-800'
                }`}
              >
                {isRotating ? 'ENGAGED' : 'PAUSED'}
              </button>
            </div>
          </div>
        </div>

        {/* CENTER VIEWPORT: THE 3D NEBULA CANVAS */}
        <div ref={containerRef} className="xl:col-span-6 bg-slate-950/75 border border-slate-900 rounded-3xl overflow-hidden relative flex flex-col justify-between min-h-[440px] shadow-2xl relative">
          
          {/* Animated Wave overlay whenever a traffic pulse is active */}
          {activePulse && (
            <div className="absolute inset-0 bg-violet-500/5 animate-pulse border-2 border-violet-500/20 pointer-events-none z-10 rounded-3xl flex items-center justify-center">
              <div className="text-[10px] font-mono font-black text-violet-400 bg-black/90 px-3 py-1.5 border border-violet-900/50 uppercase rounded-xl tracking-widest scale-125 transition-transform duration-500 select-none animate-bounce">
                ⚡ TRAFFIC CASCADE SIGNAL SENT
              </div>
            </div>
          )}

          {/* Canvas container with mouse interaction alert */}
          <canvas ref={canvasRef} className="w-full h-full block cursor-grab active:cursor-grabbing" />

          {/* Quick Camera Preset Controllers */}
          <div className="absolute bottom-4 left-4 flex items-center gap-1.5 z-10 bg-black/80 backdrop-blur-md border border-slate-900 p-1 rounded-2xl select-none">
            <button
              onClick={() => setFixedCameraView('reset')}
              className="p-1.5 hover:bg-slate-905 text-slate-450 hover:text-white rounded-xl transition text-[9px] font-mono font-bold"
              title="Wide Overview Reset"
            >
              Reset
            </button>
            <span className="text-slate-800 text-[10px] select-none font-black">|</span>
            <button
              onClick={() => setFixedCameraView('top')}
              className="p-1.5 hover:bg-slate-905 text-slate-450 hover:text-white rounded-xl transition text-[9px] font-mono font-bold"
              title="Zenith Orthogonal view"
            >
              Zenith Y
            </button>
            <span className="text-slate-805 text-[10px] select-none font-black">|</span>
            <button
              onClick={() => setFixedCameraView('side')}
              className="p-1.5 hover:bg-slate-905 text-slate-450 hover:text-white rounded-xl transition text-[9px] font-mono font-bold"
              title="Horizon view"
            >
              Horizon X
            </button>
            <span className="text-slate-805 text-[10px] select-none font-black">|</span>
            <button
              onClick={() => setFixedCameraView('zoomNode')}
              className="p-1.5 hover:bg-[#8b5cf6]/10 text-violet-400 rounded-xl transition text-[9px] font-mono font-black flex items-center gap-1"
              title="Focus selected node"
              disabled={!selectedNode}
            >
              <Maximize2 className="w-2.5 h-2.5" /> Target Focus
            </button>
          </div>

          <div className="absolute top-4 right-4 flex items-center gap-1.5 z-10">
            <button
              onClick={triggerTrafficPulse}
              className="px-3.5 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-2xl text-[10px] font-mono font-black flex items-center gap-1.5 shadow-lg shadow-violet-950/40 cursor-pointer select-none active:scale-95 transition"
            >
              <Zap className="w-3 h-3 text-amber-200 animate-pulse fill-amber-200" /> Pulse Traffic Beam
            </button>
          </div>

          {/* Subtitle instructions */}
          <div className="absolute top-4 left-4 pointer-events-none select-none select-text">
            <div className="flex items-center gap-1.5 bg-black/60 border border-slate-900/60 p-1.5 rounded-xl">
              <Info className="w-3.5 h-3.5 text-violet-400" />
              <p className="text-[10px] font-mono text-slate-400 leading-none">
                Interactive: Left-Click node details, Left-Drag to rotate celestial, Scroll to infinite zoom.
              </p>
            </div>
          </div>
        </div>

        {/* SIDE BAR RIGHT: Selected Node Live Diagnostics Panel */}
        <div className="xl:col-span-3 flex flex-col gap-4 bg-[#07090e]/95 border border-slate-900/80 rounded-3xl p-5 select-text relative">
          <div className="absolute top-0 left-0 w-32 h-32 bg-violet-500/5 rounded-full blur-2xl pointer-events-none"></div>

          <div className="flex items-center justify-between pb-3.5 border-b border-slate-850/60 font-mono text-[10px] font-bold text-slate-500 select-none">
            <span className="uppercase">Node Diagnostics</span>
            <span className={`px-2 py-0.5 rounded-full uppercase text-[8px] font-black ${
              selectedNode.status === 'online' 
                ? 'bg-emerald-950/30 text-emerald-400' 
                : 'bg-amber-950/30 text-amber-500'
            }`}>
              {selectedNode.status}
            </span>
          </div>

          {/* Node Profile Header */}
          <div className="space-y-1">
            <span className="text-[8.5px] uppercase font-mono tracking-wider font-bold text-slate-500">Node Identifier</span>
            <h3 className="text-base font-bold text-white select-text flex items-center gap-2">
              <Zap className="w-4 h-4 text-violet-400" />
              {selectedNode.name}
            </h3>
            <p className="text-xs text-slate-400 font-sans font-medium select-text leading-relaxed mt-1">
              {selectedNode.description}
            </p>
          </div>

          {/* Space Tech Profile */}
          <div className="space-y-1 bg-slate-950 p-3 rounded-2xl border border-slate-900 select-text font-mono text-[10.5px]">
            <div className="flex items-center justify-between text-slate-450 border-b border-slate-900 pb-1.5">
              <span>Stack Backbone:</span>
              <span className="text-white font-bold">{selectedNode.tech}</span>
            </div>
            <div className="flex items-center justify-between text-slate-450 pt-1.5 select-none">
              <span>Sub-System Layer:</span>
              <span className="text-[#a78bfa] font-bold uppercase">{selectedNode.group}</span>
            </div>
          </div>

          {/* Progress gauges */}
          <div className="space-y-3.5">
            <div className="space-y-1 font-mono text-[10px]">
              <div className="flex items-center justify-between text-slate-450 font-bold select-none">
                <span>Active Core Load Factor</span>
                <span className="text-[#a78bfa] font-black">{Math.round(selectedNode.load * 100)}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden select-none">
                <div 
                  className="bg-violet-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${selectedNode.load * 100}%` }} 
                />
              </div>
            </div>

            <div className="space-y-1 font-mono text-[10px]">
              <div className="flex items-center justify-between text-slate-450 font-bold select-none">
                <span>Chaos Instability Coeff</span>
                <span className={`font-black ${selectedNode.instability > 0.4 ? 'text-amber-500' : 'text-[#a78bfa]'}`}>
                  {Math.round(selectedNode.instability * 100)}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden select-none">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    selectedNode.instability > 0.4 ? 'bg-amber-500' : 'bg-indigo-500'
                  }`} 
                  style={{ width: `${selectedNode.instability * 100}%` }} 
                />
              </div>
            </div>
          </div>

          {/* Proximity Alignment mapping */}
          <div className="bg-[#050609] p-3 border border-slate-900 rounded-2xl select-text mt-auto min-h-[100px] flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold uppercase text-slate-500 pb-1.5 border-b border-slate-900 select-none">
              <Fingerprint className="w-3.5 h-3.5 text-violet-400" />
              <span>Flow Proximity Links</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-1.5 pt-2">
              {selectedNode.dependencies && selectedNode.dependencies.length > 0 ? (
                selectedNode.dependencies.map(depId => {
                  const counterpart = CONST_NODES.find(n => n.id === depId);
                  return counterpart ? (
                    <span 
                      key={depId}
                      className="px-2 py-0.5 bg-slate-900 border border-slate-850 hover:border-violet-605 text-[9px] text-slate-400 font-mono rounded font-bold cursor-help flex items-center gap-1"
                      title={counterpart.description}
                    >
                      <Share2 className="w-2.5 h-2.5 text-violet-450" />
                      {counterpart.name}
                    </span>
                  ) : null;
                })
              ) : (
                <span className="text-[10px] text-slate-550 font-mono italic">
                  Zero active dependents mapped. Zero AST collision risk.
                </span>
              )}
            </div>

            {/* AI Advisor Context floating line */}
            <div className="mt-3 text-[9px] font-sans text-slate-400 p-2 bg-violet-950/15 border border-violet-900/15 rounded-xl font-medium leading-relaxed">
              <span className="font-semibold text-violet-400">🤖 AI Observatory Diagnostic:</span>
              <span className="ml-1 select-text block">
                {selectedNode.instability > 0.4
                  ? "Warnings triggered. High event throughput causes thread saturation. Decouple pipeline memory buffer indices."
                  : "Performance is optimal. Zero heap anomalies or structural drift detected on compiled abstract syntax trees."
                }
              </span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
