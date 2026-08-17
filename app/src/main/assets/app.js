const keyboardEl=document.getElementById('keyboard'),suggestionBar=document.getElementById('suggestionBar'),langIndicator=document.getElementById('langIndicator'),versionText=document.getElementById('versionText'),miniToast=document.getElementById('miniToast'),numpadOverlay=document.getElementById('numpadOverlay'),numpadGrid=document.getElementById('numpadGrid'),batteryDisplay=document.getElementById('batteryDisplay'),timeDisplay=document.getElementById('timeDisplay'),keyboardContainer=document.getElementById('keyboardContainer'),clipboardBar=document.getElementById('clipboardBar'),messagesDisplay=document.getElementById('messagesDisplay');
let isShift=false,isCaps=false,isCtrl=false,isAlt=false,isTrackpadActive=false,holdTimer=null,lastMoveX=0;
let currentLang='ar',currentTheme='dark',currentSound='clicky',currentRGB='reactive',currentScale='medium',vibEnabled=true,soundEnabled=true,autocorrectEnabled=true,suggestEnabled=true,numpadEnabled=true,micEnabled=true,isFloating=false,isMicListening=false,showInstructions=false;
let currentWord='',processingKey=false,spacePressed=false;
let clipboardItems=["مرحبا","كيف حالك","فؤاد","شكرا","تمام"];
const arabicFullDict=["ذ","ض","ص","ث","ق","ف","غ","ع","ه","خ","ح","ج","د","ش","س","ي","ب","ل","ا","ت","ن","م","ك","ط","ئ","ء","ؤ","ر","لا","ى","ة","و","ز","ظ","السلام","عليكم","مرحبا","كيف","حالك","انا","انت","هذا","هذه","ذلك","في","من","الى","على","عن","مع","كتاب","قلم","بيت","مدرسة","عمل","وقت","يوم","سنة","موبايل","كيبورد","مسافة","تراك","باد","شكرا","حبيبي","تمام","الله","محمد","مصر","فؤاد","صباح","الخير","مساء","حلو","سريع","تتم","تم"];
const arabicCorrections={"هاذا":"هذا","هاذي":"هذه","ذالك":"ذلك","انامعرش":"انا معرفش","معرش":"معرفش","تتم":"تم"};
const dictionaries={ar:{words:arabicFullDict, corrections:arabicCorrections, bigrams:{"السلام":"عليكم"}},ar_full:{words:arabicFullDict, corrections:arabicCorrections},en:{words:["the","be","to","of","and","a","in","that","have","I","it","for","not","on","with","he","as","you","do","at","this","but","his","by","from","they","we","hello","world","keyboard","fouad"], corrections:{"teh":"the","u":"you"}}};
const KC={ESC:111,F1:131,F2:132,F3:133,F4:134,F5:135,F6:136,F7:137,F8:138,F9:139,F10:140,F11:141,F12:142,TAB:61,ENTER:66,DEL:67,LEFT:21,RIGHT:22};
const layouts={
  ar:{
    f:[{k:"esc",d:"esc",c:"small",kc:KC.ESC},{k:"F1",kc:KC.F1},{k:"F2",kc:KC.F2},{k:"F3",kc:KC.F3},{k:"F4",kc:KC.F4},{k:"F5",kc:KC.F5},{k:"F6",kc:KC.F6},{k:"F7",kc:KC.F7},{k:"F8",kc:KC.F8},{k:"F9",kc:KC.F9},{k:"F10",kc:KC.F10},{k:"F11",kc:KC.F11},{k:"F12",kc:KC.F12}],
    n:[{k:"ذ",d:"ذ"},{k:"1"},{k:"2"},{k:"3"},{k:"4"},{k:"5"},{k:"6"},{k:"7"},{k:"8"},{k:"9"},{k:"0"},{k:"-",d:"-"},{k:"=",d:"="},{k:"Backspace",d:"⌫",c:"del",id:"delKey",kc:KC.DEL}],
    q:[{k:"tab",d:"tab",c:"small",kc:KC.TAB},{k:"ض"},{k:"ص"},{k:"ث"},{k:"ق"},{k:"ف"},{k:"غ"},{k:"ع"},{k:"ه"},{k:"خ"},{k:"ح"},{k:"ج"},{k:"د"},{k:"\\",d:"\\"}],
    a:[{k:"caps",d:"caps",c:"small",id:"capsKey"},{k:"ش"},{k:"س"},{k:"ي"},{k:"ب"},{k:"ل"},{k:"ا"},{k:"ت"},{k:"ن"},{k:"م"},{k:"ك"},{k:"ط"},{k:"enter",d:"↵",c:"small",kc:KC.ENTER}],
    z:[{k:"shift",d:"⇧",c:"shift",id:"shiftKey"},{k:"ئ"},{k:"ء"},{k:"ؤ"},{k:"ر"},{k:"لا"},{k:"ى"},{k:"ة"},{k:"و"},{k:"ز"},{k:"ظ"},{k:"shift",d:"⇧",c:"shift",id:"shiftKey2"}],
    b:[{k:"fn",d:"fn",c:"fn-key",id:"fnKey"},{k:"ctrl",d:"ctrl",c:"fn-key",id:"ctrlKey"},{k:"alt",d:"alt",c:"fn-key",id:"altKey"},{k:"space",d:"مسافة",c:"space-trackpad",id:"spaceTrackpad",special:true},{k:"mic",d:"🎤",c:"mic",id:"micKey"},{k:"clipboard",d:"📋",c:"clipboard",id:"clipboardKey"},{k:"arrowleft",d:"←",c:"fn-key",id:"arrowLeft",kc:KC.LEFT},{k:"arrowright",d:"→",c:"fn-key",id:"arrowRight",kc:KC.RIGHT}]
  }
};
Object.assign(layouts,{ar_full:layouts.ar,en:layouts.ar});
let audioCtx=null;
function getAudioCtx(){ if(!audioCtx){ try{ audioCtx=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){} } return audioCtx; }
function playSound(){ if(!soundEnabled) return; try{ const ctx=getAudioCtx(); if(!ctx) return; const now=ctx.currentTime; const gain=ctx.createGain(); gain.gain.setValueAtTime(0.15,now); gain.gain.exponentialRampToValueAtTime(0.01,now+0.07); const osc=ctx.createOscillator(); osc.type="square"; osc.frequency.setValueAtTime(1800+Math.random()*400,now); osc.connect(gain); gain.connect(ctx.destination); osc.start(now); osc.stop(now+0.07); }catch(e){} }
function commit(t){ try{ if(window.Android&&Android.commitText) Android.commitText(t); }catch(e){} }
function del(){ try{ if(window.Android&&Android.deleteText) Android.deleteText(); }catch(e){} }
function delN(n){ try{ if(window.Android&&Android.deleteN) Android.deleteN(n); }catch(e){} }
function sendKey(kc){ try{ if(window.Android&&Android.sendKey) Android.sendKey(kc); }catch(e){} }
function moveCursor(dx){ try{ if(window.Android&&Android.moveCursor) Android.moveCursor(dx); }catch(e){} }
function saveSet(k,v){ try{ localStorage.setItem("rapoo_"+k,v); if(window.Android&&Android.saveSetting) Android.saveSetting(k,v);}catch(e){} }
function loadSet(k,d){ try{ const v=localStorage.getItem("rapoo_"+k); if(v!==null) return v; if(window.Android&&Android.getSetting){const av=Android.getSetting(k,d); if(av) return av;}}catch(e){} return d; }
function vibrate(){ if(!vibEnabled) return; try{if(navigator.vibrate) navigator.vibrate(5)}catch(e){} }
function showToast(msg){ if(!showInstructions) return; miniToast.textContent=msg; miniToast.classList.add("show"); setTimeout(()=>miniToast.classList.remove("show"),1400); }
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
  for(let r of wordSugs){ const key=r.w.toLowerCase(); if(!seen.has(key)){ seen.add(key); uniq.push(r.w); } if(uniq.length>=5) break; }
  return {words:uniq,autoFix:autoFix};
}
function updateSuggestions(){
  try{
    if(!suggestEnabled||!showInstructions){ suggestionBar.innerHTML=''; suggestionBar.classList.remove("show"); return; }
    suggestionBar.classList.add("show");
    if(!currentWord){ suggestionBar.innerHTML=''; return; }
    const sugs=getSmartSuggestions(currentWord);
    let html='';
    if(sugs.autoFix){ html+='<div class="suggestion auto-fix" data-s="'+sugs.autoFix+'">✓ '+sugs.autoFix+' ⏎</div>'; } else { html+='<div class="suggestion active">'+currentWord+'</div>'; }
    sugs.words.forEach(w=>{ html+='<div class="suggestion correction" data-s="'+w+'">'+w+'</div>'; });
    suggestionBar.innerHTML=html;
    suggestionBar.querySelectorAll("[data-s]").forEach(el=>{
      el.addEventListener("click",()=>{ const sug=el.dataset.s; const len=currentWord.length; if(len>0) delN(len); setTimeout(()=>{ commit(sug+" "); currentWord=""; updateSuggestions(); playSound(); },30); });
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
    setTimeout(()=>{ commit(correction+" "); currentWord=""; playSound(); },20);
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
    let isCharging=false;
    let timeStr="12:41 PM";
    let time24="12:41";
    if(window.Android){
      if(Android.getBatteryLevel) battery=Android.getBatteryLevel();
      if(Android.isCharging) isCharging=Android.isCharging();
      if(Android.getTime) timeStr=Android.getTime();
      if(Android.getTime24) time24=Android.getTime24();
    } else {
      const d=new Date();
      const h=d.getHours();
      const m=String(d.getMinutes()).padStart(2,"0");
      time24=h+":"+m;
      const ampm=h>=12?"PM":"AM";
      const h12=h%12||12;
      timeStr=h12+":"+m+" "+ampm;
    }
    // بطارية منسقة
    let batIcon="🔋";
    if(isCharging) batIcon="⚡";
    else if(battery<20) batIcon="🪫";
    else if(battery>90) batIcon="🔋";
    batteryDisplay.textContent=batIcon+" "+battery+"%";
    batteryDisplay.className="battery"+(isCharging?" charging":"");
    // ساعة منسقة
    timeDisplay.textContent=timeStr;
    timeDisplay.title=time24;
    
    // رسائل فعلية
    try{
      if(window.Android && Android.getUnreadMessages){
        const unread=Android.getUnreadMessages();
        if(unread>=0){
          if(unread>0){
            messagesDisplay.textContent="💬 "+unread+" غير مقروءة";
            messagesDisplay.className="messages has-unread";
            messagesDisplay.title=unread+" رسائل غير مقروءة";
          } else {
            messagesDisplay.textContent="💬 0";
            messagesDisplay.className="messages";
            messagesDisplay.title="لا رسائل غير مقروءة";
          }
        } else {
          // بدون صلاحية
          messagesDisplay.textContent="💬";
          messagesDisplay.className="messages";
          messagesDisplay.title="فعّل صلاحية قراءة الرسائل";
        }
      }
    }catch(e){}
  }catch(e){}
}
setInterval(updateFooter,1000);
updateFooter();
function updateClipboardBar(){
  clipboardBar.innerHTML="";
  clipboardItems.forEach((item,i)=>{
    const div=document.createElement("div");
    div.className="clip-item";
    div.textContent=item.length>16?item.substring(0,16)+"...":item;
    div.addEventListener("click",()=>{ commit(item+" "); clipboardBar.classList.remove("show"); playSound(); });
    clipboardBar.appendChild(div);
  });
}
updateClipboardBar();

// فويس يكتب عند التحدث - مع partial results
let voicePartialText='';
window.voiceReady=function(){ if(showInstructions) showToast("🎤 جاهز..."); suggestionBar.classList.add("show"); suggestionBar.innerHTML='<div class="suggestion" style="background:#10b981;color:#fff">🎤 استمع...</div>'; };
window.voiceBegin=function(){ suggestionBar.classList.add("show"); suggestionBar.innerHTML='<div class="suggestion" style="background:#ef4444;color:#fff;animation:pulse .8s infinite">🎤 اتكلم الآن...</div>'; voicePartialText=''; };
window.voicePartial=function(text){ voicePartialText=text; suggestionBar.classList.add("show"); suggestionBar.innerHTML='<div class="suggestion" style="background:#8b5cf6;color:#fff">🎤 '+text+'</div>'; };
window.voiceEnd=function(){ suggestionBar.innerHTML='<div class="suggestion" style="background:#f59e0b;color:#000">⏳ معالجة...</div>'; };
window.voiceResult=function(text){
  isMicListening=false;
  document.querySelectorAll(".key.mic, #micBtn").forEach(k=>k.classList.remove("listening","active"));
  if(text && text.length>0){
    commit(text+" ");
    suggestionBar.classList.add("show");
    suggestionBar.innerHTML='<div class="suggestion" style="background:#10b981;color:#fff">✓ '+text+'</div>';
    setTimeout(()=>{ if(!currentWord) { suggestionBar.classList.remove("show"); suggestionBar.innerHTML=''; } },2000);
    try{ if(!clipboardItems.includes(text)){ clipboardItems.unshift(text); if(clipboardItems.length>15) clipboardItems.pop(); updateClipboardBar(); } }catch(e){}
    playSound();
  } else {
    suggestionBar.innerHTML='<div class="suggestion" style="background:#6b7280;color:#fff">🎤 لم أسمع</div>';
    setTimeout(()=>{ suggestionBar.classList.remove("show"); },1500);
  }
};
window.voiceNoResult=function(){
  isMicListening=false;
  document.querySelectorAll(".key.mic, #micBtn").forEach(k=>k.classList.remove("listening","active"));
  suggestionBar.innerHTML='<div class="suggestion" style="background:#6b7280;color:#fff">🎤 لم أسمع شيئاً</div>';
  setTimeout(()=>{ suggestionBar.classList.remove("show"); },1500);
};
window.voiceError=function(code){
  isMicListening=false;
  document.querySelectorAll(".key.mic, #micBtn").forEach(k=>k.classList.remove("listening","active"));
  let msg="خطأ";
  if(code==6) msg="لا يوجد صوت";
  else if(code==7) msg="لم أفهم";
  suggestionBar.innerHTML='<div class="suggestion" style="background:#ef4444;color:#fff">🎤 '+msg+'</div>';
  setTimeout(()=>{ suggestionBar.classList.remove("show"); },2000);
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
        k.addEventListener("pointerdown",e=>{ e.preventDefault(); k.setPointerCapture(e.pointerId); k.classList.add("pressed"); const num=k.dataset.num; if(num==="Enter"){ commit("\n"); sendKey(KC.ENTER); } else if(num==="C"){ del(); onDelete(); } else if(num==="Close"){ numpadOverlay.classList.remove("show"); } else { commit(num); } vibrate(); playSound(); });
        k.addEventListener("pointerup",e=>{ k.classList.remove("pressed"); k.releasePointerCapture(e.pointerId); });
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
    versionText.textContent="v4.4";
    document.body.className=document.body.className.replace(/theme-\S+/g,"").replace(/scale-\S+/g,"").replace(/rgb-\S+/g,"");
    document.body.classList.add("theme-"+currentTheme);
    document.body.classList.add("scale-"+currentScale);
    if(currentRGB!=="off") document.body.classList.add("rgb-"+currentRGB);
    if(isFloating) keyboardContainer.classList.add("floating"); else keyboardContainer.classList.remove("floating");
  }catch(e){}
}

// مسح: ضغطة واحدة حرف، مطولة مسح سريع متسارع
let deleteInterval=null,deleteHoldTimer=null,deleteActive=false,deletePointerId=null,deleteStartTime=0,deleteMoved=false,deleteCount=0;
function stopDeleteCompletely(){
  deleteActive=false;
  deleteMoved=false;
  deleteCount=0;
  if(deleteInterval){ clearInterval(deleteInterval); deleteInterval=null; }
  if(deleteHoldTimer){ clearTimeout(deleteHoldTimer); deleteHoldTimer=null; }
  deletePointerId=null;
  deleteStartTime=0;
  document.querySelectorAll(".key.del").forEach(k=>k.classList.remove("deleting"));
}
function startFastDeleteLoop(){
  if(deleteActive) return;
  deleteActive=true;
  deleteCount=0;
  document.querySelectorAll(".key.del").forEach(k=>k.classList.add("deleting"));
  deleteInterval=setInterval(()=>{
    del(); onDelete(); playSound();
    deleteCount++;
    // تسارع بعد 10 حروف
    if(deleteCount>10){
      clearInterval(deleteInterval);
      deleteInterval=setInterval(()=>{ del(); onDelete(); playSound(); },40);
    }
  },65);
}

function attachEvents(){
  window.addEventListener("pointerup",()=>{ stopDeleteCompletely(); }, {passive:true, capture:true});
  window.addEventListener("pointercancel",()=>{ stopDeleteCompletely(); isTrackpadActive=false; document.getElementById("spaceTrackpad")?.classList.remove("track-active"); document.getElementById("overlay")?.classList.remove("show"); }, {passive:true, capture:true});

  const keys=keyboardEl.querySelectorAll(".key");
  keys.forEach(k=>{
    const isDel=k.id==="delKey";
    const isSpace=k.id==="spaceTrackpad";
    const isMic=k.id==="micKey";
    const isClip=k.id==="clipboardKey";
    const isFn=k.id==="fnKey";
    const kc=parseInt(k.dataset.kc)||0;

    if(isDel){
      k.addEventListener("pointerdown", (e)=>{
        e.preventDefault();
        k.setPointerCapture(e.pointerId);
        deletePointerId=e.pointerId;
        deleteStartTime=Date.now();
        deleteMoved=false;
        k.classList.add("pressed");
        // بعد 350ms يبدأ مسح سريع
        deleteHoldTimer=setTimeout(()=>{
          if(!deleteMoved){
            startFastDeleteLoop();
          }
        },350);
      }, {passive:false});

      k.addEventListener("pointermove", (e)=>{
        if(e.pointerId!==deletePointerId) return;
        if(Math.abs(e.clientX-(k.getBoundingClientRect().left+k.getBoundingClientRect().width/2))>14) deleteMoved=true;
        if(deleteMoved) stopDeleteCompletely();
      }, {passive:true});

      k.addEventListener("pointerup", (e)=>{
        if(e.pointerId!==deletePointerId) return;
        e.preventDefault();
        const duration=Date.now()-deleteStartTime;
        k.classList.remove("pressed");
        try{ k.releasePointerCapture(e.pointerId); }catch(ex){}
        
        if(deleteActive){
          stopDeleteCompletely();
        } else {
          if(!deleteMoved && duration<500){
            del(); onDelete(); playSound(); vibrate();
          }
          stopDeleteCompletely();
        }
      }, {passive:false});

      k.addEventListener("pointercancel", (e)=>{
        k.classList.remove("pressed");
        stopDeleteCompletely();
      }, {passive:true});
      k.addEventListener("touchstart", (e)=>{ e.preventDefault(); }, {passive:false});
      return;
    }

    if(isSpace){
      let spacePointerId=null;
      let spaceStartX=0, spaceLastX=0;
      let spaceHoldTimer=null;
      let spaceActive=false;
      let spaceMoved=false;

      k.addEventListener("pointerdown", (e)=>{
        e.preventDefault();
        k.setPointerCapture(e.pointerId);
        spacePointerId=e.pointerId;
        spaceStartX=e.clientX;
        spaceLastX=e.clientX;
        spaceMoved=false;
        spaceActive=false;
        clearTimeout(spaceHoldTimer);
        spaceHoldTimer=setTimeout(()=>{
          if(!spaceMoved){
            spaceActive=true;
            isTrackpadActive=true;
            k.classList.add("track-active");
            document.getElementById("overlay").classList.add("show");
            vibrate(); playSound();
          }
        },350);
      }, {passive:false});

      k.addEventListener("pointermove", (e)=>{
        if(e.pointerId!==spacePointerId) return;
        const dx=e.clientX-spaceStartX;
        if(!spaceActive){
          if(Math.abs(dx)>12) { spaceMoved=true; clearTimeout(spaceHoldTimer); }
          return;
        }
        const moveDx=e.clientX-spaceLastX;
        if(Math.abs(moveDx)>=10){
          moveCursor(moveDx>0?1:-1);
          spaceLastX=e.clientX;
          const rect=k.getBoundingClientRect();
          let pct=((e.clientX-rect.left)/rect.width)*100;
          pct=Math.max(5,Math.min(95,pct));
          const dot=document.getElementById("trackDot");
          if(dot) dot.style.left=pct+"%";
        }
        e.preventDefault();
      }, {passive:false});

      k.addEventListener("pointerup", (e)=>{
        if(e.pointerId!==spacePointerId) return;
        e.preventDefault();
        clearTimeout(spaceHoldTimer);
        k.classList.remove("track-active");
        document.getElementById("overlay").classList.remove("show");
        const dot=document.getElementById("trackDot");
        if(dot) dot.style.left="50%";
        
        if(spaceActive){
          spaceActive=false;
          isTrackpadActive=false;
        } else {
          if(!spaceMoved && Math.abs(e.clientX-spaceStartX)<10){
            if(spacePressed) return;
            spacePressed=true;
            if(!handleSpace()){ commit(" "); onCharTyped(" "); playSound(); }
            vibrate();
            setTimeout(()=>{ spacePressed=false; },80);
          }
        }
        try{ k.releasePointerCapture(e.pointerId); }catch(ex){}
        spacePointerId=null;
      }, {passive:false});

      k.addEventListener("pointercancel", (e)=>{
        clearTimeout(spaceHoldTimer);
        k.classList.remove("track-active");
        document.getElementById("overlay").classList.remove("show");
        spaceActive=false;
        isTrackpadActive=false;
        spacePointerId=null;
      }, {passive:true});
      k.addEventListener("touchstart", (e)=>{ e.preventDefault(); }, {passive:false});
      return;
    }

    let startX=0,moved=false,pointerId=null,handled=false;
    k.addEventListener("pointerdown", (e)=>{
      if(processingKey) return;
      e.preventDefault();
      k.setPointerCapture(e.pointerId);
      pointerId=e.pointerId;
      startX=e.clientX; moved=false; handled=false;
      k.classList.add("pressed");
    }, {passive:false});

    k.addEventListener("pointermove", (e)=>{
      if(e.pointerId!==pointerId) return;
      if(Math.abs(e.clientX-startX)>10){ moved=true; k.classList.remove("pressed"); }
    }, {passive:true});

    k.addEventListener("pointerup", (e)=>{
      if(e.pointerId!==pointerId) return;
      if(handled) return; handled=true;
      e.preventDefault();
      k.classList.remove("pressed");
      try{ k.releasePointerCapture(e.pointerId); }catch(ex){}
      pointerId=null;
      if(moved) return;
      const key=k.dataset.key; if(!key) return;
      vibrate(); playSound();
      if(isMic){
        if(isMicListening){
          try{ if(window.Android&&Android.stopVoiceInput) Android.stopVoiceInput(); }catch(ex){}
          isMicListening=false;
          k.classList.remove("listening");
          document.getElementById("micBtn")?.classList.remove("listening","active");
          return;
        }
        if(!micEnabled){ return; }
        isMicListening=true;
        k.classList.add("listening");
        document.getElementById("micBtn")?.classList.add("listening","active");
        voicePartialText='';
        try{ if(window.Android&&Android.startVoiceInput) Android.startVoiceInput(); }catch(ex){ isMicListening=false; k.classList.remove("listening"); }
        setTimeout(()=>{ if(isMicListening){ isMicListening=false; k.classList.remove("listening"); document.getElementById("micBtn")?.classList.remove("listening","active"); try{ if(window.Android&&Android.stopVoiceInput) Android.stopVoiceInput(); }catch(ex){} } },8000);
        return;
      }
      if(isClip){ clipboardBar.classList.toggle("show"); updateClipboardBar(); return; }
      if(isFn){
        const nowFn=Date.now();
        if(nowFn-(window.lastFnTap||0)<350){
          if(numpadEnabled){
            numpadOverlay.classList.toggle("show");
          }
        }
        window.lastFnTap=nowFn;
        return;
      }
      if(kc>0){
        if(kc===KC.CAPS){ isCaps=!isCaps; updateUI(); return; }
        if(kc===KC.TAB){ commit("\t"); sendKey(kc); return; }
        if(kc===KC.ENTER){ commit("\n"); sendKey(kc); onCharTyped("\n"); return; }
        if(kc===KC.LEFT){ moveCursor(-1); return; }
        if(kc===KC.RIGHT){ moveCursor(1); return; }
        if(kc>=KC.F1 && kc<=KC.F12){ sendKey(kc); return; }
        if(kc===KC.ESC){ sendKey(kc); return; }
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
    }, {passive:false});

    k.addEventListener("pointercancel", (e)=>{
      k.classList.remove("pressed");
      if(e.pointerId===pointerId) pointerId=null;
    }, {passive:true});
    k.addEventListener("touchstart", (e)=>{ e.preventDefault(); }, {passive:false});
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
    return;
  }
  if(!micEnabled){ return; }
  isMicListening=true;
  this.classList.add("listening","active");
  document.querySelectorAll(".key.mic").forEach(k=>k.classList.add("listening"));
  try{ if(window.Android&&Android.startVoiceInput) Android.startVoiceInput(); }catch(e){ isMicListening=false; this.classList.remove("listening","active"); }
  setTimeout(()=>{ if(isMicListening){ isMicListening=false; this.classList.remove("listening","active"); document.querySelectorAll(".key.mic").forEach(k=>k.classList.remove("listening")); try{ if(window.Android&&Android.stopVoiceInput) Android.stopVoiceInput(); }catch(e){} } },8000);
});
document.getElementById("clipboardBtn")?.addEventListener("click",function(){ clipboardBar.classList.toggle("show"); updateClipboardBar(); this.classList.toggle("active", clipboardBar.classList.contains("show")); });
document.getElementById("floatingBtn")?.addEventListener("click",function(){ isFloating=!isFloating; this.classList.toggle("active", isFloating); saveSet("floating", isFloating?"true":"false"); updateUI(); });
document.querySelectorAll("#langOptions .option-btn").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll("#langOptions .option-btn").forEach(x=>x.classList.remove("active")); b.classList.add("active"); currentLang=b.dataset.lang; saveSet("language",currentLang); renderKeyboard();}));
document.querySelectorAll("#themeOptions .option-btn").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll("#themeOptions .option-btn").forEach(x=>x.classList.remove("active")); b.classList.add("active"); currentTheme=b.dataset.theme; saveSet("theme",currentTheme); updateUI();}));
document.querySelectorAll("#soundOptions .option-btn").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll("#soundOptions .option-btn").forEach(x=>x.classList.remove("active")); b.classList.add("active"); currentSound=b.dataset.sound; soundEnabled=currentSound!=="off"; saveSet("sound",currentSound); saveSet("soundEnabled",soundEnabled?"true":"false"); updateUI(); playSound();}));
document.querySelectorAll("#rgbOptions .option-btn").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll("#rgbOptions .option-btn").forEach(x=>x.classList.remove("active")); b.classList.add("active"); currentRGB=b.dataset.rgb; saveSet("rgb",currentRGB); updateUI();}));
document.querySelectorAll("#scaleOptions .option-btn").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll("#scaleOptions .option-btn").forEach(x=>x.classList.remove("active")); b.classList.add("active"); currentScale=b.dataset.scale; saveSet("scale",currentScale); updateUI();}));
document.getElementById("micToggle")?.addEventListener("click",function(){micEnabled=!micEnabled; this.textContent="🎤 مايك: "+(micEnabled?"مفعل":"مطفي"); this.classList.toggle("active",micEnabled); saveSet("mic",micEnabled?"true":"false");});
document.getElementById("clipboardToggle")?.addEventListener("click",function(){const v=clipboardEnabled; clipboardEnabled=!v; this.textContent="📋 حافظة: "+(clipboardEnabled?"مفعلة":"مطفية"); this.classList.toggle("active",clipboardEnabled); saveSet("clipboard",clipboardEnabled?"true":"false");});
document.getElementById("floatingToggle")?.addEventListener("click",function(){isFloating=!isFloating; this.textContent="🪟 عائم: "+(isFloating?"مفعل":"مطفي"); this.classList.toggle("active",isFloating); saveSet("floating",isFloating?"true":"false"); updateUI();});
document.getElementById("numpadToggle")?.addEventListener("click",function(){numpadEnabled=!numpadEnabled; this.textContent="🔢 نمباد: "+(numpadEnabled?"مفعل":"مطفي"); this.classList.toggle("active",numpadEnabled); saveSet("numpad",numpadEnabled?"true":"false");});
document.getElementById("vibToggle")?.addEventListener("click",function(){vibEnabled=!vibEnabled; this.textContent="📳 اهتزاز: "+(vibEnabled?"مفعل":"مطفي"); saveSet("vib",vibEnabled?"true":"false"); if(vibEnabled) vibrate();});
document.getElementById("instrToggle")?.addEventListener("click",function(){showInstructions=!showInstructions; this.textContent="👁️ إرشادات: "+(showInstructions?"مفعلة":"مخفية"); this.classList.toggle("active",showInstructions); saveSet("instructions",showInstructions?"true":"false"); updateUI(); updateSuggestions();});
document.getElementById("resetBtn")?.addEventListener("click",()=>{localStorage.clear(); location.reload();});
currentLang=loadSet("language","ar"); currentTheme=loadSet("theme","dark"); currentSound=loadSet("sound","clicky"); currentRGB=loadSet("rgb","reactive"); currentScale=loadSet("scale","medium"); isFloating=loadSet("floating","false")==="true"; micEnabled=loadSet("mic","true")==="true"; soundEnabled=loadSet("soundEnabled","true")==="true"; showInstructions=loadSet("instructions","false")==="true";
document.querySelector('[data-lang="'+currentLang+'"]')?.classList.add("active");
document.querySelector('[data-theme="'+currentTheme+'"]')?.classList.add("active");
document.querySelector('[data-sound="'+currentSound+'"]')?.classList.add("active");
document.querySelector('[data-rgb="'+currentRGB+'"]')?.classList.add("active");
document.querySelector('[data-scale="'+currentScale+'"]')?.classList.add("active");
renderKeyboard();
console.log("v4.4 - مسح حرف/سريع متسارع, فويس يكتب مع partial, بطارية ساعة منسق, رسائل فعلية غير مقروءة");
