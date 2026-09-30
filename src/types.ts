export interface RepoMeta {
  owner: string;
  name: string;
  fullName: string;
  description: string;
  url: string;
  stars: number;
  forks: number;
  watchers: number;
  openIssues: number;
  defaultBranch: string;
  license: string | null;
  createdAt: string;
  updatedAt: string;
  homepage: string | null;
  topics: string[];
  avatarUrl: string;
}

export interface LanguageBreakdown {
  name: string;
  bytes: number;
  pct: number;
  color: string;
}

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'dir';
  size: number;
  children?: FileNode[];
}

export interface KeyFile {
  path: string;
  name: string;
  summary: string;
  category: 'entry' | 'config' | 'docs' | 'source' | 'test' | 'build' | 'other';
}

export interface TechItem {
  name: string;
  category: string;
  confidence: number;
  evidence: string;
}

export interface GraphNode {
  id: string;
  label: string;
  group: string;
  size: number;
}
export interface GraphEdge {
  from: string;
  to: string;
  weight: number;
}

export interface DependencyGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface Recommendation {
  title: string;
  detail: string;
  severity: 'high' | 'medium' | 'low';
  category: string;
}

export interface AnalysisResult {
  meta: RepoMeta;
  languages: LanguageBreakdown[];
  keyFiles: KeyFile[];
  fileTree: FileNode;
  technologies: TechItem[];
  dependencyGraph: DependencyGraph;
  summary: string;
  healthScore: number;
  healthBreakdown: { label: string; score: number; weight: number }[];
  recommendations: Recommendation[];
  architecture: {
    pattern: string;
    description: string;
    layers: { name: string; responsibility: string; modules: string[] }[];
  };
  generatedAt: string;
}

export type LoadingStep = {
  key: string;
  label: string;
  description: string;
};
