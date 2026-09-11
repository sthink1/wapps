# FTPerson Second Biological Parent Display Fix — 2026-09-11

Built from the current `/Google Drive/wonderfulApp` files.

## Problem found

The server's `/persons/:id/relationships` response already returns:
- `parents`: all biological parent rows;
- `mother`: only rows whose `AncestrySide` resolves to `Mother`;
- `father`: only rows whose `AncestrySide` resolves to `Father`.

FTPerson.js was building the Parent section only from `mother + father`.

Therefore, if a valid second biological parent had a blank/unknown `AncestrySide`
(for example because Gender did not resolve to Male/Female), that parent was present
in `data.parents` but was omitted from the FTPerson display.

## Fix

FTPerson now uses `data.parents` as the authoritative Parent list.
It falls back to `mother + father` only for compatibility if `data.parents` is absent.

This means every biological parent relationship returned by the server is displayed,
whether the Side column is Mother, Father, or blank.

## Replace

- `httpdocs/FTPerson.html`
- `httpdocs/js/FTPerson.js`

No SQL, route, database, npm, or environment changes are required.
