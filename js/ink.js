import * as THREE from 'three';

// "Sin City" ink style: a two-tone art mode for a lit three.js scene.
//
// It is the 3D cousin of dive-depths' two-tone sprites (see mstr-gme-dsgn-tmpt
// docs/06 §4). Everything is drawn in palette *roles*, not colours:
//   ink    — the dark: shadows, the void, outlines on light shapes
//   paper  — the light: lit stone, skin, bone, outlines on dark shapes
//   accent — the one detail colour: fire, lava, the hellmouth, danger, Larry's hat
//
// It works in two steps, and neither needs new materials or meshes:
//  1. Material patch. Every built-in material gets a few lines appended to its
//     fragment shader. When ink mode is on, a 'mono' material writes its
//     luminance as grey, and an 'accent' material writes pure key-red at its
//     brightness. The switch is one shared uniform, so toggling costs no
//     shader recompile.
//  2. Post pass. The frame is rendered to a target with a depth texture. One
//     full-screen shader then maps key-red to the accent colour and maps grey to
//     ink, engraved hatching or paper. It draws depth edges in the opposite tone
//     and lets ash streaks fall through the void.

export const INK_PALETTES = [
  { id: 'sin', name: 'Sin (per circle)', ink: '#000000', paper: '#ffffff', accent: null },
  { id: 'blood', name: 'Blood', ink: '#000000', paper: '#ffffff', accent: '#ff1f2d' },
  { id: 'ember', name: 'Ember', ink: '#000000', paper: '#fff8ec', accent: '#ff7a1a' },
  { id: 'gilt', name: 'Gilt', ink: '#050402', paper: '#f4efe2', accent: '#ffc21f' },
  { id: 'absinthe', name: 'Absinthe', ink: '#000000', paper: '#eef6ea', accent: '#6aff3a' },
  { id: 'neon', name: 'Neon Lust', ink: '#000000', paper: '#ffffff', accent: '#ff2ad4' },
  { id: 'noir', name: 'Pure Noir', ink: '#000000', paper: '#ffffff', accent: '#ffffff' },
  { id: 'negative', name: 'Negative', ink: '#f2efe8', paper: '#0a0a0a', accent: '#d8102a' },
];
export const inkPalette = (id) => INK_PALETTES.find((p) => p.id === id) || INK_PALETTES[0];

// One uniform shared by every patched material: 0 = classic, 1 = ink.
export const inkUniform = { value: 0 };

// GLSL for hand-written ShaderMaterials. Add `uInk: inkUniform` to their
// uniforms, declare `uniform float uInk;`, and call before colorspace output.
export const INK_GLSL = /* glsl */`
  vec3 inkMono(vec3 c) { return uInk > 0.5 ? vec3(dot(c, vec3(0.299, 0.587, 0.114))) : c; }
  vec3 inkAccent(vec3 c) { return uInk > 0.5 ? vec3(max(c.r, max(c.g, c.b)), 0.0, 0.0) : c; }
`;

const MONO = `if (uInk > 0.5) gl_FragColor.rgb = vec3(dot(gl_FragColor.rgb, vec3(0.299, 0.587, 0.114)));`;
const ACCENT = `if (uInk > 0.5) gl_FragColor.rgb = vec3(max(gl_FragColor.r, max(gl_FragColor.g, gl_FragColor.b)), 0.0, 0.0);`;
// the hero: flat paper, so the player pops as a white figure (Sin City's backlit silhouettes)
const PAPER = `if (uInk > 0.5) gl_FragColor.rgb = vec3(1.0);`;

// Tag an object as hidden in ink mode (soft glows and halos: ink has no blur).
export function inkHide(obj) { obj.userData.inkHide = true; return obj; }

// Give an object (and everything under it) or a material an ink role:
// 'accent' (the one colour), 'paper' (flat white hero) or the default 'mono'.
export function markRole(target, role) {
  const set = (m) => { if (!m.userData.ink) m.userData.ink = role; };
  if (target.isMaterial) set(target);
  else target.traverse((o) => { if (o.material) [].concat(o.material).forEach(set); });
  return target;
}
export const markAccent = (target) => markRole(target, 'accent');

function patch(m) {
  if (m.userData.inkPatched || m.isShaderMaterial) return;
  m.userData.inkPatched = true;
  const role = m.userData.ink || 'mono';
  const code = { accent: ACCENT, paper: PAPER, mono: MONO }[role];
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uInk = inkUniform;
    sh.fragmentShader = 'uniform float uInk;\n' + sh.fragmentShader.replace(
      '#include <fog_fragment>', '#include <fog_fragment>\n' + code);
  };
  m.customProgramCacheKey = () => 'ink-' + role;
  m.needsUpdate = true;
}

