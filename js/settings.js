import { INK_PALETTES, inkPalette } from './ink.js';

// Player settings: art style + ink palette + sound. Saved in localStorage;
// ?art=ink&palette=blood (or art=classic) in the URL overrides them, so a
// shared link opens straight into a given look (as in dive-depths).
const KEY = 'labyrinth-larry.settings';
const DEFAULTS = { art: 'classic', palette: 'sin', muted: false };

export function loadSettings() {
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (_) { /* storage is optional */ }
  const q = new URLSearchParams(location.search);
  const art = q.get('art') || saved.art;
  return {
    art: art === 'ink' ? 'ink' : 'classic',
    palette: inkPalette(q.get('palette') || saved.palette || DEFAULTS.palette).id,
    muted: typeof saved.muted === 'boolean' ? saved.muted : DEFAULTS.muted,
  };
}

export function saveSettings(s) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (_) { /* storage is optional */ }
}

export function cyclePalette(s, dir) {
  const i = INK_PALETTES.findIndex((p) => p.id === s.palette);
  s.palette = INK_PALETTES[(i + dir + INK_PALETTES.length) % INK_PALETTES.length].id;
}
