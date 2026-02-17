import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { useApp } from '../context/AppContext';
import {
  getVisualizationType,
  prepareLineBarData,
  prepareDonutData,
  prepareCtrInterestData,
  getInterestIcon,
  formatNumber,
  CHART_COLORS,
} from '../utils/chartHelpers';
import type { MetricType, PlatformFilter } from '../types/api';

export default function ChartArea() {
  const { state, dispatch } = useApp();

  if (!state.reportData) return null;

  const vizType = getVisualizationType(state.selectedDatapointType);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 className="text-lg font-semibold text-slate-900">
          {state.reportData.datapointType.name}
        </h2>

        <div className="flex items-center gap-4">
          {/* Metric toggles for non-CTR charts */}
          {state.selectedDatapointType !== 'CTR_USER_INTEREST' && (
            <div className="flex bg-slate-100 rounded-lg p-1">
              {(['impressions', 'clicks', 'conversions'] as MetricType[]).map(
                (m) => (
                  <button
                    key={m}
                    onClick={() => dispatch({ type: 'SET_METRIC', payload: m })}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md capitalize transition-colors ${
                      state.activeMetric === m
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {m}
                  </button>
                )
              )}
            </div>
          )}

          {/* Platform filter for line/bar charts */}
          {vizType === 'line-bar' && (
            <div className="flex bg-slate-100 rounded-lg p-1">
              {(
                ['all', 'Mobile', 'Desktop', 'Tablet'] as PlatformFilter[]
              ).map((pf) => (
                <button
                  key={pf}
                  onClick={() =>
                    dispatch({ type: 'SET_PLATFORM_FILTER', payload: pf })
                  }
                  className={`px-3 py-1.5 text-sm font-medium rounded-md capitalize transition-colors ${
                    state.platformFilter === pf
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {pf}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="h-[400px]">
        {vizType === 'line-bar' && <LineBarChart />}
        {vizType === 'donut' && <DonutChart />}
        {vizType === 'bar' && <InterestBarChart />}
      </div>
    </div>
  );
}

function LineBarChart() {
  const { state } = useApp();
  if (!state.reportData) return null;

  const data = prepareLineBarData(
    state.reportData.datapointLines,
    state.selectedDatapointType,
    state.platformFilter
  );

  const metricKey = state.activeMetric;
  const color =
    metricKey === 'impressions'
      ? '#3b82f6'
      : metricKey === 'clicks'
      ? '#10b981'
      : '#f59e0b';

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#94a3b8" />
        <YAxis
          tick={{ fontSize: 12 }}
          stroke="#94a3b8"
          tickFormatter={formatNumber}
        />
        <Tooltip
          formatter={(value: number) => [formatNumber(value), metricKey]}
          contentStyle={{
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey={metricKey}
          stroke={color}
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Bar dataKey={metricKey} fill={color} opacity={0.3} barSize={30} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function DonutChart() {
  const { state } = useApp();
  if (!state.reportData) return null;

  const data = prepareDonutData(
    state.reportData.datapointLines,
    state.activeMetric
  );

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={80}
          outerRadius={140}
          paddingAngle={3}
          dataKey="value"
          nameKey="name"
          label={({ name, percent }) =>
            `${name} (${(percent * 100).toFixed(1)}%)`
          }
        >
          {data.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={CHART_COLORS[index % CHART_COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => formatNumber(value)}
          contentStyle={{
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

function InterestBarChart() {
  const { state } = useApp();
  if (!state.reportData) return null;

  const data = prepareCtrInterestData(state.reportData.datapointLines);

  const chartData = data.map((d) => ({
    ...d,
    displayLabel: `${getInterestIcon(d.label)} ${d.label}`,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} layout="vertical" margin={{ left: 40 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis
          type="number"
          domain={[0, 100]}
          tick={{ fontSize: 12 }}
          stroke="#94a3b8"
        />
        <YAxis
          type="category"
          dataKey="displayLabel"
          width={180}
          tick={{ fontSize: 12 }}
          stroke="#94a3b8"
        />
        <Tooltip
          formatter={(value: number) => [`${value.toFixed(1)}`, 'Score']}
          contentStyle={{
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
          }}
        />
        <Bar dataKey="normalizedValue" fill="#3b82f6" radius={[0, 4, 4, 0]}>
          {chartData.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={CHART_COLORS[index % CHART_COLORS.length]}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
