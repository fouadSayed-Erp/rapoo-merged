// v2.1 - Fixed Bar + Autocorrect
const keyboardEl=document.getElementById('keyboard'),suggestionBar=document.getElementById('suggestionBar'),langIndicator=document.getElementById('langIndicator'),versionText=document.getElementById('versionText'),miniToast=document.getElementById('miniToast');
let isShift=false,isCaps=false,isAlt=false,isCtrl=false,isTrackpadActive=false,isFullTrackpad=false,holdTimer=null,lastMoveX=0,startX=0,startY=0;
let currentLang='en',currentTheme='dark',currentSound='clicky',currentRGB='reactive',vibEnabled=true,soundEnabled=true,autocorrectEnabled=true,suggestEnabled=true;
let currentWord='',wordStartPos=0;

// قواميس تصحيح
const dictionaries={
  en:["the","be","to","of","and","a","in","that","have","i","it","for","not","on","with","he","as","you","do","at","this","but","his","by","from","they","we","say","her","she","or","an","will","my","one","all","would","there","their","what","so","up","out","if","about","who","get","which","go","me","when","make","can","like","time","no","just","him","know","take","people","into","year","your","good","some","could","them","see","other","than","then","now","look","only","come","its","over","think","also","back","after","use","two","how","our","work","first","well","way","even","new","want","because","any","these","give","day","most","us","hello","world","keyboard","android","google","rapoo","merged","space","trackpad","settings","theme","language","sound","mechanical","rgb","ultimate"],
  ar:["السلام","عليكم","مرحبا","كيف","حالك","انا","انت","هو","هي","نحن","انتم","هذا","هذه","ذلك","التي","الذي","في","من","الى","على","عن","مع","بعد","قبل","تحت","فوق","يمين","شمال","كتاب","قلم","بيت","مدرسة","عمل","وقت","يوم","سنة","موبايل","كيبورد","مسافة","تراك","باد","اعدادات","لغة","ثيم","صوت","ميكانيكي","الوان","تصحيح","كلمات","شكرا","حبيبي","تمام","ظبط","تمام","الله","محمد","مصر","عربي"]
};

const layouts={
  en:{
    row1:[{k:'`',s:'~'},{k:'1',s:'!'},{k:'2',s:'@'},{k:'3',s:'#'},{k:'4',s:'$'},{k:'5',s:'%'},{k:'6',s:'^'},{k:'7',s:'&'},{k:'8',s:'*'},{k:'9',s:'('},{k:'0',s:')'},{k:'-',s:'_'},{k:'=',s:'+'},{k:'Backspace',d:'⌫',c:'del'}],
    row2:[{k:'tab',d:'tab',c:'fn-key small'},{k:'q'},{k:'w'},{k:'e'},{k:'r'},{k:'t'},{k:'y'},{k:'u'},{k:'i'},{k:'o'},{k:'p'},{k:'[',s:'{'},{k:']',s:'}'},{k:'\\',s:'|'}],
    row3:[{k:'caps',d:'caps',c:'fn-key small',id:'capsKey'},{k:'a'},{k:'s'},{k:'d'},{k:'f'},{k:'g'},{k:'h'},{k:'j'},{k:'k'},{k:'l'},{k:';',s:':'},{k:"'",s:'"'},{k:'enter',d:'↵',c:'small'}],
    row4:[{k:'shift',d:'shift',c:'fn-key small',id:'shiftKey'},{k:'z'},{k:'x'},{k:'c'},{k:'v'},{k:'b'},{k:'n'},{k:'m'},{k:',',s:'<'},{k:'.',s:'>'},{k:'/',s:'?'},{k:'shift',d:'shift',c:'fn-key small',id:'shiftKey2'}],
    row5:[{k:'fn',d:'Fn',id:'fnKey'},{k:'ctrl',d:'ctrl',id:'ctrlKey'},{k:'alt',d:'alt',id:'altKey'},{k:'space',d:'SPACE',c:'space-trackpad',id:'spaceTrackpad',special:true},{k:'alt',d:'alt'},{k:'ctrl',d:'ctrl'},{k:'arrowleft',d:'←'},{k:'arrowupdown',d:'↑↓'},{k:'arrowright',d:'→'}]
  },
  ar:{
    row1:[{k:'`',s:'~'},{k:'1',s:'!'},{k:'2',s:'@'},{k:'3',s:'#'},{k:'4',s:'$'},{k:'5',s:'%'},{k:'6',s:'^'},{k:'7',s:'&'},{k:'8',s:'*'},{k:'9',s:'('},{k:'0',s:')'},{k:'-',s:'_'},{k:'=',s:'+'},{k:'Backspace',d:'⌫',c:'del'}],
    row2:[{k:'tab',d:'tab',c:'fn-key small'},{k:'ض'},{k:'ص'},{k:'ث'},{k:'ق'},{k:'ف'},{k:'غ'},{k:'ع'},{k:'ه'},{k:'خ'},{k:'ح'},{k:'ج'},{k:'د'},{k:'\\',s:'|'}],
    row3:[{k:'caps',d:'caps',c:'fn-key small',id:'capsKey'},{k:'ش'},{k:'س'},{k:'ي'},{k:'ب'},{k:'ل'},{k:'ا'},{k:'ت'},{k:'ن'},{k:'م'},{k:'ك'},{k:'ط'},{k:'enter',d:'↵',c:'small'}],
    row4:[{k:'shift',d:'shift',c:'fn-key small',id:'shiftKey'},{k:'ئ'},{k:'ء'},{k:'ؤ'},{k:'ر'},{k:'لا'},{k:'ى'},{k:'ة'},{k:'و'},{k:'ز'},{k:'ظ'},{k:'shift',d:'shift',c:'fn-key small',id:'shiftKey2'}],
    row5:[{k:'fn',d:'Fn',id:'fnKey'},{k:'ctrl',d:'ctrl',id:'ctrlKey'},{k:'alt',d:'alt',id:'altKey'},{k:'space',d:'مسافة',c:'space-trackpad',id:'spaceTrackpad',special:true},{k:'alt',d:'alt'},{k:'ctrl',d:'ctrl'},{k:'arrowleft',d:'←'},{k:'arrowupdown',d:'↑↓'},{k:'arrowright',d:'→'}]
  }
};
Object.assign(layouts,{fr:layouts.en,de:layouts.en});

