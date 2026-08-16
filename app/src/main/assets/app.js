const keyboard=document.getElementById('keyboard'),spaceTrackpad=document.getElementById('spaceTrackpad'),fnKey=document.getElementById('fnKey'),overlay=document.getElementById('overlay'),trackDot=document.getElementById('trackDot'),trackGrid=document.getElementById('trackpadGrid');
let isShift=false,isCaps=false,isAlt=false,isCtrl=false,isTrackpadActive=false,isFullTrackpad=false,holdTimer=null,lastX=0,startX=0,startY=0,lastMoveX=0;
for(let i=0;i<48;i++){const d=document.createElement('div');trackGrid.appendChild(d);}
function commit(t){if(window.Android) Android.commitText(t);}
function del(){if(window.Android) Android.deleteText();}
function sendTab(){if(window.Android) Android.sendTab();}
function sendEnter(){if(window.Android) Android.sendEnter();}
function moveCursor(dx){if(window.Android) Android.moveCursor(dx);}
function sendArrow(dir){if(window.Android) Android.sendArrow(dir);}
function vibrate(){try{if(navigator.vibrate) navigator.vibrate(20)}catch(e){}}
function updateCapsUI(){
  const keys=document.querySelectorAll('.key[data-key]');
  const upper = isShift || isCaps;
  document.getElementById('capsKey')?.classList.toggle('active', isCaps);
  document.querySelectorAll('#shiftKey, #shiftKey2').forEach(k=>k.classList.toggle('active', isShift));
  document.getElementById('ctrlKey')?.classList.toggle('active', isCtrl);
  document.getElementById('altKey')?.classList.toggle('active', isAlt);
  // تغيير شكل الحروف
  keys.forEach(k=>{
    const dk=k.dataset.key;
    if(dk && dk.length===1 && /[a-zA-Z]/.test(dk)){
      k.textContent = upper ? dk.toUpperCase() : dk.toLowerCase();
    }
  });
}
keyboard.addEventListener('click',e=>{
  const k=e.target.closest('.key');
  if(!k) return;
  if(k.id==='spaceTrackpad') return; // handled separately
  const key=k.dataset.key;
  if(!key) return;
  k.classList.add('pressed');
  setTimeout(()=>k.classList.remove('pressed'),100);
  vibrate();
  
  if(key==='shift'){
    isShift=!isShift;
    updateCapsUI();
    return;
  }
  if(key==='caps'){
    isCaps=!isCaps;
    updateCapsUI();
    return;
  }
  if(key==='ctrl'){
    isCtrl=!isCtrl;
    updateCapsUI();
    if(isCtrl) commit('[CTRL]');
    return;
  }
  if(key==='alt'){
    isAlt=!isAlt;
    updateCapsUI();
    return;
  }
  if(key==='Backspace'){ del(); return; }
  if(key==='tab'){ sendTab(); return; }
  if(key==='enter'){ sendEnter(); return; }
  if(key==='esc'){ commit('[ESC]'); return; }
  if(key==='fn'){ 
    const now=Date.now();
    if(now-(window.lastFnTap||0)<350){
      isFullTrackpad=!isFullTrackpad;
      overlay.querySelector('.overlay-text').innerHTML=isFullTrackpad?'FULL KEYBOARD TRACKPAD<br><small style="font-size:10px">المس أي مكان للتحريك</small>':'TRACKPAD ACTIVE';
      if(isFullTrackpad) overlay.classList.add('show'); else overlay.classList.remove('show');
    }
    window.lastFnTap=now;
    return; 
  }
  if(key.startsWith('F') && /^F\d+$/.test(key)){
    commit('['+key+']'); // يكتب [F1] مثلاً
    return;
  }
  if(key==='arrowleft'){ sendArrow('left'); return; }
  if(key==='arrowright'){ sendArrow('right'); return; }
  if(key==='arrowupdown'){ sendArrow('up'); return; }
  if(key==='`'|| key==='-'|| key==='='|| key==='['|| key===']'|| key==='\\'|| key===';'|| key==="'"|| key===','|| key==='.'|| key==='/' ){
    commit(key);
    if(isShift){ isShift=false; updateCapsUI(); }
    return;
  }
  // حروف وأرقام
  let out=key;
  if(out.length===1){
    if(/[a-z]/.test(out)){
      const upper = isShift || isCaps;
      out = upper ? out.toUpperCase() : out.toLowerCase();
    }
    commit(out);
    if(isShift){ isShift=false; updateCapsUI(); }
  } else {
    commit(out);
  }
});

