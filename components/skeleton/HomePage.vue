<template>
  <div class="animate-pulse">
    <!-- Hero Banner Skeleton -->
    <div class="py-4 md:py-6 w-full px-4 sm:px-6 md:px-8">
      <div class="w-full aspect-[16/9] md:aspect-[21/9] lg:aspect-[3/1] bg-gray-200 rounded-2xl"></div>
    </div>

    <!-- Discount Section Skeleton -->
    <div class="py-8 w-full px-4 sm:px-6 md:px-8">
      <div class="h-[400px] bg-gray-100 rounded-[40px] border border-gray-200 w-full"></div>
    </div>

    <!-- Category Links Skeleton -->
    <div class="py-6 w-full px-4 sm:px-6 md:px-8">
      <div class="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
        <div v-for="n in 6" :key="n" class="h-28 bg-gray-50 rounded-2xl border border-gray-100"></div>
      </div>
    </div>

    <!-- Product Rows Skeleton -->
    <div class="space-y-10 pb-10">
      <div v-for="i in 2" :key="i" class="w-full px-4 sm:px-6 md:px-8">
        <div class="h-8 w-48 bg-gray-200 rounded mb-6"></div>
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          <SkeletonProductCard v-for="j in 5" :key="j" />
        </div>
      </div>
    </div>
  </div>
</template>