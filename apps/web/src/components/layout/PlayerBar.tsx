import {
  Gauge,
  Heart,
  ListMusic,
  MicVocal,
  MoonStar,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume1,
  Volume2,
  VolumeX,
} from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Cover } from '../Cover';
import { PlayButton } from '../PlayButton';
import { artistName, formatDuration } from '../../lib/catalog';
import { usePlayer } from '../../store/player';
import { useLibrary } from '../../store/library';

const RATES = [0.75, 1, 1.25, 1.5, 2];
const SLEEP_MINUTES = 15;

function IconToggle({
  label,
  active,
  onClick,
  children,
  className = '',
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      title={label}
      onClick={onClick}
      className={`relative grid h-8 w-8 place-items-center rounded-full transition hover:text-fg ${active ? 'text-highlight' : 'text-muted'} ${className}`}
    >
      {children}
      {active && <span className="absolute -bottom-0.5 h-1 w-1 rounded-full bg-highlight" />}
    </button>
  );
}

export function PlayerBar() {
  const p = usePlayer();
  const track = p.current();
  const liked = useLibrary((s) => (track ? s.likedTracks.includes(track.slug) : false));
  const toggleLike = useLibrary((s) => s.toggleLike);

  if (!track) {
    return (
      <div className="glass flex h-[72px] items-center justify-center border-t border-line px-4 text-sm text-muted">
        Pick a song to start listening. Every track here is an original demo.
      </div>
    );
  }

  const pct = p.duration ? (p.position / p.duration) * 100 : 0;
  const VolumeIcon = p.muted || p.volume === 0 ? VolumeX : p.volume < 0.5 ? Volume1 : Volume2;

  return (
    <div className="glass relative border-t border-line">
      {/* Thin progress line for mobile */}
      <div className="absolute inset-x-0 top-0 h-0.5 bg-line md:hidden">
        <div className="h-full bg-highlight" style={{ width: `${pct}%` }} />
      </div>

      <div className="grid h-[72px] grid-cols-[1fr_auto] items-center gap-4 px-3 md:h-[88px] md:grid-cols-[1fr_2fr_1fr] md:px-4">
        {/* Now playing */}
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => p.setPanel('lyrics')}
            aria-label="Open now playing"
            className="shrink-0"
          >
            <Cover
              image={track.imageUrl} hue={track.hue}
              title={track.title}
              className={`h-12 w-12 !rounded-lg shadow-lg md:h-14 md:w-14 ${p.isPlaying ? 'ring-2 ring-highlight/40' : ''}`}
            />
          </button>
          <div className="min-w-0">
            <p className="truncate font-semibold">{track.title}</p>
            <Link
              to={`/artist/${track.artistSlug}`}
              className="block truncate text-sm text-muted hover:text-fg hover:underline"
            >
              {artistName(track)}
            </Link>
          </div>
          <button
            type="button"
            aria-label={liked ? 'Remove from Liked Songs' : 'Save to Liked Songs'}
            aria-pressed={liked}
            onClick={() => toggleLike(track.slug)}
            className={`ml-1 hidden shrink-0 transition hover:scale-110 sm:block ${liked ? 'text-highlight' : 'text-muted hover:text-fg'}`}
          >
            <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Transport */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-2 md:gap-4">
            <IconToggle label="Shuffle" active={p.shuffle} onClick={p.toggleShuffle} className="hidden md:grid">
              <Shuffle size={17} />
            </IconToggle>
            <button type="button" aria-label="Previous" onClick={p.prev} className="hidden text-muted transition hover:text-fg md:block">
              <SkipBack size={20} fill="currentColor" />
            </button>
            <PlayButton playing={p.isPlaying} onClick={p.toggle} />
            <button type="button" aria-label="Next" onClick={() => p.next()} className="text-muted transition hover:text-fg">
              <SkipForward size={20} fill="currentColor" />
            </button>
            <IconToggle
              label={`Repeat: ${p.repeat}`}
              active={p.repeat !== 'off'}
              onClick={p.cycleRepeat}
              className="hidden md:grid"
            >
              {p.repeat === 'one' ? <Repeat1 size={17} /> : <Repeat size={17} />}
            </IconToggle>
          </div>
          <div className="hidden w-full max-w-xl items-center gap-2 text-xs text-muted tabular-nums md:flex">
            <span className="w-10 text-right">{formatDuration(p.position)}</span>
            <input
              type="range"
              aria-label="Seek"
              min={0}
              max={p.duration || 0}
              step={0.1}
              value={p.position}
              onChange={(e) => p.seek(Number(e.target.value))}
              className="range flex-1"
              style={{ '--pct': `${pct}%` } as CSSProperties}
            />
            <span className="w-10">{formatDuration(p.duration)}</span>
          </div>
        </div>

        {/* Extras */}
        <div className="hidden items-center justify-end gap-1 md:flex">
          <IconToggle
            label={`Speed ${p.rate}×`}
            active={p.rate !== 1}
            onClick={() => p.setRate(RATES[(RATES.indexOf(p.rate) + 1) % RATES.length]!)}
          >
            {p.rate === 1 ? <Gauge size={17} /> : <span className="text-[11px] font-bold">{p.rate}×</span>}
          </IconToggle>
          <IconToggle
            label={
              p.sleepAt
                ? `Sleep timer: stops at ${new Date(p.sleepAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                : `Sleep timer (${SLEEP_MINUTES} min)`
            }
            active={Boolean(p.sleepAt)}
            onClick={() => p.setSleepTimer(p.sleepAt ? null : SLEEP_MINUTES)}
          >
            <MoonStar size={17} />
          </IconToggle>
          <IconToggle label="Lyrics" active={p.panel === 'lyrics'} onClick={() => p.setPanel('lyrics')}>
            <MicVocal size={17} />
          </IconToggle>
          <IconToggle label="Queue" active={p.panel === 'queue'} onClick={() => p.setPanel('queue')}>
            <ListMusic size={17} />
          </IconToggle>
          <button type="button" aria-label={p.muted ? 'Unmute' : 'Mute'} onClick={p.toggleMute} className="ml-1 text-muted hover:text-fg">
            <VolumeIcon size={18} />
          </button>
          <input
            type="range"
            aria-label="Volume"
            min={0}
            max={1}
            step={0.01}
            value={p.muted ? 0 : p.volume}
            onChange={(e) => p.setVolume(Number(e.target.value))}
            className="range w-24"
            style={{ '--pct': `${(p.muted ? 0 : p.volume) * 100}%` } as CSSProperties}
          />
        </div>
      </div>
    </div>
  );
}
