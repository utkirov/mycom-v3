<template>
  <div class="bg-white py-6 md:py-10">
    <div class="w-full px-4 sm:px-6 md:px-8">

      <div class="mb-8">
        <h1 class="text-3xl font-bold text-brand-dark-blue">
          {{ $t('profile.wishlist') }}
          <span v-if="wishlistStore.wishlistCount > 0" class="text-brand-blue ml-2">({{ wishlistStore.wishlistCount }})</span>
        </h1>
      </div>

      <div v-if="wishlistStore.isLoading" class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        <ProductCardSkeleton v-for="n in 5" :key="n" />
      </div>

      <div v-else-if="authStore.isLoggedIn">
        <div v-if="wishlistStore.wishlistItems.length > 0">
          <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            <div v-for="product in wishlistStore.wishlistItems" :key="product.product_id">
              <ProductCard
                  :product="{
                  id: product.product_id,
                  name: product.name,
                  image: product.image || '/images/pc-placeholder.png',
                  price: product.discount_price || product.price,
                  oldPrice: product.discount_price ? product.price : null,
                  stock: 10
                }"
              />
            </div>
          </div>

          <div v-if="wishlistStore.lastPage > 1" class="mt-12 flex justify-center gap-2">
            <button
                v-for="page in wishlistStore.lastPage"
                :key="page"
                @click="handlePageChange(page)"
                class="h-10 w-10 rounded-lg border text-sm font-bold transition-all"
                :class="currentPage === page ? 'bg-brand-blue text-white shadow-lg' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-blue'"
            >
              {{ page }}
            </button>
          </div>
        </div>

        <div v-else class="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
          <Icon name="ph:heart-break" size="64" class="text-gray-300 mx-auto mb-4" />
          <h2 class="text-xl font-bold text-brand-dark-blue">{{ $t('cart.empty_title') }}</h2>
          <p class="text-gray-500 mt-2">{{ $t('cart.empty_text') }}</p>
          <NuxtLink :to="localePath('/')" class="mt-6 inline-block px-8 py-3 bg-brand-blue text-white font-bold rounded-xl">{{ $t('cart.go_to_catalog') }}</NuxtLink>
        </div>
      </div>

      <div v-else class="text-center py-20 bg-blue-50/50 rounded-3xl border border-blue-100">
        <Icon name="ph:lock-key" size="64" class="text-brand-blue/30 mx-auto mb-4" />
        <h2 class="text-xl font-bold text-brand-dark-blue">{{ $t('auth.login_title') }}</h2>
        <p class="text-gray-500 mt-2 max-w-sm mx-auto">
          {{ $t('auth.wishlist_login_hint') || 'Авторизуйтесь, чтобы синхронизировать избранное.' }}
        </p>
        <button @click="uiStore.openAuthModal()" class="mt-6 px-8 py-3 bg-brand-blue text-white font-bold rounded-xl hover:bg-brand-dark-blue transition-colors">
          {{ $t('auth.verify') }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
const wishlistStore = useWishlistStore();
const authStore = useAuthStore();
const uiStore = useUIStore();
const { t } = useI18n(); //
const localePath = useLocalePath(); //

const currentPage = ref(1);

const handlePageChange = (page) => {
  currentPage.value = page;
  wishlistStore.fetchWishlist(page);
  if (process.client) window.scrollTo({ top: 0, behavior: 'smooth' });
};

onMounted(() => {
  if (authStore.isLoggedIn) {
    wishlistStore.fetchWishlist();
  }
});

useSeoMeta({
  title: () => `${t('profile.wishlist')} | MYCOM`,
  robots: 'noindex, nofollow'
});
</script>