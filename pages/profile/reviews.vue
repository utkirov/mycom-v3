<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-brand-dark-blue">{{ $t('profile.my_reviews') }}</h2>
      <span v-if="reviews.length" class="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-500">
        {{ totalReviews }}
      </span>
    </div>

    <div v-if="pending" class="space-y-4">
      <div v-for="n in 3" :key="n" class="h-40 w-full animate-pulse rounded-2xl bg-gray-100"></div>
    </div>

    <div v-else-if="error" class="py-10 text-center text-red-500">
      {{ $t('common.error_loading') }}
    </div>

    <div v-else-if="reviews.length > 0" class="grid gap-4">
      <div
          v-for="review in reviews"
          :key="review.id"
          class="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm border border-gray-100 transition-all hover:shadow-md hover:border-brand-blue/30"
      >
        <div class="flex gap-4 items-start">
          <component
              :is="review.slug ? 'NuxtLink' : 'div'"
              :to="review.slug ? localePath(`/product/${review.slug}`) : undefined"
              class="shrink-0 h-16 w-16 rounded-xl bg-gray-50 border border-gray-100 p-2 overflow-hidden block"
          >
            <img
                :src="review.image || '/images/pc-placeholder.png'"
                :alt="review.productName"
                class="h-full w-full object-contain mix-blend-multiply"
                @error="e => e.target.style.opacity = 0.5"
            >
          </component>

          <div class="flex-grow min-w-0">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
              <component
                  :is="review.slug ? 'NuxtLink' : 'span'"
                  :to="review.slug ? localePath(`/catalog/${review.slug}`) : undefined"
                  class="text-sm font-bold text-brand-dark-blue line-clamp-1 transition-colors"
                  :class="review.slug ? 'hover:text-brand-blue' : ''"
              >
                {{ review.productName }}
              </component>
              <span class="text-xs text-gray-400 font-medium whitespace-nowrap">{{ formatDate(review.date) }}</span>
            </div>

            <div class="flex items-center gap-1 mb-3">
              <div class="flex text-yellow-400">
                <Icon
                    v-for="n in 5"
                    :key="n"
                    :name="n <= review.rating ? 'ph:star-fill' : 'ph:star'"
                    size="16"
                />
              </div>
              <span class="ml-2 text-xs font-bold text-gray-600">{{ review.rating }}/5</span>
            </div>

            <p class="text-sm text-gray-600 leading-relaxed bg-gray-50/50 rounded-lg p-3">
              {{ review.comment }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="flex flex-col items-center justify-center rounded-2xl bg-white py-20 text-center border border-dashed border-gray-200">
      <div class="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 text-brand-blue">
        <Icon name="ph:chat-teardrop-text" size="40" />
      </div>
      <h3 class="text-lg font-bold text-gray-800">{{ $t('product.reviews_empty') }}</h3>
      <p class="mt-2 max-w-xs text-sm text-gray-500">
        {{ $t('profile.reviews_empty_text') || 'Поделитесь своим мнением о покупках.' }}
      </p>
      <NuxtLink :to="localePath('/profile/orders')" class="mt-6 rounded-xl bg-white border border-gray-200 px-6 py-2.5 text-sm font-bold text-gray-700 shadow-sm transition hover:bg-gray-50 hover:text-brand-blue">
        {{ $t('product.reviews_leave') }}
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

definePageMeta({
  layout: 'profile',
  middleware: 'auth'
});

const config = useRuntimeConfig();
const authStore = useAuthStore();
const { t, locale } = useI18n(); // Переход на useI18n
const localePath = useLocalePath();

const { data: apiResponse, pending, error } = await useFetch<any>(`${config.public.apiBase}/api/v1/site/profile/feedbacks`, {
  query: { lang: locale.value }, // Используем системную локаль
  headers: computed(() => ({
    Authorization: `Bearer ${authStore.token}`
  })),
  transform: (response) => {
    const data = response.data || response;
    const list = Array.isArray(data.list) ? data.list : [];

    return {
      list: list.map((item: any) => ({
        id: item.feedback_id,
        productName: item.product_name,
        image: item.product_image,
        slug: item.product_slug
            ? `${item.product_slug}-${item.product_id}`
            : String(item.product_id),
        comment: item.feedback,
        rating: Math.round((item.rate || 0) / 2),
        date: item.date
      })),
      total: data.total || list.length
    };
  }
});

const reviews = computed(() => apiResponse.value?.list || []);
const totalReviews = computed(() => apiResponse.value?.total || 0);

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  return new Intl.DateTimeFormat(locale.value === 'uz' ? 'uz-UZ' : 'ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(dateString));
};

useSeoMeta({
  title: () => `${t('profile.my_reviews')} | MYCOM`,
  robots: 'noindex, nofollow'
});
</script>