import { useEffect } from 'react';
import {
  BarChart3,
  Settings,
  Code2,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DATAPOINT_TYPES, type DatapointTypeCode } from '../types/api';

export default function Sidebar() {
  const { state, dispatch, loadMetadata, generateReport } = useApp();

  useEffect(() => {
    if (state.hasToken) {
      loadMetadata();
    }
  }, [state.hasToken, loadMetadata]);

  return (
    <aside className="w-[300px] min-h-screen bg-slate-900 text-white flex flex-col shrink-0">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Brainpower</h1>
            <p className="text-xs text-slate-400">Analytics Dashboard</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex-1 p-6 space-y-5 overflow-y-auto">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Configuration
        </h2>

        {state.metadataLoading && (
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading filters...
          </div>
        )}

        {state.metadataError && (
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            {state.metadataError}
          </div>
        )}

        {/* Region */}
        <div>
          <label className="block text-sm text-slate-300 mb-1.5">Region</label>
          <select
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            value={state.selectedRegion}
            onChange={(e) =>
              dispatch({ type: 'SET_REGION', payload: e.target.value })
            }
          >
            {state.regions.map((r) => (
              <option key={r.code} value={r.code}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        {/* Vertical */}
        <div>
          <label className="block text-sm text-slate-300 mb-1.5">
            Vertical
          </label>
          <select
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            value={state.selectedVertical}
            onChange={(e) =>
              dispatch({ type: 'SET_VERTICAL', payload: e.target.value })
            }
          >
            {state.verticals.map((v) => (
              <option key={v.code} value={v.code}>
                {v.name}
              </option>
            ))}
          </select>
        </div>

        {/* Time Period */}
        <div>
          <label className="block text-sm text-slate-300 mb-1.5">
            Time Period
          </label>
          <select
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            value={state.selectedPeriod}
            onChange={(e) =>
              dispatch({ type: 'SET_PERIOD', payload: e.target.value })
            }
          >
            {state.timePeriods.map((p) => (
              <option key={p.id} value={p.startDate}>
                {p.logicalName} ({p.startDate} - {p.endDate})
              </option>
            ))}
          </select>
        </div>

        {/* Datapoint Type */}
        <div>
          <label className="block text-sm text-slate-300 mb-1.5">
            Datapoint Type
          </label>
          <select
            className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            value={state.selectedDatapointType}
            onChange={(e) =>
              dispatch({
                type: 'SET_DATAPOINT_TYPE',
                payload: e.target.value as DatapointTypeCode,
              })
            }
          >
            {DATAPOINT_TYPES.map((dt) => (
              <option key={dt.code} value={dt.code}>
                {dt.name}
              </option>
            ))}
          </select>
        </div>

        {/* Generate Button */}
        <button
          onClick={generateReport}
          disabled={state.reportLoading || !state.hasToken}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {state.reportLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            'Generate Report'
          )}
        </button>
      </div>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-slate-700 space-y-2">
        <button
          onClick={() => dispatch({ type: 'TOGGLE_TRACE' })}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <Code2 className="w-4 h-4" />
          API Trace
        </button>
        <button
          onClick={() => dispatch({ type: 'SET_SETTINGS_OPEN', payload: true })}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <Settings className="w-4 h-4" />
          Settings
        </button>
      </div>
    </aside>
  );
}
