import { Clock3, Heart, ListPlus, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { CatalogTrack } from '@gracetunes/shared';
import { Cover } from './Cover';
import { Equalizer } from './Equalizer';
import { albumTitle, artistBySlug, formatCount, formatDuration, playCount } from '../lib/catalog';
import { sameList, usePlayer } from '../store/player';
import { useLibrary } from '../store/library';

interface TrackListProps {
  tracks: CatalogTrack[];
  showAlbum?: boolean;
  showPlays?: boolean;
}

export function TrackList({ tracks, showAlbum = true, showPlays = false }: TrackListProps) {
  const current = usePlayer((s) => s.current());
  const isPlaying = usePlayer((s) => s.isPlaying);
  const inThisList = usePlayer((s) => sameList(s.queue, tracks));
  const playList = usePlayer((s) => s.playList);
  const addToQueue = usePlayer((s) => s.addToQueue);
  const liked = useLibrary((s) => s.likedTracks);
  const toggleLike = useLibrary((s) => s.toggleLike);

  if (!tracks.length) return null;

  return (
    <div role="table" aria-label="Tracks" className="text-sm">
      <div
        role="row"
        className="grid grid-cols-[2rem_1fr_auto] items-center gap-4 border-b border-line px-4 pb-2 text-xs font-medium tracking-wider text-muted uppercase md:grid-cols-[2rem_1.4fr_1fr_auto]"
      >
        <span>#</span>
        <span>Title</span>
        <span className="hidden md:block">{showPlays ? 'Plays' : showAlbum ? 'Album' : ''}</span>
        <Clock3 size={14} className="mr-12 justify-self-end" aria-label="Duration" />
      </div>
      <div className="mt-2">
        {tracks.map((t, i) => {
          const active = inThisList && current?.slug === t.slug;
          const isLiked = liked.includes(t.slug);
          return (
            <div
              key={t.slug}
              role="row"
              onDoubleClick={() => playList(tracks, i)}
              className={`group grid grid-cols-[2rem_1fr_auto] items-center gap-4 rounded-lg px-4 py-2 transition hover:bg-surface-hover md:grid-cols-[2rem_1.4fr_1fr_auto] ${active ? 'bg-surface' : ''}`}
            >
              <button
                type="button"
                aria-label={`Play ${t.title}`}
                onClick={() => playList(tracks, i)}
                className="grid h-6 w-6 place-items-center text-muted"
              >
                {active && isPlaying ? (
                  <span className="group-hover:hidden">
                    <Equalizer />
                  </span>
                ) : (
                  <span className={`group-hover:hidden ${active ? 'text-highlight' : ''}`}>{i + 1}</span>
                )}
                <Play size={14} fill="currentColor" className="hidden text-fg group-hover:block" />
              </button>

              <div className="flex min-w-0 items-center gap-3">
                <Cover image={t.imageUrl} hue={t.hue} title={t.title} className="h-10 w-10 !rounded-md" />
                <div className="min-w-0">
                  <p className={`truncate font-medium ${active ? 'text-highlight' : ''}`}>{t.title}</p>
                  <Link
                    to={`/artist/${t.artistSlug}`}
                    className="truncate text-muted hover:text-fg hover:underline"
                  >
                    {artistBySlug.get(t.artistSlug)?.name}
                  </Link>
                </div>
              </div>

              <span className="hidden truncate text-muted md:block">
                {showPlays ? (
                  formatCount(playCount(t))
                ) : showAlbum ? (
                  <Link to={`/album/${t.albumSlug}`} className="hover:text-fg hover:underline">
                    {albumTitle(t)}
                  </Link>
                ) : null}
              </span>

              <div className="flex items-center gap-3 justify-self-end text-muted">
                <button
                  type="button"
                  aria-label={isLiked ? 'Remove from Liked Songs' : 'Save to Liked Songs'}
                  aria-pressed={isLiked}
                  onClick={() => toggleLike(t.slug)}
                  className={`transition hover:text-fg ${isLiked ? 'text-highlight' : 'opacity-0 group-hover:opacity-100 focus-visible:opacity-100'}`}
                >
                  <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
                </button>
                <span className="w-10 text-right tabular-nums">{formatDuration(t.durationSec)}</span>
                <button
                  type="button"
                  aria-label={`Add ${t.title} to queue`}
                  onClick={() => addToQueue(t)}
                  className="opacity-0 transition group-hover:opacity-100 hover:text-fg focus-visible:opacity-100"
                >
                  <ListPlus size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
