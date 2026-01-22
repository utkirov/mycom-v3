<template>
  <div>
    <!-- Индикатор загрузки при навигации между страницами -->
    <NuxtLoadingIndicator color="#009FE3" :height="3" :throttle="200" />

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue';

const authStore = useAuthStore();
const wishlistStore = useWishlistStore();
const siteStore = useSiteStore();
const catalogStore = useCatalogStore();
const cartStore = useCartStore();
const { locale } = useI18n();

// --- УЛУЧШЕНИЕ: Non-blocking loading ---
// Добавлено { lazy: true }, чтобы интерфейс рендерился сразу,
// не дожидаясь ответа от API каталога и корзины.
await useAsyncData('app-init', async () => {
  const promises = [
    catalogStore.fetchCatalog(),
    // Корзину загружаем, но ошибки внутри hydrateCart не должны ломать загрузку каталога
    cartStore.hydrateCart().catch(e => console.error('Cart init error:', e))
  ];

  await Promise.all(promises);
  return true;
}, {
  lazy: true // <-- Ключевое изменение: не блокируем UI
});

onMounted(async () => {
  // Настройки сайта (языки, контакты) грузим на клиенте
  // Это не критичный контент для SEO, можно загрузить после монтирования
  await siteStore.fetchSettings();

  // Если пользователь уже был залогинен (токен в куках)
  if (authStore.isLoggedIn) {
    // Используем allSettled, чтобы ошибка в одном запросе не отменила другие
    await Promise.allSettled([
      authStore.fetchUser(),
      wishlistStore.fetchWishlist(),
      // Повторная гидратация корзины на клиенте для актуализации (merge логика в будущем)
      cartStore.hydrateCart()
    ]);
  } else {
    // Для гостя тоже инициализируем корзину (из кук)
    cartStore.hydrateCart();
  }
});

// Следим за сменой языка
watch(locale, async () => {
  // При смене языка перезапрашиваем зависимые данные
  await Promise.all([
    siteStore.fetchSettings(),
    catalogStore.fetchCatalog(),
    // Корзину обновлять не обязательно, если там только ID товаров,
    // но если там названия товаров — нужно обновить
    cartStore.hydrateCart()
  ]);
});

// Следим за статусом авторизации (вход/выход)
watch(() => authStore.isLoggedIn, async (isLoggedIn) => {
  if (isLoggedIn) {
    await Promise.allSettled([
      authStore.fetchUser(),
      wishlistStore.fetchWishlist(),
      cartStore.hydrateCart()
    ]);
  } else {
    // При выходе чистим данные
    cartStore.clearCart();
    // Вишлист очищается внутри authStore.logout(), но можно и тут для явности
  }
});
</script>