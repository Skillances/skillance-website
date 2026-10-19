import { useEffect, useState } from 'react';
import { get } from '@/lib/api';
import { ApiPaths } from '@/lib/apiEndpoints';

export type BeyondWorkItem = {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  linkUrl: string | null;
  tags: string[];
  displayOrder: number;
};

const HTTP_URL = /^https?:\/\//i;

function safeHttpUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return HTTP_URL.test(trimmed) ? trimmed : null;
}

function safeImageUrl(value: unknown): string | null {
  const remote = safeHttpUrl(value);
  if (remote) return remote;
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return trimmed;
  return null;
}

/** Accepts the public envelope and drops rows that are missing a name or description. */
export function parseBeyondWork(json: unknown): BeyondWorkItem[] {
  if (!json || typeof json !== 'object') return [];
  const data = (json as { success?: unknown; data?: unknown }).data;
  if ((json as { success?: unknown }).success !== true || !Array.isArray(data)) return [];

  const items: BeyondWorkItem[] = [];
  for (const raw of data) {
    if (!raw || typeof raw !== 'object') continue;
    const row = raw as Record<string, unknown>;
    if (row.published === false) continue;
    const name = typeof row.name === 'string' ? row.name.trim() : '';
    const description = typeof row.description === 'string' ? row.description.trim() : '';
    if (!name || !description) continue;
    const id = typeof row.id === 'string' && row.id.trim() ? row.id.trim() : name;
    const tags = Array.isArray(row.tags)
      ? row.tags.filter((tag): tag is string => typeof tag === 'string' && tag.trim().length > 0).map((tag) => tag.trim())
      : [];
    const displayOrder = typeof row.displayOrder === 'number' && Number.isFinite(row.displayOrder) ? row.displayOrder : 0;
    items.push({
      id,
      name,
      description,
      imageUrl: safeImageUrl(row.imageUrl),
      linkUrl: safeHttpUrl(row.linkUrl),
      tags,
      displayOrder,
    });
  }

  items.sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name, 'en'));
  return items;
}

/**
 * Published clients and portfolio pieces from GET /public/beyond-work.
 * A missing endpoint, or an empty list, resolves to no items. Nothing is invented locally.
 */
export function useBeyondWork(): { ready: boolean; items: BeyondWorkItem[] } {
  const [state, setState] = useState<{ ready: boolean; items: BeyondWorkItem[] }>({ ready: false, items: [] });

  useEffect(() => {
    let cancelled = false;
    get(ApiPaths.public.beyondWork)
      .then((json) => {
        if (!cancelled) setState({ ready: true, items: parseBeyondWork(json) });
      })
      .catch(() => {
        if (!cancelled) setState({ ready: true, items: [] });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
