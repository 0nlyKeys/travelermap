import { useEffect } from 'react';

export interface ShortcutHandlers {
  togglePlay: () => void;
  reset: () => void;
  toggleHideUi: () => void;
  toggleFollow: () => void;
  toggleEdit: () => void;
  flyToStop?: (idx: number) => void;
}

/**
 * Wires Space/R/H/F/E to handlers. Ignores keys when typing into inputs.
 * Handlers are read via the latest closure each render (not memoized internally
 * to keep call sites simple — wrap in useCallback if you need stable refs).
 */
export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  const { togglePlay, reset, toggleHideUi, toggleFollow, toggleEdit, flyToStop } = handlers;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'KeyR':
          reset();
          break;
        case 'KeyH':
          toggleHideUi();
          break;
        case 'KeyF':
          toggleFollow();
          break;
        case 'KeyE':
          toggleEdit();
          break;
        default:
          if (flyToStop && e.code >= 'Digit1' && e.code <= 'Digit9') {
            flyToStop(parseInt(e.key, 10) - 1);
          }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [togglePlay, reset, toggleHideUi, toggleFollow, toggleEdit, flyToStop]);
}
