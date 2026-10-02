import React from 'react';
import { createRoot } from 'react-dom/client';
import Layout from '../components/Layout.jsx';
import SpeakersPage from '../pages/SpeakersPage.jsx';
import '../styles.css';

createRoot(document.getElementById('root')).render(
  <Layout page="speakers">
    <SpeakersPage />
  </Layout>
);
