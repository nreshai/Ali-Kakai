import React, { useState, useEffect } from 'react';
import { 
  AttackNode, 
  CoreLedgerRecord, 
  CrackedCredential, 
  SystemTelemetry, 
  WirePacket 
} from '../types/specter';
import { 
  createLedgerSnapshots, 
  createWirePackets, 
  formatIRR, 
  formatToman 
} from '../utils/syntheticGenerators';

interface DataBreachMonitorProps {
  telemetry: SystemTelemetry;
  nodes: AttackNode[];
  crackedCredentials: CrackedCredential[];
}

export const DataBreachMonitor: React.FC<DataBreachMonitorProps> = React.memo(({
  telemetry,
  nodes,
  crackedCredentials
}) => {
  const [activeTab, setActiveTab] = useState<'METRICS' | 'WIRE' | 'LEDGER' | 'GPU'>('METRICS');
  const [throughputHistory, setThroughputHistory] = useState<number[]>([
    14, 22, 19, 31, 44, 58, 76, 98, 128, 154, 182, 198
  ]);

  const activeTargetName = telemetry.target || 'IRBANK-CORE';
  const wirePackets = React.useMemo(() => createWirePackets(activeTargetName), [activeTargetName]);
  const ledgerRecords = React.useMemo(() => createLedgerSnapshots(activeTargetName), [activeTargetName]);

  useEffect(() => {
    const interval = setInterval(() => {
      setThroughputHistory(prev => {
        const nextVal = Math.max(
          10, 
          telemetry.exfilRate + (Math.random() * 24 - 12)
        );
        return [...prev.slice(1), nextVal];
      });
    }, 1200);
    return () => clearInterval(interval);
  }, [telemetry.exfilRate]);

  const maxThroughput = Math.max(...throughputHistory, 220);

  return (
    <div className="relative w-full h-full flex flex-col bg-[#04080e] border border-emerald-900/40 hud-corner overflow-hidden text-emerald-400 font-mono text-[11px]">
      {/* Header bar with Navigation Sub-tabs */}
      <div className="flex items-center justify-between px-3 py-1 bg-[#020509] border-b border-emerald-900/50 tracking-wider shrink-0">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          <span className="text-emerald-300 font-semibold uppercase">EXPLOIT TELEMETRY & WIRE MONITOR</span>
        </div>

        <div className="flex items-center space-x-1 sm:space-x-1.5 text-[10px] overflow-x-auto py-0.5">
          <button 
            type="button"
            onClick={() => setActiveTab('METRICS')}
            className={`px-2.5 sm:px-2 py-1.5 sm:py-0.5 border cursor-pointer min-h-[34px] sm:min-h-[26px] touch-manipulation font-bold shrink-0 transition-all active:scale-95 ${activeTab === 'METRICS' ? 'bg-emerald-900/80 text-emerald-100 border-emerald-400 shadow-sm' : 'bg-transparent text-emerald-600 border-emerald-900/60 hover:text-emerald-300'}`}
          >
            📊 آمار و کرک
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('WIRE')}
            className={`px-2.5 sm:px-2 py-1.5 sm:py-0.5 border cursor-pointer min-h-[34px] sm:min-h-[26px] touch-manipulation font-bold shrink-0 transition-all active:scale-95 ${activeTab === 'WIRE' ? 'bg-emerald-900/80 text-emerald-100 border-emerald-400 shadow-sm' : 'bg-transparent text-emerald-600 border-emerald-900/60 hover:text-emerald-300'}`}
          >
            💳 سپام / ISO-8583
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('LEDGER')}
            className={`px-2.5 sm:px-2 py-1.5 sm:py-0.5 border cursor-pointer min-h-[34px] sm:min-h-[26px] touch-manipulation font-bold shrink-0 transition-all active:scale-95 ${activeTab === 'LEDGER' ? 'bg-emerald-900/80 text-emerald-100 border-emerald-400 shadow-sm' : 'bg-transparent text-emerald-600 border-emerald-900/60 hover:text-emerald-300'}`}
          >
            📑 دفتر حساب‌ها
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('GPU')}
            className={`px-2.5 sm:px-2 py-1.5 sm:py-0.5 border cursor-pointer min-h-[34px] sm:min-h-[26px] touch-manipulation font-bold shrink-0 transition-all active:scale-95 ${activeTab === 'GPU' ? 'bg-emerald-900/80 text-emerald-100 border-emerald-400 shadow-sm' : 'bg-transparent text-emerald-600 border-emerald-900/60 hover:text-emerald-300'}`}
          >
            🔥 کلاستر گرافیک H100
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2.5 sm:p-3 space-y-3">
        {activeTab === 'METRICS' && (
          <>
            {/* Top Metric Cards Grid - Responsive for mobile */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* Risk Score */}
              <div className="bg-[#03060b] border border-emerald-900/60 p-2">
                <div className="text-[9px] text-emerald-500/70">THREAT INDEX</div>
                <div className={`text-base font-bold tracking-wider ${telemetry.riskScore > 75 ? 'text-red-400 glow-red' : 'text-amber-400'}`}>
                  {telemetry.riskScore.toFixed(1)}%
                </div>
                <div className="w-full bg-emerald-950/60 h-1 mt-1 overflow-hidden">
                  <div 
                    className="h-full bg-red-500 transition-all duration-500"
                    style={{ width: `${telemetry.riskScore}%` }}
                  ></div>
                </div>
              </div>

              {/* Exfiltration Volume */}
              <div className="bg-[#03060b] border border-emerald-900/60 p-2">
                <div className="text-[9px] text-emerald-500/70">EXFILTRATED</div>
                <div className="text-base font-bold text-emerald-300 glow-green">
                  {telemetry.exfilBytes.toFixed(1)} MB
                </div>
                <div className="text-[9px] text-emerald-600">
                  RATE: {telemetry.exfilRate.toFixed(1)} MB/s
                </div>
              </div>

              {/* Credential Corpus */}
              <div className="bg-[#03060b] border border-emerald-900/60 p-2">
                <div className="text-[9px] text-emerald-500/70">CORPUS LOADED</div>
                <div className="text-base font-bold text-cyan-400 glow-cyan">
                  {telemetry.corpusCount > 0 ? (1200000).toLocaleString() : 'STANDBY'}
                </div>
                <div className="text-[9px] text-cyan-600">
                  ATTEMPTS: {telemetry.totalAttempts.toLocaleString()}
                </div>
              </div>

              {/* Cracked Hits */}
              <div className="bg-[#03060b] border border-emerald-900/60 p-2">
                <div className="text-[9px] text-emerald-500/70">CRACKED ACCOUNTS</div>
                <div className="text-base font-bold text-red-400 glow-red">
                  {telemetry.totalHits} / 5 HIGH-VAL
                </div>
                <div className="text-[9px] text-red-600">
                  RATE: {telemetry.clusterGpuHashRate || '48.9 GH/s'}
                </div>
              </div>
            </div>

            {/* Real-Time Exfil Throughput Waveform */}
            <div className="bg-[#03060b] border border-emerald-900/50 p-2">
              <div className="flex justify-between text-[10px] text-emerald-500/80 mb-1">
                <span>EXFILTRATION BANDWIDTH DYNAMICS (WIREGUARD CHACHA20)</span>
                <span className="text-red-400 font-bold">{telemetry.exfilRate.toFixed(1)} MB/s PEAK</span>
              </div>
              <div className="h-12 w-full flex items-end space-x-1.5 pt-2">
                {throughputHistory.map((val, idx) => {
                  const heightPercent = Math.min(100, Math.max(8, (val / maxThroughput) * 100));
                  return (
                    <div key={idx} className="flex-1 flex flex-col justify-end items-center h-full">
                      <div 
                        className="w-full bg-gradient-to-t from-red-900/40 via-red-600/70 to-red-400 transition-all duration-300"
                        style={{ height: `${heightPercent}%` }}
                      ></div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* HashLab Module: Distribution of Hash Types & Analysis */}
            <div className="bg-[#03060b] border border-emerald-900/50 p-2 space-y-2">
              <div className="flex justify-between items-center text-[10px] border-b border-emerald-900/40 pb-1">
                <span className="text-emerald-300 font-bold">HASHLAB ADVANCED CIPHER CRACKER</span>
                <span className="text-[9px] text-emerald-600">192 NVIDIA H100 SXM5 GPUs</span>
              </div>

              <div className="grid grid-cols-4 gap-2 text-[10px]">
                <div>
                  <div className="flex justify-between text-[9px] text-emerald-500/80">
                    <span>SHA-256 (Oracle)</span>
                    <span className="text-emerald-300">38.4%</span>
                  </div>
                  <div className="w-full bg-emerald-950/80 h-1 mt-0.5">
                    <div className="bg-emerald-400 h-full w-[38%]"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[9px] text-emerald-500/80">
                    <span>PBKDF2-HMAC</span>
                    <span className="text-amber-300">29.1%</span>
                  </div>
                  <div className="w-full bg-emerald-950/80 h-1 mt-0.5">
                    <div className="bg-amber-400 h-full w-[29%]"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[9px] text-emerald-500/80">
                    <span>bcrypt-12</span>
                    <span className="text-red-400">21.5%</span>
                  </div>
                  <div className="w-full bg-emerald-950/80 h-1 mt-0.5">
                    <div className="bg-red-400 h-full w-[21%]"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[9px] text-emerald-500/80">
                    <span>Argon2id</span>
                    <span className="text-cyan-400">11.0%</span>
                  </div>
                  <div className="w-full bg-emerald-950/80 h-1 mt-0.5">
                    <div className="bg-cyan-400 h-full w-[11%]"></div>
                  </div>
                </div>
              </div>

              {/* Cracked Credentials Table */}
              <div className="mt-2 space-y-1">
                {crackedCredentials.slice(0, telemetry.totalHits).map((c, i) => (
                  <div 
                    key={i} 
                    className="bg-[#050b12] border border-red-900/50 p-1.5 text-[10px] space-y-0.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-red-400 font-bold">{c.samAccount}</span>
                        <span className="text-emerald-600 text-[9px]">[{c.hashType}]</span>
                      </div>
                      <span className="text-amber-300 font-mono font-bold tracking-wider bg-black/60 px-1 border border-amber-900/60">
                        {c.plainPassword}
                      </span>
                    </div>
                    <div className="flex justify-between text-[9px] text-emerald-600">
                      <span>ROLE: {c.role}</span>
                      <span className="text-red-400 font-semibold">{c.privilegeLevel}</span>
                    </div>
                  </div>
                ))}
                {telemetry.totalHits === 0 && (
                  <div className="text-[10px] text-emerald-700 italic py-2 text-center">
                    -- Awaiting distributed hash attack execution --
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'WIRE' && (
          <div className="space-y-2">
            <div className="text-[10px] text-emerald-300 font-bold border-b border-emerald-900/40 pb-1">
              INTERCEPTED FINANCIAL TELECOMMUNICATION WIRES (SEPAM / SATNA / ISO-8583)
            </div>

            {wirePackets.map(pkt => (
              <div key={pkt.id} className="bg-[#020509] border border-emerald-900/60 p-2 text-[10px] space-y-1">
                <div className="flex justify-between text-emerald-500">
                  <span className="text-cyan-400 font-bold">[{pkt.protocol}]</span>
                  <span>{pkt.source} -&gt; {pkt.destination}</span>
                  <span className="text-emerald-300">{pkt.timestamp}</span>
                </div>
                {pkt.amountIRR && (
                  <div className="text-red-400 font-bold">
                    AMOUNT: {formatIRR(pkt.amountIRR)} (~ {formatToman(pkt.amountIRR)})
                  </div>
                )}
                <div className="bg-black/80 p-1.5 text-[9px] text-emerald-400 font-mono whitespace-pre-wrap border border-emerald-950">
                  {pkt.rawWire}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'LEDGER' && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[10px] border-b border-emerald-900/40 pb-1">
              <span className="text-emerald-300 font-bold">GENERAL LEDGER EXFILTRATION (IRANIAN BANKING ACCOUNTS)</span>
              <span className="text-red-400 font-bold">TOTAL: 261 TRILLION IRR</span>
            </div>

            <div className="space-y-1.5">
              {ledgerRecords.map((rec, i) => (
                <div key={i} className="bg-[#020509] border border-emerald-900/50 p-2 text-[10px] space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-emerald-300 font-bold">{rec.bankName}</span>
                    <span className={`px-1 text-[9px] font-bold ${rec.status === 'OVERRIDDEN' ? 'text-red-400 border border-red-800' : 'text-emerald-400'}`}>
                      [{rec.status}]
                    </span>
                  </div>
                  <div className="flex justify-between text-[9px] text-emerald-500">
                    <span>IBAN: {rec.iban}</span>
                    <span>BIC: {rec.bic}</span>
                  </div>
                  <div className="flex justify-between items-baseline pt-1 border-t border-emerald-950">
                    <span className="text-emerald-200 font-bold">{formatIRR(rec.balanceIRR)}</span>
                    <span className="text-amber-400 font-semibold">{formatToman(rec.balanceIRR)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'GPU' && (
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] text-emerald-300 font-bold border-b border-emerald-900/40 pb-1">
              <span>NVIDIA H100 SXM5 COMPUTE NODES (192 GPUs TOTAL)</span>
              <span className="text-emerald-400">THROUGHPUT: 48.9 GH/s</span>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {nodes.map(node => (
                <div key={node.id} className="bg-[#020509] border border-emerald-900/40 p-1.5 text-[9px] space-y-0.5">
                  <div className="flex justify-between">
                    <span className="text-emerald-300 font-bold">{node.label}</span>
                    <span className="text-emerald-500">{node.region.split(',')[0]}</span>
                  </div>
                  <div className="text-[8px] text-emerald-600">{node.gpuModel}</div>
                  <div className="flex justify-between text-emerald-400 pt-0.5">
                    <span>TEMP: {node.tempC}°C</span>
                    <span>PWR: {node.powerW}W</span>
                    <span className="text-red-400 font-bold">{(node.khs / 1000).toFixed(1)}k H/s</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
