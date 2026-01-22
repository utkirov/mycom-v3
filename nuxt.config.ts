// nuxt.config.ts
export default defineNuxtConfig({
    ssr: true,
    compatibilityDate: '2024-11-01',
    devtools: { enabled: true },

    app: {
        head: {
            viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
            meta: [
                { name: 'format-detection', content: 'telephone=no' },
                { name: 'HandheldFriendly', content: 'true' }
            ]
        },
        pageTransition: { name: 'page', mode: 'out-in' },
        layoutTransition: { name: 'layout', mode: 'out-in' }
    },

    modules: [
        '@pinia/nuxt',
        '@nuxtjs/tailwindcss',
        '@nuxtjs/google-fonts',
        '@nuxt/icon',
        '@nuxt/image',
        '@nuxtjs/i18n'
    ],

    image: {
        domains: ['crm.mycom.uz', 'mycom.uz'],
        quality: 80,
        format: ['webp', 'avif', 'jpeg']
    },

    i18n: {
        baseUrl: 'https://mycom.uz',
        locales: [
            { code: 'ru', iso: 'ru-UZ', name: 'Русский', file: 'ru.ts' },
            { code: 'uz', iso: 'uz-UZ', name: 'O\'zbekcha', file: 'uz.ts' },
            { code: 'en', iso: 'en-UZ', name: 'English', file: 'en.ts' }
        ],
        // Включаем ленивую загрузку переводов (экономит трафик)
        lazy: true,
        langDir: 'locales/',
        defaultLocale: 'uz',
        strategy: 'prefix_except_default',
        detectBrowserLanguage: {
            useCookie: true,
            cookieKey: 'i18n_redirected',
            redirectOn: 'root',
        },
        vueI18n: './i18n.config.ts',
        // Отключаем строгие проверки, чтобы HTML теги в переводах работали корректно
        compilation: {
            strictMessage: false,
            escapeHtml: false
        }
    },

    googleFonts: {
        families: {
            Mulish: [400, 600, 700],
            Unbounded: [400, 700]
        },
        display: 'swap',
        prefetch: true,
        preconnect: true,
    },

    runtimeConfig: {
        public: {
            apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://api.mycom.uz',
        }
    },

    css: ['~/assets/css/tailwind.css'],

    nitro: {
        prerender: {
            failOnError: false
        },
        compressPublicAssets: true,
    },

    build: {
        transpile: ['swiper']
    }
})