<template>
  <div class="flex h-screen w-full items-center justify-center bg-white">
    <CommonAppPreloader :is-loading="true" />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';

const uiStore = useUIStore();
const router = useRouter();
const localePath = useLocalePath();

onMounted(() => {
  // 1. Сразу меняем URL на главную (чтобы пользователь не оставался на /login)
  router.replace(localePath('/'));

  // 2. Открываем модальное окно авторизации
  // Небольшая задержка, чтобы роутер успел отработать
  setTimeout(() => {
    uiStore.openAuthModal();
  }, 100);
});

definePageMeta({
  layout: false // Отключаем лейаут, чтобы не мелькала шапка/футер перед редиректом
});
</script>