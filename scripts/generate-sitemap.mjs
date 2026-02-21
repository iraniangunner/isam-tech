import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROUTES, ROUTE_PAGE_KEYS } from '../src/utils/routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const siteUrl = (process.env.VITE_SITE_URL || 'https://isam-tech.com').replace(/\/+$/, '');
const lastmod = new Date().toISOString().slice(0, 10);

const pageMeta = {
  home: { priority: '1.0', changefreq: 'monthly' },
  about: { priority: '0.8', changefreq: 'monthly' },
  services: { priority: '0.8', changefreq: 'monthly' },
  contact: { priority: '0.7', changefreq: 'monthly' },
  privacyPolicy: { priority: '0.3', changefreq: 'yearly' },
  dataPrivacy: { priority: '0.3', changefreq: 'yearly' },
};

function toAbsoluteUrl(routePath) {
  return new URL(encodeURI(routePath), `${siteUrl}/`).toString();
}

function urlEntry(loc, alternates, options) {
  const alternateTags = alternates
    .map(({ hreflang, href }) => `    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${href}" />`)
    .join('\n');

  return [
    '  <url>',
    `    <loc>${loc}</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    `    <changefreq>${options.changefreq}</changefreq>`,
    `    <priority>${options.priority}</priority>`,
    alternateTags,
    '  </url>',
  ].join('\n');
}

function createSitemapXml() {
  const entries = [];

  for (const pageKey of ROUTE_PAGE_KEYS) {
    const faPath = ROUTES.fa[pageKey];
    const enPath = ROUTES.en[pageKey];
    const faUrl = toAbsoluteUrl(faPath);
    const enUrl = toAbsoluteUrl(enPath);
    const options = pageMeta[pageKey] || pageMeta.home;

    entries.push(
      urlEntry(
        faUrl,
        [
          { hreflang: 'fa', href: faUrl },
          { hreflang: 'en', href: enUrl },
          { hreflang: 'x-default', href: `${siteUrl}/` },
        ],
        options,
      ),
    );

    entries.push(
      urlEntry(
        enUrl,
        [
          { hreflang: 'fa', href: faUrl },
          { hreflang: 'en', href: enUrl },
          { hreflang: 'x-default', href: `${siteUrl}/` },
        ],
        options,
      ),
    );
  }

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset',
    '  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '  xmlns:xhtml="http://www.w3.org/1999/xhtml"',
    '>',
    entries.join('\n'),
    '</urlset>',
    '',
  ].join('\n');
}

const outputPath = path.join(projectRoot, 'public', 'sitemap.xml');
await writeFile(outputPath, createSitemapXml(), 'utf8');
console.log(`[sitemap] Generated ${outputPath}`);
