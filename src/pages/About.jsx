import { useLanguage } from '../hooks/useTranslation';
import SEOHead from '../components/common/SEOHead';
import './About.css';

export default function About() {
  const { t } = useLanguage();
  const toArray = (value) => (Array.isArray(value) ? value : []);

  const storyParagraphs = toArray(t('about.storyParagraphs'));
  const values = toArray(t('about.valuesGrid'));
  const challenges = toArray(t('about.challenges.items'));
  const solutions = toArray(t('about.solutions.items'));
  const environmentalBenefits = toArray(t('about.benefits.environment.items'));
  const financialBenefits = toArray(t('about.benefits.financial.items'));

  const valueIcons = [
    (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
      </svg>
    ),
    (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
      </svg>
    ),
    (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
      </svg>
    ),
    (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    ),
  ];

  return (
    <>
      <SEOHead pageKey="about" />
      <div className="about-page">
        <section className="about-page__hero">
          <div className="container">
            <h1>{t('about.title')}</h1>
            <p>{t('about.subtitle')}</p>
          </div>
        </section>

        <section className="about-page__story section">
          <div className="container">
            <div className="about-page__story-grid">
              <div className="about-page__story-content">
                <h2>{t('about.storyTitle')}</h2>
                {storyParagraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              <div className="about-page__story-image">
                <img src="/img/about-team.jpg" alt="ISAM industrial operations team" loading="lazy" />
              </div>
            </div>
          </div>
        </section>

        <section className="about-page__values section">
          <div className="container">
            <div className="section-title">
              <h2>{t('about.valuesSectionTitle')}</h2>
            </div>
            <div className="about-page__values-grid">
              {values.map((value, index) => (
                <div key={index} className="about-page__value-card">
                  <div className="about-page__value-icon">{valueIcons[index % valueIcons.length]}</div>
                  <h3>{value.title}</h3>
                  <p>{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="about-page__strategy section">
          <div className="container">
            <div className="about-page__strategy-grid">
              <article className="about-page__strategy-card">
                <h2>{t('about.challenges.title')}</h2>
                <ul>
                  {challenges.map((challenge) => (
                    <li key={challenge}>{challenge}</li>
                  ))}
                </ul>
              </article>

              <article className="about-page__strategy-card">
                <h2>{t('about.solutions.title')}</h2>
                <ul>
                  {solutions.map((solution) => (
                    <li key={solution}>{solution}</li>
                  ))}
                </ul>
              </article>
            </div>
          </div>
        </section>

        <section className="about-page__benefits section">
          <div className="container">
            <div className="section-title">
              <h2>{t('about.benefits.title')}</h2>
            </div>
            <div className="about-page__benefits-grid">
              <article className="about-page__benefit-card">
                <h3>{t('about.benefits.environment.title')}</h3>
                <ul>
                  {environmentalBenefits.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
              <article className="about-page__benefit-card">
                <h3>{t('about.benefits.financial.title')}</h3>
                <ul>
                  {financialBenefits.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
