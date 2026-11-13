# Wonderful Apps — AI Standards Discovery: Change Verification

**Date:** November 12, 2026  
**Status:** PROPOSED FILES — NOT INSTALLED BY ASSISTANT  
**Scope:** Root README verification; narrow discovery-only insert into `CLAUDE.md`; replacement Copilot instructions; new optional root `AGENTS.md`.  
**Authority:** Google Drive `My Drive/wonderfulApp` read-only source. No project-file mutation performed.

## 1. Exact baseline and deliverable checksums

| File | Original bytes | Original SHA-256 | Final bytes | Proposed final SHA-256 |
| --- | ---: | --- | ---: | --- |
| `README.md` | 17642 | `aeef796d5710fb0a892d48c1c07326937d15fe62495d5c2d642584c23e0c517d` | 17642 | `aeef796d5710fb0a892d48c1c07326937d15fe62495d5c2d642584c23e0c517d` |
| `CLAUDE.md` | 54964 | `a66085f0ef361df5bf97dd4a8c6de26788c243a68e4c2dcf09991ed79d39425c` | 56861 | `d9a8436ae22333efb313339c55f3559b0da6eec4db7ef7b7655ddfd0cac49a53` |
| `copilot-instructions.md` | 48 | `aa58f59f01e8a6533e6f3c1b6b949f576ecebe063a71456ad3188b6e21a3fafb` | 1523 | `9a3bc2da0c904293b4170d42320a701541aed4c7d8f2d481e3078f1d5d98296b` |
| `AGENTS.md` | new | `-` | 1810 | `f1dc56f8d5ef961c7195bdb36de5c016ef804771dda00dfb6474667a652bd3dd` |

## 2. Difference authorization and review

- `README.md`: **NO DIFFERENCES** between the authoritative Drive copy and the previously proposed file; do not reinstall unnecessarily. `README.md.diff` is intentionally empty.
- `CLAUDE.md`: One bounded, introductory **Mandatory Standards Discovery** section is inserted before §1. No pre-existing guide lines have been removed, replaced, or reordered. Its original technical content, including known outdated administrator descriptions, is intentionally unchanged; those discrepancies require separate approved reconciliation. The complete final file and `CLAUDE.md.diff` permit line-by-line review.
- `.github/copilot-instructions.md`: Replaces its existing single sentence, `Always refer to CLAUDE.md for project standards.`, with explicit required reading, preservation/diff/evidence duties, read-only access, and project baseline checks. Full original-to-final diff provided in `copilot-instructions.md.diff`. The final file still directs Copilot to `CLAUDE.md`.
- `AGENTS.md`: New root-level proposal. No file of that exact name was found in the authoritative project-root listing / Drive name search during this review. No original-file diff is applicable to a genuinely new file. Verify nonexistence again immediately before installation.

## 3. Proposed installation paths — owner action only

1. Root `README.md`: Already identical; **no installation needed** at the checked baseline.
2. Root `CLAUDE.md`: Review its complete replacement and `CLAUDE.md.diff`; install manually only if approved.
3. `.github/copilot-instructions.md`: Review its complete replacement and `copilot-instructions.md.diff`; install manually only if approved.
4. Root `AGENTS.md`: Review then add manually only if approved; confirm no newer version exists.

**If any authoritative original changes before manual installation, stop and regenerate the comparisons, proposed file, and SHA-256 record.** Each proposed file's final checksum must be rechecked after download and again against the installed bytes. No new tests were run and no automatic AI instruction loading has been certified.

## 4. Static verification performed

- Deterministic byte-level README comparison.
- Unified diffs of the two existing instruction-file replacements.
- SHA-256 hashes of every original and final deliverable.
- Read-only inspection of current Google Drive root README, `CLAUDE.md`, Copilot instructions, and standards filenames.
- No application behavior or source-code files were changed; therefore no runtime functional PASS is claimed.

## 5. Follow-up matters, not included in this scope

- Correct older administrator wording in both `CLAUDE.md` and `TechSummary.md` in separately approved packages.
- Decide whether to rename the approved-but-`DRAFT`-named standards documents at a controlled version/effective-date step; do not silently modify installed filenames or cross-references.
- Confirm instruction discovery in the actual Copilot/Claude/agent configurations used by the project; this proposal does not guarantee automated reading.
