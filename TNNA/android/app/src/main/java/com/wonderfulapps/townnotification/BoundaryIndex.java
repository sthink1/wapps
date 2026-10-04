package com.wonderfulapps.townnotification;

import android.content.Context;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class BoundaryIndex {
    private static final String DATA_ROOT = "public/data/us/";

    private final Context context;
    private final List<StateShard> shards = new ArrayList<>();
    private final Map<String, List<BoundaryFeature>> cache = new HashMap<>();
    private boolean ready = false;
    private String loadError = "";

    public BoundaryIndex(Context context) {
        this.context = context.getApplicationContext();
        try {
            loadManifest();
            ready = !shards.isEmpty();
            if (!ready) {
                loadError = "U.S. boundary data is empty. Run npm run build:boundaries and npx cap sync android.";
            }
        } catch (Exception error) {
            loadError = "U.S. boundary data is not installed. Run npm run build:boundaries and npx cap sync android.";
        }
    }

    public boolean isReady() {
        return ready;
    }

    public String getLoadError() {
        return loadError;
    }

    public synchronized String findArea(double lat, double lon) {
        if (!ready) return null;

        for (StateShard shard : shards) {
            if (!shard.mightContain(lat, lon)) continue;
            try {
                for (BoundaryFeature feature : loadShard(shard)) {
                    if (feature.contains(lat, lon)) return feature.name;
                }
            } catch (Exception error) {
                loadError = "Unable to read local U.S. boundary data for " + shard.abbr + ".";
            }
        }
        return null;
    }

    private void loadManifest() throws Exception {
        JSONObject root = readJson(DATA_ROOT + "manifest.json");
        JSONArray states = root.getJSONArray("states");
        for (int i = 0; i < states.length(); i++) {
            JSONObject item = states.getJSONObject(i);
            if (item.isNull("bbox")) continue;
            JSONArray bbox = item.getJSONArray("bbox");
            shards.add(new StateShard(
                item.getString("abbr"),
                item.getString("file"),
                bbox.getDouble(0), bbox.getDouble(1), bbox.getDouble(2), bbox.getDouble(3)
            ));
        }
    }

    private List<BoundaryFeature> loadShard(StateShard shard) throws Exception {
        List<BoundaryFeature> cached = cache.get(shard.file);
        if (cached != null) return cached;

        JSONObject root = readJson(DATA_ROOT + shard.file);
        JSONArray features = root.getJSONArray("features");
        List<BoundaryFeature> output = new ArrayList<>(features.length());
        for (int i = 0; i < features.length(); i++) {
            output.add(BoundaryFeature.fromJson(features.getJSONObject(i)));
        }
        cache.put(shard.file, output);
        return output;
    }

    private JSONObject readJson(String assetPath) throws Exception {
        try (InputStream input = context.getAssets().open(assetPath);
             BufferedReader reader = new BufferedReader(new InputStreamReader(input, StandardCharsets.UTF_8))) {
            StringBuilder json = new StringBuilder();
            char[] buffer = new char[32768];
            int count;
            while ((count = reader.read(buffer)) != -1) json.append(buffer, 0, count);
            return new JSONObject(json.toString());
        }
    }

    private static final class StateShard {
        private final String abbr;
        private final String file;
        private final double minLon, minLat, maxLon, maxLat;

        private StateShard(String abbr, String file, double minLon, double minLat, double maxLon, double maxLat) {
            this.abbr = abbr;
            this.file = file;
            this.minLon = minLon;
            this.minLat = minLat;
            this.maxLon = maxLon;
            this.maxLat = maxLat;
        }

        private boolean mightContain(double lat, double lon) {
            return lon >= minLon && lon <= maxLon && lat >= minLat && lat <= maxLat;
        }
    }

    private static final class BoundaryFeature {
        private final String name;
        private final double minLon, minLat, maxLon, maxLat;
        private final List<List<List<Point>>> polygons;

        private BoundaryFeature(String name, double minLon, double minLat, double maxLon, double maxLat,
                                List<List<List<Point>>> polygons) {
            this.name = name;
            this.minLon = minLon;
            this.minLat = minLat;
            this.maxLon = maxLon;
            this.maxLat = maxLat;
            this.polygons = polygons;
        }

        static BoundaryFeature fromJson(JSONObject json) throws Exception {
            JSONArray bbox = json.getJSONArray("bbox");
            JSONArray polygonsJson = json.getJSONArray("polygons");
            List<List<List<Point>>> polygons = new ArrayList<>();

            for (int p = 0; p < polygonsJson.length(); p++) {
                JSONArray polygonJson = polygonsJson.getJSONArray(p);
                List<List<Point>> polygon = new ArrayList<>();
                for (int r = 0; r < polygonJson.length(); r++) {
                    JSONArray ringJson = polygonJson.getJSONArray(r);
                    List<Point> ring = new ArrayList<>(ringJson.length());
                    for (int q = 0; q < ringJson.length(); q++) {
                        JSONArray coordinate = ringJson.getJSONArray(q);
                        ring.add(new Point(coordinate.getDouble(0), coordinate.getDouble(1)));
                    }
                    polygon.add(ring);
                }
                polygons.add(polygon);
            }

            return new BoundaryFeature(
                json.getString("name"),
                bbox.getDouble(0), bbox.getDouble(1), bbox.getDouble(2), bbox.getDouble(3),
                polygons
            );
        }

        boolean contains(double lat, double lon) {
            if (lon < minLon || lon > maxLon || lat < minLat || lat > maxLat) return false;
            for (List<List<Point>> polygon : polygons) {
                if (pointInPolygon(lon, lat, polygon)) return true;
            }
            return false;
        }

        private static boolean pointInPolygon(double lon, double lat, List<List<Point>> polygon) {
            if (polygon.isEmpty() || !pointInRing(lon, lat, polygon.get(0))) return false;
            for (int i = 1; i < polygon.size(); i++) {
                if (pointInRing(lon, lat, polygon.get(i))) return false;
            }
            return true;
        }

        private static boolean pointInRing(double lon, double lat, List<Point> ring) {
            boolean inside = false;
            for (int i = 0, j = ring.size() - 1; i < ring.size(); j = i++) {
                Point pi = ring.get(i);
                Point pj = ring.get(j);
                boolean intersects = ((pi.lat > lat) != (pj.lat > lat)) &&
                    (lon < ((pj.lon - pi.lon) * (lat - pi.lat)) /
                    ((pj.lat - pi.lat) == 0 ? Double.MIN_VALUE : (pj.lat - pi.lat)) + pi.lon);
                if (intersects) inside = !inside;
            }
            return inside;
        }
    }

    private static final class Point {
        private final double lon;
        private final double lat;
        private Point(double lon, double lat) { this.lon = lon; this.lat = lat; }
    }
}
