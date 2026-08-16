// RAPOO v2.0 ULTIMATE - Languages + Themes + Mechanical Sounds + RGB
const keyboardEl=document.getElementById('keyboard'),langIndicator=document.getElementById('langIndicator'),versionText=document.getElementById('versionText');
let isShift=false,isCaps=false,isAlt=false,isCtrl=false,isTrackpadActive=false,isFullTrackpad=false,holdTimer=null,lastX=0,startX=0,startY=0,lastMoveX=0;
let currentLang='en',currentTheme='dark',currentSound='clicky',currentRGB='reactive',vibEnabled=true,soundEnabled=true;

// LAYOUTS
const layouts={
  en:{
    row1:[{k:'`',s:'~'},{k:'1',s:'!'},{k:'2',s:'@'},{k:'3',s:'#'},{k:'4',s:'$'},{k:'5',s:'%'},{k:'6',s:'^'},{k:'7',s:'&'},{k:'8',s:'*'},{k:'9',s:'('},{k:'0',s:')'},{k:'-',s:'_'},{k:'=',s:'+'},{k:'Backspace',d:'⌫',c:'del'}],
    row2:[{k:'tab',d:'tab',c:'fn-key small'},{k:'q'},{k:'w'},{k:'e'},{k:'r'},{k:'t'},{k:'y'},{k:'u'},{k:'i'},{k:'o'},{k:'p'},{k:'[',s:'{'},{k:']',s:'}'},{k:'\\',s:'|'}],
    row3:[{k:'caps',d:'caps',c:'fn-key small',id:'capsKey'},{k:'a'},{k:'s'},{k:'d'},{k:'f'},{k:'g'},{k:'h'},{k:'j'},{k:'k'},{k:'l'},{k:';',s:':'},{k:"'",s:'"'},{k:'enter',d:'↵',c:'small'}],
    row4:[{k:'shift',d:'shift',c:'fn-key small',id:'shiftKey'},{k:'z'},{k:'x'},{k:'c'},{k:'v'},{k:'b'},{k:'n'},{k:'m'},{k:',',s:'<'},{k:'.',s:'>'},{k:'/',s:'?'},{k:'shift',d:'shift',c:'fn-key small',id:'shiftKey2'}],
    row5:[{k:'fn',d:'Fn',id:'fnKey'},{k:'ctrl',d:'ctrl',id:'ctrlKey'},{k:'alt',d:'alt',id:'altKey'},{k:'space',d:'SPACE / TRACKPAD',c:'space-trackpad',id:'spaceTrackpad',special:true},{k:'alt',d:'alt'},{k:'ctrl',d:'ctrl'},{k:'arrowleft',d:'←'},{k:'arrowupdown',d:'↑↓'},{k:'arrowright',d:'→'}]
  },
  ar:{
    row1:[{k:'`',s:'~'},{k:'1',s:'!'},{k:'2',s:'@'},{k:'3',s:'#'},{k:'4',s:'$'},{k:'5',s:'%'},{k:'6',s:'^'},{k:'7',s:'&'},{k:'8',s:'*'},{k:'9',s:'('},{k:'0',s:')'},{k:'-',s:'_'},{k:'=',s:'+'},{k:'Backspace',d:'⌫',c:'del'}],
    row2:[{k:'tab',d:'tab',c:'fn-key small'},{k:'ض'},{k:'ص'},{k:'ث'},{k:'ق'},{k:'ف'},{k:'غ'},{k:'ع'},{k:'ه'},{k:'خ'},{k:'ح'},{k:'ج',s:'{'},{k:'د',s:'}'},{k:'\\',s:'|'}],
    row3:[{k:'caps',d:'caps',c:'fn-key small',id:'capsKey'},{k:'ش'},{k:'س'},{k:'ي'},{k:'ب'},{k:'ل'},{k:'ا'},{k:'ت'},{k:'ن'},{k:'م'},{k:'ك',s:':'},{k:'ط',s:'"'},{k:'enter',d:'↵',c:'small'}],
    row4:[{k:'shift',d:'shift',c:'fn-key small',id:'shiftKey'},{k:'ئ'},{k:'ء'},{k:'ؤ'},{k:'ر'},{k:'لا'},{k:'ى'},{k:'ة'},{k:'و',s:'<'},{k:'ز',s:'>'},{k:'ظ',s:'?'},{k:'shift',d:'shift',c:'fn-key small',id:'shiftKey2'}],
    row5:[{k:'fn',d:'Fn',id:'fnKey'},{k:'ctrl',d:'ctrl',id:'ctrlKey'},{k:'alt',d:'alt',id:'altKey'},{k:'space',d:'مسافة / تراك باد',c:'space-trackpad',id:'spaceTrackpad',special:true},{k:'alt',d:'alt'},{k:'ctrl',d:'ctrl'},{k:'arrowleft',d:'←'},{k:'arrowupdown',d:'↑↓'},{k:'arrowright',d:'→'}]
  },
  fr:{
    row1:[{k:'²',s:'~'},{k:'&',s:'1'},{k:'é',s:'2'},{k:'"',s:'3'},{k:"'",s:'4'},{k:'(',s:'5'},{k:'-',s:'6'},{k:'è',s:'7'},{k:'_',s:'8'},{k:'ç',s:'9'},{k:'à',s:'0'},{k:')',s:'°'},{k:'=',s:'+'},{k:'Backspace',d:'⌫',c:'del'}],
    row2:[{k:'tab',d:'tab',c:'fn-key small'},{k:'a'},{k:'z'},{k:'e'},{k:'r'},{k:'t'},{k:'y'},{k:'u'},{k:'i'},{k:'o'},{k:'p'},{k:'^',s:'¨'},{k:'$',s:'£'},{k:'*',s:'μ'}],
    row3:[{k:'caps',d:'caps',c:'fn-key small',id:'capsKey'},{k:'q'},{k:'s'},{k:'d'},{k:'f'},{k:'g'},{k:'h'},{k:'j'},{k:'k'},{k:'l'},{k:'m'},{k:'ù',s:'%'},{k:'enter',d:'↵',c:'small'}],
    row4:[{k:'shift',d:'shift',c:'fn-key small',id:'shiftKey'},{k:'<'},{k:'w'},{k:'x'},{k:'c'},{k:'v'},{k:'b'},{k:'n'},{k:',',s:'?'},{k:';',s:'.'},{k:':',s:'/'},{k:'shift',d:'shift',c:'fn-key small',id:'shiftKey2'}],
    row5:[{k:'fn',d:'Fn',id:'fnKey'},{k:'ctrl',d:'ctrl',id:'ctrlKey'},{k:'alt',d:'alt',id:'altKey'},{k:'space',d:'ESPACE / TRACKPAD',c:'space-trackpad',id:'spaceTrackpad',special:true},{k:'alt',d:'alt'},{k:'ctrl',d:'ctrl'},{k:'arrowleft',d:'←'},{k:'arrowupdown',d:'↑↓'},{k:'arrowright',d:'→'}]
  }
};

