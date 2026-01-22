<template>
  <div class="bg-[#F8F9FB] min-h-screen pb-24 md:pb-12">

    <Suspense>
      <!-- Основной компонент (Загрузит данные) -->
      <ProductView :slug="currentSlug" />

      <!-- Что показывать во время загрузки -->
      <template #fallback>
        <SkeletonProductDetail />
      </template>
    </Suspense>

  </div>
</template>

<script setup lang="ts">
// Импортируем компонент скелетона, который мы создали ранее
// Nuxt авто-импортирует компоненты, поэтому import SkeletonProductDetail не обязателен,
// если он лежит в components/skeleton/ProductDetail.vue

const route = useRoute();
const currentSlug = route.params.slug as string;
</script>