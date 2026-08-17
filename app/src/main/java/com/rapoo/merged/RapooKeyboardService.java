package com.rapoo.merged;
import android.inputmethodservice.InputMethodService;
import android.view.View;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.view.inputmethod.InputConnection;
import android.view.inputmethod.ExtractedText;
import android.view.inputmethod.ExtractedTextRequest;
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
                    @Override public void onReadyForSpeech(Bundle params){}
                    @Override public void onBeginningOfSpeech(){}
                    @Override public void onRmsChanged(float rmsdB){}
                    @Override public void onBufferReceived(byte[] buffer){}
                    @Override public void onEndOfSpeech(){}
                    @Override public void onError(int error){ isListening=false; try{ webView.post(()-> webView.evaluateJavascript("window.voiceEnded('خطأ: "+error+"')",null)); }catch(Exception e){} }
                    @Override public void onResults(Bundle results){
                        isListening=false;
                        try{
                            ArrayList<String> matches = results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                            if(matches!=null && !matches.isEmpty()){
                                String text = matches.get(0);
                                InputConnection ic = getCurrentInputConnection();
                                if(ic!=null) ic.commitText(text+" ",1);
                                try{ webView.post(()-> webView.evaluateJavascript("window.voiceResult('"+text.replace("'","").replace("\"","")+"')",null)); }catch(Exception e){}
                            }
                        }catch(Exception e){}
                    }
                    @Override public void onPartialResults(Bundle partialResults){}
                    @Override public void onEvent(int eventType, Bundle params){}
                });
            }
        }catch(Exception e){}
    }
    @Override
    public View onCreateInputView(){
        int h=(int)(410*getResources().getDisplayMetrics().density);
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
        @JavascriptInterface public void deleteText(){ InputConnection ic=getCurrentInputConnection(); if(ic==null) return; try{ ExtractedTextRequest r=new ExtractedTextRequest(); r.token=0; ExtractedText et=ic.getExtractedText(r,0); if(et!=null&&et.selectionStart!=et.selectionEnd){ ic.commitText("",1); } else { ic.deleteSurroundingText(1,0); } }catch(Exception e){ ic.deleteSurroundingText(1,0); } }
        @JavascriptInterface public void deleteN(int n){ InputConnection ic=getCurrentInputConnection(); if(ic==null) return; try{ ExtractedTextRequest r=new ExtractedTextRequest(); r.token=0; ExtractedText et=ic.getExtractedText(r,0); if(et!=null&&et.selectionStart!=et.selectionEnd){ ic.commitText("",1); } else { if(n>0) ic.deleteSurroundingText(n,0); } }catch(Exception e){ ic.deleteSurroundingText(n>0?n:1,0); } }
        @JavascriptInterface public void sendKeyWithModifiers(int c,boolean s,boolean ctrl,boolean alt){ InputConnection ic=getCurrentInputConnection(); if(ic==null) return; int m=0; if(s) m|=KeyEvent.META_SHIFT_ON; if(ctrl) m|=KeyEvent.META_CTRL_ON; if(alt) m|=KeyEvent.META_ALT_ON; ic.sendKeyEvent(new KeyEvent(0,0,KeyEvent.ACTION_DOWN,c,0,m)); ic.sendKeyEvent(new KeyEvent(0,0,KeyEvent.ACTION_UP,c,0,m)); }
        @JavascriptInterface public void moveCursor(int dx){ try{ InputConnection ic=getCurrentInputConnection(); if(ic==null) return; if(dx>0) ic.sendKeyEvent(new KeyEvent(KeyEvent.ACTION_DOWN, KeyEvent.KEYCODE_DPAD_RIGHT)); else ic.sendKeyEvent(new KeyEvent(KeyEvent.ACTION_DOWN, KeyEvent.KEYCODE_DPAD_LEFT)); }catch(Exception e){ try{ InputConnection ic=getCurrentInputConnection(); if(ic!=null){ ExtractedTextRequest r=new ExtractedTextRequest(); r.token=0; ExtractedText et=ic.getExtractedText(r,0); if(et==null) return; int p=et.selectionStart+dx; if(p<0) p=0; if(p>et.text.length()) p=et.text.length(); ic.setSelection(p,p);} }catch(Exception ex){} } }
        @JavascriptInterface public void saveSetting(String k,String v){ prefs.edit().putString(k,v).apply(); }
        @JavascriptInterface public String getSetting(String k,String d){ return prefs.getString(k,d); }
        @JavascriptInterface public int getBatteryLevel(){ try{ IntentFilter ifilter = new IntentFilter(Intent.ACTION_BATTERY_CHANGED); Intent batteryStatus = registerReceiver(null, ifilter); if(batteryStatus==null) return 73; int level = batteryStatus.getIntExtra(BatteryManager.EXTRA_LEVEL, -1); int scale = batteryStatus.getIntExtra(BatteryManager.EXTRA_SCALE, -1); return (int)((level / (float)scale) * 100); }catch(Exception e){ return 73; } }
        @JavascriptInterface public String getTime(){ try{ SimpleDateFormat sdf = new SimpleDateFormat("h:mm", new Locale("en")); return sdf.format(new Date()); }catch(Exception e){ return "12:41"; } }
        @JavascriptInterface public void startVoiceInput(){
            try{
                if(speechRecognizer!=null && !isListening){
                    isListening=true;
                    Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
                    intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
                    intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, "ar-EG");
                    intent.putExtra(RecognizerIntent.EXTRA_CALLING_PACKAGE, getPackageName());
                    speechRecognizer.startListening(intent);
                } else {
                    Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
                    intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
                    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    startActivity(intent);
                }
            }catch(Exception e){ isListening=false; }
        }
        @JavascriptInterface public void stopVoiceInput(){ try{ if(speechRecognizer!=null && isListening){ speechRecognizer.stopListening(); isListening=false; } }catch(Exception e){ isListening=false; } }
        @JavascriptInterface public String getClipboardText(){ try{ ClipboardManager cm = (ClipboardManager)getSystemService(Context.CLIPBOARD_SERVICE); if(cm!=null && cm.hasPrimaryClip()){ ClipData.Item item = cm.getPrimaryClip().getItemAt(0); if(item!=null && item.getText()!=null) return item.getText().toString(); } }catch(Exception e){} return ""; }
        @JavascriptInterface public void copyToClipboard(String text){ try{ ClipboardManager cm = (ClipboardManager)getSystemService(Context.CLIPBOARD_SERVICE); if(cm!=null){ ClipData clip = ClipData.newPlainText("rapoo", text); cm.setPrimaryClip(clip); } }catch(Exception e){} }
    }
    @Override public void onDestroy(){ super.onDestroy(); try{ if(speechRecognizer!=null){ speechRecognizer.destroy(); speechRecognizer=null; } }catch(Exception e){} if(webView!=null){ webView.destroy(); webView=null; } }
}
