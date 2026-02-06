<template>
  <div class="flex items-center justify-center min-h-screen bg-white">
    <CommonAppPreloader :is-loading="true" />
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const config = useRuntimeConfig();
const localePath = useLocalePath(); // Подключаем хелпер путей
const { locale } = useI18n(); // Подключаем текущую локаль

// Получаем путь без префикса языка для поиска в БД (опционально, зависит от бэкенда)
// Но чаще всего проще отправить route.path "как есть", а бэкенд сам разберется
// В данном случае добавим lang в запрос, чтобы бэкенд мог выдать правильную ссылку
const { data } = await useFetch<any>(`${config.public.apiBase}/api/v1/site/redirect`, {
  query: {
    old_url: route.path,
    lang: locale.value
  }
});

// Логика обработки ответа
if (data.value?.data?.url) {
  let newUrl = data.value.data.url;

  // 1. Нормализация слагов (замена _ на -), если это необходимо
  // Это полезно, если в базе старые ссылки с подчеркиванием
  if (newUrl.includes('_')) {
    newUrl = newUrl.replace(/_/g, '-');
  }

  // 2. Проверяем, внешняя ли это ссылка
  const isExternal = newUrl.startsWith('http');

  // 3. Формируем целевой URL
  // Если ссылка внутренняя -> оборачиваем в localePath, чтобы сохранить язык
  const targetUrl = isExternal ? newUrl : localePath(newUrl);

  // 4. Защита от бесконечного редиректа
  // Если API вернул ссылку, на которой мы уже находимся -> отдаем 404
  if (route.path === targetUrl || route.fullPath === targetUrl) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Page Not Found',
      fatal: true
    });
  }

  // 5. Выполняем 301 редирект
  await navigateTo(targetUrl, {
    redirectCode: 301,
    external: isExternal
  });

} else {
  // Если API не нашел редиректа — это честная 404 ошибка
  throw createError({
    statusCode: 404,
    statusMessage: 'Page Not Found',
    fatal: true
  });
}
</script>