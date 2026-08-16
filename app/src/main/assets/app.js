const keyboard=document.getElementById('keyboard'),spaceTrackpad=document.getElementById('spaceTrackpad'),overlay=document.getElementById('overlay'),trackDot=document.getElementById('trackDot'),trackGrid=document.getElementById('trackpadGrid');
let isShift=false,isCaps=false,isAlt=false,isCtrl=false,isTrackpadActive=false,isFullTrackpad=false,holdTimer=null,lastX=0,startX=0,startY=0,lastMoveX=0;
for(let i=0;i<48;i++){const d=document.createElement('div');trackGrid.appendChild(d);}

// KeyCodes زي ويندوز
const KC={
  F1:131,F2:132,F3:133,F4:134,F5:135,F6:136,F7:137,F8:138,F9:139,F10:140,F11:141,F12:142,
  ESC:111,TAB:61,ENTER:66,DEL:67,BACKSPACE:67,
  A:29,B:30,C:31,D:32,E:33,F:34,G:35,H:36,I:37,J:38,K:39,L:40,M:41,N:42,O:43,P:44,Q:45,R:46,S:47,T:48,U:49,V:50,W:51,X:52,Y:53,Z:54,
  LEFT:21,RIGHT:22,UP:19,DOWN:20
};

function commit(t){if(window.Android) Android.commitText(t);}
function del(){if(window.Android) Android.deleteText();}
function sendKey(code){if(window.Android) Android.sendKey(code);}
function sendKeyMod(code,shift,ctrl,alt){if(window.Android) Android.sendKeyWithModifiers(code,!!shift,!!ctrl,!!alt);}
function sendTextMod(text,shift,ctrl,alt){if(window.Android) Android.sendTextWithModifiers(text,!!shift,!!ctrl,!!alt);}
function moveCursor(dx){if(window.Android) Android.moveCursor(dx);}
function vibrate(){try{if(navigator.vibrate) navigator.vibrate(15)}catch(e){}}

function updateUI(){
  document.getElementById('capsKey')?.classList.toggle('active', isCaps);
  document.querySelectorAll('#shiftKey,#shiftKey2').forEach(k=>k.classList.toggle('active', isShift));
  document.getElementById('ctrlKey')?.classList.toggle('active', isCtrl);
  document.getElementById('altKey')?.classList.toggle('active', isAlt);
  // تحديث الحروف
  const upper = isShift || isCaps;
  document.querySelectorAll('.key[data-key]').forEach(k=>{
    const dk=k.dataset.key;
    if(dk && dk.length===1 && /[a-z]/.test(dk)){
      k.textContent = upper ? dk.toUpperCase() : dk.toLowerCase();
    }
  });
  // تحديث شريط الحالة
  let status=[];
  if(isShift) status.push('SHIFT');
  if(isCtrl) status.push('CTRL');
  if(isAlt) status.push('ALT');
  const hint=document.querySelector('.space-hint');
  if(hint){
    if(status.length>0) hint.textContent=status.join('+')+' • اضغط حرف';
    else hint.textContent='HOLD 400ms • SLIDE • 32% SAVED';
  }
}

keyboard.addEventListener('click',e=>{
  const k=e.target.closest('.key');
  if(!k || k.id==='spaceTrackpad') return;
  const key=k.dataset.key;
  if(!key) return;
  k.classList.add('pressed'); setTimeout(()=>k.classList.remove('pressed'),90);
  vibrate();

  // MODIFIERS
  if(key==='shift'){ isShift=!isShift; updateUI(); return; }
  if(key==='caps'){ isCaps=!isCaps; updateUI(); return; }
  if(key==='ctrl'){ isCtrl=!isCtrl; updateUI(); return; }
  if(key==='alt'){ isAlt=!isAlt; updateUI(); return; }
  if(key==='fn'){
    const now=Date.now();
    if(now-(window.lastFnTap||0)<350){
      isFullTrackpad=!isFullTrackpad;
      overlay.querySelector('.overlay-text').innerHTML=isFullTrackpad?'FULL TRACKPAD<br><small>المس أي مكان</small>':'TRACKPAD ACTIVE';
      if(isFullTrackpad) overlay.classList.add('show'); else overlay.classList.remove('show');
    }
    window.lastFnTap=now;
    return;
  }

  // مفاتيح ويندوز حقيقية
  if(key==='esc'){ sendKeyMod(KC.ESC, isShift, isCtrl, isAlt); clearMods(); return; }
  if(key==='tab'){ sendKeyMod(KC.TAB, isShift, isCtrl, isAlt); clearMods(); return; }
  if(key==='enter'){ sendKeyMod(KC.ENTER, isShift, isCtrl, isAlt); clearMods(); return; }
  if(key==='Backspace'){ del(); clearModsIfNotSticky(); return; }
  
  if(/^F\d+$/.test(key)){
    const code=KC[key];
    if(code){
      // Alt+F4 حقيقي يقفل التطبيق!
      sendKeyMod(code, isShift, isCtrl, isAlt);
      clearMods();
    }
    return;
  }
  if(key==='arrowleft'){ sendKeyMod(KC.LEFT, isShift, isCtrl, isAlt); return; }
  if(key==='arrowright'){ sendKeyMod(KC.RIGHT, isShift, isCtrl, isAlt); return; }
  if(key==='arrowupdown'){ sendKeyMod(KC.UP, isShift, isCtrl, isAlt); return; }

  // حروف مع Ctrl/Alt زي ويندوز: Ctrl+C نسخ، Ctrl+V لصق
  if(key.length===1){
    if(isCtrl || isAlt){
      // ابعت كـ KeyEvent حقيقي
      const upper=key.toUpperCase();
      const code=KC[upper]||0;
      if(code){
        sendKeyMod(code, isShift, isCtrl, isAlt);
      } else {
        sendTextMod(key, isShift, isCtrl, isAlt);
      }
    } else {
      let out=key;
      if(/[a-z]/.test(out)){
        out = (isShift||isCaps) ? out.toUpperCase() : out.toLowerCase();
      } else if(isShift){
        // رموز الشيفت: 1->!, 2->@ إلخ
        const shiftMap={'1':'!','2':'@','3':'#','4':'$','5':'%','6':'^','7':'&','8':'*','9':'(','0':')','-':'_','=':'+','`':'~','[':'{',']':'}','\\':'|',';':':',"'":'"',',':'<','.':'>','/':'?'};
        out = shiftMap[out]||out;
      }
      commit(out);
    }
    clearModsIfNotSticky();
    return;
  }
  // رموز
  commit(key);
  clearModsIfNotSticky();
});

