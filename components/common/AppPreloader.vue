<template>
  <div v-if="isLoading" class="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-white">
    <div class="relative flex items-center justify-center">
      <div class="h-24 w-24 animate-spin rounded-full border-4 border-gray-100 border-t-brand-blue"></div>
      <img src="/logo.png" alt="MYCOM" class="absolute h-8 w-auto">
    </div>
    <p class="mt-6 text-xs font-black uppercase tracking-[0.3em] text-gray-300 animate-pulse">
      {{ $t('common.loading') }}...
    </p>
  </div>
</template>

<script setup>
defineProps({ isLoading: Boolean });
</script>