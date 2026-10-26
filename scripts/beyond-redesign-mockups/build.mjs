// Generates the 20 mock-up pages in pages/ from examples.mjs. Run by render.sh.
import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { examples, PHONE } from './examples.mjs';

const ROOT = dirname(fileURLToPath(import.meta.url));
const PAGES = join(ROOT, 'pages');
mkdirSync(PAGES, { recursive: true });
for (const f of readdirSync(PAGES)) rmSync(join(PAGES, f));

const missing = [];

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
}

/** An <img> when the Higgsfield file exists, otherwise a labelled placeholder. */
function slot(ex, key, cls) {
  const name = `example-${ex.id}-${key}.jpg`;
  if (existsSync(join(ROOT, 'assets', 'generated', name))) {
    return `<img class="${cls}" src="../assets/generated/${name}" alt="" />`;
  }
  missing.push(name);
  return `<div class="${cls} ph"><span>${name}</span></div>`;
}

function vars(t) {
  return `--bg:${t.bg};--ink:${t.ink};--brand:${t.brand};--accent:${t.accent};--on-accent:${t.onAccent};--dark:${t.dark};--hf:${t.hf};--bf:${t.bf};`;
}

function after(ex, device) {
  const m = device === 'mobile';
  const panel = ex.panel
    ? `<aside class="panel"><p class="panel-k">${esc(ex.panel.kicker)}</p><p class="panel-big">${esc(ex.panel.big)}</p>${ex.panel.lines.map((l) => `<p class="panel-l">${esc(l)}</p>`).join('')}</aside>`
    : '';
  const cards = ex.services
    .map(
      (s) => `<article class="card">${slot(ex, s.img, 'card-img')}<div class="card-body"><h3>${esc(s.t)}</h3><p>${esc(s.d)}</p>${s.cta ? `<a class="btn btn-ghost">${esc(s.cta)}</a>` : ''}</div></article>`,
    )
    .join('');
  const trust = ex.trust.map(([b, s]) => `<div><strong>${esc(b)}</strong><span>${esc(s)}</span></div>`).join('');
  const nav = m ? '' : `<nav>${ex.nav.map((n) => `<span>${esc(n)}</span>`).join('')}</nav>`;
  const cta = m ? 'Call' : `Call ${PHONE}`;
  return `<body class="after ${device} layout-${ex.layout}" style="${vars(ex.theme)}">
<header class="bar"><div class="logo"><span class="mark">${ex.mark}</span><span class="logo-t">${esc(ex.short)}<small>${esc(ex.sub)}</small></span></div>${nav}<a class="btn btn-accent">${cta}</a></header>
<section class="hero">
  ${slot(ex, 'hero', 'hero-img')}
  <div class="hero-copy">
    <p class="kicker">${esc(ex.kicker)}</p>
    <h1>${esc(ex.headline)}</h1>
    <p class="dek">${esc(ex.dek)}</p>
    <div class="actions"><a class="btn btn-accent">${esc(ex.primary)}</a><a class="btn btn-light">${esc(ex.secondary)}</a></div>
  </div>
  ${panel}
</section>
<section class="trust">${trust}</section>
<section class="services"><h2>${esc(ex.servicesTitle)}</h2><div class="grid">${cards}</div></section>
<section class="band"><h2>${esc(ex.band.title)}</h2><p>${esc(ex.band.text)}</p><a class="btn btn-accent">${esc(ex.primary)}</a></section>
</body>`;
}

function before(ex, device) {
  const b = ex.before;
  const m = device === 'mobile';
  const rows = b.rows.map(([a, c]) => `<tr><td>${esc(a)}</td><td>${esc(c)}</td></tr>`).join('');
  const side = b.side.map((s) => `<a>${esc(s)}</a>`).join('');
  const tabs = b.side.map((s) => `<span>${esc(s)}</span>`).join('');
  return `<body class="before ${device}" style="${vars(ex.theme)}">
<div class="page">
  <header class="top"><h1>${esc(ex.name)}</h1><p>${esc(ex.sub)} · Tel: <b>${PHONE}</b></p></header>
  <nav class="tabs">${tabs}</nav>
  <div class="cols">
    ${m ? '' : `<aside class="left">${side}<div class="box">Call us on<br /><b>${PHONE}</b></div></aside>`}
    <main>
      <h2>${esc(b.welcome)}</h2>
      <div class="intro">${slot(ex, 'hero', 'pic')}<p>${esc(b.intro)}</p></div>
      <table><tr><th>Service</th><th>Details</th></tr>${rows}</table>
      <div class="thumbs">${ex.services.map((s) => slot(ex, s.img, 'thumb')).join('')}</div>
      <p class="more">Please call for more information. <a>Click here</a> to contact us.</p>
    </main>
  </div>
  <footer>${esc(b.foot)}</footer>
</div>
</body>`;
}

for (const ex of examples) {
  for (const device of ['desktop', 'mobile']) {
    for (const side of ['before', 'after']) {
      const body = side === 'after' ? after(ex, device) : before(ex, device);
      const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(ex.name)} (${side}, ${device})</title>
<link rel="stylesheet" href="../${side}.css" />
</head>
${body}
</html>
`;
      writeFileSync(join(PAGES, `example-${ex.id}-${side}-${device}.html`), html);
    }
  }
}

const unique = [...new Set(missing)];
console.log(`built ${examples.length * 4} pages, ${unique.length} image slots still empty`);
if (unique.length) console.log(unique.join('\n'));
