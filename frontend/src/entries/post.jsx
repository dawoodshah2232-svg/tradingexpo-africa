import React from 'react';
import { createRoot } from 'react-dom/client';
import Layout from '../components/Layout.jsx';
import PostPage from '../pages/PostPage.jsx';
import '../styles.css';
import '../blog-post-styles.css';

// Slug comes from the URL: /blog/<slug>.html
const m = window.location.pathname.match(/\/blog\/([^/]+)\.html$/);
const slug = m ? m[1] : '';

createRoot(document.getElementById('root')).render(
  <Layout page="blog" assetBase="../assets/" linkBase="../">
    <PostPage slug={slug} />
  </Layout>
);
