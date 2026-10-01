import React, { useRef, useEffect, useState } from 'react';
import { TerminalLog } from '../types/specter';
import { generateStreamLog } from '../utils/syntheticGenerators';

interface ContinuousLogStreamProps {
  target?: string;
}

export const ContinuousLogStream: React.FC<ContinuousLogStreamProps> = React.memo(({ target }) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Isolate continuous background logging inside this component so App does not re-render
  const [logs, setLogs] = useState<TerminalLog[]>(() => {
    const initial: TerminalLog[] = [];
    for (let i = 0; i < 25; i++) {
      initial.push(generateStreamLog(target || 'IRBANK-CORE'));
    }
    return initial;
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setLogs(prev => {
        const next = generateStreamLog(target || 'GATEWAY');
        return [...prev.slice(-150), next];
      });
    }, 450);

    return () => clearInterval(timer);
  }, [target]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="w-full h-full flex flex-col bg-[#020407] border-t border-emerald-900/60 overflow-hidden font-mono text-[10px]">
      {/* Stream Header */}
      <div className="flex items-center justify-between px-3 py-1 bg-[#010204] border-b border-emerald-900/50 text-[10px] tracking-wider text-emerald-500/80">
        <div className="flex items-center space-x-2">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
          <span className="text-emerald-400 font-semibold uppercase">CONTINUOUS SUB-SYSTEM TELEMETRY STREAM</span>
        </div>
        <div className="flex items-center space-x-4 text-[9px]">
          <span>FILTERS: ALL CHANNELS</span>
          <span>FIFO BUFFER: 150/150</span>
          <span className="text-cyan-400">INGEST: ~5.8 evt/s</span>
        </div>
      </div>

      {/* Stream Body */}
      <div 
        ref={scrollRef} 
        className="flex-1 overflow-y-auto px-3 py-1.5 space-y-0.5 select-text"
      >
        {logs.map((item) => {
          let tagColor = 'text-emerald-500';
          if (item.tag === 'FRAUD' || item.tag === 'IR') tagColor = 'text-red-400 font-bold';
          else if (item.tag === 'AUTH' || item.tag === 'SESSION') tagColor = 'text-amber-400';
          else if (item.tag === 'CORE' || item.tag === 'LEDGER_VIEW') tagColor = 'text-cyan-400';
          else if (item.tag === 'NET') tagColor = 'text-emerald-400';

          return (
            <div key={item.id} className="flex items-baseline space-x-2 leading-none py-0.5 hover:bg-emerald-950/20">
              <span className="text-emerald-800 shrink-0">{item.timestamp}</span>
              <span className={`w-20 shrink-0 ${tagColor}`}>[{item.tag}]</span>
              <span className="text-emerald-700 shrink-0">{item.hexOffset}</span>
              <span className="text-emerald-300/90 truncate">{item.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
});
