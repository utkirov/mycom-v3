<template>
  <div class="bg-white/80 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-40">
    <div class="relative w-full flex h-16 md:h-20 items-center justify-between gap-x-4 px-4 sm:px-6 lg:px-8">

      <!-- Лого и Каталог -->
      <div class="flex shrink-0 items-center gap-x-4">
        <button @click="uiStore.isMobileMenuOpen = true" class="md:hidden p-1 -ml-2 text-brand-dark-blue transition-transform active:scale-90">
          <Icon name="ph:list-bold" size="28"/>
        </button>

        <NuxtLink :to="localePath('/')" class="shrink-0 transition-opacity hover:opacity-80">
          <img src="/logo.png" alt="MYCOM Logo" class="h-8 w-auto md:h-10">
        </NuxtLink>

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
          <form @submit.prevent="handleSearch">
            <input
                v-model="searchQuery"
                @focus="isSearchFocused = true"
                @blur="handleBlur"
                type="text"
                :placeholder="t('common.search')"
                class="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 pl-12 pr-4 text-sm outline-none transition-all focus:border-brand-blue focus:bg-white focus:ring-4 focus:ring-brand-blue/10"
            >
            <Icon name="ph:magnifying-glass" size="20" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-blue transition-colors" />

            <!-- Лоадер внутри инпута -->
            <div v-if="isSearchLoading" class="absolute right-4 top-1/2 -translate-y-1/2">
              <Icon name="svg-spinners:ring-resize" class="text-brand-blue" />
            </div>
          </form>

          <!-- DROPDOWN С РЕЗУЛЬТАТАМИ -->
          <transition
              enter-active-class="transition duration-200 ease-out"
              enter-from-class="opacity-0 translate-y-2"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition duration-150 ease-in"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 translate-y-2"
          >
            <div v-if="shouldShowResults" class="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
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

                <button
                    @click="handleSearch"
                    class="w-full p-3 text-center text-xs font-bold text-gray-500 hover:text-brand-blue hover:bg-gray-50 transition-colors uppercase tracking-widest"
                >
                  {{ t('common.view_all_section') }} ({{ totalResults }})
                </button>
              </div>

              <div v-else class="p-6 text-center text-gray-400">
                <p class="text-sm font-medium">{{ t('common.nothing_found') }}</p>
              </div>
            </div>
          </transition>
        </div>

        <!-- Бэкдроп для закрытия при клике вне -->
        <div v-if="shouldShowResults" @click="isSearchFocused = false" class="fixed inset-0 -z-10"></div>
      </div>

      <!-- Иконки справа -->
      <div class="flex shrink-0 items-center gap-x-2 sm:gap-x-4">
        <button @click="uiStore.isMobileSearchOpen = !uiStore.isMobileSearchOpen" class="flex h-10 w-10 items-center justify-center rounded-xl text-gray-600 hover:bg-gray-100 md:hidden">
          <Icon :name="uiStore.isMobileSearchOpen ? 'ph:x' : 'ph:magnifying-glass'" size="24" />
        </button>

        <button @click="handleProfileClick" class="flex h-10 w-10 items-center justify-center rounded-xl text-gray-600 hover:bg-gray-100 hover:text-brand-blue transition-all">
          <Icon
              :name="authStore?.isLoggedIn ? 'ph:user-circle-fill' : 'ph:user'"
              size="26"
              :class="{'text-brand-blue': authStore?.isLoggedIn}"
          />
        </button>

        <NuxtLink :to="localePath('/wishlist')" class="relative flex h-10 w-10 items-center justify-center rounded-xl text-gray-600 hover:bg-gray-100 hover:text-brand-red transition-all">
          <Icon name="ph:heart" size="26" />
          <span v-if="wishlistStore?.wishlistCount > 0" class="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-red text-[10px] font-bold text-white ring-2 ring-white">
            {{ wishlistStore.wishlistCount }}
          </span>
        </NuxtLink>

        <NuxtLink id="cart-target-desktop"  :to="localePath('/cart')" class="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gray-50 text-brand-dark-blue hover:bg-brand-blue hover:text-white transition-all duration-300 group">
          <Icon name="ph:shopping-cart-simple" size="26" />
          <span v-if="cartStore?.cartCount > 0" class="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-blue text-[10px] font-bold text-white ring-2 ring-white group-hover:bg-brand-dark-blue">
            {{ cartStore.cartCount }}
          </span>
        </NuxtLink>
      </div>
    </div>

    <!-- Мобильный поиск -->
    <transition enter-active-class="transition duration-200" enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-150" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-2">
      <div v-if="uiStore.isMobileSearchOpen" class="px-4 pb-4 md:hidden border-b border-gray-100">
        <form @submit.prevent="handleSearch" class="relative">
          <input
              v-model="searchQuery"
              type="text"
              :placeholder="t('common.search')"
              class="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/10 outline-none"
          >
          <Icon name="ph:magnifying-glass" size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </form>
      </div>
    </transition>

    <transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-2"
    >
      <LayoutMegaMenu v-if="uiStore.isMegaMenuOpen" @close="uiStore.isMegaMenuOpen = false" />
    </transition>

    <LayoutMobileMenu :is-open="uiStore.isMobileMenuOpen" @close="uiStore.isMobileMenuOpen = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';

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
const isSearchFocused = ref(false);
const totalResults = ref(0);
let searchDebounceTimer: any = null;

// Показывать результаты только если есть текст, фокус и не идет загрузка
const shouldShowResults = computed(() => {
  return isSearchFocused.value && searchQuery.value.length >= 2 && !isSearchLoading.value && (searchResults.value.length > 0 || totalResults.value === 0);
});

// Живой поиск с Debounce
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
        query: {
          search: newVal,
          lang: locale.value,
          per_page: 5 // Ограничиваем кол-во для выпадающего списка
        }
      });

      if (data?.data?.list) {
        searchResults.value = data.data.list.map((p: any) => ({
          id: p.product_id,
          name: p.name,
          price: p.discount_price || p.price,
          image: p.image,
          // Формируем гибридный SLUG_ID для корректной ссылки
          slug: (p.seo?.name || p.slug) ? `${p.seo?.name || p.slug}_${p.product_id}` : p.product_id
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
  }, 500); // 500ms задержка
});

watch(() => route.fullPath, () => {
  uiStore.isMegaMenuOpen = false;
  uiStore.isMobileMenuOpen = false;
  uiStore.isMobileSearchOpen = false;
  closeSearch(); // Закрываем поиск при переходе
});

const handleProfileClick = () => {
  if (authStore?.isLoggedIn) {
    router.push(localePath('/profile'));
  } else {
    uiStore.openAuthModal();
  }
};

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push(localePath({ path: '/search', query: { q: searchQuery.value } }));
    closeSearch();
  }
};

const closeSearch = () => {
  isSearchFocused.value = false;
  // Не очищаем searchQuery, чтобы пользователь видел, что искал
};

const handleBlur = () => {
  // Задержка, чтобы успел сработать клик по ссылке в dropdown
  setTimeout(() => {
    isSearchFocused.value = false;
  }, 200);
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
</style>