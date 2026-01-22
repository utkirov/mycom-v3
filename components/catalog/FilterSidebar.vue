<template>
  <aside class="flex flex-col gap-2">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-black text-brand-dark-blue flex items-center gap-2">
        <Icon name="ph:funnel-fill" class="text-brand-blue" />
        {{ $t('catalog.filters') }}
      </h2>
      <button
          v-if="hasAnyFilter"
          @click="clearAll"
          class="text-xs font-bold text-brand-red hover:underline"
      >
        {{ $t('catalog.reset_all') }}
      </button>
    </div>

    <div class="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">

      <!-- ФИЛЬТР ЦЕНЫ -->
      <CatalogFilterSection :title="$t('catalog.price_title')" :init-open="true">
        <div class="space-y-6 px-1 py-2">

          <!-- Слайдер -->
          <div class="px-2">
            <UiRangeSlider
                v-model="sliderValues"
                :min="minLimit"
                :max="maxLimit"
                @change="onSliderChange"
            />
          </div>

          <!-- Инпуты -->
          <div class="flex items-center gap-3">
            <div class="relative w-full">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">{{ $t('catalog.price_from') }}</span>
              <input
                  v-model.number="sliderValues[0]"
                  @input="onInputChange"
                  type="number"
                  class="w-full rounded-xl border border-gray-100 bg-gray-50 py-2.5 pl-8 pr-2 text-xs font-bold focus:border-brand-blue focus:bg-white outline-none transition"
              >
            </div>
            <div class="h-px w-4 bg-gray-300"></div>
            <div class="relative w-full">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">{{ $t('catalog.price_to') }}</span>
              <input
                  v-model.number="sliderValues[1]"
                  @input="onInputChange"
                  type="number"
                  class="w-full rounded-xl border border-gray-100 bg-gray-50 py-2.5 pl-8 pr-2 text-xs font-bold focus:border-brand-blue focus:bg-white outline-none transition"
              >
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
            <label class="group flex cursor-pointer items-center gap-3 py-1.5 w-full hover:bg-gray-50 rounded-lg px-2 transition-colors -ml-2">
              <div class="relative flex h-5 w-5 items-center justify-center shrink-0">
                <input
                    type="checkbox"
                    :value="val.id"
                    :checked="isOptionSelected(filter.id, val.id)"
                    @change="toggleFilter(filter.id, val.id)"
                    class="peer h-full w-full cursor-pointer appearance-none rounded-md border-2 border-gray-200 bg-white transition-all checked:border-brand-blue checked:bg-brand-blue"
                >
                <Icon name="ph:check-bold" size="12" class="absolute text-white opacity-0 transition-opacity peer-checked:opacity-100" />
              </div>
              <span class="text-sm font-medium text-gray-600 transition-colors group-hover:text-brand-dark-blue flex-grow flex justify-between">
                <span>{{ val.value }}</span>
                <span class="text-[10px] text-gray-300 font-bold bg-gray-50 px-1.5 rounded">{{ val.count || 0 }}</span>
              </span>
            </label>
          </div>
        </CatalogFilterSection>
      </template>

      <!-- Скелетон -->
      <div v-else-if="pending" class="space-y-6 py-4">
        <div v-for="n in 4" :key="n" class="space-y-2">
          <div class="h-4 w-24 animate-pulse rounded bg-gray-100"></div>
          <div class="h-8 w-full animate-pulse rounded-lg bg-gray-50"></div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';

// --- Types ---
interface FilterValue {
  id: number | string;
  value: string;
  count: number;
}

interface Filter {
  id: number | string;
  name: string;
  values: FilterValue[];
}

const props = defineProps({
  filtersData: { type: Array as PropType<Filter[]>, default: () => [] },
  pending: { type: Boolean, default: false }
});

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const minLimit = 0;
const maxLimit = 50000000;

// Локальное состояние слайдера (отдельно от URL)
const sliderValues = ref<number[]>([
  Number(route.query.min_price) || minLimit,
  Number(route.query.max_price) || maxLimit
]);

// Синхронизация при загрузке URL
watch(() => route.query, (newQuery) => {
  const newMin = Number(newQuery.min_price) || minLimit;
  const newMax = Number(newQuery.max_price) || maxLimit;
  // Обновляем слайдер только если значения реально отличаются, чтобы не сбивать драг
  if (newMin !== sliderValues.value[0] || newMax !== sliderValues.value[1]) {
    sliderValues.value = [newMin, newMax];
  }
});

// --- DEBOUNCE LOGIC ---
let debounceTimer: any = null;

const onSliderChange = (values: number[]) => {
  sliderValues.value = values; // UI обновляется мгновенно
  triggerUpdate(); // Запрос с задержкой
};

const onInputChange = () => {
  // Валидация диапазонов
  if (sliderValues.value[0] > sliderValues.value[1]) {
    // Если мин > макс, пока ничего не делаем или можно поменять местами
    // Оставим пользователю свободу ввода, валидация при отправке
  }
  triggerUpdate();
};

const triggerUpdate = () => {
  if (debounceTimer) clearTimeout(debounceTimer);

  debounceTimer = setTimeout(() => {
    updatePriceQuery(sliderValues.value[0], sliderValues.value[1]);
  }, 500); // 500ms задержка
};

const updatePriceQuery = (min: number, max: number) => {
  const query = { ...route.query };

  // Нормализация перед отправкой
  const finalMin = Math.min(min, max);
  const finalMax = Math.max(min, max);

  if (finalMin > minLimit) query.min_price = String(finalMin); else delete query.min_price;
  if (finalMax < maxLimit) query.max_price = String(finalMax); else delete query.max_price;

  query.page = '1'; // Сброс страницы
  router.push({ query });
};

// --- Checkbox Logic (Без Debounce, фильтры применяем сразу) ---
const isFilterActive = (filterId: string | number) => {
  const queryKey = `f_${filterId}`;
  return !!route.query[queryKey];
};

const isOptionSelected = (filterId: string | number, valueId: string | number) => {
  const queryKey = `f_${filterId}`;
  const values = String(route.query[queryKey] || '').split(',').filter(Boolean);
  return values.includes(String(valueId));
};

const toggleFilter = (filterId: string | number, valueId: string | number) => {
  const queryKey = `f_${filterId}`;
  const currentQuery = { ...route.query };
  let values = String(currentQuery[queryKey] || '').split(',').filter(Boolean);

  if (values.includes(String(valueId))) {
    values = values.filter(v => v !== String(valueId));
  } else {
    values.push(String(valueId));
  }

  if (values.length) {
    currentQuery[queryKey] = values.join(',');
  } else {
    delete currentQuery[queryKey];
  }

  currentQuery.page = '1';
  router.push({ query: currentQuery });
};

const hasAnyFilter = computed(() => Object.keys(route.query).some(k => k.startsWith('f_') || k.includes('price')));

const clearAll = () => {
  sliderValues.value = [minLimit, maxLimit];
  router.push({ query: { sort: route.query.sort } }); // Сохраняем сортировку
};
</script>