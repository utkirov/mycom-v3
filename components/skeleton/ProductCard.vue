<template>
  <div class="flex h-full flex-col overflow-hidden rounded-[32px] bg-white border border-gray-100 p-3 shadow-sm">
    <div class="aspect-square w-full rounded-3xl bg-gray-100 animate-pulse"></div>

    <div class="flex flex-1 flex-col px-1 pt-4">
      <div class="mb-2 flex gap-2">
        <div class="h-4 w-8 rounded bg-gray-100 animate-pulse"></div>
        <div class="h-4 w-12 rounded bg-gray-100 animate-pulse"></div>
      </div>

      <div class="mb-3 h-4 w-3/4 rounded bg-gray-100 animate-pulse"></div>
      <div class="mb-auto h-4 w-1/2 rounded bg-gray-100 animate-pulse"></div>

      <div class="mt-4 pt-2 space-y-3">
        <div class="h-6 w-1/3 rounded bg-gray-100 animate-pulse"></div>
        <div class="flex gap-2">
          <div class="h-11 w-full rounded-2xl bg-gray-100 animate-pulse"></div>
          <div class="h-11 w-11 shrink-0 rounded-2xl bg-gray-100 animate-pulse"></div>
        </div>
      </div>
    </div>
  </div>
</template>