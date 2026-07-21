import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type LogLevel = 'info' | 'warn' | 'error' | 'success' | 'init';

export interface ActivityLog {
  id: string;
  source: string;
  message: string;
  level: LogLevel;
  timestamp: number;
}

export interface TelemetryMetrics {
  cognitiveLoad: number;
  visionAlignment: number;
  filesInspected: number;
  activeErrors: number;
  healthyModules: number;
  networkLatency: number;
}

export interface CampSystemStatus {
  uptime: number;
  memory_mb: number;
  queue_depth: number;
  ticks_per_sec: number;
  alerts_raised: number;
  system_state: Record<string, any>;
}

interface HUDState {
  isOnline: boolean;
  activeEngine: 'nebula' | 'sentinel' | 'genome' | 'hydra' | 'config' | 'chronicle' | 'chaos' | 'supreme' | 'workspace' | 'pulse' | 'quantum-ci';
  commandDeckOpen: boolean;
  terminalOpen: boolean;
  caffeineFuel: number;
  metrics: TelemetryMetrics;
  logs: ActivityLog[];
  
  // CAMP Telemetry state fields
  agents: any[];
  selectedAgentId: string | null;
  systemStatus: CampSystemStatus | null;
  alerts: any[];

  // Actions
  setEngine: (engine: HUDState['activeEngine']) => void;
  toggleCommandDeck: (isOpen?: boolean) => void;
  setTerminalOpen: (isOpen: boolean) => void;
  appendLog: (log: Omit<ActivityLog, 'id' | 'timestamp'>) => void;
  updateMetrics: (metrics: Partial<TelemetryMetrics>) => void;
  refuel: () => void;
  
  // CAMP Actions
  setAgents: (agents: any[]) => void;
  setSelectedAgentId: (id: string | null) => void;
  setSystemStatus: (status: CampSystemStatus) => void;
  setAlerts: (alerts: any[]) => void;
}

export const useHUDStore = create<HUDState>()(
  persist(
    (set) => ({
      isOnline: true,
      activeEngine: 'nebula',
      commandDeckOpen: false,
      terminalOpen: true,
      caffeineFuel: 100,
      metrics: {
        cognitiveLoad: 12,
        visionAlignment: 98,
        filesInspected: 0,
        activeErrors: 0,
        healthyModules: 0,
        networkLatency: 24,
      },
      logs: [],
      
      agents: [],
      selectedAgentId: null,
      systemStatus: null,
      alerts: [],

      setEngine: (engine) => set({ activeEngine: engine }),
      
      toggleCommandDeck: (isOpen) => 
         set((state) => ({ commandDeckOpen: isOpen ?? !state.commandDeckOpen })),
      
      setTerminalOpen: (isOpen) =>
        set({ terminalOpen: isOpen }),
      
      appendLog: (log) => set((state) => {
        const newLog: ActivityLog = {
          ...log,
          id: crypto.randomUUID(),
          timestamp: Date.now(),
        };
        // Keep logs capped at 100 for memory performance
        return { logs: [newLog, ...state.logs].slice(0, 100) };
      }),

      updateMetrics: (newMetrics) => set((state) => ({
        metrics: { ...state.metrics, ...newMetrics }
      })),

      refuel: () => set((state) => ({ 
        caffeineFuel: Math.min(100, state.caffeineFuel + 25) 
      })),

      setAgents: (agents) => set({ agents }),
      setSelectedAgentId: (id) => set({ selectedAgentId: id }),
      setSystemStatus: (systemStatus) => set({ systemStatus }),
      setAlerts: (alerts) => set({ alerts }),
    }),
    { 
      name: 'devstate-cognitive-store',
      partialize: (state) => ({ caffeineFuel: state.caffeineFuel }) // Only persist fuel
    }
  )
);

