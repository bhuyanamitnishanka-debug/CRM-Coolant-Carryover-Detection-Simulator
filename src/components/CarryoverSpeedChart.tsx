import { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import { TelemetryHistoryPoint } from '../types/simulation';

interface CarryoverSpeedChartProps {
  history: TelemetryHistoryPoint[];
  currentSpeedMpm: number;
  currentCarryoverMlPerSec: number;
  dualSensorConfidencePct: number;
  rgbConfidencePct: number;
}

export function CarryoverSpeedChart({
  history,
  currentSpeedMpm,
  currentCarryoverMlPerSec,
  dualSensorConfidencePct,
  rgbConfidencePct,
}: CarryoverSpeedChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [width, setWidth] = useState(640);
  const [hoveredPoint, setHoveredPoint] = useState<{
    point: TelemetryHistoryPoint;
    xPx: number;
    yVolPx: number;
    ySpeedPx: number;
    yDualPx: number;
    yRgbPx: number;
  } | null>(null);

  const topTrackH = 132;
  const trackGap = 22;
  const bottomTrackH = 68;
  const margin = useMemo(
    () => ({ top: 14, right: 54, bottom: 24, left: 52 }),
    []
  );
  const totalHeight = margin.top + topTrackH + trackGap + bottomTrackH + margin.bottom;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0) {
        setWidth(Math.floor(rect.width));
      }
    };

    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const chartData = useMemo(() => {
    return history.length > 0 ? history : [];
  }, [history]);

  const innerW = Math.max(120, width - margin.left - margin.right);

  const scales = useMemo(() => {
    const firstIdx = chartData[0]?.sampleIndex ?? 0;
    const lastIdx =
      chartData[chartData.length - 1]?.sampleIndex ?? firstIdx + 1;
    const xDomain: [number, number] =
      lastIdx > firstIdx ? [firstIdx, lastIdx] : [firstIdx, firstIdx + 1];

    const maxVol = d3.max(chartData, (d) => d.totalCarryoverVolumeMlPerSec) ?? 50;
    const yVolMax = Math.max(60, Math.ceil((maxVol * 1.2) / 20) * 20);

    const xScale = d3.scaleLinear().domain(xDomain).range([0, innerW]);
    const yVolScale = d3.scaleLinear().domain([0, yVolMax]).range([topTrackH, 0]);
    const ySpeedScale = d3.scaleLinear().domain([200, 1200]).range([topTrackH, 0]);
    const yEffScale = d3.scaleLinear().domain([0, 100]).range([bottomTrackH, 0]);

    return { xScale, yVolScale, ySpeedScale, yEffScale };
  }, [chartData, innerW]);

  // Render D3 axes & gridlines
  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl) return;

    const svg = d3.select(svgEl);
    const { xScale, yVolScale, ySpeedScale, yEffScale } = scales;

    // Top track horizontal gridlines
    svg
      .select<SVGGElement>('.d3-top-grid')
      .call(
        d3
          .axisLeft(yVolScale)
          .ticks(4)
          .tickSize(-innerW)
          .tickFormat(() => '')
      )
      .call((g) => g.select('.domain').remove())
      .call((g) =>
        g
          .selectAll('.tick line')
          .attr('stroke', '#1E293B')
          .attr('stroke-dasharray', '2,3')
      );

    // Top Left Y-Axis: Total Carryover Volume (mL/s)
    svg
      .select<SVGGElement>('.d3-y-vol')
      .call(d3.axisLeft(yVolScale).ticks(4).tickSizeOuter(0))
      .call((g) => g.select('.domain').attr('stroke', '#334155'))
      .call((g) => g.selectAll('.tick line').attr('stroke', '#334155'))
      .call((g) =>
        g
          .selectAll('.tick text')
          .attr('fill', '#22D3EE')
          .attr('font-family', '"JetBrains Mono", monospace')
          .attr('font-size', '10px')
      );

    // Top Right Y-Axis: Strip Speed (m/min)
    svg
      .select<SVGGElement>('.d3-y-speed')
      .call(
        d3
          .axisRight(ySpeedScale)
          .tickValues([200, 450, 700, 950, 1200])
          .tickSizeOuter(0)
      )
      .call((g) => g.select('.domain').attr('stroke', '#334155'))
      .call((g) => g.selectAll('.tick line').attr('stroke', '#334155'))
      .call((g) =>
        g
          .selectAll('.tick text')
          .attr('fill', '#FBBF24')
          .attr('font-family', '"JetBrains Mono", monospace')
          .attr('font-size', '10px')
      );

    // Bottom track gridlines (Detection Efficacy %)
    svg
      .select<SVGGElement>('.d3-bot-grid')
      .call(
        d3
          .axisLeft(yEffScale)
          .tickValues([0, 50, 100])
          .tickSize(-innerW)
          .tickFormat(() => '')
      )
      .call((g) => g.select('.domain').remove())
      .call((g) =>
        g
          .selectAll('.tick line')
          .attr('stroke', '#1E293B')
          .attr('stroke-dasharray', '2,3')
      );

    // Bottom Left Y-Axis: Detection Efficacy (%)
    svg
      .select<SVGGElement>('.d3-y-eff')
      .call(
        d3
          .axisLeft(yEffScale)
          .tickValues([0, 50, 100])
          .tickFormat((d) => `${d}%`)
          .tickSizeOuter(0)
      )
      .call((g) => g.select('.domain').attr('stroke', '#334155'))
      .call((g) => g.selectAll('.tick line').attr('stroke', '#334155'))
      .call((g) =>
        g
          .selectAll('.tick text')
          .attr('fill', '#34D399')
          .attr('font-family', '"JetBrains Mono", monospace')
          .attr('font-size', '10px')
      );

    // Shared Bottom X-Axis: Coil Meter-Mark
    const idxToPoint = new Map(chartData.map((d) => [d.sampleIndex, d]));
    svg
      .select<SVGGElement>('.d3-x-bottom')
      .call(
        d3
          .axisBottom(xScale)
          .ticks(5)
          .tickSizeOuter(0)
          .tickFormat((val) => {
            const pt = idxToPoint.get(Math.round(Number(val)));
            return pt ? `${pt.meterMarkM.toFixed(0)}m` : '';
          })
      )
      .call((g) => g.select('.domain').attr('stroke', '#334155'))
      .call((g) => g.selectAll('.tick line').attr('stroke', '#334155'))
      .call((g) =>
        g
          .selectAll('.tick text')
          .attr('fill', '#94A3B8')
          .attr('font-family', '"JetBrains Mono", monospace')
          .attr('font-size', '10px')
      );
  }, [chartData, scales, innerW]);

  const paths = useMemo(() => {
    if (chartData.length < 2) {
      return {
        volLine: '',
        volArea: '',
        speedLine: '',
        dualEffLine: '',
        rgbEffLine: '',
      };
    }

    const { xScale, yVolScale, ySpeedScale, yEffScale } = scales;

    const volLineGen = d3
      .line<TelemetryHistoryPoint>()
      .x((d) => xScale(d.sampleIndex))
      .y((d) => yVolScale(d.totalCarryoverVolumeMlPerSec))
      .curve(d3.curveMonotoneX);

    const volAreaGen = d3
      .area<TelemetryHistoryPoint>()
      .x((d) => xScale(d.sampleIndex))
      .y0(topTrackH)
      .y1((d) => yVolScale(d.totalCarryoverVolumeMlPerSec))
      .curve(d3.curveMonotoneX);

    const speedLineGen = d3
      .line<TelemetryHistoryPoint>()
      .x((d) => xScale(d.sampleIndex))
      .y((d) => ySpeedScale(d.stripSpeedMpm))
      .curve(d3.curveMonotoneX);

    const dualEffLineGen = d3
      .line<TelemetryHistoryPoint>()
      .x((d) => xScale(d.sampleIndex))
      .y((d) => yEffScale(d.dualSensorConfidencePct))
      .curve(d3.curveMonotoneX);

    const rgbEffLineGen = d3
      .line<TelemetryHistoryPoint>()
      .x((d) => xScale(d.sampleIndex))
      .y((d) => yEffScale(d.rgbConfidencePct))
      .curve(d3.curveMonotoneX);

    return {
      volLine: volLineGen(chartData) ?? '',
      volArea: volAreaGen(chartData) ?? '',
      speedLine: speedLineGen(chartData) ?? '',
      dualEffLine: dualEffLineGen(chartData) ?? '',
      rgbEffLine: rgbEffLineGen(chartData) ?? '',
    };
  }, [chartData, scales]);

  const handlePointerMove = (e: React.MouseEvent<SVGRectElement>) => {
    if (chartData.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const xVal = scales.xScale.invert(mouseX);

    const bisect = d3.bisector<TelemetryHistoryPoint, number>(
      (d) => d.sampleIndex
    ).center;
    const idx = bisect(chartData, xVal);
    const point = chartData[Math.max(0, Math.min(chartData.length - 1, idx))];
    if (!point) return;

    setHoveredPoint({
      point,
      xPx: scales.xScale(point.sampleIndex),
      yVolPx: scales.yVolScale(point.totalCarryoverVolumeMlPerSec),
      ySpeedPx: scales.ySpeedScale(point.stripSpeedMpm),
      yDualPx: scales.yEffScale(point.dualSensorConfidencePct),
      yRgbPx: scales.yEffScale(point.rgbConfidencePct),
    });
  };

  const bottomTrackY = topTrackH + trackGap;

  return (
    <section className="bg-[#0B0E17] border border-slate-800 rounded p-4">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">
            Rolling Carryover Volume vs. Strip Speed &amp; Detection Efficacy
          </h2>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-0.5 font-mono">
            <span>
              Carryover:{' '}
              <strong className="text-cyan-300">
                {currentCarryoverMlPerSec.toFixed(1)} mL/s
              </strong>
            </span>
            <span className="text-slate-600" aria-hidden="true">·</span>
            <span>
              Strip Speed:{' '}
              <strong className="text-amber-300">
                {currentSpeedMpm} m/min
              </strong>
            </span>
            <span className="text-slate-600" aria-hidden="true">·</span>
            <span>
              SWIR+Cap Efficacy:{' '}
              <strong className="text-emerald-400">
                {dualSensorConfidencePct.toFixed(1)}%
              </strong>
              {' '}vs RGB{' '}
              <strong className="text-rose-400">
                {rgbConfidencePct.toFixed(0)}%
              </strong>
            </span>
          </div>
        </div>

        {/* Synchronized Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-cyan-400 inline-block" />
            Carryover (mL/s)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 border-t border-dashed border-amber-400 inline-block" />
            Speed (m/min)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-emerald-400 inline-block" />
            SWIR+Cap %
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 border-t border-dashed border-rose-400 inline-block" />
            RGB %
          </span>
        </div>
      </div>

      <div ref={containerRef} className="relative w-full" style={{ height: totalHeight }}>
        <svg
          ref={svgRef}
          width={width}
          height={totalHeight}
          className="block overflow-visible select-none"
        >
          <defs>
            <linearGradient id="carryoverVolGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.26} />
              <stop offset="100%" stopColor="#06B6D4" stopOpacity={0.01} />
            </linearGradient>
          </defs>

          <g transform={`translate(${margin.left}, ${margin.top})`}>
            {/* UPPER TRACK: Carryover Volume (mL/s) vs Strip Speed (m/min) */}
            <g className="d3-top-grid" />
            <g className="d3-y-vol" />
            <g className="d3-y-speed" transform={`translate(${innerW}, 0)`} />

            <text
              x={-margin.left + 4}
              y={-4}
              fill="#22D3EE"
              fontSize="9"
              fontFamily='"JetBrains Mono", monospace'
            >
              mL/s
            </text>
            <text
              x={innerW + 6}
              y={-4}
              fill="#FBBF24"
              fontSize="9"
              fontFamily='"JetBrains Mono", monospace'
            >
              m/min
            </text>

            {paths.volArea && (
              <path d={paths.volArea} fill="url(#carryoverVolGrad)" />
            )}
            {paths.volLine && (
              <path
                d={paths.volLine}
                fill="none"
                stroke="#22D3EE"
                strokeWidth={2}
              />
            )}
            {paths.speedLine && (
              <path
                d={paths.speedLine}
                fill="none"
                stroke="#F59E0B"
                strokeWidth={1.75}
                strokeDasharray="5 4"
              />
            )}

            {/* LOWER SYNCHRONIZED TRACK: Detection Efficacy (%) */}
            <g transform={`translate(0, ${bottomTrackY})`}>
              <g className="d3-bot-grid" />
              <g className="d3-y-eff" />
              <g className="d3-x-bottom" transform={`translate(0, ${bottomTrackH})`} />

              <text
                x={0}
                y={-6}
                fill="#94A3B8"
                fontSize="9"
                fontFamily='"JetBrains Mono", monospace'
              >
                DETECTION EFFICACY (%)
              </text>

              {paths.dualEffLine && (
                <path
                  d={paths.dualEffLine}
                  fill="none"
                  stroke="#10B981"
                  strokeWidth={1.75}
                />
              )}
              {paths.rgbEffLine && (
                <path
                  d={paths.rgbEffLine}
                  fill="none"
                  stroke="#F43F5E"
                  strokeWidth={1.5}
                  strokeDasharray="4 3"
                />
              )}
            </g>

            {/* Synchronized Crosshair & Data Point Markers across both tracks */}
            {hoveredPoint && (
              <g pointerEvents="none">
                <line
                  x1={hoveredPoint.xPx}
                  y1={0}
                  x2={hoveredPoint.xPx}
                  y2={bottomTrackY + bottomTrackH}
                  stroke="#64748B"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                />
                <circle
                  cx={hoveredPoint.xPx}
                  cy={hoveredPoint.yVolPx}
                  r={4}
                  fill="#22D3EE"
                  stroke="#07090E"
                  strokeWidth={1.5}
                />
                <circle
                  cx={hoveredPoint.xPx}
                  cy={hoveredPoint.ySpeedPx}
                  r={3.5}
                  fill="#F59E0B"
                  stroke="#07090E"
                  strokeWidth={1.5}
                />
                <circle
                  cx={hoveredPoint.xPx}
                  cy={bottomTrackY + hoveredPoint.yDualPx}
                  r={3.5}
                  fill="#10B981"
                  stroke="#07090E"
                  strokeWidth={1.5}
                />
                <circle
                  cx={hoveredPoint.xPx}
                  cy={bottomTrackY + hoveredPoint.yRgbPx}
                  r={3.5}
                  fill="#F43F5E"
                  stroke="#07090E"
                  strokeWidth={1.5}
                />
              </g>
            )}

            {/* Pointer capture overlay across full chart area */}
            <rect
              width={innerW}
              height={bottomTrackY + bottomTrackH}
              fill="transparent"
              className="cursor-crosshair"
              onMouseMove={handlePointerMove}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          </g>
        </svg>

        {/* Crosshair Monospace HUD Tooltip */}
        {hoveredPoint && (
          <div className="pointer-events-none absolute top-2 right-14 px-2.5 py-1.5 bg-[#07090E]/95 border border-slate-700 rounded text-[11px] font-mono text-slate-200 space-y-0.5">
            <div className="text-slate-400">
              Coil {hoveredPoint.point.meterMarkM.toFixed(1)} m · {hoveredPoint.point.timeLabel}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-cyan-300">
                Vol: {hoveredPoint.point.totalCarryoverVolumeMlPerSec.toFixed(1)} mL/s
              </span>
              <span className="text-amber-300">
                Speed: {hoveredPoint.point.stripSpeedMpm} m/min
              </span>
            </div>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="text-emerald-400">
                SWIR+Cap: {hoveredPoint.point.dualSensorConfidencePct.toFixed(1)}%
              </span>
              <span className="text-rose-400">
                RGB: {hoveredPoint.point.rgbConfidencePct.toFixed(0)}%
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
