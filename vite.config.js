import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['@react-aria/utils'],
    exclude: [
      'firebase',
      'firebase/app',
      'firebase/auth',
      'firebase/firestore',
      'firebase/storage',
    ],
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
      include: [/node_modules/, /firebase/, /@react-aria\/utils/],
    }
  }
})
