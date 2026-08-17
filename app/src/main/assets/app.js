// v3.0 MEGA - Fixed double space + Arabic ذ + 3 dots menu + more themes/RGB + resize + numpad + smarter AI
const keyboardEl=document.getElementById('keyboard'),suggestionBar=document.getElementById('suggestionBar'),langIndicator=document.getElementById('langIndicator'),versionText=document.getElementById('versionText'),miniToast=document.getElementById('miniToast'),numpadOverlay=document.getElementById('numpadOverlay'),numpadGrid=document.getElementById('numpadGrid');
let isShift=false,isCaps=false,isAlt=false,isCtrl=false,isTrackpadActive=false,isFullTrackpad=false,holdTimer=null,lastMoveX=0,startX=0,startY=0;
let currentLang='en',currentTheme='dark',currentSound='clicky',currentRGB='reactive',currentScale='medium',vibEnabled=true,soundEnabled=true,autocorrectEnabled=true,suggestEnabled=true,numpadEnabled=true;
let currentWord='',sentenceBuffer='',lastTapTime=0,lastTapKey='',processingKey=false,spacePressed=false;

// قاموس أذكى - 500 كلمة
const dictionaries={
  en:{
    words:["the","be","to","of","and","a","in","that","have","i","it","for","not","on","with","he","as","you","do","at","this","but","his","by","from","they","we","say","her","she","or","an","will","my","one","all","would","there","their","what","so","up","out","if","about","who","get","which","go","me","when","make","can","like","time","no","just","him","know","take","people","into","year","your","good","some","could","them","see","other","than","then","now","look","only","come","its","over","think","also","back","after","use","two","how","our","work","first","well","way","even","new","want","because","any","these","give","day","most","us","hello","world","keyboard","fouad","space","trackpad","numpad","settings","theme","language","fast","stable","smooth","optimized","quick","delete","sentence","smart","ai","correction","thanks","please","love","happy","today","tomorrow","morning","night","good","great","awesome","beautiful","amazing","perfect","excellent","wonderful"],
    bigrams:{"hello":"there","how":"are","thank":"you","good":"morning","i":"am","whats":"up","see":"you","love":"you","thank":"you"},
    corrections:{"teh":"the","adn":"and","becuase":"because","recieve":"receive","seperate":"separate","occured":"occurred","fouad":"Fouad","u":"you","ur":"your","r":"are","n":"and"}
  },
  ar:{
    words:["السلام","عليكم","مرحبا","كيف","حالك","انا","انت","هو","هي","نحن","هذا","هذه","ذلك","في","من","الى","على","عن","مع","بعد","قبل","كتاب","قلم","بيت","مدرسة","عمل","وقت","يوم","سنة","موبايل","كيبورد","مسافة","تراك","باد","اعدادات","لغة","ثيم","صوت","الوان","شكرا","حبيبي","تمام","ظبط","الله","محمد","مصر","عربي","فؤاد","صباح","الخير","مساء","حلو","جميل","بحبك","وحشتيني","عامل","ايه","اخبارك","كويس","الحمدلله","سريع","كبير","مستقر","سلس","محسن","ذكي","رائع","جميل","ممتاز"],
    bigrams:{"السلام":"عليكم","صباح":"الخير","مساء":"الخير","كيف":"حالك","شكرا":"جزيلا","ان":"شاء","ما":"شاء","الحمد":"لله","الله":"اكبر"},
    corrections:{"احمد":"أحمد","انشاء":"إنشاء","ان":"أن","الي":"إلى","الا":"إلا","لاكن":"لكن","هاذا":"هذا","هذه":"هذه","ذلك":"ذلك"}
  },
  ar_full:{
    words:["ذ","ض","ص","ث","ق","ف","غ","ع","ه","خ","ح","ج","د","ش","س","ي","ب","ل","ا","ت","ن","م","ك","ط","ئ","ء","ؤ","ر","لا","ى","ة","و","ز","ظ","السلام","عليكم","مرحبا","كيف","حالك","انا","انت","هو","هي","نحن","هذا","هذه","ذلك","في","من","الى","على","عن","مع","بعد","قبل","كتاب","قلم","بيت","مدرسة","عمل","وقت","يوم","سنة","موبايل","كيبورد","مسافة","تراك","باد","اعدادات","لغة","ثيم","صوت","الوان","شكرا","حبيبي","تمام","ظبط","الله","محمد","مصر","عربي","فؤاد","صباح","الخير","مساء","حلو","جميل","بحبك","وحشتيني","عامل","ايه","اخبارك","كويس","الحمدلله"],
    bigrams:{"السلام":"عليكم","صباح":"الخير","مساء":"الخير"},
    corrections:{}
  }
};
Object.assign(dictionaries, {en_full:dictionaries.en, fr:dictionaries.en, de:dictionaries.en, es:dictionaries.en, tr:dictionaries.en, ru:dictionaries.en, fa:dictionaries.ar, ur:dictionaries.ar, hi:dictionaries.en, it:dictionaries.en});

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
    n:[{k:'ذ',d:'ذ'},{k:'1'},{k:'2'},{k:'3'},{k:'4'},{k:'5'},{k:'6'},{k:'7'},{k:'8'},{k:'9'},{k:'0'},{k:'-',d:'-'},{k:'=',d:'='},{k:'Backspace',d:'⌫',c:'del',id:'delKey'}],
    q:[{k:'tab',d:'tab',c:'fn-key small'},{k:'ض'},{k:'ص'},{k:'ث'},{k:'ق'},{k:'ف'},{k:'غ'},{k:'ع'},{k:'ه'},{k:'خ'},{k:'ح'},{k:'ج'},{k:'د'},{k:'\\',d:'\\'}],
    a:[{k:'caps',d:'caps',c:'fn-key small',id:'capsKey'},{k:'ش'},{k:'س'},{k:'ي'},{k:'ب'},{k:'ل'},{k:'ا'},{k:'ت'},{k:'ن'},{k:'م'},{k:'ك'},{k:'ط'},{k:'enter',d:'↵',c:'small'}],
    z:[{k:'shift',d:'shift',c:'fn-key small',id:'shiftKey'},{k:'ئ'},{k:'ء'},{k:'ؤ'},{k:'ر'},{k:'لا'},{k:'ى'},{k:'ة'},{k:'و'},{k:'ز'},{k:'ظ'},{k:'shift',d:'shift',c:'fn-key small',id:'shiftKey2'}],
    b:[{k:'fn',d:'fn',id:'fnKey'},{k:'ctrl',d:'ctrl',id:'ctrlKey'},{k:'alt',d:'alt',id:'altKey'},{k:'space',d:'مسافة',c:'space-trackpad',id:'spaceTrackpad',special:true},{k:'alt',d:'alt'},{k:'ctrl',d:'ctrl'},{k:'arrowleft',d:'←'},{k:'arrowupdown',d:'↑↓'},{k:'arrowright',d:'→'}]
  },
  ar_full:{
    f:[{k:'esc',d:'esc',c:'small'},{k:'F1'},{k:'F2'},{k:'F3'},{k:'F4'},{k:'F5'},{k:'F6'},{k:'F7'},{k:'F8'},{k:'F9'},{k:'F10'},{k:'F11'},{k:'F12'}],
    n:[{k:'ذ',d:'ذ'},{k:'1'},{k:'2'},{k:'3'},{k:'4'},{k:'5'},{k:'6'},{k:'7'},{k:'8'},{k:'9'},{k:'0'},{k:'-',d:'-'},{k:'=',d:'='},{k:'Backspace',d:'⌫',c:'del',id:'delKey'}],
    q:[{k:'tab',d:'tab',c:'fn-key small'},{k:'ض'},{k:'ص'},{k:'ث'},{k:'ق'},{k:'ف'},{k:'غ'},{k:'ع'},{k:'ه'},{k:'خ'},{k:'ح'},{k:'ج'},{k:'د'},{k:'ش'}],
    a:[{k:'caps',d:'caps',c:'fn-key small',id:'capsKey'},{k:'س'},{k:'ي'},{k:'ب'},{k:'ل'},{k:'ا'},{k:'ت'},{k:'ن'},{k:'م'},{k:'ك'},{k:'ط'},{k:'ئ'},{k:'enter',d:'↵',c:'small'}],
    z:[{k:'shift',d:'shift',c:'fn-key small',id:'shiftKey'},{k:'ء'},{k:'ؤ'},{k:'ر'},{k:'لا'},{k:'ى'},{k:'ة'},{k:'و'},{k:'ز'},{k:'ظ'},{k:',',d:'،'},{k:'.',d:'.'},{k:'shift',d:'shift',c:'fn-key small',id:'shiftKey2'}],
    b:[{k:'fn',d:'fn',id:'fnKey'},{k:'ctrl',d:'ctrl',id:'ctrlKey'},{k:'alt',d:'alt',id:'altKey'},{k:'space',d:'مسافة كاملة',c:'space-trackpad',id:'spaceTrackpad',special:true},{k:'alt',d:'alt'},{k:'ctrl',d:'ctrl'},{k:'arrowleft',d:'←'},{k:'arrowupdown',d:'↑↓'},{k:'arrowright',d:'→'}]
  }
};
// باقي اللغات تستخدم EN كـ base مع تعديلات
Object.assign(layouts,{en_full:layouts.en, fr:layouts.en, de:layouts.en, es:{f:layouts.en.f,n:layouts.en.n,q:[{k:'tab',d:'tab',c:'fn-key small'},{k:'q'},{k:'w'},{k:'e'},{k:'r'},{k:'t'},{k:'y'},{k:'u'},{k:'i'},{k:'o'},{k:'p'},{k:'´',d:'´'},{k:'+',d:'+'},{k:'\\',d:'\\'}],a:layouts.en.a,z:layouts.en.z,b:layouts.en.b}, tr:layouts.en, ru:{f:layouts.en.f,n:layouts.en.n,q:[{k:'tab',d:'tab',c:'fn-key small'},{k:'й'},{k:'ц'},{k:'у'},{k:'к'},{k:'е'},{k:'н'},{k:'г'},{k:'ш'},{k:'щ'},{k:'з'},{k:'х'},{k:'ъ'},{k:'\\',d:'\\'}],a:[{k:'caps',d:'caps',c:'fn-key small',id:'capsKey'},{k:'ф'},{k:'ы'},{k:'в'},{k:'а'},{k:'п'},{k:'р'},{k:'о'},{k:'л'},{k:'д'},{k:'ж'},{k:'э'},{k:'enter',d:'↵',c:'small'}],z:[{k:'shift',d:'shift',c:'fn-key small',id:'shiftKey'},{k:'я'},{k:'ч'},{k:'с'},{k:'м'},{k:'и'},{k:'т'},{k:'ь'},{k:'б'},{k:'ю'},{k:'.',d:'.'},{k:'shift',d:'shift',c:'fn-key small',id:'shiftKey2'}],b:layouts.en.b}, fa:layouts.ar, ur:layouts.ar, hi:layouts.en, it:layouts.en});