// Patch every material under root. Call after building anything new.
export function inkify(root) {
  root.traverse((o) => { if (o.material) [].concat(o.material).forEach(patch); });
}

// Show/hide inkHide objects for the current mode. Call after inkify and on toggle.
export function applyInkVisibility(root) {
  const on = inkUniform.value > 0.5;
  root.traverse((o) => { if (o.userData.inkHide) o.visible = !on; });
}

export class InkPass {
  constructor(renderer) {
    this.renderer = renderer;
    this.rt = new THREE.WebGLRenderTarget(4, 4, { depthTexture: new THREE.DepthTexture(4, 4) });
    this.uniforms = {
      tColor: { value: this.rt.texture }, tDepth: { value: this.rt.depthTexture },
      uRes: { value: new THREE.Vector2(4, 4) }, uPx: { value: 1 }, uTime: { value: 0 },
      uInkC: { value: new THREE.Color() }, uPaper: { value: new THREE.Color() }, uAccent: { value: new THREE.Color() },
      uEdge: { value: 0.0035 },
    };
    this.mat = new THREE.ShaderMaterial({
      uniforms: this.uniforms, depthTest: false, depthWrite: false,
      vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
      fragmentShader: /* glsl */`
        uniform sampler2D tColor; uniform sampler2D tDepth;
        uniform vec2 uRes; uniform float uPx; uniform float uTime; uniform float uEdge;
        uniform vec3 uInkC; uniform vec3 uPaper; uniform vec3 uAccent;
        varying vec2 vUv;
        float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
        float depthAt(vec2 o) { return texture2D(tDepth, vUv + o / uRes).r; }
        void main() {
          vec3 c = texture2D(tColor, vUv).rgb;
          float d = depthAt(vec2(0.0));
          vec2 p = gl_FragCoord.xy / uPx;                 // CSS pixels, so hatching is the same on any DPR
          // engraving: diagonal line screens of increasing density
          float h1 = step(0.75, fract((p.x + p.y) / 5.0));            // sparse lines
          float h2 = step(0.5, fract((p.x + p.y) / 5.0));             // half lines
          float h3 = max(h2, step(0.75, fract((p.x - p.y) / 5.0)));   // cross-hatch
          float lum = pow(dot(c, vec3(0.299, 0.587, 0.114)), 1.0 / 2.2); // perceptual
          float key = c.r - max(c.g, c.b);                  // accent materials write key-red
          vec3 col;
          if (key > 0.08) {
            float a = pow(c.r, 1.0 / 2.2);
            col = a > 0.72 ? uAccent : a > 0.5 ? mix(uInkC, uAccent, h2) : a > 0.3 ? mix(uInkC, uAccent, h1) : uInkC;
          } else {
            float v = lum > 0.46 ? 1.0 : lum > 0.38 ? h3 : lum > 0.3 ? h2 : lum > 0.21 ? h1 : 0.0;
            col = mix(uInkC, uPaper, v);
            // the void: ash streaks falling past
            if (d > 0.9999) {
              vec2 q = vec2(floor(p.x / 3.0), floor((p.y + uTime * 90.0 + p.x * 0.35) / 26.0));
              col = mix(uInkC, uPaper, step(0.992, hash(q)) * 0.55);
            }
          }
          // ink edges from depth discontinuities, drawn in the opposite tone
          float e = max(abs(depthAt(vec2(uPx, 0.0)) - depthAt(vec2(-uPx, 0.0))),
                        abs(depthAt(vec2(0.0, uPx)) - depthAt(vec2(0.0, -uPx))));
          if (e > uEdge) {
            float bright = dot(col, vec3(0.333));
            col = bright > dot(mix(uInkC, uPaper, 0.5), vec3(0.333)) ? uInkC : uPaper;
          }
          gl_FragColor = vec4(col, 1.0);
          #include <colorspace_fragment>
        }`,
    });
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.mat);
    this.quad.frustumCulled = false;
    this.scene = new THREE.Scene(); this.scene.add(this.quad);
    this.cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  }

  setSize(w, h, dpr) {
    const W = Math.round(w * dpr), H = Math.round(h * dpr);
    this.rt.setSize(W, H);
    this.uniforms.uRes.value.set(W, H); this.uniforms.uPx.value = dpr;
  }

  setPalette(p, fallbackAccent) {
    this.uniforms.uInkC.value.set(p.ink); this.uniforms.uPaper.value.set(p.paper);
    this.uniforms.uAccent.value.set(p.accent || fallbackAccent);
  }

  render(scene, camera, t) {
    const r = this.renderer;
    this.uniforms.uTime.value = t;
    r.setRenderTarget(this.rt); r.render(scene, camera);
    r.setRenderTarget(null); r.render(this.scene, this.cam);
  }
}
