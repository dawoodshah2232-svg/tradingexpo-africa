import React from 'react';
import { createRoot } from 'react-dom/client';
import Layout from '../components/Layout.jsx';
import AwardsPage from '../pages/AwardsPage.jsx';
import '../styles.css';

createRoot(document.getElementById('root')).render(
  <Layout page="awards">
    <AwardsPage />
  </Layout>
);
