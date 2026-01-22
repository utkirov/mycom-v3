<template>
  <div class="space-y-8">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-black text-brand-dark-blue">{{ $t('profile.orders') }}</h2>
      <div v-if="!pending && orders.length" class="text-sm font-bold text-gray-400 bg-white px-3 py-1 rounded-xl shadow-sm">
        {{ $t('common.found') }}: {{ apiResponse?.total || 0 }}
      </div>
    </div>

    <!-- Загрузка -->
    <div v-if="pending" class="space-y-6">
      <div v-for="n in 3" :key="n" class="h-64 w-full animate-pulse rounded-[32px] bg-gray-100"></div>
    </div>

    <!-- Ошибка -->
    <div v-else-if="error" class="py-10 text-center text-red-500 bg-red-50 rounded-[32px] border border-red-100">
      <Icon name="ph:warning-circle-bold" size="48" class="mb-2 mx-auto" />
      <p class="font-bold">{{ $t('common.error_loading') }}</p>
      <button @click="refresh" class="mt-4 text-brand-blue underline font-bold">{{ $t('common.retry') }}</button>
    </div>

    <!-- Список заказов -->
    <div v-else-if="orders.length > 0" class="space-y-6">
      <div
          v-for="order in orders"
          :key="order.id"
          class="rounded-[32px] bg-white p-6 shadow-sm border border-gray-100 transition-all hover:shadow-md hover:border-brand-blue/20"
      >
        <!-- Шапка заказа -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-gray-50 pb-6">
          <div>
            <div class="flex items-center gap-3 mb-1">
              <h3 class="text-xl font-black text-brand-dark-blue">{{ $t('profile.order_number', { id: order.id }) }}</h3>
              <span class="px-2 py-1 rounded-lg bg-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                {{ order.payment_method }}
              </span>
            </div>
            <p class="text-xs font-bold text-gray-400 uppercase tracking-widest">{{ formatDate(order.date) }}</p>
          </div>
          <div class="text-right">
            <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{{ $t('cart.total') }}</p>
            <p class="font-unbounded text-xl font-bold text-brand-blue">
              {{ format(order.total) }} <span class="text-xs font-normal text-gray-500">сум</span>
            </p>
          </div>
        </div>

        <!-- Прогресс бар (Steps) -->
        <div class="mb-8 px-2"> <!-- Добавил px-2, чтобы кружки не резались по краям -->
          <div class="relative flex justify-between items-center w-full">

            <!-- ФОНОВАЯ ЛИНИЯ (Сделал темнее - gray-200) -->
            <div class="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 z-0 rounded-full"></div>

            <!-- АКТИВНАЯ ЛИНИЯ -->
            <div
                class="absolute top-1/2 left-0 h-1 bg-brand-blue -translate-y-1/2 z-0 rounded-full transition-all duration-500"
                :style="{ width: getProgressWidth(order.status) + '%' }"
            ></div>

            <!-- ШАГИ -->
            <div
                v-for="(step, index) in steps"
                :key="step.key"
                class="relative z-10 flex flex-col items-center gap-2"
            >
              <!-- Кружок -->
              <div
                  class="flex h-10 w-10 items-center justify-center rounded-full border-4 transition-all duration-300 bg-white"
                  :class="index <= getStepIndex(order.status)
                  ? 'border-brand-blue text-brand-blue shadow-lg shadow-brand-blue/20 scale-110'
                  : 'border-gray-200 text-gray-300'"
              >
                <Icon :name="step.icon" size="18" />
              </div>

              <!-- Текст под кружком -->
              <span
                  class="absolute top-12 whitespace-nowrap text-[10px] font-bold uppercase tracking-widest transition-colors hidden sm:block"
                  :class="index <= getStepIndex(order.status) ? 'text-brand-blue' : 'text-gray-300'"
              >
                {{ $t(step.label) }}
              </span>
            </div>
          </div>

          <!-- Текстовый статус для мобильных -->
          <div class="mt-8 text-center sm:hidden">
            <span class="font-bold text-brand-blue text-sm">{{ $t(`status.${order.status}`) || order.status }}</span>
          </div>
        </div>

        <!-- Детали: Адрес и Товары -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 bg-gray-50/50 rounded-2xl p-6 mt-8">
          <!-- Адрес -->
          <div class="lg:col-span-1">
            <h4 class="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Icon name="ph:map-pin-fill" />
              {{ $t('checkout.address_title') }}
            </h4>
            <!-- Используем функцию очистки адреса -->
            <p class="text-sm font-bold text-brand-dark-blue leading-relaxed">
              {{ cleanAddress(order.address) }}
            </p>
          </div>

          <!-- Товары -->
          <div class="lg:col-span-2">
            <h4 class="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Icon name="ph:shopping-cart-simple-fill" />
              {{ $t('checkout.order_content') }}
            </h4>
            <div class="space-y-3">
              <div v-for="(item, idx) in order.items" :key="idx" class="flex items-center justify-between gap-4 bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                <div class="flex items-center gap-3 overflow-hidden">
                  <!-- Картинка или Плейсхолдер -->
                  <div class="h-12 w-12 shrink-0 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100 overflow-hidden">
                    <img v-if="item.image" :src="item.image" class="h-full w-full object-contain mix-blend-multiply">
                    <Icon v-else name="ph:image" size="20" class="text-gray-300" />
                  </div>

                  <div>
                    <p class="text-sm font-bold text-brand-dark-blue line-clamp-1">{{ item.product_name }}</p>
                    <p class="text-[10px] font-bold text-gray-400">{{ item.quantity }} {{ $t('checkout.pcs') }}</p>
                  </div>
                </div>
                <span class="text-sm font-bold text-brand-blue whitespace-nowrap">
                  {{ format(Number(item.total_price)) }}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Пустое состояние -->
    <div v-else class="flex flex-col items-center justify-center rounded-[40px] bg-white py-24 text-center border border-dashed border-gray-200">
      <div class="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gray-50 text-gray-200 shadow-inner">
        <Icon name="ph:package-thin" size="56" />
      </div>
      <h3 class="text-2xl font-black text-brand-dark-blue">{{ $t('profile.orders_empty_title') }}</h3>
      <p class="mt-2 max-w-xs text-sm text-gray-500 mx-auto">
        {{ $t('profile.orders_empty_text') }}
      </p>
      <NuxtLink :to="localePath('/')" class="mt-10 inline-flex items-center justify-center rounded-2xl bg-brand-blue px-10 py-4 text-sm font-black text-white shadow-xl shadow-brand-blue/30 transition-all hover:bg-brand-dark-blue hover:-translate-y-1">
        {{ $t('cart.go_to_catalog') }}
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'profile', middleware: 'auth' });

