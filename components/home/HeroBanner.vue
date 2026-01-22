<template>
  <section class="py-4 relative group">
    <!-- 1. SKELETON -->
    <div v-if="pending" class="w-full px-4 sm:px-6 md:px-8">
      <SkeletonHero />
    </div>

    <!-- 2. ERROR -->
    <div v-else-if="error" class="container mx-auto px-4 flex h-60 items-center justify-center rounded-[32px] bg-red-50 text-red-500 border border-red-100">
      <div class="text-center">
        <Icon name="ph:warning-circle" size="40" class="mb-2 mx-auto"/>
        <p class="font-bold">{{ $t('common.error_loading') }}</p>
      </div>
    </div>

    <!-- 3. SLIDER -->
    <div v-else-if="slides && slides.length" class="w-full px-4 sm:px-6 md:px-8">

      <!-- CLS FIX: Фиксируем aspect-ratio, чтобы не было скачка -->
      <div class="relative overflow-hidden rounded-[32px] shadow-2xl shadow-brand-blue/10 transform transition-all duration-500 hover:shadow-brand-blue/20 aspect-[1.8/1] md:aspect-[2.5/1] lg:aspect-[3.2/1]">

        <Swiper
            :modules="modules"
            :slides-per-view="1"
            :space-between="0"
            :loop="true"
            :speed="1000"
            :parallax="true"
            :autoplay="{
              delay: 6000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true
            }"
            class="hero-swiper h-full w-full"
            @autoplayTimeLeft="onAutoplayTimeLeft"
        >
          <SwiperSlide
              v-for="(slide, index) in slides"
              :key="slide.banner_id || index"
              class="relative overflow-hidden"
          >
            <NuxtLink :to="getBannerLink(slide)" class="block w-full h-full relative cursor-pointer">

              <!-- ФОН (Параллакс) -->
              <div
                  class="absolute inset-0 w-full h-full bg-cover bg-center"
                  data-swiper-parallax="50%"
              >
                <!-- SEO FIX: fetchpriority и sizes для LCP -->
                <NuxtImg
                    :src="slide.image"
                    :alt="slide.title || 'Banner'"
                    :loading="index === 0 ? 'eager' : 'lazy'"
                    :fetchpriority="index === 0 ? 'high' : 'auto'"
                    sizes="100vw sm:100vw md:100vw"
                    format="webp"
                    fit="cover"
                    class="w-full h-full object-cover transform transition-transform duration-[10000ms] ease-linear scale-100 group-hover:scale-105"
                />
              </div>

              <!-- ГРАДИЕНТ -->
              <div class="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent"></div>

              <!-- КОНТЕНТ -->
              <div class="absolute inset-0 flex items-center px-6 md:px-12 lg:px-20">
                <div class="max-w-xl relative z-10">

                  <!-- Бейдж -->
                  <div
                      class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-white/90 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-3 opacity-0 animate-content"
                      style="animation-delay: 0.1s;"
                  >
                    <Icon name="ph:star-fill" class="text-yellow-400" />
                    <span>Special Offer</span>
                  </div>

                  <!-- SEO: Используем h2 для заголовков баннера -->
                  <h2
                      v-if="slide.title"
                      class="text-2xl md:text-4xl lg:text-5xl font-black text-white font-unbounded leading-[1.1] mb-6 drop-shadow-lg opacity-0 animate-content line-clamp-2"
                      style="animation-delay: 0.2s;"
                      data-swiper-parallax="-300"
                  >
                    {{ slide.title }}
                  </h2>

                  <!-- Кнопка -->
                  <div
                      class="opacity-0 animate-content"
                      style="animation-delay: 0.4s;"
                      data-swiper-parallax="-200"
                  >
                    <button class="group/btn relative overflow-hidden rounded-xl bg-brand-blue px-6 py-3 md:px-8 md:py-3.5 text-white font-black uppercase tracking-widest text-xs md:text-sm transition-all hover:bg-white hover:text-brand-blue hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] active:scale-95">
                      <span class="relative z-10 flex items-center gap-2">
                        {{ $t('common.view_all') }}
                        <Icon name="ph:arrow-right-bold" class="transition-transform group-hover/btn:translate-x-1" />
                      </span>
                    </button>
                  </div>

                </div>
              </div>

            </NuxtLink>
          </SwiperSlide>

          <!-- Элементы управления -->
          <div class="autoplay-progress absolute bottom-6 right-6 z-20 flex items-center justify-center w-10 h-10 md:w-12 md:h-12">
            <svg viewBox="0 0 48 48" class="w-full h-full rotate-[-90deg]">
              <circle cx="24" cy="24" r="20" class="stroke-white/20 fill-none stroke-[3px]"></circle>
              <circle
                  ref="progressCircle"
                  cx="24" cy="24" r="20"
                  class="stroke-brand-blue fill-none stroke-[3px]"
                  style="stroke-dasharray: 125.6; stroke-dashoffset: 0;"
              ></circle>
            </svg>
            <div class="absolute inset-0 flex items-center justify-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button class="hero-prev text-white hover:text-brand-blue transition-colors p-1" aria-label="Previous slide">
                <Icon name="ph:caret-left-bold" size="14" />
              </button>
              <span class="w-[1px] h-3 bg-white/30"></span>
              <button class="hero-next text-white hover:text-brand-blue transition-colors p-1" aria-label="Next slide">
                <Icon name="ph:caret-right-bold" size="14" />
              </button>
            </div>
            <Icon name="ph:play-fill" class="text-white text-[10px] opacity-100 group-hover:opacity-0 transition-opacity absolute" />
          </div>

          <div class="swiper-pagination !bottom-6"></div>

        </Swiper>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Pagination, Autoplay, Navigation, Parallax } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const { baseURL, getHeaders } = useApi();
const { locale } = useI18n();
const localePath = useLocalePath();

const modules = [Pagination, Autoplay, Navigation, Parallax];
const progressCircle = ref(null);

const { data: slides, pending, error } = await useFetch('/api/v1/site/banners', {
  baseURL: baseURL,
  headers: getHeaders(),
  query: { lang: locale.value },
  key: `banners-${locale.value}`,
  transform: (response) => Array.isArray(response.data) ? response.data : []
});

const getBannerLink = (slide) => {
  if (slide.url) {
    return slide.url.startsWith('/') ? localePath(slide.url) : slide.url;
  }
  if (slide.product_id) return localePath(`/product/${slide.product_id}`);
  return '#';
};

const onAutoplayTimeLeft = (s, time, progress) => {
  if (progressCircle.value) {
    progressCircle.value.style.strokeDashoffset = `${125.6 * (1 - progress)}px`;
  }
};
</script>

<style scoped>
@keyframes fadeInUp {
  0% { opacity: 0; transform: translateY(30px); }
  100% { opacity: 1; transform: translateY(0); }
}

:deep(.swiper-slide-active) .animate-content {
  animation: fadeInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}

:deep(.swiper-pagination-bullet) {
  width: 20px;
  height: 3px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.4);
  opacity: 1;
  transition: all 0.3s ease;
  margin: 0 3px !important;
}

:deep(.swiper-pagination-bullet-active) {
  background: #009FE3;
  width: 30px;
  box-shadow: 0 0 10px rgba(0, 159, 227, 0.5);
}
</style>