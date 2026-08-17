// v2.3 FAST & BIG - Fast typing without errors + Bigger keys + Faster RGB
const keyboardEl=document.getElementById('keyboard'),suggestionBar=document.getElementById('suggestionBar'),langIndicator=document.getElementById('langIndicator'),versionText=document.getElementById('versionText'),miniToast=document.getElementById('miniToast');
let isShift=false,isCaps=false,isAlt=false,isCtrl=false,isTrackpadActive=false,isFullTrackpad=false,holdTimer=null,lastMoveX=0,startX=0,startY=0;
let currentLang='en',currentTheme='dark',currentSound='clicky',currentRGB='reactive',vibEnabled=true,soundEnabled=true,autocorrectEnabled=true,suggestEnabled=true;
let currentWord='',sentenceBuffer='',lastTapTime=0,lastTapKey='';
let keyQueue=[],isProcessingQueue=false;

const dictionaries={
  en:{words:["the","be","to","of","and","a","in","that","have","i","it","for","not","on","with","he","as","you","do","at","this","but","his","by","from","they","we","say","her","she","or","an","will","my","one","all","would","there","their","what","so","up","out","if","about","who","get","which","go","me","when","make","can","like","time","no","just","him","know","take","people","into","year","your","good","some","could","them","see","other","than","then","now","look","only","come","its","over","think","also","back","after","use","two","how","our","work","first","well","way","even","new","want","because","any","these","give","day","most","us","hello","world","keyboard","android","google","rapoo","merged","space","trackpad","fast","big","optimized","quick","smooth","rgb","ultimate","thanks","please","sorry","today","tomorrow","yesterday","morning","night","good","great","awesome","love","happy","sad","fast","typing","error","correct","sentence","suggestion","quickly","speed","rapid","performance"],
  words_ar:["السلام","عليكم","مرحبا","كيف","حالك","انا","انت","هو","هي","نحن","هذا","هذه","ذلك","في","من","الى","على","عن","مع","بعد","قبل","كتاب","قلم","بيت","مدرسة","عمل","وقت","يوم","سنة","موبايل","كيبورد","مسافة","تراك","باد","اعدادات","لغة","ثيم","صوت","الوان","شكرا","حبيبي","تمام","ظبط","الله","محمد","مصر","عربي","صباح","الخير","مساء","حلو","جميل","بحبك","وحشتيني","عامل","ايه","اخبارك","كويس","الحمدلله","سريع","كبير","محسن","ممتاز"]},
  ar:{words:["السلام","عليكم","مرحبا","كيف","حالك","انا","انت","هو","هي","نحن","هذا","هذه","ذلك","في","من","الى","على","عن","مع","بعد","قبل","كتاب","قلم","بيت","مدرسة","عمل","وقت","يوم","سنة","موبايل","كيبورد","مسافة","تراك","باد","اعدادات","لغة","ثيم","صوت","الوان","شكرا","حبيبي","تمام","ظبط","الله","محمد","مصر","عربي","صباح","الخير","مساء","حلو","جميل","بحبك","وحشتيني","عامل","ايه","اخبارك","كويس","الحمدلله","سريع","كبير","محسن"]}
};
Object.assign(dictionaries.en, {sentences:{"hello":"Hello there!","how are you":"How are you doing?","thank you":"Thank you so much!","good morning":"Good morning! Have a great day!","teh":"the","adn":"and","becuase":"because","recieve":"receive","seperate":"separate","fast typing":"fast typing without errors","quick brown":"The quick brown fox jumps over the lazy dog"}});
Object.assign(dictionaries.ar, {sentences:{"السلام عليكم":"السلام عليكم ورحمة الله وبركاته","صباح الخير":"صباح الخير يا حبيبي","مساء الخير":"مساء الخير يا جميل","عامل ايه":"عامل ايه يا غالي؟","شكرا":"شكرا جزيلا","تمام":"تمام ظبط كده","الله":"الله اكبر"}});

