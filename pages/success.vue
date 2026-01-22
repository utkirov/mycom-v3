<template>
  <div class="bg-white py-4 md:py-32 overflow-hidden">
    <div class="w-full px-4 sm:px-6 md:px-8 max-w-lg mx-auto text-center relative z-10">

      <div class="flex items-center justify-center h-24 w-24 rounded-full bg-green-50 mx-auto mb-8 animate-bounce shadow-lg shadow-green-100">
        <Icon name="ph:check-circle-fill" size="64" class="text-brand-green" />
      </div>

      <h1 class="text-4xl font-extrabold text-brand-dark-blue mt-6">
        {{ $t('checkout.success_title') }}
      </h1>

      <p class="text-lg text-gray-600 mt-4 leading-relaxed">
        {{ $t('checkout.success_text') }}
      </p>

      <div class="mt-8 p-6 bg-gray-50 rounded-2xl border border-gray-100">
        <p class="text-sm text-gray-400 uppercase font-bold tracking-widest">{{ $t('checkout.order_number') }}</p>
        <p class="text-3xl font-unbounded font-bold text-brand-blue mt-2">
          #{{ orderId }}
        </p>
      </div>

      <!-- КНОПКА ОПЛАТЫ (Показывается только если есть ссылка) -->
      <div v-if="paymeUrl" class="mt-8">
        <a
            :href="paymeUrl"
            target="_blank"
            class="flex items-center flex-col justify-center gap-3 w-full p-4 rounded-2xl bg-[#00CCCC] text-white font-bold text-lg shadow-xl shadow-[#00CCCC]/30 hover:bg-[#00B3B3] hover:-translate-y-1 transition-all active:scale-95"
        >
          <span>{{ $t('checkout.pay_with_payme') }}</span>
          <img src="/icons/payme.svg" alt="Payme" class="h-8">
        </a>
      </div>

      <div class="mt-10 flex flex-col sm:flex-row gap-4">
        <NuxtLink :to="localePath('/profile/orders')" class="w-full">
          <button class="w-full h-14 bg-white border-2 border-gray-100 text-brand-dark-blue font-bold rounded-xl hover:border-brand-blue hover:text-brand-blue transition-all">
            {{ $t('profile.orders') }}
          </button>
        </NuxtLink>
        <NuxtLink :to="localePath('/')" class="w-full">
          <button class="w-full h-14 bg-white border-2 border-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-all">
            {{ $t('common.home') }}
          </button>
        </NuxtLink>
      </div>

    </div>
  </div>
</template>

<script setup>
import confetti from 'canvas-confetti';
import { onMounted, ref } from 'vue';

const route = useRoute();
const { t } = useI18n();
const localePath = useLocalePath();
const { call } = useApi(); // Используем API

const orderId = computed(() => route.query.order_id || '—');
const paymeUrl = ref(null);

const fireConfetti = () => {
  const duration = 3000;
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 2,
      angle: 60,
      spread: 50,
      origin: { x: 0 },
      colors: ['#009FE3', '#22C55E', '#E30031']
    });
    confetti({
      particleCount: 2,
      angle: 120,
      spread: 50,
      origin: { x: 1 },
      colors: ['#009FE3', '#22C55E', '#E30031']
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  }());
};

const fetchPaymentLink = async () => {
  if (!route.query.order_id) return;

  try {
    // Запрашиваем ссылку на чек
    const response = await call('/api/v1/site/products/receipt', {
      method: 'GET',
      query: { order_id: route.query.order_id }
    });

    if (response.data?.receipt) {
      paymeUrl.value = response.data.receipt;
    }
  } catch (e) {
    console.log('Payment link not available or cash payment');
  }
};

onMounted(() => {
  fireConfetti();
  fetchPaymentLink();
});

useSeoMeta({
  title: () => `${t('checkout.success_title')} | MYCOM`,
  robots: 'noindex, nofollow'
});
</script>