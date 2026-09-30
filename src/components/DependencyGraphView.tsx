import { useMemo } from 'react';
import type { DependencyGraph } from '@/types';

const GROUP_COLORS: Record<string, string> = {
  Frontend: '#60a5fa',
  Backend: '#34d399',
  Language: '#a5b4fc',
  Database: '#fbbf24',
  DevOps: '#f87171',
  API: '#c084fc',
  Framework: '#60a5fa',
  Styling: '#f472b6',
  'Build Tool': '#fbbf24',
  Tooling: '#94a3b8',
  Testing: '#34d399',
  source: '#818cf8',
};

export function DependencyGraphView({ graph }: { graph: DependencyGraph }) {
  const layout = useMemo(() => {
    const cx = 250;
    const cy = 250;
    const maxR = 190;
    const nodes = graph.nodes.map((n, i) => {
      if (i === 0) return { ...n, x: cx, y: cy };
      const angle = (i / (graph.nodes.length - 1)) * Math.PI * 2;
      const r = maxR * (0.45 + (n.group === 'source' ? 0.55 : 0.3));
      return { ...n, x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r };
    });
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    return { nodes, nodeMap };
  }, [graph]);

  return (
    <div className="relative w-full aspect-square max-w-[520px] mx-auto">
      <svg viewBox="0 0 500 500" className="w-full h-full">
        <defs>
          <radialGradient id="bg-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(59,130,246,0.08)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <circle cx="250" cy="250" r="200" fill="url(#bg-glow)" />

        {graph.edges.map((edge, i) => {
          const from = layout.nodeMap.get(edge.from);
          const to = layout.nodeMap.get(edge.to);
          if (!from || !to) return null;
          return (
            <line
              key={i}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="rgba(129,140,248,0.25)"
              strokeWidth={Math.max(1, edge.weight * 2.5)}
              strokeDasharray="4 4"
            >
              <animate
                attributeName="stroke-dashoffset"
                from="8"
                to="0"
                dur="1.5s"
                repeatCount="indefinite"
              />
            </line>
          );
        })}

        {layout.nodes.map((n) => {
          const color = GROUP_COLORS[n.group] ?? '#818cf8';
          return (
            <g key={n.id} className="animate-scale-in">
              <circle
                cx={n.x}
                cy={n.y}
                r={n.size}
                fill={color}
                fillOpacity={0.18}
                stroke={color}
                strokeWidth={1.5}
                style={{ filter: `drop-shadow(0 0 6px ${color}66)` }}
              />
              <text
                x={n.x}
                y={n.y + n.size + 12}
                textAnchor="middle"
                className="fill-ink-200 text-[9px] font-medium"
              >
                {n.label.length > 16 ? n.label.slice(0, 14) + '…' : n.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
