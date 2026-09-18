import { useI18n } from '../i18n';

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="app-footer">
      <div className="footer-inner">
        <p className="footer-copyright">{t.footer.copyright}</p>
        <p className="footer-rights ltr">{t.footer.rights}</p>
        <p className="footer-disclaimer">{t.footer.disclaimer}</p>
      </div>
    </footer>
  );
}
