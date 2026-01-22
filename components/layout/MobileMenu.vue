<template>
  <ClientOnly>
    <teleport to="body">
      <transition
          enter-active-class="transition-opacity duration-300"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100"
          leave-active-class="transition-opacity duration-300"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
      >
        <div v-if="uiStore.isMobileMenuOpen" @click="uiStore.isMobileMenuOpen = false" class="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"></div>
      </transition>

      <transition
          enter-active-class="transition-transform duration-300 ease-out"
          enter-from-class="-translate-x-full"
          enter-to-class="translate-x-0"
          leave-active-class="transition-transform duration-300 ease-in"
          leave-from-class="translate-x-0"
          leave-to-class="-translate-x-full"
      >
        <div v-if="uiStore.isMobileMenuOpen" class="fixed inset-y-0 left-0 z-[70] flex w-full max-w-[320px] flex-col bg-white shadow-xl">
          <div class="flex items-center justify-between border-b px-5 py-4">
            <NuxtLink :to="localePath('/')" @click="uiStore.isMobileMenuOpen = false">
              <img src="/logo.png" alt="Logo" class="h-8 w-auto">
            </NuxtLink>
            <button @click="uiStore.isMobileMenuOpen = false" class="rounded-xl p-2 text-gray-400 hover:bg-gray-100 active:scale-90 transition-all">
              <Icon name="ph:x-bold" size="24" />
            </button>
          </div>

          <div class="flex-1 overflow-y-auto overflow-x-hidden relative bg-white pb-10">
            <transition name="slide-left">
              <div v-if="!activeCategory" class="absolute inset-0 w-full p-5">
                <h3 class="mb-4 text-[11px] font-black uppercase tracking-widest text-gray-400">{{ $t('common.catalog') }}</h3>

                <div v-if="catalogStore.isLoading" class="space-y-3">
                  <div v-for="n in 8" :key="n" class="flex items-center gap-3 p-2">
                    <div class="h-10 w-10 shrink-0 rounded-xl bg-gray-100 animate-pulse"></div>
                    <div class="h-4 w-full rounded bg-gray-100 animate-pulse"></div>
                  </div>
                </div>

                <ul v-else class="space-y-1">
                  <li v-for="category in categories" :key="category.category_id">
                    <button @click="openCategory(category)" class="flex w-full items-center justify-between rounded-xl p-3 text-left transition-colors active:bg-gray-100">
                      <div class="flex items-center gap-4">
                        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 group-active:bg-white transition-colors">
                          <img v-if="category.icon" :src="category.icon" class="h-6 w-6 object-contain" @error="onImageError">
                          <Icon v-else name="ph:squares-four" size="20" class="text-gray-400"/>
                        </div>
                        <span class="font-bold text-brand-dark-blue">{{ category.name }}</span>
                      </div>
                      <Icon name="ph:caret-right-bold" size="16" class="text-gray-300" />
                    </button>
                  </li>
                </ul>

                <div class="mt-8 space-y-2 border-t pt-6">
                  <NuxtLink :to="localePath('/profile')" @click="uiStore.isMobileMenuOpen = false" class="flex items-center gap-4 p-3 font-bold text-gray-600 active:bg-gray-50 rounded-xl transition-colors">
                    <Icon name="ph:user-bold" size="22" class="text-gray-400" /> {{ $t('profile.title') }}
                  </NuxtLink>
                  <NuxtLink :to="localePath('/contacts')" @click="uiStore.isMobileMenuOpen = false" class="flex items-center gap-4 p-3 font-bold text-gray-600 active:bg-gray-50 rounded-xl transition-colors">
                    <Icon name="ph:phone-bold" size="22" class="text-gray-400" /> {{ $t('common.contacts') }}
                  </NuxtLink>
                </div>

                <div v-if="siteStore.languages?.length" class="mt-8 border-t pt-6">
                  <span class="text-[11px] font-black uppercase tracking-widest text-gray-400 block mb-4">{{ $t('common.select_language') }}</span>
                  <div class="grid grid-cols-2 gap-2">
                    <button
                        v-for="lang in siteStore.languages"
                        :key="lang.value"
                        @click="setLocale(lang.value)"
                        class="py-3 px-4 rounded-xl text-xs font-black uppercase border transition-all active:scale-95"
                        :class="locale === lang.value ? 'border-brand-blue bg-blue-50 text-brand-blue' : 'border-gray-100 text-gray-500'"
                    >
                      {{ lang.name }}
                    </button>
                  </div>
                </div>

                <div class="mt-10 p-4 rounded-2xl bg-gray-50">
                  <a v-if="siteStore.settings?.phone" :href="`tel:${siteStore.settings.phone.replace(/\s/g, '')}`" class="flex items-center gap-3 font-black text-brand-dark-blue active:opacity-70 transition-opacity">
                    <div class="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                      <Icon name="ph:phone-fill" size="14" class="text-green-500" />
                    </div>
                    {{ siteStore.settings.phone }}
                  </a>
                </div>
              </div>
            </transition>

            <transition name="slide-right">
              <div v-if="activeCategory" class="absolute inset-0 w-full bg-white p-5">
                <button @click="activeCategory = null" class="mb-6 flex items-center gap-2 text-sm font-bold text-brand-blue active:translate-x-[-4px] transition-transform">
                  <Icon name="ph:arrow-left-bold" size="18" /> {{ $t('common.back') }}
                </button>
                <h3 class="mb-6 text-2xl font-black text-brand-dark-blue">{{ activeCategory.name }}</h3>

                <NuxtLink :to="localePath(`/catalog/${activeCategory.slug || 'cat'}_${activeCategory.category_id}`)" @click="uiStore.isMobileMenuOpen = false" class="mb-6 flex items-center justify-between rounded-xl bg-brand-blue p-4 font-bold text-white shadow-lg shadow-brand-blue/20 active:scale-[0.98] transition-all">
                  <span>{{ $t('common.view_all') }}</span>
                  <Icon name="ph:arrow-right-bold" />
                </NuxtLink>

                <ul v-if="activeCategory.child_categories?.length" class="space-y-1">
                  <li v-for="child in activeCategory.child_categories" :key="child.category_id">
                    <NuxtLink
                        :to="localePath(`/catalog/${activeCategory.slug || 'cat'}_${activeCategory.category_id}/${child.slug || 'sub'}_${child.category_id}`)"
                        @click="uiStore.isMobileMenuOpen = false"
                        class="block rounded-xl p-4 text-gray-700 font-bold active:bg-gray-50 border-b border-gray-50 transition-colors"
                    >
                      {{ child.name }}
                    </NuxtLink>
                  </li>
                </ul>
              </div>
            </transition>
          </div>
        </div>
      </transition>
    </teleport>
  </ClientOnly>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const uiStore = useUIStore();
const siteStore = useSiteStore();
const catalogStore = useCatalogStore(); // <-- Подключаем стор
const { locale, setLocale } = useI18n();
const localePath = useLocalePath();

// УБРАЛИ ЛОКАЛЬНЫЙ useFetch
// const { data: apiResponse... } = useFetch(...)

const categories = computed(() => catalogStore.tree); // Берем из стора
const activeCategory = ref(null);
const openCategory = (cat) => { activeCategory.value = cat; };

watch(() => uiStore.isMobileMenuOpen, (val) => {
  if (process.client) {
    document.body.style.overflow = val ? 'hidden' : '';
    if (!val) setTimeout(() => { activeCategory.value = null; }, 300);
  }
}, { immediate: true });

const onImageError = (e) => { e.target.style.opacity = 0.3; }
</script>