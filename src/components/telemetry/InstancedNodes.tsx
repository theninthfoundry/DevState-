import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
// @ts-ignore
import { forceSimulation, forceManyBody, forceLink, forceCenter, forceX, forceY, forceZ } from 'd3-force-3d';

// JSM imports for zero-dependency high-perf Bloom pass
// @ts-ignore
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
// @ts-ignore
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
// @ts-ignore
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

export interface NeuralNode {
  id: string;
  group: 'service' | 'ui' | 'api' | 'config';
  technicalDebt: number; // 0 to 1
  description?: string;
  name?: string;
}

interface NeuralGraphProps {
  nodes: NeuralNode[];
  links: { source: string; target: string }[];
  chargeStrength: number;
  linkDistance: number;
  gravity: number;
  onNodeSelect?: (node: NeuralNode) => void;
  showLabels?: boolean;
}

const Bloom: React.FC = () => {
  const { gl, scene, camera, size } = useThree();

  const composer = useMemo(() => {
    const comp = new EffectComposer(gl);
    const renderPass = new RenderPass(scene, camera);
    comp.addPass(renderPass);

    // Resolution, strength, radius, threshold for incredible Neo-Tokyo neon glow
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(size.width, size.height),
      2.0,  // intense glow strength
      0.65, // wider glow radius
      0.08  // lower threshold to make neon colors pop intensely
    );
    comp.addPass(bloomPass);
    return comp;
  }, [gl, scene, camera, size.width, size.height]);

  useEffect(() => {
    composer.setSize(size.width, size.height);
  }, [composer, size.width, size.height]);

  useFrame(() => {
    gl.clear();
    composer.render();
  }, 1); // high priority to oversee R3F render loop

  return null;
};

