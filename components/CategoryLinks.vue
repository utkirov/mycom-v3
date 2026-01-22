<template>
  <section class="py-10">
    <div class="container mx-auto px-4 md:px-[90px]">
      <div class="relative">
        <Swiper
            :modules="[Navigation]"
            :navigation="{ nextEl: next, prevEl: prev }"
            :breakpoints="{
            320: { slidesPerView: 1.5, spaceBetween: 16 },
            640: { slidesPerView: 3, spaceBetween: 24 },
            1024: { slidesPerView: 4, spaceBetween: 32 },
            1280: { slidesPerView: 6, spaceBetween: 32 }
          }"
        >
          <SwiperSlide v-for="category in categories" :key="category.nameKey">
            <NuxtLink
                :to="localePath(category.link)"
                class="flex items-center justify-between rounded-2xl bg-category-bg p-6 transition hover:bg-category-bg-hover"
            >
              <span class="text-[24px] font-semibold text-brand-dark-blue">{{ $t(category.nameKey) }}</span>
              <img :src="category.image" :alt="$t(category.nameKey)" class="h-[94px] w-[94px] object-contain">
            </NuxtLink>
          </SwiperSlide>
        </Swiper>

        <div class="absolute -left-5 top-1/2 z-10 -translate-y-1/2">
          <button ref="prev" class="slider-prev flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50">
            <Icon name="ph:caret-left-bold" size="18" class="text-brand-gray" />
          </button>
        </div>
        <div class="absolute -right-5 top-1/2 z-10 -translate-y-1/2">
          <button ref="next" class="slider-next flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50">
            <Icon name="ph:caret-right-bold" size="18" class="text-brand-gray" />
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation } from 'swiper/modules';
import 'swiper/css';

const localePath = useLocalePath();

const categories = ref([
  { nameKey: 'catalog.monoblocks', image: '/images/categories/monoblock.png', link: '/catalog/monoblocks' },
  { nameKey: 'catalog.keyboards', image: '/images/categories/keyboard.png', link: '/catalog/keyboards' },
  { nameKey: 'catalog.headphones', image: '/images/categories/headphones.png', link: '/catalog/headphones' },
  { nameKey: 'catalog.laptops', image: '/images/categories/laptop.png', link: '/catalog/laptops' },
  { nameKey: 'catalog.printers', image: '/images/categories/printer.png', link: '/catalog/printers' },
  { nameKey: 'catalog.mice', image: '/images/categories/mouse.png', link: '/catalog/mice' },
  { nameKey: 'catalog.tablets', image: '/images/categories/tablet.png', link: '/catalog/tablets' },
]);

const prev = ref(null);
const next = ref(null);
</script>