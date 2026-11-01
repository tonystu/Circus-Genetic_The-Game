/* Panta Rhei cartridge boot. The mark is sampled from the canonical vector logo. */
(() => {
  'use strict';
  const canvas = document.getElementById('productionBoot');
  if (!canvas) return;
  const g = canvas.getContext('2d');
  g.imageSmoothingEnabled = false;
  const logo = new Image();
  const logoCanvas = document.createElement('canvas');
  logoCanvas.width = logoCanvas.height = 96;
  const logoContext = logoCanvas.getContext('2d', { willReadFrequently: true });
  let logoPixels = null;
  let running = false;
  let startedAt = null;
  let emitted = 0;
  const sounds = [];
  const bayer = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  const coinTimes = [.28, .64, 1.01, 1.43, 1.85, 2.22];
  const colors = { ink: '#080b10', cream: '#f4e4bd', muted: '#6c796d', shine: '#ffffff' };

  function box(x, y, w, h, color) {
    g.fillStyle = color;
    g.fillRect(Math.round(x), Math.round(y), w, h);
  }
  function glyphText(text, x, y, scale = 1, color = colors.cream, align = 'left', count = Infinity) {
    text = String(text).toUpperCase();
    if (align === 'center') x -= text.length * 6 * scale / 2;
    for (let n = 0; n < Math.min(text.length, count); n++) {
      const rows = (window.CG_FONT?.[text[n]] || '00000/00000/00000/00000/00000/00000/00000').split('/');
      rows.forEach((row, yy) => [...row].forEach((on, xx) => {
        if (on === '1') box(x + (n * 6 + xx) * scale, y + yy * scale, scale, scale, color);
      }));
    }
  }
  function sampleLogo() {
    if (!logo.complete || !logo.naturalWidth) return;
    try {
      logoContext.clearRect(0, 0, 96, 96);
      logoContext.drawImage(logo, 0, 0, 96, 96);
      const rgba = logoContext.getImageData(0, 0, 96, 96).data;
      logoPixels = [];
      for (let y = 0; y < 96; y++) for (let x = 0; x < 96; x++) {
        const i = (y * 96 + x) * 4;
        // SVG paths are black, on transparency. Threshold the edge antialiasing.
        if (rgba[i + 3] > 127 && (rgba[i] + rgba[i + 1] + rgba[i + 2]) < 384) {
          logoPixels.push({ x, y, threshold: (bayer[(y % 4) * 4 + x % 4] + .5) / 16 });
        }
      }
    } catch (_) { logoPixels = null; }
  }
  logo.onload = sampleLogo;
  // Inline the canonical SVG when no embedded asset map is present. This keeps
  // the pixel sampler origin-clean in the installed file:// desktop app.
  const canonicalLogo = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4bWxuczppbmtzY2FwZT0iaHR0cDovL3d3dy5pbmtzY2FwZS5vcmcvbmFtZXNwYWNlcy9pbmtzY2FwZSIgdmVyc2lvbj0iMS4xIiB3aWR0aD0iMzYwIiBoZWlnaHQ9IjM2MCIgdmlld0JveD0iMCAwIDM2MCAzNjAiPgo8ZGVmcz4KPGNsaXBQYXRoIGlkPSJjbGlwXzEiPgo8cGF0aCB0cmFuc2Zvcm09Im1hdHJpeCgxLDAsMCwtMSwwLDM2MCkiIGQ9Ik0wIDM2MEgzNjBWMEgwWiIvPgo8L2NsaXBQYXRoPgo8L2RlZnM+CjxnIGlua3NjYXBlOmdyb3VwbW9kZT0ibGF5ZXIiIGlua3NjYXBlOmxhYmVsPSJMYXllciAxIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXBfMSkiPgo8cGF0aCB0cmFuc2Zvcm09Im1hdHJpeCgxLDAsMCwtMSwxNzkuNzY0NywzNDIuMTc2NSkiIGQ9Ik0wIDBDODEuMjE0IDAgMTQ4LjU4MiA1OC40OSAxNjEuNDk4IDEzNS4yMDFILTE2MS40OThDLTE0OC41ODIgNTguNDktODEuMjE0IDAgMCAwIi8+CjxwYXRoIHRyYW5zZm9ybT0ibWF0cml4KDEsMCwwLC0xLDE3OS43NjQ3LDE4LjE3NjUxNCkiIGQ9Ik0wIDBDLTgxLjE5OSAwLTE0OC41NTctNTguNDY5LTE2MS40OS0xMzUuMTU5SDE2MS40OUMxNDguNTU3LTU4LjQ2OSA4MS4xOTkgMCAwIDAiLz4KPHBhdGggdHJhbnNmb3JtPSJtYXRyaXgoMSwwLDAsLTEsMjQzLjc2NzksMTgwLjM3MTcpIiBkPSJNMCAwQy0uOTE5LS43ODEtMi4xMjktMS4xNzEtMy42My0xLjE3MUgtMTMuNDIzVjguMTQ0SC0zLjYzQy0yLjEyOSA4LjE0NC0uOTE5IDcuNzA3IDAgNi44MzMgLjkxOSA1Ljk1OSAxLjM3OSA0Ljc5NyAxLjM3OSAzLjM0NyAxLjM3OSAxLjg5NiAuOTE5IC43ODEgMCAwTTkuNzA4IDMuMzQ3QzkuNzA4IDYuOTU0IDguNDg5IDkuOTAxIDYuMDUgMTIuMTg4IDMuNjExIDE0LjQ3NSAuNDk3IDE1LjYxOC0zLjI5MiAxNS42MThILTIxLjY5NlYtMTUuMjI4SC0xMy40MjNWLTguNjQ2SC0zLjc0M0MtMi41NjEtMTAuODQtMS4zNzktMTMuMDM0LS4xOTctMTUuMjI4SDguODA4QzcuMjMyLTEyLjQyIDUuNjU2LTkuNjEzIDQuMDgtNi44MDUgNy44MzItNC41NzQgOS43MDgtMS4xOSA5LjcwOCAzLjM0NyIvPgo8cGF0aCB0cmFuc2Zvcm09Im1hdHJpeCgxLDAsMCwtMSwxNzQuNzMxNSwxODMuOTQxNikiIGQ9Ik0wIDAgNC45NTMgMTEuODgxSDYuMjQ3TDEwLjk3NCAwWk0xMS43MDYgMTkuMTg4SC0uMzM4TC0xMy44NDUtMTEuNjU4SC00Ljk1M0wtMy4wMzktNy4xNEgxNC4xODJMMTYuMTUyLTExLjY1OEgyNC45MzJaIi8+CjxwYXRoIHRyYW5zZm9ybT0ibWF0cml4KDEsMCwwLC0xLDYyLjQ5MjEsMTgzLjk0MTYpIiBkPSJNMCAwIDQuOTUzIDExLjg4MUg2LjI0N0wxMC45NzQgMFpNMTEuNzA2IDE5LjE4OEgtLjMzOEwtMTMuODQ1LTExLjY1OEgtNC45NTNMLTMuMDM5LTcuMTRIMTQuMTgyTDE2LjE1Mi0xMS42NThIMjQuOTMyWiIvPgo8cGF0aCB0cmFuc2Zvcm09Im1hdHJpeCgxLDAsMCwtMSwzOS40NjAzLDE4MC4zNzE3KSIgZD0iTTAgMEMtLjkxOS0uNzgxLTIuMTI5LTEuMTcxLTMuNjMtMS4xNzFILTEzLjQyM1Y4LjE0NEgtMy42M0MtMi4xMjkgOC4xNDQtLjkxOSA3LjcwNyAwIDYuODMzIC45MTkgNS45NTkgMS4zNzkgNC43OTcgMS4zNzkgMy4zNDcgMS4zNzkgMS44OTYgLjkxOSAuNzgxIDAgME02LjA1IDEyLjE4OEMzLjYxMSAxNC40NzUgLjQ5NyAxNS42MTgtMy4yOTIgMTUuNjE4SC0yMS42OTZWLTE1LjIyOEgtMTMuNDIzVi04LjY0NkgtMy4yOTJDLjQ5Ny04LjY0NiAzLjYxMS03LjU0OSA2LjA1LTUuMzU1IDguNDg5LTMuMTYxIDkuNzA4LS4yNiA5LjcwOCAzLjM0NyA5LjcwOCA2Ljk1NCA4LjQ4OSA5LjkwMSA2LjA1IDEyLjE4OCIvPgo8cGF0aCB0cmFuc2Zvcm09Im1hdHJpeCgxLDAsMCwtMSwwLDM2MCkiIGQ9Ik0zMzMuNDkyIDE2NC40SDM0MS43NjVWMTk1LjI0NkgzMzMuNDkyWiIvPgo8cGF0aCB0cmFuc2Zvcm09Im1hdHJpeCgxLDAsMCwtMSwyOTcuNzIxMywxNjQuNzUzNCkiIGQ9Ik0wIDBWLTMwLjg0NkgyOS4zNzhWLTIzLjI2SDguMjczVi0xOC45MDlIMjYuNTY0Vi0xMS40OTFIOC4yNzNWLTcuNDE5SDI4LjY0NlYwWiIvPgo8cGF0aCB0cmFuc2Zvcm09Im1hdHJpeCgxLDAsMCwtMSwyNTkuMTkzMiwxNjQuNzUzNCkiIGQ9Ik0wIDBWLTMwLjg0Nkg4LjI3M1YtMTguNjNIMjMuNTI1Vi0zMC44NDZIMzEuODU0VjBIMjMuNTI1Vi0xMS4yNjdIOC4yNzNWMFoiLz4KPHBhdGggdHJhbnNmb3JtPSJtYXRyaXgoMSwwLDAsLTEsMTMwLjMxODUsMTY0Ljc1MzQpIiBkPSJNMCAwVi03LjM2M0gxMi4xVi0zMC44NDZIMjAuNDI5Vi03LjM2M0gzMi41MjlWMFoiLz4KPHBhdGggdHJhbnNmb3JtPSJtYXRyaXgoMSwwLDAsLTEsOTIuNjYyOCwxNjQuNzUzNCkiIGQ9Ik0wIDBWLTMwLjg0Nkg4LjE2Vi0xMi4yMTZMMjQuODE5LTMwLjg0NkgzMi40MTdWMEgyNC4yVi0xOC42M0w3LjU0MSAwWiIvPgo8L2c+CjwvZz4KPC9zdmc+Cg==';
  logo.src = window.CG_ASSETS?.['assets/panta-rhei-logo.svg'] || canonicalLogo;

  function audioContext() {
    try { return typeof ctx !== 'undefined' ? ctx : null; } catch (_) { return null; }
  }
  function isMuted() {
    try { return typeof muted !== 'undefined' && muted; } catch (_) { return true; }
  }
  function coin(index) {
    const a = audioContext();
    if (!a || isMuted() || a.state === 'closed') return;
    const t = a.currentTime;
    // A short stepped metallic square-wave pair, then a low coin-drop tick.
    const pitch = [1046.5, 1174.7, 1318.5, 1568, 1760, 2093][index % 6];
    for (const note of [
      { delay: 0, hz: pitch, duration: .055, volume: .040 },
      { delay: .055, hz: pitch * 2, duration: .13, volume: .026 },
      { delay: .145, hz: 196, duration: .024, volume: .022 },
    ]) {
      try {
        const o = a.createOscillator(), v = a.createGain(), start = t + note.delay;
        o.type = 'square';
        o.frequency.setValueAtTime(note.hz, start);
        v.gain.setValueAtTime(.001, start);
        v.gain.linearRampToValueAtTime(note.volume, start + .003);
        v.gain.exponentialRampToValueAtTime(.001, start + note.duration);
        o.connect(v); v.connect(a.destination);
        o.start(start); o.stop(start + note.duration + .01);
        sounds.push(o);
        o.onended = () => { try { o.disconnect(); v.disconnect(); } catch (_) {} };
      } catch (_) { /* Boot animation must proceed if audio is unavailable. */ }
    }
  }
  function sparkle(x, y, radius) {
    box(x - radius, y, radius * 2 + 2, 2, colors.shine);
    box(x, y - radius, 2, radius * 2 + 2, colors.shine);
    box(x - 1, y - 1, 4, 4, colors.cream);
  }
  function render(t) {
    g.clearRect(0, 0, 640, 480);
    box(0, 0, 640, 480, colors.ink);
    const reveal = Math.max(0, Math.min(1, (t - .2) / 1.5));
    if (logoPixels?.length) {
      for (const p of logoPixels) if (p.threshold <= reveal) {
        box(176 + p.x * 3, 45 + p.y * 3, 3, 3, colors.cream);
      }
    } else {
      // Loading/error fallback remains typographic, and never blocks the title.
      if (t > .8) glyphText('PANTA RHEI', 320, 170, 4, colors.cream, 'center');
    }
    if (t >= 1.95) {
      const count = Math.max(0, Math.min(11, Math.floor((t - 1.95) * 17) + 1));
      glyphText('PRODUCTIONS', 320, 355, 2, colors.cream, 'center', count);
    }
    if (t >= 2.6) {
      const phase = (t - 2.6) % 1.75;
      const x = 247 + Math.floor(phase / 1.75 * 146);
      const y = 362;
      const r = [2, 4, 6, 4][Math.floor(phase * 8) % 4];
      if (phase < 1.35) sparkle(x, y, r);
      if (phase > .5 && phase < 1.15) sparkle(391 - Math.floor(phase * 60), 349, 2);
    }
    glyphText('SYSTEM LOADING', 320, 414, 1, colors.muted, 'center');
    const progress = Math.max(0, Math.min(1, t / 4.8));
    box(224, 434, 192, 4, '#29332e');
    box(224, 434, Math.floor(progress * 24) * 8, 4, colors.cream);
  }
  function finish() {
    if (!running) return;
    running = false;
    startedAt = null;
    for (const o of sounds.splice(0)) { try { o.stop(); } catch (_) {} }
    title();
    try { enableAudio(); } catch (_) {}
  }
  function frame(ms) {
    if (!running) return;
    if (!document.getElementById('boot')?.classList.contains('active')) {
      finish();
      return;
    }
    if (startedAt === null) startedAt = ms;
    const elapsed = Math.max(0, (ms - startedAt) / 1000);
    // If the music key was pressed during boot, keep the sting audible first.
    try { if (!music.paused) music.pause(); } catch (_) {}
    while (emitted < coinTimes.length && elapsed >= coinTimes[emitted]) coin(emitted++);
    render(elapsed);
    if (elapsed >= 4.8) finish();
    else requestAnimationFrame(frame);
  }
  function start() {
    if (running) return;
    try { enableAudio(false); music.pause(); } catch (_) {}
    running = true;
    startedAt = null;
    emitted = 0;
    sampleLogo();
    show('boot');
    render(0);
    requestAnimationFrame(frame);
  }
  window.startSystemBoot = start;
  window.finishSystemBoot = finish;
  const power = document.getElementById('power');
  if (power) power.onclick = start;
  document.addEventListener('keydown', event => {
    if (!running || !document.getElementById('boot')?.classList.contains('active')) return;
    if (event.key === 'Enter' || event.key === 'Escape') {
      event.preventDefault();
      event.stopImmediatePropagation();
      finish();
    }
  }, true);
})();
