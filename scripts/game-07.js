/* Rhythm-only crowd cut-ins. Their clocks are independent from stage props. */
(() => {
  'use strict';
  const atlas = new Image();
  atlas.src = window.CG_ASSETS?.['assets/rhythm-cameos.png'] || 'assets/rhythm-cameos.png';
  // The artist kept each character row on its own baseline; these crops retain hair/ears.
  const rowBounds = [[0, 256], [256, 500], [500, 712], [712, 1024]];
  const clamp = value => Math.max(0, Math.min(1, value));
  const ease = value => 1 - Math.pow(1 - clamp(value), 3);
  const pixel = value => Math.round(value / 2) * 2;
  function jump(t, rate, phase, height) {
    const cycle = (t * rate + phase) % 1;
    if (cycle >= .55) return 0;
    const flight = cycle / .55;
    return pixel(height * 4 * flight * (1 - flight));
  }
  function plan({ t = 0, elapsed = 0, kind }) {
    const leftIn = ease(elapsed / .6), rightIn = ease((elapsed - .13) / .6);
    const roomBreath=pixel(Math.sin(t*3.2+.4)*2), dogBreath=pixel(Math.sin(t*4.1+1.6)*2);
    if (kind === 'practice') {
      return [
        { row: 0, col: [0,1,2,1,3,4,5,4][Math.floor(t * 7) % 8], x: pixel(-132 + leftIn * 106), y: 274-roomBreath, w: 124, h: 144+roomBreath, side: 'left', flip: false },
        { row: 1, col: [0,1,2,3,4,5,3,1][Math.floor(t * 5.4 + 1.2) % 8], x: pixel(650 - rightIn * 94), y: 281-dogBreath, w: 112, h: 137+dogBreath, side: 'right', flip: false },
      ];
    }
    if (kind === 'soundcheck') {
      const p = t % 12;
      let x, col, flip;
      if (p < 3.5) { x = 80 + (p/3.5)**2*(3-2*p/3.5)*410; col = Math.floor(t * 7) % 2; flip = false; }
      else if (p < 5.5) { x = 490; col = p < 4.15 ? 2 : p < 4.8 ? 4 : 5; flip = false; }
      else if (p < 9) { const travel=(p-5.5)/3.5; x = 490-travel**2*(3-2*travel)*410; col = Math.floor(t * 7) % 2; flip = true; }
      else { x = 80; col = p < 9.6 ? 3 : p < 10.6 ? 4 : 5; flip = false; }
      const settle=pixel(Math.sin(t*(col<2?12:5))*2);
      return [{ row: 2, col, x: pixel(x - 66), y: 286-settle, w: 132, h: 114+settle, side: 'bottom', flip }];
    }
    if (kind === 'chorus' || kind === 'encore') {
      return [
        { row: 3, col: [0,1,2,4,3,5][Math.floor(t * 7) % 6], x: pixel(-134 + leftIn * 115), y: 283-jump(t,.93,0,18), w: 130, h: 154, side: 'left', flip: false },
        { row: 3, col: [5,3,4,2,1,0][Math.floor(t * 6.2 + 1.8) % 6], x: pixel(650 - rightIn * 111), y: 283-jump(t,.79,.39,21), w: 130, h: 154, side: 'right', flip: true },
      ];
    }
    return [];
  }
  function draw({ g, t = 0, elapsed = 0, kind }) {
    if (!atlas.complete || !atlas.naturalWidth) return;
    const actors = plan({ t, elapsed, kind });
    if (!actors.length) return;
    g.save();
    g.imageSmoothingEnabled = false;
    // These are foreground spectators at the screen edge. The waist crops extend
    // under the lower HUD instead of appearing as floating torsos over the band.
    g.beginPath(); g.rect(0, 250, 640, 148); g.clip();
    for (const actor of actors) {
      g.save();
      const [top, bottom] = rowBounds[actor.row];
      const sw = atlas.width / 6, sy = top / 1024 * atlas.height, sh = (bottom - top) / 1024 * atlas.height;
      g.translate(actor.x + (actor.flip ? actor.w : 0), actor.y);
      if (actor.flip) g.scale(-1, 1);
      g.drawImage(atlas, actor.col * sw, sy, sw, sh, 0, 0, actor.w, actor.h);
      g.restore();
    }
    g.restore();
  }
  window.CGRhythmCameos = { draw };
})();