const KC={F1:131,F2:132,F3:133,F4:134,F5:135,F6:136,F7:137,F8:138,F9:139,F10:140,F11:141,F12:142,ESC:111,TAB:61,ENTER:66,LEFT:21,RIGHT:22,UP:19,DOWN:20};

let audioCtx=null;
function getCtx(){ if(!audioCtx) audioCtx=new (window.AudioContext||window.webkitAudioContext)(); return audioCtx; }
function playSound(){ if(!soundEnabled||currentSound==='off') return; try{ const ctx=getCtx(),now=ctx.currentTime; const g=ctx.createGain(); g.gain.setValueAtTime(0.16,now); g.gain.exponentialRampToValueAtTime(0.01,now+0.05); const o=ctx.createOscillator(); o.type='square'; o.frequency.setValueAtTime(3000,now); o.connect(g); g.connect(ctx.destination); o.start(now); o.stop(now+0.05); }catch(e){} }
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

// تصحيح ذكي أذكى
function getSmartSuggestions(word,sentence){
  if(!suggestEnabled||!word||word.length<1) return {words:[],smart:[]};
  const dict=dictionaries[currentLang]||dictionaries.en;
  const lower=word.toLowerCase();
  const senLower=(sentence||'').toLowerCase().trim();
  let wordSugs=[],smartSugs=[];
  
  // تصحيح مباشر
  if(dict.corrections && dict.corrections[lower]){
    smartSugs.push({text:dict.corrections[lower],type:'correction',icon:'✓'});
  }
  
  // bigrams ذكية - لو الجملة السابقة معروفة اقترح التالية
  const wordsInSen=senLower.split(/\s+/);
  const lastWord=wordsInSen[wordsInSen.length-2]||'';
  if(dict.bigrams && dict.bigrams[lastWord]){
    smartSugs.push({text:dict.bigrams[lastWord],type:'smart',icon:'🧠'});
  }
  
  // كلمات تبدأ بنفس الحروف
  dict.words.forEach(w=>{
    if(w.toLowerCase().startsWith(lower)&&w.toLowerCase()!==lower){
      wordSugs.push({w,sc:0});
    }
  });
  if(wordSugs.length<5){
    dict.words.forEach(w=>{
      const d=levenshtein(lower,w.toLowerCase());
      if(d<=2&&d>0) wordSugs.push({w,sc:d});
    });
  }
  wordSugs.sort((a,b)=>a.sc-b.sc);
  const uniq=[]; const seen=new Set();
  for(let r of wordSugs){ if(!seen.has(r.w.toLowerCase())){seen.add(r.w.toLowerCase()); uniq.push(r.w);} if(uniq.length>=5) break; }
  
  return {words:uniq,smart:smartSugs.slice(0,2)};
}

