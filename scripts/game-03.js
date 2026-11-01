/* One soundtrack at a time; the secret track temporarily borrows the speakers. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.CGMusicDirector=api;})(typeof window!=='undefined'?window:globalThis,function(){
 'use strict';
 function create(options){
  const tracks=options.tracks,voice=options.voice;
  const frame=options.requestFrame||(fn=>requestAnimationFrame(fn));
  const cancel=options.cancelFrame||(id=>cancelAnimationFrame(id));
  const now=options.now||(()=>performance.now());
  let phase='main',muted=false,volume=.6,fade=0,fadeStart=0,frameId=null,generation=0,duck=false,previous=null,started=false;
  const clamp=n=>Math.max(0,Math.min(1,Number(n)||0));
  const reset=audio=>{try{audio.currentTime=0;}catch{}};
  function play(audio){if(!audio||muted)return;try{const result=audio.play();if(result?.catch)result.catch(()=>options.onBlocked?.());}catch{options.onBlocked?.();}}
  function levels(){
   Object.entries(tracks).forEach(([key,audio])=>{
    let gain=1;
    if(phase==='loss')gain=key==='boss'?1-fade:key==='loss'?.92*fade:1;
    audio.volume=clamp(volume*gain*(duck?.35:1));audio.muted=muted;
   });
   if(voice){voice.muted=muted;voice.volume=clamp(volume*1.5);}
  }
  function stopFade(){generation++;if(frameId!==null)cancel(frameId);frameId=null;}
  function stopVoice(){if(voice){voice.pause();reset(voice);}duck=false;}
  function route(name){
   if(!tracks[name])throw new Error('Unknown soundtrack '+name);
   if(name===phase){resume();return;}
   stopFade();stopVoice();previous=null;phase=name;fade=0;started=true;
   Object.entries(tracks).forEach(([key,audio])=>{if(key!==name)audio.pause();});
   // A fresh section starts its assigned song. Main music resumes its previous place.
   if(name!=='main')reset(tracks[name]);
   levels();play(tracks[name]);
  }
  function resume(){
   started=true;
   if(phase==='loss'){if(fade<1)play(tracks.boss);play(tracks.loss);}
   else play(tracks[phase]);
  }
  function lose(){
   if(phase==='loss')return;
   stopFade();stopVoice();previous=null;
   Object.entries(tracks).forEach(([key,audio])=>{if(key!=='boss'&&key!=='loss')audio.pause();});
   phase='loss';fade=0;fadeStart=now();reset(tracks.loss);levels();play(tracks.loss);
   const ticket=generation;
   function step(){
    if(ticket!==generation||phase!=='loss')return;
    fade=clamp((now()-fadeStart)/2400);levels();
    if(fade===1){tracks.boss.pause();reset(tracks.boss);frameId=null;}
    else frameId=frame(step);
   }
   frameId=frame(step);
  }
  function enterBonus(){
   if(phase==='bonus')return;
   const from=phase;route('bonus');previous=from;
  }
  function leaveBonus(){
   if(phase!=='bonus')return;
   const target=previous&&tracks[previous]?previous:'main';previous=null;
   tracks.bonus.pause();reset(tracks.bonus);phase=target;duck=false;levels();resume();
  }
  function nice(){
   if(muted||!voice||phase!=='boss')return;
   reset(voice);duck=true;levels();
   try{const result=voice.play();if(result?.catch)result.catch(()=>{duck=false;levels();});}catch{duck=false;levels();}
  }
  if(voice)voice.onended=()=>{duck=false;levels();};
  levels();
  return {route,resume,lose,enterBonus,leaveBonus,nice,
   setMuted(value){muted=!!value;levels();if(!muted&&started)resume();},
   setVolume(value){volume=clamp(value);levels();},
   inspect:()=>({phase,muted,volume,fade})
  };
 }
 return {create};
});
