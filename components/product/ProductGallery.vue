<template>
  <div class="flex flex-col-reverse gap-4 md:flex-row h-full relative">

    <!-- МОБИЛЬНЫЕ КНОПКИ (ПОВЕРХ ФОТО) -->
    <div class="absolute top-4 right-4 z-20 flex flex-col gap-2 md:hidden">
      <!-- Поделиться -->
      <button
          @click.stop="shareLink"
          class="flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 backdrop-blur shadow-sm text-brand-dark-blue active:scale-90 transition-transform"
      >
        <Icon name="ph:share-network-bold" size="20" />
      </button>

      <!-- Избранное (Дублируем тут для удобства на мобилках) -->
      <button
          @click.stop="toggleWishlist"
          class="flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 backdrop-blur shadow-sm active:scale-90 transition-transform"
          :class="isLiked ? 'text-brand-red' : 'text-brand-dark-blue'"
      >
        <Icon :name="isLiked ? 'ph:heart-fill' : 'ph:heart-bold'" size="20" />
      </button>
    </div>

    <!-- Миниатюры (Десктоп: Слева, Мобайл: Снизу) -->
    <div class="flex flex-row gap-3 overflow-x-auto no-scrollbar md:flex-col md:overflow-visible shrink-0 md:w-20 lg:w-24">
      <button
          v-for="(img, idx) in product.images"
          :key="idx"
          @click="slideTo(idx)"
          class="aspect-square w-16 md:w-full rounded-2xl bg-white p-1 transition-all overflow-hidden relative border-2 shrink-0"
          :class="activeIndex === idx ? 'border-brand-blue shadow-md scale-105' : 'border-transparent hover:border-gray-200 opacity-70 hover:opacity-100'"
      >
        <NuxtImg :src="img" width="100" height="100" format="webp" class="h-full w-full object-contain" background="transparent" />
      </button>
    </div>

    <!-- Главный Слайдер -->
    <div class="relative flex-1 bg-white rounded-[32px] border border-gray-100 overflow-hidden group shadow-sm">

      <!-- Кнопка Fullscreen (Desktop) -->
      <button
          @click="openLightbox"
          class="absolute top-4 right-4 z-20 w-10 h-10 bg-white/80 backdrop-blur rounded-xl hidden md:flex items-center justify-center text-brand-dark-blue shadow-sm hover:bg-brand-blue hover:text-white transition-colors opacity-0 group-hover:opacity-100"
      >
        <Icon name="ph:arrows-out-simple-bold" size="20" />
      </button>

      <!-- Бейдж скидки -->
      <div v-if="product.oldPrice && product.oldPrice > product.price" class="absolute left-4 top-4 z-20 rounded-xl bg-brand-red px-2.5 py-1 text-[11px] font-black text-white shadow-lg pointer-events-none">
        -{{ Math.round(100 - (product.price / product.oldPrice) * 100) }}%
      </div>

      <Swiper
          :modules="[Pagination, Zoom]"
          :pagination="{ clickable: true, dynamicBullets: true }"
          :zoom="true"
          :space-between="20"
          :slides-per-view="1"
          class="h-full w-full rounded-2xl product-gallery-swiper aspect-square"
          @swiper="onSwiper"
          @slideChange="onSlideChange"
      >
        <SwiperSlide v-for="(img, idx) in product.images" :key="idx" class="flex items-center justify-center" @click="openLightbox">
          <div class="swiper-zoom-container w-full h-full p-6">
            <NuxtImg :src="img" width="800" height="800" format="webp" fit="contain" class="max-h-full max-w-full object-contain" background="transparent" />
          </div>
        </SwiperSlide>
      </Swiper>
    </div>

    <!-- Lightbox (Модалка) -->
    <teleport to="body">
      <transition enter-active-class="transition duration-300" enter-from-class="opacity-0" enter-to-class="opacity-100" leave-active-class="transition duration-200" leave-from-class="opacity-100" leave-to-class="opacity-0">
        <div v-if="isLightboxOpen" class="fixed inset-0 z-[9999] bg-black/95 flex flex-col" @keydown.esc="isLightboxOpen = false">
          <button @click="isLightboxOpen = false" class="absolute top-6 right-6 z-50 text-white p-2">
            <Icon name="ph:x-bold" size="32" />
          </button>
          <div class="flex-1 flex items-center justify-center p-4">
            <img :src="product.images[activeIndex]" class="max-w-full max-h-full object-contain" />
          </div>
        </div>
      </transition>
    </teleport>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Pagination, Zoom } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/zoom';

const props = defineProps({ product: { type: Object, required: true } });

const activeIndex = ref(0);
const swiperInstance = ref(null);
const isLightboxOpen = ref(false);
const wishlistStore = useWishlistStore();
const { showToast, t } = useToast(); // Используем глобальный тост

const isLiked = computed(() => wishlistStore.isInWishlist(props.product.id));

const onSwiper = (swiper) => { swiperInstance.value = swiper; };
const onSlideChange = (swiper) => { activeIndex.value = swiper.activeIndex; };
const slideTo = (index) => {
  activeIndex.value = index;
  swiperInstance.value?.slideTo(index);
};
const openLightbox = () => { isLightboxOpen.value = true; };

const toggleWishlist = () => {
  wishlistStore.toggleWishlist(props.product);
};

// Функция шаринга (дублируется тут для удобства кнопки поверх фото)
const shareLink = async () => {
  if (process.client) {
    try {
      if (navigator.share) {
        await navigator.share({
          title: props.product.name,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        // Тут нужно импортировать t из useI18n, если useToast не возвращает его
        const { t } = useNuxtApp().$i18n;
        showToast(t('product.link_copied'), 'success');
      }
    } catch (e) { console.error(e); }
  }
};
</script>

<style>
.product-gallery-swiper .swiper-pagination-bullet { background: #cbd5e1; opacity: 1; width: 6px; height: 6px; transition: all 0.3s; margin: 0 4px !important; }
.product-gallery-swiper .swiper-pagination-bullet-active { background: #009FE3; width: 20px; border-radius: 4px; }
</style>