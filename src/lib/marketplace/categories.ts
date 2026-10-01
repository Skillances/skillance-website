import { useQuery } from '@tanstack/react-query';
import { get } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';

/** Node from `GET /categories` (top level with nested `children`). */
export type CategoryNode = {
  id: string;
  parentId?: string | null;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  allowedPricingModes?: string[];
  supportsRecurring?: boolean;
  children?: CategoryNode[];
};

/**
 * A selectable category. `path` is the canonical id the app stores: API ids from the root to the
 * leaf joined with `:` (see skillance-app freelancer_register_category_selection.dart).
 */
export type CategoryLeaf = {
  path: string;
  name: string;
  breadcrumb: string[];
  rootId: string;
  rootName: string;
};

export function useCategories() {
  return useQuery({
    queryKey: ['marketplace', 'categories'],
    queryFn: async () => {
      const res = await get(ApiPaths.categories.list);
      const raw = Array.isArray(res) ? res : res?.data;
      return (Array.isArray(raw) ? raw : []) as CategoryNode[];
    },
    staleTime: 10 * 60_000,
  });
}

/** Leaf paths only, so a freelancer cannot pick a generic branch like "Tutors". */
export function flattenLeaves(roots: CategoryNode[]): CategoryLeaf[] {
  const out: CategoryLeaf[] = [];
  const walk = (node: CategoryNode, ids: string[], names: string[], root: CategoryNode) => {
    const nextIds = [...ids, node.id];
    const nextNames = [...names, node.name];
    const kids = node.children ?? [];
    if (kids.length === 0) {
      out.push({
        path: nextIds.join(':'),
        name: node.name,
        breadcrumb: nextNames,
        rootId: root.id,
        rootName: root.name,
      });
      return;
    }
    for (const k of kids) walk(k, nextIds, nextNames, root);
  };
  for (const r of roots) walk(r, [], [], r);
  return out;
}

/** Display name for a stored category path or plain id, e.g. "Tutors / Mathematics". */
export function categoryLabel(roots: CategoryNode[] | undefined, pathOrId: string): string {
  if (!roots || !pathOrId) return pathOrId;
  const parts = pathOrId.split(':');
  const names: string[] = [];
  let level: CategoryNode[] = roots;
  for (const id of parts) {
    const hit = level.find((c) => c.id === id);
    if (!hit) break;
    names.push(hit.name);
    level = hit.children ?? [];
  }
  if (names.length === 0 && parts.length === 1) {
    // Bookings store only the leaf id; find it anywhere in the tree.
    const find = (nodes: CategoryNode[]): string | null => {
      for (const n of nodes) {
        if (n.id === pathOrId) return n.name;
        const hit = find(n.children ?? []);
        if (hit) return hit;
      }
      return null;
    };
    return find(roots) ?? pathOrId;
  }
  if (names.length === 0) return pathOrId;
  return names.length > 1 ? names.slice(1).join(' / ') : names[0];
}

/** The node a stored path or leaf id points at. */
export function findCategory(roots: CategoryNode[] | undefined, pathOrId: string): CategoryNode | null {
  if (!roots) return null;
  const leaf = pathOrId.split(':').pop() ?? pathOrId;
  const walk = (nodes: CategoryNode[]): CategoryNode | null => {
    for (const n of nodes) {
      if (n.id === leaf) return n;
      const hit = walk(n.children ?? []);
      if (hit) return hit;
    }
    return null;
  };
  return walk(roots);
}
