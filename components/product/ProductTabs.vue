<template>
  <div id="details" class="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
    <div class="flex gap-8 border-b border-gray-100 mb-6 overflow-x-auto">
      <button
          v-for="tab in tabs" :key="tab.id"
          @click="activeTab = tab.id"
          class="pb-3 text-lg font-bold transition-colors relative whitespace-nowrap"
          :class="activeTab === tab.id ? 'text-brand-blue' : 'text-gray-400 hover:text-gray-600'"
      >
        {{ tab.label }}
        <span v-if="activeTab === tab.id" class="absolute bottom-0 left-0 w-full h-1 bg-brand-blue rounded-t-full"></span>
      </button>
    </div>

    <div class="min-h-[200px]">
      <!-- ИСПРАВЛЕНИЕ: v-sanitize вместо v-html -->
      <div v-if="activeTab === 'desc'" class="prose max-w-none text-gray-700 leading-relaxed">
        <div v-sanitize="description || $t('common.nothing_found')"></div>
      </div>

      <div v-else-if="activeTab === 'specs'">
        <div v-if="specifications.length" class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-0">
          <div v-for="(spec, i) in specifications" :key="i" class="flex justify-between py-3 border-b border-gray-50 last:border-0">
            <span class="text-gray-500">{{ spec.name }}</span>
            <span class="font-semibold text-gray-900 text-right">{{ spec.value }}</span>
          </div>
        </div>
        <div v-else class="text-gray-500">{{ $t('common.nothing_found') }}</div>
      </div>

      <div v-else-if="activeTab === 'reviews'" class="space-y-8">
        <div v-if="reviewsPending" class="py-10 text-center">
          <Icon name="ph:spinner" class="animate-spin text-brand-blue" size="32" />
        </div>

        <div v-else-if="reviewsList.length > 0" class="space-y-6">
          <div v-for="review in reviewsList" :key="review.feedback_id" class="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-3">
                <div class="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold uppercase">
                  {{ (review.user || 'A')[0] }}
                </div>
                <div>
                  <p class="font-bold text-gray-900 text-sm">{{ review.user }}</p>
                  <p class="text-xs text-gray-400">{{ formatDate(review.date) }}</p>
                </div>
              </div>
              <div class="flex text-yellow-400">
                <Icon v-for="n in 5" :key="n" :name="n <= Math.round(review.rate / 2) ? 'ph:star-fill' : 'ph:star'" size="16" />
              </div>
            </div>
            <p class="text-gray-600 text-sm mt-2">{{ review.feedback }}</p>
          </div>
        </div>

        <div v-else class="py-10 text-center bg-gray-50 rounded-xl">
          <Icon name="ph:chat-teardrop-dots" size="48" class="text-gray-300 mx-auto mb-3"/>
          <p class="text-gray-500 font-medium">{{ $t('product.reviews_empty') }}</p>
        </div>

        <div class="bg-gray-50 p-6 rounded-xl border border-gray-100 mt-8">
          <h3 class="text-lg font-bold text-brand-dark-blue mb-4">{{ $t('product.reviews_leave') }}</h3>
          <form @submit.prevent="submitReview">
            <div class="mb-4">
              <span class="block text-sm font-bold text-gray-700 mb-2">{{ $t('product.rating') }}:</span>
              <div class="flex gap-1">
                <button
                    v-for="star in 5"
                    :key="star"
                    type="button"
                    @click="newReview.rate = star * 2"
                    class="transition-transform hover:scale-110 active:scale-95 focus:outline-none"
                >
                  <Icon
                      :name="(newReview.rate / 2) >= star ? 'ph:star-fill' : 'ph:star'"
                      class="transition-colors"
                      :class="(newReview.rate / 2) >= star ? 'text-yellow-400' : 'text-gray-300'"
                      size="28"
                  />
                </button>
              </div>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-bold text-gray-700 mb-2">{{ $t('product.reviews_comment') }}:</label>
              <textarea
                  v-model="newReview.text"
                  rows="3"
                  class="w-full rounded-xl border-gray-200 p-3 text-sm focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition bg-white"
                  :placeholder="$t('product.reviews_placeholder')"
              ></textarea>
            </div>

            <button
                type="submit"
                :disabled="isSubmitting"
                class="rounded-xl bg-brand-blue px-6 py-3 text-sm font-bold text-white shadow-lg shadow-brand-blue/20 transition hover:bg-brand-dark-blue disabled:opacity-70 flex items-center gap-2"
            >
              <Icon v-if="isSubmitting" name="ph:spinner" class="animate-spin" size="18" />
              <span>{{ $t('product.reviews_submit') }}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  productId: { type: [Number, String], required: true },
  description: String,
  specifications: Array,
  reviewsCount: Number
});

const config = useRuntimeConfig();
const authStore = useAuthStore();
const uiStore = useUIStore();
const { showToast } = useToast();
const { t, locale } = useI18n();

const activeTab = ref('desc');
const tabs = computed(() => [
  { id: 'desc', label: t('product.description') },
  { id: 'specs', label: t('product.specs') },
  { id: 'reviews', label: t('product.reviews', { n: props.reviewsCount || 0 }) },
]);

const { data: reviewsData, pending: reviewsPending, refresh: refreshReviews } = await useFetch(`${config.public.apiBase}/api/v1/site/products/feedbacks`, {
  query: { product_id: props.productId, lang: locale.value },
  immediate: false,
  watch: [activeTab]
});

watch(activeTab, (val) => { if (val === 'reviews') refreshReviews(); });

const reviewsList = computed(() => {
  const data = reviewsData.value?.data || reviewsData.value;
  return Array.isArray(data?.list) ? data.list : [];
});

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString(locale.value === 'uz' ? 'uz-UZ' : 'ru-RU');
};

const newReview = ref({ rate: 10, text: '' });
const isSubmitting = ref(false);

const submitReview = async () => {
  if (!authStore.token) {
    showToast(t('product.reviews_auth_required'), 'warning');
    uiStore.openAuthModal();
    return;
  }

  if (!newReview.value.text.trim()) {
    showToast(t('common.error_empty_field'), 'warning');
    return;
  }

  isSubmitting.value = true;
  try {
    await $fetch(`${config.public.apiBase}/api/v1/site/products/feedbacks/add`, {
      method: 'POST',
      query: {
        product_id: props.productId,
        feedback: newReview.value.text,
        rate: newReview.value.rate,
        lang: locale.value
      },
      headers: { Authorization: `Bearer ${authStore.token}` }
    });

    showToast(t('product.reviews_success'));
    newReview.value.text = '';
    newReview.value.rate = 10;
    await refreshReviews();
  } catch (e) {
    showToast(t('common.error_generic'), 'error');
  } finally {
    isSubmitting.value = false;
  }
};
</script>