import { NavLink } from 'react-router-dom';
import { useI18n } from '../i18n';

export function AppNav() {
  const { t } = useI18n();

  const links = [
    { to: '/', label: t.nav.library, end: true },
    { to: '/import', label: t.nav.import },
    { to: '/viewer', label: t.nav.viewer },
    { to: '/search', label: t.nav.search },
    { to: '/ask', label: t.nav.ask },
    { to: '/packages', label: t.nav.packages },
    { to: '/settings', label: t.nav.settings },
    { to: '/about', label: t.nav.about },
  ];

  return (
    <nav className="app-nav" aria-label="Main navigation">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.end}
          className={({ isActive }) => (isActive ? 'active' : undefined)}
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}
