// middleware/auth.ts
export default defineNuxtRouteMiddleware((to, from) => {
    const authStore = useAuthStore()
    const uiStore = useUIStore()
    const localePath = useLocalePath()

    if (!authStore.isLoggedIn) {
        if (import.meta.client) {
            // 1. Сохраняем, куда пользователь хотел попасть
            uiStore.setReturnUrl(to.fullPath)

            // 2. Открываем модалку
            uiStore.openAuthModal()

            // 3. Логика навигации:
            // Если мы уже на какой-то странице (переход внутри сайта), отменяем переход
            if (from.name) {
                return abortNavigation()
            }
            // Если это первая загрузка (прямой заход на /profile), редиректим на главную
            else {
                return navigateTo(localePath('/'))
            }
        } else {
            // На сервере просто редиректим на главную
            return navigateTo(localePath('/'))
        }
    }
})