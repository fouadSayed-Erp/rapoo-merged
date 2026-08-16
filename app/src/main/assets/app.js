const keyboard=document.getElementById('keyboard'),spaceTrackpad=document.getElementById('spaceTrackpad'),fnKey=document.getElementById('fnKey'),overlay=document.getElementById('overlay'),trackDot=document.getElementById('trackDot'),trackGrid=document.getElementById('trackpadGrid');
let isTrackpadActive=false,isFullTrackpad=false,holdTimer=null,lastX=0,startX=0,startY=0;
for(let i=0;i<48;i++){const d=document.createElement('div');trackGrid.appendChild(d);}
function commit(t){if(window.Android) Android.commitText(t);}
function del(){if(window.Android) Android.deleteText();}
function vibrate(){if(navigator.vibrate) try{navigator.vibrate(20)}catch(e){}}
keyboard.addEventListener('click',e=>{
  const k=e.target.closest('.key');
  if(!k || k.id==='spaceTrackpad' || k.id==='fnKey') return;
  const key=k.dataset.key;
  if(!key) return;
  k.style.transform='scale(0.9)';
  setTimeout(()=>k.style.transform='',80);
  if(key==='Backspace') del();
  else if(key.length===1) commit(key);
});
function activateTrackpad(){
  if(isTrackpadActive) return;
  isTrackpadActive=true;
  spaceTrackpad.classList.add('track-active');
  overlay.classList.add('show');
  overlay.querySelector('.overlay-text').textContent='TRACKPAD ACTIVE - حرك صباعك';
  vibrate();
}
function deactivateTrackpad(){
  if(!isTrackpadActive) return;
  isTrackpadActive=false;
  spaceTrackpad.classList.remove('track-active');
  if(!isFullTrackpad) overlay.classList.remove('show');
  trackDot.style.left='50%';
}
spaceTrackpad.addEventListener('pointerdown',e=>{
  e.preventDefault();
  startX=lastX=e.clientX;
  startY=e.clientY;
  clearTimeout(holdTimer);
  holdTimer=setTimeout(()=>activateTrackpad(),400);
  spaceTrackpad.setPointerCapture(e.pointerId);
});
spaceTrackpad.addEventListener('pointermove',e=>{
  if(!isTrackpadActive){
    if(Math.abs(e.clientX-startX)>8 || Math.abs(e.clientY-startY)>8) clearTimeout(holdTimer);
    return;
  }
  const dx=e.clientX-lastX;
  if(Math.abs(dx)>2){
    lastX=e.clientX;
    const rect=spaceTrackpad.getBoundingClientRect();
    let pct=((e.clientX-rect.left)/rect.width)*100;
    pct=Math.max(5,Math.min(95,pct));
    trackDot.style.left=pct+'%';
  }
});
function endPointer(e){
  clearTimeout(holdTimer);
  if(isTrackpadActive){
    deactivateTrackpad();
  } else {
    if(Math.abs(e.clientX-startX)<8 && Math.abs(e.clientY-startY)<8){
      commit(' ');
    }
  }
}
spaceTrackpad.addEventListener('pointerup',endPointer);
spaceTrackpad.addEventListener('pointercancel',endPointer);
spaceTrackpad.addEventListener('pointerleave',()=>{
  if(!isTrackpadActive) clearTimeout(holdTimer);
});
let lastFnTap=0;
fnKey.addEventListener('click',()=>{
  const now=Date.now();
  if(now-lastFnTap<300){
    isFullTrackpad=!isFullTrackpad;
    if(isFullTrackpad){
      overlay.querySelector('.overlay-text').textContent='FULL KEYBOARD TRACKPAD - المس الكيبورد للتحريك';
      overlay.classList.add('show');
    } else {
      overlay.classList.remove('show');
    }
    vibrate();
  }
  lastFnTap=now;
});
overlay.addEventListener('click',()=>{
  if(isTrackpadActive) deactivateTrackpad();
  if(isFullTrackpad){
    isFullTrackpad=false;
    overlay.classList.remove('show');
  }
});
// منع الـ overlay يعلق
document.addEventListener('touchend',()=>{
  setTimeout(()=>{
    if(isTrackpadActive && !spaceTrackpad.matches(':active')){
      // لو صباعك اتشال برا
    }
  },100);
});
console.log('Rapoo Merged Responsive v1.3 loaded');
