import { Link, Outlet } from 'react-router-dom';
import { AppNav } from './AppNav';
import { Footer } from './Footer';
import { useI18n } from '../i18n';

export function Layout() {
  const { t, locale, toggleLocale } = useI18n();

  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/" className="brand">
          <span className="brand-mark">{t.appName}</span>
          <span className="brand-sub ltr">v0.1</span>
        </Link>
        <AppNav />
        <div className="header-actions">
          <button
            type="button"
            className="lang-toggle"
            onClick={toggleLocale}
            aria-label={locale === 'en' ? t.common.arabic : t.common.english}
          >
            {locale === 'en' ? 'العربية' : 'English'}
          </button>
        </div>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
