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
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const { baseURL, getHeaders } = useApi();
const { t, locale } = useI18n();

const { data: apiResponse } = await useFetch<any>('/api/v1/site/collections-with-products', {
  baseURL: baseURL,
  headers: getHeaders(),
  query: { lang: locale.value },
  key: `home-collections-${locale.value}`,
  transform: (response) => response.data || []
});

const collectionsData = computed(() => {
  const raw = apiResponse.value || [];
  return raw.map((col: any) => ({
    collection_id: col.collection_id,
    name: col.name,
    slug: col.slug,
    products: (col.products || []).map((p: any) => {
      // --- FIX: Логика обработки Stock ---
      // 1. Проверяем stock, затем count
      // 2. Если значение пришло (даже 0), используем его.
      // 3. Если ничего нет, ставим 0 (нет в наличии) или другое дефолтное значение
      let stockValue = 0;
      if (p.stock !== undefined && p.stock !== null) stockValue = Number(p.stock);
      else if (p.count !== undefined && p.count !== null) stockValue = Number(p.count);

      return {
        id: p.product_id,
        name: p.name,
        image: p.image,
        price: Number(p.discount_price || p.price),
        oldPrice: p.discount_price ? Number(p.price) : null,
        rating: p.rating,
        reviewsCount: p.reviews_count,
        slug: p.seo?.name || null,
        seo: p.seo,
        stock: stockValue // <-- Теперь передаем чистое число
      };
    })
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