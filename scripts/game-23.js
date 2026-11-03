/* Reference-based rooms: static architecture and animated background layers. */
(() => {
 'use strict';
 const art={},files={inside:'artmosphere-interior-v6.webp',outside:'artmosphere-exterior-v6.webp',house:'edwin-night-v6.webp',van:'open-band-van-v6.webp',kit:'live-drums-v4.png',graffiti:'circus-genetic-graffiti-v6.webp'};
 for(const [key,file] of Object.entries(files)){const im=new Image();im.src='assets/'+file;art[key]=im;}
 const loaded=im=>im&&im.complete&&im.naturalWidth;
 const reduced=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
 function rect(g,x,y,w,h,c){g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
 function view(bg,image,camera,width,y=28,height=370,zoom=1){
  bg.clearRect(0,0,640,420);rect(bg,0,0,640,420,'#0c1016');if(!loaded(image))return;
  bg.save();if(zoom!==1){bg.translate(320,398);bg.scale(zoom,zoom);bg.translate(-320,-398);}
  const pad=320/zoom-320,sx=(camera-pad)/width*image.naturalWidth,sw=(640+pad*2)/width*image.naturalWidth;
  bg.imageSmoothingEnabled=false;bg.drawImage(image,sx,0,sw,image.naturalHeight,-pad,y,640+pad*2,height);bg.restore();
 }
 function interior({bg,g,t=0,camera=0,performance=false,booth=false,zoom=1,kind='show',state}){
  const width=booth?1360:2400,cam=performance?0:camera,roomHeight=booth?250:performance?455:370;
  view(bg,art.inside,cam,width,28,roomHeight,zoom);
  bg.save();if(zoom!==1){bg.translate(320,398);bg.scale(zoom,zoom);bg.translate(-320,-398);}
  // The patio window belongs behind Brice and Matt, and never covers the band.
  const factor=booth?1360/2400:1,windowRect={x:276*factor-cam,y:28+roomHeight*.265,w:340*factor,h:roomHeight*.275};
  window.CGV6Cameos?.drawWindow({g:bg,t,kind,rect:windowRect,state,caption:true,retainBackdrop:true});
  const lamps=performance?[100,322,580]:[100,322,580,920,1300,1700,2140];
  for(let i=0;i<lamps.length;i++){const x=lamps[i]*factor-cam,y=booth?51:67;if(x< -50||x>690)continue;const pulse=reduced()?.4:.35+.25*(1+Math.sin(t*5+i))/2;bg.save();bg.globalAlpha=pulse*.13;bg.fillStyle=i%2?'#fa7644':'#ffc16a';bg.beginPath();bg.moveTo(x-4,y);bg.lineTo(x-38,booth?222:310);bg.lineTo(x+40,booth?222:310);bg.lineTo(x+4,y);bg.closePath();bg.fill();bg.globalAlpha=pulse*.6;rect(bg,x-4,y-3,8,6,'#ffbd6a');bg.restore();}
  bg.restore();return true;
 }
 function exterior({bg,t=0,camera=0,width=2100}){
  view(bg,art.outside,camera,width);
  // Spray-painted on the far-right building's brick sidewall, behind every actor.
  // World anchoring lets the logo move with the masonry rather than the camera.
  const tagX=2020-camera;
  if(loaded(art.graffiti)&&tagX<640&&tagX+74>0){
   bg.save();bg.imageSmoothingEnabled=false;bg.globalAlpha=.9;
   bg.drawImage(art.graffiti,Math.round(tagX),182,74,72);bg.restore();
  }
  bg.save();for(const wx of [110,600,1200,1880]){const x=wx-camera;if(x< -80||x>720)continue;const a=reduced()?.1:.09+Math.sin(t*1.4+wx)*.015;bg.globalAlpha=a;bg.fillStyle='#ff9c42';for(let k=0;k<5;k++)bg.fillRect(x-8-k*9,53+k*45,16+k*18,22);}bg.restore();
 }
 function van({g,t=0,x=1660,y=335,camera=0}){
  if(!loaded(art.van))return;const px=x-camera;
  g.drawImage(art.van,70,175,1370,710,Math.round(px-190),Math.round(y-190),366,190);
  // Smoke stays inside the open rear cargo bay, separate from the van art.
  if(!reduced())for(let i=0;i<7;i++){const a=(t*.14+i/7)%1;rect(g,px-120+(i%3)*32+Math.sin(a*6+i)*5,y-90-a*59,3+i%2,5,'#b9c2ba55');}
  for(const dx of [-167,25])rect(g,px+dx,y-89,4,8,Math.floor(t*2)%2?'#ff7b38':'#d74f2b');
 }
 function kit(g,x,y,scale=1,t=0,playing=true){
  if(!loaded(art.kit))return;g.save();const pulse=playing&&!reduced()?Math.sin(t*10)*.004:0;g.translate(x,y);g.scale(1+pulse,1-pulse);g.drawImage(art.kit,0,335,778,655,-75*scale,-126*scale,150*scale,126*scale);g.restore();
 }
 window.CGV6World={interior,exterior,van,kit,art,ready:()=>loaded(art.inside)&&loaded(art.outside)};
})();
