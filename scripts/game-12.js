(()=>{
'use strict';
const $=id=>document.getElementById(id),canvas=$('actionCanvas'),g=canvas.getContext('2d'),bgCanvas=$('worldCanvas'),bg=bgCanvas.getContext('2d');g.imageSmoothingEnabled=false;bg.imageSmoothingEnabled=false;
const Physics=window.CGPartyPhysics;
const W=640,H=420,keys=new Set(),names=['MATT','BRICE','TONY'],roles=['BASS','GUITAR + VOCALS','DRUMS'];
const noteNames=[['E','A','D','G'],['C','G','AM','F'],['KICK','SNARE','HAT','CRASH']],patterns=[[0,1,2,3,0,0,1,2,3,2,1,0],[0,3,0,3,1,2,1,2],[0,0,3,1,2,3,1,2,0,3,2,1],[0,1,2,3,3,2,1,0,0,3,1,2,0,1,3,2]];
const atlas={};for(const [key,file] of Object.entries({band:'band-motion-clean.png',npc:'party-npcs.png',props:'game-props.png',panorama:'world-panorama.png',rooms:'scenes.png',oldBand:'band-sprites.png',oldNpc:'npcs.png',walk:'band-walk-clean.png',seated:'tony-seated.png'})){const im=new Image();im.src=window.CG_ASSETS?.['assets/'+file]||'assets/'+file;atlas[key]=im}
let ambientClock=0;let active=false,mode='idle',scene='practice',clock=0,last=0,selected=0,score=0,zone=0,cam=0,health=100,gear=100,pause=false,player={x:100,y:330,face:1},enemies=[],beers=[],particles=[],attack=null,hop=0,hopV=0,invul=0,rhythm=null,mix=[90,8,90],mixIndex=0,rescue=null,social=null,party=null,transition=null,toast='',toastUntil=0,celebrateUntil=0,bestCombo=0,ratings=[];
let runQuality=null,bonus=null,bonusReturn=null;
let battle=null,bossCinema=null,bossResult=null;
let sectionKey=null;
let kickUntil=0;
let giantPower=false,giantSince=0,powerEncore=false,groupieLucky=null,groupiePicked=false,groupieChoice=null;
const C={cream:'#f4e4bd',green:'#b6da67',pink:'#e95a9d',cyan:'#46c4ca',red:'#e66a45',ink:'#111621'};
const FONT={A:'01110/10001/10001/11111/10001/10001/10001',B:'11110/10001/10001/11110/10001/10001/11110',C:'01111/10000/10000/10000/10000/10000/01111',D:'11110/10001/10001/10001/10001/10001/11110',E:'11111/10000/10000/11110/10000/10000/11111',F:'11111/10000/10000/11110/10000/10000/10000',G:'01111/10000/10000/10111/10001/10001/01111',H:'10001/10001/10001/11111/10001/10001/10001',I:'11111/00100/00100/00100/00100/00100/11111',J:'00111/00010/00010/00010/10010/10010/01100',K:'10001/10010/10100/11000/10100/10010/10001',L:'10000/10000/10000/10000/10000/10000/11111',M:'10001/11011/10101/10101/10001/10001/10001',N:'10001/11001/10101/10011/10001/10001/10001',O:'01110/10001/10001/10001/10001/10001/01110',P:'11110/10001/10001/11110/10000/10000/10000',Q:'01110/10001/10001/10001/10101/10010/01101',R:'11110/10001/10001/11110/10100/10010/10001',S:'01111/10000/10000/01110/00001/00001/11110',T:'11111/00100/00100/00100/00100/00100/00100',U:'10001/10001/10001/10001/10001/10001/01110',V:'10001/10001/10001/10001/10001/01010/00100',W:'10001/10001/10001/10101/10101/10101/01010',X:'10001/10001/01010/00100/01010/10001/10001',Y:'10001/10001/01010/00100/00100/00100/00100',Z:'11111/00001/00010/00100/01000/10000/11111',0:'01110/10001/10011/10101/11001/10001/01110',1:'00100/01100/00100/00100/00100/00100/01110',2:'01110/10001/00001/00010/00100/01000/11111',3:'11110/00001/00001/01110/00001/00001/11110',4:'00010/00110/01010/10010/11111/00010/00010',5:'11111/10000/10000/11110/00001/00001/11110',6:'01110/10000/10000/11110/10001/10001/01110',7:'11111/00001/00010/00100/01000/01000/01000',8:'01110/10001/10001/01110/10001/10001/01110',9:'01110/10001/10001/01111/00001/00001/01110',':':'00000/00100/00100/00000/00100/00100/00000','.':'00000/00000/00000/00000/00000/00110/00110','/':'00001/00010/00010/00100/01000/01000/10000','-':'00000/00000/00000/11111/00000/00000/00000','+':'00000/00100/00100/11111/00100/00100/00000','!':'00100/00100/00100/00100/00100/00000/00100','?':'01110/10001/00001/00010/00100/00000/00100','%':'11001/11010/00010/00100/01000/01011/10011','(':'00010/00100/01000/01000/01000/00100/00010',')':'01000/00100/00010/00010/00010/00100/01000',"'":'00100/00100/00000/00000/00000/00000/00000','*':'00000/10101/01110/11111/01110/10101/00000','=':'00000/11111/00000/11111/00000/00000/00000'};
window.CG_FONT=FONT;
// Cosmetic state has its own deterministic particles and never participates in gameplay or sound.
const ActionFX=window.CGActionFX=Object.freeze({
 create:()=>({time:0,serial:0,items:[],pulse:null,hurt:0,banner:null}),
 update(state,dt){state.time+=dt;state.hurt=Math.max(0,state.hurt-dt);if(state.pulse&&(state.pulse.age+=dt)>.34)state.pulse=null;state.items=state.items.filter(p=>(p.age+=dt)<p.life);for(const p of state.items){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=p.gravity*dt;if((p.kind==='dust'||p.kind==='land')&&p.y>p.floor){p.y=p.floor;p.vy=0;p.vx*=Math.max(0,1-dt*10);}}},
 emit(state,kind,x,y,{color='#f4e4bd',scale=1,world=true,count=8}={}){const serial=state.serial++;if(kind==='impact')state.items.push({kind:'ring',x,y,vx:0,vy:0,gravity:0,age:0,life:.17,size:scale,color,world});for(let i=0;i<count;i++){const angle=(i+.5)*Math.PI*2/count+serial*.71,dust=kind==='dust'||kind==='land',speed=(dust?18:65)+(i%3)*(dust?9:17);state.items.push({kind,x,y,floor:y,vx:Math.round(Math.cos(angle)*speed*scale),vy:dust?-12-(i%4)*7:Math.round(Math.sin(angle)*speed*scale),gravity:dust?95:125,age:0,life:dust?.22+(i%3)*.055:.23+(i%3)*.045,size:scale,color,world});}},
 note(state,dir,success,perfect=false){state.pulse={dir,success,perfect,age:0};},
 shadow(groundY,jump=0,size=1){const lift=Math.min(1,Math.max(0,jump)/55);return{y:Math.round(groundY),width:Math.round(34*size*(1-lift*.36)),height:Math.max(2,Math.round(4*size*(1-lift*.4))),alpha:.45-lift*.18};},
 pose(state,age=0,phase=0,face=1,size=1){return{dx:state==='strike'?Math.round((age<.12?-3:age<.2?5:age<.28?2:0)*face*size):state==='walk'?Math.round(Math.sin(phase*Math.PI/2)*face*size):0,dy:0};},
 draw(state,ctx,camera=0){ctx.save();for(const p of state.items){const x=Math.round(p.x-(p.world?camera:0)),y=Math.round(p.y),fade=1-p.age/p.life;ctx.globalAlpha=Math.max(0,fade);ctx.fillStyle=p.color;if(p.kind==='ring'){const reach=Math.round((5+p.age*90)*p.size),thick=Math.max(2,Math.round(3*p.size));for(const [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1]])ctx.fillRect(Math.round(x+dx*reach-thick/2),Math.round(y+dy*reach-thick/2),thick,thick);ctx.fillRect(x-2*p.size,y-2*p.size,4*p.size,4*p.size);}else{const k=Math.max(1,Math.round(p.size*(p.kind==='dust'||p.kind==='land'?3:2)));ctx.fillRect(x,y,k+(p.kind==='dust'?2:0),k);}}ctx.restore();}
});
let actionFX=ActionFX.create();
function groundShadow(x,y,jump=0,size=1){const sh=ActionFX.shadow(y,jump,size);g.save();g.globalAlpha=sh.alpha;box(x-sh.width/2+3*size,sh.y,sh.width-6*size,sh.height,'#080e16');box(x-sh.width/2,sh.y+Math.max(1,Math.round(size)),sh.width,Math.max(1,sh.height-Math.round(size)),'#080e16');g.restore();}
function actionEdges(){if(actionFX.hurt<=0)return;const length=8+Math.round(actionFX.hurt*80);g.save();g.globalAlpha=Math.min(.65,actionFX.hurt*3);for(const x of [0,W-3]){box(x,29,3,length,C.red);box(x,H-23-length,3,length,C.red);}for(const y of [29,H-25]){box(0,y,length,3,C.red);box(W-length,y,length,3,C.red);}g.restore();}
function transitionAccent(){if(!transition||!actionFX.banner)return;const age=clock-actionFX.banner.start,remaining=transition.end-clock,edge=Math.min(1,Math.max(0,Math.min(age,remaining)/.18));for(let i=0;i<5;i++){const w=Math.round((1-edge)*(44+i*13));if(w){box(0,62+i*5,w,3,i%2?C.pink:C.cyan);box(W-w,370-i*5,w,3,i%2?C.cyan:C.pink);}}}

function box(x,y,w,h,c){g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))}
function txt(s,x,y,size=1,c=C.cream,align='left'){s=String(s).toUpperCase();if(align==='center')x-=s.length*6*size/2;if(align==='right')x-=s.length*6*size;for(const ch of s){const rows=(FONT[ch]||'00000/00000/00000/00000/00000/00000/00000').split('/');rows.forEach((r,yy)=>[...r].forEach((p,xx)=>{if(p==='1')box(x+xx*size,y+yy*size,size,size,c)}));x+=6*size}}
function strip(s,y=35,c=C.green){box(0,y,W,19,'#111621ed');txt(s,320,y+6,1,c,'center')}
function say(s,d=1.2){toast=s;toastUntil=clock+d;$('actionStatus').textContent=s}
function sound(f=300){if(typeof sfx==='function')sfx(f)}
function loaded(im){return im.complete&&im.naturalWidth>0}
function frame(im,cols,rows,col,row,x,y,w,h,face=1,floorTrim=0){if(!loaded(im))return false;g.save();g.translate(Math.round(x),Math.round(y));g.scale(face,1);const sw=im.width/cols,sh=im.height/rows;g.drawImage(im,col*sw,row*sh,sw,sh,-w/2,-h+floorTrim,w,h);g.restore();return true}
function prop(cell,x,y,w,h){if(cell===1&&loaded(atlas.props)){const im=atlas.props;g.drawImage(im,im.width*.22,0,im.width*.31,im.height/2,Math.round(x-w/2),Math.round(y-h),w,h);return true}return frame(atlas.props,4,2,cell%4,Math.floor(cell/4),x,y,w,h)}
function bandSprite(who,x,y,state='idle',face=1,age=0,size=1,groundY=y,jumpHeight=0){
  const phase=who===selected?(player.gait||0):clock*8+who*2,pose=ActionFX.pose(state,age,phase,face,size);
  let f=state==='victory'?6+Math.floor(clock*6)%2:state==='strike'?(age<.12?4:age<.26?5:1):state==='play'?Math.floor(clock/.15+who*.5)%4:1;
  groundShadow(x,groundY,jumpHeight,size);
  if(state==='strike'&&age>=.12&&age<.23){const reach=(age<.17?48:61)*size;g.save();g.globalAlpha=(.23-age)*6;for(let i=0;i<3;i++)box(x+face*(reach-i*6*size)-2*size,y-(49+i*7)*size,Math.max(2,5*size),3*size,who===2?C.cream:C.cyan);g.restore();}
  g.save();g.translate(Math.round(x),Math.round(y));
  const walking=state==='walk'&&frame(atlas.walk,8,3,Math.floor(phase)%8,who,pose.dx,0,111*size,105*size,face,105*size*5/256);
  if(!walking&&!frame(atlas.band,8,3,f,who,pose.dx,0,111*size,105*size,face,105*size*5/256))frame(atlas.oldBand,4,3,f>=4?3:f%4,who,pose.dx,0,110*size,103*size,face);
  g.restore();
}
function seatedTony(x,y,victory=false){
  const beat=clock*9,pattern=[0,1,2,3,4,5,4,2],f=victory?5:pattern[Math.floor(beat)%pattern.length];
  if(!frame(atlas.seated,6,1,f,0,x,y,120,135,1)){
    g.save();g.beginPath();g.rect(x-60,y-125,120,78);g.clip();bandSprite(2,x,y-8,'play');g.restore();
  }
}
function npcSprite(type,x,y,state='walk',face=1,age=0,scale=1,groundY=y){const row=type%4;let f=state==='throw'?(age<.32?4:5):state==='hurt'?3:state==='hug'?4:state==='kiss'?5:state==='jump'?2+Math.floor(clock*5)%2:Math.floor(clock*7+x*.015)%2;if(row<2&&state==='walk')f=Math.floor(clock*8+x*.015)%4;groundShadow(x,groundY,Math.max(0,groundY-y),scale*.78);const lean=state==='throw'?(age<.32?-3:age<.46?4:0)*face*scale:0;if(!frame(atlas.npc,6,4,f,row,x+lean,y,80*scale,104*scale,face,104*scale*7/256))frame(atlas.oldNpc,4,2,row<2?row:row-2,row<2?1:0,x+lean,y,70*scale,100*scale,face);}
function graffitiArrow(dir,x,y,size=36,dim=false){g.save();g.translate(Math.round(x),Math.round(y));g.rotate([Math.PI,Math.PI/2,-Math.PI/2,0][dir]);if(dim)g.globalAlpha=.3;if(!prop(4,0,size/2,size,size)){for(let i=-3;i<=3;i++){box(-13,i*3,22,3,C.cyan);box(4+Math.abs(i)*-3,i*3,15,3,C.pink)}}g.restore()}
function spark(x,y,c=C.green,n=12){for(let i=0;i<n;i++)particles.push({x,y,vx:(Math.random()-.5)*150,vy:-30-Math.random()*110,t:.4+Math.random()*.4,c})}
function heart(x,y){const p=['0110110','1111111','1111111','0111110','0011100','0001000'];p.forEach((r,j)=>[...r].forEach((v,i)=>{if(v==='1')box(x+i*2,y+j*2,2,2,C.pink)}))}
function bgBox(x,y,w,h,c){bg.fillStyle=c;bg.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))}
function ambient(row,camera=0,place='stage'){
 if(row===0){for(let i=0;i<7;i++){const x=i*130-camera*.2%130,blink=Math.sin(ambientClock*2+i*1.7)>.1;bgBox(x,40,7,5,blink?C.pink:'#7c385e');for(let j=0;j<6;j++){const sway=Math.round(Math.sin(ambientClock*.8+i)*j*1.5);bgBox(x-5-j*5+sway,47+j*27,18+j*10,11,i%2?'#53c2c20c':'#e2a4400c');}}if(place==='garage'){for(let i=0;i<9;i++){const x=40+(i*67+Math.floor(ambientClock*4+i*8))%560,y=82+(i*37)%154+Math.round(Math.sin(ambientClock*.6+i)*6);bgBox(x,y,1+i%2,1,'#cdbca332');}bgBox(38,66,98,2,Math.floor(ambientClock*11)%23===0?'#77746544':'#e9d6a12a');}else{const beat=Math.max(0,Math.sin(ambientClock*Math.PI*2/.6));for(const wx of [70,560,920,1450]){const x=wx-camera;bgBox(x-28,252,56,2,beat>.55?'#46c4ca45':'#46c4ca18');bgBox(x-17,255,34,1,beat>.55?'#e95a9d44':'#e95a9d11');}}}
 else if(row===1){for(let i=0;i<14;i++){const x=(i*99-camera*.3)%640;bgBox(x,50+(i*31)%83,2,2,Math.sin(ambientClock*2+i)>.1?'#d7d8b7':'#687190');}for(let i=0;i<6;i++){const t=(ambientClock*14+i*19)%95;bgBox(315-camera*.15+i%2*8,222-t,5+i%3*2,7,'#a9afb333');}for(let i=0;i<5;i++){const x=210+i*337-camera,y=366+(i%3)*12,glint=Math.floor(ambientClock*3+i)%5;bgBox(x-22,y,46,2,'#314e6429');bgBox(x-12+glint*4,y-1,8,1,'#a2c1c34a');bgBox(x+8,y+3,12,1,'#647e8840');}}
 else{for(let i=0;i<16;i++)bgBox(i*48-camera*.12%48,48+(i%3)*4,4,5,Math.sin(ambientClock*3+i)>.1?(i%2?C.pink:C.cyan):'#614455');}
}
function world(row,camera,width){bg.clearRect(0,0,W,H);bgBox(0,0,W,H,C.ink);if(loaded(atlas.panorama)){const sy=atlas.panorama.height*[0,.366,.686][row],sh=atlas.panorama.height*[.366,.32,.314][row],sw=atlas.panorama.width,vw=sw*W/width,sx=Math.max(0,Math.min(sw-vw,camera/(width-W)*(sw-vw)));bg.drawImage(atlas.panorama,sx,sy,vw,sh*.85,0,25,W,230);bg.drawImage(atlas.panorama,sx,sy+sh*.85,vw,sh*.15,0,255,W,165)}else if(loaded(atlas.rooms)){const sw=atlas.rooms.width/2,sh=atlas.rooms.height/2,cell=row===0?1:row===1?2:3;bg.drawImage(atlas.rooms,(cell%2)*sw,Math.floor(cell/2)*sh,sw,sh,0,25,W,395)}ambient(row,camera)}
function garage(){bg.clearRect(0,0,W,H);bgBox(0,0,W,H,C.ink);if(loaded(atlas.rooms)){const sw=atlas.rooms.width/2,sh=atlas.rooms.height/2;bg.drawImage(atlas.rooms,0,0,sw,sh,0,25,W,395)}ambient(0,0,'garage')}
function band(exclude=-1,victory=false,practice=false){
  const xs=practice?[125,310,510]:[145,290,455],y=practice?344:264;
  xs.forEach((worldX,i)=>{
    const x=worldX-(practice?0:cam);
    if(i===2){if(i!==exclude)seatedTony(x,y,victory);prop(3,x,y+4,145,113);}
    else if(i!==exclude)bandSprite(i,x,y,victory?'victory':'play',1);
    if(practice){box(x-70,y+12,140,15,i===selected?C.green:C.ink);txt(names[i]+' / '+(i===0?'BASS':i===1?'GUITAR':'DRUMS'),x,y+17,1,i===selected?C.ink:C.cream,'center')}
  });
}
function reset(){actionFX=ActionFX.create();window.CGMusic?.route('main');document.body.classList.remove('finale');battle=null;bossCinema=null;bossResult=null;sectionKey=null;window.CGSectionTitles?.clear();giantPower=false;giantSince=0;powerEncore=false;groupieLucky=null;groupiePicked=false;groupieChoice=null;runQuality={campaign:true,perfect:true,perfectNotes:0,sections:[],pongHits:0,smokeHits:0};selected=Number(canvas.dataset.player)||0;score=0;health=100;gear=100;bestCombo=0;ratings=[];celebrateUntil=0;toastUntil=0;keys.clear();pause=false;cam=0;zone=0;particles=[];enemies=[];beers=[];player={x:110,y:330,face:1,vx:0,vy:0,gait:0};attack=null;hop=0;hopV=0;transition=null;startPractice()}
function announceSection(key,labels){
 if(sectionKey===key)return;sectionKey=key;keys.clear();
 window.CGSectionTitles?.start(labels,{reducedMotion:window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches===true});
}
function banner(label,callback,d=1.3){transition={end:clock+d,callback,label};actionFX.banner={start:clock,duration:d};say(label,d)}
function startPractice(){announceSection('practice','Practice');scene='practice';mode='ready';rhythm=null;banner(names[selected]+' / '+roles[selected]+' / PRACTICE',()=>startRhythm('practice'),2)}
function startRhythm(kind){announceSection(kind==='practice'?'practice':kind==='soundcheck'?'soundcheck':'show',kind==='practice'?'Practice':kind==='soundcheck'?'Sound Check':'The Show');scene=kind==='practice'?'practice':'stage';mode='rhythm';keys.clear();let p=patterns[kind==='practice'?0:kind==='soundcheck'?1:kind==='chorus'?2:3];actionFX.pulse=null;rhythm={kind,start:clock,notes:p.map((dir,i)=>({dir,t:2+i*.6,hit:false,miss:false})),hits:0,combo:0,lastBeat:-1};say('MATCH ARROWS OR A S D F ON THE WHITE LINE',1.6)}
function playNote(dir){sound([180,250,400,600][dir])}
function hitNote(dir){if(!rhythm||pause)return;const t=clock-rhythm.start,n=rhythm.notes.find(n=>!n.hit&&!n.miss);if(!n)return;const d=Math.abs(n.t-t);if(d>.23)return;if(n.dir===dir){n.hit=true;rhythm.hits++;rhythm.combo++;bestCombo=Math.max(bestCombo,rhythm.combo);score+=d<.1?150:80;if(d<.1)runQuality.perfectNotes++;else runQuality.perfect=false;playNote(dir);ActionFX.note(actionFX,dir,true,d<.1);spark(136,106+dir*22,d<.1?C.green:C.cyan,6);say(d<.1?'PERFECT!':'GOOD!',.35)}else{n.miss=true;runQuality.perfect=false;rhythm.combo=0;ActionFX.note(actionFX,dir,false);say('WRONG NOTE',.4);sound(90)}}
function finishRhythm(){const r=rhythm;if(r.notes.some(n=>!n.hit))runQuality.perfect=false;else if(!runQuality.sections.includes(r.kind))runQuality.sections.push(r.kind);mode='ready';if(r.hits<Math.ceil(r.notes.length/2)){banner('ONE MORE TIME / '+r.hits+'/'+r.notes.length,()=>startRhythm(r.kind));return}celebrateUntil=clock+1.2;if(r.kind==='practice')banner('PRACTICE LOCKED IN!',()=>startRhythm('soundcheck'));else if(r.kind==='soundcheck')banner('INSTRUMENT CHECKED / FIX THE MIX',startMixer);else if(r.kind==='chorus'){health=Math.min(100,health+20);banner('AMP BLOWOUT!',ampBlow,1)}else banner('ENCORE COMPLETE!',startSocial)}
function startMixer(){scene='stage';mode='mixer';mix=[90,8,90];mixIndex=0;rhythm=null;say('LEFT/RIGHT CHANNEL   UP/DOWN GAIN   E LOCK',3)}
function lockMixer(){if([60,45,55].every((n,i)=>Math.abs(mix[i]-n)<=8)){score+=250;mode='ready';banner('MIX LOCKED / TAKE THE STAGE',startShow)}else say('MOVE ALL THREE METERS INTO GREEN',1)}
function stageDrop(x){const p=Math.max(0,Math.min(1,(x-740)/140));return p*p*(3-2*p)*40;}
function stageBounds(){return powerEncore?{min:20,max:620,exit:580}:zone===0?{min:20,max:820,exit:780}:zone===1?{min:740,max:2350,exit:2280}:{min:20,max:2350,exit:2280};}
function startShow(){announceSection('show','The Show');scene='stage';mode='combat';zone=0;cam=0;rhythm=null;player.x=100;player.y=274;kickUntil=clock+5;spawnWave();say('KICK THE DRUNK FANS OFF STAGE / J STRIKE / K HEAVY',4);}

