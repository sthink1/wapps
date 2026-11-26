'use strict';
// Stage 6 Group 5E candidate: password-reset endpoint only.
// Trust in CF-Connecting-IP requires separate ingress assurance; OFF by default.
const {isIP} = require('node:net');
const {current} = require('./stage6Environment');
const STAGING_ORIGIN = 'https://wapps-stage6-test.onrender.com';

function singleIP(v) {
  if (typeof v !== 'string' || v.length === 0 || v.length > 45 || v.trim() !== v) return null;
  return isIP(v) ? v.toLowerCase() : null;
}
function trustedCfEnabled(env = process.env) {
  return env.WA_TRUST_RENDER_CF_IP === '1' &&
    current.mode === 'staging' &&
    current.publicOrigin === STAGING_ORIGIN;
}
function clientIpForReset(req, env = process.env) {
  // Never accept X-Forwarded-For as authority. Express stays trust proxy=false.
  const peer = singleIP(req.socket && req.socket.remoteAddress) || 'unknown';
  if (!trustedCfEnabled(env)) return peer;
  const cf = singleIP(req.get('CF-Connecting-IP'));
  return cf || peer;
}
module.exports = {singleIP, trustedCfEnabled, clientIpForReset};
