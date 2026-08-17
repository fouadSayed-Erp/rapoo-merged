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
    @Override public void onCreate(){ super.onCreate(); prefs=getSharedPreferences("rapoo_settings",MODE_PRIVATE); }
    @Override
    public View onCreateInputView(){
        int h=(int)(325*getResources().getDisplayMetrics().density);
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
        @JavascriptInterface public void moveCursor(int dx){ try{ InputConnection ic=getCurrentInputConnection(); if(ic==null) return; ExtractedTextRequest r=new ExtractedTextRequest(); r.token=0; ExtractedText et=ic.getExtractedText(r,0); if(et==null) return; int p=et.selectionStart+dx; if(p<0) p=0; if(p>et.text.length()) p=et.text.length(); ic.setSelection(p,p);}catch(Exception e){} }
        @JavascriptInterface public void saveSetting(String k,String v){ prefs.edit().putString(k,v).apply(); }
        @JavascriptInterface public String getSetting(String k,String d){ return prefs.getString(k,d); }
    }
    @Override public void onDestroy(){ super.onDestroy(); if(webView!=null){ webView.destroy(); webView=null; } }
}
