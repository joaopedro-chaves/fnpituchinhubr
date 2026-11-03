import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
    plugins: [react(), VitePWA({
        registerType: 'autoUpdate',
        workbox: {
            globPatterns: ['**/*.{js,css,html,svg,webp}']
        },
        manifest: {
            name: 'FNPituchinhu BR',
            short_name: 'FNPituchinhu',
            description: 'Aplicativo FNPituchinhu em React',
            lang: 'pt-BR',
            theme_color: '#1a1a1a',
            background_color: '#1a1a1a',
            display: 'standalone',
            scope: './',
            start_url: './',
            icons: [
                {
                    src: 'pwa-192x192.png',
                    sizes: '192x192',
                    type: 'image/png'
                },
                {
                    src: 'pwa-512x512.png',
                    sizes: '512x512',
                    type: 'image/png',
                    purpose: 'any'
                },
                {
                    src: 'pwa-512x512.png',
                    sizes: '512x512',
                    type: 'image/png',
                    purpose: 'maskable'
                }
            ]
        }
    })],
    base: './',
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
    },
    test: {
        environment: 'node',
        include: ['src/**/*.test.js'],
    },
});
