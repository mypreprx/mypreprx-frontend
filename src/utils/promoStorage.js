/**
 * Holds a promo code between "user opened the link / scanned the QR" and
 * "user finished logging in or signing up".
 *
 * The code is only ever stored locally. It is never validated here — an
 * anonymous visitor hitting /promo/<code> must not be able to probe which
 * codes exist, so validation happens exclusively on the server at redemption
 * time, once the account is known.
 */

const KEY = 'preprx.pendingPromo';
// A link that sat in a browser for days is not what the user just asked for.
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

const normalize = (code) =>
  String(code || '').toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 32);

export const savePendingPromo = (code) => {
  const normalized = normalize(code);
  if (!normalized) return null;

  try {
    // Both stores: localStorage survives a closed tab, sessionStorage covers
    // the case where storage is blocked and only a session store is available.
    const payload = JSON.stringify({ code: normalized, savedAt: Date.now() });
    localStorage.setItem(KEY, payload);
    sessionStorage.setItem(KEY, payload);
  } catch {
    // Storage can be unavailable (private mode / disabled cookies). The code
    // simply will not survive the login hop in that case.
  }

  return normalized;
};

export const getPendingPromo = () => {
  try {
    const raw = localStorage.getItem(KEY) || sessionStorage.getItem(KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    const code = normalize(parsed?.code);
    if (!code) return null;

    if (Date.now() - Number(parsed?.savedAt || 0) > MAX_AGE_MS) {
      clearPendingPromo();
      return null;
    }

    return code;
  } catch {
    return null;
  }
};

export const hasPendingPromo = () => Boolean(getPendingPromo());

export const clearPendingPromo = () => {
  try {
    localStorage.removeItem(KEY);
    sessionStorage.removeItem(KEY);
  } catch {
    // Nothing to clean up.
  }
};