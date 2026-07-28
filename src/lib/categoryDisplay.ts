import type { CategoryNode } from '@/types/product';

export function findCategoryInTree(roots: CategoryNode[], param: string): CategoryNode | null {
  const walk = (nodes: CategoryNode[]): CategoryNode | null => {
    for (const node of nodes) {
      if (node.id === param) return node;
      if (node.children?.length) {
        const nested = walk(node.children);
        if (nested) return nested;
      }
    }
    return null;
  };
  return walk(roots);
}

function findCategoryPathByIds(roots: CategoryNode[], ids: string[]): CategoryNode[] | null {
  if (ids.length === 0) return [];
  const [head, ...rest] = ids;
  for (const root of roots) {
    if (root.id !== head) continue;
    if (rest.length === 0) return [root];
    if (!root.children?.length) return null;
    const nested = findCategoryPathByIds(root.children, rest);
    if (nested) return [root, ...nested];
  }
  return null;
}

function findCategoryPathByLeafId(roots: CategoryNode[], leafId: string): CategoryNode[] | null {
  const walk = (nodes: CategoryNode[], trail: CategoryNode[]): CategoryNode[] | null => {
    for (const node of nodes) {
      const next = [...trail, node];
      if (node.id === leafId) return next;
      if (node.children?.length) {
        const nested = walk(node.children, next);
        if (nested) return nested;
      }
    }
    return null;
  };
  return walk(roots, []);
}

/** Mirrors Flutter CategoryNotifier.getCategoryDisplayName for colon paths and leaf UUIDs. */
export function getCategoryDisplayName(roots: CategoryNode[], categoryId: string): string {
  const trimmed = categoryId.trim();
  if (!trimmed) return categoryId;

  if (trimmed.includes(':')) {
    const parts = trimmed.split(':').filter(Boolean);
    const path = findCategoryPathByIds(roots, parts);
    if (path?.length) {
      return path.map((node) => node.name).join(' > ');
    }
    const root = findCategoryInTree(roots, parts[0] ?? '');
    if (root) return root.name;
  }

  const leafPath = findCategoryPathByLeafId(roots, trimmed);
  if (leafPath?.length) {
    return leafPath.map((node) => node.name).join(' > ');
  }

  const direct = findCategoryInTree(roots, trimmed);
  if (direct) return direct.name;

  return trimmed;
}

export interface CategoryRateRow {
  categoryId: string;
  hourlyRate?: number | null;
  bookingPricingMode?: string | null;
}

export function rateRowForCategoryId(
  rates: CategoryRateRow[] | undefined,
  categoryId: string,
): CategoryRateRow | undefined {
  if (!rates?.length) return undefined;
  return rates.find((row) => row.categoryId === categoryId);
}

export function isInvoiceMode(row?: CategoryRateRow): boolean {
  return row?.bookingPricingMode === 'invoice';
}

export function hourlyAmount(row?: CategoryRateRow): number | null {
  if (row?.hourlyRate == null) return null;
  return Number(row.hourlyRate);
}

export type ListingRateDisplayKind = 'invoiceOnly' | 'hourlyOnly' | 'mixedMinHourlyWithHint';

export interface ListingRateDisplay {
  kind: ListingRateDisplayKind;
  minHourlyAmount?: number | null;
  showMixedServicesHint?: boolean;
}

export function computeListingRateDisplay(
  hourlyRate: number | null | undefined,
  categoryRates?: CategoryRateRow[],
): ListingRateDisplay {
  if (!categoryRates?.length) {
    return { kind: 'hourlyOnly', minHourlyAmount: hourlyRate ?? null };
  }

  let minHourly: number | null = null;
  let hasInvoiceCategory = false;
  let hasHourlyCategory = false;

  for (const row of categoryRates) {
    if (row.bookingPricingMode === 'invoice') {
      hasInvoiceCategory = true;
      continue;
    }
    const amount = hourlyAmount(row);
    if (amount != null) {
      hasHourlyCategory = true;
      minHourly = minHourly == null ? amount : Math.min(minHourly, amount);
    }
  }

  if (hasInvoiceCategory && !hasHourlyCategory) {
    return { kind: 'invoiceOnly' };
  }
  if (!hasInvoiceCategory && hasHourlyCategory) {
    return { kind: 'hourlyOnly', minHourlyAmount: minHourly ?? hourlyRate ?? null };
  }
  if (hasInvoiceCategory && hasHourlyCategory) {
    return {
      kind: 'mixedMinHourlyWithHint',
      minHourlyAmount: minHourly ?? hourlyRate ?? null,
      showMixedServicesHint: true,
    };
  }

  return { kind: 'hourlyOnly', minHourlyAmount: hourlyRate ?? null };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatTagForDisplay(tag?: string | null): string {
  if (!tag) return '';
  if (tag.includes('-')) {
    const normalized = tag.toUpperCase();
    return normalized.startsWith('@') ? normalized : `@${normalized}`;
  }
  const prefix = tag.toUpperCase().startsWith('SKL') ? 'SKL' : '';
  const rest = tag.toUpperCase().startsWith('SKL') ? tag.toUpperCase().slice(3) : tag.toUpperCase();
  if (rest.length === 8) {
    const formatted = `${prefix}${prefix ? '-' : ''}${rest.slice(0, 4)}-${rest.slice(4)}`;
    return `@${formatted}`;
  }
  const normalized = tag.toUpperCase();
  return normalized.startsWith('@') ? normalized : `@${normalized}`;
}

export function bookingLeafCategoryId(
  _categoryIds: string[] | undefined,
  categoryRates: CategoryRateRow[] | undefined,
  pathOrLeafId: string,
): string {
  const trimmed = pathOrLeafId.trim();
  if (!trimmed) return trimmed;
  const row = rateRowForCategoryId(categoryRates, trimmed);
  if (row?.categoryId) {
    const cid = row.categoryId.trim();
    return cid.includes(':') ? cid.split(':').pop()!.trim() : cid;
  }
  return trimmed.includes(':') ? trimmed.split(':').pop()!.trim() : trimmed;
}

export interface ServiceCategoryOption {
  id: string;
  displayName: string;
  pricingMode: 'hourly' | 'invoice';
  hourlyRate: number | null;
}

export function buildServiceCategoryOptions(
  roots: CategoryNode[],
  categoryIds: string[] | undefined,
  categoryRates: CategoryRateRow[] | undefined,
): ServiceCategoryOption[] {
  if (!categoryIds?.length) return [];
  return categoryIds.map((categoryId) => {
    const rateRow = rateRowForCategoryId(categoryRates, categoryId);
    const invoice = isInvoiceMode(rateRow);
    return {
      id: categoryId,
      displayName: getCategoryDisplayName(roots, categoryId),
      pricingMode: invoice ? 'invoice' : 'hourly',
      hourlyRate: hourlyAmount(rateRow),
    };
  });
}

export function formatDeliveryMode(mode?: string | null): string | null {
  switch (mode) {
    case 'online_only':
      return 'Online only';
    case 'in_person_only':
      return 'In person';
    case 'both':
      return 'Online or in person';
    default:
      return mode ? mode.replace(/_/g, ' ') : null;
  }
}
