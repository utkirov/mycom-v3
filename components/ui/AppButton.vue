<template>
  <button
      class="flex w-full items-center justify-center
           gap-x-2 rounded-lg
           font-semibold
           transition
           hover:opacity-90
           disabled:opacity-50
           disabled:cursor-not-allowed"
      :class="[buttonSizeClass, buttonVariantClass]"
  >
    <span v-if="$slots.icon">
      <slot name="icon" />
    </span>
    <span>
      <slot />
    </span>
  </button>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  /**
   * 'primary' (синий), 'secondary' (серый), 'success' (зеленый)
   */
  variant: {
    type: String,
    default: 'primary',
    validator: (val) => ['primary', 'secondary', 'success'].includes(val)
  },
  /**
   * 'medium' (h-12, основной), 'large' (h-14)
   */
  size: {
    type: String,
    default: 'medium',
    validator: (val) => ['medium', 'large'].includes(val)
  }
});

// 1. Вычисляемый класс для размера
const buttonSizeClass = computed(() => {
  return props.size === 'large' ? 'h-14 px-6 text-base' : 'h-12 px-5 text-sm';
});

// 2. Вычисляемый класс для стиля
const buttonVariantClass = computed(() => {
  switch (props.variant) {
    case 'success':
      return 'bg-brand-green text-white';
    case 'secondary':
      return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
    case 'primary':
    default:
      return 'bg-brand-blue text-white';
  }
});
</script>