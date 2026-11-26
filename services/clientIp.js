'use strict';

const { isIP } = require('node:net');
const { current } = require('./stage6Environment');

const STAGING_ORIGIN = 'https://wapps-stage6-test.onrender.com';

function singleIP(value) {
    if (typeof value !== 'string' || value.length === 0 || value.length > 45 ||
        value.trim() !== value || value.includes('%')) {
        return null;
    }
    const version = isIP(value);
    if (version === 4) return value;
    if (version !== 6) return null;

    // WHATWG URL canonicalizes equivalent IPv6 spellings. Collapse IPv4-mapped
    // IPv6 into the same identity as its IPv4 spelling.
    const canonical = new URL(`http://[${value}]/`).hostname.slice(1, -1);
    const mapped = /^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/.exec(canonical);
    if (!mapped) return canonical;
    const high = parseInt(mapped[1], 16);
    const low = parseInt(mapped[2], 16);
    return [high >> 8, high & 255, low >> 8, low & 255].join('.');
}

function trustedCfEnabled(env = process.env) {
    if (env.WA_TRUST_RENDER_CF_IP !== '1') return false;
    if (current.mode === 'staging') return current.publicOrigin === STAGING_ORIGIN;
    // An explicit production-only ingress assurance gate is required in addition
    // to the existing production environment/release checks. Never set it merely
    // because the staging investigation passed.
    return current.mode === 'production' &&
        env.WA_PRODUCTION_RELEASE_GATE === 'owner-authorized' &&
        env.WA_PRODUCTION_CF_INGRESS_VERIFIED === '1' &&
        env.WA_PRODUCTION_ORIGIN === current.publicOrigin;
}

function verifiedClientIp(req, env = process.env) {
    if (!trustedCfEnabled(env)) return null;
    // Do not use req.ip, X-Forwarded-For, or the shared Render socket peer.
    // Require exactly one actual header occurrence (no joined or duplicate values).
    if (!Array.isArray(req.rawHeaders)) return null;
    let value = null;
    let count = 0;
    for (let i = 0; i < req.rawHeaders.length; i += 2) {
        if (String(req.rawHeaders[i]).toLowerCase() === 'cf-connecting-ip') {
            count++;
            value = req.rawHeaders[i + 1];
        }
    }
    return count === 1 ? singleIP(value) : null;
}

module.exports = { singleIP, trustedCfEnabled, verifiedClientIp };
