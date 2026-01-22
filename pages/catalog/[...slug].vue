<template>
  <div class="bg-white py-6 md:py-10">
    <div class="w-full px-4 sm:px-6 md:px-8">

      <!-- 1. Хлебные крошки -->
      <nav class="flex items-center gap-2 text-[10px] md:text-xs text-gray-400 mb-6 uppercase tracking-widest font-bold overflow-x-auto no-scrollbar whitespace-nowrap">
        <template v-for="(crumb, index) in breadcrumbs" :key="index">
          <NuxtLink
              v-if="index < breadcrumbs.length - 1"
              :to="localePath(crumb.path)"
              class="hover:text-brand-blue transition-colors shrink-0"
          >
            {{ crumb.name }}
          </NuxtLink>
          <span v-else class="text-brand-dark-blue shrink-0 max-w-[200px] truncate">
            {{ crumb.name }}
          </span>
          <Icon v-if="index < breadcrumbs.length - 1" name="ph:caret-right-bold" size="10" class="text-gray-300 shrink-0" />
        </template>
      </nav>

      <!-- 2. Заголовок категории -->
      <div class="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <!-- SEO: Используем H1 для названия категории -->
        <h1 class="text-3xl font-extrabold text-brand-dark-blue">
          {{ currentCategoryName }}
        </h1>
        <p v-if="!pending" class="text-sm font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-lg">
          {{ $t('common.found') }}: {{ apiResponse?.total || 0 }}
        </p>
      </div>

      <div class="flex flex-col lg:flex-row gap-8 items-start">


        <!-- 4. ОСНОВНОЙ КОНТЕНТ -->
        <div class="flex-1 w-full min-w-0">

          <!-- Сортировка -->
          <div class="mb-8">
            <CatalogSortBar
                v-model="currentSort"
                @toggle-filters="isFilterOpen = true"
            />
          </div>

          <!-- A. ЗАГРУЗКА -->
          <div v-if="pending" class="grid grid-cols gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5">
            <SkeletonProductCard v-for="n in 8" :key="n" />
          </div>

          <!-- B. ОШИБКА -->
          <div v-else-if="error && !isFatal404" class="py-20 text-center">
            <div class="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
              <Icon name="ph:warning-circle-bold" size="40" />
            </div>
            <p class="text-gray-500 font-bold">{{ $t('common.error_loading') }}</p>
            <button @click="refresh" class="mt-4 px-6 py-2 bg-brand-blue text-white rounded-xl font-bold shadow-lg shadow-brand-blue/20">
              {{ $t('common.retry') }}
            </button>
          </div>

          <!-- C. СПИСОК ТОВАРОВ -->
          <div v-else-if="products.length > 0">
            <div class="grid grid-cols-2 gap-4 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
              <div v-for="product in products" :key="product.id || product.product_id">
                <ProductCard :product="product" />
              </div>
            </div>

            <!-- Пагинация -->
            <div v-if="totalPages > 1" class="mt-16 flex justify-center items-center gap-2">
              <button
                  @click="handlePageChange(currentPage - 1)"
                  :disabled="currentPage === 1"
                  class="h-10 w-10 flex items-center justify-center rounded-xl border border-gray-200 disabled:opacity-30 transition-all hover:border-brand-blue"
              >
                <Icon name="ph:caret-left-bold" />
              </button>

              <button
                  v-for="page in totalPages"
                  :key="page"
                  @click="handlePageChange(page)"
                  class="h-10 w-10 rounded-xl border text-sm font-bold transition-all shadow-sm"
                  :class="currentPage === page
                   ? 'bg-brand-blue text-white border-brand-blue shadow-brand-blue/20'
                   : 'bg-white text-gray-500 border-gray-200 hover:border-brand-blue hover:text-brand-blue'"
              >
                {{ page }}
              </button>

              <button
                  @click="handlePageChange(currentPage + 1)"
                  :disabled="currentPage === totalPages"
                  class="h-10 w-10 flex items-center justify-center rounded-xl border border-gray-200 disabled:opacity-30 transition-all hover:border-brand-blue"
              >
                <Icon name="ph:caret-right-bold" />
              </button>
            </div>
          </div>

          <!-- D. ПУСТОЙ РЕЗУЛЬТАТ -->
          <div v-else class="text-center py-24 bg-gray-50 rounded-[40px] border border-dashed border-gray-200">
            <Icon name="ph:magnifying-glass-x" size="64" class="text-gray-300 mx-auto mb-4" />
            <h2 class="text-2xl font-bold text-brand-dark-blue">{{ $t('common.nothing_found') }}</h2>
            <NuxtLink :to="localePath('/')" class="mt-8 inline-block px-8 py-3 bg-brand-blue text-white font-bold rounded-2xl">{{ $t('common.home') }}</NuxtLink>
          </div>
        </div>
      </div>

      <!-- 5. МОБИЛЬНЫЕ ФИЛЬТРЫ -->
      <teleport to="body">
        <transition enter-active-class="transition-opacity duration-300" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition-opacity duration-300" leave-from-class="opacity-100" leave-to-class="opacity-0">
          <div v-if="isFilterOpen" class="fixed inset-0 z-[100] flex">
            <div @click="isFilterOpen = false" class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
            <transition enter-active-class="transition-transform duration-300 ease-out" enter-from-class="-translate-x-full" enter-to-class="translate-x-0" leave-active-class="transition-transform duration-300 ease-in" leave-from-class="translate-x-0" leave-to-class="-translate-x-full">
              <div v-if="isFilterOpen" class="relative w-full max-w-xs bg-white h-full shadow-2xl overflow-y-auto p-5">
                <div class="flex justify-between items-center mb-6">
                  <h2 class="text-xl font-black text-brand-dark-blue">{{ $t('catalog.filters') }}</h2>
                  <button @click="isFilterOpen = false" class="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
                    <Icon name="ph:x-bold" size="20"/>
                  </button>
                </div>
                <CatalogFilterSidebar :filters-data="apiResponse?.filters || []" :pending="pending" />
                <div class="sticky bottom-0 pt-4 mt-4 bg-white border-t border-gray-100">
                  <button @click="isFilterOpen = false" class="w-full py-3 bg-brand-blue text-white font-bold rounded-xl shadow-lg shadow-brand-blue/20">
                    {{ $t('common.save') }}
                  </button>
                </div>
              </div>
            </transition>
          </div>
        </transition>
      </teleport>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

