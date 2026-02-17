import { BarChart3, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import StatsCards from './StatsCards';
import ChartArea from './ChartArea';
import InsightsPanel from './InsightsPanel';

export default function MainContent() {
  const { state } = useApp();

  return (
    <main className="flex-1 overflow-y-auto p-8 space-y-6">
      {/* Error message */}
      {state.reportError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm">{state.reportError}</p>
        </div>
      )}

      {/* Empty state */}
      {!state.reportData && !state.reportLoading && !state.reportError && (
        <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
          <BarChart3 className="w-16 h-16 mb-4" />
          <h2 className="text-xl font-semibold text-slate-500 mb-2">
            No Report Generated
          </h2>
          <p className="text-sm max-w-md text-center">
            Select your filters in the sidebar and click "Generate Report" to
            visualize your advertising performance data.
          </p>
        </div>
      )}

      {/* Loading skeleton */}
      {state.reportLoading && (
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-slate-200 p-6 h-24"
              >
                <div className="h-4 bg-slate-200 rounded w-1/2 mb-3" />
                <div className="h-8 bg-slate-200 rounded w-1/3" />
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6 h-[400px]">
            <div className="h-4 bg-slate-200 rounded w-1/4 mb-6" />
            <div className="h-full bg-slate-100 rounded" />
          </div>
        </div>
      )}

      {/* Report content */}
      {state.reportData && !state.reportLoading && (
        <>
          <StatsCards />
          <ChartArea />
          <InsightsPanel />
        </>
      )}
    </main>
  );
}
