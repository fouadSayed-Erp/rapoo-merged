const keyboardEl=document.getElementById('keyboard'),suggestionBar=document.getElementById('suggestionBar'),langIndicator=document.getElementById('langIndicator'),versionText=document.getElementById('versionText'),miniToast=document.getElementById('miniToast'),numpadOverlay=document.getElementById('numpadOverlay'),numpadGrid=document.getElementById('numpadGrid'),batteryDisplay=document.getElementById('batteryDisplay'),timeDisplay=document.getElementById('timeDisplay'),keyboardContainer=document.getElementById('keyboardContainer'),clipboardBar=document.getElementById('clipboardBar');
let isShift=false,isCaps=false,isCtrl=false,isAlt=false,isTrackpadActive=false,holdTimer=null,lastMoveX=0;
let currentLang='ar',currentTheme='dark',currentScale='medium',vibEnabled=true,autocorrectEnabled=true,suggestEnabled=true,numpadEnabled=true,micEnabled=true,isFloating=false,isMicListening=false;
let currentWord='',lastTapTime=0,lastTapKey='',processingKey=false,spacePressed=false;
let clipboardItems=["مرحبا","كيف حالك","فؤاد","شكرا","تمام","السلام عليكم","أهلا وسهلا"];
const arabicFullDict=["ذ","ض","ص","ث","ق","ف","غ","ع","ه","خ","ح","ج","د","ش","س","ي","ب","ل","ا","ت","ن","م","ك","ط","ئ","ء","ؤ","ر","لا","ى","ة","و","ز","ظ","السلام","عليكم","مرحبا","كيف","حالك","انا","انت","هذا","هذه","ذلك","في","من","الى","على","عن","مع","كتاب","قلم","بيت","مدرسة","عمل","وقت","يوم","سنة","موبايل","كيبورد","مسافة","تراك","باد","شكرا","حبيبي","تمام","الله","محمد","مصر","فؤاد","صباح","الخير","مساء","حلو","سريع","تتم","تم"];
const arabicCorrections={"هاذا":"هذا","هاذي":"هذه","ذالك":"ذلك","انامعرش":"انا معرفش","معرش":"معرفش","تتم":"تم"};
const dictionaries={ar:{words:arabicFullDict, corrections:arabicCorrections, bigrams:{"السلام":"عليكم"}},ar_full:{words:arabicFullDict, corrections:arabicCorrections},en:{words:["the","be","to","of","and","a","in","that","have","I","it","for","not","on","with","he","as","you","do","at","this","but","his","by","from","they","we","hello","world","keyboard","fouad"], corrections:{"teh":"the","u":"you"}}};
const layouts={
  ar:{
    f:[{k:"esc",d:"esc",c:"small"},{k:"F1"},{k:"F2"},{k:"F3"},{k:"F4"},{k:"F5"},{k:"F6"},{k:"F7"},{k:"F8"},{k:"F9"},{k:"F10"},{k:"F11"},{k:"F12"}],
    n:[{k:"ذ",d:"ذ"},{k:"1"},{k:"2"},{k:"3"},{k:"4"},{k:"5"},{k:"6"},{k:"7"},{k:"8"},{k:"9"},{k:"0"},{k:"-",d:"-"},{k:"=",d:"="},{k:"Backspace",d:"⌫",c:"del",id:"delKey"}],
    q:[{k:"tab",d:"tab",c:"small"},{k:"ض"},{k:"ص"},{k:"ث"},{k:"ق"},{k:"ف"},{k:"غ"},{k:"ع"},{k:"ه"},{k:"خ"},{k:"ح"},{k:"ج"},{k:"د"},{k:"\\",d:"\\"}],
    a:[{k:"caps",d:"caps",c:"small",id:"capsKey"},{k:"ش"},{k:"س"},{k:"ي"},{k:"ب"},{k:"ل"},{k:"ا"},{k:"ت"},{k:"ن"},{k:"م"},{k:"ك"},{k:"ط"},{k:"enter",d:"↵",c:"small"}],
    z:[{k:"shift",d:"⇧",c:"shift",id:"shiftKey"},{k:"ئ"},{k:"ء"},{k:"ؤ"},{k:"ر"},{k:"لا"},{k:"ى"},{k:"ة"},{k:"و"},{k:"ز"},{k:"ظ"},{k:"shift",d:"⇧",c:"shift",id:"shiftKey2"}],
    b:[{k:"fn",d:"fn",c:"fn-key",id:"fnKey"},{k:"ctrl",d:"ctrl",c:"fn-key",id:"ctrlKey"},{k:"alt",d:"alt",c:"fn-key",id:"altKey"},{k:"space",d:"مسافة",c:"space-trackpad",id:"spaceTrackpad",special:true},{k:"mic",d:"🎤",c:"mic",id:"micKey"},{k:"clipboard",d:"📋",c:"clipboard",id:"clipboardKey"},{k:"arrowleft",d:"←",c:"fn-key",id:"arrowLeft"},{k:"arrowright",d:"→",c:"fn-key",id:"arrowRight"}]
  },
  ar_full:{
    f:[{k:"esc",d:"esc",c:"small"},{k:"F1"},{k:"F2"},{k:"F3"},{k:"F4"},{k:"F5"},{k:"F6"},{k:"F7"},{k:"F8"},{k:"F9"},{k:"F10"},{k:"F11"},{k:"F12"}],
    n:[{k:"ذ",d:"ذ"},{k:"1"},{k:"2"},{k:"3"},{k:"4"},{k:"5"},{k:"6"},{k:"7"},{k:"8"},{k:"9"},{k:"0"},{k:"-",d:"-"},{k:"=",d:"="},{k:"Backspace",d:"⌫",c:"del",id:"delKey"}],
    q:[{k:"tab",d:"tab",c:"small"},{k:"ض"},{k:"ص"},{k:"ث"},{k:"ق"},{k:"ف"},{k:"غ"},{k:"ع"},{k:"ه"},{k:"خ"},{k:"ح"},{k:"ج"},{k:"د"},{k:"ش"}],
    a:[{k:"caps",d:"caps",c:"small",id:"capsKey"},{k:"س"},{k:"ي"},{k:"ب"},{k:"ل"},{k:"ا"},{k:"ت"},{k:"ن"},{k:"م"},{k:"ك"},{k:"ط"},{k:"ئ"},{k:"enter",d:"↵",c:"small"}],
    z:[{k:"shift",d:"shift",c:"shift",id:"shiftKey"},{k:"ء"},{k:"ؤ"},{k:"ر"},{k:"لا"},{k:"ى"},{k:"ة"},{k:"و"},{k:"ز"},{k:"ظ"},{k:",",d:"،"},{k:"shift",d:"shift",c:"small",id:"shiftKey2"}],
    b:[{k:"fn",d:"fn",c:"fn-key"},{k:"alt",d:"alt",c:"fn-key"},{k:"space",d:"مسافة",c:"space-trackpad",id:"spaceTrackpad",special:true},{k:"mic",d:"🎤",c:"mic",id:"micKey"},{k:"clipboard",d:"📋",c:"clipboard",id:"clipboardKey"},{k:"arrowleft",d:"←",c:"fn-key"},{k:"arrowright",d:"→",c:"fn-key"}]
  },
  en:{
    f:[{k:"esc",d:"esc",c:"small"},{k:"F1"},{k:"F2"},{k:"F3"},{k:"F4"},{k:"F5"},{k:"F6"},{k:"F7"},{k:"F8"},{k:"F9"},{k:"F10"},{k:"F11"},{k:"F12"}],
    n:[{k:"`",d:"`"},{k:"1"},{k:"2"},{k:"3"},{k:"4"},{k:"5"},{k:"6"},{k:"7"},{k:"8"},{k:"9"},{k:"0"},{k:"-",d:"-"},{k:"=",d:"="},{k:"Backspace",d:"⌫",c:"del",id:"delKey"}],
    q:[{k:"tab",d:"tab",c:"small"},{k:"q"},{k:"w"},{k:"e"},{k:"r"},{k:"t"},{k:"y"},{k:"u"},{k:"i"},{k:"o"},{k:"p"},{k:"[",d:"["},{k:"]",d:"]"},{k:"\\",d:"\\"}],
    a:[{k:"caps",d:"caps",c:"small",id:"capsKey"},{k:"a"},{k:"s"},{k:"d"},{k:"f"},{k:"g"},{k:"h"},{k:"j"},{k:"k"},{k:"l"},{k:";",d:";"},{k:"'",d:"'"},{k:"enter",d:"↵",c:"small"}],
    z:[{k:"shift",d:"⇧",c:"shift",id:"shiftKey"},{k:"z"},{k:"x"},{k:"c"},{k:"v"},{k:"b"},{k:"n"},{k:"m"},{k:",",d:","},{k:".",d:"."},{k:"/",d:"/"},{k:"shift",d:"⇧",c:"shift",id:"shiftKey2"}],
    b:[{k:"ctrl",d:"ctrl",c:"fn-key",id:"ctrlKey"},{k:"alt",d:"alt",c:"fn-key",id:"altKey"},{k:"space",d:"Space",c:"space-trackpad",id:"spaceTrackpad",special:true},{k:"mic",d:"🎤",c:"mic",id:"micKey"},{k:"clipboard",d:"📋",c:"clipboard",id:"clipboardKey"},{k:"arrowleft",d:"←",c:"fn-key"},{k:"arrowright",d:"→",c:"fn-key"}]
  }
};
function commit(t){ try{ if(window.Android&&Android.commitText) Android.commitText(t); }catch(e){} }
function del(){ try{ if(window.Android&&Android.deleteText) Android.deleteText(); }catch(e){} }
function delN(n){ try{ if(window.Android&&Android.deleteN) Android.deleteN(n); }catch(e){} }
function moveCursor(dx){ try{ if(window.Android&&Android.moveCursor) Android.moveCursor(dx); }catch(e){} }
function saveSet(k,v){ try{ localStorage.setItem("rapoo_"+k,v); if(window.Android&&Android.saveSetting) Android.saveSetting(k,v);}catch(e){} }
function loadSet(k,d){ try{ const v=localStorage.getItem("rapoo_"+k); if(v!==null) return v; if(window.Android&&Android.getSetting){const av=Android.getSetting(k,d); if(av) return av;}}catch(e){} return d; }
function vibrate(){ if(!vibEnabled) return; try{if(navigator.vibrate) navigator.vibrate(5)}catch(e){} }
function showToast(msg){ miniToast.textContent=msg; miniToast.classList.add("show"); setTimeout(()=>miniToast.classList.remove("show"),1500); }
function levenshtein(a,b){ if(a.length===0) return b.length; if(b.length===0) return a.length; const m=[]; for(let i=0;i<=b.length;i++){m[i]=[i]} for(let j=0;j<=a.length;j++){m[0][j]=j} for(let i=1;i<=b.length;i++){for(let j=1;j<=a.length;j++){if(b.charAt(i-1)==a.charAt(j-1)) m[i][j]=m[i-1][j-1]; else m[i][j]=Math.min(m[i-1][j-1]+1,Math.min(m[i][j-1]+1,m[i-1][j]+1))}} return m[b.length][a.length]; }
function getSmartSuggestions(word){
  if(!suggestEnabled||!word||word.length<1) return {words:[],autoFix:null};
  const dict=dictionaries[currentLang]||dictionaries.ar;
  const lower=word.toLowerCase().trim();
  let wordSugs=[],autoFix=null;
  if(dict.corrections && dict.corrections[lower]) autoFix=dict.corrections[lower];
  dict.words.forEach(w=>{ const wl=w.toLowerCase(); if(wl.startsWith(lower) && wl!==lower && w.length>1){ wordSugs.push({w,sc:0}); } });
  if(wordSugs.length<5 && lower.length>=2){
    dict.words.forEach(w=>{ const wl=w.toLowerCase(); if(Math.abs(wl.length-lower.length)>2) return; const d=levenshtein(lower,wl); if(d<=2 && d>0 && wl!==lower){ wordSugs.push({w,sc:d+2}); } });
  }
  wordSugs.sort((a,b)=>a.sc-b.sc);
  const uniq=[]; const seen=new Set();
  for(let r of wordSugs){ const key=r.w.toLowerCase(); if(!seen.has(key)){ seen.add(key); uniq.push(r.w); } if(uniq.length>=5) break; }
  return {words:uniq,autoFix:autoFix};
}
function updateSuggestions(){
  try{
    if(!suggestEnabled){ suggestionBar.innerHTML='<div class="suggestion" style="opacity:.3">مطفية</div>'; return; }
    if(!currentWord){ suggestionBar.innerHTML='<div class="suggestion" style="opacity:.6">✓ فويس يكتب + تراك باد + نمباد متناسق + F shift alt caps</div>'; return; }
    const sugs=getSmartSuggestions(currentWord);
    let html='';
    if(sugs.autoFix){ html+='<div class="suggestion auto-fix" data-s="'+sugs.autoFix+'">✓ '+sugs.autoFix+' ⏎</div>'; } else { html+='<div class="suggestion active">'+currentWord+'</div>'; }
    sugs.words.forEach(w=>{ if(sugs.autoFix && w.toLowerCase()===sugs.autoFix.toLowerCase()) return; html+='<div class="suggestion correction" data-s="'+w+'">'+w+'</div>'; });
    suggestionBar.innerHTML=html;
    suggestionBar.querySelectorAll("[data-s]").forEach(el=>{
      el.addEventListener("click",()=>{
        const sug=el.dataset.s;
        const len=currentWord.length;
        if(len>0) delN(len);
        setTimeout(()=>{ commit(sug+" "); currentWord=""; updateSuggestions(); },30);
      });
    });
  }catch(e){}
}
function handleSpace(){
  if(!autocorrectEnabled||!currentWord) return false;
  const dict=dictionaries[currentLang]||dictionaries.ar;
  const lower=currentWord.toLowerCase();
  if(dict.corrections && dict.corrections[lower]){
    const correction=dict.corrections[lower];
    delN(currentWord.length);
    setTimeout(()=>{ commit(correction+" "); showToast("✓ "+currentWord+" → "+correction); currentWord=""; },20);
    return true;
  }
  return false;
}
function onCharTyped(ch){
  if(/[a-zA-Z\u0600-\u06FF0-9]/.test(ch)){ currentWord+=ch; }
  else if(ch===" "){ if(handleSpace()){ updateSuggestions(); return; } currentWord=""; }
  else { currentWord=""; }
  updateSuggestions();
}
function onDelete(){ if(currentWord.length>0) currentWord=currentWord.slice(0,-1); updateSuggestions(); }
function updateFooter(){
  try{
    let battery=73;
    if(window.Android&&Android.getBatteryLevel) battery=Android.getBatteryLevel();
    let timeStr="12:41";
    if(window.Android&&Android.getTime) timeStr=Android.getTime();
    else { const d=new Date(); timeStr=d.getHours()+":"+String(d.getMinutes()).padStart(2,"0"); }
    batteryDisplay.innerHTML="🔋 "+battery+"%";
    timeDisplay.textContent=timeStr;
  }catch(e){}
}
setInterval(updateFooter,2000);
updateFooter();

