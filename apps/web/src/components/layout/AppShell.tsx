import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { MobileNav } from './MobileNav';
import { NowPlayingPanel } from './NowPlayingPanel';
import { PlayerBar } from './PlayerBar';
import { Sidebar } from './Sidebar';
import { usePlayer } from '../../store/player';
import { useThemeEngine } from '../../theme/useTheme';

export function AppShell() {
  useThemeEngine();
  const toggle = usePlayer((s) => s.toggle);
  const mainRef = useRef<HTMLElement>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [pathname]);

  // Space toggles playback unless the user is typing.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (e.code !== 'Space' || ['INPUT', 'TEXTAREA', 'BUTTON'].includes(el.tagName)) return;
      e.preventDefault();
      toggle();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggle]);

  return (
    <div className="app-glow flex h-full flex-col">
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <main
          ref={mainRef}
          id="main"
          className="scroll-area relative min-w-0 flex-1 overflow-y-auto md:my-2 md:mr-2 md:rounded-2xl md:border md:border-line md:bg-surface"
        >
          <Outlet />
        </main>
        <NowPlayingPanel />
      </div>
      <PlayerBar />
      <MobileNav />
    </div>
  );
}
