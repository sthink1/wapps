/* Wonderful Apps shared browser session facade — Stage 6B-2 Group 2.
 * Candidate only: no existing WA page loads this script yet.
 * Requires same-origin hosting. Does NOT modify window.fetch.
 */
(function (root) {
  'use strict';
  if (root.WA && root.WA.session) throw new Error('WA_PLATFORM_ALREADY_INSTALLED');

  const TOKEN_KEY = 'token'; // temporary compatibility with the existing WA pages
  const LOGOUT_KEY = 'wa_explicit_logout';
  const REFRESH_PATH = '/users/refresh-session';
  const STATUS_PATH = '/users/session-status';
  const LOGOUT_PATH = '/users/logout';
  const LOCK_NAME = 'wa-web-refresh';
  // Access tokens are retained in localStorage temporarily for legacy WA compatibility.
  // Ordinary sessions still expire server-side; only opted-in sessions have refresh cookies.
  const nativeFetch = root.fetch.bind(root);
  let refreshing = null;

  class ApiError extends Error {
    constructor(message, status, code) {
      super(message || `HTTP ${status}`);
      this.name = 'WAApiError'; this.status = status; this.code = code || null;
    }
  }
  function getToken() { return root.localStorage.getItem(TOKEN_KEY); }
  function clearToken() { root.localStorage.removeItem(TOKEN_KEY); }
  function setAccessToken(token) {
    if (typeof token !== 'string' || !token.trim()) throw new TypeError('ACCESS_TOKEN_REQUIRED');
    root.localStorage.setItem(TOKEN_KEY, token);
    root.localStorage.removeItem(LOGOUT_KEY);
  }
  function isLoggedOut() { return root.localStorage.getItem(LOGOUT_KEY) === '1'; }
  function assertPath(path) {
    const u = new URL(path, root.location.origin);
    if (u.origin !== root.location.origin || !u.pathname.startsWith('/')) throw new TypeError('SAME_ORIGIN_PATH_REQUIRED');
    if (typeof path !== 'string' || !path.startsWith('/') || path.startsWith('//')) throw new TypeError('ABSOLUTE_LOCAL_PATH_REQUIRED');
    if (u.username || u.password) throw new TypeError('CREDENTIALS_IN_URL_NOT_ALLOWED');
    return u.pathname + u.search + u.hash;
  }
  async function readError(response) {
    let data;
    try { data = await response.clone().json(); } catch (_) { /* non-JSON response */ }
    return new ApiError(
      (data && (data.message || data.error)) || `HTTP ${response.status}`,
      response.status,
      data && (data.code || data.error)
    );
  }
  async function raw(path, options, token) {
    const headers = new Headers((options && options.headers) || {});
    // Never allow caller-supplied headers to override the active session credentials.
    headers.delete('Authorization');
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return nativeFetch(assertPath(path), { ...options, headers, credentials: 'same-origin' });
  }
  function tokenExpired(token) {
    try {
      const part = token.split('.')[1];
      const payload = JSON.parse(root.atob(part.replace(/-/g, '+').replace(/_/g, '/')));
      return !Number.isFinite(payload.exp) || payload.exp * 1000 <= Date.now();
    } catch (_) { return true; }
  }
  async function refreshUnderLock(previousToken) {
    if (isLoggedOut()) throw new ApiError('LOGIN_REQUIRED', 401, 'LOGIN_REQUIRED');
    // Another tab may already have rotated the one-time cookie while waiting for this lock.
    const current = getToken();
    if (current && current !== previousToken && !tokenExpired(current)) return current;
    // If the original session was replaced by an explicit new login while waiting,
    // do not rotate the prior account's refresh cookie or overwrite the new token.
    const response = await raw(REFRESH_PATH, { method: 'POST', cache: 'no-store' });
    if (!response.ok) throw await readError(response);
    const data = await response.json();
    if (!data || typeof data.token !== 'string' || !data.token) throw new Error('INVALID_REFRESH_RESPONSE');
    if (isLoggedOut() || (getToken() !== current && getToken() !== previousToken)) {
      throw new ApiError('SESSION_CHANGED_DURING_REFRESH', 401, 'SESSION_CHANGED');
    }
    setAccessToken(data.token);
    return data.token;
  }
  async function refresh(previousToken = getToken()) {
    if (refreshing) return refreshing;
    refreshing = (async () => {
      if (root.navigator && root.navigator.locks && typeof root.navigator.locks.request === 'function') {
        return root.navigator.locks.request(LOCK_NAME, { mode: 'exclusive' }, () => refreshUnderLock(previousToken));
      }
      // Cross-tab exclusion is not safe without a supported lock. Fail closed instead of
      // presenting a routine simultaneous refresh as an apparent token replay.
      throw new Error('CROSS_TAB_LOCK_UNAVAILABLE');
    })();
    try { return await refreshing; } finally { refreshing = null; }
  }
  async function restore() {
    if (isLoggedOut()) return { authenticated: false, reason: 'explicit_logout' };
    const token = getToken();
    if (token && !tokenExpired(token)) {
      let response;
      try { response = await raw(STATUS_PATH, { method: 'GET', cache: 'no-store' }, token); }
      catch (error) { return { authenticated: false, reason: 'network', error }; }
      if (response.ok) return { authenticated: true, token, ...(await response.json()) };
      if (response.status !== 401) return { authenticated: false, reason: 'server_error', status: response.status };
    }
    try {
      const fresh = await refresh(token);
      return { authenticated: true, token: fresh, restored: true };
    } catch (error) {
      return { authenticated: false, reason: error.status === 401 ? 'login_required' : 'restore_unavailable', error };
    }
  }
  async function isAuthenticated() { return (await restore()).authenticated; }

  async function request(path, options = {}) {
    const method = String(options.method || 'GET').toUpperCase();
    if (isLoggedOut()) throw new ApiError('LOGIN_REQUIRED', 401, 'LOGIN_REQUIRED');
    // Validate paths before rotating a credential or contacting the server.
    assertPath(path);
    let token = getToken();
    if (!token || tokenExpired(token)) {
      token = await refresh(token); // Fail cleanly; never send a known-expired JWT.
    }
    const response = await raw(path, options, token);
    if (response.status !== 401) return response;
    // A rejected mutation can never be automatically replayed. Also avoid
    // rotating the cookie on its behalf: caller receives the original 401.
    if ((method !== 'GET' && method !== 'HEAD') || options.body !== undefined) return response;
    let fresh;
    try { fresh = await refresh(token); }
    catch (_) { return response; } // Preserve original 401 for GET refresh failures.
    if (isLoggedOut() || !getToken() || getToken() !== fresh) return response;
    return raw(path, options, fresh);
  }
  async function json(path, options) {
    const response = await request(path, options);
    if (!response.ok) throw await readError(response);
    if (response.status === 204) return null;
    return response.json();
  }
  async function logout() {
    let serverRevoked = false, error = null;
    const token = getToken();
    // If an access token expired, first obtain a fresh one for an authenticated
    // logout request. This works for remembered sessions only. Refresh uses the
    // same browser-tab lock as all other session renewals.
    let activeToken = token;
    try {
      if (!activeToken || tokenExpired(activeToken)) activeToken = await refresh(activeToken);
      // A concurrent explicit login may replace the account during refresh.
      // Never revoke the new account based on stale user intent.
      if (getToken() !== activeToken || isLoggedOut()) throw new Error('SESSION_CHANGED_DURING_LOGOUT');
      root.localStorage.setItem(LOGOUT_KEY, '1');
      const response = await raw(LOGOUT_PATH, { method: 'POST', cache: 'no-store' }, activeToken);
      if (!response.ok) throw await readError(response);
      serverRevoked = true;
    } catch (e) { error = e; }
    root.localStorage.setItem(LOGOUT_KEY, '1');
    clearToken();
    return { serverRevoked, error };
  }
  root.WA = Object.assign(root.WA || {}, {
    ApiError,
    session: { restore, isAuthenticated, logout, setAccessToken, getAccessToken: getToken },
    api: { request, json }
  });
})(window);
