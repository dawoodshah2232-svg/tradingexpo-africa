/* Content layer — speakers/sponsors/gallery/site text.
   Base data is bundled at build time from src/data/content.json (SEO-friendly).
   The admin's draft overrides in localStorage merge on top for instant preview.
   Paths in content.json are relative to the assets/ folder. */

import baseContent from '../data/content.json';

const OVERRIDE_KEY = 'tea_content_overrides';

function readOverrides() {
  try {
    const v = JSON.parse(localStorage.getItem(OVERRIDE_KEY));
    return v && typeof v === 'object' ? v : {};
  } catch { return {}; }
}

export function saveOverrides(patch) {
  try {
    const cur = readOverrides();
    localStorage.setItem(OVERRIDE_KEY, JSON.stringify({ ...cur, ...patch }));
    return true;
  } catch { return false; }
}

export function clearOverrides() {
  try { localStorage.removeItem(OVERRIDE_KEY); } catch {}
}

export function getOverrideInfo() {
  const o = readOverrides();
  return { hasDraft: Object.keys(o).length > 0, keys: Object.keys(o) };
}

function merge(base, over) {
  const out = { ...base };
  for (const k of ['speakers', 'sponsors', 'gallery']) {
    if (Array.isArray(over[k])) out[k] = over[k];
  }
  if (over.site && typeof over.site === 'object') out.site = { ...(base.site || {}), ...over.site };
  return out;
}

/* Returns the merged content (base + admin draft). Async for API compatibility. */
export async function loadContent() {
  return merge(baseContent, readOverrides());
}

/* Synchronous version for render paths that can't await. */
export function getContent() {
  return merge(baseContent, readOverrides());
}

/* Draft helpers used by the admin editor */
export function getDraft() {
  return readOverrides();
}

export function asset(path) {
  return 'assets/' + String(path || '').replace(/^assets\//, '').replace(/^\//, '');
}

/* Repo path the admin publishes content.json to (used by ContentAdmin). */
export const CONTENT_REPO_PATH = 'frontend/src/data/content.json';
