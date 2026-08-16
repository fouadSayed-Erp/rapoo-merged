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
public class RapooKeyboardService extends InputMethodService {
    private WebView webView;
    SharedPreferences prefs;
    @Override
    public void onCreate() {
        super.onCreate();
        prefs = getSharedPreferences("rapoo_settings", MODE_PRIVATE);
    }
    @Override
    public View onCreateInputView() {
        int heightPx = (int)(285 * getResources().getDisplayMetrics().density);
        LinearLayout container = new LinearLayout(this);
        container.setOrientation(LinearLayout.VERTICAL);
        container.setBackgroundColor(Color.parseColor("#0f0f12"));
        webView = new WebView(this);
        webView.setBackgroundColor(Color.TRANSPARENT);
        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(true);
        s.setAllowFileAccessFromFileURLs(true);
        s.setAllowUniversalAccessFromFileURLs(true);
        s.setLoadWithOverviewMode(true);
        s.setUseWideViewPort(true);
        s.setCacheMode(WebSettings.LOAD_NO_CACHE);
        webView.addJavascriptInterface(new WebAppInterface(), "Android");
        webView.loadUrl("file:///android_asset/index.html");
        LinearLayout.LayoutParams webParams = new LinearLayout.LayoutParams(-1, heightPx);
        container.addView(webView, webParams);
        return container;
    }
    public class WebAppInterface {
        @JavascriptInterface public void commitText(String text) { InputConnection ic=getCurrentInputConnection(); if(ic!=null) ic.commitText(text,1); }
        @JavascriptInterface public void deleteText() { InputConnection ic=getCurrentInputConnection(); if(ic!=null) ic.deleteSurroundingText(1,0); }
        @JavascriptInterface public void sendKey(int code) { InputConnection ic=getCurrentInputConnection(); if(ic==null) return; ic.sendKeyEvent(new KeyEvent(KeyEvent.ACTION_DOWN,code)); ic.sendKeyEvent(new KeyEvent(KeyEvent.ACTION_UP,code)); }
        @JavascriptInterface public void sendKeyWithModifiers(int code,boolean shift,boolean ctrl,boolean alt){ InputConnection ic=getCurrentInputConnection(); if(ic==null) return; int meta=0; if(shift) meta|=KeyEvent.META_SHIFT_ON|KeyEvent.META_SHIFT_LEFT_ON; if(ctrl) meta|=KeyEvent.META_CTRL_ON|KeyEvent.META_CTRL_LEFT_ON; if(alt) meta|=KeyEvent.META_ALT_ON|KeyEvent.META_ALT_LEFT_ON; ic.sendKeyEvent(new KeyEvent(0,0,KeyEvent.ACTION_DOWN,code,0,meta)); ic.sendKeyEvent(new KeyEvent(0,0,KeyEvent.ACTION_UP,code,0,meta)); }
        @JavascriptInterface public void sendTextWithModifiers(String t,boolean s,boolean c,boolean a){ InputConnection ic=getCurrentInputConnection(); if(ic!=null) ic.commitText(t,1); }
        @JavascriptInterface public void moveCursor(int dx){ try{ InputConnection ic=getCurrentInputConnection(); if(ic==null) return; ExtractedTextRequest req=new ExtractedTextRequest(); req.token=0; ExtractedText et=ic.getExtractedText(req,0); if(et==null) return; int p=et.selectionStart+dx; if(p<0) p=0; if(p>et.text.length()) p=et.text.length(); ic.setSelection(p,p);}catch(Exception e){} }
        @JavascriptInterface public void saveSetting(String k,String v){ prefs.edit().putString(k,v).apply(); }
        @JavascriptInterface public String getSetting(String k,String def){ return prefs.getString(k,def); }
    }
    @Override public void onDestroy(){ super.onDestroy(); if(webView!=null){ webView.destroy(); webView=null; } }
}
