import { useState, useEffect, useRef } from 'react';
import { getDraft, saveOverrides, clearOverrides, asset, CONTENT_REPO_PATH } from '../lib/content.js';

/* Website Content admin — edit speakers, sponsors, gallery and site text.
   Drafts live in this browser (instant preview). "Publish to live site"
   commits content.json + new images to GitHub; the deploy workflow then
   rebuilds and publishes the site automatically. */

const REPO = 'dawoodshah2232-svg/tradingexpo-africa';
const TOKEN_KEY = 'tea_gh_token';
const uid = () => 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

const TABS = [
  ['speakers', 'Speakers'],
  ['sponsors', 'Sponsors'],
  ['mediaPartners', 'Media Partners'],
  ['gallery', 'Gallery'],
  ['site', 'Site text'],
  ['publish', 'Publish'],
];
const TIERS = ['Title Sponsor', 'Platinum', 'Gold', 'Silver', 'Bronze', 'Media Partner'];
const CATS = ['exhibition', 'conference', 'networking', 'venue', 'profx', 'brand'];

const fileToDataUrl = (file) => new Promise((res, rej) => {
  const r = new FileReader();
  r.onload = () => res(r.result);
  r.onerror = rej;
  r.readAsDataURL(file);
});

async function ghPut(repoPath, dataUrlOrText, isBinary, message, token) {
  const headers = { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' };
  let sha;
  try {
    const g = await fetch(`https://api.github.com/repos/${REPO}/contents/${repoPath}?ref=main`, { headers });
    if (g.ok) sha = (await g.json()).sha;
  } catch {}
  const content = isBinary ? String(dataUrlOrText).split(',')[1] : btoa(unescape(encodeURIComponent(dataUrlOrText)));
  const r = await fetch(`https://api.github.com/repos/${REPO}/contents/${repoPath}`, {
    method: 'PUT', headers,
    body: JSON.stringify({ message, content, branch: 'main', ...(sha ? { sha } : {}) }),
  });
  if (!r.ok) throw new Error('GitHub: ' + r.status + ' on ' + repoPath);
  return r.json();
}

function Img({ item, folder }) {
  const src = item._dataUrl || (item.photo || item.logo || item.src ? asset(item.photo || item.logo || item.src) : '');
  if (!src) return <div className="ca-thumb ca-empty">No image</div>;
  return <img className="ca-thumb" src={src} alt="" />;
}

export default function ContentAdmin() {
  const [tab, setTab] = useState('speakers');
  const [doc, setDoc] = useState(null);
  const [token, setToken] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [loadedFrom, setLoadedFrom] = useState('');
  const filesRef = useRef({});

  useEffect(() => {
    (async () => {
      const pub = { speakers: [], sponsors: [], gallery: [], site: {} };
      try {
        const mod = await import('../data/content.json');
        Object.assign(pub, mod.default || mod);
      } catch {}
      const draft = getDraft();
      const merged = {
        speakers: Array.isArray(draft.speakers) ? draft.speakers : (pub.speakers || []),
        sponsors: Array.isArray(draft.sponsors) ? draft.sponsors : (pub.sponsors || []),
        mediaPartners: Array.isArray(draft.mediaPartners) ? draft.mediaPartners : (pub.mediaPartners || []),
        gallery: Array.isArray(draft.gallery) ? draft.gallery : (pub.gallery || []),
        site: { ...(pub.site || {}), ...(draft.site || {}) },
      };
      setDoc(merged);
      setLoadedFrom(Object.keys(draft).length ? 'draft (unsaved changes present)' : 'published site');
    })();
    try { setToken(localStorage.getItem(TOKEN_KEY) || ''); } catch {}
  }, []);

  const set = (patch) => setDoc((d) => ({ ...d, ...patch }));
  const updItem = (list, id, patch) => set({ [list]: doc[list].map((it) => (it.id === id ? { ...it, ...patch } : it)) });
  const delItem = (list, id) => set({ [list]: doc[list].filter((it) => it.id !== id) });
  const moveItem = (list, id, dir) => {
    const arr = [...doc[list]];
    const i = arr.findIndex((it) => it.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    set({ [list]: arr });
  };

  const onPickImage = async (list, id, field, folder, file) => {
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
    const path = `img/${folder}/${id}.${ext}`;
    filesRef.current[id] = { file, path };
    updItem(list, id, { [field]: path, _dataUrl: dataUrl });
  };

  const addSpeaker = () => set({ speakers: [...doc.speakers, { id: uid(), name: '', title: '', company: '', photo: '' }] });
  const addSponsor = () => set({ sponsors: [...doc.sponsors, { id: uid(), brand: '', tier: 'Gold', logo: '', url: '' }] });
  const addMediaPartner = () => set({ mediaPartners: [...(doc.mediaPartners || []), { id: uid(), brand: '', logo: '', url: '' }] });
  const addGallery = () => set({ gallery: [...doc.gallery, { id: uid(), src: '', caption: '', cat: 'expo' }] });

  const saveDraft = () => {
    saveOverrides({ speakers: doc.speakers, sponsors: doc.sponsors, mediaPartners: doc.mediaPartners || [], gallery: doc.gallery, site: doc.site });
    setMsg({ ok: true, t: 'Draft saved in this browser. The live site preview updates immediately; publish to make it permanent.' });
  };
  const discardDraft = () => {
    clearOverrides();
    filesRef.current = {};
    setMsg({ ok: true, t: 'Draft discarded. Reloading published content…' });
    setTimeout(() => window.location.reload(), 800);
  };

  const saveToken = () => {
    try { localStorage.setItem(TOKEN_KEY, token.trim()); } catch {}
    setMsg({ ok: true, t: 'GitHub token saved in this browser only. It never goes into the website code.' });
  };

  const publish = async () => {
    const tk = token.trim();
    if (!tk) { setMsg({ ok: false, t: 'Paste your GitHub token first (Publish tab → GitHub token).' }); return; }
    setBusy(true);
    setMsg({ ok: true, t: 'Publishing… uploading new images, then the content file.' });
    try {
      // 1. new images
      for (const [id, f] of Object.entries(filesRef.current)) {
        const dataUrl = await fileToDataUrl(f.file);
        await ghPut('frontend/public/assets/' + f.path, dataUrl, true, `content: add image ${f.path}`, tk);
      }
      // 2. content.json (strip private _ keys)
      const clean = (arr) => arr.map((it) => { const c = { ...it }; Object.keys(c).forEach((k) => { if (k.startsWith('_')) delete c[k]; }); return c; });
      const payload = {
        version: 1,
        updatedAt: new Date().toISOString(),
        site: doc.site,
        speakers: clean(doc.speakers),
        sponsors: clean(doc.sponsors),
        mediaPartners: clean(doc.mediaPartners || []),
        gallery: clean(doc.gallery),
      };
      await ghPut(CONTENT_REPO_PATH, JSON.stringify(payload, null, 2), false, 'content: update via admin portal', tk);
      clearOverrides();
      filesRef.current = {};
      setMsg({ ok: true, t: 'Published! The site rebuilds automatically — changes go live in about 1–2 minutes.' });
    } catch (e) {
      setMsg({ ok: false, t: 'Publish failed: ' + (e.message || e) + '. Check the token has repo write access.' });
    }
    setBusy(false);
  };

  if (!doc) return <div className="card"><p>Loading website content…</p></div>;

  const counts = { speakers: doc.speakers.length, sponsors: doc.sponsors.length, mediaPartners: (doc.mediaPartners || []).length, gallery: doc.gallery.length };

  return (
    <div>
      <div className="card">
        <h3 style={{ margin: '0 0 6px' }}>Website Content</h3>
        <p className="card-sub">Edit speakers, sponsors, photos and site text. Loaded from: <strong>{loadedFrom}</strong>. Saving a draft updates the preview instantly in this browser; <strong>Publish</strong> makes it live for everyone.</p>
        <div className="ca-tabs">
          {TABS.map(([k, label]) => (
            <button key={k} className={'btn btn-sm' + (tab === k ? ' btn-primary' : ' btn-ghost')} onClick={() => setTab(k)}>
              {label}{counts[k] != null ? ` (${counts[k]})` : ''}
            </button>
          ))}
        </div>
      </div>

      {msg && <div className={'callout' + (msg.ok ? '' : ' danger')}><p>{msg.t}</p></div>}

      {tab === 'speakers' && (
        <div className="card">
          <div className="ca-head"><h4>Speakers</h4><button className="btn btn-sm btn-primary" onClick={addSpeaker}>+ Add speaker</button></div>
          {doc.speakers.map((s) => (
            <div className="ca-item" key={s.id}>
              <Img item={s} />
              <div className="ca-fields">
                <input value={s.name} placeholder="Full name" onChange={(e) => updItem('speakers', s.id, { name: e.target.value })} />
                <input value={s.title} placeholder="Job title" onChange={(e) => updItem('speakers', s.id, { title: e.target.value })} />
                <input value={s.company} placeholder="Company" onChange={(e) => updItem('speakers', s.id, { company: e.target.value })} />
                <label className="ca-file">Change photo <input type="file" accept="image/*" hidden onChange={(e) => onPickImage('speakers', s.id, 'photo', 'speakers', e.target.files[0])} /></label>
              </div>
              <div className="ca-ops">
                <button className="btn btn-sm btn-ghost" onClick={() => moveItem('speakers', s.id, -1)}>↑</button>
                <button className="btn btn-sm btn-ghost" onClick={() => moveItem('speakers', s.id, 1)}>↓</button>
                <button className="btn btn-sm btn-danger" onClick={() => delItem('speakers', s.id)}>Remove</button>
              </div>
            </div>
          ))}
          {!doc.speakers.length && <p className="card-sub">No speakers yet — add the first one above.</p>}
        </div>
      )}

      {tab === 'sponsors' && (
        <div className="card">
          <div className="ca-head"><h4>Sponsors &amp; partners</h4><button className="btn btn-sm btn-primary" onClick={addSponsor}>+ Add sponsor</button></div>
          {doc.sponsors.map((s) => (
            <div className="ca-item" key={s.id}>
              <Img item={s} />
              <div className="ca-fields">
                <input value={s.brand} placeholder="Brand name" onChange={(e) => updItem('sponsors', s.id, { brand: e.target.value })} />
                <select value={s.tier} onChange={(e) => updItem('sponsors', s.id, { tier: e.target.value })}>
                  {TIERS.map((t) => <option key={t}>{t}</option>)}
                </select>
                <input value={s.url} placeholder="Website URL (optional)" onChange={(e) => updItem('sponsors', s.id, { url: e.target.value })} />
                <label className="ca-file">Change logo <input type="file" accept="image/*" hidden onChange={(e) => onPickImage('sponsors', s.id, 'logo', 'sponsors', e.target.files[0])} /></label>
              </div>
              <div className="ca-ops">
                <button className="btn btn-sm btn-ghost" onClick={() => moveItem('sponsors', s.id, -1)}>↑</button>
                <button className="btn btn-sm btn-ghost" onClick={() => moveItem('sponsors', s.id, 1)}>↓</button>
                <button className="btn btn-sm btn-danger" onClick={() => delItem('sponsors', s.id)}>Remove</button>
              </div>
            </div>
          ))}
          {!doc.sponsors.length && <p className="card-sub">No sponsors yet — add the first one above.</p>}
        </div>
      )}

      {tab === 'mediaPartners' && (
        <div className="card">
          <div className="ca-head"><h4>Media Partners</h4><button className="btn btn-sm btn-primary" onClick={addMediaPartner}>+ Add media partner</button></div>
          {(doc.mediaPartners || []).map((m) => (
            <div className="ca-item" key={m.id}>
              <Img item={m} />
              <div className="ca-fields">
                <input value={m.brand} placeholder="Brand name" onChange={(e) => updItem('mediaPartners', m.id, { brand: e.target.value })} />
                <input value={m.url} placeholder="Website URL (optional)" onChange={(e) => updItem('mediaPartners', m.id, { url: e.target.value })} />
                <label className="ca-file">Upload logo <input type="file" accept="image/*" hidden onChange={(e) => onPickImage('mediaPartners', m.id, 'logo', 'media', e.target.files[0])} /></label>
              </div>
              <div className="ca-ops">
                <button className="btn btn-sm btn-ghost" onClick={() => moveItem('mediaPartners', m.id, -1)}>↑</button>
                <button className="btn btn-sm btn-ghost" onClick={() => moveItem('mediaPartners', m.id, 1)}>↓</button>
                <button className="btn btn-sm btn-danger" onClick={() => delItem('mediaPartners', m.id)}>Remove</button>
              </div>
            </div>
          ))}
          {!(doc.mediaPartners || []).length && <p className="card-sub">No media partners yet — add the first one above.</p>}
        </div>
      )}

      {tab === 'gallery' && (
        <div className="card">
          <div className="ca-head"><h4>Gallery photos</h4><button className="btn btn-sm btn-primary" onClick={addGallery}>+ Add photo</button></div>
          {doc.gallery.map((g) => (
            <div className="ca-item" key={g.id}>
              <Img item={g} />
              <div className="ca-fields">
                <input value={g.caption} placeholder="Caption" onChange={(e) => updItem('gallery', g.id, { caption: e.target.value })} />
                <select value={g.cat} onChange={(e) => updItem('gallery', g.id, { cat: e.target.value })}>
                  {CATS.map((c) => <option key={c}>{c}</option>)}
                </select>
                <label className="ca-file">Change photo <input type="file" accept="image/*" hidden onChange={(e) => onPickImage('gallery', g.id, 'src', 'profx', e.target.files[0])} /></label>
              </div>
              <div className="ca-ops">
                <button className="btn btn-sm btn-ghost" onClick={() => moveItem('gallery', g.id, -1)}>↑</button>
                <button className="btn btn-sm btn-ghost" onClick={() => moveItem('gallery', g.id, 1)}>↓</button>
                <button className="btn btn-sm btn-danger" onClick={() => delItem('gallery', g.id)}>Remove</button>
              </div>
            </div>
          ))}
          {!doc.gallery.length && <p className="card-sub">No gallery photos yet — add the first one above.</p>}
        </div>
      )}

      {tab === 'site' && (
        <div className="card">
          <div className="ca-head"><h4>Site text</h4></div>
          <label className="ca-label">Homepage tagline
            <input value={doc.site.heroTagline || ''} onChange={(e) => set({ site: { ...doc.site, heroTagline: e.target.value } })} />
          </label>
          <label className="ca-label">Homepage sub-heading
            <input value={doc.site.heroSub || ''} onChange={(e) => set({ site: { ...doc.site, heroSub: e.target.value } })} />
          </label>
          <label className="ca-label">Announcement banner (leave empty to hide)
            <input value={doc.site.announcement || ''} placeholder="e.g. Early-bird tickets now live" onChange={(e) => set({ site: { ...doc.site, announcement: e.target.value } })} />
          </label>
        </div>
      )}

      {tab === 'publish' && (
        <div className="card">
          <div className="ca-head"><h4>Publish to the live site</h4></div>
          <p className="card-sub">Publishing uploads new images and the updated content file to the website's GitHub repository. The site then rebuilds itself automatically — your changes appear live in about 1–2 minutes.</p>
          <label className="ca-label">GitHub token (needs <em>contents: write</em> access to the tradingexpo-africa repo)
            <input type="password" value={token} placeholder="ghp_… or fine-grained token" onChange={(e) => setToken(e.target.value)} />
          </label>
          <p className="card-sub">The token is stored only in this browser. It is never written into the website code.</p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '12px' }}>
            <button className="btn btn-sm btn-ghost" onClick={saveToken}>Save token</button>
            <button className="btn btn-sm btn-ghost" onClick={discardDraft}>Discard draft</button>
            <button className="btn btn-primary" disabled={busy} onClick={publish}>{busy ? 'Publishing…' : 'Publish to live site'}</button>
          </div>
        </div>
      )}

      {tab !== 'publish' && (
        <div className="card">
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={saveDraft}>Save draft (instant preview)</button>
            <button className="btn btn-ghost" onClick={() => setTab('publish')}>Go to Publish →</button>
          </div>
        </div>
      )}

      <style>{`
        .ca-tabs { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px; }
        .ca-tabs .btn { color: #0a1628 !important; }
        .ca-tabs .btn-primary { color: #fff !important; }
        .ca-head .btn-primary, .card .btn-primary { color: #fff !important; }
        .ca-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .ca-head h4 { margin: 0; }
        .ca-item { display: flex; gap: 12px; align-items: flex-start; padding: 12px 0; border-top: 1px solid var(--border, #eee); }
        .ca-thumb { width: 84px; height: 84px; object-fit: cover; border-radius: 10px; background: #111; flex: none; }
        .ca-empty { display: flex; align-items: center; justify-content: center; font-size: 11px; color: #888; border: 1px dashed #999; }
        .ca-fields { flex: 1; display: grid; gap: 8px; }
        .ca-fields input, .ca-fields select { width: 100%; padding: 9px 10px; border-radius: 8px; border: 1px solid var(--border, #ddd); font-size: 14px; }
        .ca-file { display: inline-block; padding: 8px 12px; border-radius: 8px; background: #f0f0f0; font-size: 13px; cursor: pointer; width: fit-content; }
        .ca-ops { display: flex; flex-direction: column; gap: 6px; }
        .ca-label { display: grid; gap: 6px; margin-bottom: 12px; font-size: 14px; font-weight: 600; }
        .ca-label input { font-weight: 400; padding: 10px; border-radius: 8px; border: 1px solid var(--border, #ddd); font-size: 14px; width: 100%; }
      `}</style>
    </div>
  );
}
