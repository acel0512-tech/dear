
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Use '.' for the current directory to avoid TypeScript errors with process.cwd()
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    define: {
      // 讓瀏覽器端也能讀取 process.env.API_KEY (Vercel 環境變數)
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      'process.env.FIREBASE_CONFIG': JSON.stringify(env.FIREBASE_CONFIG)
    },
    build: {
      outDir: 'dist',
      sourcemap: true
    }
  };
});
