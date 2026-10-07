package com.wonderfulapps.townnotification;

import android.Manifest;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Build;

import androidx.core.app.NotificationManagerCompat;
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
        ),
        @Permission(
            alias = "notifications",
            strings = {
                Manifest.permission.POST_NOTIFICATIONS
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
        continueAfterLocationPermission(call);
    }

    @PermissionCallback
    private void locationPermissionCallback(PluginCall call) {
        if (getPermissionState("location") != PermissionState.GRANTED) {
            call.reject("Location permission is required for Town Notification.");
            return;
        }
        continueAfterLocationPermission(call);
    }

    private void continueAfterLocationPermission(PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
            getPermissionState("notifications") != PermissionState.GRANTED) {
            requestPermissionForAlias("notifications", call, "notificationPermissionCallback");
            return;
        }

        continueAfterNotificationPermission(call);
    }

    @PermissionCallback
    private void notificationPermissionCallback(PluginCall call) {
        if (getPermissionState("notifications") != PermissionState.GRANTED) {
            call.reject(
                "Notification permission is required so the TN status-bar symbol can show while Town Notification is monitoring in the background."
            );
            return;
        }

        continueAfterNotificationPermission(call);
    }

    private void continueAfterNotificationPermission(PluginCall call) {
        if (!notificationsAvailable()) {
            call.reject(
                "Town Notification notifications are turned off. Enable notifications so the TN status-bar symbol can show while monitoring is active."
            );
            return;
        }

        startService(call);
    }

    private boolean notificationsAvailable() {
        Context context = getContext();

        if (!NotificationManagerCompat.from(context).areNotificationsEnabled()) {
            return false;
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager manager = context.getSystemService(NotificationManager.class);
            NotificationChannel channel = manager.getNotificationChannel(TownLocationService.CHANNEL_ID);
            return channel == null || channel.getImportance() != NotificationManager.IMPORTANCE_NONE;
        }

        return true;
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
        result.put("ttsReady", prefs.getBoolean(TownLocationService.KEY_TTS_READY, false));
        result.put("ttsError", prefs.getString(TownLocationService.KEY_TTS_ERROR, ""));
        result.put("ttsState", prefs.getString(TownLocationService.KEY_TTS_STATE, ""));
        result.put("notificationsEnabled", notificationsAvailable());

        float accuracy = prefs.getFloat(TownLocationService.KEY_ACCURACY, Float.NaN);
        if (!Float.isNaN(accuracy)) {
            result.put("accuracyMeters", accuracy);
        }

        long locationTime = prefs.getLong(TownLocationService.KEY_LOCATION_TIME, 0L);
        result.put("hasLocation", locationTime > 0L);

        if (locationTime > 0L) {
            result.put(
                "locationProvider",
                prefs.getString(TownLocationService.KEY_LOCATION_PROVIDER, "")
            );

            long ageMillis = Math.max(0L, System.currentTimeMillis() - locationTime);
            result.put("locationAgeSeconds", ageMillis / 1000.0);
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
