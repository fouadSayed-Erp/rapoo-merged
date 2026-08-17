// سيتم دمجه في app.js
window.voicePermissionNeeded = function(){
  isMicListening=false;
  document.querySelectorAll(".key.mic, #micBtn").forEach(k=>k.classList.remove("listening","active"));
  suggestionBar.classList.add("show");
  suggestionBar.innerHTML='<div class="suggestion" style="background:#ef4444;color:#fff;cursor:pointer" onclick="Android.requestPermissions()">🎤 إذن المايك مطلوب - اضغط للسماح</div>';
};
window.smsPermissionNeeded = function(){
  messagesList.innerHTML='<div style="padding:12px;text-align:center"><div style="color:#ef4444;font-size:10px;font-weight:800;margin-bottom:8px">🔒 إذن الرسائل مطلوب</div><div style="font-size:8px;color:#9ca3af;margin-bottom:8px">لعرض الرسائل الفعلية</div><button onclick="Android.requestPermissions()" style="background:#8b5cf6;color:#fff;border:none;padding:6px 12px;border-radius:8px;font-size:9px;font-weight:700">✓ منح الإذن</button></div>';
  messagesPopup.classList.add("show");
};
