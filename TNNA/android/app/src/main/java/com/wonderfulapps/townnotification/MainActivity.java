package com.wonderfulapps.townnotification;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(TownLocationPlugin.class);
        registerPlugin(TnnaAccountPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