const KC={F1:131,F2:132,F3:133,F4:134,F5:135,F6:136,F7:137,F8:138,F9:139,F10:140,F11:141,F12:142,ESC:111,TAB:61,ENTER:66,DEL:67,BACKSPACE:67,A:29,B:30,C:31,D:32,E:33,F:34,G:35,H:36,I:37,J:38,K:39,L:40,M:41,N:42,O:43,P:44,Q:45,R:46,S:47,T:48,U:49,V:50,W:51,X:52,Y:53,Z:54,LEFT:21,RIGHT:22,UP:19,DOWN:20};

let audioCtx=null;
function getAudioCtx(){ if(!audioCtx) audioCtx=new (window.AudioContext||window.webkitAudioContext)(); return audioCtx; }
function playMechSound(type){
  if(!soundEnabled || currentSound==='off') return;
  try{
    const ctx=getAudioCtx();
    const now=ctx.currentTime;
    if(currentSound==='clicky'){
      const o=ctx.createOscillator(),g=ctx.createGain(); o.type='square'; o.frequency.setValueAtTime(3000+Math.random()*1000,now); g.gain.setValueAtTime(0.3,now); g.gain.exponentialRampToValueAtTime(0.01,now+0.08); o.connect(g); g.connect(ctx.destination); o.start(now); o.stop(now+0.08);
    } else if(currentSound==='thocky'){
      const o=ctx.createOscillator(),g=ctx.createGain(); o.type='sine'; o.frequency.setValueAtTime(120+Math.random()*50,now); g.gain.setValueAtTime(0.5,now); g.gain.exponentialRampToValueAtTime(0.01,now+0.25); o.connect(g); g.connect(ctx.destination); o.start(now); o.stop(now+0.25);
      const o2=ctx.createOscillator(),g2=ctx.createGain(); o2.type='triangle'; o2.frequency.setValueAtTime(800,now); g2.gain.setValueAtTime(0.15,now); g2.gain.exponentialRampToValueAtTime(0.01,now+0.05); o2.connect(g2); g2.connect(ctx.destination); o2.start(now); o2.stop(now+0.05);
    } else if(currentSound==='linear'){
      const o=ctx.createOscillator(),g=ctx.createGain(); o.type='sine'; o.frequency.setValueAtTime(600+Math.random()*200,now); g.gain.setValueAtTime(0.2,now); g.gain.linearRampToValueAtTime(0,now+0.1); o.connect(g); g.connect(ctx.destination); o.start(now); o.stop(now+0.1);
    } else if(currentSound==='typewriter'){
      const o=ctx.createOscillator(),g=ctx.createGain(); o.type='square'; o.frequency.setValueAtTime(1500,now); o.frequency.exponentialRampToValueAtTime(100,now+0.12); g.gain.setValueAtTime(0.4,now); g.gain.exponentialRampToValueAtTime(0.01,now+0.12); o.connect(g); g.connect(ctx.destination); o.start(now); o.stop(now+0.12);
    }
  }catch(e){}
}

