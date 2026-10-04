package com.wonderfulapps.townnotification;

import android.Manifest;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;

import androidx.core.content.ContextCompat;

import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

@CapacitorPlugin(
    name = "TownLocation",
    permissions = {
        @Permission(
            alias = "location",
            strings = {
                Manifest.permission.ACCESS_COARSE_LOCATION,
                Manifest.permission.ACCESS_FINE_LOCATION
            }
        )
    }
)
public class TownLocationPlugin extends Plugin {

    @PluginMethod
    public void startMonitoring(PluginCall call) {
        if (getPermissionState("location") != PermissionState.GRANTED) {
            requestPermissionForAlias("location", call, "locationPermissionCallback");
            return;
        }
        startService(call);
    }

    @PermissionCallback
    private void locationPermissionCallback(PluginCall call) {
        if (getPermissionState("location") != PermissionState.GRANTED) {
            call.reject("Location permission is required for Town Notification.");
            return;
        }
        startService(call);
    }

    private void startService(PluginCall call) {
        Context context = getContext();
        Intent intent = new Intent(context, TownLocationService.class);
        intent.setAction(TownLocationService.ACTION_START);
        ContextCompat.startForegroundService(context, intent);
        call.resolve();
    }

    @PluginMethod
    public void stopMonitoring(PluginCall call) {
        Context context = getContext();
        Intent intent = new Intent(context, TownLocationService.class);
        intent.setAction(TownLocationService.ACTION_STOP);
        context.startService(intent);
        call.resolve();
    }

    @PluginMethod
    public void getStatus(PluginCall call) {
        SharedPreferences prefs = getContext().getSharedPreferences(TownLocationService.PREFS_NAME, Context.MODE_PRIVATE);
        JSObject result = new JSObject();
        result.put("running", prefs.getBoolean(TownLocationService.KEY_RUNNING, false));
        result.put("currentArea", prefs.getString(TownLocationService.KEY_CURRENT_AREA, ""));
        result.put("error", prefs.getString(TownLocationService.KEY_ERROR, ""));

        float accuracy = prefs.getFloat(TownLocationService.KEY_ACCURACY, Float.NaN);
        if (!Float.isNaN(accuracy)) {
            result.put("accuracyMeters", accuracy);
        }

        call.resolve(result);
    }

    @PluginMethod
    public void openWebsite(PluginCall call) {
        String url = call.getString("url");
        if (url == null || !(url.startsWith("https://") || url.startsWith("http://"))) {
            call.reject("A valid http(s) URL is required.");
            return;
        }

        Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getContext().startActivity(intent);
        call.resolve();
    }
}
