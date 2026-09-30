import type { ReactNode } from 'react';

export function GlassCard({
  children,
  className = '',
  hover = false,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
}) {
  return (
    <div
      className={`glass ${hover ? 'glass-hover' : ''} animate-fade-in ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
