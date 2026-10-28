export type Role = 'USER' | 'ARTIST' | 'ADMIN' | 'MODERATOR';

export type TrackStatus =
  | 'DRAFT'
  | 'PROCESSING'
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'TAKEN_DOWN';

export interface LyricLine {
  /** Milliseconds from track start. */
  timeMs: number;
  text: string;
}

export interface CatalogGenre {
  slug: string;
  name: string;
  /** Hue (0-360) used to render gradient tiles. */
  hue: number;
}

export interface CatalogArtist {
  slug: string;
  name: string;
  bio: string;
  country: string;
  hue: number;
  /** Generated poster art (public path). */
  imageUrl: string;
}

export interface CatalogAlbum {
  slug: string;
  title: string;
  artistSlug: string;
  year: number;
  hue: number;
  imageUrl: string;
}

export interface CatalogTrack {
  slug: string;
  title: string;
  artistSlug: string;
  albumSlug: string;
  genreSlug: string;
  moodSlugs: string[];
  languageCode: string;
  durationSec: number;
  /** Public path of the locally generated demo audio. */
  audioUrl: string;
  verse?: { reference: string; text: string };
  lyrics?: LyricLine[];
  hue: number;
  imageUrl: string;
}

export interface CatalogPlaylist {
  slug: string;
  title: string;
  description: string;
  kind: 'EDITORIAL' | 'CHURCH' | 'SUNDAY_SETLIST' | 'MADE_FOR_YOU';
  trackSlugs: string[];
  hue: number;
  imageUrl: string;
}