// SPACE / TRACKPAD - touch + pointer
function activateTrackpad(){
  if(isTrackpadActive) return;
  isTrackpadActive=true;
  spaceTrackpad.classList.add('track-active');
  overlay.classList.add('show');
  vibrate();
}
function deactivateTrackpad(){
  if(!isTrackpadActive) return;
  isTrackpadActive=false;
  spaceTrackpad.classList.remove('track-active');
  if(!isFullTrackpad) overlay.classList.remove('show');
  trackDot.style.left='50%';
}

function onStart(x,y){
  startX=lastX=lastMoveX=x;
  startY=y;
  clearTimeout(holdTimer);
  holdTimer=setTimeout(()=>activateTrackpad(),400);
}
function onMove(x){
  if(!isTrackpadActive){
    if(Math.abs(x-startX)>10) clearTimeout(holdTimer);
    return;
  }
  const dx=x-lastMoveX;
  if(Math.abs(dx)>8){
    if(dx>0) moveCursor(1);
    else moveCursor(-1);
    lastMoveX=x;
    // تحريك النقطة
    const rect=spaceTrackpad.getBoundingClientRect();
    let pct=((x-rect.left)/rect.width)*100;
    pct=Math.max(5,Math.min(95,pct));
    trackDot.style.left=pct+'%';
  }
}
function onEnd(x,y){
  clearTimeout(holdTimer);
  if(isTrackpadActive){
    deactivateTrackpad();
  } else {
    if(Math.abs(x-startX)<10 && Math.abs(y-startY)<10){
      commit(' ');
    }
  }
}

// Touch events (أهم للموبايل)
spaceTrackpad.addEventListener('touchstart',e=>{
  e.preventDefault();
  const t=e.touches[0];
  onStart(t.clientX,t.clientY);
},{passive:false});
spaceTrackpad.addEventListener('touchmove',e=>{
  e.preventDefault();
  const t=e.touches[0];
  onMove(t.clientX);
},{passive:false});
spaceTrackpad.addEventListener('touchend',e=>{
  e.preventDefault();
  const t=e.changedTouches[0];
  onEnd(t.clientX,t.clientY);
},{passive:false});

// Pointer events كـ backup
spaceTrackpad.addEventListener('pointerdown',e=>{ onStart(e.clientX,e.clientY); spaceTrackpad.setPointerCapture(e.pointerId); });
spaceTrackpad.addEventListener('pointermove',e=>{ onMove(e.clientX); });
spaceTrackpad.addEventListener('pointerup',e=>{ onEnd(e.clientX,e.clientY); });
spaceTrackpad.addEventListener('pointercancel',e=>{ clearTimeout(holdTimer); deactivateTrackpad(); });

overlay.addEventListener('click',()=>{
  if(isTrackpadActive) deactivateTrackpad();
  if(isFullTrackpad){ isFullTrackpad=false; overlay.classList.remove('show'); }
});
overlay.addEventListener('touchstart',e=>{
  e.preventDefault();
  if(isFullTrackpad){
    const t=e.touches[0];
    lastMoveX=t.clientX;
  }
});
overlay.addEventListener('touchmove',e=>{
  e.preventDefault();
  if(isFullTrackpad){
    const t=e.touches[0];
    const dx=t.clientX-lastMoveX;
    if(Math.abs(dx)>10){
      if(dx>0) moveCursor(1); else moveCursor(-1);
      lastMoveX=t.clientX;
    }
  }
},{passive:false});

updateCapsUI();
console.log('Rapoo v1.4 ALL KEYS + TRACKPAD loaded');
