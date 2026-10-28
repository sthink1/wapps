/** Stage 6B-2 Home revoked-session UI correction. LOCAL ONLY.
 * Run from WonderfulAppsRender root: node tests/apply-stage6b2-revocation-fix.cjs
 * Does not access network/database, does not change any file except home.html and backup.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const root = process.cwd();
const file = path.join(root, 'httpdocs', 'home.html');
const platform = path.join(root, 'httpdocs', 'js', 'waPlatform.js');
if (!fs.existsSync(file) || !fs.existsSync(platform)) throw new Error('Run from project root with Group 2 installed.');
const old = fs.readFileSync(file, 'utf8');
let src = old;
function change(label, pattern, replacement) {
  const hits = [...src.matchAll(new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g'))];
  if (hits.length !== 1) throw new Error(`${label}: expected exactly 1 match; found ${hits.length}; no files changed.`);
  src = src.replace(pattern, replacement);
}
if (!src.includes('WA.session.restore()') || !src.includes('WA.session.logout()')) throw new Error('Expected Group 2 not found; no files changed.');
if (src.includes('waHomeAuthenticated')) throw new Error('Patch already applied or partial; no files changed.');

// Only server-confirmed sessions count as signed in. Decoded JWT is not authority.
change('isUserLoggedIn', /function isUserLoggedIn\(\)\s*\{\s*return localStorage\.getItem\('token'\) !== null;\s*\}/,
`function isUserLoggedIn() {
            return window.waHomeAuthenticated === true;
        }`);

change('DOMContentLoaded session restore', /(const waRestore = await WA\.session\.restore\(\);)/,
`$1
                // Trust the server-backed session check, not a decoded stale JWT.
                window.waHomeAuthenticated = waRestore.authenticated === true;`);

change('subscription token read', /(async function loadSubscriptionAccess\(\)\s*\{\s*)const token = localStorage\.getItem\('token'\);/,
`$1const token = window.waHomeAuthenticated === true
                ? localStorage.getItem('token') : null;`);

// On a subscription service failure never retain enabled restricted controls.
change('subscription response not-ok', /if \(!response\.ok\)\s*\{\s*throw new Error\(\s*'Unable to load subscription status\.'\s*\);\s*\}/,
`if (!response.ok) {
                    if (response.status === 401) {
                        window.waHomeAuthenticated = false;
                        localStorage.removeItem('token');
                    }
                    throw new Error('Unable to load subscription status.');
                }`);

change('subscription catch', /(async function loadSubscriptionAccess\(\)[\s\S]*?)(\} catch \(error\) \{\s*console\.error\(\s*'Subscription status error:',\s*error\s*\);\s*\})/,
(_match, before, section) => before + section.replace('console.error(',
`// Fail closed: permission lookup did not complete successfully.
                document.querySelectorAll('.restricted-btn').forEach(button => {
                    button.disabled = true;
                    button.title = 'Application access could not be verified.';
                });
                console.error(`));

change('display token read', /(\/\/ User display and logout logic\.\s*const token\s*=\s*)localStorage\.getItem\('token'\);/,
`$1window.waHomeAuthenticated === true
                    ? localStorage.getItem('token') : null;`);

change('admin check', /(async function isUserAdmin\(\)\s*\{\s*const token = localStorage\.getItem\('token'\);\s*)if \(!token\)/,
`$1if (!window.waHomeAuthenticated || !token)`);

// Leave tracked request payload unchanged but do not print JWT in Console.
change('sensitive usage log', /console\.log\(\s*'Sending time spent data:',\s*timeSpentData\s*\);/,
`console.log('Sending time spent data:', {
                                    page: timeSpentData.page,
                                    duration: timeSpentData.duration
                                });`);

const backup = file + '.group2-revocation-before';
if (fs.existsSync(backup)) throw new Error('Backup already exists: ' + backup + '; no files changed.');
fs.copyFileSync(file, backup, fs.constants.COPYFILE_EXCL);
try { fs.writeFileSync(file, src, 'utf8'); }
catch (error) { fs.copyFileSync(backup, file); throw error; }
console.log('Patched httpdocs/home.html. Backup: ' + backup);
console.log('Review git diff and test before any commit. No backend/DB/production changes.');
