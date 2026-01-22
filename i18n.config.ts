// i18n.config.ts
export default defineI18nConfig(() => ({
    legacy: false,
    fallbackLocale: 'uz', // Меняем на дефолтный язык проекта
    strictMessage: false,
    escapeHtml: false
}))