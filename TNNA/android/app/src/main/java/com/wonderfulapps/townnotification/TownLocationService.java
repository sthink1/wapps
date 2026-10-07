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
import android.media.AudioAttributes;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;

import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

import java.util.Locale;

public class TownLocationService extends Service implements LocationListener, TextToSpeech.OnInitListener {
    public static final String ACTION_START = "com.wonderfulapps.townnotification.START";
    public static final String ACTION_STOP = "com.wonderfulapps.townnotification.STOP";

    public static final String PREFS_NAME = "tnna_status";
    public static final String KEY_RUNNING = "running";
    public static final String KEY_CURRENT_AREA = "currentArea";
    public static final String KEY_ERROR = "error";
    public static final String KEY_ACCURACY = "accuracy";
    public static final String KEY_LOCATION_PROVIDER = "locationProvider";
    public static final String KEY_LOCATION_TIME = "locationTime";
    public static final String KEY_TTS_READY = "ttsReady";
    public static final String KEY_TTS_ERROR = "ttsError";
    public static final String KEY_TTS_STATE = "ttsState";

    public static final String CHANNEL_ID = "town_location_monitoring";
    private static final int NOTIFICATION_ID = 1001;
    private static final long MIN_TIME_MS = 2500L;
    private static final float MIN_DISTANCE_METERS = 8f;
    private static final long LAST_KNOWN_MAX_AGE_MS = 30_000L;
    private static final long SPEECH_START_TIMEOUT_MS = 4_000L;
    private static final int MAX_SPEECH_RETRIES = 1;

    private LocationManager locationManager;
    private BoundaryIndex boundaryIndex;
    private TextToSpeech textToSpeech;
    private final Handler mainHandler = new Handler(Looper.getMainLooper());

    private boolean ttsReady = false;
    private String pendingSpeech = null;
    private String currentArea = "";

    private long speechSequence = 0L;
    private String activeUtteranceId = "";
    private String activeSpeechMessage = null;
    private boolean activeUtteranceStarted = false;
    private int activeSpeechRetryCount = 0;

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();
        boundaryIndex = new BoundaryIndex(this);

        prefs().edit()
            .putBoolean(KEY_TTS_READY, false)
            .putString(KEY_TTS_ERROR, "")
            .putString(KEY_TTS_STATE, "Initializing")
            .apply();

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

        if (!notificationsAvailable()) {
            stopForError(
                "Town Notification notifications are turned off. Enable notifications so the TN status-bar symbol can show while monitoring is active."
            );
            return START_NOT_STICKY;
        }

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
            stopForError("Location permission is not granted.");
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

