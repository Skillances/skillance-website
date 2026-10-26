import { SITE_EXPERIENCE_PAPER } from '@/lib/layout/siteChrome';

function isPortrait(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(max-aspect-ratio: 1/1)').matches;
}

/** Assembly videos on warm paper use the "clean" encodes; pure white keeps legacy assets. */
export function useWarmPaperLoader(surfaceColor: string): boolean {
  const normalized = surfaceColor.trim().toLowerCase();
  if (normalized === '#ffffff' || normalized === '#fff' || normalized === 'white') {
    return false;
  }
  return normalized === SITE_EXPERIENCE_PAPER.toLowerCase() || normalized.startsWith('#f3');
}

export function pickAssemblyVideoSrc(warmPaper: boolean): string {
  const portrait = isPortrait();
  if (warmPaper) {
    return portrait ? '/brand/logo_assembly_clean_9x16.mp4' : '/brand/logo_assembly_clean_16x9.mp4';
  }
  return portrait ? '/brand/logo_assembly_9x16.mp4' : '/brand/logo_assembly_16x9.mp4';
}

export function pickAssemblyPosterSrc(warmPaper: boolean): string {
  const portrait = isPortrait();
  if (warmPaper) {
    return portrait
      ? '/brand/logo_assembly_clean_9x16_poster.webp'
      : '/brand/logo_assembly_clean_16x9_poster.webp';
  }
  return portrait ? '/brand/logo_assembly_9x16_poster.webp' : '/brand/logo_assembly_16x9_poster.webp';
}

export function pickAssemblyEndFrameSrc(warmPaper: boolean): string {
  const portrait = isPortrait();
  if (warmPaper) {
    return portrait
      ? '/brand/logo_assembly_clean_9x16_end.webp'
      : '/brand/logo_assembly_clean_16x9_end.webp';
  }
  return portrait ? '/brand/logo_assembly_9x16_end.webp' : '/brand/logo_assembly_16x9_end.webp';
}
