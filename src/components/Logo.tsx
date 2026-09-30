import { GitBranch, Sparkles } from 'lucide-react';

export function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const dims = { sm: 'h-8 w-8', md: 'h-10 w-10', lg: 'h-14 w-14' }[size];
  const iconSize = { sm: 18, md: 22, lg: 30 }[size];
  const textSize = { sm: 'text-lg', md: 'text-xl', lg: 'text-3xl' }[size];

  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`${dims} relative rounded-xl bg-gradient-to-br from-accent-500 to-navy-600 flex items-center justify-center shadow-glow-sm`}
      >
        <GitBranch size={iconSize} className="text-white" strokeWidth={2.2} />
        <Sparkles
          size={iconSize * 0.5}
          className="absolute -top-1 -right-1 text-accent-300"
          fill="currentColor"
        />
      </div>
      <div className={`font-bold ${textSize} tracking-tight`}>
        <span className="text-white">Code</span>
        <span className="gradient-text">Trace</span>
        <span className="text-accent-400 font-medium"> AI</span>
      </div>
    </div>
  );
}
