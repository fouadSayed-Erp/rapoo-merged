// v2.6 STABLE & FAST - Fixed space, settings, double typing
const keyboardEl=document.getElementById('keyboard'),suggestionBar=document.getElementById('suggestionBar'),langIndicator=document.getElementById('langIndicator'),versionText=document.getElementById('versionText'),miniToast=document.getElementById('miniToast');
let isShift=false,isCaps=false,isAlt=false,isCtrl=false,isTrackpadActive=false,isFullTrackpad=false,holdTimer=null,lastMoveX=0,startX=0,startY=0;
let currentLang='en',currentTheme='dark',currentSound='clicky',currentRGB='reactive',vibEnabled=true,soundEnabled=true,autocorrectEnabled=true,suggestEnabled=true;
let currentWord='',sentenceBuffer='',lastTapTime=0,lastTapKey='',processingKey=false;

const dictionaries={
  en:{words:["the","be","to","of","and","a","in","that","have","i","it","for","not","on","with","he","as","you","do","at","this","but","his","by","from","they","we","say","her","she","or","an","will","my","one","all","would","there","their","what","so","up","out","if","about","who","get","which","go","me","when","make","can","like","time","no","just","him","know","take","people","into","year","your","good","some","could","them","see","other","than","then","now","look","only","come","its","over","think","also","back","after","use","two","how","our","work","first","well","way","even","new","want","because","any","these","give","day","most","us","hello","world","keyboard","fast","big","stable","fouad"],sentences:{}},
  ar:{words:["السلام","عليكم","مرحبا","كيف","حالك","انا","انت","هو","هي","نحن","هذا","هذه","ذلك","في","من","الى","على","عن","مع","بعد","قبل","كتاب","قلم","بيت","مدرسة","عمل","وقت","يوم","سنة","موبايل","كيبورد","مسافة","تراك","باد","اعدادات","لغة","ثيم","صوت","الوان","شكرا","حبيبي","تمام","ظبط","الله","محمد","مصر","عربي","فؤاد"],sentences:{}}
};
const layouts={
  en:{
    f:[{k:'esc',d:'esc',c:'small'},{k:'F1'},{k:'F2'},{k:'F3'},{k:'F4'},{k:'F5'},{k:'F6'},{k:'F7'},{k:'F8'},{k:'F9'},{k:'F10'},{k:'F11'},{k:'F12'}],
    n:[{k:'`',d:'`'},{k:'1'},{k:'2'},{k:'3'},{k:'4'},{k:'5'},{k:'6'},{k:'7'},{k:'8'},{k:'9'},{k:'0'},{k:'-',d:'-'},{k:'=',d:'='},{k:'Backspace',d:'⌫',c:'del',id:'delKey'}],
    q:[{k:'tab',d:'tab',c:'fn-key small'},{k:'q'},{k:'w'},{k:'e'},{k:'r'},{k:'t'},{k:'y'},{k:'u'},{k:'i'},{k:'o'},{k:'p'},{k:'[',d:'['},{k:']',d:']'},{k:'\\',d:'\\'}],
    a:[{k:'caps',d:'caps',c:'fn-key small',id:'capsKey'},{k:'a'},{k:'s'},{k:'d'},{k:'f'},{k:'g'},{k:'h'},{k:'j'},{k:'k'},{k:'l'},{k:';',d:';'},{k:"'",d:"'"},{k:'enter',d:'↵',c:'small'}],
    z:[{k:'shift',d:'shift',c:'fn-key small',id:'shiftKey'},{k:'z'},{k:'x'},{k:'c'},{k:'v'},{k:'b'},{k:'n'},{k:'m'},{k:',',d:','},{k:'.',d:'.'},{k:'/',d:'/'},{k:'shift',d:'shift',c:'fn-key small',id:'shiftKey2'}],
    b:[{k:'fn',d:'fn',id:'fnKey'},{k:'ctrl',d:'ctrl',id:'ctrlKey'},{k:'alt',d:'alt',id:'altKey'},{k:'space',d:'SPACE',c:'space-trackpad',id:'spaceTrackpad',special:true},{k:'alt',d:'alt'},{k:'ctrl',d:'ctrl'},{k:'arrowleft',d:'←'},{k:'arrowupdown',d:'↑↓'},{k:'arrowright',d:'→'}]
  },
  ar:{
    f:[{k:'esc',d:'esc',c:'small'},{k:'F1'},{k:'F2'},{k:'F3'},{k:'F4'},{k:'F5'},{k:'F6'},{k:'F7'},{k:'F8'},{k:'F9'},{k:'F10'},{k:'F11'},{k:'F12'}],
    n:[{k:'`',d:'`'},{k:'1'},{k:'2'},{k:'3'},{k:'4'},{k:'5'},{k:'6'},{k:'7'},{k:'8'},{k:'9'},{k:'0'},{k:'-',d:'-'},{k:'=',d:'='},{k:'Backspace',d:'⌫',c:'del',id:'delKey'}],
    q:[{k:'tab',d:'tab',c:'fn-key small'},{k:'ض'},{k:'ص'},{k:'ث'},{k:'ق'},{k:'ف'},{k:'غ'},{k:'ع'},{k:'ه'},{k:'خ'},{k:'ح'},{k:'ج'},{k:'د'},{k:'\\',d:'\\'}],
    a:[{k:'caps',d:'caps',c:'fn-key small',id:'capsKey'},{k:'ش'},{k:'س'},{k:'ي'},{k:'ب'},{k:'ل'},{k:'ا'},{k:'ت'},{k:'ن'},{k:'م'},{k:'ك'},{k:'ط'},{k:'enter',d:'↵',c:'small'}],
    z:[{k:'shift',d:'shift',c:'fn-key small',id:'shiftKey'},{k:'ئ'},{k:'ء'},{k:'ؤ'},{k:'ر'},{k:'لا'},{k:'ى'},{k:'ة'},{k:'و'},{k:'ز'},{k:'ظ'},{k:'shift',d:'shift',c:'fn-key small',id:'shiftKey2'}],
    b:[{k:'fn',d:'fn',id:'fnKey'},{k:'ctrl',d:'ctrl',id:'ctrlKey'},{k:'alt',d:'alt',id:'altKey'},{k:'space',d:'مسافة',c:'space-trackpad',id:'spaceTrackpad',special:true},{k:'alt',d:'alt'},{k:'ctrl',d:'ctrl'},{k:'arrowleft',d:'←'},{k:'arrowupdown',d:'↑↓'},{k:'arrowright',d:'→'}]
  }
};
Object.assign(layouts,{fr:layouts.en,de:layouts.en});
const KC={F1:131,F2:132,F3:133,F4:134,F5:135,F6:136,F7:137,F8:138,F9:139,F10:140,F11:141,F12:142,ESC:111,TAB:61,ENTER:66,LEFT:21,RIGHT:22,UP:19,DOWN:20};

