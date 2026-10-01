import { useEffect } from 'react';
import { soundFx } from '../utils/audioFx';

export interface ShortcutOptions {
  inputRef: React.RefObject<HTMLInputElement | null>;
  panelsRef?: React.RefObject<HTMLElement | null>;
  onClearInput?: () => void;
  onClearLogs?: () => void;
  onCyclePanel?: () => void;
  onSelectTab?: (tab: 'TERMINAL' | 'MAP' | 'BREACH' | 'STREAM') => void;
  enabled?: boolean;
}

/**
 * useGlobalShortcuts
 * Hook for high-speed power-user keyboard navigation:
 * - 'Esc': Clears terminal command input
 * - 'Ctrl+L' / 'Cmd+L': Clears terminal logs (intercepts browser URL bar hijack)
 * - 'Tab': Toggles focus between terminal input and UI tactical panels
 * - 'Alt+1' - 'Alt+4': Instantly switches active operations panel
 */
export function useGlobalShortcuts({
  inputRef,
  panelsRef,
  onClearInput,
  onClearLogs,
  onCyclePanel,
  onSelectTab,
  enabled = true,
}: ShortcutOptions) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElem = document.activeElement;
      const isInputFocused = activeElem === inputRef.current;

      // 1. Esc Key: Clear terminal input
      if (e.key === 'Escape') {
        e.preventDefault();
        if (onClearInput) {
          onClearInput();
        } else if (inputRef.current) {
          inputRef.current.value = '';
        }
        soundFx.playKeyClick();
        return;
      }

      // 2. Ctrl+L or Cmd+L: Clear terminal logs (POSIX standard terminal shortcut)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'l' || e.key === 'L')) {
        e.preventDefault();
        if (onClearLogs) {
          onClearLogs();
          soundFx.playLogPing('SYS');
        }
        return;
      }

      // 3. Tab Key: Switch focus between terminal input and UI tactical panels
      // Only intercept plain Tab without Alt/Ctrl/Meta
      if (e.key === 'Tab' && !e.altKey && !e.ctrlKey && !e.metaKey) {
        // If input has text matching autocomplete pattern, let AttackConsole handle it
        if (isInputFocused && inputRef.current && inputRef.current.value.trim().length > 0) {
          // Allow in-input autocomplete to proceed
          return;
        }

        e.preventDefault();
        if (isInputFocused) {
          // Shift focus from input to UI panels container
          if (panelsRef?.current) {
            panelsRef.current.focus({ preventScroll: true });
          } else {
            inputRef.current?.blur();
          }
          if (onCyclePanel) onCyclePanel();
          soundFx.playTelemetryPulse();
        } else {
          // Shift focus from UI panels to terminal input
          inputRef.current?.focus({ preventScroll: true });
          soundFx.playKeyClick();
        }
        return;
      }

      // 4. Alt + 1-4: Fast panel switching for power users
      if (e.altKey && onSelectTab) {
        if (e.key === '1') {
          e.preventDefault();
          onSelectTab('TERMINAL');
          inputRef.current?.focus({ preventScroll: true });
          soundFx.playKeyClick();
        } else if (e.key === '2') {
          e.preventDefault();
          onSelectTab('MAP');
          soundFx.playKeyClick();
        } else if (e.key === '3') {
          e.preventDefault();
          onSelectTab('BREACH');
          soundFx.playKeyClick();
        } else if (e.key === '4') {
          e.preventDefault();
          onSelectTab('STREAM');
          soundFx.playKeyClick();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, [inputRef, panelsRef, onClearInput, onClearLogs, onCyclePanel, onSelectTab, enabled]);
}
