import { useCallback, useEffect, useRef, useState } from 'react';
import { Concept3DView } from './components/Concept3DView';
import { ControlSidebar } from './components/ControlSidebar';
import { ExportReportModal } from './components/ExportReportModal';
import { PasslineCanvas } from './components/PasslineCanvas';
import { PlcLogSidebar } from './components/PlcLogSidebar';
import { ProposalBriefView } from './components/ProposalBriefView';
import { TelemetryHeatmapPanel } from './components/TelemetryHeatmapPanel';
import { TopBar } from './components/TopBar';
import {
  DefectLogEntry,
  SimulationParams,
  TelemetryHistoryPoint,
  TelemetrySnapshot,
  WorkspaceTab,
} from './types/simulation';
import { computeTelemetrySnapshot } from './utils/physicsEngine';

const INITIAL_PARAMS: SimulationParams = {
  stripSpeedMpm: 950,
  airKnifeEfficiency: 90,
  mistLevel: 'medium',
  edgePoolingEnabled: false,
  closedLoopEnabled: true,
  flutterCompensationEnabled: true,
  purgeCurtainEnabled: true,
  isRunning: true,
};

function generateCoilId(seq: number): string {
  return `CRM-26-${String(1040 + seq).padStart(4, '0')}`;
}

function toHistoryPoint(
  snap: TelemetrySnapshot,
  speedMpm: number,
  sampleIndex: number
): TelemetryHistoryPoint {
  const timeLabel = new Date(snap.timestamp).toLocaleTimeString('en-GB', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  return {
    sampleIndex,
    timeLabel,
    meterMarkM: snap.coilMeterMark,
    stripSpeedMpm: speedMpm,
    totalCarryoverVolumeMlPerSec: snap.totalCarryoverVolumeMlPerSec,
    dualSensorConfidencePct: snap.dualSensorConfidencePct,
    rgbConfidencePct: snap.rgbConfidencePct,
    severity: snap.overallSeverity,
  };
}

function buildSeedHistory(
  params: SimulationParams,
  coilId: string,
  endMeterMark: number,
  endPhase: number
): TelemetryHistoryPoint[] {
  const count = 24;
  const dtSec = 0.25;
  const mPerTick = (params.stripSpeedMpm / 60) * dtSec;
  const points: TelemetryHistoryPoint[] = [];

  for (let i = 0; i < count; i++) {
    const offset = count - 1 - i;
    const meter = Math.max(0, endMeterMark - offset * mPerTick);
    const phase = Math.max(0, endPhase - offset * dtSec);
    const snap = computeTelemetrySnapshot(params, coilId, meter, phase);
    points.push(toHistoryPoint(snap, params.stripSpeedMpm, i + 1));
  }
  return points;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('twin');
  const [params, setParams] = useState<SimulationParams>(INITIAL_PARAMS);
  const [coilSeq, setCoilSeq] = useState(1);
  const [exportOpen, setExportOpen] = useState(false);

  const coilId = generateCoilId(coilSeq);
  const meterMarkRef = useRef<number>(142.0);
  const phaseRef = useRef<number>(6.0);
  const sampleIndexRef = useRef<number>(24);
  const lastLogTimeRef = useRef<number>(0);
  const lastLoggedSeverityRef = useRef<string>('optimal');

  const [snapshot, setSnapshot] = useState<TelemetrySnapshot>(() =>
    computeTelemetrySnapshot(INITIAL_PARAMS, generateCoilId(1), 142.0, 6.0)
  );
  const [history, setHistory] = useState<TelemetryHistoryPoint[]>(() =>
    buildSeedHistory(INITIAL_PARAMS, generateCoilId(1), 142.0, 6.0)
  );
  const [defectLogs, setDefectLogs] = useState<DefectLogEntry[]>([]);

  const appendDefectIfNeeded = useCallback(
    (snap: TelemetrySnapshot, currentParams: SimulationParams) => {
      if (snap.overallSeverity === 'optimal') {
        lastLoggedSeverityRef.current = 'optimal';
        return;
      }

      const now = Date.now();
      const escalated =
        snap.overallSeverity === 'critical' &&
        lastLoggedSeverityRef.current !== 'critical';

      if (!escalated && now - lastLogTimeRef.current < 2200) {
        return;
      }

      lastLogTimeRef.current = now;
      lastLoggedSeverityRef.current = snap.overallSeverity;

      const affected = snap.zones
        .filter((z) => z.severity !== 'optimal')
        .map((z) => z.label);

      const actionTaken =
        snap.overallSeverity === 'critical'
          ? currentParams.closedLoopEnabled
            ? 'Tag meter-mark in MES; max piezo boost applied; alert downstream coating line.'
            : 'Tag meter-mark in MES; alert downstream annealing/coating line for coil diversion.'
          : currentParams.closedLoopEnabled
          ? `Piezo boost active on ${affected.join(', ')}; inspect air-knife nozzle pressure.`
          : `Inspect exit air-knife zone (${affected.join(', ')}) for clogged nozzles.`;

      const timeStr = new Date().toLocaleTimeString('en-GB', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      const entry: DefectLogEntry = {
        id: `${now}-${Math.random().toString(36).slice(2, 7)}`,
        timestampStr: timeStr,
        coilId: snap.coilId,
        meterMarkM: snap.coilMeterMark,
        affectedZones: affected,
        peakFilmUm: snap.peakFilmUm,
        swirAbsorptionPct: snap.avgSwirAbsorptionPct,
        capacitanceShiftPf: snap.peakCapacitanceShiftPf,
        severity: snap.overallSeverity,
        actionTaken,
        mitigatedByClosedLoop: currentParams.closedLoopEnabled,
      };

      setDefectLogs((prev) => [entry, ...prev].slice(0, 80));
    },
    []
  );

  // Immediate physics recalculation on any parameter change
  const handleChangeParams = (patch: Partial<SimulationParams>) => {
    setParams((prev) => {
      const next = { ...prev, ...patch };
      const snap = computeTelemetrySnapshot(
        next,
        coilId,
        meterMarkRef.current,
        phaseRef.current
      );
      setSnapshot(snap);
      appendDefectIfNeeded(snap, next);
      return next;
    });
  };

  const handleResetCoil = () => {
    const nextSeq = coilSeq + 1;
    const nextCoilId = generateCoilId(nextSeq);
    setCoilSeq(nextSeq);
    meterMarkRef.current = 0;
    lastLoggedSeverityRef.current = 'optimal';
    lastLogTimeRef.current = 0;
    sampleIndexRef.current = 1;
    setDefectLogs([]);
    const snap = computeTelemetrySnapshot(params, nextCoilId, 0, phaseRef.current);
    setSnapshot(snap);
    setHistory([toHistoryPoint(snap, params.stripSpeedMpm, 1)]);
  };

  // Real-time simulation telemetry loop (250ms sampling for stable numeric readouts)
  useEffect(() => {
    const intervalMs = 250;
    const timer = window.setInterval(() => {
      if (!params.isRunning) return;

      const dtSec = intervalMs / 1000;
      phaseRef.current += dtSec;
      meterMarkRef.current += (params.stripSpeedMpm / 60) * dtSec;
      sampleIndexRef.current += 1;

      const snap = computeTelemetrySnapshot(
        params,
        coilId,
        meterMarkRef.current,
        phaseRef.current
      );
      setSnapshot(snap);
      setHistory((prev) =>
        [...prev, toHistoryPoint(snap, params.stripSpeedMpm, sampleIndexRef.current)].slice(-60)
      );
      appendDefectIfNeeded(snap, params);
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [params, coilId, appendDefectIfNeeded]);

  return (
    <div className="min-h-screen lg:h-screen flex flex-col bg-[#07090E] text-slate-100 lg:overflow-hidden">
      <TopBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenExport={() => setExportOpen(true)}
      />

      {activeTab === 'twin' && (
        <main className="no-print flex-1 flex flex-col lg:flex-row min-h-0 overflow-y-auto lg:overflow-hidden">
          <ControlSidebar
            params={params}
            coilId={snapshot.coilId}
            coilMeterMark={snapshot.coilMeterMark}
            speedMps={snapshot.speedMps}
            onChangeParams={handleChangeParams}
            onResetCoil={handleResetCoil}
          />

          <div className="flex-1 flex flex-col gap-4 p-4 min-w-0 lg:overflow-y-auto">
            <PasslineCanvas params={params} snapshot={snapshot} />
            <TelemetryHeatmapPanel
              params={params}
              snapshot={snapshot}
              history={history}
            />
          </div>

          <PlcLogSidebar
            snapshot={snapshot}
            logs={defectLogs}
            onClearLogs={() => setDefectLogs([])}
          />
        </main>
      )}

      {activeTab === 'concept3d' && (
        <div className="no-print flex-1 flex flex-col min-h-0 overflow-hidden">
          <Concept3DView />
        </div>
      )}

      {activeTab === 'proposal' && (
        <div className="no-print flex-1 flex flex-col min-h-0 overflow-hidden">
          <ProposalBriefView />
        </div>
      )}

      <ExportReportModal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        snapshot={snapshot}
        params={params}
        logs={defectLogs}
      />

      {/* Print-only formatted Coil Inspection Certificate */}
      <section className="hidden print-only p-8 bg-white text-slate-900">
        <div className="border-b-2 border-slate-900 pb-4 mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-xl font-bold">
              CRM Coolant Carryover Coil Inspection Report
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              SWIR Optical (1450/1940 nm) + Non-Contact Capacitive Fringe-Field &amp; Edge-AI Telemetry
            </p>
          </div>
          <div className="text-right text-xs font-mono">
            <div>Coil ID: {snapshot.coilId}</div>
            <div>Inspected Length: {snapshot.coilMeterMark.toFixed(1)} m</div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6 text-xs font-mono border border-slate-300 p-3 rounded">
          <div>
            <div className="text-slate-500">Line Speed</div>
            <div className="font-bold">
              {params.stripSpeedMpm} m/min ({snapshot.speedMps.toFixed(2)} m/s)
            </div>
          </div>
          <div>
            <div className="text-slate-500">Air-Knife Eff.</div>
            <div className="font-bold">{params.airKnifeEfficiency}%</div>
          </div>
          <div>
            <div className="text-slate-500">Edge-AI Latency</div>
            <div className="font-bold">{snapshot.edgeAiLatencyMs.toFixed(2)} ms</div>
          </div>
          <div>
            <div className="text-slate-500">Logged Defects</div>
            <div className="font-bold">{defectLogs.length}</div>
          </div>
        </div>

        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead>
            <tr className="border-b border-slate-400">
              <th className="py-2">Time</th>
              <th className="py-2">Meter-Mark</th>
              <th className="py-2">Severity</th>
              <th className="py-2">Zones</th>
              <th className="py-2">Film (µm)</th>
              <th className="py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {defectLogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-4 text-center text-slate-500">
                  No carryover defects recorded during this coil run.
                </td>
              </tr>
            ) : (
              defectLogs.map((entry) => (
                <tr key={entry.id} className="border-b border-slate-200">
                  <td className="py-1.5">{entry.timestampStr}</td>
                  <td className="py-1.5">{entry.meterMarkM.toFixed(1)} m</td>
                  <td className="py-1.5 uppercase font-bold">{entry.severity}</td>
                  <td className="py-1.5">{entry.affectedZones.join(', ')}</td>
                  <td className="py-1.5">{entry.peakFilmUm.toFixed(1)}</td>
                  <td className="py-1.5 font-sans">{entry.actionTaken}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
