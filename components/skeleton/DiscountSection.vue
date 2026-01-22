<template>
  <div class="py-8 md:py-12 animate-pulse">
    <div class="w-full px-4 sm:px-6 md:px-8">
      <div class="relative flex flex-col overflow-hidden rounded-[40px] bg-gray-100 border border-gray-200 lg:flex-row h-auto lg:h-[400px]">

        <!-- Левая часть (Баннер/Таймер) -->
        <div class="w-full lg:w-80 shrink-0 bg-gray-200 p-10 flex flex-col justify-between gap-4">
          <div class="h-8 w-32 bg-gray-300 rounded-full"></div>
          <div class="space-y-2">
            <div class="h-10 w-3/4 bg-gray-300 rounded-xl"></div>
            <div class="h-10 w-1/2 bg-gray-300 rounded-xl"></div>
          </div>
          <div class="grid grid-cols-4 gap-2 mt-auto">
            <div v-for="n in 4" :key="n" class="h-12 bg-gray-300 rounded-lg"></div>
          </div>
        </div>

        <!-- Правая часть (Слайдер товаров) -->
        <div class="flex-1 p-6 lg:p-10 flex gap-4 overflow-hidden">
          <div v-for="n in 4" :key="n" class="w-[220px] shrink-0 h-full rounded-3xl bg-white border border-gray-200 p-3 flex flex-col">
            <div class="aspect-square bg-gray-100 rounded-2xl mb-3"></div>
            <div class="h-4 w-3/4 bg-gray-100 rounded mb-2"></div>
            <div class="h-4 w-1/2 bg-gray-100 rounded mt-auto"></div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>