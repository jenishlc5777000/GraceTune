import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { hash } from '@node-rs/argon2';
import { APP_CONFIG, APPEARANCE_KEY, DEFAULT_APPEARANCE, demoCatalog } from '@gracetunes/shared';

const prisma = new PrismaClient();

const RIGHTS_STATEMENT =
  'Original composition generated for demo purposes. Uploader owns all rights.';

async function seedTaxonomy() {
  for (const [i, g] of demoCatalog.genres.entries()) {
    await prisma.genre.upsert({
      where: { slug: g.slug },
      update: { name: g.name, hue: g.hue, sortOrder: i },
      create: { ...g, sortOrder: i },
    });
  }
  for (const m of demoCatalog.moods) {
    await prisma.mood.upsert({ where: { slug: m.slug }, update: m, create: m });
  }
  for (const l of demoCatalog.languages) {
    await prisma.language.upsert({ where: { code: l.code }, update: l, create: l });
  }
}

async function seedUsers() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@gracetunes.local';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMe123';
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: await hash(adminPassword),
      displayName: `${APP_CONFIG.name} Admin`,
      role: 'ADMIN',
      emailVerified: true,
    },
  });

  const listener = await prisma.user.upsert({
    where: { email: 'listener@gracetunes.local' },
    update: {},
    create: {
      email: 'listener@gracetunes.local',
      passwordHash: await hash('Listener123'),
      displayName: 'Demo Listener',
      emailVerified: true,
    },
  });
  return { admin, listener };
}

async function seedArtists() {
  const ids = new Map<string, string>();
  for (const a of demoCatalog.artists) {
    const user = await prisma.user.upsert({
      where: { email: `${a.slug}@artists.gracetunes.local` },
      update: {},
      create: {
        email: `${a.slug}@artists.gracetunes.local`,
        passwordHash: await hash('Artist123'),
        displayName: a.name,
        role: 'ARTIST',
        emailVerified: true,
      },
    });
    const profile = await prisma.artistProfile.upsert({
      where: { slug: a.slug },
      update: { name: a.name, bio: a.bio, country: a.country, avatarUrl: a.imageUrl },
      create: {
        userId: user.id,
        slug: a.slug,
        name: a.name,
        bio: a.bio,
        country: a.country,
        avatarUrl: a.imageUrl,
        verification: 'APPROVED',
        verifiedAt: new Date(),
        contentPolicyAcceptedAt: new Date(),
      },
    });
    ids.set(a.slug, profile.id);
  }
  return ids;
}

async function seedCatalog(artistIds: Map<string, string>, adminId: string) {
  const albumIds = new Map<string, string>();
  for (const al of demoCatalog.albums) {
    const album = await prisma.album.upsert({
      where: { slug: al.slug },
      update: { title: al.title, hue: al.hue, coverUrl: al.imageUrl },
      create: {
        slug: al.slug,
        title: al.title,
        hue: al.hue,
        coverUrl: al.imageUrl,
        artistId: artistIds.get(al.artistSlug)!,
        releaseDate: new Date(`${al.year}-01-15`),
        status: 'APPROVED',
      },
    });
    albumIds.set(al.slug, album.id);
  }

  const genres = new Map((await prisma.genre.findMany()).map((g) => [g.slug, g.id]));
  const trackIds = new Map<string, string>();
  const trackNumbers = new Map<string, number>();

  for (const t of demoCatalog.tracks) {
    const n = (trackNumbers.get(t.albumSlug) ?? 0) + 1;
    trackNumbers.set(t.albumSlug, n);
    const artistId = artistIds.get(t.artistSlug)!;
    const artistUser = await prisma.artistProfile.findUniqueOrThrow({ where: { id: artistId } });

    const data = {
      title: t.title,
      artistId,
      albumId: albumIds.get(t.albumSlug),
      genreId: genres.get(t.genreSlug),
      languageCode: t.languageCode,
      trackNumber: n,
      durationSec: t.durationSec,
      hue: t.hue,
      coverUrl: t.imageUrl,
      status: 'APPROVED' as const,
      // Phase 4 replaces this with an S3 key + HLS master; for now it points at the
      // locally generated demo file.
      originalKey: t.audioUrl,
      rightsDeclaredById: artistUser.userId,
      rightsDeclaredAt: new Date(),
      rightsStatement: RIGHTS_STATEMENT,
      hasLyricRights: Boolean(t.lyrics),
      playCount: Math.floor(500 + Math.random() * 20000),
      publishedAt: new Date(),
      moods: { set: [], connect: t.moodSlugs.map((slug) => ({ slug })) },
    };
    const track = await prisma.track.upsert({
      where: { slug: t.slug },
      update: data,
      create: { slug: t.slug, ...data, moods: { connect: t.moodSlugs.map((slug) => ({ slug })) } },
    });
    trackIds.set(t.slug, track.id);

    await prisma.verseTag.deleteMany({ where: { trackId: track.id } });
    if (t.verse) {
      await prisma.verseTag.create({ data: { trackId: track.id, ...t.verse } });
    }
    if (t.lyrics) {
      const lyrics = {
        synced: t.lyrics.map(({ timeMs, text }) => ({ timeMs, text })),
        plain: t.lyrics.map((l) => l.text).filter((x) => x !== '♪').join('\n'),
      };
      await prisma.lyrics.upsert({
        where: { trackId: track.id },
        update: lyrics,
        create: { trackId: track.id, ...lyrics },
      });
    }
    await prisma.moderationReview.deleteMany({ where: { trackId: track.id } });
    await prisma.moderationReview.create({
      data: { trackId: track.id, reviewerId: adminId, decision: 'APPROVED', reason: 'Seed data' },
    });
  }
  return trackIds;
}

