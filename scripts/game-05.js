/* Deterministic tabletop/air physics shared by the game and its Node tests. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.CGPartyPhysics = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';
  const PONG = Object.freeze({
    gravity: 4, ballRadius: .035, cupRadius: .13, rimHeight: .15,
    tableHalfWidth: 1, tableNear: 0, tableFar: 1.25,
  });
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, Number.isFinite(Number(n)) ? Number(n) : lo));
  const lerp = (a, b, t) => a + (b - a) * t;
  function snapshot(input = {}) {
    return Object.freeze({ aim: clamp(input.aim, -1, 1), power: clamp(input.power, 0, 1) });
  }
  function resetPong() {
    const positions = [[0, .8], [-.18, .94], [.18, .94], [-.36, 1.08], [0, 1.08], [.36, 1.08]];
    return {
      type: 'pong', hits: 0, attempts: 0, shot: null,
      cups: positions.map(([x, z], id) => ({ id, x, z, radius: PONG.cupRadius, active: true })),
      table: { left: -1, right: 1, near: 0, far: 1.25 },
    };
  }
  function throwBall(state, input = {}) {
    if (state.shot && !state.shot.done) return null;
    const launch = snapshot(input);
    const shot = {
      launch, x: 0, z: -.16, h: .32,
      vx: launch.aim * 1.1, vz: .8 + launch.power * 1.8, vh: 1.15,
      age: 0, status: 'flying', result: null, done: false, bounces: 0,
      cupId: null, sinkAge: 0, events: [],
    };
    state.shot = shot;
    state.attempts++;
    return shot;
  }
  function onTable(state, x, z) {
    return x >= state.table.left && x <= state.table.right && z >= state.table.near && z <= state.table.far;
  }
  function pongTick(state, dt) {
    const s = state.shot;
    if (!s || s.done) return;
    s.age += dt;
    if (s.status === 'sinking') {
      s.sinkAge += dt;
      const cup = state.cups.find(c => c.id === s.cupId);
      s.x = lerp(s.x, cup.x, Math.min(1, dt * 15));
      s.z = lerp(s.z, cup.z, Math.min(1, dt * 15));
      s.h = PONG.rimHeight - s.sinkAge * .95;
      if (s.sinkAge >= .32) { s.status = 'landed'; s.done = true; s.h = -.15; }
      return;
    }
    const old = { x: s.x, z: s.z, h: s.h };
    s.x += s.vx * dt;
    s.z += s.vz * dt;
    s.h += s.vh * dt - .5 * PONG.gravity * dt * dt;
    s.vh -= PONG.gravity * dt;
    // A cup accepts only an actual descending rim crossing, at that cup's x/z.
    if (old.h >= PONG.rimHeight && s.h <= PONG.rimHeight && s.vh < 0) {
      const t = (old.h - PONG.rimHeight) / (old.h - s.h);
      const x = lerp(old.x, s.x, t), z = lerp(old.z, s.z, t);
      const cup = state.cups.find(c => c.active && Math.hypot(x - c.x, z - c.z) <= c.radius - PONG.ballRadius);
      if (cup) {
        cup.active = false;
        s.x = x; s.z = z; s.h = PONG.rimHeight;
        s.vx = 0; s.vz = 0; s.vh = 0;
        s.status = 'sinking'; s.result = 'hit'; s.cupId = cup.id;
        s.events.push({ type: 'cup', cupId: cup.id, age: s.age, x, z });
        state.hits++;
        return;
      }
    }
    // Table collision precedes falling: misses visibly rebound before leaving it.
    if (old.h >= PONG.ballRadius && s.h < PONG.ballRadius && s.vh < 0) {
      const t = (old.h - PONG.ballRadius) / (old.h - s.h);
      const x = lerp(old.x, s.x, t), z = lerp(old.z, s.z, t);
      if (onTable(state, x, z)) {
        s.h = PONG.ballRadius;
        s.vh = Math.max(.16, -s.vh * .50);
        s.vx *= .82; s.vz *= .84;
        s.bounces++; s.status = 'bouncing';
        s.events.push({ type: 'bounce', age: s.age, x, z });
      } else s.status = 'falling';
    }
    if (!onTable(state, s.x, s.z) && s.h < PONG.ballRadius) s.status = 'falling';
    if (s.h < -.7 || s.age > 5.5) {
      s.status = 'miss'; s.result = 'miss'; s.done = true;
      s.events.push({ type: 'miss', age: s.age, x: s.x, z: s.z });
    }
  }
  function stepPong(state, dt) {
    const duration = clamp(dt, 0, .25), n = Math.max(1, Math.ceil(duration * 240));
    for (let i = 0; i < n; i++) pongTick(state, duration / n);
    return state.shot;
  }
  function resetSmoke(options = {}) {
    return {
      type: 'smoke', hits: 0, attempts: 0, ring: null,
      hoop: { x: options.hoop?.x ?? 1, y: options.hoop?.y ?? 0, radius: options.hoop?.radius ?? .16 },
    };
  }
  function blowRing(state, input = {}) {
    if (state.ring && !state.ring.done) return null;
    const launch = snapshot(input);
    const ring = {
      launch, x: 0, y: -.08, vx: .5 + launch.power, vy: launch.aim * .85 + .03,
      radius: .035, growth: .025 + .18 * launch.power * launch.power,
      age: 0, lifetime: 1.15 + launch.power * .5,
      status: 'flying', result: null, done: false, crossed: false, events: [],
    };
    state.ring = ring; state.attempts++;
    return ring;
  }
  function smokeTick(state, dt) {
    const r = state.ring;
    if (!r || r.done) return;
    const old = { x: r.x, y: r.y, radius: r.radius };
    r.age += dt;
    r.x += r.vx * dt;
    r.y += r.vy * dt + .5 * .08 * dt * dt;
    r.vy += .08 * dt;
    r.radius += r.growth * dt;
    if (!r.crossed && old.x < state.hoop.x && r.x >= state.hoop.x) {
      r.crossed = true;
      const t = (state.hoop.x - old.x) / (r.x - old.x);
      const y = lerp(old.y, r.y, t), radius = lerp(old.radius, r.radius, t);
      const hit = Math.abs(y - state.hoop.y) + radius <= state.hoop.radius;
      r.result = hit ? 'hit' : 'miss';
      r.status = hit ? 'passing' : 'drifting';
      r.events.push({ type: hit ? 'hoop' : 'miss', age: r.age, y, radius });
      if (hit) state.hits++;
    }
    if (r.age >= r.lifetime || r.x > state.hoop.x + .40) {
      r.done = true;
      if (!r.result) r.result = 'miss';
      r.status = r.result === 'hit' ? 'complete' : 'dissipated';
    }
  }
  function stepSmoke(state, dt) {
    const duration = clamp(dt, 0, .25), n = Math.max(1, Math.ceil(duration * 240));
    for (let i = 0; i < n; i++) smokeTick(state, duration / n);
    return state.ring;
  }
  return Object.freeze({ PONG, resetPong, throwBall, stepPong, resetSmoke, blowRing, stepSmoke });
});
