const keyboardEl=document.getElementById('keyboard'),suggestionBar=document.getElementById('suggestionBar'),langIndicator=document.getElementById('langIndicator'),versionText=document.getElementById('versionText'),miniToast=document.getElementById('miniToast'),numpadOverlay=document.getElementById('numpadOverlay'),numpadGrid=document.getElementById('numpadGrid'),batteryDisplay=document.getElementById('batteryDisplay'),timeDisplay=document.getElementById('timeDisplay'),keyboardContainer=document.getElementById('keyboardContainer'),clipboardBar=document.getElementById('clipboardBar');
let isShift=false,isCaps=false,isTrackpadActive=false,holdTimer=null,lastMoveX=0;
let currentLang='ar',currentTheme='dark',currentScale='medium',vibEnabled=true,autocorrectEnabled=true,suggestEnabled=true,numpadEnabled=true,micEnabled=true,isFloating=false;
let currentWord='',lastTapTime=0,lastTapKey='',processingKey=false,spacePressed=false;
let clipboardItems=["مرحبا","كيف حالك","فؤاد","شكرا","تمام","السلام عليكم"];
const arabicFullDict=["ذ","ض","ص","ث","ق","ف","غ","ع","ه","خ","ح","ج","د","ش","س","ي","ب","ل","ا","ت","ن","م","ك","ط","ئ","ء","ؤ","ر","لا","ى","ة","و","ز","ظ","السلام","عليكم","مرحبا","كيف","حالك","انا","انت","هو","هي","نحن","هذا","هذه","ذلك","في","من","الى","على","عن","مع","بعد","قبل","كتاب","قلم","بيت","مدرسة","عمل","وقت","يوم","سنة","موبايل","كيبورد","مسافة","تراك","باد","اعدادات","لغة","ثيم","صوت","الوان","شكرا","حبيبي","تمام","ظبط","الله","محمد","مصر","عربي","فؤاد","صباح","الخير","مساء","حلو","جميل","سريع","كبير","مستقر","سلس","تتم","تم","مسافة"];
const arabicCorrections={"هاذا":"هذا","هاذي":"هذه","ذالك":"ذلك","انامعرش":"انا معرفش","معرش":"معرفش","تتم":"تم"};
const dictionaries={ar:{words:arabicFullDict, corrections:arabicCorrections, bigrams:{"السلام":"عليكم"}},ar_full:{words:arabicFullDict, corrections:arabicCorrections}};
const layouts={
  ar:{
    f:[{k:"esc",d:"esc",c:"small"},{k:"F1"},{k:"F2"},{k:"F3"},{k:"F4"},{k:"F5"},{k:"F6"},{k:"F7"},{k:"F8"},{k:"F9"},{k:"F10"},{k:"F11"},{k:"F12"}],
    n:[{k:"ذ",d:"ذ"},{k:"1"},{k:"2"},{k:"3"},{k:"4"},{k:"5"},{k:"6"},{k:"7"},{k:"8"},{k:"9"},{k:"0"},{k:"-",d:"-"},{k:"=",d:"="},{k:"Backspace",d:"⌫",c:"del",id:"delKey"}],
    q:[{k:"tab",d:"tab",c:"small"},{k:"ض"},{k:"ص"},{k:"ث"},{k:"ق"},{k:"ف"},{k:"غ"},{k:"ع"},{k:"ه"},{k:"خ"},{k:"ح"},{k:"ج"},{k:"د"},{k:"bs",d:"\\"}],
    a:[{k:"caps",d:"caps",c:"small",id:"capsKey"},{k:"ش"},{k:"س"},{k:"ي"},{k:"ب"},{k:"ل"},{k:"ا"},{k:"ت"},{k:"ن"},{k:"م"},{k:"ك"},{k:"ط"},{k:"enter",d:"↵",c:"small"}],
    z:[{k:"shift",d:"shift",c:"shift",id:"shiftKey"},{k:"ئ"},{k:"ء"},{k:"ؤ"},{k:"ر"},{k:"لا"},{k:"ى"},{k:"ة"},{k:"و"},{k:"ز"},{k:"ظ"},{k:"shift",d:"shift",c:"small",id:"shiftKey2"}],
    b:[{k:"fn",d:"fn",c:"fn-key",id:"fnKey"},{k:"ctrl",d:"ctrl",c:"fn-key"},{k:"alt",d:"alt",c:"fn-key"},{k:"space",d:"مسافة",c:"space-trackpad",id:"spaceTrackpad",special:true},{k:"mic",d:"🎤",c:"mic",id:"micKey"},{k:"clipboard",d:"📋",c:"clipboard",id:"clipboardKey"},{k:"arrowleft",d:"←",c:"fn-key"},{k:"arrowright",d:"→",c:"fn-key"}]
  }
};
function commit(t){ try{ if(window.Android&&Android.commitText) Android.commitText(t); }catch(e){} }
function del(){ try{ if(window.Android&&Android.deleteText) Android.deleteText(); }catch(e){} }
function delN(n){ try{ if(window.Android&&Android.deleteN) Android.deleteN(n); }catch(e){} }
function moveCursor(dx){ try{ if(window.Android&&Android.moveCursor) Android.moveCursor(dx); }catch(e){} }
function saveSet(k,v){ try{ localStorage.setItem("rapoo_"+k,v); if(window.Android&&Android.saveSetting) Android.saveSetting(k,v);}catch(e){} }
function loadSet(k,d){ try{ const v=localStorage.getItem("rapoo_"+k); if(v!==null) return v; if(window.Android&&Android.getSetting){const av=Android.getSetting(k,d); if(av) return av;}}catch(e){} return d; }
function vibrate(){ if(!vibEnabled) return; try{if(navigator.vibrate) navigator.vibrate(3)}catch(e){} }
function showToast(msg){ miniToast.textContent=msg; miniToast.classList.add("show"); setTimeout(()=>miniToast.classList.remove("show"),1200); }
function levenshtein(a,b){ if(a.length===0) return b.length; if(b.length===0) return a.length; const m=[]; for(let i=0;i<=b.length;i++){m[i]=[i]} for(let j=0;j<=a.length;j++){m[0][j]=j} for(let i=1;i<=b.length;i++){for(let j=1;j<=a.length;j++){if(b.charAt(i-1)==a.charAt(j-1)) m[i][j]=m[i-1][j-1]; else m[i][j]=Math.min(m[i-1][j-1]+1,Math.min(m[i][j-1]+1,m[i-1][j]+1))}} return m[b.length][a.length]; }
function getSmartSuggestions(word){
  if(!suggestEnabled||!word||word.length<1) return {words:[],autoFix:null};
  const dict=dictionaries[currentLang]||dictionaries.ar;
  const lower=word.toLowerCase().trim();
  let wordSugs=[],autoFix=null;
  if(dict.corrections && dict.corrections[lower]) autoFix=dict.corrections[lower];
  dict.words.forEach(w=>{ const wl=w.toLowerCase(); if(wl.startsWith(lower) && wl!==lower && w.length>1){ wordSugs.push({w,sc:0}); } });
  wordSugs.sort((a,b)=>a.sc-b.sc);
  const uniq=[]; const seen=new Set();
  for(let r of wordSugs){ const key=r.w.toLowerCase(); if(!seen.has(key)){ seen.add(key); uniq.push(r.w); } if(uniq.length>=6) break; }
  return {words:uniq,autoFix:autoFix};
}
function updateSuggestions(){
  try{
    if(!suggestEnabled){ suggestionBar.innerHTML='<div class="suggestion" style="opacity:.3">مطفية</div>'; return; }
    if(!currentWord){ suggestionBar.innerHTML='<div class="suggestion" style="opacity:.6">✓ متناسق + مسافة وتراك باد ظاهر • Gboard Size</div>'; return; }
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
function updateClipboardBar(){
  clipboardBar.innerHTML="";
  clipboardItems.forEach((item,i)=>{
    const div=document.createElement("div");
    div.className="clip-item";
    div.textContent=item.length>20?item.substring(0,20)+"...":item;
    div.addEventListener("click",()=>{ commit(item+" "); showToast("📋 "+item); clipboardBar.classList.remove("show"); });
    clipboardBar.appendChild(div);
  });
}
updateClipboardBar();
function renderKeyboard(){
  try{
    const layout=layouts[currentLang]||layouts.ar;
    let html="";
    const rows=[{k:"f",cls:"row-f"},{k:"n",cls:"row-n"},{k:"q",cls:"row-q"},{k:"a",cls:"row-a"},{k:"z",cls:"row-z"},{k:"b",cls:"row-b"}];
    rows.forEach(r=>{
      const row=layout[r.k]; if(!row) return;
      html+='<div class="row '+r.cls+'">';
      row.forEach(item=>{
        if(item.special){ html+='<div class="key '+ (item.c||"") +'" id="'+ (item.id||"") +'" data-key="'+item.k+'"><div class="space-content"><span>'+item.d+'</span><div class="track-icon">▣</div></div><div class="space-hint">مسافة • تراك باد • HOLD SLIDE</div><div class="trackpad-grid" id="trackpadGrid"></div><div class="track-dot" id="trackDot"></div></div>'; }
        else{ const disp=item.d||item.k; let displayText=disp; if(disp==="bs") displayText="\\"; html+='<div class="key '+(item.c||"")+'"'+(item.id?' id="'+item.id+'"':"")+' data-key="'+item.k+'">'+displayText+'</div>'; }
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
      ngHtml+='<div class="numpad-key" data-num="Enter" style="grid-column:span 4;background:#8b5cf6">Enter ⏎</div>';
      numpadGrid.innerHTML=ngHtml;
      numpadGrid.querySelectorAll(".numpad-key").forEach(k=>{
        k.addEventListener("pointerdown",e=>{ e.preventDefault(); k.classList.add("pressed"); commit(k.dataset.num==="Enter"?"\n":k.dataset.num); vibrate(); });
        k.addEventListener("pointerup",e=>{ k.classList.remove("pressed"); });
      });
    }
  }catch(e){ keyboardEl.innerHTML='<div style="color:red;padding:20px">خطأ: '+e.message+'</div>'; }
}
function updateUI(){
  try{
    document.getElementById("capsKey")?.classList.toggle("active", isCaps);
    document.querySelectorAll("#shiftKey,#shiftKey2").forEach(k=>k.classList.toggle("active", isShift||isCaps));
    langIndicator.textContent=currentLang.toUpperCase().slice(0,3);
    versionText.textContent="v3.7 FIX SPACE";
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
    const handlePointerDown=(e)=>{
      if(processingKey && !isSpace) return;
      startX=e.clientX; startY=e.clientY; moved=false; handled=false;
      if(!isSpace) k.classList.add("pressed");
      if(isDel) deleteHoldTimer=setTimeout(()=>{ startFastDelete(); },300);
      if(isSpace){ startX=lastMoveX=e.clientX; clearTimeout(holdTimer); holdTimer=setTimeout(()=>{ if(!isTrackpadActive){ isTrackpadActive=true; k.classList.add("track-active"); document.getElementById("overlay").classList.add("show"); } },360); }
    };
    const handlePointerMove=(e)=>{
      if(isSpace){
        if(!isTrackpadActive){ if(Math.abs(e.clientX-startX)>10) clearTimeout(holdTimer); return; }
        const dx=e.clientX-lastMoveX; if(Math.abs(dx)>8){ if(dx>0) moveCursor(1); else moveCursor(-1); lastMoveX=e.clientX; }
        return;
      }
      if(Math.abs(e.clientX-startX)>10||Math.abs(e.clientY-startY)>10){ moved=true; k.classList.remove("pressed"); if(isDel) stopFastDelete(); }
    };
    const handlePointerUp=(e)=>{
      if(handled) return; handled=true;
      if(isSpace){
        clearTimeout(holdTimer);
        if(isTrackpadActive){ isTrackpadActive=false; k.classList.remove("track-active"); document.getElementById("overlay").classList.remove("show"); }
        else{
          if(Math.abs(e.clientX-startX)<10&&Math.abs(e.clientY-startY)<10){
            if(spacePressed) return; spacePressed=true;
            if(!handleSpace()){ commit(" "); onCharTyped(" "); }
            setTimeout(()=>{ spacePressed=false; },60);
          }
        }
        return;
      }
      k.classList.remove("pressed");
      if(isDel) stopFastDelete();
      if(moved) return;
      const now=Date.now();
      if(k.dataset.key===lastTapKey && now-lastTapTime<70) return;
      lastTapTime=now; lastTapKey=k.dataset.key;
      if(processingKey) return; processingKey=true; setTimeout(()=>{ processingKey=false; },30);
      const key=k.dataset.key; if(!key) return;
      vibrate();
      if(isMic){ if(!micEnabled){ showToast("🎤 مايك مطفي"); return; } k.classList.add("listening"); showToast("🎤 جاري الاستماع..."); try{ if(window.Android&&Android.startVoiceInput) Android.startVoiceInput(); }catch(e){} setTimeout(()=>k.classList.remove("listening"),2000); return; }
      if(isClip){ clipboardBar.classList.toggle("show"); updateClipboardBar(); return; }
      if(key==="shift"){isShift=!isShift;updateUI();return;}
      if(key==="Backspace"){del();onDelete();return;}
      let out=key;
      if(out==="bs") out="\\";
      if(out==="space"){ if(spacePressed) return; spacePressed=true; if(!handleSpace()){ commit(" "); onCharTyped(" "); } setTimeout(()=>{ spacePressed=false; },60); }
      else { commit(out); onCharTyped(out); }
      if(isShift){isShift=false;updateUI();}
    };
    k.addEventListener("pointerdown",handlePointerDown,{passive:true});
    k.addEventListener("pointermove",handlePointerMove,{passive:true});
    k.addEventListener("pointerup",handlePointerUp,{passive:true});
    k.addEventListener("pointercancel",()=>{ k.classList.remove("pressed"); stopFastDelete(); if(k.id==="spaceTrackpad"){ clearTimeout(holdTimer); isTrackpadActive=false; k.classList.remove("track-active"); } },{passive:true});
  });
}
document.getElementById("dotsMenu")?.addEventListener("click",()=>document.getElementById("settingsPanel").classList.add("show"));
document.getElementById("closeSettings")?.addEventListener("click",()=>document.getElementById("settingsPanel").classList.remove("show"));
document.getElementById("closeNumpad")?.addEventListener("click",()=>numpadOverlay.classList.remove("show"));
document.getElementById("micBtn")?.addEventListener("click",function(){ if(!micEnabled){ showToast("🎤 مايك مطفي"); return; } this.classList.add("active"); showToast("🎤 جاري الاستماع..."); try{ if(window.Android&&Android.startVoiceInput) Android.startVoiceInput(); }catch(e){} setTimeout(()=>this.classList.remove("active"),2000); });
document.getElementById("clipboardBtn")?.addEventListener("click",function(){ clipboardBar.classList.toggle("show"); updateClipboardBar(); this.classList.toggle("active", clipboardBar.classList.contains("show")); });
document.getElementById("floatingBtn")?.addEventListener("click",function(){ isFloating=!isFloating; this.classList.toggle("active", isFloating); saveSet("floating", isFloating?"true":"false"); updateUI(); showToast(isFloating?"🪟 عائم":"🪟 عادي"); });
document.querySelectorAll("#langOptions .option-btn").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll("#langOptions .option-btn").forEach(x=>x.classList.remove("active")); b.classList.add("active"); currentLang=b.dataset.lang; saveSet("language",currentLang); renderKeyboard(); showToast("🌐 "+currentLang);}));
document.querySelectorAll("#scaleOptions .option-btn").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll("#scaleOptions .option-btn").forEach(x=>x.classList.remove("active")); b.classList.add("active"); currentScale=b.dataset.scale; saveSet("scale",currentScale); updateUI(); showToast("🔍 "+currentScale);}));
document.getElementById("micToggle")?.addEventListener("click",function(){micEnabled=!micEnabled; this.textContent="🎤 مايك: "+(micEnabled?"مفعل":"مطفي"); this.classList.toggle("active",micEnabled); saveSet("mic",micEnabled?"true":"false");});
document.getElementById("clipboardToggle")?.addEventListener("click",function(){clipboardEnabled=!clipboardEnabled; this.textContent="📋 حافظة: "+(clipboardEnabled?"مفعلة":"مطفية"); this.classList.toggle("active",clipboardEnabled); saveSet("clipboard",clipboardEnabled?"true":"false");});
document.getElementById("floatingToggle")?.addEventListener("click",function(){isFloating=!isFloating; this.textContent="🪟 عائم: "+(isFloating?"مفعل":"مطفي"); this.classList.toggle("active",isFloating); saveSet("floating",isFloating?"true":"false"); updateUI();});
document.getElementById("numpadToggle")?.addEventListener("click",function(){numpadEnabled=!numpadEnabled; this.textContent="🔢 نمباد: "+(numpadEnabled?"مفعل":"مطفي"); saveSet("numpad",numpadEnabled?"true":"false");});
document.getElementById("vibToggle")?.addEventListener("click",function(){vibEnabled=!vibEnabled; this.textContent="📳 اهتزاز: "+(vibEnabled?"مفعل":"مطفي"); saveSet("vib",vibEnabled?"true":"false"); if(vibEnabled) vibrate();});
document.getElementById("resetBtn")?.addEventListener("click",()=>{localStorage.clear(); location.reload();});
currentLang=loadSet("language","ar"); currentTheme=loadSet("theme","dark"); currentScale=loadSet("scale","medium"); isFloating=loadSet("floating","false")==="true";
document.querySelector('[data-lang="'+currentLang+'"]')?.classList.add("active");
document.querySelector('[data-theme="'+currentTheme+'"]')?.classList.add("active");
document.querySelector('[data-scale="'+currentScale+'"]')?.classList.add("active");
renderKeyboard();
console.log("v3.7 FIX SPACE - مسافة ظاهرة ومتناسق");
