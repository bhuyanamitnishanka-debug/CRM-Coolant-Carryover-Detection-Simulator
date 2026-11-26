import { Pause, Play, RotateCcw, Waves, Wind, ShieldCheck, Activity } from 'lucide-react';
import { MistLevel, SimulationParams } from '../types/simulation';

interface ControlSidebarProps {
  params: SimulationParams;
  coilId: string;
  coilMeterMark: number;
  speedMps: number;
  onChangeParams: (patch: Partial<SimulationParams>) => void;
  onResetCoil: () => void;
}

const MIST_OPTIONS: { value: MistLevel; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const SPEED_PRESETS = [450, 850, 1200];

export function ControlSidebar({
  params,
  coilId,
  coilMeterMark,
  speedMps,
  onChangeParams,
  onResetCoil,
}: ControlSidebarProps) {
  return (
    <aside className="w-full lg:w-[304px] xl:w-[320px] bg-[#0B0E17] border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col shrink-0 overflow-y-auto">
      {/* Header & Playback */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">Mill Line Controls</h2>
          <p className="text-xs font-mono text-slate-400 mt-0.5">
            {coilId} · {coilMeterMark.toFixed(1)} m
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onChangeParams({ isRunning: !params.isRunning })}
            aria-label={params.isRunning ? 'Pause simulation' : 'Resume simulation'}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 rounded transition-colors cursor-pointer whitespace-nowrap"
          >
            {params.isRunning ? (
              <>
                <Pause className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                Run
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onResetCoil}
            title="Start New Coil"
            aria-label="Start New Coil"
            className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Strip Speed Slider */}
      <div className="p-4 border-b border-slate-800/80 space-y-3">
        <div className="flex items-baseline justify-between gap-2">
          <label htmlFor="strip-speed" className="text-xs font-medium text-slate-300">
            Strip Speed
          </label>
          <div className="text-right font-mono">
            <span className="text-base font-semibold text-cyan-400">
              {params.stripSpeedMpm}
            </span>
            <span className="text-xs text-slate-400 ml-1">m/min</span>
            <span className="text-xs text-slate-500 mx-1.5">·</span>
            <span className="text-xs font-medium text-slate-200">
              {speedMps.toFixed(2)} m/s
            </span>
          </div>
        </div>

        <input
          id="strip-speed"
          type="range"
          min={200}
          max={1200}
          step={10}
          value={params.stripSpeedMpm}
          onChange={(e) => onChangeParams({ stripSpeedMpm: Number(e.target.value) })}
          className="telemetry-slider"
        />

        <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
          <span>200 m/min</span>
          <div className="flex items-center gap-1">
            {SPEED_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => onChangeParams({ stripSpeedMpm: preset })}
                className={`px-1.5 py-0.5 rounded text-[11px] transition-colors cursor-pointer ${
                  params.stripSpeedMpm === preset
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
          <span>1200 m/min</span>
        </div>
      </div>

      {/* Exit Air-Knife Efficiency Slider */}
      <div className="p-4 border-b border-slate-800/80 space-y-3">
        <div className="flex items-baseline justify-between gap-2">
          <label htmlFor="knife-eff" className="text-xs font-medium text-slate-300">
            Exit Air-Knife Efficiency
          </label>
          <span
            className={`text-base font-mono font-semibold ${
              params.airKnifeEfficiency < 80
                ? params.airKnifeEfficiency < 60
                  ? 'text-rose-400'
                  : 'text-amber-400'
                : 'text-emerald-400'
            }`}
          >
            {params.airKnifeEfficiency}%
          </span>
        </div>

        <input
          id="knife-eff"
          type="range"
          min={40}
          max={100}
          step={1}
          value={params.airKnifeEfficiency}
          onChange={(e) =>
            onChangeParams({ airKnifeEfficiency: Number(e.target.value) })
          }
          className="telemetry-slider"
        />

        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="font-mono text-slate-500">40% Clogged</span>
          <span className="text-slate-400">
            {params.airKnifeEfficiency < 80
              ? 'Nozzle pressure drop active'
              : 'Nominal wiping pressure'}
          </span>
          <span className="font-mono text-slate-500">100%</span>
        </div>
      </div>

      {/* Ambient Mill Mist / Steam Level */}
      <div className="p-4 border-b border-slate-800/80 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-300">
            Ambient Mill Mist / Steam
          </span>
          <span className="text-[11px] font-mono text-slate-400 capitalize">
            {params.mistLevel} density
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1 p-1 bg-[#07090E] border border-slate-800 rounded">
          {MIST_OPTIONS.map((opt) => {
            const active = params.mistLevel === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChangeParams({ mistLevel: opt.value })}
                className={`py-1.5 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-slate-800 text-cyan-300 border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 border border-transparent'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Simulate Edge Coolant Pooling */}
      <div className="p-4 border-b border-slate-800/80 space-y-2.5">
        <button
          type="button"
          onClick={() =>
            onChangeParams({ edgePoolingEnabled: !params.edgePoolingEnabled })
          }
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded border text-left transition-colors cursor-pointer ${
            params.edgePoolingEnabled
              ? 'bg-amber-500/15 border-amber-500/50 text-amber-200'
              : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 text-slate-200'
          }`}
        >
          <span className="inline-flex items-center gap-2 text-xs font-semibold">
            <Waves
              className={`w-4 h-4 ${
                params.edgePoolingEnabled ? 'text-amber-400' : 'text-slate-400'
              }`}
              aria-hidden="true"
            />
            Simulate Edge Coolant Pooling
          </span>
          <span className="text-[11px] font-mono uppercase">
            {params.edgePoolingEnabled ? 'ON' : 'OFF'}
          </span>
        </button>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Injects concentrated emulsion pooling along outer strip edges (Z1 &amp; Z7) to stress-test zone isolation.
        </p>
      </div>

      {/* Closed-Loop & Engineering Safeguards */}
      <div className="p-4 space-y-3">
        <h3 className="text-xs font-semibold text-slate-300">
          Closed-Loop &amp; Sensor Safeguards
        </h3>

        <label className="flex items-start justify-between gap-3 cursor-pointer select-none">
          <div className="space-y-0.5">
            <div className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-200">
              <Wind className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
              Closed-Loop Piezo Air Boost
            </div>
            <p className="text-[11px] text-slate-400">
              7-zone proportional valves (&lt;3 ms) auto-compensate wet zones.
            </p>
          </div>
          <input
            type="checkbox"
            checked={params.closedLoopEnabled}
            onChange={(e) =>
              onChangeParams({ closedLoopEnabled: e.target.checked })
            }
            className="mt-1 h-4 w-4 accent-cyan-400 cursor-pointer"
          />
        </label>

        <div className="h-px bg-slate-800/70" />

        <label className="flex items-start justify-between gap-3 cursor-pointer select-none">
          <div className="space-y-0.5">
            <div className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-200">
              <Activity className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
              Passline Flutter Compensation
            </div>
            <p className="text-[11px] text-slate-400">
              Differential dual-channel capacitive height cancellation.
            </p>
          </div>
          <input
            type="checkbox"
            checked={params.flutterCompensationEnabled}
            onChange={(e) =>
              onChangeParams({ flutterCompensationEnabled: e.target.checked })
            }
            className="mt-1 h-4 w-4 accent-cyan-400 cursor-pointer"
          />
        </label>

        <div className="h-px bg-slate-800/70" />

        <label className="flex items-start justify-between gap-3 cursor-pointer select-none">
          <div className="space-y-0.5">
            <div className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-200">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
              SWIR Dry-Air Purge Curtain
            </div>
            <p className="text-[11px] text-slate-400">
              Positive-pressure air curtain prevents optical lens fouling.
            </p>
          </div>
          <input
            type="checkbox"
            checked={params.purgeCurtainEnabled}
            onChange={(e) =>
              onChangeParams({ purgeCurtainEnabled: e.target.checked })
            }
            className="mt-1 h-4 w-4 accent-cyan-400 cursor-pointer"
          />
        </label>
      </div>
    </aside>
  );
}
