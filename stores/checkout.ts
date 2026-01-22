import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'

export const useCheckoutStore = defineStore('checkout', () => {
    const { call } = useApi()
    const cartStore = useCartStore()
    const { showToast } = useToast()
    const router = useRouter()
    const { t } = useI18n() // Используем t внутри actions
    const localePath = useLocalePath()

    const isSubmitting = ref(false)
    // Хранилище ошибок: ключ (имя поля) -> текст ошибки
    const formErrors = ref<Record<string, string>>({})

    const orderForm = reactive({
        delivery_method: 'courier', // 'courier' | 'pickup'
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

    // Очистка ошибки конкретного поля (вызывается из компонента при вводе)
    const clearError = (field: string) => {
        if (formErrors.value[field]) {
            delete formErrors.value[field]
        }
    }

    const validateForm = () => {
        formErrors.value = {} // Сброс ошибок перед проверкой
        let isValid = true

        // Валидируем только если выбрана доставка курьером
        if (orderForm.delivery_method === 'courier') {
            // Проверка улицы
            if (!orderForm.address.street.trim()) {
                formErrors.value.street = t('common.error_empty_field') // "Заполните поле"
                isValid = false
            }
            // Проверка дома
            if (!orderForm.address.house.trim()) {
                formErrors.value.house = t('common.error_empty_field')
                isValid = false
            }
            // Проверка телефона (если бы он был в форме, но он берется из профиля)
            // Дополнительные проверки можно добавить здесь
        }

        // Если есть ошибки, показываем общий тост "Проверьте поля", чтобы юзер обратил внимание
        if (!isValid) {
            showToast(t('common.error_empty_field'), 'warning')
        }

        return isValid
    }

    const submitOrder = async () => {
        if (cartStore.cart.length === 0) {
            showToast(t('cart.empty_title'), 'warning')
            return
        }

        // Запускаем валидацию
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
                cartStore.clearCart()
                router.push(localePath({
                    path: '/success',
                    query: { order_id: response.data.order_id }
                }))
            }
        } catch (e: any) {
            showToast(e.data?.message || t('common.error_generic'), 'error')
        } finally {
            isSubmitting.value = false
        }
    }

    return {
        orderForm,
        formErrors,
        isSubmitting,
        submitOrder,
        clearError // Экспортируем метод очистки
    }
})