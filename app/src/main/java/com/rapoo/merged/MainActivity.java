package com.rapoo.merged;
import android.app.Activity;
import android.os.Bundle;
import android.widget.*;
import android.content.Intent;
import android.provider.Settings;
import android.view.View;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.view.Gravity;
public class MainActivity extends Activity {
    SharedPreferences prefs;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        prefs = getSharedPreferences("rapoo_settings", MODE_PRIVATE);
        
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(Color.parseColor("#0f0f12"));
        root.setPadding(30,60,30,30);
        
        TextView title = new TextView(this);
        title.setText("RAPOO • MERGED v2.0 ULTIMATE");
        title.setTextColor(Color.parseColor("#8b5cf6"));
        title.setTextSize(18);
        title.setGravity(Gravity.CENTER);
        title.setPadding(0,0,0,30);
        
        TextView sub = new TextView(this);
        sub.setText("32% SAVED • RGB • MECHANICAL • LANGUAGES");
        sub.setTextColor(Color.parseColor("#6b7280"));
        sub.setTextSize(11);
        sub.setGravity(Gravity.CENTER);
        sub.setPadding(0,0,0,30);
        
        // Buttons
        Button btnEnable = createBtn("1- تفعيل الكيبورد", "#8b5cf6");
        Button btnPick = createBtn("2- اختيار كيبورد أساسي", "#3a3e41");
        Button btnLang = createBtn("🌐 اللغة: " + prefs.getString("language","en"), "#1f2937");
        Button btnTheme = createBtn("🎨 الثيم: " + prefs.getString("theme","dark"), "#1f2937");
        Button btnSound = createBtn("🔊 الصوت الميكانيكي: " + (prefs.getBoolean("sound_enabled",true)?"مفعل":"مطفي"), "#1f2937");
        Button btnRGB = createBtn("🌈 RGB: " + (prefs.getBoolean("rgb_enabled",true)?"مفعل":"مطفي"), "#1f2937");
        
        btnEnable.setOnClickListener(v->{
            startActivity(new Intent(Settings.ACTION_INPUT_METHOD_SETTINGS));
            Toast.makeText(this,"فعل Rapoo Merged v2.0",Toast.LENGTH_LONG).show();
        });
        btnPick.setOnClickListener(v->{
            android.view.inputmethod.InputMethodManager imm = (android.view.inputmethod.InputMethodManager)getSystemService(INPUT_METHOD_SERVICE);
            if(imm!=null) imm.showInputMethodPicker();
        });
        btnLang.setOnClickListener(v->{
            String[] langs = {"en","ar","fr","de"};
            String cur = prefs.getString("language","en");
            int idx = java.util.Arrays.asList(langs).indexOf(cur);
            String next = langs[(idx+1)%langs.length];
            prefs.edit().putString("language",next).apply();
            btnLang.setText("🌐 اللغة: "+next);
            Toast.makeText(this,"اللغة: "+next+" - افتح الكيبورد",Toast.LENGTH_SHORT).show();
        });
        btnTheme.setOnClickListener(v->{
            String[] themes = {"dark","light","neon","rgb_wave","amoled","rapoo_purple"};
            String cur = prefs.getString("theme","dark");
            int idx = java.util.Arrays.asList(themes).indexOf(cur);
            String next = themes[(idx+1)%themes.length];
            prefs.edit().putString("theme",next).apply();
            btnTheme.setText("🎨 الثيم: "+next);
            Toast.makeText(this,"الثيم: "+next,Toast.LENGTH_SHORT).show();
        });
        btnSound.setOnClickListener(v->{
            boolean cur = prefs.getBoolean("sound_enabled",true);
            prefs.edit().putBoolean("sound_enabled",!cur).apply();
            btnSound.setText("🔊 الصوت الميكانيكي: "+(!cur?"مفعل":"مطفي"));
        });
        btnRGB.setOnClickListener(v->{
            boolean cur = prefs.getBoolean("rgb_enabled",true);
            prefs.edit().putBoolean("rgb_enabled",!cur).apply();
            btnRGB.setText("🌈 RGB: "+(!cur?"مفعل":"مطفي"));
        });
        
        root.addView(title);
        root.addView(sub);
        root.addView(btnEnable);
        root.addView(btnPick);
        root.addView(createSpace(20));
        root.addView(btnLang);
        root.addView(btnTheme);
        root.addView(btnSound);
        root.addView(btnRGB);
        root.addView(createSpace(20));
        
        TextView info = new TextView(this);
        info.setText("v2.0 الجديد:\n• اضغط 🌐 في الكيبورد للغة\n• اضغط 🎨 للثيمات\n• الصوت الميكانيكي يتفاعل مع كل دوسة\n• RGB Wave يتفاعل مع الكتابة\n• Alt+F4 و Ctrl+C زي ويندوز");
        info.setTextColor(Color.parseColor("#9ca3af"));
        info.setTextSize(12);
        info.setLineSpacing(4,1);
        
        root.addView(info);
        
        ScrollView scroll = new ScrollView(this);
        scroll.addView(root);
        setContentView(scroll);
    }
    Button createBtn(String txt, String color){
        Button b = new Button(this);
        b.setText(txt);
        b.setBackgroundColor(Color.parseColor(color));
        b.setTextColor(Color.WHITE);
        LinearLayout.LayoutParams p = new LinearLayout.LayoutParams(-1,140);
        p.setMargins(0,10,0,10);
        b.setLayoutParams(p);
        return b;
    }
    View createSpace(int h){
        View v = new View(this);
        v.setLayoutParams(new LinearLayout.LayoutParams(-1,h));
        return v;
    }
}
