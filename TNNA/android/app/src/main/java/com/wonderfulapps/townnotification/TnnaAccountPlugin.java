package com.wonderfulapps.townnotification;

import android.content.Context;
import android.content.SharedPreferences;
import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyProperties;
import android.util.Base64;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.nio.charset.StandardCharsets;
import java.security.KeyStore;
import java.util.UUID;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;

@CapacitorPlugin(name = "TnnaAccount")
public class TnnaAccountPlugin extends Plugin {
    private static final String PREFS = "tnna_account";
    private static final String DEVICE_ID = "device_id";
    private static final String TOKEN_IV = "refresh_token_iv";
    private static final String TOKEN_CIPHERTEXT = "refresh_token_ciphertext";
    private static final String KEYSTORE = "AndroidKeyStore";
    private static final String KEY_ALIAS = "WonderfulAppsTnnaRefreshToken";

    private SharedPreferences prefs() {
        return getContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    private SecretKey getOrCreateKey() throws Exception {
        KeyStore keyStore = KeyStore.getInstance(KEYSTORE);
        keyStore.load(null);

        if (keyStore.containsAlias(KEY_ALIAS)) {
            return ((KeyStore.SecretKeyEntry) keyStore.getEntry(KEY_ALIAS, null)).getSecretKey();
        }

        KeyGenerator keyGenerator = KeyGenerator.getInstance(
                KeyProperties.KEY_ALGORITHM_AES,
                KEYSTORE
        );
        keyGenerator.init(new KeyGenParameterSpec.Builder(
                KEY_ALIAS,
                KeyProperties.PURPOSE_ENCRYPT | KeyProperties.PURPOSE_DECRYPT)
                .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                .build());
        return keyGenerator.generateKey();
    }

    @PluginMethod
    public void getOrCreateDeviceId(PluginCall call) {
        String deviceId = prefs().getString(DEVICE_ID, null);
        if (deviceId == null || deviceId.trim().isEmpty()) {
            deviceId = UUID.randomUUID().toString();
            prefs().edit().putString(DEVICE_ID, deviceId).apply();
        }

        JSObject result = new JSObject();
        result.put("deviceId", deviceId);
        call.resolve(result);
    }

    @PluginMethod
    public void saveRefreshToken(PluginCall call) {
        String refreshToken = call.getString("refreshToken");
        if (refreshToken == null || refreshToken.trim().isEmpty()) {
            call.reject("refreshToken is required");
            return;
        }

        try {
            SecretKey key = getOrCreateKey();
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.ENCRYPT_MODE, key);

            byte[] encrypted = cipher.doFinal(refreshToken.getBytes(StandardCharsets.UTF_8));
            String iv = Base64.encodeToString(cipher.getIV(), Base64.NO_WRAP);
            String ciphertext = Base64.encodeToString(encrypted, Base64.NO_WRAP);

            prefs().edit()
                    .putString(TOKEN_IV, iv)
                    .putString(TOKEN_CIPHERTEXT, ciphertext)
                    .apply();

            call.resolve();
        } catch (Exception error) {
            call.reject("Unable to securely save TNNA login", error);
        }
    }

    @PluginMethod
    public void getRefreshToken(PluginCall call) {
        String ivText = prefs().getString(TOKEN_IV, null);
        String cipherText = prefs().getString(TOKEN_CIPHERTEXT, null);

        JSObject result = new JSObject();
        if (ivText == null || cipherText == null) {
            result.put("refreshToken", "");
            call.resolve(result);
            return;
        }

        try {
            SecretKey key = getOrCreateKey();
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            byte[] iv = Base64.decode(ivText, Base64.NO_WRAP);
            cipher.init(Cipher.DECRYPT_MODE, key, new GCMParameterSpec(128, iv));
            byte[] decrypted = cipher.doFinal(Base64.decode(cipherText, Base64.NO_WRAP));
            result.put("refreshToken", new String(decrypted, StandardCharsets.UTF_8));
            call.resolve(result);
        } catch (Exception error) {
            prefs().edit().remove(TOKEN_IV).remove(TOKEN_CIPHERTEXT).apply();
            result.put("refreshToken", "");
            call.resolve(result);
        }
    }

    @PluginMethod
    public void clearRefreshToken(PluginCall call) {
        prefs().edit().remove(TOKEN_IV).remove(TOKEN_CIPHERTEXT).apply();
        call.resolve();
    }
}