const layouts={
  en:{
    row1:[{k:'`',s:'~'},{k:'1',s:'!'},{k:'2',s:'@'},{k:'3',s:'#'},{k:'4',s:'$'},{k:'5',s:'%'},{k:'6',s:'^'},{k:'7',s:'&'},{k:'8',s:'*'},{k:'9',s:'('},{k:'0',s:')'},{k:'-',s:'_'},{k:'=',s:'+'},{k:'Backspace',d:'⌫',c:'del',id:'delKey'}],
    row2:[{k:'tab',d:'tab',c:'fn-key small'},{k:'q'},{k:'w'},{k:'e'},{k:'r'},{k:'t'},{k:'y'},{k:'u'},{k:'i'},{k:'o'},{k:'p'},{k:'[',s:'{'},{k:']',s:'}'},{k:'\\',s:'|'}],
    row3:[{k:'caps',d:'caps',c:'fn-key small',id:'capsKey'},{k:'a'},{k:'s'},{k:'d'},{k:'f'},{k:'g'},{k:'h'},{k:'j'},{k:'k'},{k:'l'},{k:';',s:':'},{k:"'",s:'"'},{k:'enter',d:'↵',c:'small'}],
    row4:[{k:'shift',d:'shift',c:'fn-key small',id:'shiftKey'},{k:'z'},{k:'x'},{k:'c'},{k:'v'},{k:'b'},{k:'n'},{k:'m'},{k:',',s:'<'},{k:'.',s:'>'},{k:'/',s:'?'},{k:'shift',d:'shift',c:'fn-key small',id:'shiftKey2'}],
    row5:[{k:'fn',d:'Fn',id:'fnKey'},{k:'ctrl',d:'ctrl',id:'ctrlKey'},{k:'alt',d:'alt',id:'altKey'},{k:'space',d:'SPACE',c:'space-trackpad',id:'spaceTrackpad',special:true},{k:'alt',d:'alt'},{k:'ctrl',d:'ctrl'},{k:'arrowleft',d:'←'},{k:'arrowupdown',d:'↑↓'},{k:'arrowright',d:'→'}]
  },
  ar:{
    row1:[{k:'`',s:'~'},{k:'1',s:'!'},{k:'2',s:'@'},{k:'3',s:'#'},{k:'4',s:'$'},{k:'5',s:'%'},{k:'6',s:'^'},{k:'7',s:'&'},{k:'8',s:'*'},{k:'9',s:'('},{k:'0',s:')'},{k:'-',s:'_'},{k:'=',s:'+'},{k:'Backspace',d:'⌫',c:'del',id:'delKey'}],
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
    const g=ctx.createGain(); g.gain.setValueAtTime(0.22,now); g.gain.exponentialRampToValueAtTime(0.01,now+0.07);
    const o=ctx.createOscillator(); o.type=currentSound==='thocky'?'sine':'square'; o.frequency.setValueAtTime(currentSound==='thocky'?110:3000,now);
    o.connect(g); g.connect(ctx.destination); o.start(now); o.stop(now+0.07);
  }catch(e){}
}
function commit(t){ if(window.Android&&Android.commitText) Android.commitText(t); }
function del(){ if(window.Android&&Android.deleteText) Android.deleteText(); }
function delN(n){ if(window.Android&&Android.deleteN) Android.deleteN(n); }
function sendKeyMod(c,s,ctrl,alt){ if(window.Android&&Android.sendKeyWithModifiers) Android.sendKeyWithModifiers(c,!!s,!!ctrl,!!alt); }
function moveCursor(dx){ if(window.Android&&Android.moveCursor) Android.moveCursor(dx); }
function saveSet(k,v){ try{ localStorage.setItem('rapoo_'+k,v); if(window.Android&&Android.saveSetting) Android.saveSetting(k,v);}catch(e){} }
function loadSet(k,d){ try{ const v=localStorage.getItem('rapoo_'+k); if(v!==null) return v; if(window.Android&&Android.getSetting){const av=Android.getSetting(k,d); if(av) return av;}}catch(e){} return d; }
function vibrate(){ if(!vibEnabled) return; try{if(navigator.vibrate) navigator.vibrate(6)}catch(e){} }
function showToast(msg){ miniToast.textContent=msg; miniToast.classList.add('show'); setTimeout(()=>miniToast.classList.remove('show'),1300); }

