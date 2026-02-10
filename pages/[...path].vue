<template>
  <div class="flex items-center justify-center min-h-screen bg-white">
    <CommonAppPreloader :is-loading="true" />
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const config = useRuntimeConfig();
const localePath = useLocalePath();
const { locale } = useI18n();

// 1. Пытаемся найти редирект
const { data, error } = await useFetch<any>(`${config.public.apiBase}/api/v1/site/redirect`, {
  query: {
    old_url: route.path,
    lang: locale.value
  }
});

// 2. Если редирект найден
if (data.value?.data?.url) {
  let newUrl = data.value.data.url;

  // Замена подчеркивания на дефис (если нужно)
  if (newUrl.includes('_')) {
    newUrl = newUrl.replace(/_/g, '-');
  }

  const isExternal = newUrl.startsWith('http');
  const targetUrl = isExternal ? newUrl : localePath(newUrl);

  // Защита от цикла
  if (route.path === targetUrl || route.fullPath === targetUrl) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Page Not Found',
      fatal: true
    });
  }

  await navigateTo(targetUrl, {
    redirectCode: 301,
    external: isExternal
  });

} else {
  // 3. Если редиректа нет — выбрасываем 404
  // Это вызовет файл error.vue в корне проекта
  throw createError({
    statusCode: 404,
    statusMessage: 'Page Not Found',
    fatal: true
  });
}
</script>