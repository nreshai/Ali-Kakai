import React, { useState, useRef, useEffect, useCallback } from 'react';
import { TerminalLog } from '../types/specter';
import { soundFx } from '../utils/audioFx';
import { useGlobalShortcuts } from '../hooks/useGlobalShortcuts';
import { 
  executeTerminalCommand, 
  KNOWN_COMMANDS, 
  PRESET_TARGETS 
} from '../utils/terminalCommandEngine';
import { getTimestamp } from '../utils/syntheticGenerators';

interface AttackConsoleProps {
  sessionId: string;
  logs: TerminalLog[];
  onSetTarget: (targetName: string) => void;
  isExecuting: boolean;
  activeTarget: string;
  onClearLogs?: () => void;
  onAddLogs?: (newLogs: TerminalLog[]) => void;
  onAbort?: () => void;
  panelsRef?: React.RefObject<HTMLElement | null>;
  onCyclePanel?: () => void;
  onSelectTab?: (tab: 'TERMINAL' | 'MAP' | 'BREACH' | 'STREAM') => void;
}

export const AttackConsole: React.FC<AttackConsoleProps> = React.memo(({
  sessionId,
  logs,
  onSetTarget,
  isExecuting,
  activeTarget,
  onClearLogs,
  onAddLogs,
  onAbort,
  panelsRef,
  onCyclePanel,
  onSelectTab,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [history, setHistory] = useState<string[]>([
    'help',
    'targets',
    'scan 91.240.64.50',
    'set target IRBANK-CORE',
    'exploit'
  ]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const terminalContainerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Explicit focus state tracking
  const [isInputFocused, setIsInputFocused] = useState<boolean>(false);

  // Global Keyboard Shortcuts Hook: Esc (clear input), Ctrl+L (clear logs), Tab (switch focus)
  useGlobalShortcuts({
    inputRef,
    panelsRef,
    onClearInput: () => setInputValue(''),
    onClearLogs,
    onCyclePanel,
    onSelectTab,
    enabled: true,
  });

  // Scroll inner container smoothly whenever new logs arrive
  useEffect(() => {
    if (terminalContainerRef.current) {
      terminalContainerRef.current.scrollTop = terminalContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Clean focus helper
  const focusInput = useCallback(() => {
    if (!isExecuting && inputRef.current) {
      inputRef.current.focus({ preventScroll: true });
      setIsInputFocused(true);
    }
  }, [isExecuting]);

  // History Navigation Helpers
  const navigateHistoryUp = useCallback(() => {
    soundFx.playKeyClick();
    if (history.length > 0) {
      const nextIdx = historyIndex + 1 < history.length ? historyIndex + 1 : historyIndex;
      setHistoryIndex(nextIdx);
      setInputValue(history[history.length - 1 - nextIdx] || '');
    }
  }, [history, historyIndex]);

  const navigateHistoryDown = useCallback(() => {
    soundFx.playKeyClick();
    if (historyIndex > 0) {
      const nextIdx = historyIndex - 1;
      setHistoryIndex(nextIdx);
      setInputValue(history[history.length - 1 - nextIdx] || '');
    } else if (historyIndex === 0) {
      setHistoryIndex(-1);
      setInputValue('');
    }
  }, [history, historyIndex]);

  // Tab Autocomplete Engine
  const handleAutocomplete = useCallback(() => {
    soundFx.playKeyClick();
    const val = inputValue.trim().toLowerCase();

    if (!val) {
      setInputValue('help');
      return;
    }

    // Matching preset targets under "set target"
    if (val.startsWith('set target ') || val.startsWith('target ')) {
      const prefix = val.startsWith('set target ') ? 'set target ' : 'target ';
      const partial = val.replace(/^(set\s+target\s+|target\s+)/, '').trim().toUpperCase();
      const matched = PRESET_TARGETS.find(t => t.name.startsWith(partial));
      if (matched) {
        setInputValue(`${prefix}${matched.name}`);
        return;
      }
    }

    if ('set target '.startsWith(val)) {
      setInputValue('set target ');
      return;
    }

    // Match top known commands
    const matchedCmd = KNOWN_COMMANDS.find(c => c.startsWith(val));
    if (matchedCmd) {
      setInputValue(matchedCmd + (matchedCmd === 'set target' ? ' ' : ''));
    }
  }, [inputValue]);

  // Central Command Execution Engine
  const executeCommand = useCallback((cmdToExecute: string) => {
    const trimmed = cmdToExecute.trim();
    if (!trimmed) return;

    soundFx.playKeyClick();

    // Record into history
    setHistory(prev => {
      if (prev[prev.length - 1] === trimmed) return prev;
      return [...prev, trimmed];
    });
    setHistoryIndex(-1);
    setInputValue('');

    // Construct echo log representing realistic terminal prompt
    const echoLog: TerminalLog = {
      id: `echo_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: getTimestamp(),
      tag: 'SYS',
      level: 'SYS',
      text: `specter@omega:~$ ${trimmed}`,
      hexOffset: '0x00000000'
    };

    // Process through high-fidelity command engine
    const result = executeTerminalCommand(trimmed, activeTarget, history);

    if (result.action === 'CLEAR') {
      if (onClearLogs) onClearLogs();
      return;
    }

    if (result.action === 'ABORT') {
      if (onAbort) onAbort();
      return;
    }

    if (result.action === 'SET_TARGET') {
      if (onAddLogs) onAddLogs([echoLog, ...result.logs]);
      if (result.target) {
        onSetTarget(result.target);
      }
      return;
    }

    if (result.action === 'LAUNCH_ATTACK') {
      if (onAddLogs) onAddLogs([echoLog, ...result.logs]);
      if (result.target) {
        onSetTarget(result.target);
      }
      return;
    }

    // Regular output logs (e.g. scan, help, whois, disasm, hashcat, top, uname, cat, ls)
    if (onAddLogs) {
      onAddLogs([echoLog, ...result.logs]);
    }
  }, [activeTarget, history, onAbort, onAddLogs, onClearLogs, onSetTarget]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeCommand(inputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      handleAutocomplete();
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      navigateHistoryUp();
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      navigateHistoryDown();
      return;
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-[#020509] border border-emerald-900/50 hud-corner overflow-hidden text-emerald-400 font-mono text-[11px]">
      {/* Console Header Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#010306] border-b border-emerald-900/60 text-[11px] tracking-wider select-none shrink-0">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-emerald-300 font-semibold uppercase tracking-wider">
            PRIMARY TTY CONSOLE
          </span>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-3 text-[9px] sm:text-[10px]">
          <span className={`px-1.5 py-0.5 border text-[9px] ${
            isInputFocused 
              ? 'border-emerald-500 text-emerald-300 bg-emerald-950/60' 
              : 'border-emerald-900/60 text-emerald-600'
          }`}>
            {isExecuting ? 'ACTIVE INJECTION' : isInputFocused ? 'KEYBOARD READY' : 'PROMPT READY'}
          </span>
          <span className="text-emerald-400 font-bold hidden sm:inline">
            TARGET: <span className="text-emerald-200">{activeTarget || 'UNSET'}</span>
          </span>
        </div>
      </div>

      {/* Terminal Viewport (Scrollable output area) */}
      <div 
        ref={terminalContainerRef}
        className="flex-1 overflow-y-auto p-2.5 sm:p-3.5 space-y-2 leading-relaxed overscroll-contain select-text"
      >
        {/* Boot System Header */}
        <div className="border border-emerald-900/60 bg-[#03070d] p-2.5 sm:p-3 text-[10px] sm:text-[11px] space-y-0.5 select-text">
          <div className="text-emerald-300 font-bold glow-green tracking-wide">
            SPECTER OS v7.4 - Secure Offensive Operations Console
          </div>
          <div className="text-emerald-500/90">Session ID: <span className="text-emerald-200">{sessionId}</span></div>
          <div className="text-emerald-500/90">Kernel: <span className="text-emerald-200">6.2.0-SPECTER-SEC (x86_64)</span></div>
          <div className="text-emerald-500/90">Operator Clearance: <span className="text-red-400 font-bold">LEVEL OMEGA</span></div>
          <div className="text-[9px] sm:text-[10px] text-emerald-600/80 pt-1">
            FULL INTERACTIVE SHELL READY. TYPE <span className="text-emerald-300 font-bold">'help'</span> FOR COMMAND LIST.
          </div>
        </div>

        {/* Rendered Terminal Logs with Rich Color Coding and Hex Displays */}
        {logs.map((log) => {
          let badgeColor = 'text-emerald-400 border-emerald-800 bg-emerald-950/40';
          let textColor = 'text-emerald-300';

          if (log.level === 'WARN') {
            badgeColor = 'text-amber-400 border-amber-800 bg-amber-950/40';
            textColor = 'text-amber-200';
          } else if (log.level === 'CRIT') {
            badgeColor = 'text-red-400 border-red-800 bg-red-950/40';
            textColor = 'text-red-300 glow-red';
          } else if (log.level === 'SUCCESS') {
            badgeColor = 'text-emerald-300 border-emerald-500 bg-emerald-900/50';
            textColor = 'text-emerald-200 font-semibold';
          } else if (log.level === 'SYS') {
            badgeColor = 'text-cyan-400 border-cyan-800 bg-cyan-950/40';
            textColor = 'text-cyan-200';
          } else if (log.level === 'HEX') {
            badgeColor = 'text-purple-400 border-purple-800 bg-purple-950/40';
            textColor = 'text-purple-300 font-mono text-[10px]';
          }

          // Format prompt echo lines distinctively
          const isPromptEcho = log.text.startsWith('specter@omega:~$');

          return (
            <div key={log.id} className="text-[10px] sm:text-[11px] font-mono leading-relaxed select-text space-y-0.5">
              {!isPromptEcho ? (
                <>
                  <div className="flex items-start space-x-1.5 sm:space-x-2">
                    <span className="text-emerald-700/80 select-none">[{log.timestamp}]</span>
                    <span className={`px-1 py-0.2 border text-[8px] sm:text-[9px] font-semibold tracking-wider ${badgeColor}`}>
                      {log.tag}
                    </span>
                    {log.hexOffset && (
                      <span className="text-emerald-800 text-[9px] sm:text-[10px] select-none">{log.hexOffset}</span>
                    )}
                  </div>
                  <div className={`pl-2 sm:pl-5 whitespace-pre-wrap ${textColor}`}>
                    {log.text}
                  </div>
                </>
              ) : (
                <div className="text-emerald-400 font-bold pl-1 pt-1 pb-0.5 border-l-2 border-emerald-500 bg-emerald-950/20">
                  {log.text}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* FIXED DOCKED COMMAND ENTRY & TOUCH CONTROLS (ALWAYS VISIBLE AT BOTTOM) */}
      <div className="shrink-0 bg-[#020509] border-t-2 border-emerald-900/80 p-2 sm:p-2.5 z-20 space-y-2">
        {/* Tactical Touch Key & Quick Command Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-[10px] select-none touch-manipulation">
          {/* Virtual Keyboard Navigation Touch Buttons */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={handleAutocomplete}
              className="px-2 py-1 bg-emerald-950 border border-emerald-600 hover:bg-emerald-900 active:bg-emerald-800 text-emerald-200 font-bold cursor-pointer active:scale-95 shadow-sm text-[10px]"
              title="Autocomplete (Tab)"
            >
              ⇥ TAB
            </button>
            <button
              type="button"
              onClick={navigateHistoryUp}
              className="px-2 py-1 bg-emerald-950 border border-emerald-600 hover:bg-emerald-900 active:bg-emerald-800 text-emerald-200 font-bold cursor-pointer active:scale-95 shadow-sm text-[10px]"
              title="Previous Command (Up)"
            >
              ▲
            </button>
            <button
              type="button"
              onClick={navigateHistoryDown}
              className="px-2 py-1 bg-emerald-950 border border-emerald-600 hover:bg-emerald-900 active:bg-emerald-800 text-emerald-200 font-bold cursor-pointer active:scale-95 shadow-sm text-[10px]"
              title="Next Command (Down)"
            >
              ▼
            </button>
          </div>

          <span className="text-emerald-700/80 shrink-0">|</span>

          {/* Quick Command Chips */}
          <button
            type="button"
            onClick={() => executeCommand('tx')}
            className="px-2 py-1 bg-amber-950/80 border border-amber-600 hover:border-amber-400 text-amber-200 shrink-0 font-bold cursor-pointer active:scale-95 text-[10px]"
            title="شنود تراکنش‌های بانکی زنده"
          >
            💳 تراکنش‌ها (tx)
          </button>
          <button
            type="button"
            onClick={() => executeCommand('cards')}
            className="px-2 py-1 bg-cyan-950/80 border border-cyan-600 hover:border-cyan-400 text-cyan-200 shrink-0 font-bold cursor-pointer active:scale-95 text-[10px]"
            title="استخراج کارت‌ها و شبا"
          >
            📑 حساب‌ها (cards)
          </button>
          <button
            type="button"
            onClick={() => executeCommand('help')}
            className="px-2 py-1 bg-[#040810] border border-cyan-800 hover:border-cyan-500 text-cyan-300 shrink-0 font-bold cursor-pointer active:scale-95 text-[10px]"
          >
            help
          </button>
          <button
            type="button"
            onClick={() => executeCommand('scan')}
            className="px-2 py-1 bg-[#040810] border border-emerald-800 hover:border-emerald-500 text-emerald-300 shrink-0 font-bold cursor-pointer active:scale-95 text-[10px]"
          >
            scan
          </button>
          <button
            type="button"
            onClick={() => executeCommand('targets')}
            className="px-2 py-1 bg-[#040810] border border-emerald-800 hover:border-emerald-500 text-emerald-300 shrink-0 font-bold cursor-pointer active:scale-95 text-[10px]"
          >
            targets
          </button>
          <button
            type="button"
            onClick={() => executeCommand('exploit')}
            className="px-2 py-1 bg-red-950/80 border border-red-700 hover:border-red-500 text-red-200 shrink-0 font-bold cursor-pointer active:scale-95 text-[10px]"
          >
            ⚡ exploit
          </button>
          <button
            type="button"
            onClick={() => executeCommand('hashcat')}
            className="px-2 py-1 bg-[#040810] border border-purple-800 hover:border-purple-500 text-purple-300 shrink-0 font-bold cursor-pointer active:scale-95 text-[10px]"
          >
            hashcat
          </button>
          <button
            type="button"
            onClick={() => executeCommand('disasm')}
            className="px-2 py-1 bg-[#040810] border border-purple-800 hover:border-purple-500 text-purple-300 shrink-0 font-bold cursor-pointer active:scale-95 text-[10px]"
          >
            disasm
          </button>
          <button
            type="button"
            onClick={() => executeCommand('dump')}
            className="px-2 py-1 bg-[#040810] border border-amber-800 hover:border-amber-500 text-amber-300 shrink-0 font-bold cursor-pointer active:scale-95 text-[10px]"
          >
            dump
          </button>
          <button
            type="button"
            onClick={() => executeCommand('whois')}
            className="px-2 py-1 bg-[#040810] border border-emerald-800 hover:border-emerald-500 text-emerald-300 shrink-0 font-bold cursor-pointer active:scale-95 text-[10px]"
          >
            whois
          </button>
          <button
            type="button"
            onClick={() => executeCommand('ping')}
            className="px-2 py-1 bg-[#040810] border border-emerald-800 hover:border-emerald-500 text-emerald-300 shrink-0 font-bold cursor-pointer active:scale-95 text-[10px]"
          >
            ping
          </button>
          <button
            type="button"
            onClick={() => {
              if (onClearLogs) onClearLogs();
            }}
            className="px-2 py-1 bg-[#040810] border border-amber-900 hover:border-amber-500 text-amber-300 shrink-0 font-bold cursor-pointer active:scale-95 text-[10px]"
          >
            clear
          </button>
        </div>

        {/* 1-Tap Preset Target Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-[10px] select-none touch-manipulation">
          <span className="text-emerald-500 text-[9px] font-bold uppercase tracking-wider shrink-0">
            اهداف:
          </span>
          <button
            type="button"
            onClick={() => executeCommand('set target IRBANK-CORE')}
            className="px-2.5 py-1 border border-emerald-600 bg-emerald-950 hover:bg-emerald-900 text-emerald-200 shrink-0 font-bold cursor-pointer active:scale-95 shadow-sm text-[10px]"
          >
            ⚡ IRBANK
          </button>
          <button
            type="button"
            onClick={() => executeCommand('set target CBI-MARKAZI')}
            className="px-2.5 py-1 border border-emerald-600 bg-emerald-950 hover:bg-emerald-900 text-emerald-200 shrink-0 font-bold cursor-pointer active:scale-95 shadow-sm text-[10px]"
          >
            ⚡ MARKAZI
          </button>
          <button
            type="button"
            onClick={() => executeCommand('set target MELLI-SWIFT')}
            className="px-2.5 py-1 border border-emerald-600 bg-emerald-950 hover:bg-emerald-900 text-emerald-200 shrink-0 font-bold cursor-pointer active:scale-95 shadow-sm text-[10px]"
          >
            ⚡ SWIFT
          </button>
          <button
            type="button"
            onClick={() => executeCommand('set target SEPAM-RTGS')}
            className="px-2.5 py-1 border border-emerald-600 bg-emerald-950 hover:bg-emerald-900 text-emerald-200 shrink-0 font-bold cursor-pointer active:scale-95 shadow-sm text-[10px]"
          >
            ⚡ SEPAM
          </button>
          <button
            type="button"
            onClick={() => executeCommand('set target PASARGAD-FIN')}
            className="px-2.5 py-1 border border-emerald-600 bg-emerald-950 hover:bg-emerald-900 text-emerald-200 shrink-0 font-bold cursor-pointer active:scale-95 shadow-sm text-[10px]"
          >
            ⚡ PASARGAD
          </button>
        </div>

        {/* Primary Interactive Command Line Form */}
        {!isExecuting ? (
          <form 
            onSubmit={handleSubmit}
            className={`flex items-center space-x-1.5 sm:space-x-2 text-emerald-300 bg-[#03070d] p-1.5 border transition-all ${
              isInputFocused 
                ? 'border-emerald-400 ring-2 ring-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                : 'border-emerald-800'
            }`}
          >
            <span 
              onClick={focusInput}
              className="font-bold select-none text-[10px] sm:text-[11px] text-emerald-400 shrink-0 cursor-pointer pl-1"
            >
              specter@omega:~$
            </span>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              onKeyDown={handleKeyDown}
              placeholder="set target IRBANK-CORE (or 'help' / 'scan' / 'exploit')"
              enterKeyHint="go"
              inputMode="text"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              autoComplete="off"
              className="flex-1 bg-transparent border-none outline-none text-emerald-200 font-mono text-[12px] sm:text-xs caret-emerald-400 placeholder-emerald-700 min-w-0 py-1"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-500 border border-emerald-400 text-white active:scale-95 text-[11px] font-bold uppercase transition-all shrink-0 cursor-pointer shadow-md touch-manipulation"
            >
              ⚡ EXEC
            </button>
          </form>
        ) : (
          <div className="flex items-center justify-between p-2 bg-[#03070d] border border-red-900/80 text-red-400 select-none text-[10px] sm:text-[11px] gap-2">
            <div className="flex items-center space-x-2 truncate">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500 animate-ping shrink-0"></span>
              <span className="font-bold tracking-wider truncate">
                ⚡ عملیات فعال روی هدف: <span className="text-red-200">[{activeTarget}]</span>
              </span>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              {onAbort && (
                <button
                  type="button"
                  onClick={onAbort}
                  className="px-3 py-1.5 bg-red-950/90 hover:bg-red-900 active:bg-red-800 border-2 border-red-500 text-red-100 font-bold uppercase transition-all cursor-pointer active:scale-95 touch-manipulation text-[10px] sm:text-[11px] shadow-lg"
                >
                  🛑 توقف عملیات (ABORT)
                </button>
              )}
              <span className="animate-cursor font-bold text-emerald-400">_</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
