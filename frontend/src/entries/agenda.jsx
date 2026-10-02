import React from 'react';
import { createRoot } from 'react-dom/client';
import Layout from '../components/Layout.jsx';
import AgendaPage from '../pages/AgendaPage.jsx';
import '../styles.css';

createRoot(document.getElementById('root')).render(
  <Layout page="agenda">
    <AgendaPage />
  </Layout>
);
