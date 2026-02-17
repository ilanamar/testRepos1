import { Eye, MousePointerClick, TrendingUp } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { computeTotals, formatNumber } from '../utils/chartHelpers';

export default function StatsCards() {
  const { state } = useApp();

  if (!state.reportData) return null;

  const { totalImpressions, totalClicks, totalConversions, avgCtr } =
    computeTotals(state.reportData.datapointLines);

  const cards = [
    {
      title: 'Total Impressions',
      value: formatNumber(totalImpressions),
      icon: Eye,
      color: 'text-blue-500',
      bg: 'bg-blue-50',
    },
    {
      title: 'Total Clicks',
      value: formatNumber(totalClicks),
      icon: MousePointerClick,
      color: 'text-emerald-500',
      bg: 'bg-emerald-50',
    },
    {
      title:
        state.selectedDatapointType === 'CONV_BY_PLATFORM'
          ? 'Total Conversions'
          : 'Avg CTR',
      value:
        state.selectedDatapointType === 'CONV_BY_PLATFORM'
          ? formatNumber(totalConversions)
          : avgCtr.toFixed(2) + '%',
      icon: TrendingUp,
      color: 'text-amber-500',
      bg: 'bg-amber-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card) => (
        <div
          key={card.title}
          className="bg-white rounded-xl border border-slate-200 p-6 flex items-center gap-4"
        >
          <div className={`${card.bg} p-3 rounded-lg`}>
            <card.icon className={`w-6 h-6 ${card.color}`} />
          </div>
          <div>
            <p className="text-sm text-slate-500">{card.title}</p>
            <p className="text-2xl font-bold text-slate-900">{card.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
