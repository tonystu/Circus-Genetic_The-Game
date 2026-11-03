/* The last band is never the last band. 30 rivals -> wall breach -> 15 hippies. */
(function(root,factory){const api=factory(root||{});if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.CGV6Boss=api;})(typeof window!=='undefined'?window:globalThis,function(ROOT){
'use strict';
const BASE=ROOT.CGBattleBands,W=640,H=420,WORLD=1420;
const C={ink:'#101521',black:'#080b12',cream:'#f2e0b8',green:'#b8dc6b',pink:'#ea64a4',red:'#e96b42',cyan:'#5cd2d2',gold:'#e9b65c'};
const NAMES=['MATT','BRICE','TONY'];
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const reduced=()=>ROOT.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches===true;
function img(file){if(typeof Image==='undefined')return null;const a=new Image();a.src=ROOT.CG_ASSETS?.['assets/'+file]||'assets/'+file;return a;}
const ART={hippies:img('jam-band-v6.webp'),band:img('band-motion-clean.png'),walk:img('band-walk-clean.png'),faces:img('roulette-faces-v5.png'),rivals:[img('boss-rivals-a.png'),img('boss-rivals-b.png'),img('boss-rivals-c.png')],props:img('game-props.png')};
let scratch=null;
const loaded=a=>!!(a&&a.complete&&a.naturalWidth);
function dummy(g){if(!scratch&&typeof document!=='undefined'){scratch=document.createElement('canvas');scratch.width=W;scratch.height=H;}return scratch?.getContext('2d')||g;}
function rand(s){s.seed=(Math.imul(s.seed,1664525)+1013904223)>>>0;return s.seed/4294967296;}
function sound(s,hz){s.options.sound?.(hz);}
function setPhase(s,phase){s.phase=phase;s.phaseAge=0;s.cue=0;s.keys.clear();s.melee.keys?.clear();s.jam?.keys?.clear();}
function battle(s){return s.phase==='melee'?s.melee:s.jam||s.melee;}
function sync(s){const b=battle(s);s.camera=b?.camera||0;s.controlled=b?.controlled??s.selected;s.score=s.melee.score+(s.jam?.score||0);s.defeated=s.melee.defeated+(s.jam?.defeated||0);s.stats=b?.stats||{};s.band=b?.band||[];s.rivals=b?.rivals||[];if(s.phase==='heal')s.hp=s.healFrom+(300-s.healFrom)*clamp((s.phaseAge-.35)/1.8,0,1);else s.hp=b?.hp??300;}
function recordDamage(s,b,before){if(b.hp<before)s.hadDamage=true;}
function result(s,won){sync(s);return{won,hp:s.hp,maxHp:300,score:s.score,defeated:s.defeated,perfect:!s.hadDamage&&s.melee.hp===300&&(!s.jam||s.jam.hp===300),count:s.niceCount,phase:s.phase,stats:s.stats};}
function lose(s){if(s.lostCalled||s.wonCalled)return;s.lostCalled=true;setPhase(s,'lost');sync(s);s.options.onLose?.(result(s,false));}
function nice(s,count){s.niceCount=Math.min(3,Math.max(s.niceCount,count));s.options.onNice?.(s.niceCount,s);}
function create(options={}){
 if(!BASE?.create||!BASE?.update)throw new Error('CGV6Boss requires the original CGBattleBands simulation first.');
 const s={phase:'melee',phaseAge:0,ambientT:0,selected:clamp(+options.selected||0,0,2)|0,controlled:0,giant:!!options.giant,options,seed:(options.seed??Math.floor(Math.random()*4294967296))>>>0,keys:new Set(),melee:null,jam:null,camera:0,hp:300,maxHp:300,score:0,defeated:0,niceCount:0,hadDamage:false,heldBeer:false,catchUntil:0,returnBottles:[],shards:[],rubble:[],cue:0,healFrom:300,wonCalled:false,lostCalled:false,supportPicks:[...new Set(options.supportPicks||[])].filter(n=>Number.isInteger(n)&&n>=0&&n<9).slice(0,3)};
 s.melee=BASE.create({...options,seed:s.seed,onNice:n=>nice(s,n),onLose:()=>lose(s),onWin:()=>{if(s.phase!=='melee')return;s.hadDamage||=s.melee.hp<300;s.healFrom=s.melee.hp;setPhase(s,'falsewin');sound(s,980);}});
 s.controlled=s.selected;s.cameoState=ROOT.CGV6Cameos?.create?.(s.seed)||{groupieOrder:[0,1,2,3,4,5,6,7,8]};sync(s);return s;
}
function makeJam(s){
 const j=BASE.create({...s.options,selected:s.controlled,seed:(s.seed^0x15ba7b1e)>>>0,onNice:n=>nice(s,n),onLose:()=>lose(s),onWin:()=>{if(s.phase!=='jam')return;s.hadDamage||=s.jam.hp<300;setPhase(s,'ultimate');sound(s,1320);}});
 j.rivals=j.rivals.slice(0,15);j.defeated=0;j.score=0;j.hp=j.maxHp=300;j.count=s.niceCount;j.niceTimes=[9,22,36];
 j.band.forEach((a,i)=>{a.x=190+i*54;a.y=306+i*23;a.attack=null;a.recover=0;});
 const health={bruiser:200,flanker:158,thrower:142};
 j.rivals.forEach((e,i)=>{e.id=i;e.team=0;e.x=470+(i%5)*146;e.y=280+Math.floor(i/5)*37;e.maxHp=e.hp=health[e.role];e.jamIdentity=i;e.recover=.8+(i%5)*.12;e.face=-1;});
 s.jam=j;s.returnBottles=[];s.heldBeer=false;setPhase(s,'jam');sync(s);
}
function createRubble(s){s.rubble=Array.from({length:55},(_,i)=>({x:350+(i%11)*65,y:72+Math.floor(i/11)*27,vx:(rand(s)-.5)*320,vy:-55-rand(s)*95,spin:rand(s)*2-1,size:7+i%5*3,color:['#6b4650','#9b6c5f','#322b37'][i%3]}));}
function activeKeys(s,keys){return keys||s.keys;}
function breakGlass(s,b,p,index){if(!p||p.broken)return;p.broken=true;p.life=0;for(let i=0;i<8;i++)s.shards.push({x:p.x,y:p.y,vx:(rand(s)-.5)*155,vy:-30-rand(s)*90,life:.38+rand(s)*.18});if(index!==undefined)b.projectiles.splice(index,1);sound(s,840);}
function catchGlass(s,b){if(s.heldBeer)return false;const a=b.band[b.controlled];let best=-1,d=70;for(let i=0;i<b.projectiles.length;i++){const p=b.projectiles[i],dist=Math.abs(p.x-a.x)+Math.abs(p.y-(a.y-66-a.jump));if(p.life>0&&dist<d){best=i;d=dist;}}if(best<0)return false;b.projectiles.splice(best,1);s.heldBeer=true;s.catchUntil=0;s.options.onCatch?.();sound(s,610);return true;}
function throwGlass(s,b){if(!s.heldBeer)return false;const a=b.band[b.controlled];s.heldBeer=false;s.returnBottles.push({x:a.x+a.face*32,y:a.y-68-a.jump,groundY:a.y,face:a.face,vx:a.face*420,life:2.3});sound(s,360);return true;}
function killWithBottle(s,b,e,p){if(!e.alive)return;e.alive=false;e.hp=0;e.attack=null;e.throwing=null;e.vx=e.vy=0;b.defeated++;b.score+=200;for(let i=0;i<10;i++)s.shards.push({x:e.x,y:e.y-64,vx:(rand(s)-.5)*180,vy:-30-rand(s)*100,life:.4+rand(s)*.15});s.options.onBottleKO?.({enemy:e.id,points:200,multiplier:2});sound(s,1070);p.life=0;}
function updateGlass(s,b,dt){
 const a=b.band[b.controlled];
 if(s.catchUntil>0){s.catchUntil=Math.max(0,s.catchUntil-dt);catchGlass(s,b);}
 if(a.attack&&a.attack.age>=(a.attack.windup||.12)&&a.attack.age<(a.attack.windup||.12)+.16){
  const reach=a.giant?190:a.attack.heavy?115:95;
  for(let i=b.projectiles.length-1;i>=0;i--){const p=b.projectiles[i];if(Math.abs(p.x-a.x)<reach&&(p.x-a.x)*a.face> -18&&Math.abs(p.y-(a.y-64-a.jump))<55)breakGlass(s,b,p,i);}
 }
 for(const p of s.returnBottles){p.x+=p.vx*dt;p.life-=dt;for(const e of b.rivals){if(!e.alive)continue;if(Math.abs(p.x-e.x)<32&&Math.abs(p.y-(e.y-63))<50){killWithBottle(s,b,e,p);break;}}}
 s.returnBottles=s.returnBottles.filter(p=>p.life>0&&p.x>0&&p.x<WORLD);
}
function update(s,dt,keys){
 dt=clamp(Number(dt)||0,0,.05);s.ambientT+=dt;s.phaseAge+=dt;
 s.shards=s.shards.filter(p=>(p.life-=dt)>0);for(const p of s.shards){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=240*dt;}
 if(s.phase==='lost'||s.phase==='won')return s;
 if(s.phase==='melee'||s.phase==='jam'){
  const b=battle(s),before=b.hp,previousMode=b.mode;
  if(b.mode==='fight')updateGlass(s,b,dt);
  if(s.phase==='jam'&&b.mode==='fight')for(const e of b.rivals)if(e.alive)e.recover=Math.max(0,e.recover-dt*.13);
  BASE.update(b,dt,activeKeys(s,keys));
  if(previousMode!=='nice'&&b.mode==='nice')ROOT.CGV6Cameos?.speakHey?.({muted:ROOT.CGMusic?.inspect?.().muted===true});
  recordDamage(s,b,before);sync(s);return s;
 }
 if(s.phase==='falsewin'){
  if(s.phaseAge>=2.15){setPhase(s,'breach');createRubble(s);sound(s,65);}
 }else if(s.phase==='breach'){
  if(s.phaseAge>.35&&s.cue===0){s.cue=1;sound(s,90);}
  if(s.phaseAge>=3.45){setPhase(s,'heal');s.heldBeer=false;sound(s,300);}
 }else if(s.phase==='heal'){
  if(s.phaseAge>.6&&s.cue===0){s.cue=1;sound(s,440);}
  if(s.phaseAge>1.6&&s.cue===1){s.cue=2;sound(s,880);}
  if(s.phaseAge>=2.8){makeJam(s);}
 }else if(s.phase==='ultimate'){
  if(s.phaseAge>1&&s.cue===0){s.cue=1;sound(s,1760);}
  if(s.phaseAge>=8.2){setPhase(s,'won');sync(s);if(!s.wonCalled){s.wonCalled=true;s.options.onWin?.(result(s,true));}}
 }
 sync(s);return s;
}
function key(s,value,down=true,repeat=false){const k=String(value).toLowerCase();if(!down){s.keys.delete(k);if(s.phase==='melee'||s.phase==='jam')BASE.key(battle(s),k,false,repeat);return;}if(s.phase==='ultimate'&&s.phaseAge>4.5&&['enter',' '].includes(k)){s.phaseAge=8.2;return;}if(s.phase!=='melee'&&s.phase!=='jam')return;const b=battle(s);if(k==='b'&&!repeat&&b.mode==='fight'){s.catchUntil=.28;catchGlass(s,b);return;}if(k==='t'&&!repeat&&b.mode==='fight'){throwGlass(s,b);return;}s.keys.add(k);BASE.key(b,k,true,repeat);sync(s);}
function box(g,x,y,w,h,c){g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
function text(g,str,x,y,size=1,color=C.cream,align='left'){str=String(str).toUpperCase();if(align==='center')x-=str.length*6*size/2;else if(align==='right')x-=str.length*6*size;const font=ROOT.CG_FONT;if(!font){g.fillStyle=color;g.font=`bold ${size*10}px monospace`;g.fillText?.(str,x,y+size*8);return;}for(const ch of str){const rows=(font[ch]||'00000/00000/00000/00000/00000/00000/00000').split('/');rows.forEach((r,yy)=>[...r].forEach((v,xx)=>{if(v==='1')box(g,x+xx*size,y+yy*size,size,size,color);}));x+=size*6;}}
function tile(g,im,cols,rows,col,row,x,y,w,h,face=1){if(!loaded(im))return false;g.save();g.translate(Math.round(x),Math.round(y));g.scale(face,1);g.drawImage(im,col*im.width/cols,row*im.height/rows,im.width/cols,im.height/rows,-w/2,-h,w,h);g.restore();return true;}
function depth(y){return .94+(clamp(y,273,373)-273)/100*.18;}
function shadow(g,x,y,w){box(g,x-w*.45,y,w*.9,4,'#080b1488');box(g,x-w*.3,y+1,w*.6,2,'#080b14aa');}
function shock(g,x,y){box(g,x-10,y,7,5,'#fff1d2');box(g,x+3,y,7,5,'#fff1d2');box(g,x-7,y+1,2,3,C.ink);box(g,x+7,y+1,2,3,C.ink);box(g,x-3,y+10,6,7,C.black);}
function bandDraw(s,b,g,a,pose){const p=depth(a.y),size=p*(a.giant?3:1),x=a.x-b.camera,y=a.y-a.jump,nice=b.mode==='nice',state=pose||(nice?'idle':(s.phase==='ultimate'||s.phase==='won')?'victory':a.attack?'strike':a.walked>.1?'walk':'idle');shadow(g,x,a.y,48*size);
 if(ROOT.CGV6Band?.draw)ROOT.CGV6Band.draw(g,{who:a.id,x,y,state,face:nice?1:a.face,t:s.ambientT,age:a.attack?.age||0,scale:size*145/105,scene:'boss',groundY:a.y,jump:a.jump||0,distance:(a.gait||0)/.065,speed:Math.hypot(a.vx||0,a.vy||0)});
 else{const walk=state==='walk',col=state==='victory'?6+Math.floor(s.ambientT*5)%2:a.attack?(a.attack.age<(a.attack.windup||.12)?4:5):walk?Math.floor(a.gait)%8:1;tile(g,walk?ART.walk:ART.band,8,3,col,a.id,x,y+145*size*5/256,153*size,145*size,nice?1:a.face);}
 if(nice)shock(g,x,y-106*size);if(a.id===b.controlled&&s.phase!=='ultimate'&&s.phase!=='won'){box(g,x-20,a.y+6,40,3,C.cyan);text(g,NAMES[a.id],x,a.y+13,1,C.cyan,'center');}
}
function rivalDraw(s,b,g,e,jam){const x=e.x-b.camera;if(x< -100||x>740)return;const scale=depth(e.y),h=143*scale,w=(jam?116:111)*scale,nice=b.mode==='nice';shadow(g,x,e.y,w*.55);g.save();if(!e.alive){g.globalAlpha=.38;g.translate(x,e.y);g.rotate(e.face*.9);if(jam)tile(g,ART.hippies,5,3,e.id%5,Math.floor(e.id/5),0,0,w*.66,h*.32,e.face);else{const n=e.id%10;tile(g,ART.rivals[Math.floor(e.id/10)],8,5,n%2*4+3,Math.floor(n/2),0,0,w*.7,h*.33,e.face);}g.restore();return;}
 const gait=nice||reduced()?0:Math.sin(e.gait)*2.4,lean=e.attack?(e.attack.age<(e.attack.windup||.34)?-3:5)*e.face:0;
 if(jam){const im=ART.hippies;if(loaded(im)){const sw=im.width/5,sh=im.height/3,sx=(e.id%5)*sw,sy=Math.floor(e.id/5)*sh;g.translate(Math.round(x+lean),Math.round(e.y));g.scale(nice?1:e.face,1);
   // Fixed sole baseline; opposing cropped lower-leg halves cross on the gait.
   for(let leg=0;leg<2;leg++){g.save();g.translate((leg?1:-1)*w*.13,-h*.26);g.rotate((nice||e.attack||reduced()?0:Math.sin(e.gait+(leg?Math.PI:0))*.13));g.drawImage(im,sx+sw*(leg?.5:0),sy+sh*.70,sw*.5,sh*.30,leg?-w*.13:-w*.37,-h*.04,w*.5,h*.30);g.restore();}
   g.drawImage(im,sx,sy,sw,sh*.715,-w/2+gait*.4,-h,w,h*.715);
  }else{box(g,x-w*.22,e.y-h*.73,w*.44,h*.5,['#a45a96','#557f4c','#d68b43'][e.id%3]);box(g,x-w*.15,e.y-h*.95,w*.3,h*.25,'#d8c7a3');box(g,x-w*.17,e.y-h*.77,w*.34,h*.25,'#dad1bd');}}
 else{const n=e.id%10,pose=nice||e.stun>0?3:e.throwing?2:e.attack?(e.attack.age<(e.attack.windup||.34)?Math.floor(e.gait)%2:2):Math.floor(e.gait)%2;tile(g,ART.rivals[Math.floor(e.id/10)],8,5,n%2*4+pose,Math.floor(n/2),x+lean,e.y,w,h,nice?1:e.face);}
 g.restore();if(nice)shock(g,x,e.y-h*.72);if(e.hp<e.maxHp){box(g,x-21,e.y-h-7,42,3,'#3d3040');box(g,x-21,e.y-h-7,42*e.hp/e.maxHp,3,C.red);}if(e.guard){box(g,x+e.face*34-4,e.y-84,8,21,C.cyan);box(g,x+e.face*34-2,e.y-82,4,17,C.ink);}if(e.attack?.heavy&&!e.attack.dealt)text(g,'!',x,e.y-h-19,2,C.red,'center');
}
function beer(g,x,y,angle=0){g.save();g.translate(x,y);g.rotate(angle);box(g,-5,-9,10,16,'#b8d3c7');box(g,-3,-6,6,10,'#e0aa46');box(g,-6,-10,12,4,C.cream);box(g,4,-6,4,8,'#9cafb0');box(g,6,-4,2,4,C.ink);g.restore();}
function patio(s,b,bg){const x=780-b.camera;if(x>700||x< -370)return;box(bg,x,74,326,107,'#0a0c18');box(bg,x+5,79,316,97,'#241832');for(let i=0;i<4;i++){const xx=x+15+i*79;box(bg,xx,84,66,3,i%2?C.pink:C.cyan);box(bg,xx,134,60,4,'#514154');box(bg,xx+4,138,4,22,'#382b3b');box(bg,xx+50,138,4,22,'#382b3b');const y=b.mode==='nice'?132:132-Math.max(0,Math.sin(s.ambientT*5+i))*3;box(bg,xx+19,y-22,17,20,['#a55f8b','#6f9d83','#d29348'][i%3]);box(bg,xx+22,y-34,12,12,'#d9ab7d');box(bg,xx+14,y-38,4,20,'#d9ab7d');box(bg,xx+36,y-40,4,22,'#d9ab7d');}box(bg,x+104,79,4,97,'#586159');box(bg,x+213,79,4,97,'#586159');box(bg,x,173,326,8,'#777261');}
function stageBand(s,b,bg){
 const frozen=b.mode==='nice';
 for(let i=0;i<5;i++){const x=150+i*113-b.camera,y=241,id=24+i,n=id%10;if(x< -70||x>710)continue;const pose=frozen?3:Math.floor(s.ambientT*6+i)%2;tile(bg,ART.rivals[Math.floor(id/10)],8,5,n%2*4+pose,Math.floor(n/2),x,y-(frozen||reduced()?0:Math.max(0,Math.sin(s.ambientT*7+i))*2),77,91);if(frozen)shock(bg,x,y-65);}
 ROOT.CGV6World?.kit?.(bg,376-b.camera,244,.73,s.ambientT,!frozen);
 for(const wx of [63,710]){const x=wx-b.camera,beat=reduced()?0:Math.max(0,Math.sin(s.ambientT*12)),dy=Math.floor(beat*4);box(bg,x-31,236,62,8,C.black);box(bg,x-28,105-dy,56,131,'#282b34');box(bg,x-24,111-dy,48,119,'#141923');for(const yy of [146,200]){box(bg,x-20,yy-19-dy,40,38,'#5f686c');box(bg,x-16,yy-15-dy,32,30,'#222c32');box(bg,x-7,yy-6-dy,14,12,'#0a1019');}}
}
function backdrop(s,b,bg,contexts){if(s.options.drawBackground){s.options.drawBackground(s,{...contexts,bg});}else if(ROOT.CGV6World?.ready?.()){ROOT.CGV6World.interior({bg,g:contexts.g,t:s.ambientT,camera:b.camera,kind:'boss',state:{...s.cameoState,mode:b.mode}});stageBand(s,b,bg);}else{BASE.draw(b,{g:dummy(contexts.g),bg});patio(s,b,bg);}if(s.phase==='breach'||s.phase==='heal'||s.phase==='jam'||s.phase==='ultimate'||s.phase==='won'){const x=460-b.camera;for(let j=0;j<9;j++){const spread=clamp((s.phase==='breach'?s.phaseAge:4)/1.6,0,1);box(bg,x+40-j*11*spread,55+j*16,500+j*22*spread,20,C.black);}for(let i=0;i<16;i++)box(bg,x+20+i*33,224+(i%3)*10,40,15,['#493943','#74564f','#9a6b5c'][i%3]);}}
function face(g,id,x,y,w,h){if(loaded(ART.faces)){const sw=ART.faces.width/3,sh=ART.faces.height/3;g.drawImage(ART.faces,(id%3)*sw,Math.floor(id/3)*sh,sw,sh*.68,x,y,w,h);}else box(g,x,y,w,h,'#d7aa7d');}
function followers(s,b,g){if(!s.supportPicks.length)return;const a=b.band[b.controlled];s.supportPicks.forEach((id,i)=>{const x=a.x-b.camera-a.face*(55+i*31),y=a.y-17-i*3,h=119*depth(y),bounce=reduced()||b.mode==='nice'?0:Math.max(0,Math.sin(s.ambientT*5+i))*3;shadow(g,x,y,30);box(g,x-14,y-h*.66-bounce,28,h*.46,['#8f507a','#586d98','#8b742f'][id%3]);box(g,x-12,y-h*.23,9,h*.23,'#252531');box(g,x+4,y-h*.23,9,h*.23,'#252531');face(g,id,x-19,y-h-bounce,38,h*.36);box(g,x-23,y-h*.78-bounce,7,31,'#c99976');box(g,x+17,y-h*.84-bounce,7,32,'#c99976');if(b.mode==='nice')shock(g,x,y-h*.80);});}
function safeGroupie(s,g,x,id,age,winning=false){const jump=reduced()?0:Math.abs(Math.sin(s.ambientT*6+id))*7,y=421-jump,h=177,w=72;shadow(g,x,418,w*.7);box(g,x-22,y-h*.58,44,h*.42,['#713b65','#36556b','#806045'][id%3]);box(g,x-21,y-h*.17,16,h*.17,'#29313d');box(g,x+6,y-h*.17,16,h*.17,'#29313d');const hair=['#4b2930','#5b342b','#ae8b38','#282238','#23334c','#633722','#acaba2','#315d40','#1c1922'][id%9];box(g,x-27,y-h+5,54,45,hair);box(g,x-19,y-h,38,7,hair);box(g,x-31,y-h+16,8,39,hair);box(g,x+23,y-h+16,8,39,hair);const lift=winning||age>.8;box(g,x-36,y-h*.72-(lift?20:0),11,51,'#d5a17c');box(g,x+25,y-h*.72-(lift?20:0),11,51,'#d5a17c');if(lift){
  // Shirt-lift is implied from behind. The dark underlayer stays fully covered.
  box(g,x-23,y-h*.72,46,28,['#b785a9','#7f9abb','#b0a16d'][id%3]);box(g,x-22,y-h*.51,44,34,'#21192c');box(g,x-18,y-h*.53,36,4,C.pink);
 }else box(g,x-22,y-h*.61,44,37,['#a67291','#5f80a0','#9c8244'][id%3]);
 // Long hair is drawn over the back of the shirt, keeping the rear-view reading.
 box(g,x-27,y-h+26,14,43,['#3a2733','#624336','#d0a343'][id%3]);box(g,x+13,y-h+25,14,43,['#3a2733','#624336','#d0a343'][id%3]);
}
function niceOverlay(s,b,g){const age=b.niceAge||0;safeGroupie(s,g,250,1,age);safeGroupie(s,g,395,4,age);if(age<.78){box(g,188,250,265,29,'#101521ef');text(g,'HEY BOYS!!',320,259,2,C.cream,'center');}else if(Math.floor(age*5)%2===0){box(g,115,70,410,44,'#101521ed');text(g,'NIIIICCCEEEEE',320,83,3,C.pink,'center');}}
function hud(s,b,g,jam){box(g,0,0,W,27,C.ink);text(g,'CG BAND',8,9,1,C.green);box(g,58,7,153,11,'#403540');box(g,59,8,151*clamp(s.hp/300,0,1),9,s.hp<75?C.red:C.green);text(g,(jam?'JAM BAND ':'RIVALS ')+(jam?15-b.defeated:30-b.defeated)+'/'+(jam?15:30),225,9,1,C.cream);text(g,'SCORE '+s.score,444,9,1,C.cream);box(g,0,27,W,19,'#272135');text(g,jam?'THE LAST JAM / NO MORE ENCORES':'BATTLE OF THE BANDS / TOWN MELEE',320,33,1,jam?C.red:C.pink,'center');box(g,0,398,W,22,C.ink);text(g,'X SWITCH  J/K HIT  B CATCH  T THROW  SPACE JUMP',9,406,1,C.cream);if(s.heldBeer)text(g,'BEER!',587,33,1,C.gold,'right');}
function filmBand(s,g,positions,pose='victory'){const b=battle(s);b.band.forEach((a,i)=>{const copy={...a,x:positions[i][0],y:positions[i][1],jump:0,giant:false,attack:null,walked:0};bandDraw(s,{...b,camera:0,mode:'won'},g,copy,pose);});}
function drawBreach(s,g){const age=s.phaseAge;for(const r of s.rubble){const t=Math.max(0,age-.10);const x=r.x+Math.max(0,Math.min(1.3,t))*r.vx,y=r.y+r.vy*t+120*t*t;g.save();g.translate(x-battle(s).camera,y);g.rotate(reduced()?0:r.spin*t);box(g,-r.size/2,-r.size/2,r.size,r.size*.7,r.color);g.restore();}for(let i=0;i<30;i++){const spread=clamp(age/1.8,0,1),x=320+(i%10-4.5)*38*spread,y=110+Math.floor(i/10)*35+Math.sin(i)*9;g.save();g.globalAlpha=clamp(1-(age-1)/3,0,.7);box(g,x-38,y-17,76,35,'#9a8780');g.restore();}if(age>.6){box(g,90,65,460,57,'#101521ed');text(g,'BOSS BATTLE',320,78,4,Math.floor(age*3)%2?C.red:C.cream,'center');text(g,'THE FIFTEEN-MAN LAST-JAM BAND',320,111,1,C.gold,'center');}}
function drawHeal(s,g){const a=s.melee.band[s.controlled],t=s.phaseAge;filmBand(s,g,[[205,345],[320,345],[435,345]],'idle');const x=[205,320,435][s.controlled],lift=t<.3?0:Math.sin(clamp((t-.3)/1.7,0,1)*Math.PI)*45;beer(g,x+30,289-lift,t>.5&&t<2?-.8:0);box(g,x+12,268,23,9,'#dfa57a');box(g,80,57,480,72,'#101521ed');text(g,'ONE BEER. ONE LAST STAND.',320,72,2,C.gold,'center');text(g,'BAND HEALTH '+Math.round(s.hp/3)+'%',320,100,2,C.green,'center');box(g,151,121,338,5,'#483b48');box(g,152,122,336*s.hp/300,3,C.green);}
function flames(s,g,x,y,size=1){for(let i=0;i<7;i++){const h=9+(i*7+Math.floor(s.ambientT*15))%20;box(g,x+(i-3)*5*size,y-h*size,6*size,h*size,i%2?C.red:C.gold);box(g,x+(i-3)*5*size,y-h*size*.55,3*size,h*size*.55,C.cream);}}
function ultimate(s,g,bg){const b=battle(s);backdrop(s,b,bg,{g,bg});g.clearRect(0,0,W,H);
 for(let i=0;i<45;i++){const x=80+(i*83)%480,y=365-Math.sin((x-80)/480*Math.PI)*65+(i%4)*9;g.save();g.translate(x,y);g.rotate(i%2?.23:-.19);if(i<15)tile(g,ART.hippies,5,3,i%5,Math.floor(i/5),0,0,67,35,i%2?1:-1);else{const id=i-15,n=id%10;tile(g,ART.rivals[Math.floor(id/10)],8,5,n%2*4+3,Math.floor(n/2),0,0,57,30);}g.restore();}
 filmBand(s,g,[[225,285],[320,272],[415,285]]);
 for(const [x,y] of [[112,355],[520,357],[430,345],[186,352]]){box(g,x-23,y-10,45,9,'#372c32');box(g,x+8,y-33,5,31,'#916740');flames(s,g,x,y,1);}
 for(let i=0;i<24;i++){const t=(s.phaseAge+i*.18)%3.5,x=(i*113)%640,y=65+t*t*29;box(g,x,y,5+i%4*2,4+i%3*2,['#6f4f48','#a5725b','#403442'][i%3]);}
 safeGroupie(s,g,77,0,s.phaseAge,true);safeGroupie(s,g,561,5,s.phaseAge,true);
 const lit=reduced()||Math.floor(s.ambientT*3)%2===0;box(g,25,30,590,73,'#101521ed');text(g,'BATTLE OF THE BAND',320,39,3,lit?C.red:C.cream,'center');text(g,'ULTIMATE WINNERS!!!',320,70,3,lit?C.cream:C.gold,'center');
 if(s.phase==='won')text(g,'THE TOWN WILL NEVER BE THE SAME.',320,120,1,C.green,'center');
}
function draw(s,contexts){const {g,bg}=contexts;if(!g||!bg)return;const b=battle(s),jam=s.phase==='jam';sync(s);if(s.phase==='ultimate'||s.phase==='won'){ultimate(s,g,bg);return;}backdrop(s,b,bg,contexts);g.clearRect(0,0,W,H);g.imageSmoothingEnabled=false;
 if(s.phase==='melee'||s.phase==='jam'||s.phase==='lost'){
  const zoom=b.band.some(a=>a.giant)?.69:1;
  if(zoom!==1){bg.clearRect(0,0,W,H);box(bg,0,0,W,H,'#1a1723');box(bg,0,302,W,118,'#3c3039');for(let row=0;row<9;row++)for(let col=0;col<15;col++)box(bg,col*46+(row%2)*23,row*32+17,38,2,'#57404a');bg.save();bg.translate(320,398);bg.scale(zoom,zoom);bg.translate(-320,-398);backdrop(s,b,bg,contexts);bg.restore();g.save();g.translate(320,398);g.scale(zoom,zoom);g.translate(-320,-398);}
  followers(s,b,g);const all=[...b.rivals.map(e=>({y:e.y,draw:()=>rivalDraw(s,b,g,e,jam||!!s.jam)})),...b.band.map(a=>({y:a.y,draw:()=>bandDraw(s,b,g,a)}))];all.sort((a,b)=>a.y-b.y).forEach(a=>a.draw());
  for(const p of b.projectiles)beer(g,p.x-b.camera,p.y,s.ambientT*4);for(const p of s.returnBottles)beer(g,p.x-b.camera,p.y,s.ambientT*9);if(s.heldBeer){const a=b.band[b.controlled];beer(g,a.x-b.camera+a.face*32,a.y-a.jump-75,-a.face*.2);}
  for(const p of s.shards)box(g,p.x-b.camera,p.y,3,3,C.cream);if(zoom!==1)g.restore();hud(s,b,g,jam||!!s.jam);if(b.mode==='nice')niceOverlay(s,b,g);if(s.phase==='lost'){box(g,95,137,450,65,'#101521ed');text(g,'THE BAND GOES DOWN',320,153,3,C.red,'center');}
 }else if(s.phase==='falsewin'){
  filmBand(s,g,[[220,340],[320,340],[420,340]]);box(g,84,70,472,66,'#101521ed');text(g,'TOWN CHAMPIONS!',320,84,3,C.green,'center');text(g,s.phaseAge<1?'THIRTY RIVALS DOWN...':'WAIT. WHAT IS THAT NOISE?',320,118,1,C.cream,'center');
 }else if(s.phase==='breach'){
  const reveal=clamp((s.phaseAge-1)/1.7,0,1);for(let i=0;i<15;i++){const x=135+(i%5)*94,y=185+Math.floor(i/5)*32;g.save();g.globalAlpha=reveal;tile(g,ART.hippies,5,3,i%5,Math.floor(i/5),x,y,57,72,i%2?-1:1);g.restore();}drawBreach(s,g);
 }else if(s.phase==='heal')drawHeal(s,g);
}
function getPlayer(s){const b=battle(s),a=b.band[b.controlled];return{x:a.x,y:a.y,camera:b.camera,who:a.id,jump:a.jump||0};}
function install(){if(ROOT.CGBattleBands!==api)ROOT.CGBattleBands=api;return api;}
const api=Object.freeze({create,update,key,draw,getPlayer,install});return api;
});