function spawnWave(){const count=3+zone;enemies=Array.from({length:count},(_,i)=>{const x=zone===0?300+i*135:zone===1?1040+i*330:490+i*365;return{x,y:255+(i%3)*12+stageDrop(x),hp:zone===2?65:45,face:-1,type:i%2,cool:1+i*.4,stun:0,vx:0,throwing:null,dead:0};});beers=[];}
function strike(heavy=false){if(mode!=='combat'||attack||pause)return;attack={age:0,heavy,dealt:false};sound(selected===2?800:200)}
function applyStrike(){const scale=(giantPower?3:1)*1.6,range=(attack.heavy?90:65)*scale;enemies.forEach(e=>{if(e.hp<=0)return;if(Math.abs(e.y-player.y)<27*scale&&Math.abs(e.x-player.x)<range&&(e.x-player.x)*player.face>-12*scale){e.hp=giantPower?0:e.hp-(attack.heavy?30:22);e.stun=.35;e.vx=player.face*(attack.heavy?190:120);spark(e.x-cam,e.y-52,giantPower?C.green:C.red,giantPower?16:8);ActionFX.emit(actionFX,'impact',e.x,e.y-52,{color:giantPower?C.green:C.cream,scale:giantPower?2:1,count:attack.heavy?10:7});score+=15;if(e.hp<=0){e.dead=.4;score+=100}}})}
function hurt(n){if(invul>0||hop>17)return;runQuality.perfect=false;health=Math.max(0,health-n);invul=.8;actionFX.hurt=.24;ActionFX.emit(actionFX,'impact',player.x,player.y-50,{color:C.red,count:7});spark(player.x-cam,player.y-50,C.red,7)}
function move(dt,min,max,runSpeed=145){
 const oldHop=hop,oldGait=player.gait||0,oldX=player.x;
 const dx=+(keys.has('arrowright')||keys.has('d'))-+(keys.has('arrowleft')||keys.has('a')),dy=+(keys.has('arrowdown')||keys.has('s'))-+(keys.has('arrowup')||keys.has('w'));
 const speed=keys.has('l')?runSpeed*1.45:runSpeed,blend=1-Math.exp(-dt*(dx||dy?20:28));
 player.vx=(player.vx||0)+(dx*speed-(player.vx||0))*blend;player.vy=(player.vy||0)+(dy*105-(player.vy||0))*blend;
 if(dx)player.face=dx;
 player.x=Math.max(min,Math.min(max,player.x+player.vx*dt));const step=scene==='stage'&&!giantPower?stageDrop(player.x):0,oldStep=scene==='stage'&&!giantPower?stageDrop(oldX):0;player.y=Math.max(giantPower?350:(scene==='stage'?245:270)+step,Math.min(scene==='stage'&&!giantPower?285+step:367,player.y+player.vy*dt+step-oldStep));
 player.gait=(player.gait||0)+Math.hypot(player.vx,player.vy)*dt/12;
 if(hop>0||hopV>0){hop+=hopV*dt;hopV-=440*dt;if(hop<0){hop=0;hopV=0}}
 if(oldHop>0&&hop===0)ActionFX.emit(actionFX,'land',player.x,player.y,{color:'#b7a88a',scale:giantPower?2:1,count:giantPower?12:8});
 else if(hop===0&&Math.floor(oldGait/2)!==Math.floor(player.gait/2)&&Math.hypot(player.vx,player.vy)>25)ActionFX.emit(actionFX,'dust',player.x-player.face*10,player.y,{color:scene==='alley'?'#9e9b89':'#ae9a83',scale:giantPower?2:1,count:3});
 return Math.hypot(player.vx,player.vy)>8;
}
function updateCombat(dt){const bounds=stageBounds();move(dt,bounds.min,bounds.max);cam=Math.max(0,Math.min(1760,player.x-240));invul=Math.max(0,invul-dt);if(attack){attack.age+=dt;if(attack.age>=.12&&!attack.dealt){attack.dealt=true;applyStrike()}if(attack.age>.36)attack=null}if(keys.has('j'))strike();if(keys.has('k'))strike(true);enemies.forEach(e=>{if(e.hp<=0){e.dead=Math.max(0,e.dead-dt);return}e.stun=Math.max(0,e.stun-dt);e.x+=e.vx*dt;e.vx*=Math.max(0,1-dt*8);e.face=player.x>e.x?1:-1;if(e.throwing){e.throwing.age+=dt;if(e.throwing.age>.32&&!e.throwing.released){e.throwing.released=true;beers.push({x:e.x+e.face*22,y:e.y-80,vx:e.face*180,vy:-14,t:2.4});sound(120)}if(e.throwing.age>.62)e.throwing=null;return}e.cool-=dt;if(e.stun===0){if(Math.abs(e.x-player.x)>38)e.x+=e.face*(32+zone*5)*dt;e.y+=Math.sign(player.y-e.y)*22*dt}if(e.cool<=0){if(Math.abs(e.x-player.x)<47&&Math.abs(e.y-player.y)<27){hurt(10);e.cool=1.1}else if(Math.abs(e.x-player.x)>90){e.throwing={age:0,released:false};e.cool=2.7}}});beers=beers.filter(b=>{b.x+=b.vx*dt;b.y+=b.vy*dt;b.vy+=38*dt;b.t-=dt;if(Math.abs(b.x-player.x)<30&&Math.abs(b.y-(player.y-75-hop))<44){hurt(7);b.t=0}if(b.t<=0){runQuality.perfect=false;gear=Math.max(0,gear-2);spark(b.x-cam,b.y,'#e0bd65',5);return false}return true});if(health<=0||gear<=0){recoverBand();return}if(powerEncore&&enemies.every(e=>e.hp<=0)){invul=0;score+=250;celebrateUntil=clock+1.3;mode='ready';keys.clear();banner('GIANT ENCORE CLEARED / AFTERPARTY!',()=>{powerEncore=false;startParty('pong')},1.3);return;}if(enemies.every(e=>e.hp<=0)&&player.x>bounds.exit){score+=250;celebrateUntil=clock+.9;if(zone===0){zone=1;spawnWave();say('OFF THE STAGE / CLEAR THE CROWD / REACH THE EXIT DOOR',3)}else if(zone===1){mode='ready';banner('DOOR CLEARED / BACK FOR THE CHORUS!',()=>startRhythm('chorus'))}else{mode='ready';banner('FINAL ENCORE!',()=>startRhythm('encore'))}}}
function recoverBand(){
 runQuality.perfect=false;mode='recover';keys.clear();attack=null;beers=[];
 banner('BANDMATES BAIL YOU OUT / THE SHOW GOES ON',()=>{health=75;gear=85;invul=2.5;enemies.forEach(e=>{e.cool=Math.max(1.5,e.cool);e.throwing=null;});mode='combat';},1.4);
}
function ampBlow(){announceSection('amp','THE AMP BLEW');scene='stage';mode='blowout';rhythm=null;cam=0;keys.clear();transition=null;say('THE AMP BLEW ON STAGE / E: GO GET THE SPARE FROM THE VAN',999);}
function startRescue(){announceSection('amp','THE AMP BLEW');scene='alley';mode='rescue';player.x=130;player.y=330;health=Math.max(65,health);cam=0;keys.clear();rescue={carrying:false,seconds:100,cool:0,bumps:0,people:Array.from({length:13},(_,i)=>({x:320+i*98,y:280+(i%3)*31,base:280+(i%3)*31,type:i%4,offset:i*.7}))};say('RUN RIGHT / BORROW THE AMP FROM THE BLUE VAN',2)}
function useAmp(){if(mode!=='rescue'||pause)return;if(!rescue.carrying&&Math.abs(player.x-1660)<130){rescue.carrying=true;score+=400;health=Math.min(100,health+20);say('AMP ACQUIRED / RETURN TO THE ARTWORK DOOR',2)}else if(rescue.carrying&&Math.abs(player.x-115)<100){gear=Math.max(80,gear);score+=700;mode='ready';banner('AMP PLUGGED IN / BACK TO THE SET',()=>{announceSection('show','The Show');scene='stage';mode='combat';zone=2;player.x=110;player.y=274;cam=0;kickUntil=clock+4;spawnWave()})}else say('E AT THE '+(rescue.carrying?'VENUE DOOR':'BLUE VAN'),.8)}
function updateRescue(dt){rescue.seconds-=dt;rescue.cool=Math.max(0,rescue.cool-dt);let oldX=player.x;move(dt,90,1750,rescue.carrying?112:155);rescue.people.forEach(p=>{p.y=p.base+Math.sin(clock*.9+p.offset)*17;if(Math.abs(p.x-player.x)<26&&Math.abs(p.y-player.y)<24&&hop<18){player.x=oldX+(player.x-oldX)*.3;if(rescue.cool===0){rescue.cool=.7;rescue.bumps++;runQuality.perfect=false;say(p.type<2?'FAN: I KNOW THIS SONG!':'GROUPIE: COME HERE!',.7)}}});cam=Math.max(0,Math.min(1210,player.x-240));if(rescue.seconds<=0){mode='ready';banner('TOO SLOW! / TRY THE RUN AGAIN',startRescue)}}
const girls=['ROXY','JULES','MORGAN','NINA','RAE','ALEX','SKYE','JADE','BILLIE'].map(name=>({name,age:29}));
function startSocial(){
 window.CGMusic?.route('party');
 if(groupiePicked){startParty('pong');return;}
 announceSection('groupies','Groupie Roulette');scene='party';mode='social';cam=0;
 social=window.CGGroupieRoulette.create();groupieLucky=social.lucky;
 say('PICK THREE DISTINCT FACES / ONE OF NINE HIDES GIANT POWER',3);
}
function updateRoulette(dt){
 window.CGGroupieRoulette.update(social,dt);
 const stops=social.reels.filter(r=>r.stopped).length;
 if(stops>social.lastStop){sound(420+stops*200);social.lastStop=stops;}
 const prize=window.CGGroupieRoulette.claim(social);
 if(prize){score+=prize.points;groupiePicked=true;groupieChoice=prize.lucky;
 say((prize.jackpot?'JACKPOT +10,000! / ':'NO MATCH / ')+(prize.power?'GIANT POWER BONUS!':'E: AFTER PARTY'),999);if(prize.jackpot)sound(1400);}
}
function finishRoulette(){if(mode!=='social'||social.phase!=='result')return;keys.clear();if(social.power)startGiantEncore();else{mode='ready';banner('ROULETTE COMPLETE / AFTER PARTY!',()=>startParty('pong'),1.2);}}
function giantScale(){
 if(!giantPower)return 1;
 const progress=Math.max(0,Math.min(1,(clock-giantSince)/1.1));
 return Math.min(3,1+Math.round((1-(1-progress)**3)*32)/16);
}
function startGiantEncore(){
 announceSection('show','The Show');
 giantPower=true;giantSince=clock;powerEncore=true;scene='stage';mode='powerup';zone=0;cam=0;rhythm=null;
 player.x=170;player.y=360;player.vx=0;player.vy=0;player.face=1;attack=null;hop=0;hopV=0;invul=0;enemies=[];beers=[];health=Math.max(70,health);gear=Math.max(70,gear);celebrateUntil=0;
 banner(girls[groupieChoice].name+' / GIANT POWER! 3X SIZE / ONE HIT!',()=>{
  mode='combat';enemies=Array.from({length:3},(_,i)=>({x:330+i*105,y:320+i*20,hp:65,face:-1,type:i%2,cool:1+i*.4,stun:0,vx:0,throwing:null,dead:0}));
  say('GIANT ENCORE / J OR K: ONE HIT / CLEAR ALL THREE',2.5);
 },1.4);
}
function startParty(type){window.CGMusic?.route('party');
 announceSection(type,type==='pong'?['After Party','Beer Pong']:"Blowin' O's Competition");
 scene='party';mode=type;party={type,t:0,aim:0,power:.5,marker:.5,manual:false,attempt:0,wins:0,cool:0,effect:null,physics:type==='pong'?Physics.resetPong():Physics.resetSmoke(),eventIndex:0,resolved:false,releaseDelay:0};
 say(type==='pong'?'AIM LEFT/RIGHT + POWER / SPACE THROWS':'AIM UP/DOWN + BREATH / SPACE BLOWS',2.5);
}
function hitParty(){
 if(pause||party.cool>0||party.attempt>=5||party.effect&&!party.effect.done)return;
 const input={aim:party.aim,power:party.power};
 const shot=mode==='pong'?Physics.throwBall(party.physics,input):Physics.blowRing(party.physics,input);
 if(!shot)return;
 party.effect=shot;party.releaseDelay=.18;party.attempt++;party.eventIndex=0;party.resolved=false;sound(mode==='pong'?300:180);
 $('actionStatus').textContent=(mode==='pong'?'Throw':'Breath')+' released: '+Math.round(input.power*100)+'% power, direction '+Math.round(input.aim*100);
}
function updateParty(dt){
 party.t+=dt;party.cool=Math.max(0,party.cool-dt);
 if(!party.effect||party.effect.done){
   const neg=mode==='pong'?(keys.has('arrowleft')||keys.has('a')):(keys.has('arrowdown')||keys.has('s'));
   const pos=mode==='pong'?(keys.has('arrowright')||keys.has('d')):(keys.has('arrowup')||keys.has('w'));
   if(neg||pos){party.manual=true;party.aim=Math.max(-1,Math.min(1,party.aim+(+pos-+neg)*dt*1.3));}
   else if(!party.manual)party.aim=Math.sin(party.t*1.45);
   party.power=(Math.sin(party.t*1.15+.3)+1)/2;party.marker=(party.aim+1)/2;
 }
 if(party.effect&&!party.effect.done){
   const held=Math.min(dt,party.releaseDelay);party.releaseDelay-=held;const flightDt=dt-held;
   if(flightDt>0){if(mode==='pong')Physics.stepPong(party.physics,flightDt);else Physics.stepSmoke(party.physics,flightDt);}
   while(party.eventIndex<party.effect.events.length){
     const e=party.effect.events[party.eventIndex++];
     if(e.type==='bounce')sound(600);if(e.type==='cup'||e.type==='hoop')sound(1100);
   }
 }
 if(party.effect?.done&&!party.resolved){
   party.resolved=true;party.wins=party.physics.hits;party.cool=.75;
   const hit=party.effect.result==='hit';if(hit){score+=200;runQuality[mode==='pong'?'pongHits':'smokeHits']++;}else runQuality.perfect=false;
   say(hit?(mode==='pong'?'IN THE CUP!':'THROUGH THE HOOP!'):(mode==='pong'?'MISSED / WATCH THE BOUNCE':'MISSED / ADJUST BREATH AND ANGLE'),.7);
 }
 if(party.attempt===5&&party.resolved&&party.cool===0){
   let type=mode;mode='ready';
   if(party.wins<2)banner('REMATCH / AIM AND POWER BOTH MATTER',()=>startParty(type));
   else if(type==='pong')banner('CUPS CLEARED / SMOKE-OFF!',()=>startParty('smoke'));
   else startFinalBoss();
 }
}
function startFinalBoss(){
 window.CGMusic?.route('boss');
 document.body.classList.add('finale');
 window.CGSectionTitles?.clear();keys.clear();transition=null;sectionKey='bossintro';mode='bossintro';scene='finale';bossResult=null;pause=false;
 bossCinema=window.CGBossCinema.createIntro({sound,onDone:startBossFight});
 say('BATTLE OF THE BANDS / A MESSAGE FROM YOUR LOCAL DIVE BAR',0);
}
function startBossFight(){
 if(mode!=='bossintro')return;keys.clear();mode='boss';sectionKey=null;
 battle=window.CGBattleBands.create({selected,giant:giantPower,sound,
  onNice:()=>window.CGFinaleVoice?.nice(),
  onWin:result=>{if(mode!=='boss')return;bossResult={won:true,defeated:result.defeated,score:result.score};score+=result.score;if(result.hp<result.maxHp)runQuality.perfect=false;keys.clear();finishCampaign();},
  onLose:result=>{if(mode!=='boss')return;bossResult={won:false,defeated:result.defeated,score:result.score};score+=result.score;runQuality.perfect=false;keys.clear();mode='bosskick';window.CGMusic?.lose();bossCinema=window.CGBossCinema.createKickout({member:selected,onDone:()=>{if(mode==='bosskick'){mode='kicked';say('KICKED OUT OF THE BAND / ENTER: START A NEW BAND',999);}}});}
 });announceSection('boss','Battle of the Bands');
}
function drawFinale(){
 if(mode==='bossintro')window.CGBossCinema.drawIntro(bossCinema,{g,bg});
 else if(mode==='boss')window.CGBattleBands.draw(battle,{g,bg});
 else window.CGBossCinema.drawKickout(bossCinema,{g,bg,t:ambientClock});
 if(mode==='boss')window.CGSectionTitles?.draw(g);
 if(pause){box(180,165,280,63,'#111621ef');txt('PAUSED',320,179,3,C.cream,'center');txt('P TO RESUME',320,213,1,C.green,'center');}
}
function perfectNight(){return !!(runQuality?.campaign&&runQuality.perfect&&runQuality.perfectNotes===48&&['practice','soundcheck','chorus','encore'].every(k=>runQuality.sections.includes(k))&&runQuality.pongHits===5&&runQuality.smokeHits===5);}
function finishCampaign(){document.body.classList.remove('finale');scene='party';mode='win';celebrateUntil=Infinity;say('BATTLE OF THE BANDS WON / CIRCUS GENETIC STILL STANDING',999);if(perfectNight())banner('PERFECT NIGHT / SECRET TRACK UNLOCKED',()=>startSecretBonus('perfect'),2.5);}
function returnFromBonus(){
 if(!bonusReturn)return;const previous=bonusReturn;bonusReturn=null;bonus=null;
 window.CGBonusAudio?.leave();mode=previous.mode;scene=previous.scene;pause=previous.pause;transition=previous.transition;toast=previous.toast;toastUntil=previous.toastUntil;celebrateUntil=previous.celebrateUntil;active=previous.active;keys.clear();
 if(previous.returnScreen==='action'){show('action');document.body.classList.add('playing');}
 else{active=false;document.body.classList.remove('playing');show('chapters');}
}
function startSecretBonus(source){
 if(mode==='bonus'||!window.CGBonusStage||!['password','perfect'].includes(source))return;
 if(source==='perfect'&&!perfectNight())return;
 window.CGSectionTitles?.clear();
 bonusReturn={mode,scene,pause,transition,toast,toastUntil,celebrateUntil,active,returnScreen:source==='perfect'?'action':'chapters'};
 active=true;mode='bonus';scene='bonus';pause=false;transition=null;keys.clear();selected=Number(canvas.dataset.player)||0;
 bonus=window.CGBonusStage.create({selected,onEnd:returnFromBonus,sound});document.body.classList.add('playing');show('action');$('actionPanel').hidden=true;
 window.CGBonusAudio?.enter();say('SECRET TRACK / SPACE OR UP TO JUMP',0);
}
window.startSecretBonus=startSecretBonus;
function update(dt){if(!active||pause)return;if(window.CGSectionTitles?.isActive()){window.CGSectionTitles.update(dt);return;}if(mode==='bossintro'){window.CGBossCinema.updateIntro(bossCinema,dt);return;}if(mode==='boss'){window.CGBattleBands.update(battle,dt,keys);return;}if(mode==='bosskick'){window.CGBossCinema.updateKickout(bossCinema,dt);return;}if(mode==='kicked')return;if(mode==='bonus'){window.CGBonusStage.update(bonus,dt,keys);return;}clock+=dt;ActionFX.update(actionFX,dt);particles=particles.filter(p=>(p.t-=dt)>0);particles.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=170*dt});if(transition&&clock>=transition.end){const next=transition.callback;transition=null;next()}if(window.CGSectionTitles?.isActive())return;if(mode==='rhythm'){const t=clock-rhythm.start,beat=Math.floor(t/.6);if(beat!==rhythm.lastBeat){rhythm.lastBeat=beat;sound(beat%4===0?650:350)}rhythm.notes.forEach(n=>{if(!n.hit&&!n.miss&&t>n.t+.23){n.miss=true;runQuality.perfect=false;rhythm.combo=0;ActionFX.note(actionFX,n.dir,false)}});if(t>rhythm.notes.at(-1).t+.6)finishRhythm()}if(mode==='mixer'){const speed=45*dt;if(keys.has('arrowup')||keys.has('w'))mix[mixIndex]=Math.min(100,mix[mixIndex]+speed);if(keys.has('arrowdown')||keys.has('s'))mix[mixIndex]=Math.max(0,mix[mixIndex]-speed)}if(mode==='combat')updateCombat(dt);if(powerEncore&&mode==='ready')enemies.forEach(e=>{if(e.hp<=0)e.dead=Math.max(0,e.dead-dt)});if(mode==='rescue')updateRescue(dt);if(mode==='social')updateRoulette(dt);if(mode==='pong'||mode==='smoke')updateParty(dt)}
function playerSprite(){const moving=Math.hypot(player.vx||0,player.vy||0)>8,victory=clock<celebrateUntil;g.save();if(invul>0&&Math.floor(clock*16)%2)g.globalAlpha=.45;bandSprite(selected,player.x-cam,player.y-hop,victory?'victory':attack?'strike':moving?'walk':'idle',player.face,attack?.age||0,(scene==='stage'?1.6:1)*giantScale(),player.y,hop);g.restore()}
function drawStage(){const stageZoom=giantPower?.62:1;g.save();if(stageZoom!==1){g.translate(320,398);g.scale(stageZoom,stageZoom);g.translate(-320,-398);}const livePerformance=!powerEncore&&['rhythm','mixer','ready','blowout'].includes(mode);const painted=window.CGLiveStage?.draw({g,bg,t:clock,camera:cam,exclude:mode==='combat'||mode==='recover'||powerEncore?selected:-1,performance:livePerformance,zoom:stageZoom});if(!painted){world(0,cam,1800);band(mode==='combat'||mode==='recover'||powerEncore?selected:-1,clock<celebrateUntil);}if(!livePerformance){for(const x of [70,560])prop(2,x-cam,304,65,76);drawVenueCrowd();}if(mode==='combat'||mode==='recover'||powerEncore){const actors=enemies.filter(e=>e.hp>0||e.dead>0).map(e=>({y:e.y,draw:()=>{const age=e.throwing?.age||0;g.save();if(e.hp<=0)g.globalAlpha=Math.max(0,e.dead/.4);npcSprite(e.type,e.x-cam+(e.hp<=0?(1-e.dead/.4)*Math.sign(e.vx)*12:0),e.y,e.throwing?'throw':e.stun>0||e.hp<=0?'hurt':'walk',e.face,age,1.25,e.y);g.restore();if(e.hp>0){box(e.x-cam-17,e.y-140,34,3,C.ink);box(e.x-cam-17,e.y-140,34*Math.max(0,e.hp)/(zone===2?65:45),3,C.red)}}}));actors.push({y:player.y,draw:playerSprite});actors.sort((a,b)=>a.y-b.y).forEach(a=>a.draw());beers.forEach(b=>{g.save();g.translate(Math.round(b.x-cam),Math.round(b.y));g.rotate(clock*7);prop(7,0,8,16,18);g.restore()});if(!powerEncore&&enemies.every(e=>e.hp<=0)){graffitiArrow(3,590,310,46);txt(zone===0?'TO THE CROWD':'TO THE DOOR',475,360,1,C.green,'center')}}else if(mode==='rhythm'||mode==='mixer'||mode==='ready'){/* The chosen musician performs at their actual station during rhythm sections. */}if(mode==='blowout')drawBlownAmp();if(mode==='combat'&&clock<kickUntil){const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches,lit=reduced||Math.floor(clock*3)%2===0;box(30,61,580,44,'#111621f5');box(30,61,580,3,lit?C.red:C.pink);txt('KICK THE DRUNK FANS OFF STAGE',320,75,2,lit?C.cream:C.red,'center');}g.restore();}
function drawBlownAmp(){const x=438,y=382;prop(2,x,y,79,86);box(x-27,y-55,55,42,'#15151ddd');for(let i=0;i<12;i++){const rise=(clock*34+i*9)%105;box(x-14+i%3*10+Math.round(Math.sin(clock+i)*4),y-56-rise,5+i%3*2,7,'#a6a6a077');if(i<4)box(x-18+i*12,y-57-i%2*7,3,3,Math.floor(clock*8+i)%2?C.red:C.cream);}txt('BLOWN AMP',x,y+3,1,C.red,'center');box(122,363,272,25,'#111621ed');txt('E: GET A REPLACEMENT FROM THE VAN',258,372,1,C.green,'center');}
function drawVenueCrowd(){for(let i=0;i<9;i++){const x=965+i*132-cam;if(x< -55||x>695)continue;const y=301+(i%2)*7,bob=window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches?0:Math.max(0,Math.sin(clock*3+i))*3;npcSprite(i%4,x,y-bob,i%3===0?'hug':'idle',i%2?1:-1,0,.82,y);}if(cam>1450){box(2285-cam,141,58,17,'#111621');txt('EXIT',2314-cam,146,1,C.green,'center');}}

