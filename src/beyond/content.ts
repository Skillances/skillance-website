/**
 * Copy for Beyond the App.
 *
 * TODO(beyond): Replace every placeholder marked below when Markus supplies real content.
 * Do not invent clients, case studies, testimonials, stats, prices, team members, or certifications.
 */

import { BEYOND_COMMERCIAL, beyondFixedPriceLine } from '@/constants/beyondCommercial';

export const BEYOND_EMAIL = 'services@skillance.co.za';

export const BEYOND_SIGNPOST = {
  prompt: 'Looking to hire a local plumber, cleaner, or other service professional?',
  linkLabel: 'Go to the Skillance marketplace',
  stripPrompt: 'Need a plumber, cleaner, or pro near you?',
  stripCta: 'Skillance marketplace',
  href: '/',
} as const;

export const BEYOND_FOOTER_TAGLINE =
  'We design and build your website or software for you — from a free demo to a fixed price to launch.';

export const BEYOND_PROCESS_HOME = {
  kicker: 'Process',
  title: 'Demo → quote → build → launch.',
  lede: 'Our team does the work; you approve each step.',
} as const;

/** TODO(beyond): Confirm this inbox. services@ is the published partnerships address. */
export const ENQUIRY_MAILTO =
  'mailto:services@skillance.co.za?subject=Project%20enquiry%20%E2%80%94%20Beyond%20the%20App&body=What%20do%20you%20want%20to%20build%3F%0A%0AWho%20is%20it%20for%3F%0A%0AAny%20timing%20you%20already%20know%3A%0A';

export const SITE = 'https://skillance.co.za';

/** Secondary steer from Beyond studio surfaces to the marketplace product. */
export const MARKETPLACE_ENTRY = {
  label: 'Book a provider on Skillance',
  href: '/',
} as const;

/** Fixed attention strip on Beyond routes (parallel to marketing launch strip). */
export const BEYOND_ATTENTION_BANNER = {
  message: 'Custom software by the Skillance team',
  href: '/beyond/work',
  linkLabel: 'Our work',
} as const;

export type BeyondFaq = { question: string; answer: string };

export type BeyondPageMeta = {
  title: string;
  description: string;
  path: string;
  crumb: string;
  noindex?: boolean;
  faqs?: readonly BeyondFaq[];
};

export const PAGES = {
  home: {
    title: 'Skillance Beyond | Custom software studio · South Africa',
    description:
      'Skillance Beyond is the custom software studio behind Skillance: web and mobile apps, SaaS, cloud systems, and integrations for South African businesses. Beyond the App sits alongside the Skillance marketplace.',
    path: '/beyond',
    crumb: 'Skillance Beyond',
  },
  services: {
    title: 'What we build | Beyond the App · Skillance',
    description:
      'Website redesigns for South African small businesses, plus custom web apps, mobile apps, business systems, and integrations. Fixed quotes after a free demo.',
    path: '/beyond/services',
    crumb: 'What we build',
  },
  approach: {
    title: 'How a Beyond project runs | Beyond the App · Skillance',
    description:
      'Free demo, fixed quote, build with two revision rounds, your sign-off before launch, optional care plans. Done-for-you websites and scoped custom software.',
    path: '/beyond/approach',
    crumb: 'Approach',
  },
  work: {
    title: 'Work | Beyond the App · Skillance',
    description:
      'How Skillance built its own marketplace on web and mobile, and published client work when it is ready to share.',
    path: '/beyond/work',
    crumb: 'Work',
  },
  contact: {
    title: 'Start a project | Beyond the App · Skillance',
    description:
      'Email services@skillance.co.za about a custom software project. Tell us what you want to build and who it is for.',
    path: '/beyond/contact',
    crumb: 'Contact',
  },
  beyondTerms: {
    title: 'Beyond service terms | Beyond the App · Skillance',
    description:
      'Service terms for Skillance Beyond the App custom software and website projects in South Africa. Each project also has a signed proposal.',
    path: '/beyond/terms',
    crumb: 'Service terms',
  },
  beyondDataProcessing: {
    title: 'Client data processing | Beyond the App · Skillance',
    description:
      'How Skillance Beyond the App acts as operator when building or maintaining client websites and software under POPIA.',
    path: '/beyond/data-processing',
    crumb: 'Data processing',
  },
  notFound: {
    title: 'Page not found | Beyond the App · Skillance',
    description: 'That page is not part of Skillance Beyond the App.',
    path: '/beyond',
    crumb: 'Not found',
    noindex: true,
  },
} as const satisfies Record<string, BeyondPageMeta>;

