export type MistLevel = 'low' | 'medium' | 'high';

export type CarryoverSeverity = 'optimal' | 'warning' | 'critical';

export type WorkspaceTab = 'twin' | 'concept3d' | 'proposal';

export interface SimulationParams {
  stripSpeedMpm: number; // 200 to 1200 m/min
  airKnifeEfficiency: number; // 40 to 100 %
  mistLevel: MistLevel;
  edgePoolingEnabled: boolean;
  closedLoopEnabled: boolean;
  flutterCompensationEnabled: boolean;
  purgeCurtainEnabled: boolean;
  isRunning: boolean;
}

export interface ZoneTelemetry {
  zoneIndex: number; // 0..6 (Z1..Z7)
  label: string; // Z1 .. Z7
  positionLabel: string; // Left Edge .. Right Edge
  filmThicknessUm: number; // residual coolant film in microns
  swirAbsorptionPct: number; // 1450nm / 1940nm combined water absorption %
  capacitanceShiftPf: number; // dielectric shift in pF (er ~80 vs ~1)
  valvePressureBar: number; // proportional piezo zone pressure (bar)
  valveBoostPct: number; // 0 to 100% active boost
  severity: CarryoverSeverity;
}

export interface TelemetrySnapshot {
  timestamp: number;
  coilId: string;
  coilMeterMark: number;
  speedMps: number;
  standoffMm: number;
  flutterAmplitudeMm: number;
  zones: ZoneTelemetry[];
  avgSwirAbsorptionPct: number;
  swir1450Pct: number;
  swir1940Pct: number;
  peakCapacitanceShiftPf: number;
  edgeAiLatencyMs: number;
  stripTravelPerLoopCm: number;
  rgbConfidencePct: number;
  dualSensorConfidencePct: number;
  peakFilmUm: number;
  peakZoneLabel: string;
  totalCarryoverVolumeMlPerSec: number;
  overallSeverity: CarryoverSeverity;
  compressedAirSavedPct: number;
}

export interface TelemetryHistoryPoint {
  sampleIndex: number;
  timeLabel: string;
  meterMarkM: number;
  stripSpeedMpm: number;
  totalCarryoverVolumeMlPerSec: number;
  dualSensorConfidencePct: number;
  rgbConfidencePct: number;
  severity: CarryoverSeverity;
}

export interface DefectLogEntry {
  id: string;
  timestampStr: string;
  coilId: string;
  meterMarkM: number;
  affectedZones: string[];
  peakFilmUm: number;
  swirAbsorptionPct: number;
  capacitanceShiftPf: number;
  severity: Exclude<CarryoverSeverity, 'optimal'>;
  actionTaken: string;
  mitigatedByClosedLoop: boolean;
}