const { baseURL, getHeaders } = useApi();
const { locale, t } = useI18n();
const { format } = useCurrency();
const localePath = useLocalePath();

const currentPage = ref(1);

// --- ЗАГРУЗКА ДАННЫХ ---
const { data: apiResponse, pending, error, refresh } = await useFetch<any>(() => '/api/v1/site/profile/orders', {
  baseURL: baseURL,
  query: computed(() => ({
    lang: locale.value,
    page: currentPage.value
  })),
  headers: computed(() => getHeaders()),
  watch: [currentPage],
  transform: (res: any) => res.data || {}
});

// Маппинг данных из JSON в удобный формат
const orders = computed(() => {
  const list = apiResponse.value?.list || [];
  return list.map((item: any) => ({
    id: item.order_id,
    date: item.date,
    total: Number(item.total_amount),
    status: item.status,
    payment_method: item.payment_method,
    address: item.address,
    items: item.items || []
  }));
});

// --- ЛОГИКА СТАТУСОВ (TRACKING) ---
const steps = [
  { key: 'pending', label: 'status.pending', icon: 'ph:clock-countdown-fill' },
  { key: 'processing', label: 'status.processing', icon: 'ph:package-fill' },
  { key: 'shipping', label: 'status.shipping', icon: 'ph:truck-fill' },
  { key: 'delivered', label: 'status.delivered', icon: 'ph:check-circle-fill' }
];

const getStepIndex = (status: string) => {
  if (status === 'paid') return 1; // "Оплачен" приравниваем к "В обработке"
  return steps.findIndex(step => step.key === status);
};

const getProgressWidth = (status: string) => {
  const index = getStepIndex(status);
  if (index === -1) return 0;
  return (index / (steps.length - 1)) * 100;
};

// --- ФУНКЦИЯ ОЧИСТКИ АДРЕСА ---
const cleanAddress = (addr: string) => {
  if (!addr) return '—';
  // Заменяем повторяющиеся слова (дом дом -> дом, кв кв -> кв)
  // Флаг 'gi' - глобально, без учета регистра
  return addr
      .replace(/(дом\s+)+/gi, 'дом: ')
      .replace(/(кв\s+)+/gi, 'кв: ')
      .replace(/:\s*:/g, ':') // Убираем двойные двоеточия если появились
      .replace(/\s+/g, ' ') // Убираем лишние пробелы
      .trim();
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString(locale.value === 'uz' ? 'uz-UZ' : 'ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

useSeoMeta({
  title: () => `${t('profile.orders')} | MYCOM`,
  robots: 'noindex, nofollow'
});
</script>