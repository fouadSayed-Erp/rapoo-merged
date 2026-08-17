package com.rapoo.merged;
import android.app.Activity;
import android.content.pm.PackageManager;
import android.os.Bundle;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import android.Manifest;
import android.widget.Toast;
import android.content.Intent;
public class PermissionActivity extends Activity {
    private static final int REQ_CODE = 1001;
    public static final String[] PERMISSIONS = {
        Manifest.permission.RECORD_AUDIO,
        Manifest.permission.READ_SMS,
        Manifest.permission.READ_CONTACTS
    };
    @Override protected void onCreate(Bundle savedInstanceState){
        super.onCreate(savedInstanceState);
        checkAndRequest();
    }
    private void checkAndRequest(){
        boolean needRequest = false;
        for(String perm : PERMISSIONS){
            if(ContextCompat.checkSelfPermission(this, perm) != PackageManager.PERMISSION_GRANTED){
                needRequest = true;
                break;
            }
        }
        if(needRequest){
            ActivityCompat.requestPermissions(this, PERMISSIONS, REQ_CODE);
        } else {
            Toast.makeText(this, "✓ كل الأذونات ممنوحة", Toast.LENGTH_SHORT).show();
            finish();
        }
    }
    @Override public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults){
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if(requestCode == REQ_CODE){
            boolean allGranted = true;
            for(int res : grantResults){
                if(res != PackageManager.PERMISSION_GRANTED){ allGranted = false; break; }
            }
            if(allGranted){
                Toast.makeText(this, "✓ تم منح الأذونات - المايك والرسائل يعملان الآن", Toast.LENGTH_LONG).show();
            } else {
                Toast.makeText(this, "⚠️ بعض الأذونات مرفوضة - فعلها من الإعدادات", Toast.LENGTH_LONG).show();
                // فتح إعدادات التطبيق
                try{
                    Intent intent = new Intent(android.provider.Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
                    intent.setData(android.net.Uri.parse("package:" + getPackageName()));
                    startActivity(intent);
                }catch(Exception e){}
            }
            finish();
        }
    }
}
