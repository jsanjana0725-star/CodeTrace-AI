import type { LanguageBreakdown } from '@/types';

export function LanguageBar({ languages }: { languages: LanguageBreakdown[] }) {
  const top = languages.slice(0, 8);
  return (
    <div className="space-y-4">
      <div className="flex h-3 rounded-full overflow-hidden">
        {top.map((lang) => (
          <div
            key={lang.name}
            style={{ width: `${lang.pct}%`, backgroundColor: lang.color }}
            className="transition-all duration-700 hover:brightness-125"
            title={`${lang.name}: ${lang.pct.toFixed(1)}%`}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {top.map((lang) => (
          <div key={lang.name} className="flex items-center gap-2 text-sm">
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: lang.color }}
            />
            <span className="text-ink-200 font-medium">{lang.name}</span>
            <span className="text-ink-400 ml-auto">{lang.pct.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
