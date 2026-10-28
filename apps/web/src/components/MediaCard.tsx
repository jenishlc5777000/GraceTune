import { Link } from 'react-router-dom';
import type { CatalogTrack } from '@gracetunes/shared';
import { Cover } from './Cover';
import { PlayButton } from './PlayButton';
import { sameList, usePlayer } from '../store/player';

interface MediaCardProps {
  to: string;
  title: string;
  subtitle: string;
  hue: number;
  image?: string;
  tracks: CatalogTrack[];
  round?: boolean;
  showTitle?: boolean;
}

export function MediaCard({ to, title, subtitle, hue, image, tracks, round, showTitle }: MediaCardProps) {
  const isActive = usePlayer((s) => sameList(s.queue, tracks));
  const isPlaying = usePlayer((s) => s.isPlaying) && isActive;
  const playList = usePlayer((s) => s.playList);
  const toggle = usePlayer((s) => s.toggle);

  return (
    <Link
      to={to}
      className="group block rounded-2xl p-3 transition hover:bg-surface-hover focus-visible:bg-surface-hover"
    >
      <div className="relative">
        <Cover
          hue={hue}
          image={image}
          title={title}
          showTitle={showTitle}
          round={round}
          className="aspect-square w-full shadow-xl shadow-black/20 transition duration-300 group-hover:shadow-black/40"
        />
        {tracks.length > 0 && (
          <PlayButton
            playing={isPlaying}
            onClick={() => (isActive ? toggle() : playList(tracks))}
            className={`absolute right-2 bottom-2 ${isPlaying ? 'opacity-100' : 'translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:opacity-100'}`}
          />
        )}
      </div>
      <p className={`mt-3 truncate font-semibold ${round ? 'text-center' : ''}`}>{title}</p>
      <p className={`mt-0.5 line-clamp-2 text-sm text-muted ${round ? 'text-center' : ''}`}>
        {subtitle}
      </p>
    </Link>
  );
}
