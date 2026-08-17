const keyboardEl=document.getElementById('keyboard'),suggestionBar=document.getElementById('suggestionBar'),langIndicator=document.getElementById('langIndicator'),versionText=document.getElementById('versionText'),miniToast=document.getElementById('miniToast'),numpadOverlay=document.getElementById('numpadOverlay'),numpadGrid=document.getElementById('numpadGrid'),batteryDisplay=document.getElementById('batteryDisplay'),timeDisplay=document.getElementById('timeDisplay'),keyboardContainer=document.getElementById('keyboardContainer'),clipboardBar=document.getElementById('clipboardBar');
let isShift=false,isCaps=false,isCtrl=false,isAlt=false,isTrackpadActive=false,holdTimer=null,lastMoveX=0,trackpadStartX=0;
let currentLang='ar',currentTheme='dark',currentSound='clicky',currentRGB='reactive',currentScale='medium',vibEnabled=true,soundEnabled=true,autocorrectEnabled=true,suggestEnabled=true,numpadEnabled=true,micEnabled=true,isFloating=false,isMicListening=false;
let currentWord='',lastTapTime=0,lastTapKey='',processingKey=false,spacePressed=false;
let clipboardItems=["مرحبا","كيف حالك","فؤاد","شكرا","تمام"];
const arabicFullDict=["ذ","ض","ص","ث","ق","ف","غ","ع","ه","خ","ح","ج","د","ش","س","ي","ب","ل","ا","ت","ن","م","ك","ط","ئ","ء","ؤ","ر","لا","ى","ة","و","ز","ظ","السلام","عليكم","مرحبا","كيف","حالك","انا","انت","هذا","هذه","ذلك","في","من","الى","على","عن","مع","كتاب","قلم","بيت","مدرسة","عمل","وقت","يوم","سنة","موبايل","كيبورد","مسافة","تراك","باد","شكرا","حبيبي","تمام","الله","محمد","مصر","فؤاد","صباح","الخير","مساء","حلو","سريع","تتم","تم"];
const arabicCorrections={"هاذا":"هذا","هاذي":"هذه","ذالك":"ذلك","انامعرش":"انا معرفش","معرش":"معرفش","تتم":"تم"};
const dictionaries={ar:{words:arabicFullDict, corrections:arabicCorrections, bigrams:{"السلام":"عليكم"}},ar_full:{words:arabicFullDict, corrections:arabicCorrections},en:{words:["the","be","to","of","and","a","in","that","have","I","it","for","not","on","with","he","as","you","do","at","this","but","his","by","from","they","we","hello","world","keyboard","fouad"], corrections:{"teh":"the","u":"you"}}};
const KC={ESC:111,F1:131,F2:132,F3:133,F4:134,F5:135,F6:136,F7:137,F8:138,F9:139,F10:140,F11:141,F12:142,TAB:61,ENTER:66,DEL:67,LEFT:21,RIGHT:22,UP:19,DOWN:20,CAPS:115};
const layouts={
  ar:{
    f:[{k:"esc",d:"esc",c:"small",kc:KC.ESC},{k:"F1",kc:KC.F1},{k:"F2",kc:KC.F2},{k:"F3",kc:KC.F3},{k:"F4",kc:KC.F4},{k:"F5",kc:KC.F5},{k:"F6",kc:KC.F6},{k:"F7",kc:KC.F7},{k:"F8",kc:KC.F8},{k:"F9",kc:KC.F9},{k:"F10",kc:KC.F10},{k:"F11",kc:KC.F11},{k:"F12",kc:KC.F12}],
    n:[{k:"ذ",d:"ذ"},{k:"1"},{k:"2"},{k:"3"},{k:"4"},{k:"5"},{k:"6"},{k:"7"},{k:"8"},{k:"9"},{k:"0"},{k:"-",d:"-"},{k:"=",d:"="},{k:"Backspace",d:"⌫",c:"del",id:"delKey",kc:KC.DEL}],
    q:[{k:"tab",d:"tab",c:"small",kc:KC.TAB},{k:"ض"},{k:"ص"},{k:"ث"},{k:"ق"},{k:"ف"},{k:"غ"},{k:"ع"},{k:"ه"},{k:"خ"},{k:"ح"},{k:"ج"},{k:"د"},{k:"\\",d:"\\"}],
    a:[{k:"caps",d:"caps",c:"small",id:"capsKey",kc:KC.CAPS},{k:"ش"},{k:"س"},{k:"ي"},{k:"ب"},{k:"ل"},{k:"ا"},{k:"ت"},{k:"ن"},{k:"م"},{k:"ك"},{k:"ط"},{k:"enter",d:"↵",c:"small",kc:KC.ENTER}],
    z:[{k:"shift",d:"⇧",c:"shift",id:"shiftKey"},{k:"ئ"},{k:"ء"},{k:"ؤ"},{k:"ر"},{k:"لا"},{k:"ى"},{k:"ة"},{k:"و"},{k:"ز"},{k:"ظ"},{k:"shift",d:"⇧",c:"shift",id:"shiftKey2"}],
    b:[{k:"fn",d:"fn",c:"fn-key",id:"fnKey"},{k:"ctrl",d:"ctrl",c:"fn-key",id:"ctrlKey"},{k:"alt",d:"alt",c:"fn-key",id:"altKey"},{k:"space",d:"مسافة",c:"space-trackpad",id:"spaceTrackpad",special:true},{k:"mic",d:"🎤",c:"mic",id:"micKey"},{k:"clipboard",d:"📋",c:"clipboard",id:"clipboardKey"},{k:"arrowleft",d:"←",c:"fn-key",id:"arrowLeft",kc:KC.LEFT},{k:"arrowright",d:"→",c:"fn-key",id:"arrowRight",kc:KC.RIGHT}]
  },
  en:{
    f:[{k:"esc",d:"esc",c:"small",kc:KC.ESC},{k:"F1",kc:KC.F1},{k:"F2",kc:KC.F2},{k:"F3",kc:KC.F3},{k:"F4",kc:KC.F4},{k:"F5",kc:KC.F5},{k:"F6",kc:KC.F6},{k:"F7",kc:KC.F7},{k:"F8",kc:KC.F8},{k:"F9",kc:KC.F9},{k:"F10",kc:KC.F10},{k:"F11",kc:KC.F11},{k:"F12",kc:KC.F12}],
    n:[{k:"`",d:"`"},{k:"1"},{k:"2"},{k:"3"},{k:"4"},{k:"5"},{k:"6"},{k:"7"},{k:"8"},{k:"9"},{k:"0"},{k:"-",d:"-"},{k:"=",d:"="},{k:"Backspace",d:"⌫",c:"del",id:"delKey",kc:KC.DEL}],
    q:[{k:"tab",d:"tab",c:"small",kc:KC.TAB},{k:"q"},{k:"w"},{k:"e"},{k:"r"},{k:"t"},{k:"y"},{k:"u"},{k:"i"},{k:"o"},{k:"p"},{k:"[",d:"["},{k:"]",d:"]"},{k:"\\",d:"\\"}],
    a:[{k:"caps",d:"caps",c:"small",id:"capsKey",kc:KC.CAPS},{k:"a"},{k:"s"},{k:"d"},{k:"f"},{k:"g"},{k:"h"},{k:"j"},{k:"k"},{k:"l"},{k:";",d:";"},{k:"'",d:"'"},{k:"enter",d:"↵",c:"small",kc:KC.ENTER}],
    z:[{k:"shift",d:"⇧",c:"shift",id:"shiftKey"},{k:"z"},{k:"x"},{k:"c"},{k:"v"},{k:"b"},{k:"n"},{k:"m"},{k:",",d:","},{k:".",d:"."},{k:"/",d:"/"},{k:"shift",d:"⇧",c:"shift",id:"shiftKey2"}],
    b:[{k:"ctrl",d:"ctrl",c:"fn-key",id:"ctrlKey"},{k:"alt",d:"alt",c:"fn-key",id:"altKey"},{k:"space",d:"Space",c:"space-trackpad",id:"spaceTrackpad",special:true},{k:"mic",d:"🎤",c:"mic",id:"micKey"},{k:"clipboard",d:"📋",c:"clipboard",id:"clipboardKey"},{k:"arrowleft",d:"←",c:"fn-key",id:"arrowLeft",kc:KC.LEFT},{k:"arrowright",d:"→",c:"fn-key",id:"arrowRight",kc:KC.RIGHT}]
  }
};
Object.assign(layouts,{ar_full:layouts.ar});
let audioCtx=null;
function getAudioCtx(){ if(!audioCtx){ try{ audioCtx=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){} } return audioCtx; }
function playSound(){
  if(!soundEnabled) return;
  try{
    const ctx=getAudioCtx(); if(!ctx) return;
    const now=ctx.currentTime;
    const gain=ctx.createGain(); gain.gain.setValueAtTime(0.15,now); gain.gain.exponentialRampToValueAtTime(0.01,now+0.07);
    const osc=ctx.createOscillator();
    if(currentSound==="clicky"){ osc.type="square"; osc.frequency.setValueAtTime(1800+Math.random()*500,now); osc.frequency.exponentialRampToValueAtTime(600,now+0.03); }
    else if(currentSound==="thocky"){ osc.type="sine"; osc.frequency.setValueAtTime(110+Math.random()*30,now); }
    else { osc.type="triangle"; osc.frequency.setValueAtTime(1200+Math.random()*200,now); }
    osc.connect(gain); gain.connect(ctx.destination); osc.start(now); osc.stop(now+0.07);
  }catch(e){}
}
function commit(t){ try{ if(window.Android&&Android.commitText) Android.commitText(t); }catch(e){} }
function del(){ try{ if(window.Android&&Android.deleteText) Android.deleteText(); }catch(e){} }
function delN(n){ try{ if(window.Android&&Android.deleteN) Android.deleteN(n); }catch(e){} }
function sendKey(kc){ try{ if(window.Android&&Android.sendKey) Android.sendKey(kc); else if(window.Android&&Android.sendKeyWithModifiers) Android.sendKeyWithModifiers(kc,false,false,false); }catch(e){} }
function sendKeyMod(kc,s,ctrl,alt){ try{ if(window.Android&&Android.sendKeyWithModifiers) Android.sendKeyWithModifiers(kc,!!s,!!ctrl,!!alt); }catch(e){} }
function moveCursor(dx){ try{ if(window.Android&&Android.moveCursor) Android.moveCursor(dx); }catch(e){} }
function saveSet(k,v){ try{ localStorage.setItem("rapoo_"+k,v); if(window.Android&&Android.saveSetting) Android.saveSetting(k,v);}catch(e){} }
function loadSet(k,d){ try{ const v=localStorage.getItem("rapoo_"+k); if(v!==null) return v; if(window.Android&&Android.getSetting){const av=Android.getSetting(k,d); if(av) return av;}}catch(e){} return d; }
function vibrate(){ if(!vibEnabled) return; try{if(navigator.vibrate) navigator.vibrate(5)}catch(e){} }
function showToast(msg){ miniToast.textContent=msg; miniToast.classList.add("show"); setTimeout(()=>miniToast.classList.remove("show"),1400); }
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
    if(!currentWord){ suggestionBar.innerHTML='<div class="suggestion" style="opacity:.6">✓ نمباد 45% + تراك باد يمين شمال + مسح 1 حرف + ويندوز متناسق</div>'; return; }
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
        setTimeout(()=>{ commit(sug+" "); currentWord=""; updateSuggestions(); playSound(); },30);
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
    setTimeout(()=>{ commit(correction+" "); showToast("✓ "+currentWord+" → "+correction); currentWord=""; playSound(); },20);
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
    let battery=54;
    if(window.Android&&Android.getBatteryLevel) battery=Android.getBatteryLevel();
    let timeStr="2:39";
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
    div.textContent=item.length>16?item.substring(0,16)+"...":item;
    div.addEventListener("click",()=>{ commit(item+" "); showToast("📋 "+item+" ✓"); clipboardBar.classList.remove("show"); playSound(); try{ if(window.Android&&Android.copyToClipboard) Android.copyToClipboard(item); }catch(e){} });
    clipboardBar.appendChild(div);
  });
  try{
    if(window.Android&&Android.getClipboardText){
      const sys=Android.getClipboardText();
      if(sys && sys.length>0 && sys.length<100 && !clipboardItems.includes(sys)){
        const div=document.createElement("div");
        div.className="clip-item";
        div.style.borderColor="#10b981";
        div.textContent="📋 "+(sys.length>14?sys.substring(0,14)+"...":sys);
        div.addEventListener("click",()=>{ commit(sys+" "); showToast("📋 نظام ✓"); if(!clipboardItems.includes(sys)){ clipboardItems.unshift(sys); if(clipboardItems.length>15) clipboardItems.pop(); } clipboardBar.classList.remove("show"); playSound(); });
        clipboardBar.appendChild(div);
      }
    }
  }catch(e){}
}
updateClipboardBar();
window.voiceResult=function(text){
  isMicListening=false;
  document.querySelectorAll(".key.mic, #micBtn").forEach(k=>k.classList.remove("listening","active"));
  if(text && text.length>0){
    commit(text+" ");
    showToast("🎤 "+text+" ✓");
    playSound();
  } else {
    showToast("🎤 لم أسمع");
  }
};
window.voiceEnded=function(){
  isMicListening=false;
  document.querySelectorAll(".key.mic, #micBtn").forEach(k=>k.classList.remove("listening","active"));
  showToast("🎤 انتهى");
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
        if(item.special){ html+='<div class="key '+ (item.c||"") +'" id="'+ (item.id||"") +'" data-key="'+item.k+'"><div class="space-content"><span>'+item.d+'</span><div class="track-icon">▣</div></div><div class="space-hint">مسافة • تراك باد</div><div class="trackpad-grid" id="trackpadGrid"></div><div class="track-dot" id="trackDot"></div></div>'; }
        else{ const disp=item.d||item.k; html+='<div class="key '+(item.c||"")+'"'+(item.id?' id="'+item.id+'"':"")+' data-key="'+item.k+'" data-kc="'+(item.kc||"")+'">'+disp+'</div>'; }
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
        k.addEventListener("pointerdown",e=>{ e.preventDefault(); k.classList.add("pressed"); const num=k.dataset.num; if(num==="Enter"){ commit("\n"); sendKey(KC.ENTER); } else if(num==="C"){ del(); onDelete(); } else if(num==="Close"){ numpadOverlay.classList.remove("show"); } else { commit(num); } vibrate(); playSound(); });
        k.addEventListener("pointerup",e=>{ k.classList.remove("pressed"); });
        k.addEventListener("touchstart",e=>{ e.preventDefault(); k.classList.add("pressed"); }, {passive:false});
        k.addEventListener("touchend",e=>{ k.classList.remove("pressed"); });
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
    versionText.textContent="v4.1 45%";
    document.body.className=document.body.className.replace(/theme-\S+/g,"").replace(/scale-\S+/g,"").replace(/rgb-\S+/g,"");
    document.body.classList.add("theme-"+currentTheme);
    document.body.classList.add("scale-"+currentScale);
    if(currentRGB!=="off") document.body.classList.add("rgb-"+currentRGB);
    if(isFloating) keyboardContainer.classList.add("floating"); else keyboardContainer.classList.remove("floating");
  }catch(e){}
}
let deleteInterval=null,deleteHoldTimer=null,deleteActive=false,deleteStartTime=0;
function startFastDelete(){ if(deleteActive) return; deleteActive=true; del(); onDelete(); playSound(); deleteInterval=setInterval(()=>{ del(); onDelete(); playSound(); },100); }
function stopFastDelete(){
  deleteActive=false;
  if(deleteInterval){ clearInterval(deleteInterval); deleteInterval=null; }
  if(deleteHoldTimer){ clearTimeout(deleteHoldTimer); deleteHoldTimer=null; }
  deleteStartTime=0;
}
// FIX TRACKPAD + DELETE + WINDOWS
function attachEvents(){
  // تأكد من إيقاف المسح عند رفع الصباع في أي مكان
  const stopAll=(e)=>{
    if(deleteActive || deleteHoldTimer){
      const now=Date.now();
      if(now-deleteStartTime<800){
        // ضغطة واحدة قصيرة - وقف
        stopFastDelete();
      }
    }
  };
  window.addEventListener("pointerup",()=>{ stopFastDelete(); }, {passive:true, capture:true});
  window.addEventListener("touchend",()=>{ stopFastDelete(); }, {passive:true, capture:true});
  window.addEventListener("pointercancel",()=>{ stopFastDelete(); isTrackpadActive=false; document.getElementById("spaceTrackpad")?.classList.remove("track-active"); document.getElementById("overlay")?.classList.remove("show"); }, {passive:true});
  
  const keys=keyboardEl.querySelectorAll(".key");
  keys.forEach(k=>{
    let startX=0,startY=0,moved=false,isDel=k.id==="delKey";
    let handled=false;
    const isSpace=k.id==="spaceTrackpad";
    const isMic=k.id==="micKey"||k.dataset.key==="mic";
    const isClip=k.id==="clipboardKey"||k.dataset.key==="clipboard";
    const isFn=k.id==="fnKey"||k.dataset.key==="fn";
    const kc=parseInt(k.dataset.kc)||0;
    const handlePointerDown=(e)=>{
      if(processingKey && !isSpace) return;
      const touch=e.touches?e.touches[0]:e;
      startX=touch.clientX; startY=touch.clientY; moved=false; handled=false; lastMoveX=touch.clientX; trackpadStartX=touch.clientX;
      if(!isSpace) k.classList.add("pressed");
      if(isDel){
        deleteStartTime=Date.now();
        deleteHoldTimer=setTimeout(()=>{ startFastDelete(); },500);
      }
      if(isSpace){
        clearTimeout(holdTimer);
        holdTimer=setTimeout(()=>{
          if(!isTrackpadActive){
            isTrackpadActive=true;
            k.classList.add("track-active");
            document.getElementById("overlay").classList.add("show");
            vibrate(); playSound();
            showToast("👆 تراك باد يمين وشمال شغال");
          }
        },320);
      }
    };
    const handlePointerMove=(e)=>{
      const touch=e.touches?e.touches[0]:e;
      if(isSpace){
        if(!isTrackpadActive){
          if(Math.abs(touch.clientX-startX)>15 || Math.abs(touch.clientY-startY)>15) clearTimeout(holdTimer);
          return;
        }
        const dx=touch.clientX-lastMoveX;
        if(Math.abs(dx)>=8){
          moveCursor(dx>0?1:-1);
          lastMoveX=touch.clientX;
          const rect=k.getBoundingClientRect();
          let pct=((touch.clientX-rect.left)/rect.width)*100;
          pct=Math.max(5,Math.min(95,pct));
          const dot=document.getElementById("trackDot");
          if(dot) dot.style.left=pct+"%";
        }
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
        if(isTrackpadActive){
          isTrackpadActive=false;
          k.classList.remove("track-active");
          document.getElementById("overlay").classList.remove("show");
          const dot=document.getElementById("trackDot");
          if(dot) dot.style.left="50%";
        } else {
          if(Math.abs(touch.clientX-startX)<12&&Math.abs(touch.clientY-startY)<12){
            if(spacePressed) return; spacePressed=true;
            if(!handleSpace()){ commit(" "); onCharTyped(" "); playSound(); }
            vibrate();
            setTimeout(()=>{ spacePressed=false; },80);
          }
        }
        return;
      }
      k.classList.remove("pressed");
      const isDelUp=k.id==="delKey";
      if(isDelUp){
        // مسح حرف واحد بس عند الضغطة الواحدة
        const duration=Date.now()-deleteStartTime;
        if(duration<500 && !deleteActive){
          del(); onDelete(); playSound();
        }
        stopFastDelete();
      }
      if(moved) return;
      const now=Date.now();
      if(k.dataset.key===lastTapKey && now-lastTapTime<80) return;
      lastTapTime=now; lastTapKey=k.dataset.key;
      if(processingKey) return; processingKey=true; setTimeout(()=>{ processingKey=false; },40);
      const key=k.dataset.key; if(!key) return;
      vibrate(); playSound();
      if(isMic){
        if(isMicListening){
          try{ if(window.Android&&Android.stopVoiceInput) Android.stopVoiceInput(); }catch(e){}
          isMicListening=false;
          k.classList.remove("listening");
          document.getElementById("micBtn")?.classList.remove("listening","active");
          showToast("🎤 تم الإيقاف");
          return;
        }
        if(!micEnabled){ showToast("🎤 مطفي"); return; }
        isMicListening=true;
        k.classList.add("listening");
        document.getElementById("micBtn")?.classList.add("listening","active");
        showToast("🎤 اتكلم...");
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
            showToast(numpadOverlay.classList.contains("show")?"🔢 نمباد 45%":"🔢 مقفول");
          }
        }
        window.lastFnTap=nowFn;
        return;
      }
      if(kc>0){
        if(kc===KC.CAPS){ isCaps=!isCaps; updateUI(); showToast(isCaps?"Caps ON":"Caps OFF"); return; }
        if(kc===115){ isCaps=!isCaps; updateUI(); return; }
        if(kc===KC.TAB){ commit("\t"); sendKey(kc); return; }
        if(kc===KC.ENTER){ commit("\n"); sendKey(kc); onCharTyped("\n"); return; }
        if(kc===KC.DEL){ del(); onDelete(); return; }
        if(kc===KC.LEFT){ moveCursor(-1); showToast("←"); return; }
        if(kc===KC.RIGHT){ moveCursor(1); showToast("→"); return; }
        if(kc>=KC.F1 && kc<=KC.F12){ sendKey(kc); showToast("F"+(kc-KC.F1+1)); return; }
        if(kc===KC.ESC){ sendKey(kc); showToast("Esc"); return; }
      }
      if(key==="shift"){isShift=!isShift;updateUI();return;}
      if(key==="caps"){isCaps=!isCaps;updateUI();return;}
      if(key==="ctrl"){isCtrl=!isCtrl;updateUI();return;}
      if(key==="alt"){isAlt=!isAlt;updateUI();return;}
      if(key==="Backspace"){del();onDelete();return;}
      if(key==="arrowleft"){moveCursor(-1);return;}
      if(key==="arrowright"){moveCursor(1);return;}
      let out=key;
      if(out.length===1 && currentLang.startsWith("en")&&/[a-z]/.test(out)) out=(isShift||isCaps)?out.toUpperCase():out.toLowerCase();
      if(out==="space"){ if(spacePressed) return; spacePressed=true; if(!handleSpace()){ commit(" "); onCharTyped(" "); } setTimeout(()=>{ spacePressed=false; },80); }
      else { commit(out); onCharTyped(out); }
      if(isShift){isShift=false;updateUI();}
    };
    k.addEventListener("touchstart",handlePointerDown,{passive:true});
    k.addEventListener("touchmove",handlePointerMove,{passive:false});
    k.addEventListener("touchend",handlePointerUp,{passive:true});
    k.addEventListener("pointerdown",handlePointerDown,{passive:true});
    k.addEventListener("pointermove",handlePointerMove,{passive:true});
    k.addEventListener("pointerup",handlePointerUp,{passive:true});
    k.addEventListener("pointercancel",()=>{ k.classList.remove("pressed"); stopFastDelete(); if(k.id==="spaceTrackpad"){ clearTimeout(holdTimer); isTrackpadActive=false; k.classList.remove("track-active"); document.getElementById("overlay").classList.remove("show"); const dot=document.getElementById("trackDot"); if(dot) dot.style.left="50%"; } },{passive:true});
  });
  const overlay=document.getElementById("overlay");
  if(overlay) overlay.addEventListener("click",()=>{ isTrackpadActive=false; document.getElementById("spaceTrackpad")?.classList.remove("track-active"); overlay.classList.remove("show"); const dot=document.getElementById("trackDot"); if(dot) dot.style.left="50%"; });
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
  if(!micEnabled){ showToast("🎤 مطفي"); return; }
  isMicListening=true;
  this.classList.add("listening","active");
  document.querySelectorAll(".key.mic").forEach(k=>k.classList.add("listening"));
  showToast("🎤 اتكلم...");
  try{ if(window.Android&&Android.startVoiceInput) Android.startVoiceInput(); }catch(e){ isMicListening=false; this.classList.remove("listening","active"); }
  setTimeout(()=>{ if(isMicListening){ isMicListening=false; this.classList.remove("listening","active"); document.querySelectorAll(".key.mic").forEach(k=>k.classList.remove("listening")); } },8000);
});
document.getElementById("clipboardBtn")?.addEventListener("click",function(){ clipboardBar.classList.toggle("show"); updateClipboardBar(); this.classList.toggle("active", clipboardBar.classList.contains("show")); });
document.getElementById("floatingBtn")?.addEventListener("click",function(){ isFloating=!isFloating; this.classList.toggle("active", isFloating); saveSet("floating", isFloating?"true":"false"); updateUI(); showToast(isFloating?"🪟 عائم":"🪟 عادي"); });
document.querySelectorAll("#langOptions .option-btn").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll("#langOptions .option-btn").forEach(x=>x.classList.remove("active")); b.classList.add("active"); currentLang=b.dataset.lang; saveSet("language",currentLang); renderKeyboard(); showToast("🌐 "+currentLang);}));
document.querySelectorAll("#soundOptions .option-btn").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll("#soundOptions .option-btn").forEach(x=>x.classList.remove("active")); b.classList.add("active"); currentSound=b.dataset.sound; soundEnabled=currentSound!=="off"; saveSet("sound",currentSound); saveSet("soundEnabled",soundEnabled?"true":"false"); updateUI(); playSound(); showToast("🔊 "+currentSound);}));
document.querySelectorAll("#rgbOptions .option-btn").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll("#rgbOptions .option-btn").forEach(x=>x.classList.remove("active")); b.classList.add("active"); currentRGB=b.dataset.rgb; saveSet("rgb",currentRGB); updateUI(); showToast("🌈 "+currentRGB);}));
document.querySelectorAll("#scaleOptions .option-btn").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll("#scaleOptions .option-btn").forEach(x=>x.classList.remove("active")); b.classList.add("active"); currentScale=b.dataset.scale; saveSet("scale",currentScale); updateUI(); showToast("🔍 "+currentScale);}));
document.getElementById("micToggle")?.addEventListener("click",function(){micEnabled=!micEnabled; this.textContent="🎤 مايك: "+(micEnabled?"مفعل":"مطفي"); this.classList.toggle("active",micEnabled); saveSet("mic",micEnabled?"true":"false");});
document.getElementById("clipboardToggle")?.addEventListener("click",function(){const v=clipboardEnabled; clipboardEnabled=!v; this.textContent="📋 حافظة: "+(clipboardEnabled?"مفعلة":"مطفية"); this.classList.toggle("active",clipboardEnabled); saveSet("clipboard",clipboardEnabled?"true":"false");});
document.getElementById("floatingToggle")?.addEventListener("click",function(){isFloating=!isFloating; this.textContent="🪟 عائم: "+(isFloating?"مفعل":"مطفي"); this.classList.toggle("active",isFloating); saveSet("floating",isFloating?"true":"false"); updateUI();});
document.getElementById("numpadToggle")?.addEventListener("click",function(){numpadEnabled=!numpadEnabled; this.textContent="🔢 نمباد: "+(numpadEnabled?"مفعل":"مطفي"); this.classList.toggle("active",numpadEnabled); saveSet("numpad",numpadEnabled?"true":"false"); showToast(numpadEnabled?"🔢 نمباد 45% شغال":"🔢 مطفي");});
document.getElementById("vibToggle")?.addEventListener("click",function(){vibEnabled=!vibEnabled; this.textContent="📳 اهتزاز: "+(vibEnabled?"مفعل":"مطفي"); saveSet("vib",vibEnabled?"true":"false"); if(vibEnabled) vibrate();});
document.getElementById("resetBtn")?.addEventListener("click",()=>{localStorage.clear(); location.reload();});
currentLang=loadSet("language","ar"); currentTheme=loadSet("theme","dark"); currentSound=loadSet("sound","clicky"); currentRGB=loadSet("rgb","reactive"); currentScale=loadSet("scale","medium"); isFloating=loadSet("floating","false")==="true"; micEnabled=loadSet("mic","true")==="true"; soundEnabled=loadSet("soundEnabled","true")==="true";
document.querySelector('[data-lang="'+currentLang+'"]')?.classList.add("active");
document.querySelector('[data-theme="'+currentTheme+'"]')?.classList.add("active");
document.querySelector('[data-sound="'+currentSound+'"]')?.classList.add("active");
document.querySelector('[data-rgb="'+currentRGB+'"]')?.classList.add("active");
document.querySelector('[data-scale="'+currentScale+'"]')?.classList.add("active");
renderKeyboard();
console.log("v4.1 45% NUMPAD - متناسق 100%, تراك باد يمين شمال, مسح 1 حرف, ويندوز متناسق");
