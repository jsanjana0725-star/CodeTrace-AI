import { useState, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Navbar } from '@/components/Navbar';
import { GlassCard } from '@/components/GlassCard';
import { answerQuestion, SUGGESTED_QUESTIONS, type ChatMessage } from '@/lib/askAI';
import { Sparkles, Send, User, Bot, MessageSquare } from 'lucide-react';

function uid() {
  return Math.random().toString(36).slice(2, 11);
}

export function AskAIPage() {
  const { analysis, repoUrl } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  function ask(question: string) {
    if (!analysis || !question.trim()) return;
    const userMsg: ChatMessage = { id: uid(), role: 'user', content: question.trim(), timestamp: Date.now() };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setTyping(true);
    answerQuestion(question.trim(), repoUrl, analysis)
      .then((answer) => {
        const aiMsg: ChatMessage = { id: uid(), role: 'assistant', content: answer, timestamp: Date.now() };
        setMessages((m) => [...m, aiMsg]);
      })
      .catch((err) => {
        const aiMsg: ChatMessage = { id: uid(), role: 'assistant', content: err instanceof Error ? err.message : 'Ask AI failed.', timestamp: Date.now() };
        setMessages((m) => [...m, aiMsg]);
      })
      .finally(() => setTyping(false));
  }

  if (!analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-ink-300">No analysis found. Start from the home page.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 flex flex-col">
      <Navbar repoName={repoUrl} />

      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 pt-8 flex-1 flex flex-col">
        {/* Header */}
        <GlassCard className="p-6 mb-6" delay={0}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-navy-600 flex items-center justify-center">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Ask AI about {analysis.meta.name}</h1>
              <p className="text-sm text-ink-400">Powered by Gemini — answers are based on the repository analysis</p>
            </div>
          </div>
        </GlassCard>

        {/* Chat area */}
        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto pb-4 min-h-[300px]">
          {messages.length === 0 && (
            <div className="text-center py-12 animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-accent-500/10 border border-accent-500/20 flex items-center justify-center mx-auto mb-4">
                <MessageSquare size={28} className="text-accent-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Ask anything about this repository</h3>
              <p className="text-sm text-ink-400 mb-6 max-w-md mx-auto">
                Get instant answers about the architecture, code structure, or how to get started.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => ask(q)}
                    className="chip bg-white/5 border-white/10 text-ink-200 hover:bg-accent-500/10 hover:border-accent-500/20 hover:text-accent-200 transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 animate-fade-in ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user'
                    ? 'bg-navy-500/20 border border-navy-500/30'
                    : 'bg-gradient-to-br from-accent-500 to-navy-600'
                }`}
              >
                {msg.role === 'user' ? (
                  <User size={16} className="text-navy-200" />
                ) : (
                  <Bot size={16} className="text-white" />
                )}
              </div>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-navy-500/15 border border-navy-500/20 text-ink-100'
                    : 'glass text-ink-100'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}

          {typing && (
            <div className="flex gap-3 animate-fade-in">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-500 to-navy-600 flex items-center justify-center flex-shrink-0">
                <Bot size={16} className="text-white" />
              </div>
              <div className="glass rounded-2xl px-4 py-3 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-accent-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-accent-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-accent-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <form
          onSubmit={(e) => { e.preventDefault(); ask(input); }}
          className="sticky bottom-0 pt-4"
        >
          <div className="glass-strong p-2 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about the repository..."
              className="flex-1 bg-transparent border-0 focus:outline-none text-ink-100 placeholder:text-ink-400 px-4 py-3 text-sm"
              autoFocus
            />
            <button
              type="submit"
              disabled={!input.trim() || typing}
              className="btn-primary py-2.5 px-4 disabled:opacity-40"
            >
              <Send size={18} />
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
