import { create } from 'zustand';

interface ShellState {
  isTerminalOpen: boolean;
  toggleTerminal: () => void;
  setTerminalOpen: (open: boolean) => void;
  
  isCommandBarOpen: boolean;
  toggleCommandBar: () => void;
  setCommandBarOpen: (open: boolean) => void;

  isRightTelemetryOpen: boolean;
  toggleRightTelemetry: () => void;

  activeSystemId: string;
  setActiveSystemId: (id: string) => void;
}

export const useShellStore = create<ShellState>((set) => ({
  isTerminalOpen: false,
  toggleTerminal: () => set((state) => ({ isTerminalOpen: !state.isTerminalOpen })),
  setTerminalOpen: (open) => set({ isTerminalOpen: open }),

  isCommandBarOpen: false,
  toggleCommandBar: () => set((state) => ({ isCommandBarOpen: !state.isCommandBarOpen })),
  setCommandBarOpen: (open) => set({ isCommandBarOpen: open }),

  isRightTelemetryOpen: true,
  toggleRightTelemetry: () => set((state) => ({ isRightTelemetryOpen: !state.isRightTelemetryOpen })),

  activeSystemId: 'nebula',
  setActiveSystemId: (id) => set({ activeSystemId: id }),
}));
