import type { ReactNode } from 'react';
import { NavBar } from './NavBar';

interface AppShellProps {
  children: ReactNode;
}

// Two-column app frame: a fixed sidebar with primary navigation and a scrollable
// content area. Colors come from semantic theme tokens.
export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-bg text-text">
      <aside className="w-60 shrink-0 border-r border-border bg-surface p-6">
        <NavBar />
      </aside>
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-8 py-10">{children}</div>
      </main>
    </div>
  );
}
