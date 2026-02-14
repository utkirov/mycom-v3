<template>
  <!-- Контейнер с горизонтальным скроллом, без переноса строк -->
  <div class="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 md:mx-0 md:px-0 md:pb-0">

    <!-- Кнопка фильтров (Первая и зафиксированная визуально) -->
    <button
        @click="$emit('toggleFilters')"
        class="flex shrink-0 h-9 md:h-11 items-center gap-x-2 rounded-xl bg-white px-3 md:px-5 text-xs md:text-sm font-bold text-brand-dark-blue shadow-sm ring-1 ring-gray-200 transition-all hover:ring-brand-blue hover:text-brand-blue active:scale-95"
    >
      <Icon name="ph:faders-horizontal-bold" size="18" />
      <span>{{ $t('catalog.filters') }}</span>
    </button>

    <!-- Разделитель (вертикальная черта) только на мобильных -->
    <div class="h-6 w-px bg-gray-300 shrink-0 mx-1 md:hidden"></div>

    <!-- Сортировка (Кнопки-чипсы) -->
    <div class="flex items-center gap-2">
      <span class="hidden lg:block text-[10px] font-bold text-gray-400 uppercase tracking-widest mr-2 text-nowrap">
        {{ $t('catalog.sort_by') }}:
      </span>

      <button
          @click="setSort('popularity')"
          class="sort-btn"
          :class="{ 'active': modelValue === 'popularity' }"
      >
        {{ $t('catalog.sort_popular') }}
      </button>

      <button
          @click="togglePriceSort"
          class="sort-btn"
          :class="{ 'active': modelValue === 'price_asc' || modelValue === 'price_desc' }"
      >
        <span>{{ $t('catalog.price_title').split(' ')[0] }}</span>
        <div class="flex flex-col -space-y-1 ml-1">
          <Icon name="ph:caret-up-fill" size="10" :class="modelValue === 'price_asc' ? 'text-brand-blue' : 'text-gray-300'"/>
          <Icon name="ph:caret-down-fill" size="10" :class="modelValue === 'price_desc' ? 'text-brand-blue' : 'text-gray-300'"/>
        </div>
      </button>

      <button
          @click="setSort('newest')"
          class="sort-btn"
          :class="{ 'active': modelValue === 'newest' }"
      >
        {{ $t('catalog.sort_newest') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  modelValue: { type: String, required: true }
});

const { t } = useI18n();
const emit = defineEmits(['update:modelValue', 'toggleFilters']);

const setSort = (sortKey: string) => {
  emit('update:modelValue', sortKey);
};

const togglePriceSort = () => {
  if (props.modelValue === 'price_asc') {
    emit('update:modelValue', 'price_desc');
  } else {
    emit('update:modelValue', 'price_asc');
  }
};
</script>

<style scoped>
.sort-btn {
  @apply flex shrink-0 h-9 md:h-11 items-center gap-x-1 rounded-xl px-3 md:px-4 text-[11px] md:text-xs font-bold transition-all duration-300 whitespace-nowrap;
  @apply bg-white text-gray-500 ring-1 ring-gray-100 hover:ring-gray-300 active:scale-95;
}
.sort-btn.active {
  @apply bg-brand-blue text-white ring-brand-blue shadow-md shadow-brand-blue/20;
}
.no-scrollbar::-webkit-scrollbar { display: none; }
</style>