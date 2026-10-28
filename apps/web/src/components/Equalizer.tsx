/** Animated bars shown next to the track that is playing. */
export function Equalizer({ paused = false }: { paused?: boolean }) {
  return (
    <span className="flex h-3.5 items-end gap-[2px]" aria-label="Now playing">
      {[0, 0.25, 0.5, 0.15].map((delay, i) => (
        <span
          key={i}
          className="h-full w-[3px] origin-bottom rounded-full bg-highlight animate-eq"
          style={{ animationDelay: `${delay}s`, animationPlayState: paused ? 'paused' : 'running' }}
        />
      ))}
    </span>
  );
}
