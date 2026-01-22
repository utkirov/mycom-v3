<template>
  <div class="bg-white py-10 md:py-16">
    <div class="w-full px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
      <!-- Заголовок -->
      <div class="mb-8 space-y-2">
        <div class="h-8 w-64 bg-gray-200 rounded-lg animate-pulse"></div>
        <div class="h-4 w-32 bg-gray-100 rounded animate-pulse"></div>
      </div>

      <!-- Сетка -->
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        <SkeletonProductCard v-for="n in 10" :key="n" />
      </div>
    </div>
  </div>
</template>