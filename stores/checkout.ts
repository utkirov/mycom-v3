import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'

export const useCheckoutStore = defineStore('checkout', () => {
    const { call } = useApi()
    const cartStore = useCartStore()
    const { showToast } = useToast()
    const router = useRouter()
    const { t } = useI18n()
    const localePath = useLocalePath()

    const isSubmitting = ref(false)
    const formErrors = ref<Record<string, string>>({})

    const orderForm = reactive({
        delivery_method: 'courier',
        payment_method: 'payme',
        comment: '',
        address: {
            city: 'Ташкент',
            street: '',
            house: '',
            apartment: '',
            lat: 41.2995,
            lng: 69.2401
        }
    })

    const validateForm = () => {
        formErrors.value = {}
        let isValid = true

        if (orderForm.delivery_method === 'courier') {
            if (!orderForm.address.city.trim()) {
                formErrors.value.city = t('common.error_empty_field')
                isValid = false
            }
            if (!orderForm.address.street.trim()) {
                formErrors.value.street = t('common.error_empty_field')
                isValid = false
            }
            if (!orderForm.address.house.trim()) {
                formErrors.value.house = t('common.error_empty_field')
                isValid = false
            }
        }

        if (!isValid) showToast(t('common.error_empty_field'), 'error')
        return isValid
    }

    const submitOrder = async () => {
        if (cartStore.cart.length === 0) {
            showToast(t('cart.empty_title'), 'warning')
            return
        }

        if (!validateForm()) return

        isSubmitting.value = true

        const payload = {
            items: cartStore.cart.map(item => ({
                product_id: Number(item.id || item.product_id),
                quantity: item.quantity
            })),
            delivery_method: orderForm.delivery_method,
            payment_method: orderForm.payment_method,
            address: {
                city: orderForm.address.city,
                street: orderForm.address.street,
                house: orderForm.address.house,
                apartment: orderForm.address.apartment,
                lat: orderForm.address.lat,
                lng: orderForm.address.lng
            },
            comment: orderForm.comment
        }

        try {
            const response: any = await call('/api/v1/site/order/create', {
                method: 'POST',
                body: payload
            })

            if (response.data?.order_id) {
                // Очищаем корзину
                cartStore.clearCart()

                // ВСЕГДА перенаправляем на страницу успеха
                // Логика оплаты теперь будет там
                router.push(localePath({
                    path: '/success',
                    query: { order_id: response.data.order_id }
                }))
            }
        } catch (e: any) {
            showToast(e.data?.message || t('common.error_generic'), 'error')
            isSubmitting.value = false
        }
    }

    return { orderForm, formErrors, isSubmitting, submitOrder }
})