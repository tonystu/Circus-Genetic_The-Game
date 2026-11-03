(() => {
  'use strict';
  const players = [
    {name:'MATT',role:'BASS GUITAR',loadout:'BASS GUITAR',copy:'Four strings. One low-end problem solver. Bring the bass to practice, the stage, and the middle of a bar fight.'},
    {name:'BRICE',role:'LEAD GUITAR + VOCALS',loadout:'LEAD GUITAR',copy:'The voice out front and the guitar behind the riffs. Keep the notes tight and the drunk fans away from the cables.'},
    {name:'TONY',role:'DRUMS',loadout:'DRUMSTICKS',copy:'Behind the kit when the band plays. Out front with a pair of sticks when things get ugly. The beat must go on.'}
  ];
  const chapters = [
    {name:'PRACTICE',type:'RHYTHM / GARAGE REHEARSAL',art:'practice',alt:'8-bit rehearsal room with a drum kit, guitars, and amps',copy:'Match the graffiti arrows while two skater roommates cheer and air-guitar. The old-lady neighbor is holding her ears. Reviews are mixed.'},
    {name:'SOUND CHECK',type:'8 CHANNELS / THREE MUSICIANS',art:'soundcheck',alt:'8-bit soundcheck chapter artwork',copy:'Work the booth console and guess eight channels for Matt, Brice and Tony, one after another. Set the faders, tell each to play, and see whether the sound guy approves.'},
    {name:'THE SHOW',type:'STAGE COMBAT / RETURN CHASE',art:'show',alt:'8-bit live-show chapter artwork',copy:'Fight from the stage to the exit, catch and return beer glasses, then dash back while groupies chase you. Get tackled and the band has to rescue your ass.'},
    {name:'THE AMP BLEW',type:'60 SECONDS / AMP RESCUE',art:'amp',alt:'8-bit amp emergency chapter artwork',copy:'The amp is smoking. Borrow a spare from the open van outside nighttime Artmosphere. Carry it back slowly, press E to shove through the crowd, and finish the encore.'},
    {name:'GROUPIE ROULETTE',type:'SLOT MACHINE / GIANT POWER',art:'roulette',alt:'Nine 8-bit Groupie Roulette faces',copy:'Choose three of nine faces and spin. Three matches award 10,000 points; including the hidden power face grants giant mode either way. Your three picks stay for cheering support.'},
    {name:'AFTER PARTY',type:"SIX-CUP PONG / MOVING SMOKE HOOP",art:'party',alt:'8-bit afterparty chapter artwork',copy:"The crowd-surf exit leads to Edwin. Take turns in six-cup Beer Pong, then aim smoke rings through a hoop that an NPC keeps moving. The band is making memories. Allegedly."},
    {name:'BATTLE OF THE BANDS',type:'TWO-STAGE FINALE / 30 + 15 RIVALS',art:'boss',alt:'8-bit Battle of the Bands chapter artwork',copy:'The TV ad becomes a 30-rival melee. Think you won? A 15-member old-man jam band explodes through the stage wall. Chug a beer, refill health, and switch bandmates with X for the final fight.'}
  ];
  const byId = id => document.getElementById(id);
  const setText = (id, text) => { byId(id).textContent = text; };
  document.querySelectorAll('[data-player]').forEach(button => {
    button.addEventListener('click', () => {
      const i = Number(button.dataset.player), player = players[i];
      document.querySelectorAll('[data-player]').forEach(b => { const on = b === button; b.classList.toggle('selected',on); b.setAttribute('aria-pressed',String(on)); });
      setText('player-number',`PLAYER 0${i + 1}`);
      setText('player-name',player.name);
      setText('player-role',player.role);
      setText('player-loadout',player.loadout);
      setText('player-copy',player.copy);
      byId('band-sprite').style.backgroundPositionY = `${-256 * i}px`;
    });
  });
  document.querySelectorAll('[data-chapter]').forEach(button => {
    button.addEventListener('click', () => {
      const i = Number(button.dataset.chapter), chapter = chapters[i];
      document.querySelectorAll('[data-chapter]').forEach(b => { const on = b === button; b.classList.toggle('selected',on); b.setAttribute('aria-pressed',String(on)); });
      const art = byId('chapter-art');
      art.src = chapter.art === 'roulette' ? 'assets/roulette-faces-v5.png' : chapter.art === 'show' ? 'assets/chapter-show-tony-cap-v6.webp' : `assets/chapter-${chapter.art}.webp`;
      art.alt = chapter.alt;
      setText('chapter-counter',`TRACK 0${i + 1} / 07`);
      setText('chapter-type',chapter.type);
      setText('chapter-name',chapter.name);
      setText('chapter-copy',chapter.copy);
    });
  });
  const menu = document.querySelector('.menu-toggle'), links = byId('nav-links');
  const closeMenu = () => { menu.setAttribute('aria-expanded','false'); links.classList.remove('open'); };
  menu.addEventListener('click',() => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded',String(open)); links.classList.toggle('open',open); });
  links.querySelectorAll('a').forEach(a => a.addEventListener('click',closeMenu));
  document.addEventListener('keydown',event => { if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { closeMenu(); menu.focus(); } });
  byId('share-button').addEventListener('click',async () => {
    const url = new URL('./',location.href).href;
    try {
      if (navigator.share) { await navigator.share({title:'Circus Genetic',text:'Start a band. Survive the gig. Keep the beer off the equipment.',url}); return; }
      if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(url); setText('share-status','Game page link copied.'); byId('share-button').textContent = 'LINK COPIED!'; }
      else { window.prompt('Copy this game page link:',url); }
    } catch (error) { if (error.name !== 'AbortError') { setText('share-status','Copy the address from your browser to share the game.'); byId('share-button').textContent = 'COPY THE ADDRESS BAR'; } }
  });
})();
