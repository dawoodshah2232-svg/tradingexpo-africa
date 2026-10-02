import React, { useState, useMemo, useRef } from 'react';
import { useAssetBase } from '../lib/theme.jsx';
import { posts } from '../data/posts.js';

/* Blog listing — React port of the original client-side grid:
   search (180ms debounce) + category filters + result count. */
export default function BlogPage() {
  const ab = useAssetBase();
  const [activeCat, setActiveCat] = useState('All');
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const timer = useRef(null);

  const cats = useMemo(
    () => ['All', ...new Set(posts.map((p) => p.category))],
    []
  );

  const onSearch = (e) => {
    setQuery(e.target.value);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setDebounced(e.target.value.trim().toLowerCase()), 180);
  };

  const list = useMemo(() => posts.filter((p) => {
    const okCat = activeCat === 'All' || p.category === activeCat;
    const okQ = !debounced || (p.title + ' ' + p.excerpt + ' ' + p.category).toLowerCase().indexOf(debounced) > -1;
    return okCat && okQ;
  }), [activeCat, debounced]);

  return (
    <main>
      <section className="page-hero has-img" style={{ '--ph-img': `url('${ab}img/expo-networking.webp')` }}>
        <div className="container">
          <p className="eyebrow">Blog</p>
          <h1>Insights from the editorial team.</h1>
          <p className="section-lead">55 in-depth guides on forex, crypto, trading strategies, risk management and fintech for African traders — plus everything about Trading Expo Africa.</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="txi-blog-tools">
            <div className="txi-search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
              <input
                type="search"
                id="blogSearch"
                placeholder="Search articles… (e.g. stop-loss, risk management)"
                aria-label="Search articles"
                value={query}
                onChange={onSearch}
              />
            </div>
          </div>
          <div className="txi-filters" id="blogFilters" role="group" aria-label="Filter by category">
            {cats.map((c) => (
              <button
                key={c}
                className={'txi-filter' + (c === activeCat ? ' active' : '')}
                data-cat={c}
                onClick={() => setActiveCat(c)}
              >
                {c}
              </button>
            ))}
          </div>
          <p className="txi-count" id="blogCount">Showing {list.length} of {posts.length} articles</p>
          <div className="txi-blog-grid" id="blogGrid">
            {list.length ? list.map((p) => (
              <a className="txi-post-card" href={p.file} key={p.slug}>
                <img src={ab + 'img/' + p.img} alt={p.title} loading="lazy" />
                <div className="txi-post-body">
                  <span className="txi-tag">{p.category}</span>
                  <h2>{p.title}</h2>
                  <p>{p.excerpt}</p>
                  <span className="txi-meta">Editorial team &middot; {p.date} &middot; {p.read}</span>
                </div>
              </a>
            )) : (
              <div className="txi-empty">
                <h3>No articles found</h3>
                <p>Try a different search term or category.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
