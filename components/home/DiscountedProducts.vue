<template>
  <SkeletonDiscountSection v-if="pending" />

  <section v-else-if="discountData && products.length > 0" class="py-8 md:py-12">
    <div class="w-full px-4 sm:px-6 md:px-8">
      <div class="relative flex flex-col lg:flex-row overflow-hidden rounded-[32px] bg-white shadow-xl shadow-gray-100 border border-gray-100">

        <!-- ЛЕВАЯ ЧАСТЬ -->
        <div class="relative z-10 w-full lg:w-[340px] shrink-0 bg-gradient-brand-blue p-8 text-white flex flex-col justify-between overflow-hidden">
          <div class="absolute inset-0 bg-white/10 blur-3xl rounded-full transform scale-150"></div>
          <div class="relative z-10">
            <div class="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-xs font-black uppercase tracking-widest">
              <Icon name="ph:lightning-fill" class="text-yellow-300" size="16" />
              <span>Flash Sale</span>
            </div>
            <!-- SEO: h2 для заголовка секции -->
            <h2 class="text-3xl md:text-4xl font-black font-unbounded leading-tight mb-2">
              {{ $t('home.flash_sale_title') }}
            </h2>
            <p class="text-white/80 text-sm font-medium leading-relaxed">
              {{ $t('home.flash_sale_subtitle') }}
            </p>
          </div>

          <div class="relative z-10 mt-8 mb-8 lg:mb-0">
            <p class="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mb-3 flex items-center gap-2">
              <Icon name="ph:clock-fill" />
              {{ $t('home.timer_end') }}:
            </p>
            <!-- FIX: ClientOnly для таймера -->
            <ClientOnly>
              <UiCountdownTimer v-if="discountData.date_at" :end-date="discountData.date_at" />
            </ClientOnly>
          </div>

          <div class="relative z-10 hidden lg:block">
            <NuxtLink :to="localePath('/catalog?sale=true')" class="group flex items-center justify-between w-full p-4 rounded-2xl bg-white text-brand-dark-blue font-bold shadow-lg transition-transform hover:-translate-y-1 active:scale-95">
              <span>{{ $t('home.view_all_sales') }}</span>
              <div class="w-8 h-8 rounded-full bg-brand-blue flex items-center justify-center text-white group-hover:bg-brand-dark-blue transition-colors">
                <Icon name="ph:arrow-right-bold" />
              </div>
            </NuxtLink>
          </div>
        </div>

        <!-- ПРАВАЯ ЧАСТЬ: Слайдер -->
        <div class="flex-1 bg-gray-50/50 p-4 sm:p-6 lg:p-8 relative min-w-0">
          <div class="absolute top-6 right-6 z-10 hidden lg:flex gap-2">
            <button class="flash-prev h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 hover:border-brand-blue hover:text-brand-blue transition-all">
              <Icon name="ph:caret-left-bold" />
            </button>
            <button class="flash-next h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 hover:border-brand-blue hover:text-brand-blue transition-all">
              <Icon name="ph:caret-right-bold" />
            </button>
          </div>

          <Swiper
              :modules="[Navigation, Autoplay]"
              :navigation="{ prevEl: '.flash-prev', nextEl: '.flash-next' }"
              :slides-per-view="'auto'"
              :space-between="16"
              :breakpoints="{
                320: { slidesPerView: 1.4, spaceBetween: 12 },
                768: { slidesPerView: 2.5, spaceBetween: 20 },
                1024: { slidesPerView: 3, spaceBetween: 20 },
                1280: { slidesPerView: 4, spaceBetween: 24 }
              }"
              class="!overflow-visible h-full"
          >
            <SwiperSlide v-for="product in products" :key="product.id" class="h-auto">
              <ProductDiscountedProductCard :product="product" class="h-full" />
            </SwiperSlide>
          </Swiper>
        </div>

      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import type { Product } from '~/types'; // Импорт типа

const config = useRuntimeConfig();
const { locale } = useI18n();
const localePath = useLocalePath();

const { data: response, pending } = await useFetch<any>(`${config.public.apiBase}/api/v1/site/discount-products`, {
  query: { lang: locale.value },
  key: `discount-products-${locale.value}`,
  lazy: true
});

const discountData = computed(() => response.value?.data);

// Строгая типизация
const products = computed<Product[]>(() => {
  const list = discountData.value?.products || [];
  return list.map((p: any): Product => ({
    id: p.product_id,
    product_id: p.product_id,
    name: p.name,
    price: Number(p.price),
    discount_price: Number(p.discount_price),
    oldPrice: Number(p.price),
    image: p.image,
    stock: Number(p.stock ?? p.count ?? 0),
    slug: p.seo?.name || null,
    rating: p.rating,
    reviews_count: p.reviews_count
  }));
});
</script>