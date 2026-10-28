import { Search as SearchIcon, X } from 'lucide-react';
import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MediaCard } from '../components/MediaCard';
import { Shelf } from '../components/Shelf';
import { TrackList } from '../components/TrackList';
import {
  albumTracks,
  albums,
  artistBySlug,
  artistTracks,
  artists,
  genreBySlug,
  genres,
  languages,
  moods,
  playlists,
  playlistTracks,
  tracks,
} from '../lib/catalog';

const norm = (s: string) => s.toLowerCase().normalize('NFKD');

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${active ? 'bg-fg text-bg' : 'bg-surface hover:bg-surface-hover'}`}
    >
      {children}
    </button>
  );
}

export function Search() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const genre = params.get('genre');
  const mood = params.get('mood');
  const lang = params.get('lang');

  const update = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const hasQuery = Boolean(q || genre || mood || lang);

  const results = useMemo(() => {
    const term = norm(q.trim());
    const matchText = (...fields: (string | undefined)[]) =>
      !term || fields.some((f) => f && norm(f).includes(term));
    return {
      tracks: tracks.filter(
        (t) =>
          matchText(t.title, artistBySlug.get(t.artistSlug)?.name, genreBySlug.get(t.genreSlug)?.name, t.verse?.reference) &&
          (!genre || t.genreSlug === genre) &&
          (!mood || t.moodSlugs.includes(mood)) &&
          (!lang || t.languageCode === lang),
      ),
      artists: term ? artists.filter((a) => matchText(a.name)) : [],
      albums: term ? albums.filter((a) => matchText(a.title, artistBySlug.get(a.artistSlug)?.name)) : [],
      playlists: term ? playlists.filter((p) => matchText(p.title, p.description)) : [],
    };
  }, [q, genre, mood, lang]);

  const empty =
    !results.tracks.length && !results.artists.length && !results.albums.length && !results.playlists.length;

  return (
    <div className="space-y-8 px-4 pt-6 pb-10 md:px-8">
      <div className="sticky top-0 z-10 -mx-4 space-y-3 px-4 pt-1 pb-3 backdrop-blur-xl md:-mx-8 md:px-8">
        <label className="relative block max-w-xl">
          <span className="sr-only">Search</span>
          <SearchIcon size={20} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted" />
          <input
            autoFocus
            value={q}
            onChange={(e) => update('q', e.target.value)}
            placeholder="Songs, artists, verses, playlists…"
            className="w-full rounded-full border border-line bg-elevated py-3.5 pr-12 pl-12 font-medium shadow-lg shadow-black/10 outline-none placeholder:text-muted focus:border-highlight/60"
          />
          {q && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => update('q', null)}
              className="absolute top-1/2 right-4 -translate-y-1/2 text-muted hover:text-fg"
            >
              <X size={18} />
            </button>
          )}
        </label>
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {moods.map((m) => (
            <Chip key={m.slug} active={mood === m.slug} onClick={() => update('mood', mood === m.slug ? null : m.slug)}>
              {m.name}
            </Chip>
          ))}
          <span className="mx-1 w-px shrink-0 bg-line" />
          {languages.map((l) => (
            <Chip key={l.code} active={lang === l.code} onClick={() => update('lang', lang === l.code ? null : l.code)}>
              {l.nativeName}
            </Chip>
          ))}
        </div>
        {genre && (
          <p className="text-sm text-muted">
            Genre: <span className="font-semibold text-fg">{genreBySlug.get(genre)?.name}</span>{' '}
            <button type="button" onClick={() => update('genre', null)} className="ml-1 underline hover:text-fg">
              clear
            </button>
          </p>
        )}
      </div>

      {!hasQuery ? (
        <section>
          <h2 className="mb-4 text-xl font-bold">Browse all</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {genres.map((g, i) => (
              <Link
                key={g.slug}
                to={`/search?genre=${g.slug}`}
                className="group relative aspect-[1.4] animate-fade-up overflow-hidden rounded-2xl p-4 text-white shadow-lg transition hover:scale-[1.02]"
                style={{
                  animationDelay: `${i * 30}ms`,
                  background: `linear-gradient(135deg, hsl(${g.hue} 70% 50%), hsl(${(g.hue + 30) % 360} 75% 28%))`,
                }}
              >
                <span className="text-lg font-extrabold">{g.name}</span>
                <span
                  aria-hidden
                  className="absolute -right-6 -bottom-6 h-24 w-24 rotate-[25deg] rounded-xl bg-white/20 shadow-2xl transition group-hover:rotate-[15deg]"
                />
              </Link>
            ))}
          </div>
        </section>
      ) : empty ? (
        <div className="py-16 text-center">
          <p className="text-xl font-bold">No results{q ? ` for “${q}”` : ''}</p>
          <p className="mt-2 text-muted">Try another spelling, or remove a filter.</p>
        </div>
      ) : (
        <>
          {results.tracks.length > 0 && (
            <section>
              <h2 className="mb-2 px-3 text-xl font-bold">Songs</h2>
              <TrackList tracks={results.tracks} />
            </section>
          )}
          {results.artists.length > 0 && (
            <Shelf title="Artists">
              {results.artists.map((a) => (
                <MediaCard key={a.slug} to={`/artist/${a.slug}`} title={a.name} subtitle="Artist" image={a.imageUrl} hue={a.hue} tracks={artistTracks(a.slug)} round />
              ))}
            </Shelf>
          )}
          {results.albums.length > 0 && (
            <Shelf title="Albums">
              {results.albums.map((a) => (
                <MediaCard key={a.slug} to={`/album/${a.slug}`} title={a.title} subtitle={`${a.year} · ${artistBySlug.get(a.artistSlug)?.name}`} image={a.imageUrl} hue={a.hue} tracks={albumTracks(a.slug)} />
              ))}
            </Shelf>
          )}
          {results.playlists.length > 0 && (
            <Shelf title="Playlists">
              {results.playlists.map((p) => (
                <MediaCard key={p.slug} to={`/playlist/${p.slug}`} title={p.title} subtitle={p.description} image={p.imageUrl} hue={p.hue} tracks={playlistTracks(p)} showTitle />
              ))}
            </Shelf>
          )}
        </>
      )}
    </div>
  );
}
