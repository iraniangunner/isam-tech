import { useState, useEffect, useCallback } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../hooks/useTranslation';
import { getPath, mapPathToLanguage } from '../../utils/routes';
import './Navbar.css';

export default function Navbar() {
  const { t, language, setLanguage } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) return undefined;

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        closeMobileMenu();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [closeMobileMenu, isMobileMenuOpen]);

  const handleLanguageChange = (lang) => {
    if (lang === language) return;

    const mappedPath = mapPathToLanguage(location.pathname, lang);
    const newPath = `${mappedPath}${location.hash || ''}`;
    setLanguage(lang);
    navigate(newPath);
  };

  const navLinks = [
    { to: getPath(language, 'home'), label: t('nav.home'), end: true },
    { to: getPath(language, 'about'), label: t('nav.about') },
    { to: getPath(language, 'services'), label: t('nav.services') },
    { to: getPath(language, 'contact'), label: t('nav.contact') },
  ];
  const menuId = 'main-navigation-menu';
  const toggleLabel = isMobileMenuOpen ? t('nav.closeMenu') : t('nav.openMenu');

  return (
    <nav
      className={`navbar ${isScrolled ? 'navbar--scrolled' : ''} ${isMobileMenuOpen ? 'navbar--menu-open' : ''}`}
      aria-label={t('nav.mainNav')}
    >
      <div className="navbar__container">
        <Link to={getPath(language, 'home')} className="navbar__logo">
          <img src="/img/isam-logo.png" alt="ISAM" className="navbar__logo-img" />
        </Link>

        <div
          id={menuId}
          className={`navbar__menu ${isMobileMenuOpen ? 'navbar__menu--open' : ''}`}
        >
          <ul className="navbar__links">
            {navLinks.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    `navbar__link ${isActive ? 'navbar__link--active' : ''}`
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="navbar__language">
            <button
              className={`navbar__lang-btn ${language === 'fa' ? 'navbar__lang-btn--active' : ''}`}
              onClick={() => handleLanguageChange('fa')}
            >
              فارسی
            </button>
            <span className="navbar__lang-divider">|</span>
            <button
              className={`navbar__lang-btn ${language === 'en' ? 'navbar__lang-btn--active' : ''}`}
              onClick={() => handleLanguageChange('en')}
            >
              EN
            </button>
          </div>
        </div>

        {/* Backdrop overlay — closes menu on tap */}
        <div
          className={`navbar__overlay ${isMobileMenuOpen ? 'navbar__overlay--visible' : ''}`}
          onClick={closeMobileMenu}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              closeMobileMenu();
            }
          }}
          role="button"
          tabIndex={isMobileMenuOpen ? 0 : -1}
          aria-label={t('nav.closeMenu')}
        />

        <button
          type="button"
          className={`navbar__toggle ${isMobileMenuOpen ? 'navbar__toggle--open' : ''}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={toggleLabel}
          aria-controls={menuId}
          aria-expanded={isMobileMenuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
}
