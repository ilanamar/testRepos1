import { useState } from 'react';
import { X, Key, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { setToken, getStoredToken } from '../services/apiClient';
import {
  setGeminiKey,
  getStoredGeminiKey,
} from '../services/geminiService';

export default function SettingsModal() {
  const { state, dispatch, loadMetadata } = useApp();
  const [apiToken, setApiToken] = useState(getStoredToken());
  const [geminiApiKey, setGeminiApiKey] = useState(getStoredGeminiKey());

  if (!state.settingsOpen) return null;

  function handleSave() {
    if (apiToken.trim()) {
      setToken(apiToken.trim());
      dispatch({ type: 'SET_HAS_TOKEN', payload: true });
      loadMetadata();
    }
    setGeminiKey(geminiApiKey.trim());
    dispatch({ type: 'SET_SETTINGS_OPEN', payload: false });
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Settings</h2>
          <button
            onClick={() =>
              dispatch({ type: 'SET_SETTINGS_OPEN', payload: false })
            }
            className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Brainpower API Token */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <Key className="w-4 h-4" />
              Brainpower API Token
            </label>
            <input
              type="password"
              value={apiToken}
              onChange={(e) => setApiToken(e.target.value)}
              placeholder="Enter your API token..."
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <p className="text-xs text-slate-400 mt-1.5">
              Required. Sent as API-TOKEN header to the Brainpower API.
            </p>
          </div>

          {/* Gemini API Key */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
              <Sparkles className="w-4 h-4" />
              Google Gemini API Key
            </label>
            <input
              type="password"
              value={geminiApiKey}
              onChange={(e) => setGeminiApiKey(e.target.value)}
              placeholder="Enter your Gemini API key..."
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <p className="text-xs text-slate-400 mt-1.5">
              Optional. Required for "Ask Gemini" AI analysis features.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200">
          <button
            onClick={() =>
              dispatch({ type: 'SET_SETTINGS_OPEN', payload: false })
            }
            className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
          >
            Save & Connect
          </button>
        </div>
      </div>
    </div>
  );
}
