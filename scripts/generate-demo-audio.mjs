// Synthesises short, original instrumental demo tracks (WAV) for every track in the
// shared catalog, so the repo never ships copyrighted audio.
// Usage: node scripts/generate-demo-audio.mjs [--force]
import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const catalog = JSON.parse(
  readFileSync(join(root, 'packages/shared/src/catalog.data.json'), 'utf8'),
);
const outDir = join(root, 'apps/web/public/audio/demo');
const force = process.argv.includes('--force');

const SR = 22050;
const SCALES = { major: [0, 2, 4, 5, 7, 9, 11], minor: [0, 2, 3, 5, 7, 8, 10] };
// Scale-degree progressions, one chord per bar.
const PROGRESSIONS = [
  [0, 4, 5, 3],
  [0, 3, 0, 4],
  [5, 3, 0, 4],
  [0, 5, 2, 6],
  [0, 6, 5, 6],
  [0, 3, 4, 0],
];

const midiToHz = (m) => 440 * 2 ** ((m - 69) / 12);

function rng(seedStr) {
  let h = 2166136261;
  for (const c of seedStr) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

function scaleNote(rootMidi, scale, degree) {
  const oct = Math.floor(degree / 7);
  const idx = ((degree % 7) + 7) % 7;
  return rootMidi + scale[idx] + 12 * oct;
}

/** Adds a single note into the buffer using additive partials and an envelope. */
function addNote(buf, { start, dur, freq, gain, partials, attack, release, vibrato = 0, decay = 0 }) {
  const s0 = Math.floor(start * SR);
  const len = Math.floor((dur + release) * SR);
  for (let i = 0; i < len; i++) {
    const idx = s0 + i;
    if (idx >= buf.length) break;
    const t = i / SR;
    let env = t < attack ? t / attack : 1;
    if (t > dur) env *= Math.max(0, 1 - (t - dur) / release);
    if (decay) env *= Math.exp(-t * decay);
    const vib = vibrato ? 1 + 0.004 * Math.sin(2 * Math.PI * vibrato * t) : 1;
    let v = 0;
    for (const [mult, amp] of partials) v += amp * Math.sin(2 * Math.PI * freq * mult * vib * t);
    buf[idx] += v * env * gain;
  }
}

const VOICES = {
  pad: { partials: [[1, 1], [1.003, 0.6], [2, 0.18]], attack: 0.9, release: 1.2, vibrato: 0 },
  choir: { partials: [[1, 1], [2, 0.45], [3, 0.2], [4, 0.08]], attack: 0.7, release: 1.0, vibrato: 5 },
  piano: { partials: [[1, 1], [2, 0.4], [3, 0.15]], attack: 0.005, release: 0.4, decay: 2.2 },
  bell: { partials: [[1, 1], [2.76, 0.35], [5.4, 0.12]], attack: 0.002, release: 0.6, decay: 3 },
};

function addKick(buf, start) {
  const s0 = Math.floor(start * SR);
  for (let i = 0; i < SR * 0.25 && s0 + i < buf.length; i++) {
    const t = i / SR;
    const f = 110 * Math.exp(-t * 18) + 45;
    buf[s0 + i] += Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 14) * 0.35;
  }
}

function addShaker(buf, start, rand) {
  const s0 = Math.floor(start * SR);
  for (let i = 0; i < SR * 0.06 && s0 + i < buf.length; i++) {
    buf[s0 + i] += (rand() * 2 - 1) * Math.exp(-(i / SR) * 60) * 0.05;
  }
}

/** Small Schroeder reverb: parallel combs into series allpasses. */
function reverb(dry, wet = 0.28) {
  const combs = [1557, 1617, 1491, 1422].map((d) => Math.floor((d * SR) / 44100));
  const out = new Float32Array(dry.length);
  for (const d of combs) {
    const line = new Float32Array(d);
    let p = 0;
    for (let i = 0; i < dry.length; i++) {
      const y = line[p];
      line[p] = dry[i] + y * 0.82;
      out[i] += y / combs.length;
      p = (p + 1) % d;
    }
  }
  for (const d of [225, 556].map((x) => Math.floor((x * SR) / 44100))) {
    const line = new Float32Array(d);
    let p = 0;
    for (let i = 0; i < out.length; i++) {
      const buffered = line[p];
      const y = -out[i] + buffered;
      line[p] = out[i] + buffered * 0.5;
      out[i] = y;
      p = (p + 1) % d;
    }
  }
  for (let i = 0; i < dry.length; i++) out[i] = dry[i] * (1 - wet) + out[i] * wet;
  return out;
}

