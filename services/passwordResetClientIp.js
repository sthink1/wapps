'use strict';

// Preserve the existing service interface while sharing the narrower IP policy.
const { singleIP, trustedCfEnabled, verifiedClientIp } = require('./clientIp');

function clientIpForReset(req, env = process.env) {
    return verifiedClientIp(req, env);
}

module.exports = { singleIP, trustedCfEnabled, clientIpForReset };
