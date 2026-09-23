// Tarot-and-scroll UI kit: line-art SVG plates and HTML builders for the menus.
// Everything strokes/fills with currentColor (and .acc with the accent token),
// so the same markup works in the Hellfire and Sin City art styles.

const svg = (body, extra = '') =>
  `<svg viewBox="0 0 100 100" aria-hidden="true" ${extra}><g fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${body}</g></svg>`;

// a sunburst behind every plate, like the rays on old tarot trumps
const rays = Array.from({ length: 16 }, (_, k) => {
  const a = (k / 16) * Math.PI * 2, r0 = 30, r1 = 46;
  return `<line x1="${50 + Math.cos(a) * r0}" y1="${50 + Math.sin(a) * r0}" x2="${50 + Math.cos(a) * r1}" y2="${50 + Math.sin(a) * r1}" stroke-width="1" opacity="0.45"/>`;
}).join('');

export const ART = {
  // 0 · The Fool: Larry strapped in his gyro-cage, red beanie, loincloth
  fool: svg(`${rays}
    <circle cx="50" cy="52" r="32"/>
    <ellipse cx="50" cy="52" rx="13" ry="32"/><ellipse cx="50" cy="52" rx="25" ry="32"/>
    <ellipse cx="50" cy="52" rx="32" ry="9"/>
    <circle cx="50" cy="36" r="5"/>
    <path class="acc" d="M44.6 35 a5.4 5.4 0 0 1 10.8 0 z" fill="currentColor" stroke="none"/>
    <path d="M50 41 V60 M26 48 L50 46 L74 48 M50 60 L44 76 M50 60 L56 76"/>
    <path d="M45 58 L55 58 L52 66 L48 66 Z" fill="currentColor" stroke-width="1.2"/>
    <path d="M44 38.5 q6 4 12 0" stroke-width="1.6"/>`),
  // XII · The Hanged Man (pause)
  hanged: svg(`${rays}
    <path d="M22 22 H78 M30 22 V16 M70 22 V16"/>
    <path d="M50 22 V34"/>
    <path d="M50 34 L44 44 M50 34 L56 44 M44 44 L50 60 L56 44"/>
    <path d="M50 60 V70 M40 56 L50 64 L60 56"/>
    <circle cx="50" cy="76" r="6"/>
    <circle class="acc" cx="50" cy="76" r="10" stroke-width="1.4" opacity="0.8"/>`),
  // I · The Magician (settings): wand, lemniscate, a cog
  magician: svg(`${rays}
    <path d="M28 30 c8 -10 16 10 22 0 c6 -10 14 10 22 0 c-8 10 -16 -10 -22 0 c-6 10 -14 -10 -22 0 z"/>
    <path d="M30 80 L66 44" stroke-width="3.2"/>
    <circle class="acc" cx="68" cy="42" r="3.5" fill="currentColor" stroke="none"/>
    <circle cx="44" cy="64" r="9"/><circle cx="44" cy="64" r="3"/>
    <path d="M44 51 v4 M44 73 v4 M31 64 h4 M53 64 h4 M35 55 l3 3 M50 70 l3 3 M35 73 l3 -3 M50 58 l3 -3"/>`),
  // XIII · Death (time's up)
  death: svg(`${rays}
    <path d="M34 46 a16 16 0 1 1 32 0 v8 l-5 4 v8 h-22 v-8 l-5 -4 z"/>
    <circle class="acc" cx="43" cy="47" r="4" fill="currentColor" stroke="none"/>
    <circle class="acc" cx="57" cy="47" r="4" fill="currentColor" stroke="none"/>
    <path d="M50 53 l-2 5 h4 z M44 66 v-5 M50 66 v-5 M56 66 v-5"/>
    <path d="M78 18 L60 86 M78 18 q-26 -6 -44 10 q18 -2 40 4" stroke-width="2"/>`),
  // XXI · The World (victory): wreath around a dancing figure
  world: svg(`${rays}
    <ellipse cx="50" cy="52" rx="24" ry="34"/>
    <path d="M30 30 l-4 -4 M70 30 l4 -4 M30 74 l-4 4 M70 74 l4 4" stroke-width="1.6"/>
    <circle cx="50" cy="34" r="4.5"/>
    <path d="M50 39 V58 M38 44 L50 46 L62 40 M50 58 L42 72 M50 58 L58 66 L52 74"/>
    <path class="acc" d="M26 52 q24 -8 48 0" stroke-width="1.6"/>`),
};

