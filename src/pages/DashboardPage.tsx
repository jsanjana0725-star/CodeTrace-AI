import { useApp } from '@/context/AppContext';
import { Navbar } from '@/components/Navbar';
import { GlassCard } from '@/components/GlassCard';
import { LanguageBar } from '@/components/LanguageBar';
import { HealthGauge } from '@/components/HealthGauge';
import { FileTreeView } from '@/components/FileTreeView';
import { DependencyGraphView } from '@/components/DependencyGraphView';
import { ArchitectureDiagram } from '@/components/ArchitectureDiagram';
import {
  Star,
  GitFork,
  Eye,
  Calendar,
  Scale,
  Link2,
  Sparkles,
  FileCode,
  FolderTree,
  Network,
  Layers,
  Cpu,
  TrendingUp,
  AlertTriangle,
  Info,
  ShieldCheck,
  ExternalLink,
  Server,
} from 'lucide-react';
import type { KeyFile } from '@/types';

const CATEGORY_STYLES: Record<KeyFile['category'], { color: string; label: string }> = {
  entry: { color: 'text-success-400 bg-success-500/10 border-success-500/20', label: 'Entry' },
  config: { color: 'text-warning-400 bg-warning-500/10 border-warning-500/20', label: 'Config' },
  docs: { color: 'text-accent-300 bg-accent-500/10 border-accent-500/20', label: 'Docs' },
  source: { color: 'text-ink-200 bg-white/5 border-white/10', label: 'Source' },
  test: { color: 'text-navy-300 bg-navy-500/10 border-navy-500/20', label: 'Test' },
  build: { color: 'text-danger-300 bg-danger-500/10 border-danger-500/20', label: 'Build' },
  other: { color: 'text-ink-300 bg-white/5 border-white/10', label: 'Other' },
};

