import { useEffect, useRef, useState } from 'react';
import { SimulationParams, TelemetrySnapshot } from '../types/simulation';

interface PasslineCanvasProps {
  params: SimulationParams;
  snapshot: TelemetrySnapshot;
}

interface Droplet {
  x: number;
  yOffset: number; // for side view height
  zoneIdx: number; // 0..6 for top-down strip
  radius: number;
  vxScale: number;
  alpha: number;
}

export function PasslineCanvas({ params, snapshot }: PasslineCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const paramsRef = useRef(params);
  const snapshotRef = useRef(snapshot);
  const dropletsRef = useRef<Droplet[]>([]);
  const scrollOffsetRef = useRef(0);

  const [hoverInfo, setHoverInfo] = useState<{
    x: number;
    y: number;
    label: string;
  } | null>(null);

  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

  useEffect(() => {
    snapshotRef.current = snapshot;
  }, [snapshot]);

  useEffect(() => {
    // Seed initial droplets
    if (dropletsRef.current.length === 0) {
      const seeded: Droplet[] = [];
      for (let i = 0; i < 65; i++) {
        seeded.push({
          x: Math.random(),
          yOffset: Math.random(),
          zoneIdx: Math.floor(Math.random() * 7),
          radius: 1.5 + Math.random() * 2.5,
          vxScale: 0.92 + Math.random() * 0.16,
          alpha: 0.55 + Math.random() * 0.4,
        });
      }
      dropletsRef.current = seeded;
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let lastTs = performance.now();

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(320, Math.floor(rect.width * dpr));
      canvas.height = Math.max(300, Math.floor(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - lastTs) / 1000);
      lastTs = now;

      const p = paramsRef.current;
      const snap = snapshotRef.current;
      const rect = container.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      // Speed pixel velocity scaled smoothly for 200-1200 m/min
      const speedNorm = (p.stripSpeedMpm - 200) / 1000;
      const pxPerSec = p.isRunning ? 140 + speedNorm * 440 : 0;
      scrollOffsetRef.current = (scrollOffsetRef.current + pxPerSec * dt) % 1200;

      // Clear canvas
      ctx.fillStyle = '#080B12';
      ctx.fillRect(0, 0, w, h);

      // Subtle calibration grid
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.45)';
      ctx.lineWidth = 1;
      for (let gx = 0; gx < w; gx += 48) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, h);
        ctx.stroke();
      }
      for (let gy = 0; gy < h; gy += 48) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(w, gy);
        ctx.stroke();
      }

      const splitY = Math.floor(h * 0.52);

      // ============================================================
      // UPPER HALF: SIDE-PROFILE PASSLINE CROSS-SECTION
      // ============================================================
      const stripY = Math.floor(splitY * 0.69);
      const stripThickness = 8;
      const knifeX = Math.floor(w * 0.34);
      const bridgeX = Math.floor(w * 0.62);
      const bridgeWidth = Math.min(180, w * 0.22);

      // Section label
      ctx.fillStyle = '#94A3B8';
      ctx.font = '600 11px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('SIDE PASSLINE CROSS-SECTION (15.0 MM NON-CONTACT STANDOFF)', 16, 22);

      // Work Roll Stand (left)
      const rollX = Math.max(46, w * 0.08);
      const rollRadius = 26;
      ctx.fillStyle = '#1E293B';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      // Top & bottom work rolls
      ctx.beginPath();
      ctx.arc(rollX, stripY - rollRadius - 1, rollRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(rollX, stripY + stripThickness + rollRadius + 1, rollRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Roll rotation spoke lines
      const rollAngle = (scrollOffsetRef.current / 26) % (Math.PI * 2);
      ctx.strokeStyle = '#64748B';
      ctx.beginPath();
      ctx.moveTo(rollX, stripY - rollRadius - 1);
      ctx.lineTo(
        rollX + Math.cos(rollAngle) * (rollRadius - 5),
        stripY - rollRadius - 1 + Math.sin(rollAngle) * (rollRadius - 5)
      );
      ctx.moveTo(rollX, stripY + stripThickness + rollRadius + 1);
      ctx.lineTo(
        rollX + Math.cos(-rollAngle) * (rollRadius - 5),
        stripY + stripThickness + rollRadius + 1 + Math.sin(-rollAngle) * (rollRadius - 5)
      );
      ctx.stroke();

      ctx.fillStyle = '#64748B';
      ctx.font = '500 10px "JetBrains Mono", monospace';
      ctx.fillText('WORK ROLLS', rollX - 30, stripY - rollRadius * 2 - 8);

      // Moving Cold-Rolled Steel Strip
      const flutterPx = p.isRunning
        ? Math.sin(now * 0.012) * (snap.flutterAmplitudeMm * 1.4)
        : 0;
      const stripDrawY = stripY + flutterPx;

      const stripGrad = ctx.createLinearGradient(0, stripDrawY, 0, stripDrawY + stripThickness);
      stripGrad.addColorStop(0, '#CBD5E1');
      stripGrad.addColorStop(0.5, '#94A3B8');
      stripGrad.addColorStop(1, '#475569');
      ctx.fillStyle = stripGrad;
      ctx.fillRect(rollX, stripDrawY, w - rollX - 16, stripThickness);

      // Animated motion grain ticks on strip
      ctx.fillStyle = '#E2E8F0';
      const tickSpacing = 44;
      const startTick = rollX + (scrollOffsetRef.current % tickSpacing);
      for (let tx = startTick; tx < w - 20; tx += tickSpacing) {
        ctx.fillRect(tx, stripDrawY + 2, 12, 1.5);
      }

      // Direction arrow
      ctx.fillStyle = '#38BDF8';
      ctx.font = '600 10px "JetBrains Mono", monospace';
      ctx.fillText(`${p.stripSpeedMpm} m/min (${snap.speedMps.toFixed(1)} m/s)  >>>`, w - 220, stripDrawY + 24);

      // Exit Air Knife Manifold (Side view)
      ctx.fillStyle = '#1E293B';
      ctx.strokeStyle = '#64748B';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(knifeX - 24, stripY - 62, 48, 34, 4);
      ctx.fill();
      ctx.stroke();

      // Air knife nozzle tip
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.moveTo(knifeX - 12, stripY - 28);
      ctx.lineTo(knifeX + 12, stripY - 28);
      ctx.lineTo(knifeX + 4, stripY - 12);
      ctx.lineTo(knifeX - 4, stripY - 12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#CBD5E1';
      ctx.font = '600 10px "JetBrains Mono", monospace';
      ctx.fillText(`EXIT AIR KNIFE (${p.airKnifeEfficiency}%)`, knifeX - 58, stripY - 70);

      // Animated Coanda Air-Jet Plume
      const plumeAlpha = 0.16 + (p.airKnifeEfficiency / 100) * 0.42;
      const boostActive = p.closedLoopEnabled && snap.zones.some((z) => z.valveBoostPct > 0);
      const plumeGrad = ctx.createLinearGradient(knifeX, stripY - 12, knifeX - 28, stripDrawY);
      plumeGrad.addColorStop(
        0,
        boostActive ? `rgba(34, 211, 238, ${plumeAlpha + 0.2})` : `rgba(148, 163, 184, ${plumeAlpha})`
      );
      plumeGrad.addColorStop(1, 'rgba(56, 189, 248, 0.04)');
      ctx.fillStyle = plumeGrad;
      ctx.beginPath();
      ctx.moveTo(knifeX - 4, stripY - 12);
      ctx.lineTo(knifeX + 4, stripY - 12);
      ctx.lineTo(knifeX + 18, stripDrawY);
      ctx.lineTo(knifeX - 30, stripDrawY);
      ctx.closePath();
      ctx.fill();

      // Non-Contact Overhead Sensor Bridge (mounted 15mm above strip)
      const bridgeBottomY = stripY - 24;
      const bridgeTopY = bridgeBottomY - 34;

      // Gantry support line
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(bridgeX - bridgeWidth / 2 - 10, bridgeTopY + 12);
      ctx.lineTo(bridgeX + bridgeWidth / 2 + 10, bridgeTopY + 12);
      ctx.stroke();

      // SWIR Sensor Module
      const swirX = bridgeX - bridgeWidth * 0.24;
      ctx.fillStyle = '#0F172A';
      ctx.strokeStyle = '#06B6D4';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(swirX - 34, bridgeTopY, 68, 34, 3);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#67E8F9';
      ctx.font = '600 9px "JetBrains Mono", monospace';
      ctx.fillText('SWIR 1450', swirX - 27, bridgeTopY + 14);
      ctx.fillText('/ 1940 nm', swirX - 27, bridgeTopY + 26);

      // SWIR Dual-Wavelength IR Laser Curtain penetrating mist
      const swirBeamGrad = ctx.createLinearGradient(swirX, bridgeBottomY, swirX, stripDrawY);
      swirBeamGrad.addColorStop(0, 'rgba(244, 63, 94, 0.55)');
      swirBeamGrad.addColorStop(0.5, 'rgba(6, 182, 212, 0.35)');
      swirBeamGrad.addColorStop(1, 'rgba(6, 182, 212, 0.65)');
      ctx.fillStyle = swirBeamGrad;
      ctx.beginPath();
      ctx.moveTo(swirX - 8, bridgeBottomY);
      ctx.lineTo(swirX + 8, bridgeBottomY);
      ctx.lineTo(swirX + 20, stripDrawY);
      ctx.lineTo(swirX - 20, stripDrawY);
      ctx.closePath();
      ctx.fill();

      // Capacitive Fringe-Field Array Module
      const capX = bridgeX + bridgeWidth * 0.24;
      ctx.fillStyle = '#0F172A';
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(capX - 36, bridgeTopY, 72, 34, 3);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#BAE6FD';
      ctx.font = '600 9px "JetBrains Mono", monospace';
      ctx.fillText('CAPACITIVE', capX - 30, bridgeTopY + 14);
      ctx.fillText('FRINGE εr80', capX - 30, bridgeTopY + 26);

      // Capacitive Fringe-Field Arcs across 15mm gap
      ctx.strokeStyle =
        snap.overallSeverity === 'critical'
          ? 'rgba(244, 63, 94, 0.85)'
          : snap.overallSeverity === 'warning'
          ? 'rgba(245, 158, 11, 0.8)'
          : 'rgba(56, 189, 248, 0.65)';
      ctx.lineWidth = 1.2;
      for (let arc = -1; arc <= 1; arc++) {
        ctx.beginPath();
        ctx.arc(capX + arc * 14, bridgeBottomY + 2, 12, 0.15 * Math.PI, 0.85 * Math.PI);
        ctx.stroke();
      }

      // 15mm clearance dimension indicator
      ctx.strokeStyle = '#64748B';
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(bridgeX + bridgeWidth * 0.56, bridgeBottomY);
      ctx.lineTo(bridgeX + bridgeWidth * 0.56, stripDrawY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#94A3B8';
      ctx.font = '500 9px "JetBrains Mono", monospace';
      ctx.fillText(`${snap.standoffMm.toFixed(1)} mm gap`, bridgeX + bridgeWidth * 0.58, bridgeBottomY + 15);

      // Escaping Coolant Film & Droplets downstream of Air Knife
      const hasCarryover = snap.peakFilmUm >= 2.2;
      if (hasCarryover) {
        const filmColor =
          snap.overallSeverity === 'critical'
            ? 'rgba(244, 63, 94, 0.75)'
            : snap.overallSeverity === 'warning'
            ? 'rgba(245, 158, 11, 0.7)'
            : 'rgba(56, 189, 248, 0.5)';
        ctx.fillStyle = filmColor;
        const filmH = Math.min(4.5, 1 + snap.peakFilmUm * 0.18);
        ctx.fillRect(knifeX + 8, stripDrawY - filmH, w - knifeX - 24, filmH);
      }

      // Update & Draw Droplets in BOTH views
      const bypassIntensity = Math.min(1, snap.peakFilmUm / 18);
      const activeCount = Math.floor(bypassIntensity * dropletsRef.current.length);

      for (let i = 0; i < dropletsRef.current.length; i++) {
        const d = dropletsRef.current[i];
        if (p.isRunning) {
          d.x += (pxPerSec / w) * d.vxScale * dt;
          if (d.x > 0.98) {
            d.x = 0.09 + Math.random() * 0.22;
            // Bias droplet spawn toward zones with higher film thickness
            const wetZones = snap.zones.filter((z) => z.filmThicknessUm >= 3.5);
            if (wetZones.length > 0 && Math.random() < 0.85) {
              const pick = wetZones[Math.floor(Math.random() * wetZones.length)];
              d.zoneIdx = pick.zoneIndex;
            } else {
              d.zoneIdx = Math.floor(Math.random() * 7);
            }
          }
        }

        // Before air knife: dense incoming emulsion droplets
        const pxX = d.x * w;
        const isPreKnife = pxX >= rollX + 10 && pxX <= knifeX - 6;
        const zoneFilm = snap.zones[d.zoneIdx]?.filmThicknessUm ?? 0;
        const isPostKnifeVisible = pxX > knifeX + 4 && i < activeCount && zoneFilm >= 2.5;

        if (isPreKnife || isPostKnifeVisible) {
          ctx.fillStyle = isPreKnife
            ? `rgba(148, 163, 184, ${d.alpha * 0.5})`
            : zoneFilm >= 12
            ? `rgba(244, 63, 94, ${d.alpha})`
            : zoneFilm >= 4
            ? `rgba(245, 158, 11, ${d.alpha})`
            : `rgba(56, 189, 248, ${d.alpha * 0.7})`;

          // Side-view droplet
          ctx.beginPath();
          ctx.arc(pxX, stripDrawY - 2 - d.yOffset * (isPreKnife ? 10 : 5), d.radius * 0.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Ambient Mill Mist / Steam Layer
      const mistOpacity =
        p.mistLevel === 'high' ? 0.34 : p.mistLevel === 'medium' ? 0.18 : 0.06;
      const mistGrad = ctx.createRadialGradient(
        w * 0.45,
        stripY - 25,
        20,
        w * 0.45,
        stripY - 25,
        w * 0.55
      );
      mistGrad.addColorStop(0, `rgba(203, 213, 225, ${mistOpacity})`);
      mistGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
      ctx.fillStyle = mistGrad;
      ctx.fillRect(rollX, 28, w - rollX - 16, splitY - 34);

      // Divider between Side View and Top-Down 7-Zone View
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, splitY);
      ctx.lineTo(w, splitY);
      ctx.stroke();

      // ============================================================
      // LOWER HALF: TOP-DOWN 7-ZONE TRANSVERSE STRIP VIEW
      // ============================================================
      ctx.fillStyle = '#94A3B8';
      ctx.font = '600 11px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('TOP-DOWN 7-ZONE TRANSVERSE STRIP SCANNER (Z1 LEFT EDGE -> Z7 RIGHT EDGE)', 16, splitY + 20);

      const topStripTop = splitY + 34;
      const topStripHeight = Math.max(84, h - topStripTop - 16);
      const zoneHeight = topStripHeight / 7;
      const stripLeft = Math.floor(w * 0.08);
      const stripRight = w - 20;
      const stripWidth = stripRight - stripLeft;

      // Strip steel background
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(stripLeft, topStripTop, stripWidth, topStripHeight);

      // Draw 7 transverse zones
      snap.zones.forEach((zone, idx) => {
        const zy = topStripTop + idx * zoneHeight;

        // Subtle moisture tint overlay downstream of air knife
        const knifePosTop = knifeX;
        let overlayColor = 'rgba(15, 23, 42, 0.18)';
        if (zone.severity === 'critical') {
          overlayColor = 'rgba(239, 68, 68, 0.28)';
        } else if (zone.severity === 'warning') {
          overlayColor = 'rgba(245, 158, 11, 0.22)';
        } else if (zone.filmThicknessUm > 1.5) {
          overlayColor = 'rgba(6, 182, 212, 0.14)';
        }

        ctx.fillStyle = overlayColor;
        ctx.fillRect(knifePosTop, zy, stripRight - knifePosTop, zoneHeight - 1);

        // Moving steel streaks inside each zone
        ctx.fillStyle = 'rgba(148, 163, 184, 0.12)';
        const streakStart = stripLeft + ((scrollOffsetRef.current + idx * 37) % 80);
        for (let sx = streakStart; sx < stripRight - 20; sx += 80) {
          ctx.fillRect(sx, zy + zoneHeight * 0.42, 24, 1.5);
        }

        // Liquid carryover streaks if wet
        if (zone.filmThicknessUm >= 3.2) {
          ctx.fillStyle =
            zone.severity === 'critical'
              ? 'rgba(244, 63, 94, 0.72)'
              : 'rgba(245, 158, 11, 0.65)';
          const streakOffset = (scrollOffsetRef.current * 1.1 + idx * 29) % 64;
          for (let lx = knifePosTop + streakOffset; lx < stripRight - 14; lx += 64) {
            ctx.beginPath();
            ctx.roundRect(lx, zy + zoneHeight * 0.25, 22, zoneHeight * 0.5, 2);
            ctx.fill();
          }
        }

        // Zone horizontal divider
        if (idx > 0) {
          ctx.strokeStyle = 'rgba(51, 65, 85, 0.55)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(stripLeft, zy);
          ctx.lineTo(stripRight, zy);
          ctx.stroke();
        }

        // Left zone label
        ctx.fillStyle =
          zone.severity === 'critical'
            ? '#FDA4AF'
            : zone.severity === 'warning'
            ? '#FCD34D'
            : '#94A3B8';
        ctx.font = '600 10px "JetBrains Mono", monospace';
        ctx.fillText(zone.label, 16, zy + zoneHeight * 0.65);

        // Right micron readout inside strip edge
        ctx.fillStyle = '#E2E8F0';
        ctx.font = '500 10px "JetBrains Mono", monospace';
        ctx.fillText(`${zone.filmThicknessUm.toFixed(1)} µm`, stripRight - 52, zy + zoneHeight * 0.65);
      });

      // Top-down Exit Air Knife bar + per-zone Coanda Boost indicator
      ctx.fillStyle = 'rgba(30, 41, 59, 0.92)';
      ctx.strokeStyle = '#64748B';
      ctx.lineWidth = 1.5;
      ctx.fillRect(knifeX - 8, topStripTop - 4, 16, topStripHeight + 8);
      ctx.strokeRect(knifeX - 8, topStripTop - 4, 16, topStripHeight + 8);

      snap.zones.forEach((zone, idx) => {
        if (zone.valveBoostPct > 0 && p.closedLoopEnabled) {
          const zy = topStripTop + idx * zoneHeight;
          ctx.fillStyle = '#22D3EE';
          ctx.fillRect(knifeX - 4, zy + 2, 8, zoneHeight - 4);
        }
      });

      // Top-down Overhead Sensor Bridge scan line (SWIR + Capacitive)
      ctx.strokeStyle = '#06B6D4';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(bridgeX, topStripTop - 4);
      ctx.lineTo(bridgeX, topStripTop + topStripHeight + 4);
      ctx.stroke();

      ctx.fillStyle = 'rgba(6, 182, 212, 0.16)';
      ctx.fillRect(bridgeX - 10, topStripTop, 20, topStripHeight);

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const splitY = rect.height * 0.52;

    if (y < splitY) {
      const knifeX = rect.width * 0.34;
      const bridgeX = rect.width * 0.62;
      if (Math.abs(x - knifeX) < 35) {
        setHoverInfo({ x, y, label: `Exit Air-Knife Manifold · ${params.airKnifeEfficiency}% eff.` });
      } else if (Math.abs(x - bridgeX) < 75) {
        setHoverInfo({ x, y, label: `Dual Sensor Bridge · ${snapshot.standoffMm.toFixed(1)} mm gap` });
      } else {
        setHoverInfo({ x, y, label: `Passline Strip · ${params.stripSpeedMpm} m/min` });
      }
    } else {
      const topStripTop = splitY + 34;
      const topStripHeight = Math.max(84, rect.height - topStripTop - 16);
      const relY = y - topStripTop;
      if (relY >= 0 && relY <= topStripHeight) {
        const zIdx = Math.min(6, Math.max(0, Math.floor((relY / topStripHeight) * 7)));
        const z = snapshot.zones[zIdx];
        if (z) {
          setHoverInfo({
            x,
            y,
            label: `${z.label} (${z.positionLabel}) · ${z.filmThicknessUm.toFixed(2)} µm · ${z.capacitanceShiftPf.toFixed(2)} pF`,
          });
        }
      } else {
        setHoverInfo(null);
      }
    }
  };

  return (
    <section className="flex flex-col bg-[#0B0E17] border border-slate-800 rounded overflow-hidden">
      <div className="px-4 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <span className="font-semibold text-slate-100">
            Live Passline Digital Twin
          </span>
          <span className="text-slate-600" aria-hidden="true">·</span>
          <span className="font-mono text-slate-400">
            15.0 mm Non-Contact Bridge
          </span>
          <span className="text-slate-600" aria-hidden="true">·</span>
          <span className="font-mono text-cyan-400">
            SWIR 1450/1940 nm + Capacitive εr≈80
          </span>
        </div>

        <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
          <span>
            SWIR Purge:{' '}
            <strong className={params.purgeCurtainEnabled ? 'text-emerald-400' : 'text-amber-400'}>
              {params.purgeCurtainEnabled ? 'ACTIVE' : 'OFF'}
            </strong>
          </span>
          <span>
            Flutter Comp:{' '}
            <strong className={params.flutterCompensationEnabled ? 'text-emerald-400' : 'text-amber-400'}>
              {params.flutterCompensationEnabled ? 'LOCKED' : 'RAW'}
            </strong>
          </span>
          <span>
            Piezo Boost:{' '}
            <strong className={params.closedLoopEnabled ? 'text-cyan-400' : 'text-slate-500'}>
              {params.closedLoopEnabled ? 'CLOSED-LOOP' : 'PASSIVE'}
            </strong>
          </span>
        </div>
      </div>

      <div ref={containerRef} className="relative w-full h-[360px] xl:h-[390px]">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverInfo(null)}
          className="w-full h-full block cursor-crosshair"
        />

        {hoverInfo && (
          <div
            className="pointer-events-none absolute top-3 right-3 px-2.5 py-1 bg-[#07090E]/90 border border-slate-700 rounded text-[11px] font-mono text-cyan-300"
          >
            {hoverInfo.label}
          </div>
        )}
      </div>
    </section>
  );
}
