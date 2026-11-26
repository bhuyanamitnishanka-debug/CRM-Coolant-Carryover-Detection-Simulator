import {
  CarryoverSeverity,
  MistLevel,
  SimulationParams,
  TelemetrySnapshot,
  ZoneTelemetry,
} from '../types/simulation';

const ZONE_META = [
  { label: 'Z1', positionLabel: 'Left Edge' },
  { label: 'Z2', positionLabel: 'Left-Mid' },
  { label: 'Z3', positionLabel: 'Inner-L' },
  { label: 'Z4', positionLabel: 'Center' },
  { label: 'Z5', positionLabel: 'Inner-R' },
  { label: 'Z6', positionLabel: 'Right-Mid' },
  { label: 'Z7', positionLabel: 'Right Edge' },
];

const MIST_FACTOR: Record<MistLevel, number> = {
  low: 0.15,
  medium: 0.55,
  high: 1.0,
};

export function classifyThickness(um: number): CarryoverSeverity {
  if (um >= 12.0) return 'critical';
  if (um >= 4.0) return 'warning';
  return 'optimal';
}

export function computeTelemetrySnapshot(
  params: SimulationParams,
  coilId: string,
  coilMeterMark: number,
  phaseTimeSec: number
): TelemetrySnapshot {
  const speedMps = params.stripSpeedMpm / 60;
  const speedRatio = (params.stripSpeedMpm - 200) / 1000; // 0.0 to 1.0
  const mistFactor = MIST_FACTOR[params.mistLevel];

  // Vertical passline flutter scales with speed (0.25mm to 1.15mm)
  const flutterAmplitudeMm = Number(
    (0.22 + speedRatio * 0.88 + Math.sin(phaseTimeSec * 7.2) * 0.07).toFixed(2)
  );
  const standoffMm = Number(
    (15.0 + Math.sin(phaseTimeSec * 9.5) * flutterAmplitudeMm * 0.45).toFixed(2)
  );

  // Air knife deficit: below 80% efficiency, emulsion begins bypassing rapidly
  const eff = params.airKnifeEfficiency;
  const deficit = Math.max(0, 100 - eff);
  const bypassBaseUm =
    eff >= 80
      ? Math.max(0.25, (100 - eff) * 0.11 * (0.6 + speedRatio * 0.7))
      : 2.2 + Math.pow(80 - eff, 1.32) * 0.34 * (0.75 + speedRatio * 0.65);

  const zones: ZoneTelemetry[] = ZONE_META.map((meta, idx) => {
    const isOuterEdge = idx === 0 || idx === 6;
    const isNearEdge = idx === 1 || idx === 5;
    const edgeWeight = isOuterEdge ? 1.25 : isNearEdge ? 1.08 : 0.92;

    // Micro-oscillation across width for realistic live sensor noise
    const wave =
      Math.sin(phaseTimeSec * 3.8 + idx * 1.15) * 0.35 +
      Math.cos(phaseTimeSec * 6.1 + idx * 0.7) * 0.18;

    let rawFilmUm = bypassBaseUm * edgeWeight + mistFactor * 0.85 + wave;

    // Edge coolant pooling fault injection
    if (params.edgePoolingEnabled) {
      if (isOuterEdge) {
        rawFilmUm += 13.5 + speedRatio * 5.2 + Math.sin(phaseTimeSec * 4.4 + idx) * 1.1;
      } else if (isNearEdge) {
        rawFilmUm += 5.1 + speedRatio * 2.1;
      }
    }

    // Closed-loop 7-zone proportional piezo pneumatic mitigation (<3ms loop)
    let valveBoostPct = 0;
    let valvePressureBar = 2.8 + (eff / 100) * 1.1;
    if (params.closedLoopEnabled) {
      if (rawFilmUm > 3.2) {
        // Piezo valves boost pressure proportionally based on available air-knife supply
        const supplyHeadroom = Math.max(0.28, eff / 100);
        const demand = Math.min(1.0, (rawFilmUm - 2.5) / 14.0);
        valveBoostPct = Math.round(demand * 100);
        valvePressureBar = Number((3.4 + demand * 3.4 * supplyHeadroom).toFixed(2));
        const suppressionFactor = 0.68 * supplyHeadroom;
        rawFilmUm = rawFilmUm * (1 - suppressionFactor * demand);
      } else {
        // Economize compressed air on dry zones
        valvePressureBar = Number((2.2 + (eff / 100) * 0.6).toFixed(2));
      }
    } else {
      valvePressureBar = Number((2.0 + (eff / 100) * 2.4).toFixed(2));
    }

    const filmThicknessUm = Number(Math.max(0.15, rawFilmUm).toFixed(2));

    // SWIR optical absorption (1450nm & 1940nm water bands)
    // If purge curtain is off in high mist, optical lens fouling attenuates SWIR slightly
    const foulingAttenuation = !params.purgeCurtainEnabled
      ? 0.62 - mistFactor * 0.22
      : 1.0 - mistFactor * 0.03;
    const swirIdealPct = Math.min(
      98.5,
      (1 - Math.exp(-filmThicknessUm / 11.5)) * 100
    );
    const swirAbsorptionPct = Number(
      Math.max(0.8, swirIdealPct * foulingAttenuation).toFixed(1)
    );

    // Capacitive fringe-field dielectric shift (pF)
    // Water/emulsion er ~ 80 vs air er ~ 1
    // If flutter compensation is off, uncompensated vertical flutter adds noise
    const uncompensatedFlutterNoise = !params.flutterCompensationEnabled
      ? Math.abs(Math.sin(phaseTimeSec * 9.5 + idx)) * flutterAmplitudeMm * 2.4
      : 0;
    const capacitanceShiftPf = Number(
      (
        0.12 +
        filmThicknessUm * 0.44 +
        (filmThicknessUm > 10 ? (filmThicknessUm - 10) * 0.12 : 0) +
        uncompensatedFlutterNoise
      ).toFixed(2)
    );

    return {
      zoneIndex: idx,
      label: meta.label,
      positionLabel: meta.positionLabel,
      filmThicknessUm,
      swirAbsorptionPct,
      capacitanceShiftPf,
      valvePressureBar,
      valveBoostPct,
      severity: classifyThickness(filmThicknessUm),
    };
  });

  const peakZone = zones.reduce((best, z) =>
    z.filmThicknessUm > best.filmThicknessUm ? z : best
  );
  const avgSwirAbsorptionPct = Number(
    (zones.reduce((sum, z) => sum + z.swirAbsorptionPct, 0) / zones.length).toFixed(1)
  );
  // 1940 nm band has ~1.18x stronger water absorption sensitivity than 1450 nm
  const swir1450Pct = Number((avgSwirAbsorptionPct * 0.91).toFixed(1));
  const swir1940Pct = Number(Math.min(99.2, avgSwirAbsorptionPct * 1.09).toFixed(1));

  const peakCapacitanceShiftPf = Number(
    Math.max(...zones.map((z) => z.capacitanceShiftPf)).toFixed(2)
  );

  // Edge-AI deterministic loop latency (<5 ms target)
  const edgeAiLatencyMs = Number(
    (3.15 + speedRatio * 0.65 + (params.closedLoopEnabled ? 0.42 : 0.0) + Math.sin(phaseTimeSec * 2.3) * 0.14).toFixed(2)
  );
  // Linear strip travel during one Edge-AI loop: v (m/s) * latency (s) * 100 (cm/m)
  const stripTravelPerLoopCm = Number(
    ((speedMps * edgeAiLatencyMs) / 10).toFixed(2)
  );

  // Conventional RGB camera degrades sharply under high speed + steam + glare
  const rgbConfidencePct = Number(
    Math.max(
      9.0,
      91 - speedRatio * 39 - mistFactor * 36 - (params.edgePoolingEnabled ? 6 : 0)
    ).toFixed(1)
  );

  // Dual-sensor SWIR + Capacitive fusion remains high even in dense steam
  const dualSensorConfidencePct = Number(
    Math.min(
      99.8,
      99.4 -
        (!params.purgeCurtainEnabled ? mistFactor * 4.5 : mistFactor * 0.6) -
        (!params.flutterCompensationEnabled ? flutterAmplitudeMm * 2.8 : 0.2)
    ).toFixed(1)
  );

  const dryZonesCount = zones.filter((z) => z.severity === 'optimal').length;
  const compressedAirSavedPct = params.closedLoopEnabled
    ? Math.round((dryZonesCount / zones.length) * 34)
    : 0;

  // Total volumetric carryover rate across a 1250 mm (1.25 m) wide cold-rolled strip:
  // Each of the 7 zones spans 1.25 / 7 m. Volume (mL/s) = sum(zoneWidthM * filmUm * 1e-6 * speedMps) * 1e6 = sum(zoneWidthM * filmUm * speedMps)
  const zoneWidthM = 1.25 / zones.length;
  const totalCarryoverVolumeMlPerSec = Number(
    zones
      .reduce((acc, z) => acc + zoneWidthM * z.filmThicknessUm * speedMps, 0)
      .toFixed(1)
  );

  return {
    timestamp: Date.now(),
    coilId,
    coilMeterMark: Number(coilMeterMark.toFixed(1)),
    speedMps: Number(speedMps.toFixed(2)),
    standoffMm,
    flutterAmplitudeMm,
    zones,
    avgSwirAbsorptionPct,
    swir1450Pct,
    swir1940Pct,
    peakCapacitanceShiftPf,
    edgeAiLatencyMs,
    stripTravelPerLoopCm,
    rgbConfidencePct,
    dualSensorConfidencePct,
    peakFilmUm: peakZone.filmThicknessUm,
    peakZoneLabel: `${peakZone.label} (${peakZone.positionLabel})`,
    totalCarryoverVolumeMlPerSec,
    overallSeverity: classifyThickness(peakZone.filmThicknessUm),
    compressedAirSavedPct,
  };
}