export const NAV = [
  { to: '/beyond', label: 'Overview', end: true },
  { to: '/beyond/services', label: 'What we build', end: false },
  { to: '/beyond/approach', label: 'Approach', end: false },
  { to: '/beyond/work', label: 'Work', end: false },
  { to: '/beyond/contact', label: 'Contact', end: false },
] as const;

export const SERVICES = [
  {
    id: 'web',
    num: '01',
    title: 'Web apps',
    imageWebp: '/beyond/new/web-apps.webp',
    hero: 'SaaS products and tools people use in a browser.',
    summary:
      'Customer-facing SaaS, portals, and internal tools with accounts, roles, billing, and real workflows.',
    body: 'We design and build browser-based software: subscription products, the app your customers sign in to, or the tool your own team uses. The public example is the Skillance marketplace web app, written in React and TypeScript and hosted on cloud infrastructure we operate.',
    points: [
      'Who uses it, and what they need to finish',
      'What it has to connect to',
      'What must be true on day one, and what can wait',
    ],
  },
  {
    id: 'mobile',
    num: '02',
    title: 'Mobile apps',
    imageWebp: '/beyond/new/mobile-apps.webp',
    hero: 'iOS and Android, shaped around the job.',
    summary: 'Apps for phones and tablets, including the kind of product Skillance already ships for its own marketplace.',
    body: 'We design and build mobile apps. Skillance’s own customer and freelancer apps are written in Flutter and shipped to iOS and Android. A new project uses the approach that fits that product, agreed before the build.',
    points: [
      'What people need to do away from a desk',
      'How it stays in step with the web product, if there is one',
      'Which stores it has to ship to',
    ],
  },
  {
    id: 'systems',
    num: '03',
    title: 'Business systems',
    imageWebp: '/beyond/new/business-systems.webp',
    hero: 'The software a company actually runs on.',
    summary: 'Workflows, records, and admin tools for the people who keep the business moving.',
    body: 'Some software is not a public app. It is how a business runs: records, handoffs, admin screens, and the day-to-day work that outgrows a spreadsheet. We build that kind of system when you can describe the work clearly.',
    points: [
      'The job the system replaces or shortens',
      'Who is allowed to see and change what',
      'How people are trained onto it at launch',
    ],
  },
  {
    id: 'integrations',
    num: '04',
    title: 'Integrations',
    imageWebp: '/beyond/new/integrations.webp',
    hero: 'Cloud, APIs, and the systems you already use.',
    summary:
      'Hosting, observability, payments, sign-in, messaging, and the integrations a product needs in production.',
    body: 'Products rarely stand alone. We connect them to cloud platforms, APIs, payments, sign-in, messaging, and the other systems a business already relies on. Security, access control, and how environments are run are part of the work, and named in that project’s proposal.',
    points: [
      'Which existing systems have to stay',
      'What data is allowed to move, and what is not',
      'What happens when a connection fails',
    ],
  },
  {
    id: 'websites',
    num: '05',
    title: 'Website redesigns for small businesses',
    imageWebp: '/beyond/new/web-apps.webp',
    hero: 'Fast, credible sites for trades and local services.',
    summary:
      'Redesigns and rebuilds for plumbers, dentists, guest houses, electricians, and similar South African small businesses.',
    body:
      'We design and build marketing websites that work on phones: clear calls to action, WhatsApp and booking paths, and hosting on modern edge infrastructure (Cloudflare Pages) with optional forms (Formspree), cookieless analytics, email setup (Google Workspace or Zoho), and care plans after launch. Beyond acts as operator for visitor data on client sites under a written agreement.',
    points: [
      'What a visitor should do on the site (call, WhatsApp, enquiry form, email)',
      'Which registrations or gradings you may show (PIRB, DoEL, TGCSA, HPCSA rules)',
      'What content and photos you already have versus what we must create',
    ],
  },
] as const;

export const HOME_HERO_ROTATE_WORDS = ['web apps', 'mobile apps', 'business systems'] as const;

export const HOME_HERO = {
  rotatePrefix: 'We build',
  rotateSuffix: 'for South African businesses.',
  lede:
    'Done-for-you websites and custom software. Start with a free demo of your own site, then a fixed price in writing.',
} as const;

