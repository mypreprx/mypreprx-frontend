/**
 * Converts a stored profilePicture path (e.g. "uploads/xyz.jpg")
 * to a full absolute URL the browser can load.
 */
const BASE = import.meta.env.PROD
    ? 'https://api.mypreprx.com'
    : 'http://localhost:4001';

export const getAvatarUrl = (user, fallback) => {
    const pic = user?.profilePicture;
    if (!pic) return fallback;
    // Already a full URL (http/https or blob)
    if (pic.startsWith('http') || pic.startsWith('blob')) return pic;
    // Relative path from uploads folder
    return `${BASE}/${pic}`;
};
