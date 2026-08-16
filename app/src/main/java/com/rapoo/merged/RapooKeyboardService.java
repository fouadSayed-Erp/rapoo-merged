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
        int heightPx = (int)(275 * getResources().getDisplayMetrics().density);
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
            LinearLayout.LayoutParams.MATCH_PARENT, heightPx);
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
        public void sendKey(int keyCode) {
            InputConnection ic = getCurrentInputConnection();
            if (ic == null) return;
            ic.sendKeyEvent(new KeyEvent(KeyEvent.ACTION_DOWN, keyCode));
            ic.sendKeyEvent(new KeyEvent(KeyEvent.ACTION_UP, keyCode));
        }
        @JavascriptInterface
        public void sendKeyWithModifiers(int keyCode, boolean shift, boolean ctrl, boolean alt) {
            InputConnection ic = getCurrentInputConnection();
            if (ic == null) return;
            int meta = 0;
            if (shift) meta |= KeyEvent.META_SHIFT_ON | KeyEvent.META_SHIFT_LEFT_ON;
            if (ctrl) meta |= KeyEvent.META_CTRL_ON | KeyEvent.META_CTRL_LEFT_ON;
            if (alt) meta |= KeyEvent.META_ALT_ON | KeyEvent.META_ALT_LEFT_ON;
            KeyEvent down = new KeyEvent(0, 0, KeyEvent.ACTION_DOWN, keyCode, 0, meta);
            KeyEvent up = new KeyEvent(0, 0, KeyEvent.ACTION_UP, keyCode, 0, meta);
            ic.sendKeyEvent(down);
            ic.sendKeyEvent(up);
        }
        @JavascriptInterface
        public void sendTextWithModifiers(String text, boolean shift, boolean ctrl, boolean alt) {
            // للحروف: لو Ctrl/C ضاغط ابعت كـ KeyEvent مش كـ text عشان يشتغل نسخ/لصق
            InputConnection ic = getCurrentInputConnection();
            if (ic == null) return;
            if (ctrl || alt) {
                // Ctrl+C, Ctrl+V, Ctrl+A, Alt+F4 etc
                int keyCode = 0;
                String lower = text.toLowerCase();
                switch (lower) {
                    case "a": keyCode = KeyEvent.KEYCODE_A; break;
                    case "c": keyCode = KeyEvent.KEYCODE_C; break;
                    case "v": keyCode = KeyEvent.KEYCODE_V; break;
                    case "x": keyCode = KeyEvent.KEYCODE_X; break;
                    case "z": keyCode = KeyEvent.KEYCODE_Z; break;
                    case "f4": keyCode = KeyEvent.KEYCODE_F4; break;
                }
                if (keyCode != 0) {
                    sendKeyWithModifiers(keyCode, shift, ctrl, alt);
                    return;
                }
            }
            // عادي
            ic.commitText(text, 1);
        }
        @JavascriptInterface
        public void moveCursor(int dx) {
            try {
                InputConnection ic = getCurrentInputConnection();
                if (ic == null) return;
                ExtractedTextRequest req = new ExtractedTextRequest(); req.token=0;
                ExtractedText et = ic.getExtractedText(req, 0);
                if (et == null) return;
                int newPos = et.selectionStart + dx;
                if (newPos < 0) newPos = 0;
                if (newPos > et.text.length()) newPos = et.text.length();
                ic.setSelection(newPos, newPos);
            } catch (Exception e) {}
        }
    }
    @Override
    public void onDestroy() {
        super.onDestroy();
        if (webView != null) { webView.destroy(); webView = null; }
    }
}
