import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../../hooks/useTranslation';
import { getPageKeyFromPath, getPath, mapPathToLanguage } from '../../utils/routes';
import { getPageMeta } from '../../seo/pageMeta';

function normalizeSiteUrl(value) {
  return value.replace(/\/+$/, '');
}

function absoluteUrl(siteUrl, path) {
  return new URL(encodeURI(path || '/'), `${siteUrl}/`).toString();
}

export default function SEOHead({
  pageKey = 'home',
  title,
  description,
  keywords,
  type = 'website',
  noindex = false,
}) {
  const { language } = useLanguage();
  const location = useLocation();
  const runtimeOrigin = window.location.origin;
  const defaultSiteUrl = runtimeOrigin.includes('localhost') || runtimeOrigin.includes('127.0.0.1')
    ? 'https://isam-tech.com'
    : runtimeOrigin;

  const siteUrl = normalizeSiteUrl(
    import.meta.env.VITE_SITE_URL || defaultSiteUrl
  );
  const detectedPageKey = getPageKeyFromPath(location.pathname);
  const normalizedPageKey = detectedPageKey || pageKey || 'home';
  const isRecognizedPage = Boolean(detectedPageKey);

  const canonicalPath = isRecognizedPage
    ? getPath(language, normalizedPageKey)
    : location.pathname || '/';
  const faPath = isRecognizedPage
    ? getPath('fa', normalizedPageKey)
    : mapPathToLanguage(location.pathname, 'fa');
  const enPath = isRecognizedPage
    ? getPath('en', normalizedPageKey)
    : mapPathToLanguage(location.pathname, 'en');

  const canonicalUrl = absoluteUrl(siteUrl, canonicalPath);
  const faUrl = absoluteUrl(siteUrl, faPath);
  const enUrl = absoluteUrl(siteUrl, enPath);
  const defaultUrl = `${siteUrl}/`;

  const localizedMeta = getPageMeta(normalizedPageKey, language);
  const defaultTitle = localizedMeta.title;
  const defaultDescription = localizedMeta.description;
  const defaultKeywords = localizedMeta.keywords;

  const seoTitle = title || defaultTitle;
  const seoDescription = description || defaultDescription;
  const seoKeywords = keywords || defaultKeywords;
  const robotsContent = noindex ? 'noindex, nofollow' : 'index, follow';

  useEffect(() => {
    document.title = seoTitle;

    const setMeta = (name, content, isProperty = false) => {
      const selector = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let meta = document.querySelector(selector);

      if (!meta) {
        meta = document.createElement('meta');
        if (isProperty) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    setMeta('description', seoDescription);
    if (seoKeywords) setMeta('keywords', seoKeywords);
    setMeta('robots', robotsContent);

    setMeta('og:title', seoTitle, true);
    setMeta('og:description', seoDescription, true);
    setMeta('og:type', type, true);
    setMeta('og:url', canonicalUrl, true);
    setMeta('og:site_name', 'ISAM', true);
    setMeta('og:locale', language === 'fa' ? 'fa_IR' : 'en_US', true);
    setMeta('og:image', `${siteUrl}/img/isam-logo.png`, true);

    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', seoTitle);
    setMeta('twitter:description', seoDescription);
    setMeta('twitter:image', `${siteUrl}/img/isam-logo.png`);

    const setLink = (selector, attributes) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('link');
        document.head.appendChild(element);
      }
      Object.entries(attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
      });
    };

    setLink('link[rel="canonical"]', { rel: 'canonical', href: canonicalUrl });
    setLink('link[rel="alternate"][hreflang="fa"]', {
      rel: 'alternate',
      hreflang: 'fa',
      href: faUrl,
    });
    setLink('link[rel="alternate"][hreflang="en"]', {
      rel: 'alternate',
      hreflang: 'en',
      href: enUrl,
    });
    setLink('link[rel="alternate"][hreflang="x-default"]', {
      rel: 'alternate',
      hreflang: 'x-default',
      href: defaultUrl,
    });

    return () => {};
  }, [
    canonicalUrl,
    defaultUrl,
    enUrl,
    faUrl,
    language,
    robotsContent,
    seoDescription,
    seoKeywords,
    seoTitle,
    siteUrl,
    type,
  ]);

  return null;
}
