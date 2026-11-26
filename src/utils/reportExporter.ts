import { DefectLogEntry, SimulationParams, TelemetrySnapshot } from '../types/simulation';

function escapeCsvCell(value: string | number | boolean): string {
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportCoilCsvReport(
  snapshot: TelemetrySnapshot,
  params: SimulationParams,
  logs: DefectLogEntry[]
): void {
  const headerLines = [
    ['CRM Coolant Carryover Detection Report (SWIR + Capacitive Edge-AI)'],
    ['Coil ID', snapshot.coilId],
    ['Inspected Length (m)', snapshot.coilMeterMark.toFixed(1)],
    ['Current Line Speed (m/min)', params.stripSpeedMpm],
    ['Current Line Speed (m/s)', snapshot.speedMps.toFixed(2)],
    ['Air-Knife Efficiency (%)', params.airKnifeEfficiency],
    ['Closed-Loop Mitigation', params.closedLoopEnabled ? 'ACTIVE (<3ms Piezo)' : 'PASSIVE'],
    ['Edge-AI Loop Latency (ms)', snapshot.edgeAiLatencyMs.toFixed(2)],
    ['Generated At', new Date().toISOString()],
    [],
    [
      'Timestamp',
      'Coil ID',
      'Meter-Mark (m)',
      'Severity',
      'Affected Zones',
      'Peak Film (um)',
      'SWIR Absorption (%)',
      'Capacitive Shift (pF)',
      'Closed-Loop Active',
      'Recommended Operator / PLC Action',
    ],
  ];

  const rows = logs.map((entry) => [
    entry.timestampStr,
    entry.coilId,
    entry.meterMarkM.toFixed(1),
    entry.severity.toUpperCase(),
    entry.affectedZones.join(' / '),
    entry.peakFilmUm.toFixed(2),
    entry.swirAbsorptionPct.toFixed(1),
    entry.capacitanceShiftPf.toFixed(2),
    entry.mitigatedByClosedLoop ? 'YES' : 'NO',
    entry.actionTaken,
  ]);

  const csvContent = [...headerLines, ...rows]
    .map((row) => row.map(escapeCsvCell).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${snapshot.coilId}_carryover_inspection_report.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
