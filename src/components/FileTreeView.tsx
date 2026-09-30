import { useState } from 'react';
import type { FileNode } from '@/types';
import { ChevronRight, Folder, FileCode, FileText, Settings, FileCheck, ExternalLink } from 'lucide-react';

function iconFor(name: string, type: 'file' | 'dir') {
  if (type === 'dir') return <Folder size={15} className="text-accent-400 flex-shrink-0" />;
  const lower = name.toLowerCase();
  if (lower.endsWith('.md')) return <FileText size={15} className="text-ink-400 flex-shrink-0" />;
  if (lower.includes('config') || lower.endsWith('.json') || lower.endsWith('.yml') || lower.endsWith('.yaml') || lower.endsWith('.toml'))
    return <Settings size={15} className="text-warning-500 flex-shrink-0" />;
  if (lower.includes('test') || lower.includes('.spec.')) return <FileCheck size={15} className="text-success-500 flex-shrink-0" />;
  return <FileCode size={15} className="text-ink-300 flex-shrink-0" />;
}

function TreeNode({ node, depth, repoUrl, branch }: { node: FileNode; depth: number; repoUrl: string; branch: string }) {
  const [open, setOpen] = useState(depth < 1);
  const isDir = node.type === 'dir';
  const hasChildren = node.children && node.children.length > 0;
  const fileUrl = `vscode://github.remotehub/open?url=${encodeURIComponent(`${repoUrl}/blob/${branch}/${node.path}`)}`;

  if (isDir) {
    return (
      <div>
        <button
          onClick={() => hasChildren && setOpen(!open)}
          className={`flex items-center gap-1.5 w-full text-left px-2 py-1 rounded-md hover:bg-white/5 transition-colors ${
            hasChildren ? 'cursor-pointer' : 'cursor-default'
          }`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >
          {hasChildren ? (
            <ChevronRight size={14} className={`text-ink-400 transition-transform flex-shrink-0 ${open ? 'rotate-90' : ''}`} />
          ) : (
            <span className="w-3.5 flex-shrink-0" />
          )}
          {iconFor(node.name, node.type)}
          <span className="text-sm truncate text-ink-100 font-medium">{node.name}</span>
        </button>
        {open && hasChildren && (
          <div className="animate-fade-in">
            {node.children!.map((child) => (
              <TreeNode key={child.path} node={child} depth={depth + 1} repoUrl={repoUrl} branch={branch} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <a
      href={fileUrl}
      target="_blank"
      rel="noreferrer"
      className="group flex items-center gap-1.5 w-full text-left px-2 py-1 rounded-md hover:bg-white/5 transition-colors"
      style={{ paddingLeft: `${depth * 16 + 8}px` }}
    >
      <span className="w-3.5 flex-shrink-0" />
      {iconFor(node.name, node.type)}
      <span className="text-sm truncate text-ink-300 group-hover:text-accent-200 transition-colors flex-1">
        {node.name}
      </span>
      <ExternalLink size={12} className="text-ink-600 group-hover:text-accent-400 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all" />
    </a>
  );
}

export function FileTreeView({ tree, repoUrl, branch }: { tree: FileNode; repoUrl: string; branch: string }) {
  return (
    <div className="max-h-[480px] overflow-y-auto pr-2 font-mono">
      <TreeNode node={tree} depth={0} repoUrl={repoUrl} branch={branch} />
    </div>
  );
}
