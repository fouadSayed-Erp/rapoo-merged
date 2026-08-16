package com.rapoo.merged;
import android.inputmethodservice.InputMethodService;
import android.view.View;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.view.inputmethod.InputConnection;
import android.widget.LinearLayout;
import android.graphics.Color;
public class RapooKeyboardService extends InputMethodService {
    private WebView webView;
    @Override
    public View onCreateInputView() {
        // ارتفاع ثابت 260dp عشان الكيبورد يظهر
        int heightPx = (int)(260 * getResources().getDisplayMetrics().density);
        
        LinearLayout container = new LinearLayout(this);
        container.setOrientation(LinearLayout.VERTICAL);
        container.setBackgroundColor(Color.parseColor("#2f3336"));
        
        webView = new WebView(this);
        webView.setBackgroundColor(Color.parseColor("#2f3336"));
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
        
        LinearLayout.LayoutParams webParams = new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            heightPx
        );
        container.addView(webView, webParams);
        
        return container;
    }
    
    public class WebAppInterface {
        @JavascriptInterface
        public void commitText(String text) {
            InputConnection ic = getCurrentInputConnection();
            if (ic != null) ic.commitText(text, 1);
        }
        @JavascriptInterface
        public void deleteText() {
            InputConnection ic = getCurrentInputConnection();
            if (ic != null) ic.deleteSurroundingText(1, 0);
        }
    }
    
    @Override
    public View onCreateCandidatesView() { return null; }
    
    @Override
    public void onDestroy() {
        super.onDestroy();
        if (webView != null) {
            webView.destroy();
            webView = null;
        }
    }
}
