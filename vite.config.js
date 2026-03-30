import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    // set /doxiny in build time for github pages action
    base: env.VITE_BASE_URL || '/',
    define: {
      __FIREBASE_CONFIG__: JSON.stringify({
        apiKey: env.VITE_FIREBASE_API_KEY || '',
        authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || '',
        projectId: env.VITE_FIREBASE_PROJECT_ID || '',
        storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || '',
        messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
        appId: env.VITE_FIREBASE_APP_ID || '',
        measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || ''
      })
    },
    build: {
      target: 'es2015',
      outDir: 'dist'
    },
    server: {
      port: 3000,
      open: true
    }
  }
})