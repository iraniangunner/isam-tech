import { Link } from 'react-router-dom';
import { useLanguage } from '../hooks/useTranslation';
import { getPath } from '../utils/routes';
import SEOHead from '../components/common/SEOHead';

export default function NotFound() {
  const { t, language } = useLanguage();

  return (
    <>
      <SEOHead pageKey="notFound" noindex />
      <div className="legal-page" style={{ textAlign: 'center' }}>
        <div className="container">
          <header className="legal-page__header" style={{ borderBottom: 'none' }}>
            <h1 style={{ fontSize: '4rem', marginBottom: 'var(--spacing-md)' }}>404</h1>
            <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', margin: 0 }}>
              {t('notFound.message')}
            </p>
          </header>
          <Link to={getPath(language, 'home')} className="btn btn-primary btn-lg">
            {t('notFound.backHome')}
          </Link>
        </div>
      </div>
    </>
  );
}
