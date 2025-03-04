import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import {copy} from 'vite-plugin-copy';

export default defineConfig({
  plugins: [
    react(),
    copy({
      targets: [
        { src: 'background.js', dest: 'dist' }, // Ensure this is the correct path
        { src: 'manifest.json', dest: 'dist' } // Adds the manifest.json to be copied to dist
      ],
      hook: 'writeBundle' // Ensures it happens at the right time in the build process
    })
  ],
});
