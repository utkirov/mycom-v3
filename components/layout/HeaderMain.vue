<template>
  <div class="bg-white/80 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-40">
    <div class="relative w-full flex h-16 md:h-20 items-center justify-between gap-x-4 px-4 sm:px-6 lg:px-8">

      <!-- Лого и Каталог -->
      <div class="flex shrink-0 items-center gap-x-4">
        <!-- Mobile Menu Toggle -->
        <button @click="uiStore.toggleMobileMenu(true)" class="md:hidden p-1 -ml-2 text-brand-dark-blue transition-transform active:scale-90">
          <Icon name="ph:list-bold" size="28"/>
        </button>

        <!-- Logo -->
        <NuxtLink :to="localePath('/')" class="shrink-0 transition-opacity hover:opacity-80">
          <img src="/logo.png" alt="MYCOM Logo" class="h-8 w-auto md:h-10">
        </NuxtLink>

        <!-- Catalog Button (Desktop) -->
        <button
            @click="uiStore.toggleMegaMenu()"
            class="hidden md:flex h-12 w-40 items-center justify-center gap-x-3 rounded-xl text-white transition-all duration-300 shadow-lg"
            :class="uiStore.isMegaMenuOpen ? 'bg-brand-gray shadow-none' : 'bg-brand-blue hover:bg-brand-dark-blue shadow-brand-blue/20'"
        >
          <Icon :name="uiStore.isMegaMenuOpen ? 'ph:x-bold' : 'ph:grid-four-fill'" size="22" />
          <span class="font-bold">{{ t('common.catalog') }}</span>
        </button>
      </div>

      <!-- ПОИСК (DESKTOP) -->
      <div class="relative flex-grow px-4 lg:px-10 hidden md:block z-50">
        <div class="relative group">
          <form @submit.prevent="handleSearchSubmit">
            <input
                v-model="searchQuery"
                @focus="isDesktopSearchFocused = true"
                @blur="handleDesktopBlur"
                type="text"
                :placeholder="t('common.search')"
                class="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 pl-12 pr-4 text-sm outline-none transition-all focus:border-brand-blue focus:bg-white focus:ring-4 focus:ring-brand-blue/10"
            >
            <Icon name="ph:magnifying-glass" size="20" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-blue transition-colors" />
            <div v-if="isSearchLoading" class="absolute right-4 top-1/2 -translate-y-1/2">
              <Icon name="svg-spinners:ring-resize" class="text-brand-blue" />
            </div>
          </form>

          <!-- Dropdown Results (Desktop) -->
          <transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 translate-y-2" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 translate-y-2">
            <div v-if="showDesktopResults" class="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div v-if="searchResults.length > 0" class="max-h-[400px] overflow-y-auto custom-scrollbar">
                <NuxtLink
                    v-for="product in searchResults"
                    :key="product.id"
                    :to="localePath(`/product/${product.slug}`)"
                    class="flex items-center gap-4 p-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors"
                    @click="closeSearch"
                >
                  <div class="h-12 w-12 shrink-0 rounded-lg bg-gray-50 border border-gray-100 p-1">
                    <img :src="product.image || '/images/pc-placeholder.png'" class="h-full w-full object-contain mix-blend-multiply">
                  </div>
                  <div class="flex-grow min-w-0">
                    <p class="text-sm font-bold text-brand-dark-blue line-clamp-1">{{ product.name }}</p>
                    <p class="text-xs font-bold text-brand-blue">{{ format(product.price) }} сум</p>
                  </div>
                </NuxtLink>
                <button @click="handleSearchSubmit" class="w-full p-3 text-center text-xs font-bold text-gray-500 hover:text-brand-blue hover:bg-gray-50 transition-colors uppercase tracking-widest">
                  {{ t('common.view_all_section') }} ({{ totalResults }})
                </button>
              </div>
              <div v-else class="p-6 text-center text-gray-400">
                <p class="text-sm font-medium">{{ t('common.nothing_found') }}</p>
              </div>
            </div>
          </transition>
        </div>
        <div v-if="showDesktopResults" @click="isDesktopSearchFocused = false" class="fixed inset-0 -z-10"></div>
      </div>

      <!-- Иконки справа -->
      <div class="flex shrink-0 items-center gap-x-2 sm:gap-x-4">
        <!-- Mobile Search Trigger -->
        <button @click="openMobileSearch" class="flex h-10 w-10 items-center justify-center rounded-xl text-gray-600 hover:bg-gray-100 md:hidden transition-colors">
          <Icon name="ph:magnifying-glass" size="24" />
        </button>

        <button @click="handleProfileClick" class="flex h-10 w-10 items-center justify-center rounded-xl text-gray-600 hover:bg-gray-100 hover:text-brand-blue transition-all">
          <Icon :name="authStore?.isLoggedIn ? 'ph:user-circle-fill' : 'ph:user'" size="26" :class="{'text-brand-blue': authStore?.isLoggedIn}" />
        </button>

        <NuxtLink :to="localePath('/wishlist')" class="relative flex h-10 w-10 items-center justify-center rounded-xl text-gray-600 hover:bg-gray-100 hover:text-brand-red transition-all">
          <Icon name="ph:heart" size="26" />
          <span v-if="wishlistStore?.wishlistCount > 0" class="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-red text-[10px] font-bold text-white ring-2 ring-white">
            {{ wishlistStore.wishlistCount }}
          </span>
        </NuxtLink>

        <NuxtLink id="cart-target-desktop" :to="localePath('/cart')" class="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gray-50 text-brand-dark-blue hover:bg-brand-blue hover:text-white transition-all duration-300 group">
          <Icon name="ph:shopping-cart-simple" size="26" />
          <span v-if="cartStore?.cartCount > 0" class="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-blue text-[10px] font-bold text-white ring-2 ring-white group-hover:bg-brand-dark-blue">
            {{ cartStore.cartCount }}
          </span>
        </NuxtLink>
      </div>
    </div>

    <!-- ПОЛНОЭКРАННЫЙ МОБИЛЬНЫЙ ПОИСК -->
    <teleport to="body">
      <transition enter-active-class="transition duration-300 ease-out" enter-from-class="translate-y-full opacity-0" enter-to-class="translate-y-0 opacity-100" leave-active-class="transition duration-200 ease-in" leave-from-class="translate-y-0 opacity-100" leave-to-class="translate-y-full opacity-0">
        <div v-if="uiStore.isMobileSearchOpen" class="fixed inset-0 z-[100] bg-white flex flex-col md:hidden">

          <!-- Header -->
          <div class="flex items-center gap-3 p-4 border-b border-gray-100 bg-white sticky top-0 z-10">
            <div class="relative flex-1">
              <Icon name="ph:magnifying-glass" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size="20" />
              <form @submit.prevent="handleSearchSubmit">
                <input
                    ref="mobileInputRef"
                    v-model="searchQuery"
                    type="text"
                    :placeholder="t('common.search')"
                    class="w-full h-12 bg-gray-100 rounded-xl pl-10 pr-10 text-base font-medium focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all placeholder:text-gray-400"
                >
              </form>
              <button v-if="searchQuery" @click="searchQuery = ''" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 p-1">
                <Icon name="ph:x-circle-fill" size="16" />
              </button>
            </div>
            <button @click="closeSearch" class="text-sm font-bold text-brand-blue px-2">
              {{ $t('common.back') }}
            </button>
          </div>

          <!-- Results -->
          <div class="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <div v-if="isSearchLoading" class="flex flex-col gap-4 mt-2">
              <div v-for="n in 6" :key="n" class="flex gap-4 animate-pulse">
                <div class="h-16 w-16 bg-gray-100 rounded-xl"></div>
                <div class="flex-1 space-y-2 py-2">
                  <div class="h-4 w-3/4 bg-gray-100 rounded"></div>
                  <div class="h-4 w-1/3 bg-gray-100 rounded"></div>
                </div>
              </div>
            </div>

            <div v-else-if="searchResults.length > 0" class="space-y-4">
              <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{{ $t('common.search_results') }}</p>
              <NuxtLink
                  v-for="product in searchResults"
                  :key="product.id"
                  :to="localePath(`/product/${product.slug}`)"
                  class="flex gap-4 items-center bg-white active:bg-gray-50 transition-colors"
                  @click="closeSearch"
              >
                <div class="h-16 w-16 shrink-0 rounded-xl bg-gray-50 border border-gray-100 p-2">
                  <img :src="product.image || '/images/pc-placeholder.png'" class="h-full w-full object-contain mix-blend-multiply">
                </div>
                <div class="flex-grow min-w-0">
                  <p class="text-sm font-bold text-brand-dark-blue line-clamp-2 leading-tight">{{ product.name }}</p>
                  <p class="text-brand-blue font-black mt-1">{{ format(product.price) }} сум</p>
                </div>
                <Icon name="ph:caret-right" class="text-gray-300" size="16" />
              </NuxtLink>

              <button @click="handleSearchSubmit" class="w-full mt-4 py-3 bg-brand-blue/5 text-brand-blue font-bold rounded-xl active:scale-95 transition-all">
                {{ $t('common.view_all_section') }} ({{ totalResults }})
              </button>
            </div>

            <div v-else-if="searchQuery.length >= 2" class="text-center py-20">
              <Icon name="ph:magnifying-glass-x" size="48" class="text-gray-300 mx-auto mb-4" />
              <p class="text-gray-500 font-medium">{{ $t('common.nothing_found') }}</p>
            </div>

            <div v-else class="text-center py-20 opacity-50">
              <Icon name="ph:keyboard" size="48" class="text-gray-300 mx-auto mb-4" />
              <p class="text-gray-400 text-sm">{{ $t('common.search') }}...</p>
            </div>
          </div>
        </div>
      </transition>
    </teleport>

    <!-- Mega Menu & Mobile Menu logic remains -->
    <transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0 translate-y-2" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 translate-y-2">
      <LayoutMegaMenu v-if="uiStore.isMegaMenuOpen" @close="uiStore.isMegaMenuOpen = false" />
    </transition>
    <LayoutMobileMenu :is-open="uiStore.isMobileMenuOpen" @close="uiStore.isMobileMenuOpen = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, nextTick } from 'vue';

