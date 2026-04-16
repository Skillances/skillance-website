import type { ServiceSpecializationNode } from '@/lib/serviceCategories';
import { ChevronDown } from 'lucide-react';

export interface SpecializationTreeListProps {
  nodes: ServiceSpecializationNode[];
  /** Slightly tighter rows for the home modal */
  compact?: boolean;
  /** Labels prepended to every leaf path (e.g. top-level category name on /category/:id). */
  breadcrumbPrefix?: string[];
  /** When set, leaf rows open contact (or other) flows; receives full path from root for display. */
  onLeafClick?: (leaf: ServiceSpecializationNode, pathFromRoot: string[]) => void;
}

function childrenAreAllLeaves(node: ServiceSpecializationNode): boolean {
  if (node.children.length === 0) return false;
  return node.children.every((c) => c.children.length === 0);
}

function LeafGrid({
  leaves,
  compact,
  onLeafClick,
  pathForLeaves,
}: {
  leaves: ServiceSpecializationNode[];
  compact?: boolean;
  onLeafClick?: (leaf: ServiceSpecializationNode, pathFromRoot: string[]) => void;
  /** Path including the parent subject name; each leaf appends its own name. */
  pathForLeaves: string[];
}) {
  return (
    <div
      className={
        compact
          ? 'grid grid-cols-2 gap-1.5 sm:grid-cols-3'
          : 'grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
      }
    >
      {leaves.map((leaf) => {
        const path = [...pathForLeaves, leaf.name];
        const baseClass = compact
          ? 'rounded-md border border-neutral-100 bg-white px-2 py-1.5 text-center text-[11px] font-medium text-neutral-700'
          : 'rounded-lg border border-neutral-100 bg-white px-2 py-2 text-center text-xs font-medium text-neutral-700 shadow-sm';
        if (onLeafClick) {
          return (
            <button
              key={leaf.id}
              type="button"
              onClick={() => onLeafClick(leaf, path)}
              className={`${baseClass} w-full cursor-pointer transition-colors hover:border-neutral-400 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20`}
            >
              {leaf.name}
            </button>
          );
        }
        return (
          <div key={leaf.id} className={baseClass}>
            {leaf.name}
          </div>
        );
      })}
    </div>
  );
}

interface BranchProps {
  node: ServiceSpecializationNode;
  depth: number;
  compact?: boolean;
  defaultOpen?: boolean;
  pathPrefix: string[];
  onLeafClick?: (leaf: ServiceSpecializationNode, pathFromRoot: string[]) => void;
}

function Branch({ node, depth, compact, defaultOpen = false, pathPrefix, onLeafClick }: BranchProps) {
  if (node.children.length === 0) {
    const path = [...pathPrefix, node.name];
    const baseClass = compact
      ? 'rounded-md border border-neutral-100 bg-neutral-50 px-2 py-1.5 text-[11px] text-neutral-700'
      : 'rounded-lg border border-neutral-100 bg-neutral-50 px-3 py-2 text-xs text-neutral-700';
    if (onLeafClick) {
      return (
        <button
          type="button"
          onClick={() => onLeafClick(node, path)}
          className={`${baseClass} w-full text-left transition-colors hover:border-neutral-300 hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20`}
        >
          {node.name}
        </button>
      );
    }
    return <div className={baseClass}>{node.name}</div>;
  }

  if (childrenAreAllLeaves(node)) {
    const pathForLeaves = [...pathPrefix, node.name];
    return (
      <details
        className={
          compact
            ? 'group mb-1.5 rounded-lg border border-neutral-200 bg-white'
            : 'group mb-2 rounded-xl border border-neutral-200 bg-white shadow-sm'
        }
        open={defaultOpen}
      >
        <summary className="flex cursor-pointer list-none items-center gap-2 py-2.5 pl-3 pr-3 text-left text-neutral-900 marker:content-none [&::-webkit-details-marker]:hidden">
          <ChevronDown
            className={`shrink-0 text-neutral-400 transition-transform duration-200 group-open:rotate-180 ${compact ? 'h-3.5 w-3.5' : 'h-4 w-4'}`}
            aria-hidden
          />
          <span className={`min-w-0 flex-1 font-medium ${compact ? 'text-xs' : 'text-sm'}`}>{node.name}</span>
          <span className={`shrink-0 tabular-nums text-neutral-400 ${compact ? 'text-[10px]' : 'text-xs'}`}>
            {node.children.length}
          </span>
        </summary>
        <div className={compact ? 'border-t border-neutral-100 px-2 pb-2 pt-2' : 'border-t border-neutral-100 px-3 pb-3 pt-2'}>
          <LeafGrid
            leaves={node.children}
            compact={compact}
            onLeafClick={onLeafClick}
            pathForLeaves={pathForLeaves}
          />
        </div>
      </details>
    );
  }

  const nextPrefix = [...pathPrefix, node.name];

  return (
    <div className={depth === 0 ? 'space-y-3' : 'space-y-2 border-l-2 border-neutral-100 pl-3'}>
      <div
        className={
          depth === 0
            ? `font-semibold uppercase tracking-wide text-neutral-500 ${compact ? 'text-[10px]' : 'text-xs'}`
            : `font-medium text-neutral-800 ${compact ? 'text-xs' : 'text-sm'}`
        }
      >
        {node.name}
      </div>
      <div className="space-y-2">
        {node.children.map((child, index) => (
          <Branch
            key={child.id}
            node={child}
            depth={depth + 1}
            compact={compact}
            defaultOpen={index === 0}
            pathPrefix={nextPrefix}
            onLeafClick={onLeafClick}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Renders category specializations: collapsible subjects with dense grids for leaf lists
 * (e.g. Tutors &gt; Mathematics &gt; Grade 1&ndash;12) instead of a deep indented staircase.
 */
export function SpecializationTreeList({
  nodes,
  compact = false,
  breadcrumbPrefix = [],
  onLeafClick,
}: SpecializationTreeListProps) {
  if (nodes.length === 0) return null;
  return (
    <div className={compact ? 'space-y-3' : 'space-y-4'}>
      {nodes.map((node, index) => (
        <Branch
          key={node.id}
          node={node}
          depth={0}
          compact={compact}
          defaultOpen={index === 0}
          pathPrefix={breadcrumbPrefix}
          onLeafClick={onLeafClick}
        />
      ))}
    </div>
  );
}
