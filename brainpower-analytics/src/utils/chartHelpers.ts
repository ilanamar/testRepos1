import type {
  DatapointLine,
  DatapointTypeCode,
  MetricType,
  PlatformFilter,
} from '../types/api';

const DAY_ORDER = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export function getVisualizationType(
  code: DatapointTypeCode
): 'line-bar' | 'donut' | 'bar' {
  switch (code) {
    case 'CONS_PLAT_DAY':
    case 'CONS_PLAT_HOUR':
      return 'line-bar';
    case 'CONV_BY_PLATFORM':
    case 'IMPR_BY_PLATFORM':
      return 'donut';
    case 'CTR_USER_INTEREST':
      return 'bar';
  }
}

export function getMetricValue(
  values: DatapointLine['values'],
  metric: MetricType
): number {
  switch (metric) {
    case 'impressions':
      return values.impression;
    case 'clicks':
      return values.clicks;
    case 'conversions':
      return values.ctr; // ctr used as conversion proxy
  }
}

// Parse keyword like "Mobile|Sunday" or "Desktop|14"
function parseKeyword(keyword: string): { platform: string; label: string } {
  const parts = keyword.split('|');
  if (parts.length === 2) {
    return { platform: parts[0].trim(), label: parts[1].trim() };
  }
  return { platform: keyword.trim(), label: keyword.trim() };
}

export function filterByPlatform(
  lines: DatapointLine[],
  filter: PlatformFilter
): DatapointLine[] {
  if (filter === 'all') return lines;
  return lines.filter((l) => {
    const { platform } = parseKeyword(l.key.keyword);
    return platform.toLowerCase() === filter.toLowerCase();
  });
}

export interface ChartDataPoint {
  label: string;
  impressions: number;
  clicks: number;
  conversions: number;
  platform?: string;
}

export function prepareLineBarData(
  lines: DatapointLine[],
  code: DatapointTypeCode,
  platformFilter: PlatformFilter
): ChartDataPoint[] {
  const filtered = filterByPlatform(lines, platformFilter);
  const grouped = new Map<string, ChartDataPoint>();

  for (const line of filtered) {
    const { label } = parseKeyword(line.key.keyword);
    const existing = grouped.get(label);
    if (existing) {
      existing.impressions += line.values.impression;
      existing.clicks += line.values.clicks;
      existing.conversions += line.values.ctr;
    } else {
      grouped.set(label, {
        label,
        impressions: line.values.impression,
        clicks: line.values.clicks,
        conversions: line.values.ctr,
      });
    }
  }

  const data = Array.from(grouped.values());

  if (code === 'CONS_PLAT_DAY') {
    data.sort(
      (a, b) => DAY_ORDER.indexOf(a.label) - DAY_ORDER.indexOf(b.label)
    );
  } else if (code === 'CONS_PLAT_HOUR') {
    data.sort((a, b) => parseInt(a.label) - parseInt(b.label));
  }

  return data;
}

export interface DonutDataPoint {
  name: string;
  value: number;
}

export function prepareDonutData(
  lines: DatapointLine[],
  metric: MetricType
): DonutDataPoint[] {
  const data: DonutDataPoint[] = lines.map((l) => ({
    name: l.key.keyword,
    value: getMetricValue(l.values, metric),
  }));
  data.sort((a, b) => b.value - a.value);
  return data;
}

export interface InterestDataPoint {
  label: string;
  value: number;
  normalizedValue: number;
}

export function prepareCtrInterestData(
  lines: DatapointLine[]
): InterestDataPoint[] {
  const data = lines.map((l) => ({
    label: l.key.keyword,
    value: l.values.ctr,
    normalizedValue: 0,
  }));

  const max = Math.max(...data.map((d) => d.value), 1);
  for (const d of data) {
    d.normalizedValue = (d.value / max) * 100;
  }

  data.sort((a, b) => b.normalizedValue - a.normalizedValue);
  return data;
}

export function computeTotals(lines: DatapointLine[]) {
  let totalImpressions = 0;
  let totalClicks = 0;
  let totalConversions = 0;

  for (const line of lines) {
    totalImpressions += line.values.impression;
    totalClicks += line.values.clicks;
    totalConversions += line.values.ctr;
  }

  const avgCtr =
    totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

  return { totalImpressions, totalClicks, totalConversions, avgCtr };
}

const INTEREST_ICONS: Record<string, string> = {
  automotive: '🚗',
  car: '🚗',
  finance: '💰',
  financial: '💰',
  health: '❤️',
  lifestyle: '❤️',
  technology: '💻',
  tech: '💻',
  sports: '⚽',
  sport: '⚽',
  travel: '✈️',
  food: '🍕',
  entertainment: '🎬',
  education: '📚',
  fashion: '👗',
  beauty: '💄',
  gaming: '🎮',
  music: '🎵',
  news: '📰',
  science: '🔬',
  business: '📊',
  real_estate: '🏠',
  pets: '🐾',
  parenting: '👶',
};

export function getInterestIcon(label: string): string {
  const lower = label.toLowerCase().replace(/[\s-_]/g, '_');
  for (const [key, icon] of Object.entries(INTEREST_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return '📌';
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toFixed(n % 1 === 0 ? 0 : 2);
}

export const CHART_COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#84cc16',
];
