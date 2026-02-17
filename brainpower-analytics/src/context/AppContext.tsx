import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import type {
  Region,
  Vertical,
  TimePeriod,
  DatapointEntry,
  DatapointTypeCode,
  MetricType,
  PlatformFilter,
  ApiTraceEntry,
} from '../types/api';
import {
  fetchRegions,
  fetchVerticals,
  fetchTimePeriods,
  fetchDatapoints,
  onApiTrace,
} from '../services/apiClient';

interface AppState {
  // Metadata
  regions: Region[];
  verticals: Vertical[];
  timePeriods: TimePeriod[];
  metadataLoading: boolean;
  metadataError: string | null;

  // Selections
  selectedRegion: string;
  selectedVertical: string;
  selectedPeriod: string;
  selectedDatapointType: DatapointTypeCode;

  // Data
  reportData: DatapointEntry | null;
  reportLoading: boolean;
  reportError: string | null;

  // UI controls
  activeMetric: MetricType;
  platformFilter: PlatformFilter;

  // API Trace
  traceEntries: ApiTraceEntry[];
  traceOpen: boolean;

  // Settings
  settingsOpen: boolean;
  hasToken: boolean;
}

type Action =
  | { type: 'SET_METADATA_LOADING' }
  | { type: 'SET_METADATA_ERROR'; payload: string }
  | {
      type: 'SET_METADATA';
      payload: {
        regions: Region[];
        verticals: Vertical[];
        timePeriods: TimePeriod[];
      };
    }
  | { type: 'SET_REGION'; payload: string }
  | { type: 'SET_VERTICAL'; payload: string }
  | { type: 'SET_PERIOD'; payload: string }
  | { type: 'SET_DATAPOINT_TYPE'; payload: DatapointTypeCode }
  | { type: 'SET_REPORT_LOADING' }
  | { type: 'SET_REPORT_ERROR'; payload: string }
  | { type: 'SET_REPORT_DATA'; payload: DatapointEntry }
  | { type: 'SET_METRIC'; payload: MetricType }
  | { type: 'SET_PLATFORM_FILTER'; payload: PlatformFilter }
  | { type: 'ADD_TRACE'; payload: ApiTraceEntry }
  | { type: 'CLEAR_TRACES' }
  | { type: 'TOGGLE_TRACE' }
  | { type: 'SET_SETTINGS_OPEN'; payload: boolean }
  | { type: 'SET_HAS_TOKEN'; payload: boolean };

const initialState: AppState = {
  regions: [],
  verticals: [],
  timePeriods: [],
  metadataLoading: false,
  metadataError: null,
  selectedRegion: '',
  selectedVertical: '',
  selectedPeriod: '',
  selectedDatapointType: 'CONS_PLAT_DAY',
  reportData: null,
  reportLoading: false,
  reportError: null,
  activeMetric: 'clicks',
  platformFilter: 'all',
  traceEntries: [],
  traceOpen: false,
  settingsOpen: !localStorage.getItem('bp_api_token'),
  hasToken: !!localStorage.getItem('bp_api_token'),
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_METADATA_LOADING':
      return { ...state, metadataLoading: true, metadataError: null };
    case 'SET_METADATA_ERROR':
      return {
        ...state,
        metadataLoading: false,
        metadataError: action.payload,
      };
    case 'SET_METADATA':
      return {
        ...state,
        metadataLoading: false,
        regions: action.payload.regions,
        verticals: action.payload.verticals,
        timePeriods: action.payload.timePeriods,
        selectedRegion: action.payload.regions[0]?.code || '',
        selectedVertical: action.payload.verticals[0]?.code || '',
        selectedPeriod: action.payload.timePeriods[0]?.startDate || '',
      };
    case 'SET_REGION':
      return { ...state, selectedRegion: action.payload };
    case 'SET_VERTICAL':
      return { ...state, selectedVertical: action.payload };
    case 'SET_PERIOD':
      return { ...state, selectedPeriod: action.payload };
    case 'SET_DATAPOINT_TYPE':
      return { ...state, selectedDatapointType: action.payload };
    case 'SET_REPORT_LOADING':
      return { ...state, reportLoading: true, reportError: null };
    case 'SET_REPORT_ERROR':
      return { ...state, reportLoading: false, reportError: action.payload };
    case 'SET_REPORT_DATA':
      return {
        ...state,
        reportLoading: false,
        reportData: action.payload,
        reportError: null,
      };
    case 'SET_METRIC':
      return { ...state, activeMetric: action.payload };
    case 'SET_PLATFORM_FILTER':
      return { ...state, platformFilter: action.payload };
    case 'ADD_TRACE':
      return {
        ...state,
        traceEntries: [action.payload, ...state.traceEntries],
      };
    case 'CLEAR_TRACES':
      return { ...state, traceEntries: [] };
    case 'TOGGLE_TRACE':
      return { ...state, traceOpen: !state.traceOpen };
    case 'SET_SETTINGS_OPEN':
      return { ...state, settingsOpen: action.payload };
    case 'SET_HAS_TOKEN':
      return { ...state, hasToken: action.payload };
    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  loadMetadata: () => Promise<void>;
  generateReport: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Subscribe to API traces
  useEffect(() => {
    const unsub = onApiTrace((entry) => {
      dispatch({ type: 'ADD_TRACE', payload: entry });
    });
    return unsub;
  }, []);

  const loadMetadata = useCallback(async () => {
    dispatch({ type: 'SET_METADATA_LOADING' });
    try {
      const [regionsRes, verticalsRes, periodsRes] = await Promise.all([
        fetchRegions(),
        fetchVerticals(),
        fetchTimePeriods(),
      ]);
      dispatch({
        type: 'SET_METADATA',
        payload: {
          regions: regionsRes.regions.filter((r) => r.active),
          verticals: verticalsRes.categories.filter((v) => v.active),
          timePeriods: periodsRes.periods,
        },
      });
    } catch (err) {
      dispatch({
        type: 'SET_METADATA_ERROR',
        payload: err instanceof Error ? err.message : 'Failed to load metadata',
      });
    }
  }, []);

  const generateReport = useCallback(async () => {
    if (
      !state.selectedRegion ||
      !state.selectedVertical ||
      !state.selectedPeriod
    ) {
      dispatch({
        type: 'SET_REPORT_ERROR',
        payload: 'Please select Region, Vertical, and Time Period.',
      });
      return;
    }
    dispatch({ type: 'SET_REPORT_LOADING' });
    try {
      const res = await fetchDatapoints({
        datapointType: state.selectedDatapointType,
        verticalCode: state.selectedVertical,
        regionCode: state.selectedRegion,
        periodStart: state.selectedPeriod,
      });
      if (res.success && res.body.length > 0) {
        dispatch({ type: 'SET_REPORT_DATA', payload: res.body[0] });
      } else {
        dispatch({
          type: 'SET_REPORT_ERROR',
          payload: 'No data found for the selected criteria.',
        });
      }
    } catch (err) {
      dispatch({
        type: 'SET_REPORT_ERROR',
        payload:
          err instanceof Error ? err.message : 'Failed to generate report',
      });
    }
  }, [
    state.selectedRegion,
    state.selectedVertical,
    state.selectedPeriod,
    state.selectedDatapointType,
  ]);

  return (
    <AppContext.Provider
      value={{ state, dispatch, loadMetadata, generateReport }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
