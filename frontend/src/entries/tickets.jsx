import React from 'react';
import { createRoot } from 'react-dom/client';
import Layout from '../components/Layout.jsx';
import TicketsPage from '../pages/TicketsPage.jsx';
import '../styles.css';

createRoot(document.getElementById('root')).render(
  <Layout page="tickets">
    <TicketsPage />
  </Layout>
);
