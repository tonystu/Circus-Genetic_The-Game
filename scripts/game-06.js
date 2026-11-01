/* Foreground party actors are separate from both the room art and game physics. */
(() => {
  'use strict';
  const band = new Image();
  band.src = window.CG_ASSETS?.['assets/party-band.png'] || 'assets/party-band.png';
  const ready = () => band.complete && band.naturalWidth > 0;
  const phases = [0.27, 1.93, 4.11];

  function sprite(g, who, col, x, y, size, options = {}) {
    if (!ready()) return false;
    const sw = band.width / 8, sh = band.height / 3;
    g.save();
    g.translate(Math.round(x), Math.round(y));
    if (options.flip) g.scale(-1, 1);
    if (options.angle) g.rotate(options.angle);
    // Repacked cells retain the original horizontal anchor and a shared foot baseline.
    const sx = size / (2043 / 8), sy = size / (770 / 3);
    const paint = () => g.drawImage(band, col * sw, who * sh, sw, sh, -192 * sx, (options.center ? -144 : -272) * sy, 384 * sx, 288 * sy);
    if (options.center || options.motionTime === undefined) paint();
    else {
      // Feet retain the source atlas baseline. Only the torso and head settle,
      // breathe and anticipate, so animated weight shifts never levitate shoes.
      const q = options.motionTime + phases[who], soft = options.motion === 'breath' ? .55 : 1;
      const torsoX = Math.round(Math.sin(q * .71) * soft), headX = Math.round(Math.sin(q * .93 + .8) * soft);
      const headY = Math.round(Math.sin(q * 1.17) * soft);
      const bands = [
        { top: -108, bottom: 16, dx: 0, dy: 0 },
        { top: -208, bottom: -104, dx: torsoX, dy: 0 },
        { top: -272, bottom: -204, dx: headX, dy: headY },
      ];
      for (const slice of bands) {
        g.save(); g.beginPath();
        g.rect(-194 * sx, slice.top * sy + slice.dy, 388 * sx, (slice.bottom - slice.top) * sy);
        g.clip(); g.translate(slice.dx, slice.dy); paint(); g.restore();
      }
    }
    g.restore();
    return true;
  }
  function rect(g, x, y, w, h, color) {
    g.fillStyle = color;
    g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }
  function star(g, x, y, t, color) {
    const r = 2 + Math.floor((Math.sin(t * 5) + 1) * 2);
    rect(g, x - r, y, r * 2 + 2, 2, color);
    rect(g, x, y - r, 2, r * 2 + 2, color);
  }
  function puff(g, x, y, t, strength = 1) {
    for (let i = 0; i < 5; i++) {
      const a = (t * .43 + i * .2) % 1;
      const w = (3 + Math.floor(a * 4)) * strength;
      rect(g, x + a * 40 + Math.sin(a * 8 + i) * 5, y - a * 32, w, 3, a < .55 ? '#bdc6ad99' : '#bdc6ad44');
    }
  }
  function cheer(opts, who, x, y, size = 130, offset = 0) {
    const {g, t} = opts, q = t * (3.6 + who * .21) + phases[who] + offset;
    // Changing arm/knee poses keeps a planted supporting foot at the floor.
    if (!sprite(g, who, Math.sin(q * 1.3) > -.2 ? 6 : 7, x, y, size, {motionTime:q})) opts.bandSprite?.(who, x, y, 'victory');
    if (Math.sin(q * .6) > .7) star(g, x + size * .24, y - size * .75, q, '#eebd68');
  }
  function jump(t, rate, phase, height) {
    const cycle = (t * rate + phase) % 1;
    if (cycle >= .52) return 0;
    const flight = cycle / .52;
    return Math.round(height * 4 * flight * (1 - flight));
  }
  function keg(g, x, floor) {
    const y = floor - 45;
    rect(g, x - 18, y + 3, 36, 41, '#36454c');
    rect(g, x - 15, y, 30, 4, '#d1d6be');
    rect(g, x - 19, y + 7, 38, 5, '#a5ad9c');
    rect(g, x - 15, y + 12, 30, 22, '#758a86');
    rect(g, x - 19, y + 34, 38, 5, '#a5ad9c');
    rect(g, x - 15, y + 41, 30, 4, '#ccd3c0');
    rect(g, x - 2, y - 5, 6, 9, '#c8cbb1');
    rect(g, x + 3, y - 3, 12, 3, '#222c30');
    rect(g, x + 13, y - 3, 3, 9, '#181d23');
    rect(g, x - 7, y + 17, 14, 9, '#b7cfa3');
  }
  function robot(opts, who, x, floor, offset) {
    const {g,t} = opts, beat = t * (2.9 + who * .19) + offset;
    const step = Math.floor(beat * 2) % 4;
    const sway = [-4, 0, 4, 0][step];
    if (!sprite(g, who, step % 3 === 0 ? 6 : 7, x + sway, floor, 114, {flip:step > 1, motionTime:Math.floor(beat * 4) * .8})) opts.bandSprite?.(who, x + sway, floor, 'victory');
  }
  function kegStand(opts, who, x, floor, offset) {
    const {g,t} = opts, q=t*3.1+offset;
    // Raised hands of the inverted cheering sprite rest at the keg rim.
    const h = 99, centerY = floor - 45 - h * .43;
    sprite(g, who, Math.sin(q * .6) > .4 ? 7 : 6, x, centerY, h, {center:true,angle:Math.PI});
    rect(g,x-12,floor-47,5,4,'#edb779');
    rect(g,x+8,floor-47,5,4,'#edb779');
    // Tap hose stays attached to the keg while the head bobs.
    rect(g,x+15,floor-49,3,12,'#232b30');
    rect(g,x+5,floor-40,13,3,'#232b30');
    if(Math.sin(q*1.7)>.85)rect(g,x+3,floor-39,2,3,'#e5ca85');
  }
  function banner(opts) {
    const {g,txt}=opts;
    rect(g,214,143,397,42,'#0c1018');
    rect(g,218,147,389,34,'#a14361');
    rect(g,222,151,381,26,'#d6c28b');
    rect(g,219,144,4,4,'#7a8a83');rect(g,602,144,4,4,'#7a8a83');
    txt?.("BLOWIN' O'S -",414,154,1,'#3d3040','center');
    txt?.('SMOKE RING OLYMPICS',414,168,1,'#3d3040','center');
  }
  function drawBack(opts) {
    const {g,t,type,npcSprite}=opts;
    g.save();
    // The room remains a distinct canvas; only actor layers draw here.
    g.beginPath();g.rect(0,139,640,259);g.clip();
    if(type==='pong') {
      // Their feet are on the far-side floor and disappear behind the table.
      const opponents=[{type:2,x:246,phase:.4},{type:1,x:392,phase:2.9}];
      opponents.forEach((p,i)=>{
        const q=t*(3.8+i*.3)+p.phase;
        npcSprite?.(p.type,p.x+Math.round(Math.sin(q*.3)*2),234,Math.sin(q*.7)>.2?'hug':'kiss',i?-1:1,0,.87);
        // Pointer and fist flicks read as taunts, each on its own timing.
        if(Math.sin(q*1.1)>.7){rect(g,p.x+(i?-25:25),173,7,5,'#f0b269');star(g,p.x+(i?-33:33),160,q,'#e9ba68');}
      });
      npcSprite?.(0,64+Math.round(Math.sin(t*1.1)*2),315,'throw',1,(t*1.1)% .62,.88);
      npcSprite?.(3,586,310-jump(t,.81,.33,9),'jump',-1,0,.84);
    } else if(type==='smoke') {
      banner(opts);
      npcSprite?.(2,46,385-jump(t,.73,.58,11),'jump',1,0,.9);
      npcSprite?.(1,405+Math.round(Math.sin(t*.91)*2),314,'throw',-1,(t*.81)% .62,.69);
      const rest=[0,1,2].filter(i=>i!==opts.selected);
      const positions=[{kegX:280,robotX:324},{kegX:549,robotX:590}];
      // Both kegs remain fixed props; the band mates change activities, not rooms.
      positions.forEach(p=>keg(g,p.kegX,385));
      rest.forEach((who,i)=>{
        const local=t+phases[who], doingStand=Math.floor(local/7)%2===i;
        if(doingStand)kegStand(opts,who,positions[i].kegX,385,phases[who]);
        else robot(opts,who,positions[i].robotX,385,phases[who]);
      });
    }
    g.restore();
  }
  function drawFront(opts) {
    const {g,t,type,selected,aim=0,effect}=opts;
    g.save();g.beginPath();g.rect(0,139,640,259);g.clip();
    if(type==='pong') {
      const age=effect?.age??Infinity, flight=effect&&!effect.done;
      const pose=flight?(age<.09?2:age<.18?0:3):(Math.sin(t*2.8+phases[selected])>.2?0:1);
      const rock=0, anticipation=flight?Math.min(age,.55)*7:t*2.1;
      // Close camera: the near pair crop naturally at the waist/hips.
      sprite(g,selected,pose,214+Math.round(aim*9),474,212,{motionTime:anticipation+phases[selected]});
      if(flight&&age<.09){
        // Windup atlas hand is empty; add the held ball at its actual fist.
        rect(g,190+Math.round(aim*9),299+rock,7,6,'#fff0cc');rect(g,191+Math.round(aim*9),298+rock,4,1,'#fffbee');
      }
      const teammate=(selected+1)%3;
      cheer(opts,teammate,547,455,202,2.1);
    } else if(type==='smoke') {
      const age=effect?.age??Infinity, released=effect&&!effect.done;
      const breath=(t*.65+phases[selected])%1;
      const pose=released&&age>=.18?5:4;
      const bob=0;
      // Head meets the ring emitter at (180,230); the joint remains in the hand.
      sprite(g,selected,pose,144,358,188,{motionTime:released?Math.min(age,.72)*4:t*2.6,motion:'breath'});
      if(!released){
        const glow=breath<.55?(Math.sin(t*18+selected)>.2?'#f6b368':'#f2944e'):'#ca6b3e';
        rect(g,178,230+bob,9,3,'#e3d5b3');rect(g,186,230+bob,3,3,glow);
        if(breath>.5)puff(g,185,230+bob,t,.8);
      }else if(age<.18){rect(g,180,230+bob,9,3,'#e3d5b3');rect(g,187,230+bob,3,3,'#f5a056');}
      else if(age<.72){
        // Cheek puffs make the action distinct from the idle inhalation loop.
        rect(g,173,226+bob,5,5,'#efb66d');
        for(let i=0;i<3;i++)rect(g,186+i*7,227+(i%2)*3,4,2,'#cdd8be99');
      }
      const mate=(selected+1)%3;
      // Crowd accents use another phase, independent of the two bandmates.
      if(Math.sin(t*.53+1.1)>.25)star(g,71,278,t+phases[mate],'#e6bd68');
    }
    g.restore();
  }
  window.CGPartyCast={drawBack,drawFront};
})();
