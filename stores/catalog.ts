// stores/catalog.ts
import { defineStore } from 'pinia'

export const useCatalogStore = defineStore('catalog', () => {
    const config = useRuntimeConfig()
    // Используем системный i18n для получения текущего языка
    const { locale } = useI18n()

    // Состояние
    const tree = ref<any[]>([])
    const isLoading = ref(false)
    const error = ref<any>(null)

    // Действие: Загрузка дерева
    const fetchCatalog = async () => {
        // Если уже загружаем, не дублируем запрос
        if (isLoading.value) return

        isLoading.value = true
        error.value = null

        try {
            // Используем $fetch для запроса внутри Pinia action
            const response: any = await $fetch(`${config.public.apiBase}/api/v1/site/catalog`, {
                query: { lang: locale.value }
            })

            // Сохраняем данные (проверка на структуру ответа)
            tree.value = response.data || response || []
        } catch (err) {
            console.error('Catalog fetch error:', err)
            error.value = err
        } finally {
            isLoading.value = false
        }
    }

    return {
        tree,
        isLoading,
        error,
        fetchCatalog
    }
})