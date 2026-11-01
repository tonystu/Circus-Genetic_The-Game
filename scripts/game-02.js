/* A short, pixel-painted curtain between screens. It never owns game input. */
(() => {
 'use strict';
 const cabinet=document.getElementById('cabinet');
 if(!cabinet)return;
 const canvas=document.createElement('canvas');
 canvas.id='pixelCurtain';canvas.width=640;canvas.height=480;
 canvas.setAttribute('aria-hidden','true');
 Object.assign(canvas.style,{position:'absolute',inset:'0',width:'100%',height:'100%',zIndex:'20',pointerEvents:'none',imageRendering:'pixelated',display:'none'});
 cabinet.appendChild(canvas);
 const g=canvas.getContext('2d');
 let started=0,frame=null,generation=0,kind='curtain';
 function rect(x,y,w,h,c){g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
 function paint(progress){
  g.clearRect(0,0,640,480);g.imageSmoothingEnabled=false;
  if(kind==='iris'){
   const radius=Math.ceil((1-Math.pow(1-progress,3))*56)*8;
   for(let row=0;row<30;row++){
    const y=row*16,distance=Math.abs(y+8-240),open=Math.max(0,radius-distance*.55);
    const left=Math.max(0,Math.floor((320-open)/8)*8),right=Math.min(640,Math.ceil((320+open)/8)*8);
    rect(0,y,left,16,'#080c13');rect(right,y,640-right,16,'#080c13');
    if(left>0&&left<320)rect(left-4,y,4,16,row%3===0?'#ed873c':'#853f31');
    if(right<640&&right>320)rect(right,y,4,16,row%3===0?'#ed873c':'#853f31');
   }
  }else{
   for(let row=0;row<30;row++){
    const lead=row%2===0?row/29:(29-row)/29;
    const local=Math.min(1,Math.max(0,(progress-.12*lead)/.88));
    const edge=Math.ceil(640*(1-local*local)/8)*8;
    rect(0,row*16,edge,16,'#080c13');
    if(edge>0&&edge<640){rect(edge-8,row*16,8,16,'#853f31');rect(edge-4,row*16,4,16,row%3===0?'#46c4ca':'#ed873c');}
   }
  }
 }
 function play({from,to}={}){
  if(from===to||to==='gate'||to==='boot')return;
  generation++;if(frame!==null)cancelAnimationFrame(frame);
  const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  if(reduced){canvas.style.display='none';frame=null;return;}
  kind=from==='boot'?'iris':'curtain';
  const duration=kind==='iris'?420:300,ticket=generation;
  started=performance.now();canvas.style.display='block';paint(0);
  function animate(now){
   if(ticket!==generation)return;
   const progress=Math.max(0,Math.min(1,(now-started)/duration));
   if(progress>=1){canvas.style.display='none';g.clearRect(0,0,640,480);frame=null;return;}
   paint(progress);frame=requestAnimationFrame(animate);
  }
  frame=requestAnimationFrame(animate);
 }
 window.CGTransitions={play};
})();