const KC={F1:131,F2:132,F3:133,F4:134,F5:135,F6:136,F7:137,F8:138,F9:139,F10:140,F11:141,F12:142,ESC:111,TAB:61,ENTER:66,LEFT:21,RIGHT:22,UP:19,DOWN:20};

let audioCtx=null;
function getCtx(){ if(!audioCtx) audioCtx=new (window.AudioContext||window.webkitAudioContext)(); return audioCtx; }
function playSound(){
  if(!soundEnabled||currentSound==='off') return;
  try{
    const ctx=getCtx(),now=ctx.currentTime;
    if(currentSound==='clicky'){const o=ctx.createOscillator(),g=ctx.createGain(); o.type='square'; o.frequency.setValueAtTime(2800+Math.random()*800,now); g.gain.setValueAtTime(0.25,now); g.gain.exponentialRampToValueAtTime(0.01,now+0.07); o.connect(g); g.connect(ctx.destination); o.start(now); o.stop(now+0.07);}
    else if(currentSound==='thocky'){const o=ctx.createOscillator(),g=ctx.createGain(); o.type='sine'; o.frequency.setValueAtTime(110,now); g.gain.setValueAtTime(0.45,now); g.gain.exponentialRampToValueAtTime(0.01,now+0.22); o.connect(g); g.connect(ctx.destination); o.start(now); o.stop(now+0.22);}
    else if(currentSound==='linear'){const o=ctx.createOscillator(),g=ctx.createGain(); o.type='sine'; o.frequency.setValueAtTime(550,now); g.gain.setValueAtTime(0.18,now); g.gain.linearRampToValueAtTime(0,now+0.09); o.connect(g); g.connect(ctx.destination); o.start(now); o.stop(now+0.09);}
    else{const o=ctx.createOscillator(),g=ctx.createGain(); o.type='square'; o.frequency.setValueAtTime(1400,now); o.frequency.exponentialRampToValueAtTime(90,now+0.11); g.gain.setValueAtTime(0.35,now); g.gain.exponentialRampToValueAtTime(0.01,now+0.11); o.connect(g); g.connect(ctx.destination); o.start(now); o.stop(now+0.11);}
  }catch(e){}
}

