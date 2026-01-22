<template>
  <section v-if="products && products.length > 0" class="py-6 border-b border-gray-100 last:border-0">
    <div class="w-full px-4 sm:px-6 md:px-8">

      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-lg font-extrabold text-brand-dark-blue sm:text-xl md:text-2xl">
          {{ title }}
        </h2>

        <div class="flex items-center gap-3">
          <NuxtLink
              v-if="collectionSlug"
              :to="localePath(`/catalog/${collectionSlug}`)"
              class="text-xs font-bold text-brand-blue hover:underline sm:text-sm"
          >
            {{ $t('common.view_all') }}
          </NuxtLink>

          <div class="hidden gap-1 sm:flex">
            <button ref="prev" class="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 hover:border-brand-blue hover:text-brand-blue transition-colors">
              <Icon name="ph:caret-left-bold" size="14" />
            </button>
            <button ref="next" class="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 hover:border-brand-blue hover:text-brand-blue transition-colors">
              <Icon name="ph:caret-right-bold" size="14" />
            </button>
          </div>
        </div>
      </div>

      <Swiper
          :modules="[Navigation]"
          :navigation="{ prevEl: prev, nextEl: next }"
          :breakpoints="{
            320: { slidesPerView: 1.4, spaceBetween: 12 },
            480: { slidesPerView: 2.1, spaceBetween: 16 },
            768: { slidesPerView: 3, spaceBetween: 20 },
            1024: { slidesPerView: 4, spaceBetween: 24 },
            1280: { slidesPerView: 5, spaceBetween: 24 },
            1536: { slidesPerView: 6, spaceBetween: 24 }
          }"
          class="!overflow-visible !py-4 px-4 sm:px-0 -mx-4 sm:mx-0"
      >
        <SwiperSlide v-for="product in products" :key="product.id || product.product_id" class="h-auto">
          <!-- FIX: Передаем stock напрямую без лишних проверок, так как мы уже обработали его в HomeView -->
          <ProductCard
              :product="{
                id: product.id || product.product_id,
                name: product.name,
                image: product.image,
                price: product.price,
                oldPrice: product.oldPrice,
                rating: product.rating || '5.0',
                reviewsCount: product.reviewsCount || 0,
                stock: product.stock, // <-- Прямая передача
                slug: product.slug,
                seo: product.seo
              }"
              class="h-full"
          />
        </SwiperSlide>
      </Swiper>

    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation } from 'swiper/modules';
import 'swiper/css';

defineProps({
  title: { type: String, required: true },
  products: { type: Array, default: () => [] },
  collectionSlug: { type: String, default: '' }
});

const localePath = useLocalePath();
const prev = ref(null);
const next = ref(null);
</script>