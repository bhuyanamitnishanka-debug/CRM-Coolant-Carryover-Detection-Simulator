import { useState } from 'react';
import { AlertTriangle, CheckCircle2, OctagonAlert, Trash2 } from 'lucide-react';
import { DefectLogEntry, TelemetrySnapshot } from '../types/simulation';

interface PlcLogSidebarProps {
  snapshot: TelemetrySnapshot;
  logs: DefectLogEntry[];
  onClearLogs: () => void;
}

type LogFilter = 'all' | 'warning' | 'critical';

export function PlcLogSidebar({
  snapshot,
  logs,
  onClearLogs,
}: PlcLogSidebarProps) {
  const [filter, setFilter] = useState<LogFilter>('all');

  const filteredLogs = logs.filter((entry) => {
    if (filter === 'all') return true;
    return entry.severity === filter;
  });

  const statusConfig = {
    optimal: {
      container: 'bg-emerald-500/10 border-emerald-500/40',
      text: 'text-emerald-300',
      badge: 'GREEN · OPTIMAL DRY STRIP',
      detail: 'Residual film within dry threshold (< 4.0 µm). Downstream coating & annealing clear.',
      Icon: CheckCircle2,
    },
    warning: {
      container: 'bg-amber-500/10 border-amber-500/50',
      text: 'text-amber-300',
      badge: 'AMBER · MICRO-CARRYOVER WARNING',
      detail: `Inspect Exit Air Knife Zone (${snapshot.peakZoneLabel}). Residual film 4.0–11.9 µm detected.`,
      Icon: AlertTriangle,
    },
    critical: {
      container: 'bg-rose-500/12 border-rose-500/60',
      text: 'text-rose-300',
      badge: 'RED · CRITICAL CARRYOVER',
      detail: `Tag Coil Meter-Mark (${snapshot.coilMeterMark.toFixed(1)} m) & Alert Downstream Line immediately.`,
      Icon: OctagonAlert,
    },
  }[snapshot.overallSeverity];

  const StatusIcon = statusConfig.Icon;

  return (
    <aside className="w-full lg:w-[340px] xl:w-[360px] bg-[#0B0E17] border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col shrink-0 overflow-hidden">
      {/* PLC Status Banner */}
      <div className="p-4 border-b border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-100">
            PLC Alert &amp; Coil Quality Log
          </h2>
          <span className="text-[11px] font-mono text-slate-400">
            OPC-UA / Modbus
          </span>
        </div>

        <div className={`p-3 rounded border ${statusConfig.container}`}>
          <div className={`flex items-center gap-2 text-xs font-mono font-bold ${statusConfig.text}`}>
            <StatusIcon className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{statusConfig.badge}</span>
          </div>
          <p className="mt-1.5 text-xs text-slate-300 leading-relaxed">
            {statusConfig.detail}
          </p>
        </div>

        {/* 3-Tier Automated PLC / MES Workflow */}
        <div className="grid grid-cols-3 gap-1.5 pt-1 text-[11px] font-mono">
          <div
            className={`px-2 py-1.5 rounded border text-center ${
              snapshot.overallSeverity !== 'optimal'
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            Tier 1: Pulpit
          </div>
          <div
            className={`px-2 py-1.5 rounded border text-center ${
              snapshot.overallSeverity !== 'optimal'
                ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            Tier 2: MES Tag
          </div>
          <div
            className={`px-2 py-1.5 rounded border text-center ${
              snapshot.overallSeverity === 'critical'
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            Tier 3: Divert
          </div>
        </div>
      </div>

      {/* Coil Defect Coordinate Log Controls */}
      <div className="px-4 py-2.5 border-b border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 p-0.5 bg-[#07090E] border border-slate-800 rounded">
          {(['all', 'warning', 'critical'] as LogFilter[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded capitalize transition-colors cursor-pointer whitespace-nowrap ${
                filter === tab
                  ? 'bg-slate-800 text-slate-100'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onClearLogs}
          disabled={logs.length === 0}
          className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <Trash2 className="w-3 h-3" aria-hidden="true" />
          Clear ({logs.length})
        </button>
      </div>

      {/* Scrolling Coil Defect Coordinate Log */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/70">
        {filteredLogs.length === 0 ? (
          <div className="p-6 text-center space-y-1.5">
            <p className="text-xs font-medium text-slate-300">
              No carryover events logged for {snapshot.coilId}
            </p>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Lower Exit Air-Knife Efficiency below 80% or toggle Edge Coolant Pooling to capture coil meter-mark coordinates.
            </p>
          </div>
        ) : (
          filteredLogs.map((entry) => {
            const isCrit = entry.severity === 'critical';
            return (
              <div
                key={entry.id}
                className="px-4 py-3 hover:bg-slate-900/50 transition-colors space-y-1"
              >
                <div className="flex items-center justify-between gap-2 font-mono text-[11px]">
                  <span
                    className={`font-semibold ${
                      isCrit ? 'text-rose-400' : 'text-amber-400'
                    }`}
                  >
                    {isCrit ? 'CRITICAL' : 'WARNING'} · {entry.meterMarkM.toFixed(1)} m
                  </span>
                  <span className="text-slate-500">{entry.timestampStr}</span>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-300">
                  <span>Zones: {entry.affectedZones.join(', ')}</span>
                  <span>{entry.peakFilmUm.toFixed(1)} µm</span>
                </div>

                <p className="text-[11px] text-slate-400 leading-snug">
                  {entry.actionTaken}
                </p>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
