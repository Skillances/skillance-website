import type { ServiceSpecializationNode } from '@/lib/serviceCategories';

interface SpecializationTreeListProps {
  nodes: ServiceSpecializationNode[];
  /** 0 = top-level specializations under a category */
  depth?: number;
  /** Slightly tighter rows for the home modal */
  compact?: boolean;
}

/**
 * Renders API category children with indentation so multi-level paths (e.g. Tutors) stay visible.
 */
export function SpecializationTreeList({ nodes, depth = 0, compact = false }: SpecializationTreeListProps) {
  if (nodes.length === 0) return null;

  return (
    <ul
      className={
        depth === 0
          ? 'flex flex-col gap-1 list-none p-0 m-0'
          : 'mt-1 flex flex-col gap-1 border-l border-neutral-200 pl-3 ml-2 list-none p-0 m-0'
      }
    >
      {nodes.map((node) => (
        <li key={node.id}>
          <div
            className={`flex items-center gap-2 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-colors ${
              compact ? 'py-1.5 px-2.5' : 'py-2 px-3'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-300 shrink-0" />
            <span className={`text-neutral-600 leading-tight ${compact ? 'text-[11px]' : 'text-xs'}`}>
              {node.name}
            </span>
          </div>
          {node.children.length > 0 ? (
            <SpecializationTreeList nodes={node.children} depth={depth + 1} compact={compact} />
          ) : null}
        </li>
      ))}
    </ul>
  );
}
