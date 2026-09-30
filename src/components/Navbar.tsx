import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { Github, Menu, X, ArrowLeft, FileText, MessageSquare, LayoutDashboard } from 'lucide-react';

export function Navbar({ repoName }: { repoName?: string }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/ask', label: 'Ask AI', icon: MessageSquare },
    { to: '/report', label: 'Report', icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-ink-950/70 border-b border-white/5">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center">
            <Logo size="sm" />
          </Link>
          {repoName && (
            <div className="hidden md:flex items-center gap-2 text-sm text-ink-400">
              <span>/</span>
              <span className="text-ink-200 font-medium">{repoName}</span>
            </div>
          )}
        </div>

        {repoName && (
          <div className="hidden md:flex items-center gap-1">
            {links.map((l) => {
              const active = location.pathname === l.to;
              const Icon = l.icon;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? 'bg-accent-500/15 text-accent-300 border border-accent-500/30'
                      : 'text-ink-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon size={16} />
                  {l.label}
                </Link>
              );
            })}
            <button
              onClick={() => navigate('/')}
              className="ml-2 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-ink-300 hover:text-white hover:bg-white/5 transition-all"
            >
              <ArrowLeft size={16} />
              New
            </button>
          </div>
        )}

        {!repoName && (
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="btn-ghost text-sm hidden sm:inline-flex"
          >
            <Github size={18} />
            GitHub
          </a>
        )}

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-ink-200 p-2"
          aria-label="Menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open && repoName && (
        <div className="md:hidden border-t border-white/5 px-4 py-3 space-y-1">
          {links.map((l) => {
            const Icon = l.icon;
            return (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-ink-200 hover:bg-white/5"
              >
                <Icon size={18} />
                {l.label}
              </Link>
            );
          })}
          <button
            onClick={() => { setOpen(false); navigate('/'); }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-ink-200 hover:bg-white/5 w-full"
          >
            <ArrowLeft size={18} />
            New Analysis
          </button>
        </div>
      )}
    </header>
  );
}
