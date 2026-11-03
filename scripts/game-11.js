/* Pixel cutscenes share the world's background and foreground canvases. */
(() => {
  'use strict';
  const W = 640, H = 420;
  const C = { ink:'#111621', black:'#070a10', cream:'#f4e4bd', pink:'#e95a9d', cyan:'#46c4ca', gold:'#edb66d', green:'#b6da67', gray:'#727582' };
  const names = ['MATT', 'BRICE', 'TONY'];
  const roles = ['BASS', 'GUITAR + VOCALS', 'DRUMS'];
  const instruments = ['bass', 'guitar', 'sticks'];
  const images = {};
  for (const [name, file] of Object.entries({room:'boss-living-room.png',arena:'boss-arena.png',walk:'band-walk-clean.png',band:'band-motion-clean.png',props:'game-props.png',world:'world-panorama.png'})) {
    const im = new Image();
    im.src = window.CG_ASSETS?.['assets/' + file] || 'assets/' + file;
    images[name] = im;
  }
  const loaded = im => im.complete && im.naturalWidth > 0;
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const lerp = (a, b, t) => a + (b - a) * t;
  const rect = (g, x, y, w, h, color) => {
    g.fillStyle = color;
    g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  };
  function text(g, label, x, y, size = 1, color = C.cream, align = 'center') {
    label = String(label).toUpperCase();
    if (align === 'center') x -= (label.length * 6 - 1) * size / 2;
    for (const ch of label) {
      const rows = (window.CG_FONT?.[ch] || '00000/00000/00000/00000/00000/00000/00000').split('/');
      rows.forEach((row, yy) => [...row].forEach((on, xx) => {
        if (on === '1') rect(g, x + xx * size, y + yy * size, size, size, color);
      }));
      x += 6 * size;
    }
  }
  function outlinedText(g, label, x, y, size, color = C.cream) {
    text(g, label, x + 2, y + 3, size, C.black);
    text(g, label, x - 1, y - 1, size, C.black);
    text(g, label, x, y, size, color);
  }
  function arena(g, x, y, w, h, t = 0) {
    g.save(); g.translate(x, y); g.scale(w / W, h / H);
    if (loaded(images.arena)) {
      // Match battle-bands.js at its opening camera: the wide upper wall and
      // the playable floor have separate bands, rather than a center crop.
      const im = images.arena, view = im.width * W / 1420;
      rect(g, 0, 0, W, H, '#211b2f');
      g.drawImage(im, 0, 0, view, im.height * .83, 0, 22, W, 237);
      g.drawImage(im, 0, im.height * .83, view, im.height * .17, 0, 259, W, 161);
      for (let i = 0; i < 5; i++) {
        const x = 63 + i * 137, lit = Math.sin(t * 3 + i * 1.6) > .1;
        rect(g, x, 48, 4, 3, lit ? i % 2 ? C.pink : C.cyan : '#65566a');
        if (lit) for (let j = 0; j < 4; j++) rect(g, x - j * 5, 59 + j * 37, 9 + j * 10, 24, i % 2 ? '#e95a9d08' : '#46c4ca09');
      }
      g.restore();
      return;
    }
    rect(g, 0, 0, W, H, '#283046');
    for (const left of [0, 544]) {
      rect(g, left, 0, 96, 324, '#7b304a');
      for (let i = 0; i < 6; i++) rect(g, left + i * 16, 0, 7, 321, '#421f35');
    }
    rect(g, 96, 55, 448, 214, '#181c2a');
    rect(g, 0, 322, W, 98, '#413a45');
    rect(g, 0, 322, W, 9, '#c09467');
    for (let i = 0; i < 8; i++) rect(g, i * 82, 340, 3, 80, '#2c2a35');
    g.restore();
  }
  function screenBounds() {
    // Coordinates describe the actual artwork's inner CRT glass at 640x420.
    // Measured glass is (220.36,103.35,193.49,116.99); inset one pixel
    // keeps the commercial inside the CRT's irregular artwork border.
    const s = window.CG_BOSS_CRT_SCREEN || {x:221.36,y:104.35,w:191.49,h:114.99};
    const x = clamp(Number(s.x) || 0, 0, W - 1), y = clamp(Number(s.y) || 0, 0, H - 1);
    return {x, y, w:clamp(Number(s.w) || 220, 1, W - x), h:clamp(Number(s.h) || 160, 1, H - y)};
  }
  function cameraFor(screen, zoom) {
    const x = screen.x * zoom, y = screen.y * zoom;
    const w = lerp(W, screen.w, zoom), h = lerp(H, screen.h, zoom);
    return {x, y, w, h, sx:W / w, sy:H / h, tx:-x * W / w, ty:-y * H / h};
  }
  function advance(state, dt) {
    if (!state || state.done || !Number.isFinite(dt) || dt <= 0) return false;
    state.t = Math.min(state.duration, state.t + dt);
    return true;
  }
  function complete(state) {
    if (state.done || state.t < state.duration) return;
    state.done = true;
    if (!state.callbackFired) {
      state.callbackFired = true;
      state.onDone?.();
    }
  }
  function createIntro({onDone, sound} = {}) {
    const screen = screenBounds();
    return {kind:'intro',t:0,duration:7.2,zoomStart:5,zoom:0,screen,camera:cameraFor(screen,0),phase:'commercial',sound,onDone,done:false,callbackFired:false,soundIndex:0};
  }
  const cues = [[.18,220],[.28,330],[.41,440],[.61,660],[1.28,180],[1.38,260],[1.49,390],[2.82,520],[2.94,780],[4.9,150],[5.12,220],[5.35,330]];
  function updateIntro(state, dt) {
    if (!advance(state, dt)) return;
    while (state.soundIndex < cues.length && state.t >= cues[state.soundIndex][0]) {
      const cue = cues[state.soundIndex++];
      state.sound?.(cue[1]);
    }
    const progress = clamp((state.t - state.zoomStart) / (state.duration - state.zoomStart), 0, 1);
    // Discrete camera steps preserve the look of a cartridge-era zoom.
    state.zoom = progress >= 1 ? 1 : Math.floor(progress * progress * 64) / 64;
    state.camera = cameraFor(state.screen, state.zoom);
    state.phase = progress > 0 ? 'zoom' : 'commercial';
    complete(state);
  }
  function room(g, screen, t) {
    if (loaded(images.room)) { g.drawImage(images.room, 0, 0, W, H); return; }
    rect(g, 0, 0, W, 300, '#35303f'); rect(g, 0, 300, W, 120, '#655043');
    for (let i = 0; i < 12; i++) rect(g, i * 60, 300, 2, 120, '#45393b');
    rect(g, 28, 58, 116, 158, '#171e32');
    rect(g, 34, 64, 104, 146, '#3a5870');
    rect(g, 83, 64, 6, 146, '#1a2433'); rect(g, 34, 134, 104, 6, '#1a2433');
    rect(g, 8, 277, 176, 96, '#625675'); rect(g, 20, 251, 151, 65, '#847190');
    rect(g, 18, 365, 12, 17, '#211d2d'); rect(g, 158, 365, 12, 17, '#211d2d');
    rect(g, screen.x - 24, screen.y - 23, screen.w + 65, screen.h + 51, '#6a625e');
    rect(g, screen.x - 15, screen.y - 15, screen.w + 30, screen.h + 30, '#171b25');
    rect(g, screen.x - 17, screen.y + screen.h + 29, screen.w + 54, 17, '#2c2930');
    rect(g, screen.x + screen.w + 22, screen.y + 25, 10, 10, '#c0b69e');
    rect(g, screen.x + screen.w + 22, screen.y + 54, 10, 10, '#c0b69e');
    rect(g, screen.x + screen.w + 24, screen.y + screen.h - 14, 5, 5, Math.floor(t * 2) % 2 ? C.green : '#5d774b');
  }
  function commercial(g, state) {
    const s = state.screen, t = state.t;
    g.save(); g.beginPath(); g.rect(s.x, s.y, s.w, s.h); g.clip();
    // The poster is painted in the TV, then clears as we enter the actual arena.
    if (state.zoom < .52) {
      const cx = s.x + s.w / 2;
      const slide = Math.floor(Math.pow(clamp(1 - t / .55, 0, 1), 2) * 24) * 2;
      rect(g, s.x + 6, s.y + 4, s.w - 12, 16, '#111621e8');
      text(g, 'THIS SATURDAY!', cx, s.y + 8, 1, C.gold);
      const titleSize = Math.max(1, Math.floor((s.w - 18) / 53));
      outlinedText(g, 'BATTLE OF', cx - slide, s.y + 25, titleSize, Math.floor(t * 2) % 2 ? C.gold : C.cream);
      outlinedText(g, 'THE BANDS', cx + slide, s.y + 29 + titleSize * 7, titleSize, C.pink);
      if (t > 1.15) {
        rect(g, s.x + 8, s.y + s.h - 31, s.w - 16, 26, '#111621eb');
        text(g, t < 3.4 ? 'ONE STAGE. ONE SHOT.' : 'WIN THE WHOLE TOWN!', cx, s.y + s.h - 26, 1, C.cream);
        text(g, 'CIRCUS GENETIC', cx, s.y + s.h - 13, 1, C.green);
      }
      for (let i = 0; i < 7; i++) {
        const x = s.x + 9 + ((i * 33 + Math.floor(t * 13)) % Math.max(1, s.w - 18));
        rect(g, x, s.y + 28 + (i % 3) * 26, 2, 2, i % 2 ? C.cyan : C.gold);
      }
      for (let i = 0; i < 10; i++) {
        const x = s.x + 3 + i * (s.w - 8) / 9, lit = (i + Math.floor(t * 8)) % 3 === 0;
        rect(g, x, s.y + 1, 3, 2, lit ? C.cream : C.gold);
        rect(g, x, s.y + s.h - 3, 3, 2, lit ? C.pink : '#7b435b');
      }
      const gleam = s.x + 12 + Math.floor((t * 31) % Math.max(1, s.w - 24));
      rect(g, gleam, s.y + 22, 2, 7, C.cream); rect(g, gleam - 3, s.y + 25, 8, 2, C.cream);
    }
    if (state.zoom < .3) for (let y = s.y + 2; y < s.y + s.h; y += 6) rect(g, s.x, y, s.w, 1, '#090b1433');
    if (state.zoom < .9) {
      const scan = s.y + Math.floor((t * 23) % Math.max(1, s.h));
      rect(g, s.x + 1, scan, s.w - 2, 2, '#f4e4bd0d');
      rect(g, s.x + 1, scan + 3, s.w - 2, 1, '#46c4ca0c');
    }
    g.restore();
  }
  function applyCamera(g, camera) {
    g.translate(camera.tx, camera.ty);
    g.scale(camera.sx, camera.sy);
  }
  function drawIntro(state, {g, bg}) {
    if (!state || !g || !bg) return;
    for (const layer of [bg, g]) { layer.clearRect(0, 0, W, H); layer.imageSmoothingEnabled = false; }
    if (state.zoom >= 1) { arena(bg, 0, 0, W, H, state.t); return; }
    bg.save(); applyCamera(bg, state.camera); room(bg, state.screen, state.t);
    const s = state.screen;
    bg.save(); bg.beginPath(); bg.rect(s.x, s.y, s.w, s.h); bg.clip();
    // Preserve the arena's opening camera composition inside the CRT glass.
    bg.translate(s.x, s.y); bg.scale(s.w / W, s.h / H); arena(bg, 0, 0, W, H, state.t);
    bg.restore(); bg.restore();
    g.save(); applyCamera(g, state.camera); commercial(g, state); g.restore();
  }
  function memberIndex(member) {
    const named = typeof member === 'string' ? names.indexOf(member.toUpperCase()) : -1;
    return named >= 0 ? named : clamp(Math.floor(Number(member) || 0), 0, 2);
  }
  function createKickout({member = 0, onDone} = {}) {
    const index = memberIndex(member);
    return {kind:'kickout',t:0,duration:5.6,member:index,name:names[index],role:roles[index],instrument:instruments[index],others:[0,1,2].filter(who => who !== index),phase:'verdict',onDone,done:false,callbackFired:false};
  }
  function updateKickout(state, dt) {
    if (!advance(state, dt)) return;
    state.phase = state.t < 1.8 ? 'verdict' : state.t < 3.2 ? 'exit' : state.t < 3.8 ? 'curb' : 'gameover';
    complete(state);
  }
  function actor(g, who, x, feet, pose, t, size = 1, face = 1, ground = feet) {
    const im = pose === 'walk' ? images.walk : images.band;
    const col = pose === 'walk' ? Math.floor(t * 9) % 8 : pose === 'point' ? ((t % 1.1) < .17 ? 4 : 5) : 1;
    const half = Math.max(8, 16 * size - Math.max(0, ground - feet) * .1);
    rect(g, x - half, ground, half * 2, 4, '#070a1066');
    rect(g, x - half * .6, ground + 1, half * 1.2, 2, '#070a1088');
    if (!loaded(im)) {
      rect(g, x - 9 * size, feet - 58 * size, 18 * size, 19 * size, '#e3b47f');
      rect(g, x - 13 * size, feet - 39 * size, 26 * size, 27 * size, ['#e4c1b4','#91b4b2','#a48c69'][who]);
      rect(g, x - 12 * size, feet - 12 * size, 8 * size, 12 * size, C.ink);
      rect(g, x + 4 * size, feet - 12 * size, 8 * size, 12 * size, C.ink);
      if (who === 2) {
        rect(g,x-11*size,feet-63*size,21*size,7*size,'#080b12');rect(g,x+8*size,feet-58*size,15*size,3*size,'#080b12');
        rect(g,x-2*size,feet-62*size,4*size,1*size,'#d63a36');rect(g,x-3*size,feet-61*size,1*size,3*size,'#d63a36');rect(g,x-2*size,feet-59*size,4*size,1*size,'#d63a36');
        rect(g,x-20*size,feet-36*size,3*size,23*size,C.gold);rect(g,x+18*size,feet-36*size,3*size,23*size,C.gold);
      }
      else rect(g,x-18*size,feet-29*size,37*size,7*size,who===0?'#37313e':'#5baf83');
      return;
    }
    g.save(); g.translate(Math.round(x), Math.round(feet)); g.scale(face, 1);
    g.drawImage(im, col * im.width / 8, who * im.height / 3, im.width / 8, im.height / 3, -55.5 * size, -105 * size + 105 * size * 5 / 256, 111 * size, 105 * size);
    g.restore();
  }
  function caseProp(g, who, x, y, angle = 0) {
    g.save(); g.translate(Math.round(x),Math.round(y)); g.rotate(Math.round(angle * 12) / 12);
    const w = who === 2 ? 26 : 52, h = who === 2 ? 12 : 15;
    rect(g, -w/2, -h, w, h, '#161c29'); rect(g,-w/2+3,-h+3,w-6,h-6,'#525160');
    rect(g,-6,-h-3,12,3,'#c1ab80'); rect(g,-w/2+8,-h,3,h,'#b39c79'); rect(g,w/2-11,-h,3,h,'#b39c79');
    g.restore();
  }
  function outside(bg, t) {
    rect(bg,0,0,W,H,'#273040');
    if (loaded(images.world)) bg.drawImage(images.world,0,images.world.height*.366,images.world.width*.4,images.world.height*.32,0,0,W,H);
    else {
      rect(bg,0,30,W,309,'#51515a');
      for(let y=45;y<330;y+=30) for(let x=(y/30%2)*28;x<W;x+=58) {rect(bg,x,y,53,25,'#635e62');rect(bg,x+4,y+4,45,3,'#76716e');}
    }
    rect(bg,0,348,W,28,'#8d8a87'); rect(bg,0,372,W,8,'#c4b7a0'); rect(bg,0,380,W,40,'#343640');
    for(let i=0;i<6;i++) rect(bg,40+i*110,398,47,3,'#a18e6a');
    for(let i=0;i<5;i++) rect(bg,460+i*29,55+(i%2)*22,2,2,Math.floor(t*2+i)%2?C.gold:'#526078');
    const doorX=162, feet=348, im=images.props;
    if(loaded(im)) bg.drawImage(im,0,0,im.width/4,im.height/2,doorX-78,feet-255,156,255);
    else {rect(bg,doorX-66,feet-235,132,235,'#8b8173');rect(bg,doorX-53,feet-224,106,224,'#2e353c');}
    // The original artwork supplies the frame and step; its panel opens inward.
    rect(bg,doorX-37,feet-202,75,193,'#101621');
    rect(bg,doorX+34,feet-200,5,190,'#69716e');
    text(bg,'VENUE',doorX,111,1,C.green);
    for(let i=0;i<4;i++) rect(bg,doorX-35-i*9,338+i*3,73+i*18,3,'#b6da6709');
    for(let i=0;i<9;i++) {
      const x=270+(i*53+Math.floor(t*4))%350,y=187+(i*37)%148+Math.floor(Math.sin(t*.7+i)*3);
      rect(bg,x,y,2,2,i%2?'#b6c1be22':'#edb66d22');
    }
  }
  function seated(g, who, x, feet) {
    const pants=['#666d67','#20262f','#c7b38b'][who], im=images.band;
    rect(g,x-24,feet,56,4,'#070a1066');
    rect(g,x-15,feet-30,16,13,pants); rect(g,x-14,feet-19,37,12,pants);
    rect(g,x+16,feet-13,11,13,pants); rect(g,x+14,feet-3,20,5,'#17212b');
    rect(g,x-16,feet-5,22,7,'#17212b');
    if(loaded(im)) {
      const sw=im.width/8, sh=im.height/3;
      // Keep the existing face, shirt, and instrument; fold only the legs.
      g.drawImage(im,sw,who*sh,sw,sh*.72,x-55.5,feet-99,111,75.6);
    } else actor(g,who,x,feet,'idle',0,.85);
  }
  function drawKickout(state, {g,bg,t:displayTime}) {
    if(!state||!g||!bg)return;
    for(const layer of [bg,g]){layer.clearRect(0,0,W,H);layer.imageSmoothingEnabled=false;}
    const t=state.t, who=state.member, ambience=Number.isFinite(displayTime)?displayTime:t;
    if(t<1.8) {
      arena(bg,0,0,W,H,t);
      actor(g,who,320,339,'idle',t,1.12,1);
      state.others.forEach((other,i)=>actor(g,other,i?465:175,337,t>.65?'point':'idle',t,1.05,i?-1:1));
      rect(g,105,48,430,89,C.black);rect(g,109,52,422,81,C.cream);
      rect(g,164,132,14,14,C.cream);rect(g,169,145,7,7,C.cream);
      text(g,"YOU'RE OUT OF",320,67,3,C.ink);text(g,'THE BAND!',320,99,3,C.ink);
      if(t>.12&&t<.55) for(const side of [-1,1]) for(let i=0;i<3;i++) rect(g,320+side*(229+i*8),61+i*21,5,3,i%2?C.gold:C.cream);
      text(g,names[who]+' / '+roles[who],320,372,1,C.cream);
      return;
    }
    outside(bg,ambience);
    g.save();g.beginPath();g.rect(125,146,75,193);g.clip();
    state.others.forEach((other,i)=>actor(g,other,149+i*29,341,i?'idle':'point',t,.64,1));
    g.restore();
    if(t<3.2) {
      const p=clamp((t-1.8)/1.4,0,1), x=lerp(162,342,p);
      // A short cartoon hop lands on the sidewalk; no injury or falling loop.
      const hop=Math.sin(p*Math.PI)*20;
      actor(g,who,x,348-hop,'walk',t,.98,1,348);
      const c=clamp((t-2.18)/1.02,0,1);
      caseProp(g,who,lerp(165,414,c),348-Math.sin(c*Math.PI)*52,c<1?(c-.5)*.35:0);
    } else {
      seated(g,who,342,376);
      const landing=clamp((t-3.2)/.2,0,1), bounce=landing<1?Math.sin(landing*Math.PI)*5:0;
      rect(g,393,376,42,3,'#070a1088');caseProp(g,who,414,376-bounce);
      if(t<3.5) {
        const dust=Math.floor((t-3.2)*50);
        for(const side of [-1,1]) {rect(g,342+side*(19+dust),373-Math.min(4,dust),6,3,'#c4b7a088');rect(g,414+side*(22+dust),374-Math.min(3,dust),5,2,'#8d8a8799');}
      }
      if(t<3.8) text(g,'...',338,256,2,C.cream);
    }
    if(t>=3.8) {
      // The independent display clock keeps the finished loss screen flashing
      // while the completed ejection state remains frozen on its curb pose.
      const time=Number.isFinite(displayTime)?displayTime:t;
      const red=Math.floor(time*2.4)%2?'#ff4646':'#a62636';
      rect(g,230,29,396,153,C.black);
      rect(g,234,33,388,145,'#211722');
      rect(g,240,39,376,3,red);
      rect(g,240,42,3,95,red);rect(g,613,42,3,95,red);
      text(g,'KICKED OUT OF THE BAND',428,47,1,C.cream);
      outlinedText(g,'GAME OVER',428,65,5,red);
      outlinedText(g,'- YOU SUCK',428,110,4,red);
      text(g,'ENTER: TRY AGAIN',428,158,1,C.green);
    }
  }
  window.CGBossCinema={createIntro,updateIntro,drawIntro,createKickout,updateKickout,drawKickout};
})();