function levenshtein(a,b){ const m=[]; for(let i=0;i<=b.length;i++){m[i]=[i]} for(let j=0;j<=a.length;j++){m[0][j]=j} for(let i=1;i<=b.length;i++){for(let j=1;j<=a.length;j++){if(b.charAt(i-1)==a.charAt(j-1)) m[i][j]=m[i-1][j-1]; else m[i][j]=Math.min(m[i-1][j-1]+1,Math.min(m[i][j-1]+1,m[i-1][j]+1))}} return m[b.length][a.length]; }

function getSuggestions(word,sentence){
  if(!suggestEnabled||!word) return {words:[],sentences:[]};
  const dict=dictionaries[currentLang]||dictionaries.en;
  const lower=word.toLowerCase();
  const senLower=(sentence||'').toLowerCase().trim();
  let wordSugs=[],sentenceSugs=[];
  if(dict.sentences){
    for(let k in dict.sentences){ if(senLower.endsWith(k.toLowerCase()) || k.toLowerCase().includes(lower)){ sentenceSugs.push({text:dict.sentences[k],orig:k}); } }
    if(dict.sentences[senLower]) sentenceSugs.unshift({text:dict.sentences[senLower],orig:senLower});
  }
  dict.words.forEach(w=>{ if(w.toLowerCase().startsWith(lower)&&w.toLowerCase()!==lower) wordSugs.push({word:w,score:0}); });
  if(wordSugs.length<4){ dict.words.forEach(w=>{ const d=levenshtein(lower,w.toLowerCase()); if(d<=2&&d>0) wordSugs.push({word:w,score:d}); }); }
  wordSugs.sort((a,b)=>a.score-b.score);
  const uniq=[]; const seen=new Set(); for(let r of wordSugs){ if(!seen.has(r.word.toLowerCase())){seen.add(r.word.toLowerCase()); uniq.push(r.word);} if(uniq.length>=4) break; }
  return {words:uniq, sentences:sentenceSugs.slice(0,2)};
}

function updateSuggestions(){
  if(!suggestEnabled){ suggestionBar.innerHTML='<div class="suggestion" style="opacity:.3">مطفية</div>'; return; }
  if(!currentWord && !sentenceBuffer){ suggestionBar.innerHTML='<div class="suggestion" style="opacity:.4">ابدأ الكتابة...</div>'; return; }
  const fullSentence=(sentenceBuffer+' '+currentWord).trim();
  const sugs=getSuggestions(currentWord,fullSentence);
  let html=''; if(currentWord) html+=`<div class="suggestion active">${currentWord}</div>`;
  sugs.sentences.forEach(s=>{ html+=`<div class="suggestion sentence" data-suggest="${s.text}" data-is-sentence="1">✨ ${s.text}</div>`; });
  sugs.words.forEach(w=>{ const isCorr=w.toLowerCase()!==currentWord.toLowerCase(); html+=`<div class="suggestion ${isCorr?'correction':''}" data-suggest="${w}"> ${w}</div>`; });
  if(!html) html='<div class="suggestion" style="opacity:.5">لا يوجد</div>';
  suggestionBar.innerHTML=html;
  suggestionBar.querySelectorAll('[data-suggest]').forEach(el=>{ el.addEventListener('click',()=>{ const sug=el.dataset.suggest; const isSen=el.dataset.isSentence==='1'; applySuggestion(sug,isSen); }); });
}

function applySuggestion(sug,isSentence){
  const len=isSentence?(sentenceBuffer+' '+currentWord).trim().length:currentWord.length;
  if(len>0) delN(len);
  setTimeout(()=>{ commit(sug+' '); currentWord=''; if(isSentence) sentenceBuffer=''; else sentenceBuffer+=(sentenceBuffer?' ':'')+sug; if(sentenceBuffer.split(' ').length>6) sentenceBuffer=''; updateSuggestions(); playSound(); showToast('✓ '+sug); },35);
}

