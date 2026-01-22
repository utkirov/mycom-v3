<template>
  <div class="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 sticky top-24">
    <h2 class="text-xl font-bold text-brand-dark-blue mb-6">{{ $t('cart.title') }}</h2>

    <div class="space-y-4">
      <div class="flex justify-between text-gray-500">
        <span>{{ $t('cart.items_count', { n: cartStore.cartCount }) }}</span>
        <span class="font-bold text-brand-dark-blue">{{ format(cartStore.cartTotal) }} сум</span>
      </div>

      <div class="flex justify-between text-gray-500">
        <span>{{ $t('cart.delivery') }}</span>
        <span class="text-green-500 font-bold">{{ $t('cart.free') }}</span>
      </div>

      <div class="border-t border-dashed border-gray-200 pt-4 mt-4">
        <div class="flex justify-between items-end">
          <span class="text-lg font-bold text-brand-dark-blue">{{ $t('cart.total') }}:</span>
          <div class="text-right">
            <p class="text-2xl font-unbounded font-bold text-brand-blue">
              {{ format(cartStore.cartTotal) }} <span class="text-sm font-normal">сум</span>
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-8 space-y-3">
      <!-- ИЗМЕНЕНО: Убрали NuxtLink, добавили @click="handleCheckout" -->
      <template v-if="!isCheckoutPage">
        <button
            @click="handleCheckout"
            class="w-full h-14 rounded-xl bg-brand-blue text-white font-bold shadow-lg shadow-brand-blue/20 hover:bg-brand-dark-blue hover:-translate-y-0.5 transition-all active:scale-95 flex items-center justify-center gap-2"
            :disabled="cartStore.cartCount === 0"
        >
          <span>{{ $t('cart.checkout') }}</span>
          <Icon name="ph:arrow-right-bold" />
        </button>
      </template>

      <template v-else>
        <button
            @click="$emit('submit')"
            :disabled="isLoading || cartStore.cartCount === 0"
            class="w-full h-14 rounded-xl bg-brand-blue text-white font-bold shadow-lg shadow-brand-blue/20 hover:bg-brand-dark-blue hover:-translate-y-0.5 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Icon v-if="isLoading" name="svg-spinners:ring-resize" />
          <span>{{ $t('cart.checkout') }}</span>
        </button>
      </template>

      <p class="text-[10px] text-center text-gray-400 leading-relaxed px-2">
        {{ $t('auth.terms_agreement') }}
        <NuxtLink :to="localePath('/terms')" class="underline hover:text-brand-blue">
          {{ $t('common.terms') }}
        </NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup>
const cartStore = useCartStore();
const authStore = useAuthStore(); // <-- Добавили
const uiStore = useUIStore();     // <-- Добавили
const { format } = useCurrency();
const localePath = useLocalePath();
const router = useRouter();       // <-- Добавили

defineProps({
  isCheckoutPage: { type: Boolean, default: false },
  isLoading: { type: Boolean, default: false }
});

defineEmits(['submit']);

// --- НОВАЯ ЛОГИКА ---
const handleCheckout = () => {
  if (authStore.isLoggedIn) {
    // Если авторизован - идем сразу
    router.push(localePath('/checkout'));
  } else {
    // Если гость - сохраняем путь и открываем модалку
    uiStore.setReturnUrl(localePath('/checkout'));
    uiStore.openAuthModal();
  }
};
</script>