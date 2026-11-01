'use strict';
// TEMPORARY Stage 6 diagnostic. Remove after hosted verification.
const crypto = require('node:crypto');
const {isIP} = require('node:net');
const {current} = require('./stage6Environment');
const {clientIpForReset} = require('./passwordResetClientIp');

const ORIGIN = 'https://wapps-stage6-test.onrender.com';
function validIp(x) {
  return typeof x === 'string' && x.length > 0 && x.length <= 45 && x.trim() === x && isIP(x) !== 0;
}
function authorized(req) {
  const secret = process.env.WA_GROUP5E_VERIFY_KEY;
  if (current.mode !== 'staging' || current.publicOrigin !== ORIGIN ||
      process.env.WA_TRUST_RENDER_CF_IP !== '1' ||
      typeof secret !== 'string' || secret.length < 32) return false;
  const supplied = req.get('X-WA-Stage6-Diagnostic-Key');
  if (typeof supplied !== 'string') return false;
  const a = Buffer.from(secret, 'utf8');
  const b = Buffer.from(supplied, 'utf8');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
function handler(req, res) {
  res.set('Cache-Control', 'no-store');
  res.set('Pragma', 'no-cache');
  if (!authorized(req)) return res.status(404).json({error:'Not found'});
  const peer = req.socket && req.socket.remoteAddress;
  const cf = req.get('CF-Connecting-IP');
  const selected = clientIpForReset(req);
  // No IP literals, digests, token values, or forwarded-header contents returned.
  return res.status(200).json({
    stage: 'group5e-temporary',
    trustProxy: req.app.get('trust proxy') === true,
    cfPresent: typeof cf === 'string' && cf.length > 0,
    cfValidSingleIp: validIp(cf),
    peerValidSingleIp: validIp(peer),
    selectedEqualsCf: validIp(cf) && selected === cf.toLowerCase(),
    selectedEqualsPeer: validIp(peer) && selected === peer.toLowerCase(),
    cfEqualsPeer: validIp(cf) && validIp(peer) && cf.toLowerCase() === peer.toLowerCase(),
    xffPresent: Boolean(req.get('X-Forwarded-For'))
  });
}
module.exports = {handler};
