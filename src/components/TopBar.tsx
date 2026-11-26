import { Download } from 'lucide-react';
import { WorkspaceTab } from '../types/simulation';

interface TopBarProps {
  activeTab: WorkspaceTab;
  onSelectTab: (tab: WorkspaceTab) => void;
  onOpenExport: () => void;
}

const TABS: { id: WorkspaceTab; label: string }[] = [
  { id: 'twin', label: 'Digital Twin' },
  { id: 'concept3d', label: '3D Concept' },
  { id: 'proposal', label: 'Proposal Brief' },
];

export function TopBar({ activeTab, onSelectTab, onOpenExport }: TopBarProps) {
  return (
    <header className="no-print h-14 px-6 bg-[#0B0E17] border-b border-slate-800 flex items-center justify-between gap-8 shrink-0">
      <button
        type="button"
        onClick={() => onSelectTab('twin')}
        className="text-base font-semibold tracking-tight text-slate-100 hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded"
      >
        CRM Coolant Carryover Simulator
      </button>

      <nav aria-label="Primary sections" className="flex items-center gap-6">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`relative py-4 text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded ${
                isActive
                  ? 'text-cyan-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
              {isActive && (
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-cyan-400" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="shrink-0">
        <button
          type="button"
          onClick={onOpenExport}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0E17]"
        >
          <Download className="w-3.5 h-3.5" aria-hidden="true" />
          Export Coil Report
        </button>
      </div>
    </header>
  );
}
