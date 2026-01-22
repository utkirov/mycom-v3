<template>
  <div class="bg-[#F8F9FB] min-h-screen py-8 md:py-12 pb-32 lg:pb-12">
    <!-- ЛОАДЕР -->
    <div v-if="isCheckingStock" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
      <Icon name="svg-spinners:ring-resize" class="text-brand-blue mb-4" size="48" />
      <p class="text-brand-dark-blue font-bold animate-pulse">{{ $t('common.loading') }}...</p>
    </div>

    <div class="w-full px-4 sm:px-6 md:px-8">
      <div class="mb-8">
        <h1 class="text-2xl font-extrabold text-brand-dark-blue sm:text-3xl lg:text-4xl">
          {{ $t('checkout.title') }}
        </h1>
      </div>

      <form @submit.prevent="checkoutStore.submitOrder" class="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
        <div class="flex flex-col gap-y-6 lg:col-span-2">
          <!-- Блок доставки -->
          <div class="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
            <h2 class="text-xl font-bold text-brand-dark-blue mb-4 flex items-center gap-2">
              <Icon name="ph:truck-fill" class="text-brand-blue" />
              {{ $t('checkout.delivery_method') }}
            </h2>
            <div class="flex rounded-xl bg-gray-100 p-1">
              <button
                  type="button"
                  @click="checkoutStore.orderForm.delivery_method = 'courier'"
                  class="flex-1 py-3 text-sm font-bold rounded-lg transition-all"
                  :class="checkoutStore.orderForm.delivery_method === 'courier' ? 'bg-white shadow-sm text-brand-dark-blue' : 'text-gray-500 hover:text-gray-700'"
              >{{ $t('checkout.courier') }}</button>
              <button
                  type="button"
                  @click="checkoutStore.orderForm.delivery_method = 'pickup'"
                  class="flex-1 py-3 text-sm font-bold rounded-lg transition-all"
                  :class="checkoutStore.orderForm.delivery_method === 'pickup' ? 'bg-white shadow-sm text-brand-dark-blue' : 'text-gray-500 hover:text-gray-700'"
              >{{ $t('checkout.pickup') }}</button>
            </div>
          </div>

          <!-- Форма адреса -->
          <transition
              enter-active-class="transition duration-200 ease-out"
              enter-from-class="transform scale-95 opacity-0"
              enter-to-class="transform scale-100 opacity-100"
              leave-active-class="transition duration-75 ease-in"
              leave-from-class="transform scale-100 opacity-100"
              leave-to-class="transform scale-95 opacity-0"
          >
            <CheckoutShippingForm
                v-if="checkoutStore.orderForm.delivery_method === 'courier'"
                v-model="checkoutStore.orderForm"
            />
          </transition>

          <!-- Самовывоз -->
          <div v-if="checkoutStore.orderForm.delivery_method === 'pickup'" class="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
            <!-- v-sanitize для безопасности HTML -->
            <p class="text-sm text-gray-600 mb-4" v-sanitize="$t('delivery.pickup_desc')"></p>
            <NuxtLink :to="localePath('/contacts')" class="text-brand-blue font-bold hover:underline flex items-center gap-1">
              <Icon name="ph:map-pin" />
              {{ $t('contacts.our_stores') }}
            </NuxtLink>
          </div>

          <!-- Оплата -->
          <CheckoutPaymentMethods v-model="checkoutStore.orderForm.payment_method" />
        </div>

        <!-- Сайдбар (Desktop) -->
        <div class="hidden lg:block lg:col-span-1">
          <CartOrderSummary
              is-checkout-page
              :is-loading="checkoutStore.isSubmitting"
              @submit="checkoutStore.submitOrder"
          />
        </div>
      </form>
    </div>

    <!-- Sticky Bottom Bar (Mobile) -->
    <div class="fixed bottom-16 left-0 right-0 z-40 bg-white border-t border-gray-200 p-4 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)] lg:hidden">
      <div class="flex items-center justify-between gap-4 max-w-md mx-auto">
        <div class="flex flex-col">
          <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{{ $t('cart.total') }}</span>
          <div class="flex items-baseline gap-1">
            <span class="text-xl font-black text-brand-blue">{{ format(cartStore.cartTotal) }}</span>
            <span class="text-xs font-bold text-gray-500">сум</span>
          </div>
        </div>

        <button
            @click="checkoutStore.submitOrder"
            :disabled="checkoutStore.isSubmitting"
            class="flex-1 h-12 bg-brand-blue text-white rounded-xl font-bold shadow-lg shadow-brand-blue/30 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <Icon v-if="checkoutStore.isSubmitting" name="svg-spinners:ring-resize" />
          <span>{{ $t('cart.checkout') }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const checkoutStore = useCheckoutStore();
const cartStore = useCartStore();
const { t } = useI18n();
const { format } = useCurrency();
const localePath = useLocalePath();
const isCheckingStock = ref(true);

definePageMeta({ middleware: 'auth' });

onMounted(async () => {
  await cartStore.hydrateCart();
  if (cartStore.cart.length === 0) {
    navigateTo(localePath('/cart'));
  }
  isCheckingStock.value = false;
});

useSeoMeta({ title: () => `${t('checkout.title')} | MYCOM` });
</script>

<style scoped>
.pb-safe { padding-bottom: calc(16px + env(safe-area-inset-bottom)); }
</style>