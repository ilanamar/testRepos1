import { useState } from 'react';
import {
  MessageSquare,
  Sparkles,
  Send,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { askGemini } from '../services/geminiService';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export default function InsightsPanel() {
  const { state } = useApp();
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!state.reportData) return null;

  const insightText = state.reportData.insightText;
  const dataLines = state.reportData.datapointLines;

  async function handleAutoAnalysis() {
    setLoading(true);
    setError(null);
    try {
      const response = await askGemini(
        dataLines,
        insightText,
        'Please provide an executive summary of this data and give me 3 actionable recommendations to improve performance.',
        chatMessages
      );
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'user',
          text: 'Generate executive summary and 3 actionable recommendations.',
        },
        { role: 'model', text: response },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get analysis');
    } finally {
      setLoading(false);
    }
  }

  async function handleSend() {
    if (!userInput.trim()) return;
    const question = userInput.trim();
    setUserInput('');
    setLoading(true);
    setError(null);

    setChatMessages((prev) => [...prev, { role: 'user', text: question }]);

    try {
      const response = await askGemini(
        dataLines,
        insightText,
        question,
        chatMessages
      );
      setChatMessages((prev) => [...prev, { role: 'model', text: response }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get response');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Platform Insight (Static) */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-slate-900">
            Platform Insight
          </h3>
        </div>
        <div className="prose prose-sm prose-slate max-w-none">
          <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
            {insightText || 'No insight text available for this datapoint.'}
          </p>
        </div>
      </div>

      {/* Ask Gemini (Interactive) */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-semibold text-slate-900">
              Ask Gemini
            </h3>
          </div>
          <button
            onClick={handleAutoAnalysis}
            disabled={loading}
            className="text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
          >
            Auto-Analyze
          </button>
        </div>

        {/* Chat messages */}
        <div className="flex-1 min-h-[200px] max-h-[400px] overflow-y-auto space-y-3 mb-4">
          {chatMessages.length === 0 && (
            <p className="text-slate-400 text-sm italic">
              Ask a question about the current data, or click Auto-Analyze for
              an executive summary.
            </p>
          )}
          {chatMessages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-4 py-2.5 text-sm ${
                  msg.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 rounded-lg px-4 py-2.5 text-sm text-slate-500 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Thinking...
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-500 text-sm mb-3">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about this data..."
            className="flex-1 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
          <button
            onClick={handleSend}
            disabled={loading || !userInput.trim()}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 text-white p-2.5 rounded-lg transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