export const BEYOND_ABOUT = {
  kicker: 'About',
  title: 'The Skillance studio.',
  paragraphs: [
    'Beyond the App is custom software and websites from Skillance (Rimitso Management Services, Krugersdorp). POPIA-ready builds; your domain, content, and code stay yours.',
  ],
  /** Shown only when filled in src/constants/beyondLegal.ts (no invented stats). */
  optionalTailFromLegal: true,
} as const;

export const WEBSITE_SECTOR_COMPLIANCE = {
  title: 'Built for your industry\'s rules',
  body:
    'Dental and medical sites follow HPCSA advertising rules — no patient testimonials, no superiority claims, and booking forms that never ask for medical details. Plumbing sites show PIRB registration and CoC information only when you are registered. Electrical sites show your Department of Employment and Labour contractor registration (and ECA membership if applicable). Guest-house sites show TGCSA grading only while it is current. Every site ships with a POPIA privacy notice, ECT Act business disclosures, and a link to your PAIA manual.',
} as const;

export const HOME_STORY = {
  kicker: 'Our story',
  title: 'We ship our own product first.',
  lead:
    'Skillance is the marketplace we run every day on web, iOS, and Android. Beyond is the same team building software and sites for other businesses.',
  body: '',
} as const;

export const SKILLANCE_CASE_STUDY = {
  title: 'Skillance marketplace',
  lede: 'React, TypeScript, Flutter, and the APIs behind bookings and payouts.',
  points: [
    'Customers discover providers, book jobs, and pay through one product.',
    'Freelancers manage profiles, jobs, messages, and payouts in the same system.',
    'We live with every architectural decision because we operate it every day.',
  ],
  /** Home proof bento — lead phrase + remainder of each point (no new claims). */
  bentoPoints: [
    { lead: 'Customers', text: 'book and pay in one app.' },
    { lead: 'Freelancers', text: 'run jobs, chat, and payouts.' },
    { lead: 'Same team', text: 'operates what we architect.' },
  ],
  stackTags: ['React', 'TypeScript', 'Flutter', 'APIs & cloud'] as const,
  stackLine: 'Built with React, TypeScript, Flutter and our own APIs & cloud',
  marketplaceCta: { label: 'See the marketplace', href: '/' },
} as const;

/** Home proof band imagery (editorial device shots; no fabricated UI copy on screen). */
export const BEYOND_PROOF_IMAGES = {
  homeStory: {
    jpgSrc: '/beyond/home-story-devices.jpg',
    alt: 'Laptop and phone showing the Skillance product we built on web and mobile',
  },
  /** Layered accent in the home story block (device detail crop). */
  homeStoryAccent: {
    jpgSrc: '/beyond/platform-devices.jpg',
    alt: 'Skillance product on web and mobile',
  },
  marketplaceCaseStudy: {
    jpgSrc: '/beyond/case-study-marketplace.jpg',
    webpSrc: '/beyond/case-study-marketplace.webp',
    alt: 'Skillance team reviewing marketplace product work at a desk, editorial photograph',
    width: 1152,
    height: 864,
  },
} as const;

export const STEPS = [
  {
    num: '01',
    title: 'Demo',
    iconSrc: '/beyond/new/icons/icon_discovery.png',
    summary: 'Free demo of your own site — no cost, no obligation.',
    body:
      'We review your current website (or your brief if you are starting fresh) and build a free concept of how it could look and work on phones. There is no charge and no obligation to proceed.',
  },
  {
    num: '02',
    title: 'Quote',
    iconSrc: '/beyond/new/icons/icon_design.png',
    summary: 'A fixed price in writing, with scope spelled out.',
    body: `You choose a tier with a ${beyondFixedPriceLine()}. Scope, deliverables, and the VAT-inclusive total are in your quote. Payment is ${BEYOND_COMMERCIAL.paymentSplit}. Bigger custom software (SaaS, mobile apps) is scoped separately in a written proposal.`,
  },
  {
    num: '03',
    title: 'Build',
    iconSrc: '/beyond/new/icons/icon_build.png',
    summary: `We build; you get ${BEYOND_COMMERCIAL.revisionRounds} rounds of revisions.`,
    body: `We build the site and send it for review. You get ${BEYOND_COMMERCIAL.revisionRounds} structured revision rounds. We ask for ${BEYOND_COMMERCIAL.clientInputsList} and aim to finish in about ${BEYOND_COMMERCIAL.turnaroundWorkingDays} working days once we have them.`,
  },
  {
    num: '04',
    title: 'Launch',
    iconSrc: '/beyond/new/icons/icon_launch.png',
    summary: 'Your sign-off before anything goes live.',
    body: `Nothing goes live without your written approval. ${BEYOND_COMMERCIAL.hostingSummary}. You keep ownership of your domain. We leave your email as-is unless you ask us to move it (R${BEYOND_COMMERCIAL.emailMoveExVatZar} ex VAT). We sign a POPIA operator agreement for personal information your site collects, with consent on forms and links to your privacy notice and PAIA manual.`,
  },
  {
    num: '05',
    title: 'Care',
    iconSrc: '/beyond/new/icons/icon_support.png',
    summary: 'Optional care plans — or take the site and run it yourself.',
    body: `After launch you can choose a care plan for updates and upkeep (${BEYOND_COMMERCIAL.carePlanSummary}). You can also take the code and run the site yourself — it stays yours. Care plan details are in Beyond service terms.`,
  },
] as const;

