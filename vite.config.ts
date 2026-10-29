import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  ssr: {
    // CommonJS default export; bundling it gives the prerender the same function the browser gets
    noExternal: ['stylis-plugin-rtl'],
  },
})
