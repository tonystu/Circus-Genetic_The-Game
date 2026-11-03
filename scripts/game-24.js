/* Layered Circus Genetic title. Source figures and lettering are preserved pixels. */
(() => {
 'use strict';
 const title=document.getElementById('title');if(!title)return;
 const W=1448,H=1086,GROUND=954;
 const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)');
 const cream='#f4e4bd',ink='#080b10',warm='#efaa55',cool='#5bbdce';
 const style=document.createElement('style');
 style.textContent=`#title .v6-title-layer{position:absolute;inset:0;width:100%;height:100%;image-rendering:pixelated;pointer-events:none;z-index:0}#title .v6-title-actors{z-index:1}#title .v6-title-front{z-index:2}#title.v6-title-ready>.art,#title.v6-title-ready>.titleMotion{visibility:hidden}#title.v6-title-ready>.titlemenu{position:relative;z-index:6}`;
 document.head.appendChild(style);
 const layer=name=>{const c=document.createElement('canvas');c.width=W;c.height=H;c.className='v6-title-layer v6-title-'+name;c.setAttribute('aria-hidden','true');title.insertBefore(c,title.firstChild);const g=c.getContext('2d');g.imageSmoothingEnabled=false;return {c,g};};
 const back=layer('back'),actors=layer('actors'),front=layer('front');
 const original=new Image(),plate=new Image();let ready=false,people=[],last=null,time=0,lastFrame=-1;
 let pointer={x:0,y:0},camera={x:0,y:0};
 const paths=[
  {x:0,y:125,w:424,h:829,hip:747,neck:313,phase:.1,points:[[0,367],[39,349],[68,333],[103,317],[111,292],[96,267],[88,237],[88,198],[96,164],[119,147],[153,134],[191,134],[219,145],[242,161],[253,191],[251,225],[243,250],[226,276],[229,309],[265,329],[292,356],[315,390],[340,417],[361,449],[369,481],[366,510],[345,546],[365,614],[388,673],[405,724],[416,764],[408,795],[389,816],[366,820],[348,800],[336,779],[320,762],[309,744],[309,815],[310,891],[315,954],[0,954]]},
  {x:354,y:205,w:362,h:755,hip:721,neck:393,phase:2.3,points:[[498,216],[535,208],[573,212],[594,224],[607,246],[612,269],[602,285],[602,318],[591,348],[577,370],[566,382],[578,398],[615,407],[649,427],[674,455],[689,489],[703,530],[711,559],[697,590],[700,620],[692,648],[678,670],[651,684],[642,720],[647,791],[645,854],[636,898],[647,914],[663,937],[657,955],[625,960],[598,954],[578,940],[558,950],[520,960],[477,959],[445,953],[430,942],[432,925],[443,911],[459,892],[462,858],[454,806],[449,758],[435,714],[425,684],[399,669],[386,645],[370,631],[358,609],[360,584],[372,560],[372,527],[381,489],[398,455],[420,433],[454,413],[484,399],[487,378],[478,353],[474,329],[473,302],[471,278],[480,248]]},
  {x:1155,y:175,w:293,h:781,hip:760,neck:363,phase:4.7,points:[[1288,191],[1323,181],[1363,189],[1391,208],[1411,240],[1410,270],[1392,295],[1377,327],[1383,347],[1415,365],[1448,391],[1448,956],[1160,956],[1178,881],[1187,819],[1193,760],[1206,688],[1214,658],[1228,636],[1238,614],[1224,584],[1211,569],[1207,534],[1200,493],[1217,452],[1227,418],[1241,388],[1255,369],[1254,351],[1237,341],[1225,317],[1219,289],[1226,269],[1244,251],[1216,241],[1240,232],[1260,210]]}
 ];
 function box(g,x,y,w,h,color){g.fillStyle=color;g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
 function makePeople(){
  people=paths.map(p=>{const c=document.createElement('canvas');c.width=p.w;c.height=p.h;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.beginPath();p.points.forEach(([x,y],i)=>i?g.lineTo(x-p.x,y-p.y):g.moveTo(x-p.x,y-p.y));g.closePath();g.clip();g.drawImage(original,-p.x,-p.y,W,H);return {...p,c};});
 }
 function loaded(){if(ready||!original.complete||!original.naturalWidth||!plate.complete||!plate.naturalWidth)return;makePeople();ready=true;title.classList.add('v6-title-ready');lastFrame=-1;}
 original.onload=loaded;plate.onload=loaded;
 original.src=window.CG_ASSETS?.['assets/title-v3.png']||'assets/title-v3.webp';
 plate.src='assets/title-depth-v6.webp';
 title.addEventListener('pointermove',event=>{if(reduced?.matches)return;const r=title.getBoundingClientRect();if(r.width&&r.height){pointer.x=Math.max(-4,Math.min(4,((event.clientX-r.left)/r.width-.5)*8));pointer.y=Math.max(-2,Math.min(2,((event.clientY-r.top)/r.height-.5)*4));}});
 title.addEventListener('pointerleave',()=>{pointer.x=0;pointer.y=0;});
 function artHeight(){const tr=title.getBoundingClientRect(),mr=title.querySelector('.titlemenu')?.getBoundingClientRect();return tr.height&&mr?Math.max(780,Math.min(GROUND,Math.round((mr.top-tr.top)/tr.height*H))):GROUND;}
 function prepare(g,h){g.clearRect(0,0,W,H);g.save();g.scale(1,h/GROUND);}
 function finish(g){g.restore();}
 function leaf(g,x,y,size,color,flip=false){const s=size;box(g,x+s,y,s*2,s,color);box(g,x,y+s,s*4,s,color);box(g,x+s,y+s*2,s*2,s,color);box(g,x+(flip?s*2:s),y+s*3,s,s,'#8e572f');}
 function drawBack(t,h){
  const g=back.g;prepare(g,h);const dx=Math.round(camera.x*.3),dy=Math.round(camera.y*.2);
  box(g,0,0,W,GROUND,ink);g.drawImage(plate,0,0,W,GROUND,dx,dy,W,GROUND);
  // Restore original glyph pixels exactly. This patch stays in the wall plane.
  g.drawImage(original,720,250,478,325,720+dx,250+dy,478,325);
  // The upper fence/vines move less than the nearer ground and musicians.
  if(!reduced?.matches){
   const vines=Math.round(Math.sin(t*.67)*2);
   g.drawImage(plate,421,0,1027,205,421+dx+vines,dy,1027,205);
   for(let i=0;i<7;i++){const x=456+i*133,y=115+(i%3)*23,phase=Math.sin(t*.9+i);if(phase>.55){box(g,x+dx,y+dy,4,4,i%2?'#c9bd54':'#a6b540');box(g,x+4+dx,y+4+dy,4,4,'#787a32');}}
  }
  // A restrained stepped light catches the timber seams and wall, not the logo.
  const warmStep=reduced?.matches?1:Math.floor((Math.sin(t*.8)+1)*2);
  const coolStep=reduced?.matches?1:Math.floor((Math.sin(t*.57+2)+1)*2);
  g.globalAlpha=.06+warmStep*.025;box(g,31,124,9,578,warm);box(g,238,247,6,373,warm);g.globalAlpha=.04+coolStep*.018;box(g,1429,204,6,508,cool);g.globalAlpha=1;
  finish(g);
 }
 function shadow(g,x,y,w){g.globalAlpha=.45;box(g,x-w/2,y,w,5,'#080b10');box(g,x-w/2+11,y-3,w-22,3,'#080b10');g.globalAlpha=1;}
 function drawPerson(g,p,i,t){
  const phase=t*(.9+i*.13)+p.phase,breath=reduced?.matches?0:Math.sin(phase),sway=reduced?.matches?0:Math.sin(phase*.71)*2.4;
  const waist=p.hip-p.y,scale=1+breath*.0025,px=Math.round(camera.x*.58);
  // Feet and lower legs stay fixed. A tiny pixel-stepped torso sway/breath
  // uses two source draws, avoiding costly per-scanline canvas snapshots.
  g.drawImage(p.c,0,waist,p.w,p.h-waist,p.x+px,p.hip,p.w,p.h-waist);
  const upperHeight=Math.round(waist*scale),shift=Math.round(sway);
  g.drawImage(p.c,0,0,p.w,waist,p.x+px+shift,p.hip-upperHeight,p.w,upperHeight);
 }
 function drawActors(t,h){
  const g=actors.g;prepare(g,h);shadow(g,152,953,200);shadow(g,543,955,191);shadow(g,1310,953,216);
  people.forEach((p,i)=>drawPerson(g,p,i,t));
  // Small source-atop rim pixels respect the actual character silhouettes.
  g.save();g.globalCompositeOperation='source-atop';g.globalAlpha=reduced?.matches?.12:.09+Math.max(0,Math.sin(t*.9))*.1;
  for(const [x,y] of [[42,395],[370,605],[401,472],[670,532],[1209,497],[1427,413]]){box(g,x+Math.round(camera.x*.58),y,5,18,x<750?warm:cool);box(g,x+4+Math.round(camera.x*.58),y+18,4,11,x<750?warm:cool);}g.restore();
  if(!reduced?.matches){const glint=t%7;if(glint<.55){const x=133+Math.floor(glint/.55*59);box(g,x,213,4,8,'#ffe6ad');}const cap=(t+2)%8;if(cap<.4)box(g,521+Math.floor(cap/.4*28),232,4,3,'#a7ecdf');}
  finish(g);
 }
 function cable(g,dx){
  g.strokeStyle=ink;g.lineWidth=8;g.lineJoin='miter';g.lineCap='square';g.beginPath();g.moveTo(1034+dx,891);g.lineTo(1114+dx,917);g.lineTo(1106+dx,937);g.lineTo(791+dx,937);g.lineTo(769+dx,922);g.lineTo(705+dx,922);g.lineTo(677+dx,945);g.lineTo(581+dx,945);g.stroke();g.strokeStyle='#5a5045';g.lineWidth=2;g.stroke();
 }
 function roadCase(g,x,y){
  shadow(g,x+104,y+88,230);box(g,x,y,211,80,'#080b10');box(g,x+5,y+5,201,70,'#343641');box(g,x+11,y+11,189,58,'#242933');for(let i=0;i<43;i++){const xx=x+15+(i*31)%179,yy=y+15+(i*17)%49;box(g,xx,yy,2+i%3*2,2,i%3?'#343d46':'#48505a');}
  box(g,x+7,y+7,197,4,'#939da1');box(g,x+7,y+69,197,4,'#606b74');box(g,x+4,y+8,4,62,'#7e888d');box(g,x+203,y+8,4,62,'#5b6871');
  for(const px of [15,177]){box(g,x+px,y+4,19,9,'#b7b6a4');box(g,x+px+3,y+7,13,3,'#3c4148');box(g,x+px,y+65,19,9,'#868d90');}
  box(g,x+82,y+28,47,15,'#080b10');box(g,x+89,y+31,33,7,'#626e74');box(g,x+21,y+79,15,9,'#0b1018');box(g,x+175,y+79,15,9,'#0b1018');
  // Scuffed stickers belong to the case, with no additional menu text.
  box(g,x+23,y+25,37,22,'#efaa55');box(g,x+27,y+29,29,4,'#462f2e');box(g,x+31,y+37,16,4,'#462f2e');box(g,x+144,y+44,37,16,'#c6d9bd');box(g,x+149,y+49,26,4,'#35534d');
 }
 function drawFront(t,h){
  const g=front.g;prepare(g,h);const dx=Math.round(camera.x),dy=Math.round(camera.y*.35);
  // A close strip of leaf litter occupies its own foreground depth plane.
  g.drawImage(plate,718,905,430,49,718+dx,905+dy,430,49);
  roadCase(g,855+dx,815+dy);cable(g,dx);
  // Pedals rest flat on the pavement. Their LEDs blink independently.
  shadow(g,806+dx,944,76);box(g,776+dx,921,61,22,'#080b10');box(g,780+dx,917,53,22,'#ce6d9f');box(g,786+dx,923,41,4,'#662d50');box(g,793+dx,928,27,8,'#c4b6ab');box(g,810+dx,919,4,4,Math.sin(t*2.2)>.2?'#ffd391':'#763149');
  shadow(g,1143+dx,939,69);box(g,1119+dx,922,52,16,'#080b10');box(g,1123+dx,918,44,15,'#71a994');box(g,1135+dx,922,20,5,'#1c5149');box(g,1160+dx,920,3,3,Math.sin(t*1.7+1)>.1?'#ff934c':'#5b4238');
  // Wind-blown leaves settle on the existing ground, never carry the gear.
  if(!reduced?.matches){for(let i=0;i<7;i++){const q=(t*.047+i*.137)%1,x=547+(i*137)%655+Math.sin(q*8+i)*22,y=120+q*806;leaf(g,Math.round(x)+dx*.7,Math.round(y),i%3===0?3:2,i%2?'#d18c30':'#bba43b',i%2===0);}}
  for(const [x,y,size,color] of [[728,951,3,'#de8d2e'],[1074,948,3,'#daa948'],[1198,952,2,'#af9b38'],[53,945,2,'#d4762c']])leaf(g,x+dx,y+dy,size,color);
  finish(g);
 }
 function tick(ms){
  requestAnimationFrame(tick);const active=title.classList.contains('active')&&!document.hidden;
  if(last!==null&&active)time+=Math.min(.05,Math.max(0,(ms-last)/1000));last=ms;
  if(!active||!ready)return;
  if(reduced?.matches){camera.x=0;camera.y=0;}else{camera.x+=(pointer.x-camera.x)*.12;camera.y+=(pointer.y-camera.y)*.12;}
  const frame=reduced?.matches?0:Math.floor(time*24);if(frame===lastFrame)return;lastFrame=frame;
  const t=reduced?.matches?0:frame/24,h=artHeight();drawBack(t,h);drawActors(t,h);drawFront(t,h);
 }
 if(typeof ResizeObserver!=='undefined')new ResizeObserver(()=>{lastFrame=-1;}).observe(title);
 reduced?.addEventListener?.('change',()=>{lastFrame=-1;});
 window.CGV6Title={ready:()=>ready,version:6};requestAnimationFrame(tick);
})();
