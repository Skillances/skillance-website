import { useEffect } from 'react';
import { trackBeyond } from '@/beyond/analytics';
import { SITE, type BeyondPageMeta } from '@/beyond/content';

const THEME_COLOR = '#F3EEE6';
const KEYWORDS =
  'Skillance Beyond, Skillance Beyond the App, Beyond the App, Skillance custom software, custom software South Africa, web apps, mobile apps, business systems, software integrations, Rimitso Management Services';

const SERVICE_DESCRIPTION =
  'Skillance Beyond designs and builds website redesigns, custom web apps, mobile apps, business systems, and integrations for South African businesses. The studio sits alongside the Skillance marketplace.';

const MARKDOWN_MIRROR_BY_PATH: Partial<Record<string, string>> = {
  '/beyond': `${SITE}/beyond.md`,
  '/beyond/services': `${SITE}/beyond-services.md`,
  '/beyond/approach': `${SITE}/beyond-approach.md`,
  '/beyond/work': `${SITE}/beyond-work.md`,
  '/beyond/contact': `${SITE}/beyond-contact.md`,
};

function read(selector: string, attr: 'content' | 'href') {
  return document.head.querySelector(selector)?.getAttribute(attr) ?? null;
}

function write(selector: string, attr: 'content' | 'href', value: string) {
  document.head.querySelector(selector)?.setAttribute(attr, value);
}

function upsertMarkdownAlternate(href: string | null) {
  let el = document.querySelector('link[rel="alternate"][type="text/markdown"]#beyond-md-alternate');
  if (!href) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement('link');
    el.id = 'beyond-md-alternate';
    el.setAttribute('rel', 'alternate');
    el.setAttribute('type', 'text/markdown');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function upsertJsonLd(json: string) {
  let el = document.getElementById('beyond-jsonld');
  if (!el) {
    el = document.createElement('script');
    el.id = 'beyond-jsonld';
    el.setAttribute('type', 'application/ld+json');
    document.head.appendChild(el);
  }
  el.textContent = json;
}

function jsonLd(meta: BeyondPageMeta) {
  const url = `${SITE}${meta.path}`;
  const crumbs = [
    { name: 'Skillance', item: `${SITE}/` },
    { name: 'Skillance Beyond', item: `${SITE}/beyond` },
  ];
  if (meta.path !== '/beyond') crumbs.push({ name: meta.crumb, item: url });

  const graph: Record<string, unknown>[] = [
    {
      '@type': 'WebPage',
      '@id': `${url}#webpage`,
      url,
      name: meta.title,
      description: meta.description,
      inLanguage: 'en-ZA',
      isPartOf: { '@id': `${SITE}/#website` },
      about: { '@id': `${SITE}/beyond#service` },
    },
    {
      '@type': 'ProfessionalService',
      '@id': `${SITE}/beyond#service`,
      name: 'Skillance Beyond',
      alternateName: ['Skillance Beyond the App', 'Beyond the App'],
      url: `${SITE}/beyond`,
      description: SERVICE_DESCRIPTION,
      email: 'services@skillance.co.za',
      provider: { '@id': `${SITE}/#organization` },
      areaServed: { '@type': 'Country', name: 'South Africa' },
      knowsAbout: ['Custom web applications', 'Mobile applications', 'Business systems', 'Software integrations'],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: crumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: crumb.item,
      })),
    },
  ];

  if (meta.faqs && meta.faqs.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${url}#faq`,
      url,
      mainEntity: meta.faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: { '@type': 'Answer', text: faq.answer },
      })),
    });
  }

  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
}

/**
 * Sets the document title, description, canonical, and social tags for one Beyond page,
 * then restores the marketplace defaults when the page unmounts.
 *
 * TODO(beyond): Dedicated Open Graph image. These pages keep the marketplace app icon until one exists.
 */
export function useBeyondPage(meta: BeyondPageMeta) {
  const { title, description, path, crumb, noindex = false, faqs } = meta;

  useEffect(() => {
    const previous = {
      title: document.title,
      description: read('meta[name="description"]', 'content'),
      metaTitle: read('meta[name="title"]', 'content'),
      keywords: read('meta[name="keywords"]', 'content'),
      robots: read('meta[name="robots"]', 'content'),
      ogTitle: read('meta[property="og:title"]', 'content'),
      ogDescription: read('meta[property="og:description"]', 'content'),
      ogUrl: read('meta[property="og:url"]', 'content'),
      twitterTitle: read('meta[name="twitter:title"]', 'content'),
      twitterDescription: read('meta[name="twitter:description"]', 'content'),
      twitterUrl: read('meta[name="twitter:url"]', 'content'),
      themeColor: read('meta[name="theme-color"]', 'content'),
      canonical: read('link[rel="canonical"]', 'href'),
    };

    const url = `${SITE}${path}`;
    document.title = title;
    write('meta[name="description"]', 'content', description);
    write('meta[name="title"]', 'content', title);
    write('meta[name="keywords"]', 'content', KEYWORDS);
    write('meta[name="robots"]', 'content', noindex ? 'noindex, follow' : 'index, follow');
    write('meta[property="og:title"]', 'content', title);
    write('meta[property="og:description"]', 'content', description);
    write('meta[property="og:url"]', 'content', url);
    write('meta[name="twitter:title"]', 'content', title);
    write('meta[name="twitter:description"]', 'content', description);
    write('meta[name="twitter:url"]', 'content', url);
    write('meta[name="theme-color"]', 'content', THEME_COLOR);
    write('link[rel="canonical"]', 'href', url);
    upsertMarkdownAlternate(MARKDOWN_MIRROR_BY_PATH[path] ?? null);
    if (!noindex) upsertJsonLd(jsonLd({ title, description, path, crumb, noindex, faqs }));

    trackBeyond('beyond_view', {
      beyond_page_path: path,
      beyond_page_title: title,
    });

    return () => {
      document.title = previous.title;
      if (previous.description != null) write('meta[name="description"]', 'content', previous.description);
      if (previous.metaTitle != null) write('meta[name="title"]', 'content', previous.metaTitle);
      if (previous.keywords != null) write('meta[name="keywords"]', 'content', previous.keywords);
      if (previous.robots != null) write('meta[name="robots"]', 'content', previous.robots);
      if (previous.ogTitle != null) write('meta[property="og:title"]', 'content', previous.ogTitle);
      if (previous.ogDescription != null) write('meta[property="og:description"]', 'content', previous.ogDescription);
      if (previous.ogUrl != null) write('meta[property="og:url"]', 'content', previous.ogUrl);
      if (previous.twitterTitle != null) write('meta[name="twitter:title"]', 'content', previous.twitterTitle);
      if (previous.twitterDescription != null) write('meta[name="twitter:description"]', 'content', previous.twitterDescription);
      if (previous.twitterUrl != null) write('meta[name="twitter:url"]', 'content', previous.twitterUrl);
      if (previous.themeColor != null) write('meta[name="theme-color"]', 'content', previous.themeColor);
      if (previous.canonical != null) write('link[rel="canonical"]', 'href', previous.canonical);
      document.getElementById('beyond-jsonld')?.remove();
      upsertMarkdownAlternate(null);
    };
  }, [title, description, path, crumb, noindex, faqs]);
}
