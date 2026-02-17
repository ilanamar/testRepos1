import { ChevronRight, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DATAPOINT_TYPES } from '../types/api';

export default function Header() {
  const { state } = useApp();

  const dpName =
    DATAPOINT_TYPES.find((d) => d.code === state.selectedDatapointType)?.name ||
    state.selectedDatapointType;

  const regionName =
    state.regions.find((r) => r.code === state.selectedRegion)?.name ||
    state.selectedRegion;

  const verticalName =
    state.verticals.find((v) => v.code === state.selectedVertical)?.name ||
    state.selectedVertical;

  return (
    <header className="bg-white border-b border-slate-200 px-8 py-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Performance Report
          </h1>
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-1">
            <span>Dashboard</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span>{regionName || 'Region'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span>{verticalName || 'Vertical'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-700 font-medium">{dpName}</span>
          </div>
        </div>

        {/* QC Status badge */}
        {state.reportData && (
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-sm font-medium">
            <CheckCircle className="w-4 h-4" />
            QC: {state.reportData.qcStatus}
          </div>
        )}
      </div>
    </header>
  );
}
