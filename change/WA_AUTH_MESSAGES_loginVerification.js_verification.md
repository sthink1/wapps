# services/loginVerification.js — original-to-final verification

Approved November 26 limited message revision. Original: current authoritative Google Drive file, byte-identical to installed November 25 ZIP.

Original SHA-256: `a9981e6e30ca1ba9807b75c2443885a7017d2a6e134826da91f6f201b93f6b4a`

Final SHA-256: `25953d3f3a8fc0dca37dddba7f084bf1204bed9a624712c3151fe9fe761ecb0c`

Adds four fixed public messages and a denial helper; candidate lookup retains unused expired/exhausted rows for classification; locked read derives IsActive from database UTC; exact token, user and security-version checks precede classification. Expiry takes precedence over exhaustion; neither compares submitted code. Incorrect attempts commit exactly as before; fifth counted failure returns exhaustion. SQL write predicates unchanged, so races or unexpected affected-row counts still deny generically. No other formatting or behavior changes intended. Repeated requests for expired/exhausted tokens now take the account lock, an additional load consideration; unknown and consumed tokens stay generic. Missing security fence or unexpected DB errors retain safe server-error handling.

Complete unified diff independently reapplied and matched final bytes. Node v22.16.0 syntax and shared 51-case loopback HTTP suite passed. SQL/Express and external dependencies simulated; actual MySQL and native/browser acceptance outstanding. No schema changes. Restore exact November 25 file from owner backup or previous ZIP for rollback.
