'use strict';

// Stage 6A — shared verification primitive. NOT wired into routes yet.
// Requires issuance changes before activation; legacy JWTs intentionally fail.
const jwt = require('jsonwebtoken');

class AuthenticationError extends Error {
  constructor(code, status = 401) {
    super(code);
    this.code = code;
    this.status = status;
  }
}

function requirePositiveInteger(value) {
  const n = Number(value);
  if (!Number.isSafeInteger(n) || n < 1) throw new AuthenticationError('TOKEN_INVALID');
  return n;
}

function requireVersion(value) {
  return requirePositiveInteger(value);
}

/**
 * Verify JWT signature/expiry plus live database revocation state.
 * Database outages FAIL CLOSED (503), never create an authentication bypass.
 * Uses a MySQL2 pool or transaction connection supporting query(sql, args).
 *
 * Expected website JWT: { userId, username, client:'web', sid: <32-char hex>, securityVersion }
 * Expected TNNA JWT: { userId, username, client:'tnna', securityVersion }
 */
async function verifyAccessToken(token, { database, jwtSecret, now = new Date() }) {
  if (!token || typeof token !== 'string') throw new AuthenticationError('TOKEN_MISSING');
  if (!jwtSecret) throw new Error('JWT secret must be configured');
  let claims;
  try {
    claims = jwt.verify(token, jwtSecret, { algorithms: ['HS256'] });
  } catch (_) {
    throw new AuthenticationError('TOKEN_INVALID_OR_EXPIRED');
  }
  const userId = requirePositiveInteger(claims.userId);
  const securityVersion = requireVersion(claims.securityVersion);
  if (claims.client !== 'web' && claims.client !== 'tnna') {
    throw new AuthenticationError('TOKEN_INVALID');
  }
  if (claims.client === 'web' && !/^[a-f0-9]{32}$/.test(claims.sid || '')) {
    throw new AuthenticationError('TOKEN_INVALID');
  }
  try {
    const [secRows] = await database.query(
      'SELECT SecurityVersion FROM UserSecurityT WHERE UserID = ? LIMIT 1',
      [userId]
    );
    if (secRows.length !== 1 || Number(secRows[0].SecurityVersion) !== securityVersion) {
      throw new AuthenticationError('ACCOUNT_CREDENTIALS_REVOKED');
    }
    if (claims.client === 'web') {
      const [sessions] = await database.query(
        `SELECT WebSessionID FROM WebSessionT
          WHERE UserID = ? AND SessionPublicID = ? AND RevokedAt IS NULL
            AND ExpiresAt > ? AND AbsoluteExpiresAt > ? LIMIT 1`,
        [userId, claims.sid, now, now]
      );
      if (sessions.length !== 1) throw new AuthenticationError('SESSION_EXPIRED_OR_REVOKED');
    }
    return {
      userId,
      username: claims.username,
      client: claims.client,
      securityVersion,
      ...(claims.client === 'web' ? { sessionPublicId: claims.sid } : {})
    };
  } catch (error) {
    if (error instanceof AuthenticationError) throw error;
    throw new AuthenticationError('AUTH_SERVICE_UNAVAILABLE', 503);
  }
}

module.exports = { verifyAccessToken, AuthenticationError };
