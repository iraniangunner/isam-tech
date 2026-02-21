import { useLanguage } from '../hooks/useTranslation';
import SEOHead from '../components/common/SEOHead';
import './Legal.css';

export default function PrivacyPolicy() {
  const { t } = useLanguage();
  const sections = Array.isArray(t('privacy.sections')) ? t('privacy.sections') : [];

  return (
    <>
      <SEOHead pageKey="privacyPolicy" />
      <div className="legal-page">
        <div className="container">
          <header className="legal-page__header">
            <h1>{t('privacy.title')}</h1>
            <p className="legal-page__updated">
              {t('privacy.lastUpdated')}: {t('legal.lastUpdatedDate')}
            </p>
          </header>

          <div className="legal-page__content">
            <p className="legal-page__intro">{t('privacy.intro')}</p>
            
            {sections.map((section) => (
              <section key={section.title} className="legal-page__section">
                <h2>{section.title}</h2>
                <p style={{ whiteSpace: 'pre-line' }}>{section.text}</p>
              </section>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
