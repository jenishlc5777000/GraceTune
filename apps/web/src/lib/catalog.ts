import { demoCatalog, type CatalogPlaylist, type CatalogTrack } from '@gracetunes/shared';

export const { tracks, artists, albums, playlists, genres, moods, languages } = demoCatalog;

export const artistBySlug = new Map(artists.map((a) => [a.slug, a]));
export const albumBySlug = new Map(albums.map((a) => [a.slug, a]));
export const trackBySlug = new Map(tracks.map((t) => [t.slug, t]));
export const playlistBySlug = new Map(playlists.map((p) => [p.slug, p]));
export const genreBySlug = new Map(genres.map((g) => [g.slug, g]));
export const languageByCode = new Map(languages.map((l) => [l.code, l]));

export const artistName = (t: CatalogTrack) => artistBySlug.get(t.artistSlug)?.name ?? 'Unknown';
export const albumTitle = (t: CatalogTrack) => albumBySlug.get(t.albumSlug)?.title ?? '';

export const playlistTracks = (p: CatalogPlaylist) =>
  p.trackSlugs.map((s) => trackBySlug.get(s)).filter((t): t is CatalogTrack => Boolean(t));

export const albumTracks = (slug: string) => tracks.filter((t) => t.albumSlug === slug);
export const artistTracks = (slug: string) => tracks.filter((t) => t.artistSlug === slug);
export const artistAlbums = (slug: string) => albums.filter((a) => a.artistSlug === slug);

/** Stable pseudo play count so demo charts look plausible. */
export function playCount(t: CatalogTrack) {
  let h = 0;
  for (const c of t.slug) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return 12_000 + (h % 480_000);
}

export const trending = [...tracks].sort((a, b) => playCount(b) - playCount(a)).slice(0, 8);
export const newReleases = [...albums].sort((a, b) => b.year - a.year);

export function formatDuration(sec: number) {
  const s = Math.max(0, Math.floor(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export const formatCount = (n: number) =>
  new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(n);

export function totalDuration(list: CatalogTrack[]) {
  const sec = list.reduce((sum, t) => sum + t.durationSec, 0);
  const min = Math.round(sec / 60);
  return min < 1 ? `${sec} sec` : `${min} min`;
}
