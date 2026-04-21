/** Markdown counterpart to the public homepage (`index.html`): agent-friendly, concise. */

export function estimateMarkdownTokens(markdown: string): number {
  const s = markdown.trim();
  if (!s) return 0;
  return Math.ceil(s.length / 4);
}

export const HOMEPAGE_MARKDOWN_FOR_AGENTS = `# Skillance South Africa

South Africa's freelancer marketplace connecting customers with verified professionals across trades and services.

## Summary

- **Organization:** Skillance (Skillance South Africa)
- **Site:** https://skillance.co.za
- **Contact:** services@skillance.co.za · +27 66 220 3312

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
