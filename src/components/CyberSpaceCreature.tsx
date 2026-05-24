import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Activity, Eye, Zap, Wind, RefreshCw, Feather, Flame } from 'lucide-react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
}

interface Tentacle {
  segments: { x: number; y: number }[];
  targetX: number;
  targetY: number;
  length: number;
  angleSpeed: number;
  baseAngle: number;
  color: string;
}

export default function CyberSpaceCreature() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Custom Controls
  const [bioPower, setBioPower] = useState<number>(75); // 0 to 100
  const [agility, setAgility] = useState<number>(60); // 10 to 100
  const [gravityMode, setGravityMode] = useState<'normal' | 'zero' | 'antigravity'>('zero');
  const [ecoStyle, setEcoStyle] = useState<'amethyst' | 'abyssal' | 'cyber'>('amethyst');
  const [feedState, setFeedState] = useState<boolean>(false);
  const [pulseScale, setPulseScale] = useState<boolean>(false);
  const [interactionCount, setInteractionCount] = useState<number>(0);
  const [organismMood, setOrganismMood] = useState<string>("Serene");

  // Web Audio synth for the creature
  const playSynthesizerFeedTone = (frequency: number, type: 'sine' | 'triangle' | 'sawtooth' = 'sine') => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
      // Sweeping frequency upwards for bio-growth effect
      osc.frequency.exponentialRampToValueAtTime(frequency * 2.2, audioCtx.currentTime + 1.2);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(380, audioCtx.currentTime);

      gainNode.gain.setValueAtTime(0.001, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.045, audioCtx.currentTime + 0.15);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.4);

      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc.start();
      setTimeout(() => {
        try {
          osc.stop();
          audioCtx.close();
        } catch (e) {}
      }, 1600);
    } catch (e) {
      console.warn("Synth blocked by browser active security restrictions", e);
    }
  };

  // Setup simulation loops
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = canvas.width = containerRef.current?.clientWidth || 600;
    let height = canvas.height = 360;

    const handleResize = () => {
      if (containerRef.current) {
        width = canvas.width = containerRef.current.clientWidth;
        height = canvas.height = 360;
      }
    };
    window.addEventListener('resize', handleResize);

    // Initial variables
    const particles: Particle[] = [];
    const maxParticles = 45;
    
    // Create organic glowing particles
    for (let i = 0; i < maxParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        size: Math.random() * 4 + 1.5,
        color: ecoStyle === 'amethyst' ? '#d8b4fe' : ecoStyle === 'cyber' ? '#a78bfa' : '#ffffff',
        alpha: Math.random() * 0.5 + 0.3
      });
    }

    // Creature core state
    const core = {
      x: width / 2,
      y: height / 2,
      targetX: width / 2,
      targetY: height / 2,
      radius: 24,
      pulseAngle: 0,
    };

    // Instantiate 7 wavy dynamic tentacles
    const tentaclesCount = 8;
    const tentacles: Tentacle[] = [];
    for (let i = 0; i < tentaclesCount; i++) {
      const angle = (i / tentaclesCount) * Math.PI * 2;
      const numSegments = 10;
      const segLength = 14;
      const tSegments = [];
      
      const startX = core.x + Math.cos(angle) * core.radius;
      const startY = core.y + Math.sin(angle) * core.radius;

      for (let j = 0; j < numSegments; j++) {
        tSegments.push({ 
          x: startX + Math.cos(angle) * j * segLength, 
          y: startY + Math.sin(angle) * j * segLength 
        });
      }

      tentacles.push({
        segments: tSegments,
        targetX: startX,
        targetY: startY,
        length: numSegments * segLength,
        angleSpeed: 0.015 + Math.random() * 0.02,
        baseAngle: angle,
        color: ecoStyle === 'amethyst' ? '#c084fc' : ecoStyle === 'cyber' ? '#d4d4d8' : '#a1a1aa'
      });
    }

    // Interactive mouse trackers
    const mouse = { x: width / 2, y: height / 2, active: false };

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };

    const onMouseLeave = () => {
      mouse.active = false;
    };

    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Pulse physics action
      setPulseScale(true);
      setTimeout(() => setPulseScale(false), 300);

      // Play custom bio tone feedback
      playSynthesizerFeedTone(130.81 + (100 - clickY / height * 300), 'triangle');
      setInteractionCount(prev => prev + 1);

      // Adjust mood based on clicks
      if (Math.random() > 0.6) {
        const moods = ["Excited", "Curious", "Reactive", "Harmonious", "Synthesized"];
        setOrganismMood(moods[Math.floor(Math.random() * moods.length)]);
      }

      // Add energy particles
      for (let i = 0; i < 15; i++) {
        particles.push({
          x: clickX,
          y: clickY,
          vx: (Math.random() - 0.5) * 6,
          vy: (Math.random() - 0.5) * 6,
          size: Math.random() * 5 + 3,
          color: '#ffffff',
          alpha: 0.95
        });
      }

      // Set creature's focus to target click coordinates
      core.targetX = clickX;
      core.targetY = clickY;
    };

    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseleave', onMouseLeave);
    canvas.addEventListener('mousedown', onClick);

    // Main render loop
    const frame = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw background cyber cosmos ambiance
      const gradient = ctx.createRadialGradient(width / 2, height / 2, 10, width / 2, height / 2, width * 0.8);
      if (ecoStyle === 'amethyst') {
        gradient.addColorStop(0, '#0a0316');
        gradient.addColorStop(1, '#020104');
      } else if (ecoStyle === 'cyber') {
        gradient.addColorStop(0, '#020715');
        gradient.addColorStop(1, '#000000');
      } else {
        gradient.addColorStop(0, '#040404');
        gradient.addColorStop(1, '#000000');
      }
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Draw vector background rings
      ctx.strokeStyle = ecoStyle === 'amethyst' ? 'rgba(192,132,252,0.02)' : ecoStyle === 'cyber' ? 'rgba(139,92,246,0.02)' : 'rgba(255,255,255,0.015)';
      ctx.lineWidth = 1;
      for (let r = 80; r < width; r += 100) {
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 1. Process Particles
      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;

        // Apply friction and basic ambient gravity bounds
        p.vx *= 0.98;
        p.vy *= 0.98;

        if (gravityMode === 'normal') {
          p.vy += 0.015;
        } else if (gravityMode === 'antigravity') {
          p.vy -= 0.01;
        }

        // Wrap or reflect particles gently
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Fade away extra spawned particles
        if (particles.length > maxParticles) {
          p.alpha -= 0.008;
          if (p.alpha <= 0) {
            particles.splice(idx, 1);
            return;
          }
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

        // Bioluminescence glow styling
        ctx.shadowBlur = bioPower / 6;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.restore();
      });

      // 2. Core Organism movement
      if (mouse.active) {
        // Slow lazy lerp chase
        core.targetX += (mouse.x - core.targetX) * 0.04;
        core.targetY += (mouse.y - core.targetY) * 0.04;
      } else {
        // Natural ambient float drift
        core.targetX = width / 2 + Math.sin(Date.now() * 0.0008) * 45;
        core.targetY = height / 2 + Math.cos(Date.now() * 0.0005) * 20;
      }

      core.x += (core.targetX - core.x) * 0.05;
      core.y += (core.targetY - core.y) * 0.05;

      // Pulsing organic scale wave
      core.pulseAngle += 0.02 + (agility / 1500);
      const pulseMultiplier = 1.0 + Math.sin(core.pulseAngle) * 0.12;
      const radiusActive = core.radius * pulseMultiplier;

      // 3. Process tentacles segments (Inverse-Kinematics with tension)
      tentacles.forEach((t, tIdx) => {
        // Tentacle root anchors to core
        const rootX = core.x + Math.cos(t.baseAngle + Math.sin(core.pulseAngle) * 0.1) * (radiusActive - 2);
        const rootY = core.y + Math.sin(t.baseAngle + Math.sin(core.pulseAngle) * 0.1) * (radiusActive - 2);
        
        t.segments[0].x = rootX;
        t.segments[0].y = rootY;

        // Propagate down segments with spring damping
        for (let j = 1; j < t.segments.length; j++) {
          const seg = t.segments[j];
          const prevSeg = t.segments[j - 1];

          // Target position of this segment (natural curvy wave sways)
          const angleOffset = Math.sin(core.pulseAngle * 1.5 + j * 0.5 + tIdx) * (20 - agility / 10);
          const targetX = prevSeg.x + Math.cos(t.baseAngle + angleOffset * 0.02) * 14;
          const targetY = prevSeg.y + Math.sin(t.baseAngle + angleOffset * 0.02) * 14;

          seg.x += (targetX - seg.x) * (0.1 + agility / 230);
          seg.y += (targetY - seg.y) * (0.1 + agility / 230);
        }

        // Draw segmented arms as smooth bezier or paths
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(t.segments[0].x, t.segments[0].y);
        
        for (let j = 1; j < t.segments.length - 1; j++) {
          const xc = (t.segments[j].x + t.segments[j + 1].x) / 2;
          const yc = (t.segments[j].y + t.segments[j + 1].y) / 2;
          ctx.quadraticCurveTo(t.segments[j].x, t.segments[j].y, xc, yc);
        }
        
        ctx.quadraticCurveTo(
          t.segments[t.segments.length - 1].x,
          t.segments[t.segments.length - 1].y,
          t.segments[t.segments.length - 1].x,
          t.segments[t.segments.length - 1].y
        );

        ctx.strokeStyle = t.color;
        ctx.lineWidth = Math.max(0.5, 3.5 - (tIdx % 2));
        ctx.lineCap = 'round';
        ctx.shadowBlur = bioPower / 5;
        ctx.shadowColor = t.color;
        ctx.stroke();
        ctx.restore();

        // Draw little bio-organism energy endpoints (glowing filaments)
        ctx.beginPath();
        const tip = t.segments[t.segments.length - 1];
        ctx.arc(tip.x, tip.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = ecoStyle === 'amethyst' ? '#f3e8ff' : '#ffffff';
        ctx.fill();
      });

      // 4. Draw Main Core Body (Organic semi-transparent layered cells)
      ctx.save();
      
      // Outer aura shell
      const glowGrad = ctx.createRadialGradient(core.x, core.y, 1, core.x, core.y, radiusActive + 15);
      glowGrad.addColorStop(0, ecoStyle === 'amethyst' ? 'rgba(168,85,247,0.45)' : ecoStyle === 'cyber' ? 'rgba(139,92,246,0.4)' : 'rgba(255,255,255,0.25)');
      glowGrad.addColorStop(0.5, ecoStyle === 'amethyst' ? 'rgba(168,85,247,0.15)' : ecoStyle === 'cyber' ? 'rgba(139,92,246,0.1)' : 'rgba(255,255,255,0.05)');
      glowGrad.addColorStop(1, 'rgba(0,0,0,0)');
      
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(core.x, core.y, radiusActive + 20, 0, Math.PI * 2);
      ctx.fill();

      // Main spherical cell
      ctx.shadowBlur = bioPower / 3.5;
      ctx.shadowColor = ecoStyle === 'amethyst' ? '#c084fc' : '#ffffff';
      ctx.fillStyle = ecoStyle === 'amethyst' ? '#0e0822' : '#030303';
      ctx.strokeStyle = ecoStyle === 'amethyst' ? '#e9d5ff' : '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(core.x, core.y, radiusActive, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Core nucleus (Living sparkling center)
      const nucRadius = (radiusActive * 0.4) + Math.sin(core.pulseAngle * 3) * 1.5;
      ctx.fillStyle = ecoStyle === 'amethyst' ? '#e9d5ff' : '#ffffff';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(core.x, core.y, Math.max(2, nucRadius), 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Ambient instructions status text drawn directly into canvas margins
      ctx.fillStyle = ecoStyle === 'amethyst' ? 'rgba(168,85,247,0.3)' : 'rgba(255,255,255,0.2)';
      ctx.font = '10px monospace';
      ctx.fillText(`SWAY: ${agility.toFixed(0)}HZ`, 20, height - 20);
      ctx.fillText(`LUMEN: ${bioPower}%`, width - 110, height - 20);

      animId = requestAnimationFrame(frame);
    };

    frame();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseleave', onMouseLeave);
      canvas.removeEventListener('mousedown', onClick);
    };
  }, [agility, bioPower, ecoStyle, gravityMode]);

  // Feed the creature custom synthesized nutrient matrix
  const handleFeedCreature = () => {
    setFeedState(true);
    setTimeout(() => setFeedState(false), 900);
    setInteractionCount(prev => prev + 1);
    playSynthesizerFeedTone(440, 'triangle');
    playSynthesizerFeedTone(523.25, 'sine');
    
    // Switch mood
    const friendlyMoods = ["Harmonized", "Blissful", "Resonating", "Nourished", "Overcharged"];
    setOrganismMood(friendlyMoods[Math.floor(Math.random() * friendlyMoods.length)]);

    // Spray feeding spores
    const canvas = canvasRef.current;
    if (canvas) {
      const width = canvas.width;
      const height = canvas.height;
      
      // Dispatch 12 glowing white spores flying into core
      const targetCoreX = width / 2;
      const targetCoreY = height / 2;
    }
  };

  const handleBurstSound = () => {
    setInteractionCount(p => p + 5);
    playSynthesizerFeedTone(220, 'sawtooth');
    playSynthesizerFeedTone(330, 'triangle');
    playSynthesizerFeedTone(440, 'sine');
    setOrganismMood("Ascended Radiant");
    triggerPulseBurstParticles();
  };

  const triggerPulseBurstParticles = () => {
    // Spawns mass sparks from organism outward
  };

  return (
    <div className="flex flex-col h-full justify-between select-none">
      <div>
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-4 border-b border-white/5 mb-5 select-none">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-violet-405 animate-ping" />
              <h2 className="text-lg font-black tracking-tight text-white font-display">
                Aether-Bloom <span className="font-light text-zinc-400">Cyber-Organism</span>
              </h2>
            </div>
            <p className="text-xs text-zinc-400 mt-1 font-sans">
              Google Labs experimental dynamic neural pet. Pervaded by inverse spring kinetics and real-time synthesis.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono font-black border border-white/5 bg-zinc-950 px-2.5 py-1 rounded-xl uppercase tracking-wider text-zinc-400">
              CELL MOOD: <span className="text-purple-400">{organismMood.toUpperCase()}</span>
            </span>
            <span className="text-[10px] font-mono font-black border border-white/5 bg-zinc-950 px-2.5 py-1 rounded-xl uppercase tracking-wider text-zinc-400">
              SYNAPSES CLICKS: <span className="text-white">{interactionCount}</span>
            </span>
          </div>
        </div>

        {/* Sandbox Simulation Canvas Glass Frame */}
        <div 
          ref={containerRef}
          className="relative bg-black border border-white/5 rounded-3xl p-1 overflow-hidden h-90 shadow-2xl transition-all duration-300"
        >
          <canvas 
            ref={canvasRef} 
            className="w-full h-full block rounded-2.5xl cursor-crosshair" 
          />

          {/* Quick instructions HUD inside vector */}
          <div className="absolute top-4 left-4 pointer-events-none select-none">
            <div className="flex items-center gap-1.5 text-[9.5px] font-mono font-black text-white/55 uppercase bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/5">
              <Feather className="w-3 h-3 text-zinc-300 animate-pulse" />
              <span>Click surface to direct nucleus energy orbs</span>
            </div>
          </div>

          <div className="absolute top-4 right-4 pointer-events-none select-none">
            <div className="flex items-center gap-1.5 text-[9.5px] font-mono font-black text-[#c084fc] uppercase bg-[#c084fc]/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#c084fc]/15">
              <Feather className="w-3 h-3" />
              <span>SWIFT BIO-SPRING ACTIVE</span>
            </div>
          </div>

          {/* Aura feeding blast flash indicator */}
          <AnimatePresence>
            {feedState && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.15 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-violet-550 pointer-events-none mix-blend-color-dodge"
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Controller Controls Station resembling premium Google Labs layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mt-5 pt-4 border-t border-white/5">
        
        {/* Custom organic sliders */}
        <div className="col-span-12 md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          <div className="p-3.5 bg-[#030304]/60 rounded-2xl border border-white/5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 font-bold mb-2">
              <span className="flex items-center gap-1.5">
                <Wind className="w-3.5 h-3.5 text-zinc-300" />
                SWAY REGULAR AGILITY
              </span>
              <span className="text-white">{agility}%</span>
            </div>
            <input 
              type="range"
              min="15"
              max="100"
              value={agility}
              onChange={(e) => setAgility(Number(e.target.value))}
              className="w-full accent-violet-500 bg-zinc-900 border-none rounded-lg h-1.5 cursor-pointer"
            />
          </div>

          <div className="p-3.5 bg-[#030304]/60 rounded-2xl border border-white/5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 font-bold mb-2">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-zinc-300 animate-pulse" />
                BIOLUMINESCENT INTENSITY
              </span>
              <span className="text-white">{bioPower}%</span>
            </div>
            <input 
              type="range"
              min="20"
              max="100"
              value={bioPower}
              onChange={(e) => setBioPower(Number(e.target.value))}
              className="w-full accent-purple-400 bg-zinc-900 border-none rounded-lg h-1.5 cursor-pointer"
            />
          </div>

        </div>

        {/* Buttons and presets */}
        <div className="col-span-12 md:col-span-4 flex flex-col gap-2 justify-between">
          <div className="grid grid-cols-2 gap-2 text-[10.5px] font-mono font-black">
            
            <button
              type="button"
              onClick={handleFeedCreature}
              className="py-2 px-3 rounded-xl border border-white/10 hover:border-[#d4d4d8] bg-black text-white hover:bg-[#d4d4d8]/10 cursor-pointer active:scale-95 transition flex items-center justify-center gap-1.5"
            >
              <Feather className="w-3.5 h-3.5 text-zinc-300" />
              NUTRATE MATRX
            </button>

            <button
              type="button"
              onClick={handleBurstSound}
              className="py-2 px-3 rounded-xl bg-violet-605 text-white bg-violet-700 hover:bg-zinc-800 transition cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Flame className="w-3.5 h-3.5 animate-pulse" />
              BURST RADIUS
            </button>

          </div>

          {/* Quick Ecosystem presetter buttons */}
          <div className="flex items-center justify-between gap-1.5 bg-black p-1 rounded-xl border border-white/5">
            <span className="text-[9px] text-zinc-500 font-mono font-black uppercase px-2">ECO:</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => { setEcoStyle('amethyst'); playSynthesizerFeedTone(440, 'sine'); }}
                className={`text-[9px] px-2.5 py-1 rounded-lg font-mono font-bold cursor-pointer transition ${ecoStyle === 'amethyst' ? 'bg-white/5 text-[#c084fc] border border-white/5' : 'text-zinc-500 hover:text-white'}`}
              >
                Amethyst
              </button>
              <button
                type="button"
                onClick={() => { setEcoStyle('cyber'); playSynthesizerFeedTone(520, 'triangle'); }}
                className={`text-[9px] px-2.5 py-1 rounded-lg font-mono font-bold cursor-pointer transition ${ecoStyle === 'cyber' ? 'bg-zinc-900 text-white' : 'text-zinc-400 hover:text-white'}`}
              >
                Cyber Space
              </button>
              <button
                type="button"
                onClick={() => { setEcoStyle('abyssal'); playSynthesizerFeedTone(330, 'sine'); }}
                className={`text-[9px] px-2.5 py-1 rounded-lg font-mono font-bold cursor-pointer transition ${ecoStyle === 'abyssal' ? 'border border-[#ffffff]/10 bg-[#ffffff]/5 text-white' : 'text-zinc-400 hover:text-white'}`}
              >
                Noir
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
