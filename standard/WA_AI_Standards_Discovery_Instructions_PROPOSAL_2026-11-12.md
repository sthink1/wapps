# Wonderful Apps — AI Coding Assistant Standards Discovery Proposal

**Status:** PROPOSED INTEGRATION NOTES ONLY; no project file edits, automatic-loading guarantee, or installation permission.  
**Prepared:** November 12, 2026

## Objective

Ensure that a human, ChatGPT, Claude-compatible agent, Codex-compatible agent or GitHub Copilot encounters the project's owner-approved standards at the start of a WA task, rather than relying on past conversation context. Different tools have different instruction-file conventions. **None of these files by itself proves that a tool read or complied with the standards.** Verify the tool's current documented behavior in its actual editor/runtime before enabling.

## Proposed universal instruction text (to be embedded in a supported tool-specific file)

> **Wonderful Apps — required development protocol:** Before examining, proposing or changing WA program code, read the *owner-approved* current versions of `standard/WA_Core_Programming_Standards.md`, `standard/WA_Detailed_Technical_Standards.md`, and `standard/WA_Standards_Decision_Register_v1.0_2026-11-12.md`, along with root `CLAUDE.md`, `TechSummary.md`, relevant Stage 6 evidence, and exact current authoritative source files. Start with CS-01: preserve all unapproved functionality and appearance. For every existing file proposed for revision, compare the complete final file with the authoritative original, furnish the complete replacement, unified `.diff`, separate `.md` verification summary and independently checked SHA-256 of the final file; account separately for all formatting changes. All new source files must be pretty formatted. Identify applicable CS / WA clauses and owner approval. Keep Google Drive, GitHub and WA local files read-only; prepare proposals separately for manual owner installation. No staging/production/database/repository changes, test-pass claims without evidence, or implicit approvals. If standards conflict, stop the affected change and seek owner direction. Current draft documents are not yet approved governing replacements.

## Candidate discovery locations (each separately reviewed before installation)

| Candidate | Intended audience | Safe proposal procedure |
|---|---|---|
| Root `README.md` | Human developers and any assistant asked to read it | **Inspect current root README first**; add a short navigation section or prepare a full replacement with mandatory diff/summary/SHA-256. Do not overwrite unknown content. |
| Root `AGENTS.md` | Tools supporting AGENTS.md conventions, subject to actual tool configuration | First verify whether the file exists; prepare a complete new file or a baseline-reconciled revision. Point to approved Core/Detailed/Decision documents. |
| Root `CLAUDE.md` | Claude-compatible coding workflow where configured to load this file | The file already exists; propose a **small addition to the existing guide**, not an unconditional replacement. Supply complete-file diff/report and preserve all existing instructions. |
| `.github/copilot-instructions.md` | GitHub Copilot in supported editors/configurations | Check whether present; draft a file/preserved addition only after specific owner approval, and verify actual loading behavior. GitHub remains strictly read-only to assistants. |
| Other editor/workspace instruction mechanisms | Tool-specific configurations | Discover provider-supported instruction format at time of installation, and verify it was actually loaded; do not invent guarantees. |

## Required acceptance before claiming the entry mechanism works

1. Owner has approved the exact Core and Detailed Standards version; stable approved paths exist and the references resolve.
2. Original root/agent files and their current revisions are inspected. Existing contents are preserved. Changes receive full `.diff` and verification reports under CS-01.
3. A human or coding assistant opens a **new project task**, names the Core version read, identifies applicable clause IDs and repeats the no-unapproved-change rule.
4. A controlled mock change demonstrates that the assistant produces the exact original-to-final comparison evidence and does not modify the source repository.
5. A negative exercise introduces an intentionally conflicting instruction: the assistant identifies the conflict and requests owner direction rather than silently selecting one.
6. Record the test tool, extension/version, editor/settings, observed instruction-loading behavior and results. Do not claim universal enforcement across products.

## Install boundary

This document is **a proposal for later instructions integration**. It is not a project file and must not be copied blindly over a live `CLAUDE.md`, root README, `AGENTS.md` or Copilot file. If the user later authorizes a specific entry file, fetch its current authoritative original and create the required complete-file proposed replacement, `.diff`, `.md` comparison summary and final SHA-256. Treat a new file as new (no fabricated original/diff), and verify formatting.
