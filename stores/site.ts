// stores/site.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useSiteStore = defineStore('site', () => {
    const config = useRuntimeConfig()
    // Используем системный i18n
    const { locale } = useI18n()

    const settings = ref<any>(null)
    const languages = ref<any[]>([])

    /**
     * Геттер для получения текущего языка.
     * Теперь он реактивно связан с состоянием модуля i18n.
     */
    const currentLang = computed(() => locale.value)

    /**
     * Загрузка настроек сайта с учетом текущего языка
     */
    const fetchSettings = async () => {
        try {
            // Запросы к API теперь всегда используют актуальную локаль из модуля
            const [infoRes, langRes] = await Promise.all([
                $fetch<any>(`${config.public.apiBase}/api/v1/site/information`, {
                    headers: { lang: locale.value }
                }),
                $fetch<any>(`${config.public.apiBase}/api/v1/site/langs`)
            ])

            if (infoRes?.data) {
                settings.value = infoRes.data
            }

            if (langRes?.data) {
                languages.value = langRes.data
            }
        } catch (e) {
            console.error('Ошибка при загрузке настроек сайта:', e)
        }
    }

    return {
        settings,
        languages,
        currentLang,
        fetchSettings
    }
})