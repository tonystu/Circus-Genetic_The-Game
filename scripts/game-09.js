/* Pixel-painted section announcements. The game loop owns this clock. */
(() => {
  'use strict';
  const P = { ink: '#111621', edge: '#070a10', cream: '#f4e4bd', orange: '#ed873c', pink: '#e95a9d', rust: '#853f31', cyan: '#46c4ca' };
  let queue = [], elapsed = 0, duration = 1.55, reducedMotion = false;

  function start(label, options = {}) {
    queue = (Array.isArray(label) ? label : [label])
      .filter(value => typeof value === 'string' && value.trim())
      .map(value => value.trim().replace(/\s+/g, ' ').toUpperCase());
    elapsed = 0;
    duration = Number.isFinite(options.duration) ? Math.max(.3, options.duration) : 1.55;
    reducedMotion = options.reducedMotion === true;
  }
  function clear() { queue = []; elapsed = 0; }
  function isActive() { return queue.length > 0; }
  function update(dt) {
    if (!isActive() || !Number.isFinite(dt) || dt <= 0) return;
    elapsed += dt;
    while (queue.length && elapsed + 1e-9 >= duration) {
      elapsed = Math.max(0, elapsed - duration);
      queue.shift();
    }
    if (!queue.length) elapsed = 0;
  }
  function wrap(label) {
    if (label.length <= 14) return [label];
    const words = label.split(' ');
    if (words.length === 1) return [label];
    let best = 1, balance = Infinity;
    for (let i = 1; i < words.length; i++) {
      const left = words.slice(0, i).join(' '), right = words.slice(i).join(' ');
      const difference = Math.abs(left.length - right.length);
      if (difference < balance) { best = i; balance = difference; }
    }
    return [words.slice(0, best).join(' '), words.slice(best).join(' ')];
  }
  function rect(g, x, y, w, h, color) {
    g.fillStyle = color;
    g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }
  function pixels(label, x, y, scale) {
    const result = [], font = window.CG_FONT || {};
    for (const ch of label) {
      const rows = (font[ch] || '00000/00000/00000/00000/00000/00000/00000').split('/');
      rows.forEach((row, yy) => [...row].forEach((on, xx) => {
        if (on === '1') result.push([x + xx * scale, y + yy * scale]);
      }));
      x += 6 * scale;
    }
    return result;
  }
  function star(g, x, y, phase) {
    const r = phase ? 7 : 4;
    rect(g, x - r, y - 1, r * 2 + 2, 2, P.orange);
    rect(g, x - 1, y - r, 2, r * 2 + 2, P.orange);
    rect(g, x - 2, y - 2, 4, 4, P.cream);
  }
  function draw(g) {
    if (!isActive()) return;
    const lines = wrap(queue[0]);
    const longest = Math.max(...lines.map(line => line.length));
    const scale = Math.max(1, Math.min(10, Math.floor(540 / (longest * 6 - 1))));
    const lineHeight = scale * 7, gap = lines.length > 1 ? 18 : 0;
    const height = lines.length * lineHeight + gap;
    const width = Math.max(...lines.map(line => (line.length * 6 - 1) * scale));
    const entry = Math.max(0, Math.min(1, elapsed / .24));
    const exit = Math.max(0, Math.min(1, (elapsed - duration + .16) / .16));
    const offset = reducedMotion ? 0 : Math.round(((1 - Math.pow(1 - entry, 3)) * 28 - 28 - exit * 12) / 2) * 2;
    const top = Math.round((420 - height) / 2) + offset;
    const left = Math.floor((640 - width) / 2) - 24;
    const plaqueTop = top - 24, plaqueWidth = width + 48, plaqueHeight = height + 54;
    const phase = reducedMotion ? 0 : Math.floor(elapsed * 3.4) % 2;
    const color = phase ? P.orange : P.cream;
    g.save();
    g.imageSmoothingEnabled = false;
    // The stepped plaque stays still in brightness; only letters and accents pulse.
    rect(g, left + 8, plaqueTop + 8, plaqueWidth, plaqueHeight, P.edge);
    rect(g, left + 4, plaqueTop, plaqueWidth - 8, plaqueHeight, P.ink);
    rect(g, left, plaqueTop + 8, plaqueWidth, plaqueHeight - 16, P.ink);
    rect(g, left + 12, plaqueTop + 5, plaqueWidth - 24, 3, phase ? P.pink : P.orange);
    rect(g, left + 12, plaqueTop + plaqueHeight - 8, plaqueWidth - 24, 3, phase ? P.orange : P.pink);
    // Chunky corner fasteners and a segmented wipe make the announcement feel
    // like a screen-printed concert placard, with every detail on the pixel grid.
    for (const x of [left + 9, left + plaqueWidth - 15]) {
      for (const y of [plaqueTop + 11, plaqueTop + plaqueHeight - 17]) {
        rect(g, x, y, 6, 6, P.rust);
        rect(g, x + 2, y + 2, 2, 2, P.cream);
      }
    }
    const railWidth = plaqueWidth - 56;
    const progress = reducedMotion ? 1 : entry * (1 - exit);
    const segments = Math.floor(railWidth / 12);
    for (let i = 0; i < segments; i++) {
      const lit = i < Math.floor(segments * progress);
      rect(g, left + 28 + i * 12, plaqueTop + plaqueHeight - 15, 8, 2, lit ? P.cyan : P.rust);
    }
    // Short graffiti slashes are discrete pixels, never antialiased canvas strokes.
    for (let i = 0; i < 3; i++) {
      rect(g, left + 4 + i * 5, plaqueTop + 18 + i * 3, 6, 3, P.pink);
      rect(g, left + plaqueWidth - 10 - i * 5, plaqueTop + plaqueHeight - 22 - i * 3, 6, 3, P.cyan);
    }
    lines.forEach((line, index) => {
      const lineWidth = (line.length * 6 - 1) * scale;
      const direction = index % 2 ? -1 : 1;
      const slide = reducedMotion ? 0 : Math.round(((1 - entry) * 12 + exit * 8) / 2) * 2 * direction;
      const x = Math.round((640 - lineWidth) / 2) + slide, y = top + index * (lineHeight + gap);
      const dots = pixels(line, x, y, scale), outline = Math.max(2, Math.round(scale / 3));
      for (const [xx, yy] of dots) rect(g, xx + 8, yy + 9, scale, scale, P.edge);
      for (const [xx, yy] of dots) rect(g, xx + 5, yy + 5, scale, scale, P.rust);
      for (const [xx, yy] of dots) rect(g, xx - outline, yy - outline, scale + outline * 2, scale + outline * 2, P.edge);
      for (const [xx, yy] of dots) rect(g, xx, yy, scale, scale, color);
      // Warm top-left highlights give the letter face a beveled 8-bit glint.
      for (const [xx, yy] of dots) if (yy === y) rect(g, xx, yy, scale, 2, phase ? '#f7ba6f' : '#fff0d0');
      // A narrow shine walks across the face, without flashing the background.
      const shine = reducedMotion ? -1 : Math.floor(elapsed * 20) % Math.max(1, line.length * 6);
      if (shine >= 0) for (const [xx, yy] of dots) {
        if (Math.floor((xx - x) / scale) === shine) rect(g, xx, yy, Math.min(2, scale), scale, '#fff0d0');
      }
    });
    star(g, left + 17, plaqueTop + plaqueHeight - 20, phase);
    star(g, left + plaqueWidth - 18, plaqueTop + 21, !phase);
    g.restore();
  }
  window.CGSectionTitles = { start, update, draw, isActive, clear };
})();
