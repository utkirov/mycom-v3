// i18n.config.ts
export default defineI18nConfig(() => ({
    legacy: false,
    locale: 'ru',
    // Разрешаем HTML в строках перевода
    strictMessage: false,
    escapeHtml: false,
    fallbackLocale: 'ru'
}))