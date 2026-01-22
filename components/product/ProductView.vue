<template>
  <div>
    <!-- Хлебные крошки -->
    <div class="container mx-auto px-4 py-4 sm:px-6 md:px-8">
      <div class="text-xs text-gray-400 md:text-sm flex items-center flex-wrap gap-1 uppercase font-bold tracking-wider">
        <NuxtLink :to="localePath('/')" class="hover:text-brand-blue transition-colors">{{ $t('common.home') }}</NuxtLink>
        <span class="text-gray-300">/</span>
        <NuxtLink :to="localePath('/catalog')" class="hover:text-brand-blue transition-colors">{{ $t('common.catalog') }}</NuxtLink>
        <span class="text-gray-300">/</span>
        <span class="text-gray-600 truncate max-w-[200px] sm:max-w-md">
          {{ product.name }}
        </span>
      </div>
    </div>

    <!-- Основной контент -->
    <div class="container mx-auto px-4 sm:px-6 md:px-8">
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-10 items-start">

        <div class="lg:col-span-7 xl:col-span-8 space-y-8">
          <ProductGallery :product="product" />

          <ProductTabs
              :product-id="product.id"
              :description="product.description"
              :specifications="product.specifications"
              :reviews-count="product.reviewsCount"
          />
        </div>

        <div class="lg:col-span-5 xl:col-span-4 sticky top-24">
          <!-- Передаем продукт в инфо-блок -->
          <ProductInfo :product="product" />
        </div>

      </div>
    </div>

    <ProductMobileStickyBar :product="product" />
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  slug: { type: String, required: true }
});

const config = useRuntimeConfig();
const { locale, t } = useI18n();
const localePath = useLocalePath();

const extractId = (slugStr: string) => {
  if (!slugStr) return '';
  const parts = slugStr.split('_');
  return parts.length > 1 ? parts.pop() : slugStr;
};

const productId = extractId(props.slug);

const { data: product, error } = await useFetch(`${config.public.apiBase}/api/v1/site/products/detail`, {
  query: {
    product_id: productId,
    lang: locale.value
  },
  key: `product-detail-${productId}-${locale.value}`,
  transform: (response: any) => {
    const data = response.data;
    if (!data) return null;

    // --- FIX: Обработка Stock ---
    let stockValue = 0;
    if (data.stock !== undefined && data.stock !== null) stockValue = Number(data.stock);
    else if (data.count !== undefined && data.count !== null) stockValue = Number(data.count);

    return {
      id: data.product_id,
      name: data.name,
      description: data.description,
      price: data.discount_price || data.price,
      oldPrice: data.discount_price ? data.price : null,
      images: data.images?.map((img: any) => img.url) || [],

      // Гарантируем число
      stock: stockValue,

      rating: data.rate || '0.0',
      reviewsCount: data.feedbacks || 0,
      specifications: data.attributes || [],
      seo: data.seo,
      slug: data.seo?.name ? `${data.seo.name}_${data.product_id}` : data.product_id,
      brand: data.brand,
      product_code: data.product_code,
      packing_code: data.packing_code,
    };
  }
});

if (error.value || !product.value) {
  throw createError({ statusCode: 404, statusMessage: 'Product Not Found', fatal: true });
}

// SEO Meta
const baseUrl = 'https://mycom.uz';
const canonicalUrl = computed(() => `${baseUrl}${localePath('/product/' + product.value.slug)}`);
const seoDescription = computed(() => product.value?.seo?.description || product.value?.name);
const seoImage = computed(() => product.value?.images?.[0] || `${baseUrl}/logo.png`);

const jsonLd = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: product.value.name,
  image: product.value.images,
  description: seoDescription.value,
  sku: product.value.id,
  brand: { '@type': 'Brand', name: product.value.brand?.name || 'MYCOM' },
  offers: {
    '@type': 'Offer',
    url: canonicalUrl.value,
    priceCurrency: 'UZS',
    price: product.value.price,
    availability: product.value.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    itemCondition: 'https://schema.org/NewCondition',
    seller: { '@type': 'Organization', name: 'MYCOM' }
  }
}));

useHead({
  link: [{ rel: 'canonical', href: canonicalUrl }],
  script: [{ type: 'application/ld+json', children: computed(() => JSON.stringify(jsonLd.value)) }]
});

useSeoMeta({
  title: () => `${product.value?.seo?.name || product.value?.name} | MYCOM`,
  description: seoDescription,
  ogImage: seoImage,
});
</script>