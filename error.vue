<template>
  <!-- Оборачиваем в Layout, чтобы были Header и Footer -->
  <NuxtLayout name="default">
    <div class="flex min-h-[70vh] w-full flex-col items-center justify-center bg-white px-4 py-10 sm:px-6 md:px-8">

      <div class="relative text-center">
        <!-- Крупный фон 404 -->
        <h1 class="font-unbounded text-[120px] font-black leading-none text-brand-blue/5 md:text-[200px] select-none">
          404
        </h1>

        <!-- Контент поверх фона -->
        <div class="relative -mt-10 md:-mt-16">
          <div class="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-blue-50 text-brand-blue shadow-inner">
            <!-- ИСПРАВЛЕНО: Изменил иконку на более надежную -->
            <Icon name="ph:smiley-sad-duotone" size="56" />
          </div>

          <h2 class="mb-4 text-2xl font-black text-brand-dark-blue md:text-3xl">
            {{ $t('error.not_found_title') || 'Страница не найдена' }}
          </h2>

          <p class="mx-auto mb-8 max-w-md text-sm font-medium leading-relaxed text-gray-500 md:text-base">
            {{ $t('error.not_found_text') || 'К сожалению, страница, которую вы ищете, не существует.' }}
          </p>

          <!-- Кнопка перехода на главную -->
          <div class="mx-auto max-w-xs">
            <button
                @click="handleError"
                class="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-brand-blue px-8 text-sm font-black uppercase tracking-widest text-white shadow-lg shadow-brand-blue/30 transition-all hover:bg-brand-dark-blue hover:-translate-y-1 active:scale-95"
            >
              <Icon name="ph:house-bold" size="20" />
              <span>{{ $t('common.home') }}</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
// Принимаем пропс error от Nuxt
const props = defineProps({
  error: Object
});

const localePath = useLocalePath();

// Функция для очистки ошибки и перехода на главную
const handleError = () => {
  clearError({
    redirect: localePath('/') // Редирект с учетом текущего языка
  });
};

// SEO Meta
useSeoMeta({
  title: '404 - Page Not Found | MYCOM',
  robots: 'noindex, nofollow'
});
</script>