function commit(t){ if(window.Android){ if(window.Android.commitText) Android.commitText(t); else if(window.Android.sendTextWithModifiers) Android.sendTextWithModifiers(t,false,false,false); } }
function del(){ if(window.Android && Android.deleteText) Android.deleteText(); }
function sendKey(code){ if(window.Android && Android.sendKey) Android.sendKey(code); }
function sendKeyMod(code,s,c,a){ if(window.Android && Android.sendKeyWithModifiers) Android.sendKeyWithModifiers(code,!!s,!!c,!!a); }
function moveCursor(dx){ if(window.Android && Android.moveCursor) Android.moveCursor(dx); }
function saveSet(k,v){ try{ localStorage.setItem('rapoo_'+k,v); if(window.Android && Android.saveSetting) Android.saveSetting(k,v); }catch(e){} }
function loadSet(k,def){ try{ const v=localStorage.getItem('rapoo_'+k); if(v!==null) return v; if(window.Android && Android.getSetting) { const av=Android.getSetting(k,def); if(av) return av; } }catch(e){} return def; }
function vibrate(){ if(!vibEnabled) return; try{if(navigator.vibrate) navigator.vibrate(12)}catch(e){} }

function renderKeyboard(){
  const layout = layouts[currentLang] || layouts.en;
  const escRow = `<div class="row"><div class="key small" data-key="esc">esc</div><div class="key" data-key="F1">F1</div><div class="key" data-key="F2">F2</div><div class="key" data-key="F3">F3</div><div class="key" data-key="F4">F4</div><div class="key" data-key="F5">F5</div><div class="key" data-key="F6">F6</div><div class="key" data-key="F7">F7</div><div class="key" data-key="F8">F8</div><div class="key" data-key="F9">F9</div><div class="key" data-key="F10">F10</div><div class="key" data-key="F11">F11</div><div class="key" data-key="F12">F12</div></div>`;
  let html=escRow;
  ['row1','row2','row3','row4','row5'].forEach(rn=>{
    const row=layout[rn];
    if(!row) return;
    html+=`<div class="row ${rn==='row5'?'bottom-row':''}">`;
    row.forEach(item=>{
      if(item.special && rn==='row5'){
        html+=`<div class="key ${item.c||''}" id="${item.id||''}" data-key="${item.k}"><div class="space-content"><span>${item.d}</span><div class="track-icon">▣</div></div><div class="space-hint">HOLD 400ms • SLIDE • 32% SAVED</div><div class="trackpad-grid" id="trackpadGrid"></div><div class="track-dot" id="trackDot"></div></div>`;
      } else {
        const display=item.d||item.k;
        const cls=item.c||'';
        const id=item.id?` id="${item.id}"`:'';
        const s=item.s?` data-shift="${item.s}"`:'';
        html+=`<div class="key ${cls}"${id} data-key="${item.k}"${s}>${display}</div>`;
      }
    });
    html+=`</div>`;
  });
  keyboardEl.innerHTML=html;
  attachEvents();
  updateUI();
}

function updateUI(){
  document.getElementById('capsKey')?.classList.toggle('active', isCaps);
  document.querySelectorAll('#shiftKey,#shiftKey2').forEach(k=>k.classList.toggle('active', isShift));
  document.getElementById('ctrlKey')?.classList.toggle('active', isCtrl);
  document.getElementById('altKey')?.classList.toggle('active', isAlt);
  langIndicator.textContent=currentLang.toUpperCase();
  versionText.textContent=`${currentTheme.toUpperCase()} • ${currentSound.toUpperCase()} • ${currentRGB.toUpperCase()}`;
  // theme
  document.body.className=document.body.className.replace(/theme-\S+/g,'');
  document.body.classList.add('theme-'+currentTheme);
  if(currentRGB==='wave') document.body.classList.add('rgb-wave-active');
}

