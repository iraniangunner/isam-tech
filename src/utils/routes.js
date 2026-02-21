const ROUTE_MAP = Object.freeze({
  fa: Object.freeze({
    home: '/fa',
    about: '/fa/درباره-ما',
    services: '/fa/خدمات',
    contact: '/fa/تماس-با-ما',
    privacyPolicy: '/fa/سیاست-حریم-خصوصی',
    dataPrivacy: '/fa/حریم-داده',
  }),
  en: Object.freeze({
    home: '/en',
    about: '/en/about-us',
    services: '/en/services',
    contact: '/en/contact',
    privacyPolicy: '/en/privacy-policy',
    dataPrivacy: '/en/data-privacy',
  }),
});

const LEGACY_ROUTE_MAP = Object.freeze({
  '/fa/about': ROUTE_MAP.fa.about,
  '/fa/services': ROUTE_MAP.fa.services,
  '/fa/contact': ROUTE_MAP.fa.contact,
  '/fa/privacy-policy': ROUTE_MAP.fa.privacyPolicy,
  '/fa/data-privacy': ROUTE_MAP.fa.dataPrivacy,
  '/en/about': ROUTE_MAP.en.about,
  '/en/services': ROUTE_MAP.en.services,
  '/en/contact': ROUTE_MAP.en.contact,
  '/en/privacy-policy': ROUTE_MAP.en.privacyPolicy,
  '/en/data-privacy': ROUTE_MAP.en.dataPrivacy,
});

const PAGE_KEYS = Object.freeze([
  'home',
  'about',
  'services',
  'contact',
  'privacyPolicy',
  'dataPrivacy',
]);

const PAGE_BY_PATH = new Map();
for (const page of PAGE_KEYS) {
  PAGE_BY_PATH.set(ROUTE_MAP.fa[page], page);
  PAGE_BY_PATH.set(ROUTE_MAP.en[page], page);
}

function normalizePathname(pathname = '') {
  if (!pathname) return '/';

  let decoded = pathname;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    decoded = pathname;
  }

  if (!decoded.startsWith('/')) {
    decoded = `/${decoded}`;
  }

  decoded = decoded.replace(/\/+$/, '');
  return decoded || '/';
}

export function getLanguageFromPath(pathname = '') {
  const normalized = normalizePathname(pathname);
  const firstSegment = normalized.split('/')[1];
  return firstSegment === 'fa' || firstSegment === 'en' ? firstSegment : null;
}

export function getPageKeyFromPath(pathname = '') {
  const normalized = normalizePathname(pathname);
  if (PAGE_BY_PATH.has(normalized)) {
    return PAGE_BY_PATH.get(normalized);
  }

  const redirectTarget = LEGACY_ROUTE_MAP[normalized];
  return redirectTarget ? PAGE_BY_PATH.get(redirectTarget) || null : null;
}

export function getPath(language, pageKey = 'home') {
  const safeLanguage = language === 'fa' ? 'fa' : 'en';
  const safePageKey = PAGE_KEYS.includes(pageKey) ? pageKey : 'home';
  return ROUTE_MAP[safeLanguage][safePageKey];
}

export function mapPathToLanguage(pathname = '', targetLanguage = 'en') {
  const pageKey = getPageKeyFromPath(pathname);
  return getPath(targetLanguage, pageKey || 'home');
}

export function getLegacyRedirect(pathname = '') {
  return LEGACY_ROUTE_MAP[normalizePathname(pathname)] || null;
}

export const ROUTES = ROUTE_MAP;
export const ROUTE_PAGE_KEYS = PAGE_KEYS;
export const LEGACY_REDIRECTS = Object.freeze(
  Object.entries(LEGACY_ROUTE_MAP).map(([from, to]) => ({ from, to }))
);
export const LOCALIZED_ROUTE_ENTRIES = Object.freeze(
  ROUTE_PAGE_KEYS.flatMap((pageKey) => ([
    { language: 'fa', pageKey, path: ROUTE_MAP.fa[pageKey] },
    { language: 'en', pageKey, path: ROUTE_MAP.en[pageKey] },
  ]))
);
