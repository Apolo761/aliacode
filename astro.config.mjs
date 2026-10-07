import { defineConfig } from 'astro/config';
import { access, copyFile } from 'node:fs/promises';

export default defineConfig({
  site: 'https://aliacode.com',
  output: 'static',
  trailingSlash: 'always',
  integrations: [{
    name: 'localized-cloudflare-404',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        // Pages looks for a 404.html in the requested directory before falling back to the root.
        const destination = new URL('en/404.html', dir);
        await access(destination).catch(() => copyFile(new URL('en/404/index.html', dir), destination));
      },
    },
  }],
});
