import { BadgeCheck } from 'lucide-react';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Cover } from '../components/Cover';
import { MediaCard } from '../components/MediaCard';
import { PlayButton } from '../components/PlayButton';
import { Shelf } from '../components/Shelf';
import { TrackList } from '../components/TrackList';
import {
  albumTracks,
  artistAlbums,
  artistBySlug,
  artistTracks,
  formatCount,
  playCount,
} from '../lib/catalog';
import { NotFound } from './NotFound';
import { sameList, usePlayer } from '../store/player';
import { useLibrary } from '../store/library';

export function ArtistPage() {
  const { slug = '' } = useParams();
  const artist = artistBySlug.get(slug);
  const following = useLibrary((s) => s.followedArtists.includes(slug));
  const { toggleFollow, pushRecent } = useLibrary();
  const popular = [...artistTracks(slug)].sort((a, b) => playCount(b) - playCount(a));
  const active = usePlayer((s) => sameList(s.queue, popular));
  const isPlaying = usePlayer((s) => s.isPlaying) && active;
  const { playList, toggle } = usePlayer();

  useEffect(() => {
    if (artist) pushRecent(`artist:${slug}`);
  }, [artist, slug, pushRecent]);

  if (!artist) return <NotFound />;
  const monthly = popular.reduce((n, t) => n + playCount(t), 0);
  const banner = [...artistAlbums(slug)].sort((a, b) => b.year - a.year)[0];

  return (
    <div>
      <header
        className="relative flex min-h-[340px] items-end overflow-hidden px-4 pb-8 md:px-8"
        style={{
          background: `
            radial-gradient(70% 90% at 80% 0%, hsl(${(artist.hue + 40) % 360} 85% 60% / .55), transparent 60%),
            linear-gradient(160deg, hsl(${artist.hue} 65% 38%), hsl(${artist.hue} 60% 14%) 80%)`,
        }}
      >
        {banner && (
          <img
            src={banner.imageUrl}
            alt=""
            aria-hidden
            className="cover-art absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-md"
          />
        )}
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="relative flex animate-fade-up flex-col gap-5 text-white sm:flex-row sm:items-end">
          <Cover
            image={artist.imageUrl}
            hue={artist.hue}
            title={artist.name}
            round
            className="h-36 w-36 shadow-2xl shadow-black/50 ring-4 ring-white/10 md:h-48 md:w-48"
          />
          <div>
            <p className="flex items-center gap-1.5 text-sm font-semibold">
              <BadgeCheck size={20} className="text-sky-300" fill="currentColor" stroke="black" /> Verified artist
            </p>
            <h1 className="mt-2 text-5xl font-extrabold tracking-tight md:text-7xl">{artist.name}</h1>
            <p className="mt-3 text-white/80">{formatCount(monthly)} monthly listeners</p>
          </div>
        </div>
      </header>

      <div className="flex items-center gap-5 px-4 py-5 md:px-8">
        <PlayButton size="lg" playing={isPlaying} onClick={() => (active ? toggle() : playList(popular))} />
        <button
          type="button"
          onClick={() => toggleFollow(slug)}
          aria-pressed={following}
          className={`rounded-full border px-5 py-1.5 text-sm font-bold transition hover:scale-105 ${following ? 'border-highlight text-highlight' : 'border-line hover:border-fg'}`}
        >
          {following ? 'Following' : 'Follow'}
        </button>
      </div>

      <div className="space-y-10 px-2 pb-10 md:px-6">
        <section>
          <h2 className="mb-2 px-3 text-xl font-bold">Popular</h2>
          <TrackList tracks={popular} showPlays />
        </section>

        <Shelf title="Discography">
          {artistAlbums(slug).map((a) => (
            <MediaCard key={a.slug} to={`/album/${a.slug}`} title={a.title} subtitle={`${a.year} · Album`} image={a.imageUrl} hue={a.hue} tracks={albumTracks(a.slug)} />
          ))}
        </Shelf>

        <section className="mx-3 max-w-3xl rounded-3xl bg-surface p-6">
          <h2 className="text-xl font-bold">About</h2>
          <p className="mt-2 text-muted">{artist.bio}</p>
        </section>
      </div>
    </div>
  );
}