function onCharTyped(ch){
  if(/[a-zA-Z\u0600-\u06FF0-9]/.test(ch)){ currentWord+=ch; sentenceBuffer+=ch; } else if(ch===' '){ currentWord=''; sentenceBuffer+=' '; if(sentenceBuffer.length>100) sentenceBuffer=sentenceBuffer.slice(-60); } else if(/[\n.,!?;:]/.test(ch)){ currentWord=''; sentenceBuffer+=ch; }
  updateSuggestions();
}
function onDelete(){ if(currentWord.length>0) currentWord=currentWord.slice(0,-1); if(sentenceBuffer.length>0) sentenceBuffer=sentenceBuffer.slice(0,-1); updateSuggestions(); }

function triggerRGBWave(centerEl){
  if(currentRGB==='off') return;
  const allKeys=[...document.querySelectorAll('.key:not(.space-trackpad)')];
  const idx=allKeys.indexOf(centerEl); if(idx===-1) return;
  allKeys.forEach((k,i)=>{ const dist=Math.abs(i-idx); if(dist<=4){ setTimeout(()=>{ k.classList.add('rgb-wave'); setTimeout(()=>k.classList.remove('rgb-wave'),350); },dist*35); } });
}

function renderKeyboard(){
  const layout=layouts[currentLang]||layouts.en;
  const escRow=`<div class="row"><div class="key small" data-key="esc">esc</div><div class="key" data-key="F1">F1</div><div class="key" data-key="F2">F2</div><div class="key" data-key="F3">F3</div><div class="key" data-key="F4">F4</div><div class="key" data-key="F5">F5</div><div class="key" data-key="F6">F6</div><div class="key" data-key="F7">F7</div><div class="key" data-key="F8">F8</div><div class="key" data-key="F9">F9</div><div class="key" data-key="F10">F10</div><div class="key" data-key="F11">F11</div><div class="key" data-key="F12">F12</div></div>`;
  let html=escRow;
  ['row1','row2','row3','row4','row5'].forEach(rn=>{
    const row=layout[rn]; if(!row) return;
    html+=`<div class="row ${rn==='row5'?'bottom-row':''}">`;
    row.forEach(item=>{
      if(item.special){ html+=`<div class="key ${item.c||''}" id="${item.id||''}" data-key="${item.k}"><div class="space-content"><span>${item.d}</span><div class="track-icon">▣</div></div><div class="space-hint">HOLD • ${currentLang==='ar'?'اسحب':'SLIDE'} • 32%</div><div class="trackpad-grid" id="trackpadGrid"></div><div class="track-dot" id="trackDot"></div></div>`; }
      else{ const display=item.d||item.k; const cls=item.c||''; const id=item.id?` id="${item.id}"`:''; const sh=item.s?` data-shift="${item.s}"`:''; html+=`<div class="key ${cls}"${id} data-key="${item.k}"${sh}>${display}</div>`; }
    });
    html+=`</div>`;
  });
  keyboardEl.innerHTML=html;
  attachFastEvents();
  updateUI();
  updateSuggestions();
}

function updateUI(){
  document.getElementById('capsKey')?.classList.toggle('active', isCaps);
  document.querySelectorAll('#shiftKey,#shiftKey2').forEach(k=>k.classList.toggle('active', isShift));
  document.getElementById('ctrlKey')?.classList.toggle('active', isCtrl);
  document.getElementById('altKey')?.classList.toggle('active', isAlt);
  langIndicator.textContent=currentLang.toUpperCase();
  versionText.textContent=`FAST • BIG • ${currentTheme.toUpperCase()}`;
  document.body.className=document.body.className.replace(/theme-\S+/g,'');
  document.body.classList.add('theme-'+currentTheme);
}

// كتابة سريعة بدون أخطاء - Fast typing queue
let deleteInterval=null,deleteSpeed=100,deleteHoldTimer=null;
function startFastDelete(){ del(); onDelete(); playSound(); deleteSpeed=100; deleteInterval=setInterval(()=>{ del(); onDelete(); playSound(); if(deleteSpeed>18){ deleteSpeed-=4; clearInterval(deleteInterval); deleteInterval=setInterval(()=>{del(); onDelete();},deleteSpeed); } },deleteSpeed); }
function stopFastDelete(){ clearInterval(deleteInterval); deleteInterval=null; deleteSpeed=100; clearTimeout(deleteHoldTimer); }

