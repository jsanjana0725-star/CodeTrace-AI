import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { parseRepoUrl } from '@/lib/analysis';
import { Logo } from '@/components/Logo';
import { Footer } from '@/components/Footer';
import {
  Github,
  Search,
  Sparkles,
  GitBranch,
  FileSearch,
  Network,
  MessageSquare,
  FileText,
  ShieldCheck,
  Zap,
  ArrowRight,
} from 'lucide-react';

const EXAMPLE_REPOS = [
  'facebook/react',
  'vercel/next.js',
  'fastapi/fastapi',
  'microsoft/vscode',
];

export function LandingPage() {
  const navigate = useNavigate();
  const { setRepoUrl, setAnalysis, setLoadingError } = useApp();
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleAnalyze(e?: React.FormEvent) {
    e?.preventDefault();
    setError('');
    const parsed = parseRepoUrl(input);
    if (!parsed) {
      setError('Enter a valid GitHub repository URL or owner/repo.');
      return;
    }
    setLoading(true);
    setRepoUrl(`${parsed.owner}/${parsed.repo}`);
    setAnalysis(null);
    setLoadingError(null);
    navigate('/loading');
  }

  const features = [
    {
      icon: FileSearch,
      title: 'Smart File Analysis',
      desc: 'Identifies entry points, config files, and key modules automatically — so you know what to read first.',
    },
    {
      icon: Network,
      title: 'Dependency Graph',
      desc: 'Visualizes how modules and technologies connect, giving you a map of the codebase at a glance.',
    },
    {
      icon: Sparkles,
      title: 'Gemini AI Summary',
      desc: 'A plain-English explanation of what the project does, its architecture, and how it is structured.',
    },
    {
      icon: MessageSquare,
      title: 'Ask AI Anything',
      desc: 'Ask follow-up questions about authentication, entry points, or any part of the code — answered in context.',
    },
    {
      icon: ShieldCheck,
      title: 'Health Score',
      desc: 'A 0–100 score across documentation, testing, CI, and community activity to gauge project quality.',
    },
    {
      icon: FileText,
      title: 'Downloadable Reports',
      desc: 'Export a full PDF report with the summary, health score, technologies, and recommendations.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Background grid */}
      <div
        className="fixed inset-0 bg-grid-navy bg-grid opacity-40 pointer-events-none"
        style={{ maskImage: 'radial-gradient(ellipse 70% 60% at 50% 0%, black, transparent)' }}
      />

      {/* Nav */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 h-20 flex items-center justify-between">
        <Logo />
        <a
          href="https://github.com"
          target="_blank"
          rel="noreferrer"
          className="btn-ghost text-sm"
        >
          <Github size={18} />
          <span className="hidden sm:inline">GitHub</span>
        </a>
      </header>

      {/* Hero */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 pt-8 pb-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-500/10 border border-accent-500/20 text-accent-300 text-sm font-medium mb-8 animate-fade-in">
            <Sparkles size={15} />
            Powered by Google Gemini AI
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-balance leading-[1.05] mb-6 animate-slide-up">
            Understand any
            <br />
            <span className="gradient-text">GitHub repository</span>
            <br />
            in minutes
          </h1>

          <p className="text-lg sm:text-xl text-ink-300 max-w-2xl mx-auto mb-10 animate-slide-up animate-delay-200">
            Paste a repository URL and let CodeTrace AI map the architecture, surface key
            files, and explain the codebase — powered by Gemini.
          </p>

          {/* Input */}
          <form
            onSubmit={handleAnalyze}
            className="max-w-2xl mx-auto animate-slide-up animate-delay-300"
          >
            <div className="glass-strong p-2 flex flex-col sm:flex-row items-stretch gap-2">
              <div className="flex items-center gap-3 flex-1 px-4">
                <Github size={20} className="text-ink-400 flex-shrink-0" />
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="github.com/owner/repo or owner/repo"
                  className="flex-1 bg-transparent border-0 focus:outline-none text-ink-100 placeholder:text-ink-400 py-3 text-base"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary sm:w-auto whitespace-nowrap"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Fetching...
                  </>
                ) : (
                  <>
                    <Search size={18} />
                    Analyze Repository
                  </>
                )}
              </button>
            </div>
            {error && (
              <p className="mt-3 text-sm text-danger-400 animate-fade-in">{error}</p>
            )}
          </form>

          {/* Example repos */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 animate-fade-in animate-delay-500">
            <span className="text-sm text-ink-400">Try:</span>
            {EXAMPLE_REPOS.map((repo) => (
              <button
                key={repo}
                onClick={() => {
                  setInput(repo);
                }}
                className="chip bg-white/5 border-white/10 text-ink-300 hover:bg-white/10 hover:text-white transition-all"
              >
                {repo}
              </button>
            ))}
          </div>
        </div>

        {/* Stats / trust bar */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl w-full animate-fade-in-slow animate-delay-700">
          {[
            { icon: Zap, label: 'Instant Analysis', value: '< 30s' },
            { icon: GitBranch, label: 'Public Repos', value: 'Any size' },
            { icon: Sparkles, label: 'AI Engine', value: 'Gemini' },
            { icon: FileText, label: 'Export', value: 'PDF Report' },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="text-center">
                <Icon size={22} className="text-accent-400 mx-auto mb-2" />
                <div className="text-lg font-bold text-white">{s.value}</div>
                <div className="text-xs text-ink-400 uppercase tracking-wider">{s.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 py-20">
        <div className="text-center mb-14">
          <span className="section-label">Features</span>
          <h2 className="text-3xl sm:text-4xl font-bold mt-3 mb-4">
            Everything you need to <span className="gradient-text">understand code</span>
          </h2>
          <p className="text-ink-300 max-w-2xl mx-auto">
            From architecture to dependencies to health — CodeTrace AI gives you the full
            picture of any repository.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="glass glass-hover p-6 animate-fade-in"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-accent-500/10 border border-accent-500/20 flex items-center justify-center mb-4">
                  <Icon size={24} className="text-accent-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-ink-300 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-4xl mx-auto w-full px-4 sm:px-6 pb-20">
        <div className="glass-strong p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-radial-glow" />
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to dive into a codebase?</h2>
            <p className="text-ink-300 mb-6 max-w-xl mx-auto">
              Paste any public GitHub repository URL and get an AI-powered analysis in seconds.
            </p>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="btn-primary"
            >
              Start Analyzing
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
