<template>
  <div class="group relative flex h-full flex-col overflow-hidden rounded-[32px] border border-gray-100 bg-white p-3 transition-all duration-500 hover:border-brand-blue/30 hover:shadow-2xl hover:shadow-brand-blue/10">

    <!-- ИЗОБРАЖЕНИЕ -->
    <NuxtLink
        :to="localePath('/product/' + getProductLink(product))"
        class="relative mb-4 block aspect-square w-full overflow-hidden rounded-3xl bg-gray-50 p-4"
    >
      <NuxtImg
          :src="getImageUrl(product)"
          :alt="product.name"
          class="h-full w-full object-contain transition-transform duration-700 group-hover:scale-110"
          width="300"
          height="300"
          format="webp"
          loading="lazy"
          fit="contain"
          background="transparent"
          placeholder
      />

      <div v-if="product.oldPrice && product.oldPrice > product.price" class="absolute left-3 top-3 rounded-xl bg-brand-red px-2.5 py-1 text-[11px] font-black text-white shadow-lg">
        -{{ Math.round(100 - (product.price / product.oldPrice) * 100) }}%
      </div>
    </NuxtLink>

    <!-- ИНФОРМАЦИЯ -->
    <div class="flex flex-1 flex-col px-1">

      <div class="mb-2 flex items-center gap-3">
        <div class="flex items-center gap-1 text-orange-400">
          <Icon name="ph:star-fill" size="14" />
          <span class="text-xs font-black text-brand-dark-blue">{{ product.rating || '5.0' }}</span>
        </div>
        <div class="flex items-center gap-1 text-gray-400">
          <Icon name="ph:chat-circle-text-fill" size="14" />
          <span class="text-[11px] font-bold uppercase tracking-wider">
            {{ $t('product.reviews', { n: product.reviewsCount || product.feedbacks || 0 }) }}
          </span>
        </div>
      </div>

      <NuxtLink :to="localePath('/product/' + getProductLink(product))" class="mb-3 block">
        <h3 class="h-10 text-xs font-bold leading-tight text-brand-dark-blue line-clamp-2 md:text-sm transition-colors group-hover:text-brand-blue">
          {{ product.name }}
        </h3>
      </NuxtLink>

      <div class="mt-auto space-y-4 pt-2">

        <div class="flex flex-col">
          <span v-if="product.oldPrice" class="text-[11px] font-bold text-gray-400 line-through decoration-brand-red/30">
            {{ formatPrice(product.oldPrice) }} сум
          </span>
          <div class="flex items-baseline gap-1 text-brand-blue font-black">
            <span class="text-xl md:text-2xl tracking-tighter">{{ formatPrice(product.price) }}</span>
            <span class="text-[10px] uppercase opacity-70">сум</span>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <div class="flex-1">

            <!-- СЦЕНАРИЙ 1: СТОК 0 (ОЖИДАЕМ) -->
            <button
                v-if="(product.stock || 0) === 0"
                disabled
                class="flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-gray-100 text-[10px] font-bold uppercase tracking-widest text-gray-400 cursor-not-allowed border border-gray-200"
            >
              <Icon name="ph:clock-fill" size="18" />
              <span>{{ $t('product.expected') }}</span>
            </button>

            <!-- СЦЕНАРИЙ 2: ЕСТЬ В НАЛИЧИИ, НЕ В КОРЗИНЕ -->
            <button
                v-else-if="localQty === 0"
                @click.stop.prevent="onAddToCart($event)"
                class="flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-brand-blue text-[11px] font-black uppercase tracking-widest text-white shadow-md shadow-brand-blue/20 transition-all hover:bg-brand-dark-blue active:scale-95"
            >
              <Icon name="ph:shopping-cart-simple-bold" size="18" />
              <span>{{ $t('product.add_to_cart') }}</span>
            </button>

            <!-- СЦЕНАРИЙ 3: В КОРЗИНЕ (СЧЕТЧИК) -->
            <div v-else class="flex h-11 w-full items-center justify-between rounded-2xl bg-gray-100 px-2 ring-1 ring-brand-blue/20">
              <button
                  @click.stop.prevent="onDecrease"
                  class="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-brand-blue shadow-sm transition-all active:scale-90 hover:bg-brand-blue hover:text-white"
              >
                <Icon name="ph:minus-bold" size="16" />
              </button>

              <span class="text-sm font-black text-brand-dark-blue tabular-nums">
                {{ localQty }}
              </span>

              <button
                  @click.stop.prevent="onIncrease($event)"
                  class="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-brand-blue shadow-sm transition-all active:scale-90"
                  :disabled="localQty >= (product.stock || 999)"
                  :class="localQty >= (product.stock || 999) ? 'opacity-20 cursor-not-allowed' : 'hover:bg-brand-blue hover:text-white'"
              >
                <Icon name="ph:plus-bold" size="16" />
              </button>
            </div>
          </div>

          <!-- Кнопка "Избранное" -->
          <button
              @click.stop.prevent="onToggleWishlist"
              class="flex h-11 w-11 items-center justify-center rounded-2xl border-2 transition-all duration-300 active:scale-90"
              :class="isFavorite ? 'bg-brand-red border-brand-red text-white shadow-lg shadow-brand-red/30' : 'border-gray-100 text-gray-400 hover:border-brand-blue hover:text-brand-blue'"
          >
            <Icon
                :name="isFavorite ? 'ph:heart-fill' : 'ph:heart-bold'"
                size="22"
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

// --- ХЕЛПЕРЫ ---
const formatPrice = (price: number) => String(price || 0).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

const getImageUrl = (p: any) => p.image || (p.images && p.images[0] ? (p.images[0].url || p.images[0]) : '/images/pc-placeholder.png');

const getProductLink = (p: any) => {
  const id = p.id || p.product_id;
  if (p.seo?.name) return `${p.seo.name}_${id}`;
  if (p.slug && typeof p.slug === 'string' && p.slug.includes('_')) return p.slug;
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