function attachFastEvents(){
  // منع ghost clicks وتسريع الاستجابة
  const keys=keyboardEl.querySelectorAll('.key:not(.space-trackpad)');
  keys.forEach(k=>{
    let startTime=0,startX=0,startY=0,moved=false;
    k.addEventListener('pointerdown',e=>{
      e.preventDefault();
      startTime=Date.now(); startX=e.clientX; startY=e.clientY; moved=false;
      k.classList.add('pressed');
      if(currentRGB!=='off'){ k.classList.add('rgb-react'); triggerRGBWave(k); }
      // زر المسح السريع
      if(k.id==='delKey'||k.dataset.key==='Backspace'){
        deleteHoldTimer=setTimeout(()=>{ startFastDelete(); },280);
      }
      k.setPointerCapture(e.pointerId);
    },{passive:false});
    
    k.addEventListener('pointermove',e=>{
      if(Math.abs(e.clientX-startX)>12||Math.abs(e.clientY-startY)>12){ moved=true; k.classList.remove('pressed'); stopFastDelete(); }
    },{passive:false});
    
    k.addEventListener('pointerup',e=>{
      e.preventDefault();
      k.classList.remove('pressed');
      stopFastDelete();
      setTimeout(()=>{ if(currentRGB!=='off') k.classList.remove('rgb-react'); },350);
      if(moved) return;
      if(Date.now()-startTime>500) return; // long press handled separately
      // منع الضغط المزدوج السريع جداً (ghost)
      const now=Date.now();
      if(k.dataset.key===lastTapKey && now-lastTapTime<40) return;
      lastTapTime=now; lastTapKey=k.dataset.key;
      
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
    },{passive:false});
    
    k.addEventListener('pointercancel',()=>{ k.classList.remove('pressed'); stopFastDelete(); if(currentRGB!=='off') setTimeout(()=>k.classList.remove('rgb-react'),350); });
  });

  // SPACE TRACKPAD
  const spaceTrackpad=document.getElementById('spaceTrackpad');
  if(!spaceTrackpad) return;
  const trackDot=document.getElementById('trackDot'),trackGrid=document.getElementById('trackpadGrid'),overlay=document.getElementById('overlay');
  if(trackGrid){trackGrid.innerHTML=''; for(let i=0;i<48;i++){const d=document.createElement('div'); trackGrid.appendChild(d);}}
  function activate(){ if(isTrackpadActive) return; isTrackpadActive=true; spaceTrackpad.classList.add('track-active'); overlay.classList.add('show'); vibrate(); playSound(); }
  function deactivate(){ if(!isTrackpadActive) return; isTrackpadActive=false; spaceTrackpad.classList.remove('track-active'); if(!isFullTrackpad) overlay.classList.remove('show'); if(trackDot) trackDot.style.left='50%'; }
  function onStart(x,y){ startX=lastMoveX=x; startY=y; clearTimeout(holdTimer); holdTimer=setTimeout(()=>activate(),380); }
  function onMove(x){ if(!isTrackpadActive){ if(Math.abs(x-startX)>10) clearTimeout(holdTimer); return; } const dx=x-lastMoveX; if(Math.abs(dx)>7){ if(dx>0) moveCursor(1); else moveCursor(-1); lastMoveX=x; const rect=spaceTrackpad.getBoundingClientRect(); let pct=((x-rect.left)/rect.width)*100; pct=Math.max(5,Math.min(95,pct)); if(trackDot) trackDot.style.left=pct+'%'; } }
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

currentLang=loadSet('language','en'); currentTheme=loadSet('theme','dark'); currentSound=loadSet('sound','clicky'); currentRGB=loadSet('rgb','reactive'); soundEnabled=loadSet('sound_enabled','true')==='true'; vibEnabled=loadSet('vib','true')==='true';
document.querySelector(`[data-lang="${currentLang}"]`)?.classList.add('active');
document.querySelector(`[data-theme="${currentTheme}"]`)?.classList.add('active');
document.querySelector(`[data-sound="${currentSound}"]`)?.classList.add('active');
document.querySelector(`[data-rgb="${currentRGB}"]`)?.classList.add('active');
renderKeyboard();
console.log('Rapoo v2.3 FAST & BIG - Bigger keys, fast typing queue, 2x faster RGB');
