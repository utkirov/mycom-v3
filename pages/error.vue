<template>
  <NuxtLayout name="default">
    <div class="bg-white py-20 md:py-32">
      <div class="w-full px-4 sm:px-6 md:px-8 max-w-lg mx-auto text-center">

        <h1 class="text-9xl font-bold text-brand-blue">
          404
        </h1>

        <h2 class="text-4xl font-bold text-brand-dark-blue mt-6">
          {{ $t('error.not_found_title') }}
        </h2>
        <p class="text-lg text-gray-600 mt-4 leading-relaxed">
          {{ $t('error.not_found_text') }}
        </p>

        <div class="mt-10 max-w-xs mx-auto">
          <NuxtLink :to="localePath('/')">
            <AppButton variant="primary" size="large" class="w-full">
              {{ $t('common.home') }}
            </AppButton>
          </NuxtLink>
        </div>

      </div>
    </div>
  </NuxtLayout>
</template>

<script setup>
const { t } = useI18n(); // Переход на useI18n
const localePath = useLocalePath(); // Хелпер путей

defineProps({ error: Object });
definePageMeta({ layout: false });

useSeoMeta({
  title: () => `404 - ${t('error.not_found_title')} | MYCOM`
});
</script>