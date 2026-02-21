import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LOCALIZED_ROUTE_ENTRIES, ROUTES } from '../src/utils/routes.js';
import { getPageMeta } from '../src/seo/pageMeta.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');
const siteUrl = (process.env.VITE_SITE_URL || 'https://isam-tech.com').replace(/\/+$/, '');

const routes = LOCALIZED_ROUTE_ENTRIES.filter((entry) => entry.pageKey !== 'notFound');

function routeToOutputPath(routePath) {
  const segments = routePath.split('/').filter(Boolean);
  return path.join(distDir, ...segments, 'index.html');
}

function upsertTag(html, pattern, tag) {
  if (pattern.test(html)) {
    return html.replace(pattern, tag);
  }
  return html.replace('</head>', `${tag}</head>`);
}

function getHeadValues({ pageKey, language, path: routePath }) {
  const meta = getPageMeta(pageKey, language);
  const canonical = new URL(encodeURI(routePath), `${siteUrl}/`).toString();
  const faHref = new URL(encodeURI(ROUTES.fa[pageKey]), `${siteUrl}/`).toString();
  const enHref = new URL(encodeURI(ROUTES.en[pageKey]), `${siteUrl}/`).toString();

  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    canonical,
    faHref,
    enHref,
    defaultHref: `${siteUrl}/`,
    ogLocale: language === 'fa' ? 'fa_IR' : 'en_US',
  };
}

function injectMetadata(templateHtml, routeEntry) {
  const values = getHeadValues(routeEntry);
  let html = templateHtml;
  const htmlDir = routeEntry.language === 'fa' ? 'rtl' : 'ltr';

  html = html.replace(
    /<html\s+lang="[^"]*"\s+dir="[^"]*">/i,
    `<html lang="${routeEntry.language}" dir="${htmlDir}">`,
  );

  html = upsertTag(html, /<title>.*?<\/title>/i, `<title>${values.title}</title>`);
  html = upsertTag(html, /<meta\s+name=["']description["'][^>]*>/i, `<meta name="description" content="${values.description}" />`);
  html = upsertTag(html, /<meta\s+name=["']keywords["'][^>]*>/i, `<meta name="keywords" content="${values.keywords}" />`);
  html = upsertTag(html, /<meta\s+name=["']robots["'][^>]*>/i, '<meta name="robots" content="index, follow" />');

  html = upsertTag(html, /<meta\s+property=["']og:title["'][^>]*>/i, `<meta property="og:title" content="${values.title}" />`);
  html = upsertTag(html, /<meta\s+property=["']og:description["'][^>]*>/i, `<meta property="og:description" content="${values.description}" />`);
  html = upsertTag(html, /<meta\s+property=["']og:url["'][^>]*>/i, `<meta property="og:url" content="${values.canonical}" />`);
  html = upsertTag(html, /<meta\s+property=["']og:locale["'][^>]*>/i, `<meta property="og:locale" content="${values.ogLocale}" />`);

  html = upsertTag(html, /<meta\s+name=["']twitter:title["'][^>]*>/i, `<meta name="twitter:title" content="${values.title}" />`);
  html = upsertTag(html, /<meta\s+name=["']twitter:description["'][^>]*>/i, `<meta name="twitter:description" content="${values.description}" />`);

  html = upsertTag(html, /<link\s+rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${values.canonical}" />`);
  html = upsertTag(html, /<link\s+rel=["']alternate["'][^>]*hreflang=["']fa["'][^>]*>/i, `<link rel="alternate" hreflang="fa" href="${values.faHref}" />`);
  html = upsertTag(html, /<link\s+rel=["']alternate["'][^>]*hreflang=["']en["'][^>]*>/i, `<link rel="alternate" hreflang="en" href="${values.enHref}" />`);
  html = upsertTag(html, /<link\s+rel=["']alternate["'][^>]*hreflang=["']x-default["'][^>]*>/i, `<link rel="alternate" hreflang="x-default" href="${values.defaultHref}" />`);

  return html;
}

async function prerenderStaticSnapshots() {
  const templatePath = path.join(distDir, 'index.html');
  const template = await readFile(templatePath, 'utf8');

  for (const routeEntry of routes) {
    const outputPath = routeToOutputPath(routeEntry.path);
    await mkdir(path.dirname(outputPath), { recursive: true });
    const html = injectMetadata(template, routeEntry);
    await writeFile(outputPath, html, 'utf8');
    console.log(`[prerender] ${routeEntry.path} -> ${outputPath}`);
  }

  console.log('[prerender] Completed static prerender snapshots.');
}

await prerenderStaticSnapshots();
