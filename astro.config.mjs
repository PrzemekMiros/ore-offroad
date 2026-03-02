import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import netlify from '@astrojs/netlify';
import tailwindcss from '@tailwindcss/vite';
import robots from 'astro-robots-txt';
import sitemap from 'astro-sitemap';
import pagefind from 'astro-pagefind';

export default defineConfig({
  site: 'https://zdrowiebezpaniki.pl/',
  output: 'static',
  adapter: netlify(),
  integrations: [
    react(),
    sitemap(),
    robots({
      policy: [
        { userAgent: '*', allow: '/' }
      ],
      sitemap: 'https://zdrowiebezpaniki.pl/sitemap-index.xml'
    }),
    pagefind()
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});
