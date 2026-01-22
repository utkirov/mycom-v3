<template>
  <nav class="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] md:hidden pb-safe">
    <div class="flex h-16 items-center justify-around px-2">

      <!-- 1. Главная -->
      <NuxtLink
          :to="localePath('/')"
          class="nav-item"
          active-class="text-brand-blue"
      >
        <Icon name="ph:house-fill" size="24" class="mb-0.5" />
        <span class="text-[10px] font-bold">{{ $t('common.home') }}</span>
      </NuxtLink>

      <!-- 2. Каталог (Открывает меню) -->
      <button
          @click="uiStore.toggleMobileMenu(true)"
          class="nav-item"
          :class="uiStore.isMobileMenuOpen ? 'text-brand-blue' : ''"
      >
        <Icon name="ph:squares-four-fill" size="24" class="mb-0.5" />
        <span class="text-[10px] font-bold">{{ $t('common.catalog') }}</span>
      </button>

      <!-- 3. Корзина -->
      <NuxtLink
          id="cart-target-mobile"
          :to="localePath('/cart')"
          class="nav-item relative"
          active-class="text-brand-blue"
      >
        <div class="relative">
          <Icon name="ph:shopping-cart-fill" size="24" class="mb-0.5" />
          <transition name="scale">
            <span v-if="cartStore.cartCount > 0" class="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-brand-blue text-[9px] font-bold text-white ring-2 ring-white">
              {{ cartStore.cartCount }}
            </span>
          </transition>
        </div>
        <span class="text-[10px] font-bold">{{ $t('cart.title') }}</span>
      </NuxtLink>

      <!-- 4. Избранное -->
      <NuxtLink
          :to="localePath('/wishlist')"
          class="nav-item relative"
          active-class="text-brand-blue"
      >
        <div class="relative">
          <Icon name="ph:heart-fill" size="24" class="mb-0.5" />
          <transition name="scale">
            <span v-if="wishlistStore.wishlistCount > 0" class="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-brand-red text-[9px] font-bold text-white ring-2 ring-white">
              {{ wishlistStore.wishlistCount }}
            </span>
          </transition>
        </div>
        <span class="text-[10px] font-bold">{{ $t('profile.wishlist') }}</span>
      </NuxtLink>

      <!-- 5. Профиль -->
      <button
          @click="handleProfile"
          class="nav-item"
          :class="route.path.includes('/profile') ? 'text-brand-blue' : ''"
      >
        <Icon name="ph:user-fill" size="24" class="mb-0.5" />
        <span class="text-[10px] font-bold">{{ $t('profile.title') }}</span>
      </button>

    </div>
  </nav>
</template>

<script setup lang="ts">
const { t } = useI18n();
const localePath = useLocalePath();
const uiStore = useUIStore();
const cartStore = useCartStore();
const wishlistStore = useWishlistStore();
const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const handleProfile = () => {
  if (authStore.isLoggedIn) {
    router.push(localePath('/profile'));
  } else {
    uiStore.openAuthModal();
  }
};
</script>

<style scoped>
.nav-item {
  @apply flex flex-1 flex-col items-center justify-center text-gray-400 transition-colors active:scale-95;
}

/* Учет безопасной зоны для iPhone (полоска снизу) */
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom);
}

.scale-enter-active,
.scale-leave-active {
  transition: all 0.2s ease;
}
.scale-enter-from,
.scale-leave-to {
  transform: scale(0);
}
</style>