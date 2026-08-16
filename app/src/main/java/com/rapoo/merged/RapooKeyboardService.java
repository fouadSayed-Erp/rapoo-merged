package com.rapoo.merged;
import android.inputmethodservice.InputMethodService;
import android.view.View;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.view.inputmethod.InputConnection;
import android.widget.LinearLayout;
public class RapooKeyboardService extends InputMethodService {
    private WebView webView;
    @Override
    public View onCreateInputView() {
        webView = new WebView(this);
        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(true);
        s.setAllowFileAccessFromFileURLs(true);
        s.setAllowUniversalAccessFromFileURLs(true);
        s.setLoadWithOverviewMode(true);
        s.setUseWideViewPort(true);
        webView.setBackgroundColor(0x00000000);
        webView.addJavascriptInterface(new WebAppInterface(), "Android");
        webView.loadUrl("file:///android_asset/index.html");
        LinearLayout layout = new LinearLayout(this);
        layout.setOrientation(LinearLayout.VERTICAL);
        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            LinearLayout.LayoutParams.WRAP_CONTENT
        );
        layout.addView(webView, params);
        return layout;
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
    public void onDestroy() {
        super.onDestroy();
        if (webView != null) webView.destroy();
    }
}
