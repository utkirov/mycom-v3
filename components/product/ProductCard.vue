<template>
  <div class="group relative flex h-full flex-col overflow-hidden rounded-[20px] md:rounded-[32px] border border-gray-100 bg-white p-2 md:p-3 transition-all duration-500 hover:border-brand-blue/30 hover:shadow-2xl hover:shadow-brand-blue/10">

    <!-- ИЗОБРАЖЕНИЕ -->
    <NuxtLink
        :to="localePath('/product/' + getProductLink(product))"
        class="relative mb-2 md:mb-4 block aspect-square w-full overflow-hidden rounded-2xl md:rounded-3xl bg-gray-50 p-2 md:p-4"
        :aria-label="product.name"
    >
      <NuxtImg
          :src="getImageUrl(product)"
          :alt="product.name"
          class="h-full w-full object-contain transition-transform duration-700 group-hover:scale-110 mix-blend-multiply"
          width="300"
          height="300"
          format="webp"
          loading="lazy"
          fit="contain"
          background="transparent"
          placeholder
      />

      <!-- СКИДКА (Слева) -->
      <div v-if="product.oldPrice && product.oldPrice > product.price" class="absolute left-2 top-2 md:left-3 md:top-3 rounded-lg md:rounded-xl bg-brand-red px-1.5 py-0.5 md:px-2.5 md:py-1 text-[9px] md:text-[11px] font-black text-white shadow-lg z-10">
        -{{ Math.round(100 - (product.price / product.oldPrice) * 100) }}%
      </div>

      <!-- НОВОЕ: ИЗБРАННОЕ ПОВЕРХ ФОТО (Только для мобильных md:hidden) -->
      <button
          @click.stop.prevent="onToggleWishlist"
          class="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-xl bg-white/60 backdrop-blur-md shadow-sm transition-all active:scale-90 md:hidden"
          :class="isFavorite ? 'text-brand-red' : 'text-gray-400'"
          :aria-label="$t('profile.wishlist')"
      >
        <Icon
            :name="isFavorite ? 'ph:heart-fill' : 'ph:heart-bold'"
            class="w-5 h-5"
            :class="{ 'animate-heart-pop': isFavorite }"
        />
      </button>
    </NuxtLink>

    <!-- ИНФОРМАЦИЯ -->
    <div class="flex flex-1 flex-col px-1">

      <!-- Рейтинг -->
      <div class="mb-2 flex flex-wrap items-center gap-2 md:gap-3">
        <div class="flex items-center gap-1 text-orange-400">
          <Icon name="ph:star-fill" class="w-3 h-3 md:w-3.5 md:h-3.5" />
          <span class="text-[10px] md:text-xs font-black text-brand-dark-blue">{{ product.rating || '5.0' }}</span>
        </div>
        <div class="hidden xs:flex items-center gap-1 text-gray-500">
          <Icon name="ph:chat-circle-text-fill" class="w-3 h-3 md:w-3.5 md:h-3.5" />
          <span class="text-[9px] md:text-[11px] font-bold uppercase tracking-wider">
            {{ $t('product.reviews', { n: product.reviewsCount || product.feedbacks || 0 }) }}
          </span>
        </div>
      </div>

      <NuxtLink :to="localePath('/product/' + getProductLink(product))" class="mb-2 md:mb-3 block">
        <h3 class="min-h-[2.5em] text-[11px] xs:text-xs md:text-sm font-bold leading-tight text-brand-dark-blue line-clamp-2 transition-colors group-hover:text-brand-blue break-words">
          {{ product.name }}
        </h3>
      </NuxtLink>

      <div class="mt-auto space-y-2 md:space-y-4 pt-1 md:pt-2">

        <div class="flex flex-col">
          <span v-if="product.oldPrice" class="text-[9px] md:text-[11px] font-bold text-gray-400 line-through decoration-brand-red/30">
            {{ formatPrice(product.oldPrice) }} сум
          </span>
          <div class="flex flex-wrap items-baseline gap-1 text-brand-blue font-black">
            <span class="text-base xs:text-lg md:text-2xl tracking-tighter">{{ formatPrice(product.price) }}</span>
            <span class="text-[9px] md:text-[10px] uppercase opacity-70">сум</span>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <div class="flex-1">

            <!-- СТОК 0 -->
            <button
                v-if="(product.stock || 0) === 0"
                disabled
                class="flex h-9 md:h-11 w-full items-center justify-center gap-1.5 md:gap-2 rounded-xl md:rounded-2xl bg-gray-100 text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-gray-500 cursor-not-allowed border border-gray-200 px-1 overflow-hidden"
            >
              <Icon name="ph:clock-fill" class="w-4 h-4 md:w-[18px] md:h-[18px] shrink-0" />
              <span class="whitespace-nowrap text-ellipsis overflow-hidden">{{ $t('product.expected') }}</span>
            </button>

            <!-- В КОРЗИНУ -->
            <button
                v-else-if="localQty === 0"
                @click.stop.prevent="onAddToCart($event)"
                class="flex h-9 md:h-11 w-full items-center justify-center gap-1.5 md:gap-2 rounded-xl md:rounded-2xl bg-brand-blue text-[9px] md:text-[11px] font-black uppercase tracking-widest text-white shadow-md shadow-brand-blue/20 transition-all hover:bg-brand-dark-blue active:scale-95 px-1"
                :aria-label="$t('product.add_to_cart')"
            >
              <Icon name="ph:shopping-cart-simple-bold" class="w-4 h-4 md:w-[18px] md:h-[18px]" />
              <span class="whitespace-nowrap">{{ $t('product.add_to_cart') }}</span>
            </button>

            <!-- СЧЕТЧИК -->
            <div v-else class="flex h-9 md:h-11 w-full items-center justify-between rounded-xl md:rounded-2xl bg-gray-100 px-1 md:px-2 ring-1 ring-brand-blue/20">
              <button
                  @click.stop.prevent="onDecrease"
                  class="flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-lg md:rounded-xl bg-white text-brand-blue shadow-sm transition-all active:scale-90"
              >
                <Icon name="ph:minus-bold" class="w-3 h-3 md:w-4 md:h-4" />
              </button>

              <span class="text-xs md:text-sm font-black text-brand-dark-blue tabular-nums">
                {{ localQty }}
              </span>

              <button
                  @click.stop.prevent="onIncrease($event)"
                  class="flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-lg md:rounded-xl bg-white text-brand-blue shadow-sm transition-all active:scale-90"
                  :disabled="localQty >= (product.stock || 999)"
                  :class="localQty >= (product.stock || 999) ? 'opacity-20 cursor-not-allowed' : ''"
              >
                <Icon name="ph:plus-bold" class="w-3 h-3 md:w-4 md:h-4" />
              </button>
            </div>
          </div>

          <!-- ИЗБРАННОЕ ВНИЗУ (Скрыто на мобильных: hidden md:flex) -->
          <button
              @click.stop.prevent="onToggleWishlist"
              class="hidden md:flex h-9 w-9 md:h-11 md:w-11 shrink-0 items-center justify-center rounded-xl md:rounded-2xl border-2 transition-all duration-300 active:scale-90"
              :class="isFavorite ? 'bg-brand-red border-brand-red text-white shadow-lg shadow-brand-red/30' : 'border-gray-100 text-gray-400 hover:border-brand-blue hover:text-brand-blue'"
              :aria-label="$t('profile.wishlist')"
          >
            <Icon
                :name="isFavorite ? 'ph:heart-fill' : 'ph:heart-bold'"
                class="w-5 h-5 md:w-[22px] md:h-[22px]"
                :class="{ 'animate-heart-pop': isFavorite }"
            />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  product: { type: Object, required: true }
});

