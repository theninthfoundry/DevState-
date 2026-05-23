# DevState HUD: Cognitive Engineering Intelligence System
## Core Architecture Specification & Implementation Blueprints

Prepared by the **Core Cognitive Architect of DevState HUD**

---

## 1. Architectural Vision
DevState HUD is a futuristic software observatory and developer intelligence cockpit. It rejects typical low-density SaaS layouts in favor of an immersive, high-frequency, dark-mode cockpit modeled after **Neo Tokyo cyberpunk minimalism** combined with **Apple-grade visual precision**.

```
                           +----------------------------------------+
                           |         DevState Core HUD Client       |
                           |  - Workspace Telemetry  - AI Chat HUD  |
                           |  - Dependency Graph     - Terminal OS  |
                           +----------------------------------------+
                                               ||
                                    (Secure Keep-Alive WebSockets)
                                               ||
                                               \/
                           +----------------------------------------+
                           |      Bun + Fastify Telemetry Host      |
                           +----------------------------------------+
                             /                 |                  \
                            /                  |                   \
                           v                   v                    v
                 [AST Parsing Engine]   [Async FS Crawler]   [Semantic Indexer]
                         |                     |                    |
                 (TS Compiler API)      (Worker Threads)     (Vector Store)
```

---

## 2. Frontend Architecture Blueprint (Next.js + Tailwind + Zustand)

### A. Folder Architecture (`/src/hud/`)

```
src/hud/
├── assets/                  # Ambient audio, premium icons, cyberpunk styling curves
├── components/
│   ├── ui/                  # Cinematic Glassmorphic Design System Components
│   │   ├── glass-card.tsx   # Custom refractive backdrop blurred card
│   │   ├── glow-badge.tsx   # Pulsating status container with status luminescence
│   │   └── neural-button.tsx# Magnetic animated micro-interaction triggers
│   ├── telemetry/
│   │   ├── speedo-gauge.tsx # Dynamic SVG radial vision-alignment indicator
│   │   ├── stream-chart.tsx # Real-time line/bento graphs with high-density data
│   │   └── neural-graph.tsx  # Dynamic interactive network grid map
│   ├── navigation/
│   │   ├── sidebar.tsx      # Multi-dimensional sliding sidebar layout
│   │   └── command-deck.tsx # Shift+K instant Command Palette override
│   └── companion/
│       └── ai-panel.tsx     # Floating assistant panel overlay with chat feeds
├── hooks/
│   ├── use-keyboard.ts      # Global keyboard shortcuts register (CMD+K, ESC)
│   ├── use-magnetic.ts      # GPU-accelerated magnetic cursor tracking hooks
│   └── use-telemetry.ts     # Real-time WebSocket event pipelines handler
└── store/
    └── index.ts             # Central HUD Store backed by Zustand & localStorage
```

### B. Core State Store (`useHUDStore.ts`)

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TelemetryMetrics {
  cognitiveLoad: number;
  visionAlignment: number;
  filesInspected: number;
  activeErrors: number;
  healthyModules: number;
}

export interface ActivityLog {
  id: string;
  source: string;
  message: string;
  type: 'info' | 'warn' | 'error' | 'success';
  timestamp: string;
}

interface HUDState {
  hudActive: boolean;
  activeView: 'observatory' | 'dependency' | 'terminal' | 'companion';
  metrics: TelemetryMetrics;
  commandPaletteOpen: boolean;
  logs: ActivityLog[];
  caffeineFuel: number;
  toggleHUD: () => void;
  setView: (view: HUDState['activeView']) => void;
  setCommandPalette: (open: boolean) => void;
  addLog: (log: Omit<ActivityLog, 'id' | 'timestamp'>) => void;
  refuelCaffeine: () => void;
  updateMetrics: (newMetrics: Partial<TelemetryMetrics>) => void;
}

