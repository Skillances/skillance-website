#!/usr/bin/env node
// Ping IndexNow (Bing, Yandex, Seznam, Naver) with the canonical URL list
// from public/sitemap.xml after each successful production build on Vercel.
//
// Runs automatically via the `postbuild` npm script. Only fires on Vercel
// production deployments — local builds and preview builds are skipped so
// we don't spam the service with duplicate submissions.
//
// Docs: https://www.indexnow.org/documentation

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const HOST = 'skillance.co.za';
const KEY = 'cef82964c4097c33f36cc5a0d2d1a0beef0037f09f451f690689ea22cbccdd07';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const ENDPOINT = 'https://api.indexnow.org/IndexNow';

const tag = '[indexnow]';
const log = (...args) => console.log(tag, ...args);

// Only ping on real production deploys. Vercel sets VERCEL=1 during builds
// and VERCEL_ENV=production for production branch deploys.
const isVercel = process.env.VERCEL === '1';
const isProd = process.env.VERCEL_ENV === 'production';
const force = process.env.INDEXNOW_FORCE === '1';

if (!force && (!isVercel || !isProd)) {
  log(
    `skipping (VERCEL=${process.env.VERCEL ?? 'unset'}, VERCEL_ENV=${
      process.env.VERCEL_ENV ?? 'unset'
    }). Set INDEXNOW_FORCE=1 to override.`
  );
  process.exit(0);
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const sitemapPath = resolve(__dirname, '..', 'public', 'sitemap.xml');

function readSitemapUrls() {
  let xml;
  try {
    xml = readFileSync(sitemapPath, 'utf8');
  } catch (err) {
    log(`could not read ${sitemapPath}: ${err.message}`);
    return [];
  }
  const urls = [];
  const re = /<loc>\s*([^<\s]+)\s*<\/loc>/g;
  let match;
  while ((match = re.exec(xml)) !== null) {
    const url = match[1].trim();
    if (url.startsWith(`https://${HOST}`)) urls.push(url);
  }
  return urls;
}

const urlList = readSitemapUrls();
if (urlList.length === 0) {
  log('no URLs found in sitemap; nothing to submit.');
  process.exit(0);
}

log(`submitting ${urlList.length} URLs to IndexNow...`);

const body = JSON.stringify({
  host: HOST,
  key: KEY,
  keyLocation: KEY_LOCATION,
  urlList,
});

try {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'User-Agent': 'skillance-indexnow-ping/1.0',
    },
    body,
  });
  const text = await res.text();
  if (res.status === 200 || res.status === 202) {
    log(`success (HTTP ${res.status}). Bing/Yandex have queued a re-crawl.`);
  } else {
    log(`HTTP ${res.status} — ${text || '(no body)'}`);
    log('not failing the build; re-crawl may just be delayed.');
  }
} catch (err) {
  log(`fetch failed: ${err.message}`);
  log('not failing the build; re-crawl may just be delayed.');
}

process.exit(0);
