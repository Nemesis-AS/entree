import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import react from '@astrojs/react';

export default defineConfig({
  integrations: [react()],
  adapter: node({ mode: 'standalone' }),
  output: 'server',
  outDir: './dist',
  vite: {
    build: {
      cssCodeSplit: false,
    },
  },
});