export const useHUDStore = create<HUDState>()(
  persist(
    (set) => ({
      hudActive: true,
      activeView: 'observatory',
      metrics: {
        cognitiveLoad: 42,
        visionAlignment: 94,
        filesInspected: 154,
        activeErrors: 0,
        healthyModules: 148,
      },
      commandPaletteOpen: false,
      logs: [],
      caffeineFuel: 100,
      toggleHUD: () => set((state) => ({ hudActive: !state.hudActive })),
      setView: (view) => set({ activeView: view }),
      setCommandPalette: (open) => set({ commandPaletteOpen: open }),
      addLog: (log) => set((state) => ({
        logs: [
          { ...log, id: Math.random().toString(36).substring(7), timestamp: new Date().toISOString() },
          ...state.logs.slice(0, 99)
        ]
      })),
      refuelCaffeine: () => set((state) => ({ caffeineFuel: Math.min(100, state.caffeineFuel + 15) })),
      updateMetrics: (newMetrics) => set((state) => ({ metrics: { ...state.metrics, ...newMetrics } })),
    }),
    { name: 'devstate-hud-storage' }
  )
);
```

### C. Glassmorphic Core Framework Component Sample (`glass-card.tsx`)

```tsx
import React from 'react';

interface GlassCardProps {
  id?: string;
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  onHoverGlow?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  id,
  children,
  className = '',
  glowColor = 'rgba(139,92,246,0.15)', // Default sleek violet
  onHoverGlow = true
}) => {
  return (
    <div
      id={id}
      className={`relative rounded-3xl border border-slate-800/80 bg-gradient-to-b from-[#0e1017]/95 to-[#050609]/95 backdrop-blur-xl shadow-2xl transition-all duration-300 ${onHoverGlow ? 'hover:-translate-y-0.5 hover:border-violet-500/30' : ''} ${className}`}
      style={{
        boxShadow: `0 4px 30px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.05), 0 0 40px ${glowColor}`
      }}
    >
      {/* Decorative Matrix Corner Accent Grid */}
      <div className="absolute top-3 left-3 w-1.5 h-1.5 border-t border-l border-slate-700/60 pointer-events-none" />
      <div className="absolute top-3 right-3 w-1.5 h-1.5 border-t border-r border-slate-700/60 pointer-events-none" />
      <div className="absolute bottom-3 left-3 w-1.5 h-1.5 border-b border-l border-slate-700/60 pointer-events-none" />
      <div className="absolute bottom-3 right-3 w-1.5 h-1.5 border-b border-r border-slate-700/60 pointer-events-none" />
      
      {children}
    </div>
  );
};
```

---

## 3. Backend Architecture Blueprint (Node.js + Bun + Fastify)

### A. Folder Architecture (`/src/server/`)

```
src/server/
├── index.ts                 # Full-stack engine startup hook
├── gateway/
│   ├── fastify-server.ts    # Secure HTTP router configuration
│   └── websocket-hub.ts     # Multi-threaded WebSocket channel broadcaster
├── scanner/
│   ├── directory-walker.ts  # Multi-threaded filesystem traversal engine
│   ├── ast-parser.ts        # TypeScript Compiler AST analyzer & todo extractor
│   └── dependency-analyzer.ts# Dynamic module path verification service
└── ai/
    ├── inference-orchestrate.ts# Fallback pipeline orchestrator
    └── semantic-indexer.ts  # Mini-vector storage context embedding search
```

### B. High-Performance AST Dependency Scanner (`ast-parser.ts`)

```typescript
import * as ts from 'typescript';
import * as fs from 'fs';

export interface ASTAnalysisResult {
  imports: string[];
  exports: string[];
  complexityScore: number;
  todoStubs: string[];
}

