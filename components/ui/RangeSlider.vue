<template>
  <div class="range-slider w-full relative h-6 select-none touch-none">
    <!-- Трек (фон) -->
    <div class="absolute top-1/2 left-0 right-0 h-1 -mt-0.5 rounded-full bg-gray-200"></div>

    <!-- Активный трек (синий) -->
    <div
        class="absolute top-1/2 h-1 -mt-0.5 rounded-full bg-brand-blue"
        :style="{ left: leftPercent + '%', right: (100 - rightPercent) + '%' }"
    ></div>

    <!-- Левый ползунок -->
    <div
        class="thumb absolute top-1/2 h-5 w-5 -mt-2.5 -ml-2.5 rounded-full bg-white border-2 border-brand-blue shadow-md cursor-grab active:cursor-grabbing hover:scale-110 transition-transform z-10"
        :style="{ left: leftPercent + '%' }"
        @mousedown="startDrag($event, 'min')"
        @touchstart.passive="startDrag($event, 'min')"
    ></div>

    <!-- Правый ползунок -->
    <div
        class="thumb absolute top-1/2 h-5 w-5 -mt-2.5 -ml-2.5 rounded-full bg-white border-2 border-brand-blue shadow-md cursor-grab active:cursor-grabbing hover:scale-110 transition-transform z-10"
        :style="{ left: rightPercent + '%' }"
        @mousedown="startDrag($event, 'max')"
        @touchstart.passive="startDrag($event, 'max')"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue';
import type { PropType } from 'vue'; // <-- ИСПРАВЛЕНИЕ: Добавлен импорт типа

const props = defineProps({
  min: { type: Number, default: 0 },
  max: { type: Number, default: 100 },
  modelValue: { type: Array as PropType<number[]>, default: () => [0, 100] }
});

const emit = defineEmits(['update:modelValue', 'change']);

const { min, max, modelValue } = toRefs(props);

// Вычисляем проценты для позиционирования
const leftPercent = computed(() => {
  const val = (modelValue.value[0] - min.value) / (max.value - min.value);
  return Math.max(0, Math.min(1, val)) * 100;
});

const rightPercent = computed(() => {
  const val = (modelValue.value[1] - min.value) / (max.value - min.value);
  return Math.max(0, Math.min(1, val)) * 100;
});

// Логика перетаскивания
const startDrag = (event: MouseEvent | TouchEvent, handle: 'min' | 'max') => {
  event.preventDefault();

  const sliderRect = (event.target as HTMLElement).parentElement!.getBoundingClientRect();

  const onMove = (e: MouseEvent | TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;

    // Рассчитываем новое значение на основе позиции курсора
    let percentage = (clientX - sliderRect.left) / sliderRect.width;
    percentage = Math.max(0, Math.min(1, percentage));

    let newValue = Math.round(min.value + percentage * (max.value - min.value));

    const newRange = [...modelValue.value];

    if (handle === 'min') {
      newRange[0] = Math.min(newValue, newRange[1] - 1);
    } else {
      newRange[1] = Math.max(newValue, newRange[0] + 1);
    }

    emit('update:modelValue', newRange);
  };

  const onEnd = () => {
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onEnd);
    document.removeEventListener('touchmove', onMove);
    document.removeEventListener('touchend', onEnd);
    emit('change', modelValue.value);
  };

  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onEnd);
  document.addEventListener('touchmove', onMove);
  document.addEventListener('touchend', onEnd);
};
</script>