/* Circus Genetic v6 — contextual wardrobe and jointed pixel locomotion.
 * Standing height: 105 logical pixels at scale 1. The foot baseline is y.
 * Pass cumulative world distance and speed for a stance foot that stays planted.
 */
(function(root,factory){
  const api=factory(root||{});
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.CGV6Band=api;
})(typeof window!=='undefined'?window:globalThis,function(ROOT){
  'use strict';
  const NOMINAL_HEIGHT=105,SEATED_HEIGHT=128,STRIDE=44;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const mod=(n,d)=>((n%d)+d)%d;
  const GARAGE=new Set(['practice','garage','party','afterparty','after-party','pong','smoke','roulette','house','story']);
  const wardrobe={
    live:[
      {pants:'#363855',shade:'#24253b',light:'#505574',shoe:'#11121d',sole:'#e9e5c9',shirt:'#b6c38b',skin:'#eeb57d'},
      {pants:'#485269',shade:'#333d51',light:'#65718b',shoe:'#161724',sole:'#e9e5c9',shirt:'#a76025',skin:'#efb27e'},
      {pants:'#37363e',shade:'#24242e',light:'#55545f',shoe:'#15151c',sole:'#eee9d1',shirt:'#c7b39a',skin:'#dca06f'}
    ],
    garage:[
      {pants:'#747767',shade:'#505547',light:'#989b87',shoe:'#537337',sole:'#eee8cf',shirt:'#e3afaf',skin:'#eeb57d'},
      {pants:'#242632',shade:'#151723',light:'#464953',shoe:'#4e525a',sole:'#eee8cf',shirt:'#879095',skin:'#efb27e'},
      {pants:'#d6b878',shade:'#a98c54',light:'#e8cc94',shoe:'#151b27',sole:'#eee8cf',shirt:'#80735b',skin:'#dca06f'}
    ]
  };
  let atlas=null,loaded=false,pointAtlas=null,pointLoaded=false,capAtlas=null,capLoaded=false;
  if(typeof Image!=='undefined'){
    atlas=new Image();
    atlas.onload=()=>{loaded=atlas.naturalWidth>0;};
    atlas.src=ROOT.CG_ASSETS?.['assets/band-torsos-v6.webp']||'assets/band-torsos-v6.webp';
    capAtlas=new Image();capAtlas.onload=()=>{capLoaded=capAtlas.naturalWidth>0;};
    capAtlas.src=ROOT.CG_ASSETS?.['assets/band-torsos-cap-v6.webp']||'assets/band-torsos-cap-v6.webp';
    pointAtlas=new Image();pointAtlas.onload=()=>{pointLoaded=pointAtlas.naturalWidth>0;};
    pointAtlas.src=ROOT.CG_ASSETS?.['assets/band-point-v6.webp']||'assets/band-point-v6.webp';
  }
  function context(scene='stage'){return GARAGE.has(String(scene).toLowerCase())?'garage':'live';}
  function perspective(y,far=260,near=380){return .87+.25*clamp((Number(y)-far)/(near-far),0,1);}
  function inverseKnee(hip,ankle,upper=24,lower=24){
    const dx=ankle.x-hip.x,dy=ankle.y-hip.y,d=clamp(Math.hypot(dx,dy),.01,upper+lower-.001);
    const ux=dx/(Math.hypot(dx,dy)||1),uy=dy/(Math.hypot(dx,dy)||1);
    const along=(upper*upper-lower*lower+d*d)/(2*d),bend=Math.sqrt(Math.max(0,upper*upper-along*along));
    return{x:hip.x+ux*along+uy*bend,y:hip.y+uy*along-ux*bend};
  }
  function footAt(p,leg,moving){
    if(!moving)return{x:leg===0?-8:9,y:0,stance:true,heel:0,toe:0,progress:0};
    p=mod(p+leg*.5,1);
    if(p<.6){
      const n=p/.6;
      return{x:13-26.4*n,y:0,stance:true,heel:n>.72?(n-.72)/.28*3:0,toe:n<.18?-(1-n/.18)*2:0,progress:p};
    }
    const n=(p-.6)/.4,ease=n*n*(3-2*n);
    return{x:-13.4+26.4*ease,y:-Math.sin(Math.PI*n)*9,stance:false,heel:0,toe:-Math.sin(Math.PI*n)*1.5,progress:p};
  }
  function pose(options={}){
    const state=options.state||'idle',moving=state==='walk'||state==='run'||(state==='carry'&&(Number(options.speed)||0)>8),time=Number(options.t)||0;
    const displayScale=Math.max(.1,Number(options.scale)||1)*(options.perspective?perspective(options.groundY??options.y):1);
    const distance=Number.isFinite(options.distance)?options.distance:time*(Number(options.speed)||145);
    const phase=mod(distance/(STRIDE*displayScale),1);
    const dance=state==='play',victory=state==='victory'||state==='win';
    const bodyBob=moving?(1-Math.cos(phase*Math.PI*4))*.7:dance?1.3+Math.sin(time*Math.PI*2/.6)*1.2:victory?Math.sin(time*10)*1.4:Math.sin(time*2.1)*.4;
    const hipY=-48.5+bodyBob+(state==='strike'?2:0);
    const feet=[footAt(phase,0,moving),footAt(phase,1,moving)];
    if((Number(options.jump)||0)>2){feet[0]={x:-7,y:-8,stance:false,heel:0,toe:-1,progress:phase};feet[1]={x:13,y:-4,stance:false,heel:0,toe:1,progress:phase};}
    else if(state==='strike'){feet[0].x=-12;feet[1].x=16;}
    const legs=feet.map((foot,i)=>{const hip={x:i===0?-4:5,y:hipY};const ankle={x:foot.x,y:foot.y-4};return{hip,knee:inverseKnee(hip,ankle),ankle,foot,back:i===0};});
    return{state,moving,phase,bodyBob,hipY,legs,displayScale,context:context(options.scene),height:NOMINAL_HEIGHT*displayScale};
  }
  // Scanline polygons use integer rectangles: joint edges remain hard pixels,
  // even when elbows, knees and shoe hinges move at subpixel world positions.
  function polygon(g,points,color){
    const ps=points.map(p=>[Math.round(p[0]),Math.round(p[1])]);
    const y0=Math.min(...ps.map(p=>p[1])),y1=Math.max(...ps.map(p=>p[1]));
    g.fillStyle=color;
    for(let y=y0;y<=y1;y++){
      const intersections=[];
      for(let i=0,j=ps.length-1;i<ps.length;j=i++){
        const [x1,yy1]=ps[j],[x2,yy2]=ps[i];
        if((yy1<=y&&yy2>y)||(yy2<=y&&yy1>y))intersections.push(x1+(y-yy1)*(x2-x1)/(yy2-yy1));
      }
      intersections.sort((a,b)=>a-b);
      for(let i=0;i+1<intersections.length;i+=2)g.fillRect(Math.ceil(intersections[i]),y,Math.max(1,Math.floor(intersections[i+1])-Math.ceil(intersections[i])+1),1);
    }
  }
  function rect(g,x,y,w,h,color){g.fillStyle=color;g.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));}
  function bone(g,a,b,width,color){
    const dx=b.x-a.x,dy=b.y-a.y,n=Math.hypot(dx,dy)||1,px=-dy/n*width/2,py=dx/n*width/2;
    polygon(g,[[a.x+px,a.y+py],[b.x+px,b.y+py],[b.x-px,b.y-py],[a.x-px,a.y-py]],color);
    rect(g,a.x-width/2,a.y-width/2,width,width,color);rect(g,b.x-width/2,b.y-width/2,width,width,color);
  }
  function shoe(g,foot,pal,back){
    const x=foot.x,y=foot.y,h=foot.heel,t=foot.toe;
    polygon(g,[[x-7,y-5-h],[x,y-7],[x+7,y-5+t],[x+12,y-2+t],[x+12,y+1],[x+5,y+2],[x-7,y+1-h]],'#080a12');
    polygon(g,[[x-5,y-4-h],[x+1,y-5],[x+7,y-3+t],[x+9,y-1],[x+9,y],[x-5,y-h]],back?pal.shade:pal.shoe);
    // The toe stays on the floor while the heel peels off at late stance.
    polygon(g,[[x-5,y-h],[x+9,y-1],[x+10,y+1],[x+5,y+2],[x-5,y+1-h]],pal.sole);
    rect(g,x-1,y-4,3,1,'#e9e6d4');rect(g,x+2,y-3,3,1,'#e9e6d4');
  }
  function leg(g,leg,pal){
    const p=leg.back?{...pal,pants:pal.shade,light:pal.pants}:pal;
    bone(g,leg.hip,leg.knee,11,'#080a12');bone(g,leg.knee,leg.ankle,9,'#080a12');
    bone(g,leg.hip,leg.knee,7,p.pants);bone(g,leg.knee,leg.ankle,6,p.pants);
    bone(g,{x:leg.hip.x-1,y:leg.hip.y+1},{x:leg.knee.x-1,y:leg.knee.y},2,p.light);
    rect(g,leg.knee.x-2,leg.knee.y-1,5,2,p.light);rect(g,leg.ankle.x-3,leg.ankle.y-2,6,2,p.shade);
    shoe(g,leg.foot,p,leg.back);
  }
  function fallbackTorso(g,who,pal,garage,bob){
    polygon(g,[[-13,-91],[-3,-97],[10,-90],[14,-49],[6,-34],[-10,-34],[-17,-61]],'#080a12');
    polygon(g,[[-11,-87],[1,-92],[10,-86],[10,-43],[-10,-41],[-13,-61]],pal.shirt);
    rect(g,-8,-103,17,17,pal.skin);rect(g,-9,-106,17,7,who===1?(garage?'#39c8cb':'#e1b53e'):'#30221e');
    rect(g,2,-97,2,2,'#15131c');rect(g,4,-90,4,1,'#15131c');
    if(who===2){
      // Tony's cap remains visible even while the illustrated atlas loads.
      polygon(g,[[-10,-102],[-10,-108],[-6,-111],[6,-111],[12,-108],[13,-102],[23,-102],[23,-99],[8,-99],[-9,-101]],'#080a12');
      rect(g,-2,-108,5,1,'#d63a36');rect(g,-3,-107,1,4,'#d63a36');rect(g,-2,-104,5,1,'#d63a36');
    }
    if(who===0&&garage)rect(g,-8,-99,18,4,'#080a12');
    if(who!==2){rect(g,-14,-53,24,17,who===0?'#15131f':'#1cce43');rect(g,4,-54,34,4,'#e4ad4b');}
    else{bone(g,{x:-10,y:-58},{x:4,y:-48},5,pal.skin);bone(g,{x:9,y:-59},{x:18,y:-47},5,pal.skin);bone(g,{x:4,y:-48},{x:18,y:-72},2,'#dfb55c');bone(g,{x:18,y:-47},{x:29,y:-72},2,'#dfb55c');}
  }
  function torso(g,who,garage,bob,options){
    const state=options.state||'idle',t=Number(options.t)||0,age=Number(options.age)||0;
    const anchors=garage?[205,215,225]:[210,207,225],pal=wardrobe[garage?'garage':'live'][who];
    const strike=state==='strike'?(age<.12?-.24:age<.23?.29:age<.32?.11:0):0;
    const angle=strike+(state==='carry'?.085:state==='walk'?.025:state==='play'?Math.sin(t*Math.PI*2/.6)*.026:state==='victory'||state==='win'?Math.sin(t*8)*.10:0);
    const dx=state==='strike'?(age<.12?-2:age<.25?4:0):state==='carry'?2:0;
    const source=who===2&&!garage?capAtlas:atlas,sourceReady=who===2&&!garage?capLoaded:loaded;
    g.save();g.translate(dx,-47+bob);g.rotate(angle);g.translate(0,47);
    if(state==='point'&&garage&&pointLoaded&&pointAtlas){
      const cw=pointAtlas.naturalWidth/3,ch=pointAtlas.naturalHeight;
      g.drawImage(pointAtlas,who*cw,0,cw,ch,-29,-109,83,68);
    }else if(sourceReady&&source){
      const cw=source.naturalWidth/3,ch=source.naturalHeight/2,w=83,h=68;
      const x=-anchors[who]/512*w;
      g.drawImage(source,who*cw,(garage?1:0)*ch,cw,ch,Math.round(x),-109,w,h);
      if(state==='play'&&who!==2){
        const handY=-44+Math.round(Math.sin(t*Math.PI*4/.6)*1.5);
        rect(g,-8,handY,5,3,pal.skin);rect(g,-5,handY+2,3,2,pal.skin);
      }
    }else fallbackTorso(g,who,pal,garage,bob);
    g.restore();
  }
  function seated(g,who,pal,garage,t,state){
    // The parent owns the sole drum kit. The seat, bent trousers and raised
    // torso sit behind that kit; no free-standing drummer legs are drawn.
    rect(g,-16,-28,29,5,'#171620');rect(g,-12,-23,3,23,'#3b3a42');rect(g,9,-23,3,23,'#3b3a42');
    bone(g,{x:-5,y:-43},{x:14,y:-28},10,pal.pants);bone(g,{x:14,y:-28},{x:3,y:-6},8,pal.pants);
    bone(g,{x:4,y:-43},{x:23,y:-27},10,pal.shade);bone(g,{x:23,y:-27},{x:19,y:-5},8,pal.shade);
    const beat=t*Math.PI*2/.6,bob=Math.sin(beat/2)*.9;
    const source=garage?atlas:capAtlas,sourceReady=garage?loaded:capLoaded;
    g.save();g.translate(0,-18+bob);
    if(sourceReady&&source){
      const cw=source.naturalWidth/3,ch=source.naturalHeight/2;
      // Cut at chest level so the two animated forearms replace the static
      // hands and sticks in the atlas instead of adding a second pair of arms.
      g.drawImage(source,2*cw,(garage?1:0)*ch,cw,ch*.50,-40,-109,91,40);
    }else fallbackTorso(g,who,pal,garage,bob);
    polygon(g,[[-13,-70],[10,-71],[15,-40],[-13,-39]],pal.shirt);
    if(garage){for(let yy=-68;yy< -40;yy+=7){rect(g,-12,yy,25,2,'#4d6153');rect(g,-11,yy+3,24,1,'#bc9a6d');}for(let xx=-9;xx<13;xx+=7)rect(g,xx,-68,2,28,'#4f564c');}
    const liftA=state==='victory'?1:(Math.sin(beat)+1)/2,liftB=state==='victory'?1:(Math.sin(beat+Math.PI)+1)/2;
    const leftShoulder={x:-12,y:-76},leftElbow={x:-20,y:-59},leftHand={x:-4+liftA*2,y:-58-liftA*19};
    const rightShoulder={x:12,y:-76},rightElbow={x:23,y:-58},rightHand={x:22-liftB*5,y:-57-liftB*19};
    for(const [shoulder,elbow,hand] of [[leftShoulder,leftElbow,leftHand],[rightShoulder,rightElbow,rightHand]]){
      bone(g,shoulder,elbow,10,'#080a12');bone(g,shoulder,elbow,7,pal.shirt);bone(g,elbow,hand,7,'#080a12');bone(g,elbow,hand,4,pal.skin);
    }
    bone(g,leftHand,{x:leftHand.x+12,y:leftHand.y-23+liftA*7},3,'#080a12');bone(g,leftHand,{x:leftHand.x+12,y:leftHand.y-23+liftA*7},1,'#efc36d');
    bone(g,rightHand,{x:rightHand.x+13,y:rightHand.y-22+liftB*7},3,'#080a12');bone(g,rightHand,{x:rightHand.x+13,y:rightHand.y-22+liftB*7},1,'#efc36d');
    g.restore();
  }
  function draw(g,options={}){
    if(!g)return false;
    const who=clamp(Number(options.who)||0,0,2)|0,scene=options.scene||'stage',garage=context(scene)==='garage',pal=wardrobe[garage?'garage':'live'][who];
    const baseScale=Math.max(.1,Number(options.scale)||1),depth=options.perspective?perspective(options.groundY??options.y):1,scale=baseScale*depth;
    const x=Number(options.x)||0,y=Number(options.y)||0,face=Number(options.face)<0?-1:1;
    const state=String(options.state||'idle').toLowerCase(),seatedState=who===2&&(options.seated===true||state==='seated'||state==='drum'||state==='drums');
    const p=pose({...options,state,scale:baseScale,scene});
    g.save();g.imageSmoothingEnabled=false;g.translate(Math.round(x),Math.round(y));g.scale(face*scale,scale);
    if(seatedState)seated(g,who,pal,garage,Number(options.t)||0,state);
    else{
      leg(g,p.legs[0],pal);leg(g,p.legs[1],pal);
      polygon(g,[[-10,p.hipY-5],[11,p.hipY-5],[12,p.hipY+5],[-10,p.hipY+5]],pal.pants);
      torso(g,who,garage,p.bodyBob,{...options,state});
    }
    g.restore();return true;
  }
  function joints(options={}){
    const p=pose(options),face=Number(options.face)<0?-1:1,s=p.displayScale,x=Number(options.x)||0,y=Number(options.y)||0;
    const world=v=>({x:x+face*v.x*s,y:y+v.y*s});
    return{...p,legs:p.legs.map(l=>({hip:world(l.hip),knee:world(l.knee),ankle:world(l.ankle),foot:{...world(l.foot),stance:l.foot.stance}})),hand:{x:x+face*15*s,y:y-54*s}};
  }
  return{draw,pose,joints,context,perspective,wardrobe,inverseKnee,nominalHeight:NOMINAL_HEIGHT,seatedHeight:SEATED_HEIGHT,ready:()=>loaded};
});
