import React, { useEffect, useRef, useState } from 'react';
import { MapNode } from '../types/specter';

interface NetworkMapProps {
  nodes: MapNode[];
  targetName: string;
  isAttacking: boolean;
}

// World coastline normalized polygon points
const CONTINENT_POLYGONS: [number, number][][] = [
  // North America
  [
    [0.10, 0.18], [0.16, 0.14], [0.26, 0.14], [0.29, 0.22], [0.25, 0.30],
    [0.21, 0.38], [0.18, 0.40], [0.14, 0.34], [0.08, 0.30], [0.10, 0.18]
  ],
  // South America
  [
    [0.24, 0.50], [0.31, 0.53], [0.34, 0.63], [0.29, 0.80], [0.25, 0.83],
    [0.21, 0.66], [0.22, 0.56], [0.24, 0.50]
  ],
  // Europe
  [
    [0.45, 0.18], [0.54, 0.16], [0.57, 0.22], [0.53, 0.30], [0.46, 0.32],
    [0.43, 0.26], [0.45, 0.18]
  ],
  // Africa
  [
    [0.45, 0.36], [0.55, 0.36], [0.59, 0.46], [0.55, 0.66], [0.49, 0.72],
    [0.43, 0.58], [0.41, 0.44], [0.45, 0.36]
  ],
  // Asia & Middle East
  [
    [0.57, 0.16], [0.74, 0.13], [0.87, 0.18], [0.84, 0.33], [0.77, 0.43],
    [0.69, 0.50], [0.61, 0.43], [0.55, 0.30], [0.57, 0.16]
  ],
  // Australia
  [
    [0.79, 0.66], [0.87, 0.63], [0.91, 0.72], [0.85, 0.80], [0.77, 0.76],
    [0.79, 0.66]
  ]
];

