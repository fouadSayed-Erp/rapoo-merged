const keyboardEl=document.getElementById('keyboard'),suggestionBar=document.getElementById('suggestionBar'),langIndicator=document.getElementById('langIndicator'),versionText=document.getElementById('versionText'),numpadOverlay=document.getElementById('numpadOverlay'),numpadGrid=document.getElementById('numpadGrid'),batteryDisplay=document.getElementById('batteryDisplay'),timeDisplay=document.getElementById('timeDisplay'),keyboardContainer=document.getElementById('keyboardContainer'),clipboardBar=document.getElementById('clipboardBar'),messagesDisplay=document.getElementById('messagesDisplay'),messagesPopup=document.getElementById('messagesPopup'),messagesList=document.getElementById('messagesList'),messagesPopupTitle=document.getElementById('messagesPopupTitle');
let isShift=false,isCaps=false,isCtrl=false,isAlt=false;
let currentLang='ar',currentTheme='liquid-neon',currentSound='clicky',currentRGB='reactive',currentScale='medium',vibEnabled=true,soundEnabled=true,numpadEnabled=true,micEnabled=true,isFloating=false,isMicListening=false;
let spacePressed=false;
let clipboardItems=["مرحبا","كيف حالك","فؤاد","شكرا","تمام"];
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
function playSound(t='regular'){
  if(!soundEnabled) return;
  try{
    const ctx=getAudioCtx(); if(!ctx) return; const now=ctx.currentTime; if(currentSound==='off') return;
    let freq=1800,type='square',vol=0.15,decay=0.07,end=600;
    if(currentSound==='clicky'){
      if(t==='enter'){ freq=150; type='sine'; vol=0.25; decay=0.18; end=80; }
      else if(t==='space'){ freq=90; type='sine'; vol=0.3; decay=0.22; end=60; }
      else if(t==='tab'){ freq=2800; type='square'; vol=0.12; decay=0.05; end=1200; }
      else if(t==='delete'){ freq=3200; type='square'; vol=0.18; decay=0.04; end=800; }
      else { freq=1800+Math.random()*500; vol=0.15; decay=0.07; end=600; }
    } else if(currentSound==='thocky'){ if(t==='enter'){ freq=80; type='sine'; vol=0.35; decay=0.25; end=40; } else if(t==='space'){ freq=60; type='sine'; vol=0.4; decay=0.3; end=35; } else { freq=110; type='sine'; vol=0.22; decay=0.15; end=60; } }
    else { freq=1200; type='triangle'; vol=0.14; decay=0.06; end=400; }
    const g=ctx.createGain(); g.gain.setValueAtTime(vol,now); g.gain.exponentialRampToValueAtTime(0.01,now+decay);
    const o=ctx.createOscillator(); o.type=type; o.frequency.setValueAtTime(freq,now); o.frequency.exponentialRampToValueAtTime(end,now+decay*0.6); o.connect(g); g.connect(ctx.destination); o.start(now); o.stop(now+decay);
  }catch(e){}
}
function commit(t){ try{ if(window.Android&&Android.commitText) Android.commitText(t); }catch(e){} }
function del(){ try{ if(window.Android&&Android.deleteText) Android.deleteText(); }catch(e){} }
function sendKey(kc){ try{ if(window.Android&&Android.sendKey) Android.sendKey(kc); }catch(e){} }
function moveCursor(dx){ try{ if(window.Android&&Android.moveCursor) Android.moveCursor(dx); }catch(e){} }
function saveSet(k,v){ try{ localStorage.setItem("rapoo_"+k,v); if(window.Android&&Android.saveSetting) Android.saveSetting(k,v);}catch(e){} }
function loadSet(k,d){ try{ const v=localStorage.getItem("rapoo_"+k); if(v!==null) return v; if(window.Android&&Android.getSetting){const av=Android.getSetting(k,d); if(av) return av;}}catch(e){} return d; }
function vibrate(){ if(!vibEnabled) return; try{if(navigator.vibrate) navigator.vibrate(8)}catch(e){} }
function updateFooter(){
  try{
    let battery=73; let isCharging=false; let timeStr="12:41 PM";
    if(window.Android){ if(Android.getBatteryLevel) battery=Android.getBatteryLevel(); if(Android.isCharging) isCharging=Android.isCharging(); if(Android.getTime) timeStr=Android.getTime(); }
    else { const d=new Date(); const h=d.getHours(); const m=String(d.getMinutes()).padStart(2,"0"); const ampm=h>=12?"PM":"AM"; const h12=h%12||12; timeStr=h12+":"+m+" "+ampm; }
    let icon="🔋"; if(isCharging) icon="⚡"; else if(battery<20) icon="🪫";
    batteryDisplay.textContent=icon+" "+battery+"%"; batteryDisplay.className="battery"+(isCharging?" charging":""); timeDisplay.textContent=timeStr;
    try{ if(window.Android && Android.getUnreadMessages){ const unread=Android.getUnreadMessages(); const total=Android.getTotalMessages?Android.getTotalMessages():-1; if(unread>=0){ if(unread>0){ messagesDisplay.textContent="💬 "+unread; messagesDisplay.className="messages has-unread"; messagesPopupTitle.textContent="💬 "+unread+" غير مقروءة • "+total+" واردة"; } else { messagesDisplay.textContent="💬 "+(total>=0?total:"0"); messagesDisplay.className="messages"; } } else { messagesDisplay.textContent="💬 🔒"; messagesDisplay.className="messages"; } } }catch(e){}
  }catch(e){}
}
setInterval(updateFooter,1000); updateFooter();
function updateClipboardBar(){ clipboardBar.innerHTML=""; clipboardItems.forEach(item=>{ const div=document.createElement("div"); div.className="clip-item"; div.textContent=item.length>16?item.substring(0,16)+"...":item; div.addEventListener("click",()=>{ commit(item+" "); clipboardBar.classList.remove("show"); playSound('regular'); }); clipboardBar.appendChild(div); }); }
updateClipboardBar();
window.voicePermissionNeeded=function(){ isMicListening=false; document.querySelectorAll(".key.mic, #micBtn").forEach(k=>k.classList.remove("listening","active")); const sb=document.getElementById('suggestionBar'); if(sb){ sb.classList.add("show"); sb.innerHTML='<div class="suggestion" style="background:#ef4444;color:#fff;cursor:pointer" onclick="Android.requestPermissions()">🎤 إذن المايك مطلوب - اضغط للسماح</div>'; } };
window.smsPermissionNeeded=function(){ messagesList.innerHTML='<div style="padding:12px;text-align:center"><div style="color:#ef4444;font-size:10px;font-weight:800;margin-bottom:8px">🔒 إذن الرسائل مطلوب</div><div style="font-size:8px;color:#9ca3af;margin-bottom:8px">لعرض الرسائل الفعلية</div><button onclick="Android.requestPermissions()" style="background:#8b5cf6;color:#fff;border:none;padding:6px 12px;border-radius:8px;font-size:9px;font-weight:700;cursor:pointer">✓ منح الإذن</button></div>'; messagesPopup.classList.add("show"); };
window.voiceBegin=function(){ const sb=document.getElementById('suggestionBar'); if(sb){ sb.classList.add("show"); sb.innerHTML='<div class="suggestion" style="background:#ef4444;color:#fff">🎤 اتكلم...</div>'; } };
window.voicePartial=function(t){ const sb=document.getElementById('suggestionBar'); if(sb){ sb.classList.add("show"); sb.innerHTML='<div class="suggestion" style="background:#8b5cf6;color:#fff">🎤 '+t+'</div>'; } };
window.voiceEnd=function(){ const sb=document.getElementById('suggestionBar'); if(sb){ sb.innerHTML='<div class="suggestion" style="background:#f59e0b;color:#000">⏳ معالجة...</div>'; } };
window.voiceResult=function(t){ isMicListening=false; document.querySelectorAll(".key.mic, #micBtn").forEach(k=>k.classList.remove("listening","active")); if(t && t.length>0){ commit(t+" "); const sb=document.getElementById('suggestionBar'); if(sb){ sb.classList.add("show"); sb.innerHTML='<div class="suggestion" style="background:#10b981;color:#fff">✓ '+t+'</div>'; setTimeout(()=>{ sb.classList.remove("show"); },2000); } playSound('space'); } };
window.voiceNoResult=function(){ isMicListening=false; document.querySelectorAll(".key.mic, #micBtn").forEach(k=>k.classList.remove("listening","active")); };
window.voiceError=function(c){ isMicListening=false; document.querySelectorAll(".key.mic, #micBtn").forEach(k=>k.classList.remove("listening","active")); };

