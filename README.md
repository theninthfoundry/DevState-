

# 🪐 DevState HUD
### The Cognitive Engineering Intelligence System & Developer Cockpit

> **Neo-Tokyo Cyberpunk Minimalism meets Apple-Grade Visual Precision.**  
> DevState HUD is a high-frequency, dark-mode software observatory designed to reject low-density SaaS templates. It acts as an immersive developer cockpit, tracking codebase alignment, AST imports, circular dependencies, and KKT constraint telemetry in real-time.

---

## Ⅰ. Architectural Blueprint

DevState HUD decouples high-frequency telemetry tracking, recursive filesystem crawling, and coordinate-constraint solvers through secure WebSocket gateways and React state-stores.

```
                           +────────────────────────────────────────+
                           │        DevState Core HUD Client        │
                           │  - Workspace Telemetry  - AI Chat HUD  │
                           │  - Dependency Graph     - Terminal OS  │
                           +────────────────────────────────────────+
                                               ||
                                    (Secure Keep-Alive WebSockets)
                                               ||
                                               \/
                           +────────────────────────────────────────+
                           │        Express Telemetry Server        │
                           +────────────────────────────────────────+
                             /                 |                  \
                            /                  |                   \
                           v                   v                    v
                 [AST Parsing Engine]   [Async FS Crawler]   [CAMP API Gateway]
                         |                     |                    |
                 (TS Compiler API)      (Worker Threads)     (RealityOS KKT)
```

---

## Ⅱ. Cinematic Design System & Motion Tokens

Every panel, hover effect, and transition inside DevState HUD uses hardware-accelerated rendering to deliver spring-physics motion reminiscent of holographic spacecraft overlays.

### 1. Motion Settings: The "Tokyo Pulse"
We utilize customized spring configurations with high damping for a tactile, responsive feel:

```typescript
// Custom spring variants (Framer Motion)
export const tokyoSpring = {
  type: 'spring',
  stiffness: 300,
  damping: 24,
  mass: 1
};

// Pulsating status glow
export const ambientGlowTransition = {
  animate: {
    boxShadow: [
      "0 0 15px rgba(139,92,246,0.1)",
      "0 0 35px rgba(139,92,246,0.25)",
      "0 0 15px rgba(139,92,246,0.1)"
    ]
  },
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut"
  }
};
```

### 2. Premium Components
*   **`GlassCard`:** Sleek refractive backdrop cards with subtle micro-borders, double-gradient borders, and glowing corner matrix accents:
    ```tsx
    <GlassCard glowColor="violet">
       <span className="text-white">Active Node</span>
    </GlassCard>
    ```
*   **`FramerMagneticTrigger`:** GPU-accelerated magnetic buttons that track cursor coordinate vectors, pulling the button face slightly towards the cursor to create a responsive physical attraction force.

---

## Ⅲ. The Visual Engines (Built & Integrated)

DevState HUD organizes developer workflows into highly specialized visual cockpits:

| Visual Panel | Icon | Technology Stack | Purpose / Action |
| :--- | :---: | :--- | :--- |
| **Architecture Nebula** | `Network` | React Three Fiber + D3 Force | 3D instanced mesh mapping of AST modules and cross-file dependencies. |
| **Sentinel AI Guardian** | `Shield` | Gemini API + Regex Audit | Active threat scanner auditing credentials and insecure serialization. |
| **Hydra Telemetry Matrix** | `Activity` | Recharts + Zustand | Ingests live CAMP agent observations, charting cost, latency, and KKT dual pressures. |
| **Product Genome Flow** | `Sparkles` | SVG Line Renderers | Synthesizes gap analysis between product design specs and codebase files. |
| **Chronicle Cockpit** | `Database` | Custom Table Grid | Relational workspace log inspector tracking workspace crawler events. |
| **Chaos Simulator** | `Flame` | WebGL canvas | Simulates memory congestion, SQLite locks, and monitors wave potential relaxation. |

---

## Ⅳ. Unified Integration: CAMP Telemetry Gateway

DevState HUD is bridged to the **Aether / CAMP (Cognitive Agent Monitoring Platform)** FastAPI server. 

```
  [CAMP FastAPI Port 8000] ──(ws://localhost:8000/api/ws)──► [useCampWebSocket Hook] ──► [Zustand HUD Store]
```

### Ingested Events
*   `"system_tick"`: Feeds real-time system stats (CPU heap memory, queue depth, ticks-per-second) directly into HUD gauges, translating mathematical field entropy into global cognitive load.
*   `"observation"`: Intercepts active API agent observations (Cost, Latency, Error Rate, and Token counts) and streams them dynamically into the HUD's bottom terminal log stream.

---

## Ⅴ. Installation & Local Run

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18+)
*   [Python](https://www.python.org/) (v3.10+)

### 1. Clone & Install Dependencies
First, initialize package managers in both directories:

```bash
# Install HUD dependencies
npm install

# Install Aether/CAMP dependencies (in editable development mode)
cd path/to/project-R
pip install -e .
```

### 2. Configure Environment variables
Create a `.env.local` inside the DevState workspace:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Execution Sequence

To start the unified developer cockpit, open three terminal windows:

*   **Terminal 1: Start the CAMP Backend Server**
    ```bash
    cd path/to/project-R
    python -m camp.api.server
    ```
*   **Terminal 2: Run simulated agent activity**
    ```bash
    cd path/to/project-R
    python -m camp.demo.simulate_agents
    ```
*   **Terminal 3: Start DevState HUD**
    ```bash
    # Run the Vite Dev server on port 3000
    npm run dev
    ```

👉 Open **[http://localhost:3000](http://localhost:3000)** in your browser. Focus on the **Hydra Telemetry** tab to view the live Aether stream!

---

## Ⅵ. Core Verification Tests

Verify the mathematical soundness of the constraint solvers by running:
```bash
python -m unittest discover -s camp/tests -p "test_*.py" -v
```
All 11 tests (including R-Identity Occlusion parity and decentralized ACN sparsity tests) must pass with zero KKT constraint violations.

---
*DevState HUD — The cockpit for stateful intelligence.*
