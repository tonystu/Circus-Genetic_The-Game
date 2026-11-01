/* Character previews are painted in two pixel layers; the original menu owns input. */
(() => {
  'use strict';
  const select = document.getElementById('select');
  if (!select) return;
  const buttons = [...select.querySelectorAll('[data-player]')];
  if (buttons.length !== 3) return;
  const P = { ink:'#111621', edge:'#070a10', cream:'#f4e4bd', orange:'#ed873c', pink:'#e95a9d', cyan:'#46c4ca', green:'#b6da67' };
  const names = ['MATT', 'BRICE', 'TONY'];
  const roles = ['BASS GUITAR', 'GUITAR + VOCALS', 'DRUMSTICKS'];
  const positions = [120, 320, 520], floor = 353;
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  const layers = ['background','players'].map(name => {
    const canvas = document.createElement('canvas');
    canvas.width = 640; canvas.height = 480;
    canvas.className = 'cg-menu-layer cg-menu-' + name;
    canvas.setAttribute('aria-hidden', 'true');
    select.insertBefore(canvas, select.firstChild);
    return canvas;
  });
  const bg = layers[0].getContext('2d'), g = layers[1].getContext('2d');
  if (!bg || !g) return;
  bg.imageSmoothingEnabled = g.imageSmoothingEnabled = false;
  const assets = {};
  let ready = false, picked = -1, selectionAt = 0, clock = 0, last = null, wasActive = false;
  for (const [key,file] of Object.entries({ room:'scenes.png', band:'band-motion-clean.png', walk:'band-walk-clean.png' })) {
    const im = new Image();
    im.onload = () => {
      ready = Object.values(assets).length === 3 && Object.values(assets).every(loaded);
      select.classList.toggle('cg-menu-ready', ready);
    };
    assets[key] = im;
    im.src = window.CG_ASSETS?.['assets/' + file] || 'assets/' + file;
  }
  function loaded(im) { return im.complete && im.naturalWidth > 0; }
  function rect(ctx,x,y,w,h,color) { ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h)); }
  function text(ctx,label,x,y,size,color,center=false) {
    label=String(label).toUpperCase();
    if(center)x-=((label.length*6-1)*size)/2;
    const font=window.CG_FONT || {};
    for(const ch of label){
      const rows=(font[ch] || '00000/00000/00000/00000/00000/00000/00000').split('/');
      rows.forEach((row,yy)=>[...row].forEach((on,xx)=>{if(on==='1')rect(ctx,x+xx*size,y+yy*size,size,size,color)}));
      x+=size*6;
    }
  }
  function choose(index) {
    if(index<0||index>2)return;
    if(picked!==index){picked=index;selectionAt=clock;}
    select.dataset.preview=String(index);
    buttons.forEach((button,i)=>button.classList.toggle('cg-selected',i===index));
  }
  buttons.forEach((button,i)=>{
    button.addEventListener('mouseenter',()=>choose(i));
    button.addEventListener('focus',()=>choose(i));
    button.addEventListener('pointerdown',()=>choose(i));
  });
  choose(Math.max(0,Math.min(2,Number(document.getElementById('actionCanvas')?.dataset.player)||0)));

  // These classes add pixel cursors without replacing any original click/focus target.
  for(const region of document.querySelectorAll('.titlemenu, #intro, #info')){
    const choices=[...region.querySelectorAll('button')];
    const highlight=button=>choices.forEach(item=>item.classList.toggle('cg-menu-current',item===button));
    choices.forEach(button=>{
      button.addEventListener('mouseenter',()=>highlight(button));
      button.addEventListener('focus',()=>highlight(button));
    });
    if(choices[0])highlight(choices[0]);
  }
  function background(t) {
    bg.clearRect(0,0,640,480);
    rect(bg,0,0,640,480,P.ink);
    const room=assets.room;
    bg.drawImage(room,0,0,room.width/2,room.height/2,0,0,640,404);
    // Separate lamp filaments and amp LEDs animate behind the musicians.
    for(const [x,y,phase] of [[173,46,0],[438,46,1],[226,72,2]]){
      const warm=Math.floor(t*3+phase)%4!==0;
      rect(bg,x-3,y-3,6,6,warm?'#fff0b1':'#ed873c');
      rect(bg,x-5,y+4,10,2,warm?'#f7ba6f':'#a86a37');
    }
    for(const [x,y,phase] of [[178,160,0],[477,187,1]]){
      rect(bg,x,y,3,3,Math.floor(t*3+phase)%2?P.green:'#45634a');
    }
    // A cable rests on the floor; its square bends keep the room physically grounded.
    rect(bg,56,368,103,3,P.edge);rect(bg,155,368,3,12,P.edge);
    rect(bg,155,377,273,3,P.edge);rect(bg,425,368,3,12,P.edge);
    rect(bg,425,368,129,3,P.edge);
    rect(bg,0,396,640,8,P.edge);
    for(let x=12;x<640;x+=24)rect(bg,x,397,12,2,x%48?P.pink:P.cyan);
  }
  function sprite(who,col,x,size,walking=false) {
    const im=walking?assets.walk:assets.band,sw=im.width/8,sh=im.height/3;
    // All clean frames share the same five-pixel transparent space below their soles.
    const y=Math.round(floor-size+size*5/256);
    g.drawImage(im,col*sw,who*sh,sw,sh,Math.round(x-size/2),y,size,size);
  }
  function foreground(t) {
    g.clearRect(0,0,640,480);
    // A silkscreened header, rather than a floating HTML card, belongs to this menu art.
    rect(g,133,15,374,56,P.edge);rect(g,129,19,382,48,P.ink);
    rect(g,137,15,366,3,P.orange);rect(g,137,66,366,3,P.pink);
    text(g,'CHOOSE YOUR PLAYER',320,27,3,P.cream,true);
    text(g,'THREE FRIENDS. ONE LOUD BAND.',320,53,1,P.cyan,true);
    for(let who=0;who<3;who++){
      const active=who===picked;
      const age=reduced?.matches?0:(t-selectionAt+6)%6;
      let col=Math.floor(t*4+who)%4,walking=false,dx=0;
      if(active){
        if(age<1.65){walking=true;col=Math.floor(age*8)%8;dx=Math.round(Math.sin(age*Math.PI*2/1.65)*9);}
        else if(age<2.8)col=Math.floor((age-1.65)*5)%2?5:4;
        else if(age<4.45)col=6+Math.floor((age-2.8)*4)%2;
        else col=Math.floor(t*4)%4;
        if(reduced?.matches){col=1;walking=false;dx=0;}
      }
      const x=positions[who]+dx,size=active?174:151;
      rect(g,x-39,floor,78,5,P.edge);rect(g,x-28,floor+4,56,2,'#2c252b');
      // Tape crosses and a selected floor stripe stay below the player's feet.
      rect(g,positions[who]-48,floor+8,96,3,active?P.green:'#714f3c');
      rect(g,positions[who]-48,floor+6,3,7,active?P.green:'#714f3c');
      rect(g,positions[who]+45,floor+6,3,7,active?P.green:'#714f3c');
      sprite(who,col,x,size,walking);
      const label=active?P.green:P.cream;
      text(g,names[who],positions[who],370,2,label,true);
      text(g,roles[who],positions[who],389,1,active?P.cream:'#c2aa91',true);
      if(active){
        // This cursor tracks the preview, never moves the actual hit targets.
        const bob=reduced?.matches?0:Math.floor(t*3)%2*2;
        rect(g,positions[who]-3,168+bob,6,5,P.orange);
        rect(g,positions[who]-6,173+bob,12,3,P.orange);
        rect(g,positions[who]-3,176+bob,6,3,P.orange);
      }
    }
  }
  function tick(now) {
    const active=select.classList.contains('active');
    if(active&&!wasActive){
      choose(Math.max(0,Math.min(2,Number(document.getElementById('actionCanvas')?.dataset.player)||0)));
      selectionAt=clock;
    }
    if(last!==null&&active)clock+=Math.min(.05,Math.max(0,(now-last)/1000));
    last=now;wasActive=active;
    if(active&&ready){const t=reduced?.matches?0:clock;background(t);foreground(t);}
    window.requestAnimationFrame(tick);
  }
  window.requestAnimationFrame(tick);
})();