// حافظة محسنة
function updateClipboardBar(){
  clipboardBar.innerHTML="";
  // من التطبيق
  clipboardItems.forEach((item,i)=>{
    const div=document.createElement("div");
    div.className="clip-item";
    div.textContent=item.length>16?item.substring(0,16)+"...":item;
    div.addEventListener("click",()=>{ commit(item+" "); showToast("📋 "+item+" ✓"); clipboardBar.classList.remove("show"); try{ if(window.Android&&Android.copyToClipboard) Android.copyToClipboard(item); }catch(e){} });
    clipboardBar.appendChild(div);
  });
  // من النظام
  try{
    if(window.Android&&Android.getClipboardText){
      const sys=Android.getClipboardText();
      if(sys && sys.length>0 && sys.length<100 && !clipboardItems.includes(sys)){
        const div=document.createElement("div");
        div.className="clip-item";
        div.style.borderColor="#10b981";
        div.textContent="📋 "+(sys.length>14?sys.substring(0,14)+"...":sys);
        div.addEventListener("click",()=>{ commit(sys+" "); showToast("📋 نظام: "+sys+" ✓"); if(!clipboardItems.includes(sys)){ clipboardItems.unshift(sys); if(clipboardItems.length>15) clipboardItems.pop(); } clipboardBar.classList.remove("show"); });
        clipboardBar.appendChild(div);
      }
    }
  }catch(e){}
}
updateClipboardBar();

