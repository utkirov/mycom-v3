<template>
  <div class="bg-[#F8F9FB] min-h-screen py-8 md:py-12">
    <!-- ЛОАДЕР (Блокируем интерфейс, пока проверяем актуальность цен) -->
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
            <p class="text-sm text-gray-600 mb-4" v-sanitize="$t('delivery.pickup_desc')"></p>
            <NuxtLink :to="localePath('/contacts')" class="text-brand-blue font-bold hover:underline flex items-center gap-1">
              <Icon name="ph:map-pin" />
              {{ $t('contacts.our_stores') }}
            </NuxtLink>
          </div>

          <!-- Оплата -->
          <CheckoutPaymentMethods v-model="checkoutStore.orderForm.payment_method" />
        </div>

        <!-- Сайдбар -->
        <div class="lg:col-span-1">
          <CartOrderSummary
              is-checkout-page
              :is-loading="checkoutStore.isSubmitting"
              @submit="checkoutStore.submitOrder"
          />
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const checkoutStore = useCheckoutStore();
const cartStore = useCartStore();
const { t } = useI18n();
const localePath = useLocalePath();
const isCheckingStock = ref(true); // Локальное состояние загрузки

definePageMeta({
  middleware: 'auth'
});

onMounted(async () => {
  // 1. Принудительно обновляем данные с сервера
  await cartStore.hydrateCart();

  // 2. Если после обновления корзина пуста — выкидываем
  if (cartStore.cart.length === 0) {
    navigateTo(localePath('/cart'));
  }

  // 3. Убираем лоадер
  isCheckingStock.value = false;
});

useSeoMeta({
  title: () => `${t('checkout.title')} | MYCOM`
});
</script>