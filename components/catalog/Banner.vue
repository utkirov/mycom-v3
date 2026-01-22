<template>
  <div v-if="title" class="relative w-full overflow-hidden rounded-[24px] bg-gradient-to-r from-[#009FE3] to-[#0077AA] shadow-lg mb-8 group">

    <!-- Декоративные круги на фоне -->
    <div class="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
    <div class="absolute bottom-0 left-0 -ml-10 -mb-10 h-40 w-40 rounded-full bg-white/10 blur-2xl"></div>

    <div class="relative z-10 flex flex-col md:flex-row items-center justify-between p-6 md:p-10 gap-6">

      <!-- Текст -->
      <div class="flex-1 text-center md:text-left">
        <span v-if="tag" class="inline-block mb-3 px-3 py-1 rounded-lg bg-white/20 text-xs font-black text-white uppercase tracking-widest backdrop-blur-md border border-white/10">
          {{ tag }}
        </span>

        <h1 class="text-2xl md:text-4xl font-black text-white font-unbounded leading-tight mb-3">
          {{ title }}
        </h1>

        <p v-if="description" class="text-white/80 text-sm md:text-base font-medium leading-relaxed max-w-lg">
          {{ description }}
        </p>
      </div>

      <!-- Изображение -->
      <div class="w-full md:w-1/3 flex justify-center md:justify-end relative">
        <div class="relative w-48 h-48 md:w-64 md:h-48 transition-transform duration-700 group-hover:scale-105 group-hover:-rotate-2">
          <!-- Подложка (свет) -->
          <div class="absolute inset-0 bg-white/20 rounded-full blur-2xl transform scale-75"></div>

          <NuxtImg
              :src="image || '/images/category-placeholder.png'"
              :alt="title"
              class="relative w-full h-full object-contain drop-shadow-xl"
              width="250"
              height="200"
              format="webp"
              fit="contain"
          />
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  tag: { type: String, default: '' }
});
</script>