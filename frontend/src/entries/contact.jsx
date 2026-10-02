import React from 'react';
import { createRoot } from 'react-dom/client';
import Layout from '../components/Layout.jsx';
import ContactPage from '../pages/ContactPage.jsx';
import '../styles.css';

createRoot(document.getElementById('root')).render(
  <Layout page="contact">
    <ContactPage />
  </Layout>
);