function attachEvents(){
  keyboardEl.onclick=(e)=>{
    const k=e.target.closest('.key');
    if(!k || k.id==='spaceTrackpad') return;
    const key=k.dataset.key;
    if(!key) return;
    k.classList.add('pressed','rgb-react');
    if(currentRGB!=='off') playMechSound(); else k.classList.remove('rgb-react');
    setTimeout(()=>{k.classList.remove('pressed'); if(currentRGB!=='off') setTimeout(()=>k.classList.remove('rgb-react'),600);},120);
    playMechSound(); vibrate();

    if(key==='shift'){isShift=!isShift;updateUI();return;}
    if(key==='caps'){isCaps=!isCaps;updateUI();return;}
    if(key==='ctrl'){isCtrl=!isCtrl;updateUI();return;}
    if(key==='alt'){isAlt=!isAlt;updateUI();return;}
    if(key==='fn'){ const now=Date.now(); if(now-(window.lastFnTap||0)<350){isFullTrackpad=!isFullTrackpad; const ov=document.getElementById('overlay'); if(isFullTrackpad) ov.classList.add('show'); else ov.classList.remove('show');} window.lastFnTap=now; return;}
    if(key==='esc'){sendKeyMod(KC.ESC,isShift,isCtrl,isAlt);clearMods();return;}
    if(key==='tab'){sendKeyMod(KC.TAB,isShift,isCtrl,isAlt);clearMods();return;}
    if(key==='enter'){sendKeyMod(KC.ENTER,isShift,isCtrl,isAlt);clearMods();return;}
    if(key==='Backspace'){del();clearModsIfNotSticky();return;}
    if(/^F\d+$/.test(key)){const code=KC[key]; if(code) sendKeyMod(code,isShift,isCtrl,isAlt); clearMods(); return;}
    if(key==='arrowleft'){sendKeyMod(KC.LEFT,isShift,isCtrl,isAlt);return;}
    if(key==='arrowright'){sendKeyMod(KC.RIGHT,isShift,isCtrl,isAlt);return;}
    if(key==='arrowupdown'){sendKeyMod(KC.UP,isShift,isCtrl,isAlt);return;}
    // حروف
    if(key.length>=1 && key!=='space'){
      let out=key;
      if(out.length===1){
        if(/[a-zA-Z\u0600-\u06FF]/.test(out)){
          if(currentLang==='en' && /[a-z]/.test(out)){
            out=(isShift||isCaps)?out.toUpperCase():out.toLowerCase();
          }
        }
        if(isShift && k.dataset.shift) out=k.dataset.shift;
      }
      if(isCtrl||isAlt){
        const code=KC[out.toUpperCase()]||0;
        if(code) sendKeyMod(code,isShift,isCtrl,isAlt); else commit(out);
      } else commit(out);
      clearModsIfNotSticky();
    }
  };
  // SPACE TRACKPAD
  const spaceTrackpad=document.getElementById('spaceTrackpad');
  if(!spaceTrackpad) return;
  const trackDot=document.getElementById('trackDot'),trackGrid=document.getElementById('trackpadGrid'),overlay=document.getElementById('overlay');
  if(trackGrid){trackGrid.innerHTML=''; for(let i=0;i<48;i++){const d=document.createElement('div'); trackGrid.appendChild(d);}}
  function activate(){ if(isTrackpadActive) return; isTrackpadActive=true; spaceTrackpad.classList.add('track-active'); overlay.classList.add('show'); vibrate(); playMechSound(); }
  function deactivate(){ if(!isTrackpadActive) return; isTrackpadActive=false; spaceTrackpad.classList.remove('track-active'); if(!isFullTrackpad) overlay.classList.remove('show'); if(trackDot) trackDot.style.left='50%'; }
  function onStart(x,y){ startX=lastX=lastMoveX=x; startY=y; clearTimeout(holdTimer); holdTimer=setTimeout(()=>activate(),400); }
  function onMove(x){
    if(!isTrackpadActive){ if(Math.abs(x-startX)>10) clearTimeout(holdTimer); return; }
    const dx=x-lastMoveX;
    if(Math.abs(dx)>8){ if(dx>0) moveCursor(1); else moveCursor(-1); lastMoveX=x; const rect=spaceTrackpad.getBoundingClientRect(); let pct=((x-rect.left)/rect.width)*100; pct=Math.max(5,Math.min(95,pct)); if(trackDot) trackDot.style.left=pct+'%'; }
  }
  function onEnd(x,y){
    clearTimeout(holdTimer);
    if(isTrackpadActive){ deactivate(); } else { if(Math.abs(x-startX)<10 && Math.abs(y-startY)<10){ commit(' '); playMechSound(); } }
  }
  spaceTrackpad.addEventListener('touchstart',e=>{ e.preventDefault(); const t=e.touches[0]; onStart(t.clientX,t.clientY); },{passive:false});
  spaceTrackpad.addEventListener('touchmove',e=>{ e.preventDefault(); onMove(e.touches[0].clientX); },{passive:false});
  spaceTrackpad.addEventListener('touchend',e=>{ e.preventDefault(); const t=e.changedTouches[0]; onEnd(t.clientX,t.clientY); },{passive:false});
  spaceTrackpad.addEventListener('pointerdown',e=>{ onStart(e.clientX,e.clientY); spaceTrackpad.setPointerCapture(e.pointerId); });
  spaceTrackpad.addEventListener('pointermove',e=>{ onMove(e.clientX); });
  spaceTrackpad.addEventListener('pointerup',e=>{ onEnd(e.clientX,e.clientY); });
  overlay.addEventListener('click',()=>{ if(isTrackpadActive) deactivate(); if(isFullTrackpad){ isFullTrackpad=false; overlay.classList.remove('show'); } });
  overlay.addEventListener('touchmove',e=>{ e.preventDefault(); if(isFullTrackpad){ const t=e.touches[0]; const dx=t.clientX-lastMoveX; if(Math.abs(dx)>10){ if(dx>0) moveCursor(1); else moveCursor(-1); lastMoveX=t.clientX; } } },{passive:false});
}

