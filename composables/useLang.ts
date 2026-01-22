// composables/useLang.ts
import ru from '~/i18n/locales/ru'
import en from '~/i18n/locales/en'
import uz from '~/i18n/locales/uz'

export const useLang = () => {
    const siteStore = useSiteStore()

    const messages: Record<string, any> = { ru, en, uz }

    /**
     * Функция перевода (аналог $t)
     * Пример использования: t('cart.title')
     */
    const t = (path: string, params: Record<string, any> = {}) => {
        const keys = path.split('.')
        let result = messages[siteStore.currentLang] || messages['ru']

        for (const key of keys) {
            if (result[key]) {
                result = result[key]
            } else {
                return path // Если ключ не найден, возвращаем сам путь
            }
        }

        // Замена параметров, например {n} или {s}
        if (typeof result === 'string') {
            Object.keys(params).forEach(key => {
                result = result.replace(`{${key}}`, params[key])
            })
        }

        return result
    }

    return { t }
}