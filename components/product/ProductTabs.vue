<template>
  <div id="details" class="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
    <!-- Табы (Навигация) -->
    <div class="flex gap-8 border-b border-gray-100 mb-6 overflow-x-auto no-scrollbar">
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

    <!-- Контент табов -->
    <div class="min-h-[200px]">

      <!-- 1. ВКЛАДКА: ОПИСАНИЕ (С ЭФФЕКТОМ АККОРДЕОНА) -->
      <div v-if="activeTab === 'desc'" class="relative">
        <div
            class="prose max-w-none text-sm md:text-base text-gray-700 leading-relaxed overflow-hidden transition-all duration-500 ease-in-out"
            :class="isDescExpanded ? 'max-h-[10000px]' : 'max-h-48'"
        >
          <div v-sanitize="description || $t('common.nothing_found')"></div>
        </div>

        <!-- Градиентное затухание (показываем, если текст не развернут и он длинный) -->
        <div
            v-if="!isDescExpanded && description && description.length > 400"
            class="absolute bottom-10 left-0 right-0 h-24 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none"
        ></div>

        <!-- Кнопка Подробнее -->
        <button
            v-if="description && description.length > 400"
            @click="isDescExpanded = !isDescExpanded"
            class="mt-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-brand-blue hover:text-brand-dark-blue transition-colors group"
        >
          <span>{{ isDescExpanded ? 'Свернуть описание' : 'Читать подробнее' }}</span>
          <Icon
              :name="isDescExpanded ? 'ph:caret-up-bold' : 'ph:caret-down-bold'"
              class="transition-transform duration-300"
              :class="isDescExpanded ? '' : 'group-hover:translate-y-0.5'"
          />
        </button>
      </div>

      <!-- 2. ВКЛАДКА: ХАРАКТЕРИСТИКИ -->
      <div v-else-if="activeTab === 'specs'">
        <div v-if="specifications && specifications.length" class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-0">
          <div v-for="(spec, i) in specifications" :key="i" class="flex justify-between py-3 border-b border-gray-50 last:border-0 group">
            <span class="text-gray-500 text-sm group-hover:text-gray-700 transition-colors">{{ spec.name }}</span>
            <span class="font-bold text-brand-dark-blue text-sm text-right ml-4">{{ spec.value }}</span>
          </div>
        </div>
        <div v-else class="text-center py-10">
          <Icon name="ph:sliders-horizontal-light" size="48" class="text-gray-200 mx-auto mb-2" />
          <p class="text-gray-400">{{ $t('common.nothing_found') }}</p>
        </div>
      </div>

      <!-- 3. ВКЛАДКА: ОТЗЫВЫ -->
      <div v-else-if="activeTab === 'reviews'" class="space-y-8">
        <div v-if="reviewsPending" class="py-10 text-center">
          <Icon name="svg-spinners:ring-resize" class="text-brand-blue" size="32" />
        </div>

        <div v-else-if="reviewsList.length > 0" class="space-y-6">
          <div v-for="review in reviewsList" :key="review.feedback_id" class="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-3">
                <div class="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold uppercase ring-1 ring-gray-200">
                  {{ (review.user || 'A')[0] }}
                </div>
                <div>
                  <p class="font-bold text-gray-900 text-sm">{{ review.user }}</p>
                  <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{{ formatDate(review.date) }}</p>
                </div>
              </div>
              <div class="flex text-yellow-400">
                <Icon v-for="n in 5" :key="n" :name="n <= Math.round(review.rate / 2) ? 'ph:star-fill' : 'ph:star'" size="14" />
              </div>
            </div>
            <p class="text-gray-600 text-sm mt-2 leading-relaxed">{{ review.feedback }}</p>
          </div>
        </div>

        <div v-else class="py-12 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
          <Icon name="ph:chat-teardrop-dots-thin" size="56" class="text-gray-300 mx-auto mb-3"/>
          <p class="text-gray-500 font-bold">{{ $t('product.reviews_empty') }}</p>
        </div>

        <!-- Форма добавления отзыва -->
        <div class="bg-gray-50/50 p-6 rounded-3xl border border-gray-100 mt-8">
          <h3 class="text-lg font-black text-brand-dark-blue mb-4 uppercase tracking-tight">{{ $t('product.reviews_leave') }}</h3>
          <form @submit.prevent="submitReview">
            <div class="mb-6">
              <span class="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">{{ $t('product.rating') }}:</span>
              <div class="flex gap-2">
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
                      size="32"
                  />
                </button>
              </div>
            </div>

            <div class="mb-4">
              <label class="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                {{ $t('product.reviews_comment') }}:
              </label>
              <textarea
                  v-model="newReview.text"
                  rows="4"
                  class="w-full rounded-2xl border-transparent bg-white p-4 text-sm shadow-sm ring-1 ring-gray-100 focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all placeholder:text-gray-300"
                  :placeholder="$t('product.reviews_placeholder')"
              ></textarea>
            </div>

            <button
                type="submit"
                :disabled="isSubmitting"
                class="rounded-xl bg-brand-blue px-8 py-3.5 text-xs font-black text-white uppercase tracking-widest shadow-lg shadow-brand-blue/20 transition-all hover:bg-brand-dark-blue disabled:opacity-70 flex items-center gap-2 active:scale-95"
            >
              <Icon v-if="isSubmitting" name="svg-spinners:ring-resize" size="18" />
              <span>{{ $t('product.reviews_submit') }}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

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
const isDescExpanded = ref(false); // Для аккордеона описания

const tabs = computed(() => [
  { id: 'desc', label: t('product.description') },
  { id: 'specs', label: t('product.specs') },
  { id: 'reviews', label: t('product.reviews', { n: props.reviewsCount || 0 }) },
]);

// Логика отзывов
const { data: reviewsData, pending: reviewsPending, refresh: refreshReviews } = await useFetch(`${config.public.apiBase}/api/v1/site/products/feedbacks`, {
  query: { product_id: props.productId, lang: locale.value },
  immediate: false,
  watch: [activeTab]
});

watch(activeTab, (val) => {
  if (val === 'reviews') refreshReviews();
});

const reviewsList = computed(() => {
  const data = reviewsData.value?.data || reviewsData.value;
  return Array.isArray(data?.list) ? data.list : [];
});

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString(locale.value === 'uz' ? 'uz-UZ' : 'ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

// Форма отзыва
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

<style scoped>
.prose :where(p):not(:where([class~="not-prose"] *)) {
  margin-top: 1em;
  margin-bottom: 1em;
}

/* Стили для плавности раскрытия аккордеона */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 500ms;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
</style>