import { get } from '@/lib/api';

export interface CategoryApiNode {
  id: string;
  parentId: string | null;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  websiteImageUrl?: string | null;
  children?: CategoryApiNode[];
}

export interface ServiceCategoryItem {
  id: string;
  slug: string;
  name: string;
  description: string;
  longDescription: string;
  image: string;
  subcategories: string[];
  subcategoryCount: number;
}

const CATEGORY_IMAGE_FALLBACKS: Record<string, string> = {
  // Legacy curated set from commit 3aeffc25... (known-good visual fit).
  handyman: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&q=80&w=2070',
  education: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=2070',
  cleaning: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=2070',
  petcare: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=2042',
  fitness: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=2070',
  automotive: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80&w=2070',
  personalservices: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=2084',
  gardening: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=2070',
  computer: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2072',
  professionalservices: 'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?auto=format&fit=crop&q=80&w=2074',
  influencer: 'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&q=80&w=2070',
  photography: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&q=80&w=2074',
  videography: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=2070',
  music: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&q=80&w=2070',
};

const CATEGORY_IMAGE_ALIASES: Record<string, keyof typeof CATEGORY_IMAGE_FALLBACKS> = {
  'handyman': 'handyman',
  'education': 'education',
  'cleaning': 'cleaning',
  'petcare': 'petcare',
  'pet-care': 'petcare',
  'fitness': 'fitness',
  'automotive': 'automotive',
  'personalservices': 'personalservices',
  'personal-services': 'personalservices',
  'personal service': 'personalservices',
  'gardening': 'gardening',
  'gardeninglandscaping': 'gardening',
  'gardening-landscaping': 'gardening',
  'technologyit': 'computer',
  'technology-it': 'computer',
  'technology & it': 'computer',
  'computer': 'computer',
  'it': 'computer',
  'professionalservices': 'professionalservices',
  'professional-services': 'professionalservices',
  'influencing': 'influencer',
  'influencer': 'influencer',
  'photography': 'photography',
  'videography': 'videography',
  'music': 'music',
  'music-1': 'music',
};

const CATEGORY_LONG_DESCRIPTIONS: Record<string, string> = {
  handyman: 'From urgent repairs to polished finishing work, trusted professionals handle practical home and property tasks with precision and care.',
  education: 'Unlock growth through personalized tutoring, coaching, and practical learning support designed for school, career, and lifelong development.',
  cleaning: 'Enjoy a healthier, calmer space with reliable cleaning specialists for homes, offices, and deep-clean projects.',
  petcare: 'Give your pets dependable, loving support with walkers, sitters, trainers, and grooming professionals you can trust.',
  fitness: 'Build strength, confidence, and consistency with experienced trainers and wellness specialists tailored to your goals.',
  automotive: 'Keep your vehicle road-ready with skilled technicians for maintenance, diagnostics, detailing, and repairs.',
};

const FALLBACK_SERVICE_CATEGORIES: ServiceCategoryItem[] = [
  { id: 'handyman', slug: 'handyman', name: 'Handyman', description: 'Home repair and maintenance services', longDescription: CATEGORY_LONG_DESCRIPTIONS.handyman, image: CATEGORY_IMAGE_FALLBACKS.handyman, subcategories: ['Electrician', 'Plumber', 'Carpenter', 'Painter', 'Tiler', 'Roofer'], subcategoryCount: 6 },
  { id: 'education', slug: 'education', name: 'Education', description: 'Tutoring, lessons, courses, and test prep', longDescription: CATEGORY_LONG_DESCRIPTIONS.education, image: CATEGORY_IMAGE_FALLBACKS.education, subcategories: ['Tutors', 'Test Prep', 'Language Learning', 'Online Courses'], subcategoryCount: 4 },
  { id: 'cleaning', slug: 'cleaning', name: 'Cleaning', description: 'House cleaning, office cleaning, and specialized services', longDescription: CATEGORY_LONG_DESCRIPTIONS.cleaning, image: CATEGORY_IMAGE_FALLBACKS.cleaning, subcategories: ['House Cleaning', 'Deep Cleaning', 'Office Cleaning', 'Carpet Cleaning'], subcategoryCount: 4 },
  { id: 'petcare', slug: 'petcare', name: 'Pet Care', description: 'Dog walking, grooming, sitting, and training', longDescription: CATEGORY_LONG_DESCRIPTIONS.petcare, image: CATEGORY_IMAGE_FALLBACKS.petcare, subcategories: ['Dog Walking', 'Pet Sitting', 'Pet Grooming', 'Pet Training'], subcategoryCount: 4 },
  { id: 'fitness', slug: 'fitness', name: 'Fitness', description: 'Personal trainers, coaching, wellness, and rehabilitation', longDescription: CATEGORY_LONG_DESCRIPTIONS.fitness, image: CATEGORY_IMAGE_FALLBACKS.fitness, subcategories: ['Personal Trainers', 'Wellness', 'Nutritionist', 'Massage Therapist'], subcategoryCount: 4 },
  { id: 'automotive', slug: 'automotive', name: 'Automotive', description: 'Mechanics, detailing, repairs, and maintenance', longDescription: CATEGORY_LONG_DESCRIPTIONS.automotive, image: CATEGORY_IMAGE_FALLBACKS.automotive, subcategories: ['Mobile Mechanic', 'Car Detailing', 'Tire Service', 'Battery Service'], subcategoryCount: 4 },
];

