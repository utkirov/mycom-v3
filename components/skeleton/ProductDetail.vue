<template>
  <div class="container mx-auto px-4 sm:px-6 md:px-8 py-8 animate-pulse">
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-10 items-start">

      <!-- Gallery Skeleton -->
      <div class="lg:col-span-7 xl:col-span-8 flex flex-col-reverse md:flex-row gap-4">
        <div class="flex md:flex-col gap-3">
          <div v-for="n in 4" :key="n" class="h-16 w-16 md:h-20 md:w-20 rounded-2xl bg-gray-200"></div>
        </div>
        <div class="flex-1 aspect-square rounded-[32px] bg-gray-200"></div>
      </div>

      <!-- Info Skeleton -->
      <div class="lg:col-span-5 xl:col-span-4 space-y-6">
        <div class="space-y-2">
          <div class="h-4 w-24 bg-gray-200 rounded"></div>
          <div class="h-8 w-3/4 bg-gray-200 rounded"></div>
        </div>

        <div class="h-12 w-full bg-gray-100 rounded-xl"></div>

        <div class="space-y-2">
          <div class="h-4 w-20 bg-gray-200 rounded"></div>
          <div class="h-10 w-40 bg-gray-200 rounded"></div>
        </div>

        <div class="space-y-3 pt-4">
          <div class="h-14 w-full bg-gray-200 rounded-xl"></div>
          <div class="grid grid-cols-2 gap-3">
            <div class="h-12 bg-gray-100 rounded-xl"></div>
            <div class="h-12 bg-gray-100 rounded-xl"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>