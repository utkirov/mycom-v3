// composables/useCartAnimation.ts
export const useCartAnimation = () => {
    // Состояние летающих предметов
    const flyingItems = useState<any[]>('flyingItems', () => [])

    const startAnimation = (event: MouseEvent, imageSrc: string) => {
        // 1. Находим координаты клика (начало полета)
        // Можно брать координаты кнопки или картинки товара.
        // Для простоты берем координаты клика + смещение, чтобы летело как бы из под курсора
        const startX = event.clientX
        const startY = event.clientY

        // 2. Ищем цель (Иконку корзины)
        // Сначала ищем мобильную (если мы на мобилке), потом десктопную
        let targetEl = document.getElementById('cart-target-mobile')

        // Если мобильной нет или она скрыта (offsetParent === null), ищем десктопную
        if (!targetEl || targetEl.offsetParent === null) {
            targetEl = document.getElementById('cart-target-desktop')
        }

        if (!targetEl) return // Если корзины нет на экране, не анимируем

        const targetRect = targetEl.getBoundingClientRect()
        // Центр иконки корзины
        const endX = targetRect.left + (targetRect.width / 2)
        const endY = targetRect.top + (targetRect.height / 2)

        // 3. Создаем объект анимации
        const id = Date.now()
        flyingItems.value.push({
            id,
            image: imageSrc,
            style: {
                left: `${startX}px`,
                top: `${startY}px`,
                width: '60px',
                height: '60px',
                opacity: 1,
                transform: 'translate(-50%, -50%) scale(1)'
            },
            endX,
            endY
        })

        // 4. Запускаем полет (через nextTick, чтобы CSS transition сработал)
        setTimeout(() => {
            const item = flyingItems.value.find(i => i.id === id)
            if (item) {
                item.style.left = `${endX}px`
                item.style.top = `${endY}px`
                item.style.transform = 'translate(-50%, -50%) scale(0.2)' // Уменьшаем в точку
                item.style.opacity = 0.5
            }
        }, 50)

        // 5. Удаляем элемент после завершения анимации (700ms - время в CSS)
        setTimeout(() => {
            flyingItems.value = flyingItems.value.filter(i => i.id !== id)

            // Опционально: Анимация тряски корзины при "попадании"
            targetEl?.classList.add('animate-bump')
            setTimeout(() => targetEl?.classList.remove('animate-bump'), 300)
        }, 700)
    }

    return { flyingItems, startAnimation }
}