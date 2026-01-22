<template>
  <div class="border-b border-gray-100 py-4 last:border-0">
    <button
        @click="isOpen = !isOpen"
        class="flex w-full items-center justify-between py-2 text-left transition-colors hover:text-brand-blue"
    >
      <span class="text-sm font-black uppercase tracking-wider text-brand-dark-blue">
        {{ title }}
      </span>
      <Icon
          name="ph:caret-down-bold"
          size="16"
          class="transition-transform duration-300"
          :class="{ 'rotate-180 text-brand-blue': isOpen, 'text-gray-400': !isOpen }"
      />
    </button>

    <transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="max-h-0 opacity-0"
        enter-to-class="max-h-[500px] opacity-100"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="max-h-[500px] opacity-100"
        leave-to-class="max-h-0 opacity-0"
    >
      <div v-show="isOpen" class="overflow-hidden">
        <div class="space-y-2.5 pt-3">
          <slot />
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';

const props = defineProps({
  title: { type: String, required: true },
  initOpen: { type: Boolean, default: false },
  hasActiveFilters: { type: Boolean, default: false }
});

const isOpen = ref(props.initOpen || props.hasActiveFilters);

onMounted(() => {
  if (props.hasActiveFilters) {
    isOpen.value = true;
  }
});

// Следим за внешним изменением активности фильтров
watch(() => props.hasActiveFilters, (newVal) => {
  if (newVal) isOpen.value = true;
});
</script>