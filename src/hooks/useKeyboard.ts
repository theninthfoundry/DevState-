import { useEffect } from 'react';
import { useHUDStore } from '../store/useHUDStore';

export const useCommandDeck = () => {
  const toggleCommandDeck = useHUDStore((state) => state.toggleCommandDeck);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // CMD+K or CTRL+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggleCommandDeck();
      }
      // Escape
      if (e.key === 'Escape') {
        toggleCommandDeck(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleCommandDeck]);
};