async function seedPlaylists(trackIds: Map<string, string>, churchId: string) {
  for (const p of demoCatalog.playlists) {
    const playlist = await prisma.playlist.upsert({
      where: { slug: p.slug },
      update: { title: p.title, description: p.description, hue: p.hue, kind: p.kind, coverUrl: p.imageUrl },
      create: {
        slug: p.slug,
        title: p.title,
        description: p.description,
        hue: p.hue,
        kind: p.kind,
        coverUrl: p.imageUrl,
        churchId: p.kind === 'SUNDAY_SETLIST' ? churchId : undefined,
      },
    });
    await prisma.playlistTrack.deleteMany({ where: { playlistId: playlist.id } });
    await prisma.playlistTrack.createMany({
      data: p.trackSlugs.map((slug, i) => ({
        playlistId: playlist.id,
        trackId: trackIds.get(slug)!,
        position: (i + 1) * 1000,
      })),
    });
  }
}

async function seedChurchAndSermons() {
  const church = await prisma.church.upsert({
    where: { slug: 'grace-community' },
    update: {},
    create: {
      slug: 'grace-community',
      name: 'Grace Community Church',
      city: 'Bengaluru',
      country: 'IN',
      description: 'A demo church used to showcase church playlists and sermons.',
    },
  });
  const series = await prisma.sermonSeries.upsert({
    where: { slug: 'walking-in-faith' },
    update: {},
    create: {
      slug: 'walking-in-faith',
      title: 'Walking in Faith',
      description: 'A four-week series through Hebrews 11.',
      speaker: 'Pastor Daniel (demo)',
      churchId: church.id,
    },
  });
  const episodes = ['By Faith We Understand', 'The Faith of Abraham', 'Faith in the Waiting', 'Run the Race'];
  for (const [i, title] of episodes.entries()) {
    await prisma.sermon.upsert({
      where: { slug: `walking-in-faith-${i + 1}` },
      update: {},
      create: {
        slug: `walking-in-faith-${i + 1}`,
        seriesId: series.id,
        title,
        speaker: 'Pastor Daniel (demo)',
        episodeNumber: i + 1,
        durationSec: 36,
        languageCode: 'en',
        // Reuses a demo instrumental as stand-in audio.
        originalKey: '/audio/demo/quiet-altar.wav',
        status: 'APPROVED',
        publishedAt: new Date(),
      },
    });
  }
  return church;
}

async function seedPlatform() {
  const plans = [
    { code: 'premium_monthly', name: 'Premium Monthly', interval: 'MONTH' as const, priceInr: 9900, priceUsd: 499 },
    { code: 'premium_yearly', name: 'Premium Yearly', interval: 'YEAR' as const, priceInr: 99900, priceUsd: 4999 },
  ];
  for (const p of plans) {
    await prisma.plan.upsert({
      where: { code: p.code },
      update: p,
      create: { ...p, features: ['Ad-free', 'Offline downloads', 'High quality (256 kbps)', 'Unlimited skips'] },
    });
  }

  const flags = [
    { key: 'downloads', enabled: true, description: 'Offline downloads for premium users' },
    { key: 'audio_ads', enabled: false, description: 'Audio ads on the free tier' },
    { key: 'google_sign_in', enabled: true, description: 'Google sign-in' },
  ];
  for (const f of flags) await prisma.featureFlag.upsert({ where: { key: f.key }, update: {}, create: f });

  await prisma.appSetting.upsert({
    where: { key: 'branding' },
    update: {},
    create: { key: 'branding', value: { appName: APP_CONFIG.name } },
  });
  await prisma.appSetting.upsert({
    where: { key: APPEARANCE_KEY },
    update: {},
    create: { key: APPEARANCE_KEY, value: DEFAULT_APPEARANCE },
  });

  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const date = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + i));
    const verse = demoCatalog.dailyVerses[i % demoCatalog.dailyVerses.length]!;
    await prisma.dailyVerse.upsert({ where: { date }, update: verse, create: { date, ...verse } });
  }
}

async function main() {
  await seedTaxonomy();
  const { admin, listener } = await seedUsers();
  const artistIds = await seedArtists();
  const trackIds = await seedCatalog(artistIds, admin.id);
  const church = await seedChurchAndSermons();
  await seedPlaylists(trackIds, church.id);
  await seedPlatform();

  // A few liked songs and plays so "Recently played" has content.
  for (const slug of ['morning-mercies', 'anchor-hymn', 'kaalai-thuthi']) {
    const trackId = trackIds.get(slug)!;
    await prisma.like.upsert({
      where: { userId_trackId: { userId: listener.id, trackId } },
      update: {},
      create: { userId: listener.id, trackId },
    });
    await prisma.playHistory.create({ data: { userId: listener.id, trackId, msPlayed: 30_000, country: 'IN' } });
  }

  console.log(
    `Seeded ${demoCatalog.tracks.length} tracks, ${demoCatalog.artists.length} artists, ` +
      `${demoCatalog.playlists.length} playlists, admin ${admin.email}`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
