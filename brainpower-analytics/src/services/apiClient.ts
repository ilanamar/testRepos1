import type {
  RegionsResponse,
  VerticalsResponse,
  TimePeriodsResponse,
  DatapointResponse,
  SearchCriteriaRequest,
  ApiTraceEntry,
} from '../types/api';

const BASE_URL = 'https://apim.workato.com/outbrain/brainpowerapi';

let traceListeners: ((entry: ApiTraceEntry) => void)[] = [];

export function onApiTrace(listener: (entry: ApiTraceEntry) => void) {
  traceListeners.push(listener);
  return () => {
    traceListeners = traceListeners.filter((l) => l !== listener);
  };
}

function getToken(): string {
  return localStorage.getItem('bp_api_token') || '';
}

export function setToken(token: string) {
  localStorage.setItem('bp_api_token', token);
}

export function getStoredToken(): string {
  return getToken();
}

async function tracedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const start = performance.now();
  const method = options.method || 'GET';
  let requestBody: unknown = undefined;

  if (options.body) {
    try {
      requestBody = JSON.parse(options.body as string);
    } catch {
      requestBody = options.body;
    }
  }

  let response: Response;
  let status = 0;

  try {
    response = await fetch(url, options);
    status = response.status;
  } catch (err) {
    const duration = Math.round(performance.now() - start);
    const entry: ApiTraceEntry = {
      id: crypto.randomUUID(),
      method,
      url,
      status: 0,
      duration,
      requestBody,
      responseBody: { error: String(err) },
      timestamp: new Date(),
    };
    traceListeners.forEach((l) => l(entry));
    throw err;
  }

  const duration = Math.round(performance.now() - start);
  const traceClone = response.clone();
  let responseBody: unknown;

  try {
    const text = await traceClone.text();
    try {
      responseBody = JSON.parse(text);
    } catch {
      responseBody = text;
    }
  } catch {
    responseBody = '(unable to read response)';
  }

  const entry: ApiTraceEntry = {
    id: crypto.randomUUID(),
    method,
    url,
    status,
    duration,
    requestBody,
    responseBody,
    timestamp: new Date(),
  };
  traceListeners.forEach((l) => l(entry));

  return response;
}

function headers(): HeadersInit {
  return {
    'API-TOKEN': getToken(),
    'Content-Type': 'application/json',
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized: Please check your API token.');
    }
    const text = await response.text();
    throw new Error(`API Error (${response.status}): ${text}`);
  }
  return response.json();
}

export async function fetchRegions(): Promise<RegionsResponse> {
  const res = await tracedFetch(`${BASE_URL}/datapoint/listallregions`, {
    headers: headers(),
  });
  return handleResponse<RegionsResponse>(res);
}

export async function fetchVerticals(): Promise<VerticalsResponse> {
  const res = await tracedFetch(`${BASE_URL}/datapoint/listallverticals`, {
    headers: headers(),
  });
  return handleResponse<VerticalsResponse>(res);
}

export async function fetchTimePeriods(): Promise<TimePeriodsResponse> {
  const res = await tracedFetch(
    `${BASE_URL}/period/listtimeperiods?state=QC_DONE`,
    { headers: headers() }
  );
  return handleResponse<TimePeriodsResponse>(res);
}

export async function fetchDatapoints(
  request: Omit<SearchCriteriaRequest, 'includeWoWValues' | 'qcStatus'>
): Promise<DatapointResponse> {
  const body: SearchCriteriaRequest = {
    ...request,
    includeWoWValues: 0,
    qcStatus: "('Passed')",
  };
  const res = await tracedFetch(
    `${BASE_URL}/datapoint/listdatapointbysearchcriteria`,
    {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(body),
    }
  );
  return handleResponse<DatapointResponse>(res);
}