            processRecentLastKnownLocation();
        } catch (SecurityException error) {
            stopForError("Location permission is not available to the monitoring service.");
        }
    }

    private void processRecentLastKnownLocation() {
        Location gps = null;
        Location network = null;

        try {
            if (locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER)) {
                gps = locationManager.getLastKnownLocation(LocationManager.GPS_PROVIDER);
            }

            if (locationManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER)) {
                network = locationManager.getLastKnownLocation(LocationManager.NETWORK_PROVIDER);
            }
        } catch (SecurityException ignored) {
            return;
        }

        Location best = chooseRecentLastKnownLocation(gps, network);
        if (best != null) {
            processLocation(best);
        }
    }

    private Location chooseRecentLastKnownLocation(Location first, Location second) {
        Location a = isRecentLocation(first) ? first : null;
        Location b = isRecentLocation(second) ? second : null;

        if (a == null) return b;
        if (b == null) return a;

        long timeDifference = Math.abs(a.getTime() - b.getTime());
        if (timeDifference > 10_000L) {
            return a.getTime() >= b.getTime() ? a : b;
        }

        if (a.hasAccuracy() && b.hasAccuracy()) {
            return a.getAccuracy() <= b.getAccuracy() ? a : b;
        }

        return a.getTime() >= b.getTime() ? a : b;
    }

    private boolean isRecentLocation(Location location) {
        if (location == null || location.getTime() <= 0L) {
            return false;
        }

        long age = System.currentTimeMillis() - location.getTime();
        return age >= 0L && age <= LAST_KNOWN_MAX_AGE_MS;
    }

    @Override
    public void onLocationChanged(@NonNull Location location) {
        processLocation(location);
    }

    @Override
    public void onStatusChanged(String provider, int status, Bundle extras) {
        // Required for compatibility with older Android versions, including
        // Android 8. No additional action is required for TNNA.
    }

    @Override
    public void onProviderEnabled(@NonNull String provider) {
        // No action is required. Live location updates continue normally.
    }

    @Override
    public void onProviderDisabled(@NonNull String provider) {
        if (LocationManager.GPS_PROVIDER.equals(provider)) {
            writeError("Phone GPS/location services are turned off.");
        }
    }

    private void processLocation(Location location) {
        SharedPreferences.Editor locationEditor = prefs().edit()
            .putLong(KEY_LOCATION_TIME, location.getTime())
            .putString(KEY_LOCATION_PROVIDER, location.getProvider() == null ? "" : location.getProvider());

        if (location.hasAccuracy()) {
            locationEditor.putFloat(KEY_ACCURACY, location.getAccuracy());
        } else {
            locationEditor.remove(KEY_ACCURACY);
        }
        locationEditor.apply();

        if (!boundaryIndex.isReady()) {
            return;
        }

        String area = boundaryIndex.findArea(location.getLatitude(), location.getLongitude());
        if (area == null || area.trim().isEmpty()) {
            currentArea = "";
            pendingSpeech = null;
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
        if (!ttsReady) {
            pendingSpeech = message;
            return;
        }

        speakNow(message, 0);
    }

    private void speakNow(String message, int retryCount) {
        if (textToSpeech == null) {
            setTtsError("Text-to-speech is not available.");
            return;
        }

        activeSpeechMessage = message;
        activeSpeechRetryCount = retryCount;
        activeUtteranceStarted = false;
        activeUtteranceId = "tnna-town-change-" + (++speechSequence);
        final String utteranceId = activeUtteranceId;

        prefs().edit()
            .putString(KEY_TTS_STATE, retryCount > 0 ? "Retrying announcement" : "Announcement queued")
            .putString(KEY_TTS_ERROR, "")
            .apply();

        int result = textToSpeech.speak(
            message,
            TextToSpeech.QUEUE_FLUSH,
            null,
            utteranceId
        );

        if (result == TextToSpeech.ERROR) {
            handleSpeechFailure(utteranceId, "Android text-to-speech could not start the town announcement.");
            return;
        }

        mainHandler.postDelayed(() -> {
            if (utteranceId.equals(activeUtteranceId) && !activeUtteranceStarted) {
                handleSpeechFailure(
                    utteranceId,
                    "Android text-to-speech accepted the announcement but did not start speaking."
                );
            }
        }, SPEECH_START_TIMEOUT_MS);
    }

    private void configureTextToSpeech() {
        if (textToSpeech == null) return;

        textToSpeech.setAudioAttributes(
            new AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_ASSISTANCE_NAVIGATION_GUIDANCE)
                .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
                .build()
        );

        textToSpeech.setOnUtteranceProgressListener(new UtteranceProgressListener() {
            @Override
            public void onStart(String utteranceId) {
                if (!utteranceId.equals(activeUtteranceId)) return;

                activeUtteranceStarted = true;
                prefs().edit()
                    .putString(KEY_TTS_STATE, "Speaking")
                    .putString(KEY_TTS_ERROR, "")
                    .apply();
            }

            @Override
            public void onDone(String utteranceId) {
                if (!utteranceId.equals(activeUtteranceId)) return;

                prefs().edit()
                    .putString(KEY_TTS_STATE, "Ready")
                    .putString(KEY_TTS_ERROR, "")
                    .apply();

                activeUtteranceId = "";
                activeSpeechMessage = null;
                activeUtteranceStarted = false;
                activeSpeechRetryCount = 0;
            }

            @Override
            public void onError(String utteranceId) {
                handleSpeechFailure(
                    utteranceId,
                    "Android text-to-speech reported an error while speaking the town announcement."
                );
            }
        });
    }

    private void handleSpeechFailure(String utteranceId, String finalError) {
        if (!utteranceId.equals(activeUtteranceId)) {
            return;
        }

        if (activeSpeechMessage != null && activeSpeechRetryCount < MAX_SPEECH_RETRIES) {
            final String message = activeSpeechMessage;
            final int nextRetryCount = activeSpeechRetryCount + 1;

            prefs().edit()
                .putString(KEY_TTS_STATE, "Retrying announcement")
                .apply();

            mainHandler.postDelayed(() -> {
                if (textToSpeech == null) {
                    setTtsError("Text-to-speech is not available.");
                    return;
                }

                textToSpeech.stop();
                speakNow(message, nextRetryCount);
            }, 500L);
            return;
        }

        activeUtteranceId = "";
        activeSpeechMessage = null;
        activeUtteranceStarted = false;
        activeSpeechRetryCount = 0;
        setTtsError(finalError);
    }

    @Override
    public void onInit(int status) {
        if (status != TextToSpeech.SUCCESS) {
            setTtsError("Android text-to-speech failed to initialize.");
            return;
        }

        int result = textToSpeech.setLanguage(Locale.US);
        if (result == TextToSpeech.LANG_MISSING_DATA) {
            setTtsError("English text-to-speech voice data is missing.");
            return;
        }

        if (result == TextToSpeech.LANG_NOT_SUPPORTED) {
            setTtsError("English (United States) text-to-speech is not supported on this phone.");
            return;
        }

        configureTextToSpeech();

        ttsReady = true;
        prefs().edit()
            .putBoolean(KEY_TTS_READY, true)
            .putString(KEY_TTS_ERROR, "")
            .putString(KEY_TTS_STATE, "Ready")
            .apply();

        if (pendingSpeech != null && !pendingSpeech.isEmpty()) {
            String message = pendingSpeech;
            pendingSpeech = null;
            speakNow(message, 0);
        }
    }

    private void setTtsError(String error) {
        ttsReady = false;
        prefs().edit()
            .putBoolean(KEY_TTS_READY, false)
            .putString(KEY_TTS_ERROR, error)
            .putString(KEY_TTS_STATE, "Error")
            .apply();
    }

    private void stopMonitoring() {
        if (locationManager != null) {
            locationManager.removeUpdates(this);
        }

        mainHandler.removeCallbacksAndMessages(null);
        pendingSpeech = null;
        currentArea = "";
        activeUtteranceId = "";
        activeSpeechMessage = null;
        activeUtteranceStarted = false;
        activeSpeechRetryCount = 0;

        prefs().edit()
            .putBoolean(KEY_RUNNING, false)
            .putString(KEY_CURRENT_AREA, "")
            .putString(KEY_ERROR, "")
            .putBoolean(KEY_TTS_READY, false)
            .putString(KEY_TTS_ERROR, "")
            .putString(KEY_TTS_STATE, "Not active")
            .remove(KEY_ACCURACY)
            .remove(KEY_LOCATION_PROVIDER)
            .remove(KEY_LOCATION_TIME)
            .apply();

        stopForeground(STOP_FOREGROUND_REMOVE);
        stopSelf();
    }

    private void stopForError(String error) {
        if (locationManager != null) {
            locationManager.removeUpdates(this);
        }

        mainHandler.removeCallbacksAndMessages(null);
        pendingSpeech = null;
        currentArea = "";
        activeUtteranceId = "";
        activeSpeechMessage = null;
        activeUtteranceStarted = false;
        activeSpeechRetryCount = 0;

        prefs().edit()
            .putBoolean(KEY_RUNNING, false)
            .putString(KEY_CURRENT_AREA, "")
            .putString(KEY_ERROR, error)
            .remove(KEY_ACCURACY)
            .remove(KEY_LOCATION_PROVIDER)
            .remove(KEY_LOCATION_TIME)
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
            channel.setDescription(
                "Shows the TN status-bar symbol while Town Notification is monitoring location in the background."
            );
            NotificationManager manager = getSystemService(NotificationManager.class);
            manager.createNotificationChannel(channel);
        }
    }

    private boolean notificationsAvailable() {
        if (!NotificationManagerCompat.from(this).areNotificationsEnabled()) {
            return false;
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager manager = getSystemService(NotificationManager.class);
            NotificationChannel channel = manager.getNotificationChannel(CHANNEL_ID);
            return channel == null || channel.getImportance() != NotificationManager.IMPORTANCE_NONE;
        }

        return true;
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

        mainHandler.removeCallbacksAndMessages(null);

        if (textToSpeech != null) {
            textToSpeech.stop();
            textToSpeech.shutdown();
        }

        prefs().edit()
            .putBoolean(KEY_RUNNING, false)
            .putBoolean(KEY_TTS_READY, false)
            .putString(KEY_TTS_STATE, "Not active")
            .apply();

        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
