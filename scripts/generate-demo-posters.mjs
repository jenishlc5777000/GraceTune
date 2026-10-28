// Draws original SVG poster art for every track, album, playlist and artist in the
// shared catalog, so the demo needs no stock or copyrighted images.
// Usage: node scripts/generate-demo-posters.mjs
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const catalog = JSON.parse(readFileSync(join(root, 'packages/shared/src/catalog.data.json'), 'utf8'));
const outDir = join(root, 'apps/web/public/images/demo');
const S = 600;

function rng(seedStr) {
  let h = 2166136261;
  for (const c of seedStr) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

const hsl = (h, s, l, a = 1) => `hsl(${((h % 360) + 360) % 360} ${s}% ${l}% / ${a})`;
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const n = (v) => Math.round(v * 10) / 10;

/** Smooth or jagged horizon line, closed to the bottom of the canvas. */
function ridge(r, baseY, amp, points, jagged = false) {
  const pts = Array.from({ length: points + 1 }, (_, i) => [
    (S / points) * i,
    baseY + (r() - 0.5) * 2 * amp,
  ]);
  let d = `M0,${S} L${pts[0][0]},${n(pts[0][1])}`;
  if (jagged) {
    for (const [x, y] of pts.slice(1)) d += ` L${n(x)},${n(y)}`;
  } else {
    for (let i = 0; i < pts.length - 1; i++) {
      const [x0, y0] = pts[i];
      const [x1, y1] = pts[i + 1];
      d += ` Q${n(x0)},${n(y0)} ${n((x0 + x1) / 2)},${n((y0 + y1) / 2)}`;
    }
    d += ` L${S},${n(pts.at(-1)[1])}`;
  }
  return `${d} L${S},${S} Z`;
}

const linear = (id, stops, vertical = true) =>
  `<linearGradient id="${id}" x1="0" y1="0" x2="${vertical ? 0 : 1}" y2="${vertical ? 1 : 0}">${stops
    .map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`)
    .join('')}</linearGradient>`;

const radial = (id, stops) =>
  `<radialGradient id="${id}">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')}</radialGradient>`;

function stars(r, count, maxY) {
  return Array.from({ length: count }, () => {
    const x = n(r() * S);
    const y = n(r() * maxY);
    return `<circle cx="${x}" cy="${y}" r="${n(0.6 + r() * 1.8)}" fill="#fff" opacity="${n(0.3 + r() * 0.7)}"/>`;
  }).join('');
}

// ─── Scenes ─────────────────────────────────────────────────────────────

