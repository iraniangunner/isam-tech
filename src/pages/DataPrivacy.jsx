import { useLanguage } from '../hooks/useTranslation';
import SEOHead from '../components/common/SEOHead';
import './Legal.css';

export default function DataPrivacy() {
  const { t } = useLanguage();
  const sections = Array.isArray(t('dataPrivacy.sections')) ? t('dataPrivacy.sections') : [];

  return (
    <>
      <SEOHead pageKey="dataPrivacy" />
      <div className="legal-page">
        <div className="container">
          <header className="legal-page__header">
            <h1>{t('dataPrivacy.title')}</h1>
            <p className="legal-page__updated">
              {t('dataPrivacy.lastUpdated')}: {t('legal.lastUpdatedDate')}
            </p>
          </header>

          <div className="legal-page__content">
            <p className="legal-page__intro">{t('dataPrivacy.intro')}</p>
            
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
