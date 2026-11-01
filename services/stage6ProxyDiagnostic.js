'use strict';
// Temporary staging-only diagnostic. Does not log or return raw IP addresses.
// Disabled unless WA_ENV=staging and WA_PROXY_AUDIT_KEY is configured.
// IMPORTANT: remove from server.js and delete this file after test.
const crypto = require('node:crypto');
const { timingSafeEqual, createHmac } = crypto;
const key = process.env.WA_PROXY_AUDIT_KEY || '';
const enabled = process.env.WA_ENV === 'staging' && key.length >= 32;
let count = 0;
function same(a,b) {
  const x=Buffer.from(String(a||'')); const y=Buffer.from(String(b||''));
  return x.length === y.length && timingSafeEqual(x,y);
}
function fingerprint(value) {
  if (!value) return null;
  return createHmac('sha256',key).update(String(value)).digest('hex').slice(0,16);
}
module.exports = function stage6ProxyDiagnostic(req,res) {
  res.set('Cache-Control','no-store');
  if (!enabled) return res.sendStatus(404);
  if (!same(req.get('X-WA-Proxy-Audit-Key'),key)) return res.sendStatus(404);
  if (req.method !== 'GET') return res.sendStatus(405);
  if (++count > 20) return res.sendStatus(429);
  const xff = req.get('X-Forwarded-For') || '';
  const hops = xff.split(',').map(s=>s.trim()).filter(Boolean);
  // Fingerprints permit comparison between requests without publishing addresses.
  return res.json({
    audit: 'Group5E',
    trustProxy: req.app.get('trust proxy'),
    peerTag: fingerprint(req.socket.remoteAddress),
    expressTag: fingerprint(req.ip),
    forwardedCount: hops.length,
    forwardedTags: hops.map(fingerprint),
    protoHeaderPresent: Boolean(req.get('X-Forwarded-Proto')),
    cfConnectingIpPresent: Boolean(req.get('CF-Connecting-IP')),
    cfConnectingIpTag: fingerprint(req.get('CF-Connecting-IP')),
    expressMatchesPeer: req.ip === req.socket.remoteAddress,
    // The browser/client can inject a marker in XFF; compare its *position* only.
    // This endpoint does not recommend trusting any hop based solely on a count.
  });
};
