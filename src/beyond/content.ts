/**
 * Copy for Beyond the App.
 *
 * TODO(beyond): Replace every placeholder marked below when Markus supplies real content.
 * Do not invent clients, case studies, testimonials, stats, prices, team members, or certifications.
 */

export const BEYOND_EMAIL = 'services@skillance.co.za';

/** TODO(beyond): Confirm this inbox. services@ is the published partnerships address. */
export const ENQUIRY_MAILTO =
  'mailto:services@skillance.co.za?subject=Project%20enquiry%20%E2%80%94%20Beyond%20the%20App&body=What%20do%20you%20want%20to%20build%3F%0A%0AWho%20is%20it%20for%3F%0A%0AAny%20timing%20you%20already%20know%3A%0A';

export const SITE = 'https://skillance.co.za';

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
    title: 'Beyond the App | Custom software by Skillance',
    description:
      'Skillance designs and builds SaaS products, web and mobile apps, cloud-hosted systems, and secure integrations in South Africa. A studio practice alongside the Skillance marketplace.',
    path: '/beyond',
    crumb: 'Beyond the App',
  },
  services: {
    title: 'Services | Beyond the App · Skillance',
    description:
      'Custom web apps, mobile apps, business systems, and integrations from the Skillance team in South Africa. Scope is agreed per project.',
    path: '/beyond/services',
    crumb: 'Services',
  },
  approach: {
    title: 'How we work | Beyond the App · Skillance',
    description:
      'How a Skillance custom-software project runs: discovery, design, build, launch, and support. Includes the stack behind the Skillance marketplace.',
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
  { to: '/beyond/services', label: 'Services', end: false },
  { to: '/beyond/approach', label: 'Approach', end: false },
  { to: '/beyond/work', label: 'Work', end: false },
  { to: '/beyond/contact', label: 'Contact', end: false },
] as const;

export const SERVICES = [
  {
    id: 'web',
    num: '01',
    title: 'Web apps',
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
] as const;

export const HOME_STORY = {
  kicker: 'Our story',
  title: 'We built Skillance for ourselves first.',
  paragraphs: [
    'Skillance started as a product we wanted in the world: a marketplace where customers can book ID-verified local providers, and where freelancers can run a real business from their phone.',
    'We designed, built, and still operate that platform on web, iOS, and Android. Beyond the App is where we take the same discipline to software for other businesses.',
  ],
} as const;

export const SKILLANCE_CASE_STUDY = {
  title: 'Skillance marketplace',
  lede:
    'Our own SaaS product: React and TypeScript on the web, Flutter on iOS and Android, and the APIs and cloud infrastructure behind bookings, identity, and payouts.',
  points: [
    'Customers discover providers, book jobs, and pay through one product.',
    'Freelancers manage profiles, jobs, messages, and payouts in the same system.',
    'We live with every architectural decision because we operate it every day.',
  ],
} as const;

export const STEPS = [
  {
    num: '01',
    title: 'Discovery',
    summary: 'The problem, the people, and the constraints.',
    body: 'We start with the problem, the people who have it, and the constraints: time, existing systems, and what done looks like. You should leave this stage knowing whether we are the right team.',
  },
  {
    num: '02',
    title: 'Design',
    summary: 'Flows and interface, before the build goes wide.',
    body: 'We shape the flows and the interface before implementation spreads out, so we are making the same thing. You see the direction while it is still cheap to change.',
  },
  {
    num: '03',
    title: 'Build',
    summary: 'Working software, in iterations you can try.',
    body: 'We implement in iterations you can try, and we adjust from what you see working. The stack follows the problem. Skillance’s own platform is React and TypeScript on the web, and Flutter on mobile.',
  },
  {
    num: '04',
    title: 'Launch',
    summary: 'Release, handover, and a product you can run.',
    body: 'We release it, hand over what you need to operate it, and stay through the launch itself. Access, environments, and who owns what afterwards are part of that handover.',
  },
  {
    num: '05',
    title: 'Support',
    summary: 'After launch, only if we agree to keep going.',
    body: 'Ongoing support is agreed separately when you want us to stay on after launch. Scope, response times, and cost are written into that agreement.',
  },
] as const;

/** Technologies we can name because they are already public in the Skillance platform. */
export const TECH = [
  {
    name: 'React and TypeScript',
    note: 'The Skillance web app, including this site.',
  },
  {
    name: 'Vite',
    note: 'How that web app is built and shipped.',
  },
  {
    name: 'Flutter',
    note: 'The Skillance apps for customers and freelancers, on iOS and Android.',
  },
  {
    name: 'Cloud hosting and APIs',
    note: 'How we run the marketplace API, data stores, and client environments in production.',
  },
] as const;

export const FAQS: readonly BeyondFaq[] = [
  {
    question: 'What is Beyond the App?',
    answer:
      'Beyond the App is Skillance’s studio practice. We design and build custom software for clients: SaaS products, web and mobile apps, cloud-hosted systems, and secure integrations. It sits alongside the Skillance marketplace and is run by the same team in South Africa.',
  },
  {
    question: 'How is this different from booking someone on the marketplace?',
    answer:
      'The marketplace is where a customer books an independent, ID-verified provider for a job. Beyond the App is where the Skillance team designs and builds a custom product for a client. They are separate ways to work with Skillance.',
  },
  {
    question: 'What can you build?',
    answer:
      'SaaS products, web and mobile apps, business systems, cloud operations, and integrations, including security and access control. If you are unsure which of those you need, start with the problem and we will say whether we are the right team.',
  },
  {
    question: 'How does a project start?',
    answer:
      'Email services@skillance.co.za with what you want to build and who it is for. We reply from that inbox and keep the conversation between us.',
  },
  {
    question: 'Do you publish prices or timelines?',
    answer:
      'We do not publish prices or a standard timeline. Cost and timing follow the work, and we discuss them after we understand it.',
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
  title: 'The same team behind the product',
  body:
    'Beyond the App is run by the Skillance team in South Africa: the people who ship and support the marketplace. You work directly with the builders, not a hand-off account layer.',
} as const;

export const SOCIAL = [
  { label: 'Instagram', href: 'https://www.instagram.com/skillanceza/' },
  { label: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61586337693441#' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/skillanceza/?viewAsMember=true' },
] as const;
