<template>
  <div class="bg-gray-50 py-10 md:py-20">
    <div class="w-full px-4 sm:px-6 md:px-8 max-w-4xl mx-auto">
      <div class="text-center mb-10">
        <div class="inline-flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm mb-6 text-brand-blue">
          <Icon name="ph:package-duotone" size="48" />
        </div>
        <h1 class="text-4xl font-black text-brand-dark-blue">{{ $t('common.tracking') }}</h1>
        <p class="mt-3 text-gray-500">{{ $t('tracking.description') }}</p>
      </div>

      <div class="mx-auto max-w-xl">
        <form @submit.prevent="handleTrack()" class="flex items-center gap-3 rounded-[24px] bg-white p-2 shadow-xl shadow-brand-blue/5 border border-gray-100">
          <input
              v-model="orderIdInput"
              type="text"
              :placeholder="$t('tracking.input_placeholder')"
              class="h-14 w-full border-none bg-transparent pl-6 text-lg font-bold text-brand-dark-blue focus:ring-0"
          >
          <button
              type="submit"
              :disabled="pending"
              class="h-14 shrink-0 rounded-[18px] bg-brand-blue px-10 font-black text-white transition-all hover:bg-brand-dark-blue active:scale-95 disabled:opacity-50"
          >
            <Icon v-if="pending" name="svg-spinners:ring-resize" class="mr-2" />
            {{ $t('common.search_btn') || 'Найти' }}
          </button>
        </form>

        <p v-if="errorMsg" class="mt-4 text-center text-sm font-bold text-brand-red flex items-center justify-center gap-2">
          <Icon name="ph:warning-circle-fill" />
          {{ errorMsg }}
        </p>
      </div>

      <div v-if="orderData" class="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <TrackingOrderStatus :order="orderData" />
      </div>

      <div v-else-if="!pending && searchedId && !orderData" class="mt-12 text-center py-12 bg-white rounded-[40px] border border-dashed border-gray-200">
        <Icon name="ph:magnifying-glass-x-bold" size="48" class="text-gray-200 mx-auto mb-4" />
        <p class="text-gray-500 font-bold">
          {{ $t('checkout.order_number') }} #{{ searchedId }} {{ $t('common.nothing_found').toLowerCase() }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const route = useRoute();
const { call } = useApi();
const { t, locale } = useI18n();

const orderIdInput = ref('');
const searchedId = ref('');
const orderData = ref<any>(null);
const pending = ref(false);
const errorMsg = ref('');

const handleTrack = async (id?: string) => {
  const targetId = id || orderIdInput.value.trim();
  if (!targetId) return;

  errorMsg.value = '';
  pending.value = true;
  searchedId.value = targetId;

  try {
    const response: any = await call(`/api/v1/site/profile/orders/detail`, {
      query: { order_id: targetId, lang: locale.value }
    });

    if (response.data) {
      // --- UPDATE: MAPPING ---
      const rawOrder = response.data;
      if (rawOrder.items) {
        rawOrder.items = rawOrder.items.map((item: any) => ({
          ...item,
          // Генерируем правильный слаг для ссылок
          slug: item.slug ? `${item.slug}-${item.product_id}` : String(item.product_id)
        }));
      }
      orderData.value = rawOrder;
    } else {
      orderData.value = null;
    }
  } catch (e: any) {
    orderData.value = null;
    errorMsg.value = e.data?.message || t('common.error_generic');
  } finally {
    pending.value = false;
  }
};

onMounted(() => {
  const idFromQuery = route.query.id as string;
  if (idFromQuery) {
    orderIdInput.value = idFromQuery;
    handleTrack(idFromQuery);
  }
});

useSeoMeta({
  title: () => `${t('common.tracking')} | MYCOM`,
  robots: 'noindex, nofollow'
});
</script>