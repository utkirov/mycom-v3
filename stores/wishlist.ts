// stores/wishlist.ts
import { defineStore } from 'pinia'
import type { Product, ApiResponse } from '~/types'

export const useWishlistStore = defineStore('wishlist', () => {
    const api = useApi()
    const authStore = useAuthStore()
    const { showToast } = useToast()
    // Подключаем i18n для перевода уведомлений
    const { t } = useI18n()

    const wishlistData = ref<{ list: Product[], total: number, lastPage: number }>({
        list: [], total: 0, lastPage: 1
    })
    const isLoading = ref(false)
    const actionPendingId = ref<number | null>(null)

    const cookieWishlist = useCookie<number[]>('wishlist_ids', {
        default: () => [],
        maxAge: 60 * 60 * 24 * 365,
        path: '/'
    })

    const wishlistItems = computed(() => wishlistData.value.list)
    const wishlistCount = computed(() =>
        authStore.isLoggedIn ? wishlistData.value.total : cookieWishlist.value.length
    )

    const isInWishlist = (productId: number | string) => {
        const pId = Number(productId)
        if (authStore.isLoggedIn) {
            return wishlistData.value.list.some((i) => Number(i.product_id || i.id) === pId)
        }
        return cookieWishlist.value.includes(pId)
    }

    const fetchWishlist = async (page: number = 1) => {
        if (!authStore.isLoggedIn) return
        isLoading.value = true
        try {
            const response = await api.call<ApiResponse<any>>('/api/v1/site/profile/favorites', {
                query: { page }
            })
            if (response.data) wishlistData.value = response.data
        } finally {
            isLoading.value = false
        }
    }

    const toggleWishlist = async (product: Product) => {
        const productId = Number(product.id || product.product_id)
        if (!productId) return

        if (!authStore.isLoggedIn) {
            const index = cookieWishlist.value.indexOf(productId)
            if (index > -1) {
                cookieWishlist.value.splice(index, 1)
                // Используем ключ перевода для удаления
                showToast(t('profile.wishlist_removed'))
            } else {
                cookieWishlist.value.push(productId)
                // Используем ключ перевода для добавления
                showToast(t('profile.wishlist_added'))
            }
            return
        }

        if (actionPendingId.value === productId) return
        const isCurrentlyIn = isInWishlist(productId)
        const endpoint = isCurrentlyIn ? 'delete' : 'add'
        actionPendingId.value = productId

        try {
            await api.call(`/api/v1/site/profile/favorites/${endpoint}`, {
                method: 'POST',
                query: { product_id: productId }
            })
            await fetchWishlist()
            // Динамический перевод уведомления в зависимости от действия
            showToast(t(isCurrentlyIn ? 'profile.wishlist_removed' : 'profile.wishlist_added'))
        } finally {
            actionPendingId.value = null
        }
    }

    return {
        wishlistItems, wishlistCount, isLoading,
        fetchWishlist, toggleWishlist, isInWishlist
    }
})