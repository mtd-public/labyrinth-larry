import * as THREE from 'three';
import { markAccent, markRole } from './ink.js';

// Larry: a damned soul in a loincloth and red beanie, strapped upright inside a
// riveted iron sphere cage (a human gyroscope). The cage rolls freely; Larry
// stays upright, turns toward where he is going, runs, and screams a lot.
export class Larry {
  constructor(r) {
    this.r = r;
    this.root = new THREE.Group();
    this.cage = new THREE.Group();
    this.man = new THREE.Group();
    this.root.add(this.cage, this.man);
    this._buildCage();
    this._buildMan();
    markRole(this.cage, 'paper'); markRole(this.man, 'paper'); // beanie stays accent (marked first)
    this.heading = 0; this.runPhase = 0; this.squash = 1;
  }

  _buildCage() {
    const r = this.r;
    const iron = new THREE.MeshPhongMaterial({ color: 0x2b2624, specular: 0x9a7c66, shininess: 60 });
    const band = new THREE.MeshPhongMaterial({ color: 0x3a2e28, specular: 0xc08050, shininess: 80 });
    const tube = r * 0.05;
    // six meridians
    for (let k = 0; k < 6; k++) {
      const m = new THREE.Mesh(new THREE.TorusGeometry(r, tube, 6, 36), k % 3 ? iron : band);
      m.rotation.y = k * Math.PI / 6;
      this.cage.add(m);
    }
    // equator + two latitudes
    for (const lat of [0, 0.55, -0.55]) {
      const rr = r * Math.cos(lat);
      const m = new THREE.Mesh(new THREE.TorusGeometry(rr, tube * (lat ? 0.8 : 1.3), 6, 36), lat ? iron : band);
      m.rotation.x = Math.PI / 2; m.position.y = r * Math.sin(lat);
      this.cage.add(m);
    }
    // rivets where bands cross the equator
    const rivet = new THREE.SphereGeometry(tube * 1.6, 6, 4);
    for (let k = 0; k < 12; k++) {
      const a = k * Math.PI / 6, m = new THREE.Mesh(rivet, band);
      m.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
      this.cage.add(m);
    }
    // pole hubs
    for (const s of [1, -1]) {
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.12, r * 0.12, tube * 3, 8), band);
      hub.position.y = s * r; this.cage.add(hub);
    }
  }

  _buildMan() {
    const r = this.r, m = this.man;
    const mat = (c) => new THREE.MeshLambertMaterial({ color: c });
    const skin = mat(0xd9956c), skinDark = mat(0xb87552), hat = markAccent(mat(0xd21c2c)); // the red beanie is Larry's one splash of colour in ink mode
    const cloth = mat(0x7a5a3a), rope = mat(0x3b2616);
    const s = r / 0.8; // model authored for r = 0.8
    const box = (w, h, d, material) => new THREE.Mesh(new THREE.BoxGeometry(w * s, h * s, d * s), material);
    // smooth primitives: capsules for limbs, spheres for joints, a lathe for the torso
    const capsule = (rad, len, material) => new THREE.Mesh(new THREE.CapsuleGeometry(rad * s, len * s, 6, 12), material);
    const ball = (rad, material, seg = 12) => new THREE.Mesh(new THREE.SphereGeometry(rad * s, seg, Math.max(6, seg - 2)), material);
    // bare legs, hips pivot at y = -0.12 (sphere centre is the origin)
    this.legs = [];
    for (const side of [-1, 1]) {
      const hip = new THREE.Group();
      hip.position.set(side * 0.085 * s, -0.12 * s, 0);
      const thigh = capsule(0.062, 0.18, skin); thigh.position.y = -0.12 * s; hip.add(thigh);
      const shin = capsule(0.05, 0.16, skin); shin.position.y = -0.32 * s; hip.add(shin);
      const foot = capsule(0.045, 0.1, skinDark); foot.rotation.x = Math.PI / 2; foot.scale.y = 0.9;
      foot.position.set(0, -0.46 * s, 0.045 * s); hip.add(foot);
      m.add(hip); this.legs.push(hip);
    }
    // bare torso: a lathed barrel, broad at the chest and narrow at the waist, flattened front to back
    const prof = [[0.0, -0.12], [0.13, -0.11], [0.125, -0.02], [0.14, 0.1], [0.17, 0.2], [0.15, 0.27], [0.06, 0.31], [0.0, 0.315]]
      .map(([x, y]) => new THREE.Vector2(x * s, y * s));
    const torso = new THREE.Mesh(new THREE.LatheGeometry(prof, 16), skin);
    torso.scale.z = 0.62; torso.position.y = 0.0; m.add(torso);
    for (let k = 0; k < 3; k++) { // a hint of ribs: thin arcs across the chest
      const rib = new THREE.Mesh(new THREE.TorusGeometry(0.1 * s, 0.006 * s, 4, 12, Math.PI * 0.7), skinDark);
      rib.rotation.set(Math.PI / 2, 0, Math.PI * 0.15 + Math.PI); rib.scale.set(1, 0.62, 1);
      rib.position.set(0, (0.08 + k * 0.045) * s, 0.012 * s); m.add(rib);
    }
    // the loincloth: a rope belt, front and back flaps that flutter as he runs
    const belt = new THREE.Mesh(new THREE.TorusGeometry(0.13 * s, 0.018 * s, 6, 18), rope);
    belt.rotation.x = Math.PI / 2; belt.scale.set(1, 0.64, 1); belt.position.y = -0.1 * s; m.add(belt);
    this.flaps = [];
    for (const side of [1, -1]) {
      const pivot = new THREE.Group();
      pivot.position.set(0, -0.12 * s, side * 0.085 * s);
      const flap = box(0.18, 0.28, 0.018, cloth); flap.position.y = -0.14 * s; pivot.add(flap);
      const hem = box(0.18, 0.025, 0.022, rope); hem.position.y = -0.275 * s; pivot.add(hem);
      m.add(pivot); this.flaps.push(pivot);
    }
    const wrap = new THREE.Mesh(new THREE.CylinderGeometry(0.135 * s, 0.14 * s, 0.1 * s, 16), cloth);
    wrap.scale.z = 0.64; wrap.position.y = -0.16 * s; m.add(wrap);
    // neck and head, red beanie, eyes and a mouth that gapes when he screams
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.045 * s, 0.055 * s, 0.07 * s, 10), skin);
    neck.position.y = 0.33 * s; m.add(neck);
    const head = ball(0.12, skin, 16); head.scale.set(0.92, 1.08, 0.98);
    head.position.y = 0.44 * s; m.add(head);
    const beanie = new THREE.Mesh(new THREE.SphereGeometry(0.128 * s, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), hat);
    beanie.scale.set(0.95, 1.05, 1.02); beanie.position.y = 0.475 * s; m.add(beanie);
    const cuff = new THREE.Mesh(new THREE.TorusGeometry(0.118 * s, 0.022 * s, 6, 18), hat);
    cuff.rotation.x = Math.PI / 2; cuff.position.y = 0.48 * s; m.add(cuff);
    const dark = markRole(mat(0x111111), 'mono'); // eyes and mouth stay ink on the white figure
    for (const side of [-1, 1]) {
      const e = ball(0.017, dark, 8); e.position.set(side * 0.045 * s, 0.455 * s, 0.108 * s); m.add(e);
    }
    this.mouth = ball(0.03, markRole(mat(0x2a0505), 'mono'), 10);
    this.mouth.scale.z = 0.4; this.mouth.position.set(0, 0.395 * s, 0.108 * s); m.add(this.mouth);
    // bare arms stretched out to grip the equator, like the photo
    this.arms = [];
    for (const side of [-1, 1]) {
      const sh = new THREE.Group();
      sh.position.set(side * 0.16 * s, 0.24 * s, 0);
      const joint = ball(0.055, skin); sh.add(joint);
      const upper = capsule(0.048, 0.2, skin); upper.rotation.z = Math.PI / 2; upper.position.x = side * 0.14 * s; sh.add(upper);
      const fore = capsule(0.04, 0.2, skin); fore.rotation.z = Math.PI / 2; fore.position.x = side * 0.36 * s; sh.add(fore);
      const hand = ball(0.05, skinDark); hand.scale.set(1.1, 0.8, 0.9); hand.position.x = side * 0.52 * s; sh.add(hand);
      sh.rotation.z = side * -0.12;
      m.add(sh); this.arms.push(sh);
    }
    this.screaming = 0; // seconds of scream left (mouth open, bubble shown)
    this.bubble = makeBubble();
    this.bubble.position.y = r * 1.55;
    this.root.add(this.bubble);
  }

  scream(duration) { this.screaming = duration; this.bubble.material.map = pickBubble(); }

  // Roll the cage by the ground distance moved, face and animate Larry.
  update(dt, body, alive) {
    const vx = body.vx, vz = body.vz, sp = Math.hypot(vx, vz);
    if (alive && sp > 0.05) {
      const axis = new THREE.Vector3(vz, 0, -vx).normalize();
      const q = new THREE.Quaternion().setFromAxisAngle(axis, sp * dt / this.r);
      this.cage.quaternion.premultiply(q);
    }
    if (sp > 0.6) {
      const target = Math.atan2(vx, vz);
      let d = target - this.heading;
      d = Math.atan2(Math.sin(d), Math.cos(d));
      this.heading += d * Math.min(1, dt * 8);
    }
    this.man.rotation.y = this.heading;
    // lean into the roll and pump the legs
    const lean = Math.min(0.35, sp * 0.03);
    this.man.quaternion.setFromEuler(new THREE.Euler(lean, this.heading, 0, 'YXZ'));
    this.runPhase += sp * dt * 2.2;
    const swing = Math.min(1, sp * 0.12) * 0.9;
    this.legs[0].rotation.x = Math.sin(this.runPhase) * swing;
    this.legs[1].rotation.x = -Math.sin(this.runPhase) * swing;
    const wobble = Math.sin(this.runPhase * 2) * 0.06 * Math.min(1, sp * 0.1);
    this.arms[0].rotation.z = 0.12 + wobble; this.arms[1].rotation.z = -0.12 - wobble;
    const flutter = Math.min(0.9, sp * 0.06);
    this.flaps[0].rotation.x = -flutter * (0.8 + 0.3 * Math.sin(this.runPhase * 3));
    this.flaps[1].rotation.x = flutter * 0.5 * (1 + Math.sin(this.runPhase * 3 + 1));
    this.screaming = Math.max(0, this.screaming - dt);
    const open = this.screaming > 0 ? 1.6 + 0.5 * Math.sin(performance.now() * 0.05) : 0.25;
    this.mouth.scale.y += (open - this.mouth.scale.y) * Math.min(1, dt * 20);
    const bub = this.bubble;
    bub.visible = this.screaming > 0;
    if (bub.visible) {
      const k = Math.min(1, this.screaming * 4);
      bub.scale.set(1.9 * k, 0.8 * k, 1);
      bub.position.x = Math.sin(performance.now() * 0.06) * 0.04;
    }
    this.root.position.set(body.x, body.y + this.r * this.squash, body.z);
    this.root.scale.set(1 / Math.sqrt(this.squash), this.squash, 1 / Math.sqrt(this.squash));
  }
}