export const NetworkMap: React.FC<NetworkMapProps> = React.memo(({ nodes, targetName, isAttacking }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const graphCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeTab, setActiveTab] = useState<'MAP' | 'TRACEROUTE' | 'BGP'>('MAP');

  // Direct DOM refs to eliminate React re-renders during high-speed animation loop
  const latencyBadgeRef = useRef<HTMLSpanElement | null>(null);
  const signalValueRef = useRef<HTMLSpanElement | null>(null);
  const jitterValueRef = useRef<HTMLSpanElement | null>(null);
  const packetLossValueRef = useRef<HTMLSpanElement | null>(null);
  const tracerouteHop6Ref = useRef<HTMLSpanElement | null>(null);

  // Latency & Signal Oscilloscope Waveform Canvas (ZERO React re-renders)
  useEffect(() => {
    const graphCanvas = graphCanvasRef.current;
    if (!graphCanvas) return;
    const gctx = graphCanvas.getContext('2d');
    if (!gctx) return;

    let animId: number;
    const historyLength = 40;
    const latencyHistory: number[] = Array.from({ length: historyLength }, () => 33.8);
    const signalHistory: number[] = Array.from({ length: historyLength }, () => 92.0);

    let lastTick = Date.now();

    const renderGraph = () => {
      const w = graphCanvas.width;
      const h = graphCanvas.height;

      const now = Date.now();
      if (now - lastTick > 80) {
        lastTick = now;
        
        const variance = isAttacking ? (Math.random() * 8.5 - 4.0) : (Math.random() * 1.8 - 0.9);
        const nextLat = Math.max(22.0, Math.min(88.0, 33.8 + variance + (isAttacking ? Math.sin(now / 500) * 12 : 0)));
        const nextSignal = Math.max(55.0, Math.min(99.4, 94.0 - (nextLat - 30) * 0.7 + (Math.random() * 4 - 2)));
        const nextJitter = Math.abs(variance * 0.35);
        const nextLoss = isAttacking && nextLat > 60 ? +(Math.random() * 1.8).toFixed(1) : 0.0;

        latencyHistory.shift();
        latencyHistory.push(nextLat);

        signalHistory.shift();
        signalHistory.push(nextSignal);

        // Update DOM elements directly without triggering React component re-renders
        if (latencyBadgeRef.current) {
          latencyBadgeRef.current.textContent = `${nextLat.toFixed(1)} ms`;
          latencyBadgeRef.current.className = `font-mono font-bold ${isAttacking ? 'text-red-400' : 'text-emerald-400'}`;
        }
        if (signalValueRef.current) {
          signalValueRef.current.textContent = `${nextSignal.toFixed(0)}%`;
        }
        if (jitterValueRef.current) {
          jitterValueRef.current.textContent = `±${nextJitter.toFixed(2)}ms`;
        }
        if (packetLossValueRef.current) {
          packetLossValueRef.current.textContent = `${nextLoss}%`;
          packetLossValueRef.current.className = nextLoss > 0 ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold';
        }
        if (tracerouteHop6Ref.current) {
          tracerouteHop6Ref.current.textContent = `${nextLat.toFixed(1)} ms (TARGET REACHED)`;
        }
      }

      gctx.clearRect(0, 0, w, h);

      // Background Grid
      gctx.strokeStyle = 'rgba(16, 185, 129, 0.15)';
      gctx.lineWidth = 1;
      for (let x = 0; x < w; x += 25) {
        gctx.beginPath();
        gctx.moveTo(x, 0);
        gctx.lineTo(x, h);
        gctx.stroke();
      }
      for (let y = 0; y < h; y += 15) {
        gctx.beginPath();
        gctx.moveTo(0, y);
        gctx.lineTo(w, y);
        gctx.stroke();
      }

      const dx = w / (historyLength - 1);

      // Draw Signal Strength Area (Cyan gradient)
      const sigGrad = gctx.createLinearGradient(0, 0, 0, h);
      sigGrad.addColorStop(0, 'rgba(6, 182, 212, 0.25)');
      sigGrad.addColorStop(1, 'rgba(6, 182, 212, 0.02)');

      gctx.beginPath();
      gctx.moveTo(0, h);
      signalHistory.forEach((val, i) => {
        const y = h - ((val - 50) / 50) * (h - 6);
        if (i === 0) gctx.lineTo(0, y);
        else gctx.lineTo(i * dx, y);
      });
      gctx.lineTo(w, h);
      gctx.closePath();
      gctx.fillStyle = sigGrad;
      gctx.fill();

      // Signal Strength Line (Cyan)
      gctx.beginPath();
      signalHistory.forEach((val, i) => {
        const y = h - ((val - 50) / 50) * (h - 6);
        if (i === 0) gctx.moveTo(0, y);
        else gctx.lineTo(i * dx, y);
      });
      gctx.strokeStyle = '#06b6d4';
      gctx.lineWidth = 1.2;
      gctx.stroke();

      // Draw Latency Line (Neon Red/Amber)
      gctx.beginPath();
      latencyHistory.forEach((val, i) => {
        const y = h - ((val - 20) / 70) * (h - 6);
        if (i === 0) gctx.moveTo(0, y);
        else gctx.lineTo(i * dx, y);
      });
      gctx.strokeStyle = isAttacking ? '#ef4444' : '#10b981';
      gctx.lineWidth = 1.6;
      gctx.shadowColor = isAttacking ? '#ef4444' : '#10b981';
      gctx.shadowBlur = 6;
      gctx.stroke();
      gctx.shadowBlur = 0;

      // Current Value Pulsing Point
      const lastX = w;
      const lastLat = latencyHistory[latencyHistory.length - 1];
      const lastY = h - ((lastLat - 20) / 70) * (h - 6);
      gctx.beginPath();
      gctx.arc(lastX - 2, lastY, 3, 0, Math.PI * 2);
      gctx.fillStyle = isAttacking ? '#ef4444' : '#10b981';
      gctx.fill();

      animId = requestAnimationFrame(renderGraph);
    };

    renderGraph();
    return () => cancelAnimationFrame(animId);
  }, [isAttacking]);

  // Main Map Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let radarAngle = 0;
    const particles: { sourceIdx: number; progress: number; speed: number }[] = [];

    for (let i = 0; i < 35; i++) {
      particles.push({
        sourceIdx: Math.floor(Math.random() * (nodes.length - 1)),
        progress: Math.random(),
        speed: 0.006 + Math.random() * 0.015
      });
    }

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    const latLngToXY = (lat: number, lng: number, width: number, height: number): [number, number] => {
      const x = ((lng + 180) / 360) * width;
      const y = ((90 - lat) / 180) * height;
      return [x, y];
    };

    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      ctx.clearRect(0, 0, width, height);

      // Matrix Background Grid
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.07)';
      ctx.lineWidth = 1;

      const stepX = width / 16;
      const stepY = height / 10;

      for (let x = 0; x <= width; x += stepX) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      for (let y = 0; y <= height; y += stepY) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Continents with Phosphor Shading
      ctx.fillStyle = 'rgba(6, 78, 59, 0.18)';
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
      ctx.lineWidth = 1.2;

      CONTINENT_POLYGONS.forEach(poly => {
        ctx.beginPath();
        poly.forEach(([px, py], idx) => {
          const x = px * width;
          const y = py * height;
          if (idx === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      });

      // Submarine Fiber Optic Cable Arteries
      const cables: [[number, number], [number, number]][] = [
        [[50.1, 8.6], [52.3, 4.9]],
        [[52.3, 4.9], [64.1, -21.9]],
        [[50.1, 8.6], [39.0, -77.4]],
        [[50.1, 8.6], [47.3, 8.5]],
        [[50.1, 8.6], [35.6, 51.3]],
        [[35.6, 51.3], [1.3, 103.8]],
        [[1.3, 103.8], [35.6, 139.6]],
      ];

      ctx.strokeStyle = 'rgba(52, 211, 153, 0.15)';
      ctx.lineWidth = 1;
      cables.forEach(([p1, p2]) => {
        const [x1, y1] = latLngToXY(p1[0], p1[1], width, height);
        const [x2, y2] = latLngToXY(p2[0], p2[1], width, height);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      });

      // Target Node & Radar Sweep
      const targetNode = nodes.find(n => n.role === 'TARGET') || nodes[0];
      const [tx, ty] = latLngToXY(targetNode.lat, targetNode.lng, width, height);

      radarAngle += 0.03;
      const sweepRadius = Math.min(width, height) * 0.42;

      const gradient = ctx.createRadialGradient(tx, ty, 4, tx, ty, sweepRadius);
      gradient.addColorStop(0, 'rgba(239, 68, 68, 0.28)');
      gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.arc(tx, ty, sweepRadius, radarAngle, radarAngle + Math.PI / 3);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(tx + Math.cos(radarAngle + Math.PI / 3) * sweepRadius, ty + Math.sin(radarAngle + Math.PI / 3) * sweepRadius);
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
      ctx.lineWidth = 1.4;
      ctx.stroke();
      ctx.restore();

      // Bezier Attack Arcs
      nodes.forEach((node) => {
        if (node.role === 'TARGET') return;
        const [nx, ny] = latLngToXY(node.lat, node.lng, width, height);
        const midX = (nx + tx) / 2;
        const midY = (ny + ty) / 2 - 35;

        ctx.beginPath();
        ctx.moveTo(nx, ny);
        ctx.quadraticCurveTo(midX, midY, tx, ty);
        ctx.strokeStyle = isAttacking ? 'rgba(239, 68, 68, 0.5)' : 'rgba(52, 211, 153, 0.22)';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      });

      // Packet Flow Particles
      if (isAttacking) {
        particles.forEach(p => {
          const srcNode = nodes[p.sourceIdx % (nodes.length - 1)];
          if (!srcNode || srcNode.role === 'TARGET') return;

          const [nx, ny] = latLngToXY(srcNode.lat, srcNode.lng, width, height);
          const midX = (nx + tx) / 2;
          const midY = (ny + ty) / 2 - 35;

          p.progress += p.speed;
          if (p.progress > 1) p.progress = 0;

          const t = p.progress;
          const px = (1 - t) * (1 - t) * nx + 2 * (1 - t) * t * midX + t * t * tx;
          const py = (1 - t) * (1 - t) * ny + 2 * (1 - t) * t * midY + t * t * ty;

          ctx.beginPath();
          ctx.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = '#ef4444';
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;
        });
      }

      // Nodes & Markers
      nodes.forEach(node => {
        const [nx, ny] = latLngToXY(node.lat, node.lng, width, height);
        const isTarget = node.role === 'TARGET';

        const pulse = (Math.sin(Date.now() / 240 + (isTarget ? 0 : 2)) + 1) / 2;
        const ringRadius = isTarget ? 11 + pulse * 9 : 6 + pulse * 4;

        ctx.beginPath();
        ctx.arc(nx, ny, ringRadius, 0, Math.PI * 2);
        ctx.strokeStyle = isTarget ? `rgba(239, 68, 68, ${0.9 - pulse * 0.5})` : `rgba(16, 185, 129, ${0.7 - pulse * 0.4})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(nx, ny, isTarget ? 5.5 : 3.5, 0, Math.PI * 2);
        ctx.fillStyle = isTarget ? '#ef4444' : '#10b981';
        ctx.shadowColor = isTarget ? '#ef4444' : '#10b981';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillStyle = isTarget ? '#fca5a5' : '#a7f3d0';
        ctx.fillText(`${node.name} (${node.city})`, nx + 8, ny - 4);

        if (isTarget) {
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
          ctx.lineWidth = 1;
          ctx.strokeRect(nx - 14, ny - 14, 28, 28);
          ctx.fillStyle = '#ef4444';
          ctx.fillText(`TARGET_LOCK: ${targetName || 'IRBANK-CORE'} [35.68°N, 51.38°E]`, nx + 8, ny + 9);
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [nodes, targetName, isAttacking]);

  return (
    <div className="relative w-full h-full flex flex-col bg-[#04080e] border border-emerald-900/40 hud-corner overflow-hidden">
      {/* Header bar with Sub-Tabs */}
      <div className="flex items-center justify-between px-3 py-1 bg-[#020509] border-b border-emerald-900/50 text-[11px] font-mono tracking-wider shrink-0">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
          <span className="text-emerald-300 font-semibold uppercase">GEOSPATIAL & BGP INTELLIGENCE</span>
        </div>

        <div className="flex items-center space-x-1 sm:space-x-1.5 text-[10px] overflow-x-auto py-0.5">
          <button 
            type="button"
            onClick={() => setActiveTab('MAP')}
            className={`px-2.5 sm:px-2 py-1.5 sm:py-0.5 border cursor-pointer min-h-[34px] sm:min-h-[26px] touch-manipulation font-bold transition-all active:scale-95 ${activeTab === 'MAP' ? 'bg-emerald-900/80 text-emerald-100 border-emerald-400 shadow-sm' : 'bg-transparent text-emerald-600 border-emerald-900/60 hover:text-emerald-300'}`}
          >
            🗺️ نقشه جهانی
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('TRACEROUTE')}
            className={`px-2.5 sm:px-2 py-1.5 sm:py-0.5 border cursor-pointer min-h-[34px] sm:min-h-[26px] touch-manipulation font-bold transition-all active:scale-95 ${activeTab === 'TRACEROUTE' ? 'bg-emerald-900/80 text-emerald-100 border-emerald-400 shadow-sm' : 'bg-transparent text-emerald-600 border-emerald-900/60 hover:text-emerald-300'}`}
          >
            🛰️ Traceroute
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('BGP')}
            className={`px-2.5 sm:px-2 py-1.5 sm:py-0.5 border cursor-pointer min-h-[34px] sm:min-h-[26px] touch-manipulation font-bold transition-all active:scale-95 ${activeTab === 'BGP' ? 'bg-emerald-900/80 text-emerald-100 border-emerald-400 shadow-sm' : 'bg-transparent text-emerald-600 border-emerald-900/60 hover:text-emerald-300'}`}
          >
            🌐 BGP AS48159
          </button>
        </div>
      </div>

      {/* Main Canvas or Tab View */}
      <div className="relative flex-1 w-full h-full min-h-[180px]">
        {activeTab === 'MAP' && (
          <>
            <canvas ref={canvasRef} className="w-full h-full block" />

            {/* Tactical HUD Telemetry in top-left */}
            <div className="absolute top-2 left-2 text-[9px] sm:text-[10px] font-mono text-emerald-400 bg-[#02060b]/90 p-1.5 sm:p-2 border border-emerald-900/60 space-y-0.5 pointer-events-none max-w-[200px] sm:max-w-none">
              <div className="text-emerald-300 font-bold border-b border-emerald-900/40 pb-0.5">TARGET GEO-COORDINATES</div>
              <div>COORDS: 35.6892° N, 51.3890° E</div>
              <div className="truncate">ASN: AS48159 (TIC Iran)</div>
              <div>PREFIX: 91.240.64.0/22</div>
            </div>

            {/* Dynamic Signal Strength & Latency Oscilloscope Overlay (Bottom-Left) */}
            <div className="absolute bottom-2 left-2 w-56 sm:w-64 bg-[#020509]/95 border border-emerald-900/80 p-1.5 font-mono shadow-2xl pointer-events-none">
              <div className="flex items-center justify-between text-[9px] text-emerald-400 border-b border-emerald-900/60 pb-1 mb-1">
                <span className="flex items-center space-x-1.5 font-bold">
                  <span className={`w-1.5 h-1.5 rounded-full ${isAttacking ? 'bg-red-500 animate-ping' : 'bg-emerald-400 animate-pulse'}`}></span>
                  <span className="text-emerald-300">LINK VOLATILITY & JITTER</span>
                </span>
                <span ref={latencyBadgeRef} className={`font-mono font-bold ${isAttacking ? 'text-red-400' : 'text-emerald-400'}`}>
                  33.8 ms
                </span>
              </div>

              {/* The dynamic Canvas Oscilloscope Waveform */}
              <div className="relative h-12 w-full bg-black/80 border border-emerald-950 overflow-hidden">
                <canvas 
                  ref={graphCanvasRef} 
                  width={250} 
                  height={48} 
                  className="w-full h-full block"
                />
                <div className="absolute top-0.5 left-1 text-[7px] text-cyan-400/80 tracking-tighter">
                  SIGNAL: 94%
                </div>
                <div className="absolute top-0.5 right-1 text-[7px] text-emerald-400/80 tracking-tighter">
                  JITTER: ±0.20ms
                </div>
              </div>

              {/* Numerical breakdown bar below graph with direct DOM refs */}
              <div className="grid grid-cols-3 gap-1 mt-1 text-[8px] text-emerald-500/90 text-center">
                <div className="bg-[#03080e] p-0.5 border border-emerald-950">
                  <span className="text-emerald-600 block text-[7px]">SIGNAL</span>
                  <span ref={signalValueRef} className="text-cyan-400 font-bold">94%</span>
                </div>
                <div className="bg-[#03080e] p-0.5 border border-emerald-950">
                  <span className="text-emerald-600 block text-[7px]">JITTER</span>
                  <span ref={jitterValueRef} className="text-amber-400 font-bold">±0.20ms</span>
                </div>
                <div className="bg-[#03080e] p-0.5 border border-emerald-950">
                  <span className="text-emerald-600 block text-[7px]">DROP/LOSS</span>
                  <span ref={packetLossValueRef} className="text-emerald-400 font-bold">0%</span>
                </div>
              </div>
            </div>

            {/* Tactical status overlay in bottom-right */}
            <div className="absolute bottom-2 right-2 text-[9px] sm:text-[10px] font-mono text-right text-emerald-400 bg-[#02060b]/90 p-1.5 sm:p-2 border border-emerald-900/60 space-y-0.5 pointer-events-none hidden sm:block">
              <div>TUNNEL: WireGuard / ChaCha20</div>
              <div>BGP: AS48159 PEER ACTIVE</div>
              <div className="text-red-400 font-bold">24 ENCLAVE PROXIES ARMED</div>
            </div>
          </>
        )}

        {activeTab === 'TRACEROUTE' && (
          <div className="p-3 text-[10px] font-mono overflow-y-auto h-full space-y-1 bg-[#020509]">
            <div className="text-emerald-300 font-bold border-b border-emerald-900/50 pb-1 mb-2">
              TRACEROUTE TO CORE GATEWAY 91.240.64.50 (BAnQx Banking Switch):
            </div>
            <div className="space-y-1 text-emerald-400">
              <div className="flex justify-between py-0.5 border-b border-emerald-950">
                <span>HOP 1: 194.26.29.112 [FRA-EDGE-01]</span>
                <span className="text-emerald-300">0.8 ms (DE-CIX Frankfurt)</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-emerald-950">
                <span>HOP 2: 80.81.192.1 [Core Vienna VIX Gateway]</span>
                <span className="text-emerald-300">8.4 ms (VIX Austria)</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-emerald-950">
                <span>HOP 3: 87.226.133.1 [Turk Telecom Interconnect]</span>
                <span className="text-emerald-300">19.2 ms (Istanbul IXP)</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-emerald-950">
                <span>HOP 4: 91.240.64.1 [TIC Tehran Core Edge Router]</span>
                <span className="text-emerald-300">32.6 ms (TIC Border BGP)</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-emerald-950">
                <span>HOP 5: 10.240.12.1 [CheckPoint Maestro DMZ Cluster]</span>
                <span className="text-emerald-300">33.4 ms (Firewall Perimeter)</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-emerald-950 text-red-400 font-bold">
                <span>HOP 6: 10.240.88.50 [Finacle BAnQx / Oracle RAC 19c]</span>
                <span ref={tracerouteHop6Ref}>34.1 ms (TARGET REACHED)</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'BGP' && (
          <div className="p-3 text-[10px] font-mono overflow-y-auto h-full space-y-2 bg-[#020509]">
            <div className="text-emerald-300 font-bold border-b border-emerald-900/50 pb-1">
              BGP ROUTING TABLE FOR AS48159 (Telecommunication Company of Iran TIC):
            </div>
            <div className="text-emerald-500/90 leading-relaxed">
              <div>Network: 91.240.64.0/22 | Next Hop: 194.26.29.112</div>
              <div>AS Path: 24940 8075 12389 48159 i</div>
              <div>MED: 100 | Local Pref: 300 | Status: VALID, BEST, EXTERNAL</div>
              <div>Community: 8075:1000 12389:50 48159:999</div>
              <div className="mt-2 text-red-400">
                [*] Intercept tap established at DE-CIX IXP exchange (Frankfurt am Main)
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
