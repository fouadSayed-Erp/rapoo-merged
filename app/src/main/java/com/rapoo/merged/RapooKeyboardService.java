package com.rapoo.merged;
import android.inputmethodservice.InputMethodService;
import android.view.View;
import android.view.inputmethod.InputConnection;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.webkit.WebSettings;
public class RapooKeyboardService extends InputMethodService {
    private WebView webView;
    @Override public View onCreateInputView() {
        webView = new WebView(this);
        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(true);
        webView.addJavascriptInterface(new WebAppInterface(), "Android");
        webView.loadUrl("file:///android_asset/index.html");
        return webView;
    }
    public class WebAppInterface {
        @JavascriptInterface public void commitText(String text) {
            InputConnection ic = getCurrentInputConnection();
            if (ic != null) ic.commitText(text, 1);
        }
        @JavascriptInterface public void deleteText() {
            InputConnection ic = getCurrentInputConnection();
            if (ic != null) ic.deleteSurroundingText(1, 0);
        }
        @JavascriptInterface public void moveCursor(int dir) {
            InputConnection ic = getCurrentInputConnection();
            if (ic != null) {
                // dir -1 left, 1 right - يستخدم للتراك باد المدمج
                if (dir < 0) ic.deleteSurroundingText(0, 0);
                // حركة المؤشر تتم عبر الـ JS في الـ WebView
            }
        }
    }
    @Override public void onDestroy() { super.onDestroy(); if (webView != null) webView.destroy(); }
}
