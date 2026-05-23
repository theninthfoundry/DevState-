import { useEffect } from 'react';

type PageType = 
  | 'blueprint' 
  | 'radar' 
  | 'explore' 
  | 'terminal' 
  | 'integrations' 
  | 'companion' 
  | 'terrarium' 
  | 'cognition' 
  | 'nebula' 
  | 'healer' 
  | 'genome' 
  | 'chaos'
  | 'sentinel'
  | 'pulse'
  | 'vault';

export function useKeyboard(
  setActivePage: (page: PageType) => void,
  onTriggerSound?: (freq?: number) => void,
  onTriggerNotification?: (msg: string, type?: 'success' | 'info' | 'error') => void
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if Alt (Option) is held without standard disrupting system keys
      if (e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        
        // Define clean sequential Alt-modifier key triggers
        const keyPageMapping: Record<string, PageType> = {
          '1': 'blueprint',
          '2': 'radar',
          '3': 'explore',
          '4': 'terminal',
          '5': 'integrations',
          '6': 'companion',
          '7': 'terrarium',
          '8': 'cognition',
          '9': 'nebula',
          '0': 'healer',
          '-': 'genome',
          '=': 'chaos',
          's': 'sentinel',
          'p': 'pulse',
          'v': 'vault'
        };

        const targetPage = keyPageMapping[e.key.toLowerCase()];
        
        if (targetPage) {
          e.preventDefault();
          setActivePage(targetPage);
          
          if (onTriggerSound) {
            onTriggerSound(1.28);
          }
          
          if (onTriggerNotification) {
            const prettyNames: Record<PageType, string> = {
              blueprint: "Supreme OS Cockpit (Alt+1)",
              radar: "Vision & Alignment HUD (Alt+2)",
              explore: "State File Ledger (Alt+3)",
              terminal: "Interactive Shell Gate (Alt+4)",
              integrations: "Dynamic Integration Lab (Alt+5)",
              companion: "Cognitive Companion Chat (Alt+6)",
              terrarium: "Aether-Bloom Micro Terrarium (Alt+7)",
              cognition: "AI Cognition Deck Graph (Alt+8)",
              nebula: "3D Holographic Universe Orbit (Alt+9)",
              healer: "Entropy & Self-Healer Tools (Alt+0)",
              genome: "Maturity & Code Time Machine (Alt+-)",
              chaos: "Chaos & Threat Simulator (Alt+=)",
              sentinel: "Sentinel Security NOC Team (Alt+S)",
              pulse: "Pulse API Guardian Team (Alt+P)",
              vault: "Vault Matrix Credentials (Alt+V)"
            };
            onTriggerNotification(`Navigation Hotkey: Switched to ${prettyNames[targetPage]}`, "success");
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [setActivePage, onTriggerSound, onTriggerNotification]);
}
