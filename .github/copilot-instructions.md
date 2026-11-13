# Wonderful Apps — Mandatory Copilot Instructions

Before suggesting, creating or editing Wonderful Apps code, **read the project-root `README.md` Section 0** and all three referenced standards documents in `standard/` (Core Programming Standards, Detailed Technical Standards, and Standards Decision Register). Confirm their approval/effective status; do not assume a `DRAFT` file is binding solely from its filename.

Also read `CLAUDE.md`, `TechSummary.md`, the authoritative affected files, and applicable Stage 6 records. Check for contradictory or outdated guidance before working.

**Primary rule:** Preserve application functionality and appearance. Change only what the owner expressly authorizes. For **every revised existing file**, deliver the complete proposed replacement, a complete original-versus-final `.diff`, a separate `.md` change-verification report, and SHA-256 checksum of the exact delivered file. Identify effects on dependencies and tests. Every new source file must be pretty formatted.

Google Drive, GitHub and local WA project contents are **read-only** for assistants and design engineers. Never edit or commit project files, run tests against live databases or services, or deploy without separate explicit authorization. Prepare download-only proposals for owner review and manual installation.

At the start of each work item, state which standards and actual original source versions were reviewed and distinguish approved design policies, observed implementation, and test evidence.
