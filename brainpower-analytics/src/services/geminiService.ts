import type { DatapointLine } from '../types/api';

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

function getGeminiKey(): string {
  return localStorage.getItem('bp_gemini_key') || '';
}

export function setGeminiKey(key: string) {
  localStorage.setItem('bp_gemini_key', key);
}

export function getStoredGeminiKey(): string {
  return getGeminiKey();
}

interface GeminiMessage {
  role: 'user' | 'model';
  text: string;
}

export async function askGemini(
  dataRows: DatapointLine[],
  insightText: string,
  userMessage: string,
  history: GeminiMessage[] = []
): Promise<string> {
  const key = getGeminiKey();
  if (!key) {
    throw new Error('Gemini API key not configured. Please set it in Settings.');
  }

  const top50 = dataRows.slice(0, 50);
  const systemContext = `You are an expert advertising data analyst for Outbrain's Brainpower Analytics platform.
You are given the following data context:

INSIGHT TEXT (Platform Generated):
${insightText}

DATA (Top 50 rows):
${JSON.stringify(top50, null, 2)}

Based on this data, help the user with their query. Be concise, actionable, and data-driven.`;

  const contents = [
    {
      role: 'user',
      parts: [{ text: systemContext }],
    },
    {
      role: 'model',
      parts: [
        {
          text: 'I understand. I have the advertising performance data context loaded. How can I help you analyze it?',
        },
      ],
    },
    ...history.map((m) => ({
      role: m.role,
      parts: [{ text: m.text }],
    })),
    {
      role: 'user',
      parts: [{ text: userMessage }],
    },
  ];

  const response = await fetch(`${GEMINI_API_URL}?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${err}`);
  }

  const data = await response.json();
  return (
    data.candidates?.[0]?.content?.parts?.[0]?.text ||
    'No response generated.'
  );
}
