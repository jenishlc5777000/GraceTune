import data from './catalog.data.json';
import type {
  CatalogAlbum,
  CatalogArtist,
  CatalogGenre,
  CatalogPlaylist,
  CatalogTrack,
} from './types';

/**
 * Demo catalog shared by the seed script and the web app's offline preview.
 * Every title, artist and lyric is fictional; verses are KJV (public domain);
 * audio and poster art are generated locally by scripts/generate-demo-audio.mjs
 * and scripts/generate-demo-posters.mjs.
 */
const image = (kind: string, slug: string) => `/images/demo/${kind}/${slug}.svg`;

export const demoCatalog = {
  genres: data.genres as CatalogGenre[],
  moods: data.moods as CatalogGenre[],
  languages: data.languages,
  artists: data.artists.map((a) => ({ ...a, imageUrl: image('artists', a.slug) })) as CatalogArtist[],
  albums: data.albums.map((a) => ({ ...a, imageUrl: image('albums', a.slug) })) as CatalogAlbum[],
  tracks: data.tracks.map(({ music: _music, ...t }) => ({
    ...t,
    audioUrl: `/audio/demo/${t.slug}.wav`,
    imageUrl: image('tracks', t.slug),
  })) as CatalogTrack[],
  playlists: data.playlists.map((p) => ({ ...p, imageUrl: image('playlists', p.slug) })) as CatalogPlaylist[],
  dailyVerses: data.dailyVerses,
};

export function verseOfTheDay(date = new Date()) {
  const dayIndex = Math.floor(date.getTime() / 86_400_000);
  return demoCatalog.dailyVerses[dayIndex % demoCatalog.dailyVerses.length]!;
}
