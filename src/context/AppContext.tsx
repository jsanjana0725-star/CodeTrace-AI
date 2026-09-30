import { createContext, useContext, useState, type ReactNode } from 'react';
import type { AnalysisResult } from '@/types';

interface AppState {
  repoUrl: string;
  setRepoUrl: (url: string) => void;
  analysis: AnalysisResult | null;
  setAnalysis: (a: AnalysisResult | null) => void;
  loadingError: string | null;
  setLoadingError: (e: string | null) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [repoUrl, setRepoUrl] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  return (
    <AppContext.Provider
      value={{ repoUrl, setRepoUrl, analysis, setAnalysis, loadingError, setLoadingError }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
