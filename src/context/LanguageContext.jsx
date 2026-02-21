import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import fa from '../i18n/fa.json';
import en from '../i18n/en.json';
import { getLanguageFromPath } from '../utils/routes';

const translations = { fa, en };

const LanguageContext = createContext(null);

const COOKIE_NAME = 'isam_language';

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

function setCookie(name, value, days = 365) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/; SameSite=Lax';
}

function detectLanguage() {
  const pathLang = getLanguageFromPath(window.location.pathname);
  if (pathLang) {
    return pathLang;
  }

  const cookieLang = getCookie(COOKIE_NAME);
  if (cookieLang && ['fa', 'en'].includes(cookieLang)) {
    return cookieLang;
  }
  const browserLang = navigator.language.split('-')[0];
  return browserLang === 'fa' ? 'fa' : 'en';
}

export function LanguageProvider({ children }) {
  const location = useLocation();
  const [language, setLanguageState] = useState(() => detectLanguage());

  const setLanguage = useCallback((lang) => {
    setLanguageState(lang);
    setCookie(COOKIE_NAME, lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr';
  }, [language]);

  useEffect(() => {
    const pathLang = getLanguageFromPath(location.pathname);
    if (pathLang && pathLang !== language) {
      setLanguage(pathLang);
    }
  }, [language, location.pathname, setLanguage]);

  const t = useCallback((key) => {
    const keys = key.split('.');
    let value = translations[language];
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key;
      }
    }
    return value ?? key;
  }, [language]);

  const value = {
    language,
    setLanguage,
    t,
    isRTL: language === 'fa',
    dir: language === 'fa' ? 'rtl' : 'ltr',
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export default LanguageContext;