function commit(t){ if(window.Android&&Android.commitText) Android.commitText(t); }
function del(){ if(window.Android&&Android.deleteText) Android.deleteText(); }
function delN(n){ if(window.Android&&Android.deleteN) Android.deleteN(n); }
function sendKey(c){ if(window.Android&&Android.sendKey) Android.sendKey(c); }
function sendKeyMod(c,s,ctrl,alt){ if(window.Android&&Android.sendKeyWithModifiers) Android.sendKeyWithModifiers(c,!!s,!!ctrl,!!alt); }
function moveCursor(dx){ if(window.Android&&Android.moveCursor) Android.moveCursor(dx); }
function saveSet(k,v){ try{ localStorage.setItem('rapoo_'+k,v); if(window.Android&&Android.saveSetting) Android.saveSetting(k,v);}catch(e){} }
function loadSet(k,d){ try{ const v=localStorage.getItem('rapoo_'+k); if(v!==null) return v; if(window.Android&&Android.getSetting){const av=Android.getSetting(k,d); if(av) return av;}}catch(e){} return d; }
function vibrate(){ if(!vibEnabled) return; try{if(navigator.vibrate) navigator.vibrate(10)}catch(e){} }
function showToast(msg){
  miniToast.textContent=msg;
  miniToast.classList.add('show');
  setTimeout(()=>miniToast.classList.remove('show'),1500);
}

function levenshtein(a,b){
  const m=[]; for(let i=0;i<=b.length;i++){m[i]=[i]} for(let j=0;j<=a.length;j++){m[0][j]=j}
  for(let i=1;i<=b.length;i++){for(let j=1;j<=a.length;j++){if(b.charAt(i-1)==a.charAt(j-1)) m[i][j]=m[i-1][j-1]; else m[i][j]=Math.min(m[i-1][j-1]+1,Math.min(m[i][j-1]+1,m[i-1][j]+1))}} return m[b.length][a.length];
}

function getSuggestions(word){
  if(!suggestEnabled||!word||word.length<2) return [];
  const dict=dictionaries[currentLang]||dictionaries.en;
  const lower=word.toLowerCase();
  let results=[];
  // exact prefix
  dict.forEach(w=>{
    if(w.toLowerCase().startsWith(lower) && w.toLowerCase()!==lower) results.push({word:w,score:0});
  });
  // fuzzy
  if(results.length<3){
    dict.forEach(w=>{
      const dist=levenshtein(lower,w.toLowerCase());
      if(dist<=2 && dist>0) results.push({word:w,score:dist});
    });
  }
  results.sort((a,b)=>a.score-b.score);
  // unique
  const uniq=[]; const seen=new Set();
  for(let r of results){ if(!seen.has(r.word.toLowerCase())){ seen.add(r.word.toLowerCase()); uniq.push(r.word);} if(uniq.length>=5) break; }
  return uniq;
}

function updateSuggestions(){
  if(!suggestEnabled){ suggestionBar.innerHTML='<div class="suggestion" style="opacity:0.3">الاقتراحات مطفية</div>'; return; }
  if(!currentWord){
    suggestionBar.innerHTML='<div class="suggestion" style="opacity:0.4">ابدأ الكتابة...</div>';
    return;
  }
  const sugs=getSuggestions(currentWord);
  if(sugs.length===0){
    if(currentWord.length>3) suggestionBar.innerHTML=`<div class="suggestion correction">${currentWord}</div><div class="suggestion" style="opacity:0.5">لا يوجد تصحيح</div>`;
    else suggestionBar.innerHTML=`<div class="suggestion active">${currentWord}</div>`;
    return;
  }
  let html=`<div class="suggestion active">${currentWord}</div>`;
  sugs.forEach((s,i)=>{
    const isCorrection = s.toLowerCase()!==currentWord.toLowerCase() && s.toLowerCase().startsWith(currentWord.toLowerCase().slice(0,2))===false;
    html+=`<div class="suggestion ${isCorrection?'correction':''}" data-suggest="${s}">${s}</div>`;
  });
  suggestionBar.innerHTML=html;
  suggestionBar.querySelectorAll('[data-suggest]').forEach(el=>{
    el.addEventListener('click',()=>{
      const sug=el.dataset.suggest;
      applySuggestion(sug);
    });
  });
}

function applySuggestion(sug){
  if(!currentWord) return;
  delN(currentWord.length);
  setTimeout(()=>{
    commit(sug);
    currentWord='';
    updateSuggestions();
    playSound();
  },30);
}

