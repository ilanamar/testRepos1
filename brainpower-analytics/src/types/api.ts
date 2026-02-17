// Region
export interface Region {
  id: number;
  code: string;
  name: string;
  active: boolean;
}

export interface RegionsResponse {
  success: boolean;
  regions: Region[];
}

// Vertical (Category)
export interface Vertical {
  id: number;
  code: string;
  name: string;
  active: boolean;
}

export interface VerticalsResponse {
  success: boolean;
  categories: Vertical[];
}

// Time Period
export interface TimePeriod {
  id: number;
  code: string;
  startDate: string;
  endDate: string;
  state: string;
  createdDate: string;
  modifiedDate: string;
  logicalName: string;
  compareDisabled: boolean;
}

export interface TimePeriodsResponse {
  success: boolean;
  periods: TimePeriod[];
}

// Datapoint
export interface DatapointKey {
  keyword: string;
  empty: boolean;
}

export interface DatapointValues {
  ctr: number;
  impression: number;
  clicks: number;
  empty: boolean;
}

export interface DatapointLine {
  dataPointLineId: number;
  key: DatapointKey;
  values: DatapointValues;
}

export interface DatapointType {
  code: string;
  name: string;
}

export interface DatapointEntry {
  datapointId: string;
  datapointType: DatapointType;
  vertical: { code: string; name: string };
  region: { code: string; name: string };
  periodType: string;
  periodStart: number;
  periodEnd: number;
  qcStatus: string;
  insightText: string;
  datapointLines: DatapointLine[];
}

export interface DatapointResponse {
  success: boolean;
  body: DatapointEntry[];
}

// Search criteria request
export interface SearchCriteriaRequest {
  datapointType: string;
  verticalCode: string;
  regionCode: string;
  periodStart: string;
  includeWoWValues: number;
  qcStatus: string;
}

// Datapoint type options
export type DatapointTypeCode =
  | 'CONS_PLAT_DAY'
  | 'CONS_PLAT_HOUR'
  | 'CONV_BY_PLATFORM'
  | 'IMPR_BY_PLATFORM'
  | 'CTR_USER_INTEREST';

export interface DatapointTypeOption {
  code: DatapointTypeCode;
  name: string;
}

export const DATAPOINT_TYPES: DatapointTypeOption[] = [
  { code: 'CONS_PLAT_DAY', name: 'Clicks by Platform & Day' },
  { code: 'CONS_PLAT_HOUR', name: 'Clicks by Platform & Hour' },
  { code: 'CONV_BY_PLATFORM', name: 'Conversions by Platform' },
  { code: 'IMPR_BY_PLATFORM', name: 'Impressions by Platform' },
  { code: 'CTR_USER_INTEREST', name: 'CTR by User Interest' },
];

// API Trace log entry
export interface ApiTraceEntry {
  id: string;
  method: string;
  url: string;
  status: number;
  duration: number;
  requestBody?: unknown;
  responseBody?: unknown;
  timestamp: Date;
}

// Metric toggle
export type MetricType = 'impressions' | 'clicks' | 'conversions';

// Platform filter
export type PlatformFilter = 'all' | 'Mobile' | 'Desktop' | 'Tablet';
