import React from 'react';
import { createRoot } from 'react-dom/client';
import Layout from '../components/Layout.jsx';
import BlogPage from '../pages/BlogPage.jsx';
import '../styles.css';

createRoot(document.getElementById('root')).render(
  <Layout page="blog">
    <BlogPage />
  </Layout>
);