const cartStore = useCartStore();
const wishlistStore = useWishlistStore();
const { showToast } = useToast();
const { t } = useI18n();
const localePath = useLocalePath();
const { startAnimation } = useCartAnimation();

const formatPrice = (price: number) => String(price || 0).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

const getImageUrl = (p: any) => p.image || (p.images && p.images[0] ? (p.images[0].url || p.images[0]) : '/images/pc-placeholder.png');

const getProductLink = (p: any) => {
  if (p.slug) return p.slug;
  const id = p.id || p.product_id;
  if (p.seo?.name) return `${p.seo.name}-${id}`;
  return id;
};

const getProductId = (p: any) => String(p.id || p.product_id || '');

const localQty = computed(() => {
  const currentId = getProductId(props.product);
  const item = cartStore.cart?.find((i: any) => String(i.id || i.product_id) === currentId);
  return item ? Number(item.quantity) : 0;
});

const isFavorite = computed(() => wishlistStore.isInWishlist(getProductId(props.product)));

const onAddToCart = (event: MouseEvent) => {
  const stock = props.product.stock !== undefined ? props.product.stock : 10;
  if (stock > 0) {
    cartStore.addToCart({ ...props.product });
    showToast(t('product.add_to_cart'));
    startAnimation(event, getImageUrl(props.product));
  } else {
    showToast(t('product.expected'), 'info');
  }
};

const onIncrease = (event: MouseEvent) => {
  const stock = props.product.stock !== undefined ? props.product.stock : 999;
  if (localQty.value < stock) {
    cartStore.updateQuantity(getProductId(props.product), localQty.value + 1);
    startAnimation(event, getImageUrl(props.product));
  } else {
    showToast(`${t('common.all')}: ${stock}`, 'warning');
  }
};

const onDecrease = () => {
  if (localQty.value > 1) {
    cartStore.updateQuantity(getProductId(props.product), localQty.value - 1);
  } else {
    cartStore.removeFromCart(getProductId(props.product));
  }
};

const onToggleWishlist = async () => {
  await wishlistStore.toggleWishlist(props.product);
};
</script>

<style scoped>
@keyframes heart-pop {
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}
.animate-heart-pop { animation: heart-pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.tabular-nums { font-variant-numeric: tabular-nums; }
</style>