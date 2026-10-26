/** Markdown counterpart to the public homepage (`index.html`): agent-friendly, concise. */

export function estimateMarkdownTokens(markdown: string): number {
  const s = markdown.trim();
  if (!s) return 0;
  return Math.ceil(s.length / 4);
}

export const HOMEPAGE_MARKDOWN_FOR_AGENTS = `# Skillance South Africa

A South African marketplace for booking local service providers. Every provider's identity document is checked and matched to their profile photo before they can take bookings. Coming soon.

## Summary

- **Corporate structure:** Skillance (the marketplace brand) is **owned by and part of Rimitso Management Services (Pty) Ltd** (legal name: RIMITSO MANAGEMENT SERVICES (PTY) LTD), registered in South Africa.
- **Site:** https://skillance.co.za
- **Contact:** services@skillance.co.za · +27 66 220 3312

## Skillance Beyond (custom software studio)

Separate from the marketplace: **website redesigns**, **custom software**, and **SaaS** for South African businesses. Enquiries: services@skillance.co.za · https://skillance.co.za/beyond · agent mirror: https://skillance.co.za/beyond.md

## For developers

- **REST API docs (Swagger):** https://api.skillance.co.za/docs
- **API discovery:** https://skillance.co.za/.well-known/api-catalog

## Policies

Terms, privacy, refund policy, and cookie preferences are linked from the site footer and legal pages under \`/terms\`, \`/privacy-policy\`, \`/refund-policy\`, \`/cookie-policy\`.

## Social

- LinkedIn: https://www.linkedin.com/company/skillanceza/
- Instagram: https://www.instagram.com/skillanceza

---

*Interactive app experience uses client-side routing; this document summarizes the marketing homepage.*
`;
