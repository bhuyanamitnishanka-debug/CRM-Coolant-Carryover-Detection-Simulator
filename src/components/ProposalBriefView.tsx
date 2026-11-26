import { useState } from 'react';
import { ARCHITECTURE_MODULES, PROPOSAL_ESSAYS } from '../data/proposalContent';

type EssayLang = keyof typeof PROPOSAL_ESSAYS;

export function ProposalBriefView() {
  const [lang, setLang] = useState<EssayLang>('en');
  const essay = PROPOSAL_ESSAYS[lang];

  return (
    <div className="flex-1 overflow-y-auto bg-[#07090E] p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Executive Proposal Header */}
        <section className="border-b border-slate-800 pb-6 space-y-3">
          <div className="text-xs font-mono text-cyan-400">
            TATA INNOVERSITY / TECHNICAL PROPOSAL BRIEF
          </div>
          <h1 className="text-2xl font-semibold text-slate-100 text-balance">
            Non-Contact Dual-Sensor (SWIR Optical + Capacitive Fringe-Field) &amp; Edge-AI Real-Time Coolant Carryover Detection System
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed max-w-4xl">
            In high-speed Cold Rolling Mills (CRM) operating at strip speeds up to 1200 m/min (20 m/s), residual rolling emulsion bypassing exit air knives causes downstream surface contamination, coating defects, rework, and scrap. By fusing Short-Wave Infrared (1450 nm / 1940 nm) spectroscopy with a non-contact capacitive dielectric array 15 mm above the passline, the system detects micro-droplets and thin films in under 5 ms without contacting the steel or disturbing strip flatness.
          </p>
        </section>

        {/* 4-Module Architecture Grid */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-200">
            System Architecture &amp; Working Mechanism
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ARCHITECTURE_MODULES.map((mod) => (
              <div
                key={mod.index}
                className="bg-[#0B0E17] border border-slate-800 rounded p-4 space-y-2"
              >
                <div className="text-xs font-mono text-cyan-400">
                  {mod.index}. {mod.title}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {mod.detail}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Multilingual Engineering Essay (English / Hindi / Odia) */}
        <section className="bg-[#0B0E17] border border-slate-800 rounded p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-100">
                Engineering Summary Essay
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Available in English, Hindi, and Odia for plant operator &amp; stakeholder briefing
              </p>
            </div>

            <div className="flex items-center gap-1 p-1 bg-[#07090E] border border-slate-800 rounded">
              {(Object.keys(PROPOSAL_ESSAYS) as EssayLang[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setLang(key)}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
                    lang === key
                      ? 'bg-cyan-400 text-slate-950 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {PROPOSAL_ESSAYS[key].label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <h3 className="text-base font-semibold text-cyan-300">
              {essay.heading}
            </h3>
            <p className="text-sm text-slate-200 leading-7">
              {essay.body}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
