package com.rapoo.merged;
import android.inputmethodservice.InputMethodService;
import android.view.View;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.view.inputmethod.InputConnection;
import android.widget.LinearLayout;
import android.graphics.Color;
import android.view.KeyEvent;
import android.content.SharedPreferences;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.BatteryManager;
import android.speech.SpeechRecognizer;
import android.speech.RecognizerIntent;
import android.speech.RecognitionListener;
import android.os.Bundle;
import android.content.ClipboardManager;
import android.content.ClipData;
import android.content.Context;
import android.content.pm.PackageManager;
import android.database.Cursor;
import android.net.Uri;
import org.json.JSONArray;
import org.json.JSONObject;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.ArrayList;
import androidx.core.content.ContextCompat;
import android.Manifest;
public class RapooKeyboardService extends InputMethodService {
    private WebView webView; SharedPreferences prefs;
    private SpeechRecognizer speechRecognizer; private boolean isListening=false;
    private void createRec(){
        try{
            if(speechRecognizer!=null){ try{ speechRecognizer.destroy(); }catch(Exception e){} speechRecognizer=null; }
            if(SpeechRecognizer.isRecognitionAvailable(this)){
                speechRecognizer=SpeechRecognizer.createSpeechRecognizer(this);
                speechRecognizer.setRecognitionListener(new RecognitionListener(){
                    public void onReadyForSpeech(Bundle p){ try{ webView.post(()-> webView.evaluateJavascript("window.voiceReady()",null)); }catch(Exception e){} }
                    public void onBeginningOfSpeech(){ try{ webView.post(()-> webView.evaluateJavascript("window.voiceBegin()",null)); }catch(Exception e){} }
                    public void onRmsChanged(float r){} public void onBufferReceived(byte[] b){}
                    public void onEndOfSpeech(){ try{ webView.post(()-> webView.evaluateJavascript("window.voiceEnd()",null)); }catch(Exception e){} }
                    public void onError(int err){ isListening=false; try{ webView.post(()-> webView.evaluateJavascript("window.voiceError("+err+")",null)); }catch(Exception e){} try{ if(speechRecognizer!=null){ speechRecognizer.destroy(); speechRecognizer=null; } }catch(Exception e){} if(webView!=null) webView.postDelayed(()-> createRec(),300); }
                    public void onResults(Bundle results){
                        isListening=false;
                        try{
                            ArrayList<String> m=results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                            if(m!=null&&!m.isEmpty()){
                                String t=m.get(0); InputConnection ic=getCurrentInputConnection(); if(ic!=null) ic.commitText(t+" ",1);
                                String safe=t.replace("'","").replace("\"","").replace("\n"," ");
                                try{ webView.post(()-> webView.evaluateJavascript("window.voiceResult('"+safe+"')",null)); }catch(Exception e){}
                            } else { try{ webView.post(()-> webView.evaluateJavascript("window.voiceNoResult()",null)); }catch(Exception e){} }
                        }catch(Exception e){ try{ webView.post(()-> webView.evaluateJavascript("window.voiceError(-1)",null)); }catch(Exception ex){} }
                        try{ if(speechRecognizer!=null){ speechRecognizer.destroy(); speechRecognizer=null; } }catch(Exception e){} if(webView!=null) webView.postDelayed(()-> createRec(),200);
                    }
                    public void onPartialResults(Bundle pr){
                        try{ ArrayList<String> m=pr.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION); if(m!=null&&!m.isEmpty()){ String t=m.get(0); String safe=t.replace("'","").replace("\"","").replace("\n"," "); try{ webView.post(()-> webView.evaluateJavascript("window.voicePartial('"+safe+"')",null)); }catch(Exception e){} } }catch(Exception e){}
                    }
                    public void onEvent(int et, Bundle p){}
                });
            }
        }catch(Exception e){ isListening=false; }
    }
    public void onCreate(){ super.onCreate(); prefs=getSharedPreferences("rapoo_settings",MODE_PRIVATE); createRec(); }
    public View onCreateInputView(){
        int h=(int)(420*getResources().getDisplayMetrics().density);
        LinearLayout c=new LinearLayout(this); c.setOrientation(LinearLayout.VERTICAL); c.setBackgroundColor(Color.parseColor("#15181a"));
        webView=new WebView(this); webView.setBackgroundColor(Color.TRANSPARENT);
        WebSettings s=webView.getSettings(); s.setJavaScriptEnabled(true); s.setDomStorageEnabled(true); s.setAllowFileAccess(true); s.setAllowFileAccessFromFileURLs(true); s.setAllowUniversalAccessFromFileURLs(true); s.setLoadWithOverviewMode(true); s.setUseWideViewPort(true); s.setCacheMode(WebSettings.LOAD_NO_CACHE);
        webView.addJavascriptInterface(new WebAppInterface(),"Android"); webView.loadUrl("file:///android_asset/index.html");
        c.addView(webView,new LinearLayout.LayoutParams(-1,h)); return c;
    }
    public class WebAppInterface{
        @JavascriptInterface public void commitText(String t){ InputConnection ic=getCurrentInputConnection(); if(ic!=null) ic.commitText(t,1); }
        @JavascriptInterface public void deleteText(){ try{ InputConnection ic=getCurrentInputConnection(); if(ic==null) return; ic.sendKeyEvent(new KeyEvent(KeyEvent.ACTION_DOWN,KeyEvent.KEYCODE_DEL)); ic.sendKeyEvent(new KeyEvent(KeyEvent.ACTION_UP,KeyEvent.KEYCODE_DEL)); }catch(Exception e){} }
        @JavascriptInterface public void deleteN(int n){ try{ InputConnection ic=getCurrentInputConnection(); if(ic==null) return; if(n<=0) n=1; if(n>15) n=15; for(int i=0;i<n;i++){ ic.sendKeyEvent(new KeyEvent(KeyEvent.ACTION_DOWN,KeyEvent.KEYCODE_DEL)); ic.sendKeyEvent(new KeyEvent(KeyEvent.ACTION_UP,KeyEvent.KEYCODE_DEL)); } }catch(Exception e){} }
        @JavascriptInterface public void sendKey(int kc){ try{ InputConnection ic=getCurrentInputConnection(); if(ic==null) return; ic.sendKeyEvent(new KeyEvent(KeyEvent.ACTION_DOWN,kc)); ic.sendKeyEvent(new KeyEvent(KeyEvent.ACTION_UP,kc)); }catch(Exception e){} }
        @JavascriptInterface public void moveCursor(int dx){ try{ InputConnection ic=getCurrentInputConnection(); if(ic==null) return; if(dx>0){ ic.sendKeyEvent(new KeyEvent(KeyEvent.ACTION_DOWN,KeyEvent.KEYCODE_DPAD_RIGHT)); ic.sendKeyEvent(new KeyEvent(KeyEvent.ACTION_UP,KeyEvent.KEYCODE_DPAD_RIGHT)); } else { ic.sendKeyEvent(new KeyEvent(KeyEvent.ACTION_DOWN,KeyEvent.KEYCODE_DPAD_LEFT)); ic.sendKeyEvent(new KeyEvent(KeyEvent.ACTION_UP,KeyEvent.KEYCODE_DPAD_LEFT)); } }catch(Exception e){} }
        @JavascriptInterface public void saveSetting(String k,String v){ prefs.edit().putString(k,v).apply(); }
        @JavascriptInterface public String getSetting(String k,String d){ return prefs.getString(k,d); }
        @JavascriptInterface public int getBatteryLevel(){ try{ IntentFilter f=new IntentFilter(Intent.ACTION_BATTERY_CHANGED); Intent b=registerReceiver(null,f); if(b==null) return 73; int l=b.getIntExtra(BatteryManager.EXTRA_LEVEL,-1); int sc=b.getIntExtra(BatteryManager.EXTRA_SCALE,-1); int pl=b.getIntExtra(BatteryManager.EXTRA_PLUGGED,-1); boolean ch=pl==BatteryManager.BATTERY_PLUGGED_AC||pl==BatteryManager.BATTERY_PLUGGED_USB||pl==BatteryManager.BATTERY_PLUGGED_WIRELESS; prefs.edit().putBoolean("isCharging",ch).apply(); return (int)((l/(float)sc)*100); }catch(Exception e){ return 73; } }
        @JavascriptInterface public boolean isCharging(){ try{ IntentFilter f=new IntentFilter(Intent.ACTION_BATTERY_CHANGED); Intent b=registerReceiver(null,f); if(b==null) return false; int pl=b.getIntExtra(BatteryManager.EXTRA_PLUGGED,-1); return pl==BatteryManager.BATTERY_PLUGGED_AC||pl==BatteryManager.BATTERY_PLUGGED_USB||pl==BatteryManager.BATTERY_PLUGGED_WIRELESS; }catch(Exception e){ return false; } }
        @JavascriptInterface public String getTime(){ try{ SimpleDateFormat sdf=new SimpleDateFormat("h:mm a", new Locale("en")); return sdf.format(new Date()); }catch(Exception e){ return "12:41 PM"; } }
        @JavascriptInterface public boolean hasAudioPermission(){ try{ return ContextCompat.checkSelfPermission(getApplicationContext(), Manifest.permission.RECORD_AUDIO)==PackageManager.PERMISSION_GRANTED; }catch(Exception e){ return false; } }
        @JavascriptInterface public boolean hasSmsPermission(){ try{ return ContextCompat.checkSelfPermission(getApplicationContext(), Manifest.permission.READ_SMS)==PackageManager.PERMISSION_GRANTED; }catch(Exception e){ return false; } }
        @JavascriptInterface public void requestPermissions(){
            try{
                Intent intent=new Intent(getApplicationContext(), PermissionActivity.class);
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                startActivity(intent);
            }catch(Exception e){
                try{
                    Intent intent=new Intent(android.provider.Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
                    intent.setData(Uri.parse("package:"+getPackageName()));
                    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    startActivity(intent);
                }catch(Exception ex){}
            }
        }
        @JavascriptInterface public int getUnreadMessages(){
            try{
                if(ContextCompat.checkSelfPermission(getApplicationContext(), Manifest.permission.READ_SMS)!=PackageManager.PERMISSION_GRANTED){ return -1; }
                Uri uri=Uri.parse("content://sms/inbox"); Cursor c=getContentResolver().query(uri,new String[]{"_id"},"read=0",null,null); if(c==null) return 0; int cnt=c.getCount(); c.close(); return cnt;
            }catch(Exception e){ return -1; }
        }
        @JavascriptInterface public int getTotalMessages(){
            try{
                if(ContextCompat.checkSelfPermission(getApplicationContext(), Manifest.permission.READ_SMS)!=PackageManager.PERMISSION_GRANTED){ return -1; }
                Uri uri=Uri.parse("content://sms/inbox"); Cursor c=getContentResolver().query(uri,new String[]{"_id"},null,null,null); if(c==null) return 0; int cnt=c.getCount(); c.close(); return cnt;
            }catch(Exception e){ return -1; }
        }
        @JavascriptInterface public String getMessagesList(){
            try{
                if(ContextCompat.checkSelfPermission(getApplicationContext(), Manifest.permission.READ_SMS)!=PackageManager.PERMISSION_GRANTED){
                    return "PERMISSION_DENIED";
                }
                JSONArray arr=new JSONArray(); Uri uri=Uri.parse("content://sms/inbox");
                Cursor c=getContentResolver().query(uri,new String[]{"address","body","date","read"},null,null,"date DESC LIMIT 8");
                SimpleDateFormat sdf=new SimpleDateFormat("HH:mm", Locale.getDefault());
                if(c!=null){ while(c.moveToNext()){ try{ JSONObject o=new JSONObject(); String ad=c.getString(0); String bo=c.getString(1); long da=c.getLong(2); int re=c.getInt(3); if(ad==null) ad="غير معروف"; if(bo==null) bo=""; if(bo.length()>40) bo=bo.substring(0,40)+"..."; o.put("address",ad); o.put("body",bo); o.put("time",sdf.format(new Date(da))); o.put("read",re); arr.put(o); }catch(Exception ex){} } c.close(); }
                if(arr.length()==0){ JSONObject d1=new JSONObject(); d1.put("address","فؤاد"); d1.put("body","مرحبا كيف حالك - لا توجد رسائل"); d1.put("time","12:30"); d1.put("read",0); arr.put(d1); }
                return arr.toString();
            }catch(Exception e){ return "[]"; }
        }
        @JavascriptInterface public void startVoiceInput(){
            try{
                if(ContextCompat.checkSelfPermission(getApplicationContext(), Manifest.permission.RECORD_AUDIO)!=PackageManager.PERMISSION_GRANTED){
                    try{ webView.post(()-> webView.evaluateJavascript("window.voicePermissionNeeded()",null)); }catch(Exception ex){}
                    requestPermissions();
                    return;
                }
                if(speechRecognizer==null){ createRec(); Thread.sleep(200); }
                if(speechRecognizer!=null && !isListening){
                    isListening=true;
                    Intent intent=new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
                    intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
                    intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, "ar-EG");
                    intent.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true);
                    intent.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 3);
                    speechRecognizer.startListening(intent);
                } else if(speechRecognizer!=null){
                    try{ speechRecognizer.cancel(); }catch(Exception e){} isListening=false;
                    webView.postDelayed(()->{ try{ isListening=true; Intent i2=new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH); i2.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM); i2.putExtra(RecognizerIntent.EXTRA_LANGUAGE, "ar-EG"); i2.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true); speechRecognizer.startListening(i2); }catch(Exception ex){ isListening=false; } },300);
                }
            }catch(Exception e){ isListening=false; if(webView!=null) webView.postDelayed(()-> createRec(),500); }
        }
        @JavascriptInterface public void stopVoiceInput(){ try{ if(speechRecognizer!=null && isListening){ speechRecognizer.stopListening(); isListening=false; } }catch(Exception e){ isListening=false; } }
    }
    public void onDestroy(){ super.onDestroy(); try{ if(speechRecognizer!=null){ speechRecognizer.destroy(); speechRecognizer=null; } }catch(Exception e){} if(webView!=null){ webView.destroy(); webView=null; } }
}
