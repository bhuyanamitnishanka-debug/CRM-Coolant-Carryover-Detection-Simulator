import { useState } from 'react';
import { CONCEPT_3D_HOTSPOTS, ENGINEERING_CHECKPOINTS } from '../data/proposalContent';

export function Concept3DView() {
  const [selectedId, setSelectedId] = useState<string>(CONCEPT_3D_HOTSPOTS[0].id);
  const [imgFailed, setImgFailed] = useState(false);

  const selectedHotspot =
    CONCEPT_3D_HOTSPOTS.find((h) => h.id === selectedId) ?? CONCEPT_3D_HOTSPOTS[0];

  return (
    <div className="flex-1 overflow-y-auto bg-[#07090E] p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-xl font-semibold text-slate-100 text-balance">
              Aero-Optic Closed-Loop Coolant Control Hardware Bridge
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Click any numbered subsystem marker on the 3D engineering rendering to inspect module tolerances and retrofit architecture.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Bolt-On Modular Frame · Scheduled Roll-Change Retrofit
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Interactive 3D Concept Image */}
          <div className="lg:col-span-8 bg-[#0B0E17] border border-slate-800 rounded overflow-hidden relative">
            {!imgFailed ? (
              <div className="relative aspect-video w-full">
                <img
                  src={`${import.meta.env.BASE_URL}assets/aistudio/image_45df4afa.png`}
                  alt="3D conceptual engineering rendering of the Aero-Optic Closed-Loop Coolant Control bridge over a Cold Rolling Mill passline"
                  referrerPolicy="no-referrer"
                  onError={() => setImgFailed(true)}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#07090E]/70 via-transparent to-transparent pointer-events-none" />

                {CONCEPT_3D_HOTSPOTS.map((spot) => {
                  const isSelected = spot.id === selectedHotspot.id;
                  return (
                    <button
                      key={spot.id}
                      type="button"
                      onClick={() => setSelectedId(spot.id)}
                      style={{ left: `${spot.xPct}%`, top: `${spot.yPct}%` }}
                      aria-label={`Inspect ${spot.title}`}
                      className={`-translate-x-1/2 -translate-y-1/2 absolute w-8 h-8 rounded-full font-mono text-xs font-bold flex items-center justify-center transition-transform cursor-pointer border ${
                        isSelected
                          ? 'bg-cyan-400 text-slate-950 border-white scale-110'
                          : 'bg-[#07090E]/90 text-cyan-300 border-cyan-400/70 hover:scale-105'
                      }`}
                    >
                      {spot.number}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="aspect-video w-full flex flex-col items-center justify-center p-8 text-center bg-slate-900">
                <p className="text-sm font-semibold text-slate-200">
                  Aero-Optic Closed-Loop Coolant Control Render
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Select a hardware module on the right to inspect specifications.
                </p>
              </div>
            )}
          </div>

          {/* Selected Module Details */}
          <div className="lg:col-span-4 bg-[#0B0E17] border border-slate-800 rounded p-5 space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
              <span>MODULE {selectedHotspot.number}</span>
              <span className="text-slate-600" aria-hidden="true">/</span>
              <span className="text-slate-400">{selectedHotspot.subtitle}</span>
            </div>

            <h2 className="text-lg font-semibold text-slate-100">
              {selectedHotspot.title}
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed">
              {selectedHotspot.description}
            </p>

            <div className="pt-3 border-t border-slate-800 space-y-2">
              <h3 className="text-xs font-semibold text-slate-400">
                Key Specifications
              </h3>
              <ul className="space-y-1.5 text-xs font-mono text-slate-200">
                {selectedHotspot.specs.map((spec) => (
                  <li key={spec} className="flex items-start gap-2">
                    <span className="text-cyan-400">›</span>
                    <span>{spec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-3 border-t border-slate-800 grid grid-cols-2 gap-1.5">
              {CONCEPT_3D_HOTSPOTS.map((spot) => (
                <button
                  key={spot.id}
                  type="button"
                  onClick={() => setSelectedId(spot.id)}
                  className={`px-2.5 py-1.5 text-left text-xs rounded border transition-colors cursor-pointer truncate ${
                    spot.id === selectedHotspot.id
                      ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-200'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="font-mono mr-1.5">{spot.number}.</span>
                  {spot.title.split(' ')[0]} {spot.title.split(' ')[1]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Critical Engineering Checkpoints */}
        <section className="space-y-3 pt-2">
          <h2 className="text-sm font-semibold text-slate-200">
            Critical Mill-Floor Engineering Checkpoints &amp; Mitigations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ENGINEERING_CHECKPOINTS.map((cp) => (
              <div
                key={cp.title}
                className="bg-[#0B0E17] border border-slate-800 rounded p-4 space-y-2"
              >
                <h3 className="text-sm font-semibold text-slate-100">
                  {cp.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  <strong className="text-slate-300 font-medium">Challenge: </strong>
                  {cp.challenge}
                </p>
                <p className="text-xs text-cyan-200/90 leading-relaxed">
                  <strong className="text-cyan-400 font-medium">Mitigation: </strong>
                  {cp.mitigation}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
