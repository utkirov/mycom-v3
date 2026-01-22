<template>
  <teleport to="body">
    <transition
        enter-active-class="transform ease-out duration-300 transition-all"
        enter-from-class="-translate-y-4 opacity-0"
        enter-to-class="translate-y-0 opacity-100"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-4"
    >
      <div
          v-if="isVisible"
          class="fixed top-6 left-1/2 z-[2000] flex w-[calc(100%-32px)] max-w-md -translate-x-1/2 items-start gap-4 rounded-2xl bg-white p-4 shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-100 sm:w-full"
      >
        <!-- Иконка статуса -->
        <div
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full ring-1 ring-inset"
            :class="statusStyles.iconBg"
        >
          <Icon :name="statusStyles.icon" size="20" :class="statusStyles.iconColor" />
        </div>

        <!-- Текст -->
        <div class="flex-1 pt-0.5">
          <h4 class="text-sm font-bold text-gray-900 leading-none mb-1">
            {{ statusStyles.title }}
          </h4>
          <p class="text-sm font-medium text-gray-500 leading-relaxed">
            {{ message }}
          </p>
        </div>

        <!-- Кнопка закрытия -->
        <button
            @click="hideToast"
            class="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
        >
          <Icon name="ph:x-bold" size="16" />
        </button>

        <!-- Прогресс бар (исчезающий) -->
        <div class="absolute bottom-0 left-4 right-4 h-[2px] overflow-hidden rounded-full bg-gray-100">
          <div
              class="h-full w-full origin-left animate-progress"
              :class="statusStyles.barColor"
          ></div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const { isVisible, message, type, hideToast } = useToast();
const { t } = useI18n();

const statusStyles = computed(() => {
  switch (type.value) {
    case 'success':
      return {
        icon: 'ph:check-circle-fill',
        iconBg: 'bg-green-50 ring-green-100',
        iconColor: 'text-green-600',
        barColor: 'bg-green-500',
        title: t('common.save_success') || 'Успешно'
      };
    case 'error':
      return {
        icon: 'ph:warning-circle-fill',
        iconBg: 'bg-red-50 ring-red-100',
        iconColor: 'text-red-600',
        barColor: 'bg-red-500',
        title: t('common.error_generic') ? 'Ошибка' : 'Xatolik'
      };
    case 'warning':
      return {
        icon: 'ph:warning-fill',
        iconBg: 'bg-yellow-50 ring-yellow-100',
        iconColor: 'text-yellow-600',
        barColor: 'bg-yellow-500',
        title: 'Внимание'
      };
    case 'info':
    default:
      return {
        icon: 'ph:info-fill',
        iconBg: 'bg-blue-50 ring-blue-100',
        iconColor: 'text-brand-blue',
        barColor: 'bg-brand-blue',
        title: 'Информация'
      };
  }
});
</script>

<style scoped>
@keyframes progress {
  from { transform: scaleX(1); }
  to { transform: scaleX(0); }
}

.animate-progress {
  animation: progress 2s linear forwards;
}
</style>