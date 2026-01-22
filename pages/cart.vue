<template>
  <div class="bg-gray-50/50 min-h-screen py-8 md:py-12">
    <div class="w-full px-4 sm:px-6 md:px-8 max-w-[1200px] mx-auto">

      <h1 class="text-3xl font-black text-brand-dark-blue mb-8 flex items-center gap-3">
        {{ $t('cart.title') }}
        <span v-if="cartStore.cartCount" class="text-lg font-bold text-gray-400 bg-white px-3 py-1 rounded-full border border-gray-100">
          {{ cartStore.cartCount }}
        </span>
      </h1>

      <div v-if="cartStore.cartCount > 0" class="flex flex-col lg:flex-row gap-8">
        <div class="flex-1 space-y-4">
          <transition-group name="list" tag="div" class="space-y-4">
            <CartItem v-for="item in cartStore.cart" :key="item.id || item.product_id" :item="item" />
          </transition-group>

          <!-- UX FIX: Подтверждение очистки -->
          <button @click="handleClearCart" class="text-sm font-bold text-gray-400 hover:text-brand-red flex items-center gap-2 mx-auto md:mx-0 transition-colors mt-6">
            <Icon name="ph:trash" />
            {{ $t('cart.clear_cart') }}
          </button>
        </div>

        <div class="w-full lg:w-80 shrink-0">
          <CartOrderSummary />
        </div>
      </div>

      <!-- EMPTY STATE IMPROVED -->
      <div v-else class="py-24 text-center bg-white rounded-[40px] border border-dashed border-gray-200 shadow-inner">
        <div class="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
          <Icon name="ph:shopping-cart-thin" size="56" class="text-gray-300" />
        </div>
        <h2 class="text-2xl font-black text-brand-dark-blue">{{ $t('cart.empty_title') }}</h2>
        <p class="text-gray-500 mt-2">{{ $t('cart.empty_text') }}</p>

        <div class="mt-8 space-y-4">
          <NuxtLink :to="localePath('/catalog')" class="inline-flex h-12 items-center px-8 rounded-xl bg-brand-blue text-white font-black uppercase tracking-widest text-xs hover:bg-brand-dark-blue transition-all shadow-lg shadow-brand-blue/30">
            {{ $t('cart.go_to_catalog') }}
          </NuxtLink>

          <!-- Быстрые ссылки для возврата в воронку -->
          <div class="flex justify-center gap-4 mt-6">
            <NuxtLink :to="localePath('/catalog/laptops')" class="text-sm font-bold text-brand-blue hover:underline">
              {{ $t('catalog.laptops') }}
            </NuxtLink>
            <NuxtLink :to="localePath('/catalog/phones')" class="text-sm font-bold text-brand-blue hover:underline">
              {{ $t('catalog.tablets') }} <!-- Используем существующий ключ -->
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const cartStore = useCartStore();
const { t } = useI18n();
const localePath = useLocalePath();

const handleClearCart = () => {
  // Простая защита от случайного клика
  if (confirm(t('common.all') + '?')) { // Используем существующий ключ или можно добавить 'cart.confirm_clear'
    cartStore.clearCart();
  }
};

useSeoMeta({
  title: () => `${t('cart.title')} | MYCOM`,
  robots: 'noindex, nofollow'
});
</script>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.4s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>