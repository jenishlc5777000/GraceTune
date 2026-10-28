import { useState } from 'react';

interface CoverProps {
  hue: number;
  /** Poster / cover image URL. The hue gradient shows while it loads or if it fails. */
  image?: string;
  title?: string;
  /** Show the title typeset on the artwork (editorial playlist style). */
  showTitle?: boolean;
  round?: boolean;
  className?: string;
}

export function Cover({ hue, image, title, showTitle, round, className = '' }: CoverProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showImage = Boolean(image) && failedSrc !== image;
  const h2 = (hue + 48) % 360;
  const h3 = (hue + 200) % 360;

  return (
    <div
      role="img"
      aria-label={title ? `${title} cover` : 'Cover art'}
      className={`cover-art relative isolate shrink-0 overflow-hidden ${round ? 'rounded-full' : 'rounded-xl'} ${className}`}
      style={{
        background: `
          radial-gradient(120% 90% at 85% 10%, hsl(${h2} 90% 65% / .85), transparent 55%),
          radial-gradient(90% 80% at 10% 100%, hsl(${h3} 70% 45% / .55), transparent 60%),
          linear-gradient(150deg, hsl(${hue} 72% 46%), hsl(${hue} 70% 18%))`,
      }}
    >
      {showImage ? (
        <img
          src={image}
          alt=""
          loading="lazy"
          decoding="async"
          draggable={false}
          onError={() => setFailedSrc(image ?? null)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <svg
          aria-hidden
          viewBox="0 0 100 100"
          className="absolute inset-0 h-full w-full opacity-30 mix-blend-overlay"
          preserveAspectRatio="none"
        >
          <circle cx="78" cy="22" r="34" fill="none" stroke="white" strokeWidth="0.6" />
          <circle cx="78" cy="22" r="22" fill="none" stroke="white" strokeWidth="0.6" />
          <circle cx="78" cy="22" r="10" fill="white" fillOpacity="0.5" />
          <path d="M0 80 Q 30 60 60 78 T 100 70" fill="none" stroke="white" strokeWidth="0.8" />
        </svg>
      )}
      {showTitle && title && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-[8%] pt-[30%]">
          <p className="font-display text-[clamp(0.9rem,1.6vw,1.45rem)] leading-tight font-semibold text-white drop-shadow">
            {title}
          </p>
        </div>
      )}
    </div>
  );
}
