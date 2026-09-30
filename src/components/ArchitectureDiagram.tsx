import type { AnalysisResult } from '@/types';
import { Layers, ArrowDown } from 'lucide-react';

export function ArchitectureDiagram({ architecture }: { architecture: AnalysisResult['architecture'] }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Layers size={18} className="text-accent-400" />
        <h4 className="font-semibold text-white">{architecture.pattern}</h4>
      </div>
      <p className="text-sm text-ink-300 mb-5">{architecture.description}</p>
      <div className="space-y-2">
        {architecture.layers.map((layer, i) => (
          <div key={layer.name} className="animate-slide-up" style={{ animationDelay: `${i * 120}ms` }}>
            <div className="glass p-4 border-l-2 border-accent-500/50">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-accent-200 text-sm">{layer.name}</span>
                <span className="text-xs text-ink-400">{layer.modules.join(' · ')}</span>
              </div>
              <p className="text-xs text-ink-300">{layer.responsibility}</p>
            </div>
            {i < architecture.layers.length - 1 && (
              <div className="flex justify-center py-1">
                <ArrowDown size={14} className="text-ink-500" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
