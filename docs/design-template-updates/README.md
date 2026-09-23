# Updates for mstr-gme-dsgn-tmpt

These are the lessons, techniques and reusable code from labyrinth-larry's
**Sin City ink** art style and **seven-sins** level set, prepared for the
[master design template](https://github.com/mtd-public/mstr-gme-dsgn-tmpt).
They have not been pushed there yet. The patch applies cleanly to the tip of
the template's default branch, `claude/festive-lamport-bgv69h` (checked with
`git apply --check`).

## Apply

```
cd mstr-gme-dsgn-tmpt
git checkout -b claude/sin-city-ink-3d origin/claude/festive-lamport-bgv69h
git am /path/to/labyrinth-larry/docs/design-template-updates/0001-*.patch
```

## What's in the patch

| Where | What |
|---|---|
| `docs/06-art-direction.md` | New house style **§7 Sin City ink (3D two-tone)**: roles, hatching, edges, fire, hero contrast, palettes, ink chrome, settings. Adds per-level sin palettes to §6 and a row to the style chooser |
| `docs/07-rendering-3d.md` | The **role patch** material recipe (`onBeforeCompile` + a shared uniform, no recompile) and a full section: **A two-tone ink post pass**, with its numbers |
| `docs/14-pitfalls-and-fixes.md` | #69–74: linear render target thresholds, accent flood, hero vanishing, noisy hatching, inherited `letter-spacing` tween, an autopilot that ignored lava |
| `docs/11-mechanics-cookbook.md` | Surface tiles for a rolling ball (tar, grease, wind, coins) with numbers |
| `docs/12-levels-worlds-progression.md` | Seven-sins course set, a level meta table (`LEVELS` + `SINS` merge), new glyphs |
| `docs/05-hud-gauges-indicators.md` | Vanilla settings cog row |
| `docs/01-game-catalog.md`, `docs/README.md`, `AGENTS.md` | Catalog entry and counts refreshed (7 styles, 74 pitfalls) |
| `kits/vanilla-js/three/ink-two-tone-3d.labyrinth-larry.js` | Drop-in ink style for any three.js r160 scene (`js/ink.js`) |
| `kits/vanilla-js/util/settings-url-override.labyrinth-larry.js` | Saved settings with URL overrides (`js/settings.js`) |
| `kits/README.md` | Rows for both kits |
| `assets/screenshots/labyrinth-larry/` | Ink screenshots, settings card, Sin title card |

## Follow-up after it merges

Refresh `reference/labyrinth-larry/` from labyrinth-larry `main` (once the
ink-style branch merges there), and update its commit SHA in
`reference/SOURCES.md`. The snapshot there predates the seven sins and the
ink style.
