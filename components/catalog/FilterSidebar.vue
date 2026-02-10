<template>
  <aside class="flex flex-col gap-2">
    <!-- Заголовок и кнопка сброса -->
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-black text-brand-dark-blue flex items-center gap-2">
        <Icon name="ph:funnel-fill" class="text-brand-blue" />
        {{ $t('catalog.filters') }}
      </h2>
      <transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 -translate-x-2"
          enter-to-class="opacity-100 translate-x-0"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100 translate-x-0"
          leave-to-class="opacity-0 -translate-x-2"
      >
        <button
            v-if="hasAnyFilter"
            @click="clearAll"
            class="text-xs font-bold text-brand-red hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded-lg transition-all"
        >
          {{ $t('catalog.reset_all') }}
        </button>
      </transition>
    </div>

    <div class="rounded-[24px] border border-gray-100 bg-white p-5 shadow-sm relative overflow-hidden">

      <!-- Индикатор загрузки поверх фильтров (если обновляются данные, но не инициализация) -->
      <transition name="fade">
        <div v-if="pending && currentMaxLimit > 0" class="absolute inset-0 z-10 bg-white/60 backdrop-blur-[1px] flex items-center justify-center rounded-[24px]">
          <Icon name="svg-spinners:ring-resize" class="text-brand-blue" size="32" />
        </div>
      </transition>

      <!-- ФИЛЬТР ЦЕНЫ -->
      <CatalogFilterSection
          v-if="(currentMaxLimit > 0) || pending"
          :title="$t('catalog.price_title')"
          :init-open="true"
      >
        <div class="space-y-6 px-1 py-2">

          <!-- Скелетон цены -->
          <div v-if="pending && currentMaxLimit === 0" class="space-y-5 animate-pulse">
            <div class="h-4 w-full bg-gray-100 rounded-lg"></div>
            <div class="flex items-center gap-3">
              <div class="h-12 w-full bg-gray-100 rounded-2xl"></div>
              <div class="h-px w-4 bg-gray-200"></div>
              <div class="h-12 w-full bg-gray-100 rounded-2xl"></div>
            </div>
          </div>

          <!-- Реальный фильтр -->
          <div v-else>
            <!-- Слайдер -->
            <div class="px-2 mb-6">
              <UiRangeSlider
                  v-model="sliderValues"
                  :min="currentMinLimit"
                  :max="currentMaxLimit"
                  @change="onSliderChange"
              />
            </div>

            <!-- Поля ввода с маской -->
            <div class="flex items-center gap-3">
              <!-- Инпут ОТ -->
              <div class="group relative w-full">
                <label class="absolute left-4 top-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider transition-colors group-focus-within:text-brand-blue">
                  {{ $t('catalog.price_from') }}
                </label>
                <input
                    :value="formatNumber(sliderValues[0])"
                    @input="onInput($event, 0)"
                    @change="onInputChange"
                    type="text"
                    inputmode="numeric"
                    class="w-full rounded-2xl border border-transparent bg-gray-50 pt-6 pb-2 pl-4 pr-8 text-sm font-bold text-brand-dark-blue outline-none ring-1 ring-gray-100 transition-all focus:bg-white focus:ring-2 focus:ring-brand-blue/20 hover:bg-gray-100"
                >
                <span class="absolute right-3 bottom-2.5 text-xs text-gray-400 font-medium">сум</span>
              </div>

              <div class="h-px w-3 bg-gray-300 shrink-0"></div>

              <!-- Инпут ДО -->
              <div class="group relative w-full">
                <label class="absolute left-4 top-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider transition-colors group-focus-within:text-brand-blue">
                  {{ $t('catalog.price_to') }}
                </label>
                <input
                    :value="formatNumber(sliderValues[1])"
                    @input="onInput($event, 1)"
                    @change="onInputChange"
                    type="text"
                    inputmode="numeric"
                    class="w-full rounded-2xl border border-transparent bg-gray-50 pt-6 pb-2 pl-4 pr-8 text-sm font-bold text-brand-dark-blue outline-none ring-1 ring-gray-100 transition-all focus:bg-white focus:ring-2 focus:ring-brand-blue/20 hover:bg-gray-100"
                >
                <span class="absolute right-3 bottom-2.5 text-xs text-gray-400 font-medium">сум</span>
              </div>
            </div>
          </div>
        </div>
      </CatalogFilterSection>

      <!-- ОСТАЛЬНЫЕ ФИЛЬТРЫ -->
      <template v-if="filtersData && filtersData.length">
        <CatalogFilterSection
            v-for="filter in filtersData"
            :key="filter.id"
            :title="filter.name"
            :has-active-filters="isFilterActive(filter.id)"
        >
          <div v-for="val in filter.values" :key="val.id" class="flex items-center">
            <label class="group flex w-full cursor-pointer items-center gap-3 py-2 px-2 hover:bg-gray-50 rounded-xl transition-all duration-200 -ml-2 active:scale-[0.98]">
              <div class="relative flex h-5 w-5 items-center justify-center shrink-0">
                <input
                    type="checkbox"
                    :value="val.id"
                    :checked="isOptionSelected(filter.id, val.id)"
                    @change="toggleFilter(filter.id, val.id)"
                    class="peer h-5 w-5 cursor-pointer appearance-none rounded-lg border-2 border-gray-200 bg-white transition-all checked:border-brand-blue checked:bg-brand-blue hover:border-brand-blue/50"
                >
                <Icon name="ph:check-bold" size="12" class="absolute text-white opacity-0 transition-opacity transform scale-50 peer-checked:scale-100 peer-checked:opacity-100" />
              </div>
              <span class="text-sm font-medium text-gray-600 transition-colors group-hover:text-brand-dark-blue flex-grow flex justify-between items-center">
                <span>{{ val.value }}</span>
                <span v-if="val.count" class="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md group-hover:bg-white group-hover:text-brand-blue transition-colors">
                  {{ val.count }}
                </span>
              </span>
            </label>
          </div>
        </CatalogFilterSection>
      </template>

      <!-- Скелетон чекбоксов -->
      <div v-else-if="pending" class="space-y-6 py-4 border-t border-gray-50 mt-4">
        <div v-for="n in 3" :key="n" class="space-y-3">
          <div class="h-4 w-24 animate-pulse rounded bg-gray-100 mb-2"></div>
          <div v-for="j in 3" :key="j" class="flex gap-3">
            <div class="h-5 w-5 rounded bg-gray-100 animate-pulse"></div>
            <div class="h-4 w-32 rounded bg-gray-100 animate-pulse"></div>
          </div>
        </div>
      </div>

    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';