// "AAAAH!" speech bubbles, a few variants drawn once on canvases.
const SCREAMS = ['AAAAH!', 'AIEEE!', 'NOOOO!', 'HELP!', 'WAAAH!', 'MAKE IT STOP'];
let bubbleTex = null;
function pickBubble() {
  if (!bubbleTex) {
    bubbleTex = SCREAMS.map((txt) => {
      const c = document.createElement('canvas'); c.width = 256; c.height = 108;
      const g = c.getContext('2d');
      g.fillStyle = '#fff4e0'; g.strokeStyle = '#2a0505'; g.lineWidth = 6;
      g.beginPath(); g.ellipse(128, 48, 120, 42, 0, 0, Math.PI * 2); g.fill(); g.stroke();
      g.beginPath(); g.moveTo(110, 86); g.lineTo(128, 106); g.lineTo(140, 84); g.fill();
      g.fillStyle = '#b3100f';
      g.font = `900 ${txt.length > 7 ? 26 : 40}px Impact, sans-serif`;
      g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(txt, 128, 50);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
      return t;
    });
  }
  return bubbleTex[Math.floor(Math.random() * bubbleTex.length)];
}
function makeBubble() {
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: pickBubble(), depthTest: false, transparent: true }));
  sp.renderOrder = 10; sp.visible = false;
  return sp;
}
