<template>
  <div>
    <!-- Breadcrumbs -->
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

    <!-- Main Content -->
    <div class="container mx-auto px-4 sm:px-6 md:px-8">
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-10 items-start">
        <div class="lg:col-span-7 xl:col-span-8 space-y-8">
          <ProductGallery :product="product" />
          <ProductTabs
              :product-id="product.id"
              :description="product.description"
              :specifications="product.specifications"
              :reviews-count="product.reviews_count"
          />
        </div>
        <div class="lg:col-span-5 xl:col-span-4 sticky top-24">
          <ProductInfo :product="product" />
        </div>
      </div>
    </div>

    <ProductMobileStickyBar :product="product" />
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import type { Product } from '~/types';

const props = defineProps({
  slug: { type: String, required: true }
});

const route = useRoute();
const router = useRouter();
const config = useRuntimeConfig();
const { locale, t } = useI18n();
const localePath = useLocalePath();

// 1. Извлекаем ID
const extractId = (slugStr: string) => {
  if (!slugStr) return '';
  const parts = slugStr.split(/[-_]/);
  return parts.length > 1 ? parts.pop() : slugStr;
};

const productId = extractId(props.slug);

// 2. Загрузка данных
// УБРАЛИ watch: [locale], чтобы управлять обновлением вручную
const { data: product, error, refresh } = await useFetch<Product>(`${config.public.apiBase}/api/v1/site/products/detail`, {
  query: {
    product_id: productId,
    lang: locale // передаем ref, чтобы query был реактивным
  },
  key: `product-detail-${productId}`, // Ключ теперь не зависит от локали, мы обновляем тот же объект
  transform: (response: any): Product => {
    const data = response.data;
    if (!data) throw new Error('No data');

    const rawSlug = data.slug || data.seo?.name;
    const finalSlug = rawSlug ? `${rawSlug}-${data.product_id}` : String(data.product_id);

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
      slug: finalSlug,
      brand: data.brand,
      isNew: data.is_new,
      product_code: data.product_code,
      packing_code: data.packing_code
    };
  }
});

// 3. ЛОГИКА ОБНОВЛЕНИЯ ПРИ СМЕНЕ ЯЗЫКА
watch(locale, async () => {
  // 1. Принудительно обновляем данные товара на новом языке
  await refresh();

  // 2. Если пришли новые данные и в них есть слаг
  if (product.value?.slug) {
    const currentRouteSlug = Array.isArray(route.params.slug) ? route.params.slug[0] : route.params.slug;

    // 3. Если слаг в URL старый — обновляем его
    if (currentRouteSlug !== product.value.slug) {
      router.replace(localePath(`/product/${product.value.slug}`));
    }
  }
});

if (error.value || !product.value) {
  throw createError({ statusCode: 404, statusMessage: 'Product Not Found', fatal: true });
}

// ... SEO (код без изменений) ...
const baseUrl = 'https://mycom.uz';
const canonicalUrl = computed(() => `${baseUrl}${localePath('/product/' + product.value!.slug)}`);

useHead({ link: [{ rel: 'canonical', href: canonicalUrl }] });

useSeoMeta({
  title: () => {
    const s = product.value?.seo;
    if (s?.title) return `${s.title} | MYCOM`;
    const productName = s?.name || product.value?.name;
    return `${productName} в Ташкенте и Узбекистане купить по оптимальной цене можно в интернет-магазине My.com.uz`;
  },
  description: () => {
    const s = product.value?.seo;
    if (s?.description) return s.description;
    return product.value?.description?.replace(/<[^>]*>?/gm, '').slice(0, 160).trim() + '...' || '';
  },
  keywords: () => product.value?.seo?.keywords || '',
  ogTitle: () => product.value?.name,
  ogImage: () => product.value?.images?.[0] || `${baseUrl}/logo.png`,
  ogType: 'product',
});
</script>