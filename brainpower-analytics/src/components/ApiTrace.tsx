import { useState } from 'react';
import { X, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ApiTrace() {
  const { state, dispatch } = useApp();

  if (!state.traceOpen) return null;

  return (
    <div className="fixed top-0 right-0 w-[500px] h-full bg-slate-900 text-slate-100 shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
        <h3 className="font-semibold text-sm">API Trace</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => dispatch({ type: 'CLEAR_TRACES' })}
            className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors"
            title="Clear logs"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => dispatch({ type: 'TOGGLE_TRACE' })}
            className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Entries */}
      <div className="flex-1 overflow-y-auto">
        {state.traceEntries.length === 0 && (
          <p className="text-slate-500 text-sm p-4 italic">
            No API calls logged yet.
          </p>
        )}
        {state.traceEntries.map((entry) => (
          <TraceEntry key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  );
}

function TraceEntry({
  entry,
}: {
  entry: {
    id: string;
    method: string;
    url: string;
    status: number;
    duration: number;
    requestBody?: unknown;
    responseBody?: unknown;
    timestamp: Date;
  };
}) {
  const [expanded, setExpanded] = useState(false);

  const statusColor =
    entry.status >= 200 && entry.status < 300
      ? 'text-emerald-400'
      : entry.status >= 400
      ? 'text-red-400'
      : 'text-amber-400';

  const methodColor =
    entry.method === 'POST' ? 'bg-amber-600' : 'bg-blue-600';

  // Show just the path
  const path = entry.url.replace(
    'https://apim.workato.com/outbrain/brainpowerapi',
    ''
  );

  return (
    <div className="border-b border-slate-800">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800/50 transition-colors text-left"
      >
        {expanded ? (
          <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        )}
        <span
          className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${methodColor} text-white`}
        >
          {entry.method}
        </span>
        <span className="text-sm font-mono text-slate-300 truncate flex-1">
          {path}
        </span>
        <span className={`text-xs font-mono font-bold ${statusColor}`}>
          {entry.status}
        </span>
        <span className="text-xs text-slate-500 font-mono">
          {entry.duration}ms
        </span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          <div className="text-xs text-slate-400">
            {new Date(entry.timestamp).toLocaleTimeString()}
          </div>

          {entry.requestBody && (
            <div>
              <p className="text-xs font-semibold text-slate-400 mb-1">
                Request Body
              </p>
              <pre className="bg-slate-950 rounded p-3 text-xs text-slate-300 overflow-x-auto max-h-[200px] overflow-y-auto">
                {JSON.stringify(entry.requestBody, null, 2)}
              </pre>
            </div>
          )}

          <div>
            <p className="text-xs font-semibold text-slate-400 mb-1">
              Response Body
            </p>
            <pre className="bg-slate-950 rounded p-3 text-xs text-slate-300 overflow-x-auto max-h-[300px] overflow-y-auto">
              {JSON.stringify(entry.responseBody, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
