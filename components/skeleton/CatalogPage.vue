<template>
  <div class="bg-white py-6 md:py-10">
    <div class="w-full px-4 sm:px-6 md:px-8">
      <!-- Хлебные крошки -->
      <div class="flex gap-2 mb-6">
        <div class="h-4 w-20 bg-gray-100 rounded animate-pulse"></div>
        <div class="h-4 w-20 bg-gray-100 rounded animate-pulse"></div>
      </div>

      <!-- Заголовок -->
      <div class="mb-8 flex justify-between items-center">
        <div class="h-8 w-48 bg-gray-200 rounded-lg animate-pulse"></div>
        <div class="h-8 w-24 bg-gray-100 rounded-lg animate-pulse hidden md:block"></div>
      </div>

      <div class="flex flex-col lg:flex-row gap-8 items-start">
        <!-- Сайдбар (Фильтры) -->
        <aside class="hidden lg:block w-72 shrink-0 sticky top-24">
          <SkeletonFilter />
        </aside>

        <!-- Контент -->
        <div class="flex-1 w-full min-w-0">
          <!-- Сортировка -->
          <div class="mb-8 h-12 w-full bg-gray-50 rounded-xl animate-pulse"></div>

          <!-- Сетка товаров -->
          <div class="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <SkeletonProductCard v-for="n in 8" :key="n" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>