function drawRhythm(){const r=rhythm;if(!r)return;const elapsed=clock-r.start,pulse=actionFX.pulse,beat=Math.max(0,1-(elapsed%.6)/.16);box(20,93,600,97,'#111621ed');for(let dir=0;dir<4;dir++){const y=106+dir*22;box(25,y-10,590,20,dir%2?'#283143aa':'#202a39aa');box(26,y+10,588,1,'#62757844');box(118,y-10,37,20,beat>.1?'#456352':'#354b41');graffitiArrow(dir,136,y,20,true);if(pulse&&pulse.dir===dir){const color=pulse.success?(pulse.perfect?C.green:C.cyan):C.red,fade=1-pulse.age/.34;g.save();g.globalAlpha=fade*.7;box(118,y-10,37,20,color);g.restore();graffitiArrow(dir,136,y,24,false);const spread=Math.floor(pulse.age*32);box(112-spread,y-7,3,14,color);box(158+spread,y-7,3,14,color);}}box(112,96,3,90,C.cream);box(158,96,3,90,C.cream);txt('HIT HERE',136,82,1,C.green,'center');r.notes.forEach(n=>{const x=136+(n.t-elapsed)*160,y=106+n.dir*22;if(x<30||x>600||n.hit)return;graffitiArrow(n.dir,x,y,25,n.miss);txt(noteNames[selected][n.dir],x+18,y-3,1,n.miss?C.red:C.green);});box(150,scene==='stage'?51:195,340,31,'#111621ed');txt(names[selected]+' / '+roles[selected]+' / 100 BPM',320,scene==='stage'?56:200,1,C.cream,'center');txt('HITS '+r.hits+'/'+r.notes.length+'  COMBO '+r.combo,320,scene==='stage'?71:215,1,C.green,'center');for(let i=0;i<4;i++)box(290+i*15,scene==='stage'?85:235,9,5,Math.floor(elapsed/.6)%4===i?C.pink:'#403d48');$('rhythmReadout').textContent=names[selected]+': '+r.hits+'/'+r.notes.length+' notes';window.CGRhythmCameos?.draw({g,t:clock,elapsed,kind:r.kind});}
function drawMixer(){box(88,90,464,211,'#17202bef');txt('SOUNDCHECK / GAIN STAGING',320,105,2,C.green,'center');['VOCALS','BASS','DRUMS'].forEach((n,i)=>{const y=154+i*43;txt(n,108,y,1,i===mixIndex?C.cyan:C.cream);box(177,y-3,301,15,'#30303b');const target=[60,45,55][i];box(177+(target-8)*3,y-3,48,15,'#5e9850');box(177+mix[i]*3,y-7,4,23,i===mixIndex?C.pink:C.cream);txt(Math.round(mix[i]),495,y,1,C.cream)});txt('LEFT/RIGHT CHANNEL  UP/DOWN GAIN  E CONFIRM',320,280,1,C.cream,'center')}
function drawRescue(){world(1,cam,1850);const door=115-cam,van=1660-cam;prop(0,door,267,112,204);prop(1,van,301,264,169);if(!rescue?.carrying)prop(2,van-60,331,46,50);if(door>-90&&door<730){txt('VENUE',door,73,1,C.green,'center');if(rescue?.carrying){graffitiArrow(1,door,112,34);txt('E: INSTALL',door,313,1,C.green,'center')}}if(van>-180&&van<820){txt('OTHER BAND',van,105,1,C.cream,'center');if(!rescue?.carrying){graffitiArrow(1,van,140,34);txt('E: BORROW AMP',van,343,1,C.green,'center')}}const people=rescue.people.map(p=>({y:p.y,draw:()=>{const near=Math.abs(p.x-player.x)<110,pulse=Math.sin(clock*6+p.offset);if(p.type<2)npcSprite(p.type,p.x-cam,p.y,'walk',player.x>p.x?1:-1);else{const state=near?(pulse>.3?'kiss':'hug'):'jump',up=near?0:Math.max(0,pulse)*17;npcSprite(p.type,p.x-cam,p.y-up,state,player.x>p.x?1:-1,0,1,p.y);if(near&&pulse>.6)heart(p.x-cam+19,p.y-113)}}}));people.push({y:player.y,draw:()=>{playerSprite();if(rescue.carrying)prop(2,player.x-cam+player.face*24,player.y-9-hop,44,48)}});people.sort((a,b)=>a.y-b.y).forEach(p=>p.draw());strip((rescue.carrying?'RETURN LEFT / E AT VENUE DOOR':'RUN RIGHT / E AT BLUE VAN')+' / '+Math.ceil(rescue.seconds)+' SEC',35);}
function drawSocial(){window.CGGroupieRoulette.draw(social,{g,bg,txt,box});}
function meterBar(){
 const frozen=party.effect&&!party.effect.done,aim=frozen?party.effect.launch.aim:party.aim,power=frozen?party.effect.launch.power:party.power;
 box(90,63,460,75,'#111621ed');
 txt(mode==='pong'?'DIRECTION: LEFT / RIGHT':'BREATH DIRECTION: DOWN / UP',320,69,1,C.cream,'center');
 box(130,84,380,11,'#43424a');box(318,82,3,15,C.green);box(130+(aim+1)/2*380-2,79,5,21,C.pink);
 txt(mode==='pong'?'THROW POWER':'BREATH POWER',130,111,1,C.cream);box(268,109,205,11,'#43424a');box(268,109,power*205,11,C.cyan);txt(Math.round(power*100)+'%',516,111,1,C.green,'right');
}
function pongPoint(x,z,h=0){const depth=z/1.25,half=220-120*depth;return{x:320+x*half,y:345-depth*150-h*110}}
function tablePath(inset=0){g.beginPath();g.moveTo(100+inset,345-inset);g.lineTo(540-inset,345-inset);g.lineTo(420-inset,195+inset);g.lineTo(220+inset,195+inset);g.closePath()}
function drawPongTable(){
 // One court geometry is shared by the painted tabletop, cups, and ball.
 box(106,342,13,47,'#26202a');box(522,342,13,47,'#26202a');box(222,198,7,97,'#3b302d');box(411,198,7,97,'#3b302d');
 tablePath();g.fillStyle='#ad7751';g.fill();tablePath(5);g.fillStyle='#284c42';g.fill();
 g.save();tablePath(6);g.clip();
 for(let i=0;i<100;i++){const x=115+(i*71)%415,y=199+(i*29)%140;box(x,y,2+i%4,1,i%3?'#385e4c':'#7e916a');}
 for(let z=.1;z<1.2;z+=.1){const a=pongPoint(0,z);box(a.x-1,a.y,2,3,'#b6c0a0')}
 g.restore();box(101,345,438,8,'#5e4338');box(108,349,424,3,'#bb895c');
}
function drawCup(cup,front=false){
 const base=pongPoint(cup.x,cup.z),rim=pongPoint(cup.x,cup.z,Physics.PONG.rimHeight),r=Math.round(cup.radius*(220-cup.z/1.25*120));
 if(front){box(rim.x-r+2,rim.y+3,r*2-4,3,'#efcba8');box(rim.x-r+3,rim.y+6,r*2-6,Math.max(2,base.y-rim.y-6),'#bd4944');return}
 for(let yy=0;yy<base.y-rim.y;yy+=2){let w=r-yy*.2;box(rim.x-w,rim.y+yy,w*2,2,yy%4?'#ba4742':'#df6456')}
 box(rim.x-r,rim.y-2,r*2,5,'#e6dcc3');box(rim.x-r+3,rim.y-1,r*2-6,3,'#402d2c');box(rim.x-r+6,rim.y+1,r*2-12,2,'#bf9557');
}
function drawPingPong(){
 drawPongTable();const shot=party.physics.shot;
 const visible=party.physics.cups.filter(c=>c.active||(shot?.cupId===c.id));
 visible.sort((a,b)=>b.z-a.z).forEach(c=>drawCup(c));
 if(shot&&party.releaseDelay===0){
  const p=pongPoint(shot.x,shot.z,shot.h),shadow=pongPoint(shot.x,shot.z,0);
  if(!shot.done||shot.result==='hit'){box(shadow.x-4,shadow.y,8,2,'#11162166');box(p.x-3,p.y-4,6,8,C.cream);box(p.x-4,p.y-2,8,4,'#fff4d4');}
  if(shot.cupId!==null&&(shot.status==='sinking'||shot.status==='landed'))drawCup(party.physics.cups[shot.cupId],true);
 }
 if(!shot||shot.done){
  const t=(1.15+Math.sqrt(1.15**2+2*4*(.32-.15)))/4;
  const target=pongPoint(party.aim*1.1*t,-.16+(.8+party.power*1.8)*t,.15);
  box(target.x-6,target.y,13,2,C.cyan);box(target.x,target.y-6,2,13,C.cyan);
 }
 txt('LEFT/RIGHT: SET AIM  SPACE: THROW',320,373,1,C.green,'center');
}
function drawSmoke(){
 const physics=party.physics;
 const target={x:180+physics.hoop.x*300,y:216-physics.hoop.y*180};
 pixelRing(target.x,target.y,physics.hoop.radius*180*.75,physics.hoop.radius*180,'#b5c699');
 box(target.x-2,target.y+physics.hoop.radius*180,4,136,'#98a597');box(target.x-27,381,54,5,'#353f42');
 const ring=physics.ring;
 if(ring&&party.releaseDelay===0){
  const x=180+ring.x*300,y=216-ring.y*180,r=ring.radius*180;
  const c=ring.done?'#7b858280':ring.result==='hit'?'#d4e8b9':'#becbb9';
  pixelRing(x,y,r*.78,r,c);for(let i=0;i<4;i++)box(x-r+(i*13)%Math.max(1,r*2),y+r+Math.sin(clock*3+i)*5,2,3,'#aebba277');
 }
 txt('UP/DOWN: SET DIRECTION  SPACE: BLOW',320,373,1,C.green,'center');
}
function drawParty(){
 world(2,mode==='smoke'?760:mode==='win'?1160:200,1800);
 if(mode==='win'){for(let i=0;i<3;i++)bandSprite(i,giantPower?(i===selected?320:i===((selected+1)%3)?75:565):150+i*170,giantPower&&i===selected?365:335,'victory',1,0,giantPower&&i===selected?giantScale():1);box(100,85,440,80,'#111621ed');txt('BATTLE WON!',320,98,3,C.green,'center');txt('SCORE '+score+' / BEST COMBO '+bestCombo,320,133,1,C.cream,'center');txt('ENTER: PLAY AGAIN',320,150,1,C.pink,'center');return}
 if(!party)return;
 const cast={g,t:clock,type:party.type,selected,aim:party.aim,power:party.power,effect:party.effect?{...party.effect,age:party.effect.age+.18-party.releaseDelay}:null,txt,box,bandSprite,npcSprite,prop};
 window.CGPartyCast?.drawBack(cast);
 if(party.type==='pong')drawPingPong();else drawSmoke();
 window.CGPartyCast?.drawFront(cast);meterBar();
 strip((party.type==='pong'?'CUP PONG':'SMOKE-OFF')+' / '+party.wins+' LANDED / '+party.attempt+' OF 5',35);
}
function pixelRing(x,y,rx,ry,c){for(let i=0;i<28;i++){const a=i*Math.PI/14;box(x+Math.round(Math.cos(a)*rx/3)*3,y+Math.round(Math.sin(a)*ry/3)*3,5,5,c)}}
function hud(){box(0,0,W,28,C.ink);txt(names[selected],10,8,1,C.green);txt('HP',82,8);box(100,6,102,11,'#373743');box(101,7,health,9,C.green);txt('GEAR',216,8);box(247,6,102,11,'#373743');box(248,7,gear,9,'#dcb266');if(giantPower)txt('3X POWER',362,8,1,C.pink);txt('SCORE '+String(score).padStart(6,'0'),625,8,1,C.cream,'right');box(0,398,W,22,C.ink);txt(mode==='rhythm'?'ARROWS / A S D F: NOTES':mode==='mixer'?'ARROWS: MIX  E: LOCK':mode==='social'?(social.phase==='pick'?'1-9 OR ARROWS + E: PICK 3':social.phase==='loaded'?'SPACE: PULL LEVER   BACKSPACE: EDIT':social.phase==='spin'?'SPINNING / WAIT FOR ALL THREE REELS':'E / SPACE: CONTINUE'):mode==='pong'?'LEFT/RIGHT: AIM   SPACE: THROW':mode==='smoke'?'UP/DOWN: AIM   SPACE: BLOW':'MOVE: WASD / ARROWS   J: STRIKE   K: HEAVY   E: USE',12,406,1,C.cream);txt('P PAUSE',625,406,1,C.green,'right')}
function draw(){if(!active)return;g.clearRect(0,0,W,H);g.imageSmoothingEnabled=false;if(['bossintro','boss','bosskick','kicked'].includes(mode)){drawFinale();return;}if(mode==='win'&&battle&&bossResult?.won){window.CGBattleBands.draw(battle,{g,bg});box(90,358,460,38,'#111621ed');txt('NIGHT SCORE '+score+' / BEST COMBO '+bestCombo,320,365,1,C.cream,'center');txt(transition?'PERFECT NIGHT / SECRET TRACK UNLOCKED':'ENTER: START A NEW BAND',320,382,1,C.pink,'center');return;}if(mode==='bonus'){window.CGBonusStage.draw(bonus,{g,bg});if(pause){box(180,165,280,63,'#111621ef');txt('PAUSED',320,179,3,C.cream,'center');txt('P TO RESUME',320,213,1,C.green,'center');}return;}if(scene==='practice'){garage();band(-1,clock<celebrateUntil,true)}else if(scene==='alley')drawRescue();else if(mode==='social')drawSocial();else if(scene==='party')drawParty();else drawStage();if(mode==='rhythm')drawRhythm();if(mode==='mixer')drawMixer();ActionFX.draw(actionFX,g,cam);particles.forEach(p=>box(p.x,p.y,3,3,p.c));hud();actionEdges();transitionAccent();if(clock<toastUntil)strip(toast,mode==='rescue'?58:35);if(mode==='dead'){box(110,150,420,94,'#111621ef');txt('GIG OVER',320,167,3,C.red,'center');txt('ENTER: RETRY THE NIGHT',320,210,1,C.cream,'center')}window.CGSectionTitles?.draw(g);if(pause){box(180,165,280,63,'#111621ef');txt('PAUSED',320,179,3,C.cream,'center');txt('P TO RESUME',320,213,1,C.green,'center')}}
function begin(p=0){if(bonusReturn){window.CGBonusAudio?.leave();bonusReturn=null;bonus=null;}active=true;selected=p;canvas.dataset.player=p;document.body.classList.add('playing');show('action');$('actionPanel').hidden=true;reset()}
window.startArcade=begin;
window.launchChapter=chapter=>{
  begin(Number(canvas.dataset.player)||0);
  const starts={soundcheck:()=>startRhythm('soundcheck'),show:startShow,amp:ampBlow,groupies:startSocial,party:()=>startParty('pong'),boss:startFinalBoss};
  if(!Object.prototype.hasOwnProperty.call(starts,chapter))return;
  transition=null;runQuality.campaign=false;
  starts[chapter]();
};
function input(key,down=true,repeat=false){key=key.toLowerCase();if(!active||!$('action').classList.contains('active'))return;if(!down){keys.delete(key);if(mode==='boss')window.CGBattleBands.key(battle,key,false,repeat);if(mode==='bonus')window.CGBonusStage.key?.(bonus,key,false,repeat);return}if(key==='p'&&!repeat){pause=!pause;keys.clear();return}if(key==='escape'){if(mode!=='bosskick')exit();return}if(pause||window.CGSectionTitles?.isActive())return;if(mode==='boss'){keys.add(key);window.CGBattleBands.key(battle,key,true,repeat);return;}if(mode==='bossintro'||mode==='bosskick'||mode==='recover')return;if(mode==='kicked'){if(key==='enter')reset();return;}if(mode==='bonus'){keys.add(key);window.CGBonusStage.key?.(bonus,key,true,repeat);return;}if(mode==='win'){if(key==='enter'&&!transition)reset();return}if(mode==='rhythm'&&!repeat){let d=['arrowleft','arrowdown','arrowup','arrowright'].indexOf(key);if(d<0)d=['a','s','d','f'].indexOf(key);if(d>=0)hitNote(d);return}if(mode==='mixer'){if(!repeat&&(key==='arrowleft'||key==='a'))mixIndex=(mixIndex+2)%3;if(!repeat&&(key==='arrowright'||key==='d'))mixIndex=(mixIndex+1)%3;if(key==='e'||key==='enter')lockMixer()}if(mode==='social'&&!repeat){if(social.phase==='result'&&['e','enter',' '].includes(key))finishRoulette();else window.CGGroupieRoulette.key(social,key);return}if(mode==='blowout'&&['e','enter'].includes(key)&&!repeat){startRescue();return}if((mode==='pong'||mode==='smoke')&&key===' '&&!repeat){hitParty();return}if(mode==='rescue'&&key==='e'&&!repeat)useAmp();if(mode==='combat'&&key==='j'&&!repeat)strike();if(mode==='combat'&&key==='k'&&!repeat)strike(true);if((mode==='combat'||mode==='rescue')&&key===' '&&hop===0){hopV=205;hop=1}keys.add(key)}
function exit(){if(mode==='bosskick')return;if(mode==='bonus'){returnFromBonus();return;}window.CGSectionTitles?.clear();sectionKey=null;document.body.classList.remove('finale');active=false;mode='idle';transition=null;keys.clear();document.body.classList.remove('playing');title()}
document.addEventListener('keydown',e=>{if(!active||!$('action').classList.contains('active'))return;if(e.target?.matches?.('input'))return;if(['arrowleft','arrowright','arrowup','arrowdown',' ','j','k','l','x','e','p','enter','escape','w','a','s','d','f','1','2','3','4','5','6','7','8','9','backspace'].includes(e.key.toLowerCase()))e.preventDefault();input(e.key,true,e.repeat)});document.addEventListener('keyup',e=>input(e.key,false));
document.querySelectorAll('[data-control]').forEach(b=>{b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);input(b.dataset.control)});for(const n of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(n,()=>input(b.dataset.control,false))});
canvas.addEventListener('pointerdown',e=>{if(pause||window.CGSectionTitles?.isActive())return;const r=canvas.getBoundingClientRect(),x=(e.clientX-r.left)*640/r.width,y=(e.clientY-r.top)*420/r.height;if(mode==='social'){if(social.phase==='result'&&y>315)finishRoulette();else window.CGGroupieRoulette.pointer(social,x,y);return;}if(mode==='pong'||mode==='smoke')hitParty();if(mode==='bonus')window.CGBonusStage.key?.(bonus,' ',true,false);if(mode==='mixer'){mixIndex=Math.max(0,Math.min(2,Math.floor((y-142)/43)));mix[mixIndex]=Math.max(0,Math.min(100,(x-177)/3))}});
$('pauseAction').onclick=()=>input('p');$('exitAction').onclick=exit;window.addEventListener('blur',()=>{keys.clear();if(active)pause=true});document.addEventListener('visibilitychange',()=>{if(document.hidden&&active){keys.clear();pause=true}});
function loop(ts){const dt=Math.min(.04,(ts-last)/1000||.016);last=ts;ambientClock+=dt;if(battle&&((mode==='boss'&&(pause||window.CGSectionTitles?.isActive()))||mode==='win'))battle.ambientT+=dt;if(active&&$('action').classList.contains('active')){update(dt);draw()}requestAnimationFrame(loop)}requestAnimationFrame(loop);
})();