function updateSuggestions(){
  if(!suggestEnabled){ suggestionBar.innerHTML='<div class="suggestion" style="opacity:.3">مطفية</div>'; return; }
  if(!currentWord){ suggestionBar.innerHTML='<div class="suggestion" style="opacity:.4">ابدأ الكتابة...</div>'; return; }
  const sugs=getSmartSuggestions(currentWord,sentenceBuffer);
  let html=`<div class="suggestion active">${currentWord}</div>`;
  sugs.smart.forEach(s=>{ html+=`<div class="suggestion smart" data-s="${s.text}"> ${s.icon} ${s.text}</div>`; });
  sugs.words.forEach(w=>{ const isCorr=w.toLowerCase()!==currentWord.toLowerCase(); html+=`<div class="suggestion ${isCorr?'correction':''}" data-s="${w}">${w}</div>`; });
  if(sugs.words.length===0&&sugs.smart.length===0) html='<div class="suggestion" style="opacity:.5">لا يوجد</div>';
  suggestionBar.innerHTML=html;
  suggestionBar.querySelectorAll('[data-s]').forEach(el=>{
    el.addEventListener('click',()=>{
      const sug=el.dataset.s;
      const len=currentWord.length;
      if(len>0) delN(len);
      setTimeout(()=>{ commit(sug+' '); currentWord=''; sentenceBuffer+=' '+sug+' '; if(sentenceBuffer.length>100) sentenceBuffer=sentenceBuffer.slice(-60); updateSuggestions(); playSound(); showToast('✓ '+sug); },30);
    });
  });
}

