package com.wonderfulapps.townnotification;

import android.Manifest;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.content.pm.ServiceInfo;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Build;
import android.os.IBinder;
import android.speech.tts.TextToSpeech;

import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;
import androidx.core.app.NotificationCompat;

import java.util.Locale;

public class TownLocationService extends Service implements LocationListener, TextToSpeech.OnInitListener {
    public static final String ACTION_START = "com.wonderfulapps.townnotification.START";
    public static final String ACTION_STOP = "com.wonderfulapps.townnotification.STOP";

    public static final String PREFS_NAME = "tnna_status";
    public static final String KEY_RUNNING = "running";
    public static final String KEY_CURRENT_AREA = "currentArea";
    public static final String KEY_ERROR = "error";
    public static final String KEY_ACCURACY = "accuracy";

    private static final String CHANNEL_ID = "town_location_monitoring";
    private static final int NOTIFICATION_ID = 1001;
    private static final long MIN_TIME_MS = 2500L;
    private static final float MIN_DISTANCE_METERS = 8f;

    private LocationManager locationManager;
    private BoundaryIndex boundaryIndex;
    private TextToSpeech textToSpeech;
    private boolean ttsReady = false;
    private String currentArea = "";

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();
        boundaryIndex = new BoundaryIndex(this);
        textToSpeech = new TextToSpeech(this, this);
        locationManager = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && ACTION_STOP.equals(intent.getAction())) {
            stopMonitoring();
            return START_NOT_STICKY;
        }

        startAsForeground();
        startLocationUpdates();
        return START_STICKY;
    }

    private void startAsForeground() {
        Notification notification = buildNotification("Waiting for GPS location...");
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION);
        } else {
            startForeground(NOTIFICATION_ID, notification);
        }

        SharedPreferences.Editor editor = prefs().edit()
            .putBoolean(KEY_RUNNING, true)
            .putString(KEY_ERROR, "");

        if (!boundaryIndex.isReady()) {
            editor.putString(KEY_ERROR, boundaryIndex.getLoadError());
        }
        editor.apply();
    }

    private void startLocationUpdates() {
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED &&
            ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            writeError("Location permission is not granted.");
            stopSelf();
            return;
        }

        if (!locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER)) {
            writeError("Phone GPS/location services are turned off.");
            return;
        }

        try {
            locationManager.requestLocationUpdates(
                LocationManager.GPS_PROVIDER,
                MIN_TIME_MS,
                MIN_DISTANCE_METERS,
                this
            );

            if (locationManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER)) {
                locationManager.requestLocationUpdates(
                    LocationManager.NETWORK_PROVIDER,
                    5000L,
                    25f,
                    this
                );
            }
        } catch (SecurityException error) {
            writeError("Location permission is not available to the monitoring service.");
            stopSelf();
        }
    }

    @Override
    public void onLocationChanged(@NonNull Location location) {
        prefs().edit().putFloat(KEY_ACCURACY, location.getAccuracy()).apply();

        if (!boundaryIndex.isReady()) {
            return;
        }

        String area = boundaryIndex.findArea(location.getLatitude(), location.getLongitude());
        if (area == null || area.isBlank()) {
            // Silence is intentional outside a recognized town/city/community.
            // Clear currentArea so re-entering the same place later is announced again.
            currentArea = "";
            prefs().edit()
                .putString(KEY_CURRENT_AREA, "")
                .putString(KEY_ERROR, "")
                .apply();
            updateNotification("Monitoring — no named town/city detected");
            return;
        }

        prefs().edit()
            .putString(KEY_CURRENT_AREA, area)
            .putString(KEY_ERROR, "")
            .apply();

        updateNotification("Monitoring — " + area);

        if (!area.equals(currentArea)) {
            currentArea = area;
            speak("You have entered: " + area);
        }
    }

    private void speak(String message) {
        if (!ttsReady) return;
        textToSpeech.speak(message, TextToSpeech.QUEUE_FLUSH, null, "tnna-town-change");
    }

    @Override
    public void onInit(int status) {
        if (status == TextToSpeech.SUCCESS) {
            int result = textToSpeech.setLanguage(Locale.US);
            ttsReady = result != TextToSpeech.LANG_MISSING_DATA && result != TextToSpeech.LANG_NOT_SUPPORTED;
        }
    }

    private void stopMonitoring() {
        if (locationManager != null) {
            locationManager.removeUpdates(this);
        }
        prefs().edit()
            .putBoolean(KEY_RUNNING, false)
            .putString(KEY_CURRENT_AREA, "")
            .putString(KEY_ERROR, "")
            .remove(KEY_ACCURACY)
            .apply();
        stopForeground(STOP_FOREGROUND_REMOVE);
        stopSelf();
    }

    private SharedPreferences prefs() {
        return getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
    }

    private void writeError(String error) {
        prefs().edit().putString(KEY_ERROR, error).apply();
        updateNotification(error);
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "Town Notification location monitoring",
                NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("Keeps Town Notification active while another app is open or the screen is off.");
            NotificationManager manager = getSystemService(NotificationManager.class);
            manager.createNotificationChannel(channel);
        }
    }

    private Notification buildNotification(String text) {
        Intent activityIntent = new Intent(this, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(
            this,
            0,
            activityIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        return new NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_stat_tnna)
            .setContentTitle("Town Notification is active")
            .setContentText(text)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build();
    }

    private void updateNotification(String text) {
        NotificationManager manager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        manager.notify(NOTIFICATION_ID, buildNotification(text));
    }

    @Override
    public void onDestroy() {
        if (locationManager != null) {
            locationManager.removeUpdates(this);
        }
        if (textToSpeech != null) {
            textToSpeech.stop();
            textToSpeech.shutdown();
        }
        prefs().edit().putBoolean(KEY_RUNNING, false).apply();
        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
