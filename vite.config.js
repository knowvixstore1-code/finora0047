import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [],
      manifest: {
        name: 'Finora Personal Finance',
        short_name: 'Finora',
        description: 'Track your income, expenses, budgets and goals.',
        theme_color: '#0b1220',
        background_color: '#0b1220',
        display: 'standalone',
        start_url: '/',
        icons: [
  {
    src: '/pwa-192x192.png',
    sizes: '192x192',
    type: 'image/png'
  },
  {
    src: '/pwa-512x512.png',
    sizes: '512x512',
    type: 'image/png'
  }
]
      }
    })
  ]
})