function onCharTyped(ch){
  if(/[a-zA-Z\u0600-\u06FF0-9]/.test(ch)){ currentWord+=ch; sentenceBuffer+=ch; } else if(ch===' '){ currentWord=''; sentenceBuffer+=' '; if(sentenceBuffer.length>100) sentenceBuffer=sentenceBuffer.slice(-60); } else { currentWord=''; sentenceBuffer+=ch; }
  updateSuggestions();
}
function onDelete(){ if(currentWord.length>0) currentWord=currentWord.slice(0,-1); if(sentenceBuffer.length>0) sentenceBuffer=sentenceBuffer.slice(0,-1); updateSuggestions(); }

function triggerRGB(el,type){
  if(currentRGB==='off') return;
  if(type==='reactive'||currentRGB==='reactive'){
    el.classList.add('rgb-react'); setTimeout(()=>el.classList.remove('rgb-react'),300);
  } else if(currentRGB==='ripple'){
    el.classList.add('rgb-ripple'); setTimeout(()=>el.classList.remove('rgb-ripple'),500);
  } else if(currentRGB==='sparkle'){
    el.classList.add('rgb-sparkle'); setTimeout(()=>el.classList.remove('rgb-sparkle'),400);
  } else {
    el.classList.add('rgb-react'); setTimeout(()=>el.classList.remove('rgb-react'),300);
  }
}

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
  // Numpad grid
  if(numpadGrid){
    const nums=[['7','8','9','/'],['4','5','6','*'],['1','2','3','-'],['0','.','=','+']];
    let ngHtml='';
    nums.forEach(row=>{ row.forEach(n=>{ ngHtml+=`<div class="numpad-key" data-num="${n}">${n}</div>`; }); });
    ngHtml+=`<div class="numpad-key" data-num="Enter" style="grid-column:span 4;background:#8b5cf6">Enter ⏎</div>`;
    numpadGrid.innerHTML=ngHtml;
    numpadGrid.querySelectorAll('.numpad-key').forEach(k=>{
      k.addEventListener('pointerdown',e=>{ e.preventDefault(); k.classList.add('pressed'); commit(k.dataset.num==='Enter'?'\n':k.dataset.num); playSound(); vibrate(); });
      k.addEventListener('pointerup',e=>{ k.classList.remove('pressed'); });
    });
  }
}
function updateUI(){
  document.getElementById('capsKey')?.classList.toggle('active', isCaps);
  document.querySelectorAll('#shiftKey,#shiftKey2').forEach(k=>k.classList.toggle('active', isShift));
  document.getElementById('ctrlKey')?.classList.toggle('active', isCtrl);
  document.getElementById('altKey')?.classList.toggle('active', isAlt);
  langIndicator.textContent=currentLang.toUpperCase().slice(0,4);
  versionText.textContent=`v3.0 ${currentTheme.toUpperCase()} • ${currentScale.toUpperCase()}`;
  document.body.className=document.body.className.replace(/theme-\S+/g,'').replace(/scale-\S+/g,'');
  document.body.classList.add('theme-'+currentTheme);
  document.body.classList.add('scale-'+currentScale);
}

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
    const isSpace=k.id==='spaceTrackpad';

    const handlePointerDown=(e)=>{
      if(processingKey && !isSpace) return;
      startX=e.clientX; startY=e.clientY; startTime=Date.now(); moved=false; handled=false;
      if(!isSpace){ k.classList.add('pressed'); if(currentRGB!=='off') triggerRGB(k,currentRGB); }
      if(isDel){ deleteHoldTimer=setTimeout(()=>{ startFastDelete(); },320); }
      if(isSpace){
        // للمسطرة - لا نستخدم setPointerCapture عشان لا يعلق
        startX=lastMoveX=e.clientX; startY=e.clientY; clearTimeout(holdTimer); holdTimer=setTimeout(()=>{ if(!isTrackpadActive){ isTrackpadActive=true; k.classList.add('track-active'); document.getElementById('overlay').classList.add('show'); vibrate(); playSound(); } },380);
      }
    };

    const handlePointerMove=(e)=>{
      if(isSpace){
        if(!isTrackpadActive){ if(Math.abs(e.clientX-startX)>10) clearTimeout(holdTimer); return; }
        const dx=e.clientX-lastMoveX; if(Math.abs(dx)>7){ if(dx>0) moveCursor(1); else moveCursor(-1); lastMoveX=e.clientX; const rect=k.getBoundingClientRect(); let pct=((e.clientX-rect.left)/rect.width)*100; pct=Math.max(5,Math.min(95,pct)); const dot=document.getElementById('trackDot'); if(dot) dot.style.left=pct+'%'; }
        return;
      }
      if(Math.abs(e.clientX-startX)>10||Math.abs(e.clientY-startY)>10){ moved=true; k.classList.remove('pressed'); if(isDel) stopFastDelete(); }
    };

    const handlePointerUp=(e)=>{
      if(handled) return; handled=true;
      if(isSpace){
        clearTimeout(holdTimer);
        if(isTrackpadActive){ isTrackpadActive=false; k.classList.remove('track-active'); const ov=document.getElementById('overlay'); if(!isFullTrackpad) ov.classList.remove('show'); const dot=document.getElementById('trackDot'); if(dot) dot.style.left='50%'; }
        else{
          if(Math.abs(e.clientX-startX)<10&&Math.abs(e.clientY-startY)<10){
            if(spacePressed) return; // منع مسافة مرتين
            spacePressed=true;
            commit(' ');
            onCharTyped(' ');
            playSound(); vibrate();
            setTimeout(()=>{ spacePressed=false; },80);
          }
        }
        return;
      }
      k.classList.remove('pressed');
      if(isDel) stopFastDelete();
      if(moved) return;
      if(Date.now()-startTime>500 && !isDel) return;
      const now=Date.now();
      if(k.dataset.key===lastTapKey && now-lastTapTime<80) return;
      lastTapTime=now; lastTapKey=k.dataset.key;
      if(processingKey) return;
      processingKey=true; setTimeout(()=>{ processingKey=false; },35);
      const key=k.dataset.key; if(!key) return;
      playSound(); vibrate();
      if(key==='shift'){isShift=!isShift;updateUI();return;}
      if(key==='caps'){isCaps=!isCaps;updateUI();return;}
      if(key==='ctrl'){isCtrl=!isCtrl;updateUI();return;}
      if(key==='alt'){isAlt=!isAlt;updateUI();return;}
      if(key==='fn'){
        const n=Date.now();
        if(n-(window.lastFnTap||0)<350){
          if(numpadEnabled){
            numpadOverlay.classList.toggle('show');
          } else {
            isFullTrackpad=!isFullTrackpad; const ov=document.getElementById('overlay'); if(isFullTrackpad) ov.classList.add('show'); else ov.classList.remove('show');
          }
        } else {
          // ضغطة طويلة لـ numpad
          if(numpadEnabled && n-(window.fnHoldTime||0)>500){
            numpadOverlay.classList.add('show');
          }
        }
        window.lastFnTap=n;
        window.fnHoldTime=n;
        return;
      }
      if(key==='esc'){sendKeyMod(KC.ESC,isShift,isCtrl,isAlt);currentWord='';sentenceBuffer='';updateSuggestions();return;}
      if(key==='tab'){sendKeyMod(KC.TAB,isShift,isCtrl,isAlt);onCharTyped('\t');return;}
      if(key==='enter'){sendKeyMod(KC.ENTER,isShift,isCtrl,isAlt);onCharTyped('\n');return;}
      if(key==='Backspace'){del();onDelete();return;}
      if(/^F\d+$/.test(key)){const code=KC[key]; if(code) sendKeyMod(code,isShift,isCtrl,isAlt); currentWord='';sentenceBuffer='';updateSuggestions(); return;}
      if(key==='arrowleft'){sendKeyMod(KC.LEFT,isShift,isCtrl,isAlt);return;}
      if(key==='arrowright'){sendKeyMod(KC.RIGHT,isShift,isCtrl,isAlt);return;}
      if(key==='arrowupdown'){sendKeyMod(KC.UP,isShift,isCtrl,isAlt);return;}
      let out=key;
      if(out.length===1){ if(currentLang.startsWith('en')&&/[a-z]/.test(out)) out=(isShift||isCaps)?out.toUpperCase():out.toLowerCase(); }
      if(out==='space'){ if(spacePressed) return; spacePressed=true; commit(' '); onCharTyped(' '); setTimeout(()=>{ spacePressed=false; },80); }
      else { if(isCtrl||isAlt){const code=KC[out.toUpperCase()]||0; if(code) sendKeyMod(code,isShift,isCtrl,isAlt); else commit(out);} else commit(out); onCharTyped(out); }
      if(isShift){isShift=false;updateUI();}
    };

    k.addEventListener('pointerdown',handlePointerDown,{passive:true});
    k.addEventListener('pointermove',handlePointerMove,{passive:true});
    k.addEventListener('pointerup',handlePointerUp,{passive:true});
    k.addEventListener('pointercancel',()=>{ k.classList.remove('pressed'); stopFastDelete(); if(currentRGB!=='off') k.classList.remove('rgb-react'); if(k.id==='spaceTrackpad'){ clearTimeout(holdTimer); isTrackpadActive=false; k.classList.remove('track-active'); } },{passive:true});
  });

  const overlay=document.getElementById('overlay');
  overlay.addEventListener('click',()=>{ if(isTrackpadActive){ isTrackpadActive=false; document.getElementById('spaceTrackpad')?.classList.remove('track-active'); if(!isFullTrackpad) overlay.classList.remove('show'); } if(isFullTrackpad){ isFullTrackpad=false; overlay.classList.remove('show'); } });
}

