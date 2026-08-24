import type { ReactNode } from 'react';
import { NavBar } from './NavBar';

interface AppShellProps {
  children: ReactNode;
}

// Two-column app frame: a fixed sidebar with primary navigation and a scrollable
// content area. Kept intentionally minimal for Phase 1.
export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <aside className="w-60 shrink-0 border-r border-slate-200 bg-white p-6">
        <NavBar />
      </aside>
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-8 py-10">{children}</div>
      </main>
    </div>
  );
}