interface FilterValue { id: number | string; value: string; count: number; }
interface Filter { id: number | string; name: string; values: FilterValue[]; }

const props = defineProps({
  filtersData: { type: Array as PropType<Filter[]>, default: () => [] },
  pending: { type: Boolean, default: false },
  minPrice: { type: [Number, String], default: 0 },
  maxPrice: { type: [Number, String], default: 0 }
});

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

// --- Форматирование чисел ---
const formatNumber = (val: number) => {
  if (val === undefined || val === null) return '';
  return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

const parseNumber = (val: string) => {
  return Number(val.replace(/\s/g, '')) || 0;
};

// --- Лимиты ---
const currentMinLimit = computed(() => Number(props.minPrice) || 0);
const currentMaxLimit = computed(() => Number(props.maxPrice) || 0);

// --- Состояние слайдера ---
const sliderValues = ref<number[]>([0, 0]);

const syncSlider = () => {
  const queryMin = route.query.min_price ? Number(route.query.min_price) : null;
  const queryMax = route.query.max_price ? Number(route.query.max_price) : null;

  sliderValues.value = [
    queryMin !== null ? queryMin : currentMinLimit.value,
    queryMax !== null ? queryMax : currentMaxLimit.value
  ];
};

watch(
    [() => props.pending, currentMinLimit, currentMaxLimit],
    ([isPending, newMin, newMax]) => {
      if (!isPending && newMax > 0) {
        syncSlider();
      }
    },
    { immediate: true }
);

watch(() => route.query, syncSlider);

// --- Логика ввода ---
let debounceTimer: any = null;

const onSliderChange = (values: number[]) => {
  sliderValues.value = values;
  triggerUpdate();
};

const onInput = (event: Event, index: number) => {
  const target = event.target as HTMLInputElement;
  // Убираем все нецифровые символы
  const rawValue = target.value.replace(/[^0-9]/g, '');
  const numValue = Number(rawValue);

  // Обновляем значение в массиве
  const newValues = [...sliderValues.value];
  newValues[index] = numValue;
  sliderValues.value = newValues;

  // Принудительно обновляем value инпута для форматирования (если пользователь ввел букву)
  // Но только если значение валидное, чтобы курсор не прыгал при пустом вводе
  if (rawValue) {
    // nextTick не всегда нужен здесь, но форматирование сработает при перерисовке
  }

  triggerUpdate();
};

const onInputChange = () => {
  triggerUpdate();
};

const triggerUpdate = () => {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    updatePriceQuery(sliderValues.value[0], sliderValues.value[1]);
  }, 600); // Чуть увеличил задержку для комфортного ввода
};

const updatePriceQuery = (min: number, max: number) => {
  const query = { ...route.query };

  let finalMin = Math.max(min, currentMinLimit.value);
  let finalMax = Math.min(max, currentMaxLimit.value);

  // Авто-коррекция если перепутали поля
  if (finalMin > finalMax && finalMax !== 0) [finalMin, finalMax] = [finalMax, finalMin];

  if (finalMin > currentMinLimit.value) query.min_price = String(finalMin);
  else delete query.min_price;

  if (finalMax < currentMaxLimit.value) query.max_price = String(finalMax);
  else delete query.max_price;

  query.page = '1';
  router.push({ query });
};

// --- Чекбоксы ---
const isFilterActive = (id) => !!route.query[`f_${id}`];
const isOptionSelected = (fid, vid) => (route.query[`f_${fid}`] || '').split(',').includes(String(vid));
const toggleFilter = (fid, vid) => {
  const key = `f_${fid}`;
  let vals = (route.query[key] || '').split(',').filter(Boolean);
  vals = vals.includes(String(vid)) ? vals.filter(v => v !== String(vid)) : [...vals, String(vid)];
  const q = { ...route.query, [key]: vals.join(','), page: '1' };
  if (!vals.length) delete q[key];
  router.push({ query: q });
};
const hasAnyFilter = computed(() => Object.keys(route.query).some(k => k.startsWith('f_') || k.includes('price')));
const clearAll = () => {
  const q = { sort: route.query.sort, q: route.query.q };
  router.push({ query: q });
};
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>