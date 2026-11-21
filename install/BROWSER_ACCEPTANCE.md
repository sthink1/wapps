# M03 — Single browser acceptance checklist (no actual merge)

Run on the local WA site backed by `wapps_test`. First obtain the one-time `M03_BROWSER_INPUT` JSON from `setup`. You will need one ordinary-user login and one verified administrator login. **Never paste actual access tokens, user passwords, or non-synthetic Person information into reports.**

| ID | Session | Action | Required outcome | Result |
|---|---|---|---|---|
| M03-L01 | Ordinary | Open One Tree review using `sourceFamilyTreeCode=olderCode` and `targetPersonID=newerPrivate` without any private-code authorization | HTTP 423 / privacy prompt; no private Person details or conflicts | NOT RUN |
| M03-L02 | Ordinary | Enter an incorrect privacy code for either private Person | No access, no private disclosure | NOT RUN |
| M03-L03 | Ordinary | Enter the correct synthetic code separately for both private Persons when prompted | Authenticated review loads, both private records and conflicts shown only after both verifications | NOT RUN |
| M03-L04 | Ordinary | Review the public duplicate group and ensure decisions are available | Public records display normally | NOT RUN |
| M03-L05 | Ordinary | Use DevTools to issue **one unauthorized** merge POST with no privacy capability, using fixture TreeCode/targetPersonID only and `decisions:[]`; **never click COMPLETE ONE TREE MERGE** | HTTP 423 with non-sensitive error; no merge write; no replay | NOT RUN |
| M03-L06 | Ordinary | Reload without code handoff and revisit review | Requires authorization again; does not leak details | NOT RUN |
| M03-L07 | Administrator | With centrally verified administrator account, open same synthetic review without entering codes | Authorized review displays normally | NOT RUN |
| M03-L08 | Any | Check browser console and Network response bodies | No private values before authorization; no codes/tokens in URL or diagnostic logs | NOT RUN |
| M03-L09 | Terminal | Run `verify` and then `cleanup` | No merge history; synthetic fixtures removed | NOT RUN |

## Safe local URLs

Use the **local** site base (for example `http://localhost:8080`, not Render):

`/FTOneTreeMerge.html?sourceFamilyTreeCode=<olderCode>&targetPersonID=<newerPrivate>`

This test intentionally does not submit any successful merge or undo. The merge/undo integration path remains explicitly NOT RUN until a separate tested rollback is available. A successful review and denial test should not be called full M03 release acceptance.

## One safe unauthorized merge request in ordinary-user Console

Replace the two placeholders only with the **synthetic fixture** values and execute **once** while logged in as the ordinary test account:

```javascript
(async () => {
  const token = localStorage.getItem('token');
  if (!token) return console.error('NOT RUN — no local test login');
  const response = await fetch('/familytree/one-tree/merge', {
    method: 'POST',
    headers: {'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json'},
    body: JSON.stringify({
      sourceFamilyTreeCode: '<olderCode>',
      targetPersonID: <newerPrivate>,
      decisions: [],
      bridge: {}
    })
  });
  const body = await response.json().catch(() => ({}));
  console.log({test:'M03-L05', status:response.status,
    code:body.code||null,
    pass:response.status===423 && body.code==='PRIVATE_LOCKED'});
})();
```

Do not copy actual bearer tokens to the chat. This explicitly tests a server-side privacy rejection; even an unexpected successful response must not be retried.