export function parseSourceFileAST(filePath: string): ASTAnalysisResult {
  const content = fs.readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true
  );

  const imports: string[] = [];
  const exports: string[] = [];
  const todoStubs: string[] = [];
  let tokenCount = 0;
  let branchCount = 0;

  function traverseNode(node: ts.Node) {
    tokenCount++;

    // 1. Identify Import Structures safely
    if (ts.isImportDeclaration(node)) {
      const moduleSpecifier = node.moduleSpecifier;
      if (ts.isStringLiteral(moduleSpecifier)) {
        imports.push(moduleSpecifier.text);
      }
    }

    // 2. Identify Export Structures safely
    if (ts.isExportDeclaration(node)) {
      const moduleSpecifier = node.moduleSpecifier;
      if (moduleSpecifier && ts.isStringLiteral(moduleSpecifier)) {
        exports.push(moduleSpecifier.text);
      }
    }

    // 3. Complexity analysis via control flow density estimation
    if (
      ts.isIfStatement(node) ||
      ts.isConditionalExpression(node) ||
      ts.isSwitchStatement(node) ||
      ts.isForStatement(node) ||
      ts.isForOfStatement(node) ||
      ts.isForInStatement(node) ||
      ts.isWhileStatement(node) ||
      ts.isCatchClause(node)
    ) {
      branchCount++;
    }

    ts.forEachChild(node, traverseNode);
  }

  traverseNode(sourceFile);

  // 4. Extract comment stubs (TODO, FIXME, STUB)
  const commentRegex = /\/\/\s*(TODO|FIXME|STUB|BUG):\s*(.*)/gi;
  let match;
  while ((match = commentRegex.exec(content)) !== null) {
    todoStubs.push(match[2].trim());
  }

  // Calculate high fidelity cognitive complexity based on branching index density
  const complexityScore = branchCount + Math.floor(tokenCount / 100);

  return {
    imports,
    exports,
    complexityScore,
    todoStubs
  };
}
```

### C. Live Real-Time Telemetry Event Broadcaster (`websocket-hub.ts`)

```typescript
import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';

export class TelemetryBroadcaster {
  private wss: WebSocketServer;
  private connections: Set<WebSocket> = new Set();

  constructor(server: any) {
    this.wss = new WebSocketServer({ noServer: true });
    
    server.on('upgrade', (request: IncomingMessage, socket: any, head: Buffer) => {
      this.wss.handleUpgrade(request, socket, head, (ws) => {
        this.wss.emit('connection', ws, request);
      });
    });

    this.wss.on('connection', (ws: WebSocket) => {
      this.connections.add(ws);
      this.sendEvent(ws, 'SYSTEM_CONNECTED', { message: 'Secure Telemetry link initialized.' });

      ws.on('close', () => {
        this.connections.delete(ws);
      });

      ws.on('message', (messageData: string) => {
        try {
          const event = JSON.parse(messageData);
          this.handleClientEvent(ws, event);
        } catch (e) {
          console.error('Invalid client telemetry frame discarded.');
        }
      });
    });
  }

  // Broadcast unified telemetry to all active dashboard displays
  public broadcastTelemetry(eventName: string, payload: any) {
    const rawFrame = JSON.stringify({ type: eventName, payload, timestamp: new Date().toISOString() });
    for (const ws of this.connections) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(rawFrame);
      }
    }
  }

  private sendEvent(ws: WebSocket, eventName: string, payload: any) {
    ws.send(JSON.stringify({ type: eventName, payload, timestamp: new Date().toISOString() }));
  }

  private handleClientEvent(ws: WebSocket, event: { type: string; payload: any }) {
    if (event.type === 'PING') {
      this.sendEvent(ws, 'PONG', { time: Date.now() });
    }
  }
}
```

---

## 4. Ingestion-to-Telemetry Pipeline Workflow

1. **Continuous Watch & Poll (Ingestion):** File events triggered in the development runtime are tracked via asynchronous worker threads, recursively scanning modified folders.
2. **Analysis Cycle:** Safe AST tree-walking is completed by `ts.createSourceFile`. Code quality vectors are extracted, and code alignment relative to Vision specifications is computed locally or via Gemini gateway proxy APIs.
3. **Synthesis & Broadcaster Sync:** Computed scores and anomalies are sent to the state machine database. 
4. **Visual Stream Update:** The React HUD Client captures WebSocket frames. Framer Motion updates radial metrics seamlessly with hardware-boosted CSS layers, refreshing the cockpit UI with zero flickering.
