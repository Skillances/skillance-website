/** Agent markdown for /beyond routes. Keep in sync with public/beyond*.md mirrors. */

export const BEYOND_OVERVIEW_MARKDOWN = `# Skillance Beyond (custom software studio)

> Done-for-you **website redesigns**, **custom software**, and **SaaS** for South African businesses. Hire the studio at **services@skillance.co.za**, not through the marketplace app.

Canonical: https://skillance.co.za/beyond · Plain-text mirror: https://skillance.co.za/beyond.md

Also known as: Skillance Beyond, Beyond the App.

## Marketplace vs Beyond

- **Marketplace** (https://skillance.co.za/): book local providers. Support: support@skillance.co.za
- **Beyond** (https://skillance.co.za/beyond): websites and custom software for businesses. Enquiries: services@skillance.co.za

## What we build

Website redesigns for SA small businesses; custom software; SaaS; mobile apps; integrations. Details: https://skillance.co.za/beyond-services.md

## Process

Free site demo → fixed written quote → build → launch. https://skillance.co.za/beyond-approach.md

## Work

In-house Skillance marketplace case study + published client work when available. https://skillance.co.za/beyond-work.md

*Interactive UI uses client-side routing; prefer this document or /beyond.md for ingestion.*
`;

const BEYOND_PATH_MARKDOWN: Record<string, string> = {
  '/beyond': BEYOND_OVERVIEW_MARKDOWN,
  '/beyond/': BEYOND_OVERVIEW_MARKDOWN,
};

export function beyondMarkdownForPath(pathname: string): string | null {
  return BEYOND_PATH_MARKDOWN[pathname] ?? null;
}

export function isBeyondDocumentPath(pathname: string): boolean {
  return pathname === '/beyond' || pathname === '/beyond/';
}
