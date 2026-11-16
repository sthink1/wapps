# Wonderful Apps — Owner-approved findings and Stage 6 reconciliation: installation manifest

**Approval date:** November 16, 2026  
**Approval scope:** The owner explicitly approved the proposed **WA Master Findings Register** and **R16–R20 testing reconciliation addendum** for use in the WA project. This is approval of their documentary baseline, **not authorization to modify source code, run additional tests, close any findings, merge to `main`, or deploy production**.

## Installation targets

Extract this archive **outside** the project, review its contents, then the owner may copy the three files in the archive's `docs/` folder to these exact WA-relative destinations:

- `docs/WA_Master_Findings_Register_2026-11-16.xlsx`
- `docs/WA_R16-R20_Testing_Reconciliation_Addendum_2026-11-16.md`
- `docs/WA_Master_Findings_Register_Review_Notes_2026-11-16.md`

The three files are **byte-identical to the owner-approved proposal documents** apart from the names (the `_PROPOSED` suffix was removed from the installation filenames). Their internal statements describing the proposals as awaiting approval are **historical preparation-state text**. This manifest records the subsequent owner approval and is controlling for the documents' installation status. The finding priorities, future tests, corrective scopes and release decisions inside those documents **remain proposals** until individually approved.

**Do not overwrite** `docs/WA_Standards_Compliance_Register.md`, `docs/Stage6_OpenItems.md`, `docs/Stage6_Render_TestPlan.md`, or the November 15 continuation handoff. The new register and addendum supplement those existing documents. No changes to application source, production, GitHub, or Google Drive are part of this package.

## Document identity and scope

- Register: 124 source-confirmed **functional candidate occurrences**, plus one distinct BinForm full-scope formatting record and three procedural/evidence exceptions. These are not 128 unique software defects.
- Source examination: 63 reviewed HTML files, 516 original functional candidates; per-page inventories, original reports and 128-row cross-batch map remain preserved in `download/`.
- R16–R20 addendum: preserves bounded acceptance evidence; real-browser T09/T10 and outstanding R16–R20 items remain open, and all 16 proposed test scenarios are **NOT RUN**.
- Git baseline used in the approved reconciliation: `reviseLogIn`, `67626270f8c22e363ded83feea49d3855fd447b1`. This package does not reverify Google Drive byte equality or staging acceptance.

## SHA-256 manifest (approved content)

| WA-relative file | SHA-256 |
|---|---|
| `docs/WA_Master_Findings_Register_2026-11-16.xlsx` | `fb4e6089a08293702eb8fc9651ac73b4a95de0a6a985281e02e554ef6296720f` |
| `docs/WA_R16-R20_Testing_Reconciliation_Addendum_2026-11-16.md` | `4c4d29e021c93affe9ba4f9eefc5272a352d83da65bd46b6ccb7e216235ddf1a` |
| `docs/WA_Master_Findings_Register_Review_Notes_2026-11-16.md` | `59a7c5f17fc39c4840de8f83a4175d6272ad36dc2f515996d3eabc9e1be38a9b` |

## Owner-controlled verification after copying

From the WA project root, run the following **read-only** PowerShell commands to verify the three installed files:

```powershell
Get-FileHash .\docs\WA_Master_Findings_Register_2026-11-16.xlsx -Algorithm SHA256
Get-FileHash .\docs\WA_R16-R20_Testing_Reconciliation_Addendum_2026-11-16.md -Algorithm SHA256
Get-FileHash .\docs\WA_Master_Findings_Register_Review_Notes_2026-11-16.md -Algorithm SHA256
git status --short
```

Compare each output hash with this manifest. Then follow the owner's normal local-C, Google Drive and Git synchronization process. **No assistant-initiated upload, commit, push or deployment is authorized.** If any file with one of the proposed target names already exists, compare it before replacing it; do not silently overwrite.

## Governing boundaries

The approved planning documents do not change previously accepted R10/R14/R15 or R16-75 T12 90/90 bounded offline PASS; they do not certify the current application. Material privacy and credential findings must be dispositioned before release, with separate authorization for corrective work and mandatory independent engineering/security review. For any subsequent source revision, preserve complete files, original-to-final `.diff`, distinct `.md` per revised file, rollback plan, and owner installation.
