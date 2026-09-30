import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { parseRepoUrl, analyzeRepository } from '@/lib/analysis';
import { Logo } from '@/components/Logo';
import { Check, Loader2, AlertCircle, Github } from 'lucide-react';
import type { LoadingStep } from '@/types';

const STEPS: LoadingStep[] = [
  { key: 'fetch', label: 'Fetching Repository', description: 'Connecting to GitHub API and pulling repo metadata' },
  { key: 'read', label: 'Reading Files', description: 'Scanning directory structure and key files' },
  { key: 'analyze', label: 'Gemini AI Analyzing', description: 'Generating summary, architecture, and insights' },
  { key: 'graph', label: 'Building Dependency Graph', description: 'Mapping relationships between modules' },
  { key: 'prepare', label: 'Preparing Dashboard', description: 'Assembling visualizations and health score' },
];

export function LoadingPage() {
  const navigate = useNavigate();
  const { repoUrl, setAnalysis, loadingError, setLoadingError } = useApp();
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const parsed = parseRepoUrl(repoUrl);
    if (!parsed) {
      navigate('/');
      return;
    }

    let cancelled = false;
    const stepTimers: ReturnType<typeof setTimeout>[] = [];

    async function run() {
      // Animate progress through steps
      STEPS.forEach((_, i) => {
        stepTimers.push(
          setTimeout(() => {
            if (!cancelled) setCurrentStep(i);
          }, i * 900)
        );
      });

      // Smooth progress bar
      const interval = setInterval(() => {
        if (cancelled) return;
        setProgress((p) => {
          if (p >= 92) return p;
          return p + Math.random() * 8;
        });
      }, 250);

      try {
        const result = await analyzeRepository(repoUrl);
        if (cancelled) return;
        setProgress(100);
        setCurrentStep(STEPS.length - 1);
        setAnalysis(result);
        clearInterval(interval);
        setTimeout(() => {
          if (!cancelled) navigate('/dashboard');
        }, 700);
      } catch (err) {
        if (cancelled) return;
        clearInterval(interval);
        setLoadingError(err instanceof Error ? err.message : 'Analysis failed.');
        setTimeout(() => {
          if (!cancelled) navigate('/');
        }, 2500);
      }
    }

    run();

    return () => {
      cancelled = true;
      stepTimers.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20 relative overflow-hidden">
      {/* Background */}
      <div
        className="fixed inset-0 bg-grid-navy bg-grid opacity-30 pointer-events-none"
        style={{ maskImage: 'radial-gradient(ellipse 60% 50% at 50% 50%, black, transparent)' }}
      />

      <div className="relative z-10 w-full max-w-2xl">
        {/* Logo */}
        <div className="flex justify-center mb-10 animate-fade-in">
          <Logo size="lg" />
        </div>

        {/* Repo display */}
        <div className="flex items-center justify-center gap-2 mb-10 text-ink-300 animate-fade-in animate-delay-200">
          <Github size={18} className="text-ink-400" />
          <span className="font-mono text-sm">{repoUrl}</span>
        </div>

        {/* Error */}
        {loadingError && (
          <div className="glass p-6 mb-8 border-danger-500/30 animate-scale-in">
            <div className="flex items-start gap-3">
              <AlertCircle size={22} className="text-danger-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-danger-300 mb-1">Analysis failed</p>
                <p className="text-sm text-ink-300">{loadingError}</p>
                <p className="text-xs text-ink-400 mt-2">Redirecting you back...</p>
              </div>
            </div>
          </div>
        )}

        {!loadingError && (
          <>
            {/* Progress bar */}
            <div className="mb-10 animate-fade-in animate-delay-300">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-ink-300">Analyzing repository...</span>
                <span className="text-sm font-mono text-accent-300">{Math.round(progress)}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent-500 to-navy-400 transition-all duration-300 ease-out"
                  style={{ width: `${progress}%`, boxShadow: '0 0 12px rgba(59,130,246,0.5)' }}
                />
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-3">
              {STEPS.map((step, i) => {
                const done = i < currentStep;
                const active = i === currentStep;
                const pending = i > currentStep;
                return (
                  <div
                    key={step.key}
                    className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-500 ${
                      active
                        ? 'glass border-accent-500/30 animate-pulse-glow'
                        : done
                        ? 'bg-white/[0.02] border border-white/5'
                        : 'opacity-40'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                        done
                          ? 'bg-success-500/20 text-success-400'
                          : active
                          ? 'bg-accent-500/20 text-accent-300'
                          : 'bg-white/5 text-ink-400'
                      }`}
                    >
                      {done ? (
                        <Check size={18} strokeWidth={2.5} />
                      ) : active ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <span className="text-xs font-bold">{i + 1}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div
                        className={`font-medium text-sm ${
                          done ? 'text-ink-300' : active ? 'text-white' : 'text-ink-400'
                        }`}
                      >
                        {step.label}
                        {active && <span className="text-accent-300"> ...</span>}
                      </div>
                      <div className="text-xs text-ink-400 mt-0.5">{step.description}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
