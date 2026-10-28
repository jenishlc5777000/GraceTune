import { NavLink } from 'react-router-dom';
import { NAV } from './Sidebar';

/** Bottom tab bar for small screens; sits under the player bar. */
export function MobileNav() {
  return (
    <nav
      aria-label="Main"
      className="glass grid grid-cols-4 border-t border-line pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      {NAV.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold ${isActive ? 'text-fg' : 'text-muted'}`
          }
        >
          {({ isActive }) => (
            <>
              <Icon size={22} className={isActive ? 'text-highlight' : ''} />
              {label.replace('Your ', '')}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
