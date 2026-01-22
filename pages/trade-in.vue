<template>
  <div class="bg-white py-10 md:py-16">
    <div class="w-full px-4 sm:px-6 md:px-8 max-w-3xl mx-auto">
      <h1 class="text-4xl font-bold text-brand-dark-blue mb-8">Trade-In</h1>

      <div class="prose prose-lg max-w-none text-gray-700 leading-relaxed">
        <!-- ИСПРАВЛЕНИЕ: v-sanitize -->
        <div v-sanitize="$t('content.trade_in_text')"></div>
      </div>

      <div class="mt-12 p-8 bg-blue-50 rounded-[32px] border border-blue-100">
        <h3 class="text-xl font-bold text-brand-dark-blue mb-4">{{ $t('contacts.our_stores') }}</h3>
        <p class="text-gray-600 mb-6">{{ $t('product.trade_in_disclaimer') }}</p>
        <NuxtLink :to="localePath('/contacts')">
          <AppButton variant="primary">{{ $t('common.contacts') }}</AppButton>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
const { t } = useI18n();
const localePath = useLocalePath();

useSeoMeta({
  title: () => `Trade-In | MYCOM`,
  description: () => t('seo.trade_in_description')
});
</script>