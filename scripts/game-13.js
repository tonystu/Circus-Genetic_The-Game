/* Circus Genetic: supplied portrait artwork, independently animated menu layers. */
(() => {
  'use strict';
  const select = document.getElementById('select');
  if (!select) return;
  const buttons = [...select.querySelectorAll('[data-player]')];
  if (buttons.length !== 3) return;
  const W = 1448, H = 1086;
  const ink = '#050505', cream = '#fff2bd', gold = '#ffc76b';
  const names = ['MATT', 'BRICE', 'TONY'];
  const roles = ['BASS', 'GUITAR + VOCALS', 'DRUMS'];
  const centers = [222, 724, 1225];
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  const style = document.createElement('style');
  style.textContent = `
    #select.cg-portrait-menu { background:#050505; overflow:hidden; }
    #select.cg-portrait-menu .cg-menu-layer { position:absolute; inset:0; width:100%; height:100%; image-rendering:pixelated; pointer-events:none; opacity:0; }
    #select.cg-portrait-menu .cg-menu-background { z-index:0; }
    #select.cg-portrait-menu .cg-menu-players { z-index:1; }
    #select.cg-portrait-menu.cg-menu-ready .cg-menu-layer { opacity:1; }
    #select.cg-portrait-menu.cg-menu-ready > .art { visibility:hidden; }
    #select.cg-portrait-menu > .art { object-fit:fill; }
    #select.cg-portrait-menu .choices { position:absolute; inset:11% 0 0; height:89%; min-height:0; width:100%; display:grid; grid-template-columns:repeat(3,1fr); gap:0; padding:0; z-index:3; border:0; background:transparent; }
    #select.cg-portrait-menu .choices button,
    #select.cg-portrait-menu .choices button:hover,
    #select.cg-portrait-menu .choices button.cg-selected { margin:0; padding:0; border:0; border-radius:0; background:transparent; color:transparent; font-size:0!important; box-shadow:none; cursor:pointer; }
    #select.cg-portrait-menu .choices button small { display:none; }
    #select.cg-portrait-menu .choices button:focus-visible { outline:3px solid #fff2bd; outline-offset:-7px; }
    #select.cg-portrait-menu > .skip { top:11.6%; right:8px; bottom:auto!important; z-index:5; background:#050505; color:#fff2bd; border:2px solid #fff2bd; box-shadow:2px 2px #050505; padding:6px 8px; font-size:8px!important; }
    @media(max-width:600px) { #select.cg-portrait-menu > .skip { right:5px; padding:5px; font-size:7px!important; } }
  `;
  document.head.appendChild(style);
  select.classList.add('cg-portrait-menu');
  select.setAttribute('aria-label','Select your player. Matt: bass. Brice: guitar and vocals. Tony: drums. Use left or right, then Enter, or click a player.');

  const art = select.querySelector(':scope > .art');
  if (art) {
    art.removeAttribute('data-embedded-src');
    art.src = 'assets/select-portraits-v4.png';
    art.alt = 'Select your player: Matt on the left in sunglasses and a pink shirt, clean-shaven Brice in the center with a turquoise cap, and Tony on the right in plaid, in front of a graffiti wall.';
  }
  const layers = ['background','players'].map(name => {
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    canvas.className = 'cg-menu-layer cg-menu-' + name;
    canvas.setAttribute('aria-hidden','true');
    select.insertBefore(canvas,select.firstChild);
    return canvas;
  });
  const bg = layers[0].getContext('2d'), g = layers[1].getContext('2d');
  if (!bg || !g) return;
  bg.imageSmoothingEnabled = g.imageSmoothingEnabled = false;
  const assets = {}, people = [];
  let ready = false, picked = 0, clock = 0, last = null, wasActive = false;
  let frameNumber = -1, visibilityPaused = document.hidden;
  document.addEventListener('visibilitychange',() => { visibilityPaused = document.hidden; last = null; });

  // These are runtime canvas masks, not newly drawn replacement people. The
  // pixels inside every silhouette come straight from the supplied artwork.
  const figures = [
    { x:100, y:120, w:260, h:854, waist:550, neck:280, phase:0,
      points:[[168,137],[201,123],[250,130],[285,148],[299,174],[300,202],[281,226],[284,255],[304,275],[328,289],[343,316],[351,365],[341,408],[334,442],[338,493],[346,540],[327,559],[313,577],[311,641],[302,699],[285,747],[273,811],[261,857],[278,890],[270,917],[252,940],[209,965],[163,962],[140,948],[142,924],[151,898],[163,875],[171,824],[183,759],[188,687],[195,602],[182,575],[153,581],[139,556],[131,513],[119,475],[109,442],[103,410],[106,365],[110,331],[128,294],[148,278],[165,262],[167,247],[155,224],[151,194],[154,165]] },
    { x:548, y:135, w:326, h:850, waist:599, neck:303, phase:1.8,
      points:[[714,144],[757,143],[779,154],[789,179],[803,192],[797,215],[781,226],[787,248],[784,269],[776,289],[795,301],[821,317],[837,343],[846,375],[841,417],[834,476],[819,524],[811,579],[817,597],[838,615],[834,641],[821,655],[825,732],[830,825],[824,871],[846,894],[865,916],[869,937],[863,951],[835,958],[805,955],[777,945],[761,930],[745,951],[714,973],[666,981],[639,974],[628,960],[631,935],[644,905],[650,860],[635,812],[622,748],[616,694],[609,658],[603,642],[585,645],[569,627],[554,616],[556,584],[560,550],[565,508],[562,460],[568,412],[580,372],[596,333],[619,313],[652,301],[673,277],[686,267],[677,245],[660,239],[648,225],[651,202],[660,178],[682,156]] },
    { x:1028, y:136, w:338, h:853, waist:600, neck:309, phase:3.5,
      points:[[1140,150],[1176,137],[1212,140],[1241,150],[1247,172],[1233,192],[1240,219],[1238,242],[1230,260],[1215,279],[1205,300],[1238,309],[1267,320],[1292,335],[1311,358],[1329,388],[1339,416],[1335,451],[1331,478],[1318,507],[1305,527],[1306,575],[1322,601],[1334,646],[1349,686],[1358,717],[1352,750],[1335,778],[1317,803],[1297,838],[1282,873],[1281,888],[1308,901],[1335,917],[1350,937],[1333,951],[1313,956],[1274,947],[1255,969],[1220,984],[1183,981],[1153,966],[1141,944],[1147,920],[1151,900],[1145,865],[1136,816],[1125,769],[1119,719],[1114,669],[1108,622],[1098,599],[1076,591],[1068,566],[1066,531],[1057,500],[1043,473],[1033,445],[1031,413],[1036,384],[1045,359],[1061,338],[1086,322],[1110,314],[1129,299],[1136,277],[1120,268],[1108,249],[1109,225],[1119,198],[1133,176]] }
  ];
  function loaded(im) { return im.complete && im.naturalWidth > 0; }
  function preparePeople() {
    for (const person of figures) {
      const canvas = document.createElement('canvas');
      canvas.width = person.w; canvas.height = person.h;
      const c = canvas.getContext('2d');
      c.imageSmoothingEnabled = false;
      c.beginPath();
      person.points.forEach(([x,y],i) => i ? c.lineTo(x-person.x,y-person.y) : c.moveTo(x-person.x,y-person.y));
      c.closePath();c.clip();
      c.drawImage(assets.portraits,-person.x,-person.y,W,H);
      people.push({...person,canvas});
    }
  }
  for (const [key,file] of Object.entries({plate:'select-wall-v4.png',portraits:'select-portraits-v4.png'})) {
    const im = new Image(); assets[key] = im;
    im.onload = () => {
      if (Object.keys(assets).length === 2 && Object.values(assets).every(loaded) && !ready) {
        preparePeople(); ready = true; select.classList.add('cg-menu-ready');
        background(0);foreground(0);
      }
    };
    im.onerror = () => { select.classList.remove('cg-menu-ready'); };
    im.src = 'assets/' + file;
  }
  function rect(c,x,y,w,h,color) { c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h)); }
  function text(label,x,y,size,color) {
    label = String(label).toUpperCase();
    x -= (label.length*6-1)*size/2;
    for(const ch of label) {
      const rows = (window.CG_FONT?.[ch] || '00000/00000/00000/00000/00000/00000/00000').split('/');
      rows.forEach((row,yy) => [...row].forEach((on,xx) => {if(on==='1')rect(g,x+xx*size,y+yy*size,size,size,color);}));
      x += size*6;
    }
  }
  function choose(index) {
    if(index<0 || index>2) return;
    picked = index;
    select.dataset.preview = String(index);
    buttons.forEach((button,i) => {
      button.classList.toggle('cg-selected',i===index);
      button.setAttribute('aria-pressed',String(i===index));
      button.setAttribute('aria-label',`Choose ${names[i]}, ${i===0?'bass guitar':i===1?'lead guitar and vocals':'drummer'}`);
    });
  }
  buttons.forEach((button,i) => {
    button.addEventListener('pointerenter',() => choose(i));
    button.addEventListener('focus',() => choose(i));
    button.addEventListener('pointerdown',() => choose(i));
  });
  choose(Math.max(0,Math.min(2,Number(document.getElementById('actionCanvas')?.dataset.player)||0)));

  // Leave the original button onclick handlers in charge of starting chapters.
  // Number keys, mouse, touch and the chapter-selection route remain intact.
  document.addEventListener('keydown',event => {
    if (!select.classList.contains('active') || event.altKey || event.ctrlKey || event.metaKey) return;
    const key = event.key.toLowerCase();
    const onBack = event.target instanceof Element && event.target.closest('[data-title]');
    if (onBack && (key==='enter' || key===' ')) return;
    if (['arrowleft','arrowright','a','d'].includes(key)) {
      event.preventDefault();event.stopImmediatePropagation();
      choose((picked+(['arrowleft','a'].includes(key)?2:1))%3);
      buttons[picked].focus({preventScroll:true});
    } else if ((key==='enter'||key===' ') && !event.repeat) {
      event.preventDefault();event.stopImmediatePropagation();buttons[picked].click();
    }
  },true);

  // Preserve the established pixel focus cursors on the other game menus.
  for (const region of document.querySelectorAll('.titlemenu, #intro, #info')) {
    const choices = [...region.querySelectorAll('button')];
    const highlight = button => choices.forEach(item => item.classList.toggle('cg-menu-current',item===button));
    choices.forEach(button => {
      button.addEventListener('mouseenter',() => highlight(button));
      button.addEventListener('focus',() => highlight(button));
    });
    if (choices[0]) highlight(choices[0]);
  }
  function background(t) {
    bg.clearRect(0,0,W,H);
    bg.drawImage(assets.plate,0,0,W,H);
    // Painted wall flecks shimmer on their own layer, behind the characters.
    if (!reduced?.matches) {
      for (const [x,y,phase,color] of [[465,164,0,'#38b9ef'],[936,166,1,'#b4dc49'],[969,714,2,'#ef75b6'],[49,611,3,'#f1a3ce']]) {
        bg.globalAlpha = .14 + Math.max(0,Math.sin(t*1.5+phase))*.26;
        rect(bg,x,y,6,5,color);rect(bg,x+6,y+5,4,3,color);
      }
      bg.globalAlpha = 1;
    }
    // Hide the three baked-in arrows; the foreground paints independent cursors.
    rect(bg,0,991,W,95,ink);
  }
  function drawPerson(person,who,t) {
    const active = who===picked;
    const phase = t*(active?2.7:1.7)+person.phase;
    const breath = reduced?.matches ? 0 : Math.sin(phase);
    const sway = reduced?.matches ? 0 : Math.sin(phase*.73)* (active?3.8:1.8);
    const tilt = reduced?.matches ? 0 : Math.sin(phase*1.07)* (active?.012:.005);
    const scale = 1 + breath*(active?.005:.003);
    const waist = person.waist-person.y;
    // Keep trousers and shoes fixed. Two-pixel scanline deformation above the
    // waist gives breathing, a shoulder rock and a small independent head nod.
    g.drawImage(person.canvas,0,waist,person.w,person.h-waist,person.x,person.waist,person.w,person.h-waist);
    for(let y=0;y<waist;y+=2) {
      const h=Math.min(2,waist-y),top=person.y+y;
      const headFactor=Math.max(0,(person.neck-top)/150);
      const weight=1-y/waist;
      const dx=Math.round(sway*weight + tilt*Math.max(0,person.neck-top));
      const extraNod=(reduced?.matches?0:Math.sin(phase*1.2)*1.6)*Math.min(1,headFactor);
      const nextHead=Math.max(0,(person.neck-(top+h))/150);
      const nextNod=(reduced?.matches?0:Math.sin(phase*1.2)*1.6)*Math.min(1,nextHead);
      const dy=Math.round(person.waist+(y-waist)*scale+extraNod);
      const end=Math.round(person.waist+(y+h-waist)*scale+nextNod);
      g.drawImage(person.canvas,0,y,person.w,h,person.x+dx,dy,person.w,Math.max(1,end-dy));
    }
    // One restrained glint travels across the actual sunglasses, never the wall.
    if (!reduced?.matches && (who===0 || who===2)) {
      const glint=(t+who*1.3)%6;
      if(glint<.45) {
        const glasses=who===0?[216,201]:[1171,207];
        const x=glasses[0]+Math.floor(glint/.45*23)+Math.round(sway*.8);
        const y=glasses[1]+Math.round((person.waist-glasses[1])*(1-scale));
        rect(g,x,y,3,7,who===0?'#d7f2ec':'#99efff');
      }
    }
  }
  function cursor(x,y,color) {
    for(let row=0;row<7;row++)rect(g,x-5-row*5,y+row*5,10+row*10,5,color);
    rect(g,x-37,y+35,74,5,color);
  }
  function foreground(t) {
    g.clearRect(0,0,W,H);
    people.forEach((person,i) => drawPerson(person,i,t));
    for(let who=0;who<3;who++) {
      const active=who===picked;
      const pulse=reduced?.matches?0:Math.floor((Math.sin(t*4)+1)*1.5);
      cursor(centers[who],1011-(active?pulse:0),active?cream:'#6b6654');
      if(active) {
        rect(g,centers[who]-48,1053,96,3,gold);
        rect(g,centers[who]-48,1053,4,7,gold);
        rect(g,centers[who]+44,1053,4,7,gold);
      }
      text(names[who]+' / '+roles[who],centers[who],1065,2,active?cream:'#a99e7f');
    }
  }
  function tick(now) {
    const active=select.classList.contains('active')&&!visibilityPaused;
    if(active&&!wasActive) {
      choose(Math.max(0,Math.min(2,Number(document.getElementById('actionCanvas')?.dataset.player)||0)));
      frameNumber=-1;
    }
    if(last!==null&&active)clock+=Math.min(.05,Math.max(0,(now-last)/1000));
    last=now;wasActive=active;
    const frame=Math.floor(clock*30);
    if(active&&ready&&frame!==frameNumber) {
      frameNumber=frame;const t=reduced?.matches?0:clock;background(t);foreground(t);
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();

/* Live performance: venue/lights, musicians, instruments, kit and mic layers. */
(() => {
  'use strict';
  const W=1448,H=1086,assets={},sprites={};
  const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)');
  const full=document.createElement('canvas');full.width=W;full.height=H;
  const fg=full.getContext('2d');fg.imageSmoothingEnabled=false;
  const venue=document.createElement('canvas');venue.width=2400;venue.height=420;
  const vg=venue.getContext('2d');vg.imageSmoothingEnabled=false;
  let ready=false;
  const paths={
    drummer:[[50,275],[421,275],[421,950],[50,950]],
    guitar:[[480,100],[1010,100],[1010,410],[1090,410],[1090,480],[1010,500],[1000,650],[960,1065],[480,1065]],
    bass:[[1010,165],[1448,165],[1448,975],[975,975],[1000,650],[1010,500],[1090,480],[1090,410],[1010,410]],
    drumLeft:[[79,535],[105,535],[146,559],[188,582],[213,585],[232,605],[226,624],[205,627],[182,612],[143,602],[111,586],[85,574]],
    drumRight:[[280,516],[307,514],[326,528],[335,534],[389,478],[404,479],[405,490],[350,551],[348,566],[329,581],[306,580],[290,562]],
    guitarHand:[[644,551],[675,553],[694,564],[710,582],[707,604],[690,619],[669,619],[647,607],[633,588]],
    bassHand:[[1082,425],[1107,426],[1121,445],[1134,459],[1145,476],[1142,495],[1128,502],[1111,490],[1093,474],[1082,452]]
  };
  function shape(ctx,points){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();}
  function layer(points,source){
    const c=document.createElement('canvas');c.width=W;c.height=H;
    const x=c.getContext('2d');x.imageSmoothingEnabled=false;x.save();shape(x,points);x.clip();x.drawImage(source,0,0,W,H);x.restore();return c;
  }
  function clearShape(canvas,points){const c=canvas.getContext('2d');c.save();c.globalCompositeOperation='destination-out';shape(c,points);c.fill();c.restore();}
  function makeVenue(){vg.fillStyle='#08090c';vg.fillRect(0,0,2400,420);vg.drawImage(assets.panorama,0,0,assets.panorama.naturalWidth,assets.panorama.naturalHeight,0,28,2400,370);}
  function prepare(){
    for(const key of ['drummer','guitar','bass'])sprites[key]=layer(paths[key],assets.band);
    for(const key of ['drumLeft','drumRight','guitarHand','bassHand'])sprites[key]=layer(paths[key],assets.band);
    clearShape(sprites.drummer,paths.drumLeft);clearShape(sprites.drummer,paths.drumRight);
    clearShape(sprites.guitar,paths.guitarHand);clearShape(sprites.bass,paths.bassHand);
    // Replace the tiny areas hidden by picking hands with the guitar underneath.
    const gc=sprites.guitar.getContext('2d');gc.save();gc.globalCompositeOperation='destination-over';shape(gc,paths.guitarHand);gc.fillStyle='#f5e0a2';gc.fill();gc.restore();
    const bc=sprites.bass.getContext('2d');bc.save();bc.globalCompositeOperation='destination-over';shape(bc,paths.bassHand);bc.fillStyle='#17131f';bc.fill();bc.restore();
    sprites.kitBody=document.createElement('canvas');sprites.kitBody.width=W;sprites.kitBody.height=H;
    const k=sprites.kitBody.getContext('2d');k.imageSmoothingEnabled=false;k.drawImage(assets.kit,0,0,W,H);
    for(const [x,y,w,h] of [[0,440,266,105],[499,340,245,116],[525,482,205,75]])k.clearRect(x,y,w,h);
    // Only the mic and its stand are taken from the existing live artwork.
    sprites.mic=layer([[767,318],[787,323],[809,340],[842,357],[861,381],[870,413],[886,961],[860,961],[849,423],[841,400],[826,379],[793,359],[770,344]],assets.mic);
    const mc=sprites.mic.getContext('2d'),pixels=mc.getImageData(0,0,W,H);
    for(let i=0;i<pixels.data.length;i+=4){const r=pixels.data[i],g=pixels.data[i+1],b=pixels.data[i+2];if(Math.max(r,g,b)-Math.min(r,g,b)>65)pixels.data[i+3]=0;}
    mc.putImageData(pixels,0,0);
    makeVenue();ready=true;
  }
  for(const [key,file] of Object.entries({plate:'live-wall-v4.png',band:'live-band-v4.png',kit:'live-drums-v4.png',mic:'live.webp',panorama:'live-venue-v5.png'})){
    const im=new Image();assets[key]=im;
    im.onload=()=>{if(Object.keys(assets).length===5&&Object.values(assets).every(a=>a.complete&&a.naturalWidth)&&!ready)prepare();};
    im.src='assets/'+file;
  }
  function rotateLayer(image,x,y,angle){fg.save();fg.translate(x,y);fg.rotate(angle);fg.drawImage(image,-x,-y);fg.restore();}
  function performer(who,t,scaleAll){
    const tempo=t*Math.PI*2/.6;
    const phase=who===2?.7:who===1?0:1.4;
    const sway=reduced?.matches?0:Math.sin(tempo/2+phase);
    const scale=who===2?.90:who===1?.83:.94;
    const sx=who===2?70:who===1?511:1024;
    const sy=who===2?300:who===1?127:185;
    const dx=who===2?80:who===1?552:1038;
    const dy=who===2?355:who===1?182:235;
    const key=who===2?'drummer':who===1?'guitar':'bass';
    const waist=who===2?630:who===1?675:650;
    fg.save();
    const center=who===2?240:who===1?790:1195;
    fg.translate(center,940);fg.scale(scaleAll,scaleAll);fg.translate(-center,-940);
    fg.translate(dx,dy);fg.scale(scale,scale);fg.translate(-sx,-sy);
    // Seated lower body and planted shoes stay still; torso rocks about the hips.
    fg.save();fg.beginPath();fg.rect(0,waist,W,H-waist);fg.clip();fg.drawImage(sprites[key],0,0);fg.restore();
    fg.save();fg.beginPath();fg.rect(0,0,W,waist);fg.clip();
    fg.translate(center,waist);fg.rotate(sway*(who===2?.012:.025));fg.translate(-center,-waist);
    fg.drawImage(sprites[key],0,0);
    if(who===2){
      rotateLayer(sprites.drumLeft,105,550,reduced?.matches?0:Math.sin(tempo)*.27);
      rotateLayer(sprites.drumRight,302,536,reduced?.matches?0:Math.sin(tempo+Math.PI)*.30);
    }else if(who===1){rotateLayer(sprites.guitarHand,646,564,reduced?.matches?0:Math.sin(tempo*2)*.22);}
    else{rotateLayer(sprites.bassHand,1094,438,reduced?.matches?0:Math.sin(tempo)*.18);}
    fg.restore();fg.restore();
  }
  function kit(t,scaleAll,playing){
    fg.save();fg.translate(240,940);fg.scale(scaleAll,scaleAll);fg.translate(-240,-940);
    fg.translate(0,456);fg.scale(.70,.77);fg.translate(-10,-348);
    fg.drawImage(sprites.kitBody,0,0);
    const shake=reduced?.matches||!playing?0:Math.sin(t*Math.PI*2/.6)*Math.exp(-((t%.6)*5));
    for(const [x,y,w,h,px,py,direction] of [[0,440,266,105,130,532,1],[499,340,245,116,626,443,-1],[525,482,205,75,618,546,1]]){
      fg.save();fg.translate(px,py);fg.rotate(shake*.025*direction);fg.drawImage(assets.kit,x,y,w,h,x-px,y-py,w,h);fg.restore();
    }
    if(playing&&!reduced?.matches){
      const hit=Math.max(0,1-(t%.6)/.12);
      fg.fillStyle=`rgba(255,225,143,${hit*.10})`;fg.fillRect(357,760,151,100);
    }
    fg.restore();
  }
  function lights(bg,t,camera,performance){
    const lamps=performance?[[102/W*640,45,'#6aff30'],[585/W*640,45,'#ffad2f'],[899/W*640,45,'#ff852c'],[1141/W*640,45,'#ff6d29'],[1292/W*640,45,'#56ed23']]:[[80,66,'#6aff30'],[338,70,'#ffad2f'],[512,75,'#ff852c'],[636,78,'#ff6d29'],[718,81,'#56ed23'],[962,88,'#ffae43'],[1348,91,'#ffae43'],[1658,113,'#ffae43'],[1900,113,'#ffae43'],[2110,109,'#ffae43']];
    bg.save();lamps.forEach(([worldX,y,color],i)=>{const x=worldX-camera;if(x< -65||x>705)return;const beat=reduced?.matches?.45:.40+.35*(Math.sin(t*Math.PI*2/.6-i*.9)*.5+.5),sway=reduced?.matches?0:Math.sin(t*.8+i)*20;bg.fillStyle=color;bg.globalAlpha=beat*.07;bg.beginPath();bg.moveTo(x-3,y+3);bg.lineTo(x-45+sway,310);bg.lineTo(x+45+sway,310);bg.lineTo(x+3,y+3);bg.closePath();bg.fill();bg.globalAlpha=beat*.5;bg.fillRect(Math.round(x-5),Math.round(y-4),10,8);});bg.restore();
  }
  window.CGLiveStage={
    ready:()=>ready,
    draw({g,bg,t,camera=0,exclude=-1,performance=false,zoom=1}){
      if(!ready)return false;
      const cam=performance?0:Math.max(0,Math.min(1760,camera));
      bg.clearRect(0,0,640,420);bg.fillStyle='#08090c';bg.fillRect(0,0,640,420);bg.save();if(zoom!==1){bg.translate(320,398);bg.scale(zoom,zoom);bg.translate(-320,-398);}if(performance)bg.drawImage(assets.plate,0,96,W,867,0,28,640,370);else{const pad=320/zoom-320;bg.drawImage(venue,cam-pad,0,640+pad*2,420,-pad,0,640+pad*2,420);}lights(bg,t,cam,performance);bg.restore();
      fg.clearRect(0,0,W,H);
      const scaleAll=performance?.58:.46;
      // Drummer first, then the single kit, then front-of-stage strings and mic.
      if(exclude!==2)performer(2,t,scaleAll);
      kit(t,scaleAll,exclude!==2);
      if(exclude!==0)performer(0,t,scaleAll);
      if(exclude!==1)performer(1,t,scaleAll);
      fg.save();fg.translate(790,940);fg.scale(scaleAll,scaleAll);fg.translate(-790,-940);fg.drawImage(sprites.mic,0,0);fg.restore();
      g.save();g.translate(-cam,performance?0:-100);
      g.drawImage(full,0,96,W,867,0,28,640,370);g.restore();
      return true;
    }
  };
})();

/* Groupie Roulette: one run, three distinct picks, independent reel results. */
(() => {
 'use strict';
 const names=['ROXY','JULES','MORGAN','NINA','RAE','ALEX','SKYE','JADE','BILLIE'];
 const pick=(rng,n)=>Math.max(0,Math.min(n-1,Math.floor(rng()*n)));
 function create(rng=Math.random){return{phase:'pick',cursor:0,picks:[],lucky:pick(rng,9),rng,time:0,spinAge:0,results:null,jackpot:false,power:false,claimed:false,reels:[],lastStop:0};}
 function toggle(s,i){if(s.phase!=='pick'||i<0||i>8)return false;const at=s.picks.indexOf(i);if(at>=0)s.picks.splice(at,1);else if(s.picks.length<3)s.picks.push(i);s.cursor=i;if(s.picks.length===3)s.phase='loaded';return true;}
 function edit(s,index=2){if(s.phase!=='loaded')return false;s.picks.splice(Math.max(0,Math.min(2,index)),1);s.phase='pick';return true;}
 function spin(s){if(s.phase!=='loaded'||s.picks.length!==3||new Set(s.picks).size!==3)return false;s.results=Array.from({length:3},()=>s.picks[pick(s.rng,3)]);s.jackpot=s.results.every(i=>i===s.results[0]);s.power=s.picks.includes(s.lucky);s.reels=s.results.map((id,i)=>({start:i,turns:(9+i*3)+(s.picks.indexOf(id)-i+3)%3,duration:1.8+i*.65,position:0,stopped:false}));s.phase='spin';s.spinAge=0;return true;}
 function update(s,dt){s.time+=dt;if(s.phase!=='spin')return;s.spinAge+=dt;for(const r of s.reels){const p=Math.min(1,s.spinAge/r.duration);r.position=r.turns*(1-(1-p)**3);r.stopped=p===1;if(r.stopped)r.position=r.turns;}if(s.reels.every(r=>r.stopped))s.phase='result';}
 function claim(s){if(s.phase!=='result'||s.claimed)return null;s.claimed=true;return{points:s.jackpot?10000:0,power:s.power,lucky:s.lucky,jackpot:s.jackpot};}
 function key(s,key){if(s.phase==='pick'){if(/^[1-9]$/.test(key))return toggle(s,+key-1);if(['arrowleft','a'].includes(key))s.cursor=(s.cursor+8)%9;if(['arrowright','d'].includes(key))s.cursor=(s.cursor+1)%9;if(['arrowup','w'].includes(key))s.cursor=(s.cursor+6)%9;if(['arrowdown','s'].includes(key))s.cursor=(s.cursor+3)%9;if(['e','enter',' '].includes(key))return toggle(s,s.cursor);}else if(s.phase==='loaded'){if(key==='backspace')return edit(s);if(['e','enter',' '].includes(key))return spin(s);}return false;}
 const api={names,create,toggle,edit,spin,update,claim,key};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 if(typeof window!=='undefined')window.CGGroupieRoulette=api;
})();

/* All roulette interaction is painted into the game canvas in pixel art. */
(() => {
 'use strict';
 const api=window.CGGroupieRoulette,faces=new Image();faces.src='assets/roulette-faces-v5.png';
 function portrait(g,id,x,y,size){if(faces.complete&&faces.naturalWidth){const w=faces.naturalWidth/3,h=faces.naturalHeight/3;g.drawImage(faces,(id%3)*w,Math.floor(id/3)*h,w,h,x,y,size,size);}else{g.fillStyle=['#6d3448','#48477d','#406c66'][id%3];g.fillRect(x,y,size,size);}}
 function draw(s,{g,bg,txt,box}){
  bg.clearRect(0,0,640,420);bg.fillStyle='#1a1225';bg.fillRect(0,28,640,370);
  // Party floor and lamps animate on the independent background canvas.
  for(let x=12;x<640;x+=30){bg.fillStyle=Math.floor(s.time*3+x)%3?'#ee9e56':'#695377';bg.fillRect(x,39,6,6);}
  bg.fillStyle='#4e3540';bg.fillRect(0,378,640,20);for(let x=0;x<640;x+=42){bg.fillStyle='#785260';bg.fillRect(x,381,30,2);}
  txt('GROUPIE ROULETTE',320,55,3,'#f4e4bd','center');
  if(s.phase==='pick'){
   txt('PICK 3 OF 9 / ONE HIDES GIANT POWER',320,84,1,'#b6da67','center');
   for(let i=0;i<9;i++){
    const x=24+(i%3)*144,y=105+Math.floor(i/3)*89,on=s.picks.includes(i),focus=s.cursor===i;
    box(x,y,135,81,on?'#9cae52':focus?'#f4e4bd':'#665277');box(x+3,y+3,129,75,on?'#343d29':'#221b30');
    portrait(g,i,x+6,y+6,65);txt(String(i+1),x+83,y+14,2,on?'#b6da67':'#ed873c');txt(api.names[i],x+78,y+49,1,'#f4e4bd');
    if(on)txt('IN',x+86,y+65,1,'#b6da67');
   }
   box(470,105,146,263,'#3d2d46');box(475,110,136,253,'#0d0c15');txt('YOUR THREE',543,121,1,'#f4e4bd','center');
   for(let i=0;i<3;i++){const y=144+i*67;box(490,y,106,58,'#3a3044');if(s.picks[i]!==undefined){portrait(g,s.picks[i],491,y+1,55);txt(api.names[s.picks[i]],552,y+27,1,'#f4e4bd');}else txt('?',543,y+22,2,'#776b7d','center');}
   txt('1-9 OR ARROWS + E',320,389,1,'#f4e4bd','center');return;
  }
  txt('YOUR PICKS',320,87,1,'#b6da67','center');
  for(let i=0;i<3;i++){portrait(g,s.picks[i],199+i*72,101,48);if(s.phase==='loaded')box(199+i*72,149,48,2,'#ed873c');}
  box(91,162,448,215,'#0b0911');box(96,166,438,205,'#e29d4e');box(103,173,424,191,'#37273d');
  for(let i=0;i<3;i++){
   const x=123+i*130,y=190;box(x-5,y-5,111,129,'#f4e4bd');box(x-2,y-2,105,123,'#0b0911');
   g.save();g.beginPath();g.rect(x,y,101,101);g.clip();
   if(s.phase==='spin'){
    const r=s.reels[i],base=Math.floor(r.position),frac=r.position-base;
    for(let n=-1;n<=1;n++){const id=s.picks[(r.start+base+n+3000)%3];portrait(g,id,x,y+Math.round((n-frac)*101),101);}
   }else portrait(g,s.phase==='result'?s.results[i]:s.picks[i],x,y,101);
   g.restore();box(x-5,y+96,111,2,'#ed873c');
   if(s.phase==='result')txt(api.names[s.results[i]],x+50,y+109,1,'#f4e4bd','center');
  }
  // Mechanical lever: handle moves down during the spin and springs back.
  const leverY=s.phase==='spin'?267:202;box(537,238,23,18,'#7b677b');box(555,leverY,7,248-leverY,'#d0bec2');box(548,leverY-10,21,20,'#e66a45');box(552,leverY-7,7,5,'#ffcc78');
  for(let i=0;i<14;i++)box(111+i*29,177,4,4,Math.floor(s.time*6+i)%3?'#fff0ba':'#8d6944');
  if(s.phase==='loaded'){txt('PULL THE LEVER',320,333,2,'#b6da67','center');txt('SPACE / E / ENTER   BACKSPACE: CHANGE PICKS',320,354,1,'#f4e4bd','center');}
  else if(s.phase==='spin'){txt('LET IT ROLL...',320,333,2,'#ed873c','center');txt('THREE MATCHING FACES = 10,000 POINTS',320,355,1,'#f4e4bd','center');}
  else{
   const flash=Math.floor(s.time*3)%2===0;
   txt(s.jackpot?'JACKPOT! +10,000':'NO MATCH / KEEP THE NOISE',320,327,s.jackpot?2:1,s.jackpot&&flash?'#b6da67':'#f4e4bd','center');
   txt(s.power?'BONUS: GIANT POWER!':'NO GIANT BONUS THIS SPIN',320,347,1,s.power?'#b6da67':'#baa6b8','center');
   txt(s.power?'YOUR PICKS INCLUDED '+api.names[s.lucky]:'ONE HIDDEN FACE HAD THE POWER',320,365,1,'#f4e4bd','center');
  }
  txt(s.phase==='result'?'E / ENTER / SPACE: CONTINUE':s.phase==='loaded'?'CLICK A LOADED FACE TO CHANGE IT':'REELS STOP ONE BY ONE',320,389,1,'#f4e4bd','center');
 }
 function pointer(s,x,y){
  if(s.phase==='pick'){const col=Math.floor((x-24)/144),row=Math.floor((y-105)/89);if(col>=0&&col<3&&row>=0&&row<3&&x<24+col*144+135&&y<105+row*89+81)return api.toggle(s,row*3+col);}
  else if(s.phase==='loaded'){if(y>=101&&y<=150&&x>=199&&x<199+3*72)return api.edit(s,Math.floor((x-199)/72));if((x>=531&&x<=583&&y>=178&&y<=303)||(x>=106&&x<=526&&y>=321&&y<=371))return api.spin(s);}
  return false;
 }
 api.draw=draw;api.pointer=pointer;
})();
