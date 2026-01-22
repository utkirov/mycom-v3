<template>
  <div class="space-y-6 py-4 animate-pulse">
    <!-- Имитация блока цены -->
    <div class="space-y-4">
      <div class="h-4 w-24 rounded bg-gray-100"></div>
      <div class="flex gap-2">
        <div class="h-10 w-full rounded-xl bg-gray-100"></div>
        <div class="h-10 w-full rounded-xl bg-gray-100"></div>
      </div>
    </div>

    <!-- Имитация чекбоксов -->
    <div v-for="i in 3" :key="i" class="space-y-3 pt-4 border-t border-gray-50">
      <div class="h-4 w-32 rounded bg-gray-100 mb-4"></div>
      <div v-for="j in 4" :key="j" class="flex items-center gap-3">
        <div class="h-5 w-5 rounded bg-gray-100"></div>
        <div class="h-3 w-2/3 rounded bg-gray-100"></div>
      </div>
    </div>
  </div>
</template>