import { Link } from 'react-router-dom';
import { useLanguage } from '../../hooks/useTranslation';
import { getPath } from '../../utils/routes';
import './Hero.css';

export default function Hero() {
  const { t, language } = useLanguage();

  return (
    <section className="hero">
      <div className="hero__background">
        <div className="hero__gradient"></div>
        <div className="hero__pattern"></div>
      </div>
      <div className="hero__container container">
        <div className="hero__content">
          <h1 className="hero__title animate-fade-in-up">
            {t('hero.title')}
          </h1>
          <p className="hero__subtitle animate-fade-in-up delay-200">
            {t('hero.subtitle')}
          </p>
          <div className="hero__actions animate-fade-in-up delay-300">
            <Link to={getPath(language, 'about')} className="btn btn-primary btn-lg">
              {t('hero.cta')}
            </Link>
            <Link to={getPath(language, 'contact')} className="btn btn-outline btn-lg">
              {t('hero.cta2')}
            </Link>
          </div>
        </div>
        <div className="hero__visual animate-fade-in delay-400">
          <img
            className="hero__image"
            src="/img/hero-bg.jpg"
            alt="Industrial factory interior"
            fetchpriority="high"
          />
        </div>
      </div>
      <div className="hero__scroll-indicator">
        <span></span>
      </div>
    </section>
  );
}