function renderTrack(track) {
  const { root: rootMidi, mode, bpm, progression, voice } = track.music;
  const scale = SCALES[mode];
  const prog = PROGRESSIONS[progression % PROGRESSIONS.length];
  const rand = rng(track.slug);
  const beat = 60 / bpm;
  const bar = beat * 4;
  const total = track.durationSec;
  const buf = new Float32Array(Math.ceil(total * SR));
  const v = VOICES[voice];

  for (let b = 0; b * bar < total; b++) {
    const deg = prog[b % prog.length];
    const t0 = b * bar;
    const chord = [0, 2, 4].map((o) => scaleNote(rootMidi, scale, deg + o));

    // Harmony
    if (voice === 'piano' || voice === 'bell') {
      const pattern = [0, 1, 2, 1, 0, 2, 1, 2];
      pattern.forEach((ci, k) => {
        addNote(buf, { ...v, start: t0 + k * (beat / 2), dur: beat / 2, freq: midiToHz(chord[ci]), gain: 0.11 });
      });
      for (const n of chord) {
        addNote(buf, { ...VOICES.pad, start: t0, dur: bar, freq: midiToHz(n - 12), gain: 0.045 });
      }
    } else {
      for (const n of chord) addNote(buf, { ...v, start: t0, dur: bar, freq: midiToHz(n), gain: 0.08 });
    }

    // Bass
    addNote(buf, { ...VOICES.piano, decay: 0.9, start: t0, dur: bar * 0.9, freq: midiToHz(chord[0] - 24), gain: 0.22 });

    // Melody: chord tones and passing scale notes an octave up
    let t = t0;
    while (t < t0 + bar - 0.01) {
      const len = beat * [1, 1, 2, 0.5][Math.floor(rand() * 4)];
      if (rand() > 0.22) {
        const degree = deg + [0, 2, 4, 1, 3, 5, 7][Math.floor(rand() * 7)] + 7;
        const melodyVoice = voice === 'pad' || voice === 'choir' ? VOICES.bell : VOICES.piano;
        addNote(buf, { ...melodyVoice, start: t, dur: len, freq: midiToHz(scaleNote(rootMidi, scale, degree)), gain: 0.1 });
      }
      t += len;
    }

    // Light rhythm for up-tempo songs
    if (bpm >= 95) {
      for (let k = 0; k < 4; k++) if (k % 2 === 0) addKick(buf, t0 + k * beat);
      for (let k = 0; k < 8; k++) addShaker(buf, t0 + k * (beat / 2), rand);
    }
  }

  const wet = reverb(buf, voice === 'piano' ? 0.22 : 0.32);
  // Fade in/out and normalise
  const fade = SR * 1.5;
  let peak = 0;
  for (let i = 0; i < wet.length; i++) {
    if (i < SR * 0.3) wet[i] *= i / (SR * 0.3);
    if (i > wet.length - fade) wet[i] *= (wet.length - i) / fade;
    peak = Math.max(peak, Math.abs(wet[i]));
  }
  const norm = peak > 0 ? 0.89 / peak : 1;
  for (let i = 0; i < wet.length; i++) wet[i] *= norm;
  return wet;
}

function toWav(samples) {
  const data = Buffer.alloc(samples.length * 2);
  for (let i = 0; i < samples.length; i++) {
    data.writeInt16LE(Math.max(-1, Math.min(1, samples[i])) * 32767, i * 2);
  }
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write('WAVEfmt ', 8);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // mono
  header.writeUInt32LE(SR, 24);
  header.writeUInt32LE(SR * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(data.length, 40);
  return Buffer.concat([header, data]);
}

mkdirSync(outDir, { recursive: true });
let made = 0;
for (const track of catalog.tracks) {
  const file = join(outDir, `${track.slug}.wav`);
  if (!force && existsSync(file)) continue;
  writeFileSync(file, toWav(renderTrack(track)));
  made++;
  console.log(`  ♪ ${track.title} (${track.music.voice}, ${track.music.bpm} bpm)`);
}
console.log(`Demo audio ready: ${made} generated, ${catalog.tracks.length - made} already present.`);
