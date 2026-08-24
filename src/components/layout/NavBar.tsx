import { NavLink } from 'react-router-dom';
import { APP_NAME, NAV_ITEMS, ROUTES } from '../../config';
import { ThemeToggle } from './ThemeToggle';

const baseLink =
  'block rounded-md px-3 py-2 text-sm font-medium transition-colors';

export function NavBar() {
  return (
    <nav className="flex h-full flex-col gap-6">
      <NavLink
        to={ROUTES.welcome}
        className="text-lg font-semibold tracking-tight text-text"
      >
        {APP_NAME}
      </NavLink>

      <ul className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
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

      <div className="mt-auto">
        <ThemeToggle />
      </div>
    </nav>
  );
}