function clearMods(){ isShift=false; isCtrl=false; isAlt=false; updateUI(); }
function clearModsIfNotSticky(){
  // Shift يطفي بعد حرف واحد زي ويندوز، Ctrl/Alt يفضلوا لحد ما تدوس تاني
  if(isShift){ isShift=false; updateUI(); }
}

function activateTrackpad(){ if(isTrackpadActive) return; isTrackpadActive=true; spaceTrackpad.classList.add('track-active'); overlay.classList.add('show'); vibrate(); }
function deactivateTrackpad(){ if(!isTrackpadActive) return; isTrackpadActive=false; spaceTrackpad.classList.remove('track-active'); if(!isFullTrackpad) overlay.classList.remove('show'); trackDot.style.left='50%'; }
function onStart(x,y){ startX=lastX=lastMoveX=x; startY=y; clearTimeout(holdTimer); holdTimer=setTimeout(()=>activateTrackpad(),400); }
function onMove(x){
  if(!isTrackpadActive){ if(Math.abs(x-startX)>10) clearTimeout(holdTimer); return; }
  const dx=x-lastMoveX;
  if(Math.abs(dx)>8){ if(dx>0) moveCursor(1); else moveCursor(-1); lastMoveX=x; const rect=spaceTrackpad.getBoundingClientRect(); let pct=((x-rect.left)/rect.width)*100; pct=Math.max(5,Math.min(95,pct)); trackDot.style.left=pct+'%'; }
}
function onEnd(x,y){
  clearTimeout(holdTimer);
  if(isTrackpadActive){ deactivateTrackpad(); } else { if(Math.abs(x-startX)<10 && Math.abs(y-startY)<10){ commit(' '); } }
}
spaceTrackpad.addEventListener('touchstart',e=>{ e.preventDefault(); const t=e.touches[0]; onStart(t.clientX,t.clientY); },{passive:false});
spaceTrackpad.addEventListener('touchmove',e=>{ e.preventDefault(); onMove(e.touches[0].clientX); },{passive:false});
spaceTrackpad.addEventListener('touchend',e=>{ e.preventDefault(); const t=e.changedTouches[0]; onEnd(t.clientX,t.clientY); },{passive:false});
spaceTrackpad.addEventListener('pointerdown',e=>{ onStart(e.clientX,e.clientY); spaceTrackpad.setPointerCapture(e.pointerId); });
spaceTrackpad.addEventListener('pointermove',e=>{ onMove(e.clientX); });
spaceTrackpad.addEventListener('pointerup',e=>{ onEnd(e.clientX,e.clientY); });
overlay.addEventListener('click',()=>{ if(isTrackpadActive) deactivateTrackpad(); if(isFullTrackpad){ isFullTrackpad=false; overlay.classList.remove('show'); } });
overlay.addEventListener('touchmove',e=>{
  e.preventDefault();
  if(isFullTrackpad){ const t=e.touches[0]; const dx=t.clientX-lastMoveX; if(Math.abs(dx)>10){ if(dx>0) moveCursor(1); else moveCursor(-1); lastMoveX=t.clientX; } }
},{passive:false});

updateUI();
console.log('Rapoo v1.5 WINDOWS-LIKE loaded - F1-F12 real keys, Ctrl/Alt/Shift like Windows');