function StatPill({ icon: Icon, label, value }: { icon: typeof Star; label: string; value: string | number }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/5">
      <Icon size={18} className="text-accent-400 flex-shrink-0" />
      <div>
        <div className="text-xs text-ink-400 uppercase tracking-wider">{label}</div>
        <div className="font-semibold text-white text-sm">{value}</div>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { analysis, repoUrl } = useApp();

  if (!analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-ink-300 mb-4">No analysis found. Redirecting...</p>
        </div>
      </div>
    );
  }

  const { meta, languages, keyFiles, technologies, dependencyGraph, architecture, summary, healthScore, healthBreakdown, recommendations } = analysis;
  const updatedDate = new Date(meta.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div className="min-h-screen pb-20">
      <Navbar repoName={repoUrl} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
        {/* Header */}
        <GlassCard className="p-6 sm:p-8" delay={0}>
          <div className="flex flex-col lg:flex-row items-start gap-6">
            <img
              src={meta.avatarUrl}
              alt={meta.owner}
              className="w-16 h-16 rounded-2xl border border-white/10 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 text-sm text-ink-400 mb-1">
                <a href={meta.url} target="_blank" rel="noreferrer" className="hover:text-accent-300 transition-colors inline-flex items-center gap-1">
                  {meta.url}
                  <ExternalLink size={13} className="opacity-60" />
                </a>
                <a
                  href="http://localhost:8000/health"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-ink-300 hover:text-accent-300 hover:border-accent-500/30 transition-all"
                  title="FastAPI backend health check"
                >
                  <Server size={13} />
                  Backend API
                  <ExternalLink size={11} className="opacity-60" />
                </a>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">{meta.fullName}</h1>
              <p className="text-ink-300 text-sm sm:text-base max-w-3xl">{meta.description}</p>
              {meta.topics.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {meta.topics.slice(0, 6).map((t) => (
                    <span key={t} className="chip bg-accent-500/10 border-accent-500/20 text-accent-200">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
            <StatPill icon={Star} label="Stars" value={meta.stars.toLocaleString()} />
            <StatPill icon={GitFork} label="Forks" value={meta.forks.toLocaleString()} />
            <StatPill icon={Eye} label="Watchers" value={meta.watchers.toLocaleString()} />
            <StatPill icon={Calendar} label="Updated" value={updatedDate} />
            <StatPill icon={Scale} label="License" value={meta.license ?? 'None'} />
            <StatPill icon={GitFork} label="Branch" value={meta.defaultBranch} />
          </div>
        </GlassCard>

        {/* AI Summary + Health Score */}
        <div className="grid lg:grid-cols-3 gap-6">
          <GlassCard className="p-6 lg:col-span-2" delay={100}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-accent-500/10 border border-accent-500/20 flex items-center justify-center">
                <Sparkles size={18} className="text-accent-400" />
              </div>
              <div>
                <span className="section-label">AI Summary</span>
                <h2 className="font-semibold text-white">Gemini Repository Analysis</h2>
              </div>
            </div>
            <p className="text-ink-200 leading-relaxed text-sm sm:text-base">{summary}</p>
            <div className="mt-4 flex items-center gap-2 text-xs text-ink-400">
              <Info size={14} />
              Generated by CodeTrace AI based on repository structure and metadata
            </div>
          </GlassCard>

          <GlassCard className="p-6 flex flex-col items-center justify-center" delay={200}>
            <span className="section-label mb-2">Health Score</span>
            <HealthGauge score={healthScore} />
            <div className="w-full mt-5 space-y-2">
              {healthBreakdown.map((b) => (
                <div key={b.label} className="flex items-center gap-2">
                  <span className="text-xs text-ink-300 w-28 flex-shrink-0">{b.label}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-accent-500 to-navy-400 transition-all duration-1000"
                      style={{ width: `${b.score}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-ink-200 w-8 text-right">{b.score.toFixed(0)}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Languages + Technologies */}
        <div className="grid lg:grid-cols-2 gap-6">
          <GlassCard className="p-6" delay={100}>
            <div className="flex items-center gap-2 mb-5">
              <Cpu size={18} className="text-accent-400" />
              <h3 className="font-semibold text-white">Languages</h3>
            </div>
            <LanguageBar languages={languages} />
          </GlassCard>

          <GlassCard className="p-6" delay={200}>
            <div className="flex items-center gap-2 mb-5">
              <Layers size={18} className="text-accent-400" />
              <h3 className="font-semibold text-white">Technologies Used</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {technologies.map((tech) => (
                <div
                  key={tech.name}
                  className="group chip bg-white/5 border-white/10 text-ink-200 hover:bg-accent-500/10 hover:border-accent-500/20 hover:text-accent-200 transition-all cursor-default"
                  title={`${tech.evidence} · ${(tech.confidence * 100).toFixed(0)}% confidence`}
                >
                  {tech.name}
                  <span className="text-ink-500 group-hover:text-accent-400 text-[10px]">{tech.category}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Key Files + Project Structure */}
        <div className="grid lg:grid-cols-2 gap-6">
          <GlassCard className="p-6" delay={100}>
            <div className="flex items-center gap-2 mb-5">
              <FileCode size={18} className="text-accent-400" />
              <h3 className="font-semibold text-white">Key Files</h3>
            </div>
            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-2">
              {keyFiles.map((f) => {
                const style = CATEGORY_STYLES[f.category];
                const fileUrl = `vscode://github.remotehub/open?url=${encodeURIComponent(`${meta.url}/blob/${meta.defaultBranch}/${f.path}`)}`;
                return (
                  <a
                    key={f.path}
                    href={fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-accent-500/20 transition-all"
                  >
                    <span className={`chip ${style.color} flex-shrink-0 mt-0.5`}>{style.label}</span>
                    <div className="min-w-0 flex-1">
                      <div className="font-mono text-sm text-ink-100 truncate group-hover:text-accent-200 transition-colors">
                        {f.path}
                      </div>
                      <div className="text-xs text-ink-400 mt-0.5">{f.summary}</div>
                    </div>
                    <ExternalLink size={14} className="text-ink-500 group-hover:text-accent-400 flex-shrink-0 mt-1 transition-colors" />
                  </a>
                );
              })}
            </div>
          </GlassCard>

          <GlassCard className="p-6" delay={200}>
            <div className="flex items-center gap-2 mb-5">
              <FolderTree size={18} className="text-accent-400" />
              <h3 className="font-semibold text-white">Project Structure</h3>
            </div>
            <FileTreeView tree={analysis.fileTree} repoUrl={meta.url} branch={meta.defaultBranch} />
          </GlassCard>
        </div>

        {/* Dependency Graph + Architecture */}
        <div className="grid lg:grid-cols-2 gap-6">
          <GlassCard className="p-6" delay={100}>
            <div className="flex items-center gap-2 mb-5">
              <Network size={18} className="text-accent-400" />
              <h3 className="font-semibold text-white">Dependency Graph</h3>
            </div>
            <DependencyGraphView graph={dependencyGraph} />
            <p className="text-xs text-ink-400 text-center mt-4">
              {dependencyGraph.nodes.length} nodes · {dependencyGraph.edges.length} connections
            </p>
          </GlassCard>

          <GlassCard className="p-6" delay={200}>
            <div className="flex items-center gap-2 mb-5">
              <Layers size={18} className="text-accent-400" />
              <h3 className="font-semibold text-white">Architecture Visualization</h3>
            </div>
            <ArchitectureDiagram architecture={architecture} />
          </GlassCard>
        </div>

        {/* Recommendations */}
        <GlassCard className="p-6" delay={100}>
          <div className="flex items-center gap-2 mb-5">
            <ShieldCheck size={18} className="text-accent-400" />
            <h3 className="font-semibold text-white">Recommendations</h3>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {recommendations.map((rec, i) => {
              const sevConfig = {
                high: { color: 'text-danger-400 bg-danger-500/10 border-danger-500/20', icon: AlertTriangle },
                medium: { color: 'text-warning-400 bg-warning-500/10 border-warning-500/20', icon: TrendingUp },
                low: { color: 'text-success-400 bg-success-500/10 border-success-500/20', icon: Info },
              };
              const sev = sevConfig[rec.severity];
              const Icon = sev.icon;
              return (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-white/[0.02] border border-white/5 animate-fade-in"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <span className={`chip ${sev.color} flex-shrink-0`}>
                      <Icon size={12} />
                      {rec.severity}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white text-sm mb-1">{rec.title}</div>
                      <div className="text-xs text-ink-300">{rec.detail}</div>
                      <div className="text-[10px] text-ink-500 mt-1.5 uppercase tracking-wider">{rec.category}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Footer link to report */}
        <div className="text-center pt-4">
          <a href="/report" className="text-sm text-accent-300 hover:text-accent-200 transition-colors inline-flex items-center gap-1.5">
            <Link2 size={15} />
            View full report and export as PDF
          </a>
        </div>
      </main>
    </div>
  );
}
