/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.webp', 'pwa-192x192.png', 'pwa-512x512.png'],
            workbox: {
                // Precache restrito ao App Shell e ícones (sprite_unreal < 4 KB já vai inline no bundle)
                globPatterns: ['**/*.{js,css,html,svg}'],
                runtimeCaching: [
                    {
                        urlPattern: ({ sameOrigin, url }) =>
                            sameOrigin && /\/assets\/[^/]+\.webp$/i.test(url.pathname),
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'sprite-images-v1',
                            cacheableResponse: {
                                statuses: [200],
                            },
                            expiration: {
                                maxEntries: 500,
                                maxAgeSeconds: 60 * 60 * 24 * 90,
                            },
                        },
                    },
                    {
                        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                        handler: 'StaleWhileRevalidate',
                        options: {
                            cacheName: 'google-fonts-stylesheets',
                            cacheableResponse: {
                                statuses: [0, 200],
                            },
                        },
                    },
                    {
                        urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'google-fonts-webfonts',
                            cacheableResponse: {
                                statuses: [0, 200],
                            },
                            expiration: {
                                maxEntries: 20,
                                maxAgeSeconds: 60 * 60 * 24 * 365,
                            },
                        },
                    },
                ],
            },
            manifest: {
                name: 'Pituchinhu',
                short_name: 'Pituchinhu',
                description:
                    'Rastreie, gerencie e compartilhe sua coleção de pituchinhos do Fortnite e seu progresso de dominação.',
                lang: 'pt-BR',
                theme_color: '#141218',
                background_color: '#141218',
                display: 'standalone',
                scope: './',
                start_url: './',
                icons: [
                    {
                        src: 'pwa-192x192.png',
                        sizes: '192x192',
                        type: 'image/png',
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any',
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'maskable',
                    },
                ],
            },
        }),
    ],
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
