<template>
  <div class="bg-white py-10 md:py-16">
    <div class="w-full px-4 sm:px-6 md:px-8 max-w-3xl mx-auto">

      <h1 class="text-4xl font-bold text-brand-dark-blue mb-8">
        {{ $t('common.terms') }}
      </h1>

      <div class="prose prose-lg max-w-none text-gray-700 leading-relaxed">
        <!-- ИСПРАВЛЕНИЕ: v-sanitize -->
        <div v-sanitize="$t('content.terms_text')"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
const { t } = useI18n();

useSeoMeta({
  title: () => `${t('common.terms')} | MYCOM`,
  description: () => t('seo.terms_description')
});
</script>

<style scoped>
.prose :where(h2):not(:where([class~="not-prose"] *)) { color: theme('colors.brand-dark-blue'); }
.prose :where(strong):not(:where([class~="not-prose"] *)) { color: theme('colors.brand-dark-blue'); }
.prose :where(ul > li):not(:where([class~="not-prose"] *))::before { background-color: theme('colors.brand-blue'); }
</style>