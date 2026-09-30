import { useApp } from '@/context/AppContext';
import { Navbar } from '@/components/Navbar';
import { GlassCard } from '@/components/GlassCard';
import { LanguageBar } from '@/components/LanguageBar';
import { HealthGauge } from '@/components/HealthGauge';
import { ArchitectureDiagram } from '@/components/ArchitectureDiagram';
import {
  Star,
  GitFork,
  Calendar,
  Scale,
  Download,
  Sparkles,
  ShieldCheck,
  Cpu,
  Layers,
  AlertTriangle,
  TrendingUp,
  Info,
  FileText,
} from 'lucide-react';

export function ReportPage() {
  const { analysis, repoUrl } = useApp();

  if (!analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-ink-300">No analysis found. Start from the home page.</p>
      </div>
    );
  }

  const { meta, languages, technologies, summary, healthScore, healthBreakdown, recommendations, architecture } = analysis;
  const updatedDate = new Date(meta.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const generatedDate = new Date(analysis.generatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const sevConfig = {
    high: { color: 'text-danger-400 bg-danger-500/10 border-danger-500/20', icon: AlertTriangle },
    medium: { color: 'text-warning-400 bg-warning-500/10 border-warning-500/20', icon: TrendingUp },
    low: { color: 'text-success-400 bg-success-500/10 border-success-500/20', icon: Info },
  };

  return (
    <div className="min-h-screen pb-20">
      <Navbar repoName={repoUrl} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
        {/* Action bar */}
        <div className="no-print flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <FileText size={20} className="text-accent-400" />
            <h1 className="text-xl font-bold text-white">Repository Report</h1>
          </div>
          <button onClick={() => window.print()} className="btn-primary">
            <Download size={18} />
            Download PDF
          </button>
        </div>

        <div className="print-area space-y-6">
          {/* Report header */}
          <GlassCard className="p-8" delay={0}>
            <div className="flex items-start gap-4 mb-6">
              <img src={meta.avatarUrl} alt={meta.owner} className="w-14 h-14 rounded-xl border border-white/10" />
              <div className="flex-1">
                <div className="text-xs text-ink-400 uppercase tracking-wider mb-1">CodeTrace AI Report</div>
                <h1 className="text-2xl font-bold text-white mb-1">{meta.fullName}</h1>
                <a href={meta.url} target="_blank" rel="noreferrer" className="text-sm text-accent-300">
                  {meta.url}
                </a>
              </div>
            </div>
            <p className="text-ink-200 text-sm leading-relaxed mb-6">{meta.description}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="flex items-center gap-2 text-sm">
                <Star size={16} className="text-accent-400" />
                <span className="text-ink-300">Stars:</span>
                <span className="font-semibold text-white">{meta.stars.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <GitFork size={16} className="text-accent-400" />
                <span className="text-ink-300">Forks:</span>
                <span className="font-semibold text-white">{meta.forks.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar size={16} className="text-accent-400" />
                <span className="text-ink-300">Updated:</span>
                <span className="font-semibold text-white">{updatedDate}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Scale size={16} className="text-accent-400" />
                <span className="text-ink-300">License:</span>
                <span className="font-semibold text-white">{meta.license ?? 'None'}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/5 text-xs text-ink-400">
              Report generated on {generatedDate} by CodeTrace AI
            </div>
          </GlassCard>

          {/* AI Summary */}
          <GlassCard className="p-6" delay={100}>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={18} className="text-accent-400" />
              <h2 className="font-semibold text-white">AI Summary</h2>
            </div>
            <p className="text-ink-200 leading-relaxed text-sm">{summary}</p>
          </GlassCard>

          {/* Health Score */}
          <GlassCard className="p-6" delay={150}>
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck size={18} className="text-accent-400" />
              <h2 className="font-semibold text-white">Health Score</h2>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <HealthGauge score={healthScore} />
              <div className="flex-1 w-full space-y-3">
                {healthBreakdown.map((b) => (
                  <div key={b.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-ink-300">{b.label}</span>
                      <span className="font-mono text-ink-200">{b.score.toFixed(0)}/100</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-accent-500 to-navy-400"
                        style={{ width: `${b.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>

          {/* Languages */}
          <GlassCard className="p-6" delay={200}>
            <div className="flex items-center gap-2 mb-4">
              <Cpu size={18} className="text-accent-400" />
              <h2 className="font-semibold text-white">Languages</h2>
            </div>
            <LanguageBar languages={languages} />
          </GlassCard>

          {/* Technologies */}
          <GlassCard className="p-6" delay={250}>
            <div className="flex items-center gap-2 mb-4">
              <Layers size={18} className="text-accent-400" />
              <h2 className="font-semibold text-white">Technologies</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {technologies.map((tech) => (
                <div key={tech.name} className="chip bg-white/5 border-white/10 text-ink-200">
                  {tech.name}
                  <span className="text-ink-500 text-[10px]">{tech.category}</span>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Architecture */}
          <GlassCard className="p-6" delay={300}>
            <div className="flex items-center gap-2 mb-4">
              <Layers size={18} className="text-accent-400" />
              <h2 className="font-semibold text-white">Architecture</h2>
            </div>
            <ArchitectureDiagram architecture={architecture} />
          </GlassCard>

          {/* Recommendations */}
          <GlassCard className="p-6" delay={350}>
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck size={18} className="text-accent-400" />
              <h2 className="font-semibold text-white">Recommendations</h2>
            </div>
            <div className="space-y-3">
              {recommendations.map((rec, i) => {
                const sev = sevConfig[rec.severity];
                const Icon = sev.icon;
                return (
                  <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                    <div className="flex items-start gap-3">
                      <span className={`chip ${sev.color} flex-shrink-0`}>
                        <Icon size={12} />
                        {rec.severity}
                      </span>
                      <div>
                        <div className="font-medium text-white text-sm mb-1">{rec.title}</div>
                        <div className="text-xs text-ink-300">{rec.detail}</div>
                        <div className="text-[10px] text-ink-500 mt-1 uppercase tracking-wider">{rec.category}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>

          {/* Footer */}
          <div className="text-center text-xs text-ink-400 pt-4">
            Generated by CodeTrace AI · {generatedDate}
          </div>
        </div>
      </main>
    </div>
  );
}