// One emblem per sin, for the circle cards
export const SIGIL = {
  Pride: svg(`${rays}<path d="M28 66 L24 34 L38 48 L50 26 L62 48 L76 34 L72 66 Z"/><path d="M28 72 H72"/><circle class="acc" cx="50" cy="56" r="4" fill="currentColor" stroke="none"/>`),
  Envy: svg(`${rays}<path d="M20 50 Q50 20 80 50 Q50 80 20 50 Z"/><circle cx="50" cy="50" r="11"/><circle class="acc" cx="50" cy="50" r="5" fill="currentColor" stroke="none"/>`),
  Wrath: svg(`${rays}<path d="M50 18 V64"/><path d="M50 64 a12 12 0 1 1 -12 12"/><path d="M38 76 l-4 -6"/><path d="M40 28 H60"/><path class="acc" d="M44 80 q6 -8 12 0" stroke-width="2"/>`),
  Sloth: svg(`${rays}<path d="M32 22 H68 M32 78 H68 M36 22 C36 42 64 44 64 50 C64 56 36 58 36 78 M64 22 C64 42 36 44 36 50 C36 56 64 58 64 78"/><path class="acc" d="M42 72 H58 L50 62 Z" fill="currentColor" stroke="none"/>`),
  Greed: svg(`${rays}<circle cx="50" cy="50" r="22"/><circle cx="50" cy="50" r="16" stroke-width="1.2"/><path class="acc" d="M56 42 q-6 -5 -12 0 q-3 5 6 8 q9 3 6 8 q-6 5 -12 0 M50 36 v28" stroke-width="2.2"/>`),
  Gluttony: svg(`${rays}<path d="M32 26 H68 Q66 50 50 54 Q34 50 32 26 Z"/><path d="M50 54 V72 M38 74 H62"/><path class="acc" d="M36 34 H64" stroke-width="3"/>`),
  Lust: svg(`${rays}<path d="M50 76 C22 56 26 32 40 32 C46 32 50 38 50 42 C50 38 54 32 60 32 C74 32 78 56 50 76 Z"/><path class="acc" d="M50 30 q-6 -8 0 -14 q6 6 0 14" fill="currentColor" stroke="none"/>`),
};

const CORNERS = '<i class="orn tl">✥</i><i class="orn tr">✥</i><i class="orn bl">✥</i><i class="orn br">✥</i>';

// A whole tarot face for the #card element: numeral, art plate, body, name plate.
export function tarot({ numeral, name, art, body, accent }) {
  const style = accent ? ` style="--sin:${accent}"` : '';
  return `${CORNERS}<div class="tarot"${style}>
    <div class="tarot-num">${numeral}</div>
    ${art ? `<div class="tarot-art">${art}</div>` : ''}
    <div class="tarot-body">${body}</div>
    <div class="tarot-plate"><span>${name}</span></div>
  </div>`;
}

export const ribbon = (text, cls = '') => `<div class="ribbon ${cls}"><span>${text}</span></div>`;
export const scroll = (html, cls = '') => `<div class="scroll ${cls}"><div class="scroll-in">${html}</div></div>`;

// The hand of seven small trump cards for level select.
export function deck(sins) {
  return `<div class="deck">${sins.map((s, i) => `
    <button class="mini-tarot" data-lv="${i}" style="--sin:${s.accent};--i:${i - (sins.length - 1) / 2};--y:${Math.abs(i - (sins.length - 1) / 2) * 4}px" title="${s.sin}: ${s.title}">
      <b>${s.numeral}</b><span class="mini-art">${SIGIL[s.sin] || ''}</span><em${s.sin.length > 6 ? ' class="long"' : ''}>${s.sin}</em>
    </button>`).join('')}</div>`;
}
