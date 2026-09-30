import type { AnalysisResult } from '@/types';

export interface ChatMessage { id: string; role: 'user' | 'assistant'; content: string; timestamp: number; }

export const SUGGESTED_QUESTIONS = [
  'What is the main entry point?',
  'Explain the architecture.',
  'What technologies does this repository use?',
  'How are the main modules connected?',
  'What should I read first?',
  'What are the main improvement areas?',
];

export async function answerQuestion(question: string, repoUrl: string, _analysis?: AnalysisResult): Promise<string> {
  const base = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');
  const res = await fetch(`${base}/api/ask`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question, repo_url: repoUrl }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.detail || `Ask AI failed (${res.status}).`);
  return body.answer || 'I could not generate an answer.';
}
