import { Crown, Heart, Home, Library, Search } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { APP_CONFIG } from '@gracetunes/shared';
import { AppearanceMenu } from '../AppearanceMenu';
import { Cover } from '../Cover';
import { albumBySlug, artistBySlug, playlistBySlug } from '../../lib/catalog';
import { useLibrary } from '../../store/library';

export const NAV = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/search', label: 'Search', icon: Search },
  { to: '/library', label: 'Your Library', icon: Library },
  { to: '/premium', label: 'Premium', icon: Crown },
];

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5 px-3" aria-label={`${APP_CONFIG.name} home`}>
      <img src="/favicon.svg" alt="" className="h-9 w-9 rounded-xl shadow-lg shadow-accent/30" />
      <span className="text-lg font-extrabold tracking-tight">
        {APP_CONFIG.name.replace(/Tunes$/, '')}
        <span className="text-highlight">{APP_CONFIG.name.endsWith('Tunes') ? 'Tunes' : ''}</span>
      </span>
    </Link>
  );
}

export function Sidebar() {
  const { savedPlaylists, savedAlbums, followedArtists, likedTracks } = useLibrary();

  const items = [
    ...savedPlaylists.flatMap((s) => {
      const p = playlistBySlug.get(s);
      return p ? [{ to: `/playlist/${s}`, title: p.title, meta: 'Playlist', hue: p.hue, image: p.imageUrl, round: false }] : [];
    }),
    ...savedAlbums.flatMap((s) => {
      const a = albumBySlug.get(s);
      return a ? [{ to: `/album/${s}`, title: a.title, meta: 'Album', hue: a.hue, image: a.imageUrl, round: false }] : [];
    }),
    ...followedArtists.flatMap((s) => {
      const a = artistBySlug.get(s);
      return a ? [{ to: `/artist/${s}`, title: a.name, meta: 'Artist', hue: a.hue, image: a.imageUrl, round: true }] : [];
    }),
  ];

  return (
    <aside className="hidden w-72 shrink-0 flex-col gap-2 p-2 md:flex">
      <div className="rounded-2xl border border-line bg-surface py-5">
        <Logo />
        <nav className="mt-6 space-y-1 px-2" aria-label="Main">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-4 rounded-xl px-3 py-2.5 font-semibold transition ${
                  isActive ? 'bg-surface-hover text-fg' : 'text-muted hover:text-fg'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={21} className={isActive ? 'text-highlight' : ''} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-line bg-surface">
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <h2 className="font-bold text-muted">Saved</h2>
          <AppearanceMenu />
        </div>
        <div className="scroll-area min-h-0 flex-1 space-y-0.5 overflow-y-auto px-2 pb-3">
          <NavLink
            to="/library"
            className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-surface-hover"
          >
            <div className="grid h-12 w-12 place-items-center rounded-lg bg-gradient-to-br from-accent to-accent-strong">
              <Heart size={20} fill="white" className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold">Liked Songs</p>
              <p className="text-sm text-muted">Playlist · {likedTracks.length} songs</p>
            </div>
          </NavLink>
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl p-2 transition hover:bg-surface-hover ${isActive ? 'bg-surface-hover' : ''}`
              }
            >
              <Cover image={it.image} hue={it.hue} title={it.title} round={it.round} className={`h-12 w-12 ${it.round ? "" : "!rounded-lg"}`} />
              <div className="min-w-0">
                <p className="truncate font-semibold">{it.title}</p>
                <p className="text-sm text-muted">{it.meta}</p>
              </div>
            </NavLink>
          ))}
        </div>
      </div>
    </aside>
  );
}
