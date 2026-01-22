<template>
  <div class="bg-white py-10 md:py-20">
    <div class="w-full px-4 sm:px-6 md:px-8 max-w-4xl mx-auto">
      <h1 class="text-4xl md:text-5xl font-black text-brand-dark-blue mb-10">
        {{ t('common.about') }}
      </h1>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
        <div class="prose prose-lg text-gray-600">
          <!-- ИСПРАВЛЕНИЕ: v-sanitize -->
          <div v-sanitize="t('content.about_text')"></div>
        </div>
        <div class="rounded-3xl overflow-hidden shadow-2xl">
          <img src="/images/about-store.jpg" alt="MYCOM Store" class="w-full h-full object-cover">
        </div>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div v-for="stat in stats" :key="stat.label" class="p-6 rounded-2xl bg-gray-50 text-center">
          <p class="text-3xl font-black text-brand-blue mb-2">{{ stat.value }}</p>
          <p class="text-xs font-bold text-gray-400 uppercase tracking-widest">{{ t(stat.label) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n();

const stats = [
  { value: '14+', label: 'about.years_market' },
  { value: '50k+', label: 'about.happy_clients' },
  { value: '5000+', label: 'about.products_count' },
  { value: '100%', label: 'about.official_warranty' }
];

useSeoMeta({
  title: () => `${t('common.about')} | MYCOM`
});
</script>

<style scoped>
.prose :where(img):not(:where([class~="not-prose"] *)) {
  @apply rounded-2xl shadow-lg;
}
</style>