let audioCtx=null;
function getCtx(){ if(!audioCtx) audioCtx=new (window.AudioContext||window.webkitAudioContext)(); return audioCtx; }
function playSound(){ if(!soundEnabled||currentSound==='off') return; try{ const ctx=getCtx(),now=ctx.currentTime; const g=ctx.createGain(); g.gain.setValueAtTime(0.18,now); g.gain.exponentialRampToValueAtTime(0.01,now+0.05); const o=ctx.createOscillator(); o.type='square'; o.frequency.setValueAtTime(3000,now); o.connect(g); g.connect(ctx.destination); o.start(now); o.stop(now+0.05); }catch(e){} }
function commit(t){ if(window.Android&&Android.commitText) Android.commitText(t); }
function del(){ if(window.Android&&Android.deleteText) Android.deleteText(); }
function delN(n){ if(window.Android&&Android.deleteN) Android.deleteN(n); }
function sendKeyMod(c,s,ctrl,alt){ if(window.Android&&Android.sendKeyWithModifiers) Android.sendKeyWithModifiers(c,!!s,!!ctrl,!!alt); }
function moveCursor(dx){ if(window.Android&&Android.moveCursor) Android.moveCursor(dx); }
function saveSet(k,v){ try{ localStorage.setItem('rapoo_'+k,v); if(window.Android&&Android.saveSetting) Android.saveSetting(k,v);}catch(e){} }
function loadSet(k,d){ try{ const v=localStorage.getItem('rapoo_'+k); if(v!==null) return v; if(window.Android&&Android.getSetting){const av=Android.getSetting(k,d); if(av) return av;}}catch(e){} return d; }
function vibrate(){ if(!vibEnabled) return; try{if(navigator.vibrate) navigator.vibrate(4)}catch(e){} }
function showToast(msg){ miniToast.textContent=msg; miniToast.classList.add('show'); setTimeout(()=>miniToast.classList.remove('show'),1100); }
function levenshtein(a,b){ const m=[]; for(let i=0;i<=b.length;i++){m[i]=[i]} for(let j=0;j<=a.length;j++){m[0][j]=j} for(let i=1;i<=b.length;i++){for(let j=1;j<=a.length;j++){if(b.charAt(i-1)==a.charAt(j-1)) m[i][j]=m[i-1][j-1]; else m[i][j]=Math.min(m[i-1][j-1]+1,Math.min(m[i][j-1]+1,m[i-1][j]+1))}} return m[b.length][a.length]; }
function getSuggestions(word){ if(!suggestEnabled||!word||word.length<2) return []; const dict=(dictionaries[currentLang]||dictionaries.en).words||[]; const lower=word.toLowerCase(); let res=[]; dict.forEach(w=>{ if(w.toLowerCase().startsWith(lower)&&w.toLowerCase()!==lower) res.push({w,sc:0}); }); if(res.length<4){ dict.forEach(w=>{ const d=levenshtein(lower,w.toLowerCase()); if(d<=2&&d>0) res.push({w,sc:d}); }); } res.sort((a,b)=>a.sc-b.sc); const u=[]; const seen=new Set(); for(let r of res){ if(!seen.has(r.w.toLowerCase())){seen.add(r.w.toLowerCase()); u.push(r.w);} if(u.length>=4) break; } return u; }
function updateSuggestions(){ if(!suggestEnabled||!currentWord){ suggestionBar.innerHTML='<div class="suggestion" style="opacity:.4">ابدأ الكتابة...</div>'; return; } const sugs=getSuggestions(currentWord); let h=`<div class="suggestion active">${currentWord}</div>`; sugs.forEach(w=>{ h+=`<div class="suggestion ${w.toLowerCase()!==currentWord.toLowerCase()?'correction':''}" data-s="${w}">${w}</div>`; }); suggestionBar.innerHTML=h; suggestionBar.querySelectorAll('[data-s]').forEach(el=>{ el.addEventListener('click',()=>{ const sug=el.dataset.s; const len=currentWord.length; if(len>0) delN(len); setTimeout(()=>{ commit(sug+' '); currentWord=''; sentenceBuffer=''; updateSuggestions(); playSound(); },25); }); }); }
function onCharTyped(ch){ if(/[a-zA-Z\u0600-\u06FF0-9]/.test(ch)){ currentWord+=ch; sentenceBuffer+=ch; } else { currentWord=''; sentenceBuffer+=' '; if(sentenceBuffer.length>80) sentenceBuffer=sentenceBuffer.slice(-50); } updateSuggestions(); }
function onDelete(){ if(currentWord.length>0) currentWord=currentWord.slice(0,-1); if(sentenceBuffer.length>0) sentenceBuffer=sentenceBuffer.slice(0,-1); updateSuggestions(); }

