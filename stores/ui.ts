// stores/ui.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUIStore = defineStore('ui', () => {
    // Состояния меню
    const isMobileMenuOpen = ref(false)
    const isMegaMenuOpen = ref(false)
    const isMobileSearchOpen = ref(false)

    // Состояние глобальной загрузки
    const isGlobalLoading = ref(false)

    // Состояния авторизационной модалки
    const isAuthModalOpen = ref(false)
    const authModalStep = ref<'login' | 'otp'>('login')
    const authModalPhone = ref('')

    // --- НОВОЕ: URL для редиректа после логина ---
    const returnUrl = ref<string | null>(null)

    // Действия для меню
    const toggleMobileMenu = (val?: boolean) => {
        isMobileMenuOpen.value = val !== undefined ? val : !isMobileMenuOpen.value
    }

    const toggleMegaMenu = (val?: boolean) => {
        isMegaMenuOpen.value = val !== undefined ? val : !isMegaMenuOpen.value
    }

    // Действия для модалки
    const openAuthModal = () => {
        isAuthModalOpen.value = true
        authModalStep.value = 'login'
    }

    const closeAuthModal = () => {
        isAuthModalOpen.value = false
        // Не сбрасываем returnUrl здесь, так как закрытие может быть "успешным" для перехода
    }

    const setAuthStep = (step: 'login' | 'otp', phone: string = '') => {
        if (phone) authModalPhone.value = phone
        authModalStep.value = step
    }

    // --- НОВОЕ: Установка URL возврата ---
    const setReturnUrl = (url: string | null) => {
        returnUrl.value = url
    }

    return {
        isMobileMenuOpen,
        isMegaMenuOpen,
        isMobileSearchOpen,
        isGlobalLoading,
        isAuthModalOpen,
        authModalStep,
        authModalPhone,
        returnUrl, // <-- Экспортируем
        toggleMobileMenu,
        toggleMegaMenu,
        openAuthModal,
        closeAuthModal,
        setAuthStep,
        setReturnUrl // <-- Экспортируем
    }
})