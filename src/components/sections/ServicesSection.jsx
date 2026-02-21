import { Link } from 'react-router-dom';
import { useLanguage } from '../../hooks/useTranslation';
import { getPath } from '../../utils/routes';
import './ServicesSection.css';

export default function ServicesSection() {
  const { t, language } = useLanguage();

  const services = [
    {
      id: 'digitalTwin',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
          <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12"/>
        </svg>
      ),
    },
    {
      id: 'ems',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
        </svg>
      ),
    },
    {
      id: 'scada',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
          <path d="M8 21h8M12 17v4"/>
          <path d="M7 10h.01M12 10h.01M17 10h.01"/>
        </svg>
      ),
    },
    {
      id: 'iot',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M5 12.55a11 11 0 0114.08 0M1.42 9a16 16 0 0121.16 0M8.53 16.11a6 6 0 016.95 0M12 20h.01"/>
        </svg>
      ),
    },
    {
      id: 'maintenance',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
        </svg>
      ),
    },
    {
      id: 'ai',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M9 3H5a2 2 0 00-2 2v4m6-6h6m4 0h-4m4 0a2 2 0 012 2v4m0 6v4a2 2 0 01-2 2h-4m-6 0H5a2 2 0 01-2-2v-4m0-6v6m18-6v6"/>
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 2v2M12 20v2M2 12h2M20 12h2"/>
        </svg>
      ),
    },
    {
      id: 'dss',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 3v18h18"/>
          <path d="M7 14l3-3 3 2 4-5"/>
          <circle cx="7" cy="14" r="1"/>
          <circle cx="10" cy="11" r="1"/>
          <circle cx="13" cy="13" r="1"/>
          <circle cx="17" cy="8" r="1"/>
        </svg>
      ),
    },
    {
      id: 'automation',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2v-4M9 21H5a2 2 0 01-2-2v-4m0-6v6m18-6v6"/>
          <circle cx="12" cy="12" r="2"/>
        </svg>
      ),
    },
  ];

  return (
    <section className="services-section section" id="services">
      <div className="container">
        <div className="section-title">
          <h2>{t('services.title')}</h2>
          <p>{t('services.subtitle')}</p>
        </div>
        
        <div className="services-section__grid">
          {services.map((service, index) => (
            <div 
              key={service.id} 
              className="services-section__card"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="services-section__card-icon">
                {service.icon}
              </div>
              <h3 className="services-section__card-title">
                {t(`services.items.${service.id}.title`)}
              </h3>
              <p className="services-section__card-description">
                {t(`services.items.${service.id}.description`)}
              </p>
              <Link 
                to={`${getPath(language, 'services')}#${service.id}`}
                className="services-section__card-link"
              >
                <span>{t('services.learnMore')}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
