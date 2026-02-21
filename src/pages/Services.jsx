import { useLanguage } from '../hooks/useTranslation';
import SEOHead from '../components/common/SEOHead';
import './Services.css';

export default function Services() {
  const { t } = useLanguage();
  const toArray = (value) => (Array.isArray(value) ? value : []);

  const services = [
    {
      id: 'digitalTwin',
      image: '/img/services/digitalTwin.jpg',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
          <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" />
        </svg>
      ),
    },
    {
      id: 'iot',
      image: '/img/services/iot.jpg',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M5 12.55a11 11 0 0114.08 0M1.42 9a16 16 0 0121.16 0M8.53 16.11a6 6 0 016.95 0M12 20h.01" />
        </svg>
      ),
    },
    {
      id: 'maintenance',
      image: '/img/services/maintenance.jpg',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
        </svg>
      ),
    },
    {
      id: 'scada',
      image: '/img/services/scada.jpg',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <path d="M8 21h8M12 17v4" />
          <path d="M7 10h.01M12 10h.01M17 10h.01" />
        </svg>
      ),
    },
    {
      id: 'ems',
      image: '/img/services/ems.jpg',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      ),
    },
    {
      id: 'ai',
      image: '/img/services/ai.jpg',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M9 3H5a2 2 0 00-2 2v4m6-6h6m4 0h-4m4 0a2 2 0 012 2v4m0 6v4a2 2 0 01-2 2h-4m-6 0H5a2 2 0 01-2-2v-4m0-6v6m18-6v6" />
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
        </svg>
      ),
    },
    {
      id: 'dss',
      image: '/img/services/dss.jpg',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 3v18h18" />
          <path d="M7 14l3-3 3 2 4-5" />
          <circle cx="7" cy="14" r="1" />
          <circle cx="10" cy="11" r="1" />
          <circle cx="13" cy="13" r="1" />
          <circle cx="17" cy="8" r="1" />
        </svg>
      ),
    },
    {
      id: 'automation',
      image: '/img/services/automation.jpg',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2v-4M9 21H5a2 2 0 01-2-2v-4m0-6v6m18-6v6" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      ),
    },
  ];

  return (
    <>
      <SEOHead pageKey="services" />
      <div className="services-page">
        <section className="services-page__hero">
          <div className="container">
            <h1>{t('services.title')}</h1>
            <p>{t('services.subtitle')}</p>
          </div>
        </section>

        <section className="services-page__list section">
          <div className="container">
            {services.map((service, index) => (
              <div
                key={service.id}
                id={service.id}
                className={`services-page__item ${index % 2 === 1 ? 'services-page__item--reverse' : ''}`}
              >
                <div className="services-page__item-content">
                  <div className="services-page__item-icon">{service.icon}</div>
                  <h2>{t(`services.items.${service.id}.title`)}</h2>
                  <p>{t(`services.items.${service.id}.description`)}</p>
                  <ul className="services-page__item-features">
                    {toArray(t(`services.items.${service.id}.features`)).map((feature) => (
                      <li key={feature}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <h3 className="services-page__kpi-title">{t('services.kpiTitle')}</h3>
                  <ul className="services-page__item-kpis">
                    {toArray(t(`services.items.${service.id}.kpis`)).map((kpi) => (
                      <li key={kpi}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M5 12h14M13 5l7 7-7 7" />
                        </svg>
                        {kpi}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="services-page__item-visual">
                  <img
                    className="services-page__item-image"
                    src={service.image}
                    alt={t(`services.items.${service.id}.title`)}
                    loading="lazy"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
