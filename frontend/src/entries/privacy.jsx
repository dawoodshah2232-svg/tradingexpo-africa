import React from 'react';
import { createRoot } from 'react-dom/client';
import Layout from '../components/Layout.jsx';
import PrivacyPage from '../pages/PrivacyPage.jsx';
import '../styles.css';

createRoot(document.getElementById('root')).render(
  <Layout page="legal">
    <PrivacyPage />
  </Layout>
);
