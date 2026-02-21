import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../hooks/useTranslation';
import { getPath } from '../../utils/routes';
import './CookieConsent.css';

const COOKIE_CONSENT_KEY = 'isam_cookie_consent';
const COOKIE_CONSENT_VERSION = 2;
const COOKIE_CONSENT_OPEN_EVENT = 'isam:cookie-consent-open';
const COOKIE_TITLE_ID = 'cookie-consent-title';

function normalizeConsent(rawConsent) {
  if (!rawConsent || typeof rawConsent !== 'object') {
    return null;
  }

  if (
    rawConsent.version === COOKIE_CONSENT_VERSION &&
    rawConsent.categories &&
    typeof rawConsent.categories === 'object'
  ) {
    return {
      version: COOKIE_CONSENT_VERSION,
      categories: {
        necessary: true,
        analytics: Boolean(rawConsent.categories.analytics),
        marketing: Boolean(rawConsent.categories.marketing),
      },
      timestamp: Number(rawConsent.timestamp) || Date.now(),
    };
  }

  if (typeof rawConsent.necessary === 'boolean') {
    return {
      version: COOKIE_CONSENT_VERSION,
      categories: {
        necessary: true,
        analytics: Boolean(rawConsent.analytics),
        marketing: Boolean(rawConsent.marketing),
      },
      timestamp: Number(rawConsent.timestamp) || Date.now(),
    };
  }

  return null;
}

function getCookieConsent() {
  try {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    return stored ? normalizeConsent(JSON.parse(stored)) : null;
  } catch {
    return null;
  }
}

function setCookieConsent(value) {
  const normalized = normalizeConsent(value);
  if (!normalized) return;

  localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(normalized));
  window.dispatchEvent(
    new CustomEvent('isam:cookie-consent-updated', { detail: normalized })
  );
}