export const InstancedNodes: React.FC<NeuralGraphProps> = ({ 
  nodes, 
  links, 
  chargeStrength, 
  linkDistance, 
  gravity,
  onNodeSelect,
  showLabels = true
}) => {
  const innerCoresRef = useRef<THREE.InstancedMesh>(null);
  const outerHalosRef = useRef<THREE.InstancedMesh>(null);
  const pulsesRef = useRef<THREE.InstancedMesh>(null);
  const lineRef = useRef<THREE.LineSegments>(null);
  
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Scratch objects for zero-garbage-collection calculations per frame
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);

  // Initialize interactive BufferAttribute color cache for inner cores and outer halos
  const colorsCoC = useMemo(() => {
    const arr = new Float32Array(nodes.length * 3);
    for (let i = 0; i < nodes.length; i++) {
      arr[i * 3] = 0.5;
      arr[i * 3 + 1] = 0.3;
      arr[i * 3 + 2] = 0.9;
    }
    return arr;
  }, [nodes.length]);

  // Static allocation of vertex path lines
  const linePositions = useMemo(() => {
    return new Float32Array(links.length * 2 * 3);
  }, [links.length]);

  // D3-Force-3D simulation
  const simulation = useMemo(() => {
    const simNodes = nodes.map(n => ({ ...n, x: (Math.random() - 0.5) * 12, y: (Math.random() - 0.5) * 12, z: (Math.random() - 0.5) * 12 }));
    const simLinks = links.map(l => ({ ...l }));

    const sim = forceSimulation(simNodes)
      .force('charge', forceManyBody().strength(chargeStrength))
      .force('link', forceLink(simLinks).id((d: any) => d.id).distance(linkDistance))
      .force('x', forceX(0).strength(gravity * 0.04))
      .force('y', forceY(0).strength(gravity * 0.04))
      .force('z', forceZ(0).strength(gravity * 0.04))
      .stop();

    return { sim, simNodes };
  }, [nodes, links]);

  // Push new real-time force sliders changes smoothly into simulation parameters
  useEffect(() => {
    const chargeForce = simulation.sim.force('charge');
    if (chargeForce) {
      (chargeForce as any).strength(chargeStrength);
    }
    const linkForce = simulation.sim.force('link');
    if (linkForce) {
      (linkForce as any).distance(linkDistance);
    }
    const xForce = simulation.sim.force('x');
    if (xForce) (xForce as any).strength(gravity * 0.04);
    const yForce = simulation.sim.force('y');
    if (yForce) (yForce as any).strength(gravity * 0.04);
    const zForce = simulation.sim.force('z');
    if (zForce) (zForce as any).strength(gravity * 0.04);

    simulation.sim.alpha(0.35).restart();
  }, [chargeStrength, linkDistance, gravity, simulation]);

  // 60FPS physics ticking and dynamic matrix/attributes updates
  useFrame((state) => {
    if (!innerCoresRef.current || !outerHalosRef.current) return;

    // Tick simulation physical dynamics
    simulation.sim.alphaTarget(0.01).tick();

    const colorsAttr = innerCoresRef.current.instanceColor;
    const colorsArray = colorsAttr ? (colorsAttr.array as Float32Array) : null;

    const halosColorsAttr = outerHalosRef.current.instanceColor;
    const halosColorsArray = halosColorsAttr ? (halosColorsAttr.array as Float32Array) : null;

    // Update nodes coordinates, sizes, and binary color arrays
    simulation.simNodes.forEach((node, i) => {
      const isHovered = hoveredIndex === i;
      let scaleCoefficient = isHovered ? 2.2 : 1.0;
      
      const pulseSpeed = isHovered ? 0.012 : 0.005;
      const pulseAmplitude = isHovered ? 0.25 : 0.12;
      const pulse = scaleCoefficient + Math.sin(Date.now() * pulseSpeed + i) * pulseAmplitude;
      
      // Update Inner Solid Core Matrix
      dummy.position.set(node.x, node.y, (node as any).z || 0);
      dummy.scale.set(pulse, pulse, pulse);
      dummy.rotation.set(0, 0, 0); // Core remains solid and unrotated
      dummy.updateMatrix();
      innerCoresRef.current!.setMatrixAt(i, dummy.matrix);

      // Update Outer Holographic Rotating Wireframe Geometry Matrix
      // Rotate around arbitrary cybernetic axes based on clocks
      dummy.scale.set(pulse * 1.55, pulse * 1.55, pulse * 1.55);
      dummy.rotation.x = state.clock.elapsedTime * 0.45 + i;
      dummy.rotation.y = state.clock.elapsedTime * 0.35;
      dummy.rotation.z = state.clock.elapsedTime * 0.15;
      dummy.updateMatrix();
      outerHalosRef.current!.setMatrixAt(i, dummy.matrix);

      // Map color via BufferAttribute bypassing setColorAt
      if (colorsArray) {
        if (isHovered) {
          // Glow Neon gold-white when hovered
          color.setRGB(1.8, 1.4, 0.4);
        } else {
          const techDebt = (node as any).technicalDebt || 0;
          if (techDebt > 0.7) {
            // Neon red alert peak
            color.setHSL(0.96, 1.0, 0.58);
          } else if (techDebt > 0.4) {
            // High amber load level
            color.setHSL(0.08, 0.95, 0.55);
          } else {
            // Healthy cobalt / electric blue glow HSL
            color.setHSL(0.58, 0.9, 0.58);
          }
        }
        
        const offset = i * 3;
        
        // Write Core Color
        colorsArray[offset] = color.r;
        colorsArray[offset + 1] = color.g;
        colorsArray[offset + 2] = color.b;

        // Write Halo Color (Outer rotating cage glows a matching neon hue with higher tone map override)
        if (halosColorsArray) {
          halosColorsArray[offset] = color.r * 1.2;
          halosColorsArray[offset + 1] = color.g * 1.2;
          halosColorsArray[offset + 2] = color.b * 1.2;
        }
      }
    });

    innerCoresRef.current.instanceMatrix.needsUpdate = true;
    if (colorsAttr) colorsAttr.needsUpdate = true;

    outerHalosRef.current.instanceMatrix.needsUpdate = true;
    if (halosColorsAttr) halosColorsAttr.needsUpdate = true;

    // ACTIVE DATA STREAMS: Update real-time fiber pulses along connection lines
    if (pulsesRef.current && links.length > 0) {
      links.forEach((link, i) => {
        const sourceId = typeof link.source === 'object' ? (link.source as any).id : link.source;
        const targetId = typeof link.target === 'object' ? (link.target as any).id : link.target;

        const sourceNode = simulation.simNodes.find(n => n.id === sourceId);
        const targetNode = simulation.simNodes.find(n => n.id === targetId);

        if (sourceNode && targetNode) {
          // Calculate dynamic position interpolation (0.0 to 1.0) based on clock
          const speed = 0.6;
          const phaseOffset = i * 0.17;
          const t = (state.clock.elapsedTime * speed + phaseOffset) % 1.0;

          // Perform linear interpolation in 3D Space
          const px = THREE.MathUtils.lerp(sourceNode.x, targetNode.x, t);
          const py = THREE.MathUtils.lerp(sourceNode.y, targetNode.y, t);
          const pz = THREE.MathUtils.lerp((sourceNode as any).z || 0, (targetNode as any).z || 0, t);

          dummy.position.set(px, py, pz);
          // Scale pulses to be highly visible bright glowing neon widgets
          dummy.scale.set(0.42, 0.42, 0.42);
          dummy.rotation.set(0, 0, 0);
          dummy.updateMatrix();
          pulsesRef.current!.setMatrixAt(i, dummy.matrix);

          // Neon purple-magenta data-pulse color
          color.setRGB(1.8, 0.2, 1.4);
          pulsesRef.current!.setColorAt(i, color);
        } else {
          // Hide inactive pulses
          dummy.position.set(0, 0, 0);
          dummy.scale.set(0, 0, 0);
          dummy.updateMatrix();
          pulsesRef.current!.setMatrixAt(i, dummy.matrix);
        }
      });
      pulsesRef.current.instanceMatrix.needsUpdate = true;
      if (pulsesRef.current.instanceColor) {
        pulsesRef.current.instanceColor.needsUpdate = true;
      }
    }

    // Build static connection lines mapping
    if (lineRef.current && links.length > 0) {
      const posArr = lineRef.current.geometry.attributes.position.array as Float32Array;
      links.forEach((link, i) => {
        const sourceId = typeof link.source === 'object' ? (link.source as any).id : link.source;
        const targetId = typeof link.target === 'object' ? (link.target as any).id : link.target;

        const sourceNode = simulation.simNodes.find(n => n.id === sourceId);
        const targetNode = simulation.simNodes.find(n => n.id === targetId);

        const idx = i * 6;
        if (sourceNode && targetNode) {
          posArr[idx] = sourceNode.x;
          posArr[idx + 1] = sourceNode.y;
          posArr[idx + 2] = (sourceNode as any).z || 0;

          posArr[idx + 3] = targetNode.x;
          posArr[idx + 4] = targetNode.y;
          posArr[idx + 5] = (targetNode as any).z || 0;
        } else {
          posArr[idx] = 0; posArr[idx + 1] = 0; posArr[idx + 2] = 0;
          posArr[idx + 3] = 0; posArr[idx + 4] = 0; posArr[idx + 5] = 0;
        }
      });
      lineRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  const activeHoveredNode = hoveredIndex !== null ? simulation.simNodes[hoveredIndex] : null;

  return (
    <>
      {/* Neo-Tokyo Bloom bloom glowing filters */}
      <Bloom />

      {/* Fiber-Optic Connection Cable Lines */}
      {links.length > 0 && (
        <lineSegments ref={lineRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[linePositions, 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial 
            color="#a78bfa" 
            opacity={0.22} 
            transparent 
            depthWrite={false} 
            linewidth={1.5}
            blending={THREE.AdditiveBlending}
          />
        </lineSegments>
      )}

      {/* SOLID INNER CORES - high counts performance */}
      <instancedMesh
        key={`cores-${nodes.length}`}
        ref={innerCoresRef}
        args={[null as any, null as any, nodes.length]}
        onPointerOver={(e) => {
          e.stopPropagation();
          if (e.instanceId !== undefined) {
            setHoveredIndex(e.instanceId);
          }
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHoveredIndex(null);
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (e.instanceId !== undefined && onNodeSelect) {
            onNodeSelect(simulation.simNodes[e.instanceId]);
          }
        }}
      >
        <sphereGeometry args={[0.9, 16, 16]} />
        <meshBasicMaterial toneMapped={false} />
        
        <instancedBufferAttribute
          attach="instanceColor"
          args={[colorsCoC, 3]}
        />
      </instancedMesh>

      {/* HOLOGRAPHIC OUTER ROTATING HALO ICOSAHEDRONS */}
      <instancedMesh
        key={`halos-${nodes.length}`}
        ref={outerHalosRef}
        args={[null as any, null as any, nodes.length]}
        onPointerOver={(e) => {
          e.stopPropagation();
          if (e.instanceId !== undefined) {
            setHoveredIndex(e.instanceId);
          }
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHoveredIndex(null);
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (e.instanceId !== undefined && onNodeSelect) {
            onNodeSelect(simulation.simNodes[e.instanceId]);
          }
        }}
      >
        <icosahedronGeometry args={[1.35, 0]} />
        <meshBasicMaterial 
          wireframe 
          transparent 
          opacity={0.35} 
          toneMapped={false} 
          blending={THREE.AdditiveBlending}
        />
        
        <instancedBufferAttribute
          attach="instanceColor"
          args={[new Float32Array(colorsCoC), 3]}
        />
      </instancedMesh>

      {/* ACTIVE DATA INTERPOLATED STREAM PULSES */}
      {links.length > 0 && (
        <instancedMesh
          key={`pulses-${links.length}`}
          ref={pulsesRef}
          args={[null as any, null as any, links.length]}
        >
          <sphereGeometry args={[1.0, 8, 8]} />
          <meshBasicMaterial toneMapped={false} />
        </instancedMesh>
      )}

      {/* Spatial glassmorphic 2D HUD UI Label Tracker */}
      {activeHoveredNode && (
        <Html
          position={[activeHoveredNode.x, activeHoveredNode.y, (activeHoveredNode as any).z || 0]}
          center
          style={{ transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)' }}
          zIndexRange={[100, 0]}
        >
          <div className="bg-[#050609]/90 border border-violet-500/40 text-white p-3.5 rounded-xl shadow-[0_0_24px_rgba(139,92,246,0.35)] backdrop-blur-md pointer-events-none min-w-[210px] font-mono text-[10px] space-y-2 z-50 transform translate-y-10 animate-fade-in">
            <div className="flex items-center justify-between border-b border-white/10 pb-1.5 gap-2">
              <span className="font-black text-violet-400 truncate max-w-[130px]" title={activeHoveredNode.name || activeHoveredNode.id}>
                {activeHoveredNode.name || activeHoveredNode.id}
              </span>
              <span className="text-[8px] tracking-widest shrink-0 bg-violet-600/10 border border-violet-500/30 text-violet-300 px-1.5 py-0.5 rounded font-black uppercase">
                {activeHoveredNode.group}
              </span>
            </div>
            
            <div className="space-y-1 text-slate-300">
              <div className="flex justify-between items-center text-[9px]">
                <span className="text-slate-400">Technical Debt:</span>
                <span className={`font-bold ${((activeHoveredNode as any).technicalDebt || 0) > 0.65 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {Math.round(((activeHoveredNode as any).technicalDebt || 0) * 100)}%
                </span>
              </div>
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mt-1">
                <div 
                  className={`h-full ${((activeHoveredNode as any).technicalDebt || 0) > 0.65 ? 'bg-red-500' : 'bg-emerald-500'}`} 
                  style={{ width: `${Math.round(((activeHoveredNode as any).technicalDebt || 0) * 100)}%` }}
                />
              </div>
              <div className="text-[8.5px] italic text-slate-400 line-clamp-2 mt-1.5 pt-1.5 border-t border-white/5 leading-relaxed">
                {(activeHoveredNode as any).description || 'Workspace cybernetic module.'}
              </div>
            </div>
          </div>
        </Html>
      )}

      {/* Dynamic 2D Permanent Particle Labels on the Spatial Grid */}
      {showLabels && simulation.simNodes.map((node, i) => {
        const isHovered = hoveredIndex === i;
        const displayName = node.name || node.id;
        const cleanName = displayName.includes('/') 
          ? displayName.split('/').pop() || displayName 
          : displayName;

        return (
          <Html
            key={`p-label-${node.id}`}
            position={[node.x, node.y - 1.6, (node as any).z || 0]}
            center
            pointerEvents="none"
            zIndexRange={[80, 0]}
          >
            <div 
              className={`font-mono text-[7.5px] tracking-tight transition-all duration-300 select-none bg-slate-950/80 border text-center px-1.5 py-0.5 rounded backdrop-blur-sm pointer-events-none whitespace-nowrap shadow-sm min-w-[30px] ${
                isHovered 
                  ? 'text-white border-violet-400 font-extrabold scale-110 shadow-[0_0_12px_rgba(139,92,246,0.35)] bg-[#050609]' 
                  : 'text-slate-400 border-slate-800/50 opacity-80'
              }`}
            >
              {cleanName}
            </div>
          </Html>
        );
      })}
    </>
  );
};
