'use strict';
// TEMPORARY staging-only CF-Connecting-IP provenance diagnostic.
// Never returns or logs raw client addresses or headers.
const { createHmac, timingSafeEqual } = require('node:crypto');
const { isIP } = require('node:net');
let requests = 0;
const secret = process.env.WA_CF_PROBE_KEY || '';
const enabled = process.env.WA_ENV === 'staging' && secret.length >= 32;
function authorized(provided) {
  const a = Buffer.from(provided || '');
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}
function tag(s) {
  if (!s) return null;
  return createHmac('sha256', secret).update(s).digest('hex').slice(0, 16);
}
module.exports = function stage6CfHeaderProbe(req, res) {
  res.set('Cache-Control', 'no-store');
  if (!enabled || !authorized(req.get('X-WA-CF-Probe-Key'))) return res.sendStatus(404);
  if (req.method !== 'GET') return res.sendStatus(405);
  if (++requests > 12) return res.sendStatus(429);
  const cf = (req.get('CF-Connecting-IP') || '').trim();
  const xff = (req.get('X-Forwarded-For') || '').split(',').map(x=>x.trim()).filter(Boolean);
  res.json({
    probe: 'Group5E-CF',
    trustProxy: req.app.get('trust proxy'),
    cfPresent: Boolean(cf),
    cfValidSingleIP: Boolean(isIP(cf)),
    cfTag: tag(cf),
    peerTag: tag(req.socket.remoteAddress || ''),
    forwardedCount: xff.length,
    firstForwardedTag: tag(xff[0] || ''),
    cfEqualsFirstForwarded: Boolean(cf && xff[0] && cf === xff[0])
  });
};
