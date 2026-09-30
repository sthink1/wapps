
---

### File 2 — `WA_TNNA_Additional_Design_Issues.md`

```markdown
# Additional Design Issues — WonderfulApps (WA) & TNNA

**Date:** September 30, 2026  
**Context:** Observations from `CLAUDE.md`, `TechSummary.md`, and `TNNA_Node_NVM_Technical_Review.md`  
**Purpose:** Surface secondary design / engineering risks that deserve attention after the Node version decision is settled.

---

## 1. Documentation Drift Risk (High priority)

`CLAUDE.md` and `TechSummary.md` are thorough and currently consistent with each other, but both still describe the pre-TNNA world. Once TNNA lands:

- The high-level file-structure diagrams omit the `TNNA/` Capacitor project.
- There is no statement of the dual-runtime (Node 18 vs 22) or future single-runtime policy.
- Capacitor, Android Studio, and native packaging constraints are absent.

**Recommendation:**  
After the Node migration and the first successful `cap add android`, add a short "TNNA / Native Packaging" section to both documents (or a dedicated `TNNA.md`) covering:

- Location of the Capacitor project
- Required Node version
- Relationship to the existing Town Notice / notification features
- What is *not* shared (no automatic reuse of WA Express routes inside the native shell without an explicit API contract)

---

## 2. Town Notification → TNNA Product Boundary (High priority)

The existing WA platform already contains notification/consent infrastructure, Family Tree notifications, and references to town-notice style functionality (`town_notice` app key). TNNA is described as a native app of the "Town Notification" capability.

Open design questions:

- Is TNNA a thin native shell around existing WA web pages, or a distinct client that talks to a subset of WA APIs?
- Which authentication model will the native app use (existing JWT + email verification, or a mobile-friendly refresh-token / deep-link flow)?
- Will TNNA honor the same subscription entitlements (`town_notice` or a new AppKey)?
- How will push notifications on device relate to the existing `NotificationPreferencesT` / suppression / Resend email path?

**Recommendation:**  
Produce a one-page product/architecture note that defines:

1. Auth contract for the native client  
2. Exact API surface TNNA is allowed to call  
3. Entitlement key and offline/online behavior  
4. Whether marketing / account / town notices share the same consent tables  

Do this before significant native UI work.

---

## 3. Payment Subscription Still Missing (Medium–High)

Both documents correctly state that payment processing is **not implemented**. Development and admin grants currently carry the product. As TNNA (and broader WA) approach real users, the lack of a billing path becomes a product and support risk.

**Recommendation:**  
Keep the current rule ("do not create payment.html or provider logic until requested"), but add an explicit milestone in the project plan so the gap is visible rather than rediscovered later.

---

## 4. MySQL 5.5 Compatibility Constraint (Medium)

The stack deliberately stays compatible with MySQL 5.5.62. This constrains:

- JSON column usage
- CTEs / window functions
- Modern datetime / generated-column patterns
- Some ORM or migration-tool assumptions

Family Tree merge/undo and Networking already contain careful 5.5-compatible workarounds (e.g. `moveComponentToTree`).

**Recommendation:**  
Treat any future schema change as a dual review: (a) does it work on 5.5, and (b) is there a planned path to a supported MySQL 8.x host? Document the host upgrade as a separate tracked item so the constraint does not become permanent by accident.

---

## 5. Dual Tracking Systems (Medium)

Two usage systems coexist:

- `TrackUsageT` / `/track` (general analytics)
- `UserUsageT` (subscription-oriented events)

The documents correctly warn against casually merging them. Over time the distinction can confuse new contributors and reporting.

**Recommendation:**  
Add a short decision record that states the intended long-term ownership of each table, or schedule a deliberate consolidation once subscription billing exists.

---

## 6. Family Tree Complexity & Test Surface (Medium)

Family Tree now includes:

- Explicit siblings (`FTSiblingT`)
- Snapshot-based One Tree Merge + Undo
- Separated-tree / current-tree semantics
- Family Networking with verification tokens and blood-line search
- R2 image handling

This is high-value and high-risk. The September 2026 undo test is good evidence, but the surface area is large.

**Recommendation:**  
Maintain a minimal automated or scripted regression set for:

- Merge → Undo round-trip
- Sibling preservation across move/merge
- Network search eligibility rules (living, verified, blood-line, email match)
- Split-view persistence across logout/login

Even a small checklist executed before each Family Tree release will repay the effort.

---

## 7. Frontend Security Standards vs. Future Native Shell (Medium)

WA has solid rules for:

- `inputSanitizer.js` + DOMPurify
- Safe output (`textContent` preferred)
- `color-scheme: only light`
- Pretty-formatted HTML

When the same HTML/JS is loaded inside a Capacitor WebView, those rules remain necessary but are no longer sufficient by themselves (deep links, file URLs, plugin bridges, back-button behavior, offline cache).

**Recommendation:**  
When TNNA begins loading real WA pages (or a dedicated subset), extend the security checklist with WebView-specific items: navigation allow-lists, deep-link validation, and clear separation between trusted native bridges and untrusted web content.

---

## 8. Repository & Deployment Hygiene (Low–Medium)

- `*Dump.sql` is intentionally git-ignored. That is fine for secrets/size, but the "current schema authority" then lives only on local/Drive copies. Risk of drift between developers increases.
- TNNA lives inside the same repo on branch `townNNA`. Confirm whether production WA deploy pipelines accidentally pick up `TNNA/node_modules` or Android build artifacts.
- CORS origins and `PUBLIC_BASE_URL` must stay environment-specific; native apps often need additional allowed origins or a dedicated API base URL.

**Recommendation:**  
- Document how the canonical `wappsDump.sql` is shared (Drive location, naming convention, who updates it).  
- Add `TNNA/android`, `TNNA/ios`, and large native build outputs to `.gitignore` if not already present.  
- Keep WA and TNNA deploy artifacts clearly separated.

---

## 9. Admin Identity Model (Low–Medium)

Administrator recognition is currently `UserID === 1` or `ADMIN_USERNAME`. This is simple and works for a single-operator project, but is brittle for future multi-admin or audited support scenarios.

**Recommendation:**  
Leave as-is for now; when a second administrator is needed, move to an explicit role/flag rather than expanding hard-coded IDs.

---

## 10. Node / Toolchain Long-Term Policy (Low once migration is done)

After the NVM migration:

- Record the supported Node versions in `CLAUDE.md` / `TechSummary.md`.
- Prefer one runtime (Node 22 LTS) as soon as WA passes the regression list.
- Pin Capacitor packages deliberately; the earlier CLI/core mismatch already caused a Gradle problem and should not be repeated.

---

## Suggested Priority Order

1. Complete the Node / NVM migration (blocking TNNA).  
2. Write the short TNNA ↔ WA product/API boundary note.  
3. Update `CLAUDE.md` / `TechSummary.md` (or add `TNNA.md`) for the native project and runtime policy.  
4. Keep Family Tree regression checklist current.  
5. Track MySQL host upgrade and payment milestone as visible future work.  
6. Address dual usage tables and admin-role hardening when capacity allows.

None of the items above require changing the recommended NVM dual-version plan. They are independent follow-on design concerns.

---

*End of additional design-issues note*