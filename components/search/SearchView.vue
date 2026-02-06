<template>
  <div class="bg-white py-10 md:py-16">
    <div class="w-full px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">

      <div class="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-brand-dark-blue">
            {{ $t('common.search_results') }}:
            <span class="text-brand-blue">"{{ searchQuery }}"</span>
          </h1>
          <p v-if="totalFound > 0" class="mt-2 text-gray-500 font-medium">
            {{ $t('common.found') }} {{ totalFound }} {{ $t('cart.items_count', { n: totalFound }) }}
          </p>
        </div>
      </div>

      <div v-if="products.length > 0">
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          <div v-for="product in products" :key="product.product_id">
            <ProductCard
                :product="{
                id: product.product_id,
                name: product.name,
                image: product.image || '/images/pc-placeholder.png',
                price: product.discount_price || product.price,
                oldPrice: product.discount_price ? product.price : null,
                stock: 10,
                slug: product.slug,
                seo: product.seo
              }"
            />
          </div>
        </div>

        <div v-if="lastPage > 1" class="mt-12 flex justify-center gap-2">
          <button
              v-for="page in lastPage"
              :key="page"
              @click="handlePageChange(page)"
              class="h-10 w-10 rounded-lg border text-sm font-bold transition-all"
              :class="currentPage === page
              ? 'bg-brand-blue text-white border-brand-blue shadow-lg'
              : 'bg-white text-gray-600 border-gray-200 hover:border-brand-blue'"
          >
            {{ page }}
          </button>
        </div>
      </div>

      <div v-else class="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
        <div class="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
          <Icon name="ph:magnifying-glass-x" size="40" class="text-gray-300" />
        </div>
        <h2 class="text-2xl font-bold text-brand-dark-blue">{{ $t('common.nothing_found') }}</h2>
        <p class="mt-2 text-gray-500 max-w-sm mx-auto">
          {{ $t('cart.empty_text') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const router = useRouter();
const { baseURL, getHeaders } = useApi();
const { t, locale } = useI18n();

const currentPage = ref(Number(route.query.page) || 1);
const searchQuery = computed(() => route.query.q || '');

// Await useFetch (Suspense mode)
const { data: apiResponse } = await useFetch('/api/v1/site/search', {
  baseURL: baseURL,
  headers: getHeaders(),
  query: {
    lang: locale.value,
    search: searchQuery,
    page: currentPage
  },
  key: `search-${searchQuery.value}-${currentPage.value}`,
  transform: (res: any) => {
    const data = res.data || {};
    if (data.list) {
      data.list = data.list.map((p: any) => ({
        ...p,
        // --- ИЗМЕНЕНИЯ ЗДЕСЬ ---
        slug: (p.slug || p.seo?.name)
            ? `${p.slug || p.seo?.name}-${p.product_id}`
            : String(p.product_id)
      }));
    }
    return data;
  }
});

const products = computed(() => apiResponse.value?.list || []);
const totalFound = computed(() => apiResponse.value?.total || 0);
const lastPage = computed(() => apiResponse.value?.lastPage || 1);

const handlePageChange = (page: number) => {
  currentPage.value = page;
  router.push({ query: { ...route.query, page } });
  if (process.client) window.scrollTo({ top: 0, behavior: 'smooth' });
};

useSeoMeta({
  title: () => searchQuery.value ? `${t('common.search')}: ${searchQuery.value} | MYCOM` : `${t('common.search')} | MYCOM`
});
</script>