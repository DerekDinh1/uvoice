import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { WelcomePage } from './pages/WelcomePage';
import { AssessmentPage } from './pages/AssessmentPage';
import { ProfilePage } from './pages/ProfilePage';
import { PromptPage } from './pages/PromptPage';
import { SettingsPage } from './pages/SettingsPage';
import { ROUTES } from './config';

// HashRouter is used deliberately: GitHub Pages is static hosting and cannot
// rewrite unknown deep-link paths to index.html, so hash routing keeps refresh
// and shared links working without a server-side shim.
export default function App() {
  return (
    <HashRouter>
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
