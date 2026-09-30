import { Logo } from './Logo';
import { Github, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-white/5 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Logo size="sm" />
          <p className="text-sm text-ink-400 text-center">
            Built for developers who want to understand code faster.
          </p>
          <div className="flex items-center gap-4 text-sm text-ink-400">
            <span className="flex items-center gap-1.5">
              Powered by <span className="text-accent-300 font-medium">Gemini AI</span>
            </span>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors"
            >
              <Github size={18} />
            </a>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-center gap-1.5 text-xs text-ink-500">
          Made with <Heart size={12} className="text-danger-500" fill="currentColor" /> using React, FastAPI & Google Gemini
        </div>
      </div>
    </footer>
  );
}
