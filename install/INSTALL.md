# Installation manifest — WA production database transition planning document

**Change:** Add planning document only (no database changes)  
**Classification:** NEW  
**Destination:** `docs/WA_Production_Database_Transition_Plan.md`  
**File SHA-256:** `793fc5972bf71c26a3f33691483a0ec79d7cff8b670181c711422b3097b7c2a7`

## Owner installation

1. Extract the ZIP outside the authoritative WA project.
2. Review `docs/WA_Production_Database_Transition_Plan.md`.
3. Copy the Markdown file manually into your local WA project's `docs/` folder. If a file with the same name already exists, stop and reconcile before replacing it.
4. Copy/synchronize it to the authoritative `My Drive/wonderfulApp/docs/` location following your established procedure.
5. Check that the installed file has the listed SHA-256 hash, e.g. PowerShell: `Get-FileHash .\docs\WA_Production_Database_Transition_Plan.md -Algorithm SHA256`.

No application source, README, or database is to be edited as part of this installation.

## Rollback

Remove only this newly installed planning file if you choose to withdraw it, after confirming it was created solely by this package. This document is informational and does not change runtime behavior.
