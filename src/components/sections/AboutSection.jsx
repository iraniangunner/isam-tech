import { useLanguage } from '../../hooks/useTranslation';
import './AboutSection.css';

export default function AboutSection() {
  const { t, language } = useLanguage();

  const stats = [
    { value: '20+', label: t('about.stats.years') },
    { value: '3+', label: t('about.stats.partners') },
    { value: '8+', label: t('about.stats.technologies') },
    { value: '10+', label: t('about.stats.engineers') },
  ];

  return (
    <section className="about-section section" id="about">
      <div className="container">
        <div className="about-section__grid">
          <div className="about-section__image">
            <div className="about-section__image-wrapper">
              <img src="/img/about-team.jpg" alt="ISAM industrial operations team" loading="lazy" />
            </div>
            <div className="about-section__stats">
              {stats.map((stat, index) => (
                <div key={index} className="about-section__stat">
                  <span className="about-section__stat-value">{stat.value}</span>
                  <span className="about-section__stat-label">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="about-section__content">
            <div className="section-title" style={{ textAlign: language === 'fa' ? 'right' : 'left' }}>
              <h2>{t('about.title')}</h2>
              <p>{t('about.subtitle')}</p>
            </div>

            <p className="about-section__description">
              {t('about.description')}
            </p>

            <div className="about-section__features">
              <div className="about-section__feature">
                <div className="about-section__feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                </div>
                <div className="about-section__feature-content">
                  <h4>{t('about.mission')}</h4>
                  <p>{t('about.missionText')}</p>
                </div>
              </div>

              <div className="about-section__feature">
                <div className="about-section__feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </div>
                <div className="about-section__feature-content">
                  <h4>{t('about.vision')}</h4>
                  <p>{t('about.visionText')}</p>
                </div>
              </div>

              <div className="about-section__feature">
                <div className="about-section__feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
                <div className="about-section__feature-content">
                  <h4>{t('about.values')}</h4>
                  <p>{t('about.valuesText')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
