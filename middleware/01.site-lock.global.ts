// middleware/01.site-lock.global.ts

export default defineNuxtRouteMiddleware((to) => {
    // 1. Проверяем наличие специальной куки
    const accessCookie = useCookie('site_access_token');

    // 2. Если куки нет и мы НЕ на странице входа -> редиректим на вход
    if (accessCookie.value !== 'granted' && to.path !== '/site-lock') {
        return navigateTo('/site-lock');
    }

    // 3. Если кука ЕСТЬ, но мы пытаемся зайти на страницу входа -> редиректим на главную
    if (accessCookie.value === 'granted' && to.path === '/site-lock') {
        return navigateTo('/');
    }
});