const scenes = {
  sunrise(h, r) {
    const sunY = 330 + r() * 60;
    const rays = Array.from({ length: 14 }, (_, i) => {
      const a = (Math.PI * i) / 13 + Math.PI;
      const x1 = 300 + Math.cos(a - 0.04) * 700;
      const y1 = sunY + Math.sin(a - 0.04) * 700;
      const x2 = 300 + Math.cos(a + 0.04) * 700;
      const y2 = sunY + Math.sin(a + 0.04) * 700;
      return `<path d="M300,${n(sunY)} L${n(x1)},${n(y1)} L${n(x2)},${n(y2)} Z" fill="#fff" opacity="0.07"/>`;
    }).join('');
    return {
      defs:
        linear('sky', [[0, hsl(h, 55, 16)], [0.55, hsl(h + 25, 70, 45)], [1, hsl(h + 45, 90, 72)]]) +
        radial('sun', [[0, hsl(h + 55, 100, 92)], [0.6, hsl(h + 45, 95, 70)], [1, hsl(h + 40, 95, 65, 0)]]),
      body: `<rect width="${S}" height="${S}" fill="url(#sky)"/>${rays}
        <circle cx="300" cy="${n(sunY)}" r="230" fill="url(#sun)" opacity="0.55"/>
        <circle cx="300" cy="${n(sunY)}" r="${n(80 + r() * 30)}" fill="${hsl(h + 50, 100, 88)}"/>
        <path d="${ridge(r, 400, 30, 4)}" fill="${hsl(h - 15, 35, 32)}"/>
        <path d="${ridge(r, 450, 28, 5)}" fill="${hsl(h - 20, 38, 21)}"/>
        <path d="${ridge(r, 510, 22, 6)}" fill="${hsl(h - 25, 40, 11)}"/>`,
    };
  },

  mountains(h, r) {
    return {
      defs:
        linear('sky', [[0, hsl(h + 10, 45, 22)], [1, hsl(h + 30, 60, 70)]]) +
        linear('lake', [[0, hsl(h + 20, 50, 45)], [1, hsl(h, 55, 15)]]),
      body: `<rect width="${S}" height="${S}" fill="url(#sky)"/>
        <circle cx="${n(150 + r() * 300)}" cy="${n(110 + r() * 60)}" r="34" fill="${hsl(h + 40, 90, 90)}" opacity="0.9"/>
        <path d="${ridge(r, 280, 90, 6, true)}" fill="${hsl(h, 25, 55)}"/>
        <path d="${ridge(r, 330, 70, 8, true)}" fill="${hsl(h - 5, 30, 35)}"/>
        <path d="${ridge(r, 380, 35, 9, true)}" fill="${hsl(h - 10, 35, 20)}"/>
        <rect y="400" width="${S}" height="200" fill="url(#lake)"/>
        ${Array.from({ length: 9 }, (_, i) => `<rect x="${n(80 + r() * 300)}" y="${430 + i * 18}" width="${n(60 + r() * 160)}" height="2" fill="#fff" opacity="${n(0.15 + r() * 0.2)}"/>`).join('')}`,
    };
  },

  night(h, r) {
    const mx = 380 + r() * 120;
    const my = 110 + r() * 60;
    const hillTop = 430;
    return {
      defs: linear('sky', [[0, hsl(h + 10, 60, 7)], [1, hsl(h + 30, 55, 30)]]) +
        `<mask id="moon"><rect width="${S}" height="${S}" fill="#fff"/><circle cx="${n(mx + 22)}" cy="${n(my - 12)}" r="46" fill="#000"/></mask>`,
      body: `<rect width="${S}" height="${S}" fill="url(#sky)"/>${stars(r, 110, 420)}
        <circle cx="${n(mx)}" cy="${n(my)}" r="120" fill="${hsl(h + 50, 80, 85)}" opacity="0.08"/>
        <circle cx="${n(mx)}" cy="${n(my)}" r="52" fill="${hsl(h + 50, 85, 88)}" mask="url(#moon)"/>
        <path d="M${n(60 + r() * 100)},${n(60 + r() * 80)} l120,40" stroke="#fff" stroke-width="2" opacity="0.5" stroke-linecap="round"/>
        <path d="M0,600 L0,500 Q150,${hillTop - 20} 300,${hillTop} T600,480 L600,600 Z" fill="${hsl(h, 40, 6)}"/>
        <g fill="${hsl(h, 40, 6)}"><rect x="294" y="${hillTop - 70}" width="12" height="74"/><rect x="274" y="${hillTop - 52}" width="52" height="11"/></g>`,
    };
  },

  stainedGlass(h, r) {
    const cols = 6;
    const rows = 8;
    const cw = 300 / cols;
    const rh = 340 / rows;
    let panes = '';
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const x0 = 150 + x * cw;
        const y0 = 180 + y * rh;
        const c = () => hsl(h + (r() - 0.5) * 90, 65 + r() * 20, 32 + r() * 28);
        const flip = r() > 0.5;
        const [a, b] = flip
          ? [`${n(x0)},${n(y0)} ${n(x0 + cw)},${n(y0)} ${n(x0)},${n(y0 + rh)}`, `${n(x0 + cw)},${n(y0)} ${n(x0 + cw)},${n(y0 + rh)} ${n(x0)},${n(y0 + rh)}`]
          : [`${n(x0)},${n(y0)} ${n(x0 + cw)},${n(y0 + rh)} ${n(x0)},${n(y0 + rh)}`, `${n(x0)},${n(y0)} ${n(x0 + cw)},${n(y0)} ${n(x0 + cw)},${n(y0 + rh)}`];
        panes += `<polygon points="${a}" fill="${c()}"/><polygon points="${b}" fill="${c()}"/>`;
      }
    }
    const petals = Array.from({ length: 8 }, (_, i) => {
      const a = (Math.PI * 2 * i) / 8;
      return `<line x1="300" y1="260" x2="${n(300 + Math.cos(a) * 70)}" y2="${n(260 + Math.sin(a) * 70)}"/>`;
    }).join('');
    const arch = `M150,560 V260 A150,150 0 0 1 450,260 V560 Z`;
    return {
      defs: `<clipPath id="win"><path d="${arch}"/></clipPath>` +
        radial('light', [[0, 'rgb(255 255 255 / 0.45)'], [1, 'rgb(255 255 255 / 0)']]) +
        linear('wall', [[0, hsl(h + 20, 25, 14)], [1, hsl(h, 30, 6)]]),
      body: `<rect width="${S}" height="${S}" fill="url(#wall)"/>
        <ellipse cx="300" cy="330" rx="280" ry="300" fill="${hsl(h + 30, 70, 50)}" opacity="0.18"/>
        <g clip-path="url(#win)">${panes}
          <circle cx="300" cy="260" r="70" fill="${hsl(h + 45, 85, 62)}"/>
          <g stroke="#1b130d" stroke-width="5">${petals}</g>
          <circle cx="300" cy="260" r="22" fill="${hsl(h + 180, 60, 45)}" stroke="#1b130d" stroke-width="5"/>
          <g stroke="#1b130d" stroke-width="6" fill="none">${Array.from({ length: cols + 1 }, (_, i) => `<line x1="${n(150 + i * cw)}" y1="180" x2="${n(150 + i * cw)}" y2="560"/>`).join('')}${Array.from({ length: rows + 1 }, (_, i) => `<line x1="150" y1="${n(180 + i * rh)}" x2="450" y2="${n(180 + i * rh)}"/>`).join('')}</g>
          <ellipse cx="260" cy="230" rx="160" ry="200" fill="url(#light)"/>
        </g>
        <path d="${arch}" fill="none" stroke="#1b130d" stroke-width="16"/>
        <path d="${arch}" fill="none" stroke="${hsl(h + 30, 30, 40)}" stroke-width="4"/>`,
    };
  },

  waves(h, r) {
    const layers = Array.from({ length: 7 }, (_, i) => {
      const base = 250 + i * 50;
      const amp = 14 + r() * 18;
      const freq = 1.5 + r() * 1.5;
      const phase = r() * Math.PI * 2;
      let d = `M0,${S}`;
      for (let x = 0; x <= S; x += 20) {
        d += ` L${x},${n(base + Math.sin((x / S) * Math.PI * 2 * freq + phase) * amp)}`;
      }
      return `<path d="${d} L${S},${S} Z" fill="${hsl(h + i * 6, 55 + i * 3, 62 - i * 7)}" opacity="0.92"/>`;
    }).join('');
    return {
      defs: linear('sky', [[0, hsl(h + 30, 60, 85)], [1, hsl(h + 10, 55, 60)]]),
      body: `<rect width="${S}" height="${S}" fill="url(#sky)"/>
        <circle cx="${n(160 + r() * 280)}" cy="${n(150 + r() * 40)}" r="62" fill="${hsl(h + 40, 90, 96)}" opacity="0.9"/>
        ${layers}`,
    };
  },

  rays(h, r) {
    const beams = Array.from({ length: 9 }, (_, i) => {
      const x = -100 + i * 100 + r() * 40;
      return `<polygon points="300,-40 ${n(x)},${S} ${n(x + 40 + r() * 50)},${S}" fill="#fff" opacity="${n(0.06 + r() * 0.08)}"/>`;
    }).join('');
    const cloud = (cx, cy, s) =>
      [[0, 0, 70], [-60, 15, 50], [60, 18, 55], [-110, 35, 35], [110, 38, 38]]
        .map(([dx, dy, rr]) => `<circle cx="${n(cx + dx * s)}" cy="${n(cy + dy * s)}" r="${n(rr * s)}"/>`)
        .join('');
    return {
      defs: linear('sky', [[0, hsl(h + 40, 85, 82)], [0.5, hsl(h + 15, 75, 58)], [1, hsl(h, 65, 30)]]) +
        `<filter id="soft"><feGaussianBlur stdDeviation="6"/></filter>`,
      body: `<rect width="${S}" height="${S}" fill="url(#sky)"/>
        <circle cx="300" cy="40" r="140" fill="#fff" opacity="0.55" filter="url(#soft)"/>
        ${beams}
        <g fill="#fff" opacity="0.75" filter="url(#soft)">${cloud(130 + r() * 60, 200 + r() * 60, 0.9)}${cloud(450 + r() * 60, 300 + r() * 50, 1.1)}</g>
        <g fill="${hsl(h + 30, 50, 92)}" opacity="0.55">${cloud(260, 470, 1.6)}</g>`,
    };
  },

  candle(h, r) {
    const bokeh = Array.from({ length: 14 }, () =>
      `<circle cx="${n(r() * S)}" cy="${n(r() * 360)}" r="${n(12 + r() * 30)}" fill="${hsl(h + 40 + r() * 20, 90, 70)}" opacity="${n(0.08 + r() * 0.15)}"/>`,
    ).join('');
    return {
      defs: linear('bg', [[0, hsl(h + 20, 35, 8)], [1, hsl(h, 40, 4)]]) +
        radial('glow', [[0, hsl(h + 45, 100, 70, 0.55)], [1, hsl(h + 40, 100, 50, 0)]]) +
        linear('wax', [[0, hsl(h + 40, 40, 92)], [1, hsl(h + 30, 30, 70)]], false) +
        // Flame stays warm whatever the track hue.
        linear('flame', [[0, '#fffbe6'], [0.5, '#ffc94d'], [1, '#ff7a1a']]) +
        `<filter id="blur"><feGaussianBlur stdDeviation="8"/></filter>`,
      body: `<rect width="${S}" height="${S}" fill="url(#bg)"/>
        <g filter="url(#blur)">${bokeh}</g>
        <circle cx="300" cy="250" r="260" fill="url(#glow)"/>
        <rect x="255" y="290" width="90" height="230" rx="10" fill="url(#wax)"/>
        <path d="M262,300 q4,40 10,42 q6,-2 6,-42 Z" fill="${hsl(h + 40, 35, 96)}"/>
        <line x1="300" y1="290" x2="300" y2="272" stroke="#2a1d14" stroke-width="3"/>
        <path d="M300,180 C318,215 326,245 300,276 C274,245 282,215 300,180 Z" fill="url(#flame)"/>
        <ellipse cx="300" cy="530" rx="120" ry="20" fill="${hsl(h + 30, 30, 22)}"/>
        <ellipse cx="300" cy="522" rx="90" ry="12" fill="${hsl(h + 30, 35, 35)}"/>`,
    };
  },

  path(h, r) {
    const lampX = r() > 0.5 ? 140 : 460;
    return {
      defs: linear('sky', [[0, hsl(h + 5, 50, 14)], [1, hsl(h + 35, 70, 55)]]) +
        linear('road', [[0, hsl(h + 40, 60, 75)], [1, hsl(h + 30, 30, 30)]]) +
        radial('lamp', [[0, hsl(h + 50, 100, 80, 0.8)], [1, hsl(h + 50, 100, 60, 0)]]),
      body: `<rect width="${S}" height="${S}" fill="url(#sky)"/>${stars(r, 50, 250)}
        <path d="${ridge(r, 330, 20, 5)}" fill="${hsl(h - 10, 35, 22)}"/>
        <path d="M0,600 L0,360 Q300,340 600,360 L600,600 Z" fill="${hsl(h - 15, 30, 13)}"/>
        <path d="M296,350 C 290,420 180,480 120,600 L480,600 C 420,480 310,420 304,350 Z" fill="url(#road)" opacity="0.85"/>
        <circle cx="${lampX}" cy="300" r="120" fill="url(#lamp)"/>
        <rect x="${lampX - 4}" y="300" width="8" height="200" fill="${hsl(h, 20, 8)}"/>
        <rect x="${lampX - 18}" y="282" width="36" height="34" rx="6" fill="${hsl(h + 50, 100, 82)}" stroke="${hsl(h, 20, 8)}" stroke-width="6"/>`,
    };
  },

  leaves(h, r) {
    // Quadratic branch; leaves and olives are placed on the curve itself.
    const p0 = [60, 500];
    const p1 = [300, 160 + r() * 40];
    const p2 = [540, 300 + r() * 40];
    const at = (t) => {
      const u = 1 - t;
      return [
        u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0],
        u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1],
      ];
    };
    const tangentDeg = (t) => {
      const dx = 2 * (1 - t) * (p1[0] - p0[0]) + 2 * t * (p2[0] - p1[0]);
      const dy = 2 * (1 - t) * (p1[1] - p0[1]) + 2 * t * (p2[1] - p1[1]);
      return (Math.atan2(dy, dx) * 180) / Math.PI;
    };
    const leaves = Array.from({ length: 16 }, (_, i) => {
      const t = 0.08 + (i / 15) * 0.88;
      const [x, y] = at(t);
      const side = i % 2 ? 1 : -1;
      const ang = tangentDeg(t) + side * (40 + r() * 15);
      return `<g transform="translate(${n(x)} ${n(y)}) rotate(${n(ang)})"><ellipse cx="34" cy="0" rx="36" ry="11" fill="${hsl(h + (r() - 0.5) * 30, 35 + r() * 15, 28 + r() * 20)}"/></g>`;
    }).join('');
    const olives = Array.from({ length: 5 }, () => {
      const [x, y] = at(0.2 + r() * 0.6);
      return `<ellipse cx="${n(x + (r() - 0.5) * 16)}" cy="${n(y + 16)}" rx="10" ry="13" fill="${hsl(h + 200, 30, 25)}"/>`;
    }).join('');
    return {
      defs: linear('bg', [[0, hsl(h + 30, 35, 88)], [1, hsl(h + 10, 30, 72)]]),
      body: `<rect width="${S}" height="${S}" fill="url(#bg)"/>
        <circle cx="${n(420 + r() * 80)}" cy="140" r="90" fill="${hsl(h + 40, 70, 95)}" opacity="0.8"/>
        <path d="M${p0} Q${p1.map(n)} ${p2.map(n)}" fill="none" stroke="${hsl(h - 20, 30, 28)}" stroke-width="7" stroke-linecap="round"/>
        ${leaves}${olives}`,
    };
  },
};

