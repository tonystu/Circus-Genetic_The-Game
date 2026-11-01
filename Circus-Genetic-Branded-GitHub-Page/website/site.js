(() => {
  'use strict';
  const players = [
    {name:'MATT',role:'BASS GUITAR',loadout:'BASS GUITAR',copy:'Four strings. One low-end problem solver. Bring the bass to practice, the stage, and the middle of a bar fight.'},
    {name:'BRICE',role:'LEAD GUITAR + VOCALS',loadout:'LEAD GUITAR',copy:'The voice out front and the guitar behind the riffs. Keep the notes tight and the drunk fans away from the cables.'},
    {name:'TONY',role:'DRUMS',loadout:'DRUMSTICKS',copy:'Behind the kit when the band plays. Out front with a pair of sticks when things get ugly. The beat must go on.'}
  ];
  const chapters = [
    {name:'PRACTICE',type:'RHYTHM / GARAGE REHEARSAL',art:'practice',alt:'8-bit rehearsal room with a drum kit, guitars, and amps',copy:"Match the graffiti arrows on the beat. Your roommate and Tony's blue heeler are already feeling it. Try to catch up."},
    {name:'SOUND CHECK',type:'RHYTHM / FIX THE MIX',art:'soundcheck',alt:'8-bit soundcheck chapter artwork',copy:"Play your part, then get the channels into the green. The sound guy has one finger in his ear and a lot of opinions."},
    {name:'THE SHOW',type:'LIVE RHYTHM / STAGE COMBAT',art:'show',alt:'8-bit live-show chapter artwork',copy:'Hit your cues and hold the stage. Bad promoters, lousy opening acts, pompous headliners, and beer-spilling fans are all on the bill.'},
    {name:'THE AMP BLEW',type:'SIDE-SCROLLING / AMP RESCUE',art:'amp',alt:'8-bit amp emergency chapter artwork',copy:'Your amp is toast. Get outside, reach the blue van, collect a replacement, and fight your way back to the venue door.'},
    {name:'GROUPIE SCORECARD',type:'CHANCE / GIANT POWER',art:'groupies',alt:'8-bit groupie scorecard chapter artwork',copy:'Rate the scorecards and make your choice. One random lucky pick means three times the size and one-hit attacks. Subtle? Absolutely not.'},
    {name:'AFTER PARTY',type:"BEER PONG / BLOWIN' O'S",art:'party',alt:'8-bit afterparty chapter artwork',copy:"Time the power and direction in Beer Pong, then aim your breath in Blowin' O's — Smoke Ring Olympics. The band is making memories. Allegedly."},
    {name:'BATTLE OF THE BANDS',type:'FINAL BOSS / 30 RIVAL MUSICIANS',art:'boss',alt:'8-bit Battle of the Bands chapter artwork',copy:'A TV ad becomes a dive-bar free-for-all. Switch bandmates with X, outsmart thirty rivals, and be the last band standing. Lose this one and you are out of the band.'}
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
      art.src = `assets/chapter-${chapter.art}.webp`;
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
