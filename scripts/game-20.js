/* Circus Genetic v6: booth soundcheck, alternating six-cup pong, moving hoop. */
(function(root,factory){
  const api=factory(root);
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.CGV6Mini=api;
})(typeof window!=='undefined'?window:globalThis,function(root){
  'use strict';
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number(v)||0));
  const rand=(rng,a,b)=>a+(b-a)*clamp(rng(),0,.9999999);
  const PI=Math.PI;
  const C={ink:'#111621',cream:'#f4e4bd',green:'#b6da67',pink:'#e95a9d',cyan:'#46c4ca',red:'#e66a45',gold:'#dcb266',skin:'#efb779'};
  const CHANNELS=['KICK','SNARE','OH','BASS','GTR','VOX','ROOM','FX'];
  const MEMBERS=['MATT / BASS','BRICE / GUITAR + VOCALS','TONY / DRUMS'];
  const PROFILES=[[13,12,17,77,23,17,42,28],[17,12,18,23,76,71,43,35],[80,73,68,17,19,14,46,25]];
  function paint(o){
    const g=o.g,box=o.box||((x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));});
    const txt=o.txt||((s,x,y,k=1,c=C.cream,align='left')=>{
      s=String(s).toUpperCase();if(align==='center')x-=s.length*6*k/2;if(align==='right')x-=s.length*6*k;
      for(const ch of s){const rows=(root.CG_FONT?.[ch]||'00000/00000/00000/00000/00000/00000/00000').split('/');rows.forEach((r,j)=>[...r].forEach((on,i)=>{if(on==='1')box(x+i*k,y+j*k,k,k,c);}));x+=6*k;}
    });
    return{g,box,txt};
  }
  function line(g,x1,y1,x2,y2,width,color){const n=Math.max(1,Math.ceil(Math.max(Math.abs(x2-x1),Math.abs(y2-y1))/2));g.fillStyle=color;for(let i=0;i<=n;i++)g.fillRect(Math.round(x1+(x2-x1)*i/n-width/2),Math.round(y1+(y2-y1)*i/n-width/2),width,width);}
  function outlinedArm(g,a,b,c,color=C.skin){line(g,...a,...b,10,'#080a0e');line(g,...b,...c,9,'#080a0e');line(g,...a,...b,6,color);line(g,...b,...c,5,color);}
  // Six illustrated pixel poses, all cropped to a common anchored waistline.
  // No console geometry or hit targets depend on this character artwork.
  const soundGuyArt=typeof Image==='function'?new Image():null;
  if(soundGuyArt)soundGuyArt.src=root.CG_ASSETS?.['assets/sound-guy-v6.webp']||'assets/sound-guy-v6.webp';
  function soundGuy(s,o){
    const{g}=paint(o);
    if(!soundGuyArt||!soundGuyArt.complete||!soundGuyArt.naturalWidth){soundGuyFallback(s,o);return;}
    const active=s.phase==='play',result=s.phase==='result'||s.phase==='complete',last=s.results.at(-1);
    const still=!!root.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    let pose=0;
    if(active)pose=Math.floor((s.measurementAge||s.time)*3)%3===1?2:1;
    else if(result)pose=last?.pass?(Math.floor(s.time*2)%7===6?5:3):4;
    else pose=!still&&Math.floor(s.time*1.5)%7===6?5:0;
    const sw=soundGuyArt.naturalWidth/3,sh=soundGuyArt.naturalHeight/2;
    const bottom=(pose<3?597:610)/627*sh;
    const breath=still?0:Math.sin(s.time*(active?5:2.1))*.7;
    const height=203+breath,base=383;
    g.save();g.imageSmoothingEnabled=false;
    // The illustrated hands remain in x10..119, left of channel one at x128.
    g.beginPath();g.rect(8,175,113,211);g.clip();
    g.drawImage(soundGuyArt,(pose%3)*sw,Math.floor(pose/3)*sh,sw,bottom,10,base-height,109,height);
    g.restore();
  }
  function soundGuyFallback(s,o){
    const{g,box}=paint(o),t=s.time,active=s.phase==='play',last=s.results.at(-1),mood=s.phase==='result'||s.phase==='complete'?(last?.pass?'up':'down'):'listen';
    const nod=Math.round(Math.sin(t*(active?6:2))*2),hx=58,hy=260+nod;
    // Waist-up, leaning into the booth with headphones resting around his neck.
    box(24,304,71,83,'#23252d');box(18,309,84,15,'#2f333d');box(33,297,49,20,'#303943');
    box(hx-25,hy-18,48,45,'#100e16');box(hx-20,hy-12,38,44,C.skin);box(hx-23,hy-3,45,12,C.skin);
    box(hx-18,hy-21,39,12,'#36252b');box(hx-25,hy-10,7,16,'#36252b');box(hx+15,hy-12,9,17,'#36252b');
    box(hx-10,hy+3,4,4,'#1c1519');box(hx+7,hy+3,4,4,'#1c1519');box(hx+2,hy+9,9,4,'#c48159');
    box(hx-9,hy+23,23,4,mood==='down'?'#6f3b36':'#6b4b3b');box(hx-3,hy+28,15,3,'#a46d4d');
    box(38,296,10,23,'#111621');box(72,296,10,23,'#111621');box(46,313,28,6,'#6c7585');
    if(mood==='listen'){
      outlinedArm(g,[28,318],[18,292],[38,hy+6]);box(34,hy+1,5,12,C.skin);
      if(active&&Math.floor(t*1.4)%3!==0){outlinedArm(g,[91,318],[106,289],[79,hy+7]);box(78,hy+1,4,12,C.skin);}
      else outlinedArm(g,[91,319],[109,336],[109,358]);
    }else{
      outlinedArm(g,[91,318],[109,298],[108,278]);box(100,269,17,15,C.skin);
      box(mood==='up'?101:111,mood==='up'?256:282,6,18,C.skin);
      outlinedArm(g,[28,319],[21,344],[40,357]);
    }
    box(39,348,45,5,'#394451');box(27,378,66,11,'#171a22');
  }
  function createSoundcheck(options={}){
    const rng=options.rng||Math.random;
    return{kind:'soundcheck',phase:'set',time:0,activeMember:0,selectedChannel:0,gains:Array(8).fill(50),targets:PROFILES.map(a=>a.map(v=>clamp(Math.round(v+rand(rng,-8,8)),4,96))),tolerance:13,measurementAge:0,registered:false,results:[],score:0,finished:false,options};
  }
  function soundcheckPlay(s){if(s.phase!=='set')return false;s.phase='play';s.measurementAge=0;s.registered=false;s.options.sound?.(330);return true;}
  function soundcheckGrade(s){return s.results.filter(r=>r.pass).length===3?'THE SHOW WAS FUCKING AWESOME!':s.results.some(r=>r.pass)?'THE SET WAS ALRIGHT.':'THE BAND SOUNDS LIKE GARBAGE.';}
  function soundcheckAdvance(s){
    if(s.phase==='result'){
      if(s.activeMember<2){s.activeMember++;s.phase='set';s.gains=Array(8).fill(50);s.measurementAge=0;s.registered=false;}
      else{s.phase='complete';s.grade=soundcheckGrade(s);}
      return true;
    }
    if(s.phase==='complete'&&!s.finished){s.finished=true;s.options.onDone?.({passes:s.results.filter(r=>r.pass).length,score:s.score,results:s.results,grade:s.grade});return true;}
    return false;
  }
  function updateSoundcheck(s,dt){
    s.time+=dt;if(s.phase!=='play')return;s.measurementAge+=dt;
    if(s.measurementAge>=1.35&&!s.registered){
      s.registered=true;const levels=s.targets[s.activeMember],hits=levels.map((v,i)=>Math.abs(v-s.gains[i])<=s.tolerance),count=hits.filter(Boolean).length,pass=count>=5,points=count*100+(pass?300:0);
      s.results.push({member:s.activeMember,levels:[...levels],gains:[...s.gains],hits,count,pass,points});s.score+=points;s.options.onScore?.(points);s.options.sound?.(pass?900:110);s.phase='result';
    }
  }
  function soundcheckKey(s,key){
    key=String(key).toLowerCase();
    if(['enter','e',' '].includes(key))return s.phase==='set'?soundcheckPlay(s):soundcheckAdvance(s);
    if(s.phase!=='set')return false;
    if(/^[1-8]$/.test(key)){s.selectedChannel=+key-1;return true;}
    if(['arrowleft','a'].includes(key))s.selectedChannel=(s.selectedChannel+7)%8;
    else if(['arrowright','d'].includes(key))s.selectedChannel=(s.selectedChannel+1)%8;
    else if(['arrowup','w'].includes(key))s.gains[s.selectedChannel]=clamp(s.gains[s.selectedChannel]+4,0,100);
    else if(['arrowdown','s'].includes(key))s.gains[s.selectedChannel]=clamp(s.gains[s.selectedChannel]-4,0,100);
    else return false;return true;
  }
  function soundcheckPointer(s,x,y){
    if(y>=347&&y<=393&&x>=420)return s.phase==='set'?soundcheckPlay(s):soundcheckAdvance(s);
    if(s.phase!=='set')return false;
    const i=Math.floor((x-128)/60);if(i>=0&&i<8&&y>=246&&y<=348){s.selectedChannel=i;s.gains[i]=Math.round(clamp((343-y)/94*100,0,100));return true;}return false;
  }
  function drawSoundcheck(s,o){
    const{box,txt}=paint(o);
    box(129,32,486,54,'#111621ee');txt('SOUND CHECK / 8 CHANNELS',372,39,2,C.cream,'center');txt(MEMBERS[s.activeMember],372,61,1,C.green,'center');
    const clues=['BASS HOT / ROOM MEDIUM / OTHERS QUIET','GTR + VOX HOT / ROOM MEDIUM / REST QUIET','KICK + SNARE + OH HOT / ROOM MEDIUM'];
    if(s.phase==='set')txt(clues[s.activeMember],320,91,1,C.gold,'center');
    else if(s.phase==='play')txt(MEMBERS[s.activeMember]+' IS PLAYING / LISTEN...',320,91,1,C.cyan,'center');
    else if(s.phase==='result'){const r=s.results.at(-1);txt(r.count+'/8 CHANNELS IN RANGE / '+(r.pass?'CHECK PASSED':'ROUGH MIX'),320,91,1,r.pass?C.green:C.red,'center');}
    else{box(54,91,532,40,'#111621ec');txt(s.grade,320,101,1,s.results.filter(r=>r.pass).length===3?C.green:C.red,'center');txt('E: TAKE THE STAGE',320,118,1,C.cream,'center');}
    // All band bodies fit above y229. The console is the close foreground.
    box(113,229,518,166,'#0c0f16');box(118,234,508,156,'#4a4543');box(123,238,498,145,'#282b32');
    soundGuy(s,o);
    for(let i=0;i<8;i++){
      const x=128+i*60,selected=i===s.selectedChannel,target=s.targets[s.activeMember][i],gain=s.gains[i];
      box(x,243,55,111,selected?'#4b525d':'#333a43');txt(CHANNELS[i],x+27,247,1,selected?C.cream:'#b0b6bd','center');
      box(x+10,267,12,69,'#111621');box(x+31,267,10,69,'#111621');
      const top=333-clamp(gain+s.tolerance,0,100)*.62,bottom=333-clamp(gain-s.tolerance,0,100)*.62;
      box(x+30,top,12,bottom-top+2,'#638c4f');
      const faderY=333-gain*.62;box(x+7,267,17,2,'#777473');box(x+8,faderY-3,16,7,selected?C.gold:'#d8c8b1');box(x+9,faderY,14,1,'#222833');
      if(s.phase!=='set'){
        const progress=clamp(s.measurementAge/1.2,0,1),value=target*progress,height=value*.62,hit=Math.abs(target-gain)<=s.tolerance;
        box(x+32,333-height,8,height,hit?C.green:C.red);for(let yy=272;yy<334;yy+=7)box(x+32,yy,8,2,'#26302c');
      }
      txt(String(gain).padStart(2,'0'),x+27,341,1,C.cream,'center');
    }
    box(128,358,278,25,'#151a22');txt('ARROWS: SELECT / SET RANGE',267,365,1,C.cream,'center');
    box(421,358,194,25,s.phase==='set'?'#4b6539':'#5d4053');txt(s.phase==='set'?'E: TELL THEM TO PLAY':s.phase==='play'?'CHECKING LEVELS...':'E: CONTINUE',518,366,1,C.cream,'center');
    txt('MEMBER '+(s.activeMember+1)+'/3  PASSED '+s.results.filter(r=>r.pass).length+'/3',610,216,1,C.green,'right');
  }
  function physics(options){const p=options?.physics||root.CGPartyPhysics;if(!p?.resetPong)throw new Error('CGV6Mini pong requires CGPartyPhysics');return p;}
  function createPong(options={}){
    const P=physics(options),rng=options.rng||Math.random;
    return{kind:'pong',phase:'aim',turn:'player',turnHits:0,time:0,turnAge:0,turnNo:0,aim:0,power:.5,manualAim:false,player:P.resetPong(),opponent:P.resetPong(),physics:P,rng,options,shot:null,shotSide:null,eventIndex:0,resolved:false,shots:0,made:0,score:0,winner:null,won:null,finished:false,rivalIndex:0};
  }
  const remaining=p=>p.cups.filter(c=>c.active).length;
  function aimForCup(cup,P){
    const t=(1.15+Math.sqrt(1.15**2+2*P.PONG.gravity*(.32-P.PONG.rimHeight)))/P.PONG.gravity;
    return{aim:clamp(cup.x/(1.1*t),-1,1),power:clamp(((cup.z+.16)/t-.8)/1.8,0,1)};
  }
  function pongShoot(s,input){
    const side=s.turn==='player'?s.player:s.opponent;if(s.phase!=='aim'&&s.phase!=='windup')return false;
    const shot=s.physics.throwBall(side,input||{aim:s.aim,power:s.power});if(!shot)return false;
    s.shot=shot;s.shotSide=s.turn;s.phase='flight';s.eventIndex=0;s.resolved=false;s.turnAge=0;s.shots++;s.options.sound?.(s.turn==='player'?430:320);return true;
  }
  function opponentShot(s){
    const choices=s.opponent.cups.filter(c=>c.active),cup=choices[Math.floor(s.rng()*choices.length)%choices.length],ideal=aimForCup(cup,s.physics);
    return{aim:clamp(ideal.aim+rand(s.rng,-.13,.13),-1,1),power:clamp(ideal.power+rand(s.rng,-.075,.075),0,1)};
  }
  function resolvePong(s){
    if(s.resolved||!s.shot?.done)return;s.resolved=true;
    const hit=s.shot.result==='hit',target=s.turn==='player'?s.player:s.opponent;
    if(hit){s.turnHits++;if(s.turn==='player'){s.made++;s.score+=200;s.options.onScore?.(200);}}
    if(remaining(target)===0){
      s.phase='result';s.winner=s.turn;s.won=s.turn==='player';if(s.won){s.score+=1000;s.options.onScore?.(1000);}s.options.sound?.(s.won?1200:120);return;
    }
    s.phase='settle';s.wait=.70;s.keepTurn=hit&&s.turnHits<2;
  }
  function pongContinue(s){if(s.phase!=='result'||s.finished)return false;s.finished=true;s.options.onDone?.({won:s.winner==='player',winner:s.winner,score:s.score,made:s.made,shots:s.shots,playerShots:s.player.attempts,opponentShots:s.opponent.attempts,remainingYou:remaining(s.opponent),remainingThem:remaining(s.player)});return true;}
  function updatePong(s,dt){
    s.time+=dt;s.turnAge+=dt;
    if(s.phase==='aim'){
      if(!s.manualAim)s.aim=Math.sin(s.time*1.4)*.66;
      s.power=.12+(Math.sin(s.time*2.15)+1)*.38;
    }else if(s.phase==='flight'){
      const side=s.shotSide==='player'?s.player:s.opponent;s.physics.stepPong(side,dt);
      while(s.eventIndex<s.shot.events.length){const event=s.shot.events[s.eventIndex++];if(event.type==='bounce')s.options.sound?.(560);if(event.type==='cup')s.options.sound?.(1000);}
      resolvePong(s);
    }else if(s.phase==='settle'){
      s.wait-=dt;if(s.wait<=0){
        if(!s.keepTurn){s.turn=s.turn==='player'?'opponent':'player';s.turnHits=0;s.turnNo++;}
        s.shot=null;s.shotSide=null;s.turnAge=0;s.rivalIndex=s.turnNo%2;
        s.phase=s.turn==='player'?'aim':'think';s.think=.65+rand(s.rng,0,.65);
      }
    }else if(s.phase==='think'){
      s.think-=dt;if(s.think<=0){s.phase='windup';s.turnAge=0;s.rivalAim=opponentShot(s);}
    }else if(s.phase==='windup'&&s.turnAge>=.65)pongShoot(s,s.rivalAim);
  }
  function pongKey(s,key){
    key=String(key).toLowerCase();if(s.phase==='result'&&['e','enter',' '].includes(key))return pongContinue(s);
    if(s.phase!=='aim'||s.turn!=='player')return false;
    if(['arrowleft','a'].includes(key)){s.manualAim=true;s.aim=clamp(s.aim-.07,-1,1);return true;}
    if(['arrowright','d'].includes(key)){s.manualAim=true;s.aim=clamp(s.aim+.07,-1,1);return true;}
    if([' ','e','enter'].includes(key))return pongShoot(s);return false;
  }
  function pongPointer(s,x,y){if(s.phase==='result')return pongContinue(s);if(s.phase==='aim'&&s.turn==='player'){if(y<160){s.manualAim=true;s.aim=clamp((x-320)/190,-1,1);return true;}return pongShoot(s);}return false;}
  function pongPoint(x,z,h=0){const d=z/1.25,half=220-120*d;return{x:320+x*half,y:351-d*150-h*110};}
  function cupDraw(o,cup,yourSide,visible){
    if(!visible)return;const{box}=paint(o),z=yourSide?1.25-cup.z:cup.z,x=yourSide?-cup.x:cup.x,p=pongPoint(x,z),scale=1-z/3.2,w=19*scale,h=23*scale;
    box(p.x-w/2,p.y-h,w,h,yourSide?'#c44d53':'#bd623e');box(p.x-w/2-1,p.y-h,w+2,4,'#f4e4bd');box(p.x-w/2+3,p.y-h+1,w-6,2,'#562d37');box(p.x-w/2+3,p.y-h+7,3,h-9,'#f2aa7b');box(p.x-w/2+2,p.y-1,w-4,2,'#441f2a');
  }
  function pongRivals(s,o){
    const{g,box}=paint(o),throwing=s.turn==='opponent'&&(s.phase==='windup'||s.phase==='flight'&&s.shot.age<.35);
    for(let i=0;i<2;i++){
      const x=i?392:246,active=throwing&&i===s.rivalIndex,age=s.phase==='windup'?s.turnAge:s.shot?.age||0;
      if(o.npcSprite)o.npcSprite(i?1:2,x,234,active?'throw':Math.sin(s.time*4+i)>.1?'hug':'kiss',i?-1:1,active?age:0,.87,234);
      else{box(x-19,154,38,65,i?'#8c403e':'#6b4d8b');box(x-14,125,28,32,C.skin);box(x-16,121,32,12,i?'#33232b':'#b57835');}
      if(active){const progress=s.phase==='windup'?clamp(age/.65,0,1):clamp(age/.35,0,1),handY=s.phase==='windup'?174-progress*29:145+progress*47;outlinedArm(g,[x+17,165],[x+34,157],[x+31,handY]);if(s.phase==='windup')box(x+28,handY-6,6,6,'#fff9de');}
    }
  }
  function drawPong(s,o){
    const{g,box,txt}=paint(o);g.imageSmoothingEnabled=false;
    o.drawBack?.(s);pongRivals(s,o);
    // Six-cup racks occupy both real sides of the same court geometry.
    box(105,348,15,45,'#26202a');box(521,348,15,45,'#26202a');box(221,201,8,103,'#3b302d');box(412,201,8,103,'#3b302d');
    g.beginPath();g.moveTo(100,351);g.lineTo(540,351);g.lineTo(420,201);g.lineTo(220,201);g.closePath();g.fillStyle='#ad7751';g.fill();
    g.beginPath();g.moveTo(106,347);g.lineTo(534,347);g.lineTo(417,205);g.lineTo(223,205);g.closePath();g.fillStyle='#284c42';g.fill();
    line(g,320,207,320,346,2,'#b6c0a0');line(g,163,276,476,276,2,'#b6c0a0');
    const items=[];
    for(const cup of s.player.cups)items.push({z:cup.z,draw:()=>cupDraw(o,cup,false,cup.active||s.shotSide==='player'&&s.shot?.cupId===cup.id&&!s.shot.done)});
    for(const cup of s.opponent.cups)items.push({z:1.25-cup.z,draw:()=>cupDraw(o,cup,true,cup.active||s.shotSide==='opponent'&&s.shot?.cupId===cup.id&&!s.shot.done)});
    items.sort((a,b)=>b.z-a.z).forEach(item=>item.draw());
    if(s.shot){const shot=s.shot,x=s.shotSide==='opponent'?-shot.x:shot.x,z=s.shotSide==='opponent'?1.25-shot.z:shot.z,p=pongPoint(x,z,shot.h),shadow=pongPoint(x,z,0);if(!shot.done){box(shadow.x-4,shadow.y,9,2,'#141a1699');box(p.x-3,p.y-3,6,6,'#fff4d1');box(p.x-1,p.y-3,3,1,'#ffffff');}}
    o.drawFront?.(s);
    box(61,34,518,25,'#111621ef');txt('BEER PONG / FIRST SIDE TO CLEAR 6 CUPS',320,43,1,C.cream,'center');
    box(148,65,344,24,'#111621e8');txt('YOU '+remaining(s.opponent)+' CUPS / THEM '+remaining(s.player)+' CUPS',320,73,1,C.green,'center');
    if(s.phase==='aim'){
      box(90,96,460,49,'#111621ed');txt('AIM LEFT / RIGHT',110,103,1,C.cream);box(268,103,250,5,'#444250');box(268+(s.aim+1)*125,99,3,13,C.pink);
      txt('THROW POWER',110,126,1,C.cream);box(268,124,250,8,'#444250');box(268,124,250*s.power,8,C.cyan);
    }
    const won=s.winner==='player';
    const prompt=s.phase==='result'?(won?'YOU WIN! / E TO CONTINUE':'THE OTHER TEAM WINS / E TO CONTINUE'):s.turn==='player'?(s.turnHits?'MADE IT! SHOOT AGAIN / MAX TWO CUPS PER TURN':'YOUR TURN / SPACE: THROW'):'RIVALS ARE THROWING / WATCH YOUR CUPS';
    box(85,365,470,26,'#111621eb');txt(prompt,320,374,1,s.phase==='result'?(won?C.green:C.red):C.cream,'center');
    if(s.phase==='result'){box(160,152,320,44,'#111621ed');txt(won?'BEER PONG WINNER!':'BEER PONG LOST',320,165,2,won?C.green:C.red,'center');}
  }
  const hoopMotions=new WeakMap();
  function hoopMotion(state,rng=Math.random){let m=hoopMotions.get(state);if(!m){m={time:0,next:.6,target:state.hoop.y||0,velocity:0,rng};hoopMotions.set(state,m);}return m;}
  function updateHoop(state,dt,rng){
    const m=hoopMotion(state,rng);m.time+=dt;m.next-=dt;
    if(m.next<=0){m.target=rand(m.rng,-.29,.29);m.next=rand(m.rng,.75,1.55);}
    const delta=m.target-state.hoop.y,desired=clamp(delta*2.1,-.30,.30);m.velocity+=(desired-m.velocity)*(1-Math.exp(-dt*5));state.hoop.y=clamp(state.hoop.y+m.velocity*dt,-.3,.3);return state.hoop;
  }
  function stepMovingSmoke(state,dt,options={}){
    const P=options.physics||root.CGPartyPhysics;if(!P?.stepSmoke)throw new Error('Moving hoop requires CGPartyPhysics');
    const n=Math.max(1,Math.ceil(clamp(dt,0,.25)*120)),step=clamp(dt,0,.25)/n;
    for(let i=0;i<n;i++){updateHoop(state,step,options.rng);P.stepSmoke(state,step);}return state.ring;
  }
  const hoopHolderArt=typeof Image==='function'?new Image():null;
  if(hoopHolderArt)hoopHolderArt.src=root.CG_ASSETS?.['assets/smoke-hoop-holder-v6.webp']||'assets/smoke-hoop-holder-v6.webp';
  function drawHoopHolder(state,o){
    const{g,box}=paint(o),target={x:180+state.hoop.x*300,y:216-state.hoop.y*180},t=o.t||0,x=561,y=386;
    // Illustrated modular base has no baked-in arms. Shoes stay on y386 while
    // the existing arm rig grips the actual moving physics hoop below.
    if(hoopHolderArt&&hoopHolderArt.complete&&hoopHolderArt.naturalWidth){
      const aw=hoopHolderArt.naturalWidth,ah=hoopHolderArt.naturalHeight;
      const sx=267/1024*aw,sy=31/1536*ah,sw=489/1024*aw,sh=1474/1536*ah,height=177,width=height*sw/sh;
      g.save();g.imageSmoothingEnabled=false;
      g.drawImage(hoopHolderArt,sx,sy,sw,sh,Math.round(x-width/2),y-height,width,height);
      g.restore();
    }else{
      box(x-20,y-69,14,68,'#292d49');box(x+6,y-69,14,68,'#292d49');box(x-24,y-4,25,6,'#e8e0c3');box(x+6,y-4,25,6,'#e8e0c3');
      box(x-26,y-135,52,70,'#685982');box(x-18,y-177,37,42,C.skin);box(x-21,y-181,43,14,'#332431');box(x-20,y-172,7,26,'#332431');box(x+13,y-170,9,28,'#332431');box(x-9,y-159,4,4,'#161521');box(x+6,y-159,4,4,'#161521');box(x-8,y-140,21,4,'#713b41');
    }
    const ry=state.hoop.radius*180,rx=ry*.75;
    outlinedArm(g,[x-23,y-125],[x-51,target.y+19],[target.x+rx,target.y+5]);outlinedArm(g,[x+22,y-125],[x+13,target.y+ry+37],[target.x+rx-2,target.y+ry-3]);
    for(let i=0;i<32;i++){const a=i*PI/16;box(target.x+Math.round(Math.cos(a)*rx/3)*3,target.y+Math.round(Math.sin(a)*ry/3)*3,4,4,'#b5c699');}
    return target;
  }
  return{
    soundcheck:{create:createSoundcheck,play:soundcheckPlay,advance:soundcheckAdvance,update:updateSoundcheck,key:soundcheckKey,pointer:soundcheckPointer,draw:drawSoundcheck,channels:CHANNELS,members:MEMBERS},
    pong:{create:createPong,shoot:pongShoot,update:updatePong,key:pongKey,pointer:pongPointer,draw:drawPong,continue:pongContinue,aimForCup,remaining},
    smoke:{updateHoop,step:stepMovingSmoke,drawHolder:drawHoopHolder}
  };
});
