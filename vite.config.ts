import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'tiptap-vendor': ['@tiptap/react', '@tiptap/starter-kit', '@tiptap/extension-image', '@tiptap/extension-link', '@tiptap/extension-text-align', '@tiptap/extension-color', '@tiptap/extension-text-style', '@tiptap/extension-underline'],
          'bootstrap-vendor': ['bootstrap', 'react-bootstrap'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@tiptap/react', '@tiptap/starter-kit'],
  },
  define: {
    // Prevent React 19 strict mode issues
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
  },
})
