# FamilyTree — Wonderful Apps Module

FamilyTree is a family tree application originally developed in Microsoft Access as `FamilyTree.accdb`.

The goal of this project is to move the application out of Microsoft Access and rebuild it as a module within the Wonderful Apps project.

## Project Goals

- Analyze the existing Access application as the source/reference system
- Export and document Access objects for review
- Identify the core FamilyTree tasks and data structures
- Recreate the application as part of Wonderful Apps
- Replace Access forms/reports/macros/VBA with web application code
- Preserve useful business/data logic while eliminating Access-specific dependencies

## Project Structure

```plaintext
FamilyTree/
├── FamilyTree.accdb           ← Legacy Access source/reference database
├── README.md
├── CLAUDE.md
├── copilot-instructions.md
│
├── accessDatabaseDocumentor/  ← Access Database Documenter output
├── exports/                   ← Text exports of Access objects
│   ├── tables/
│   ├── queries/
│   ├── forms/
│   ├── reports/
│   ├── macros/
│   └── modules/
├── pictures/                  ← FamilyTree image assets
├── docs/                      ← Planning and migration documentation
├── scripts/                   ← Export/audit/helper scripts
├── skills/                    ← Copilot skills adapted for FamilyTree
├── backup/                    ← Timestamped Access/database backups
├── name change detail/        ← Reference audits and rename analysis
├── backend/                   ← Future Wonderful Apps backend/module work
└── .vscode/
```

## Current Development Rule

`FamilyTree.accdb` is a legacy source/reference file. Do not treat it as the future application platform.

Use Access exports and Database Documenter reports to understand the existing design, then rebuild the required functionality in Wonderful Apps.

## Safety Rules

- Do not modify `FamilyTree.accdb` unless explicitly requested.
- Create a timestamped backup before any Access-side change.
- Use `exports/` and `accessDatabaseDocumentor/` as primary review sources.
- Do not blindly bulk-edit exported Access object files.
- Do not import generated changes back into Access unless specifically instructed.
- Preserve the existing Access application until the Wonderful Apps replacement is verified.

## Migration Direction

Target platform:

- Wonderful Apps project
- Node.js / Express backend
- MySQL-compatible database design consistent with Wonderful Apps conventions
- Frontend pages/modules integrated into Wonderful Apps
- User-scoped data where applicable
- No continuing dependency on Access Runtime or `.accde`

## Recommended Workflow

1. Export current Access objects.
2. Review `accessDatabaseDocumentor/` for full structure.
3. Review `exports/` for exact queries, controls, macros, and VBA references.
4. Identify core tables and workflows.
5. Design normalized Wonderful Apps tables.
6. Build backend routes.
7. Build frontend pages.
8. Migrate test data.
9. Validate against the Access source/reference application.
