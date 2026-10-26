declare global {
  interface Window {
    SkillanceIcons?: {
      mount: (root?: ParentNode | Document) => void;
      names: string[];
    };
  }
}

let loadPromise: Promise<void> | null = null;

/** Load the dependency-free animated icon script once. */
export function loadSkillanceIconsScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.resolve();
  }
  if (window.SkillanceIcons) {
    return Promise.resolve();
  }
  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-sk-icons-script]');
    if (existing) {
      if (window.SkillanceIcons) {
        resolve();
        return;
      }
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Skillance icons script failed')), {
        once: true,
      });
      return;
    }

    const script = document.createElement('script');
    script.src = '/animated-icons/skillance-icons.js';
    script.async = true;
    script.dataset.skIconsScript = '1';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Skillance icons script failed'));
    document.head.appendChild(script);
  });

  return loadPromise;
}

/** Map marketplace category slug to animated icon pack id. */
export function categorySlugToSkIcon(categorySlug: string): string {
  const key = categorySlug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '');
  const aliases: Record<string, string> = {
    computer: 'technology',
    it: 'technology',
    technologyit: 'technology',
    influencer: 'influencing',
    influencing: 'influencing',
    petcare: 'pet_care',
    personalservices: 'personal_services',
    professionalservices: 'professional_services',
  };
  return aliases[key] ?? key;
}

function resolvePackIconId(requestedId: string): string {
  const names = window.SkillanceIcons?.names;
  if (!names?.length) {
    return requestedId;
  }
  if (names.includes(requestedId)) {
    return requestedId;
  }
  const handyman = 'handyman';
  if (names.includes(handyman)) {
    return handyman;
  }
  return names[0] ?? requestedId;
}

/** Inject SVG markup for one icon (no duplicate mount listeners). */
export async function injectSkillanceIconSvg(host: HTMLElement, iconId: string): Promise<boolean> {
  await loadSkillanceIconsScript();
  const mount = window.SkillanceIcons?.mount;
  if (!mount) {
    return false;
  }

  const packId = resolvePackIconId(iconId);

  const sandbox = document.createElement('div');
  const placeholder = document.createElement('span');
  placeholder.setAttribute('data-sk-icon', packId);
  sandbox.appendChild(placeholder);
  mount(sandbox);

  const mounted = sandbox.querySelector<HTMLElement>('[data-sk-ready]');
  if (!mounted) {
    return false;
  }

  host.innerHTML = mounted.innerHTML;
  host.setAttribute('data-sk-icon', packId);
  host.setAttribute('data-sk-ready', '1');
  host.classList.add('sk-icon');
  return true;
}

export function playSkillanceIcon(host: HTMLElement | null): void {
  if (!host) return;
  host.classList.remove('sk-play');
  void host.offsetWidth;
  host.classList.add('sk-play');
}
