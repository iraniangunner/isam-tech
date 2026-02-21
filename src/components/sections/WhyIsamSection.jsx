import { useLanguage } from '../../hooks/useTranslation';
import './WhyIsamSection.css';

export default function WhyIsamSection() {
  const { t } = useLanguage();

  const problems = t('whyIsam.problems');
  const solutions = t('whyIsam.solutions');
  const impacts = t('whyIsam.impacts');

  return (
    <section className="why-isam section" id="why-isam">
      <div className="container">
        <div className="section-title">
          <h2>{t('whyIsam.title')}</h2>
          <p>{t('whyIsam.subtitle')}</p>
        </div>

        <div className="why-isam__columns">
          <div className="why-isam__column why-isam__column--problem animate-slide-in-left">
            <div className="why-isam__column-header">
              <div className="why-isam__column-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <h3 className="why-isam__column-title">{t('whyIsam.problemTitle')}</h3>
            </div>
            <p className="why-isam__column-desc">{t('whyIsam.problemDescription')}</p>
            <ul className="why-isam__list">
              {Array.isArray(problems) && problems.map((item, i) => (
                <li key={i} className="why-isam__list-item why-isam__list-item--problem">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="why-isam__column why-isam__column--solution animate-slide-in-right">
            <div className="why-isam__column-header">
              <div className="why-isam__column-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3 className="why-isam__column-title">{t('whyIsam.solutionTitle')}</h3>
            </div>
            <p className="why-isam__column-desc">{t('whyIsam.solutionDescription')}</p>
            <ul className="why-isam__list">
              {Array.isArray(solutions) && solutions.map((item, i) => (
                <li key={i} className="why-isam__list-item why-isam__list-item--solution">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="why-isam__impacts">
          {Array.isArray(impacts) && impacts.map((impact, i) => (
            <div key={i} className="why-isam__impact animate-fade-in-up" style={{ animationDelay: `${i * 150}ms` }}>
              <span className="why-isam__impact-value">{impact.value}</span>
              <span className="why-isam__impact-label">{impact.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
