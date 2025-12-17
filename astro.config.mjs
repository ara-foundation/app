// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';
import node from '@astrojs/node';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://astro.build/config
// @ts-ignore
export default defineConfig({
  integrations: [react()],
  output: 'server',
  // Only set outDir for local development; Vercel adapter manages .vercel/output itself
  ...(process.env.NODE_ENV === "DEVELOPMENT" && { outDir: './dist' }),
  adapter: process.env.NODE_ENV === "DEVELOPMENT" ? node({ mode: 'standalone' }) : vercel({}),
  vite: {
    plugins: [tailwindcss(), tsconfigPaths()],
    build: {
      css: {
        devSourcemap: true,
        transformer: "postcss"
      },
      rollupOptions: {
        external: ['mongodb', 'util', 'crypto']
      }
    },
    ssr: {
      noExternal: ['timeago-react'],
      external: ['mongodb', 'util', 'crypto'],
    },
    resolve: {
      conditions: ['import', 'module', 'browser', 'default'],
    },
    server: {
      https: {
        key: './localhost-key.pem',
        cert: './localhost.pem',
      },
      watch: {
      }
    }
  }
});