// فويس - يكتب تلقائي
window.voiceResult=function(text){
  isMicListening=false;
  document.querySelectorAll(".key.mic, #micBtn").forEach(k=>k.classList.remove("listening","active"));
  if(text && text.length>0){
    commit(text+" ");
    showToast("🎤 "+text+" ✓");
    suggestionBar.innerHTML='<div class="suggestion voice" data-s="'+text+'">🎤 '+text+'</div>';
    try{ if(!clipboardItems.includes(text)){ clipboardItems.unshift(text); if(clipboardItems.length>15) clipboardItems.pop(); updateClipboardBar(); } }catch(e){}
  } else {
    showToast("🎤 لم أسمع شيئاً");
  }
};
window.voiceEnded=function(msg){
  isMicListening=false;
  document.querySelectorAll(".key.mic, #micBtn").forEach(k=>k.classList.remove("listening","active"));
  showToast("🎤 "+(msg||"انتهى"));
};

function renderKeyboard(){
  try{
    const layout=layouts[currentLang]||layouts.ar;
    let html="";
    const rows=[{k:"f",cls:"row-f"},{k:"n",cls:"row-n"},{k:"q",cls:"row-q"},{k:"a",cls:"row-a"},{k:"z",cls:"row-z"},{k:"b",cls:"row-b"}];
    rows.forEach(r=>{
      const row=layout[r.k]; if(!row) return;
      html+='<div class="row '+r.cls+'">';
      row.forEach(item=>{
        if(item.special){ html+='<div class="key '+ (item.c||"") +'" id="'+ (item.id||"") +'" data-key="'+item.k+'"><div class="space-content"><span>'+item.d+'</span><div class="track-icon">▣</div></div><div class="space-hint">مسافة • تراك باد HOLD</div><div class="trackpad-grid" id="trackpadGrid"></div><div class="track-dot" id="trackDot"></div></div>'; }
        else{ const disp=item.d||item.k; html+='<div class="key '+(item.c||"")+'"'+(item.id?' id="'+item.id+'"':"")+' data-key="'+item.k+'">'+disp+'</div>'; }
      });
      html+="</div>";
    });
    keyboardEl.innerHTML=html;
    attachEvents();
    updateUI();
    updateSuggestions();
    if(numpadGrid){
      const nums=[["7","8","9","/"],["4","5","6","*"],["1","2","3","-"],["0",".","=","+"]];
      let ngHtml="";
      nums.forEach(row=>{ row.forEach(n=>{ ngHtml+='<div class="numpad-key" data-num="'+n+'">'+n+'</div>'; }); });
      ngHtml+='<div class="numpad-key" data-num="Enter" style="grid-column:span 2;background:#8b5cf6">↵</div>';
      ngHtml+='<div class="numpad-key" data-num="C" style="background:#ff4444">⌫</div>';
      ngHtml+='<div class="numpad-key" data-num="Close" style="background:#252525">✕</div>';
      numpadGrid.innerHTML=ngHtml;
      numpadGrid.querySelectorAll(".numpad-key").forEach(k=>{
        k.addEventListener("pointerdown",e=>{ 
          e.preventDefault(); 
          k.classList.add("pressed"); 
          const num=k.dataset.num;
          if(num==="Enter"){ commit("\n"); }
          else if(num==="C"){ del(); }
          else if(num==="Close"){ numpadOverlay.classList.remove("show"); }
          else { commit(num); }
          vibrate();
        });
        k.addEventListener("pointerup",e=>{ k.classList.remove("pressed"); });
      });
    }
  }catch(e){ keyboardEl.innerHTML='<div style="color:red;padding:15px">خطأ: '+e.message+'</div>'; }
}
function updateUI(){
  try{
    document.getElementById("capsKey")?.classList.toggle("active", isCaps);
    document.querySelectorAll("#shiftKey,#shiftKey2").forEach(k=>k.classList.toggle("active", isShift||isCaps));
    document.getElementById("ctrlKey")?.classList.toggle("active", isCtrl);
    document.getElementById("altKey")?.classList.toggle("active", isAlt);
    langIndicator.textContent=currentLang.toUpperCase().slice(0,3);
    versionText.textContent="v3.9 FIX ALL";
    document.body.className=document.body.className.replace(/theme-\S+/g,"").replace(/scale-\S+/g,"");
    document.body.classList.add("theme-"+currentTheme);
    document.body.classList.add("scale-"+currentScale);
    if(isFloating) keyboardContainer.classList.add("floating"); else keyboardContainer.classList.remove("floating");
  }catch(e){}
}
let deleteInterval=null,deleteHoldTimer=null,deleteActive=false;
function startFastDelete(){ if(deleteActive) return; deleteActive=true; del(); onDelete(); deleteInterval=setInterval(()=>{ del(); onDelete(); },80); }
function stopFastDelete(){ deleteActive=false; clearInterval(deleteInterval); deleteInterval=null; clearTimeout(deleteHoldTimer); deleteHoldTimer=null; }

