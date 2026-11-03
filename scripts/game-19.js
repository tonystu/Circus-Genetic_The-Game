/* Circus Genetic v6: independent foreground cameos, patio crowd and support cast. */
(function(root){
 'use strict';
 const W=640,H=420,P={ink:'#11121b',edge:'#05060a',cream:'#f4e4bd',orange:'#ed873c',purple:'#aa87c9',cyan:'#42c7d2',pink:'#e968a5',green:'#b6da67'};
 const colors=['#bf463f','#3975a4','#c39742','#7950ac','#2a9ba6','#a8553e','#4b6d94','#538c59','#994d76'];
 const skins=['#f0ba8b','#c18b65','#e1a879','#b77955','#e7b184','#cb936d','#955d43','#deb18b','#efc4a1'];
 const hair=['#b42f25','#171b29','#e1bf64','#684b94','#246eaa','#8a3827','#c4c1c4','#317348','#111321'];
 const loaded=im=>!!(im&&im.complete&&im.naturalWidth>0);
 const art={};
 for(const [key,file] of Object.entries({practice:'practice-cameos-v6.webp',faces:'roulette-faces-v5.png'})){
  if(typeof Image==='function'){const im=new Image();im.src='assets/'+file;art[key]=im;}
 }
 const reduce=()=>!!(root.matchMedia&&root.matchMedia('(prefers-reduced-motion: reduce)').matches);
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 function rng(seed){let s=(Number(seed)||0x9e3779b9)>>>0;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return(s>>>0)/4294967296;};}
 function create(seed){
  if(seed===undefined)seed=Math.floor(Math.random()*4294967296);
  const random=rng(seed),order=Array.from({length:9},(_,i)=>i);
  for(let i=8;i>0;i--){const j=Math.floor(random()*(i+1));[order[i],order[j]]=[order[j],order[i]];}
  return {seed:seed>>>0,groupieOrder:order,practicePhase:0,followers:[],followerPicks:[],followerTime:null,niceToken:null};
 }
 let current=create();
 function beginRun(seed){current=create(seed);return current;}
 function rect(g,x,y,w,h,c){g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
 function poly(g,points,c){g.fillStyle=c;g.beginPath();points.forEach((p,i)=>i?g.lineTo(Math.round(p[0]),Math.round(p[1])):g.moveTo(Math.round(p[0]),Math.round(p[1])));g.closePath();g.fill();}
 function line(g,x1,y1,x2,y2,width,c){
  const n=Math.max(1,Math.ceil(Math.hypot(x2-x1,y2-y1)/2));
  for(let i=0;i<=n;i++){const a=i/n;rect(g,x1+(x2-x1)*a-width/2,y1+(y2-y1)*a-width/2,width,width,c);}
 }
 function words(g,s,x,y,k=1,color=P.cream,center=false){
  s=String(s).toUpperCase();if(center)x-=((s.length*6-1)*k)/2;
  const font=root.CG_FONT||{};
  if(!Object.keys(font).length){g.fillStyle=color;g.font=`${Math.max(7,k*8)}px monospace`;g.textAlign=center?'center':'left';g.fillText(s,Math.round(x+(center?((s.length*6-1)*k)/2:0)),Math.round(y+k*7));return;}
  for(const c of s){const rows=(font[c]||'00000/00000/00000/00000/00000/00000/00000').split('/');rows.forEach((row,j)=>[...row].forEach((v,i)=>{if(v==='1')rect(g,x+i*k,y+j*k,k,k,color);}));x+=6*k;}
 }
 function slide(age,hold=4,entry=.55,exit=.6){
  if(age<0||age>entry+hold+exit)return 0;
  if(reduce())return 1;
  const a=age<entry?age/entry:age>entry+hold?1-(age-entry-hold)/exit:1;
  return 1-(1-clamp(a,0,1))**3;
 }
 function atlasPose(g,row,col,x,y,w,h){
  if(!loaded(art.practice))return false;
  const sw=art.practice.naturalWidth/4,sh=art.practice.naturalHeight/3;
  g.drawImage(art.practice,col*sw,row*sh,sw,sh,Math.round(x),Math.round(y),Math.round(w),Math.round(h));return true;
 }
 function face(g,id,x,y,w,h){
  id=((id%9)+9)%9;
  if(loaded(art.faces)){
   const sw=art.faces.naturalWidth/3,sh=art.faces.naturalHeight/3;
   g.save();
   // A stepped silhouette avoids framing a portrait tile as a floating card.
   poly(g,[[x+w*.21,y],[x+w*.78,y],[x+w*.91,y+h*.14],[x+w,y+h*.41],[x+w*.90,y+h*.77],[x+w*.71,y+h],[x+w*.28,y+h],[x+w*.09,y+h*.77],[x,y+h*.41],[x+w*.09,y+h*.14]],P.ink);
   g.clip();g.drawImage(art.faces,(id%3)*sw,Math.floor(id/3)*sh,sw,sh*.82,x,y,w,h);g.restore();
  }else{
   rect(g,x+w*.12,y,w*.76,h*.7,hair[id]);rect(g,x+w*.21,y+h*.2,w*.58,h*.67,skins[id]);
   rect(g,x+w*.25,y+h*.40,w*.14,h*.07,P.ink);rect(g,x+w*.61,y+h*.40,w*.14,h*.07,P.ink);rect(g,x+w*.39,y+h*.69,w*.23,h*.06,'#7a3438');
  }
 }
 function limb(g,a,b,c,width,skin,clothing){
  line(g,a[0],a[1],b[0],b[1],width+3,P.edge);line(g,b[0],b[1],c[0],c[1],width+2,P.edge);
  line(g,a[0],a[1],b[0],b[1],width,clothing);line(g,b[0],b[1],c[0],c[1],Math.max(3,width-1),skin);
  rect(g,c[0]-width*.45,c[1]-width*.45,width,width,skin);
 }
 function drawGroupie(g,{id=0,x=320,y=370,height=150,t=0,pose='cheer',face:direction=1,back=false,muted=false}={}){
  id=((id%9)+9)%9;const h=height,s=h/150,still=reduce(),phase=still?0:t*5+id*1.19;
  const lift=pose==='jump'||pose==='cheer'?Math.max(0,Math.sin(phase))*h*.025:0;
  const base=y-lift,skin=skins[id],shirt=colors[id];
  g.save();g.translate(Math.round(x),Math.round(base));g.scale(direction,1);
  // Soles and a perspective shadow remain at the true support plane.
  if(!back){g.save();g.globalAlpha=.28;rect(g,-h*.15,lift-2,h*.30,4*s,P.edge);g.restore();}
  const stride=pose==='walk'||pose==='chase'?Math.sin(phase)*12*s:0;
  const hipY=-h*.40,kneeY=-h*.22,ankleY=-6*s;
  for(const side of [-1,1]){
   const off=side*7*s,step=stride*side;
   limb(g,[off,hipY],[off-step*.35,kneeY],[off+step,ankleY],8*s,'#363248','#363248');
   rect(g,off+step-6*s,-5*s,15*s,5*s,P.edge);rect(g,off+step-5*s,-3*s,13*s,3*s,'#f2e4c7');
  }
  poly(g,[[-21*s,-h*.71],[-14*s,-h*.78],[14*s,-h*.78],[22*s,-h*.70],[18*s,-h*.40],[-17*s,-h*.40]],P.edge);
  poly(g,[[-18*s,-h*.70],[-12*s,-h*.75],[12*s,-h*.75],[19*s,-h*.69],[15*s,-h*.42],[-14*s,-h*.42]],shirt);
  rect(g,-15*s,-h*.45,30*s,5*s,P.ink);
  const shoulderY=-h*.70,elbowY=-h*.54;
  for(const side of [-1,1]){
   const cheer=pose==='cheer'||pose==='jump'||pose==='nice',run=pose==='walk'||pose==='chase';
   const wave=still?0:Math.sin(phase+side)*7*s;
   const elbow=cheer?[side*29*s,-h*.85+wave]:run?[side*(26*s+stride*.35),elbowY+side*stride*.2]:[side*26*s,elbowY];
   const hand=cheer?[side*(27*s+wave*.4),-h*1.0+wave]:run?[side*19*s,-h*.45-side*stride*.7]:[side*19*s,-h*.44];
   limb(g,[side*17*s,shoulderY],elbow,hand,7*s,skin,shirt);
  }
  if(back){
   // Back view: the opaque undershirt remains in place during the implied gag.
   rect(g,-14*s,-h*.75,28*s,44*s,'#171925');
   if(pose==='nice'){rect(g,-21*s,-h*.76,42*s,9*s,shirt);rect(g,-20*s,-h*.70,40*s,5*s,shirt);}
   poly(g,[[-18*s,-h*.96],[-9*s,-h*1.04],[12*s,-h*1.04],[22*s,-h*.93],[23*s,-h*.74],[15*s,-h*.65],[-18*s,-h*.68],[-23*s,-h*.85]],hair[id]);
   rect(g,-13*s,-h*.94,4*s,26*s,id===2?'#f0cf76':id===6?'#e5e0d3':'#ffffff14');
  }else{
   rect(g,-5*s,-h*.80,10*s,12*s,skin);face(g,id,-27*s,-h*1.07,54*s,52*s);
  }
  g.restore();return {x,y,height:h,nonColliding:true,damage:0};
 }
 function drawRhythm({g,t=0,elapsed=t,kind='practice',state=current}={}){
  if(!g||kind==='soundcheck')return;
  g.save();g.imageSmoothingEnabled=false;g.beginPath();g.rect(0,236,W,H-236);g.clip();
  if(kind==='practice'){
   const cycle=Math.floor(elapsed/13),a=elapsed-cycle*13;
   const mates=slide(a-.2,4.4,.7,.65),neighbor=slide(a-6.6,4.9,.7,.7);
   if(mates>0){
    const x=640-(640-316)*mates,h=182,w=205,pose=reduce()?0:Math.floor(t*4)%4;
    atlasPose(g,0,pose,x,420-h,w,h);
    atlasPose(g,1,(pose+2)%4,x+144,420-h+4,w,h);
   }
   if(neighbor>0){
    const x=640-(640-445)*neighbor,h=184,w=207,pose=reduce()?0:Math.floor(t*3.4)%4;
    const shake=reduce()?0:Math.round(Math.sin(t*12)*2);
    atlasPose(g,2,pose,x+shake,420-h,w,h);
   }
  }else{
   const cycle=Math.floor(elapsed/8.5),age=elapsed-cycle*8.5;
   const enter=slide(age-.1,6,.5,.6),ids=[state.groupieOrder[(cycle*2)%9],state.groupieOrder[(cycle*2+4)%9]];
   if(enter>0){
    const left=-100+160*enter,right=740-158*enter;
    drawGroupie(g,{id:ids[0],x:left,y:494,height:245,t,pose:'jump',face:1});
    drawGroupie(g,{id:ids[1],x:right,y:492,height:243,t:t+.6,pose:'cheer',face:-1});
   }
  }
  g.restore();
 }
 function patioPerson(g,{x,y,h,id,t,upset,frozen=false}){
  const s=h/72,phase=reduce()||frozen?0:t*3+id,headX=upset&&!frozen?Math.round(Math.sin(phase*2)*2*s):0;
  rect(g,x-8*s,y-27*s,6*s,27*s,'#27283d');rect(g,x+3*s,y-27*s,6*s,27*s,'#27283d');
  rect(g,x-14*s,y-48*s,28*s,25*s,colors[id%9]);
  for(const side of [-1,1]){
   const yy=frozen?y-39*s:upset?y-46*s:y-71*s+Math.sin(phase+side)*4*s;
   limb(g,[x+side*12*s,y-44*s],[x+side*20*s,y-53*s],[x+side*17*s,yy],4*s,skins[id%9],colors[id%9]);
  }
  face(g,id,x-12*s+headX,y-73*s,24*s,26*s);
  if(frozen){rect(g,x-7*s,y-63*s,5*s,5*s,P.cream);rect(g,x+2*s,y-63*s,5*s,5*s,P.cream);rect(g,x-3*s,y-54*s,6*s,6*s,P.ink);}
  else if(upset){rect(g,x-5*s+headX,y-65*s,4*s,2*s,P.ink);rect(g,x+2*s+headX,y-64*s,4*s,2*s,P.ink);rect(g,x-3*s+headX,y-53*s,7*s,2*s,P.ink);}
  else{rect(g,x-3*s+headX,y-55*s,7*s,5*s,'#552a35');rect(g,x-2*s+headX,y-55*s,5*s,2*s,P.cream);}
 }
 function drawWindow({g,t=0,kind='show',rect:area={x:280,y:70,w:295,h:140},camera=0,world=false,state=current,caption=true,retainBackdrop=false}={}){
  if(!g||!area||area.w<12||area.h<12)return;
  const x=area.x-(world?camera:0),y=area.y,w=area.w,h=area.h;if(x+w<0||x>W)return;
  const upset=kind==='soundcheck'||kind==='mixer';
  g.save();g.imageSmoothingEnabled=false;
  if(!retainBackdrop){rect(g,x-4,y-4,w+8,h+8,'#17101b');rect(g,x-1,y-1,w+2,h+2,'#7b6973');rect(g,x+3,y+3,w-6,h-6,'#111b37');}
  g.beginPath();g.rect(x+5,y+5,w-10,h-10);g.clip();
  if(!retainBackdrop)rect(g,x+5,y+h*.75,w-10,h*.25,'#3b3449');
  for(let i=0;i<6;i++){
   const lampX=x+12+i*(w-24)/5,dim=reduce()?false:Math.sin(t*1.4+i)<-.8;
   rect(g,lampX,y+h*.13,3,4,dim?'#6d4979':i%2?P.pink:P.cyan);
  }
  for(const offset of retainBackdrop?[]:[.13,.57]){
   const bx=x+w*offset,by=y+h*.77,bw=w*.28;
   rect(g,bx,by,bw,4,'#8a6b55');rect(g,bx,by-8,bw,3,'#82634f');rect(g,bx+4,by+3,3,h*.14,'#614535');rect(g,bx+bw-7,by+3,3,h*.14,'#614535');
  }
  for(let i=0;i<3;i++)patioPerson(g,{x:x+w*(.18+i*.31),y:y+h*.88,h:h*.56,id:(state?.groupieOrder||current.groupieOrder)[(i+2)%9],t:t+i*.5,upset,frozen:state?.mode==='nice'});
  // Pane reflections and the sash are in front of the patio, behind musicians.
  g.globalAlpha=.15;rect(g,x+w*.18,y+6,4,h-12,'#96e2f1');rect(g,x+w*.20+5,y+6,2,h-12,'#96e2f1');g.globalAlpha=1;
  g.restore();rect(g,x+w*.49,y+1,5,h-2,'#6c6473');rect(g,x+2,y+h*.47,w-4,4,'#6c6473');
  if(caption&&upset){
   const show=reduce()||Math.floor(t*2)%5<3;
   if(show){const scale=1;rect(g,x+w*.5-66*scale,y+8,132*scale,17*scale,'#f4e4bdee');words(g,'THIS BAND SUCKS!',x+w*.5,y+13*scale,scale,'#35232b',true);}
  }
 }
 function crowdBack(g,x,y,h,id,t,pose='cheer'){
  const jump=reduce()?0:Math.max(0,Math.sin(t*5+id*.73))*6;
  drawGroupie(g,{id:id%9,x,y:y-jump,height:h,t:t+id*.2,pose,back:true});
 }
 function drawEncoreCrowd({g,t=0,count=15,bottom=462,state=current,intensity=1}={}){
  if(!g)return;g.save();g.beginPath();g.rect(0,275,W,H-275);g.clip();
  for(let row=0;row<2;row++)for(let i=0;i<count;i++){
   const x=-20+i*(680/(count-1))+(row?15:0),y=bottom+(row?24:0),h=(row?132:101)*intensity;
   crowdBack(g,x,y,h,state.groupieOrder[(i+row*4)%9],t+i*.21,row?'cheer':'jump');
  }
  g.restore();
 }
 function updateFollowers(state,dt,{player,picks=[],worldWidth=2400}={}){
  if(!state||!player)return [];
  const clean=[...new Set(picks.filter(i=>Number.isInteger(i)&&i>=0&&i<9))].slice(0,3);
  const changed=clean.join(',')!==state.followerPicks.join(',')||!!(state.followers[0]&&Math.abs(state.followers[0].x-player.x)>450);
  if(changed){state.followerPicks=clean;state.followers=clean.map((id,i)=>({id,x:clamp(player.x-(player.face||1)*(55+i*29),20,worldWidth-20),y:player.y-10-i*4,step:i*2,vx:0,vy:0,nonColliding:true,damage:0}));}
  const smooth=1-Math.exp(-clamp(dt,0,.08)*7),faceDir=player.face||1;
  let lead={x:player.x-faceDir*53,y:player.y-11};
  state.followers.forEach((f,i)=>{
   const target={x:clamp(lead.x-faceDir*(i?33:0),20,worldWidth-20),y:lead.y-(i?4:0)};
   const ox=f.x,oy=f.y;f.x+=(target.x-f.x)*smooth;f.y+=(target.y-f.y)*smooth;
   f.vx=dt?(f.x-ox)/dt:0;f.vy=dt?(f.y-oy)/dt:0;f.step+=Math.hypot(f.x-ox,f.y-oy)/13;f.face=Math.abs(f.vx)>4?Math.sign(f.vx):faceDir;
   lead={x:f.x,y:f.y};
  });return state.followers;
 }
 function drawFollowers({g,t=0,state=current,player,picks=[],camera=0,worldWidth=2400,height=152,dt}={}){
  if(!g||!player)return [];
  const delta=dt===undefined?(state.followerTime===null?.016:Math.max(0,t-state.followerTime)):dt;state.followerTime=t;
  const followers=updateFollowers(state,delta,{player,picks,worldWidth});
  g.save();followers.slice().sort((a,b)=>a.y-b.y).forEach(f=>{
   const x=f.x-camera;if(x< -90||x>W+90)return;
   const depth=clamp(.91+(f.y-290)/330,.84,1.13),moving=Math.hypot(f.vx,f.vy)>8;
   drawGroupie(g,{id:f.id,x,y:f.y,height:height*depth,t:moving?f.step/5:t*.45,pose:moving?'walk':'cheer',face:f.face});
  });g.restore();return followers;
 }
 function drawNice({g,age=0,t=age,count=0,state=current,showNice=false,duration=2.2}={}){
  if(!g)return;
  const enter=reduce()?1:clamp(age/.36,0,1),leave=reduce()?0:clamp((age-(duration-.35))/.35,0,1);
  const eased=1-(1-enter)**3,offset=(1-eased)*240+leave*240;
  const ids=[state.groupieOrder[(count*2)%9],state.groupieOrder[(count*2+3)%9]];
  g.save();g.beginPath();g.rect(0,190,W,230);g.clip();
  for(let i=0;i<2;i++)drawGroupie(g,{id:ids[i],x:i?405:235,y:451+offset,height:202,t:t+i*.4,pose:age>.48?'nice':'cheer',back:true});
  if(age>.1&&age<.85){rect(g,218,212,204,28,'#f4e4bd');words(g,'HEY BOYS!!',320,219,2,P.ink,true);}
  g.restore();
  if(showNice&&age>.6&&(reduce()||Math.floor(t*6)%2===0)){rect(g,84,72,472,44,'#11121be8');words(g,'NIIIICCCEEEEE',320,84,3,P.pink,true);}
 }
 function speakHey({muted=false}={}){
  if(muted||!root.speechSynthesis||typeof root.SpeechSynthesisUtterance!=='function')return false;
  try{const utterance=new root.SpeechSynthesisUtterance('Hey boys!');utterance.rate=1.14;utterance.pitch=1.45;utterance.volume=.8;const voice=root.speechSynthesis.getVoices().find(v=>/female|zira|samantha|victoria/i.test(v.name));if(voice)utterance.voice=voice;root.speechSynthesis.speak(utterance);return true;}catch(_){return false;}
 }
 const api={create,beginRun,drawRhythm,drawWindow,drawEncoreCrowd,updateFollowers,drawFollowers,drawGroupie,drawNice,speakHey,art,slide};
 root.CGV6Cameos=api;
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