function flattenNames(nodes?: CategoryApiNode[]): string[] {
  if (!nodes || nodes.length === 0) return [];
  const names: string[] = [];
  for (const node of nodes) {
    names.push(node.name);
    names.push(...flattenNames(node.children));
  }
  return names;
}

function countDescendants(nodes?: CategoryApiNode[]): number {
  if (!nodes || nodes.length === 0) return 0;
  let total = 0;
  for (const node of nodes) {
    total += 1;
    total += countDescendants(node.children);
  }
  return total;
}

function isLikelyRenderablePhoto(url: string | null | undefined): url is string {
  if (!url) return false;
  const normalized = url.toLowerCase();
  if (normalized.endsWith('.json') || normalized.endsWith('.lottie')) return false;
  return /^https?:\/\//.test(url);
}

function fallbackForSlug(slug: string): string {
  return CATEGORY_IMAGE_FALLBACKS[slug] ?? CATEGORY_IMAGE_FALLBACKS.handyman;
}

function normalizeKey(input: string): string {
  return input.trim().toLowerCase().replace(/[^a-z0-9- ]/g, '');
}

function resolveFallbackKey(cat: CategoryApiNode): keyof typeof CATEGORY_IMAGE_FALLBACKS {
  const slug = normalizeKey(cat.slug);
  const name = normalizeKey(cat.name);

  const aliasFromSlug = CATEGORY_IMAGE_ALIASES[slug];
  if (aliasFromSlug) return aliasFromSlug;

  const slugNoDigits = slug.replace(/-\d+$/, '');
  if (CATEGORY_IMAGE_ALIASES[slugNoDigits]) return CATEGORY_IMAGE_ALIASES[slugNoDigits];

  const aliasFromName = CATEGORY_IMAGE_ALIASES[name];
  if (aliasFromName) return aliasFromName;

  if (name.includes('pet')) return 'petcare';
  if (name.includes('clean')) return 'cleaning';
  if (name.includes('fitness') || name.includes('wellness')) return 'fitness';
  if (name.includes('automotive') || name.includes('car')) return 'automotive';
  if (name.includes('education') || name.includes('tutor')) return 'education';
  if (name.includes('technology') || name.includes('it')) return 'computer';
  if (name.includes('professional')) return 'professionalservices';
  if (name.includes('personal')) return 'personalservices';
  if (name.includes('garden')) return 'gardening';
  if (name.includes('influenc')) return 'influencer';
  if (name.includes('video')) return 'videography';
  if (name.includes('photo')) return 'photography';
  if (name.includes('music')) return 'music';

  return 'handyman';
}

function mapApiCategory(cat: CategoryApiNode): ServiceCategoryItem {
  const fallbackKey = resolveFallbackKey(cat);
  // For known slugs, lock to curated legacy images to avoid poor/unrelated admin image data.
  // For unknown slugs, use websiteImageUrl first.
  const image = CATEGORY_IMAGE_FALLBACKS[fallbackKey]
    ? fallbackForSlug(fallbackKey)
    : isLikelyRenderablePhoto(cat.websiteImageUrl)
      ? cat.websiteImageUrl
      : fallbackForSlug('handyman');
  return {
    id: cat.id,
    slug: cat.slug,
    name: cat.name,
    description: cat.description?.trim() || `Trusted ${cat.name.toLowerCase()} services`,
    longDescription:
      CATEGORY_LONG_DESCRIPTIONS[cat.slug] ||
      `Explore verified ${cat.name.toLowerCase()} services through Skillance and connect with professionals suited to your needs.`,
    image,
    subcategories: flattenNames(cat.children).slice(0, 16),
    subcategoryCount: countDescendants(cat.children),
  };
}

export async function fetchServiceCategories(): Promise<ServiceCategoryItem[]> {
  try {
    const featuredRes = await get('/categories/featured').catch(() => null);
    const featuredRaw = Array.isArray(featuredRes) ? featuredRes : featuredRes?.data;
    const featured = Array.isArray(featuredRaw) ? (featuredRaw as CategoryApiNode[]) : [];
    if (featured.length > 0) {
      return featured.map(mapApiCategory);
    }

    const categoriesRes = await get('/categories');
    const categoriesRaw = Array.isArray(categoriesRes) ? categoriesRes : categoriesRes?.data;
    const categories = Array.isArray(categoriesRaw) ? (categoriesRaw as CategoryApiNode[]) : [];
    if (categories.length > 0) {
      return categories.map(mapApiCategory);
    }
  } catch {
    // Fall through to local fallback.
  }

  return FALLBACK_SERVICE_CATEGORIES;
}
