import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Freelancer category keys may be a single category UUID or a colon-separated path
 * (`ancestorId:...:leafId`). Admin category lists are keyed by each row's id only.
 */
export function resolveCategoryLabel(
  categoryId: string,
  categoryMap: Record<string, string>
): string {
  if (!categoryId) return categoryId;
  const direct = categoryMap[categoryId];
  if (direct) return direct;
  if (!categoryId.includes(':')) return categoryId;
  return categoryId
    .split(':')
    .map((seg) => categoryMap[seg] ?? seg)
    .join(' › ');
}