function clearMods(){ isShift=false; isCtrl=false; isAlt=false; updateUI(); }
function clearModsIfNotSticky(){ if(isShift){ isShift=false; updateUI(); } }

// SETTINGS PANEL
document.getElementById('settingsBtn')?.addEventListener('click',()=>{ document.getElementById('settingsPanel').classList.add('show'); });
document.getElementById('closeSettings')?.addEventListener('click',()=>{ document.getElementById('settingsPanel').classList.remove('show'); });

document.querySelectorAll('#langOptions .option-btn').forEach(b=>{
  b.addEventListener('click',()=>{
    document.querySelectorAll('#langOptions .option-btn').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
    currentLang=b.dataset.lang;
    saveSet('language',currentLang);
    renderKeyboard();
  });
});
document.querySelectorAll('#themeOptions .option-btn').forEach(b=>{
  b.addEventListener('click',()=>{
    document.querySelectorAll('#themeOptions .option-btn').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
    currentTheme=b.dataset.theme;
    saveSet('theme',currentTheme);
    updateUI();
  });
});
document.querySelectorAll('#soundOptions .option-btn').forEach(b=>{
  b.addEventListener('click',()=>{
    document.querySelectorAll('#soundOptions .option-btn').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
    currentSound=b.dataset.sound;
    soundEnabled=currentSound!=='off';
    saveSet('sound',currentSound);
    saveSet('sound_enabled',soundEnabled?'true':'false');
    if(soundEnabled) playMechSound();
  });
});
document.querySelectorAll('#rgbOptions .option-btn').forEach(b=>{
  b.addEventListener('click',()=>{
    document.querySelectorAll('#rgbOptions .option-btn').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
    currentRGB=b.dataset.rgb;
    saveSet('rgb',currentRGB);
    updateUI();
  });
});
document.getElementById('vibToggle')?.addEventListener('click',function(){
  vibEnabled=!vibEnabled;
  this.textContent=`📳 اهتزاز: ${vibEnabled?'مفعل':'مطفي'}`;
  saveSet('vib',vibEnabled?'true':'false');
  if(vibEnabled) vibrate();
});
document.getElementById('resetBtn')?.addEventListener('click',()=>{
  localStorage.clear();
  location.reload();
});

// INIT
currentLang=loadSet('language','en');
currentTheme=loadSet('theme','dark');
currentSound=loadSet('sound','clicky');
currentRGB=loadSet('rgb','reactive');
soundEnabled=loadSet('sound_enabled','true')==='true';
vibEnabled=loadSet('vib','true')==='true';
document.querySelector(`[data-lang="${currentLang}"]`)?.classList.add('active');
document.querySelector(`[data-theme="${currentTheme}"]`)?.classList.add('active');
document.querySelector(`[data-sound="${currentSound}"]`)?.classList.add('active');
document.querySelector(`[data-rgb="${currentRGB}"]`)?.classList.add('active');
renderKeyboard();
console.log('Rapoo v2.0 ULTIMATE loaded - Themes, Languages, Mechanical Sounds, RGB');
