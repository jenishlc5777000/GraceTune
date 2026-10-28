import { Heart } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { CatalogTrack } from '@gracetunes/shared';
import { MediaCard } from '../components/MediaCard';
import { PlayButton } from '../components/PlayButton';
import { TrackList } from '../components/TrackList';
import {
  albumBySlug,
  albumTracks,
  artistBySlug,
  artistTracks,
  playlistBySlug,
  playlistTracks,
  totalDuration,
  trackBySlug,
} from '../lib/catalog';
import { sameList, usePlayer } from '../store/player';
import { useLibrary } from '../store/library';

const TABS = ['Liked songs', 'Playlists', 'Albums', 'Artists'] as const;

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-line px-6 py-14 text-center">
      <p className="font-semibold">{text}</p>
      <Link to="/search" className="mt-4 inline-block rounded-full bg-fg px-5 py-2 text-sm font-bold text-bg">
        Find something to save
      </Link>
    </div>
  );
}

export function Library() {
  const [tab, setTab] = useState<(typeof TABS)[number]>('Liked songs');
  const lib = useLibrary();
  const liked = lib.likedTracks.map((s) => trackBySlug.get(s)).filter((t): t is CatalogTrack => Boolean(t));
  const active = usePlayer((s) => sameList(s.queue, liked));
  const isPlaying = usePlayer((s) => s.isPlaying) && active;
  const { playList, toggle } = usePlayer();

  return (
    <div className="px-4 pt-6 pb-10 md:px-8">
      <h1 className="text-3xl font-extrabold tracking-tight">Your Library</h1>
      <div role="tablist" className="no-scrollbar mt-5 flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t}
            role="tab"
            type="button"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${tab === t ? 'bg-fg text-bg' : 'bg-surface hover:bg-surface-hover'}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === 'Liked songs' &&
          (liked.length ? (
            <>
              <div className="mb-6 flex items-center gap-5 rounded-3xl bg-gradient-to-br from-accent/80 via-accent-strong/70 to-transparent p-6 text-white">
                <div className="grid h-24 w-24 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-accent to-accent-strong shadow-2xl">
                  <Heart size={40} fill="white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-3xl font-extrabold">Liked Songs</h2>
                  <p className="text-white/75">
                    {liked.length} songs, {totalDuration(liked)}
                  </p>
                </div>
                <PlayButton size="lg" playing={isPlaying} onClick={() => (active ? toggle() : playList(liked))} />
              </div>
              <TrackList tracks={liked} />
            </>
          ) : (
            <EmptyState text="Songs you like will appear here. Tap the heart on any track." />
          ))}

        {tab !== 'Liked songs' && (() => {
          const cards =
            tab === 'Playlists'
              ? lib.savedPlaylists.flatMap((s) => {
                  const p = playlistBySlug.get(s);
                  return p ? [<MediaCard key={s} to={`/playlist/${s}`} title={p.title} subtitle={p.description} image={p.imageUrl} hue={p.hue} tracks={playlistTracks(p)} showTitle />] : [];
                })
              : tab === 'Albums'
                ? lib.savedAlbums.flatMap((s) => {
                    const a = albumBySlug.get(s);
                    return a ? [<MediaCard key={s} to={`/album/${s}`} title={a.title} subtitle={artistBySlug.get(a.artistSlug)?.name ?? ''} image={a.imageUrl} hue={a.hue} tracks={albumTracks(s)} />] : [];
                  })
                : lib.followedArtists.flatMap((s) => {
                    const a = artistBySlug.get(s);
                    return a ? [<MediaCard key={s} to={`/artist/${s}`} title={a.name} subtitle="Artist" image={a.imageUrl} hue={a.hue} tracks={artistTracks(s)} round />] : [];
                  });
          return cards.length ? (
            <div className="-mx-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">{cards}</div>
          ) : (
            <EmptyState text={`You haven't saved any ${tab.toLowerCase()} yet.`} />
          );
        })()}
      </div>
    </div>
  );
}