const route = useRoute();
const config = useRuntimeConfig();
const { t, locale } = useI18n();
const localePath = useLocalePath();
const catalogStore = useCatalogStore();

const isFilterOpen = ref(false);
const currentPage = ref(Number(route.query.page) || 1);
const currentSort = ref(route.query.sort?.toString() || 'popularity');

const extractId = (slugStr: string | undefined) => {
  if (!slugStr) return null;
  const parts = slugStr.split('_');
  const id = parts.length > 1 ? parts.pop() : slugStr;
  return id && !isNaN(Number(id)) ? Number(id) : null;
};

const urlSlugs = (route.params.slug as string[]) || [];
const targetCategoryId = computed(() => {
  if (!urlSlugs.length) return null;
  return extractId(urlSlugs[urlSlugs.length - 1]);
});

const categoryInfo = computed(() => {
  if (!catalogStore.tree.length || !targetCategoryId.value) return { name: t('common.catalog'), crumbs: [] };

  const targetId = targetCategoryId.value;
  let foundCategory: any = null;
  let parentCategory: any = null;

  for (const parent of catalogStore.tree) {
    if (Number(parent.category_id) === Number(targetId)) {
      foundCategory = parent;
      break;
    }
    if (parent.child_categories) {
      const child = parent.child_categories.find((c: any) => Number(c.category_id) === Number(targetId));
      if (child) {
        foundCategory = child;
        parentCategory = parent;
        break;
      }
    }
  }

  const crumbs = [{ name: t('common.home'), path: '/' }, { name: t('common.catalog'), path: '/catalog' }];

  if (parentCategory) {
    crumbs.push({
      name: parentCategory.name,
      path: `/catalog/${parentCategory.slug || 'cat'}_${parentCategory.category_id}`
    });
  }

  if (foundCategory) {
    crumbs.push({
      name: foundCategory.name,
      path: ''
    });
  }

  return {
    name: foundCategory ? foundCategory.name : t('common.catalog'),
    crumbs: crumbs
  };
});

const breadcrumbs = computed(() => categoryInfo.value.crumbs);
const currentCategoryName = computed(() => categoryInfo.value.name);

const queryParams = computed(() => {
  const params: any = {
    lang: locale.value,
    page: currentPage.value,
    ...route.query
  };

  if (targetCategoryId.value) {
    if (urlSlugs.length >= 2) {
      params.subcategory_id = targetCategoryId.value;
      const parentId = extractId(urlSlugs[0]);
      if(parentId) params.category_id = parentId;
    } else {
      params.category_id = targetCategoryId.value;
    }
  }

  if (currentSort.value === 'price_asc') params.orderByPrice = 'low';
  if (currentSort.value === 'price_desc') params.orderByPrice = 'high';
  if (currentSort.value === 'newest') params.sort = 'new';
  if (currentSort.value === 'popularity') params.sort = 'popular';

  return params;
});

const { data: apiResponse, pending, error, refresh } = await useFetch<any>(`${config.public.apiBase}/api/v1/site/catalog/detail`, {
  key: `catalog-detail-${route.fullPath}-${locale.value}`,
  query: queryParams,
  watch: [locale, route, queryParams],
  transform: (res: any) => {
    const data = res.data || {};
    if (data.list) {
      data.list = data.list.map((p: any) => {
        const rawSlug = p.slug || p.seo?.name;
        const hybridSlug = rawSlug ? `${rawSlug}_${p.product_id}` : p.product_id;
        return {
          ...p,
          slug: hybridSlug
        };
      });
    }
    return data;
  }
});

const isFatal404 = computed(() => error.value && error.value.statusCode === 404);

if (isFatal404.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Category Not Found',
    fatal: true
  });
}

const products = computed(() => apiResponse.value?.list || []);
const totalPages = computed(() => apiResponse.value?.lastPage || 1);

const handlePageChange = (page: number) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
  if (process.client) window.scrollTo({ top: 0, behavior: 'smooth' });
};

watch(() => route.params.slug, () => { currentPage.value = 1; });
watch(currentSort, () => { currentPage.value = 1; });

// --- SEO FIX: Правильный Canonical и описание ---
const baseUrl = 'https://mycom.uz';
const canonicalUrl = computed(() => {
  const url = `${baseUrl}${route.path}`;
  // Если страница > 1, добавляем параметр, чтобы Google различал страницы
  return currentPage.value > 1 ? `${url}?page=${currentPage.value}` : url;
});

useHead({
  link: [
    { rel: 'canonical', href: canonicalUrl }
  ]
});

useSeoMeta({
  title: () => `${currentCategoryName.value} | MYCOM`,
  // Более привлекательное описание для выдачи
  description: () => `${t('common.buy')} ${currentCategoryName.value} ${t('common.in_tashkent')}. ${t('seo.index_description')}`
});
</script>