/* The hidden desert cartridge. All simulation is independent from the main campaign. */
(() => {
  'use strict';
  const ROOT = typeof window !== 'undefined' ? window : globalThis;
  const PAL = { ink: '#101019', cream: '#faeac6', orange: '#f67a1b', light: '#d9d1ee', rock: '#7770bf', dark: '#3c376e' };
  function asset(path) {
    if (typeof Image === 'undefined') return null;
    const im = new Image(); im.src = ROOT.CG_ASSETS?.[path] || path; return im;
  }
  const desert = asset('assets/bonus-desert.png'), sprites = asset('assets/bonus-sprites.png');
  const loaded = im => im && im.complete && im.naturalWidth > 0;
  const has = (keys, name) => keys?.has?.(name);
  function random(s) { s.seed = (Math.imul(s.seed, 1664525) + 1013904223) >>> 0; return s.seed / 4294967296; }
  function create({ selected = 0, onEnd = () => {}, sound = () => {} } = {}) {
    const s = { selected, onEnd, sound, seed: 0xC1AC05, t: 0, camera: 0, speed: 140, score: 0, coinsTaken: 0,
      nextX: 760, chunk: 0, platforms: [{ x: -180, w: 940, y: 352 }], hazards: [{ x: 548, y: 352, type: 'cactus', dead: false, base: 548 }],
      coins: [{ x: 340, y: 305, taken: false }, { x: 548, y: 255, taken: false }], particles: [], controls: new Set(),
      player: { x: 160, y: 352, vy: 0, grounded: true, coyote: .1, jumpBuffer: 0, attack: 0, gait: 0 },
      dead: false, deathAge: 0, ended: false, cause: '', cosmetic: { jumpAt: -10, landAt: -10, deathX: 0, deathY: 0 } };
    extend(s); return s;
  }
  function extend(s) {
    while (s.nextX < s.camera + 1800) {
      const difficulty = Math.min(1, s.nextX / 9000), gap = 78 + random(s) * 30 + difficulty * 20;
      const x = s.nextX + gap, w = 420 + random(s) * 230, y = 344 + Math.floor(random(s) * 3) * 8;
      s.platforms.push({ x, w, y }); s.chunk++;
      const hx = x + 155 + random(s) * Math.max(10, w - 300), type = s.chunk % 2 ? 'chair' : 'cactus';
      s.hazards.push({ x: hx, base: hx, y, type, dead: false, phase: random(s) * 6.28 });
      // Face coins outline the jump over every actual gap; the rest reward hazard clearance.
      s.coins.push({ x: x - gap / 2, y: y - 84, taken: false }, { x: hx, y: y - 96, taken: false }, { x: x + w - 76, y: y - 48, taken: false });
      s.nextX = x + w;
    }
    s.platforms = s.platforms.filter(p => p.x + p.w > s.camera - 180);
    s.hazards = s.hazards.filter(p => p.base > s.camera - 180);
    s.coins = s.coins.filter(p => p.x > s.camera - 180);
  }
  function safeSound(s, note) { try { s.sound(note); } catch (_) {} }
  function die(s, cause) {
    if (s.dead) return;
    s.dead = true; s.cause = cause; s.deathAge = 0; s.player.vy = -190; s.player.grounded = false;
    s.cosmetic.deathX = s.player.x; s.cosmetic.deathY = s.player.y - 35;
    safeSound(s, 90);
  }
  function burst(s, x, y, color) {
    for (let i = 0; i < 9; i++) s.particles.push({ x, y, vx: (random(s) - .5) * 100, vy: -30 - random(s) * 90, life: .45, color });
  }
  function key(s, keyName, down = true, repeat = false) {
    const name = keyName.toLowerCase();
    if (down) s.controls.add(name); else s.controls.delete(name);
    if (!down || s.dead) return;
    if (!repeat && [' ', 'arrowup', 'w'].includes(name)) s.player.jumpBuffer = .12;
    if (!repeat && (name === 'j' || name === 'k') && s.player.attack <= 0) { s.player.attack = .26; safeSound(s, 520); }
  }
  function step(s, dt, keys) {
    s.t += dt;
    s.particles = s.particles.filter(p => (p.life -= dt) > 0);
    s.particles.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 250 * dt; });
    const p = s.player;
    if (s.dead) {
      s.deathAge += dt; p.vy += 700 * dt; p.y += p.vy * dt;
      if (s.deathAge >= 1.55 && !s.ended) { s.ended = true; s.onEnd({ score: s.score, distance: Math.floor(s.camera), coins: s.coinsTaken, cause: s.cause }); }
      return;
    }
    s.speed = 140 + Math.min(105, s.camera / 65);
    s.camera += s.speed * dt;
    const left = has(keys, 'arrowleft') || has(keys, 'a') || has(s.controls, 'arrowleft') || has(s.controls, 'a');
    const right = has(keys, 'arrowright') || has(keys, 'd') || has(s.controls, 'arrowright') || has(s.controls, 'd');
    const screenX = Math.max(78, Math.min(310, p.x - (s.camera - s.speed * dt) + (+right - +left) * 90 * dt));
    const oldY = p.y, wasGrounded = p.grounded; p.x = s.camera + screenX; p.gait += (s.speed + (+right - +left) * 90) * dt / 14;
    p.jumpBuffer = Math.max(0, p.jumpBuffer - dt); p.attack = Math.max(0, p.attack - dt);
    if (p.grounded) p.coyote = .1; else p.coyote = Math.max(0, p.coyote - dt);
    if (p.jumpBuffer > 0 && p.coyote > 0) { p.vy = -405; p.grounded = false; p.coyote = 0; p.jumpBuffer = 0; s.cosmetic.jumpAt = s.t; safeSound(s, 760); }
    p.vy += 920 * dt; p.y += p.vy * dt; p.grounded = false;
    for (const floor of s.platforms) {
      if (p.x + 12 > floor.x && p.x - 12 < floor.x + floor.w && p.vy >= 0 && oldY <= floor.y + 2 && p.y >= floor.y) {
        p.y = floor.y; p.vy = 0; p.grounded = true; break;
      }
    }
    if (!wasGrounded && p.grounded) s.cosmetic.landAt = s.t;
    for (const h of s.hazards) {
      if (h.dead) continue;
      if (h.type === 'chair') h.x = h.base + Math.sin(s.t * 1.5 + h.phase) * 20;
      if (p.attack > 0 && h.type === 'chair' && h.x >= p.x - 10 && h.x < p.x + 78 && Math.abs(p.y - h.y) < 45) {
        h.dead = true; s.score += 75; burst(s, h.x, h.y - 26, PAL.light); safeSound(s, 430); continue;
      }
      const height = h.type === 'chair' ? 48 : 53, width = h.type === 'chair' ? 20 : 14;
      if (Math.abs(p.x - h.x) < 12 + width && p.y > h.y - height + 6 && p.y - 61 < h.y - 6) {
        if (h.type === 'chair' && p.vy > 0 && oldY <= h.y - height + 14) {
          h.dead = true; p.vy = -255; s.score += 75; burst(s, h.x, h.y - 30, PAL.orange); safeSound(s, 950);
        } else { die(s, h.type === 'chair' ? 'THE CHAIR WON' : 'CACTUS HUG'); break; }
      }
    }
    for (const c of s.coins) if (!c.taken && Math.abs(p.x - c.x) < 27 && Math.abs(p.y - 38 - c.y) < 36) {
      c.taken = true; s.coinsTaken++; s.score += 50; burst(s, c.x, c.y, PAL.orange); safeSound(s, 1175);
    }
    if (p.y > 445) die(s, 'MIND THE GAP');
    s.score = Math.max(s.score, Math.floor(s.camera / 3) + s.coinsTaken * 50 + s.hazards.filter(h => h.dead).length * 75);
    extend(s);
  }
  function update(s, dt, keys) {
    if (s.ended) return;
    let remaining = Math.max(0, Math.min(.1, dt));
    while (remaining > .000001) { const delta = Math.min(1 / 120, remaining); step(s, delta, keys); remaining -= delta; if (s.ended) break; }
  }
  function rect(g, x, y, w, h, color) { g.fillStyle = color; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }
  function text(g, str, x, y, scale = 1, color = PAL.cream, align = 'left') {
    str = String(str).toUpperCase(); if (align === 'center') x -= str.length * 3 * scale; if (align === 'right') x -= str.length * 6 * scale;
    for (const ch of str) {
      const rows = (ROOT.CG_FONT?.[ch] || '00000/00000/00000/00000/00000/00000/00000').split('/');
      rows.forEach((row, yy) => [...row].forEach((v, xx) => { if (v === '1') rect(g, x + xx * scale, y + yy * scale, scale, scale, color); })); x += 6 * scale;
    }
  }
  function sprite(g, col, row, x, feet, size = 80, flip = 1) {
    if (!loaded(sprites)) return false;
    g.save(); g.translate(Math.round(x), Math.round(feet + size / 16)); g.scale(flip, 1);
    g.drawImage(sprites, col * sprites.width / 8, row * sprites.height / 2, sprites.width / 8, sprites.height / 2, -size / 2, -size, size, size); g.restore(); return true;
  }
  function ground(g, p, camera) {
    const x = Math.floor(p.x - camera), left = Math.max(-40, x), right = Math.min(680, x + p.w);
    if (right < left) return;
    rect(g, left, p.y, right - left, 420 - p.y, PAL.ink); rect(g, left + 3, p.y + 4, right - left - 6, 416 - p.y, PAL.rock);
    for (let worldX = Math.floor((left + camera) / 12) * 12; worldX < right + camera; worldX += 12) {
      const xx = worldX - camera, n = Math.abs(Math.imul(Math.floor(worldX / 12), 2654435761)) >>> 0;
      rect(g, Math.max(left + 3, xx), p.y + 4, Math.min(9, right - xx - 2), 5 + n % 7, n % 3 ? PAL.cream : PAL.light);
      for (let yy = p.y + 17; yy < 420; yy += 13) {
        const q = (n + yy * 17) % 31; rect(g, xx + q % 6, yy, 3 + q % 4, 4 + q % 7, q % 3 ? PAL.dark : PAL.light);
      }
    }
    rect(g, left, p.y, right - left, 3, PAL.ink);
  }
  function background(s, bg) {
    bg.clearRect(0, 0, 640, 420); bg.imageSmoothingEnabled = false;
    rect(bg, 0, 0, 640, 420, PAL.cream);
    if (loaded(desert)) bg.drawImage(desert, 0, 0, desert.width, desert.height, -12 - Math.sin(s.camera / 1800) * 12, 26 + Math.round(Math.sin(s.t * .35)), 676, 420);
    else { rect(bg, 0, 220, 640, 200, PAL.rock); rect(bg, 225, 120, 200, 108, PAL.orange); }
    // Dust and far scrub scroll at their own parallax rates behind solid foreground ledges.
    for (let i = 0; i < 20; i++) {
      const x = ((i * 83 - s.camera * .22) % 680 + 680) % 680 - 20, y = 260 + i % 5 * 17;
      rect(bg, x, y + Math.sin(s.t * .45 + i) * 2, i % 3 ? 3 : 5, 2, i % 2 ? PAL.dark : '#a19ace');
    }
    for (let i = 0; i < 28; i++) {
      const phase = s.t * .7 + i, x = 240 + (i * 47 % 160), y = 111 - Math.sin(phase) * 22;
      if (Math.sin(phase * 2) > .1) rect(bg, x, y, 2, 2, PAL.orange);
    }
  }
  function dust(g, x, floor, age, landing = false) {
    if (age < 0 || age > .28) return;
    const spread = Math.floor(age * 72), lift = Math.floor(Math.sin(age / .28 * Math.PI) * (landing ? 7 : 4));
    for (const side of [-1, 1]) {
      rect(g, x + side * (9 + spread) - 3, floor - lift - 3, landing ? 7 : 5, 3, '#d9d1eeaa');
      if (age < .19) rect(g, x + side * (16 + spread) - 2, floor - lift - 6, 4, 3, '#7770bfbb');
    }
  }
  function impact(g, x, y, age) {
    if (age > .22) return;
    const r = 5 + Math.floor(age * 80);
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4;
      rect(g, x + Math.round(Math.cos(a) * r), y + Math.round(Math.sin(a) * r), i % 2 ? 3 : 5, i % 2 ? 5 : 3, i % 2 ? PAL.orange : PAL.cream);
    }
  }
  function draw(s, { g, bg }) {
    background(s, bg); g.clearRect(0, 0, 640, 420); g.imageSmoothingEnabled = false;
    // The floor of a gap is visibly lethal; these are different objects from the ledges.
    for (let x = -((s.camera * 1.0) % 30); x < 670; x += 30) sprite(g, 7, 1, x, 416, 47);
    s.platforms.forEach(p => ground(g, p, s.camera));
    for (const c of s.coins) if (!c.taken) {
      const y = c.y + Math.sin(s.t * 4 + c.x) * 3;
      if (!sprite(g, Math.floor(s.t * 8) % 2, 1, c.x - s.camera, y + 15, 42)) rect(g, c.x - s.camera - 8, y - 8, 16, 16, PAL.orange);
    }
    for (const h of s.hazards) if (!h.dead) {
      const col = h.type === 'chair' ? 3 + Math.floor(s.t * 6 + h.phase) % 2 : 2, size = h.type === 'chair' ? 76 : 66;
      rect(g, h.x - s.camera - 16, h.y - 1, 32, 4, '#10101988');
      if (!sprite(g, col, 1, h.x - s.camera, h.y, size)) rect(g, h.x - s.camera - 12, h.y - 45, 24, 45, PAL.dark);
    }
    const p = s.player, floor = s.platforms.find(f => p.x >= f.x && p.x <= f.x + f.w), x = p.x - s.camera;
    if (floor && !s.dead) {
      const half = Math.max(6, 17 - Math.max(0, floor.y - p.y) * .09);
      rect(g, x - half, floor.y - 1, half * 2, 4, '#10101999');
      if (p.grounded) dust(g, x - 8, floor.y, (p.gait % 1) * .35);
      dust(g, x, floor.y, s.t - s.cosmetic.jumpAt);
      dust(g, x, floor.y, s.t - s.cosmetic.landAt, true);
    }
    const swingAge = .26 - p.attack, windup = p.attack > 0 && swingAge < .045;
    const frame = s.dead ? 7 : p.attack > 0 ? (windup ? 1 : 6) : !p.grounded ? (p.vy < 0 ? 4 : 5) : Math.floor(p.gait) % 4;
    const lean = windup ? -3 : p.attack > .08 ? 3 : 0;
    if (!sprite(g, frame, 0, x + lean, p.y, 88)) rect(g, x - 12, p.y - 55, 24, 55, PAL.cream);
    if (p.attack > .08 && !windup && !s.dead) for (let i = 0; i < 3; i++) rect(g, x + 26 + i * 7, p.y - 36 - i * 5, 10 - i * 2, 2, i === 1 ? PAL.orange : PAL.cream);
    if (!p.grounded && p.vy < -180 && !s.dead) for (let i = 0; i < 3; i++) rect(g, x - 17 - i * 5, p.y - 17 + i * 7, 3, 7 - i, '#d9d1ee88');
    if (s.dead) impact(g, s.cosmetic.deathX - s.camera, s.cosmetic.deathY, s.deathAge);
    s.particles.forEach(particle => rect(g, particle.x - s.camera, particle.y, 3, 3, particle.color));
    rect(g, 0, 0, 640, 29, PAL.ink); text(g, 'BONUS / CIRCUS GENETIC', 10, 9, 1, PAL.orange);
    text(g, Math.floor(s.camera) + 'M', 388, 9, 1); text(g, 'SCORE ' + s.score, 626, 9, 1, PAL.cream, 'right');
    rect(g, 0, 398, 640, 22, PAL.ink); text(g, 'SPACE/UP: JUMP   J: STRIKE   LEFT/RIGHT: DRIFT', 10, 406, 1);
    if (s.t < 2.4 && !s.dead) { rect(g, 128, 51, 384, 38, '#101019ef'); text(g, 'ALL MY FRIENDS ARE DEAD', 320, 60, 2, PAL.orange, 'center'); text(g, 'BONUS RUN. BANK THE POINTS.', 320, 79, 1, PAL.cream, 'center'); }
    if (s.dead) { rect(g, 111, 127, 418, 85, '#101019ef'); text(g, s.cause, 320, 141, 2, PAL.orange, 'center'); text(g, 'RUN ' + Math.floor(s.camera) + 'M / ' + s.coinsTaken + ' FACE COINS', 320, 168, 1, PAL.cream, 'center'); text(g, 'RETURNING TO THE BAND...', 320, 192, 1, PAL.cream, 'center'); }
  }
  const API = { create, update, draw, key };
  ROOT.CGBonusStage = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})();
