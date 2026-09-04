import { useEffect, useState, type ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { APP_NAME, ROUTES } from '../../config';
import { NavBar, NavLinks } from './NavBar';
import { ThemeToggle } from './ThemeToggle';
import { FOCUS_RING } from './focusRing';

interface AppShellProps {
  children: ReactNode;
}

const brandLinkClass = `rounded-md text-lg font-semibold tracking-tight text-text ${FOCUS_RING}`;

// Two-column app frame: a fixed sidebar with primary navigation and a scrollable
// content area. Below the md breakpoint the sidebar is replaced by a top bar
// with a disclosure menu, since a fixed 240px sidebar does not fit a phone
// screen. Colors come from semantic theme tokens.
export function AppShell({ children }: AppShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();

  // Close the mobile menu on any navigation (link click, back/forward, etc.)
  // so it never stays open over the newly loaded screen.
  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-bg text-text md:flex-row">
      <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-3 md:hidden">
        <NavLink to={ROUTES.welcome} className={brandLinkClass}>
          {APP_NAME}
        </NavLink>
        <button
          type="button"
          onClick={() => setMobileNavOpen((open) => !open)}
          aria-expanded={mobileNavOpen}
          aria-controls="mobile-nav-panel"
          className={`rounded-md p-2 text-text hover:bg-surface-2 ${FOCUS_RING}`}
        >
          <span className="sr-only">
            {mobileNavOpen ? 'Close menu' : 'Open menu'}
          </span>
          {mobileNavOpen ? (
            <svg
              viewBox="0 0 24 24"
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          )}
        </button>
      </header>

      {mobileNavOpen && (
        <div
          id="mobile-nav-panel"
          className="border-b border-border bg-surface px-4 py-4 md:hidden"
        >
          <NavLinks onNavigate={() => setMobileNavOpen(false)} />
          <div className="mt-4">
            <ThemeToggle />
          </div>
        </div>
      )}

      <aside className="hidden w-60 shrink-0 border-r border-border bg-surface p-6 md:block">
        <NavBar />
      </aside>

      <main
        id="main-content"
        tabIndex={-1}
        className={`flex-1 overflow-y-auto ${FOCUS_RING}`}
      >
        <div className="mx-auto max-w-3xl px-4 py-6 md:px-8 md:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
