<template>
  <div class="min-h-[50vh]">
    <Suspense>
      <SearchView :key="route.fullPath" />

      <template #fallback>
        <SkeletonSearchPage />
      </template>
    </Suspense>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
</script>