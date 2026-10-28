import { Heart, Shuffle } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useEffect, type ReactNode } from 'react';
import type { CatalogTrack } from '@gracetunes/shared';
import { Cover } from '../components/Cover';
import { PlayButton } from '../components/PlayButton';
import { TrackList } from '../components/TrackList';
import {
  albumBySlug,
  albumTracks,
  artistBySlug,
  playlistBySlug,
  playlistTracks,
  totalDuration,
} from '../lib/catalog';
import { NotFound } from './NotFound';
import { sameList, usePlayer } from '../store/player';
import { useLibrary } from '../store/library';

interface HeroProps {
  kind: string;
  title: string;
  description?: string;
  hue: number;
  image: string;
  meta: ReactNode;
  tracks: CatalogTrack[];
  saved: boolean;
  onSave: () => void;
  showTitleOnCover?: boolean;
}

function CollectionView({ kind, title, description, hue, image, meta, tracks, saved, onSave, showTitleOnCover }: HeroProps) {
  const active = usePlayer((s) => sameList(s.queue, tracks));
  const isPlaying = usePlayer((s) => s.isPlaying) && active;
  const { playList, toggle, toggleShuffle } = usePlayer();
  const shuffle = usePlayer((s) => s.shuffle);

  return (
    <div>
      <header
        className="relative px-4 pt-10 pb-6 md:px-8 md:pt-16"
        style={{ background: `linear-gradient(180deg, hsl(${hue} 65% 40% / .75), hsl(${hue} 60% 25% / .25) 70%, transparent)` }}
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
          <Cover
            hue={hue}
            image={image}
            title={title}
            showTitle={showTitleOnCover}
            className="aspect-square w-48 self-center shadow-2xl shadow-black/50 sm:w-56 sm:self-auto"
          />
          <div className="min-w-0 animate-fade-up">
            <p className="text-sm font-semibold">{kind}</p>
            <h1 className="mt-1 text-4xl font-extrabold tracking-tight md:text-6xl">{title}</h1>
            {description && <p className="mt-3 max-w-xl text-muted">{description}</p>}
            <div className="mt-3 flex flex-wrap items-center gap-1.5 text-sm">{meta}</div>
          </div>
        </div>
      </header>

      <div className="flex items-center gap-5 px-4 py-5 md:px-8">
        <PlayButton size="lg" playing={isPlaying} onClick={() => (active ? toggle() : playList(tracks))} />
        <button
          type="button"
          aria-label="Shuffle"
          aria-pressed={shuffle}
          onClick={toggleShuffle}
          className={`transition hover:scale-105 ${shuffle ? 'text-highlight' : 'text-muted hover:text-fg'}`}
        >
          <Shuffle size={26} />
        </button>
        <button
          type="button"
          aria-label={saved ? 'Remove from library' : 'Save to library'}
          aria-pressed={saved}
          onClick={onSave}
          className={`transition hover:scale-105 ${saved ? 'text-highlight' : 'text-muted hover:text-fg'}`}
        >
          <Heart size={28} fill={saved ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="px-2 pb-10 md:px-6">
        <TrackList tracks={tracks} />
      </div>
    </div>
  );
}

export function PlaylistPage() {
  const { slug = '' } = useParams();
  const p = playlistBySlug.get(slug);
  const saved = useLibrary((s) => s.savedPlaylists.includes(slug));
  const { togglePlaylist, pushRecent } = useLibrary();
  useEffect(() => {
    if (p) pushRecent(`playlist:${slug}`);
  }, [p, slug, pushRecent]);
  if (!p) return <NotFound />;
  const list = playlistTracks(p);

  return (
    <CollectionView
      kind={p.kind === 'SUNDAY_SETLIST' ? 'Church setlist' : 'Playlist'}
      title={p.title}
      description={p.description}
      hue={p.hue}
      image={p.imageUrl}
      tracks={list}
      saved={saved}
      onSave={() => togglePlaylist(slug)}
      showTitleOnCover
      meta={
        <span className="text-muted">
          <span className="font-semibold text-fg">GraceTunes</span> · {list.length} songs, {totalDuration(list)}
        </span>
      }
    />
  );
}

export function AlbumPage() {
  const { slug = '' } = useParams();
  const a = albumBySlug.get(slug);
  const saved = useLibrary((s) => s.savedAlbums.includes(slug));
  const { toggleAlbum, pushRecent } = useLibrary();
  useEffect(() => {
    if (a) pushRecent(`album:${slug}`);
  }, [a, slug, pushRecent]);
  if (!a) return <NotFound />;
  const list = albumTracks(slug);
  const artist = artistBySlug.get(a.artistSlug);

  return (
    <CollectionView
      kind="Album"
      title={a.title}
      hue={a.hue}
      image={a.imageUrl}
      tracks={list}
      saved={saved}
      onSave={() => toggleAlbum(slug)}
      meta={
        <>
          <Cover image={artist?.imageUrl} hue={artist?.hue ?? 0} round className="h-6 w-6" />
          <Link to={`/artist/${a.artistSlug}`} className="font-semibold hover:underline">
            {artist?.name}
          </Link>
          <span className="text-muted">
            · {a.year} · {list.length} songs, {totalDuration(list)}
          </span>
        </>
      }
    />
  );
}
