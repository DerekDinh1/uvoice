import { useEffect, useRef, useState } from 'react';
import {
  HashRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { WelcomePage } from './pages/WelcomePage';
import { AssessmentPage } from './pages/AssessmentPage';
import { ProfilePage } from './pages/ProfilePage';
import { PromptPage } from './pages/PromptPage';
import { SettingsPage } from './pages/SettingsPage';
import { useThemeStore } from './store/useThemeStore';
import { applyTheme, watchSystemTheme } from './lib/theme';
import { ROUTES, NAV_ITEMS } from './config';

// Maps each route to a human-readable label for the screen-reader
// announcement below. Built from NAV_ITEMS plus the welcome route, which is
// only reachable via the brand link and has no NAV_ITEMS entry.
const ROUTE_LABELS: Record<string, string> = {
  [ROUTES.welcome]: 'Welcome',
  ...Object.fromEntries(NAV_ITEMS.map((item) => [item.path, item.label])),
};

// Keyboard and screen-reader users get no signal when the route changes,
// since AppShell's <main> never moves and QuestionCard's remount (key
// change) only ever drops focus back to <body>. This moves focus to the
// focusable main region and announces the new screen, but only on an actual
// path change, never on the initial mount or on in-page interactions.
function RouteFocusManager() {
  const location = useLocation();
  const [announcement, setAnnouncement] = useState('');
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    document.getElementById('main-content')?.focus();
    setAnnouncement(`Now viewing ${ROUTE_LABELS[location.pathname] ?? 'page'}`);
  }, [location.pathname]);

  return (
    <div aria-live="polite" className="sr-only">
      {announcement}
    </div>
  );
}

// HashRouter is used deliberately: GitHub Pages is static hosting and cannot
// rewrite unknown deep-link paths to index.html, so hash routing keeps refresh
// and shared links working without a server-side shim.
export default function App() {
  const mode = useThemeStore((state) => state.mode);

  useEffect(() => {
    applyTheme(mode);
    // Only follow OS changes while in "system" mode.
    if (mode !== 'system') return;
    return watchSystemTheme(() => applyTheme('system'));
  }, [mode]);

  return (
    <HashRouter>
      <RouteFocusManager />
      <AppShell>
        <Routes>
          <Route path={ROUTES.welcome} element={<WelcomePage />} />
          <Route path={ROUTES.assessment} element={<AssessmentPage />} />
          <Route path={ROUTES.profile} element={<ProfilePage />} />
          <Route path={ROUTES.prompt} element={<PromptPage />} />
          <Route path={ROUTES.settings} element={<SettingsPage />} />
          <Route path="*" element={<Navigate to={ROUTES.welcome} replace />} />
        </Routes>
      </AppShell>
    </HashRouter>
  );
}