function attachEvents(){
  window.addEventListener("pointerup",stopFastDelete,{passive:true});
  const keys=keyboardEl.querySelectorAll(".key");
  keys.forEach(k=>{
    let startX=0,startY=0,moved=false,isDel=k.id==="delKey";
    let handled=false;
    const isSpace=k.id==="spaceTrackpad";
    const isMic=k.id==="micKey"||k.dataset.key==="mic";
    const isClip=k.id==="clipboardKey"||k.dataset.key==="clipboard";
    const isFn=k.id==="fnKey"||k.dataset.key==="fn";
    const handlePointerDown=(e)=>{
      if(processingKey && !isSpace) return;
      const touch=e.touches?e.touches[0]:e;
      startX=touch.clientX; startY=touch.clientY; moved=false; handled=false; lastMoveX=touch.clientX;
      if(!isSpace) k.classList.add("pressed");
      if(isDel) deleteHoldTimer=setTimeout(()=>{ startFastDelete(); },300);
      if(isSpace){
        clearTimeout(holdTimer);
        holdTimer=setTimeout(()=>{
          if(!isTrackpadActive){
            isTrackpadActive=true;
            k.classList.add("track-active");
            document.getElementById("overlay").classList.add("show");
            vibrate();
            showToast("👆 تراك باد شغال");
          }
        },350);
      }
    };
    const handlePointerMove=(e)=>{
      const touch=e.touches?e.touches[0]:e;
      if(isSpace){
        if(!isTrackpadActive){ if(Math.abs(touch.clientX-startX)>12) clearTimeout(holdTimer); return; }
        const dx=touch.clientX-lastMoveX;
        if(Math.abs(dx)>6){ if(dx>0) moveCursor(1); else moveCursor(-1); lastMoveX=touch.clientX; const rect=k.getBoundingClientRect(); let pct=((touch.clientX-rect.left)/rect.width)*100; pct=Math.max(5,Math.min(95,pct)); const dot=document.getElementById("trackDot"); if(dot) dot.style.left=pct+"%"; }
        if(e.cancelable) e.preventDefault();
        return;
      }
      if(Math.abs(touch.clientX-startX)>10||Math.abs(touch.clientY-startY)>10){ moved=true; k.classList.remove("pressed"); if(isDel) stopFastDelete(); }
    };
    const handlePointerUp=(e)=>{
      if(handled) return; handled=true;
      const touch=e.changedTouches?e.changedTouches[0]:e;
      if(isSpace){
        clearTimeout(holdTimer);
        if(isTrackpadActive){ isTrackpadActive=false; k.classList.remove("track-active"); document.getElementById("overlay").classList.remove("show"); const dot=document.getElementById("trackDot"); if(dot) dot.style.left="50%"; }
        else{
          if(Math.abs(touch.clientX-startX)<12&&Math.abs(touch.clientY-startY)<12){
            if(spacePressed) return; spacePressed=true;
            if(!handleSpace()){ commit(" "); onCharTyped(" "); }
            vibrate();
            setTimeout(()=>{ spacePressed=false; },80);
          }
        }
        return;
      }
      k.classList.remove("pressed");
      if(isDel) stopFastDelete();
      if(moved) return;
      const now=Date.now();
      if(k.dataset.key===lastTapKey && now-lastTapTime<80) return;
      lastTapTime=now; lastTapKey=k.dataset.key;
      if(processingKey) return; processingKey=true; setTimeout(()=>{ processingKey=false; },40);
      const key=k.dataset.key; if(!key) return;
      vibrate();
      if(isMic){
        if(isMicListening){
          try{ if(window.Android&&Android.stopVoiceInput) Android.stopVoiceInput(); }catch(e){}
          isMicListening=false;
          k.classList.remove("listening");
          document.getElementById("micBtn")?.classList.remove("listening","active");
          showToast("🎤 تم الإيقاف");
          return;
        }
        if(!micEnabled){ showToast("🎤 مايك مطفي"); return; }
        isMicListening=true;
        k.classList.add("listening");
        document.getElementById("micBtn")?.classList.add("listening","active");
        showToast("🎤 اتكلم الآن...");
        try{ if(window.Android&&Android.startVoiceInput) Android.startVoiceInput(); }catch(e){ isMicListening=false; k.classList.remove("listening"); }
        setTimeout(()=>{ if(isMicListening){ isMicListening=false; k.classList.remove("listening"); document.getElementById("micBtn")?.classList.remove("listening","active"); } },8000);
        return;
      }
      if(isClip){ clipboardBar.classList.toggle("show"); updateClipboardBar(); return; }
      if(isFn){
        const nowFn=Date.now();
        if(nowFn-(window.lastFnTap||0)<350){
          if(numpadEnabled){
            numpadOverlay.classList.toggle("show");
            showToast(numpadOverlay.classList.contains("show")?"🔢 نمباد متناسق ✓":"🔢 مقفول");
          }
        }
        window.lastFnTap=nowFn;
        return;
      }
      if(key==="shift"){isShift=!isShift;updateUI();return;}
      if(key==="caps"){isCaps=!isCaps;updateUI();return;}
      if(key==="ctrl"){isCtrl=!isCtrl;updateUI();return;}
      if(key==="alt"){isAlt=!isAlt;updateUI();return;}
      if(key==="Backspace"){del();onDelete();return;}
      if(key==="arrowleft"){moveCursor(-1);return;}
      if(key==="arrowright"){moveCursor(1);return;}
      if(key==="esc"||key.startsWith("F")){ showToast(key+" ✓"); return; }
      let out=key;
      if(out.length===1 && currentLang.startsWith("en")&&/[a-z]/.test(out)) out=(isShift||isCaps)?out.toUpperCase():out.toLowerCase();
      if(out==="space"){ if(spacePressed) return; spacePressed=true; if(!handleSpace()){ commit(" "); onCharTyped(" "); } setTimeout(()=>{ spacePressed=false; },80); }
      else { commit(out); onCharTyped(out); try{ if(out.length>1 && !clipboardItems.includes(out)){ clipboardItems.unshift(out); if(clipboardItems.length>15) clipboardItems.pop(); } }catch(e){} }
      if(isShift){isShift=false;updateUI();}
    };
    k.addEventListener("touchstart",handlePointerDown,{passive:true});
    k.addEventListener("touchmove",handlePointerMove,{passive:false});
    k.addEventListener("touchend",handlePointerUp,{passive:true});
    k.addEventListener("pointerdown",handlePointerDown,{passive:true});
    k.addEventListener("pointermove",handlePointerMove,{passive:true});
    k.addEventListener("pointerup",handlePointerUp,{passive:true});
    k.addEventListener("pointercancel",()=>{ k.classList.remove("pressed"); stopFastDelete(); if(k.id==="spaceTrackpad"){ clearTimeout(holdTimer); isTrackpadActive=false; k.classList.remove("track-active"); document.getElementById("overlay").classList.remove("show"); } },{passive:true});
  });
  const overlay=document.getElementById("overlay");
  if(overlay) overlay.addEventListener("click",()=>{ isTrackpadActive=false; document.getElementById("spaceTrackpad")?.classList.remove("track-active"); overlay.classList.remove("show"); });
}
document.getElementById("dotsMenu")?.addEventListener("click",()=>document.getElementById("settingsPanel").classList.add("show"));
document.getElementById("closeSettings")?.addEventListener("click",()=>document.getElementById("settingsPanel").classList.remove("show"));
document.getElementById("closeNumpad")?.addEventListener("click",()=>numpadOverlay.classList.remove("show"));
document.getElementById("micBtn")?.addEventListener("click",function(){
  if(isMicListening){
    try{ if(window.Android&&Android.stopVoiceInput) Android.stopVoiceInput(); }catch(e){}
    isMicListening=false;
    this.classList.remove("listening","active");
    document.querySelectorAll(".key.mic").forEach(k=>k.classList.remove("listening"));
    showToast("🎤 تم الإيقاف");
    return;
  }
  if(!micEnabled){ showToast("🎤 مايك مطفي"); return; }
  isMicListening=true;
  this.classList.add("listening","active");
  document.querySelectorAll(".key.mic").forEach(k=>k.classList.add("listening"));
  showToast("🎤 اتكلم الآن...");
  try{ if(window.Android&&Android.startVoiceInput) Android.startVoiceInput(); }catch(e){ isMicListening=false; this.classList.remove("listening","active"); }
  setTimeout(()=>{ if(isMicListening){ isMicListening=false; this.classList.remove("listening","active"); document.querySelectorAll(".key.mic").forEach(k=>k.classList.remove("listening")); } },8000);
});
document.getElementById("clipboardBtn")?.addEventListener("click",function(){ clipboardBar.classList.toggle("show"); updateClipboardBar(); this.classList.toggle("active", clipboardBar.classList.contains("show")); if(clipboardBar.classList.contains("show")) showToast("📋 الحافظة شغالة - دوس على أي حاجة تكتبها"); });
document.getElementById("floatingBtn")?.addEventListener("click",function(){ isFloating=!isFloating; this.classList.toggle("active", isFloating); saveSet("floating", isFloating?"true":"false"); updateUI(); showToast(isFloating?"🪟 عائم":"🪟 عادي"); });
document.querySelectorAll("#langOptions .option-btn").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll("#langOptions .option-btn").forEach(x=>x.classList.remove("active")); b.classList.add("active"); currentLang=b.dataset.lang; saveSet("language",currentLang); renderKeyboard(); showToast("🌐 "+currentLang+" + F + shift alt caps");}));
document.querySelectorAll("#scaleOptions .option-btn").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll("#scaleOptions .option-btn").forEach(x=>x.classList.remove("active")); b.classList.add("active"); currentScale=b.dataset.scale; saveSet("scale",currentScale); updateUI(); showToast("🔍 "+currentScale);}));
document.getElementById("micToggle")?.addEventListener("click",function(){micEnabled=!micEnabled; this.textContent="🎤 مايك: "+(micEnabled?"مفعل":"مطفي"); this.classList.toggle("active",micEnabled); saveSet("mic",micEnabled?"true":"false");});
document.getElementById("clipboardToggle")?.addEventListener("click",function(){const v=clipboardEnabled; clipboardEnabled=!v; this.textContent="📋 حافظة: "+(clipboardEnabled?"مفعلة":"مطفية"); this.classList.toggle("active",clipboardEnabled); saveSet("clipboard",clipboardEnabled?"true":"false");});
document.getElementById("floatingToggle")?.addEventListener("click",function(){isFloating=!isFloating; this.textContent="🪟 عائم: "+(isFloating?"مفعل":"مطفي"); this.classList.toggle("active",isFloating); saveSet("floating",isFloating?"true":"false"); updateUI();});
document.getElementById("numpadToggle")?.addEventListener("click",function(){numpadEnabled=!numpadEnabled; this.textContent="🔢 نمباد: "+(numpadEnabled?"مفعل":"مطفي"); this.classList.toggle("active",numpadEnabled); saveSet("numpad",numpadEnabled?"true":"false"); showToast(numpadEnabled?"🔢 نمباد متناسق شغال":"🔢 مطفي");});
document.getElementById("vibToggle")?.addEventListener("click",function(){vibEnabled=!vibEnabled; this.textContent="📳 اهتزاز: "+(vibEnabled?"مفعل":"مطفي"); saveSet("vib",vibEnabled?"true":"false"); if(vibEnabled) vibrate();});
document.getElementById("resetBtn")?.addEventListener("click",()=>{localStorage.clear(); location.reload();});
currentLang=loadSet("language","ar"); currentTheme=loadSet("theme","dark"); currentScale=loadSet("scale","medium"); isFloating=loadSet("floating","false")==="true"; micEnabled=loadSet("mic","true")==="true";
document.querySelector('[data-lang="'+currentLang+'"]')?.classList.add("active");
document.querySelector('[data-theme="'+currentTheme+'"]')?.classList.add("active");
document.querySelector('[data-scale="'+currentScale+'"]')?.classList.add("active");
renderKeyboard();
console.log("v3.9 FIX ALL - voice يكتب, clipboard, trackpad, numpad متناسق, F shift alt caps موجودين");
