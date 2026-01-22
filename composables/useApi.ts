import { useAuthStore } from '~/stores/auth'

export const useApi = () => {
    const config = useRuntimeConfig()

    // --- FIX: Достаем i18n через nuxtApp ---
    const { $i18n } = useNuxtApp()
    const locale = $i18n.locale

    // Получаем стор внутри функции, чтобы избежать ошибок инициализации Pinia
    // Но authStore нужно вызывать внутри функций, если useApi вызывается вне компонента
    // Однако useApi это composable, он вызывается в setup, так что тут useAuthStore() безопасен,
    // но лучше быть осторожным.
    const authStore = useAuthStore()

    const getHeaders = () => {
        const headers: Record<string, string> = {
            'Accept': 'application/json',
            'lang': locale.value // locale здесь реактивный ref из i18n
        }
        if (authStore.token) {
            headers['Authorization'] = `Bearer ${authStore.token}`
        }
        return headers
    }

    const call = async <T>(endpoint: string, options: any = {}) => {
        return await $fetch<T>(endpoint, {
            baseURL: config.public.apiBase,
            headers: { ...getHeaders(), ...options.headers },
            query: { lang: locale.value, ...options.query },
            ...options,

            onResponseError({ response }) {
                if (response.status === 401) {
                    authStore.logout()
                }
            }
        })
    }

    return { call, getHeaders, baseURL: config.public.apiBase }
}