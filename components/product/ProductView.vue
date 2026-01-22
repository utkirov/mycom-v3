<template>
  <div>
    <!-- Breadcrumbs -->
    <div class="container mx-auto px-4 py-4 sm:px-6 md:px-8">
      <div class="text-xs text-gray-400 md:text-sm flex items-center flex-wrap gap-1 uppercase font-bold tracking-wider">
        <NuxtLink :to="localePath('/')" class="hover:text-brand-blue transition-colors">{{ $t('common.home') }}</NuxtLink>
        <Icon name="ph:caret-right-bold" size="12" />
        <NuxtLink :to="localePath('/catalog')" class="hover:text-brand-blue transition-colors">{{ $t('common.catalog') }}</NuxtLink>
        <Icon name="ph:caret-right-bold" size="12" />
        <span class="text-gray-600 truncate max-w-[200px] sm:max-w-md">
          {{ product.name }}
        </span>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container mx-auto px-4 sm:px-6 md:px-8">
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-10 items-start">

        <!-- Left Column -->
        <div class="lg:col-span-7 xl:col-span-8 space-y-8">
          <ProductGallery :product="product" />

          <ProductTabs
              :product-id="product.id"
              :description="product.description"
              :specifications="product.specifications"
              :reviews-count="product.reviews_count"
          />
        </div>

        <!-- Right Column (Sticky) -->
        <div class="lg:col-span-5 xl:col-span-4 sticky top-24">
          <ProductInfo :product="product" />
        </div>

      </div>
    </div>

    <!-- Mobile Sticky Action Bar -->
    <ProductMobileStickyBar :product="product" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Product, ApiResponse } from '~/types';

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
      stock: Number(data.stock ?? data.count ?? 0),
      rating: Number(data.rate || 0),
      reviews_count: Number(data.feedbacks || 0),
      specifications: data.attributes || [],
      seo: data.seo,
      slug: data.seo?.name ? `${data.seo.name}_${data.product_id}` : String(data.product_id),
      brand: data.brand,
      isNew: data.is_new
    };
  }
});

if (error.value || !product.value) {
  throw createError({ statusCode: 404, statusMessage: 'Product Not Found', fatal: true });
}

// --- SEO Schema (Rich Snippets) ---
const baseUrl = 'https://mycom.uz';
const canonicalUrl = computed(() => `${baseUrl}${localePath('/product/' + product.value!.slug)}`);
const seoDescription = computed(() => product.value?.seo?.description || product.value?.name);
const seoImage = computed(() => product.value?.images?.[0] || `${baseUrl}/logo.png`);

const jsonLd = computed(() => {
  const p = product.value!;
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    image: p.images,
    description: seoDescription.value,
    sku: String(p.id),
    brand: { '@type': 'Brand', name: p.brand?.name || 'MYCOM' },
    offers: {
      '@type': 'Offer',
      url: canonicalUrl.value,
      priceCurrency: 'UZS',
      price: p.price,
      availability: p.stock && p.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@type': 'Organization', name: 'MYCOM' }
    }
  };

  // Добавляем рейтинг, если он есть
  if (p.rating && p.reviews_count) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: p.rating,
      reviewCount: p.reviews_count
    };
  }

  return schema;
});

useHead({
  link: [{ rel: 'canonical', href: canonicalUrl }],
  script: [{ type: 'application/ld+json', children: jsonLd }]
});

useSeoMeta({
  title: () => `${product.value?.seo?.name || product.value?.name} | MYCOM`,
  description: seoDescription,
  ogTitle: () => product.value?.name,
  ogDescription: seoDescription,
  ogImage: seoImage,
  ogType: 'product',
  twitterCard: 'summary_large_image',
});
</script>