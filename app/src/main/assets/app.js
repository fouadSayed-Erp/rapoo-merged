const keyboard=document.getElementById('keyboard'),spaceTrackpad=document.getElementById('spaceTrackpad'),fnKey=document.getElementById('fnKey'),overlay=document.getElementById('overlay'),trackDot=document.getElementById('trackDot'),trackGrid=document.getElementById('trackpadGrid');
let isTrackpadActive=false,isFullTrackpad=false,holdTimer=null,lastX=0,lastY=0,startX=0,startY=0;
for(let i=0;i<48;i++){const d=document.createElement('div');trackGrid.appendChild(d);}
function insertText(t){if(window.Android)Android.commitText(t);}
function deleteChar(){if(window.Android)Android.deleteText();}
function moveCursor(dx){if(window.Android)Android.moveCursor(dx>0?1:-1);}
keyboard.addEventListener('click',e=>{const k=e.target.closest('.key');if(!k||k.id==='spaceTrackpad'||k.id==='fnKey')return;const key=k.dataset.key;if(!key)return;k.classList.add('active');setTimeout(()=>k.classList.remove('active'),100);if(key==='Backspace')deleteChar();else if(key.length===1)insertText(key);});
function activateTrackpad(){isTrackpadActive=true;spaceTrackpad.classList.add('track-active');overlay.classList.add('show');if(navigator.vibrate)navigator.vibrate(30);}
function deactivateTrackpad(){isTrackpadActive=false;spaceTrackpad.classList.remove('track-active');overlay.classList.remove('show');}
spaceTrackpad.addEventListener('pointerdown',e=>{e.preventDefault();startX=lastX=e.clientX;startY=lastY=e.clientY;holdTimer=setTimeout(()=>activateTrackpad(),500);spaceTrackpad.setPointerCapture(e.pointerId);});
spaceTrackpad.addEventListener('pointermove',e=>{if(!isTrackpadActive){if(Math.abs(e.clientX-startX)>10)clearTimeout(holdTimer);return;}const dx=e.clientX-lastX;if(Math.abs(dx)>5)moveCursor(dx);const rect=spaceTrackpad.getBoundingClientRect();trackDot.style.left=Math.max(10,Math.min(90,((e.clientX-rect.left)/rect.width)*100))+'%';trackDot.style.top='50%';lastX=e.clientX;});
spaceTrackpad.addEventListener('pointerup',e=>{clearTimeout(holdTimer);if(isTrackpadActive)deactivateTrackpad();else if(Math.abs(e.clientX-startX)<10)insertText(' ');});
let lastFnTap=0;fnKey.addEventListener('click',()=>{const now=Date.now();if(now-lastFnTap<350){isFullTrackpad=!isFullTrackpad;keyboard.classList.toggle('full-trackpad',isFullTrackpad);overlay.classList.toggle('show',isFullTrackpad);overlay.querySelector('.overlay-text').textContent=isFullTrackpad?'FULL KEYBOARD TRACKPAD':'TRACKPAD ACTIVE';}lastFnTap=now;});
overlay.addEventListener('click',()=>{if(isTrackpadActive)deactivateTrackpad();if(isFullTrackpad){isFullTrackpad=false;keyboard.classList.remove('full-trackpad');overlay.classList.remove('show');}});
