# Installation and review - H05-H50 Stage 6 documentation

This ZIP contains **one detailed hosted test-evidence ledger and three append-only document addenda**. The authoritative Google Drive documents currently contain historical pre-staging assumptions; their Drive versions may lag newer local copies.

1. Save the four Markdown files in your local WA project's `docs` folder on the `reviseLogIn` branch. Do **not** overwrite existing `Stage6_OpenItems.md`, `Stage6_Render_TestPlan.md` or `Stage6_Production_Implementation_Plan.md`.
2. Read the three addenda and the evidence ledger; compare against latest local documents, including locally recorded S6-039/S6-041. Preserve all existing issue IDs and testing evidence.
3. If you elect to integrate the addenda into the three existing documents, append each addendum's content under its date heading, after confirming it is not already present. Keep the comprehensive ledger as a separate linked file to avoid duplicating the 46-row table in three documents.
4. Review with `git diff --check`, `git status --short`, and `git diff -- docs/`; only commit or push after confirming the exact changed files. Do not touch `main`, production DB, or Render production.
5. The historical staging-only-on-sql5838929 claims are not deleted here. The addenda explicitly supersede them with the newer user-confirmed `wapps_test` staging facts. Update the top-of-document status lines separately only after verifying the local latest versions.

No SQL, JavaScript, or production configuration changes are included. H05-H50 are conversational test IDs rather than the formal R01-R20 acceptance matrix.