export const BEYOND_CUSTOM_SOFTWARE_NOTE =
  'Larger SaaS products, mobile apps, and internal systems follow the same honesty: demo or discovery first, then a written proposal with scope and price — not the fixed website tiers alone.';

/** Technologies we can name because they are already public in the Skillance platform. */
export const TECH = [
  {
    name: 'React and TypeScript',
    note: 'Custom web apps and the Skillance marketplace web product.',
  },
  {
    name: 'Vite',
    note: 'How we build and ship modern web front ends.',
  },
  {
    name: 'Flutter',
    note: 'Mobile apps when a project needs iOS and Android.',
  },
  {
    name: 'Cloudflare Pages',
    note: 'Standard hosting for client marketing sites — R0 monthly hosting from us.',
  },
  {
    name: 'APIs and cloud',
    note: 'Named in your proposal when a product needs payments, sign-in, messaging, or integrations.',
  },
] as const;

export const FAQS: readonly BeyondFaq[] = [
  {
    question: 'What is Beyond the App?',
    answer:
      'Beyond the App is Skillance’s done-for-you studio: we design and build your website or custom software. You work with our team directly — not through the marketplace app.',
  },
  {
    question: 'What can you build?',
    answer:
      'Website redesigns for South African small businesses (trades, guest houses, dental practices, and similar), plus SaaS products, web and mobile apps, business systems, and integrations when scoped in a proposal.',
  },
  {
    question: 'How does a website project start?',
    answer:
      'Email services@skillance.co.za or use Start a project. We begin with a free demo concept of your own site. There is no fee until you accept a written fixed quote.',
  },
  {
    question: 'Do you publish prices?',
    answer: `Yes for websites: every quote is a ${beyondFixedPriceLine()} after the free demo. Timelines depend on tier and how quickly you supply ${BEYOND_COMMERCIAL.clientInputsList}. Larger custom software is scoped separately.`,
  },
  {
    question: 'Where are you based?',
    answer:
      'South Africa. Skillance is owned by and part of Rimitso Management Services (Pty) Ltd. The registered office is 6 DWARS STREET, KRUGERSDORP, KRUGERSDORP, GAUTENG, 1739.',
  },
  {
    question: 'Can you show client work?',
    answer:
      'The Work page leads with how we built Skillance. When client pieces are ready to share publicly, they are listed there too.',
  },
];

export const OWN_PLATFORM = {
  kicker: 'Built by us',
  title: 'Skillance marketplace',
  body:
    'We designed and built the Skillance marketplace as a cloud-hosted product: the web app, Flutter apps for customers and freelancers on iOS and Android, and the integrations behind bookings, identity, and payouts. It is our own product, which means we live with every decision we made building it.',
} as const;

export const FOUNDER = {
  kicker: 'Who you will work with',
  title: 'The builders, not an account layer',
  body:
    'Beyond the App is run by the Skillance engineering team in South Africa. Enquiries stay in services@skillance.co.za; POPIA queries go through our Information Officer and privacy notice.',
} as const;

export const SOCIAL = [
  { label: 'Instagram', href: 'https://www.instagram.com/skillanceza/' },
  { label: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61586337693441#' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/skillanceza/?viewAsMember=true' },
] as const;
