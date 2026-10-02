import React from 'react';
import { createRoot } from 'react-dom/client';
import Layout from '../components/Layout.jsx';
import PortalPage from '../pages/PortalPage.jsx';
import '../styles.css';
import '../portal.css';

createRoot(document.getElementById('root')).render(
  <Layout page="portal">
    <PortalPage />
  </Layout>
);