const uiStore = useUIStore();
const cartStore = useCartStore();
const authStore = useAuthStore();
const wishlistStore = useWishlistStore();
const { t, locale } = useI18n();
const localePath = useLocalePath();
const config = useRuntimeConfig();
const { format } = useCurrency();
const router = useRouter();
const route = useRoute();

const searchQuery = ref('');
const searchResults = ref<any[]>([]);
const isSearchLoading = ref(false);
const isDesktopSearchFocused = ref(false);
const totalResults = ref(0);
const mobileInputRef = ref<HTMLInputElement | null>(null);
let searchDebounceTimer: any = null;

// Только для десктопа
const showDesktopResults = computed(() => {
  return isDesktopSearchFocused.value && searchQuery.value.length >= 2 && !isSearchLoading.value && (searchResults.value.length > 0 || totalResults.value === 0);
});

// Открытие мобильного поиска
const openMobileSearch = async () => {
  uiStore.isMobileSearchOpen = true;
  await nextTick();
  setTimeout(() => mobileInputRef.value?.focus(), 100);
};

const closeSearch = () => {
  isDesktopSearchFocused.value = false;
  uiStore.isMobileSearchOpen = false;
};

// Живой поиск
watch(searchQuery, (newVal) => {
  if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
  if (newVal.length < 2) {
    searchResults.value = [];
    return;
  }

  isSearchLoading.value = true;
  searchDebounceTimer = setTimeout(async () => {
    try {
      const data: any = await $fetch(`${config.public.apiBase}/api/v1/site/search`, {
        query: { search: newVal, lang: locale.value, per_page: 6 }
      });

      if (data?.data?.list) {
        searchResults.value = data.data.list.map((p: any) => ({
          id: p.product_id,
          name: p.name,
          price: p.discount_price || p.price,
          image: p.image,
          // --- ИЗМЕНЕНИЯ ЗДЕСЬ ---
          // Используем p.slug (если API поиска его возвращает) или p.seo.name
          slug: (p.slug || p.seo?.name)
              ? `${p.slug || p.seo?.name}-${p.product_id}`
              : String(p.product_id)
        }));
        totalResults.value = data.data.total || 0;
      } else {
        searchResults.value = [];
        totalResults.value = 0;
      }
    } catch (e) {
      console.error('Search error', e);
      searchResults.value = [];
    } finally {
      isSearchLoading.value = false;
    }
  }, 500);
});

const handleSearchSubmit = () => {
  if (searchQuery.value.trim()) {
    router.push(localePath({ path: '/search', query: { q: searchQuery.value } }));
    closeSearch();
  }
};

const handleDesktopBlur = () => {
  setTimeout(() => { isDesktopSearchFocused.value = false; }, 200);
};

// Скролл лок для мобилки
watch(() => uiStore.isMobileSearchOpen, (val) => {
  if (process.client) document.body.style.overflow = val ? 'hidden' : '';
});

const handleProfileClick = () => {
  if (authStore?.isLoggedIn) router.push(localePath('/profile'));
  else uiStore.openAuthModal();
};

// Закрываем поиск при переходе
watch(() => route.fullPath, closeSearch);
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
</style>