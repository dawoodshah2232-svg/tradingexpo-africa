import React from 'react';
import { createRoot } from 'react-dom/client';
import Layout from '../components/Layout.jsx';
import GalleryPage from '../pages/GalleryPage.jsx';
import '../styles.css';

createRoot(document.getElementById('root')).render(
  <Layout page="gallery">
    <GalleryPage />
  </Layout>
);
