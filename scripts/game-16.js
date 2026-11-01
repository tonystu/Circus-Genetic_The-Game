/* A secret printed on a physical CD-bin sticker, with a cartridge-era code screen. */
(() => {
  'use strict';
  const screen = document.getElementById('secret');
  const canvas = document.getElementById('secretCanvas');
  const g = canvas.getContext('2d');
  const field = document.getElementById('secretCode');
  let code = '', errorUntil = 0, t = 0, last = 0, unlocked = false;
  const rect = (x,y,w,h,c) => {g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),w,h);};
  function text(s,x,y,k=1,c='#f4e4bd',center=true) {
    s=String(s).toUpperCase();if(center)x-=s.length*6*k/2;
    for(const ch of s){(window.CG_FONT?.[ch]||'00000/00000/00000/00000/00000/00000/00000').split('/').forEach((r,j)=>[...r].forEach((v,i)=>{if(v==='1')rect(x+i*k,y+j*k,k,k,c);}));x+=6*k;}
  }
  function sync(value) {
    if(unlocked)return;
    code=value.toUpperCase().replace(/[^A-Z]/g,'').slice(0,6);field.value=code;
    if(code.length!==6)return;
    if(code==='CIRCUS') {
      unlocked=true;field.blur();
      if(typeof window.startSecretBonus==='function')window.startSecretBonus('password');
    } else {errorUntil=t+.8;if(typeof sfx==='function')sfx(90);}
  }
  function open() {
    code='';field.value='';unlocked=false;errorUntil=0;
    show('secret');field.focus({preventScroll:true});
  }
  document.getElementById('villainSticker').onclick=open;
  document.getElementById('secretBack').onclick=()=>show('chapters');
  field.addEventListener('input',()=>sync(field.value));
  document.addEventListener('keydown',e=>{
    if(!screen.classList.contains('active'))return;
    if(e.key==='Tab')return;
    e.stopImmediatePropagation();
    if(e.key==='Escape'){e.preventDefault();field.blur();show('chapters');return;}
    if(e.ctrlKey||e.metaKey||e.altKey)return;
    if(/^[a-z]$/i.test(e.key)){e.preventDefault();if(code.length===6){code='';errorUntil=0;}sync(code+e.key);}
    else if(e.key==='Backspace'){e.preventDefault();errorUntil=0;sync(code.slice(0,-1));}
    else if(e.key==='Enter'){e.preventDefault();sync(code);}
  },true);
  canvas.addEventListener('pointerdown',e=>{
    const r=canvas.getBoundingClientRect(),x=(e.clientX-r.left)*640/r.width,y=(e.clientY-r.top)*480/r.height;
    if(y>=280&&y<344&&x>=138&&x<502){
      const col=Math.floor((x-138)/28),row=Math.floor((y-280)/32),letter='ABCDEFGHIJKLMNOPQRSTUVWXYZ'[row*13+col];
      if(letter){if(code.length===6){code='';errorUntil=0;}sync(code+letter);}
    } else if(y>=355&&y<385&&x>215&&x<425){errorUntil=0;sync(code.slice(0,-1));}
    else field.focus({preventScroll:true});
  });
  function loop(ms) {
    t+=Math.min(.05,(ms-last)/1000||.016);last=ms;
    if(screen.classList.contains('active')){
      if(errorUntil&&t>errorUntil){code='';field.value='';errorUntil=0;}
      g.imageSmoothingEnabled=false;g.clearRect(0,0,640,480);
      rect(0,0,640,480,'#111621');
      for(let i=0;i<16;i++)rect((i*73)%640,45+(i*61)%360,3,3,Math.sin(t*2+i)>.5?'#e95a9d':'#303542');
      rect(85,64,470,346,'#070c14');rect(89,68,462,338,'#303044');rect(93,72,454,330,'#151b27');
      rect(222,86,196,32,'#dba657');text('VILLIAN',320,96,2,'#211729');
      text('SECRET TRACK',320,139,3);text('ENTER THE SIX-LETTER CODE',320,177,1,'#46c4ca');
      for(let i=0;i<6;i++){
        const x=160+i*55;rect(x,204,45,51,errorUntil?'#743b4d':'#35394a');rect(x+3,207,39,45,'#0c1220');
        rect(x+8,248,29,3,errorUntil?'#e95a9d':'#b6da67');
        if(code[i])text(code[i],x+23,216,3,errorUntil?'#e95a9d':'#f4e4bd');
        else if(i===code.length&&Math.sin(t*7)>0)rect(x+21,218,3,21,'#46c4ca');
      }
      text(errorUntil?'WRONG TRACK / TRY AGAIN':'TYPE OR TAP THE LETTERS',320,263,1,errorUntil?'#e95a9d':'#b6da67');
      for(let i=0;i<26;i++){const x=138+i%13*28,y=280+Math.floor(i/13)*32;rect(x+1,y+1,25,27,'#35394a');text(String.fromCharCode(65+i),x+14,y+9,1);}
      rect(215,355,210,30,'#35394a');text('BACKSPACE',320,366,1,'#46c4ca');
      text('ESC: BACK TO THE CD BIN',320,438,1,'#f4e4bd');
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
