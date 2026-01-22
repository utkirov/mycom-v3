<template>
  <div>
    <NuxtLoadingIndicator color="#009FE3" :height="3" :throttle="200" />
    <NuxtLayout>
      <!-- Убрали :transition="{...}", теперь настройки берутся из nuxt.config -->
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

await useAsyncData('app-init', async () => {
  const promises = [
    catalogStore.fetchCatalog(),
    cartStore.hydrateCart()
  ];

  await Promise.all(promises);
  return true;
});

onMounted(async () => {
  await siteStore.fetchSettings();

  if (authStore.isLoggedIn) {
    await Promise.allSettled([
      authStore.fetchUser(),
      wishlistStore.fetchWishlist(),
      cartStore.hydrateCart()
    ]);
  } else {
    cartStore.hydrateCart();
  }
});

watch(locale, async () => {
  await Promise.all([
    siteStore.fetchSettings(),
    catalogStore.fetchCatalog(),
    cartStore.hydrateCart()
  ]);
});

watch(() => authStore.isLoggedIn, async (isLoggedIn) => {
  if (isLoggedIn) {
    await Promise.allSettled([
      authStore.fetchUser(),
      wishlistStore.fetchWishlist(),
      cartStore.hydrateCart()
    ]);
  } else {
    cartStore.clearCart();
  }
});
</script>