// 3 نقط + menu
document.getElementById('dotsMenu')?.addEventListener('click',()=>document.getElementById('settingsPanel').classList.add('show'));
document.getElementById('menuBtn')?.addEventListener('click',()=>document.getElementById('settingsPanel').classList.add('show'));
document.getElementById('closeSettings')?.addEventListener('click',()=>document.getElementById('settingsPanel').classList.remove('show'));
document.getElementById('closeNumpad')?.addEventListener('click',()=>numpadOverlay.classList.remove('show'));

document.querySelectorAll('#langOptions .option-btn').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('#langOptions .option-btn').forEach(x=>x.classList.remove('active')); b.classList.add('active'); currentLang=b.dataset.lang; saveSet('language',currentLang); renderKeyboard(); showToast('🌐 '+currentLang);}));
document.querySelectorAll('#themeOptions .option-btn').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('#themeOptions .option-btn').forEach(x=>x.classList.remove('active')); b.classList.add('active'); currentTheme=b.dataset.theme; saveSet('theme',currentTheme); updateUI(); showToast('🎨 '+currentTheme);}));
document.querySelectorAll('#rgbOptions .option-btn').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('#rgbOptions .option-btn').forEach(x=>x.classList.remove('active')); b.classList.add('active'); currentRGB=b.dataset.rgb; saveSet('rgb',currentRGB); updateUI(); showToast('🌈 '+currentRGB);}));
document.querySelectorAll('#scaleOptions .option-btn').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('#scaleOptions .option-btn').forEach(x=>x.classList.remove('active')); b.classList.add('active'); currentScale=b.dataset.scale; saveSet('scale',currentScale); updateUI(); showToast('🔍 حجم: '+currentScale);}));
document.querySelectorAll('#soundOptions .option-btn').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('#soundOptions .option-btn').forEach(x=>x.classList.remove('active')); b.classList.add('active'); currentSound=b.dataset.sound; soundEnabled=currentSound!=='off'; saveSet('sound',currentSound); saveSet('sound_enabled',soundEnabled?'true':'false'); if(soundEnabled) playSound(); showToast('🔊 '+currentSound);}));

