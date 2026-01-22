<template>
  <section class="py-6 md:py-10">
    <div class="w-full px-4 sm:px-6 md:px-8">

      <div v-if="pending" class="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6 animate-pulse">
        <!-- Используем SkeletonCategory -->
        <SkeletonCategory v-for="n in 6" :key="n" />
      </div>

      <div v-else-if="error" class="py-10 text-center text-red-500">
        {{ $t('common.error_loading') }}
      </div>

      <div v-else-if="collections.length > 0" class="relative">
        <Swiper
            :modules="[Navigation]"
            :navigation="{ nextEl: next, prevEl: prev }"
            :breakpoints="{
              320: { slidesPerView: 1.5, spaceBetween: 12 },
              640: { slidesPerView: 3, spaceBetween: 16 },
              1024: { slidesPerView: 4, spaceBetween: 24 },
              1280: { slidesPerView: 6, spaceBetween: 24 }
            }"
            class="!py-2"
        >
          <SwiperSlide v-for="collection in collections" :key="collection.category_id">
            <NuxtLink
                :to="localePath(`/catalog/${collection.slug || 'category'}_${collection.category_id}`)"
                class="group flex h-28 flex-col items-center justify-center gap-3 rounded-2xl bg-[#F8F9FB] p-4 text-center transition-all hover:bg-white hover:shadow-md hover:ring-1 hover:ring-brand-blue/20"
            >
              <div class="h-12 w-12 transition-transform group-hover:scale-110">
                <!-- ИСПРАВЛЕНИЕ: NuxtImg -->
                <NuxtImg
                    :src="collection.icon || '/images/category-placeholder.png'"
                    :alt="collection.name"
                    width="48"
                    height="48"
                    format="webp"
                    fit="contain"
                    class="h-full w-full object-contain mix-blend-multiply"
                />
              </div>
              <span class="text-xs font-bold text-brand-dark-blue line-clamp-2 group-hover:text-brand-blue">
                {{ collection.name }}
              </span>
            </NuxtLink>
          </SwiperSlide>
        </Swiper>

        <div class="pointer-events-none absolute inset-0 z-10 hidden items-center justify-between md:flex">
          <button ref="prev" class="pointer-events-auto -ml-4 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md transition hover:bg-gray-50 hover:text-brand-blue disabled:opacity-0">
            <Icon name="ph:caret-left-bold" size="18" />
          </button>
          <button ref="next" class="pointer-events-auto -mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md transition hover:bg-gray-50 hover:text-brand-blue disabled:opacity-0">
            <Icon name="ph:caret-right-bold" size="18" />
          </button>
        </div>
      </div>

    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation } from 'swiper/modules';
import 'swiper/css';

const config = useRuntimeConfig();
const { locale } = useI18n();
const localePath = useLocalePath();
const prev = ref(null);
const next = ref(null);

const { data: apiData, pending, error } = useFetch(`${config.public.apiBase}/api/v1/site/collections`, {
  query: { lang: locale.value },
  lazy: true,
  transform: (response) => {
    const list = response.data || response;
    return Array.isArray(list) ? list : [];
  }
});

const collections = computed(() => apiData.value || []);
</script>