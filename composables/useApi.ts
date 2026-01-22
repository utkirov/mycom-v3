import { useAuthStore } from '~/stores/auth'

export const useApi = () => {
    const config = useRuntimeConfig()
    const { locale } = useI18n()
    // Получаем стор внутри функции, чтобы избежать ошибок инициализации Pinia
    const authStore = useAuthStore()

    const getHeaders = () => {
        const headers: Record<string, string> = {
            'Accept': 'application/json',
            'lang': locale.value
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

            // --- ПЕРЕХВАТЧИК ОШИБОК ---
            onResponseError({ response }) {
                // Если токен протух или невалиден (401), разлогиниваем пользователя
                if (response.status === 401) {
                    authStore.logout()
                }
            }
        })
    }

    return { call, getHeaders, baseURL: config.public.apiBase }
}