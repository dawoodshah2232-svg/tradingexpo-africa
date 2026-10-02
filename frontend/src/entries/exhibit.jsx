import React from 'react';
import { createRoot } from 'react-dom/client';
import Layout from '../components/Layout.jsx';
import ExhibitPage from '../pages/ExhibitPage.jsx';
import '../styles.css';

createRoot(document.getElementById('root')).render(
  <Layout page="exhibit">
    <ExhibitPage />
  </Layout>
);
