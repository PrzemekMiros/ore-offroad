import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import robots from 'astro-robots-txt';
import sitemap from 'astro-sitemap';
import pagefind from 'astro-pagefind';

const siteUrl = process.env.SITE_URL || 'https://ore-offroad.pl';

export default defineConfig({
  site: siteUrl,
  output: 'static',
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
    },
  },
  integrations: [
    react(),
    sitemap(),
    robots({
      policy: [
        { userAgent: '*', allow: '/' }
      ],
      sitemap: `${siteUrl}/sitemap-index.xml`
    }),
    pagefind()
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});
