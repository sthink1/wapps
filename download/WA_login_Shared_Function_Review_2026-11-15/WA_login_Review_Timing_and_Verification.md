# login — timing and verification

## Measurement
Local PowerShell Get-Date timestamps, America/New_York offset-05:00. True prompt/initial-response start is not observable; first reliable anchor below bounds measured elapsed. Initial anchor is included in each page's own interval; no inter-experiment comparison. Wall-clock is not uninterrupted model computation. Aggregate tool execution time was not instrumented; individual exec_command durations are in tool outputs. No external/approval wait, intentional sleep or user interruption occurred. Report-generation/checking time is included; one in-memory report-generator syntax retry occurred, without extra files or source writes.

## Phase ledger
| Milestone | Local timestamp | Since previous |
| --- | --- | --- |
| First reliable anchor; initial README/attachment reading included afterward | 2026-11-15T18:44:51.3600148-05:00 | Anchor |
| Independent discovery frozen and saved | 2026-11-15T18:46:25.2138434-05:00 | 93.853 s |
| Compliance assessment completed | 2026-11-15T18:47:33.4542776-05:00 | 68.241 s |
| Limited evidence reconciliation completed | 2026-11-15T18:48:26.3948306-05:00 | 52.940 s |
| All three report drafts complete | 2026-11-15T18:49:46.7530236-05:00 | 80.358 s |
| First ZIP verified | 2026-11-15T18:49:47.4051917-05:00 | 0.652 s |

Measured through first ZIP verification: 296.045 seconds; initial pre-anchor interval unavailable.

Final ledger sealing/repacking follows the first verification; final endpoint/tail and exact final hashes are recorded in tool output. This avoids inventing a self-inclusive artifact completion timestamp. Report1/CSV preparation observed at2026-11-15T18:48:41.0762368-05:00.

## Identity, sequence and evidence
Sourcehttpdocs/login.html;239lines;SHA-2568794E191954E75B9B7F68B3F2A43150977FF4C2A60075C162196FAEDF1ED297C.
Branch reviseLogIn;HEAD1bc93d86a194cdcc57a7280de226f1bfee10f10c (local identity only).
Initial candidate count8;post-reconciliation additions0;reclassifications0.
Counts:2 confirmed gaps;6 needing targeted verification;3 optional deferred modernization candidates. These overlap; no expected count used.

PhaseA prefix is compared byte-normalized for line endings with its saved inventory before packaging. Every matrix row has exact file/lines,class,purpose,rationale,shared comparison,standards,status,evidence,action,Stage6 relevance and verification. Pure page-specific responsibilities are preserved in inventory and matrix rationale. No prior current-page review/register evidence was read before freeze. This is a targeted functional review; historical standards/general WA familiarity in this conversation were reused without consulting earlier experiment candidate lists.

All examination sources for this page were local workspace files plus the supplied assignment attachment. External source references inside historical local docs were not followed. No connector/Drive skill, website/GitHub/Render/database, browser or clipboard/print/service operation. Only the new three reports and ZIP were written; no code replacement,diff,script or installer created.

## Files examined/reused and hashes
| Local path | SHA-256 |
| --- | --- |
| README.md | AEEF796D5710FB0A892D48C1C07326937D15FE62495D5C2D642584C23E0C517D |
| AGENTS.md | F1DC56F8D5EF961C7195BDB36DE5C016EF804771DDA00DFB6474667A652BD3DD |
| CLAUDE.md | 1C585AFD6CC6AC63941188A451E965B1300ADAEA97615393D8333E27F332C18E |
| TechSummary.md | 62283CFAA0959AB05A9DE1F13E4A6108354B42457C573BCF5B4A14F58C9E57C6 |
| standard/WA_Core_Programming_Standards_DRAFT_v1.0_2026-11-12.md | 02CCC4B35E9CC0DE4218E23082CF17F0FBA444E6F1B9B088A778266FAE125361 |
| standard/WA_Detailed_Technical_Standards_DRAFT_v0.4.1_3A-3C_2026-11-12.md | F6BB22BAC44707BC2EC74E7111D0B3C1E73256958011974CF19929F6D0A50FD0 |
| standard/WA_Standards_Decision_Register_v1.0_2026-11-12.md | 48D944DECA7C4D03B465CF66C9082117E187AA8DB0221107FFFB8812E00E8FB2 |
| httpdocs/login.html | 8794E191954E75B9B7F68B3F2A43150977FF4C2A60075C162196FAEDF1ED297C |
| httpdocs/js/confetti.js | 005E0E4FD766DCFDE549949A358FB800BECAB63BB6A43E1C9675010942602541 |
| httpdocs/js/inputSanitizer.js | EEC2FA21E13FB1A3D831D12FFA38A35A72A3FA391ED612CB46553A5743E481C0 |
| httpdocs/js/waPlatform.js | 57A5AAE55188AB89D279DC69466414F14F2B3965B8C17F8F64EEB7D568ECC17D |
| httpdocs/sw.js | 2FC7D3AD3CDD8F528695FEC9B77BE8CD5EB4634F695EC19536EC0ACD0B05BD5E |
| routes/users.js | 5699A086DBC184DC3D84618D4CDBFC9C4B6239F992F2593CEC3FEE552F680998 |
| docs/WA_Standards_Compliance_Register.md | 94DCE444AED2F2679AE2579189680A863FA34FE01F19ED993A30FAFC327DB344 |
| docs/Stage6_Render_TestPlan.md | 67545A4732D3714D8948F081DC495DD61E6EA7137C1BB1CCF5C4EEDE3B771923 |
| docs/WA_R16-75_T12_Full_Regression_2026-11-15.tap | 25C06E0FF7D97B836C0BDCC77406F146DFA29F2FDE25535AB37A0ED2099FE37E |

Target/direct modules were inspected to the scope stated in Report1; backend and testing records only as necessary fragments. This manifest identifies files, not complete audits. Hashes captured during this examination are rechecked at packaging; the main source hash also matches its first observation. No blanket full-filesystem/untracked-file baseline claim.

## Deliverables/checks
- WA_login_Shared_Function_Review.md
- WA_login_Shared_Function_Matrix.csv
- WA_login_Review_Timing_and_Verification.md

Report1 SHA-256:856C387F5F008D23A041965B5F143D3679E1592CC1232E5EB2E2B2E2A40217DF.
CSV SHA-256:6753851A3EAB4F115735DE9CB702E8C087A047A38CF629B46AE3B5DE01BC4CB4.
Timing-report and ZIP final SHA-256 values are emitted after sealing; a file cannot embed its own final hash or enclosing ZIP hash without changing bytes.

ZIP:download/WA_login_Shared_Function_Review_2026-11-15.zip. Exactly3 entries must match staged SHA-256 hashes; no extraction or extra files. Matrix count/unique IDs/14 nonempty columns and frozen prefix are checked. Existing source/evidence hashes and Git status checked; original bday.html/logo.png deletions and untracked docs/download status are pre-existing,not introduced here.

PASS: inventory preserved; all candidates assessed; matrix complete; three ZIP member hashes match; reviewed source/evidence hashes unchanged. Final sealing repeats ZIP-byte verification.

Application tests/builds:NOT RUN (prohibited). R10/R14/R15 bounded results and Nov15 R16-75 T12 90/90 bounded offline PASS preserved; existing evidence read,none repeated. Source observations do not certify deployed behavior or complete Stage6. Corrections/installation/release not authorized. Stop this examination after verified package before starting next assigned page.

