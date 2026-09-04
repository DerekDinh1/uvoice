import { NavLink } from 'react-router-dom';
import { APP_NAME, NAV_ITEMS, ROUTES } from '../../config';
import { ThemeToggle } from './ThemeToggle';
import { FOCUS_RING } from './focusRing';

const baseLink = `block rounded-md px-3 py-2 text-sm font-medium transition-colors ${FOCUS_RING}`;

interface NavLinksProps {
  // Called after a link is activated, used to close the mobile disclosure.
  onNavigate?: () => void;
}

// The primary navigation links, shared by the desktop sidebar and the
// small-screen disclosure panel so both stay in sync with NAV_ITEMS.
export function NavLinks({ onNavigate }: NavLinksProps) {
  return (
    <ul className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => (
        <li key={item.path}>
          <NavLink
            to={item.path}
            onClick={onNavigate}
            className={({ isActive }) =>
              `${baseLink} ${
                isActive
                  ? 'bg-accent text-accent-fg'
                  : 'text-muted hover:bg-surface-2 hover:text-text'
              }`
            }
          >
            {item.label}
          </NavLink>
        </li>
      ))}
    </ul>
  );
}

export function NavBar() {
  return (
    <nav className="flex h-full flex-col gap-6">
      <NavLink
        to={ROUTES.welcome}
        className={`rounded-md text-lg font-semibold tracking-tight text-text ${FOCUS_RING}`}
      >
        {APP_NAME}
      </NavLink>

      <NavLinks />

      <div className="mt-auto">
        <ThemeToggle />
      </div>
    </nav>
  );
}
