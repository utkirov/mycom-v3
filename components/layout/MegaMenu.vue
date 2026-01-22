<template>
  <div class="absolute left-0 top-full w-full bg-white shadow-2xl border-t border-gray-50 z-50 overflow-hidden">
    <div @click="uiStore.isMegaMenuOpen = false" class="fixed inset-0 -z-10 bg-brand-dark-blue/10 backdrop-blur-sm transition-opacity"></div>

    <div class="container mx-auto flex min-h-[500px] max-h-[80vh]">
      <!-- Используем isLoading из стора -->
      <div v-if="catalogStore.isLoading" class="w-full flex items-center justify-center py-20">
        <Icon name="svg-spinners:ring-resize" size="48" class="text-brand-blue" />
      </div>

      <template v-else-if="categories && categories.length">
        <!-- Боковое меню -->
        <aside class="w-1/4 min-w-[280px] bg-gray-50/50 border-r border-gray-100 py-4 overflow-y-auto custom-scrollbar">
          <ul class="px-3 space-y-1">
            <li v-for="category in categories" :key="category.category_id">
              <button
                  @mouseenter="activeCategory = category"
                  @click="goToCategory(category)"
                  class="flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-left transition-all duration-200 group"
                  :class="activeCategory?.category_id === category.category_id
                  ? 'bg-white text-brand-blue shadow-sm ring-1 ring-gray-100'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-brand-dark-blue'"
              >
                <div class="flex items-center gap-x-3">
                  <div class="w-6 h-6 shrink-0 flex items-center justify-center">
                    <img
                        v-if="category.icon"
                        :src="category.icon"
                        class="max-w-full max-h-full object-contain transition-opacity"
                        :class="activeCategory?.category_id === category.category_id ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'"
                        @error="(e) => (e.target as HTMLImageElement).style.opacity = '0.3'"
                    >
                    <Icon v-else name="ph:squares-four-bold" size="20" class="text-gray-300" />
                  </div>
                  <span class="text-sm font-bold tracking-tight">{{ category.name }}</span>
                </div>
                <Icon
                    name="ph:caret-right-bold"
                    size="14"
                    class="transition-transform group-hover:translate-x-1"
                    :class="activeCategory?.category_id === category.category_id ? 'text-brand-blue' : 'text-gray-300'"
                />
              </button>
            </li>
          </ul>
        </aside>

        <!-- Основной контент -->
        <main class="flex-1 p-8 bg-white overflow-y-auto custom-scrollbar">
          <div v-if="activeCategory" class="animate-in fade-in slide-in-from-left-2 duration-300">
            <div class="mb-8 flex items-center justify-between border-b border-gray-50 pb-5">
              <h2 class="text-2xl font-extrabold text-brand-dark-blue flex items-center gap-3">
                {{ activeCategory.name }}
              </h2>

              <NuxtLink
                  :to="localePath(`/catalog/${activeCategory.slug || 'cat'}_${activeCategory.category_id}`)"
                  @click="uiStore.isMegaMenuOpen = false"
                  class="group flex items-center gap-2 text-sm font-bold text-brand-blue hover:text-brand-dark-blue transition-colors"
              >
                {{ t('common.view_all_section') }}
                <Icon name="ph:arrow-right-bold" class="transition-transform group-hover:translate-x-1" />
              </NuxtLink>
            </div>

            <div v-if="activeCategory.child_categories?.length" class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <NuxtLink
                  v-for="child in activeCategory.child_categories"
                  :key="child.category_id"
                  :to="localePath(`/catalog/${activeCategory.slug || 'cat'}_${activeCategory.category_id}/${child.slug || 'sub'}_${child.category_id}`)"
                  @click="uiStore.isMegaMenuOpen = false"
                  class="group flex flex-col items-center gap-3 p-4 rounded-2xl border border-gray-100 bg-gray-50/20 hover:bg-white hover:shadow-xl hover:border-brand-blue/10 transition-all duration-500"
              >
                <div class="h-28 w-full flex items-center justify-center rounded-xl bg-white p-2 group-hover:scale-105 transition-transform duration-500 shadow-sm">
                  <img
                      :src="child.icon || '/images/category-placeholder.png'"
                      :alt="child.name"
                      class="h-full w-full object-contain mix-blend-multiply"
                      @error="(e) => (e.target as HTMLImageElement).src = '/images/category-placeholder.png'"
                  >
                </div>
                <span class="text-sm font-bold text-gray-700 group-hover:text-brand-blue text-center line-clamp-2 leading-tight px-2">
                  {{ child.name }}
                </span>
              </NuxtLink>
            </div>

            <div v-else class="flex flex-col items-center justify-center py-20 text-gray-400">
              <Icon name="ph:folder-open-thin" size="64" class="opacity-10 mb-4" />
              <p class="font-medium">{{ t('common.no_subcategories') }}</p>
            </div>
          </div>
        </main>
      </template>

      <div v-else-if="catalogStore.error" class="w-full py-20 text-center text-red-500 font-bold">
        {{ t('common.error_loading') }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

const uiStore = useUIStore();
const catalogStore = useCatalogStore(); // <-- Используем стор
const router = useRouter();
const { t } = useI18n();
const localePath = useLocalePath();

// УБРАЛИ ЛОКАЛЬНЫЙ useFetch
// const { data: apiResponse ... } = await useFetch(...)

// Берем данные из стора
const categories = computed(() => catalogStore.tree);
const activeCategory = ref<any>(null);

watch(categories, (newVal) => {
  if (newVal?.length && !activeCategory.value) {
    activeCategory.value = newVal[0];
  }
}, { immediate: true });

const goToCategory = (cat: any) => {
  const path = localePath(`/catalog/${cat.slug || 'cat'}_${cat.category_id}`);
  router.push(path);
  uiStore.isMegaMenuOpen = false;
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
</style>