function onCharTyped(ch){
  if(/[a-zA-Z\u0600-\u06FF]/.test(ch)){
    currentWord+=ch;
  } else if(ch===' '||ch==='\n'||/[.,!?;:]/.test(ch)){
    if(autocorrectEnabled && currentWord){
      const sugs=getSuggestions(currentWord);
      if(sugs.length>0 && sugs[0].toLowerCase()!==currentWord.toLowerCase()){
        // تصحيح تلقائي لو الفرق حرف واحد
        const dist=levenshtein(currentWord.toLowerCase(),sugs[0].toLowerCase());
        if(dist===1 && currentWord.length>3){
          delN(currentWord.length);
          setTimeout(()=>commit(sugs[0]+ch),30);
          showToast(`✓ ${currentWord} → ${sugs[0]}`);
          currentWord='';
          updateSuggestions();
          return;
        }
      }
    }
    currentWord='';
  }
  updateSuggestions();
}

function onDelete(){
  if(currentWord.length>0) currentWord=currentWord.slice(0,-1);
  updateSuggestions();
}

function renderKeyboard(){
  const layout=layouts[currentLang]||layouts.en;
  const escRow=`<div class="row"><div class="key small" data-key="esc">esc</div><div class="key" data-key="F1">F1</div><div class="key" data-key="F2">F2</div><div class="key" data-key="F3">F3</div><div class="key" data-key="F4">F4</div><div class="key" data-key="F5">F5</div><div class="key" data-key="F6">F6</div><div class="key" data-key="F7">F7</div><div class="key" data-key="F8">F8</div><div class="key" data-key="F9">F9</div><div class="key" data-key="F10">F10</div><div class="key" data-key="F11">F11</div><div class="key" data-key="F12">F12</div></div>`;
  let html=escRow;
  ['row1','row2','row3','row4','row5'].forEach(rn=>{
    const row=layout[rn]; if(!row) return;
    html+=`<div class="row ${rn==='row5'?'bottom-row':''}">`;
    row.forEach(item=>{
      if(item.special){
        html+=`<div class="key ${item.c||''}" id="${item.id||''}" data-key="${item.k}"><div class="space-content"><span>${item.d}</span><div class="track-icon">▣</div></div><div class="space-hint">HOLD 400ms • ${currentLang==='ar'?'اسحب للتحريك':'SLIDE'} • 32%</div><div class="trackpad-grid" id="trackpadGrid"></div><div class="track-dot" id="trackDot"></div></div>`;
      } else {
        const display=item.d||item.k;
        const cls=item.c||'';
        const id=item.id?` id="${item.id}"`:'';
        const sh=item.s?` data-shift="${item.s}"`:'';
        html+=`<div class="key ${cls}"${id} data-key="${item.k}"${sh}>${display}</div>`;
      }
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
  versionText.textContent=`${currentTheme.toUpperCase()} • ${currentSound.toUpperCase()}`;
  document.body.className=document.body.className.replace(/theme-\S+/g,'');
  document.body.classList.add('theme-'+currentTheme);
}

function attachEvents(){
  keyboardEl.onclick=(e)=>{
    const k=e.target.closest('.key'); if(!k||k.id==='spaceTrackpad') return;
    const key=k.dataset.key; if(!key) return;
    k.classList.add('pressed','rgb-react'); setTimeout(()=>{k.classList.remove('pressed'); setTimeout(()=>k.classList.remove('rgb-react'),500);},110);
    playSound(); vibrate();
    if(key==='shift'){isShift=!isShift;updateUI();return;}
    if(key==='caps'){isCaps=!isCaps;updateUI();return;}
    if(key==='ctrl'){isCtrl=!isCtrl;updateUI();return;}
    if(key==='alt'){isAlt=!isAlt;updateUI();return;}
    if(key==='fn'){const now=Date.now(); if(now-(window.lastFnTap||0)<350){isFullTrackpad=!isFullTrackpad; const ov=document.getElementById('overlay'); if(isFullTrackpad) ov.classList.add('show'); else ov.classList.remove('show');} window.lastFnTap=now; return;}
    if(key==='esc'){sendKeyMod(KC.ESC,isShift,isCtrl,isAlt);currentWord='';updateSuggestions();return;}
    if(key==='tab'){sendKeyMod(KC.TAB,isShift,isCtrl,isAlt);onCharTyped('\t');return;}
    if(key==='enter'){sendKeyMod(KC.ENTER,isShift,isCtrl,isAlt);onCharTyped('\n');return;}
    if(key==='Backspace'){del();onDelete();return;}
    if(/^F\d+$/.test(key)){const code=KC[key]; if(code) sendKeyMod(code,isShift,isCtrl,isAlt); currentWord='';updateSuggestions(); return;}
    if(key==='arrowleft'){sendKeyMod(KC.LEFT,isShift,isCtrl,isAlt);return;}
    if(key==='arrowright'){sendKeyMod(KC.RIGHT,isShift,isCtrl,isAlt);return;}
    if(key==='arrowupdown'){sendKeyMod(KC.UP,isShift,isCtrl,isAlt);return;}
    let out=key;
    if(out.length===1){
      if(currentLang==='en'&&/[a-z]/.test(out)) out=(isShift||isCaps)?out.toUpperCase():out.toLowerCase();
      if(isShift&&k.dataset.shift) out=k.dataset.shift;
    }
    if(out==='space'){commit(' '); onCharTyped(' ');}
    else{
      if(isCtrl||isAlt){const code=KC[out.toUpperCase()]||0; if(code) sendKeyMod(code,isShift,isCtrl,isAlt); else commit(out);}
      else commit(out);
      onCharTyped(out);
    }
    if(isShift){isShift=false;updateUI();}
  };
  const spaceTrackpad=document.getElementById('spaceTrackpad');
  if(!spaceTrackpad) return;
  const trackDot=document.getElementById('trackDot'),trackGrid=document.getElementById('trackpadGrid'),overlay=document.getElementById('overlay');
  if(trackGrid){trackGrid.innerHTML=''; for(let i=0;i<48;i++){const d=document.createElement('div'); trackGrid.appendChild(d);}}
  function activate(){ if(isTrackpadActive) return; isTrackpadActive=true; spaceTrackpad.classList.add('track-active'); overlay.classList.add('show'); vibrate(); playSound(); }
  function deactivate(){ if(!isTrackpadActive) return; isTrackpadActive=false; spaceTrackpad.classList.remove('track-active'); if(!isFullTrackpad) overlay.classList.remove('show'); if(trackDot) trackDot.style.left='50%'; }
  function onStart(x,y){ startX=lastMoveX=x; startY=y; clearTimeout(holdTimer); holdTimer=setTimeout(()=>activate(),400); }
  function onMove(x){ if(!isTrackpadActive){ if(Math.abs(x-startX)>10) clearTimeout(holdTimer); return; } const dx=x-lastMoveX; if(Math.abs(dx)>8){ if(dx>0) moveCursor(1); else moveCursor(-1); lastMoveX=x; const rect=spaceTrackpad.getBoundingClientRect(); let pct=((x-rect.left)/rect.width)*100; pct=Math.max(5,Math.min(95,pct)); if(trackDot) trackDot.style.left=pct+'%'; } }
  function onEnd(x,y){ clearTimeout(holdTimer); if(isTrackpadActive){ deactivate(); } else { if(Math.abs(x-startX)<10&&Math.abs(y-startY)<10){ commit(' '); onCharTyped(' '); playSound(); } } }
  spaceTrackpad.addEventListener('touchstart',e=>{ e.preventDefault(); const t=e.touches[0]; onStart(t.clientX,t.clientY); },{passive:false});
  spaceTrackpad.addEventListener('touchmove',e=>{ e.preventDefault(); onMove(e.touches[0].clientX); },{passive:false});
  spaceTrackpad.addEventListener('touchend',e=>{ e.preventDefault(); const t=e.changedTouches[0]; onEnd(t.clientX,t.clientY); },{passive:false});
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

currentLang=loadSet('language','en'); currentTheme=loadSet('theme','dark'); currentSound=loadSet('sound','clicky'); currentRGB=loadSet('rgb','reactive'); soundEnabled=loadSet('sound_enabled','true')==='true'; vibEnabled=loadSet('vib','true')==='true'; autocorrectEnabled=loadSet('autocorrect','true')==='true'; suggestEnabled=loadSet('suggest','true')==='true';
document.querySelector(`[data-lang="${currentLang}"]`)?.classList.add('active');
document.querySelector(`[data-theme="${currentTheme}"]`)?.classList.add('active');
document.querySelector(`[data-sound="${currentSound}"]`)?.classList.add('active');
document.querySelector(`[data-rgb="${currentRGB}"]`)?.classList.add('active');
document.getElementById('autocorrectToggle').textContent=`${autocorrectEnabled?'✅':'❌'} تصحيح تلقائي: ${autocorrectEnabled?'مفعل':'مطفي'}`;
document.getElementById('suggestToggle').textContent=`${suggestEnabled?'💡':'❌'} اقتراحات: ${suggestEnabled?'مفعلة':'مطفية'}`;
renderKeyboard();
console.log('Rapoo v2.1 - Bar Fixed + Autocorrect');
