import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { Cover } from '../components/Cover';
import { Equalizer } from '../components/Equalizer';
import { MediaCard } from '../components/MediaCard';
import { PlayButton } from '../components/PlayButton';
import { Shelf } from '../components/Shelf';
import { TrackList } from '../components/TrackList';
import { VerseCard } from '../components/VerseCard';
import {
  albumTracks,
  artistBySlug,
  artistTracks,
  artists,
  moods,
  newReleases,
  playlistBySlug,
  playlists,
  playlistTracks,
  tracks,
  trending,
} from '../lib/catalog';
import { sameList, usePlayer } from '../store/player';

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return 'Peaceful night';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function QuickPick({ slug }: { slug: string }) {
  const p = playlistBySlug.get(slug)!;
  const list = playlistTracks(p);
  const active = usePlayer((s) => sameList(s.queue, list));
  const isPlaying = usePlayer((s) => s.isPlaying) && active;
  const playList = usePlayer((s) => s.playList);
  const toggle = usePlayer((s) => s.toggle);

  return (
    <Link
      to={`/playlist/${slug}`}
      className="group flex items-center gap-3 overflow-hidden rounded-xl bg-surface pr-3 transition hover:bg-surface-hover"
    >
      <Cover image={p.imageUrl} hue={p.hue} title={p.title} className="h-14 w-14 !rounded-none md:h-16 md:w-16" />
      <span className="min-w-0 flex-1 truncate text-sm font-bold md:text-base">{p.title}</span>
      {active && isPlaying ? (
        <span className="group-hover:hidden">
          <Equalizer />
        </span>
      ) : null}
      <PlayButton
        playing={isPlaying}
        onClick={() => (active ? toggle() : playList(list))}
        className={`!h-9 !w-9 ${active && isPlaying ? 'hidden group-hover:grid' : 'opacity-0 group-hover:opacity-100'}`}
      />
    </Link>
  );
}

export function Home() {
  const editorial = playlists.filter((p) => p.kind === 'EDITORIAL');
  const madeForYou = playlists.filter((p) => p.kind === 'MADE_FOR_YOU' || p.kind === 'SUNDAY_SETLIST');

  return (
    <div className="space-y-10 px-4 pt-6 pb-10 md:px-8">
      <header className="animate-fade-up">
        <p className="text-sm font-semibold tracking-wider text-highlight uppercase">{greeting()}</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight md:text-4xl">What will you worship to today?</h1>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <VerseCard />
        <div className="grid grid-cols-2 content-start gap-2 lg:grid-cols-1 xl:grid-cols-2">
          {['sunrise-worship', 'deep-prayer', 'joyful-noise', 'timeless-hymns', 'south-indian-worship', 'kids-bedtime'].map(
            (s) => <QuickPick key={s} slug={s} />,
          )}
        </div>
      </div>

      <Shelf title="Made for you" subtitle="Mixes and setlists picked for you">
        {madeForYou.map((p) => (
          <MediaCard key={p.slug} to={`/playlist/${p.slug}`} title={p.title} subtitle={p.description} image={p.imageUrl} hue={p.hue} tracks={playlistTracks(p)} showTitle />
        ))}
        {editorial.slice(0, 3).map((p) => (
          <MediaCard key={p.slug} to={`/playlist/${p.slug}`} title={p.title} subtitle={p.description} image={p.imageUrl} hue={p.hue} tracks={playlistTracks(p)} showTitle />
        ))}
      </Shelf>

      <section className="animate-fade-up">
        <div className="mb-2 flex items-end justify-between px-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Trending worship</h2>
            <p className="text-sm text-muted">Most played this week</p>
          </div>
          <Link to="/search" className="text-sm font-semibold text-muted hover:text-fg">
            Show all
          </Link>
        </div>
        <TrackList tracks={trending.slice(0, 5)} showPlays />
      </section>

      <Shelf title="New releases" subtitle="Fresh albums from artists you follow">
        {newReleases.map((a) => (
          <MediaCard
            key={a.slug}
            to={`/album/${a.slug}`}
            title={a.title}
            subtitle={`${a.year} · ${artistBySlug.get(a.artistSlug)?.name}`}
            image={a.imageUrl} hue={a.hue}
            tracks={albumTracks(a.slug)}
          />
        ))}
      </Shelf>

      <section className="animate-fade-up px-3">
        <h2 className="mb-3 text-xl font-bold tracking-tight">Browse by mood</h2>
        <div className="flex flex-wrap gap-2">
          {moods.map((m) => (
            <Link
              key={m.slug}
              to={`/search?mood=${m.slug}`}
              className="rounded-full border border-line px-4 py-2 text-sm font-semibold transition hover:border-transparent hover:bg-[hsl(var(--h)_65%_45%)] hover:text-white"
              style={{ '--h': m.hue } as CSSProperties}
            >
              {m.name}
            </Link>
          ))}
        </div>
      </section>

      <Shelf title="Artists" subtitle={`${tracks.length} original demo songs to explore`}>
        {artists.map((a) => (
          <MediaCard key={a.slug} to={`/artist/${a.slug}`} title={a.name} subtitle="Artist" image={a.imageUrl} hue={a.hue} tracks={artistTracks(a.slug)} round />
        ))}
      </Shelf>
    </div>
  );
}
