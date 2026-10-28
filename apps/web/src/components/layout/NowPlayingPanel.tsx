import { BookOpen, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import type { CatalogTrack } from '@gracetunes/shared';
import { Cover } from '../Cover';
import { Equalizer } from '../Equalizer';
import { artistBySlug, artistName, formatDuration } from '../../lib/catalog';
import { usePlayer } from '../../store/player';

function SyncedLyrics({ track }: { track: CatalogTrack }) {
  const position = usePlayer((s) => s.position);
  const seek = usePlayer((s) => s.seek);
  const activeRef = useRef<HTMLButtonElement>(null);
  const lines = track.lyrics ?? [];
  const ms = position * 1000;
  const active = lines.findLastIndex((l) => l.timeMs <= ms);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [active]);

  if (!lines.length) {
    return (
      <p className="rounded-2xl border border-dashed border-line p-5 text-sm text-muted">
        This track is instrumental, so it has no lyrics.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {lines.map((l, i) => (
        <button
          key={l.timeMs}
          ref={i === active ? activeRef : undefined}
          type="button"
          onClick={() => seek(l.timeMs / 1000)}
          className={`block text-left font-bold text-2xl leading-snug transition duration-300 ${
            i === active ? 'scale-[1.02] text-fg' : i < active ? 'text-muted/60' : 'text-muted'
          } hover:text-fg`}
        >
          {l.text}
        </button>
      ))}
    </div>
  );
}

function QueueList() {
  const { queue, order, cursor, isPlaying } = usePlayer();
  const playList = usePlayer((s) => s.playList);
  const upcoming = order.slice(cursor + 1).map((i) => queue[i]!);
  const now = queue[order[cursor] ?? -1];

  const Row = ({ t, playing }: { t: CatalogTrack; playing?: boolean }) => (
    <button
      type="button"
      onClick={() => playList(queue, queue.indexOf(t))}
      className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition hover:bg-surface-hover"
    >
      <Cover image={t.imageUrl} hue={t.hue} title={t.title} className="h-11 w-11 !rounded-md" />
      <div className="min-w-0 flex-1">
        <p className={`truncate font-semibold ${playing ? 'text-highlight' : ''}`}>{t.title}</p>
        <p className="truncate text-sm text-muted">{artistName(t)}</p>
      </div>
      {playing ? <Equalizer paused={!isPlaying} /> : <span className="text-xs text-muted">{formatDuration(t.durationSec)}</span>}
    </button>
  );

  return (
    <div className="space-y-5">
      {now && (
        <div>
          <h3 className="mb-2 text-sm font-bold text-muted">Now playing</h3>
          <Row t={now} playing />
        </div>
      )}
      <div>
        <h3 className="mb-2 text-sm font-bold text-muted">Next up</h3>
        {upcoming.length ? (
          upcoming.map((t, i) => <Row key={`${t.slug}-${i}`} t={t} />)
        ) : (
          <p className="text-sm text-muted">Nothing queued. Add songs with the + button.</p>
        )}
      </div>
    </div>
  );
}

export function NowPlayingPanel() {
  const panel = usePlayer((s) => s.panel);
  const setPanel = usePlayer((s) => s.setPanel);
  const track = usePlayer((s) => s.current());
  if (panel === 'none' || !track) return null;
  const artist = artistBySlug.get(track.artistSlug);

  return (
    <aside
      aria-label={panel === 'lyrics' ? 'Now playing' : 'Queue'}
      className="fixed inset-x-0 top-0 bottom-[136px] z-30 flex flex-col overflow-hidden border-line bg-elevated md:static md:inset-auto md:my-2 md:mr-2 md:w-[360px] md:shrink-0 md:rounded-2xl md:border"
      style={{
        backgroundImage: `linear-gradient(180deg, hsl(${track.hue} 60% 35% / .35), transparent 45%)`,
      }}
    >
      <div className="flex items-center justify-between px-5 pt-4">
        <div className="flex gap-1 rounded-full bg-surface p-1 text-sm font-semibold">
          {(['lyrics', 'queue'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => panel !== p && setPanel(p)}
              className={`rounded-full px-3 py-1 capitalize transition ${panel === p ? 'bg-fg text-bg' : 'text-muted hover:text-fg'}`}
            >
              {p === 'lyrics' ? 'Now playing' : 'Queue'}
            </button>
          ))}
        </div>
        <button
          type="button"
          aria-label="Close panel"
          onClick={() => setPanel(panel)}
          className="grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-surface-hover hover:text-fg"
        >
          <X size={18} />
        </button>
      </div>

      <div className="scroll-area flex-1 overflow-y-auto px-5 pt-5 pb-8">
        {panel === 'queue' ? (
          <QueueList />
        ) : (
          <div className="space-y-6">
            <Cover image={track.imageUrl} hue={track.hue} title={track.title} className="aspect-square w-full shadow-2xl shadow-black/40" />
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight">{track.title}</h2>
              <Link to={`/artist/${track.artistSlug}`} className="text-muted hover:text-fg hover:underline">
                {artist?.name}
              </Link>
            </div>

            {track.verse && (
              <figure className="rounded-2xl border border-highlight/25 bg-highlight/10 p-4">
                <figcaption className="mb-1.5 flex items-center gap-2 text-xs font-bold tracking-wider text-highlight uppercase">
                  <BookOpen size={14} /> {track.verse.reference}
                </figcaption>
                <blockquote className="font-display text-[15px] leading-relaxed italic">
                  “{track.verse.text}”
                </blockquote>
              </figure>
            )}

            <section>
              <h3 className="mb-3 text-sm font-bold tracking-wider text-muted uppercase">Lyrics</h3>
              <SyncedLyrics track={track} />
            </section>

            {artist && (
              <section className="rounded-2xl bg-surface p-4">
                <h3 className="mb-1 text-sm font-bold tracking-wider text-muted uppercase">About the artist</h3>
                <p className="font-bold">{artist.name}</p>
                <p className="mt-1 text-sm text-muted">{artist.bio}</p>
              </section>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
