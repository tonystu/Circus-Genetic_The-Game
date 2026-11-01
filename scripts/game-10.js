/* Finale arena simulation. Browser rendering and Node regression tests share one state. */
(function(root,factory){const api=factory(root||{});if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.CGBattleBands=api;})(typeof window!=='undefined'?window:globalThis,function(ROOT){
'use strict';
const W=640,H=420,WORLD=1420,NAMES=['MATT','BRICE','TONY'];
const ROLES=['bruiser','flanker','thrower'],ROLE_HP={bruiser:145,flanker:108,thrower:94};
const PAL={ink:'#101521',cream:'#f2e0b8',green:'#b8dc6b',pink:'#ea64a4',red:'#e96b42',cyan:'#5cd2d2'};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function rng(s){s.seed=(Math.imul(s.seed,1664525)+1013904223)>>>0;return s.seed/4294967296;}
function asset(file){if(typeof Image==='undefined')return null;const im=new Image();im.src=ROOT.CG_ASSETS?.['assets/'+file]||'assets/'+file;return im;}
const art={arena:asset('boss-arena.png'),rivals:[asset('boss-rivals-a.png'),asset('boss-rivals-b.png'),asset('boss-rivals-c.png')],reaction:asset('boss-reaction.png'),band:asset('band-motion-clean.png'),walk:asset('band-walk-clean.png'),seated:asset('tony-seated.png'),props:asset('game-props.png'),crowd:asset('party-npcs.png')};
const loaded=im=>!!(im&&im.complete&&im.naturalWidth);
function fighter(id,x,y,kind,team){return{id,x,y,kind,team,face:1,vx:0,vy:0,gait:id*.71,attack:null,recover:0,stun:0,knock:0,jump:0,jumpV:0,throwing:null,hp:kind==='band'?1:110,alive:true,target:null,chooseIn:0,walked:0};}
function create(options={}){
 const selected=clamp(Number(options.selected)||0,0,2)|0;
 const s={mode:'fight',selected,controlled:selected,giant:!!options.giant,hp:300,maxHp:300,score:0,defeated:0,worldWidth:WORLD,camera:0,ambientT:0,fightT:0,count:0,niceAge:0,nice:null,keys:new Set(),band:[],rivals:[],projectiles:[],particles:[],hurtLock:0,seed:(options.seed??Math.floor(Math.random()*4294967296))>>>0,options,wonCalled:false,lostCalled:false,niceTimes:[],lastHit:null,stats:{playerDamage:0,allyDamage:0,guards:0,heavyHits:0,beersThrown:0}};
 s.band=[fighter(0,145,335,'band',-1),fighter(1,195,305,'band',-1),fighter(2,245,355,'band',-1)];
 s.band.forEach(b=>{b.giant=s.giant&&b.id===selected;});
 for(let i=0;i<30;i++){const e=fighter(i,355+(i*97)%1000,280+(i%5)*22,'rival',Math.floor(i/3));e.face=-1;e.role=ROLES[i%3];e.maxHp=ROLE_HP[e.role];e.hp=e.maxHp;e.flank=i%2?1:-1;e.guard=false;e.recover=.45+(i%7)*.13;e.chooseIn=rng(s)*.5;s.rivals.push(e);}
 s.niceTimes=[11+rng(s)*2,25+rng(s)*2,41+rng(s)*2];
 return s;
}
function has(keys,k){if(!keys)return false;if(typeof keys.has==='function')return keys.has(k)||keys.has(k===' '?'Space':k.startsWith('arrow')?'Arrow'+k.slice(5,6).toUpperCase()+k.slice(6):k);return!!(keys[k]||keys[k===' '?'Space':k]);}
function emit(s,type,x,y,color=PAL.red,n=7){for(let i=0;i<n;i++)s.particles.push({type,x,y,vx:(rng(s)-.5)*130,vy:-20-rng(s)*100,life:.35+rng(s)*.3,color});}
function aliveRivals(s){return s.rivals.filter(e=>e.alive);}
function finish(s,win){if(s.mode==='won'||s.mode==='lost')return;s.mode=win?'won':'lost';s.keys.clear();s.nice=null;if(win){s.camera=clamp(s.band.reduce((sum,a)=>sum+a.x,0)/3-W/2,0,WORLD-W);const giant=s.band.find(a=>a.giant),mates=s.band.filter(a=>!a.giant);s.projectiles=[];s.particles=[];s.band.forEach((a,i)=>{a.x=s.camera+(giant?(a.giant?320:mates.indexOf(a)===0?75:565):200+i*120);a.y=a.giant?350:337;a.jump=0;a.jumpV=0;a.attack=null;a.throwing=null;a.vx=0;a.vy=0;a.face=1;});}if(win&&!s.wonCalled){s.wonCalled=true;s.options.onWin?.(s);}if(!win&&!s.lostCalled){s.lostCalled=true;s.options.onLose?.(s);}}
function damageBand(s,damage,from,victim=null){if(s.hurtLock>0||s.mode!=='fight')return false;damage=Math.ceil(damage*(victim&&victim.id!==s.controlled?.75:1));s.hp=Math.max(0,s.hp-damage);s.hurtLock=.56;s.lastHit=from?.id??null;s.options.sound?.(90);if(s.hp<=0)finish(s,false);return true;}
function knockOut(s,e){if(!e.alive)return;e.alive=false;e.hp=0;e.attack=null;e.throwing=null;e.vx=0;e.vy=0;s.defeated++;s.score+=100;emit(s,'ko',e.x,e.y-45,PAL.green,10);}
function hitRival(s,e,damage,dir,force,source,heavy=false){if(!e.alive||s.mode!=='fight')return;const guarded=e.guard&&source?.kind==='band'&&!source.giant&&!heavy&&(source.x-e.x)*e.face>=-8;if(guarded){damage=Math.ceil(damage*.4);force*=.25;s.stats.guards++;}else e.guard=false;const actual=Math.min(e.hp,damage);e.hp=Math.max(0,e.hp-damage);e.knock=dir*force;e.stun=guarded?.09:.26;e.attack=null;e.throwing=null;emit(s,guarded?'guard':'hit',e.x,e.y-48,guarded?PAL.cyan:source?.kind==='band'?PAL.cream:PAL.red,5);if(source?.kind==='band'){s.score+=guarded?3:10;s.stats[(source.attack?.playerControlled??source.id===s.controlled)?'playerDamage':'allyDamage']+=actual;}if(e.hp<=0)knockOut(s,e);}
function startAttack(s,a,heavy=false){if(!a.alive||a.attack||a.recover>0||a.stun>0||a.throwing||s.mode!=='fight')return false;const playerControlled=a.kind==='band'&&a.id===s.controlled;a.attack={age:0,heavy,dealt:false,playerControlled,windup:a.kind==='band'?(playerControlled?.12:.19):(heavy?.57:.34),recovery:a.kind==='band'?(playerControlled?(heavy?.32:.19):(heavy?.58:.43)):(heavy?1.05:.72)+(a.id%3)*.1};a.guard=false;a.vx=0;a.vy=0;return true;}
function attackWindup(s,a){return a.attack?.windup??(a.kind==='band'?(a.id===s.controlled?.12:.19):(a.attack?.heavy?.57:.34));}
function dealAttack(s,a){const atk=a.attack;if(!atk||atk.dealt)return;atk.dealt=true;const giant=!!a.giant,reach=giant?155:atk.heavy?(a.kind==='rival'?104:92):70,limit=a.kind==='band'?(atk.heavy?4:2):1;let hits=0;
 const targets=a.kind==='band'?s.rivals.filter(e=>e.alive):(a.target?.kind==='rival'?[a.target]:[...s.band]);
 targets.sort((u,v)=>Math.abs(u.x-a.x)-Math.abs(v.x-a.x));
 for(const target of targets){if(hits>=limit||s.mode!=='fight')break;if(Math.abs(target.y-a.y)>26+(giant?12:0)||Math.abs(target.x-a.x)>reach||(target.x-a.x)*a.face< -14||target.jump>18)continue;
  if(target.kind==='band'){const damage=atk.heavy?(a.role==='bruiser'?27:23):(a.role==='flanker'?14:17);if(damageBand(s,damage,a,target)){target.knock=a.face*(atk.heavy?125:80);hits++;if(atk.heavy)s.stats.heavyHits++;emit(s,'hit',target.x,target.y-50,PAL.red,5);}}
  else{const amount=a.kind==='band'?(giant?999:(atk.playerControlled??a.id===s.controlled)?(atk.heavy?37:25):(atk.heavy?14:8)):3;hitRival(s,target,amount,a.face,a.kind==='band'?atk.heavy?195:135:70,a,atk.heavy);hits++;}
 }
 if(hits&&a.kind==='band')s.options.sound?.(a.id===2?800:190);
}
function nearest(a,targets){let best=null,d=Infinity;for(const t of targets){const v=Math.abs(t.x-a.x)+Math.abs(t.y-a.y)*1.8;if(v<d){d=v;best=t;}}return best;}
function chooseTarget(s,a){if(a.kind==='band')return nearest(a,s.rivals.filter(e=>e.alive));const cg=nearest(a,s.band),other=nearest(a,s.rivals.filter(e=>e.alive&&e.team!==a.team));if(other&&Math.abs(other.x-a.x)<130&&rng(s)<(Math.abs(cg.x-a.x)>260?.28:.06))return other;return cg;}
function targetStillValid(t){return t&&t.alive;}
function ai(s,a,dt){if(!a.alive)return;if(a.stun>0||a.attack||a.throwing){a.guard=false;return;}a.chooseIn-=dt;if(a.chooseIn<=0||!targetStillValid(a.target)){a.target=chooseTarget(s,a);a.chooseIn=.3+rng(s)*.35;}const t=a.target;if(!t)return;const dx=t.x-a.x,dy=t.y-a.y;a.face=dx>=0?1:-1;const laneOffset=((a.id%5)-2)*3,ally=a.kind==='band';let goalX=t.x,goalY=t.y-laneOffset,speed=ally?112:a.role==='flanker'?96:a.role==='thrower'?75:67;
 // Fast flankers take alternating side lanes, then commit; the other roles hold the front and throw from range.
 if(!ally&&a.role==='flanker'&&Math.abs(dx)>85&&Math.abs(dx)<210&&(s.fightT+a.id*.83)%6.4<1.8){goalX=t.x+a.flank*75;goalY=clamp(t.y+a.flank*31,279,367);}
 if(!ally&&a.role==='thrower'&&t.kind==='band'&&Math.abs(dx)<118&&a.x>65&&a.x<WORLD-65){goalX=a.x-Math.sign(dx)*80;goalY=clamp(t.y+laneOffset*2,278,367);}
 a.guard=!ally&&a.role==='bruiser'&&a.recover>.15&&Math.abs(dx)<135&&Math.abs(dy)<34;
 a.vx=Math.abs(goalX-a.x)>(a.giant?85:48)?Math.sign(goalX-a.x)*speed:0;a.vy=Math.abs(goalY-a.y)>7?Math.sign(goalY-a.y)*speed*.65:0;
 if(Math.abs(dx)<(a.giant?145:77)&&Math.abs(dy)<24&&a.recover===0){const heavy=ally?((a.id+Math.floor(s.fightT))%3===0):a.role==='bruiser'||(a.role==='flanker'&&(a.id+Math.floor(s.fightT))%4===0);startAttack(s,a,heavy);}
 if(!ally&&!a.attack&&a.role==='thrower'&&a.recover===0&&t.kind==='band'&&Math.abs(dx)>125&&Math.abs(dx)<285&&Math.abs(a.x-s.camera-320)<365&&s.projectiles.length<4){const flight=Math.abs(dx)/225;a.throwing={age:0,released:false,face:a.face,targetX:clamp(t.x+t.vx*.32,35,WORLD-35),targetY:t.y-50+clamp(t.vy*.25,-18,18),flight};a.guard=false;a.vx=0;a.vy=0;}
}
function controlled(s,a,keys){const dx=+(has(keys,'arrowright')||has(keys,'d'))-+(has(keys,'arrowleft')||has(keys,'a')),dy=+(has(keys,'arrowdown')||has(keys,'s'))-+(has(keys,'arrowup')||has(keys,'w'));const speed=(a.giant?115:151)*(has(keys,'l')?1.4:1);a.vx=dx*speed;a.vy=dy*speed*.72;if(dx)a.face=Math.sign(dx);if(has(keys,'j'))startAttack(s,a,false);if(has(keys,'k'))startAttack(s,a,true);}
function separation(s,a){let sx=0,sy=0;for(const b of [...s.band,...s.rivals]){if(b===a||!b.alive)continue;const dx=a.x-b.x,dy=a.y-b.y;if(Math.abs(dx)<25&&Math.abs(dy)<18){sx+=dx===0?(a.id%2?1:-1)*8:Math.sign(dx)*(25-Math.abs(dx))*.7;sy+=dy===0?(a.id%3-1)*6:Math.sign(dy)*(18-Math.abs(dy))*.8;}}return{sx:clamp(sx,-28,28),sy:clamp(sy,-22,22)};}
function updateFighter(s,a,dt){if(!a.alive)return;a.recover=Math.max(0,a.recover-dt);a.stun=Math.max(0,a.stun-dt);if(a.attack){a.attack.age+=dt;const windup=attackWindup(s,a);if(a.attack.age>=windup)dealAttack(s,a);if(a.attack&&a.attack.age>windup+.21){const heavy=a.attack.heavy,recovery=a.attack.recovery;a.attack=null;a.recover=recovery??(a.kind==='band'?(a.id===s.controlled?(heavy?.32:.19):(heavy?.58:.43)):(heavy?1.05:.72)+(a.id%3)*.1);}}
 if(a.throwing){a.throwing.age+=dt;if(a.throwing.age>.48&&!a.throwing.released){a.throwing.released=true;const fromY=a.y-57,flight=Math.max(.3,a.throwing.flight||.8),vx=(a.throwing.targetX??a.x+a.throwing.face*180)-(a.x+a.throwing.face*24);s.projectiles.push({x:a.x+a.throwing.face*24,y:fromY,groundY:a.y,vx:vx/flight,vy:((a.throwing.targetY??a.y-50)-fromY-18.5*flight*flight)/flight,life:2.2,from:a.id});s.stats.beersThrown++;}if(a.throwing.age>.8){a.throwing=null;a.recover=1.6+(a.id%3)*.1;}}
 if(a.jump>0||a.jumpV>0){a.jump+=a.jumpV*dt;a.jumpV-=450*dt;if(a.jump<0){a.jump=0;a.jumpV=0;}}
 const sep=separation(s,a),oldX=a.x,oldY=a.y;const locked=!!a.attack||!!a.throwing||a.stun>0;a.x=clamp(a.x+((locked?0:a.vx)+sep.sx+a.knock)*dt,35,WORLD-35);a.y=clamp(a.y+((locked?0:a.vy)+sep.sy)*dt,273,373);a.knock*=Math.max(0,1-dt*8);const distance=Math.hypot(a.x-oldX,a.y-oldY);a.walked=distance;a.gait+=distance*.065;}
function startNice(s){s.count++;s.mode='nice';s.niceAge=0;s.nice={count:s.count,age:0,voicePlayed:false};}
function update(s,dt,keys){dt=clamp(Number(dt)||0,0,.05);s.ambientT+=dt;if(s.mode==='won'||s.mode==='lost')return s;if(s.mode==='nice'){s.niceAge+=dt;s.nice.age=s.niceAge;if(s.niceAge>=.45&&!s.nice.voicePlayed){s.nice.voicePlayed=true;s.options.onNice?.(s.count,s);}if(s.niceAge>=2.2){s.mode='fight';s.nice=null;}return s;}
 if(s.count<3&&s.fightT>=s.niceTimes[s.count]){startNice(s);return s;}
 s.fightT+=dt;s.hurtLock=Math.max(0,s.hurtLock-dt);const held=keys||s.keys;
 for(const a of s.band){if(a.id===s.controlled)controlled(s,a,held);else ai(s,a,dt);}for(const e of s.rivals)ai(s,e,dt);
 for(const a of [...s.band,...s.rivals]){if(s.mode!=='fight')break;updateFighter(s,a,dt);}
 if(s.mode!=='fight')return s;
 s.projectiles=s.projectiles.filter(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=37*dt;p.life-=dt;for(const a of s.band){if(Math.abs(p.x-a.x)<23&&Math.abs(p.y-(a.y-50-a.jump))<29&&a.jump<19){damageBand(s,12,{id:p.from},a);p.life=0;break;}}if(p.life<=0||p.y>390){emit(s,'beer',p.x,p.y,'#dcb963',4);return false;}return true;});
 if(s.mode!=='fight')return s;s.particles=s.particles.filter(p=>(p.life-=dt)>0);s.particles.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=180*dt;});
 const lead=s.band[s.controlled];s.camera=clamp(lead.x-255,0,WORLD-W);
 if(s.rivals.every(e=>!e.alive))finish(s,true);return s;
}
function key(s,value,down=true,repeat=false){const k=String(value).toLowerCase();if(!down){s.keys.delete(k);return;}if(s.mode!=='fight')return;if(k==='x'&&!repeat){s.controlled=(s.controlled+1)%3;return;}const a=s.band[s.controlled];if(k===' '&&!repeat&&a.jump===0){a.jump=1;a.jumpV=210;}if(k==='j'&&!repeat)startAttack(s,a,false);if(k==='k'&&!repeat)startAttack(s,a,true);s.keys.add(k);}
function box(ctx,x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
function text(ctx,str,x,y,k=1,c=PAL.cream,center=false){str=String(str).toUpperCase();if(center)x-=str.length*6*k/2;const font=ROOT.CG_FONT;ctx.fillStyle=c;if(!font){ctx.font=`bold ${k*10}px monospace`;ctx.fillText?.(str,x,y+8*k);return;}for(const ch of str){const rows=(font[ch]||'00000/00000/00000/00000/00000/00000/00000').split('/');rows.forEach((r,j)=>[...r].forEach((v,i)=>{if(v==='1')ctx.fillRect(Math.round(x+i*k),Math.round(y+j*k),k,k);}));x+=6*k;}}
function tile(ctx,im,cols,rows,col,row,x,y,w,h,face=1){if(!loaded(im))return false;ctx.save();ctx.translate(Math.round(x),Math.round(y));ctx.scale(face,1);ctx.drawImage(im,col*im.width/cols,row*im.height/rows,im.width/cols,im.height/rows,-w/2,-h,w,h);ctx.restore();return true;}
function prop(ctx,id,x,y,w,h){return tile(ctx,art.props,4,2,id%4,Math.floor(id/4),x,y,w,h);}
function groundShadow(g,x,y,scale=1,jump=0){const half=Math.max(7,16*scale-jump*.12);box(g,x-half,y,half*2,4,'#080b1490');box(g,x-half*.65,y+1,half*1.3,2,'#080b14aa');}
function swingFX(s,g,a,x,y,scale=1){
 if(s.mode!=='fight'||!a.attack)return;
 const phase=a.attack.age-attackWindup(s,a),face=a.face;
 if(phase<0){if(a.attack.heavy){const pulse=Math.floor(s.fightT*14)%2;for(let i=0;i<3;i++)box(g,x+face*(20+i*9)-2,a.y+4-i*3,5,2,pulse?PAL.red:PAL.cream);}return;}
 if(phase>.11)return;
 for(let i=0;i<4;i++){const reach=(29+i*8)*scale,xx=x+face*reach,yy=y-(56-i*5)*scale;box(g,xx-(face<0?9:0),yy,(10-i)*scale,2*scale,i%2?PAL.cream:a.kind==='band'?PAL.cyan:PAL.red);}
}
function bandDraw(s,g,a,back=false){
 const x=a.x-s.camera,y=a.y-a.jump,size=a.giant?3:1,nice=s.mode==='nice',win=s.mode==='won';
 let col=1;if(win)col=6+Math.floor(s.ambientT*5)%2;else if(a.attack)col=a.attack.age<attackWindup(s,a)?4:5;else if(a.walked>.1&&!nice)col=Math.floor(a.gait)%4;
 const windup=a.attack&&a.attack.age<attackWindup(s,a),lean=!nice&&!win&&a.attack?(windup?-a.face*3:a.face*4)*size:0;
 groundShadow(g,x,a.y,size,a.jump);
 const sheet=a.walked>.1&&!a.attack&&!nice&&!win&&loaded(art.walk)?art.walk:art.band,walkSheet=sheet===art.walk;
 tile(g,sheet,8,3,walkSheet?Math.floor(a.gait)%8:col,a.id,x+lean,y+95*size*5/256,99*size,95*size,nice?1:a.face);
 swingFX(s,g,a,x,y,size);
 if(!nice&&!win&&a.walked>.1&&a.jump===0){const dust=Math.floor(a.gait*2)%4;box(g,x-a.face*(18+dust*3),a.y-2-dust,5-dust,2,'#c4ab8477');}
 if(!back){if(nice)shock(g,x,y-65*size,size);if(a.id===s.controlled&&!win){box(g,x-17,a.y+6,34,4,PAL.cyan);box(g,x-11,a.y+7,22,1,PAL.cream);text(g,NAMES[a.id],x,a.y+13,1,PAL.green,true);}}
}
function shock(g,x,y,k=1){box(g,x-9*k,y-3*k,6*k,5*k,'#f6edcc');box(g,x+3*k,y-3*k,6*k,5*k,'#f6edcc');box(g,x-6*k,y-2*k,2*k,3*k,'#181725');box(g,x+6*k,y-2*k,2*k,3*k,'#181725');box(g,x-2*k,y+7*k,5*k,6*k,'#191622');}
function rivalDraw(s,g,e){
 const x=e.x-s.camera;if(x< -95||x>735)return;
 const nice=s.mode==='nice',winding=e.attack&&e.attack.age<attackWindup(s,e),pose=nice||e.stun>0?3:e.throwing?2:e.attack?(winding?Math.floor(e.gait)%2:2):Math.floor(e.gait)%2;
 groundShadow(g,x,e.y,.88);
 const local=e.id%10,sheet=art.rivals[Math.floor(e.id/10)];
 if(!e.alive){g.save();g.globalAlpha=.26;g.translate(Math.round(x),Math.round(e.y));g.rotate(e.face*.6);tile(g,sheet,8,5,(local%2)*4+3,Math.floor(local/2),0,0,66,38,e.face);g.restore();return;}
 const lean=!nice&&(e.attack||e.throwing)?e.face*(winding||e.throwing&&!e.throwing.released?-3:4):0;
 tile(g,sheet,8,5,(local%2)*4+pose,Math.floor(local/2),x+lean,e.y,80,95,nice?1:e.face);
 if(!nice&&e.throwing&&!e.throwing.released)prop(g,7,x+e.face*28,e.y-48,12,16);
 swingFX(s,g,e,x,e.y);
 if(nice)shock(g,x,e.y-64,.75);
 if(e.hp<e.maxHp){box(g,x-17,e.y-99,34,3,'#302736');box(g,x-17,e.y-99,34*e.hp/e.maxHp,3,PAL.red);}
 if(!nice&&s.mode==='fight'){
  const heavy=e.attack?.heavy&&!e.attack.dealt,throwing=e.throwing&&!e.throwing.released;
  if(heavy||throwing){box(g,x-5,e.y-116,10,13,PAL.ink);text(g,heavy?'!':'B',x,e.y-114,1,Math.floor(s.fightT*12)%2?PAL.red:PAL.cream,true);}
  if(e.guard){box(g,x+e.face*25-5,e.y-57,10,17,PAL.cyan);box(g,x+e.face*25-3,e.y-55,6,12,PAL.ink);box(g,x+e.face*25-1,e.y-54,2,10,PAL.cream);}
 }
}
function stageAtmosphere(s,bg){
 for(let i=0;i<6;i++){
  const x=330+i*190-s.camera,beat=(Math.sin(s.ambientT*2.1+i*1.7)+1)/2,color=i%2?'#ea64a40a':'#5cd2d20b';
  for(let row=0;row<7;row++)box(bg,x-row*4,58+row*25,9+row*8,18,color);
  box(bg,x-31,247,72,3,beat>.5?'#df9b7033':'#5cd2d21a');
 }
 for(let i=0;i<22;i++){
  const x=((i*71-s.camera*.6+Math.floor(s.ambientT*4))%760+760)%760-60,y=69+(i*41)%170+Math.floor(Math.sin(s.ambientT*.7+i)*4);
  box(bg,x,y,2,2,i%3?'#d7c9a333':'#a5c4c733');
 }
}
function victoryConfetti(s,g){
 for(let i=0;i<32;i++){
  const age=(s.ambientT*.8+i*.137)%2.6,fall=Math.min(1,age/2),floor=366+i%4*6;
  const x=(i*71+Math.floor(Math.sin(age*3+i)*13)+s.ambientT*4)%640,y=age<2?54+(floor-54)*fall*fall:floor;
  const spin=Math.floor(age*8+i)%3;
  box(g,x,y,age>=2?5:spin===1?2:4,age>=2?2:spin===0?6:3,[PAL.pink,PAL.cyan,PAL.green,PAL.cream][i%4]);
 }
}
function drawBackground(s,bg){bg.clearRect(0,0,W,H);bg.imageSmoothingEnabled=false;box(bg,0,0,W,H,'#211b2f');if(loaded(art.arena)){const im=art.arena,view=im.width*640/WORLD,sx=s.camera/(WORLD-W)*(im.width-view);bg.drawImage(im,sx,0,view,im.height*.83,0,22,W,237);bg.drawImage(im,sx,im.height*.83,view,im.height*.17,0,259,W,161);}for(let i=0;i<10;i++){const x=i*160-s.camera*.35,lit=Math.sin(s.ambientT*3+i)>.2;box(bg,x,45,6,5,lit?(i%2?PAL.pink:PAL.cyan):'#725653');}
 stageAtmosphere(s,bg);
 // Two oversized PA towers bounce above fixed stage bases; their driver faces pump on the beat.
 for(const wx of [400,1030]){
  const x=wx-s.camera,beat=Math.max(0,Math.sin(s.ambientT*12+wx*.017)),hop=Math.floor(beat*5),top=44-hop;
  box(bg,x-46,181,92,8,'#080b1477');box(bg,x-45,184,90,8,'#161922');box(bg,x-39,184,78,3,'#747571');
  box(bg,x-41,top+5,82,130,'#080b12');box(bg,x-36,top,72,140,'#080b12');box(bg,x-35,top+7,70,125,'#252831');
  for(let gy=top+11;gy<top+129;gy+=7)box(bg,x-32,gy,64,2,'#353942');
  box(bg,x-25,top+13,50,15,'#0d121b');box(bg,x-18,top+17,36,6,'#494d51');
  for(const oy of [59,105]){
   const cy=top+oy,push=Math.floor(beat*3),disc=(r,c)=>{for(let yy=-r;yy<=r;yy+=3){const half=Math.floor(Math.sqrt(Math.max(0,r*r-yy*yy))/3)*3;box(bg,x-half,cy+yy,half*2+3,3,c);}};
   disc(24,'#080c14');disc(21,'#747b79');disc(18+push,'#3d4549');disc(13+push,'#222c32');disc(7,'#0c131d');disc(3+Math.floor(beat),'#636d70');
  }
  for(const dx of [-35,29])for(const dy of [5,127]){box(bg,x+dx,top+dy,6,8,'#8b9086');box(bg,x+dx+2,top+dy+2,2,2,'#e4d7bc');}
 }
 // Nice freezes the house band and patrons in reaction poses; room lighting and speakers keep pulsing.
 const bandX=[515,615,738,830,930];bandX.forEach((wx,i)=>{const x=wx-s.camera,y=173,id=24+i,local=id%10,im=art.rivals[Math.floor(id/10)],nice=s.mode==='nice',pose=nice?3:Math.floor(s.ambientT*6+i)%2;bg.save();if(i===2){bg.beginPath();bg.rect(x-42,y-78,84,58);bg.clip();}tile(bg,im,8,5,(local%2)*4+pose,Math.floor(local/2),x+(!nice?Math.round(Math.sin(s.ambientT*7+i)):0),y,71,73,1);bg.restore();if(nice)shock(bg,x,y-51,.6);});
 if(loaded(art.arena)){const im=art.arena,view=im.width*640/WORLD,sx=s.camera*im.width/WORLD,cx=im.width*.434,cy=im.height*.378,cw=im.width*.155,ch=im.height*.155;bg.drawImage(im,cx,cy,cw,ch,(cx-sx)/view*640,22+cy/(im.height*.83)*237,cw/view*640,ch/(im.height*.83)*237);}
 // Varied adult patrons cluster around the actual bar on the left, rather than forming a world-wide parade.
 const patrons=[{x:47,y:210,row:0,w:44,h:66,face:1},{x:139,y:214,row:3,w:46,h:70,face:-1},{x:210,y:217,row:1,w:47,h:72,face:-1},{x:88,y:225,row:2,w:45,h:69,face:1},{x:173,y:228,row:0,w:49,h:74,face:-1},{x:35,y:235,row:1,w:48,h:73,face:1},{x:125,y:240,row:3,w:47,h:72,face:1},{x:226,y:240,row:2,w:45,h:70,face:-1}];
 patrons.forEach((p,i)=>{const x=p.x-s.camera;if(x< -60||x>700)return;const nice=s.mode==='nice',bounce=!nice?Math.max(0,Math.sin(s.ambientT*5+i*1.8))*3:0,pose=nice?3:p.row<2?4:2;box(bg,x-p.w*.25,p.y+1,p.w*.5,3,'#12162288');tile(bg,art.crowd,6,4,pose,p.row,x,p.y-bounce,p.w,p.h,nice?1:p.face);if(nice)shock(bg,x,p.y-p.h*.68,.46);});


}
function draw(s,contexts){const g=contexts.g,bg=contexts.bg;if(!g||!bg)return;drawBackground(s,bg);g.clearRect(0,0,W,H);g.imageSmoothingEnabled=false;const all=[...s.rivals.map(e=>({y:e.y,draw:()=>rivalDraw(s,g,e)})),...s.band.map(a=>({y:a.y,draw:()=>bandDraw(s,g,a)}))];all.sort((a,b)=>a.y-b.y).forEach(a=>a.draw());for(const p of s.projectiles)prop(g,7,p.x-s.camera,p.y+7,13,18);for(const p of s.particles){const size=p.type==='ko'?4:3;box(g,p.x-s.camera,p.y,size,size,p.color);if((p.type==='hit'||p.type==='guard')&&p.life>.36){box(g,p.x-s.camera-3,p.y+1,9,2,p.color);box(g,p.x-s.camera+1,p.y-3,2,9,PAL.cream);}}
 box(g,0,0,W,25,PAL.ink);text(g,'CG BAND',8,8,1,PAL.green);box(g,58,6,155,11,'#403540');box(g,59,7,153*Math.max(0,s.hp)/s.maxHp,9,s.hp<75?PAL.red:PAL.green);text(g,'RIVALS '+(30-s.defeated)+'/30',230,8,1,PAL.cream);text(g,'SCORE '+s.score,445,8,1,PAL.cream);
 if(s.mode==='fight'||s.mode==='nice'){box(g,0,25,W,17,'#272135');for(let i=0;i<10;i++){const living=s.rivals.filter(e=>e.team===i&&e.alive).length;box(g,10+i*13,29,10,8,living?PAL.red:'#453a49');box(g,11+i*13,31,living*2,4,living?PAL.cream:'#453a49');}text(g,'FINAL BATTLE',153,30,1,PAL.pink);text(g,Math.floor(s.fightT/6)%2?'MOVE / JUMP TO DODGE BEER':'K HEAVY BREAKS BLUE GUARDS',315,30,1,PAL.cyan);box(g,0,398,W,22,PAL.ink);text(g,'X SWITCH  J STRIKE  K HEAVY  SPACE JUMP  L DASH',10,406,1,PAL.cream);text(g,NAMES[s.controlled],548,406,1,PAL.cyan);}
 if(s.mode==='nice'){const f=clamp(Math.floor(s.niceAge*5.5),0,5),entry=clamp(s.niceAge/.32,0,1),exit=clamp((s.niceAge-1.88)/.32,0,1),reactionY=s.niceAge<.32?548-Math.floor(entry*38)*4:396+Math.floor(exit*38)*4;tile(g,art.reaction,6,2,f,0,250,reactionY,110,125);tile(g,art.reaction,6,2,f,1,395,reactionY,110,125);if(s.niceAge>=.35&&Math.floor(s.niceAge*8)%2===0){box(g,96,76,448,42,'#111521e0');text(g,'NIIIICCCEEEEE',320,88,3,PAL.pink,true);}}if(s.mode==='won'){box(g,100,28,440,47,'#111521e8');text(g,'TOWN CHAMPIONS',320,36,3,PAL.green,true);text(g,'TEN BANDS. THIRTY RIVALS. ONE CIRCUS GENETIC.',320,64,1,PAL.cream,true);victoryConfetti(s,g);}if(s.mode==='lost'){box(g,110,128,420,75,'#111521ed');text(g,'THE BAND GOES DOWN',320,145,2,PAL.red,true);text(g,'FINAL SCORE '+s.score,320,180,1,PAL.cream,true);}}
return Object.freeze({create,update,key,draw});
});