function renderKeyboard(){
  try{
    const layout=layouts[currentLang]||layouts.ar;
    let html="";
    const rows=[{k:"f",cls:"row-f"},{k:"n",cls:"row-n"},{k:"q",cls:"row-q"},{k:"a",cls:"row-a"},{k:"z",cls:"row-z"},{k:"b",cls:"row-b"}];
    rows.forEach(r=>{
      const row=layout[r.k]; if(!row) return;
      html+='<div class="row '+r.cls+'">';
      row.forEach(item=>{
        try{
          if(!item || !item.k) return;
          if(item.special){ html+='<div class="key '+ (item.c||"") +'" id="'+ (item.id||"") +'" data-key="'+item.k+'"><div class="space-content"><span>'+item.d+'</span><div class="track-icon">▣</div></div><div class="space-hint">مسافة • تراك باد</div><div class="trackpad-grid" id="trackpadGrid"></div><div class="track-dot" id="trackDot"></div></div>'; }
          else { const disp=item.d||item.k; html+='<div class="key '+(item.c||"")+'"'+(item.id?' id="'+item.id+'"':"")+' data-key="'+item.k+'" data-kc="'+(item.kc||"")+'">'+disp+'</div>'; }
        }catch(e){}
      });
      html+="</div>";
    });
    if(html.length<100) throw new Error("short");
    keyboardEl.innerHTML=html;
    attachEvents(); updateUI();
    if(numpadGrid){
      const nums=[["7","8","9","/"],["4","5","6","*"],["1","2","3","-"],["0",".","=","+"]];
      let ngHtml=""; nums.forEach(row=>{ row.forEach(n=>{ ngHtml+='<div class="numpad-key" data-num="'+n+'">'+n+'</div>'; }); });
      ngHtml+='<div class="numpad-key" data-num="Enter" style="grid-column:span 2;background:#8b5cf6">↵</div><div class="numpad-key" data-num="C" style="background:#ff4444">⌫</div><div class="numpad-key" data-num="Close" style="background:#252525">✕</div>';
      numpadGrid.innerHTML=ngHtml;
      numpadGrid.querySelectorAll(".numpad-key").forEach(k=>{
        k.addEventListener("pointerdown",e=>{ e.preventDefault(); k.setPointerCapture(e.pointerId); k.classList.add("pressed"); const num=k.dataset.num; if(num==="Enter"){ commit("\n"); sendKey(KC.ENTER); playSound('enter'); } else if(num==="C"){ del(); playSound('delete'); } else if(num==="Close"){ numpadOverlay.classList.remove("show"); } else { commit(num); playSound('regular'); } vibrate(); });
        k.addEventListener("pointerup",e=>{ k.classList.remove("pressed"); k.releasePointerCapture(e.pointerId); });
      });
    }
  }catch(e){
    let fh=''; const fr=[['esc','F1','F2','F3','F4','F5','F6','F7','F8','F9','F10','F11','F12'],['ذ','1','2','3','4','5','6','7','8','9','0','-','=','⌫'],['tab','ض','ص','ث','ق','ف','غ','ع','ه','خ','ح','ج','د','\\'],['caps','ش','س','ي','ب','ل','ا','ت','ن','م','ك','ط','↵'],['⇧','ئ','ء','ؤ','ر','لا','ى','ة','و','ز','ظ','⇧'],['fn','ctrl','alt','مسافة','🎤','📋','←','→']];
    fr.forEach(row=>{ fh+='<div class="row">'; row.forEach(k=>{ const id=k==='⌫'?' id="delKey"':k==='مسافة'?' id="spaceTrackpad"':''; const cls=k==='⌫'?' del':k==='مسافة'?' space-trackpad':k==='tab'||k==='caps'||k==='esc'?' small':k==='⇧'?' shift':''; fh+='<div class="key'+cls+'"'+id+' data-key="'+k+'">'+k+'</div>'; }); fh+='</div>'; });
    keyboardEl.innerHTML=fh; try{ attachEvents(); updateUI(); }catch(ex){}
  }
}
function updateUI(){
  try{
    document.getElementById("capsKey")?.classList.toggle("active", isCaps);
    document.querySelectorAll("#shiftKey,#shiftKey2").forEach(k=>k.classList.toggle("active", isShift||isCaps));
    langIndicator.textContent=currentLang.toUpperCase().slice(0,3);
    versionText.textContent="v4.8";
    const old = Array.from(document.body.classList).find(c=>c.startsWith('theme-'));
    if(old) document.body.classList.remove(old);
    document.body.classList.add("theme-"+currentTheme);
    document.body.classList.remove("scale-small","scale-medium","scale-large","scale-xlarge");
    document.body.classList.add("scale-"+currentScale);
    document.body.classList.remove("rgb-off","rgb-reactive","rgb-rainbow","rgb-wave");
    if(currentRGB!=="off") document.body.classList.add("rgb-"+currentRGB);
    if(isFloating) keyboardContainer.classList.add("floating"); else keyboardContainer.classList.remove("floating");
  }catch(e){}
}
// مسح سريع فوري - 200ms يبدأ + 40ms سريع + 15ms صاروخ
let deleteInterval=null,deleteHoldTimer=null,deleteActive=false,deletePointerId=null,deleteStartTime=0,deleteMoved=false,deleteCount=0;
function stopDelete(){ deleteActive=false; deleteMoved=false; deleteCount=0; if(deleteInterval){ clearInterval(deleteInterval); deleteInterval=null; } if(deleteHoldTimer){ clearTimeout(deleteHoldTimer); deleteHoldTimer=null; } deletePointerId=null; deleteStartTime=0; document.querySelectorAll(".key.del").forEach(k=>k.classList.remove("deleting")); }
function startDelete(){
  if(deleteActive) return; deleteActive=true; deleteCount=0;
  document.querySelectorAll(".key.del").forEach(k=>k.classList.add("deleting"));
  // فوري سريع 40ms
  deleteInterval=setInterval(()=>{
    del(); playSound('delete'); vibrate(); deleteCount++;
    if(deleteCount==5){ clearInterval(deleteInterval); deleteInterval=setInterval(()=>{ del(); playSound('delete'); deleteCount++; if(deleteCount>10){ clearInterval(deleteInterval); deleteInterval=setInterval(()=>{ del(); playSound('delete'); deleteCount++; if(deleteCount>20){ clearInterval(deleteInterval); deleteInterval=setInterval(()=>{ del(); playSound('delete'); },15); } },20); } },30); }
  },40);
}
function attachEvents(){
  window.addEventListener("pointerup",()=>{ stopDelete(); }, {passive:true, capture:true});
  window.addEventListener("pointercancel",()=>{ stopDelete(); }, {passive:true, capture:true});
  const keys=keyboardEl.querySelectorAll(".key");
  keys.forEach(k=>{
    const isDel=k.id==="delKey" || k.dataset.key==="⌫" || k.dataset.key==="Backspace";
    const isSpace=k.id==="spaceTrackpad" || k.dataset.key==="مسافة";
    const isMic=k.id==="micKey" || k.dataset.key==="🎤";
    const isClip=k.id==="clipboardKey" || k.dataset.key==="📋";
    const isFn=k.id==="fnKey" || k.dataset.key==="fn";
    const kc=parseInt(k.dataset.kc)||0;
    if(isDel){
      k.addEventListener("pointerdown", (e)=>{ e.preventDefault(); k.setPointerCapture(e.pointerId); deletePointerId=e.pointerId; deleteStartTime=Date.now(); deleteMoved=false; k.classList.add("pressed"); deleteHoldTimer=setTimeout(()=>{ if(!deleteMoved) startDelete(); },200); }, {passive:false});
      k.addEventListener("pointermove", (e)=>{ if(e.pointerId!==deletePointerId) return; if(Math.abs(e.clientX-(k.getBoundingClientRect().left+k.getBoundingClientRect().width/2))>14) deleteMoved=true; if(deleteMoved) stopDelete(); }, {passive:true});
      k.addEventListener("pointerup", (e)=>{ if(e.pointerId!==deletePointerId) return; e.preventDefault(); const dur=Date.now()-deleteStartTime; k.classList.remove("pressed"); try{ k.releasePointerCapture(e.pointerId); }catch(ex){} if(deleteActive){ stopDelete(); } else { if(!deleteMoved && dur<350){ del(); playSound('delete'); vibrate(); } stopDelete(); } }, {passive:false});
      k.addEventListener("pointercancel", (e)=>{ k.classList.remove("pressed"); stopDelete(); }, {passive:true});
      return;
    }
    if(isSpace){
      let sPid=null, sX=0, sLastX=0, sTimer=null, sActive=false, sMoved=false;
      k.addEventListener("pointerdown", (e)=>{ e.preventDefault(); k.setPointerCapture(e.pointerId); sPid=e.pointerId; sX=e.clientX; sLastX=e.clientX; sMoved=false; sActive=false; clearTimeout(sTimer); sTimer=setTimeout(()=>{ if(!sMoved){ sActive=true; k.classList.add("track-active"); document.getElementById("overlay").classList.add("show"); vibrate(); playSound('space'); } },350); }, {passive:false});
      k.addEventListener("pointermove", (e)=>{ if(e.pointerId!==sPid) return; const dx=e.clientX-sX; if(!sActive){ if(Math.abs(dx)>12){ sMoved=true; clearTimeout(sTimer); } return; } const mdx=e.clientX-sLastX; if(Math.abs(mdx)>=10){ moveCursor(mdx>0?1:-1); sLastX=e.clientX; const rect=k.getBoundingClientRect(); let pct=((e.clientX-rect.left)/rect.width)*100; pct=Math.max(5,Math.min(95,pct)); const dot=document.getElementById("trackDot"); if(dot) dot.style.left=pct+"%"; } e.preventDefault(); }, {passive:false});
      k.addEventListener("pointerup", (e)=>{ if(e.pointerId!==sPid) return; e.preventDefault(); clearTimeout(sTimer); k.classList.remove("track-active"); document.getElementById("overlay").classList.remove("show"); const dot=document.getElementById("trackDot"); if(dot) dot.style.left="50%"; if(sActive){ sActive=false; } else { if(!sMoved && Math.abs(e.clientX-sX)<10){ if(spacePressed) return; spacePressed=true; commit(" "); playSound('space'); vibrate(); setTimeout(()=>{ spacePressed=false; },80); } } try{ k.releasePointerCapture(e.pointerId); }catch(ex){} sPid=null; }, {passive:false});
      k.addEventListener("pointercancel", (e)=>{ clearTimeout(sTimer); k.classList.remove("track-active"); document.getElementById("overlay").classList.remove("show"); sActive=false; sPid=null; }, {passive:true});
      return;
    }
    let sX=0,moved=false,pid=null,handled=false;
    k.addEventListener("pointerdown", (e)=>{ e.preventDefault(); k.setPointerCapture(e.pointerId); pid=e.pointerId; sX=e.clientX; moved=false; handled=false; k.classList.add("pressed"); }, {passive:false});
    k.addEventListener("pointermove", (e)=>{ if(e.pointerId!==pid) return; if(Math.abs(e.clientX-sX)>10){ moved=true; k.classList.remove("pressed"); } }, {passive:true});
    k.addEventListener("pointerup", (e)=>{
      if(e.pointerId!==pid) return; if(handled) return; handled=true; e.preventDefault(); k.classList.remove("pressed"); try{ k.releasePointerCapture(e.pointerId); }catch(ex){} pid=null; if(moved) return;
      const key=k.dataset.key; if(!key) return; vibrate();
      let st='regular'; if(kc===KC.ENTER || key==='↵') st='enter'; else if(kc===KC.TAB || key==='tab') st='tab'; else if(key==='space'||key==='مسافة') st='space'; playSound(st);
      if(isMic){
        if(window.Android && Android.hasAudioPermission && !Android.hasAudioPermission()){ window.voicePermissionNeeded(); if(window.Android && Android.requestPermissions) Android.requestPermissions(); return; }
        if(isMicListening){ try{ if(window.Android&&Android.stopVoiceInput) Android.stopVoiceInput(); }catch(ex){} isMicListening=false; k.classList.remove("listening"); document.getElementById("micBtn")?.classList.remove("listening","active"); return; }
        if(!micEnabled) return; isMicListening=true; k.classList.add("listening"); document.getElementById("micBtn")?.classList.add("listening","active"); try{ if(window.Android&&Android.startVoiceInput) Android.startVoiceInput(); }catch(ex){ isMicListening=false; k.classList.remove("listening"); } setTimeout(()=>{ if(isMicListening){ isMicListening=false; k.classList.remove("listening"); document.getElementById("micBtn")?.classList.remove("listening","active"); try{ if(window.Android&&Android.stopVoiceInput) Android.stopVoiceInput(); }catch(ex){} } },8000); return;
      }
      if(isClip){ clipboardBar.classList.toggle("show"); updateClipboardBar(); return; }
      if(isFn){ const now=Date.now(); if(now-(window.lastFnTap||0)<350){ if(numpadEnabled) numpadOverlay.classList.toggle("show"); } window.lastFnTap=now; return; }
      if(kc>0){ if(kc===KC.CAPS || key==='caps'){ isCaps=!isCaps; updateUI(); return; } if(kc===KC.TAB || key==='tab'){ commit("\t"); sendKey(KC.TAB); return; } if(kc===KC.ENTER || key==='↵'){ commit("\n"); sendKey(KC.ENTER); return; } if(kc===KC.LEFT){ moveCursor(-1); return; } if(kc===KC.RIGHT){ moveCursor(1); return; } if(kc>=KC.F1 && kc<=KC.F12){ sendKey(kc); return; } if(kc===KC.ESC){ sendKey(kc); return; } }
      if(key==="shift"||key==="⇧"){isShift=!isShift;updateUI();return;}
      if(key==="caps"){isCaps=!isCaps;updateUI();return;}
      if(key==="ctrl"){isCtrl=!isCtrl;updateUI();return;}
      if(key==="alt"){isAlt=!isAlt;updateUI();return;}
      if(key==="Backspace"||key==="⌫"){del();return;}
      if(key==="arrowleft"||key==="←"){moveCursor(-1);return;}
      if(key==="arrowright"||key==="→"){moveCursor(1);return;}
      let out=key; if(out.length===1 && currentLang.startsWith("en")&&/[a-z]/.test(out)) out=(isShift||isCaps)?out.toUpperCase():out.toLowerCase();
      if(out==="space"||out==="مسافة"){ if(spacePressed) return; spacePressed=true; commit(" "); setTimeout(()=>{ spacePressed=false; },80); } else { commit(out); }
      if(isShift){isShift=false;updateUI();}
    }, {passive:false});
    k.addEventListener("pointercancel", (e)=>{ k.classList.remove("pressed"); if(e.pointerId===pid) pid=null; }, {passive:true});
  });
  const overlay=document.getElementById("overlay");
  if(overlay) overlay.addEventListener("click",()=>{ document.getElementById("spaceTrackpad")?.classList.remove("track-active"); overlay.classList.remove("show"); });
  function showMessages(){
    try{
      let msgs=[]; let raw=""; try{ if(window.Android && Android.getMessagesList){ raw=Android.getMessagesList(); if(raw==="PERMISSION_DENIED"){ window.smsPermissionNeeded(); return; } msgs=JSON.parse(raw); } }catch(e){ if(raw==="PERMISSION_DENIED"){ window.smsPermissionNeeded(); return; } }
      if(!msgs.length) msgs=[{address:"فؤاد",body:"مرحبا كيف حالك - رسالة تجريبية طويلة لاختبار السكرول في القائمة الجديدة لقراءة الرسائل بشكل صحيح وسلس",time:"12:30",read:0},{address:"0123456789",body:"تم شحن رصيدك 100 جنيه بنجاح - تفاصيل العملية ورقم العملية 123456789",time:"11:15",read:1},{address:"خدمة العملاء",body:"كود التفعيل الخاص بك هو 123456 - لا تشاركه مع أحد - صالح لمدة 5 دقائق",time:"10:00",read:0},{address:"البنك",body:"تم خصم 250 جنيه من حسابك - المتبقي 1250 جنيه - للاستفسار اتصل 19995",time:"09:30",read:1},{address:"فودافون",body:"باقتك ستنتهي غدا - جدد الآن باقة 100 جنيه واحصل على 10 جيجا هدية",time:"08:15",read:0}];
      messagesList.innerHTML=''; msgs.forEach(m=>{
        const div=document.createElement('div'); div.className='message-item'+(m.read==0?' unread':'');
        div.innerHTML='<div class="message-item-header"><span class="message-item-address">'+m.address+'</span><span class="message-item-time">'+m.time+'</span></div><div class="message-item-body">'+m.body+'</div>';
        div.addEventListener('pointerdown', (e)=>{ e.preventDefault(); div.setPointerCapture(e.pointerId); div.style.transform='scale(0.97)'; }, {passive:false});
        div.addEventListener('pointerup', (e)=>{ e.preventDefault(); div.style.transform=''; commit(m.body+' '); messagesPopup.classList.remove('show'); playSound('regular'); try{ div.releasePointerCapture(e.pointerId); }catch(ex){} }, {passive:false});
        messagesList.appendChild(div);
      });
      messagesPopup.classList.add('show');
    }catch(e){ messagesList.innerHTML='<div style="padding:8px;color:#ef4444;font-size:8px">خطأ: '+e.message+'</div>'; messagesPopup.classList.add('show'); }
  }
  const trig=(e)=>{ if(e){ e.preventDefault(); e.stopPropagation(); } if(messagesPopup.classList.contains('show')){ messagesPopup.classList.remove('show'); } else { showMessages(); } };
  messagesDisplay?.addEventListener('click', trig);
  messagesDisplay?.addEventListener('pointerup', trig, {passive:false});
  document.getElementById('closeMessages')?.addEventListener('click',()=>messagesPopup.classList.remove('show'));
  // لا تغلق عند السكرول داخل القائمة
  messagesList?.addEventListener('pointerdown', (e)=>{ e.stopPropagation(); }, {passive:true});
  document.addEventListener('pointerdown', (e)=>{ if(!messagesPopup.contains(e.target) && e.target!==messagesDisplay && !messagesDisplay.contains(e.target)){ messagesPopup.classList.remove('show'); } }, {passive:true});
}
document.getElementById("dotsMenu")?.addEventListener("click",()=>document.getElementById("settingsPanel").classList.add("show"));
document.getElementById("closeSettings")?.addEventListener("click",()=>document.getElementById("settingsPanel").classList.remove("show"));
document.getElementById("closeNumpad")?.addEventListener("click",()=>numpadOverlay.classList.remove("show"));
document.getElementById("micBtn")?.addEventListener("click",function(){
  if(window.Android && Android.hasAudioPermission && !Android.hasAudioPermission()){ window.voicePermissionNeeded(); if(window.Android && Android.requestPermissions) Android.requestPermissions(); return; }
  if(isMicListening){ try{ if(window.Android&&Android.stopVoiceInput) Android.stopVoiceInput(); }catch(e){} isMicListening=false; this.classList.remove("listening","active"); document.querySelectorAll(".key.mic").forEach(k=>k.classList.remove("listening")); return; }
  if(!micEnabled) return; isMicListening=true; this.classList.add("listening","active"); document.querySelectorAll(".key.mic").forEach(k=>k.classList.add("listening"));
  try{ if(window.Android&&Android.startVoiceInput) Android.startVoiceInput(); }catch(e){ isMicListening=false; this.classList.remove("listening","active"); }
  setTimeout(()=>{ if(isMicListening){ isMicListening=false; this.classList.remove("listening","active"); document.querySelectorAll(".key.mic").forEach(k=>k.classList.remove("listening")); try{ if(window.Android&&Android.stopVoiceInput) Android.stopVoiceInput(); }catch(e){} } },8000);
});
document.getElementById("clipboardBtn")?.addEventListener("click",function(){ clipboardBar.classList.toggle("show"); updateClipboardBar(); this.classList.toggle("active", clipboardBar.classList.contains("show")); });
document.getElementById("floatingBtn")?.addEventListener("click",function(){ isFloating=!isFloating; this.classList.toggle("active", isFloating); saveSet("floating", isFloating?"true":"false"); updateUI(); });
document.querySelectorAll("#langOptions .option-btn").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll("#langOptions .option-btn").forEach(x=>x.classList.remove("active")); b.classList.add("active"); currentLang=b.dataset.lang; saveSet("language",currentLang); renderKeyboard();}));
document.querySelectorAll("#themeOptions .option-btn").forEach(b=>b.addEventListener("click",()=>{ document.querySelectorAll("#themeOptions .option-btn").forEach(x=>x.classList.remove("active")); b.classList.add("active"); currentTheme=b.dataset.theme; saveSet("theme",currentTheme); updateUI(); playSound('regular'); }));
document.querySelectorAll("#soundOptions .option-btn").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll("#soundOptions .option-btn").forEach(x=>x.classList.remove("active")); b.classList.add("active"); currentSound=b.dataset.sound; soundEnabled=currentSound!=="off"; saveSet("sound",currentSound); saveSet("soundEnabled",soundEnabled?"true":"false"); updateUI(); playSound('enter');}));
document.querySelectorAll("#rgbOptions .option-btn").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll("#rgbOptions .option-btn").forEach(x=>x.classList.remove("active")); b.classList.add("active"); currentRGB=b.dataset.rgb; saveSet("rgb",currentRGB); updateUI(); playSound('regular');}));
document.querySelectorAll("#scaleOptions .option-btn").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll("#scaleOptions .option-btn").forEach(x=>x.classList.remove("active")); b.classList.add("active"); currentScale=b.dataset.scale; saveSet("scale",currentScale); updateUI();}));
document.getElementById("micToggle")?.addEventListener("click",function(){micEnabled=!micEnabled; this.textContent="🎤 مايك: "+(micEnabled?"مفعل":"مطفي"); this.classList.toggle("active",micEnabled); saveSet("mic",micEnabled?"true":"false");});
document.getElementById("floatingToggle")?.addEventListener("click",function(){isFloating=!isFloating; this.textContent="🪟 عائم: "+(isFloating?"مفعل":"مطفي"); this.classList.toggle("active",isFloating); saveSet("floating",isFloating?"true":"false"); updateUI();});
document.getElementById("numpadToggle")?.addEventListener("click",function(){numpadEnabled=!numpadEnabled; this.textContent="🔢 نمباد: "+(numpadEnabled?"مفعل":"مطفي"); this.classList.toggle("active",numpadEnabled); saveSet("numpad",numpadEnabled?"true":"false");});
document.getElementById("vibToggle")?.addEventListener("click",function(){vibEnabled=!vibEnabled; this.textContent="📳 اهتزاز: "+(vibEnabled?"مفعل":"مطفي"); saveSet("vib",vibEnabled?"true":"false"); if(vibEnabled) vibrate();});
document.getElementById("resetBtn")?.addEventListener("click",()=>{localStorage.clear(); location.reload();});
currentLang=loadSet("language","ar"); currentTheme=loadSet("theme","liquid-neon"); currentSound=loadSet("sound","clicky"); currentRGB=loadSet("rgb","reactive"); currentScale=loadSet("scale","medium"); isFloating=loadSet("floating","false")==="true"; micEnabled=loadSet("mic","true")==="true"; soundEnabled=loadSet("soundEnabled","true")==="true";
document.querySelector('[data-lang="'+currentLang+'"]')?.classList.add("active");
document.querySelector('[data-theme="'+currentTheme+'"]')?.classList.add("active");
document.querySelector('[data-sound="'+currentSound+'"]')?.classList.add("active");
document.querySelector('[data-rgb="'+currentRGB+'"]')?.classList.add("active");
document.querySelector('[data-scale="'+currentScale+'"]')?.classList.add("active");
renderKeyboard();
