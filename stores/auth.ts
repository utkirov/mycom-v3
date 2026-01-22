import { defineStore } from 'pinia'
import { useCartStore } from './cart'

interface User {
    name: string
    phone: string
    email?: string
}

export const useAuthStore = defineStore('auth', () => {
    const config = useRuntimeConfig()

    // Используем useNuxtApp для доступа к локали (защита от H3Error)
    const { $i18n } = useNuxtApp()
    const locale = $i18n.locale

    const { showToast } = useToast()

    const token = useCookie<string | null>('auth_token', {
        maxAge: 60 * 60 * 24 * 30,
        path: '/'
    })
    const user = ref<User | null>(null)
    const isLoading = ref(false)

    const isLoggedIn = computed(() => !!token.value)

    const setToken = (newToken: string) => {
        token.value = newToken
    }

    const fetchUser = async () => {
        if (!token.value || isLoading.value) return
        isLoading.value = true
        try {
            const response = await $fetch<{ data: User }>(`${config.public.apiBase}/api/v1/site/profile/info`, {
                query: { lang: locale.value },
                headers: { Authorization: `Bearer ${token.value}` }
            })
            if (response?.data) {
                user.value = response.data
            }
        } catch (error: any) {
            if (error.response?.status === 401) logout()
        } finally {
            isLoading.value = false
        }
    }

    const requestOtp = async (phone: string) => {
        isLoading.value = true
        try {
            await $fetch(`${config.public.apiBase}/api/v1/site/auth/send-code`, {
                method: 'POST',
                query: { phone, lang: locale.value }
            })
            return true
        } catch (err: any) {
            showToast(err.data?.message || 'Error', 'error')
            return false
        } finally {
            isLoading.value = false
        }
    }

    const verifyOtp = async (phone: string, code: string) => {
        const cartStore = useCartStore() // Инициализируем здесь

        isLoading.value = true
        try {
            const response = await $fetch<{ data: { token: string } }>(`${config.public.apiBase}/api/v1/site/auth/login`, {
                method: 'POST',
                query: { phone, code, lang: locale.value }
            })

            if (response.data?.token) {
                // 1. Сохраняем текущие товары гостя
                const guestItems = [...cartStore.cart]

                // 2. Устанавливаем токен (теперь мы авторизованы)
                setToken(response.data.token)

                // 3. Если были товары, отправляем их на сервер
                if (guestItems.length > 0) {
                    await cartStore.mergeGuestCart(guestItems)
                }

                // 4. Загружаем профиль и актуальную корзину с сервера
                await Promise.all([
                    fetchUser(),
                    cartStore.hydrateCart()
                ])

                return true
            }
            return false
        } catch (err: any) {
            showToast(err.data?.message || 'Error', 'error')
            return false
        } finally {
            isLoading.value = false
        }
    }

    const logout = () => {
        const localePath = useLocalePath()
        const cartStore = useCartStore()

        token.value = null
        user.value = null

        const wishlistIds = useCookie('wishlist_ids')
        wishlistIds.value = []

        cartStore.clearCart()

        navigateTo(localePath('/'))
    }

    return {
        token, user, isLoading, isLoggedIn,
        setToken, fetchUser, requestOtp, verifyOtp, logout
    }
})