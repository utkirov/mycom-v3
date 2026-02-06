<template>
  <div>
    <!-- Баннер -->
    <HomeHeroBanner />

    <!-- Секция скидок -->
    <HomeDiscountedProducts />

    <!-- Категории -->
    <HomeCategoryLinks />

    <!-- Коллекции товаров -->
    <div v-if="collectionsData.length" class="space-y-2 pb-10">
      <HomeProductCarousel
          v-for="col in collectionsData"
          :key="col.collection_id"
          :title="col.name"
          :collection-slug="col.slug"
          :products="col.products"
          :collection-id="col.collection_id"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Product } from '~/types'; // Импорт типа

const { baseURL, getHeaders } = useApi();
const { t, locale } = useI18n();

const { data: apiResponse } = await useFetch<any>('/api/v1/site/collections-with-products', {
  baseURL: baseURL,
  headers: getHeaders(),
  query: { lang: locale.value },
  key: `home-collections-${locale.value}`,
  transform: (response) => response.data || []
});

// Типизированные данные
const collectionsData = computed(() => {
  const raw = apiResponse.value || [];

  return raw.map((col: any) => ({
    collection_id: col.collection_id,
    name: col.name,
    slug: col.slug,
    products: (col.products || []).map((p: any): Product => ({
      id: p.product_id,
      product_id: p.product_id, // Явно указываем для надежности
      name: p.name,
      image: p.image,
      price: Number(p.discount_price || p.price),
      oldPrice: p.discount_price ? Number(p.price) : null,
      rating: p.rating || 0, // В этом JSON рейтинга нет, ставим 0 или дефолт
      reviews_count: p.reviews_count || 0,

      // --- ОБНОВЛЕННЫЙ MAPPING ---
      // Берем slug из API и добавляем ID через дефис,
      // чтобы ProductView смог извлечь ID (11, 10 и т.д.)
      slug: p.slug ? `${p.slug}-${p.product_id}` : String(p.product_id),

      stock: Number(p.stock ?? 0)
    }))
  })).filter((col: any) => col.products.length > 0);
});

// SEO Meta
const title = computed(() => t('seo.index_title'));
const description = computed(() => t('seo.index_description'));
const baseUrl = 'https://mycom.uz';

useHead({ link: [{ rel: 'canonical', href: baseUrl }] });

useSeoMeta({
  title: title,
  description: description,
  ogTitle: title,
  ogDescription: description,
  ogUrl: baseUrl,
  ogImage: `${baseUrl}/logo.png`,
  ogType: 'website',
  ogSiteName: 'MYCOM.uz',
});
</script>