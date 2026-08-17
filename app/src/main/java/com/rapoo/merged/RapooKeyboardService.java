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
import android.database.Cursor;
import android.net.Uri;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.ArrayList;
public class RapooKeyboardService extends InputMethodService {
    private WebView webView;
    SharedPreferences prefs;
    private SpeechRecognizer speechRecognizer;
    private boolean isListening = false;
    @Override public void onCreate(){ 
        super.onCreate(); 
        prefs=getSharedPreferences("rapoo_settings",MODE_PRIVATE);
        try{
            if(SpeechRecognizer.isRecognitionAvailable(this)){
                speechRecognizer = SpeechRecognizer.createSpeechRecognizer(this);
                speechRecognizer.setRecognitionListener(new RecognitionListener(){
                    @Override public void onReadyForSpeech(Bundle params){
                        try{ webView.post(()-> webView.evaluateJavascript("window.voiceReady()",null)); }catch(Exception e){}
                    }
                    @Override public void onBeginningOfSpeech(){
                        try{ webView.post(()-> webView.evaluateJavascript("window.voiceBegin()",null)); }catch(Exception e){}
                    }
                    @Override public void onRmsChanged(float rmsdB){}
                    @Override public void onBufferReceived(byte[] buffer){}
                    @Override public void onEndOfSpeech(){
                        try{ webView.post(()-> webView.evaluateJavascript("window.voiceEnd()",null)); }catch(Exception e){}
                    }
                    @Override public void onError(int error){ 
                        isListening=false; 
                        try{ webView.post(()-> webView.evaluateJavascript("window.voiceError("+error+")",null)); }catch(Exception e){} 
                    }
                    @Override public void onResults(Bundle results){
                        isListening=false;
                        try{
                            ArrayList<String> matches = results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                            if(matches!=null && !matches.isEmpty()){
                                String text = matches.get(0);
                                InputConnection ic = getCurrentInputConnection();
                                if(ic!=null) ic.commitText(text+" ",1);
                                String safe = text.replace("'","").replace("\"","").replace("\n"," ");
                                try{ webView.post(()-> webView.evaluateJavascript("window.voiceResult('"+safe+"')",null)); }catch(Exception e){}
                            } else {
                                try{ webView.post(()-> webView.evaluateJavascript("window.voiceNoResult()",null)); }catch(Exception e){}
                            }
                        }catch(Exception e){
                            try{ webView.post(()-> webView.evaluateJavascript("window.voiceError(-1)",null)); }catch(Exception ex){}
                        }
                    }
                    @Override public void onPartialResults(Bundle partialResults){
                        try{
                            ArrayList<String> matches = partialResults.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                            if(matches!=null && !matches.isEmpty()){
                                String text = matches.get(0);
                                String safe = text.replace("'","").replace("\"","").replace("\n"," ");
                                try{ webView.post(()-> webView.evaluateJavascript("window.voicePartial('"+safe+"')",null)); }catch(Exception e){}
                            }
                        }catch(Exception e){}
                    }
                    @Override public void onEvent(int eventType, Bundle params){}
                });
            }
        }catch(Exception e){}
    }
    @Override
    public View onCreateInputView(){
        int h=(int)(420*getResources().getDisplayMetrics().density);
        LinearLayout c=new LinearLayout(this); c.setOrientation(LinearLayout.VERTICAL); c.setBackgroundColor(Color.parseColor("#15181a"));
        webView=new WebView(this); webView.setBackgroundColor(Color.TRANSPARENT);
        WebSettings s=webView.getSettings(); s.setJavaScriptEnabled(true); s.setDomStorageEnabled(true); s.setAllowFileAccess(true); s.setAllowFileAccessFromFileURLs(true); s.setAllowUniversalAccessFromFileURLs(true); s.setLoadWithOverviewMode(true); s.setUseWideViewPort(true); s.setCacheMode(WebSettings.LOAD_NO_CACHE);
        webView.addJavascriptInterface(new WebAppInterface(),"Android");
        webView.loadUrl("file:///android_asset/index.html");
        LinearLayout.LayoutParams p=new LinearLayout.LayoutParams(-1,h);
        c.addView(webView,p);
        return c;
    }
    public class WebAppInterface{
        @JavascriptInterface public void commitText(String t){ InputConnection ic=getCurrentInputConnection(); if(ic!=null) ic.commitText(t,1); }
        @JavascriptInterface public void deleteText(){ 
            try{
                InputConnection ic=getCurrentInputConnection(); 
                if(ic==null) return;
                ic.sendKeyEvent(new KeyEvent(KeyEvent.ACTION_DOWN, KeyEvent.KEYCODE_DEL));
                ic.sendKeyEvent(new KeyEvent(KeyEvent.ACTION_UP, KeyEvent.KEYCODE_DEL));
            }catch(Exception e){}
        }
        @JavascriptInterface public void deleteN(int n){ 
            try{ 
                InputConnection ic=getCurrentInputConnection(); 
                if(ic==null) return;
                if(n<=0) n=1; if(n>15) n=15;
                for(int i=0;i<n;i++){
                    ic.sendKeyEvent(new KeyEvent(KeyEvent.ACTION_DOWN, KeyEvent.KEYCODE_DEL));
                    ic.sendKeyEvent(new KeyEvent(KeyEvent.ACTION_UP, KeyEvent.KEYCODE_DEL));
                }
            }catch(Exception e){} 
        }
        @JavascriptInterface public void sendKey(int keyCode){
            try{
                InputConnection ic=getCurrentInputConnection();
                if(ic==null) return;
                ic.sendKeyEvent(new KeyEvent(KeyEvent.ACTION_DOWN, keyCode));
                ic.sendKeyEvent(new KeyEvent(KeyEvent.ACTION_UP, keyCode));
            }catch(Exception e){}
        }
        @JavascriptInterface public void sendKeyWithModifiers(int c,boolean s,boolean ctrl,boolean alt){ 
            try{
                InputConnection ic=getCurrentInputConnection(); 
                if(ic==null) return; 
                int m=0; 
                if(s) m|=KeyEvent.META_SHIFT_ON; 
                if(ctrl) m|=KeyEvent.META_CTRL_ON; 
                if(alt) m|=KeyEvent.META_ALT_ON;
                ic.sendKeyEvent(new KeyEvent(0,0,KeyEvent.ACTION_DOWN,c,0,m)); 
                ic.sendKeyEvent(new KeyEvent(0,0,KeyEvent.ACTION_UP,c,0,m));
            }catch(Exception e){}
        }
        @JavascriptInterface public void moveCursor(int dx){ 
            try{ 
                InputConnection ic=getCurrentInputConnection(); 
                if(ic==null) return;
                if(dx>0){
                    ic.sendKeyEvent(new KeyEvent(KeyEvent.ACTION_DOWN, KeyEvent.KEYCODE_DPAD_RIGHT));
                    ic.sendKeyEvent(new KeyEvent(KeyEvent.ACTION_UP, KeyEvent.KEYCODE_DPAD_RIGHT));
                } else {
                    ic.sendKeyEvent(new KeyEvent(KeyEvent.ACTION_DOWN, KeyEvent.KEYCODE_DPAD_LEFT));
                    ic.sendKeyEvent(new KeyEvent(KeyEvent.ACTION_UP, KeyEvent.KEYCODE_DPAD_LEFT));
                }
            }catch(Exception e){}
        }
        @JavascriptInterface public void saveSetting(String k,String v){ prefs.edit().putString(k,v).apply(); }
        @JavascriptInterface public String getSetting(String k,String d){ return prefs.getString(k,d); }
        @JavascriptInterface public int getBatteryLevel(){ 
            try{ 
                IntentFilter ifilter = new IntentFilter(Intent.ACTION_BATTERY_CHANGED); 
                Intent batteryStatus = registerReceiver(null, ifilter); 
                if(batteryStatus==null) return 73; 
                int level = batteryStatus.getIntExtra(BatteryManager.EXTRA_LEVEL, -1); 
                int scale = batteryStatus.getIntExtra(BatteryManager.EXTRA_SCALE, -1); 
                int plugged = batteryStatus.getIntExtra(BatteryManager.EXTRA_PLUGGED, -1);
                boolean isCharging = plugged==BatteryManager.BATTERY_PLUGGED_AC || plugged==BatteryManager.BATTERY_PLUGGED_USB || plugged==BatteryManager.BATTERY_PLUGGED_WIRELESS;
                int pct = (int)((level / (float)scale) * 100);
                // save charging state
                prefs.edit().putBoolean("isCharging", isCharging).apply();
                return pct;
            }catch(Exception e){ return 73; } 
        }
        @JavascriptInterface public boolean isCharging(){
            try{
                IntentFilter ifilter = new IntentFilter(Intent.ACTION_BATTERY_CHANGED); 
                Intent batteryStatus = registerReceiver(null, ifilter); 
                if(batteryStatus==null) return false;
                int plugged = batteryStatus.getIntExtra(BatteryManager.EXTRA_PLUGGED, -1);
                return plugged==BatteryManager.BATTERY_PLUGGED_AC || plugged==BatteryManager.BATTERY_PLUGGED_USB || plugged==BatteryManager.BATTERY_PLUGGED_WIRELESS;
            }catch(Exception e){ return false; }
        }
        @JavascriptInterface public String getTime(){ 
            try{ 
                SimpleDateFormat sdf = new SimpleDateFormat("h:mm a", new Locale("en")); 
                return sdf.format(new Date()); 
            }catch(Exception e){ 
                try{
                    SimpleDateFormat sdf2 = new SimpleDateFormat("HH:mm", Locale.getDefault());
                    return sdf2.format(new Date());
                }catch(Exception ex){ return "12:41 PM"; }
            } 
        }
        @JavascriptInterface public String getTime24(){ 
            try{ 
                SimpleDateFormat sdf = new SimpleDateFormat("HH:mm", Locale.getDefault()); 
                return sdf.format(new Date()); 
            }catch(Exception e){ return "12:41"; } 
        }
        // رسائل فعلية - عدد غير مقروءة
        @JavascriptInterface public int getUnreadMessages(){
            try{
                Uri uri = Uri.parse("content://sms/inbox");
                Cursor c = getContentResolver().query(uri, new String[]{"_id"}, "read=0", null, null);
                if(c==null) return 0;
                int count = c.getCount();
                c.close();
                return count;
            }catch(Exception e){
                // بدون صلاحية READ_SMS
                return -1;
            }
        }
        @JavascriptInterface public String getLastMessage(){
            try{
                Uri uri = Uri.parse("content://sms/inbox");
                Cursor c = getContentResolver().query(uri, new String[]{"body"}, null, null, "date DESC LIMIT 1");
                if(c==null) return "";
                if(c.moveToFirst()){
                    String body = c.getString(0);
                    c.close();
                    if(body.length()>20) body=body.substring(0,20)+"...";
                    return body;
                }
                c.close();
                return "";
            }catch(Exception e){ return ""; }
        }
        @JavascriptInterface public void startVoiceInput(){ 
            try{ 
                if(speechRecognizer!=null && !isListening){ 
                    isListening=true; 
                    Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH); 
                    intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM); 
                    intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, "ar-EG");
                    intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, "ar-EG");
                    intent.putExtra(RecognizerIntent.EXTRA_CALLING_PACKAGE, getPackageName());
                    intent.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true);
                    intent.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 3);
                    speechRecognizer.startListening(intent); 
                } 
            }catch(Exception e){ isListening=false; try{ webView.post(()-> webView.evaluateJavascript("window.voiceError(-2)",null)); }catch(Exception ex){} } 
        }
        @JavascriptInterface public void stopVoiceInput(){ try{ if(speechRecognizer!=null && isListening){ speechRecognizer.stopListening(); isListening=false; } }catch(Exception e){ isListening=false; } }
        @JavascriptInterface public String getClipboardText(){ try{ ClipboardManager cm = (ClipboardManager)getSystemService(Context.CLIPBOARD_SERVICE); if(cm!=null && cm.hasPrimaryClip()){ ClipData.Item item = cm.getPrimaryClip().getItemAt(0); if(item!=null && item.getText()!=null) return item.getText().toString(); } }catch(Exception e){} return ""; }
        @JavascriptInterface public void copyToClipboard(String text){ try{ ClipboardManager cm = (ClipboardManager)getSystemService(Context.CLIPBOARD_SERVICE); if(cm!=null){ ClipData clip = ClipData.newPlainText("rapoo", text); cm.setPrimaryClip(clip); } }catch(Exception e){} }
    }
    @Override public void onDestroy(){ super.onDestroy(); try{ if(speechRecognizer!=null){ speechRecognizer.destroy(); speechRecognizer=null; } }catch(Exception e){} if(webView!=null){ webView.destroy(); webView=null; } }
}
