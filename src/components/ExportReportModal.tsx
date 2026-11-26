import { FileSpreadsheet, Printer, X } from 'lucide-react';
import { DefectLogEntry, SimulationParams, TelemetrySnapshot } from '../types/simulation';
import { exportCoilCsvReport } from '../utils/reportExporter';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  snapshot: TelemetrySnapshot;
  params: SimulationParams;
  logs: DefectLogEntry[];
}

export function ExportReportModal({
  isOpen,
  onClose,
  snapshot,
  params,
  logs,
}: ExportReportModalProps) {
  if (!isOpen) return null;

  const warningCount = logs.filter((l) => l.severity === 'warning').length;
  const criticalCount = logs.filter((l) => l.severity === 'critical').length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
      className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
    >
      <div className="w-full max-w-xl bg-[#0B0E17] border border-slate-700 rounded shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 id="export-modal-title" className="text-sm font-semibold text-slate-100">
              Export Coil Inspection Report
            </h2>
            <p className="text-xs font-mono text-slate-400 mt-0.5">
              {snapshot.coilId} · {snapshot.coilMeterMark.toFixed(1)} m inspected
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close export modal"
            className="p-1.5 text-slate-400 hover:text-slate-100 rounded hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-3 bg-[#07090E] border border-slate-800 rounded">
              <div className="text-slate-400">Logged Events</div>
              <div className="text-lg font-bold text-slate-100 mt-1">{logs.length}</div>
            </div>
            <div className="p-3 bg-[#07090E] border border-slate-800 rounded">
              <div className="text-slate-400">Warnings</div>
              <div className="text-lg font-bold text-amber-400 mt-1">{warningCount}</div>
            </div>
            <div className="p-3 bg-[#07090E] border border-slate-800 rounded">
              <div className="text-slate-400">Critical</div>
              <div className="text-lg font-bold text-rose-400 mt-1">{criticalCount}</div>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Export includes Level-2 MES coil meter-marks, affected transverse strip zones (Z1–Z7), SWIR optical absorption, capacitive dielectric shift, and automated PLC intervention status.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                exportCoilCsvReport(snapshot, params, logs);
                onClose();
              }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold bg-cyan-400 hover:bg-cyan-300 text-slate-950 rounded transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" aria-hidden="true" />
              Download CSV Report
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                setTimeout(() => window.print(), 120);
              }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 rounded transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" aria-hidden="true" />
              Print / Save PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
