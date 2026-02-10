<template>
  <div>
    <!-- 1. Breadcrumbs -->
    <div class="container mx-auto px-4 py-4 sm:px-6 md:px-8">
      <nav class="text-xs text-gray-400 md:text-sm flex items-center flex-wrap gap-1 uppercase font-bold tracking-wider">
        <NuxtLink :to="localePath('/')" class="hover:text-brand-blue transition-colors">{{ $t('common.home') }}</NuxtLink>
        <Icon name="ph:caret-right-bold" size="10" />
        <NuxtLink :to="localePath('/catalog')" class="hover:text-brand-blue transition-colors">{{ $t('common.catalog') }}</NuxtLink>
        <Icon name="ph:caret-right-bold" size="10" />
        <span class="text-gray-600 truncate max-w-[200px] sm:max-w-md">
          {{ product.name }}
        </span>
      </nav>
    </div>

    <!-- 2. Main Content -->
    <div class="container mx-auto px-4 sm:px-6 md:px-8">
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-10 items-start">

        <!-- Левая колонка: Галерея и Табы (Описание, Характеристики, Отзывы) -->
        <div class="lg:col-span-7 xl:col-span-8 space-y-8">
          <ProductGallery :product="product" />

          <ProductTabs
              :product-id="product.id"
              :description="product.description"
              :specifications="product.specifications"
              :reviews-count="product.reviews_count"
          />
        </div>

        <!-- Правая колонка: Основная информация, цены и кнопки (Sticky) -->
        <div class="lg:col-span-5 xl:col-span-4 sticky top-24">
          <ProductInfo :product="product" />
        </div>

      </div>
    </div>

    <!-- Мобильная плашка с кнопкой купить (фиксированная снизу) -->
    <ProductMobileStickyBar :product="product" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Product } from '~/types';

const props = defineProps({
  slug: { type: String, required: true }
});

const config = useRuntimeConfig();
const { locale, t } = useI18n();
const localePath = useLocalePath();

// --- ПАРСИНГ ID ---
// Извлекает ID из слага (поддерживает и дефис и подчеркивание для совместимости)
const extractId = (slugStr: string) => {
  if (!slugStr) return '';
  const parts = slugStr.split(/[-_]/);
  return parts.length > 1 ? parts.pop() : slugStr;
};

const productId = extractId(props.slug);

// --- ЗАГРУЗКА ДАННЫХ ---
const { data: product, error } = await useFetch<Product>(`${config.public.apiBase}/api/v1/site/products/detail`, {
  query: {
    product_id: productId,
    lang: locale.value
  },
  key: `product-detail-${productId}-${locale.value}`,
  transform: (response: any): Product => {
    const data = response.data;
    if (!data) throw new Error('No data');

    return {
      id: data.product_id,
      product_id: data.product_id,
      name: data.name,
      description: data.description,
      price: Number(data.discount_price || data.price),
      oldPrice: data.discount_price ? Number(data.price) : null,
      discount_price: data.discount_price ? Number(data.discount_price) : undefined,
      images: data.images?.map((img: any) => img.url) || [],
      image: data.images?.[0]?.url || '',
      stock: Number(data.stock ?? 0),
      rating: Number(data.rate || 0),
      reviews_count: Number(data.feedbacks || 0),
      specifications: data.attributes || [],
      seo: data.seo,
      // Формируем внутренний слаг через дефис
      slug: data.seo?.name ? `${data.seo.name}-${data.product_id}` : String(data.product_id),
      brand: data.brand,
      isNew: data.is_new,
      product_code: data.product_code, // Артикул
      packing_code: data.packing_code  // Внутренний код
    };
  }
});

// Обработка 404
if (error.value || !product.value) {
  throw createError({ statusCode: 404, statusMessage: 'Product Not Found', fatal: true });
}

// --- SEO И МЕТА-ТЕГИ ---
const baseUrl = 'https://mycom.uz';
const canonicalUrl = computed(() => `${baseUrl}${localePath('/product/' + product.value!.slug)}`);

useHead({
  link: [{ rel: 'canonical', href: canonicalUrl }]
});

useSeoMeta({
  // ФОРМУЛА TITLE:
  // 1. Если есть seo.title -> берем его.
  // 2. Иначе -> [Name] в Ташкенте и Узбекистане купить по оптимальной цене можно в интернет-магазине My.com.uz
  title: () => {
    const seo = product.value?.seo;
    if (seo?.title) return `${seo.title} | MYCOM`;

    const productName = seo?.name || product.value?.name;
    return `${productName} в Ташкенте и Узбекистане купить по оптимальной цене можно в интернет-магазине My.com.uz | MYCOM`;
  },

  // DESCRIPTION:
  // 1. Если есть seo.description -> берем его.
  // 2. Иначе -> Очищенное от HTML описание товара (первые 160 символов).
  description: () => {
    const seo = product.value?.seo;
    if (seo?.description) return seo.description;

    return product.value?.description
        ?.replace(/<[^>]*>?/gm, '') // Очистка от HTML
        .slice(0, 160)
        .trim() + '...' || '';
  },

  keywords: () => product.value?.seo?.keywords || '',
  ogTitle: () => product.value?.name,
  ogImage: () => product.value?.images?.[0] || `${baseUrl}/logo.png`,
  ogType: 'product',
  twitterCard: 'summary_large_image',
});
</script>