const GENRE_SCENES = {
  worship: ['sunrise', 'mountains'],
  gospel: ['rays', 'sunrise'],
  hymns: ['stainedGlass', 'leaves'],
  contemporary: ['path', 'mountains'],
  kids: ['night'],
  prayer: ['candle', 'night'],
  praise: ['rays', 'waves'],
  choir: ['stainedGlass'],
  instrumental: ['waves', 'mountains'],
  sermons: ['leaves'],
};

const PLAYLIST_SCENES = {
  'sunrise-worship': 'sunrise',
  'deep-prayer': 'candle',
  'joyful-noise': 'rays',
  'timeless-hymns': 'stainedGlass',
  'south-indian-worship': 'leaves',
  'sunday-setlist': 'stainedGlass',
  'kids-bedtime': 'night',
  'daily-mix': 'waves',
};

// ─── Composition ────────────────────────────────────────────────────────

const FINISH_DEFS = `
  <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
  <radialGradient id="vignette" cx="0.5" cy="0.45" r="0.75"><stop offset="0.6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.45"/></radialGradient>
  <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0.45" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.72"/></linearGradient>`;

function wrapTitle(title) {
  if (title.length <= 16) return [title];
  const words = title.split(' ');
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
}

function poster({ seed, scene, hue, title, subtitle, label }) {
  const r = rng(seed);
  const { defs, body } = scenes[scene](hue, r);
  let text = '';
  if (title) {
    const lines = wrapTitle(title);
    const size = lines.some((l) => l.length > 13) ? 46 : 56;
    const lastY = 530 - (subtitle ? 34 : 0);
    text = `<rect width="${S}" height="${S}" fill="url(#shade)"/>
      <g font-family="Georgia, 'Times New Roman', serif" fill="#fff">
        ${lines.map((l, i) => `<text x="40" y="${n(lastY - (lines.length - 1 - i) * size * 1.05)}" font-size="${size}" font-weight="600">${esc(l)}</text>`).join('')}
      </g>
      ${subtitle ? `<text x="42" y="564" font-family="Helvetica, Arial, sans-serif" font-size="20" letter-spacing="4" fill="#fff" opacity="0.82">${esc(subtitle.toUpperCase())}</text>` : ''}`;
  }
  const tag = label
    ? `<text x="40" y="56" font-family="Helvetica, Arial, sans-serif" font-size="15" letter-spacing="5" fill="#fff" opacity="0.7">${esc(label)}</text>`
    : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}" width="${S}" height="${S}">
