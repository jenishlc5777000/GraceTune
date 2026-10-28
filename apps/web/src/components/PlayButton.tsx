import { Pause, Play } from 'lucide-react';

interface PlayButtonProps {
  playing: boolean;
  onClick: () => void;
  size?: 'md' | 'lg';
  className?: string;
}

export function PlayButton({ playing, onClick, size = 'md', className = '' }: PlayButtonProps) {
  const dims = size === 'lg' ? 'h-14 w-14' : 'h-11 w-11';
  const icon = size === 'lg' ? 24 : 18;
  return (
    <button
      type="button"
      aria-label={playing ? 'Pause' : 'Play'}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      className={`${dims} grid place-items-center rounded-full bg-gradient-to-br from-highlight to-highlight-strong text-on-highlight shadow-lg shadow-highlight/25 transition hover:scale-105 active:scale-95 ${className}`}
    >
      {playing ? (
        <Pause size={icon} fill="currentColor" />
      ) : (
        <Play size={icon} fill="currentColor" className="translate-x-[1px]" />
      )}
    </button>
  );
}
