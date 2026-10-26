/** `object-position` for 3:2 photos in 4:5 (home) or 16:10 (/services) crops. */
const CATEGORY_IMAGE_OBJECT_POSITION: Record<string, string> = {
  handyman: '50% 42%',
  education: '50% 38%',
  cleaning: '50% 45%',
  petcare: '50% 40%',
  fitness: '50% 35%',
  automotive: '50% 28%',
  personalservices: '50% 40%',
  gardening: '50% 45%',
  computer: '50% 30%',
  professionalservices: '50% 26%',
  influencer: '50% 38%',
  photography: '50% 24%',
  videography: '50% 40%',
  music: '50% 42%',
};

export function categoryImageObjectPosition(categorySlug: string): string {
  const key = categorySlug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '');
  return CATEGORY_IMAGE_OBJECT_POSITION[key] ?? '50% 50%';
}
