import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', () => {
    const authStore = useAuthStore()
    const { showToast } = useToast()

    // Безопасный доступ к i18n
    const { $i18n } = useNuxtApp()
    const t = $i18n.t

    const { call } = useApi()

    // Храним ID и количество в куках
    const cartItemsRecord = useCookie<Record<string, number>>('cart_items', {
        default: () => ({}),
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
        watch: true
    })

    const cart = ref<any[]>([])
    const isLoading = ref(false)

    // Геттеры
    const cartCount = computed(() => {
        if (authStore.isLoggedIn && cart.value.length > 0) return cart.value.length
        return Object.keys(cartItemsRecord.value || {}).length
    })

    const cartTotal = computed(() => {
        return cart.value.reduce((total, item) => {
            const qty = item.quantity || cartItemsRecord.value[String(item.id || item.product_id)] || 1
            const price = Number(item.discount_price) || Number(item.price) || 0
            return total + (price * qty)
        }, 0)
    })

    /**
     * ВОССТАНОВЛЕНИЕ КОРЗИНЫ
     */
    const hydrateCart = async () => {
        isLoading.value = true

        try {
            if (authStore.isLoggedIn) {
                const res: any = await call('/api/v1/site/profile/basket')
                const serverItems = Array.isArray(res.data) ? res.data : []

                cart.value = serverItems.map((item: any) => ({
                    id: item.product_id,
                    product_id: item.product_id,
                    name: item.name,
                    price: item.price,
                    discount_price: item.discount_price,
                    image: item.image,
                    quantity: item.count,
                    slug: item.slug ? `${item.slug}-${item.product_id}` : String(item.product_id)
                }))

                // Синхронизируем куки с сервером
                const newCookieRecord: Record<string, number> = {}
                cart.value.forEach(i => newCookieRecord[String(i.id)] = i.quantity)
                cartItemsRecord.value = newCookieRecord

            } else {
                const ids = Object.keys(cartItemsRecord.value)
                if (ids.length === 0) {
                    cart.value = []
                    return
                }

                const promises = ids.map(id =>
                    call('/api/v1/site/products/detail', { query: { product_id: id } })
                        .then((res: any) => res.data)
                        .catch(() => null)
                )

                const results = await Promise.all(promises)

                cart.value = results
                    .filter(p => p !== null)
                    .map((p: any) => ({
                        id: p.product_id,
                        name: p.name,
                        price: p.price,
                        discount_price: p.discount_price,
                        oldPrice: p.discount_price ? p.price : null,
                        image: p.images?.[0]?.url || '/images/pc-placeholder.png',
                        quantity: cartItemsRecord.value[String(p.product_id)] || 1,
                        slug: p.seo?.name ? `${p.seo.name}-${p.product_id}` : null
                    }))
            }
        } catch (e) {
            console.error('Ошибка восстановления корзины:', e)
        } finally {
            isLoading.value = false
        }
    }

    // --- NEW: Метод слияния корзины гостя с сервером ---
    const mergeGuestCart = async (guestItems: any[]) => {
        if (!guestItems.length) return

        // Создаем массив промисов для параллельной отправки
        // (Если бэкенд поддерживает bulk-add, лучше использовать его. Здесь делаем loop)
        const promises = guestItems.map(item => {
            const pId = String(item.id || item.product_id)
            const qty = item.quantity || 1

            // Сначала добавляем товар
            return call('/api/v1/site/profile/basket/add', {
                method: 'POST',
                query: { product_id: pId }
            }).then(() => {
                // Если количество > 1, обновляем его
                if (qty > 1) {
                    return call('/api/v1/site/profile/basket/update-count', {
                        method: 'POST',
                        query: { product_id: pId, count: qty }
                    })
                }
            }).catch(e => console.error(`Failed to merge item ${pId}`, e))
        })

        await Promise.all(promises)

        // Очищаем куки гостя, так как теперь данные на сервере
        cartItemsRecord.value = {}
    }

    const addToCart = async (product: any, qtyToAdd: number = 1) => {
        if (!product) return

        const pId = String(product.id || product.product_id || '')

        const currentRecord = { ...cartItemsRecord.value }
        const newQty = (currentRecord[pId] || 0) + qtyToAdd
        currentRecord[pId] = newQty
        cartItemsRecord.value = currentRecord

        const existingItem = cart.value.find(i => String(i.id || i.product_id) === pId)
        if (existingItem) {
            existingItem.quantity = newQty
        } else {
            const img = product.image || (product.images?.[0]?.url) || (Array.isArray(product.images) ? product.images[0] : null)

            cart.value.push({
                ...product,
                id: pId,
                product_id: pId,
                image: img,
                quantity: newQty
            })
        }

        if (authStore.isLoggedIn) {
            try {
                await call('/api/v1/site/profile/basket/add', {
                    method: 'POST',
                    query: { product_id: pId }
                })
                // Если добавили сразу много (со страницы товара), нужно обновить каунт
                if (newQty > 1) {
                    await call('/api/v1/site/profile/basket/update-count', {
                        method: 'POST',
                        query: { product_id: pId, count: newQty }
                    })
                }
            } catch (e) {
                console.error('Не удалось добавить в корзину на сервере', e)
                showToast(t('common.error_generic'), 'error')
            }
        }
    }

    const removeFromCart = async (productId: string | number) => {
        const pId = String(productId)

        const currentRecord = { ...cartItemsRecord.value }
        delete currentRecord[pId]
        cartItemsRecord.value = currentRecord

        cart.value = cart.value.filter(item => String(item.id || item.product_id) !== pId)

        if (authStore.isLoggedIn) {
            try {
                await call('/api/v1/site/profile/basket/delete', {
                    method: 'POST',
                    query: { product_id: pId }
                })
            } catch (e) {
                console.error('Ошибка удаления с сервера', e)
                showToast(t('common.error_generic'), 'error')
            }
        }
    }

    const updateQuantity = async (productId: string | number, quantity: number) => {
        const pId = String(productId)

        if (quantity <= 0) {
            await removeFromCart(pId)
            return
        }

        const currentRecord = { ...cartItemsRecord.value }
        currentRecord[pId] = quantity
        cartItemsRecord.value = currentRecord

        const item = cart.value.find(i => String(i.id || i.product_id) === pId)
        if (item) item.quantity = quantity

        if (authStore.isLoggedIn) {
            try {
                await call('/api/v1/site/profile/basket/update-count', {
                    method: 'POST',
                    query: {
                        product_id: pId,
                        count: quantity
                    }
                })
            } catch (e) {
                console.error('Ошибка обновления количества на сервере', e)
            }
        }
    }

    const clearCart = () => {
        cartItemsRecord.value = {}
        cart.value = []
    }

    return {
        cart,
        cartCount,
        cartTotal,
        isLoading,
        hydrateCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        mergeGuestCart // <-- Экспортируем новый метод
    }
})