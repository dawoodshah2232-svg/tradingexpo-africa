import React from 'react';
import { createRoot } from 'react-dom/client';
import Layout from '../components/Layout.jsx';
import HomePage from '../pages/HomePage.jsx';
import { Preloader } from '../components/ui.jsx';
import '../styles.css';

createRoot(document.getElementById('root')).render(
  <Layout page="home" managedPreloader={true}>
    <Preloader />
    <HomePage />
  </Layout>
);