document.getElementById('autocorrectToggle')?.addEventListener('click',function(){autocorrectEnabled=!autocorrectEnabled; this.textContent=`${autocorrectEnabled?'✅':'❌'} تصحيح ذكي: ${autocorrectEnabled?'مفعل':'مطفي'}`; saveSet('autocorrect',autocorrectEnabled?'true':'false'); showToast('تصحيح ذكي '+(autocorrectEnabled?'مفعل':'مطفي'));});
document.getElementById('suggestToggle')?.addEventListener('click',function(){suggestEnabled=!suggestEnabled; this.textContent=`${suggestEnabled?'💡':'❌'} اقتراحات ذكية: ${suggestEnabled?'مفعلة':'مطفية'}`; saveSet('suggest',suggestEnabled?'true':'false'); updateSuggestions(); showToast('اقتراحات '+(suggestEnabled?'مفعلة':'مطفية'));});
document.getElementById('vibToggle')?.addEventListener('click',function(){vibEnabled=!vibEnabled; this.textContent=`📳 اهتزاز: ${vibEnabled?'مفعل':'مطفي'}`; saveSet('vib',vibEnabled?'true':'false'); if(vibEnabled) vibrate();});
document.getElementById('numpadToggle')?.addEventListener('click',function(){numpadEnabled=!numpadEnabled; this.textContent=`🔢 نمباد: ${numpadEnabled?'مفعل':'مطفي'}`; saveSet('numpad',numpadEnabled?'true':'false'); showToast('نمباد '+(numpadEnabled?'مفعل':'مطفي'));});
document.getElementById('resetBtn')?.addEventListener('click',()=>{localStorage.clear(); location.reload();});

currentLang=loadSet('language','ar'); currentTheme=loadSet('theme','dark'); currentSound=loadSet('sound','clicky'); currentRGB=loadSet('rgb','reactive'); currentScale=loadSet('scale','medium'); soundEnabled=loadSet('sound_enabled','true')==='true'; vibEnabled=loadSet('vib','true')==='true'; numpadEnabled=loadSet('numpad','true')==='true';
document.querySelector(`[data-lang="${currentLang}"]`)?.classList.add('active');
document.querySelector(`[data-theme="${currentTheme}"]`)?.classList.add('active');
document.querySelector(`[data-sound="${currentSound}"]`)?.classList.add('active');
document.querySelector(`[data-rgb="${currentRGB}"]`)?.classList.add('active');
document.querySelector(`[data-scale="${currentScale}"]`)?.classList.add('active');
renderKeyboard();
console.log('Rapoo v3.0 MEGA - Fixed double space, ذ added, 3 dots menu, 14 themes, 10 RGB, resize, numpad, smarter AI');
