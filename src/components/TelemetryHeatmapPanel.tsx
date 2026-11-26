import {
  SimulationParams,
  TelemetryHistoryPoint,
  TelemetrySnapshot,
  ZoneTelemetry,
} from '../types/simulation';
import { CarryoverSpeedChart } from './CarryoverSpeedChart';

interface TelemetryHeatmapPanelProps {
  params: SimulationParams;
  snapshot: TelemetrySnapshot;
  history: TelemetryHistoryPoint[];
}

function getHeatmapCellStyle(zone: ZoneTelemetry): {
  bg: string;
  border: string;
  text: string;
} {
  if (zone.severity === 'critical') {
    return {
      bg: 'bg-rose-500/25',
      border: 'border-rose-500/70',
      text: 'text-rose-200',
    };
  }
  if (zone.severity === 'warning') {
    return {
      bg: 'bg-amber-500/20',
      border: 'border-amber-500/60',
      text: 'text-amber-200',
    };
  }
  if (zone.filmThicknessUm >= 1.8) {
    return {
      bg: 'bg-cyan-500/15',
      border: 'border-cyan-500/40',
      text: 'text-cyan-200',
    };
  }
  return {
    bg: 'bg-slate-900',
    border: 'border-slate-800',
    text: 'text-slate-200',
  };
}

export function TelemetryHeatmapPanel({
  params,
  snapshot,
  history,
}: TelemetryHeatmapPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* 7-Zone Transverse Moisture Heatmap */}
      <section className="bg-[#0B0E17] border border-slate-800 rounded p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">
              7-Zone Transverse Moisture Heatmap
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Residual coolant film thickness (µm) across strip width · Peak:{' '}
              <span className="font-mono text-slate-200">
                {snapshot.peakFilmUm.toFixed(2)} µm
              </span>{' '}
              at <span className="font-mono text-slate-200">{snapshot.peakZoneLabel}</span>
            </p>
          </div>

          {/* Calibrated Heatmap Legend */}
          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-slate-800 border border-slate-600" />
              0–1.7 µm Dry
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-cyan-500/40 border border-cyan-400" />
              1.8–3.9 µm Mist
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-amber-500/40 border border-amber-400" />
              4.0–11.9 µm Warn
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-rose-500/50 border border-rose-400" />
              ≥12 µm Crit
            </span>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {snapshot.zones.map((zone) => {
            const style = getHeatmapCellStyle(zone);
            return (
              <div
                key={zone.label}
                className={`p-2.5 rounded border transition-colors ${style.bg} ${style.border}`}
              >
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="font-semibold text-slate-300">{zone.label}</span>
                  {params.closedLoopEnabled && zone.valveBoostPct > 0 ? (
                    <span className="text-[10px] text-cyan-300">
                      +{zone.valveBoostPct}%
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500">
                      {zone.valvePressureBar.toFixed(1)}b
                    </span>
                  )}
                </div>

                <div className={`mt-1.5 font-mono text-base font-bold ${style.text}`}>
                  {zone.filmThicknessUm.toFixed(1)}
                  <span className="text-[10px] font-normal text-slate-400 ml-0.5">
                    µm
                  </span>
                </div>

                <div className="mt-1 text-[10px] text-slate-400 truncate">
                  {zone.positionLabel}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Dual-Sensor & Edge-AI Telemetry Readout Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* SWIR Optical Absorption */}
        <div className="bg-[#0B0E17] border border-slate-800 rounded p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-slate-400">
              SWIR Optical Absorption
            </span>
            <span className="text-[11px] font-mono text-cyan-400">
              1450 / 1940 nm
            </span>
          </div>

          <div className="mt-2 flex items-baseline">
            <span className="text-3xl font-mono font-bold text-slate-100">
              {snapshot.avgSwirAbsorptionPct.toFixed(1)}
            </span>
            <span className="text-xs font-mono uppercase text-slate-400 ml-1.5">
              % abs
            </span>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div>
              <span className="text-slate-500">1450 nm: </span>
              <span className="text-slate-200">{snapshot.swir1450Pct.toFixed(1)}%</span>
            </div>
            <div>
              <span className="text-slate-500">1940 nm: </span>
              <span className="text-slate-200">{snapshot.swir1940Pct.toFixed(1)}%</span>
            </div>
            <div className="col-span-2 text-slate-400">
              Mist Immunity: <span className="text-emerald-400">{snapshot.dualSensorConfidencePct.toFixed(1)}%</span>
              <span className="text-slate-600 mx-1">·</span>
              RGB Baseline: <span className="text-rose-400">{snapshot.rgbConfidencePct.toFixed(0)}%</span>
            </div>
          </div>
        </div>

        {/* Capacitive Dielectric Shift */}
        <div className="bg-[#0B0E17] border border-slate-800 rounded p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-slate-400">
              Capacitive Dielectric Shift
            </span>
            <span className="text-[11px] font-mono text-cyan-400">
              εr ≈ 80 vs 1
            </span>
          </div>

          <div className="mt-2 flex items-baseline">
            <span className="text-3xl font-mono font-bold text-slate-100">
              +{snapshot.peakCapacitanceShiftPf.toFixed(2)}
            </span>
            <span className="text-xs font-mono uppercase text-slate-400 ml-1.5">
              pF peak
            </span>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800/80 space-y-1 text-[11px] font-mono">
            <div className="flex justify-between">
              <span className="text-slate-500">Passline Flutter:</span>
              <span className="text-slate-200">
                ±{snapshot.flutterAmplitudeMm.toFixed(2)} mm
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Diff. Compensation:</span>
              <span
                className={
                  params.flutterCompensationEnabled
                    ? 'text-emerald-400'
                    : 'text-amber-400'
                }
              >
                {params.flutterCompensationEnabled ? 'ACTIVE (CLEAN)' : 'DISABLED (NOISY)'}
              </span>
            </div>
          </div>
        </div>

        {/* Edge-AI Processing Latency */}
        <div className="bg-[#0B0E17] border border-slate-800 rounded p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-slate-400">
              Edge-AI Processing Latency
            </span>
            <span className="text-[11px] font-mono text-emerald-400">
              Target &lt; 5.0 ms
            </span>
          </div>

          <div className="mt-2 flex items-baseline">
            <span className="text-3xl font-mono font-bold text-slate-100">
              {snapshot.edgeAiLatencyMs.toFixed(2)}
            </span>
            <span className="text-xs font-mono uppercase text-slate-400 ml-1.5">
              ms
            </span>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-800/80 space-y-1 text-[11px] font-mono">
            <div className="flex justify-between">
              <span className="text-slate-500">Strip Travel / Loop:</span>
              <span className="text-cyan-300">
                {snapshot.stripTravelPerLoopCm.toFixed(1)} cm (&lt;10 cm)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Dry-Zone Air Saved:</span>
              <span className="text-slate-200">
                {params.closedLoopEnabled ? `${snapshot.compressedAirSavedPct}%` : '0% (Passive)'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* D3.js Rolling History: Coolant Carryover Volume vs Strip Speed & Efficacy */}
      <CarryoverSpeedChart
        history={history}
        currentSpeedMpm={params.stripSpeedMpm}
        currentCarryoverMlPerSec={snapshot.totalCarryoverVolumeMlPerSec}
        dualSensorConfidencePct={snapshot.dualSensorConfidencePct}
        rgbConfidencePct={snapshot.rgbConfidencePct}
      />
    </div>
  );
}
