// file: plugins/loading.client.ts
export default defineNuxtPlugin((nuxtApp) => {
    const router = useRouter();
    const uiStore = useUIStore(); // Используем глобальный UI стор

    router.beforeEach(() => {
        uiStore.isGlobalLoading = true;
    });

    router.afterEach(() => {
        uiStore.isGlobalLoading = false;
    });

    // Обработка ошибок
    router.onError(() => {
        uiStore.isGlobalLoading = false;
    });
});