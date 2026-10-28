import { ExternalLink, LogOut, Palette } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { APP_CONFIG } from '@gracetunes/shared';
import { WEB_URL } from '../lib/api';
import { useSession } from '../store/session';

const NAV = [{ to: '/settings/appearance', label: 'Appearance', icon: Palette }];

export function AdminLayout() {
  const { user, signOut } = useSession();

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="flex shrink-0 flex-col border-b border-slate-200 bg-white md:sticky md:top-0 md:h-screen md:w-60 md:border-r md:border-b-0 dark:border-white/10 dark:bg-white/[0.02]">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <img src="/favicon.svg" alt="" className="h-8 w-8 rounded-lg" />
          <div>
            <p className="text-sm font-bold">{APP_CONFIG.name}</p>
            <p className="text-xs text-slate-500">Admin</p>
          </div>
        </div>
        <nav className="flex gap-1 px-3 md:flex-col" aria-label="Admin">
          <p className="hidden px-2 pt-2 pb-1 text-[11px] font-semibold tracking-wider text-slate-400 uppercase md:block">
            Settings
          </p>
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5'
                }`
              }
            >
              <Icon size={17} /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto hidden space-y-1 border-t border-slate-200 p-3 md:block dark:border-white/10">
          <a
            href={WEB_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5"
          >
            <ExternalLink size={16} /> Open listener app
          </a>
          <div className="flex items-center gap-2 px-2.5 py-2">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user?.displayName}</p>
              <p className="truncate text-xs text-slate-500">{user?.role}</p>
            </div>
            <button
              type="button"
              onClick={signOut}
              aria-label="Sign out"
              title="Sign out"
              className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/5 dark:hover:text-white"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
    </div>
  );
}