function renderKeyboard(){
  const layout=layouts[currentLang]||layouts.en;
  let html='';
  const rows=[{k:'f',cls:'row-f'},{k:'n',cls:'row-n'},{k:'q',cls:'row-q'},{k:'a',cls:'row-a'},{k:'z',cls:'row-z'},{k:'b',cls:'row-b'}];
  rows.forEach(r=>{
    const row=layout[r.k]; if(!row) return;
    html+=`<div class="row ${r.cls} ${r.k==='b'?'bottom-row':''}">`;
    row.forEach(item=>{
      if(item.special){ html+=`<div class="key ${item.c||''}" id="${item.id||''}" data-key="${item.k}"><div class="space-content"><span>${item.d}</span><div class="track-icon">▣</div></div><div class="space-hint">HOLD • SLIDE • 32%</div><div class="trackpad-grid" id="trackpadGrid"></div><div class="track-dot" id="trackDot"></div></div>`; }
      else{ const disp=item.d||item.k; const cls=item.c||''; const id=item.id?` id="${item.id}"`:''; html+=`<div class="key ${cls}"${id} data-key="${item.k}">${disp}</div>`; }
    });
    html+=`</div>`;
  });
  keyboardEl.innerHTML=html;
  attachEvents();
  updateUI();
  updateSuggestions();
}
function updateUI(){
  document.getElementById('capsKey')?.classList.toggle('active', isCaps);
  document.querySelectorAll('#shiftKey,#shiftKey2').forEach(k=>k.classList.toggle('active', isShift));
  document.getElementById('ctrlKey')?.classList.toggle('active', isCtrl);
  document.getElementById('altKey')?.classList.toggle('active', isAlt);
  langIndicator.textContent=currentLang.toUpperCase();
  versionText.textContent=`v2.6 STABLE`;
  document.body.className=document.body.className.replace(/theme-\S+/g,'');
  document.body.classList.add('theme-'+currentTheme);
}

