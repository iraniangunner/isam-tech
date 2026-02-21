import { Link } from 'react-router-dom';
import { useLanguage } from '../../hooks/useTranslation';
import { getPath } from '../../utils/routes';
import './Footer.css';

export default function Footer() {
  const { t, language } = useLanguage();
  const currentYear = new Date().getFullYear();
  const socialLinks = [
    {
      key: 'linkedin',
      label: 'LinkedIn',
      href: import.meta.env.VITE_SOCIAL_LINKEDIN || '',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
    },
    {
      key: 'x',
      label: 'X',
      href: import.meta.env.VITE_SOCIAL_X || '',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      key: 'instagram',
      label: 'Instagram',
      href: import.meta.env.VITE_SOCIAL_INSTAGRAM || '',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
      ),
    },
  ].filter((item) => /^https?:\/\//.test(item.href));

  const quickLinks = [
    { to: getPath(language, 'home'), label: t('nav.home') },
    { to: getPath(language, 'about'), label: t('nav.about') },
    { to: getPath(language, 'services'), label: t('nav.services') },
    { to: getPath(language, 'contact'), label: t('nav.contact') },
  ];

  const legalLinks = [
    { to: getPath(language, 'privacyPolicy'), label: t('pages.privacy') },
    { to: getPath(language, 'dataPrivacy'), label: t('pages.dataPrivacy') },
  ];

  const handleOpenCookieSettings = () => {
    window.dispatchEvent(new CustomEvent('isam:cookie-consent-open'));
  };

  return (
    <footer className="footer">
      <div className="footer__main">
        <div className="container">
          <div className="footer__grid">
            <div className="footer__brand">
              <Link to={getPath(language, 'home')} className="footer__logo">
                <img src="/img/isam-logo.png" alt="ISAM" />
              </Link>
              <p className="footer__description">{t('footer.description')}</p>
              {socialLinks.length > 0 ? (
                <div className="footer__social" aria-label={t('footer.followUs')}>
                  {socialLinks.map((link) => (
                    <a key={link.key} href={link.href} target="_blank" rel="noopener noreferrer" aria-label={link.label}>
                      {link.icon}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="footer__links">
              <h4>{t('footer.quickLinks')}</h4>
              <ul>
                {quickLinks.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="footer__links">
              <h4>{t('footer.contactUs')}</h4>
              <ul>
                {legalLinks.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to}>{link.label}</Link>
                  </li>
                ))}
                <li>
                  <button type="button" className="footer__link-btn" onClick={handleOpenCookieSettings}>
                    {t('cookie.settings')}
                  </button>
                </li>
              </ul>
            </div>

            <div className="footer__contact-info">
              <h4>{t('contact.info.title')}</h4>
              <div className="footer__contact-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>{t('contact.info.fullAddress')}</span>
              </div>
              <div className="footer__contact-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
                </svg>
                <span dir="ltr">{t('contact.info.phoneValue')}</span>
              </div>
              <div className="footer__contact-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <span>{t('contact.info.emailValue')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container">
          <p>&copy; {currentYear} ISAM. {t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
}