<defs>${defs}${FINISH_DEFS}</defs>
${body}
<rect width="${S}" height="${S}" filter="url(#grain)" opacity="0.09"/>
<rect width="${S}" height="${S}" fill="url(#vignette)"/>
${text}${tag}
</svg>
`;
}

function artistPortrait({ slug, name, hue }) {
  const r = rng(slug);
  const initials = name.split(' ').map((w) => w[0]).slice(0, 2).join('');
  const rings = Array.from({ length: 6 }, (_, i) =>
    `<circle cx="300" cy="300" r="${90 + i * 42}" fill="none" stroke="#fff" stroke-width="${n(1 + r() * 2)}" opacity="${n(0.08 + i * 0.03)}"/>`,
  ).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}" width="${S}" height="${S}">
<defs>
  ${radial('glow', [[0, hsl(hue + 50, 95, 70)], [1, hsl(hue + 40, 90, 50, 0)]])}
  ${linear('bg', [[0, hsl(hue, 65, 42)], [1, hsl(hue + 25, 70, 14)]])}
  ${FINISH_DEFS}
</defs>
<rect width="${S}" height="${S}" fill="url(#bg)"/>
<circle cx="${n(360 + r() * 80)}" cy="${n(160 + r() * 60)}" r="260" fill="url(#glow)" opacity="0.55"/>
${rings}
<path d="${ridge(r, 470, 25, 5)}" fill="${hsl(hue - 10, 45, 12)}" opacity="0.6"/>
<text x="300" y="350" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="170" font-weight="600" fill="#fff" opacity="0.95">${esc(initials)}</text>
<rect width="${S}" height="${S}" filter="url(#grain)" opacity="0.09"/>
<rect width="${S}" height="${S}" fill="url(#vignette)"/>
</svg>
`;
}

