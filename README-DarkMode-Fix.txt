Wonderful Apps - Android/DuckDuckGo Dark Mode Compatibility Fix
Date: 2026-09-14

All 50 HTML files from the current Google Drive httpdocs folder were revised.

Changes applied to each HTML file:
1. Added <meta name="color-scheme" content="only light"> in <head>.
2. Added :root { color-scheme: only light; } to the first CSS <style> block.

Purpose: tell browsers/WebViews that Wonderful Apps intentionally uses its light color scheme and should not be algorithmically recolored by automatic dark mode.

No application logic, routes, form behavior, table data handling, existing colors, or JavaScript were intentionally changed.
