<template>
  <div class="space-y-8">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-black text-brand-dark-blue">{{ $t('profile.orders') }}</h2>
      <div v-if="!pending && totalCount > 0" class="text-sm font-bold text-gray-400 bg-white px-3 py-1 rounded-xl shadow-sm">
        {{ $t('common.found') }}: {{ totalCount }}
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
    <div v-else-if="orders.length > 0">
      <div class="space-y-6">
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
                <!-- Бейдж метода оплаты -->
                <span class="px-2 py-1 rounded-lg bg-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  {{ order.payment_method }}
                </span>
                <!-- Бейдж статуса -->
                <span class="px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider"
                      :class="getStatusColor(order.status)"
                >
                  {{ $t(`status.${order.status}`) || order.status }}
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
          <div v-if="order.status !== 'cancelled'" class="mb-8 px-2">
            <div class="relative flex justify-between items-center w-full">
              <!-- ФОНОВАЯ ЛИНИЯ -->
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
          </div>

          <!-- Отмененный заказ -->
          <div v-else class="mb-8 p-4 bg-red-50 rounded-2xl flex items-center gap-3 text-red-500">
            <Icon name="ph:x-circle-fill" size="24" />
            <span class="font-bold">{{ $t('status.cancelled') }}</span>
          </div>

          <!-- Детали: Адрес и Товары -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 bg-gray-50/50 rounded-2xl p-6 mt-8">
            <!-- Адрес -->
            <div class="lg:col-span-1">
              <h4 class="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Icon name="ph:map-pin-fill" />
                {{ $t('checkout.address_title') }}
              </h4>
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
                    <div class="h-12 w-12 shrink-0 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100 overflow-hidden">
                      <img v-if="item.image" :src="item.image" class="h-full w-full object-contain mix-blend-multiply">
                      <Icon v-else name="ph:image" size="20" class="text-gray-300" />
                    </div>

                    <div>
                      <!-- Поле product_name из API -->
                      <p class="text-sm font-bold text-brand-dark-blue line-clamp-1">{{ item.product_name }}</p>
                      <div class="flex items-center gap-2 text-[10px] font-bold text-gray-400 mt-0.5">
                        <span>{{ item.quantity }} {{ $t('checkout.pcs') }}</span>
                        <span class="w-1 h-1 rounded-full bg-gray-300"></span>
                        <span>{{ format(Number(item.price)) }} сум/шт</span>
                      </div>
                    </div>
                  </div>
                  <!-- Поле total_price из API -->
                  <span class="text-sm font-bold text-brand-blue whitespace-nowrap">
                    {{ format(Number(item.total_price)) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- Пагинация (NEW) -->
      <div v-if="totalPages > 1" class="mt-12 flex justify-center items-center gap-2">
        <button
            @click="handlePageChange(currentPage - 1)"
            :disabled="currentPage === 1"
            class="h-10 w-10 flex items-center justify-center rounded-xl border border-gray-200 disabled:opacity-30 transition-all hover:border-brand-blue"
        >
          <Icon name="ph:caret-left-bold" />
        </button>

        <button
            v-for="page in totalPages"
            :key="page"
            @click="handlePageChange(page)"
            class="h-10 w-10 rounded-xl border text-sm font-bold transition-all shadow-sm"
            :class="currentPage === page
                   ? 'bg-brand-blue text-white border-brand-blue shadow-brand-blue/20'
                   : 'bg-white text-gray-500 border-gray-200 hover:border-brand-blue hover:text-brand-blue'"
        >
          {{ page }}
        </button>

        <button
            @click="handlePageChange(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="h-10 w-10 flex items-center justify-center rounded-xl border border-gray-200 disabled:opacity-30 transition-all hover:border-brand-blue"
        >
          <Icon name="ph:caret-right-bold" />
        </button>
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
import { computed, ref } from 'vue'

definePageMeta({ layout: 'profile', middleware: 'auth' });

const { baseURL, getHeaders } = useApi();
const { locale, t } = useI18n();
const { format } = useCurrency();
const localePath = useLocalePath();

const currentPage = ref(1);

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

// Достаем мета-данные пагинации из ответа API
const totalPages = computed(() => apiResponse.value?.lastPage || 1);
const totalCount = computed(() => apiResponse.value?.total || 0);

// Маппинг данных из list
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

// Функция смены страницы
const handlePageChange = (page: number) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
  if (process.client) window.scrollTo({ top: 0, behavior: 'smooth' });
};

// --- Логика статусов ---
const steps = [
  { key: 'pending', label: 'status.pending', icon: 'ph:clock-countdown-fill' },
  { key: 'processing', label: 'status.processing', icon: 'ph:package-fill' },
  { key: 'shipped', label: 'status.shipped', icon: 'ph:truck-fill' },
  { key: 'completed', label: 'status.completed', icon: 'ph:check-circle-fill' }
];

const getStepIndex = (status: string) => {
  if (status === 'paid') return 1; // paid = processing
  if (status === 'cancelled') return -1;
  return steps.findIndex(step => step.key === status);
};

const getProgressWidth = (status: string) => {
  const index = getStepIndex(status);
  if (index === -1) return 0;
  return (index / (steps.length - 1)) * 100;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-700';
    case 'cancelled': return 'bg-red-100 text-red-700';
    case 'shipped': return 'bg-blue-100 text-brand-blue';
    case 'paid':
    case 'processing': return 'bg-blue-50 text-brand-dark-blue';
    default: return 'bg-gray-100 text-gray-500'; // pending
  }
};

// Улучшенная функция очистки адреса (удаляет пустые метки "кв:" в конце)
const cleanAddress = (addr: string) => {
  if (!addr) return '—';
  return addr
      .replace(/кв:\s*$/i, '') // Убирает висящий "кв: " в конце
      .replace(/дом:\s*$/i, '') // Убирает висящий "дом: "
      .replace(/:\s*:/g, ':')
      .replace(/\s+/g, ' ')
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