// ─── Write files ────────────────────────────────────────────────────────

const pick = (genre, seed) => {
  const options = GENRE_SCENES[genre] ?? ['sunrise'];
  return options[Math.floor(rng(seed)() * options.length)];
};
const artistName = (slug) => catalog.artists.find((a) => a.slug === slug)?.name ?? '';

const jobs = [
  ...catalog.tracks.map((t) => [
    `tracks/${t.slug}.svg`,
    poster({ seed: t.slug, scene: pick(t.genreSlug, t.slug), hue: t.hue, title: t.title, subtitle: artistName(t.artistSlug) }),
  ]),
  ...catalog.albums.map((a) => {
    const genre = catalog.tracks.find((t) => t.albumSlug === a.slug)?.genreSlug;
    return [
      `albums/${a.slug}.svg`,
      poster({ seed: `album:${a.slug}`, scene: pick(genre, `album:${a.slug}`), hue: a.hue, title: a.title, subtitle: artistName(a.artistSlug), label: String(a.year) }),
    ];
  }),
  // Playlists carry no text: the UI typesets their title on top.
  ...catalog.playlists.map((p) => [
    `playlists/${p.slug}.svg`,
    poster({ seed: `playlist:${p.slug}`, scene: PLAYLIST_SCENES[p.slug] ?? 'sunrise', hue: p.hue }),
  ]),
  ...catalog.artists.map((a) => [`artists/${a.slug}.svg`, artistPortrait(a)]),
];

for (const [file, svg] of jobs) {
  const path = join(outDir, file);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, svg);
}
console.log(`Posters ready: ${jobs.length} SVGs in apps/web/public/images/demo`);
