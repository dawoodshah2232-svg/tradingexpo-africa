import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readdirSync, existsSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Multi-page app: every top-level page keeps its exact URL (tickets.html, …).
// Blog articles keep /blog/<slug>.html via generated shells.
const pages = [
  'index', 'tickets', 'exhibit', 'agenda', 'venue', 'gallery',
  'sponsors', 'awards', 'blog', 'faq', 'contact', 'portal',
  'privacy', 'terms',
];
const input = Object.fromEntries(
  pages.map((p) => [p, resolve(__dirname, `${p}.html`)])
);
const blogDir = resolve(__dirname, 'blog');
if (existsSync(blogDir)) {
  for (const f of readdirSync(blogDir)) {
    if (f.endsWith('.html')) {
      input[`blog/${f.replace(/\.html$/, '')}`] = resolve(blogDir, f);
    }
  }
}

export default defineConfig({
  plugins: [react()],
  // Relative asset URLs so the build works from any sub-path (GitHub Pages
  // project site, cPanel public_html, …).
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: { input },
  },
});
