<template>
  <div class="min-h-screen">
    <!-- SEO FIX: Скрытый H1 для семантики -->
    <h1 class="sr-only">{{ $t('seo.index_title') }}</h1>

    <Suspense>
      <HomeView />

      <template #fallback>
        <SkeletonHomePage />
      </template>
    </Suspense>
  </div>
</template>

<script setup lang="ts">
// Логика внутри HomeView, но SEO мета-теги лучше продублировать или управлять ими здесь,
// однако HomeView.vue уже содержит useSeoMeta, так что этого достаточно.
</script>