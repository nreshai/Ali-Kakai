import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  AttackNode, 
  CrackedCredential, 
  MapNode, 
  SystemTelemetry, 
  TerminalLog 
} from './types/specter';
import { 
  createCrackedCredentials, 
  createInitialAttackNodes, 
  createWorldMapNodes, 
  generateIncidentId, 
  generateSessionId, 
  generateSyntheticToken, 
  getTimestamp 
} from './utils/syntheticGenerators';
import { buildAttackSequence, SequenceStep } from './utils/attackSequenceEngine';
import { NetworkMap } from './components/NetworkMap';
import { DataBreachMonitor } from './components/DataBreachMonitor';
import { AttackConsole } from './components/AttackConsole';
import { ContinuousLogStream } from './components/ContinuousLogStream';
import { soundFx } from './utils/audioFx';

// Isolated Clock component to prevent App.tsx re-renders every second
const SystemClock: React.FC = React.memo(() => {
  const [clock, setClock] = useState(() => new Date().toUTCString().replace('GMT', 'UTC'));

  useEffect(() => {
    const timer = setInterval(() => {
      setClock(new Date().toUTCString().replace('GMT', 'UTC'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return <span className="text-emerald-400 font-mono">{clock}</span>;
});

export default function App() {
  const [sessionId] = useState<string>(() => generateSessionId());
  const [activeTarget, setActiveTarget] = useState<string>('');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);

  // Tactical Panels reference for power-user Tab key focus switching
  const desktopPanelsRef = useRef<HTMLDivElement | null>(null);

  // Mobile active panel tab switcher
  const [mobileTab, setMobileTab] = useState<'TERMINAL' | 'MAP' | 'BREACH' | 'STREAM'>('TERMINAL');

  // Primary Terminal logs
  const [terminalLogs, setTerminalLogs] = useState<TerminalLog[]>([]);

  // Telemetry metrics
  const [telemetry, setTelemetry] = useState<SystemTelemetry>({
    target: '',
    targetAsn: 'AS48159',
    targetIp: '91.240.64.50',
    sessionId: sessionId,
    phase: 'IDLE',
    phaseProgress: 0,
    corpusCount: 0,
    totalAttempts: 0,
    totalHits: 0,
    riskScore: 12.4,
    exfilBytes: 0,
    exfilRate: 0.4,
    incidentId: generateIncidentId(),
    sessionToken: '',
    cpuLoad: 28.4,
    entropy: 7.82,
    clusterGpuHashRate: '48.9 GH/s',
    hsmKeyVariant: 'STANDBY',
    sepamTunnelActive: false
  });

  const [attackNodes, setAttackNodes] = useState<AttackNode[]>(() => createInitialAttackNodes());
  const [mapNodes, setMapNodes] = useState<MapNode[]>(() => createWorldMapNodes('IRBANK-CORE'));
  const [crackedCreds] = useState<CrackedCredential[]>(() => createCrackedCredentials());

  // Cycle panels on Tab press (Mobile and Desktop fast switching)
  const handleCycleTab = useCallback(() => {
    setMobileTab(prev => {
      if (prev === 'TERMINAL') return 'MAP';
      if (prev === 'MAP') return 'BREACH';
      if (prev === 'BREACH') return 'STREAM';
      return 'TERMINAL';
    });
  }, []);

  // Store active timeouts to allow cancellation/abort and avoid leaks
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  // Abort ongoing cyber operations
  const handleAbort = useCallback(() => {
    timeoutsRef.current.forEach(t => clearTimeout(t));
    timeoutsRef.current = [];
    setIsExecuting(false);
    setTerminalLogs(prev => [
      ...prev,
      {
        id: `abort_${Date.now()}`,
        timestamp: getTimestamp(),
        tag: 'INTERRUPT',
        level: 'WARN',
        text: 'OPERATOR SIGNAL INTERRUPT: Active operations halted. Terminal returned to interactive prompt.',
      }
    ]);
    soundFx.playLogPing('WARN');
  }, []);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(t => clearTimeout(t));
    };
  }, []);

  // Handle command: set target <NAME>
  const handleSetTarget = useCallback((targetName: string) => {
    const sanitized = targetName.trim().toUpperCase() || 'IRBANK-CORE';
    setActiveTarget(sanitized);
    setIsExecuting(true);

    // Cancel any previous queued sequence steps
    timeoutsRef.current.forEach(t => clearTimeout(t));
    timeoutsRef.current = [];

    const token = generateSyntheticToken(sanitized);
    setTelemetry(prev => ({
      ...prev,
      target: sanitized,
      sessionToken: token,
      phase: 'BOOT',
      phaseProgress: 5
    }));

    setMapNodes(createWorldMapNodes(sanitized));

    // Build the scripted sequence
    const sequence = buildAttackSequence(sanitized);
    let cumulativeDelay = 120;

    sequence.forEach((step: SequenceStep, index: number) => {
      cumulativeDelay += step.delayMs;

      const timerId = setTimeout(() => {
        const newLog: TerminalLog = {
          id: `log_${Date.now()}_${index}`,
          timestamp: getTimestamp(),
          tag: step.log.tag,
          level: step.log.level,
          text: step.log.text,
          hexOffset: step.log.hexOffset
        };

        setTerminalLogs(prev => [...prev, newLog]);
        soundFx.playLogPing(step.log.level as any);

        setTelemetry(prev => {
          const updated = { ...prev, phase: step.phase };
          updated.phaseProgress = Math.round(((index + 1) / sequence.length) * 100);
          if (step.updateTelemetry) {
            if (step.updateTelemetry.riskScore !== undefined) updated.riskScore = step.updateTelemetry.riskScore;
            if (step.updateTelemetry.exfilBytes !== undefined) updated.exfilBytes = step.updateTelemetry.exfilBytes;
            if (step.updateTelemetry.exfilRate !== undefined) updated.exfilRate = step.updateTelemetry.exfilRate;
            if (step.updateTelemetry.corpusCount !== undefined) updated.corpusCount = step.updateTelemetry.corpusCount;
            if (step.updateTelemetry.totalAttempts !== undefined) updated.totalAttempts = step.updateTelemetry.totalAttempts;
            if (step.updateTelemetry.totalHits !== undefined) updated.totalHits = step.updateTelemetry.totalHits;
            if (step.updateTelemetry.entropy !== undefined) updated.entropy = step.updateTelemetry.entropy;
            if (step.updateTelemetry.clusterGpuHashRate !== undefined) updated.clusterGpuHashRate = step.updateTelemetry.clusterGpuHashRate;
            if (step.updateTelemetry.sepamTunnelActive !== undefined) updated.sepamTunnelActive = step.updateTelemetry.sepamTunnelActive;
            if (step.updateTelemetry.hsmKeyVariant !== undefined) updated.hsmKeyVariant = step.updateTelemetry.hsmKeyVariant;
          }
          return updated;
        });

        // Boost nodes if in attack phase
        if (step.phase === 'CREDENTIAL_ATTACK' || step.phase === 'HASHLAB') {
          setAttackNodes(prev => prev.map(n => ({
            ...n,
            khs: Math.floor(48000 + Math.random() * 9000),
            tempC: Math.min(68, n.tempC + Math.floor(Math.random() * 2)),
            powerW: Math.min(680, n.powerW + Math.floor(Math.random() * 10)),
            attempts: n.attempts + Math.floor(Math.random() * 60000)
          })));
        }

        // Reset execution state when final sequence step finishes!
        if (index === sequence.length - 1) {
          setIsExecuting(false);
          soundFx.playLogPing('SUCCESS');
        }
      }, cumulativeDelay);

      timeoutsRef.current.push(timerId);
    });
  }, []);

  const handleAddLogs = useCallback((newLogs: TerminalLog[]) => {
    setTerminalLogs(prev => [...prev, ...newLogs]);
  }, []);

  return (
    <div className="relative w-full h-[100dvh] max-h-[100dvh] bg-[#020509] text-emerald-400 font-mono flex flex-col overflow-hidden">
      {/* CRT Scanline and Vignette Effects */}
      <div className="absolute inset-0 crt-overlay z-50 pointer-events-none"></div>
      <div className="absolute inset-0 vignette z-40 pointer-events-none"></div>

      {/* Standalone OS System Status Bar */}
      <header className="h-8 sm:h-7 w-full bg-[#010306] border-b border-emerald-900/60 px-2 sm:px-3 flex items-center justify-between text-[9px] sm:text-[10px] tracking-wider shrink-0 z-30 select-none">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-bold text-emerald-300 tracking-wider">SPECTER OS v7.4</span>
          </div>
          <span className="text-emerald-700 hidden sm:inline">|</span>
          <span className="text-emerald-500/90 hidden md:inline">KERNEL: 6.2.0-SPECTER</span>
          <span className="text-emerald-700 hidden sm:inline">|</span>
          <span className="text-emerald-500/90 hidden sm:inline">SESSION: <span className="text-emerald-300">{sessionId}</span></span>
          <span className="text-emerald-700 hidden sm:inline">|</span>
          <span className="text-red-400 font-bold">LEVEL OMEGA</span>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4 text-[9px] sm:text-[10px]">
          <span className="text-emerald-500/80">TARGET: <span className="text-emerald-300 font-semibold">{activeTarget || 'UNSET'}</span></span>
          <span className="text-emerald-700 hidden sm:inline">|</span>
          <span className="text-emerald-500/80 hidden sm:inline">BGP: <span className="text-emerald-300">AS48159</span></span>
          <span className="text-emerald-700 hidden md:inline">|</span>
          <span className="hidden lg:inline"><SystemClock /></span>
          <span className="text-emerald-700">|</span>
          <button 
            type="button" 
            onClick={() => { soundFx.enabled = !soundFx.enabled; }}
            className="text-[9px] text-emerald-400 hover:text-emerald-300 active:bg-emerald-900 cursor-pointer uppercase border border-emerald-700/80 px-2 py-1 touch-manipulation"
          >
            🔊 {soundFx.enabled ? 'AUDIO ON' : 'MUTED'}
          </button>
        </div>
      </header>

      {/* Mobile Tactical Tab Bar (Screens < 1024px) */}
      <div className="lg:hidden flex items-center justify-around bg-[#010204] border-b border-emerald-900/70 p-1 text-[10px] shrink-0 z-30 font-mono">
        <button
          type="button"
          onClick={() => setMobileTab('TERMINAL')}
          className={`flex-1 py-2 min-h-[42px] text-center font-bold tracking-wider border-b-2 transition-all cursor-pointer touch-manipulation flex items-center justify-center ${
            mobileTab === 'TERMINAL' 
              ? 'border-emerald-400 text-emerald-100 bg-emerald-950/80 shadow-[inset_0_0_10px_rgba(16,185,129,0.2)]' 
              : 'border-transparent text-emerald-600 hover:text-emerald-400 active:bg-emerald-950/40'
          }`}
        >
          ⌨️ ترمینال
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('MAP')}
          className={`flex-1 py-2 min-h-[42px] text-center font-bold tracking-wider border-b-2 transition-all cursor-pointer touch-manipulation flex items-center justify-center ${
            mobileTab === 'MAP' 
              ? 'border-emerald-400 text-emerald-100 bg-emerald-950/80 shadow-[inset_0_0_10px_rgba(16,185,129,0.2)]' 
              : 'border-transparent text-emerald-600 hover:text-emerald-400 active:bg-emerald-950/40'
          }`}
        >
          📡 نقشه
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('BREACH')}
          className={`flex-1 py-2 min-h-[42px] text-center font-bold tracking-wider border-b-2 transition-all cursor-pointer touch-manipulation flex items-center justify-center ${
            mobileTab === 'BREACH' 
              ? 'border-emerald-400 text-emerald-100 bg-emerald-950/80 shadow-[inset_0_0_10px_rgba(16,185,129,0.2)]' 
              : 'border-transparent text-emerald-600 hover:text-emerald-400 active:bg-emerald-950/40'
          }`}
        >
          📊 وضعیت نفوذ
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('STREAM')}
          className={`flex-1 py-2 min-h-[42px] text-center font-bold tracking-wider border-b-2 transition-all cursor-pointer touch-manipulation flex items-center justify-center ${
            mobileTab === 'STREAM' 
              ? 'border-emerald-400 text-emerald-100 bg-emerald-950/80 shadow-[inset_0_0_10px_rgba(16,185,129,0.2)]' 
              : 'border-transparent text-emerald-600 hover:text-emerald-400 active:bg-emerald-950/40'
          }`}
        >
          ⚡ لاگ زنده
        </button>
      </div>

      {/* Main Operational View: Desktop 12-Column Grid / Mobile Dynamic Tab View */}
      <main className="flex-1 w-full p-1 min-h-0 z-20 overflow-hidden">
        {/* DESKTOP VIEW (Visible on lg: screens >= 1024px) */}
        <div className="hidden lg:grid grid-cols-12 gap-1 h-full w-full min-h-0">
          {/* Left Column: Attack Console (Terminal) - 7 cols */}
          <section className="col-span-7 h-full min-h-0">
            <AttackConsole
              sessionId={sessionId}
              logs={terminalLogs}
              onSetTarget={handleSetTarget}
              isExecuting={isExecuting}
              activeTarget={activeTarget}
              onClearLogs={() => setTerminalLogs([])}
              onAddLogs={handleAddLogs}
              onAbort={handleAbort}
              panelsRef={desktopPanelsRef}
              onCyclePanel={handleCycleTab}
              onSelectTab={setMobileTab}
            />
          </section>

          {/* Right Column: Tactical Intel & Breach Monitor - 5 cols */}
          <section 
            ref={desktopPanelsRef}
            tabIndex={-1}
            className="col-span-5 h-full flex flex-col gap-1 min-h-0 focus:outline-none focus:ring-1 focus:ring-emerald-500/40 transition-shadow"
          >
            {/* Top Panel: Network Intelligence Map */}
            <div className="h-[46%] min-h-0">
              <NetworkMap
                nodes={mapNodes}
                targetName={activeTarget}
                isAttacking={isExecuting}
              />
            </div>

            {/* Bottom Panel: Data Breach Monitor & HashLab */}
            <div className="flex-1 min-h-0">
              <DataBreachMonitor
                telemetry={telemetry}
                nodes={attackNodes}
                crackedCredentials={crackedCreds}
              />
            </div>
          </section>
        </div>

        {/* MOBILE VIEW (Visible on screens < 1024px) */}
        <div className="lg:hidden h-full w-full min-h-0">
          {mobileTab === 'TERMINAL' && (
            <div className="h-full w-full">
              <AttackConsole
                sessionId={sessionId}
                logs={terminalLogs}
                onSetTarget={handleSetTarget}
                isExecuting={isExecuting}
                activeTarget={activeTarget}
                onClearLogs={() => setTerminalLogs([])}
                onAddLogs={handleAddLogs}
                onAbort={handleAbort}
                panelsRef={desktopPanelsRef}
                onCyclePanel={handleCycleTab}
                onSelectTab={setMobileTab}
              />
            </div>
          )}

          {mobileTab === 'MAP' && (
            <div className="h-full w-full">
              <NetworkMap
                nodes={mapNodes}
                targetName={activeTarget}
                isAttacking={isExecuting}
              />
            </div>
          )}

          {mobileTab === 'BREACH' && (
            <div className="h-full w-full">
              <DataBreachMonitor
                telemetry={telemetry}
                nodes={attackNodes}
                crackedCredentials={crackedCreds}
              />
            </div>
          )}

          {mobileTab === 'STREAM' && (
            <div className="h-full w-full">
              <ContinuousLogStream target={activeTarget} />
            </div>
          )}
        </div>
      </main>

      {/* Bottom Panel: Continuous Log Stream (Anchored on desktop) */}
      <footer className="hidden lg:block h-28 w-full shrink-0 z-20">
        <ContinuousLogStream target={activeTarget} />
      </footer>
    </div>
  );
}