// حذف بدون تعليق + منع كتابة مزدوجة
let deleteInterval=null,deleteSpeed=100,deleteHoldTimer=null,deleteActive=false;
function startFastDelete(){ if(deleteActive) return; deleteActive=true; del(); onDelete(); playSound(); deleteSpeed=100; deleteInterval=setInterval(()=>{ del(); onDelete(); if(deleteSpeed>18){ deleteSpeed-=5; clearInterval(deleteInterval); deleteInterval=setInterval(()=>{ del(); onDelete(); },deleteSpeed); } },deleteSpeed); }
function stopFastDelete(){ deleteActive=false; clearInterval(deleteInterval); deleteInterval=null; clearTimeout(deleteHoldTimer); deleteHoldTimer=null; deleteSpeed=100; }

function attachEvents(){
  window.addEventListener('pointerup',stopFastDelete,{passive:true});
  window.addEventListener('touchend',stopFastDelete,{passive:true});
  window.addEventListener('pointercancel',stopFastDelete,{passive:true});

  const keys=keyboardEl.querySelectorAll('.key');
  keys.forEach(k=>{
    let startX=0,startY=0,startTime=0,moved=false,isDel=k.id==='delKey'||k.dataset.key==='Backspace';
    let handled=false;

    const handlePointerDown=(e)=>{
      if(processingKey) return;
      startX=e.clientX; startY=e.clientY; startTime=Date.now(); moved=false; handled=false;
      k.classList.add('pressed');
      if(currentRGB!=='off') k.classList.add('rgb-react');
      if(isDel){ deleteHoldTimer=setTimeout(()=>{ startFastDelete(); },320); }
    };

    const handlePointerMove=(e)=>{
      if(Math.abs(e.clientX-startX)>10||Math.abs(e.clientY-startY)>10){ moved=true; k.classList.remove('pressed'); if(isDel) stopFastDelete(); }
    };

    const handlePointerUp=(e)=>{
      if(handled) return;
      handled=true;
      k.classList.remove('pressed');
      if(isDel) stopFastDelete();
      setTimeout(()=>{ if(currentRGB!=='off') k.classList.remove('rgb-react'); },280);
      if(moved) return;
      if(Date.now()-startTime>500 && !isDel) return;
      // منع الكتابة المزدوجة
      const now=Date.now();
      if(k.dataset.key===lastTapKey && now-lastTapTime<80) return;
      lastTapTime=now; lastTapKey=k.dataset.key;

      if(processingKey) return;
      processingKey=true;
      setTimeout(()=>{ processingKey=false; },30);

      const key=k.dataset.key; if(!key) return;
      playSound(); vibrate();
      if(key==='shift'){isShift=!isShift;updateUI();return;}
      if(key==='caps'){isCaps=!isCaps;updateUI();return;}
      if(key==='ctrl'){isCtrl=!isCtrl;updateUI();return;}
      if(key==='alt'){isAlt=!isAlt;updateUI();return;}
      if(key==='fn'){const n=Date.now(); if(n-(window.lastFnTap||0)<350){isFullTrackpad=!isFullTrackpad; const ov=document.getElementById('overlay'); if(isFullTrackpad) ov.classList.add('show'); else ov.classList.remove('show');} window.lastFnTap=n; return;}
      if(key==='esc'){sendKeyMod(KC.ESC,isShift,isCtrl,isAlt);currentWord='';sentenceBuffer='';updateSuggestions();return;}
      if(key==='tab'){sendKeyMod(KC.TAB,isShift,isCtrl,isAlt);onCharTyped('\t');return;}
      if(key==='enter'){sendKeyMod(KC.ENTER,isShift,isCtrl,isAlt);onCharTyped('\n');return;}
      if(key==='Backspace'){del();onDelete();return;}
      if(/^F\d+$/.test(key)){const code=KC[key]; if(code) sendKeyMod(code,isShift,isCtrl,isAlt); currentWord='';sentenceBuffer='';updateSuggestions(); return;}
      if(key==='arrowleft'){sendKeyMod(KC.LEFT,isShift,isCtrl,isAlt);return;}
      if(key==='arrowright'){sendKeyMod(KC.RIGHT,isShift,isCtrl,isAlt);return;}
      if(key==='arrowupdown'){sendKeyMod(KC.UP,isShift,isCtrl,isAlt);return;}
      let out=key;
      if(out.length===1){ if(currentLang==='en'&&/[a-z]/.test(out)) out=(isShift||isCaps)?out.toUpperCase():out.toLowerCase(); }
      if(out==='space'){commit(' '); onCharTyped(' ');} else { if(isCtrl||isAlt){const code=KC[out.toUpperCase()]||0; if(code) sendKeyMod(code,isShift,isCtrl,isAlt); else commit(out);} else commit(out); onCharTyped(out); }
      if(isShift){isShift=false;updateUI();}
    };

    k.addEventListener('pointerdown',handlePointerDown,{passive:true});
    k.addEventListener('pointermove',handlePointerMove,{passive:true});
    k.addEventListener('pointerup',handlePointerUp,{passive:true});
    k.addEventListener('pointercancel',()=>{ k.classList.remove('pressed'); stopFastDelete(); if(currentRGB!=='off') k.classList.remove('rgb-react'); },{passive:true});
  });

  const spaceTrackpad=document.getElementById('spaceTrackpad');
  if(!spaceTrackpad) return;
  const trackDot=document.getElementById('trackDot'),trackGrid=document.getElementById('trackpadGrid'),overlay=document.getElementById('overlay');
  if(trackGrid){trackGrid.innerHTML=''; for(let i=0;i<48;i++){const d=document.createElement('div'); trackGrid.appendChild(d);}}
  function activate(){ if(isTrackpadActive) return; isTrackpadActive=true; spaceTrackpad.classList.add('track-active'); overlay.classList.add('show'); vibrate(); playSound(); }
  function deactivate(){ if(!isTrackpadActive) return; isTrackpadActive=false; spaceTrackpad.classList.remove('track-active'); if(!isFullTrackpad) overlay.classList.remove('show'); if(trackDot) trackDot.style.left='50%'; }
  function onStart(x,y){ startX=lastMoveX=x; startY=y; clearTimeout(holdTimer); holdTimer=setTimeout(()=>activate(),360); }
  function onMove(x){ if(!isTrackpadActive){ if(Math.abs(x-startX)>10) clearTimeout(holdTimer); return; } const dx=x-lastMoveX; if(Math.abs(dx)>7){ if(dx>0) moveCursor(1); else moveCursor(-1); lastMoveX=x; const rect=spaceTrackpad.getBoundingClientRect(); let pct=((x-rect.left)/rect.width)*100; pct=Math.max(5,Math.min(95,pct)); if(trackDot) trackDot.style.left=pct+'%'; } }
  function onEnd(x,y){ clearTimeout(holdTimer); if(isTrackpadActive){ deactivate(); } else { if(Math.abs(x-startX)<10&&Math.abs(y-startY)<10){ commit(' '); onCharTyped(' '); playSound(); } } }
  spaceTrackpad.addEventListener('pointerdown',e=>{ onStart(e.clientX,e.clientY); },{passive:true});
  spaceTrackpad.addEventListener('pointermove',e=>{ onMove(e.clientX); },{passive:true});
  spaceTrackpad.addEventListener('pointerup',e=>{ onEnd(e.clientX,e.clientY); },{passive:true});
  overlay.addEventListener('click',()=>{ if(isTrackpadActive) deactivate(); if(isFullTrackpad){ isFullTrackpad=false; overlay.classList.remove('show'); } });
}

