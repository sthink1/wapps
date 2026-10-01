WA Raised Button Style Revision - 2026-10-01

Implementation
- Added css/wa-buttons.css.
- Added the shared stylesheet reference and wa-raised-buttons body class to the current WA HTML pages in this package.
- Existing page-specific button colors, sizes, labels, navigation, JavaScript, permissions, and database behavior are unchanged.
- Specialized information/icon/password controls and table-header sort controls are intentionally kept flat.

Excluded
- home.html: already revised and approved separately.
- propertyInfo.html: intentionally excluded by request; it is the visual reference for the raised-button style.
- Older/duplicate HTML copies outside the current main WA folder were not modified.

SQL
- No SQL changes are required.
