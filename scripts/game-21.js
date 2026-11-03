/* Circus Genetic v6: scrolling comic, cartridge score book, and chapter films. */
(() => {
  'use strict';
  const W=640,H=420,STORE='circus-genetic-highscores-v6';
  const C={ink:'#10121d',black:'#06070c',cream:'#f1dfb8',orange:'#ed8a39',pink:'#dd6c99',green:'#b5d76a',blue:'#64bfc9',purple:'#8e76b7',paper:'#e9d5a2'};
  const ALPHABET='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const hasDOM=typeof document!=='undefined';
  const root=typeof window!=='undefined'?window:globalThis;
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const smooth=p=>{p=clamp(p,0,1);return p*p*(3-2*p);};
  const cleanInitials=s=>String(s??'AAA').toUpperCase().replace(/[^A-Z0-9]/g,'').padEnd(3,'A').slice(0,3);
  function normalizeRows(value){return (Array.isArray(value)?value:[]).filter(r=>r&&Number.isFinite(Number(r.score))&&Number(r.score)>=0).map((r,i)=>({initials:cleanInitials(r.initials),score:Math.min(99999999,Math.floor(Number(r.score))),at:Number.isFinite(Number(r.at))?Number(r.at):i})).sort((a,b)=>b.score-a.score||a.at-b.at).slice(0,10);}
  function insertScore(rows,score,initials,at=Date.now()){return normalizeRows([...normalizeRows(rows),{initials:cleanInitials(initials),score:Math.max(0,Math.min(99999999,Math.floor(Number(score)||0))),at}]);}
  let memoryRows=[];
  function getScores(){try{if(!root.localStorage)return memoryRows.slice();const raw=root.localStorage.getItem(STORE);return raw?normalizeRows(JSON.parse(raw)):memoryRows.slice();}catch(_){return memoryRows.slice();}}
  function saveScore(score,initials){memoryRows=insertScore(getScores(),score,initials);try{root.localStorage?.setItem(STORE,JSON.stringify(memoryRows));}catch(_){}return memoryRows.slice();}
  const comic=[
    {title:'TWO HOUSES. ONE DRIVEWAY.',text:'The band met at a rent house sharing a driveway with another rented house. The neighbors were a hipster band called Vagabond Swing. Brice, Matt and Tony had a band of their own to start.'},
    {title:'CIRCUS GENETIC IS BORN',text:'Circus Genetic practiced in a brick-lined mid-century room with terrazzo floors. Matt on bass. Brice on guitar and vocals. Tony behind the drums. Turn it up and start again.'},
    {title:'GREYMATTER / THREE SONGS',text:'Their first three-song EP was recorded with Joe Wayne the Studio Cowboy, who lived in the storage closet. His room held a reel-to-reel, a small Neve console, guitars on the walls and cords everywhere.'},
    {title:'TAKE THE NOISE ON THE ROAD',text:'The band played venues all over Lafayette, Louisiana, then carried the songs onward to Baton Rouge and New Orleans. Three friends, a van, and another room to play.'},
    {title:'13 SONGS. 3 DAYS.',text:'Melting in the Desert was recorded in three days with J-Ro and Paul: sound-engineer roommates whose house was dedicated to recording music. Gear everywhere. Thirteen songs on the full-length album.'},
    {title:'ON THE RADIO',text:'Circus Genetic got on the radio. Then Brice, Matt and Tony lived happily ever after. SUPPOSEDLY.'}
  ];
  const images={};
  function load(name,file){if(!hasDOM)return;const im=new Image();im.src='assets/'+file;images[name]=im;}
  load('comic','story-comic-v6.webp');load('house','edwin-night-v6.webp');load('room','boss-living-room.webp');load('stage','artmosphere-interior-v6.webp');load('faces','roulette-faces-v5.png');load('oldBand','band-motion-clean.webp');load('arena','boss-arena.webp');
  const loaded=im=>!!(im&&im.complete&&im.naturalWidth);
  const box=(g,x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
  function text(g,label,x,y,size=1,color=C.cream,align='left'){
    label=String(label).toUpperCase();if(align==='center')x-=(label.length*6-1)*size/2;if(align==='right')x-=(label.length*6-1)*size;
    for(const ch of label){const rows=(root.CG_FONT?.[ch]||'00000/00000/00000/00000/00000/00000/00000').split('/');rows.forEach((r,yy)=>[...r].forEach((on,xx)=>{if(on==='1')box(g,x+xx*size,y+yy*size,size,size,color);}));x+=size*6;}
  }
  function wrap(g,label,x,y,width,size=1,color=C.ink){const limit=Math.max(8,Math.floor(width/(6*size))),words=String(label).toUpperCase().split(/\s+/);let line='',row=0;for(const word of words){if(line&&line.length+word.length+1>limit){text(g,line,x,y+row*11*size,size,color);line=word;row++;}else line+=(line?' ':'')+word;}if(line)text(g,line,x,y+row*11*size,size,color);return (row+1)*11*size;}
  function stroke(g,points,color,width=3){g.strokeStyle=color;g.lineWidth=width;g.lineCap='square';g.lineJoin='miter';g.beginPath();points.forEach(([x,y],i)=>i?g.lineTo(Math.round(x),Math.round(y)):g.moveTo(Math.round(x),Math.round(y)));g.stroke();}
  function spark(g,x,y,r,color=C.cream){box(g,x-r,y,2*r+2,2,color);box(g,x,y-r,2,2*r+2,color);box(g,x-1,y-1,4,4,color);}
  function face(g,id,x,y,size){if(loaded(images.faces)){const w=images.faces.naturalWidth/3,h=images.faces.naturalHeight/3;g.drawImage(images.faces,(id%3)*w,Math.floor(id/3)*h,w,h,Math.round(x),Math.round(y),size,size);}else box(g,x,y,size,size,['#c3886a','#d6a77b','#865e4e'][id%3]);}
  function drawBand(g,who,x,y,state,t,scale=1,scene='party',legacy,direction=1){
    if(root.CGV6Band?.draw){root.CGV6Band.draw(g,{who,x,y,state,face:direction,t,age:(t%.4),scale,scene,groundY:y,jump:0,speed:0,distance:t*30});return;}
    if(legacy){legacy(who,x,y,state,direction,0,scale);return;}
    if(loaded(images.oldBand)){const im=images.oldBand,sw=im.naturalWidth/8,sh=im.naturalHeight/3,col=state==='victory'?6+Math.floor(t*5)%2:Math.floor(t*4)%4;g.drawImage(im,col*sw,who*sh,sw,sh,x-56*scale,y-105*scale,112*scale,105*scale);return;}
    partyPerson(g,who,x,y,t,scale,false);
  }
  function partyPerson(g,id,x,y,t,scale=1,raise=false){
    const h=90*scale,head=18*scale,skin=['#e0a77a','#b87f5b','#8b5e49','#efbf8c'][id%4],shirt=['#81477a','#4f6276','#6e673f','#9d4c48','#397879'][id%5];
    const bounce=Math.max(0,Math.sin(t*3+id))*2*scale,yy=y-bounce;
    box(g,x-10*scale,yy-h+head,20*scale,h-head-21*scale,shirt);box(g,x-8*scale,yy-24*scale,6*scale,24*scale,'#242638');box(g,x+2*scale,yy-24*scale,6*scale,24*scale,'#242638');box(g,x-10*scale,y-3*scale,10*scale,3*scale,'#e8ddc0');box(g,x+1*scale,y-3*scale,11*scale,3*scale,'#e8ddc0');
    box(g,x-head/2,yy-h,head,head,skin);box(g,x-head/2-2*scale,yy-h-3*scale,head+4*scale,7*scale,['#2a1c20','#69472b','#b1854e'][id%3]);box(g,x+2*scale,yy-h+8*scale,2*scale,2*scale,C.black);
    if(id%3===0&&loaded(images.faces)){g.save();g.beginPath();g.rect(x-head/2,yy-h,head,head);g.clip();face(g,id%9,x-head/2,yy-h,head);g.restore();}
    const armY=raise?yy-h-8*scale:yy-h+29*scale,handX=x+(raise?-18:19)*scale;
    stroke(g,[[x-8*scale,yy-h+24*scale],[x-17*scale,yy-h+18*scale],[x-18*scale,armY]],skin,5*scale);
    stroke(g,[[x+9*scale,yy-h+24*scale],[x+17*scale,yy-h+34*scale],[handX,raise?yy-h-7*scale:yy-h+23*scale]],skin,5*scale);
    if(!raise){box(g,handX-2*scale,yy-h+14*scale,7*scale,11*scale,'#e5bb61');box(g,handX-2*scale,yy-h+13*scale,7*scale,2*scale,C.cream);}
    if(id%4===1&&!raise){const q=(t*.2+id*.13)%1;box(g,x+19*scale+Math.sin(q*7)*4,yy-h+10*scale-q*25*scale,2*scale,4*scale,'#a9a4ac55');}
  }
  function floorScene(g,t){
    if(!images.scoreFloor)load('scoreFloor','high-score-floor-v6.webp');
    if(loaded(images.scoreFloor)){
      g.imageSmoothingEnabled=false;g.drawImage(images.scoreFloor,0,0,640,480);
      // Independent pedal indicators sit on the illustrated bulbs.
      for(const [x,y,phase] of [[56,315,0],[72,416,1],[539,416,2]]){
        const on=Math.floor(t*3+phase)%3!==0;
        box(g,x-1,y-1,3,3,on?'#ff401d':'#732b29');
        if(on&&Math.floor(t*6+phase)%7===0)spark(g,x,y,2,'#ffb55a');
      }
      if(Math.floor(t*2)%8===0)spark(g,594,206,2,'#f4df9d');
      return;
    }
    box(g,0,0,640,480,'#4f3a36');
    for(let row=0;row<10;row++){const y=row*48;box(g,0,y,640,3,'#261d22');for(let col=0;col<8;col++){const x=col*94+(row%2)*41;box(g,x,y+3,2,43,'#2f242a');box(g,x+9,y+15,55+(col%3)*7,2,'#80604b');box(g,x+20,y+32,34,1,'#32252a');}}
    // Cropped bottom of the rehearsal amp, guitar in its stand, pedals and cords.
    box(g,0,0,175,110,'#161923');box(g,7,0,158,100,'#45403f');for(let y=7;y<94;y+=6)for(let x=13;x<158;x+=6)box(g,x,y,3,3,'#1a1c26');box(g,0,103,176,11,'#b19364');box(g,16,114,19,8,C.black);box(g,135,114,19,8,C.black);
    stroke(g,[[30,116],[53,143],[24,167],[34,198],[104,214],[115,318],[73,350]],C.black,6);stroke(g,[[602,170],[576,220],[603,260],[558,315],[587,376],[520,425]],C.black,5);
    const pedals=[[19,265,41,66,'#7b4b91'],[80,353,48,61,'#3c767b'],[545,332,43,61,'#b6653b'],[588,402,39,54,'#8d7139']];
    for(const [x,y,w,h,c] of pedals){box(g,x+3,y+4,w,h,'#191a23');box(g,x,y,w,h,c);box(g,x+6,y+26,w-12,h-33,'#242632');box(g,x+9,y+8,6,6,C.black);box(g,x+w-15,y+8,6,6,C.black);box(g,x+w/2-2,y+20,4,3,Math.floor(t*3+x)%2?'#ff9460':'#7d3538');}
    stroke(g,[[590,-20],[589,131],[554,213],[600,213],[621,264]],'#141722',7);box(g,576,-30,15,135,'#bf9459');box(g,581,-30,3,130,'#ede0ae');
    g.save();g.translate(586,142);g.rotate(-.15);box(g,-14,-22,30,45,'#e09a47');box(g,-23,8,49,45,'#d66c38');box(g,-17,22,36,34,'#edb85b');box(g,-5,-7,12,55,C.black);box(g,-3,3,8,38,C.cream);g.restore();
    for(const [x,y,c] of [[57,225,'#ae4644'],[514,288,'#667a96'],[111,442,'#bc8a47'],[518,128,'#458b6d']]){g.save();g.translate(x,y);g.rotate(.18);box(g,-6,-17,13,29,c);box(g,-6,-20,13,4,'#d9d2b9');box(g,-4,-18,8,2,C.black);g.restore();}
    for(const [x,y] of [[21,416],[598,280]]){box(g,x,y-31,10,29,'#4a6e54');box(g,x+2,y-40,6,12,'#4a6e54');box(g,x+2,y-20,6,9,'#c6b87b');}
  }
  let overlay=null,sections={},lastFrame=0;
  function showScreen(id){if(typeof root.show==='function')root.show(id);else{document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('active',s.id===id));}document.body.classList.remove('playing','finale');}
  function backToTitle(){overlay=null;if(typeof root.title==='function')root.title();else if(typeof root.show==='function')root.show('title');}
  function openHighScores(){if(!hasDOM)return false;overlay={type:'scores',phase:'board',t:0,rows:getScores(),initials:['A','A','A'],cursor:0,score:0,onDone:null,saved:false};showScreen('v6Scores');return true;}
  function submitScore(score,onDone){if(!hasDOM){saveScore(score,'AAA');onDone?.();return false;}overlay={type:'scores',phase:'entry',t:0,rows:getScores(),initials:['A','A','A'],cursor:0,score:Math.max(0,Math.min(99999999,Math.floor(Number(score)||0))),onDone,saved:false};showScreen('v6Scores');return true;}
  function closeOverlay(){const cb=overlay?.onDone;overlay=null;if(cb)cb();else backToTitle();}
  function openStory(){if(!hasDOM)return false;overlay={type:'story',t:0,scroll:0,target:0,auto:true};showScreen('v6Story');return true;}
  function scoreKey(key){if(!overlay||overlay.type!=='scores')return false;const s=overlay;
    if(key==='escape'){closeOverlay();return true;}
    if(s.phase==='board'){if(['enter',' ','e'].includes(key))closeOverlay();return true;}
    if(key==='arrowleft')s.cursor=(s.cursor+2)%3;else if(key==='arrowright')s.cursor=(s.cursor+1)%3;
    else if(['arrowup','arrowdown'].includes(key)){const n=ALPHABET.indexOf(s.initials[s.cursor]);s.initials[s.cursor]=ALPHABET[(n+(key==='arrowup'?1:ALPHABET.length-1))%ALPHABET.length];}
    else if(key==='backspace'){s.cursor=Math.max(0,s.cursor-1);s.initials[s.cursor]='A';}
    else if(key==='enter'||key===' '){if(!s.saved){s.rows=saveScore(s.score,s.initials.join(''));s.saved=true;s.phase='board';}}
    else if(/^[a-z0-9]$/.test(key)){s.initials[s.cursor]=key.toUpperCase();s.cursor=Math.min(2,s.cursor+1);}
    try{if(typeof sfx==='function')sfx(s.phase==='board'?1100:640+s.cursor*70);}catch(_){}
    return true;
  }
  function drawScores(g,s){floorScene(g,s.t);g.save();g.translate(320,240);g.rotate(-.018);g.translate(-320,-240);
    box(g,143,27,356,421,'#17141b');box(g,137,21,356,421,C.paper);box(g,139,23,352,3,'#fff0c9');box(g,137,426,356,16,'#d1b782');for(let i=0;i<8;i++)box(g,143+i*45,438,17,5,'#4f3a36');
    for(let i=0;i<10;i++){box(g,150,137+i*26,329,1,'#8098a077');box(g,174,112+i*26,1,26,'#c9746755');}
    text(g,'CIRCUS GENETIC',315,40,2,C.ink,'center');text(g,'LOCAL HEROES / TOP 10',315,62,1,'#8c513b','center');box(g,155,78,322,2,'#9c6e4f');
    if(s.phase==='entry'){
      text(g,'HIGH SCORE!',315,95,3,'#8d3b46','center');text(g,String(s.score).padStart(8,'0'),315,130,2,C.ink,'center');text(g,'LEAVE YOUR MARK',315,171,1,'#7f4a37','center');
      for(let i=0;i<3;i++){const x=239+i*56;box(g,x-5,198,45,60,'#d4bd89');text(g,s.initials[i],x+17,207,5,C.ink,'center');if(i===s.cursor&&Math.floor(s.t*3)%2===0)box(g,x,249,34,4,'#a44843');}
      wrap(g,'UP/DOWN: CHANGE LETTER   LEFT/RIGHT: MOVE   OR TYPE YOUR INITIALS',166,292,300,1,C.ink);text(g,'ENTER: SIGN THE SETLIST',315,341,1,'#8d3b46','center');text(g,'ESC: SKIP ENTRY',315,367,1,'#776049','center');
    }else{
      for(let i=0;i<10;i++){const row=s.rows[i],y=111+i*26;const color=row&&row.score===s.score&&s.saved?'#9e3f49':C.ink;text(g,String(i+1).padStart(2,'0'),160,y,1,'#8f6748');text(g,row?row.initials:'---',203,y,2,color);text(g,row?String(row.score).padStart(8,'0'):'--------',464,y,1,color,'right');}
      text(g,'ENTER / ESC: BACK TO THE BAND',315,406,1,'#77523e','center');
    }
    g.restore();if(Math.floor(s.t*2)%5===0)spark(g,509,52,3,C.orange);
  }
  const panelArtH=198,panelH=302,storyEnd=comic.length*panelH-365;
  function drawStory(g,s){box(g,0,0,640,480,'#13111c');g.save();g.beginPath();g.rect(15,51,610,385);g.clip();
    for(let i=0;i<comic.length;i++){const y=60+i*panelH-s.scroll;if(y>440||y+panelH<48)continue;box(g,24,y,592,panelH-12,C.black);box(g,27,y+3,586,panelArtH,C.cream);
      if(loaded(images.comic)){const sw=images.comic.naturalWidth/2,sh=images.comic.naturalHeight/3;g.drawImage(images.comic,(i%2)*sw,Math.floor(i/2)*sh,sw,sh,30,y+6,580,panelArtH-6);}else{box(g,30,y+6,580,panelArtH-6,'#4d3a45');text(g,comic[i].title,320,y+80,2,C.cream,'center');}
      box(g,27,y+panelArtH,586,89,C.paper);text(g,comic[i].title,40,y+panelArtH+10,1,'#924c36');wrap(g,comic[i].text,40,y+panelArtH+28,558,1,C.ink);text(g,'0'+(i+1),594,y+panelArtH+73,1,'#9d6c48','right');
    }
    g.restore();box(g,0,0,640,49,C.ink);text(g,'THE STORY OF CIRCUS GENETIC',320,13,2,C.cream,'center');text(g,'A SCROLLING 8-BIT COMIC',320,35,1,C.orange,'center');box(g,0,438,640,42,C.ink);text(g,'ARROWS / WHEEL: SCROLL   SPACE: '+(s.auto?'PAUSE':'AUTO'),320,446,1,C.cream,'center');text(g,'ENTER / ESC: TITLE',320,463,1,C.green,'center');const pct=clamp(s.scroll/storyEnd,0,1);box(g,629,58,3,368,'#443948');box(g,629,58+pct*326,3,42,C.orange);}
  function initMenus(){
    if(!hasDOM||!document.getElementById('cabinet'))return;
    const css=document.createElement('style');css.textContent='#v6Scores,#v6Story{background:#11111a;overflow:hidden}#v6Scores canvas,#v6Story canvas{position:absolute;inset:0;width:100%;height:100%;image-rendering:pixelated;touch-action:none}#v6ScoreButton{color:#e8c37d}.v6MenuBack{position:absolute;right:9px;top:8px;z-index:4;font-size:8px!important;border:2px solid #e8c37d;background:#11121b;padding:6px;color:#f1dfb8}';document.head.appendChild(css);
    for(const [id,label]of [['v6Scores','Arcade high scores on a ruled setlist'],['v6Story','Scrolling comic: the story of Circus Genetic']]){if(document.getElementById(id))continue;const section=document.createElement('section');section.id=id;section.className='screen';const canvas=document.createElement('canvas');canvas.width=640;canvas.height=480;canvas.setAttribute('aria-label',label);section.appendChild(canvas);const back=document.createElement('button');back.className='v6MenuBack';back.textContent='BACK';back.setAttribute('aria-label','Back to title');back.onclick=closeOverlay;section.appendChild(back);document.getElementById('cabinet').appendChild(section);sections[id]=canvas;}
    const menu=document.querySelector('.titlemenu');if(menu&&!document.getElementById('v6ScoreButton')){const b=document.createElement('button');b.id='v6ScoreButton';b.textContent='HIGH SCORES';b.className='secondary';b.onclick=openHighScores;menu.appendChild(b);}
    const story=document.getElementById('story');if(story)story.onclick=openStory;
    document.addEventListener('keydown',e=>{if(!overlay)return;const key=e.key.toLowerCase();if(['shift','control','alt','meta'].includes(key)||e.ctrlKey||e.metaKey)return;e.preventDefault();e.stopImmediatePropagation();if(e.repeat&&['enter',' '].includes(key))return;if(overlay.type==='scores'){scoreKey(key);return;}if(['escape','enter'].includes(key)){closeOverlay();return;}if(key===' '){overlay.auto=!overlay.auto;return;}if(['arrowdown','s','pagedown'].includes(key)){overlay.target=clamp(overlay.target+65,0,storyEnd);overlay.auto=false;}if(['arrowup','w','pageup'].includes(key)){overlay.target=clamp(overlay.target-65,0,storyEnd);overlay.auto=false;}if(key==='home')overlay.target=0;if(key==='end')overlay.target=storyEnd;},true);
    const canvas=sections.v6Story;let touchY=null;canvas?.addEventListener('wheel',e=>{if(overlay?.type!=='story')return;e.preventDefault();overlay.auto=false;overlay.target=clamp(overlay.target+e.deltaY*.7,0,storyEnd);},{passive:false});canvas?.addEventListener('pointerdown',e=>{touchY=e.clientY;canvas.setPointerCapture?.(e.pointerId);});canvas?.addEventListener('pointermove',e=>{if(touchY===null||overlay?.type!=='story')return;overlay.auto=false;overlay.target=clamp(overlay.target+(touchY-e.clientY)*480/canvas.getBoundingClientRect().height,0,storyEnd);touchY=e.clientY;});for(const event of ['pointerup','pointercancel'])canvas?.addEventListener(event,()=>touchY=null);
    sections.v6Scores?.addEventListener('pointerdown',e=>{if(overlay?.type!=='scores')return;const r=sections.v6Scores.getBoundingClientRect(),x=(e.clientX-r.left)*640/r.width,y=(e.clientY-r.top)*480/r.height;if(overlay.phase==='board'){if(y>380)closeOverlay();return;}if(y>=195&&y<=260){overlay.cursor=clamp(Math.floor((x-234)/56),0,2);scoreKey('arrowup');}else if(y>325&&y<365)scoreKey('enter');});
    function tick(ms){const dt=Math.min(.06,Math.max(0,(ms-lastFrame)/1000)||.016);lastFrame=ms;if(overlay){overlay.t+=dt;if(overlay.type==='story'){if(overlay.auto)overlay.target=clamp(overlay.target+22*dt,0,storyEnd);overlay.scroll+=(overlay.target-overlay.scroll)*(1-Math.exp(-dt*12));const g=sections.v6Story?.getContext('2d');if(g){g.imageSmoothingEnabled=false;drawStory(g,overlay);}}else{const g=sections.v6Scores?.getContext('2d');if(g){g.imageSmoothingEnabled=false;drawScores(g,overlay);}}}requestAnimationFrame(tick);}requestAnimationFrame(tick);
  }
  function speak(line,{pitch=.8,rate=.96,volume=.62}={}){
    try{
      if(root.CGMusic?.inspect?.()?.muted||(typeof muted!=='undefined'&&muted))return false;
      if(root.speechSynthesis&&root.SpeechSynthesisUtterance){const u=new root.SpeechSynthesisUtterance(String(line));u.rate=rate;u.pitch=pitch;u.volume=volume;root.speechSynthesis.speak(u);return true;}
      // A quiet cartridge-call rhythm accompanies the exact on-screen words if
      // a browser has no local speech voice. It never replaces the music route.
      if(typeof sfx==='function')for(const [i,hz]of [330,440,330,660].entries())setTimeout(()=>{try{sfx(hz);}catch(_){}},i*110);
    }catch(_){}return false;
  }
  function say(state,token,line,pitch=.8){if(state.said[token])return;state.said[token]=true;state.spoke=speak(line,{pitch})||state.spoke;}
  function snapshot(){if(!hasDOM)return null;try{const c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d'),b=document.getElementById('worldCanvas'),f=document.getElementById('actionCanvas');if(b)x.drawImage(b,0,0,W,H);if(f)x.drawImage(f,0,0,W,H);return c;}catch(_){return null;}}
  function createCutscene(kind,onDone){return{kind:kind==='preboss'?'preboss':'afterparty',t:0,duration:kind==='preboss'?11.2:13.2,done:false,called:false,onDone,said:{},capture:snapshot(),spoke:false};}
  function update(s,dt){if(!s||s.done||!Number.isFinite(dt)||dt<=0)return;s.t=Math.min(s.duration,s.t+dt);if(s.kind==='afterparty'){for(const [at,key]of [[1.8,'chant1'],[3.1,'chant2'],[4.4,'chant3']])if(s.t>=at)say(s,key,'After Party! After Party!',.65);}else if(s.t>=1.7)say(s,'tomorrow',"We're gonna win that shit tomorrow night!",.86);if(s.t>=s.duration){s.done=true;if(!s.called){s.called=true;s.onDone?.();}}}
  function key(s,key){if(!s||s.done)return;key=String(key).toLowerCase();if(s.t>.5&&['enter','e',' ','escape'].includes(key)){s.t=s.duration;s.done=true;if(s.spoke){try{root.speechSynthesis?.cancel();}catch(_){}}if(!s.called){s.called=true;s.onDone?.();}}}
  function fade(g,alpha,color=C.black){if(alpha<=0)return;g.save();g.globalAlpha=clamp(alpha,0,1);box(g,0,0,W,H,color);g.restore();}
  function crowd(g,t,front=false){const rows=front?2:3;for(let row=0;row<rows;row++)for(let i=0;i<16;i++){const id=row*16+i,x=i*43+(row%2)*17-14,y=(front?326:228)+row*(front?85:44);partyPerson(g,id,x,y,t,.75+row*.18,true);}}
  function drawAfterparty(s,{g,bg,bandSprite}){
    const t=s.t;bg.clearRect(0,0,W,H);box(bg,0,0,W,H,'#15121d');
    if(t<6.4){if(loaded(images.stage))bg.drawImage(images.stage,0,0,images.stage.naturalWidth*.47,images.stage.naturalHeight,0,0,W,H);crowd(g,t,false);
      for(let i=0;i<3;i++){g.save();g.translate(231+i*157,173+Math.sin(t*4+i)*3);g.rotate(-Math.PI/2+Math.sin(t*2+i)*.045);drawBand(g,i,0,0,'victory',t,.98,'stage',bandSprite);g.restore();}
      crowd(g,t,true);const a=Math.floor(t*2)%2;text(g,'AFTER PARTY!',a?180:457,72,3,a?C.pink:C.green,'center');text(g,'AFTER PARTY!',a?464:176,113,2,C.cream,'center');
      if(t<.55){if(s.capture)g.drawImage(s.capture,0,0,W,H);fade(g,t/.55);}else fade(g,1-clamp((t-.55)/.5,0,1));if(t>5.8)fade(g,(t-5.8)/.6);
    }else{
      if(loaded(images.house))bg.drawImage(images.house,0,0,W,H);else{box(bg,65,120,510,170,'#52505b');box(bg,268,181,75,112,'#c6b581');box(bg,0,290,W,130,'#283c36');}
      for(let i=0;i<24;i++){const x=28+(i*67)%590,y=278+Math.floor(i/8)*49;if(Math.abs(x-320)<38&&i%2)continue;partyPerson(g,i,x,y,t,.53+Math.floor(i/8)*.18,i%4===0);}
      for(let i=0;i<3;i++)drawBand(g,i,222+i*75,350,'idle',t,.79,'party',bandSprite);
      text(g,'LATER THAT NIGHT / EDWIN',320,22,2,C.cream,'center');text(g,'THE AFTER PARTY IS ALREADY LOUD.',320,48,1,C.orange,'center');fade(g,1-clamp((t-6.4)/.7,0,1));if(t>12.5)fade(g,(t-12.5)/.7);
    }
  }
  const crt={x:221.36,y:104.35,w:191.49,h:114.99};
  function tvAd(g,t){g.save();g.beginPath();g.rect(crt.x,crt.y,crt.w,crt.h);g.clip();if(loaded(images.arena))g.drawImage(images.arena,crt.x,crt.y,crt.w,crt.h);else box(g,crt.x,crt.y,crt.w,crt.h,'#383047');box(g,crt.x+5,crt.y+6,crt.w-10,crt.h-12,'#11131cd9');text(g,'BATTLE OF',crt.x+crt.w/2,crt.y+24,2,C.orange,'center');text(g,'THE BANDS',crt.x+crt.w/2,crt.y+43,2,C.pink,'center');text(g,'TOMORROW NIGHT',crt.x+crt.w/2,crt.y+76,1,C.cream,'center');for(let i=0;i<12;i++)box(g,crt.x+5+i*15,crt.y+100,5,3,Math.floor(t*5+i)%3?C.green:C.orange);g.restore();}
  function drawPreboss(s,{g,bg,bandSprite}){
    const t=s.t,zoom=smooth((t-4.5)/3.4),k=Math.floor(zoom*256)/256;bg.clearRect(0,0,W,H);box(bg,0,0,W,H,C.black);
    if(t<8.4){const viewW=W+(crt.w-W)*k,viewH=H+(crt.h-H)*k,xx=crt.x*k,yy=crt.y*k;g.save();g.scale(W/viewW,H/viewH);g.translate(-xx,-yy);
      if(loaded(images.room))g.drawImage(images.room,0,0,W,H);else{box(g,0,0,W,300,'#45303a');box(g,0,300,W,120,'#6b4b3d');}
      tvAd(g,t);
      for(const [i,x,y]of [[0,153,365],[1,310,383],[2,473,365]]){
        drawBand(g,i,x,y,'point',t,1.10,'party',bandSprite,x<320?1:-1);
      }
      for(const [i,x,y]of [[2,80,357],[5,391,370],[8,554,361]])partyPerson(g,i,x,y,t,1.12,false);
      g.restore();
      if(t>1.0&&t<4.55){box(g,53,20,534,48,'#11131cef');text(g,"WE'RE GONNA WIN THAT SHIT",320,30,2,C.cream,'center');text(g,'TOMORROW NIGHT!',320,49,1,C.green,'center');}
      if(t<.65)fade(g,1-t/.65);if(t>7.9)fade(g,(t-7.9)/.5,C.cream);
    }else{
      box(g,0,0,W,H,'#0d0d15');const pulse=Math.floor(t*4)%2===0;for(let i=0;i<22;i++){const x=(i*79)%640,y=(i*47)%420;stroke(g,[[x,y],[x+15,y+9],[x+3,y+25],[x+24,y+38]],i%2?'#6f325a':'#4e466d',3);}
      for(const x of [32,524]){box(g,x,238,84,150,'#302c3b');box(g,x+6,244,72,138,C.black);for(const y of [273,339]){box(g,x+18,y-20,48,44,'#524853');box(g,x+29,y-9,26,22,'#171621');}}
      text(g,'BATTLE OF',323,96,5,'#53212c','center');text(g,'THE BANDS',323,155,5,'#53212c','center');text(g,'BATTLE OF',320,92,5,pulse?'#ef393c':'#f27c48','center');text(g,'THE BANDS',320,151,5,pulse?'#ef393c':'#f27c48','center');text(g,'ONE TOWN. ALL THE BANDS.',320,226,1,C.cream,'center');text(g,'MAKE TOMORROW REGRET ITS PLANS.',320,251,1,C.orange,'center');
      for(let i=0;i<12;i++){const x=105+i*39,y=318+Math.sin(t*5+i)*10;spark(g,x,y,2,i%2?C.pink:C.green);}if(t>10.6)fade(g,(t-10.6)/.6);
    }
  }
  function draw(s,ctx){if(!s||!ctx?.g||!ctx?.bg)return;ctx.g.imageSmoothingEnabled=ctx.bg.imageSmoothingEnabled=false;if(s.kind==='preboss')drawPreboss(s,ctx);else drawAfterparty(s,ctx);}
  const api={openHighScores,submitScore,openStory,isActive:()=>!!overlay,close:closeOverlay,createCutscene,update,key,draw,speak,getScores,saveScore,normalizeRows,insertScore,cleanInitials,comic,storyEnd};
  root.CGV6Narrative=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
  if(hasDOM){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initMenus,{once:true});else initMenus();}
})();