document.getElementById('settingsBtn')?.addEventListener('click',()=>document.getElementById('settingsPanel').classList.add('show'));
document.getElementById('closeSettings')?.addEventListener('click',()=>document.getElementById('settingsPanel').classList.remove('show'));
document.querySelectorAll('#langOptions .option-btn').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('#langOptions .option-btn').forEach(x=>x.classList.remove('active')); b.classList.add('active'); currentLang=b.dataset.lang; saveSet('language',currentLang); renderKeyboard(); showToast('🌐 '+currentLang);}));
document.querySelectorAll('#themeOptions .option-btn').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('#themeOptions .option-btn').forEach(x=>x.classList.remove('active')); b.classList.add('active'); currentTheme=b.dataset.theme; saveSet('theme',currentTheme); updateUI(); showToast('🎨 '+currentTheme);}));
document.querySelectorAll('#soundOptions .option-btn').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('#soundOptions .option-btn').forEach(x=>x.classList.remove('active')); b.classList.add('active'); currentSound=b.dataset.sound; soundEnabled=currentSound!=='off'; saveSet('sound',currentSound); saveSet('sound_enabled',soundEnabled?'true':'false'); if(soundEnabled) playSound(); showToast('🔊 '+currentSound);}));
document.querySelectorAll('#rgbOptions .option-btn').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('#rgbOptions .option-btn').forEach(x=>x.classList.remove('active')); b.classList.add('active'); currentRGB=b.dataset.rgb; saveSet('rgb',currentRGB); updateUI(); showToast('🌈 '+currentRGB);}));
document.getElementById('autocorrectToggle')?.addEventListener('click',function(){autocorrectEnabled=!autocorrectEnabled; this.textContent=`${autocorrectEnabled?'✅':'❌'} تصحيح تلقائي: ${autocorrectEnabled?'مفعل':'مطفي'}`; saveSet('autocorrect',autocorrectEnabled?'true':'false'); showToast('تصحيح '+(autocorrectEnabled?'مفعل':'مطفي'));});
document.getElementById('suggestToggle')?.addEventListener('click',function(){suggestEnabled=!suggestEnabled; this.textContent=`${suggestEnabled?'💡':'❌'} اقتراحات: ${suggestEnabled?'مفعلة':'مطفية'}`; saveSet('suggest',suggestEnabled?'true':'false'); updateSuggestions(); showToast('اقتراحات '+(suggestEnabled?'مفعلة':'مطفية'));});
document.getElementById('vibToggle')?.addEventListener('click',function(){vibEnabled=!vibEnabled; this.textContent=`📳 اهتزاز: ${vibEnabled?'مفعل':'مطفي'}`; saveSet('vib',vibEnabled?'true':'false'); if(vibEnabled) vibrate();});
document.getElementById('resetBtn')?.addEventListener('click',()=>{localStorage.clear(); location.reload();});

currentLang=loadSet('language','en'); currentTheme=loadSet('theme','dark'); currentSound=loadSet('sound','clicky'); currentRGB=loadSet('rgb','reactive'); soundEnabled=loadSet('sound_enabled','true')==='true'; vibEnabled=loadSet('vib','true')==='true';
document.querySelector(`[data-lang="${currentLang}"]`)?.classList.add('active');
document.querySelector(`[data-theme="${currentTheme}"]`)?.classList.add('active');
document.querySelector(`[data-sound="${currentSound}"]`)?.classList.add('active');
document.querySelector(`[data-rgb="${currentRGB}"]`)?.classList.add('active');
renderKeyboard();
console.log('Rapoo v2.6 STABLE - Space fixed, settings grid, no double typing, smooth');