export default function CookieConsent() {
  const { t, language, dir } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
  });
  const dialogRef = useRef(null);
  const lastFocusedElementRef = useRef(null);

  const closeDialog = useCallback(() => {
    setShowSettings(false);
    setIsVisible(false);
  }, []);

  useEffect(() => {
    const consent = getCookieConsent();
    if (consent) {
      setPreferences({
        necessary: true,
        analytics: Boolean(consent.categories.analytics),
        marketing: Boolean(consent.categories.marketing),
      });
      setCookieConsent(consent);
      return undefined;
    }

    const timer = setTimeout(() => setIsVisible(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleOpenEvent = () => {
      const consent = getCookieConsent();
      if (consent) {
        setPreferences({
          necessary: true,
          analytics: Boolean(consent.categories.analytics),
          marketing: Boolean(consent.categories.marketing),
        });
      }
      setShowSettings(true);
      setIsVisible(true);
    };

    window.addEventListener(COOKIE_CONSENT_OPEN_EVENT, handleOpenEvent);
    return () => window.removeEventListener(COOKIE_CONSENT_OPEN_EVENT, handleOpenEvent);
  }, []);

  useEffect(() => {
    if (!isVisible) return undefined;

    lastFocusedElementRef.current = document.activeElement;

    const dialogElement = dialogRef.current;
    const focusableSelector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',');

    const focusableElements = dialogElement
      ? Array.from(dialogElement.querySelectorAll(focusableSelector))
      : [];

    if (dialogElement && typeof dialogElement.focus === 'function') {
      dialogElement.focus();
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeDialog();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey && activeElement === dialogElement) {
        event.preventDefault();
        last.focus();
      } else if (event.shiftKey && activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && activeElement === dialogElement) {
        event.preventDefault();
        first.focus();
      } else if (!event.shiftKey && activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (lastFocusedElementRef.current && typeof lastFocusedElementRef.current.focus === 'function') {
        lastFocusedElementRef.current.focus();
      }
    };
  }, [closeDialog, isVisible, showSettings]);

  const handleAcceptAll = () => {
    const consent = {
      version: COOKIE_CONSENT_VERSION,
      categories: { necessary: true, analytics: true, marketing: true },
      timestamp: Date.now(),
    };
    setCookieConsent(consent);
    closeDialog();
  };

  const handleRejectAll = () => {
    const consent = {
      version: COOKIE_CONSENT_VERSION,
      categories: { necessary: true, analytics: false, marketing: false },
      timestamp: Date.now(),
    };
    setCookieConsent(consent);
    closeDialog();
  };

  const handleSavePreferences = () => {
    const consent = {
      version: COOKIE_CONSENT_VERSION,
      categories: { ...preferences, necessary: true },
      timestamp: Date.now(),
    };
    setCookieConsent(consent);
    closeDialog();
  };

  const togglePreference = (key) => {
    if (key === 'necessary') return;
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (!isVisible) return null;

  const privacyPath = getPath(language, 'privacyPolicy');
  const dataPrivacyPath = getPath(language, 'dataPrivacy');

  return (
    <div className="cookie-consent" role="presentation">
      <div
        ref={dialogRef}
        className="cookie-consent__content"
        role="dialog"
        aria-modal="true"
        aria-labelledby={COOKIE_TITLE_ID}
        tabIndex={-1}
      >
        {!showSettings ? (
          <>
            <div className="cookie-consent__header">
              <h3 id={COOKIE_TITLE_ID}>{t('cookie.title')}</h3>
              <button
                type="button"
                className="cookie-consent__close"
                onClick={closeDialog}
                aria-label={t('cookie.close')}
              >
                <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                  <path d="M4 4L12 12M12 4L4 12" />
                </svg>
              </button>
            </div>
            <p className="cookie-consent__description">{t('cookie.description')}</p>
            <p className="cookie-consent__policy">
              {t('cookie.policyPrefix')}{' '}
              <Link to={privacyPath}>{t('cookie.policyLinkPrivacy')}</Link>{' '}
              {t('cookie.policyAnd')}{' '}
              <Link to={dataPrivacyPath}>{t('cookie.policyLinkData')}</Link>.
            </p>
            <div className="cookie-consent__actions">
              <button type="button" className="cookie-consent__btn cookie-consent__btn--primary" onClick={handleAcceptAll}>
                {t('cookie.accept')}
              </button>
              <button type="button" className="cookie-consent__btn cookie-consent__btn--secondary" onClick={handleRejectAll}>
                {t('cookie.reject')}
              </button>
              <button type="button" className="cookie-consent__btn cookie-consent__btn--ghost" onClick={() => setShowSettings(true)}>
                {t('cookie.settings')}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="cookie-consent__header">
              <h3 id={COOKIE_TITLE_ID}>{t('cookie.settings')}</h3>
              <button
                type="button"
                className="cookie-consent__back"
                onClick={() => setShowSettings(false)}
                aria-label={t('cookie.back')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={dir === 'rtl' ? { transform: 'scaleX(-1)' } : undefined}>
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
              </button>
            </div>
            <div className="cookie-consent__settings">
              <div className="cookie-consent__setting">
                <div className="cookie-consent__setting-info">
                  <span className="cookie-consent__setting-name">{t('cookie.necessary')}</span>
                  <span className="cookie-consent__setting-desc">{t('cookie.necessaryDesc')}</span>
                </div>
                <div className="cookie-consent__toggle cookie-consent__toggle--disabled" aria-hidden="true">
                  <span className="cookie-consent__toggle-label">{preferences.necessary ? t('cookie.on') : t('cookie.off')}</span>
                </div>
              </div>
              <div className="cookie-consent__setting">
                <div className="cookie-consent__setting-info">
                  <span className="cookie-consent__setting-name">{t('cookie.analytics')}</span>
                  <span className="cookie-consent__setting-desc">{t('cookie.analyticsDesc')}</span>
                </div>
                <button
                  type="button"
                  className={`cookie-consent__toggle ${preferences.analytics ? 'cookie-consent__toggle--active' : ''}`}
                  onClick={() => togglePreference('analytics')}
                  aria-pressed={preferences.analytics}
                >
                  <span className="cookie-consent__toggle-label">{preferences.analytics ? t('cookie.on') : t('cookie.off')}</span>
                </button>
              </div>
              <div className="cookie-consent__setting">
                <div className="cookie-consent__setting-info">
                  <span className="cookie-consent__setting-name">{t('cookie.marketing')}</span>
                  <span className="cookie-consent__setting-desc">{t('cookie.marketingDesc')}</span>
                </div>
                <button
                  type="button"
                  className={`cookie-consent__toggle ${preferences.marketing ? 'cookie-consent__toggle--active' : ''}`}
                  onClick={() => togglePreference('marketing')}
                  aria-pressed={preferences.marketing}
                >
                  <span className="cookie-consent__toggle-label">{preferences.marketing ? t('cookie.on') : t('cookie.off')}</span>
                </button>
              </div>
            </div>
            <p className="cookie-consent__policy">
              {t('cookie.policyPrefix')}{' '}
              <Link to={privacyPath}>{t('cookie.policyLinkPrivacy')}</Link>{' '}
              {t('cookie.policyAnd')}{' '}
              <Link to={dataPrivacyPath}>{t('cookie.policyLinkData')}</Link>.
            </p>
            <div className="cookie-consent__actions">
              <button type="button" className="cookie-consent__btn cookie-consent__btn--primary" onClick={handleSavePreferences}>
                {t('cookie.save')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
