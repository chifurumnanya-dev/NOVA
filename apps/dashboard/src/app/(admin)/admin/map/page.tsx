'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Layers } from 'lucide-react';

const NigeriaMap = dynamic(() => import('@/components/NigeriaMap'), { ssr: false });

type MapLayer = 'facilities' | 'schedules' | 'stale';

const LAYER_CONFIG: Record<MapLayer, { label: string; description: string }> = {
  facilities: { label: 'Facilities', description: 'All registered health facilities' },
  schedules: { label: 'Clinic Schedules', description: 'States with clinic schedule data' },
  stale: { label: 'Stale Records', description: 'Records unverified for 12+ months' },
};

const TOP_STATES = [
  { state: 'Lagos', facilities: 1420, schedules: 890, stale: 48 },
  { state: 'Kano', facilities: 980, schedules: 540, stale: 62 },
  { state: 'Rivers', facilities: 850, schedules: 430, stale: 34 },
  { state: 'Oyo', facilities: 730, schedules: 380, stale: 41 },
  { state: 'FCT', facilities: 620, schedules: 310, stale: 12 },
];

export default function MapPage() {
  const [layer, setLayer] = useState<MapLayer>('facilities');
  const [clickedState, setClickedState] = useState<{ name: string; count: number } | null>(null);

  const counts = TOP_STATES.map((s) => ({
    state: s.state,
    count: layer === 'facilities' ? s.facilities : layer === 'schedules' ? s.schedules : s.stale,
  }));

  const maxCount = Math.max(...counts.map((c) => c.count));

  return (
    <div className="space-y-4 animate-fade-in h-full">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">Map Explorer</h1>
          <p className="text-sm text-slate-500 mt-1">State-level healthcare data coverage across Nigeria</p>
        </div>
        {/* Layer selector */}
        <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
          <Layers size={14} className="text-slate-400 ml-2" />
          {(Object.keys(LAYER_CONFIG) as MapLayer[]).map((l) => (
            <button
              key={l}
              onClick={() => setLayer(l)}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
                layer === l ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {LAYER_CONFIG[l].label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4" style={{ height: 'calc(100vh - 210px)', minHeight: 500 }}>
        {/* Map */}
        <div className="xl:col-span-3 card overflow-hidden h-full">
          <NigeriaMap onStateClick={(name, count) => setClickedState({ name, count })} />
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4 h-full overflow-auto">
          {/* Active layer info */}
          <div className="card p-4">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Active Layer</p>
            <p className="text-sm font-semibold text-slate-800">{LAYER_CONFIG[layer].label}</p>
            <p className="text-xs text-slate-500 mt-0.5">{LAYER_CONFIG[layer].description}</p>
          </div>

          {/* Clicked state info */}
          {clickedState && (
            <div className="card p-4 border-green-200 bg-green-50/50">
              <p className="text-[10px] font-semibold text-green-600 uppercase tracking-wider mb-1">Selected State</p>
              <p className="text-sm font-semibold text-slate-800">{clickedState.name}</p>
              <p className="text-xs text-slate-500">{clickedState.count.toLocaleString()} {LAYER_CONFIG[layer].label.toLowerCase()}</p>
              <a
                href={`/admin/facilities?state=${clickedState.name}`}
                className="btn-primary text-xs py-1.5 mt-3 w-full justify-center"
              >
                Browse {clickedState.name} →
              </a>
            </div>
          )}

          {/* Legend */}
          <div className="card p-4">
            <h2 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">Legend</h2>
            {[
              { label: '1,000+', bg: 'bg-green-900' },
              { label: '700–999', bg: 'bg-green-700' },
              { label: '500–699', bg: 'bg-green-600' },
              { label: '300–499', bg: 'bg-green-500' },
              { label: '200–299', bg: 'bg-green-400' },
              { label: '100–199', bg: 'bg-green-300' },
              { label: '0–99', bg: 'bg-green-100' },
            ].map(({ label, bg }) => (
              <div key={label} className="flex items-center gap-2 mb-2">
                <div className={`w-4 h-4 rounded ${bg} border border-white/20 flex-shrink-0`} />
                <span className="text-xs text-slate-600">{label}</span>
              </div>
            ))}
          </div>

          {/* State rankings */}
          <div className="card p-4 flex-1">
            <h2 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">
              Top States — {LAYER_CONFIG[layer].label}
            </h2>
            {counts.map(({ state, count }) => (
              <div key={state} className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-700 w-16 truncate">{state}</span>
                <div className="flex items-center gap-2 flex-1 ml-2">
                  <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        layer === 'stale' ? 'bg-red-400' : 'bg-green-500'
                      }`}
                      style={{ width: `${(count / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-600 w-10 text-right tabular-nums">
                    {count.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
