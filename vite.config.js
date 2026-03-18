import { defineConfig } from 'vite'

export default defineConfig({
  base: '/doxiny/', // Replace 'doxiny' with your repo name
  build: {
    target: 'es2015',
    outDir: 'dist'
  },
  server: {
    port: 3000,
    open: true
  }
})