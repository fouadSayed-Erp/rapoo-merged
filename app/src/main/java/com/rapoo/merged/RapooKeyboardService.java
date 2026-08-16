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
public class RapooKeyboardService extends InputMethodService {
    private WebView webView;
    @Override
    public View onCreateInputView() {
        int heightPx = (int)(270 * getResources().getDisplayMetrics().density);
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
        @JavascriptInterface
        public void sendTab() {
            InputConnection ic = getCurrentInputConnection();
            if (ic != null) ic.commitText("\t", 1);
        }
        @JavascriptInterface
        public void sendEnter() {
            InputConnection ic = getCurrentInputConnection();
            if (ic != null) ic.sendKeyEvent(new KeyEvent(KeyEvent.ACTION_DOWN, KeyEvent.KEYCODE_ENTER));
        }
        @JavascriptInterface
        public void moveCursor(int dx) {
            try {
                InputConnection ic = getCurrentInputConnection();
                if (ic == null) return;
                ExtractedTextRequest req = new ExtractedTextRequest();
                req.token = 0;
                ExtractedText et = ic.getExtractedText(req, 0);
                if (et == null) return;
                int start = et.selectionStart;
                int end = et.selectionEnd;
                int newPos = start + dx;
                if (newPos < 0) newPos = 0;
                if (newPos > et.text.length()) newPos = et.text.length();
                ic.setSelection(newPos, newPos);
            } catch (Exception e) {}
        }
        @JavascriptInterface
        public void sendArrow(String dir) {
            InputConnection ic = getCurrentInputConnection();
            if (ic == null) return;
            int code = KeyEvent.KEYCODE_DPAD_RIGHT;
            if (dir.equals("left")) code = KeyEvent.KEYCODE_DPAD_LEFT;
            else if (dir.equals("up")) code = KeyEvent.KEYCODE_DPAD_UP;
            else if (dir.equals("down")) code = KeyEvent.KEYCODE_DPAD_DOWN;
            ic.sendKeyEvent(new KeyEvent(KeyEvent.ACTION_DOWN, code));
            ic.sendKeyEvent(new KeyEvent(KeyEvent.ACTION_UP, code));
        }
    }
    @Override
    public void onDestroy() {
        super.onDestroy();
        if (webView != null) { webView.destroy(); webView = null; }
    }
}
