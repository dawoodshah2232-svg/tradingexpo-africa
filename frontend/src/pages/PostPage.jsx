import React from 'react';
import { postBySlug } from '../data/posts.js';

/* Single blog article — renders the extracted article HTML verbatim so the
   page is pixel-identical to the original static post. */
export default function PostPage({ slug }) {
  const post = postBySlug[slug];
  if (!post) {
    return (
      <main>
        <section className="page-hero"><div className="container">
          <p className="eyebrow">Blog</p>
          <h1>Article not found</h1>
          <p className="section-lead">The article you are looking for does not exist.</p>
          <p><a className="txi-back" href="../blog.html">&larr; Back to all articles</a></p>
        </div></section>
      </main>
    );
  }
  return (
    <main>
      <section className="page-hero"><div className="container">
        <p className="eyebrow">Blog &middot; {post.category}</p>
        <h1>{post.title}</h1>
        <div className="txi-byline">
          <span><strong>Trading Expo Africa editorial team</strong></span>
          <span>&middot;</span>
          <span>{post.bylineDate || post.date}</span>
          <span>&middot;</span>
          <span>{post.read}</span>
        </div>
      </div></section>
      <section className="section"><div className="container">
        <div className="txi-article" dangerouslySetInnerHTML={{ __html: post.html }} />
      </div></section>
    </main>
  );
}
