<template>
  <div class="flex flex-wrap items-center justify-between gap-4 bg-gray-50/80 p-2 rounded-2xl border border-gray-100 shadow-sm">

    <button
        @click="$emit('toggleFilters')"
        class="flex h-11 items-center gap-x-2 rounded-xl bg-white px-5 text-sm font-bold text-brand-dark-blue shadow-sm ring-1 ring-gray-200 transition-all hover:ring-brand-blue hover:text-brand-blue active:scale-95"
    >
      <Icon name="ph:faders-horizontal-bold" size="20" />
      <span>{{ $t('catalog.filters') }}</span>
    </button>

    <div class="flex items-center gap-2 overflow-x-auto no-scrollbar">
      <span class="hidden lg:block text-[10px] font-bold text-gray-400 uppercase tracking-widest mr-2">{{ $t('catalog.sort_by') }}:</span>

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
        <Icon
            v-if="modelValue === 'price_asc'"
            name="ph:sort-ascending-bold"
            size="16"
        />
        <Icon
            v-else-if="modelValue === 'price_desc'"
            name="ph:sort-descending-bold"
            size="16"
        />
        <Icon
            v-else
            name="ph:arrows-down-up-bold"
            size="16"
            class="opacity-30"
        />
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

// Используем стандартный i18n
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
  @apply flex h-11 items-center gap-x-2 rounded-xl px-4 text-xs font-bold transition-all duration-300 whitespace-nowrap;
  @apply bg-white text-gray-500 ring-1 ring-gray-100 hover:ring-gray-300;
}
.sort-btn.active {
  @apply bg-brand-blue text-white ring-brand-blue shadow-md shadow-brand-blue/20;
}
.no-scrollbar::-webkit-scrollbar { display: none; }
</style>