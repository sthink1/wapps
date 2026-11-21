# WA M03 test-harness defect correction (not application source)

- Root cause: mysql2/promise `connection.query()` returns `[rows, fields]`, so `const [trees]` is an **array** and `trees.n` is undefined. `Number(undefined)` evaluates to `NaN` and falsely triggers the post-rollback assertion. Identical bug affected Person count.
- Fix: `const [[treeCount]]` and `const [[personCount]]`, then read `.n` from the first row. No SQL, transaction flow, fixture writes, security checks, or operational route code changed.
- New read-only verifier: searches `FamilyTreeT` for `M03SC-%` codes and `FTPersonT` for named synthetic `Scope* Fixture` Persons after a failed assertion. Does **not** delete or mutate anything.
- Limit: because the earlier script did not print its random nonce, this check covers **all matching fixture prefixes**, which may include older independently created test fixtures. If rows exist, report IDs for investigation; do not assume they belong to the immediately preceding run.
- Independent checks: JS syntax validated for both files; unified diff reviewed; SHA-256 manifest generated. **No live database connection/test executed by assistant.**
- Preserve owner-reported 7/7 PASS; initial post-rollback check is INVALID due to harness bug until read-only check returns clean.
