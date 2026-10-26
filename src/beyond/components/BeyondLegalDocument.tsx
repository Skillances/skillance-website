import type { ReactNode } from 'react';

export function BeyondLegalDocument({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <article className="by-wrap by-legal-doc">
      <header className="by-legal-doc-head">
        <h1 className="by-legal-doc-title">{title}</h1>
        <p className="by-legal-doc-updated">Last updated: {updated}</p>
      </header>
      <div className="by-legal-doc-body">{children}</div>
    </article>
  );
}

export function BeyondLegalSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="by-legal-section" aria-labelledby={id}>
      <h2 id={id} className="by-legal-section-title">
        {title}
      </h2>
      {children}
    </section>
  );
}
